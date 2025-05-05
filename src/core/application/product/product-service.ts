import { Product } from '@domain/product/aggregates/product';
import type { ProductRepository } from '@domain/product/repositories/product-repository';
import { ProductId } from '@domain/product/value-objects/product-id';
import { Money } from '@domain/product/value-objects/money';

/**
 * Handles all product use cases.
 * @class
 */
export class ProductService {
	constructor(private readonly repository: ProductRepository) {}

	// ---- CRUD Operations ----
	async create(params: {
		id: ProductId;
		name: string;
		description: string;
		price: Money;
		cost: Money;
	}): Promise<void> {
		if (await this.repository.findById(params.id)) {
			throw new Error('Product already exists');
		}
		const product = new Product({ ...params, isActive: true });
		await this.repository.save(product);
	}

	async update(
		id: ProductId,
		params: Partial<{
			name: string;
			description: string;
			price: Money;
			cost: Money;
		}>
	): Promise<void> {
		const product = await this.repository.findById(id);
		if (!product) throw new Error('Product not found');

		if (params.name) product.name = params.name;
		if (params.description) product.description = params.description;
		if (params.price) product.price = params.price;
		if (params.cost) product.cost = params.cost;

		await this.repository.save(product);
	}

	// ---- Status Management ----
	async deactivate(id: ProductId): Promise<void> {
		const product = await this.repository.findById(id);
		if (!product) throw new Error('Product not found');
		product.deactivate();
		await this.repository.save(product);
	}

	async activate(id: ProductId): Promise<void> {
		const product = await this.repository.findById(id);
		if (!product) throw new Error('Product not found');
		product.isActive = true;
		await this.repository.save(product);
	}

	// ---- Query Methods ----
	async getById(id: ProductId): Promise<Product | null> {
		return this.repository.findById(id);
	}

	async listActive(): Promise<Product[]> {
		return this.repository.findAllActive();
	}

	async listInactive(): Promise<Product[]> {
		const allProducts = await this.repository.findAll();
		return allProducts.filter((p) => !p.isActive);
	}

	async listAll(): Promise<Product[]> {
		return await this.repository.findAll();
	}

	async toggleStatus(id: ProductId): Promise<void> {
		const product = await this.repository.findById(id);
		if (!product) throw new Error('Producto no encontrado');

		product.isActive ? product.deactivate() : product.activate();
		await this.repository.save(product);
	}
}
