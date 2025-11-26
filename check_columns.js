import Database from 'better-sqlite3';
const db = new Database('local.db');
const columns = db.prepare("PRAGMA table_info(oauth_accounts)").all();
console.log('Columns:', columns);
