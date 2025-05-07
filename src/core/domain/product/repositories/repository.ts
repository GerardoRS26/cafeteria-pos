import { Product } from '../aggregates/product';
import { ProductId } from '../value-objects/product-id';

export interface ProductRepository {
	findById(id: ProductId): Promise<Product | null>;
	findAllActive(): Promise<Product[]>;
	findAll(): Promise<Product[]>;
	save(product: Product): Promise<void>;
	delete(id: ProductId): Promise<void>;
}
