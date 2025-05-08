// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);
	const currentPath = event.url.pathname;
	if (currentPath === '/login' || currentPath === '/test') return resolve(event);

	if (event.url.search === '?/logout') {
		if (!event.locals.session) {
			auth.deleteSessionTokenCookie(event);
			return redirect(302, '/login"');
		}
		await auth.invalidateSession(event.locals.session.id);
		auth.deleteSessionTokenCookie(event);

		return redirect(302, '/login');
	}

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		throw redirect(303, `/login?redirect=${encodeURIComponent(currentPath)}`);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);
	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
	}

	// Asignamos user con roles
	event.locals.user = user
		? {
				id: user.id,
				username: user.username,
				role: user.role // Añadimos el rol aquí
			}
		: null;
	event.locals.session = session;

	if (!event.locals.user) {
		throw redirect(303, `/login?redirect=${encodeURIComponent(currentPath)}`);
	}

	if (
		currentPath.includes('/admin/') &&
		(!event.locals.user || event.locals.user.role !== 'admin')
	) {
		throw redirect(303, '/unauthorized');
	}

	return resolve(event);
};
