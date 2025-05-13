import { db } from '@infrastructure/db/drizzle/client';
import { orders, orderItems, orderExtras } from '@infrastructure/db/drizzle/schema';
import { eq } from 'drizzle-orm';
import type { OrderRepository } from '@domain/order/repositories/repository';
import { Order } from '@domain/order/aggregates/order';
import { OrderId } from '@domain/order/value-objects/order-id';
import { OrderStatus } from '@domain/order/value-objects/order-status';
import { OrderItem } from '@domain/order/value-objects/order-item';
import { Discount } from '@domain/order/value-objects/discount';
import { Extra } from '@domain/order/value-objects/extra';
import { ProductId } from '@domain/product/value-objects/product-id';
import { Money } from '@shared/value-objects/money';

export class DrizzleOrderRepository implements OrderRepository {
	async save(order: Order): Promise<void> {
		const dbOrder = this.toPersistence(order);

		// Usamos transacción para asegurar consistencia
		await db.transaction(async (tx) => {
			// Upsert para la orden principal
			await tx.insert(orders).values(dbOrder.order).onConflictDoUpdate({
				target: orders.id,
				set: dbOrder.order
			});

			// Eliminar items existentes para reemplazarlos
			await tx.delete(orderItems).where(eq(orderItems.orderId, order.id.value));

			// Insertar nuevos items
			if (dbOrder.items.length > 0) {
				await tx.insert(orderItems).values(dbOrder.items);
			}

			// Eliminar extras existentes para reemplazarlos
			await tx.delete(orderExtras).where(eq(orderExtras.orderId, order.id.value));

			// Insertar nuevos extras
			if (dbOrder.extras.length > 0) {
				await tx.insert(orderExtras).values(dbOrder.extras);
			}
		});
	}

	async findById(id: OrderId): Promise<Order | null> {
		const orderId = id.value;

		// Obtenemos la orden principal
		const [dbOrder] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);

		if (!dbOrder) return null;

		// Obtenemos los items de la orden
		const dbItems = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

		// Obtenemos los extras de la orden
		const dbExtras = await db.select().from(orderExtras).where(eq(orderExtras.orderId, orderId));

		return this.toDomain({
			order: dbOrder[0],
			items: dbItems,
			extras: dbExtras
		});
	}

	async findAll(limit?: number): Promise<Order[]> {
		const query =
			limit !== undefined && limit > 0
				? db.select().from(orders).limit(limit)
				: db.select().from(orders);

		const dbOrders = await query;

		return Promise.all(
			dbOrders.map(async (dbOrder) => {
				return this.getOrderWithRelations(dbOrder.id);
			})
		);
	}

	async findAllOpen(limit?: number): Promise<Order[]> {
		const query =
			limit !== undefined && limit > 0
				? db.select().from(orders).where(eq(orders.status, 'open')).limit(limit)
				: db.select().from(orders).where(eq(orders.status, 'open'));

		const dbOrders = await query;

		return Promise.all(
			dbOrders.map(async (dbOrder) => {
				return this.getOrderWithRelations(dbOrder.id);
			})
		);
	}

	async findAllPaid(limit?: number): Promise<Order[]> {
		const query =
			limit !== undefined && limit > 0
				? db.select().from(orders).where(eq(orders.status, 'paid')).limit(limit)
				: db.select().from(orders).where(eq(orders.status, 'paid'));

		const dbOrders = await query;

		return Promise.all(
			dbOrders.map(async (dbOrder) => {
				return this.getOrderWithRelations(dbOrder.id);
			})
		);
	}

	async delete(id: OrderId): Promise<void> {
		await db.delete(orders).where(eq(orders.id, id.value)).run();
	}

	// Nuevo método helper para cargar relaciones
	private async getOrderWithRelations(orderId: string): Promise<Order> {
		const [dbItems, dbExtras, [dbOrder]] = await Promise.all([
			db.select().from(orderItems).where(eq(orderItems.orderId, orderId)),
			db.select().from(orderExtras).where(eq(orderExtras.orderId, orderId)),
			db.select().from(orders).where(eq(orders.id, orderId)).limit(1)
		]);

		const mapped = this.toDomain({
			order: dbOrder,
			items: dbItems,
			extras: dbExtras
		});
		return mapped;
	}

	// ---- Mapeadores ----
	private toDomain(data: {
		order: typeof orders.$inferSelect;
		items: (typeof orderItems.$inferSelect)[];
		extras: (typeof orderExtras.$inferSelect)[];
	}): Order {
		return new Order({
			id: new OrderId(data.order.id),
			tableIdentifier: data.order.tableIdentifier,
			status: new OrderStatus(data.order.status),
			items: data.items.map(
				(item) =>
					new OrderItem(new ProductId(item.productId), item.quantity, new Money(item.unitPrice))
			),
			discount:
				data.order.discountAmount && data.order.discountReason
					? new Discount(new Money(data.order.discountAmount), data.order.discountReason)
					: undefined,
			extras: data.extras.map((extra) => new Extra(new Money(extra.amount), extra.description)),
			createdAt: new Date(data.order.createdAt),
			updatedAt: new Date(data.order.updatedAt)
		});
	}

	private toPersistence(order: Order): {
		order: typeof orders.$inferInsert;
		items: (typeof orderItems.$inferInsert)[];
		extras: (typeof orderExtras.$inferInsert)[];
	} {
		const discount = order.discount;

		return {
			order: {
				id: order.id.value,
				tableIdentifier: order.tableIdentifier,
				status: order.status.value,
				discountAmount: discount?.amount.value || null,
				discountReason: discount?.reason || null,
				createdAt: order.createdAt,
				updatedAt: order.updatedAt
			},
			items: order.getItems().map((item) => ({
				id: crypto.randomUUID(), // ID generado para el item
				orderId: order.id.value,
				productId: item.productId.value,
				quantity: item.quantity,
				unitPrice: item.unitPrice.value
			})),
			extras: order.getExtras().map((extra) => ({
				id: crypto.randomUUID(), // ID generado para el extra
				orderId: order.id.value,
				amount: extra.amount.value,
				description: extra.description,
				createdAt: order.updatedAt // Usamos updatedAt de la orden
			}))
		};
	}
}
