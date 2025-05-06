export type Product = {
	id: string;
	name: string;
	price: number;
	isActive: boolean;
	description?: string;
};

export type OrderItem = {
	product: Product;
	quantity: number;
	notes: string;
};

export type Order = {
	id: string;
	table: string;
	items: OrderItem[];
	closed: boolean;
	createdAt: Date;
	closedAt: Date;
};

export type POSData = {
	products: Product[];
	user?: {
		role: 'admin' | 'seller';
	};
};
