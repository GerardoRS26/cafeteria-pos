import { ProductService } from '@application/product/product-service';
import { DrizzleProductRepository } from '@infrastructure/db/drizzle/product-repository';

export async function load(event) {
	const service = new ProductService(new DrizzleProductRepository());
	const products = await service.listActive();
	console.log('products', products);
	return {
		products: products.map((p) => ({
			id: p.id.value,
			name: p.name,
			price: p.price.value
		})),
		user: event.locals.user
	};
}
