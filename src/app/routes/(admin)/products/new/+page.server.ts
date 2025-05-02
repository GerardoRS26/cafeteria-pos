import { ProductService } from '@application/product/product-service';
import { DrizzleProductRepository } from '@infrastructure/db/drizzle/product-repository';
import { ProductId } from '@domain/product/value-objects/product-id';
import { Money } from '@domain/product/value-objects/money';
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		try {
			const service = new ProductService(new DrizzleProductRepository());
			await service.create({
				id: new ProductId(crypto.randomUUID()),
				name: data.get('name') as string,
				description: '',
				price: new Money(Number(data.get('price'))),
				cost: new Money(0)
			});
			throw redirect(303, '/admin/products');
		} catch (e) {
			return fail(400, { error: e.message });
		}
	}
};
