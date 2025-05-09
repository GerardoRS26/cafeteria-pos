import { Money } from '@shared/value-objects/money';

export class Extra {
	readonly amount: Money;
	readonly description: string;

	constructor(amount: Money, description: string) {
		if (!description || description.trim().length === 0) {
			throw new Error('Extra description is required');
		}
		this.amount = amount;
		this.description = description;
	}

	equals(other: Extra): boolean {
		return (
			other instanceof Extra &&
			this.amount.equals(other.amount) &&
			this.description === other.description
		);
	}
}
