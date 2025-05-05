// src/lib/server/auth.ts
import type { RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = 'auth-session';

// Tipos para roles
export type UserRole = 'seller' | 'admin';

export interface AuthUser {
	id: string;
	username: string;
	role: UserRole;
}

export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	const token = encodeBase64url(bytes);
	return token;
}

export async function createSession(token: string, userId: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: table.Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + DAY_IN_MS * 1)
	};
	await db.insert(table.session).values(session);
	return session;
}

export async function validateSessionToken(token: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const [result] = await db
		.select({
			user: {
				id: table.user.id,
				username: table.user.username,
				role: table.user.role
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
		return { session: null, user: null };
	}

	const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15;
	if (renewSession) {
		session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30);
		await db
			.update(table.session)
			.set({ expiresAt: session.expiresAt })
			.where(eq(table.session.id, session.id));
	}

	return {
		session,
		user: {
			id: user.id,
			username: user.username,
			role: user.role as UserRole
		}
	};
}

export async function invalidateSession(sessionId: string) {
	await db.delete(table.session).where(eq(table.session.id, sessionId));
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax'
	});
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, {
		path: '/'
	});
}

// Nuevas funciones para manejo de usuarios con roles
export async function createUser(username: string, password: string, role: UserRole = 'seller') {
	const passwordHash = await Bun.password.hash(password, {
		algorithm: 'argon2id',
		memoryCost: 4,
		timeCost: 3
	});

	const userId = generateUserId();

	await db.insert(table.user).values({
		id: userId,
		username,
		passwordHash,
		role,
		createdAt: new Date()
	});

	return userId;
}

export async function validateUser(username: string, password: string) {
	const [user] = await db
		.select()
		.from(table.user)
		.where(eq(table.user.username, username))
		.limit(1);

	if (!user) return null;

	const validPassword = await Bun.password.verify(password, user.passwordHash);
	if (!validPassword) return null;

	return {
		id: user.id,
		username: user.username,
		role: user.role as UserRole
	};
}

function generateUserId() {
	const bytes = crypto.getRandomValues(new Uint8Array(16));
	return encodeHexLowerCase(bytes);
}
