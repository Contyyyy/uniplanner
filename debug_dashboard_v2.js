import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { eq, and, gte, asc } from 'drizzle-orm';

// Re-define schema locally to avoid import issues with SvelteKit-specific files
const user = sqliteTable('user', {
    id: text('id').primaryKey(),
    age: integer('age'),
    username: text('username').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    profilePicture: text('profile_picture')
});

const courses = sqliteTable('courses', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => user.id),
    name: text('name').notNull(),
    code: text('code').notNull(),
    color: text('color').notNull(),
    location: text('location').notNull(),
    dayOfWeek: text('day_of_week').notNull(),
    startTime: text('start_time').notNull(),
    endTime: text('end_time').notNull(),
    isPrivate: integer('is_private', { mode: 'boolean' }).notNull().default(false)
});

const assessments = sqliteTable('assessments', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => user.id),
    courseId: text('course_id').references(() => courses.id),
    title: text('title').notNull(),
    type: text('type').notNull(),
    date: integer('date', { mode: 'timestamp' }).notNull(),
    location: text('location'),
    weight: integer('weight'),
    isPrivate: integer('is_private', { mode: 'boolean' }).notNull().default(false)
});

const db = drizzle(new Database('local.db'));

async function debug() {
    console.log('--- Debugging Dashboard Queries (V2) ---');

    const users = await db.select().from(user).limit(1);
    if (users.length === 0) {
        console.log('No users found.');
        return;
    }
    const testUser = users[0];
    console.log('Test User:', testUser.username, testUser.id);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });

    console.log('Now:', now.toString());
    console.log('Today (Local 00:00):', today.toString());
    console.log('Day Name:', dayName);

    // Check Courses
    const allCourses = await db.select().from(courses).where(eq(courses.userId, testUser.id));
    console.log('\nAll Courses:', allCourses.length);
    allCourses.forEach(c => {
        console.log(`- [${c.dayOfWeek}] ${c.name} (${c.startTime}-${c.endTime})`);
    });

    const todayCourses = await db.select()
        .from(courses)
        .where(and(
            eq(courses.userId, testUser.id),
            eq(courses.dayOfWeek, dayName)
        ))
        .orderBy(asc(courses.startTime));
    console.log(`\nCourses for TODAY (${dayName}):`, todayCourses.length);

    // Check Assessments
    const allAssessments = await db.select().from(assessments).where(eq(assessments.userId, testUser.id));
    console.log('\nAll Assessments:', allAssessments.length);
    allAssessments.forEach(a => {
        const aDate = new Date(a.date);
        console.log(`- [${aDate.toLocaleDateString()}] ${a.title} (Timestamp: ${a.date.getTime()})`);
    });

    const upcomingAssessments = await db.select()
        .from(assessments)
        .where(and(
            eq(assessments.userId, testUser.id),
            gte(assessments.date, today)
        ))
        .orderBy(asc(assessments.date))
        .limit(3);
    console.log(`\nUpcoming Assessments (>= ${today.toLocaleDateString()}):`, upcomingAssessments.length);
}

debug().catch(console.error);
