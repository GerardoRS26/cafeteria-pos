import { Order } from '../aggregates/order';
import { OrderId } from '../value-objects/order-id';

export interface OrderRepository {
	save(order: Order): Promise<void>;
	findById(id: OrderId): Promise<Order | null>;
	findAllOpen(limit?: number): Promise<Order[]>;
	findAllPaid(limit?: number): Promise<Order[]>;
	findAll(limit?: number): Promise<Order[]>;
	delete(id: OrderId): Promise<void>;
}
