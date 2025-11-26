import Database from 'better-sqlite3';

const db = new Database('local.db');

console.log('Checking database schema...');

// Helper to check if column exists
function hasColumn(table, column) {
    const info = db.pragma(`table_info(${table})`);
    return info.some(col => col.name === column);
}

// Helper to check if table exists
function hasTable(table) {
    const stmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?");
    return !!stmt.get(table);
}

try {
    // 1. Add is_private to tasks
    if (!hasColumn('tasks', 'is_private')) {
        console.log('Adding is_private to tasks...');
        db.prepare('ALTER TABLE tasks ADD COLUMN is_private INTEGER DEFAULT 0').run();
    } else {
        console.log('tasks.is_private already exists.');
    }

    // 2. Add is_private to assessments
    if (!hasColumn('assessments', 'is_private')) {
        console.log('Adding is_private to assessments...');
        db.prepare('ALTER TABLE assessments ADD COLUMN is_private INTEGER DEFAULT 0').run();
    } else {
        console.log('assessments.is_private already exists.');
    }

    // 3. Add is_private to courses
    if (!hasColumn('courses', 'is_private')) {
        console.log('Adding is_private to courses...');
        db.prepare('ALTER TABLE courses ADD COLUMN is_private INTEGER DEFAULT 0').run();
    } else {
        console.log('courses.is_private already exists.');
    }

    // 4. Create friends table
    if (!hasTable('friends')) {
        console.log('Creating friends table...');
        db.prepare(`
            CREATE TABLE friends (
                id text PRIMARY KEY NOT NULL,
                user_id text NOT NULL,
                friend_id text NOT NULL,
                status text NOT NULL,
                created_at integer NOT NULL,
                FOREIGN KEY (user_id) REFERENCES user(id) ON UPDATE no action ON DELETE no action,
                FOREIGN KEY (friend_id) REFERENCES user(id) ON UPDATE no action ON DELETE no action
            )
        `).run();
    } else {
        console.log('friends table already exists.');
    }

    console.log('Migration completed successfully.');

} catch (error) {
    console.error('Migration failed:', error);
} finally {
    db.close();
}
