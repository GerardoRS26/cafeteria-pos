import { ProductService } from '$lib/products/product-service';
import { fail, redirect } from '@sveltejs/kit';

const service = new ProductService();

export async function load(event) {
	const products = await service.listAll();
	return {
		products,
		user: event.locals.user
	};
}

export const actions = {
	delete: async ({ request }) => {
		console.log('Delete action triggered');
		const data = await request.formData();
		const productId = (data.get('id') as string) ?? '';
		await service.deactivate(productId);
		throw redirect(303, '/products');
	},

	toggleStatus: async ({ request }) => {
		try {
			const formData = await request.formData();
			if (!formData.get('id')) throw new Error('ID requerido');
			const productId = formData.get('id') as string;
			await service.toggleStatus(productId);
			return { success: true };
		} catch (error) {
			return fail(400, {
				error: error instanceof Error ? error.message : 'Error desconocido'
			});
		}
	}
};
