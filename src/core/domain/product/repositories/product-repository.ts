import type { ProductRepository } from '@domain/product/repositories/repository';
import { Product } from '@domain/product/aggregates/product';
import { ProductId } from '@domain/product/value-objects/product-id';
import { db } from '@infrastructure/db/drizzle/client';
import { products, type Product as ProductEntity } from '@infrastructure/db/drizzle/schema';
import { eq } from 'drizzle-orm';
import { Money } from '@shared/value-objects/money';

export class DrizzleProductRepository implements ProductRepository {
	async findById(id: ProductId): Promise<Product | null> {
		const result = await db.select().from(products).where(eq(products.id, id.value)).get();
		return result ? this.toDomain(result) : null;
	}

	async findAll(): Promise<Product[]> {
		const results = await db.select().from(products).all();
		return results.map(this.toDomain);
	}

	async findAllActive(): Promise<Product[]> {
		const results = await db.select().from(products).where(eq(products.isActive, true)).all();
		return results.map(this.toDomain);
	}

	async save(product: Product): Promise<void> {
		const data = this.toPersistence(product);
		await db
			.insert(products)
			.values(data)
			.onConflictDoUpdate({ target: products.id, set: data })
			.run();
	}

	async delete(id: ProductId): Promise<void> {
		await db.delete(products).where(eq(products.id, id.value)).run();
	}

	// ---- Helpers ----
	private toDomain(raw: ProductEntity): Product {
		return new Product({
			id: new ProductId(raw.id),
			name: raw.name,
			description: raw.description ?? '',
			price: new Money(raw.price),
			cost: new Money(raw.cost),
			isActive: raw.isActive
		});
	}

	private toPersistence(product: Product): ProductEntity {
		return {
			id: product.id.value,
			name: product.name,
			description: product.description,
			price: product.price.value,
			cost: product.cost.value,
			isActive: product.isActive,
			createdAt: new Date()
		};
	}
}
