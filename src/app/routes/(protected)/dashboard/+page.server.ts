import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ProductService } from '$lib/products/product-service';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}
	const productService = new ProductService();
	const totalActiveProducts = (await productService.listActive()).length;
	return { user: event.locals.user, totalActiveProducts };
};
