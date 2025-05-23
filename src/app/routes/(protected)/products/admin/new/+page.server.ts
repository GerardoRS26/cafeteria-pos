import { ProductService } from '$lib/products/product-service';

import { fail, type ActionResult } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		try {
			// 1. Validar y parsear datos
			const name = formData.get('name') as string;
			const description = formData.get('description') as string;
			const price = parseFloat(formData.get('price') as string);
			const cost = parseFloat(formData.get('cost') as string);

			if (!name || name.length < 3) {
				throw new Error('El nombre debe tener al menos 3 caracteres');
			}

			if (isNaN(price) || price < 0 || isNaN(cost) || cost < 0) {
				throw new Error('Precio y costo deben ser números positivos');
			}

			// 2. Crear instancias de dominio
			const productService = new ProductService();
			await productService.create({
				id: crypto.randomUUID(),
				name,
				description,
				price,
				cost
			});

			return { result: { type: 'success' } as ActionResult };
		} catch (error) {
			// 4. Manejar errores
			return fail(400, {
				error: error instanceof Error ? error.message : 'Error desconocido',
				formData: Object.fromEntries(formData)
			});
		}
	}
};
