import { OrderId } from '../value-objects/order-id';
import { OrderStatus } from '../value-objects/order-status';
import { OrderItem } from '../value-objects/order-item';
import { Discount } from '../value-objects/discount';
import { Extra } from '../value-objects/extra';
import { Money } from '@shared/value-objects/money';
import { ProductId } from '@domain/product/value-objects/product-id';

export class Order {
	readonly id: OrderId;
	readonly tableIdentifier: string;
	status: OrderStatus;
	private readonly items: OrderItem[];
	discount?: Discount;
	private extras: Extra[];
	readonly createdAt: Date;
	updatedAt: Date;

	constructor(params: {
		id: OrderId;
		tableIdentifier: string;
		items: OrderItem[];
		status: OrderStatus;
		discount?: Discount;
		extras: Extra[];
		createdAt?: Date;
		updatedAt?: Date;
	}) {
		this.id = new OrderId(params.id.value);

		this.tableIdentifier = params.tableIdentifier;
		this.status = new OrderStatus(params.status.value);
		this.items = params.items.length
			? params.items.map(
					(item) =>
						new OrderItem(
							new ProductId(item.productId.value),
							item.quantity,
							new Money(item.unitPrice.value)
						)
				)
			: [];

		this.discount = params.discount
			? new Discount(new Money(params.discount.amount.value), params.discount.reason)
			: undefined;

		this.extras = params.extras.length
			? params.extras.map((extra) => new Extra(new Money(extra.amount.value), extra.description))
			: [];

		this.createdAt = params.createdAt ?? new Date();
		this.updatedAt = params.updatedAt ?? new Date();
	}

	// Getters

	public getItems(): OrderItem[] {
		return [...this.items];
	}

	public getExtras(): Extra[] {
		return [...this.extras];
	}

	// Domain Logic
	public calculateSubtotal(): Money {
		const itemsTotal = this.items.reduce((sum, item) => sum + item.getTotalPrice().value, 0);
		return new Money(itemsTotal);
	}

	public calculateTotalBeforeDiscounts(): Money {
		const subtotal = this.calculateSubtotal().value;
		const extrasTotal = this.extras.reduce((sum, extra) => sum + extra.amount.value, 0);
		return new Money(subtotal + extrasTotal);
	}

	public calculateTotal(): Money {
		this.validateAndAdjustDiscount();

		const totalBeforeDiscounts = this.calculateTotalBeforeDiscounts().value;
		const discountAmount = this.discount?.amount.value || 0;

		return new Money(Math.max(0, totalBeforeDiscounts - discountAmount));
	}

	public addItem(productId: string, quantity: number, unitPrice: number): void {
		if (!this.status.isOpen()) {
			throw new Error('Cannot add items to a closed order');
		}

		if (quantity <= 0) {
			throw new Error('Quantity must be positive');
		}

		if (unitPrice < 0) {
			throw new Error('Unit price cannot be negative');
		}

		const existingItemIndex = this.items.findIndex((item) =>
			item.productId.equals(new ProductId(productId))
		);

		if (existingItemIndex >= 0) {
			const existingItem = this.items[existingItemIndex];
			this.items[existingItemIndex] = existingItem.updateQuantity(existingItem.quantity + quantity);
		} else {
			this.items.push(new OrderItem(new ProductId(productId), quantity, new Money(unitPrice)));
		}

		this.updatedAt = new Date();
	}

	public applyDiscount(amount: number, reason: string): void {
		if (!this.status.isOpen()) {
			throw new Error('Cannot apply discount to a closed order');
		}

		if (amount <= 0) {
			throw new Error('Discount amount must be positive');
		}

		const totalBeforeDiscounts = this.calculateTotalBeforeDiscounts().value;
		if (amount > totalBeforeDiscounts) {
			throw new Error(
				`Discount (${amount}) cannot be greater than order total before discounts (${totalBeforeDiscounts})`
			);
		}

		if (!reason || reason.trim().length === 0) {
			throw new Error('Discount reason is required');
		}

		this.discount = new Discount(new Money(amount), reason);
		this.updatedAt = new Date();
	}

