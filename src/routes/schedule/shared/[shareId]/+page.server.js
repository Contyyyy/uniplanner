import { db } from '$lib/server/db';
import { scheduleShares, courses, user } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export const load = async ({ params, locals }) => {
    if (!locals.user) error(401, 'Unauthorized');

    const shareId = params.shareId;

    // 1. Verify Share exists and user is recipient
    const [share] = await db.select()
        .from(scheduleShares)
        .where(and(
            eq(scheduleShares.id, shareId),
            eq(scheduleShares.recipientId, locals.user.id)
        ));

    if (!share) error(404, 'Share not found');

    // 2. Get Sender Info
    const [sender] = await db.select()
        .from(user)
        .where(eq(user.id, share.senderId));

    // 3. Calculate Week Dates for the Shared Week
    const weekStart = new Date(share.weekStartDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekDates = {};
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        weekDates[days[i]] = d.toISOString();
    }

    // 4. Fetch Sender's Courses for that week
    // Logic similar to main schedule but filtered by date/recurrence
    const allSenderCourses = await db.select()
        .from(courses)
        .where(eq(courses.userId, share.senderId));

    const scheduleItems = allSenderCourses.filter(c => {
        if (c.dayOfWeek) return true; // Recurring items (we assume they happen every week for now)
        if (c.specificDate) {
            const d = new Date(c.specificDate);
            return d >= weekStart && d <= weekEnd;
        }
        return false;
    });

    return {
        sender,
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        weekDates,
        courses: scheduleItems
    };
};
