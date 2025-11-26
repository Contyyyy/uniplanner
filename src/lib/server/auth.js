import { eq } from 'drizzle-orm';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { Google } from 'arctic';
import { env } from '$env/dynamic/private';

export const google = new Google(
	env.GOOGLE_CLIENT_ID,
	env.GOOGLE_CLIENT_SECRET,
	'http://localhost:5173/login/google/callback'
);

console.log('--- DEBUG GOOGLE AUTH ---');
console.log('Client ID Length:', env.GOOGLE_CLIENT_ID ? env.GOOGLE_CLIENT_ID.length : 0);
console.log('Client ID Suffix:', env.GOOGLE_CLIENT_ID ? env.GOOGLE_CLIENT_ID.slice(-25) : 'N/A');
console.log('Client Secret Length:', env.GOOGLE_CLIENT_SECRET ? env.GOOGLE_CLIENT_SECRET.length : 0);
console.log('Client ID has whitespace:', /\s/.test(env.GOOGLE_CLIENT_ID || ''));
console.log('Client Secret has whitespace:', /\s/.test(env.GOOGLE_CLIENT_SECRET || ''));
console.log('Redirect URI:', 'http://localhost:5173/login/google/callback');
console.log('-------------------------');

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = 'auth-session';

export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	const token = encodeBase64url(bytes);
	return token;
}

/**
 * @param {string} token
 * @param {string} userId
 */
export async function createSession(token, userId) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + DAY_IN_MS * 30)
	};
	await db.insert(table.session).values(session);
	return session;
}

/** @param {string} token */
export async function validateSessionToken(token) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const [result] = await db
		.select({
			// Adjust user table here to tweak returned data
			user: {
				id: table.user.id,
				username: table.user.username,
				profilePicture: table.user.profilePicture,
				hasSeenTour: table.user.hasSeenTour,
				hasSeenScheduleTour: table.user.hasSeenScheduleTour,
				hasSeenAssessmentsTour: table.user.hasSeenAssessmentsTour,
				hasSeenProgressTour: table.user.hasSeenProgressTour
			},
			session: table.session
		})
		.from(table.session)
		.innerJoin(table.user, eq(table.session.userId, table.user.id))
		.where(eq(table.session.id, sessionId));

	if (!result) {
		return { session: null, user: null };
	}
	const { session, user } = result;

	const sessionExpired = Date.now() >= session.expiresAt.getTime();
	if (sessionExpired) {
		await db.delete(table.session).where(eq(table.session.id, session.id));
		return { session: null, user: null }; 5
	}

	const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15;
	if (renewSession) {
		session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30);
		await db
			.update(table.session)
			.set({ expiresAt: session.expiresAt })
			.where(eq(table.session.id, session.id));
	}

	return { session, user };
}

/** @param {string} sessionId */
export async function invalidateSession(sessionId) {
	await db.delete(table.session).where(eq(table.session.id, sessionId));
}

/**
 * @param {import("@sveltejs/kit").RequestEvent} event
 * @param {string} token
 * @param {Date} expiresAt
 */
export function setSessionTokenCookie(event, token, expiresAt) {
	event.cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: '/'
	});
}

/** @param {import("@sveltejs/kit").RequestEvent} event */
export function deleteSessionTokenCookie(event) {
	event.cookies.delete(sessionCookieName, {
		path: '/'
	});
}
