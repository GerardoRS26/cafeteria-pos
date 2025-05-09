import { OrderService } from '@application/order/order-service';
import { ProductService } from '@application/product/product-service';
import { DrizzleProductRepository } from '@domain/product/repositories/product-repository';

import { DrizzleOrderRepository } from '@domain/order/repositories/order-repository';
import type { PageServerLoad } from './$types';
import { is } from 'drizzle-orm';
import { pid } from 'process';

const orderService = new OrderService(new DrizzleOrderRepository(), new DrizzleProductRepository());

export async function load(event): Promise<PageServerLoad> {
	const productService = new ProductService(new DrizzleProductRepository());
	const [products, openOrders, paidOrders] = await Promise.all([
		productService.listActive(),
		orderService.listOpen(),
		orderService.listPaid(50)
	]);

	//
	console.log('Orders Before Map', { openOrders, paidOrders, products });
	const response = {
		products: products.map((p) => ({
			id: p.id.value,
			name: p.name,
			price: p.price.value
		})),
		user: event.locals.user,
		openOrders: openOrders
			? //TODO FIX maps items
				openOrders.map((o) => ({
					...o,
					id: o.id.value,
					status: o.status.value,
					discount: o.discount?.amount,
					items: o
						.getItems()
						.map((i) => {
							const product = products.find((p) => p.id.equals(i.productId));
							console.log('Order item', { i, product });
							if (!product) return;
							return {
								id: product.id.value,
								name: product.name,
								price: i.unitPrice.value,
								isActive: product.isActive,
								quantity: i.quantity
							};
						})
						.filter((item) => {
							console.log({ item });
							return item;
						})
				}))
			: [],
		paidOrders: paidOrders
			? paidOrders.map((o) => ({
					...o,
					id: o.id.value,
					status: o.status.value,
					discount: o.discount?.amount,
					items: o.getItems().map((i) => products.find((p) => p.id.equals(i.productId)))
				}))
			: []
	};
	console.log('Response Mapped:', response);
	return response;
}

export const actions = {
	createOrder: async ({ request }) => {
		const formData = await request.formData();
		const tableIdentifier = formData.get('tableIdentifier');
		const orderId = formData.get('orderId');
		const orderStatus = formData.get('orderStatus');
		const orderItems = formData.get('orderItems');
		const orderExtras = formData.get('orderExtras');

		if (!tableIdentifier || typeof tableIdentifier !== 'string') {
			return fail(400, { error: 'Table identifier is required' });
		}

		// Lógica para crear la orden en el servidor
		const newOrder = {
			id: crypto.randomUUID(),
			tableIdentifier,
			items: [],
			status: 'open',
			createdAt: new Date()
		};

		orderService.create(newOrder);

		return { success: true, order: newOrder };
	},

	closeOrder: async ({ request }) => {
		const formData = await request.formData();
		const orderId = formData.get('orderId');

		if (!orderId || typeof orderId !== 'string') {
			return fail(400, { error: 'Order ID is required' });
		}

		// Lógica para cerrar la orden en el servidor
		// Ejemplo: await db.orders.update(...)

		return { success: true };
	}
};
