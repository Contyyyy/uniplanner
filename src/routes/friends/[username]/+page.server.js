import { db } from '$lib/server/db';
import { friends, user, courses, tasks, assessments } from '$lib/server/db/schema';
import { eq, or, and, asc } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export const load = async ({ params, locals }) => {
    if (!locals.user) error(401, 'Unauthorized');

    const friendUsername = params.username;
    const friendUser = await db.select().from(user).where(eq(user.username, friendUsername)).get();

    if (!friendUser) error(404, 'User not found');

    // Verify friendship
    const friendship = await db.select().from(friends).where(or(
        and(eq(friends.userId, locals.user.id), eq(friends.friendId, friendUser.id), eq(friends.status, 'accepted')),
        and(eq(friends.userId, friendUser.id), eq(friends.friendId, locals.user.id), eq(friends.status, 'accepted'))
    )).get();

    if (!friendship) error(403, 'Not friends with this user');

    // Fetch public data
    const friendCourses = await db.select().from(courses)
        .where(and(eq(courses.userId, friendUser.id), eq(courses.isPrivate, false)));

    const friendTasks = await db.select().from(tasks)
        .where(and(eq(tasks.userId, friendUser.id), eq(tasks.isPrivate, false)))
        .orderBy(asc(tasks.dueDate))
        .limit(5);

    const friendAssessments = await db.select({
        id: assessments.id,
        title: assessments.title,
        type: assessments.type,
        date: assessments.date,
        location: assessments.location,
        weight: assessments.weight,
        courseName: courses.name,
        courseColor: courses.color
    })
        .from(assessments)
        .leftJoin(courses, eq(assessments.courseId, courses.id))
        .where(and(eq(assessments.userId, friendUser.id), eq(assessments.isPrivate, false)))
        .orderBy(asc(assessments.date))
        .limit(5);

    return {
        friend: { username: friendUser.username },
        courses: friendCourses,
        tasks: friendTasks,
        assessments: friendAssessments
    };
};
