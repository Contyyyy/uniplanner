import { db } from '$lib/server/db';
import { tasks, user } from '$lib/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load = async ({ locals }) => {
    if (!locals.user) return { tasks: [], user: null };

    const userTasks = await db.select()
        .from(tasks)
        .where(eq(tasks.userId, locals.user.id))
        .orderBy(desc(tasks.dueDate));

    return { tasks: userTasks, user: locals.user };
};

export const actions = {
    create: async ({ request, locals }) => {
        if (!locals.user) {
            return fail(401, { message: 'You must be logged in to add tasks' });
        }
        const data = await request.formData();
        const title = data.get('title');
        const description = data.get('description');
        const dueDateStr = data.get('dueDate');
        const isPrivate = data.get('isPrivate') === 'on';

        if (!title) {
            return fail(400, { missing: true });
        }

        try {
            await db.insert(tasks).values({
                id: crypto.randomUUID(),
                userId: locals.user.id,
                title: title.toString(),
                description: description ? description.toString() : null,
                dueDate: dueDateStr ? new Date(dueDateStr.toString()) : null,
                completed: false,
                isPrivate: isPrivate
            });
        } catch (e) {
            console.error('Error inserting task:', e);
            return fail(500, { error: 'Database error' });
        }
    },

    toggle: async ({ request, locals }) => {
        if (!locals.user) return fail(401);
        const data = await request.formData();
        const id = data.get('id');
        const completed = data.get('completed') === 'true';

        await db.update(tasks)
            .set({ completed })
            .where(and(eq(tasks.id, id.toString()), eq(tasks.userId, locals.user.id)));
    },

    delete: async ({ request, locals }) => {
        if (!locals.user) return fail(401);
        const data = await request.formData();
        const id = data.get('id');

        if (!id) return fail(400, { message: 'Task ID is required' });

        await db.delete(tasks)
            .where(and(eq(tasks.id, id.toString()), eq(tasks.userId, locals.user.id)));
    },

    dismissTour: async ({ locals }) => {
        if (!locals.user) return fail(401);

        await db.update(user)
            .set({ hasSeenTour: true })
            .where(eq(user.id, locals.user.id));
    }
};
