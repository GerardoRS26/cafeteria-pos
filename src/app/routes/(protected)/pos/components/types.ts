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
	unitPrice: number;
};

export type Order = {
	id: string;
	tableIdentifier: string;
	status: string;
	items: OrderItem[];
	discount?: Discount;
	extras: Extra[];
	createdAt: Date;
	updatedAt: Date;
};

export type Discount = {
	amount: number;
	reason: string;
};
export type Extra = {
	amount: number;
	description: string;
};
export type POSData = {
	products: Product[];
	user?: {
		role: 'admin' | 'seller';
	};
	paidOrders: Order[];
	openOrders: Order[];
};
