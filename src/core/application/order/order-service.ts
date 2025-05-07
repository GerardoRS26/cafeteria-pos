import { Order } from '@domain/order/aggregates/order';
import type { OrderRepository } from '@domain/order/repositories/repository';
import type { ProductRepository } from '@domain/product/repositories/repository';
import { OrderId } from '@domain/order/value-objects/order-id';
import { ProductId } from '@domain/product/value-objects/product-id';
import { Money } from '@shared/value-objects/money';

/**
 * Handles all order use cases.
 * @class
 */
export class OrderService {
	constructor(
		private readonly orderRepository: OrderRepository,
		private readonly productRepository: ProductRepository
	) {}

	// ---- CRUD Operations ----
	async create(params: {
		tableIdentifier: string;
		items?: Array<{
			productId: string;
			quantity: number;
			unitPrice: number;
		}>;
	}): Promise<Order> {
		const orderId = new OrderId(crypto.randomUUID());
		const order = new Order({
			id: orderId,
			tableIdentifier: params.tableIdentifier,
			items: params.items || [],
			status: 'open',
			extras: []
		});

		await this.orderRepository.save(order);
		return order;
	}

	// ---- Order Items Management ----
	async addItem(params: {
		orderId: OrderId;
		productId: ProductId;
		quantity: number;
	}): Promise<Order> {
		const [order, product] = await Promise.all([
			this.orderRepository.findById(params.orderId),
			this.productRepository.findById(params.productId)
		]);

		if (!order) throw new Error('Order not found');
		if (!product) throw new Error('Product not found');

		order.addItem(params.productId.value, params.quantity, product.price.value);

		await this.orderRepository.save(order);
		return order;
	}

	async updateItemQuantity(params: {
		orderId: OrderId;
		productId: ProductId;
		delta: number;
	}): Promise<Order> {
		const order = await this.orderRepository.findById(params.orderId);
		if (!order) throw new Error('Order not found');

		order.updateItemQuantity(params.productId.value, params.delta);

		await this.orderRepository.save(order);
		return order;
	}

	async removeItem(params: { orderId: OrderId; productId: ProductId }): Promise<Order> {
		const order = await this.orderRepository.findById(params.orderId);
		if (!order) throw new Error('Order not found');

		order.removeItem(params.productId.value);
		await this.orderRepository.save(order);
		return order;
	}

	// ---- Discounts Management ----
	async applyDiscount(params: {
		orderId: OrderId;
		amount: number;
		reason: string;
	}): Promise<Order> {
		const order = await this.orderRepository.findById(params.orderId);
		if (!order) throw new Error('Order not found');

		order.applyDiscount(params.amount, params.reason);
		await this.orderRepository.save(order);
		return order;
	}

	async removeDiscount(params: { orderId: OrderId }): Promise<Order> {
		const order = await this.orderRepository.findById(params.orderId);
		if (!order) throw new Error('Order not found');

		order.removeDiscount();
		await this.orderRepository.save(order);
		return order;
	}

	// ---- Extras Management ----
	async addExtra(params: {
		orderId: OrderId;
		amount: number;
		description: string;
	}): Promise<Order> {
		const order = await this.orderRepository.findById(params.orderId);
		if (!order) throw new Error('Order not found');

		order.addExtra(params.amount, params.description);
		await this.orderRepository.save(order);
		return order;
	}

	async removeExtra(params: { orderId: OrderId; index: number }): Promise<Order> {
		const order = await this.orderRepository.findById(params.orderId);
		if (!order) throw new Error('Order not found');

		order.removeExtra(params.index);
		await this.orderRepository.save(order);
		return order;
	}

	// ---- Status Management ----
	async markAsPaid(params: { orderId: OrderId }): Promise<Order> {
		const order = await this.orderRepository.findById(params.orderId);
		if (!order) throw new Error('Order not found');

		order.markAsPaid();
		await this.orderRepository.save(order);
		return order;
	}

	async delete(params: { orderId: OrderId }): Promise<void> {
		await this.orderRepository.delete(params.orderId);
	}

	// ---- Query Methods ----
	async getById(params: { id: OrderId }): Promise<Order | null> {
		return this.orderRepository.findById(params.id);
	}

	async listOpen(limit?: number): Promise<Order[]> {
		return this.orderRepository.findAllOpen(limit);
	}

	async listPaid(limit?: number): Promise<Order[]> {
		return await this.orderRepository.findAllPaid(limit);
	}

	async listAll(limit?: number): Promise<Order[]> {
		return this.orderRepository.findAll(limit);
	}

	// ---- Calculations ----
	async calculateTotal(params: { orderId: OrderId }): Promise<Money> {
		const order = await this.orderRepository.findById(params.orderId);
		if (!order) throw new Error('Order not found');

		return order.calculateTotal();
	}

	async calculateSubtotal(params: { orderId: OrderId }): Promise<Money> {
		const order = await this.orderRepository.findById(params.orderId);
		if (!order) throw new Error('Order not found');

		return order.calculateSubtotal();
	}
}
