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
  BracketResponse,
  RoundResponse
} from './types/tournament.js';
import { generateBracketMatches, updateMatchScore } from './bracketService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

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
  const p = await queryGet<Player>('SELECT id, name, efootball_id, team_name, whatsapp FROM players WHERE id = ?', [playerId]);
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    efootball_id: p.efootball_id,
    team_name: p.team_name || '',
    whatsapp: p.whatsapp || ''
  };
};

// --- Public Endpoints ---

app.get('/api/status', async (_req: Request, res: Response) => {
  try {
    const meta = await queryGet<TournamentMeta>('SELECT title, status, max_players, match_time_mins FROM tournament_meta WHERE id = 1');
    const countRow = await queryGet<{ cnt: number }>("SELECT COUNT(*) as cnt FROM players WHERE status = 'active'");

    const result: TournamentStatusResponse = {
      title: meta?.title || 'eFootball Mobile Cup 2026',
      status: meta?.status || 'registration',
      registered_count: countRow?.cnt || 0,
      max_players: meta?.max_players || 32,
      match_time_mins: meta?.match_time_mins || 7
    };
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

app.post('/api/players/register', async (req: Request, res: Response) => {
  try {
    const { name, efootball_id, whatsapp, team_name } = req.body;

    if (!name || !efootball_id || !whatsapp) {
      return res.status(400).json({ detail: 'Name, eFootball ID, and WhatsApp number are required.' });
    }

    const meta = await queryGet<TournamentMeta>('SELECT status, max_players FROM tournament_meta WHERE id = 1');
    if (meta?.status !== 'registration') {
      return res.status(400).json({ detail: 'Registration is currently closed for this tournament.' });
    }

    const countRow = await queryGet<{ cnt: number }>("SELECT COUNT(*) as cnt FROM players WHERE status = 'active'");
    if ((countRow?.cnt || 0) >= (meta?.max_players || 32)) {
      return res.status(400).json({ detail: 'Tournament has reached maximum capacity of 32 players.' });
    }

    const existing = await queryGet<Player>('SELECT id FROM players WHERE efootball_id = ?', [efootball_id.trim()]);
    if (existing) {
      return res.status(400).json({ detail: 'This eFootball User ID is already registered.' });
    }

    const runRes = await queryRun(
      'INSERT INTO players (name, efootball_id, whatsapp, team_name) VALUES (?, ?, ?, ?)',
      [name.trim(), efootball_id.trim(), whatsapp.trim(), (team_name || '').trim()]
    );

    const newPlayer = await queryGet<Player>('SELECT * FROM players WHERE id = ?', [runRes.lastID]);
    res.status(201).json(newPlayer);
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
    const matches = await queryAll<Match>('SELECT * FROM matches ORDER BY round_index ASC, match_number ASC');

    const roundsMap = new Map<number, RoundResponse>();

    for (const m of matches) {
      if (!roundsMap.has(m.round_index)) {
        roundsMap.set(m.round_index, {
          round_index: m.round_index,
          round_name: m.round_name,
          matches: []
        });
      }

      const p1 = await fetchPlayerDetail(m.player1_id);
      const p2 = await fetchPlayerDetail(m.player2_id);

      roundsMap.get(m.round_index)!.matches.push({
        id: m.id,
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
        next_match_id: m.next_match_id,
        next_match_slot: m.next_match_slot,
        status: m.status
      });
    }

    const bracketRes: BracketResponse = {
      tournament_status: meta?.status || 'registration',
      rounds: Array.from(roundsMap.values())
    };

    res.json(bracketRes);
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

app.get('/api/matches', async (_req: Request, res: Response) => {
  try {
    const matches = await queryAll<Match>('SELECT * FROM matches ORDER BY round_index ASC, match_number ASC');
    const result: MatchResponse[] = [];

    for (const m of matches) {
      const p1 = await fetchPlayerDetail(m.player1_id);
      const p2 = await fetchPlayerDetail(m.player2_id);

      result.push({
        id: m.id,
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
        next_match_id: m.next_match_id,
        next_match_slot: m.next_match_slot,
        status: m.status
      });
    }

    res.json(result);
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

app.post('/api/admin/bracket/generate', verifyAdminPin, async (_req: Request, res: Response) => {
  try {
    const result = await generateBracketMatches(true);
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

app.delete('/api/admin/players/:id', verifyAdminPin, async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const playerId = parseInt(Array.isArray(rawId) ? rawId[0] : rawId, 10);
    await queryRun('DELETE FROM players WHERE id = ?', [playerId]);
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
    const count = parseInt((req.query.count as string) || '16', 10);
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
      ['Eclipse Legend', '773-199-016', '+919876543225', 'Tottenham DT']
    ];

    let added = 0;
    for (const [name, eid, wa, team] of sampleTeams.slice(0, count)) {
      const existing = await queryGet('SELECT id FROM players WHERE efootball_id = ?', [eid]);
      if (!existing) {
        await queryRun(
          'INSERT INTO players (name, efootball_id, whatsapp, team_name) VALUES (?, ?, ?, ?)',
          [name, eid, wa, team]
        );
        added++;
      }
    }

    res.json({ success: true, added, message: `Added ${added} demo players.` });
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
  console.log(`⚽ eFootball Tournament Backend (TypeScript) running on port ${PORT_NUM}`);
});
