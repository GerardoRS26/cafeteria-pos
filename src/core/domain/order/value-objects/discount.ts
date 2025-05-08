import { Money } from '@shared/value-objects/money';

export class Discount {
	readonly amount: Money;
	readonly reason: string;

	constructor(amount: Money, reason: string) {
		if (!reason || reason.trim().length === 0) {
			throw new Error('Discount reason is required');
		}
		this.amount = amount;
		this.reason = reason;
	}

	equals(other: Discount): boolean {
		return (
			other instanceof Discount && this.amount.equals(other.amount) && this.reason === other.reason
		);
	}
}
