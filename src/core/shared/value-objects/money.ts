/**
 * Immutable monetary value with precision handling.
 * @class
 */
export class Money {
	private readonly amount: number;

	constructor(amount: number) {
		if (amount < 0) throw new Error('Price cannot be negative');
		this.amount = Number(amount.toFixed(2));
	}

	public add(other: Money): Money {
		return new Money(this.amount + other.amount);
	}

	public subtract(other: Money): Money {
		return new Money(this.amount - other.amount);
	}

	public lessThan(other: Money): boolean {
		return this.amount < other.amount;
	}

	get value(): number {
		return this.amount;
	}
}
