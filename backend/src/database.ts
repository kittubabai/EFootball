import { setDefaultResultOrder } from 'dns';
// Force IPv4 — Render free tier does not support IPv6 outbound connections
setDefaultResultOrder('ipv4first');

import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});


pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err.message);
});

// Promisified helpers that mirror the old SQLite API surface

export const queryAll = async <T>(sql: string, params: any[] = []): Promise<T[]> => {
  const result = await pool.query(sql, params);
  return result.rows as T[];
};

export const queryGet = async <T>(sql: string, params: any[] = []): Promise<T | null> => {
  const result = await pool.query(sql, params);
  return (result.rows[0] as T) || null;
};

export const queryRun = async (sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> => {
  const result = await pool.query(sql, params);
  return {
    lastID: result.rows[0]?.id ?? 0,
    changes: result.rowCount ?? 0
  };
};

export async function initDb(): Promise<void> {
  // 1. tournament_meta table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tournament_meta (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'registration',
      admin_pin TEXT NOT NULL DEFAULT '1234',
      max_players INTEGER NOT NULL DEFAULT 32,
      match_time_mins INTEGER NOT NULL DEFAULT 14,
      event_date TEXT NOT NULL DEFAULT '18th October 2026',
      event_time TEXT NOT NULL DEFAULT '11:00 AM onwards',
      entry_fee INTEGER NOT NULL DEFAULT 100,
      upi_id TEXT NOT NULL DEFAULT 'sayantanbabu2000-1@oksbi',
      upi_name TEXT NOT NULL DEFAULT 'Sayantan Chakraborty'
    )
  `);

  const existingMeta = await queryGet('SELECT id FROM tournament_meta WHERE id = 1');
  if (!existingMeta) {
    await pool.query(`
      INSERT INTO tournament_meta (
        id, title, status, admin_pin, max_players, match_time_mins,
        event_date, event_time, entry_fee, upi_id, upi_name
      ) VALUES (
        1, 'Pantihal eFootball Cup 2026', 'registration', '1234', 32, 14,
        '18th October 2026', '11:00 AM onwards', 100, 'sayantanbabu2000-1@oksbi', 'Sayantan Chakraborty'
      )
    `);
  }

  // 2. players table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS players (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      efootball_id TEXT NOT NULL UNIQUE,
      whatsapp TEXT NOT NULL,
      team_name TEXT DEFAULT '',
      seed INTEGER DEFAULT NULL,
      payment_status TEXT NOT NULL DEFAULT 'pending',
      utr_number TEXT NOT NULL DEFAULT '',
      payment_screenshot TEXT DEFAULT '',
      group_assigned TEXT DEFAULT NULL,
      goals_scored INTEGER DEFAULT 0,
      registered_at TIMESTAMP DEFAULT NOW(),
      status TEXT DEFAULT 'active'
    )
  `);

  // Safe column additions using IF NOT EXISTS (PostgreSQL 9.6+)
  const playerCols: [string, string][] = [
    ['payment_status', "TEXT DEFAULT 'pending'"],
    ['utr_number', "TEXT DEFAULT ''"],
    ['group_assigned', 'TEXT DEFAULT NULL'],
    ['payment_screenshot', "TEXT DEFAULT ''"],
    ['goals_scored', 'INTEGER DEFAULT 0'],
  ];
  for (const [col, type] of playerCols) {
    try {
      await pool.query(`ALTER TABLE players ADD COLUMN IF NOT EXISTS ${col} ${type}`);
    } catch (_) {}
  }

  // 3. matches table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS matches (
      id SERIAL PRIMARY KEY,
      group_key TEXT NOT NULL DEFAULT 'A',
      round_name TEXT NOT NULL,
      round_index INTEGER NOT NULL,
      match_number INTEGER NOT NULL,
      player1_id INTEGER NULL,
      player2_id INTEGER NULL,
      player1_score INTEGER NULL,
      player2_score INTEGER NULL,
      player1_pk INTEGER NULL,
      player2_pk INTEGER NULL,
      is_extra_time INTEGER DEFAULT 0,
      winner_id INTEGER NULL,
      loser_id INTEGER NULL,
      next_match_id INTEGER NULL,
      next_match_slot INTEGER NULL,
      loser_next_match_id INTEGER NULL,
      loser_next_slot INTEGER NULL,
      status TEXT DEFAULT 'scheduled'
    )
  `);

  const matchCols: [string, string][] = [
    ['group_key', "TEXT DEFAULT 'A'"],
    ['loser_id', 'INTEGER NULL'],
    ['loser_next_match_id', 'INTEGER NULL'],
    ['loser_next_slot', 'INTEGER NULL'],
  ];
  for (const [col, type] of matchCols) {
    try {
      await pool.query(`ALTER TABLE matches ADD COLUMN IF NOT EXISTS ${col} ${type}`);
    } catch (_) {}
  }

  console.log('✅ Supabase PostgreSQL database initialised successfully.');
}


