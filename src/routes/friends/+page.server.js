import { db } from '$lib/server/db';
import { friends, user } from '$lib/server/db/schema';
import { eq, or, and, ne } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load = async ({ locals }) => {
    if (!locals.user) return { friends: [], incomingRequests: [], outgoingRequests: [] };

    const allFriends = await db.select({
        id: friends.id,
        friendId: friends.friendId,
        userId: friends.userId,
        status: friends.status,
        friendUsername: user.username
    })
        .from(friends)
        .innerJoin(user, or(
            and(eq(friends.friendId, user.id), eq(friends.userId, locals.user.id)),
            and(eq(friends.userId, user.id), eq(friends.friendId, locals.user.id))
        ))
        .where(or(
            eq(friends.userId, locals.user.id),
            eq(friends.friendId, locals.user.id)
        ));

    const acceptedFriends = allFriends.filter(f => f.status === 'accepted').map(f => ({
        ...f,
        username: f.friendUsername // The username of the OTHER person
    }));

    const incomingRequests = allFriends.filter(f => f.status === 'pending' && f.friendId === locals.user.id).map(f => ({
        ...f,
        username: f.friendUsername
    }));

    const outgoingRequests = allFriends.filter(f => f.status === 'pending' && f.userId === locals.user.id).map(f => ({
        ...f,
        username: f.friendUsername
    }));

    return { friends: acceptedFriends, incomingRequests, outgoingRequests };
};

export const actions = {
    sendRequest: async ({ request, locals }) => {
        if (!locals.user) return fail(401);
        const data = await request.formData();
        const username = data.get('username');

        if (!username) return fail(400, { message: 'Username is required' });
        if (username === locals.user.username) return fail(400, { message: 'You cannot add yourself' });

        const targetUser = await db.select().from(user).where(eq(user.username, username)).get();

        if (!targetUser) return fail(404, { message: 'User not found' });

        // Check if already friends or pending
        const existing = await db.select().from(friends).where(or(
            and(eq(friends.userId, locals.user.id), eq(friends.friendId, targetUser.id)),
            and(eq(friends.userId, targetUser.id), eq(friends.friendId, locals.user.id))
        )).get();

        if (existing) {
            if (existing.status === 'accepted') return fail(400, { message: 'Already friends' });
            return fail(400, { message: 'Request already pending' });
        }

        await db.insert(friends).values({
            id: crypto.randomUUID(),
            userId: locals.user.id,
            friendId: targetUser.id,
            status: 'pending',
            createdAt: new Date()
        });

        return { success: true };
    },

    acceptRequest: async ({ request, locals }) => {
        if (!locals.user) return fail(401);
        const data = await request.formData();
        const id = data.get('id');

        await db.update(friends)
            .set({ status: 'accepted' })
            .where(and(eq(friends.id, id), eq(friends.friendId, locals.user.id)));
    },

    rejectRequest: async ({ request, locals }) => {
        if (!locals.user) return fail(401);
        const data = await request.formData();
        const id = data.get('id');

        await db.delete(friends)
            .where(and(eq(friends.id, id), eq(friends.friendId, locals.user.id)));
    },

    removeFriend: async ({ request, locals }) => {
        if (!locals.user) return fail(401);
        const data = await request.formData();
        const id = data.get('id');

        // Can delete if you are either the sender or receiver
        await db.delete(friends)
            .where(and(
                eq(friends.id, id),
                or(eq(friends.userId, locals.user.id), eq(friends.friendId, locals.user.id))
            ));
    }
};
