import { ProductService } from '@application/product/product-service';
import { ProductId } from '@domain/product/value-objects/product-id';
import { DrizzleProductRepository } from '@infrastructure/db/drizzle/product-repository';
import { redirect } from '@sveltejs/kit';

export async function load() {
	console.log('Loading products...');
	const service = new ProductService(new DrizzleProductRepository());
	const products = await service.listActive();
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
		console.log('Delete action triggered');
		const data = await request.formData();
		const service = new ProductService(new DrizzleProductRepository());
		const productId = (data.get('id') as string) ?? '';
		await service.deactivate(new ProductId(productId));
		throw redirect(303, '/admin/products');
	}
};
