import { queryAll, queryGet, queryRun } from './database.js';
import { Player, Match, ScoreUpdateInput } from './types/tournament.js';

const ROUND_NAMES: Record<number, string> = {
  32: 'Round of 32',
  16: 'Round of 16',
  8: 'Quarter-Finals',
  4: 'Semi-Finals',
  2: 'Grand Final'
};

export function determineBracketSize(playerCount: number): number {
  if (playerCount <= 4) return 4;
  if (playerCount <= 8) return 8;
  if (playerCount <= 16) return 16;
  return 32;
}

export async function generateBracketMatches(shuffleSeeds: boolean = true) {
  // 1. Fetch active players
  const players = await queryAll<Player>("SELECT * FROM players WHERE status = 'active'");
  if (players.length < 2) {
    throw new Error('At least 2 players are required to generate a tournament bracket.');
  }

  // 2. Clear existing matches
  await queryRun('DELETE FROM matches');

  // 3. Bracket size
  const bracketSize = determineBracketSize(players.length);

  // 4. Shuffle seeds if requested
  const playerList = [...players];
  if (shuffleSeeds) {
    for (let i = playerList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [playerList[i], playerList[j]] = [playerList[j], playerList[i]];
    }
  }

  // Update seed numbers
  for (let idx = 0; idx < playerList.length; idx++) {
    await queryRun('UPDATE players SET seed = ? WHERE id = ?', [idx + 1, playerList[idx].id]);
  }

  // Pad slots for byes
  const slots: (Player | null)[] = [...playerList];
  while (slots.length < bracketSize) {
    slots.push(null);
  }

  // 5. Structure rounds
  const totalRounds = Math.log2(bracketSize);
  const roundMatches: Record<number, any[]> = {};

  let currentMatchesCount = bracketSize / 2;
  for (let rIdx = 1; rIdx <= totalRounds; rIdx++) {
    const matchesInRound = currentMatchesCount;
    const teamsInRound = matchesInRound * 2;
    const roundName = ROUND_NAMES[teamsInRound] || `Round of ${teamsInRound}`;

    roundMatches[rIdx] = [];
    for (let mNum = 1; mNum <= matchesInRound; mNum++) {
      roundMatches[rIdx].push({
        round_index: rIdx,
        round_name: roundName,
        match_number: mNum,
        player1_id: null,
        player2_id: null,
        next_match_id: null,
        next_match_slot: null,
        status: 'scheduled',
        winner_id: null
      });
    }
    currentMatchesCount = currentMatchesCount / 2;
  }

  // Assign Round 1 players
  for (let i = 0; i < bracketSize / 2; i++) {
    const p1 = slots[i * 2];
    const p2 = slots[i * 2 + 1];
    roundMatches[1][i].player1_id = p1 ? p1.id : null;
    roundMatches[1][i].player2_id = p2 ? p2.id : null;
  }

  // 6. Insert matches backwards (from Final down to Round 1) to wire next_match_id
  const dbMatchIds = new Map<string, number>(); // `${round_index}_${match_number}` -> db_id

  for (let rIdx = totalRounds; rIdx >= 1; rIdx--) {
    for (const m of roundMatches[rIdx]) {
      if (rIdx < totalRounds) {
        const nextR = rIdx + 1;
        const nextMNum = Math.floor((m.match_number + 1) / 2);
        const nextSlot = m.match_number % 2 !== 0 ? 1 : 2;
        const nextDbId = dbMatchIds.get(`${nextR}_${nextMNum}`);
        m.next_match_id = nextDbId || null;
        m.next_match_slot = nextSlot;
      }

      const runRes = await queryRun(
        `INSERT INTO matches (
          round_name, round_index, match_number,
          player1_id, player2_id,
          next_match_id, next_match_slot, status, winner_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          m.round_name,
          m.round_index,
          m.match_number,
          m.player1_id,
          m.player2_id,
          m.next_match_id,
          m.next_match_slot,
          m.status,
          m.winner_id
        ]
      );

      const dbId = runRes.lastID;
      dbMatchIds.set(`${rIdx}_${m.match_number}`, dbId);
      m.id = dbId;
    }
  }

  // 7. Auto-advance BYEs in Round 1
  for (const m of roundMatches[1]) {
    const p1Id = m.player1_id;
    const p2Id = m.player2_id;

    if (p1Id && !p2Id) {
      await queryRun(
        "UPDATE matches SET winner_id = ?, status = 'bye', player1_score = 1, player2_score = 0 WHERE id = ?",
        [p1Id, m.id]
      );
      if (m.next_match_id) {
        const col = m.next_match_slot === 1 ? 'player1_id' : 'player2_id';
        await queryRun(`UPDATE matches SET ${col} = ? WHERE id = ?`, [p1Id, m.next_match_id]);
      }
    } else if (p2Id && !p1Id) {
      await queryRun(
        "UPDATE matches SET winner_id = ?, status = 'bye', player1_score = 0, player2_score = 1 WHERE id = ?",
        [p2Id, m.id]
      );
      if (m.next_match_id) {
        const col = m.next_match_slot === 1 ? 'player1_id' : 'player2_id';
        await queryRun(`UPDATE matches SET ${col} = ? WHERE id = ?`, [p2Id, m.next_match_id]);
      }
    }
  }

  // 8. Update tournament meta status to in_progress
  await queryRun("UPDATE tournament_meta SET status = 'in_progress' WHERE id = 1");

  return {
    message: 'Tournament bracket generated successfully',
    bracket_size: bracketSize,
    total_rounds: totalRounds
  };
}

export async function updateMatchScore(matchId: number, input: ScoreUpdateInput) {
  const match = await queryGet<Match>('SELECT * FROM matches WHERE id = ?', [matchId]);
  if (!match) {
    throw new Error(`Match with ID ${matchId} not found.`);
  }

  const p1Id = match.player1_id;
  const p2Id = match.player2_id;
  if (!p1Id || !p2Id) {
    throw new Error('Both players must be assigned before recording a score.');
  }

  let winnerId = input.winner_id;
  if (!winnerId) {
    if (input.player1_score > input.player2_score) {
      winnerId = p1Id;
    } else if (input.player2_score > input.player1_score) {
      winnerId = p2Id;
    } else {
      // Tied: check penalties
      const p1Pk = input.player1_pk;
      const p2Pk = input.player2_pk;
      if (p1Pk !== undefined && p1Pk !== null && p2Pk !== undefined && p2Pk !== null) {
        if (p1Pk > p2Pk) {
          winnerId = p1Id;
        } else if (p2Pk > p1Pk) {
          winnerId = p2Id;
        } else {
          throw new Error('Match is tied! Penalty shootout score must have a decisive winner.');
        }
      } else {
        throw new Error('Score is tied. Please enter penalty shootout (PK) scores.');
      }
    }
  }

  // Update current match
  await queryRun(
    `UPDATE matches SET
      player1_score = ?, player2_score = ?,
      player1_pk = ?, player2_pk = ?,
      is_extra_time = ?, winner_id = ?, status = 'completed'
    WHERE id = ?`,
    [
      input.player1_score,
      input.player2_score,
      input.player1_pk ?? null,
      input.player2_pk ?? null,
      input.is_extra_time ? 1 : 0,
      winnerId,
      matchId
    ]
  );

  // Advance winner to next round
  if (match.next_match_id) {
    const col = match.next_match_slot === 1 ? 'player1_id' : 'player2_id';
    await queryRun(`UPDATE matches SET ${col} = ? WHERE id = ?`, [winnerId, match.next_match_id]);
  } else {
    // Grand Final completed!
    await queryRun("UPDATE tournament_meta SET status = 'completed' WHERE id = 1");
  }

  return {
    message: 'Score updated and winner advanced successfully',
    winner_id: winnerId
  };
}
