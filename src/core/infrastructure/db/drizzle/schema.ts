import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	role: text('role').notNull().default('seller'), // 'seller' o 'admin'
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const products = sqliteTable('products', {
	id: text('id').primaryKey(), // UUID
	name: text('name').notNull(),
	description: text('description'),
	price: real('price').notNull(), // Precio con decimales
	cost: real('cost').notNull(), // Costo con decimales
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const orders = sqliteTable('orders', {
	id: text('id').primaryKey(),
	tableIdentifier: text('tableIdentifier').notNull(),
	status: text('status', { enum: ['open', 'paid'] })
		.notNull()
		.default('open'),
	discountAmount: real('discount_amount'),
	discountReason: text('discount_reason'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const orderExtras = sqliteTable('order_extras', {
	id: text('id').primaryKey(),
	orderId: text('order_id')
		.notNull()
		.references(() => orders.id),
	amount: real('amount').notNull(),
	description: text('description').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const orderItems = sqliteTable('order_items', {
	id: text('id').primaryKey(),
	orderId: text('order_id')
		.notNull()
		.references(() => orders.id),
	productId: text('product_id')
		.notNull()
		.references(() => products.id),
	quantity: integer('quantity').notNull(),
	unitPrice: real('unit_price').notNull()
});

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;

export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Orders = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type orderExtras = typeof orderExtras.$inferSelect;
