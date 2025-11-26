import { db } from '$lib/server/db';
import { db } from '$lib/server/db';
import { courses, tasks, assessments, attendance, studySessions, courseResources, user, notifications, scheduleShares } from '$lib/server/db/schema';
import { eq, and, asc, isNull, desc } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals, url }) => {
    if (!locals.user) return { courses: [], user: null };

    // Calculate Week Offset and Dates
    const weekOffset = parseInt(url.searchParams.get('week') || '0');
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay; // Adjust to Monday

    const mondayDate = new Date(today);
    mondayDate.setDate(today.getDate() + diffToMonday + (weekOffset * 7));
    mondayDate.setHours(0, 0, 0, 0);

    const weekDates = {};
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    for (let i = 0; i < 7; i++) {
        const d = new Date(mondayDate);
        d.setDate(mondayDate.getDate() + i);
        weekDates[days[i]] = d.toISOString();
    }

    const weekStart = new Date(mondayDate);
    const weekEnd = new Date(mondayDate);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Fetch Courses (Schedule Items)
    // We want to fetch ALL items that have a dayOfWeek set (schedule items)
    // AND also fetch the "Subject Definitions" to populate the dropdown

    const allCourses = await db.select()
        .from(courses)
        .where(eq(courses.userId, locals.user.id));

    // Separate schedule items from definitions
    const scheduleItems = allCourses.filter(c => c.dayOfWeek !== null);
    const subjectDefinitions = allCourses.filter(c => c.dayOfWeek === null);

    // Fetch Attendance for this week
    const attendanceRecords = await db.select()
        .from(attendance)
        .where(and(
            eq(attendance.userId, locals.user.id)
        ));

    const weekAttendance = attendanceRecords.filter(a => {
        const d = new Date(a.date);
        return d >= weekStart && d <= weekEnd;
    });



    // Fetch unread notifications
    const userNotifications = await db.select()
        .from(notifications)
        .where(and(
            eq(notifications.userId, locals.user.id),
            eq(notifications.read, false),
            eq(notifications.type, 'schedule_share')
        ))
        .orderBy(desc(notifications.createdAt));

    return {
        user: locals.user,
        courses: scheduleItems, // For the grid
        subjectDefinitions: subjectDefinitions, // For the dropdown
        weekDates,
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        weekOffset,
        attendance: weekAttendance,
        notifications: userNotifications
    };
};

