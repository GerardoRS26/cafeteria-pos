import { Order } from '@domain/order/aggregates/order';
import type { OrderRepository } from '@domain/order/repositories/repository';
import type { ProductRepository } from '@domain/product/repositories/repository';
import { OrderId } from '@domain/order/value-objects/order-id';
import { ProductId } from '@domain/product/value-objects/product-id';
import { Money } from '@shared/value-objects/money';
import { time } from 'console';
import { Discount } from '@domain/order/value-objects/discount';
import { OrderItem } from '@domain/order/value-objects/order-item';
import { or } from 'drizzle-orm';
import { Extra } from '@domain/order/value-objects/extra';

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
			items: params.items
				? params.items.map(
						(item) =>
							new OrderItem(new ProductId(item.productId), item.quantity, new Money(item.unitPrice))
					)
				: [],
			status: 'open',
			extras: []
		});

		await this.orderRepository.save(order);
		return order;
	}

	async delete(orderId: string): Promise<void> {
		await this.orderRepository.delete(new OrderId(orderId));
	}

	async update(params: {
		orderId: OrderId;
		tableIdentifier?: string;
		items?: Array<{
			productId: string;
			quantity: number;
			unitPrice: number;
		}>;
		status?: 'open' | 'paid';
		discount?: {
			amount: number;
			reason: string;
		} | null;
		extras?: Array<{
			amount: number;
			description: string;
		}>;
	}): Promise<Order> {
		const order = await this.orderRepository.findById(params.orderId);
		if (!order) {
			throw new Error('Order not found');
		}

		// Clonar el estado actual para validación
		const updatedOrder = new Order({
			id: order.id,
			tableIdentifier: params.tableIdentifier ?? order.tableIdentifier,
			items: params.items ?? order.getItems(),
			status: params.status ?? order.status,
			discount:
				params.discount !== undefined
					? params.discount
						? new Discount(new Money(params.discount.amount), params.discount.reason)
						: undefined
					: order.discount,
			extras: params.extras
				? params.extras.map((extra) => new Extra(new Money(extra.amount), extra.description))
				: order.getExtras()
		});

		if (order.equals(updatedOrder)) {
			return order;
		}

		// Validar el estado completo del agregado
		this.validateOrder(updatedOrder);

		if (params.items !== undefined) {
			order.getItems().forEach((item) => {
				order.removeItem(item.productId.value);
			});
			params.items.forEach((item) => order.addItem(item.productId, item.quantity, item.unitPrice));
		}

		if (order.status.isOpen() && params.status === 'paid') order.markAsPaid();

		if (params.discount !== undefined) {
			if (params.discount) {
				order.applyDiscount(params.discount.amount, params.discount.reason);
			} else {
				order.removeDiscount();
			}
		}

		if (params.extras !== undefined) {
			order.getExtras().forEach((extra, index) => {
				order.removeExtra(index);
			});

			params.extras.forEach((extra) => order.addExtra(extra.amount, extra.description));
		}

		await this.orderRepository.save(order);
		return order;
	}

	private validateOrder(order: Order): void {
		// 1. Validaciones básicas de la orden
		if (!order.tableIdentifier.trim()) {
			throw new Error('Table identifier is required');
		}

		// 2. Validaciones de estado
		if (order.status.isPaid() && order.getItems().length === 0) {
			throw new Error('Cannot pay an empty order');
		}

		// 3. Validaciones de items
		for (const item of order.getItems()) {
			if (item.quantity <= 0) {
				throw new Error(`Item ${item.productId} must have quantity greater than 0`);
			}

			if (item.unitPrice.value <= 0) {
				throw new Error(`Item ${item.productId} must have a positive unit price`);
			}
		}

		// 4. Validaciones de descuento
		if (order.discount) {
			if (order.discount.amount.value <= 0) {
				throw new Error('Discount amount must be positive');
			}

			const subtotal = order.calculateSubtotal().value;
			if (order.discount.amount.value > subtotal) {
				throw new Error(
					`Discount (${order.discount.amount.value}) cannot be greater than subtotal (${subtotal})`
				);
			}

			// Validar que el descuento no sea mayor que el total con extras
			const totalBeforeDiscount = order.calculateTotalBeforeDiscounts().value;
			if (order.discount.amount.value > totalBeforeDiscount) {
				throw new Error(
					`Discount (${order.discount.amount.value}) cannot be greater than order total before discount (${totalBeforeDiscount})`
				);
			}
		}

		// 5. Validaciones de extras
		for (const extra of order.getExtras()) {
			if (extra.amount.value <= 0) {
				throw new Error('Extra amount must be positive');
			}
		}

		// 7. Validación de total no negativo
		const total = order.calculateTotal().value;
		if (total < 0) {
			throw new Error('Order total cannot be negative');
		}

		// 8. Validación de fechas (si aplica)
		if (order.updatedAt && order.updatedAt < order.createdAt) {
			throw new Error('Closed date cannot be before creation date');
		}
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

	// ---- Query Methods ----
	async getById(params: { id: OrderId }): Promise<Order | null> {
		return this.orderRepository.findById(params.id);
	}

	async listOpen(limit?: number): Promise<Order[]> {
		const orders = await this.orderRepository.findAllOpen(limit);
		console.log('Orders service before Return', { orders });
		return orders; // this.orderRepository.findAllOpen(limit);
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
