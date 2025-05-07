import { OrderId } from '../value-objects/order-id';
import { OrderStatus, type OrderStates } from '../value-objects/order-status';
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
		id: string | OrderId;
		tableIdentifier: string;
		items: { productId: string; quantity: number; unitPrice: number }[] | OrderItem[];
		status: string | OrderStatus;
		discount?: { amount: number; reason: string } | Discount;
		extras: { amount: number; description: string }[] | Extra[];
		createdAt?: Date;
		updatedAt?: Date;
	}) {
		this.id = params.id instanceof OrderId ? params.id : new OrderId(params.id);
		this.tableIdentifier = params.tableIdentifier;
		this.status =
			params.status instanceof OrderStatus
				? params.status
				: new OrderStatus((params.status ?? 'open') as OrderStates);

		this.items = params.items.map((item) =>
			item instanceof OrderItem
				? new OrderItem(item.productId, item.quantity, item.unitPrice)
				: new OrderItem(new ProductId(item.productId), item.quantity, new Money(item.unitPrice))
		);

		this.discount = params.discount
			? params.discount instanceof Discount
				? new Discount(params.discount.amount, params.discount.reason)
				: new Discount(new Money(params.discount.amount), params.discount.reason)
			: undefined;

		this.extras = params.extras.map((extra) =>
			extra instanceof Extra
				? new Extra(extra.amount, extra.description)
				: new Extra(new Money(extra.amount), extra.description)
		);

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
}
