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
	tableNumber: integer('table_number').notNull(),
	status: text('status', { enum: ['open', 'paid', 'cancelled'] })
		.notNull()
		.default('open'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const orderItems = sqliteTable('order_items', {
	id: text('id').primaryKey(),
	orderId: text('order_id').references(() => orders.id),
	productId: text('product_id').references(() => products.id),
	quantity: integer('quantity').notNull(),
	unitPrice: real('unit_price').notNull() // Precio en el momento de la orden
});

export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;
