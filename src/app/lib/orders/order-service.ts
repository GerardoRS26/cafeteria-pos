import { OrderService as CoreService } from '@application/order/order-service';
import { OrderItem as ItemCore } from '@domain/order/value-objects/order-item';
import { Extra as ExtraCore } from '@domain/order/value-objects/extra';
import { Discount as DiscountCore } from '@domain/order/value-objects/discount';
import { Order as OrderCore } from '@domain/order/aggregates/order';
import { DrizzleOrderRepository } from '@domain/order/repositories/order-repository';
import { DrizzleProductRepository } from '@domain/product/repositories/product-repository';

export type OrderDiscount = {
	amount: number;
	reason: string;
};

export type OrderItem = {
	productId: string;
	quantity: number;
	unitPrice: number;
};

export type OrderExtra = {
	amount: number;
	description: string;
};

export type Order = {
	id: string;
	tableIdentifier: string;
	status: string;
	items: OrderItem[];
	discount?: OrderDiscount;
	extras: OrderExtra[];
	createdAt: Date;
	updatedAt: Date;
};

export class OrderService {
	private readonly coreService: CoreService;

	constructor() {
		this.coreService = new CoreService(
			new DrizzleOrderRepository(),
			new DrizzleProductRepository()
		);
	}

	private mapItemToApp(itemCore: ItemCore): OrderItem {
		return {
			productId: itemCore.productId.value,
			quantity: itemCore.quantity,
			unitPrice: itemCore.unitPrice.value
		};
	}

	private mapDiscountToApp(discountCore: DiscountCore): OrderDiscount {
		return {
			amount: discountCore.amount.value,
			reason: discountCore.reason
		};
	}

	private mapExtraToApp(extraCore: ExtraCore): OrderExtra {
		return {
			amount: extraCore.amount.value,
			description: extraCore.description
		};
	}

	private mapOrderToApp(orderCore: OrderCore): Order {
		return {
			id: orderCore.id.value,
			tableIdentifier: orderCore.tableIdentifier,
			status: orderCore.status.value,
			createdAt: orderCore.createdAt,
			updatedAt: orderCore.updatedAt,
			items: orderCore.getItems().length ? orderCore.getItems().map(this.mapItemToApp) : [],
			discount:
				orderCore.discount === undefined ? undefined : this.mapDiscountToApp(orderCore.discount),
			extras: orderCore.getExtras().length ? orderCore.getExtras().map(this.mapExtraToApp) : []
		};
	}

	async listOpen(limit?: number): Promise<Order[]> {
		const orders = await this.coreService.listOpen(limit);
		return orders.map(this.mapOrderToApp.bind(this));
	}

	async listPaid(limit?: number): Promise<Order[]> {
		const orders = await this.coreService.listPaid(limit);
		return orders.map(this.mapOrderToApp.bind(this));
	}

	async create(tableIdentifier: string): Promise<Order> {
		const order = await this.coreService.create(tableIdentifier);
		return this.mapOrderToApp(order);
	}
}
