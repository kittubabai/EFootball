import { queryAll, queryGet, queryRun } from './database.js';
import { Player, Match, ScoreUpdateInput } from './types/tournament.js';

export async function generateGroupTournament(shuffleSeeds: boolean = true) {
  // 1. Fetch ONLY verified paid players
  const players = await queryAll<Player>("SELECT * FROM players WHERE status = 'active' AND payment_status = 'verified'");
  if (players.length < 4) {
    throw new Error(`At least 4 verified paid players are required to seed the tournament groups. Currently, only ${players.length} players have verified payments.`);
  }

  // Clear existing matches
  await queryRun('DELETE FROM matches');

  // Shuffle players
  const playerList = [...players];
  if (shuffleSeeds) {
    for (let i = playerList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [playerList[i], playerList[j]] = [playerList[j], playerList[i]];
    }
  }

  // 2. Distribute players into 4 groups: A, B, C, D (up to 8 per group)
  const groupKeys: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
  const groupBuckets: Record<'A' | 'B' | 'C' | 'D', (Player | null)[]> = {
    A: [],
    B: [],
    C: [],
    D: []
  };

  // Assign players round-robin or in chunks of 8
  playerList.forEach((p, idx) => {
    const group = groupKeys[idx % 4];
    groupBuckets[group].push(p);
    queryRun('UPDATE players SET group_assigned = $1, seed = $2 WHERE id = $3', [group, idx + 1, p.id]);
  });

  // Ensure each group has 8 slots (pad with null for byes)
  for (const g of groupKeys) {
    while (groupBuckets[g].length < 8) {
      groupBuckets[g].push(null);
    }
  }

  // 3. First, create the Final 4 Championship matches so group finals can link to them!
  // Finals:
  // - Grand Final (1st & 2nd)
  // - 3rd Place Match (3rd)
  // - Semi-Final 1 (Winner A vs Winner B)
  // - Semi-Final 2 (Winner C vs Winner D)

  // Insert Grand Final
  const gfRes = await queryRun(`
    INSERT INTO matches (
      group_key, round_name, round_index, match_number, status
    ) VALUES ('FINALS', 'Grand Final (1st & 2nd Place)', 5, 2, 'scheduled') RETURNING id
  `);
  const grandFinalId = gfRes.lastID;

  // Insert 3rd Place Match
  const tpRes = await queryRun(`
    INSERT INTO matches (
      group_key, round_name, round_index, match_number, status
    ) VALUES ('FINALS', '3rd Place Playoff (3rd Position)', 5, 1, 'scheduled') RETURNING id
  `);
  const thirdPlaceId = tpRes.lastID;

  // Insert Semi-Final 1
  const sf1Res = await queryRun(`
    INSERT INTO matches (
      group_key, round_name, round_index, match_number,
      next_match_id, next_match_slot,
      loser_next_match_id, loser_next_slot, status
    ) VALUES ('FINALS', 'Semi-Final 1 (Winner A vs Winner B)', 4, 1, $1, 1, $2, 1, 'scheduled') RETURNING id
  `, [grandFinalId, thirdPlaceId]);
  const sf1Id = sf1Res.lastID;

  // Insert Semi-Final 2
  const sf2Res = await queryRun(`
    INSERT INTO matches (
      group_key, round_name, round_index, match_number,
      next_match_id, next_match_slot,
      loser_next_match_id, loser_next_slot, status
    ) VALUES ('FINALS', 'Semi-Final 2 (Winner C vs Winner D)', 4, 2, $1, 2, $2, 2, 'scheduled') RETURNING id
  `, [grandFinalId, thirdPlaceId]);
  const sf2Id = sf2Res.lastID;

  // Map each group final to its designated semi-final slot
  const groupFinalTargets: Record<'A' | 'B' | 'C' | 'D', { nextId: number; nextSlot: number }> = {
    A: { nextId: sf1Id, nextSlot: 1 },
    B: { nextId: sf1Id, nextSlot: 2 },
    C: { nextId: sf2Id, nextSlot: 1 },
    D: { nextId: sf2Id, nextSlot: 2 }
  };

  // 4. Build 8-player knockout tree for each group (A, B, C, D)
  for (const g of groupKeys) {
    const slots = groupBuckets[g];
    const target = groupFinalTargets[g];

    // Group Final (Match 7)
    const gfMatch = await queryRun(`
      INSERT INTO matches (
        group_key, round_name, round_index, match_number,
        next_match_id, next_match_slot, status
      ) VALUES ($1, $2, 3, 1, $3, $4, 'scheduled') RETURNING id
    `, [g, `Group ${g} Final`, target.nextId, target.nextSlot]);
    const groupFinalId = gfMatch.lastID;

    // Group Semi-Finals (Match 5 and 6)
    const gsf1 = await queryRun(`
      INSERT INTO matches (
        group_key, round_name, round_index, match_number,
        next_match_id, next_match_slot, status
      ) VALUES ($1, $2, 2, 1, $3, 1, 'scheduled') RETURNING id
    `, [g, `Group ${g} Semi-Final 1`, groupFinalId]);
    const gsf1Id = gsf1.lastID;

    const gsf2 = await queryRun(`
      INSERT INTO matches (
        group_key, round_name, round_index, match_number,
        next_match_id, next_match_slot, status
      ) VALUES ($1, $2, 2, 2, $3, 2, 'scheduled') RETURNING id
    `, [g, `Group ${g} Semi-Final 2`, groupFinalId]);
    const gsf2Id = gsf2.lastID;

    // Group Quarter-Finals (Match 1, 2, 3, 4)
    const qfTargets = [
      { id: gsf1Id, slot: 1 },
      { id: gsf1Id, slot: 2 },
      { id: gsf2Id, slot: 1 },
      { id: gsf2Id, slot: 2 }
    ];

    for (let i = 0; i < 4; i++) {
      const p1 = slots[i * 2];
      const p2 = slots[i * 2 + 1];
      const qfTarget = qfTargets[i];

      const qfRes = await queryRun(`
        INSERT INTO matches (
          group_key, round_name, round_index, match_number,
          player1_id, player2_id,
          next_match_id, next_match_slot, status
        ) VALUES ($1, $2, 1, $3, $4, $5, $6, $7, 'scheduled') RETURNING id
      `, [
        g,
        `Group ${g} Match ${i + 1}`,
        i + 1,
        p1 ? p1.id : null,
        p2 ? p2.id : null,
        qfTarget.id,
        qfTarget.slot
      ]);

      const qfMatchId = qfRes.lastID;

      // Handle byes
      if (p1 && !p2) {
        await queryRun(
          "UPDATE matches SET winner_id = $1, status = 'bye', player1_score = 1, player2_score = 0 WHERE id = $2",
          [p1.id, qfMatchId]
        );
        const col = qfTarget.slot === 1 ? 'player1_id' : 'player2_id';
        await queryRun(`UPDATE matches SET ${col} = $1 WHERE id = $2`, [p1.id, qfTarget.id]);
      } else if (p2 && !p1) {
        await queryRun(
          "UPDATE matches SET winner_id = $1, status = 'bye', player1_score = 0, player2_score = 1 WHERE id = $2",
          [p2.id, qfMatchId]
        );
        const col = qfTarget.slot === 1 ? 'player1_id' : 'player2_id';
        await queryRun(`UPDATE matches SET ${col} = $1 WHERE id = $2`, [p2.id, qfTarget.id]);
      }
    }
  }

  // Update status to in_progress
  await queryRun("UPDATE tournament_meta SET status = 'in_progress' WHERE id = 1");

  return {
    message: 'Tournament generated with 4 groups (8 players each) and Final 4 Championship!',
    groups: ['Group A', 'Group B', 'Group C', 'Group D'],
    finals: 'Final 4 Championship Room'
  };
}

