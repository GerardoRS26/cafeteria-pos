import { ProductService } from '@application/product/product-service';
import { ProductId } from '@domain/product/value-objects/product-id';
import { DrizzleProductRepository } from '@domain/product/repositories/product-repository';
import { fail, redirect } from '@sveltejs/kit';

export async function load() {
	const service = new ProductService(new DrizzleProductRepository());
	const products = await service.listAll();
	return {
		products: products.map((p) => ({
			id: p.id.value,
			name: p.name,
			price: p.price.value,
			isActive: p.isActive
		}))
	};
}

export const actions = {
	delete: async ({ request }) => {
		const data = await request.formData();
		const service = new ProductService(new DrizzleProductRepository());
		const productId = (data.get('id') as string) ?? '';
		await service.deactivate(new ProductId(productId));
		throw redirect(303, '/products');
	},

	toggleStatus: async ({ request }) => {
		try {
			const formData = await request.formData();
			if (!formData.get('id')) throw new Error('ID requerido');

			const productId = new ProductId(formData.get('id') as string);
			const service = new ProductService(new DrizzleProductRepository());

			await service.toggleStatus(productId);
			return { success: true };
		} catch (error) {
			return fail(400, {
				error: error instanceof Error ? error.message : 'Error desconocido'
			});
		}
	}
};
