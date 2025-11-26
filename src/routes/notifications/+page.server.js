import { db } from '$lib/server/db';
import { notifications } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load = async ({ locals }) => {
    if (!locals.user) return { notifications: [] };

    const userNotifications = await db.select()
        .from(notifications)
        .where(eq(notifications.userId, locals.user.id))
        .orderBy(desc(notifications.createdAt));

    return {
        notifications: userNotifications
    };
};

export const actions = {
    markRead: async ({ request, locals }) => {
        if (!locals.user) return fail(401);
        const data = await request.formData();
        const id = data.get('id');

        if (!id) return fail(400);

        await db.update(notifications)
            .set({ read: true })
            .where(eq(notifications.id, id.toString()));
    }
};
