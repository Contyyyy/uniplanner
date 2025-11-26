import Database from 'better-sqlite3';

const db = new Database('local.db');

try {
    console.log('Adding grade column...');
    db.prepare('ALTER TABLE assessments ADD COLUMN grade INTEGER').run();
    console.log('Added grade column.');
} catch (e) {
    if (e.message.includes('duplicate column name')) {
        console.log('grade column already exists.');
    } else {
        console.error('Error adding grade column:', e);
    }
}

try {
    console.log('Adding completed column...');
    db.prepare('ALTER TABLE assessments ADD COLUMN completed INTEGER DEFAULT 0').run();
    console.log('Added completed column.');
} catch (e) {
    if (e.message.includes('duplicate column name')) {
        console.log('completed column already exists.');
    } else {
        console.error('Error adding completed column:', e);
    }
}

console.log('Migration complete.');
