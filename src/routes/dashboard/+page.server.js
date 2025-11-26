import { db } from '$lib/server/db';
import { tasks, courses, assessments } from '$lib/server/db/schema';
import { eq, and, gte, asc } from 'drizzle-orm';

export const load = async ({ locals }) => {
    if (!locals.user) {
        return {
            tasks: [],
            courses: [],
            assessments: [],
            user: null
        };
    }

    const now = new Date();
    // Create a date object for today at 00:00:00 local time
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });

    console.log('Dashboard Load Debug:');
    console.log('Now:', now.toString());
    console.log('Today (Local 00:00):', today.toString());
    console.log('Day Name:', dayName);

    const userTasks = await db.select()
        .from(tasks)
        .where(and(
            eq(tasks.userId, locals.user.id),
            eq(tasks.completed, false)
        ))
        .orderBy(asc(tasks.dueDate))
        .limit(50);

    // Fetch all courses to determine upcoming classes
    const allCourses = await db.select()
        .from(courses)
        .where(eq(courses.userId, locals.user.id));

    const daysMap = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
    const currentDayIdx = now.getDay();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Calculate next occurrence for each course
    const upcomingCourses = allCourses
        .filter(course => course.startTime && course.dayOfWeek) // Filter out invalid courses
        .map(course => {
            const courseDayIdx = daysMap[course.dayOfWeek];
            let dayDiff = (courseDayIdx - currentDayIdx + 7) % 7;

            // Parse start time
            const [startH, startM] = course.startTime.split(':').map(Number);

            // If it's today but passed, move to next week
            // if (dayDiff === 0) {
            //     if (startH < currentHour || (startH === currentHour && startM <= currentMinute)) {
            //         dayDiff = 7;
            //     }
            // }

            // Create a comparable date for sorting
            const nextDate = new Date(now);
            nextDate.setDate(now.getDate() + dayDiff);
            nextDate.setHours(startH, startM, 0, 0);

            return { ...course, nextDate, dayDiff };
        });

    // Sort by next occurrence and take top 20
    upcomingCourses.sort((a, b) => a.nextDate - b.nextDate);
    const nextCourses = upcomingCourses.slice(0, 20);

    console.log('Fetched Upcoming Courses:', nextCourses.length);

    const upcomingAssessments = await db.select()
        .from(assessments)
        .where(and(
            eq(assessments.userId, locals.user.id),
            eq(assessments.completed, false)
        ))
        .orderBy(asc(assessments.date))
        .limit(10);

    console.log('Fetched Assessments (>= today):', upcomingAssessments.length);

    // Calculate "Next Up"
    let nextUp = null;

    // Check Tasks
    const upcomingTasks = userTasks.filter(t => t.dueDate && t.dueDate > now).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    if (upcomingTasks.length > 0) {
        nextUp = {
            type: 'task',
            title: upcomingTasks[0].title,
            time: upcomingTasks[0].dueDate,
            id: upcomingTasks[0].id
        };
    }

    // Check Courses (Use the already calculated nextCourses)
    // Filter for courses that are in the future
    const futureCourses = nextCourses.filter(c => c.nextDate > now);

    if (futureCourses.length > 0) {
        const nextCourse = futureCourses[0];

        if (!nextUp || nextCourse.nextDate < nextUp.time) {
            nextUp = {
                type: 'class',
                title: nextCourse.name,
                time: nextCourse.nextDate,
                location: nextCourse.location,
                id: nextCourse.id,
                color: nextCourse.color
            };
        }
    }

    return {
        tasks: userTasks,
        courses: nextCourses,
        assessments: upcomingAssessments,
        user: locals.user,
        nextUp
    };
};
