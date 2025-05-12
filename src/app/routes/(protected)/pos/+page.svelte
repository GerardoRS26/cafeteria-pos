<script lang="ts">
	import OrdersList from './components/OrdersList.svelte';
	import OrderDetail from './components/OrderDetail.svelte';
	import ProductsList from './components/ProductsList.svelte';
	import type { Order, Product } from './components/types';

	const { data } = $props();

	console.log({ data });
	// State management
	let orders = $state<Order[]>([...(data.openOrders ?? []), ...(data.paidOrders || [])]);
	let activeOrder = $state<Order | null>(null);
	let formError = $state<string | null>(null);

	$inspect({ orders });

	// Función optimista para crear orden
	async function handleCreateOrder(order: Order) {
		const tableIdentifier = formData.get('tableIdentifier') as string;
		const newOrder: Order = {
			id: crypto.randomUUID(),
			tableIdentifier,
			items: [],
			status: 'open',
			createdAt: new Date()
		};

		// Actualización optimista
		orders.push(newOrder);
		activeOrder = newOrder;
	}

	// Función optimista para cerrar orden
	async function handleCloseOrder(formData: FormData) {
		if (!activeOrder) return;

		// Actualización optimista
		activeOrder.updatedAt = new Date();
		activeOrder.status = 'closed';
		const closedOrder = activeOrder;
		activeOrder = null;

		return { orderId: closedOrder.id };
	}

	// Función para manejar errores del servidor
	function handleFormError(result: { error?: string }) {
		formError = result.error || null;
	}

	function setActiveOrder(order: Order) {
		activeOrder = order;
	}

	async function addProduct(product: Product) {
		if (!activeOrder) return;
		console.log('Adding Product', { product });
		const existingItem = activeOrder.items.find((item) => item.id === product.id);

		if (existingItem) {
			existingItem.quantity += 1;
		} else {
			activeOrder.items.push({
				product,
				quantity: 1,
				unitPrice: product.price
			});
		}
	}

	async function updateItemQuantity(index: number, delta: number) {
		if (!activeOrder) return;
		activeOrder.items[index].quantity += delta;
		// await updateActiveOrder();
	}

	async function removeItem(index: number) {
		if (!activeOrder) return;
		activeOrder.items.splice(index, 1);
		// await updateActiveOrder();
	}

	$effect(() => {
		if (!activeOrder) return;
		$inspect('Active order updated:', activeOrder);
		updateActiveOrder()
			.then(() => {
				console.log('Active order updated successfully');
			})
			.catch((error) => {
				console.log('Error updating active order:', error);
			});
	});

	async function updateActiveOrder() {
		if (!activeOrder) return;
		const response = await fetch(`/api/orders/${activeOrder.id}`, {
			method: 'PATCH',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify(activeOrder)
		});
		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}
	}

	async function deleteOrder(orderId: string) {
		orders = orders.filter((order) => order.id !== orderId);
		if (activeOrder?.id === orderId) {
			const response = await fetch(`/api/orders/${orderId}`, {
				method: 'DELETE',
				headers: {
					'content-type': 'application/json'
				}
			});
			if (!response.ok) {
				throw new Error(`Response status: ${response.status}`);
			}
			activeOrder = null;
		}
	}

	function closeOrder() {
		if (!activeOrder) return;
		activeOrder.updatedAt = new Date();
		activeOrder.status = 'closed';
		activeOrder = null;
	}
</script>

<div class="page-container">
	<h1 class="page-title">Punto de Venta</h1>

	<main class="pos-grid">
		<OrdersList {data} {orders} {activeOrder} {handleCreateOrder} {setActiveOrder} {deleteOrder} />

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
		height: calc(100vh - 185px);
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
