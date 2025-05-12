import { error } from '@sveltejs/kit';
import type { RequestHandler } from '../$types';
import { OrderService } from '@application/order/order-service';
import { DrizzleOrderRepository } from '@domain/order/repositories/order-repository';
import { DrizzleProductRepository } from '@domain/product/repositories/product-repository';
import { OrderId } from '@domain/order/value-objects/order-id';

const orderService = new OrderService(new DrizzleOrderRepository(), new DrizzleProductRepository());

export const DELETE: RequestHandler = async ({ params }) => {
	const { id } = params;
	if (!id) {
		throw error(400, 'Order ID is required');
	}
	try {
		await orderService.delete(id);
	} catch (error) {
		console.error('Error deleting order:', error);
		throw error(500, 'Failed to delete order');
	}
	return new Response();
};

export const PATCH: RequestHandler = async ({ params, request }) => {
	const body = await request.json();
	const { id } = params;
	console.log('Server update: ', { body, id });
	if (!id) {
		throw error(400, 'Order ID is required');
	}

	try {
		const data = {
			orderId: new OrderId(body.id),
			tableIdentifier: body.tableIdentifier,
			items: body.items.map((item) => {
				return {
					productId: item.product.id,
					quantity: item.quantity,
					unitPrice: item.product.price
				};
			}),
			status: body.status,
			extras: body.extras,
			discount: body.discount
		};
		console.log('Page calling update order service', { data });
		await orderService.update(data);
		console.log('Page finished update order service');
	} catch (error) {
		console.error('Error update order:', error);
		throw error(500, 'Failed to update order');
	}
	return new Response();
};
