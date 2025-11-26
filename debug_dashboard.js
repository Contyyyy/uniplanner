import { db } from './src/lib/server/db/index.js';
import { tasks, courses, assessments, user } from './src/lib/server/db/schema.js';
import { eq, and, gte, asc } from 'drizzle-orm';

async function debug() {
    console.log('--- Debugging Dashboard Queries ---');

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
    console.log('Total Courses for user:', allCourses.length);
    allCourses.forEach(c => {
        console.log(`- Course: ${c.name}, Day: '${c.dayOfWeek}', Matches Today? ${c.dayOfWeek === dayName}`);
    });

    const todayCourses = await db.select()
        .from(courses)
        .where(and(
            eq(courses.userId, testUser.id),
            eq(courses.dayOfWeek, dayName)
        ))
        .orderBy(asc(courses.startTime));
    console.log('Query Result - Today Courses:', todayCourses.length);

    // Check Assessments
    const allAssessments = await db.select().from(assessments).where(eq(assessments.userId, testUser.id));
    console.log('Total Assessments for user:', allAssessments.length);
    allAssessments.forEach(a => {
        const aDate = new Date(a.date);
        console.log(`- Assessment: ${a.title}, Date: ${aDate.toString()}, >= Today? ${aDate >= today}`);
    });

    const upcomingAssessments = await db.select()
        .from(assessments)
        .where(and(
            eq(assessments.userId, testUser.id),
            gte(assessments.date, today)
        ))
        .orderBy(asc(assessments.date))
        .limit(3);
    console.log('Query Result - Upcoming Assessments:', upcomingAssessments.length);
}

debug().catch(console.error).finally(() => process.exit());
