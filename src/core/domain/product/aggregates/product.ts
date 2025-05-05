import { ProductId } from '../value-objects/product-id';
import { Money } from '../value-objects/money';

/**
 * Represents a product in the point-of-sale system.
 * @class
 * @aggregate
 */
export class Product {
	public readonly id: ProductId;
	public description: string;
	public isActive: boolean = true;
	public cost: Money;

	private _name: string;
	private _price: Money;

	/**
	 * Creates a new Product.
	 * @param params - Product properties.
	 * @throws {Error} If name is too short or price is below cost.
	 */
	constructor(params: {
		id: ProductId;
		name: string;
		description: string;
		price: Money;
		cost: Money;
		isActive?: boolean;
	}) {
		this.id = params.id;
		this.description = params.description;
		this._name = this._validateName(params.name);
		this._price = params.price;
		this.cost = params.cost;
		this._validatePriceNotBelowCost();
		this.isActive = params.isActive ?? false;
	}

	// --- Public Accessors ---
	/**
	 * Product name (validated on set).
	 * @throws {Error} If name is shorter than 3 characters.
	 */
	get name(): string {
		return this._name;
	}

	set name(newName: string) {
		this._name = this._validateName(newName);
	}

	/**
	 * Current selling price.
	 * @throws {Error} If set below cost.
	 */
	get price(): Money {
		return this._price;
	}

	set price(newPrice: Money) {
		this._price = newPrice;
		this._validatePriceNotBelowCost();
	}

	/**
	 * Current selling price.
	 * @throws {Error} If set below cost.
	 */

	// --- Behaviors ---
	/**
	 * Deactivates the product (soft delete).
	 */
	deactivate(): void {
		this.isActive = false;
	}
	activate(): void {
		this.isActive = true;
	}
	// --- Validations ---
	/**
	 * Validates the product name meets business rules.
	 * @private
	 * @throws {Error} If name is invalid.
	 */
	private _validateName(name: string): string {
		if (name.length < 3) throw new Error('Product name must be at least 3 characters');
		return name;
	}

	/**
	 * Ensures price is never below cost.
	 * @private
	 * @throws {Error} If price is invalid.
	 */
	private _validatePriceNotBelowCost(): void {
		if (this._price.lessThan(this.cost)) {
			throw new Error('Price cannot be below cost');
		}
	}
}
