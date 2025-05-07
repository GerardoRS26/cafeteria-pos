export type OrderStates = 'open' | 'paid';

export class OrderStatus {
	readonly value: OrderStates;

	constructor(value: OrderStates) {
		if (!value) {
			throw new Error('Order status is required');
		}
		this.value = value;
	}

	public isOpen(): boolean {
		return this.value === 'open';
	}

	public isPaid(): boolean {
		return this.value === 'paid';
	}
}
