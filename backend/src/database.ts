import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', 'tournament.db');

export const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', DB_PATH);
  }
});

// Promisified SQLite helpers
export const queryAll = <T>(sql: string, params: any[] = []): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
};

export const queryGet = <T>(sql: string, params: any[] = []): Promise<T | null> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve((row as T) || null);
    });
  });
};

export const queryRun = (sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

export async function initDb(): Promise<void> {
  // 1. Meta configuration table
  await queryRun(`
    CREATE TABLE IF NOT EXISTS tournament_meta (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'registration',
      admin_pin TEXT NOT NULL DEFAULT '1234',
      max_players INTEGER NOT NULL DEFAULT 32,
      match_time_mins INTEGER NOT NULL DEFAULT 7
    )
  `);

  const existingMeta = await queryGet('SELECT id FROM tournament_meta WHERE id = 1');
  if (!existingMeta) {
    await queryRun(`
      INSERT INTO tournament_meta (id, title, status, admin_pin, max_players, match_time_mins)
      VALUES (1, 'Jadupur eFootball Cup 2026', 'registration', '1234', 32, 7)
    `);
  }

  // 2. Players table
  await queryRun(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      efootball_id TEXT NOT NULL UNIQUE,
      whatsapp TEXT NOT NULL,
      team_name TEXT DEFAULT '',
      seed INTEGER DEFAULT NULL,
      registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'active'
    )
  `);

  // 3. Matches table
  await queryRun(`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      next_match_id INTEGER NULL,
      next_match_slot INTEGER NULL,
      status TEXT DEFAULT 'scheduled',
      FOREIGN KEY (player1_id) REFERENCES players (id),
      FOREIGN KEY (player2_id) REFERENCES players (id),
      FOREIGN KEY (winner_id) REFERENCES players (id)
    )
  `);
}
