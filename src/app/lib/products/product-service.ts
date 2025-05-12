import { ProductService as CoreService } from '@application/product/product-service';
import { Product as ProductCore } from '@domain/product/aggregates/product';
import { DrizzleProductRepository } from '@domain/product/repositories/product-repository';
import { ProductId } from '@domain/product/value-objects/product-id';
import { Money } from '@shared/value-objects/money';

export type Product = {
	id: string;
	name: string;
	description: string;
	isActive: boolean;
	cost: number;
	price: number;
};

export class ProductService {
	private coreService: CoreService;
	constructor() {
		this.coreService = new CoreService(new DrizzleProductRepository());
	}

	private mapToApp(coreProduct: ProductCore): Product {
		return {
			id: coreProduct.id.value,
			name: coreProduct.name,
			description: coreProduct.description,
			isActive: coreProduct.isActive,
			cost: coreProduct.cost.value,
			price: coreProduct.price.value
		};
	}

	private mapToCore(product: Product) {
		return new ProductCore({
			...product,
			id: new ProductId(product.id),
			cost: new Money(product.cost),
			price: new Money(product.price)
		});
	}

	async listAll(): Promise<Product[]> {
		const coreData = await this.coreService.listAll();
		return coreData.map(this.mapToApp);
	}

	async listActive(): Promise<Product[]> {
		const coreData = await this.coreService.listActive();
		return coreData.map(this.mapToApp);
	}

	async deactivate(id: string): Promise<void> {
		await this.coreService.deactivate(new ProductId(id));
	}

	async toggleStatus(id: string): Promise<void> {
		await this.coreService.toggleStatus(new ProductId(id));
	}

	async getById(id: string): Promise<Product | null> {
		const product = await this.coreService.getById(new ProductId(id));
		return product ? this.mapToApp(product) : null;
	}

	async create(params: {
		id: string;
		name: string;
		description: string;
		price: number;
		cost: number;
	}): Promise<void> {
		await this.coreService.create({
			...params,
			id: new ProductId(params.id),
			price: new Money(params.price),
			cost: new Money(params.cost)
		});
	}

	async update(
		id: string,
		params: Partial<{
			name: string;
			description: string;
			price: number;
			cost: number;
		}>
	): Promise<void> {
		console.log('params.price === undefined', params.price === undefined, { price: params.price });
		await this.coreService.update(new ProductId(id), {
			...params,
			price: params.price === undefined ? undefined : new Money(params.price),
			cost: params.cost === undefined ? undefined : new Money(params.cost)
		});
	}
}
