import { error } from '@sveltejs/kit';
import type { RequestHandler } from '../$types';
import { OrderService } from '@application/order/order-service';
import { DrizzleOrderRepository } from '@domain/order/repositories/order-repository';
import { DrizzleProductRepository } from '@domain/product/repositories/product-repository';

const orderService = new OrderService(new DrizzleOrderRepository(), new DrizzleProductRepository());

export const DELETE: RequestHandler = async ({ params }) => {
	console.log('params', { params });
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

// async ({ request }) => {
// 	const formData = await request.formData();
// 	const orderId = formData.get('orderId');

// 	if (!orderId || typeof orderId !== 'string') {
// 		return fail(400, { error: 'Order ID is required' });
// 	}

// 	// Lógica para cerrar la orden en el servidor
// 	// Ejemplo: await db.orders.update(...)

// 	return { success: true };
// };
