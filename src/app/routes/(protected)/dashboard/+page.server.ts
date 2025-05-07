import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ProductService } from '@application/product/product-service';
import { DrizzleProductRepository } from '@domain/product/repositories/product-repository';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}
	const productService = new ProductService(new DrizzleProductRepository());
	const totalActiveProducts = (await productService.listActive()).length;
	return { user: event.locals.user, totalActiveProducts };
};
