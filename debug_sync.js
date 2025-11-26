import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { eq, and, gte, asc } from 'drizzle-orm';

// Schema
const user = sqliteTable('user', { id: text('id').primaryKey(), username: text('username') });
const assessments = sqliteTable('assessments', {
    id: text('id').primaryKey(),
    userId: text('user_id'),
    title: text('title'),
    type: text('type'),
    date: integer('date', { mode: 'timestamp' }),
    isPrivate: integer('is_private', { mode: 'boolean' })
});

const db = drizzle(new Database('local.db'));

async function debug() {
    console.log('--- Debugging Sync ---');

    // 1. Get User
    const users = await db.select().from(user).limit(1);
    const testUser = users[0];
    console.log('User:', testUser.username);

    // 2. Simulate "Today"
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    console.log('Today (Local 00:00):', today.toString());

    // 3. Simulate Adding Assessment (Logic from assessments/+page.server.js)
    const dateStr = now.toISOString().split('T')[0]; // "YYYY-MM-DD"
    const timeStr = "23:59";

    let newDate = new Date(dateStr + 'T00:00:00');
    const [hours, minutes] = timeStr.split(':');
    newDate.setHours(parseInt(hours), parseInt(minutes));

    console.log('Inserting Assessment Date:', newDate.toString());

    const newId = crypto.randomUUID();
    await db.insert(assessments).values({
        id: newId,
        userId: testUser.id,
        title: "Debug Sync Test " + Date.now(),
        type: "Exam",
        date: newDate,
        isPrivate: false
    });

    // 4. Query Dashboard (Logic from +page.server.js)
    const upcoming = await db.select()
        .from(assessments)
        .where(and(
            eq(assessments.userId, testUser.id),
            gte(assessments.date, today)
        ))
        .orderBy(asc(assessments.date))
        .limit(3);

    console.log('Dashboard Query Result:');
    upcoming.forEach(a => {
        console.log(`- ${a.title}: ${a.date.toString()} (Match? ${a.id === newId})`);
    });

    const found = upcoming.find(a => a.id === newId);
    console.log('Sync Test Result:', found ? 'SUCCESS' : 'FAILURE');

    // Cleanup
    await db.delete(assessments).where(eq(assessments.id, newId));
}

debug().catch(console.error);
