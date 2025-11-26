import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';


export const load = async (event) => {
    if (!event.locals.user) {
        return redirect(302, '/demo/lucia/login');
    }
    return {
        user: event.locals.user
    };
};

export const actions = {
    submitCourses: async (event) => {
        const formData = await event.request.formData();
        const names = formData.getAll('name');
        const codes = formData.getAll('code');
        const colors = formData.getAll('color');

        if (!names.length) {
            return fail(400, { message: 'Please add at least one course.' });
        }

        const userId = event.locals.user.id;
        const coursesToInsert = names.map((name, index) => {
            return {
                id: crypto.randomUUID(),
                userId,
                name: name.toString(),
                code: codes[index]?.toString() || '',
                color: colors[index]?.toString() || '#0d9488'
            };
        });

        try {
            for (const course of coursesToInsert) {
                await db.insert(table.courses).values(course);
            }
        } catch (e) {
            console.error('Error inserting courses:', e);
            return fail(500, { message: 'Failed to save courses.' });
        }

        return redirect(302, '/welcome'); // Redirect to welcome page
    }
};
