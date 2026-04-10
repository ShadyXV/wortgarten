import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../data/app_data.db');

const db = new Database(dbPath, {
  // verbose: console.log, // Useful for debugging queries
});

// Enable WAL mode for performance
db.pragma('journal_mode = WAL');

export default db;
