import { db } from '$lib/server/db';
import { courses, courseResources } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load = async ({ locals, params }) => {
    if (!locals.user) return { course: null, resources: [], user: null };

    const [course] = await db.select()
        .from(courses)
        .where(and(
            eq(courses.id, params.id),
            eq(courses.userId, locals.user.id)
        ));

    if (!course) return { course: null, resources: [], user: locals.user };

    const resources = await db.select()
        .from(courseResources)
        .where(eq(courseResources.courseId, course.id));

    return { course, resources, user: locals.user };
};

export const actions = {
    updateNotes: async ({ request, locals, params }) => {
        if (!locals.user) return fail(401);
        const data = await request.formData();
        const notes = data.get('notes');

        await db.update(courses)
            .set({ notes: notes ? notes.toString() : '' })
            .where(and(
                eq(courses.id, params.id),
                eq(courses.userId, locals.user.id)
            ));
    },

    addResource: async ({ request, locals, params }) => {
        if (!locals.user) return fail(401);
        const data = await request.formData();
        const title = data.get('title');
        const url = data.get('url');

        if (!title || !url) return fail(400);

        await db.insert(courseResources).values({
            id: crypto.randomUUID(),
            courseId: params.id,
            title: title.toString(),
            url: url.toString()
        });
    },

    deleteResource: async ({ request, locals }) => {
        if (!locals.user) return fail(401);
        const data = await request.formData();
        const id = data.get('id');

        await db.delete(courseResources)
            .where(eq(courseResources.id, id.toString()));
    }
};
