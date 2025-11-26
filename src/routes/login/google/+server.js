import { generateState, generateCodeVerifier } from 'arctic';
import { google } from '$lib/server/auth';

export async function GET({ cookies }) {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const url = await google.createAuthorizationURL(state, codeVerifier, ['profile', 'email']);
    url.searchParams.set('prompt', 'select_account');

    cookies.set('google_oauth_state', state, {
        path: '/',
        secure: import.meta.env.PROD,
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: 'lax'
    });

    cookies.set('google_code_verifier', codeVerifier, {
        path: '/',
        secure: import.meta.env.PROD,
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: 'lax'
    });

    return new Response(null, {
        status: 302,
        headers: {
            Location: url.toString()
        }
    });
}
