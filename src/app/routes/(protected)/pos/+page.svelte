<script lang="ts">
	import OrdersList from './components/OrdersList.svelte';
	import OrderDetail from './components/OrderDetail.svelte';
	import ProductsList from './components/ProductsList.svelte';
	import type { POSData, Order, Product } from './components/types';

	const { data } = $props<POSData>();

	// State management
	let orders = $state<Order[]>([]);
	let activeOrder = $state<Order | null>(null);

	// Functions
	function createOrder(table: string) {
		const newOrder: Order = {
			id: crypto.randomUUID(),
			table,
			items: [],
			closed: false,
			createdAt: new Date()
		};
		orders.push(newOrder);
		activeOrder = orders[orders.length - 1];
	}

	function setActiveOrder(order: Order) {
		activeOrder = order;
	}

	function addProduct(product: Product) {
		if (!activeOrder) return;

		const existingItem = activeOrder.items.find((item) => item.product.id === product.id);

		if (existingItem) {
			existingItem.quantity += 1;
		} else {
			activeOrder.items.push({
				product,
				quantity: 1,
				notes: ''
			});
		}
	}

	function updateItemQuantity(index: number, delta: number) {
		if (!activeOrder) return;
		activeOrder.items[index].quantity += delta;
	}

	function removeItem(index: number) {
		if (!activeOrder) return;
		activeOrder.items.splice(index, 1);
	}

	function closeOrder() {
		if (!activeOrder) return;
		activeOrder.closedAt = new Date();
		activeOrder.closed = true;
		activeOrder = null;
	}
</script>

<div class="page-container">
	<h1 class="page-title">Punto de Venta</h1>

	<main class="pos-grid">
		<OrdersList {data} {orders} {activeOrder} {createOrder} {setActiveOrder} />

		<OrderDetail {activeOrder} {closeOrder} {updateItemQuantity} {removeItem} />

		<ProductsList products={data.products} {addProduct} />
	</main>
</div>

<style>
	.page-container {
		max-width: none;
	}
	.pos-grid {
		display: grid;
		grid-template-columns: 25% 35% 40%;
		height: calc(100vh - 70px);
		overflow: hidden;
	}

	/* Responsive styles */
	@media (max-width: 1200px) {
		.pos-grid {
			grid-template-columns: 1fr 1fr;
		}

		.products-column {
			grid-column: span 2;
			height: 40vh;
			overflow-y: auto;
		}
	}

	@media (max-width: 768px) {
		.pos-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
