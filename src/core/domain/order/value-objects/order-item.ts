import { ProductId } from '@domain/product/value-objects/product-id';
import { Money } from '@shared/value-objects/money';

export class OrderItem {
	readonly productId: ProductId;
	readonly quantity: number;
	readonly unitPrice: Money;

	constructor(productId: ProductId, quantity: number, unitPrice: Money) {
		if (quantity <= 0) {
			throw new Error('Quantity must be greater than zero');
		}
		this.productId = productId;
		this.quantity = quantity;
		this.unitPrice = unitPrice;
	}

	public getTotalPrice(): Money {
		return new Money(this.unitPrice.value * this.quantity);
	}

	public updateQuantity(newQuantity: number): OrderItem {
		return new OrderItem(this.productId, newQuantity, this.unitPrice);
	}
}
