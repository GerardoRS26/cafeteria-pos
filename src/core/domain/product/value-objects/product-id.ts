export class ProductId {
	constructor(public readonly value: string) {
		if (!value) throw new Error('Product ID cannot be empty');
	}

	equals(other: ProductId): boolean {
		return this.value === other.value;
	}

	toString(): string {
		return this.value;
	}
}
