import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

const sqlite = new Database('local.db');
const db = drizzle(sqlite);

console.log('Running migration v3...');

try {
    sqlite.exec(`
        ALTER TABLE courses ADD COLUMN is_recurring INTEGER DEFAULT 1;
        ALTER TABLE courses ADD COLUMN specific_date INTEGER;
    `);
    console.log('Migration successful!');
} catch (error) {
    console.error('Migration failed:', error);
}
