import { fail, redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		throw redirect(302, '/');
	}
	return {};
};

export const actions: Actions = {
	login: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		if (!validateUsername(username)) {
			return fail(400, {
				message: 'Usuario inválido (3-31 caracteres alfanuméricos)'
			});
		}

		const user = await auth.validateUser(username.toString(), (password ?? '').toString());
		if (!user) {
			return fail(400, { message: 'Usuario o contraseña incorrectos' });
		}

		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, user.id);
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

		throw redirect(302, '/');
	},
	register: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');
		const role = (formData.get('role') as auth.UserRole) || 'seller';

		if (!validateUsername(username)) {
			return fail(400, { message: 'Usuario inválido' });
		}
		if (!validatePassword(password)) {
			return fail(400, { message: 'Contraseña inválida (mínimo 6 caracteres)' });
		}

		try {
			const userId = await auth.createUser(username.toString(), password.toString(), role);

			const sessionToken = auth.generateSessionToken();
			const session = await auth.createSession(sessionToken, userId);
			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
		} catch (e) {
			return fail(500, { message: 'Error al crear usuario' });
		}

		throw redirect(302, '/');
	}
};

function validateUsername(username: unknown): username is string {
	return typeof username === 'string' && /^[a-z0-9_-]{3,31}$/.test(username);
}

function validatePassword(password: unknown): password is string {
	return typeof password === 'string' && password.length >= 6;
}
