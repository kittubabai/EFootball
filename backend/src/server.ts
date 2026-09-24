import { setDefaultResultOrder } from 'dns';
// Force IPv4 DNS — Render free tier blocks IPv6 outbound (ENETUNREACH fix)
setDefaultResultOrder('ipv4first');

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { initDb, queryAll, queryGet, queryRun } from './database.js';
import {
  Player,
  TournamentMeta,
  TournamentStatusResponse,
  Match,
  MatchResponse,
  MatchPlayer,
  GroupTournamentResponse,
  GroupBracket,
  FinalPodium
} from './types/tournament.js';
import { generateGroupTournament, updateMatchScore } from './bracketService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize database tables on start
await initDb();

// --- Helper Functions ---
const verifyAdminPin = async (req: Request, res: Response, next: NextFunction) => {
  const pin = req.headers['x-admin-pin'] as string | undefined;
  const meta = await queryGet<TournamentMeta>('SELECT admin_pin FROM tournament_meta WHERE id = 1');
  if (!pin || !meta || pin !== meta.admin_pin) {
    return res.status(401).json({ detail: 'Invalid or missing Admin PIN.' });
  }
  next();
};

const fetchPlayerDetail = async (playerId: number | null): Promise<MatchPlayer | null> => {
  if (!playerId) return null;
  const p = await queryGet<Player>('SELECT id, name, efootball_id, team_name, whatsapp FROM players WHERE id = $1', [playerId]);
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    efootball_id: p.efootball_id,
    team_name: p.team_name || '',
    whatsapp: p.whatsapp || ''
  };
};

const mapMatchToResponse = async (m: Match): Promise<MatchResponse> => {
  const p1 = await fetchPlayerDetail(m.player1_id);
  const p2 = await fetchPlayerDetail(m.player2_id);

  return {
    id: m.id,
    group_key: m.group_key,
    round_name: m.round_name,
    round_index: m.round_index,
    match_number: m.match_number,
    player1: p1,
    player2: p2,
    player1_score: m.player1_score,
    player2_score: m.player2_score,
    player1_pk: m.player1_pk,
    player2_pk: m.player2_pk,
    is_extra_time: Boolean(m.is_extra_time),
    winner_id: m.winner_id,
    loser_id: m.loser_id,
    next_match_id: m.next_match_id,
    next_match_slot: m.next_match_slot,
    status: m.status
  };
};

// --- Public Endpoints ---