export async function updateMatchScore(matchId: number, input: ScoreUpdateInput) {
  const match = await queryGet<Match>('SELECT * FROM matches WHERE id = $1', [matchId]);
  if (!match) {
    throw new Error(`Match with ID ${matchId} not found.`);
  }

  const p1Id = match.player1_id;
  const p2Id = match.player2_id;
  if (!p1Id || !p2Id) {
    throw new Error('Both players must be assigned before recording a score.');
  }

  let winnerId = input.winner_id;
  let loserId: number | null = null;

  if (!winnerId) {
    if (input.player1_score > input.player2_score) {
      winnerId = p1Id;
      loserId = p2Id;
    } else if (input.player2_score > input.player1_score) {
      winnerId = p2Id;
      loserId = p1Id;
    } else {
      // Tied: check penalties
      const p1Pk = input.player1_pk;
      const p2Pk = input.player2_pk;
      if (p1Pk !== undefined && p1Pk !== null && p2Pk !== undefined && p2Pk !== null) {
        if (p1Pk > p2Pk) {
          winnerId = p1Id;
          loserId = p2Id;
        } else if (p2Pk > p1Pk) {
          winnerId = p2Id;
          loserId = p1Id;
        } else {
          throw new Error('Match is tied! Penalty shootout score must have a decisive winner.');
        }
      } else {
        throw new Error('Score is tied. Please enter penalty shootout (PK) scores.');
      }
    }
  } else {
    loserId = winnerId === p1Id ? p2Id : p1Id;
  }

  // Update current match
  await queryRun(
    `UPDATE matches SET
      player1_score = $1, player2_score = $2,
      player1_pk = $3, player2_pk = $4,
      is_extra_time = $5, winner_id = $6, loser_id = $7, status = 'completed'
    WHERE id = $8`,
    [
      input.player1_score,
      input.player2_score,
      input.player1_pk ?? null,
      input.player2_pk ?? null,
      input.is_extra_time ? 1 : 0,
      winnerId,
      loserId,
      matchId
    ]
  );

  // Advance winner to next match if applicable
  if (match.next_match_id) {
    const col = match.next_match_slot === 1 ? 'player1_id' : 'player2_id';
    await queryRun(`UPDATE matches SET ${col} = $1 WHERE id = $2`, [winnerId, match.next_match_id]);
  }

  if (match.loser_next_match_id && loserId) {
    const loserCol = match.loser_next_slot === 1 ? 'player1_id' : 'player2_id';
    await queryRun(`UPDATE matches SET ${loserCol} = $1 WHERE id = $2`, [loserId, match.loser_next_match_id]);
  }

  // If Grand Final completed, mark tournament completed
  if (match.group_key === 'FINALS' && match.round_index === 5 && match.match_number === 2) {
    await queryRun("UPDATE tournament_meta SET status = 'completed' WHERE id = 1");
  }

  return {
    message: 'Score recorded and winners/losers advanced successfully',
    winner_id: winnerId,
    loser_id: loserId
  };
}
