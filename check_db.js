import Database from 'better-sqlite3';
const db = new Database('local.db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables.map(t => t.name));
const indices = db.prepare("SELECT name FROM sqlite_master WHERE type='index'").all();
console.log('Indices:', indices.map(i => i.name));