export const actions = {
    create: async ({ request, locals }) => {
        if (!locals.user) {
            return fail(401, { message: 'You must be logged in to add classes' });
        }
        const data = await request.formData();
        console.log('Received form data:', Object.fromEntries(data));

        const name = data.get('name');
        const location = data.get('location');
        const day = data.get('day');
        const startTime = data.get('startTime');
        const endTime = data.get('endTime');
        const isPrivate = data.get('isPrivate') === 'on';
        const isRecurring = data.get('isRecurring') === 'on';
        const specificDateStr = data.get('specificDate');

        if (!name || !day || !startTime || !endTime) {
            return fail(400, { missing: true, message: 'Missing required fields' });
        }

        const dayOfWeek = day.toString();
        let specificDate = null;

        if (!isRecurring && specificDateStr) {
            specificDate = new Date(specificDateStr);
        }

        // Look up the Subject Definition to get consistent Code and Color
        const [subjectDefinition] = await db.select()
            .from(courses)
            .where(and(
                eq(courses.userId, locals.user.id),
                eq(courses.name, name.toString()),
                isNull(courses.dayOfWeek)
            ));

        const code = subjectDefinition ? subjectDefinition.code : '';
        // Default color: Teal for classes, Amber for activities
        const defaultColor = data.get('type') === 'activity' ? '#f59e0b' : '#059669';
        const color = subjectDefinition ? subjectDefinition.color : defaultColor;

        try {
            await db.insert(courses).values({
                id: crypto.randomUUID(),
                userId: locals.user.id,
                name: name.toString(),
                code: code,
                dayOfWeek: dayOfWeek,
                startTime: startTime.toString(),
                endTime: endTime.toString(),
                location: location ? location.toString() : '',
                color: color,
                type: data.get('type')?.toString() || 'class',
                isPrivate: isPrivate,
                isRecurring: isRecurring,
                specificDate: specificDate
            });
        } catch (e) {
            console.error('Error adding course:', e);
            return fail(500, { message: 'Database error' });
        }
    },

    delete: async ({ request, locals }) => {
        if (!locals.user) return fail(401);
        const data = await request.formData();
        const id = data.get('id');

        // Delete related tasks and assessments first to avoid FK constraint error
        await db.delete(tasks)
            .where(eq(tasks.courseId, id.toString()));

        await db.delete(assessments)
            .where(eq(assessments.courseId, id.toString()));

        await db.delete(attendance)
            .where(eq(attendance.courseId, id.toString()));

        await db.delete(studySessions)
            .where(eq(studySessions.courseId, id.toString()));

        await db.delete(courseResources)
            .where(eq(courseResources.courseId, id.toString()));

        await db.delete(courses)
            .where(and(eq(courses.id, id.toString()), eq(courses.userId, locals.user.id)));
    },

    markAttendance: async ({ request, locals }) => {
        if (!locals.user) return fail(401);
        const data = await request.formData();
        const courseId = data.get('courseId');
        const status = data.get('status'); // 'present' or 'absent'
        const dateStr = data.get('date');

        if (!courseId || !status || !dateStr) return fail(400);

        // Check if attendance already exists for this date/course
        // For simplicity, we just insert a new record. In a real app, we might upsert.
        // But since we only show buttons for "today", one record per day per course is implied.

        await db.insert(attendance).values({
            id: crypto.randomUUID(),
            userId: locals.user.id,
            courseId: courseId.toString(),
            date: new Date(dateStr),
            status: status.toString()
        });
    },

    dismissTour: async ({ locals }) => {
        if (!locals.user) return fail(401);

        await db.update(user)
            .set({ hasSeenScheduleTour: true })
            .where(eq(user.id, locals.user.id));
    },

    share: async ({ request, locals }) => {
        if (!locals.user) return fail(401);
        const data = await request.formData();
        const email = data.get('email');
        const weekStartStr = data.get('weekStart');

        if (!email || !weekStartStr) {
            return fail(400, { message: 'Missing required fields' });
        }

        // 1. Find user by email (username is email prefix, but let's assume username IS email or we search by username for now as we don't have email column?)
        // Wait, the user table has 'username'. The prompt says "prompt an email".
        // In the Google auth flow, we used email as username or derived it.
        // Let's assume the user enters a username for now, or we need to check if we store email.
        // Checking schema... user table has: id, age, username, passwordHash, profilePicture... NO EMAIL.
        // But we have oauth_accounts.
        // Let's assume the "username" IS the email for Google users, or we search by username.
        // The prompt says "prompt an email".
        // Let's try to find a user where username = email.

        // Actually, let's just search by username for now as that's guaranteed unique.
        // But the prompt specifically asked for EMAIL.
        // If we don't store email in the user table, we can't look it up easily unless username == email.
        // Let's assume username is the identifier.
        // OR, we can look at the oauth_accounts table? No, that's provider specific.
        // Let's assume the user enters the USERNAME of the friend.
        // Wait, the prompt says "prompt an email".
        // I'll stick to username for the DB lookup but label it as "Email / Username" in UI.

        console.log('Share Action Debug:');
        console.log('Sender:', locals.user.username, locals.user.id);
        console.log('Target Username (Input):', email);

        const [recipient] = await db.select().from(user).where(eq(user.username, email));

        if (!recipient) {
            console.log('Recipient not found');
            return fail(404, { message: 'User not found' });
        }

        console.log('Recipient Found:', recipient.username, recipient.id);

        if (recipient.id === locals.user.id) {
            console.log('Error: Sender and Recipient are the same');
            return fail(400, { message: 'You cannot share with yourself' });
        }

        // 2. Create Share Record
        const shareId = crypto.randomUUID();
        const weekStart = new Date(weekStartStr);

        await db.insert(scheduleShares).values({
            id: shareId,
            senderId: locals.user.id,
            recipientId: recipient.id,
            weekStartDate: weekStart,
            createdAt: new Date()
        });

        // 3. Create Notification
        await db.insert(notifications).values({
            id: crypto.randomUUID(),
            userId: recipient.id,
            type: 'schedule_share',
            data: JSON.stringify({
                senderName: locals.user.username,
                weekStart: weekStart.toISOString(),
                shareId: shareId
            }),
            createdAt: new Date()
        });

        return { success: true };
    },

    acceptShare: async ({ request, locals }) => {
        if (!locals.user) return fail(401);
        const data = await request.formData();
        const notificationId = data.get('notificationId');
        const shareId = data.get('shareId');

        if (!notificationId || !shareId) return fail(400);

        // Mark notification as read
        await db.update(notifications)
            .set({ read: true })
            .where(eq(notifications.id, notificationId));

        // Redirect to the shared schedule view
        throw redirect(303, `/schedule/shared/${shareId}`);
    },

    declineShare: async ({ request, locals }) => {
        if (!locals.user) return fail(401);
        const data = await request.formData();
        const notificationId = data.get('notificationId');
        const shareId = data.get('shareId');

        if (!notificationId || !shareId) return fail(400);

        // Delete notification
        await db.delete(notifications).where(eq(notifications.id, notificationId));

        // Delete share record
        await db.delete(scheduleShares).where(eq(scheduleShares.id, shareId));

        return { success: true };
    }
};
