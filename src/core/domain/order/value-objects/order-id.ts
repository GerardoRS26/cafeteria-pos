export class OrderId {
	readonly value: string;

	constructor(value: string) {
		if (!value) {
			throw new Error('Order ID is required');
		}
		this.value = value;
	}

	public equals(other: OrderId): boolean {
		return this.value === other.value;
	}
}
