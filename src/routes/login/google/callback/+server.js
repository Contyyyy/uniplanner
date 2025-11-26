import { google, createSession, generateSessionToken, setSessionTokenCookie } from '$lib/server/auth';
import { decodeIdToken } from 'arctic';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET({ url, cookies }) {
    console.log('--- Google Callback Started ---');
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const storedState = cookies.get('google_oauth_state');
    const storedCodeVerifier = cookies.get('google_code_verifier');

    console.log('Params:', { code: !!code, state, storedState, storedCodeVerifier });

    if (!code || !state || !storedState || !storedCodeVerifier || state !== storedState) {
        console.error('Invalid state or code');
        return new Response(null, {
            status: 400
        });
    }

    try {
        console.log('Validating auth code...');
        const tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);
        console.log('Tokens received');
        const claims = decodeIdToken(tokens.idToken());
        console.log('Claims decoded:', claims.sub, claims.name);
        const googleUserId = claims.sub;
        const username = claims.name;
        const email = claims.email;
        const initials = email ? email.substring(0, 2).toUpperCase() : username.slice(0, 2).toUpperCase();

        // Check if existing user
        console.log('Checking for existing user...');
        const existingAccount = await db
            .select()
            .from(table.oauthAccounts)
            .where(and(
                eq(table.oauthAccounts.providerId, 'google'),
                eq(table.oauthAccounts.providerUserId, googleUserId)
            ))
            .limit(1);

        if (existingAccount.length > 0) {
            console.log('Existing user found. Updating profile picture to initials...');
            // Update existing user's profile picture to initials
            await db.update(table.user)
                .set({ profilePicture: initials })
                .where(eq(table.user.id, existingAccount[0].userId));

            console.log('Creating session...');
            const sessionToken = generateSessionToken();
            const session = await createSession(sessionToken, existingAccount[0].userId);
            setSessionTokenCookie({ cookies }, sessionToken, session.expiresAt);
            console.log('Session created. Redirecting to /dashboard');
            return new Response(null, {
                status: 302,
                headers: {
                    Location: '/dashboard'
                }
            });
        }

        // Create new user
        console.log('Creating new user...');
        const userId = crypto.randomUUID();

        // Use email prefix as username
        let uniqueUsername = email.split('@')[0];

        // Check for username collision
        const existingUser = await db
            .select()
            .from(table.user)
            .where(eq(table.user.username, uniqueUsername))
            .limit(1);

        if (existingUser.length > 0) {
            uniqueUsername += '_' + crypto.randomUUID().slice(0, 4);
        }

        db.transaction((tx) => {
            tx.insert(table.user).values({
                id: userId,
                username: uniqueUsername,
                passwordHash: '', // No password for OAuth users
                profilePicture: initials,
                age: 0 // Default
            }).run();

            tx.insert(table.oauthAccounts).values({
                providerId: 'google',
                providerUserId: googleUserId,
                userId: userId
            }).run();
        });
        console.log('User created in DB.');

        const sessionToken = generateSessionToken();
        const session = await createSession(sessionToken, userId);
        setSessionTokenCookie({ cookies }, sessionToken, session.expiresAt);
        console.log('Session created for new user. Redirecting to /dashboard');
        return new Response(null, {
            status: 302,
            headers: {
                Location: '/dashboard'
            }
        });
    } catch (e) {
        console.error('OAuth Error:', e);
        return new Response(`OAuth Error: ${e.message || e}`, {
            status: 400
        });
    }
}
