import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../data/app_data.db');

const db = new Database(dbPath, {
  // verbose: console.log, // Useful for debugging queries
});

// Enable WAL mode for performance
db.pragma('journal_mode = WAL');

// Run migrations
db.exec(`
  CREATE TABLE IF NOT EXISTS review_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sentence_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating IN (1, 2, 3, 4)),
    time_taken_ms INTEGER,
    reviewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sentence_id) REFERENCES sentences(id) ON DELETE CASCADE
  );
`);

export default db;
