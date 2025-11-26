import { db } from '$lib/server/db';
import { assessments, courses, attendance, user } from '$lib/server/db/schema';
import { eq, and, isNotNull, asc } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load = async ({ locals }) => {
    if (!locals.user) return { gradedAssessments: [], user: null };

    const gradedAssessments = await db.select({
        title: assessments.title,
        grade: assessments.grade,
        date: assessments.date,
        courseName: courses.name,
        courseColor: courses.color
    })
        .from(assessments)
        .leftJoin(courses, eq(assessments.courseId, courses.id))
        .where(and(
            eq(assessments.userId, locals.user.id),
            eq(assessments.completed, true),
            isNotNull(assessments.grade)
        ))
        .orderBy(asc(assessments.date));

    const attendanceRecords = await db.select()
        .from(attendance)
        .where(eq(attendance.userId, locals.user.id));

    return { gradedAssessments, attendanceRecords, user: locals.user };
};

export const actions = {
    dismissTour: async ({ locals }) => {
        if (!locals.user) return fail(401);

        await db.update(user)
            .set({ hasSeenProgressTour: true })
            .where(eq(user.id, locals.user.id));
    }
};
