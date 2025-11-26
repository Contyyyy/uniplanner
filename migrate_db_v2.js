import Database from 'better-sqlite3';

const db = new Database('local.db');

try {
    console.log('Adding type column to courses...');
    db.prepare("ALTER TABLE courses ADD COLUMN type TEXT DEFAULT 'class'").run();
    console.log('Added type column.');
} catch (e) {
    if (e.message.includes('duplicate column name')) {
        console.log('type column already exists.');
    } else {
        console.error('Error adding type column:', e);
    }
}

try {
    console.log('Creating attendance table...');
    db.prepare(`
        CREATE TABLE IF NOT EXISTS attendance (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            course_id TEXT NOT NULL,
            date INTEGER NOT NULL,
            status TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES user(id),
            FOREIGN KEY (course_id) REFERENCES courses(id)
        )
    `).run();
    console.log('Created attendance table.');
} catch (e) {
    console.error('Error creating attendance table:', e);
}

console.log('Migration complete.');
