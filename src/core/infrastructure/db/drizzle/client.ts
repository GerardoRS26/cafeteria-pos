import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
if (!process.env.DATABASE_AUTH_TOKEN) throw new Error('DATABASE_AUTH_TOKEN is not set');

const client = createClient({
	url: process.env.DATABASE_URL as string,
	syncUrl: process.env.DATABASE_SYNC_URL,
	authToken: process.env.DATABASE_AUTH_TOKEN,
	syncInterval: 60 * 60,
	offline: true
});
await client.sync();

export const db = drizzle(client, { schema });
