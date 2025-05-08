import type { RequestHandler } from '../$types';
import { db } from '@infrastructure/db/drizzle/client';

export const POST: RequestHandler = async () => {
	console.log('Try to sync database');
	try {
		await db.$client.sync();
		console.log('Database synced successfully');
	} catch (error) {
		console.error('Error syncing database:', error);
	}

	return new Response();
};
