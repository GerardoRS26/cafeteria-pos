import { OrderService, type Order, type OrderItem } from '$lib/orders/order-service.js';
import { ProductService } from '$lib/products/product-service.js';

const orderService = new OrderService();

export type OrderWithItemNames = Omit<Order, 'items'> & {
	items: (OrderItem & { name: string })[];
};

export async function load(event) {
	const productService = new ProductService();
	let [products, openOrders, paidOrders] = await Promise.all([
		productService.listActive(),
		orderService.listOpen(),
		orderService.listPaid(50)
	]);

	openOrders = openOrders.map((order) => {
		return {
			...order,
			items: order.items.map((item) => {
				return {
					...item,
					name: products?.find((product) => product.id === item.productId)?.name ?? 'No set'
				};
			})
		};
	});

	paidOrders = paidOrders.map((order) => {
		return {
			...order,
			items: order.items.map((item) => {
				return {
					...item,
					name: products?.find((product) => product.id === item.productId)?.name ?? 'No set'
				};
			})
		};
	});

	const response = {
		products: products.map((p) => ({
			id: p.id,
			name: p.name,
			price: p.price
		})),
		user: event.locals.user,
		openOrders: openOrders as OrderWithItemNames[],
		paidOrders: paidOrders as OrderWithItemNames[]
	};
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
