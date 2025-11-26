import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and, or, inArray, sql } from 'drizzle-orm';
import { deleteSessionTokenCookie, invalidateSession } from '$lib/server/auth';

export const load = async (event) => {
    if (!event.locals.user) {
        return redirect(302, '/demo/lucia/login');
    }

    // Only fetch "Subject Definitions" (where dayOfWeek is NULL)
    const userCourses = db.select()
        .from(table.courses)
        .where(and(
            eq(table.courses.userId, event.locals.user.id),
            sql`${table.courses.dayOfWeek} IS NULL`
        ))
        .all();

    return {
        user: event.locals.user,
        courses: userCourses
    };
};

export const actions = {


    createCourse: async (event) => {
        if (!event.locals.user) return fail(401);
        const formData = await event.request.formData();
        const name = formData.get('name');
        const code = formData.get('code');
        const color = formData.get('color') || '#0d9488'; // Default teal

        if (!name || !code) {
            return fail(400, { message: 'Name and code are required' });
        }

        try {
            db.insert(table.courses).values({
                id: crypto.randomUUID(),
                userId: event.locals.user.id,
                name: name.toString(),
                code: code.toString(),
                color: color.toString(),
                type: 'class',
                isRecurring: true,
                dayOfWeek: null // Explicitly null for Subject Definition
            }).run();
        } catch (e) {
            console.error(e);
            return fail(500, { message: 'Failed to create course' });
        }
    },

    updateCourse: async (event) => {
        if (!event.locals.user) return fail(401);
        const formData = await event.request.formData();
        const id = formData.get('id');
        const name = formData.get('name');
        const code = formData.get('code');
        const color = formData.get('color');

        if (!id || !name || !code) {
            return fail(400, { message: 'Missing required fields' });
        }

        try {
            // 1. Fetch the original course to get its current name
            const originalCourse = db.select()
                .from(table.courses)
                .where(and(eq(table.courses.id, id.toString()), eq(table.courses.userId, event.locals.user.id)))
                .get();

            if (!originalCourse) return fail(404, { message: 'Course not found' });

            // 2. Update ALL courses (definitions and schedule items) with the same name
            db.update(table.courses)
                .set({
                    name: name.toString(),
                    code: code.toString(),
                    color: color ? color.toString() : undefined
                })
                .where(and(
                    eq(table.courses.userId, event.locals.user.id),
                    eq(table.courses.name, originalCourse.name)
                ))
                .run();
        } catch (e) {
            console.error(e);
            return fail(500, { message: 'Failed to update course' });
        }
    },

    deleteCourse: ({ request, locals }) => { // Removed async
        if (!locals.user) {
            return fail(401);
        }
        const data = request.formData(); // Removed await
        const id = data.get('id');

        if (!id) {
            return fail(400, { message: 'Missing course ID' });
        }

        try {
            db.transaction((tx) => { // Removed await
                // Delete related data first
                tx.delete(table.tasks).where(eq(table.tasks.courseId, id)).run();
                tx.delete(table.assessments).where(eq(table.assessments.courseId, id)).run();
                tx.delete(table.attendance).where(eq(table.attendance.courseId, id)).run();
                tx.delete(table.studySessions).where(eq(table.studySessions.courseId, id)).run();
                tx.delete(table.courseResources).where(eq(table.courseResources.courseId, id)).run();

                // Delete course
                tx.delete(table.courses).where(and(
                    eq(table.courses.id, id),
                    eq(table.courses.userId, locals.user.id)
                )).run();
            });
            return { success: true };
        } catch (e) {
            console.error(e);
            return fail(500, { message: 'Failed to delete course' });
        }
    },

    deleteAccount: ({ locals, cookies }) => {
        if (!locals.user) {
            return fail(401);
        }

        try {
            const userId = locals.user.id;

            db.transaction((tx) => {
                // 1. Delete Session
                tx.delete(table.session).where(eq(table.session.userId, userId)).run();

                // 2. Delete OAuth Accounts
                tx.delete(table.oauthAccounts).where(eq(table.oauthAccounts.userId, userId)).run();

                // 3. Delete Friends (where user is sender or receiver)
                tx.delete(table.friends).where(or(
                    eq(table.friends.userId, userId),
                    eq(table.friends.friendId, userId)
                )).run();

                // 4. Delete Attendance
                tx.delete(table.attendance).where(eq(table.attendance.userId, userId)).run();

                // 5. Delete Assessments
                tx.delete(table.assessments).where(eq(table.assessments.userId, userId)).run();

                // 6. Delete Tasks
                tx.delete(table.tasks).where(eq(table.tasks.userId, userId)).run();

                // 7. Delete Study Sessions
                tx.delete(table.studySessions).where(eq(table.studySessions.userId, userId)).run();

                // 8. Delete Course Resources
                // First get all course IDs for the user to delete their resources
                const userCourses = tx.select({ id: table.courses.id }).from(table.courses).where(eq(table.courses.userId, userId)).all();
                const courseIds = userCourses.map(c => c.id);

                if (courseIds.length > 0) {
                    tx.delete(table.courseResources).where(inArray(table.courseResources.courseId, courseIds)).run();
                }

                // 9. Delete Courses
                tx.delete(table.courses).where(eq(table.courses.userId, userId)).run();

                // 10. Delete User
                tx.delete(table.user).where(eq(table.user.id, userId)).run();
            });

            // Clear auth cookie
            deleteSessionTokenCookie({ cookies });

            return redirect(302, '/');
        } catch (e) {
            console.error('Delete Account Error:', e);
            return fail(500, { message: 'Failed to delete account' });
        }
    },

    logout: async (event) => {
        if (!event.locals.session) {
            return fail(401);
        }
        await invalidateSession(event.locals.session.id);
        deleteSessionTokenCookie(event);
        return redirect(302, '/');
    }
};
