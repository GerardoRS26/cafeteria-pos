import { ProductService } from '@application/product/product-service';
import { DrizzleProductRepository } from '@infrastructure/db/drizzle/product-repository';
import { ProductId } from '@domain/product/value-objects/product-id';
import { Money } from '@domain/product/value-objects/money';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const service = new ProductService(new DrizzleProductRepository());
	const product = await service.getById(new ProductId(params.id));

	if (!product) {
		throw error(404, 'Producto no encontrado');
	}

	return {
		product: {
			id: product.id.value,
			name: product.name,
			description: product.description,
			price: product.price.value,
			cost: product.cost.value
		}
	};
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const formData = await request.formData();

		try {
			const service = new ProductService(new DrizzleProductRepository());
			const productId = new ProductId(params.id);

			// Validaciones
			const name = formData.get('name')?.toString() || '';
			const priceValue = Number(formData.get('price'));
			const costValue = Number(formData.get('cost'));

			if (name.length < 3) throw new Error('Nombre muy corto');
			if (isNaN(priceValue)) throw new Error('Precio inválido');

			// Actualización
			await service.update(productId, {
				name,
				description: formData.get('description')?.toString(),
				price: new Money(priceValue),
				cost: new Money(costValue)
			});

			throw redirect(303, '/admin/products');
		} catch (err) {
			return fail(400, {
				error: err instanceof Error ? err.message : 'Error desconocido',
				formData: Object.fromEntries(formData)
			});
		}
	}
};