	public updateItemQuantity(productId: string, delta: number): void {
		if (!this.status.isOpen()) {
			throw new Error('Cannot modify items in a closed order');
		}

		const itemIndex = this.items.findIndex((item) =>
			item.productId.equals(new ProductId(productId))
		);

		if (itemIndex === -1) {
			throw new Error('Item not found in order');
		}

		const newQuantity = this.items[itemIndex].quantity + delta;
		if (newQuantity <= 0) {
			this.items.splice(itemIndex, 1);
		} else {
			this.items[itemIndex] = this.items[itemIndex].updateQuantity(newQuantity);
		}

		this.updatedAt = new Date();
	}

	public removeItem(productId: string): void {
		if (!this.status.isOpen()) {
			throw new Error('Cannot remove items from a closed order');
		}

		const itemIndex = this.items.findIndex((item) =>
			item.productId.equals(new ProductId(productId))
		);

		if (itemIndex === -1) {
			throw new Error('Item not found in order');
		}

		this.items.splice(itemIndex, 1);
		this.updatedAt = new Date();

		this.validateAndAdjustDiscount();
	}

	public removeDiscount(): void {
		if (!this.status.isOpen()) {
			throw new Error('Cannot remove discount from a closed order');
		}

		this.discount = undefined;
		this.updatedAt = new Date();
	}

	public addExtra(amount: number, description: string): void {
		if (!this.status.isOpen()) {
			throw new Error('Cannot add extras to a closed order');
		}

		if (amount <= 0) {
			throw new Error('Extra amount must be positive');
		}

		if (!description || description.trim().length === 0) {
			throw new Error('Extra description is required');
		}

		this.extras.push(new Extra(new Money(amount), description));
		this.updatedAt = new Date();
	}

	public removeExtra(index: number): void {
		if (!this.status.isOpen()) {
			throw new Error('Cannot remove extras from a closed order');
		}

		if (index < 0 || index >= this.extras.length) {
			throw new Error('Invalid extra index');
		}

		// Eliminamos el extra
		this.extras.splice(index, 1);
		this.updatedAt = new Date();

		// Verificamos si el descuento sigue siendo válido
		this.validateAndAdjustDiscount();
	}

	private validateAndAdjustDiscount(): void {
		if (!this.discount) return;

		const totalBeforeDiscounts = this.calculateTotalBeforeDiscounts().value;
		const currentDiscount = this.discount.amount.value;

		if (currentDiscount > totalBeforeDiscounts) {
			// Ajustamos el descuento al máximo permitido
			this.discount = new Discount(new Money(totalBeforeDiscounts), this.discount.reason);
			this.updatedAt = new Date();
		}
	}

	public markAsPaid(): void {
		if (!this.status.isOpen()) {
			throw new Error('Order is not open');
		}

		this.status = new OrderStatus('paid');
		this.updatedAt = new Date();
	}

	// ... otros métodos existentes

	equals(other: Order): boolean {
		if (!other) return false;
		if (!(other instanceof Order)) return false;

		// Comparación básica de identificador
		if (!this.id.equals(other.id)) return false;

		// Comparación de propiedades principales
		if (this.tableIdentifier !== other.tableIdentifier) return false;
		if (this.status !== other.status) return false;

		// Comparación de descuento
		if ((this.discount && !other.discount) || (!this.discount && other.discount)) {
			return false;
		}
		if (this.discount && other.discount && !this.discount.equals(other.discount)) {
			return false;
		}

		// Comparación de items
		if (this.items.length !== other.items.length) return false;
		for (let i = 0; i < this.items.length; i++) {
			if (!this.items[i].equals(other.items[i])) {
				return false;
			}
		}

		// Comparación de extras
		if (this.extras.length !== other.extras.length) return false;
		for (let i = 0; i < this.extras.length; i++) {
			if (!this.extras[i].equals(other.extras[i])) {
				return false;
			}
		}

		// Nota: Fechas (createdAt, updatedAt, closedAt) son deliberadamente omitidas

		return true;
	}
}
