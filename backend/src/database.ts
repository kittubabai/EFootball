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
    await queryRun(`
      INSERT INTO tournament_meta (
        id, title, status, admin_pin, max_players, match_time_mins,
        event_date, event_time, entry_fee, upi_id, upi_name
      ) VALUES (
        1, 'Pantihal eFootball Cup 2026', 'registration', '1234', 32, 14,
        '18th October 2026', '11:00 AM onwards', 100, 'sayantanbabu2000-1@oksbi', 'Sayantan Chakraborty'
      )
    `);
  } else {
    // Ensure all columns exist for migrations
    for (const alterSql of [
      "ALTER TABLE tournament_meta ADD COLUMN event_date TEXT DEFAULT '18th October 2026'",
      "ALTER TABLE tournament_meta ADD COLUMN event_time TEXT DEFAULT '11:00 AM onwards'",
      "ALTER TABLE tournament_meta ADD COLUMN entry_fee INTEGER DEFAULT 100",
      "ALTER TABLE tournament_meta ADD COLUMN upi_id TEXT DEFAULT 'sayantanbabu2000-1@oksbi'",
      "ALTER TABLE tournament_meta ADD COLUMN upi_name TEXT DEFAULT 'Sayantan Chakraborty'"
    ]) {
      try {
        await queryRun(alterSql);
      } catch (_) {}
    }
    await queryRun("UPDATE tournament_meta SET match_time_mins = 14 WHERE id = 1");
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
      payment_status TEXT NOT NULL DEFAULT 'pending',
      utr_number TEXT NOT NULL DEFAULT '',
      group_assigned TEXT DEFAULT NULL,
      registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'active'
    )
  `);

  for (const alterSql of [
    "ALTER TABLE players ADD COLUMN payment_status TEXT DEFAULT 'pending'",
    "ALTER TABLE players ADD COLUMN utr_number TEXT DEFAULT ''",
    "ALTER TABLE players ADD COLUMN group_assigned TEXT DEFAULT NULL",
    "ALTER TABLE players ADD COLUMN payment_screenshot TEXT DEFAULT ''"
  ]) {
    try {
      await queryRun(alterSql);
    } catch (_) {}
  }

  // 3. Matches table with 4-group & finals support
  await queryRun(`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      status TEXT DEFAULT 'scheduled',
      FOREIGN KEY (player1_id) REFERENCES players (id),
      FOREIGN KEY (player2_id) REFERENCES players (id),
      FOREIGN KEY (winner_id) REFERENCES players (id),
      FOREIGN KEY (loser_id) REFERENCES players (id)
    )
  `);

  for (const alterSql of [
    "ALTER TABLE matches ADD COLUMN group_key TEXT DEFAULT 'A'",
    "ALTER TABLE matches ADD COLUMN loser_id INTEGER NULL",
    "ALTER TABLE matches ADD COLUMN loser_next_match_id INTEGER NULL",
    "ALTER TABLE matches ADD COLUMN loser_next_slot INTEGER NULL"
  ]) {
    try {
      await queryRun(alterSql);
    } catch (_) {}
  }
}
