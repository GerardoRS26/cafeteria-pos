<script lang="ts">
	import type { Order, POSData } from './types';

	const { data, orders, activeOrder, createOrder, setActiveOrder } = $props<{
		data: POSData;
		orders: Order[];
		activeOrder: Order | null;
		createOrder: (table: string) => void;
		setActiveOrder: (order: Order) => void;
	}>();

	let tableInput = $state('');
	let showClosedOrders = $state(false);

	// Filtrar comandas activas/cerradas
	const filteredOrders = $derived(() =>
		orders.filter((order) => (showClosedOrders ? order.closed : !order.closed))
	);

	// Ordenar comandas cerradas por fecha de cierre (más recientes primero)
	const sortedOrders = $derived(() =>
		showClosedOrders
			? [...filteredOrders()].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
			: filteredOrders()
	);
</script>

<div class="orders-column">
	<div class="column-header">
		<h2>{showClosedOrders ? 'Histórico' : 'Comandas Activas'}</h2>
		<div class="order-toggle">
			<button class:active={!showClosedOrders} onclick={() => (showClosedOrders = false)}>
				Activas
			</button>
			<button class:active={showClosedOrders} onclick={() => (showClosedOrders = true)}>
				Cerradas
			</button>
		</div>
	</div>

	{#if !showClosedOrders}
		<div class="new-order">
			<input type="text" bind:value={tableInput} placeholder="Número de Mesa" class="form-input" />
			<button onclick={() => createOrder(tableInput)} class="btn btn-primary">
				Nueva Comanda
			</button>
		</div>
	{/if}

	<ul class="orders">
		{#each sortedOrders() as order}
			<button
				type="button"
				class:active={activeOrder?.id === order.id}
				onclick={() => setActiveOrder(order)}
				class="order-item"
			>
				<div class="order-header">
					<span class="order-table">Mesa {order.table}</span>
					<span class="order-time">
						{order.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
					</span>
				</div>

				<div class="order-details">
					<span class="order-items">
						{order.items.reduce((sum, item) => sum + item.quantity, 0)} artículos
					</span>
					<span class="order-total">
						${order.items
							.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
							.toFixed(2)}
					</span>
				</div>

				{#if order.closed}
					<div class="order-closed-info">
						<span class="order-closed-time">
							Cerrada: {order.closedAt?.toLocaleTimeString([], {
								hour: '2-digit',
								minute: '2-digit'
							})}
							({order.closedAt?.toLocaleDateString()})
						</span>
					</div>
				{/if}
			</button>
		{/each}
	</ul>
</div>

<style>
	@import '@styles/forms';
	.orders-column {
		padding: 1rem;
		overflow-y: auto;
		border-right: 1px solid var(--surface0);
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.column-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--surface0);
		flex-direction: column;
	}

	.order-toggle {
		display: flex;
		gap: 0.5rem;
	}

	.order-toggle button {
		padding: 0.5rem 1rem;
		background: var(--surface0);
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	.order-toggle button.active {
		background: var(--mauve);
		color: var(--crust);
	}

	.new-order {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 0.5rem;
	}

	.orders {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin: 0;
		padding: 0;
	}

	.orders button {
		padding: 0.75rem;
		background-color: var(--surface0);
		border-radius: 8px;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		width: 100%;
		border: none;
		text-align: left;
	}

	.orders button.active {
		background-color: var(--surface1);
		border-left: 3px solid var(--mauve);
	}

	.orders button:disabled {
		background-color: color-mix(in srgb, var(--surface0) 90%, transparent);
		cursor: default;
		opacity: 0.8;
	}

	.order-header {
		display: flex;
		justify-content: space-between;
		width: 100%;
	}

	.order-table {
		font-weight: bold;
	}

	.order-time {
		font-size: 0.85rem;
		color: var(--subtext0);
	}

	.order-details {
		display: flex;
		justify-content: space-between;
		width: 100%;
	}

	.order-items {
		font-size: 0.9rem;
	}

	.order-item {
		min-height: fit-content;
	}

	.order-total {
		font-weight: bold;
		color: var(--peach);
	}

	.order-closed-info {
		border-top: 1px dashed var(--surface2);
		padding-top: 0.5rem;
		margin-top: 0.25rem;
		width: 100%;
	}

	.order-closed-time {
		font-size: 0.85rem;
		color: var(--subtext1);
		font-style: italic;
	}

	@media (max-width: 768px) {
		.orders-column {
			border-right: none;
			border-bottom: 1px solid var(--surface0);
		}
		.order-details {
			flex-direction: column;
			gap: 0.25rem;
		}
	}
</style>
