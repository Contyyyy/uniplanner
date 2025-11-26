import { hash } from '@node-rs/argon2';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import * as auth from '$lib/server/auth';
import { writeFileSync } from 'fs';
import { join } from 'path';

export const load = async (event) => {
    if (event.locals.user) {
        return redirect(302, '/dashboard');
    }
    return {};
};

export const actions = {
    register: async (event) => {
        const formData = await event.request.formData();
        const username = formData.get('username');
        const password = formData.get('password');
        const profilePicture = formData.get('profilePicture');

        if (!validateUsername(username)) {
            return fail(400, {
                message: 'Invalid username (min 3, max 31 characters, allowed: letters, numbers, spaces, -, _, .)'
            });
        }
        if (!validatePassword(password)) {
            return fail(400, { message: 'Invalid password (min 6, max 255 characters)' });
        }

        const userId = generateUserId();
        const passwordHash = await hash(password, {
            // recommended minimum parameters
            memoryCost: 19456,
            timeCost: 2,
            outputLen: 32,
            parallelism: 1
        });

        let profilePicturePath = null;

        if (profilePicture && profilePicture.size > 0) {
            try {
                const extension = profilePicture.name.split('.').pop();
                const fileName = `${userId}.${extension}`;
                const uploadPath = join(process.cwd(), 'static', 'uploads', fileName);

                const buffer = await profilePicture.arrayBuffer();
                writeFileSync(uploadPath, Buffer.from(buffer));

                profilePicturePath = `/uploads/${fileName}`;
            } catch (e) {
                console.error('Error uploading profile picture:', e);
                // Continue registration even if image upload fails, or return error?
                // For now, let's just log it and continue without the picture
            }
        }

        try {
            await db.insert(table.user).values({
                id: userId,
                username,
                passwordHash,
                profilePicture: profilePicturePath
            });

            const sessionToken = auth.generateSessionToken();
            const session = await auth.createSession(sessionToken, userId);
            auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
        } catch (e) {
            console.error('Registration error:', e);
            if (e.message && e.message.includes('UNIQUE constraint failed')) {
                return fail(400, { message: 'Username already taken' });
            }
            return fail(500, { message: 'An error has occurred' });
        }
        return redirect(302, '/onboarding');
    }
};

function generateUserId() {
    // ID with 120 bits of entropy, or about the same as UUID v4.
    const bytes = crypto.getRandomValues(new Uint8Array(15));
    const id = encodeBase32LowerCase(bytes);
    return id;
}

function validateUsername(username) {
    return (
        typeof username === 'string' &&
        username.length >= 3 &&
        username.length <= 31 &&
        /^[a-zA-Z0-9_.\-\s]+$/.test(username)
    );
}

function validatePassword(password) {
    return typeof password === 'string' && password.length >= 6 && password.length <= 255;
}
