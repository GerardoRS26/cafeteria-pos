<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';

	let { data } = $props<{
		data: {
			products: {
				id: string;
				name: string;
				price: number;
				isActive: boolean;
				description?: string;
			}[];
			user?: {
				role: 'admin' | 'seller';
			};
		};
	}>();

	// State
	let orders = $state<Order[]>([]);
	let activeOrder = $state<Order | null>(null);
	let allProducts = $state<Product[]>(data.products);
	let filteredProducts = $state<Product[]>();
	let tableInput = $state('');
	let amountReceived = $state(0);
	let discount = $state(0);
	let searchTerm = $state('');

	// Types
	type Product = {
		id: string;
		name: string;
		price: number;
	};

	type OrderItem = {
		product: Product;
		quantity: number;
		notes: string;
	};

	type Order = {
		id: string;
		table: string;
		items: OrderItem[];
		closed: boolean;
		createdAt: Date;
	};

	// Functions
	function createOrder() {
		const newOrder: Order = {
			id: crypto.randomUUID(),
			table: tableInput,
			items: [],
			closed: false,
			createdAt: new Date()
		};
		orders.push(newOrder);
		activeOrder = newOrder;
		tableInput = '';
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

	function calculateSubtotal() {
		if (!activeOrder) return 0;
		return activeOrder.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
	}

	function calculateTotal() {
		return calculateSubtotal() - discount;
	}

	function calculateChange() {
		return amountReceived - calculateTotal();
	}

	function closeOrder() {
		if (!activeOrder) return;
		activeOrder.closed = true;
		// Add logic to send to kitchen/print receipt
	}

	function filterProducts() {
		if (!searchTerm) {
			filteredProducts = [...allProducts];
			return;
		}

		const term = searchTerm.toLowerCase();
		filteredProducts = allProducts.filter((product) => product.name.toLowerCase().includes(term));
	}

	$effect(() => {
		filterProducts();
	});
</script>

<div class="pos-container">
	<!-- Header -->
	<header class="pos-header">
		<h1>Punto de Venta</h1>
	</header>

	<!-- Main 3-Column Layout -->
	<main class="pos-grid">
		<!-- Column 1: Orders List -->
		<div class="orders-column">
			<div class="column-header">
				<h2>Comandas Activas</h2>
				<div class="new-order">
					<input
						type="text"
						bind:value={tableInput}
						placeholder="Número de Mesa"
						class="form-input"
					/>
					<button onclick={createOrder} class="btn btn-primary"> Nueva Comanda </button>
				</div>
			</div>

			<ul class="orders">
				{#each orders as order}
					<li class:active={activeOrder?.id === order.id} onclick={() => (activeOrder = order)}>
						<span>Mesa {order.table}</span>
						<span>
							{order.createdAt.toLocaleTimeString()}
						</span>
						<span>
							{order.items.reduce((sum, item) => sum + item.quantity, 0)} artículos
						</span>
					</li>
				{/each}
			</ul>
		</div>

		<!-- Column 2: Order Details -->
		<div class="order-column">
			{#if activeOrder}
				<div class="column-header">
					<h2>Mesa {activeOrder.table}</h2>
					<div class="order-status">
						{#if activeOrder.closed}
							<span class="closed">Cerrada</span>
						{:else}
							<span class="open">Abierta</span>
						{/if}
					</div>
				</div>

				<ul class="order-items">
					{#each activeOrder.items as item}
						<li>
							<div class="item-info">
								<span class="name">{item.product.name}</span>
								<span class="price">${item.product.price.toFixed(2)}</span>
							</div>
							<div class="item-controls">
								<button onclick={() => (item.quantity -= 1)} disabled={item.quantity <= 1}>
									−
								</button>
								<span>{item.quantity}</span>
								<button onclick={() => (item.quantity += 1)}> + </button>
								<button onclick={() => activeOrder?.items.splice(index, 1)}> 🗑️ </button>
							</div>
						</li>
					{/each}
				</ul>

				<!-- Totals and Payment -->
				<div class="order-totals">
					<div class="total-line">
						<span>Subtotal:</span>
						<span>${calculateSubtotal().toFixed(2)}</span>
					</div>

					<div class="discount-input">
						<label>Descuento/Promoción:</label>
						<input type="number" bind:value={discount} min="0" class="form-input" />
					</div>

					<div class="total-line">
						<span>Total:</span>
						<span class="total-amount">${calculateTotal().toFixed(2)}</span>
					</div>

					{#if !activeOrder.closed}
						<div class="payment-section">
							<label>Monto Recibido:</label>
							<input
								type="number"
								bind:value={amountReceived}
								min="0"
								step="0.01"
								class="form-input"
							/>
							<div class="change">
								<span>Cambio:</span>
								<span>${calculateChange().toFixed(2)}</span>
							</div>
							<button
								onclick={closeOrder}
								class="btn btn-primary"
								disabled={amountReceived < calculateTotal()}
							>
								Cerrar Comanda
							</button>
						</div>
					{/if}
				</div>
			{:else}
				<div class="no-order">
					<p>Selecciona o crea una comanda para comenzar</p>
				</div>
			{/if}
		</div>

		<!-- Column 3: Products -->
		<div class="products-column">
			<div class="column-header">
				<h2>Productos</h2>
				<div class="search-box">
					<input
						type="text"
						bind:value={searchTerm}
						placeholder="Buscar productos..."
						class="form-input"
					/>
				</div>
			</div>

			<div class="products-list">
				{#each filteredProducts as product}
					<div class="product-card" onclick={() => addProduct(product)}>
						<div class="product-info">
							<h3>{product.name}</h3>
							<span class="price">${product.price.toFixed(2)}</span>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</main>
</div>

<style>
	@import '@styles/forms';
	/* POS Styles */
	.pos-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: var(--mantle);
		color: var(--text);
	}

	.pos-header {
		padding: 1rem 2rem;
		background-color: var(--base);
		border-bottom: 1px solid var(--surface0);
	}

	.pos-header h1 {
		margin-bottom: 0.5rem;
		color: var(--lavender);
	}

	/* 3-Column Grid Layout */
	.pos-grid {
		display: grid;
		grid-template-columns: 25% 35% 40%;
		height: calc(100vh - 70px);
		overflow: hidden;
	}

	.orders-column,
	.order-column,
	.products-column {
		padding: 1rem;
		overflow-y: auto;
		border-right: 1px solid var(--surface0);
	}

	.products-column {
		border-right: none;
	}

	.column-header {
		margin-bottom: 1rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--surface0);
	}

	/* Orders List */
	.new-order {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 0.5rem;
		margin: 1rem 0;
	}

	.orders {
		list-style: none;
	}

	.orders li {
		padding: 0.75rem;
		margin-bottom: 0.5rem;
		background-color: var(--surface0);
		border-radius: 8px;
		cursor: pointer;
		display: grid;
		grid-template-columns: 1fr auto auto;
		gap: 1rem;
	}

	.orders li.active {
		background-color: var(--surface1);
		border-left: 3px solid var(--mauve);
	}

	/* Order Details */
	.order-items {
		list-style: none;
		margin-bottom: 1rem;
	}

	.order-items li {
		padding: 1rem;
		margin-bottom: 0.5rem;
		background-color: var(--surface0);
		border-radius: 8px;
	}

	.item-info {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.5rem;
	}

	.item-controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.item-controls button {
		background-color: var(--surface1);
		border: none;
		width: 28px;
		height: 28px;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: var(--text);
	}

	.item-controls button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.item-controls span {
		min-width: 20px;
		text-align: center;
	}

	.order-totals {
		background-color: var(--surface0);
		padding: 1.5rem;
		border-radius: 8px;
	}

	.total-line {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.5rem;
	}

	.total-amount {
		font-size: 1.25rem;
		font-weight: bold;
		color: var(--peach);
	}

	.discount-input {
		margin: 1rem 0;
	}

	.payment-section {
		margin-top: 1.5rem;
		padding-top: 1rem;
		border-top: 1px solid var(--surface1);
	}

	.change {
		display: flex;
		justify-content: space-between;
		margin: 1rem 0;
		font-size: 1.1rem;
	}

	/* Products Column */
	.search-box {
		margin: 1rem 0;
	}

	.categories {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.categories button {
		background: var(--surface0);
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 20px;
		cursor: pointer;
		font-size: 0.8rem;
		transition: all 0.2s ease;
	}

	.categories button.active {
		background: var(--mauve);
		color: var(--crust);
	}

	.products-list {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}

	.product-card {
		background-color: var(--surface0);
		padding: 1rem;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.product-card:hover {
		transform: translateY(-2px);
		background-color: var(--surface1);
	}

	.product-info {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.25rem;
	}

	.product-info h3 {
		font-size: 0.9rem;
		color: var(--text);
	}

	.price {
		color: var(--peach);
		font-weight: 500;
		font-size: 0.9rem;
	}

	.category {
		font-size: 0.7rem;
		color: var(--subtext0);
	}

	/* Responsive */
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

		.orders-column,
		.order-column,
		.products-column {
			border-right: none;
			border-bottom: 1px solid var(--surface0);
		}

		.products-column {
			height: auto;
		}
	}
</style>
