import { error, fail, type ActionResult } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { isRedirectError } from '$lib/utils';
import { ProductService } from '$lib/products/product-service';

const service = new ProductService();
export const load: PageServerLoad = async ({ params }) => {
	const product = await service.getById(params.id);

	if (!product) {
		throw error(404, 'Producto no encontrado');
	}

	return {
		product
	};
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const formData = await request.formData();

		try {
			const productId = params.id;
			//TODO actualizar reglas para que siempre se envie el agregado de producto o en el save para evitar validaciones

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
				price: priceValue,
				cost: costValue
			});
			return { result: { type: 'success' } as ActionResult };
		} catch (err) {
			if (isRedirectError(err)) {
				throw err;
			}
			console.error('Error updating product:', err);
			return fail(400, {
				error: err instanceof Error ? err.message : 'Error al actualizar el producto',
				fields: {
					name: formData.get('name')?.toString(),
					description: formData.get('description')?.toString(),
					price: formData.get('price')?.toString(),
					cost: formData.get('cost')?.toString()
				}
			});
		}
	}
};