app.get('/api/status', async (_req: Request, res: Response) => {
  try {
    const meta = await queryGet<TournamentMeta>('SELECT * FROM tournament_meta WHERE id = 1');
    const totalCount = await queryGet<{ cnt: string }>("SELECT COUNT(*) as cnt FROM players WHERE status = 'active'");
    const verifiedCount = await queryGet<{ cnt: string }>("SELECT COUNT(*) as cnt FROM players WHERE status = 'active' AND payment_status = 'verified'");

    const result: TournamentStatusResponse = {
      title: meta?.title || 'Pantihal eFootball Cup 2026',
      status: meta?.status || 'registration',
      registered_count: parseInt(String(totalCount?.cnt || '0'), 10),
      verified_count: parseInt(String(verifiedCount?.cnt || '0'), 10),
      max_players: meta?.max_players || 32,
      match_time_mins: meta?.match_time_mins || 14,
      event_date: meta?.event_date || '18th October 2026',
      event_time: meta?.event_time || '11:00 AM onwards',
      entry_fee: meta?.entry_fee || 100,
      upi_id: meta?.upi_id || 'sayantanbabu2000-1@oksbi',
      upi_name: meta?.upi_name || 'Sayantan Chakraborty'
    };
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

app.post('/api/players/register', async (req: Request, res: Response) => {
  try {
    const { name, efootball_id, whatsapp, team_name, utr_number, payment_screenshot } = req.body;

    if (!name || !efootball_id || !whatsapp) {
      return res.status(400).json({ detail: 'Name, eFootball ID, and WhatsApp number are required.' });
    }

    const meta = await queryGet<TournamentMeta>('SELECT status, max_players FROM tournament_meta WHERE id = 1');
    if (meta?.status !== 'registration') {
      return res.status(400).json({ detail: 'Registration is currently closed for this tournament.' });
    }

    // Unlimited registrations allowed until 32 VERIFIED PAYMENTS are confirmed
    const verifiedRow = await queryGet<{ cnt: string }>("SELECT COUNT(*) as cnt FROM players WHERE status = 'active' AND payment_status = 'verified'");
    if ((parseInt(String(verifiedRow?.cnt || '0'), 10)) >= (meta?.max_players || 32)) {
      return res.status(400).json({ detail: 'Registration is now closed because all 32 tournament slots have been filled with verified payments.' });
    }

    const existing = await queryGet<Player>('SELECT id FROM players WHERE efootball_id = $1', [efootball_id.trim()]);
    if (existing) {
      return res.status(400).json({ detail: 'This eFootball User ID is already registered.' });
    }

    if (utr_number && utr_number.trim()) {
      const existingUtr = await queryGet<Player>('SELECT id FROM players WHERE utr_number = $1', [utr_number.trim()]);
      if (existingUtr) {
        return res.status(400).json({ detail: 'This UTR / Transaction ID has already been submitted.' });
      }
    }

    const runRes = await queryRun(
      'INSERT INTO players (name, efootball_id, whatsapp, team_name, utr_number, payment_screenshot, payment_status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [name.trim(), efootball_id.trim(), whatsapp.trim(), (team_name || '').trim(), (utr_number || '').trim(), payment_screenshot || '', 'pending']
    );

    const newPlayer = await queryGet<Player>('SELECT * FROM players WHERE id = $1', [runRes.lastID]);
    res.status(201).json(newPlayer);
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

// Endpoint for players to submit or update their payment UTR and/or screenshot
app.post(['/api/players/:id/submit-payment', '/api/players/:id/submit-utr'], async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const playerId = parseInt(Array.isArray(rawId) ? rawId[0] : rawId, 10);
    const { utr_number, payment_screenshot } = req.body;

    const meta = await queryGet<TournamentMeta>('SELECT status, max_players FROM tournament_meta WHERE id = 1');
    if (meta?.status !== 'registration') {
      return res.status(400).json({ detail: 'Payment submissions are closed as tournament groups have already begun.' });
    }

    // Check if 32 payments are already verified
    const verifiedRow = await queryGet<{ cnt: string }>("SELECT COUNT(*) as cnt FROM players WHERE status = 'active' AND payment_status = 'verified'");
    if ((parseInt(String(verifiedRow?.cnt || '0'), 10)) >= (meta?.max_players || 32)) {
      return res.status(400).json({ detail: 'All 32 tournament slots are filled with confirmed payments! No more payments are being accepted.' });
    }

    if (!utr_number && !payment_screenshot) {
      return res.status(400).json({ detail: 'Please provide either a 12-digit UPI UTR number or an uploaded payment screenshot.' });
    }

    if (utr_number && utr_number.trim()) {
      const existingUtr = await queryGet<Player>('SELECT id FROM players WHERE utr_number = $1 AND id != $2', [utr_number.trim(), playerId]);
      if (existingUtr) {
        return res.status(400).json({ detail: 'This UTR / Transaction ID has already been submitted by another player.' });
      }
    }

    await queryRun(
      'UPDATE players SET utr_number = COALESCE(NULLIF($1, \'\'), utr_number), payment_screenshot = COALESCE(NULLIF($2, \'\'), payment_screenshot) WHERE id = $3',
      [(utr_number || '').trim(), payment_screenshot || '', playerId]
    );

    res.json({ success: true, message: 'Payment details submitted! The admin will verify and admit you into the tournament rooms.' });
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

app.get('/api/players', async (_req: Request, res: Response) => {
  try {
    const players = await queryAll<Player>("SELECT * FROM players WHERE status = 'active' ORDER BY registered_at ASC");
    res.json(players);
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

app.get('/api/bracket', async (_req: Request, res: Response) => {
  try {
    const meta = await queryGet<TournamentMeta>('SELECT status FROM tournament_meta WHERE id = 1');
    const matches = await queryAll<Match>('SELECT * FROM matches ORDER BY group_key ASC, round_index ASC, match_number ASC');

    const groupKeys = ['A', 'B', 'C', 'D'];
    const groups: Record<string, GroupBracket> = {};

    for (const g of groupKeys) {
      const gMatches = matches.filter(m => m.group_key === g);
      const mappedMatches: MatchResponse[] = [];
      for (const m of gMatches) {
        mappedMatches.push(await mapMatchToResponse(m));
      }

      // Group Final is round_index 3
      const gFinal = mappedMatches.find(m => m.round_index === 3);
      const winner = gFinal?.winner_id ? (gFinal.winner_id === gFinal.player1?.id ? gFinal.player1 : gFinal.player2) : null;

      groups[g] = {
        group_key: g,
        group_name: `Group ${g} (8-Player Room)`,
        winner,
        matches: mappedMatches
      };
    }

    // Finals: group_key === 'FINALS'
    const finalMatches = matches.filter(m => m.group_key === 'FINALS');
    const mappedFinals: MatchResponse[] = [];
    for (const m of finalMatches) {
      mappedFinals.push(await mapMatchToResponse(m));
    }

    const semiFinals = mappedFinals.filter(m => m.round_index === 4);
    const thirdPlace = mappedFinals.find(m => m.round_index === 5 && m.match_number === 1) || null;
    const grandFinal = mappedFinals.find(m => m.round_index === 5 && m.match_number === 2) || null;

    // Podium positions
    const podium: FinalPodium = {
      first: grandFinal?.winner_id ? (grandFinal.winner_id === grandFinal.player1?.id ? grandFinal.player1 : grandFinal.player2) : null,
      second: grandFinal?.loser_id ? (grandFinal.loser_id === grandFinal.player1?.id ? grandFinal.player1 : grandFinal.player2) : null,
      third: thirdPlace?.winner_id ? (thirdPlace.winner_id === thirdPlace.player1?.id ? thirdPlace.player1 : thirdPlace.player2) : null,
      fourth: thirdPlace?.loser_id ? (thirdPlace.loser_id === thirdPlace.player1?.id ? thirdPlace.player1 : thirdPlace.player2) : null
    };

    const response: GroupTournamentResponse = {
      tournament_status: meta?.status || 'registration',
      groups,
      finals: {
        semi_finals: semiFinals,
        third_place: thirdPlace,
        grand_final: grandFinal,
        podium
      }
    };

    res.json(response);
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

app.get('/api/matches', async (_req: Request, res: Response) => {
  try {
    const matches = await queryAll<Match>('SELECT * FROM matches ORDER BY group_key ASC, round_index ASC, match_number ASC');
    const result: MatchResponse[] = [];

    for (const m of matches) {
      result.push(await mapMatchToResponse(m));
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

// Top Scorers / Golden Boot Leaderboard
app.get('/api/top-scorers', async (_req: Request, res: Response) => {
  try {
    const players = await queryAll<{
      id: number;
      name: string;
      efootball_id: string;
      team_name: string;
      whatsapp: string;
      group_assigned: string | null;
      payment_status: string;
      goals_scored: number;
      match_goals: number;
      matches_played: number;
      total_goals: number;
    }>(`
      SELECT 
        p.id,
        p.name,
        p.efootball_id,
        p.team_name,
        p.whatsapp,
        p.group_assigned,
        p.payment_status,
        COALESCE(p.goals_scored, 0) as goals_scored,
        COALESCE(SUM(CASE 
          WHEN m.player1_id = p.id AND m.status = 'completed' THEN COALESCE(m.player1_score, 0)
          WHEN m.player2_id = p.id AND m.status = 'completed' THEN COALESCE(m.player2_score, 0)
          ELSE 0 
        END), 0) as match_goals,
        COUNT(DISTINCT CASE WHEN m.status = 'completed' THEN m.id END) as matches_played,
        (COALESCE(p.goals_scored, 0) + COALESCE(SUM(CASE 
          WHEN m.player1_id = p.id AND m.status = 'completed' THEN COALESCE(m.player1_score, 0)
          WHEN m.player2_id = p.id AND m.status = 'completed' THEN COALESCE(m.player2_score, 0)
          ELSE 0 
        END), 0)) as total_goals
      FROM players p
      LEFT JOIN matches m ON (m.player1_id = p.id OR m.player2_id = p.id)
      WHERE p.status = 'active'
      GROUP BY p.id
      ORDER BY total_goals DESC, match_goals DESC, p.name ASC
    `);
    res.json(players);
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

// --- Admin Endpoints ---

app.post('/api/admin/login', async (req: Request, res: Response) => {
  try {
    const { pin } = req.body;
    const meta = await queryGet<TournamentMeta>('SELECT admin_pin FROM tournament_meta WHERE id = 1');
    if (!meta || pin !== meta.admin_pin) {
      return res.status(401).json({ detail: 'Incorrect Admin PIN' });
    }
    res.json({ success: true, message: 'Admin authenticated' });
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

app.all(['/api/admin/change-pin', '/api/admin/change-password'], verifyAdminPin, async (req: Request, res: Response) => {
  try {
    const { newPin, newPassword } = req.body;
    const pinToSet = String(newPin || newPassword || '').trim();

    if (!pinToSet) {
      return res.status(400).json({ detail: 'New password cannot be empty.' });
    }

    if (pinToSet.length > 10) {
      return res.status(400).json({ detail: 'Password cannot exceed 10 alphanumeric characters.' });
    }

    const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(pinToSet);
    if (!isAlphanumeric) {
      return res.status(400).json({ detail: 'Password must contain only letters and numbers (alphanumeric, max 10 characters).' });
    }

    await queryRun('UPDATE tournament_meta SET admin_pin = $1 WHERE id = 1', [pinToSet]);

    res.json({ success: true, message: 'Administrator password updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

app.all(['/api/admin/players/:id/verify-payment', '/api/admin/players/:id/payment'], verifyAdminPin, async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const playerId = parseInt(Array.isArray(rawId) ? rawId[0] : rawId, 10);
    const status = req.body.status || 'verified';

    const meta = await queryGet<TournamentMeta>('SELECT max_players FROM tournament_meta WHERE id = 1');
    const maxPlayers = meta?.max_players || 32;

    if (status === 'verified') {
      const verifiedRow = await queryGet<{ cnt: string }>(
        "SELECT COUNT(*) as cnt FROM players WHERE status = 'active' AND payment_status = 'verified' AND id != $1",
        [playerId]
      );
      if ((parseInt(String(verifiedRow?.cnt || '0'), 10)) >= maxPlayers) {
        return res.status(400).json({ detail: `Cannot verify: All ${maxPlayers} tournament slots have already been filled with verified payments!` });
      }
    }

    await queryRun('UPDATE players SET payment_status = $1 WHERE id = $2', [status, playerId]);

    const updatedCount = await queryGet<{ cnt: string }>("SELECT COUNT(*) as cnt FROM players WHERE status = 'active' AND payment_status = 'verified'");
    const totalVerified = parseInt(String(updatedCount?.cnt || '0'), 10);

    res.json({ 
      success: true, 
      message: totalVerified >= maxPlayers 
        ? `Player verified! All ${maxPlayers} tournament slots are now confirmed.` 
        : `Player payment marked as ${status}. (${totalVerified}/${maxPlayers} slots filled)` 
    });
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

// Admin endpoint to manually note down or update goals for any player
app.put('/api/admin/players/:id/goals', verifyAdminPin, async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const playerId = parseInt(Array.isArray(rawId) ? rawId[0] : rawId, 10);
    const goals = parseInt(req.body.goals ?? req.body.goals_scored, 10);
    if (isNaN(goals) || goals < 0) {
      return res.status(400).json({ detail: 'Goals must be a non-negative number.' });
    }
    await queryRun('UPDATE players SET goals_scored = $1 WHERE id = $2', [goals, playerId]);
    res.json({ success: true, message: `Updated manual bonus/extra goals to ${goals} for player.` });
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

app.post('/api/admin/bracket/generate', verifyAdminPin, async (_req: Request, res: Response) => {
  try {
    const result = await generateGroupTournament(true);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ detail: err.message });
  }
});

app.put('/api/admin/matches/:id/score', verifyAdminPin, async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const matchId = parseInt(Array.isArray(rawId) ? rawId[0] : rawId, 10);
    const result = await updateMatchScore(matchId, req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ detail: err.message });
  }
});

app.put('/api/admin/players/:id', verifyAdminPin, async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const playerId = parseInt(Array.isArray(rawId) ? rawId[0] : rawId, 10);
    const { name, efootball_id, whatsapp, team_name } = req.body;

    if (!name || !efootball_id || !whatsapp) {
      return res.status(400).json({ detail: 'Player Name, eFootball ID, and WhatsApp are required.' });
    }

    await queryRun(
      'UPDATE players SET name = $1, efootball_id = $2, whatsapp = $3, team_name = $4 WHERE id = $5',
      [name.trim(), efootball_id.trim(), whatsapp.trim(), (team_name || '').trim(), playerId]
    );

    res.json({ success: true, message: `Player #${playerId} details updated successfully.` });
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

app.delete('/api/admin/players/:id', verifyAdminPin, async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const playerId = parseInt(Array.isArray(rawId) ? rawId[0] : rawId, 10);
    await queryRun('DELETE FROM players WHERE id = $1', [playerId]);
    res.json({ success: true, message: 'Player removed successfully.' });
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

app.post('/api/admin/reset', verifyAdminPin, async (req: Request, res: Response) => {
  try {
    const resetPlayers = req.query.reset_players === 'true';
    await queryRun('DELETE FROM matches');
    if (resetPlayers) {
      await queryRun('DELETE FROM players');
    }
    await queryRun("UPDATE tournament_meta SET status = 'registration' WHERE id = 1");
    res.json({ success: true, message: 'Tournament reset back to registration state.' });
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

app.post('/api/admin/seed-demo', verifyAdminPin, async (req: Request, res: Response) => {
  try {
    const meta = await queryGet<TournamentMeta>('SELECT max_players FROM tournament_meta WHERE id = 1');
    const maxPlayers = meta?.max_players || 32;

    const currentVerifiedRow = await queryGet<{ cnt: string }>("SELECT COUNT(*) as cnt FROM players WHERE status = 'active' AND payment_status = 'verified'");
    const currentVerified = parseInt(String(currentVerifiedRow?.cnt || '0'), 10);
    const slotsAvailable = Math.max(0, maxPlayers - currentVerified);

    if (slotsAvailable === 0) {
      return res.status(400).json({ detail: `All ${maxPlayers} tournament slots are already filled with verified players!` });
    }

    const count = Math.min(slotsAvailable, parseInt((req.query.count as string) || '32', 10));
    const sampleTeams = [
      ['Apex Striker', '738-921-001', '+919876543210', 'Real Madrid DT'],
      ['Shadow Dribbler', '492-118-002', '+919876543211', 'FC Barcelona DT'],
      ['GhostCF', '882-301-003', '+919876543212', 'Manchester City DT'],
      ['Vortex_eF', '193-442-004', '+919876543213', 'Arsenal DT'],
      ['Kaiser Blue', '665-219-005', '+919876543214', 'Bayern Munich DT'],
      ['Neon Flash', '771-809-006', '+919876543215', 'Inter Milan DT'],
      ['Thunderbolt', '224-918-007', '+919876543216', 'AC Milan DT'],
      ['Phantom Finisher', '901-332-008', '+919876543217', 'PSG DT'],
      ['Zenith Pro', '332-119-009', '+919876543218', 'Liverpool DT'],
      ['Hyper Sonic', '554-890-010', '+919876543219', 'Juventus DT'],
      ['Blaze King', '441-209-011', '+919876543220', 'Atletico Madrid DT'],
      ['Silent Maestro', '883-772-012', '+919876543221', 'Borussia Dortmund DT'],
      ['Titan GK', '119-482-013', '+919876543222', 'Chelsea DT'],
      ['Pulse Maker', '994-321-014', '+919876543223', 'Bayer Leverkusen DT'],
      ['Spectre XI', '662-540-015', '+919876543224', 'Napoli DT'],
      ['Eclipse Legend', '773-199-016', '+919876543225', 'Tottenham DT'],
      ['Storm Wing', '331-500-017', '+919876543226', 'Ajax DT'],
      ['Nitro Striker', '442-601-018', '+919876543227', 'Benfica DT'],
      ['Iron Wall', '553-702-019', '+919876543228', 'Porto DT'],
      ['Falcon Play', '664-803-020', '+919876543229', 'Sporting DT'],
      ['Cyber Ace', '775-904-021', '+919876543230', 'Sevilla DT'],
      ['Nova Star', '886-015-022', '+919876543231', 'Valencia DT'],
      ['Blizzard', '997-126-023', '+919876543232', 'Villarreal DT'],
      ['Cosmo Kid', '108-237-024', '+919876543233', 'Roma DT'],
      ['Laser Pass', '219-348-025', '+919876543234', 'Lazio DT'],
      ['Matrix CF', '320-459-026', '+919876543235', 'Monaco DT'],
      ['Bullet Shot', '431-560-027', '+919876543236', 'Lyon DT'],
      ['Turbo GK', '542-671-028', '+919876543237', 'Marseille DT'],
      ['Galaxy XI', '653-782-029', '+919876543238', 'Feyenoord DT'],
      ['Orbit King', '764-893-030', '+919876543239', 'PSV DT'],
      ['Rocket Foot', '875-904-031', '+919876543240', 'Celtic DT'],
      ['Champion Ace', '986-015-032', '+919876543241', 'Rangers DT']
    ];

    let added = 0;
    for (let i = 0; i < sampleTeams.length && added < count; i++) {
      const [name, eid, wa, team] = sampleTeams[i];
      const existing = await queryGet('SELECT id FROM players WHERE efootball_id = $1', [eid]);
      if (!existing) {
        const fakeUtr = `UTR${Math.floor(100000000000 + Math.random() * 900000000000)}`;
        await queryRun(
          'INSERT INTO players (name, efootball_id, whatsapp, team_name, utr_number, payment_status) VALUES ($1, $2, $3, $4, $5, $6)',
          [name, eid, wa, team, fakeUtr, 'verified']
        );
        added++;
      }
    }

    res.json({ success: true, added, message: `Added ${added} demo players. Total verified slots: ${currentVerified + added}/${maxPlayers}` });
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

// --- Static Frontend Serving for Production / All-In-One ---
const distPath = process.env.FRONTEND_DIST || path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT_NUM = Number(PORT);
app.listen(PORT_NUM, '0.0.0.0', () => {
  console.log(`⚽ Pantihal eFootball Tournament Backend (TypeScript) running on port ${PORT_NUM}`);
});
