import { db } from '$lib/server/db';
import { db } from '$lib/server/db';
import { assessments, courses, user } from '$lib/server/db/schema';
import { eq, and, asc, isNull } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load = async ({ locals }) => {
    if (!locals.user) return { assessments: [], courses: [], user: null };

    const userAssessments = await db.select({
        id: assessments.id,
        title: assessments.title,
        type: assessments.type,
        date: assessments.date,
        location: assessments.location,
        weight: assessments.weight,
        isPrivate: assessments.isPrivate,
        courseName: courses.name,
        courseColor: courses.color
    })
        .from(assessments)
        .leftJoin(courses, eq(assessments.courseId, courses.id))
        .where(and(
            eq(assessments.userId, locals.user.id),
            eq(assessments.completed, false)
        ))
        .orderBy(asc(assessments.date));

    // Only fetch "Subject Definitions" (where dayOfWeek is NULL)
    const userCourses = await db.select()
        .from(courses)
        .where(and(
            eq(courses.userId, locals.user.id),
            isNull(courses.dayOfWeek)
        ));

    return { assessments: userAssessments, courses: userCourses, user: locals.user };
};

export const actions = {
    create: async ({ request, locals }) => {
        if (!locals.user) return fail(401, { message: 'You must be logged in to add assessments' });
        const data = await request.formData();

        const title = data.get('title');
        const type = data.get('type');
        const dateStr = data.get('date');
        const timeStr = data.get('time');
        const location = data.get('location');
        const weight = data.get('weight');
        const courseId = data.get('courseId');
        const isPrivate = data.get('isPrivate') === 'on';

        if (!title || !dateStr) {
            return fail(400, { missing: true });
        }

        // Append T00:00:00 to ensure local time parsing, avoiding UTC offset issues
        let date = new Date(dateStr.toString() + 'T00:00:00');
        if (timeStr) {
            const [hours, minutes] = timeStr.toString().split(':');
            date.setHours(parseInt(hours), parseInt(minutes));
        }
        console.log('Creating Assessment - Date:', date.toString());

        await db.insert(assessments).values({
            id: crypto.randomUUID(),
            userId: locals.user.id,
            courseId: courseId ? courseId.toString() : null,
            title: title.toString(),
            type: type ? type.toString() : 'Assessment',
            date: date,
            location: location ? location.toString() : null,
            weight: weight ? parseInt(weight.toString()) : null,
            isPrivate: isPrivate
        });
    },

    delete: async ({ request, locals }) => {
        if (!locals.user) return fail(401);
        const data = await request.formData();
        const id = data.get('id');

        if (!id) return fail(400, { message: 'Assessment ID is required' });

        await db.delete(assessments)
            .where(and(eq(assessments.id, id.toString()), eq(assessments.userId, locals.user.id)));
    },

    complete: async ({ request, locals }) => {
        if (!locals.user) return fail(401);
        const data = await request.formData();
        const id = data.get('id');
        const grade = data.get('grade');

        if (!id || !grade) return fail(400, { message: 'Assessment ID and Grade are required' });

        await db.update(assessments)
            .set({
                grade: parseInt(grade.toString()),
                completed: true
            })
            .where(and(eq(assessments.id, id.toString()), eq(assessments.userId, locals.user.id)));
    },

    createCourse: async ({ request, locals }) => {
        if (!locals.user) return fail(401, { message: 'You must be logged in to add courses' });
        const data = await request.formData();
        const name = data.get('name');
        const color = data.get('color');

        if (!name) return fail(400, { missing: true, message: 'Course name is required' });

        try {
            await db.insert(courses).values({
                id: crypto.randomUUID(),
                userId: locals.user.id,
                name: name.toString(),
                code: 'N/A',
                color: color ? color.toString() : '#0d9488',
                location: '',
                dayOfWeek: 'Monday', // Default, can be edited later in schedule
                startTime: '09:00',
                endTime: '10:00'
            });
        } catch (e) {
            console.error('Error creating course:', e);
            return fail(500, { message: 'Database error' });
        }
    },

    dismissTour: async ({ locals }) => {
        if (!locals.user) return fail(401);

        await db.update(user)
            .set({ hasSeenAssessmentsTour: true })
            .where(eq(user.id, locals.user.id));
    }
};
