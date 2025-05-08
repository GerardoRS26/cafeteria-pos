<script lang="ts">
	import type { Order } from './types';

	const { activeOrder, closeOrder, updateItemQuantity, removeItem } = $props<{
		activeOrder: Order | null;
		closeOrder: () => void;
		updateItemQuantity: (index: number, delta: number) => void;
		removeItem: (index: number) => void;
	}>();

	let amountReceived = $state(0);

	let discount = $state({
		amount: 0,
		reason: ''
	});

	let extras = $state<
		Array<{
			amount: number;
			description: string;
		}>
	>([]);

	let newExtra = $state({
		amount: 0,
		description: ''
	});

	const subtotal = $derived(
		() =>
			activeOrder?.items.reduce(
				(sum: number, item: { product: { price: number }; quantity: number }) =>
					sum + item.product.price * item.quantity,
				0
			) || 0
	);

	const total = $derived(() => {
		const discountAmount = discount.amount || 0;
		const extrasAmount = extras.reduce((sum, extra) => sum + extra.amount, 0);
		return subtotal() - discountAmount + extrasAmount;
	});

	const change = $derived(() => amountReceived - total());

	function addExtra() {
		if (newExtra.amount !== 0 && newExtra.description) {
			extras = [...extras, { ...newExtra }];
			newExtra = { amount: 0, description: '' };
		}
	}

	function removeExtra(index: number) {
		extras = extras.filter((_, i) => i !== index);
	}
</script>

<div class="order-column" class:closed={activeOrder?.closed}>
	{#if activeOrder}
		<div class="column-header">
			<h2>Mesa {activeOrder.tableIdentifier}</h2>
			<div class="order-status">
				{#if activeOrder.closed}
					<span class="closed-badge">Cerrada</span>
				{:else}
					<span class="open-badge">Abierta</span>
				{/if}
			</div>
		</div>

		<ul class="order-items">
			{#each activeOrder.items as item, index}
				<li class:closed-item={activeOrder.closed}>
					<div class="item-info">
						<span class="name">{item.product.name}</span>
						<span class="price">${item.product.price.toFixed(2)}</span>
					</div>
					<div class="item-controls">
						<button
							onclick={() => updateItemQuantity(index, -1)}
							disabled={item.quantity <= 1 || activeOrder.closed}
						>
							−
						</button>
						<span>{item.quantity}</span>
						<button onclick={() => updateItemQuantity(index, 1)} disabled={activeOrder.closed}>
							+
						</button>
						<button onclick={() => removeItem(index)} disabled={activeOrder.closed}> 🗑️ </button>
					</div>
				</li>
			{/each}
		</ul>

		<div class="order-totals" class:closed-totals={activeOrder.closed}>
			<div class="total-line">
				<span>Subtotal:</span>
				<span>${subtotal().toFixed(2)}</span>
			</div>
			<!-- Sección de Extras -->
			<div class="extras-section">
				<h3>Extras</h3>
				{#each extras as extra, index}
					<div class="extra-item">
						<div class="extra-info">
							<span>{extra.description}</span>
							<span>${extra.amount.toFixed(2)}</span>
						</div>
						<button onclick={() => removeExtra(index)} disabled={activeOrder.closed}> 🗑️ </button>
					</div>
				{/each}

				{#if !activeOrder.closed}
					<div class="add-extra">
						<label>Monto Extra:</label>
						<input type="number" bind:value={newExtra.amount} min="0" class="form-input" />
						<label>Descripción:</label>
						<input
							type="text"
							bind:value={newExtra.description}
							placeholder="Descripción del extra"
							class="form-input"
						/>
						<button onclick={addExtra} class="btn btn-secondary"> Añadir Extra </button>
					</div>
				{/if}
			</div>

			<div class="discount-section">
				<h3>Descuento</h3>
				<div class="discount-inputs">
					<label>Monto:</label>
					<input
						type="number"
						bind:value={discount.amount}
						min="0"
						class="form-input"
						disabled={activeOrder.closed}
					/>
					<label>Descripción:</label>
					<input
						type="text"
						bind:value={discount.reason}
						placeholder="Motivo del descuento"
						class="form-input"
						disabled={activeOrder.closed}
					/>
				</div>
			</div>

			<div class="total-line">
				<span>Total:</span>
				<span class="total-amount">${total().toFixed(2)}</span>
			</div>

			{#if !activeOrder.closed}
				<div class="payment-section">
					<label for="amount-received">Monto Recibido:</label>
					<input
						id="amount-received"
						type="number"
						bind:value={amountReceived}
						min="0"
						step="0.01"
						class="form-input"
					/>
					<div class="change">
						<span>Cambio:</span>
						<span>${change().toFixed(2)}</span>
					</div>
					<button onclick={closeOrder} class="btn btn-primary" disabled={amountReceived < total()}>
						Cerrar Comanda
					</button>
				</div>
			{:else}
				<div class="closed-info">
					<div class="closed-timestamp">
						<span>Cerrada el:</span>
						<span
							>{activeOrder.closedAt?.toLocaleDateString()} - {activeOrder.closedAt?.toLocaleTimeString()}</span
						>
					</div>
					{#if activeOrder.paymentAmount}
						<div class="payment-info">
							<span>Pagado:</span>
							<span>${activeOrder.paymentAmount.toFixed(2)}</span>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{:else}
		<div class="no-order">
			<p>Selecciona o crea una comanda para comenzar</p>
		</div>
	{/if}
</div>

<style>
	@import '@styles/forms';
	.order-column {
		padding: 1rem;
		overflow-y: auto;
		border-right: 1px solid var(--surface0);
	}

	.order-column.closed {
		background-color: color-mix(in srgb, var(--base) 98%, var(--lavender) 2%);
	}

	.column-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--surface0);
	}

	.closed .column-header {
		border-bottom-color: var(--surface1);
	}

	.order-status {
		padding: 0.25rem 0;
	}

	.closed-badge {
		background-color: var(--surface2);
		color: var(--lavender);
		padding: 0.25rem 0.75rem;
		border-radius: 4px;
		font-size: 0.85rem;
	}

	.open-badge {
		background-color: var(--green);
		color: var(--base);
		padding: 0.25rem 0.75rem;
		border-radius: 4px;
		font-size: 0.85rem;
	}

	.order-items {
		list-style: none;
		margin-bottom: 1rem;
	}

	.order-items li {
		padding: 1rem;
		margin-bottom: 0.5rem;
		background-color: var(--surface0);
		border-radius: 8px;
		transition: background-color 0.2s ease;
	}

	.order-items li.closed-item {
		background-color: color-mix(in srgb, var(--surface0) 90%, var(--lavender) 10%);
		border-left: 3px solid var(--lavender);
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

	.closed-totals {
		background-color: color-mix(in srgb, var(--surface0) 85%, var(--lavender) 15%);
		border-left: 3px solid var(--lavender);
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

	.closed-totals .total-amount {
		color: var(--lavender);
	}

	.discount-input {
		margin: 1rem 0;
	}

	.payment-section {
		margin-top: 1.5rem;
		padding-top: 1rem;
		border-top: 1px solid var(--surface1);
	}

	.closed-info {
		margin-top: 1.5rem;
		padding-top: 1rem;
		border-top: 1px dashed var(--lavender);
		color: var(--subtext0);
	}

	.closed-timestamp,
	.payment-info {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
	}

	.payment-info span:last-child {
		color: var(--lavender);
		font-weight: bold;
	}

	.change {
		display: flex;
		justify-content: space-between;
		margin: 1rem 0;
		font-size: 1.1rem;
	}

	.no-order {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		color: var(--subtext0);
	}

	.discount-section,
	.extras-section {
		margin: 1rem 0;
		padding: 1rem;
		background-color: var(--surface1);
		border-radius: 8px;
	}

	.discount-section h3,
	.extras-section h3 {
		margin-top: 0;
		margin-bottom: 0.75rem;
		font-size: 1rem;
		color: var(--subtext1);
	}

	.discount-inputs {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.5rem;
		align-items: center;
	}

	.extras-section {
		border-top: 1px dashed var(--surface1);
	}

	.extra-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem;
		margin-bottom: 0.5rem;
		background-color: var(--surface2);
		border-radius: 4px;
	}

	.extra-info {
		display: flex;
		justify-content: space-between;
		flex-grow: 1;
		margin-right: 0.5rem;
	}

	.add-extra {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.5rem;
		align-items: center;
		margin-top: 1rem;
	}

	.add-extra button {
		grid-column: span 2;
	}

	.btn-secondary {
		background-color: var(--surface1);
		color: var(--text);
	}

	@media (max-width: 768px) {
		.order-column {
			border-right: none;
			border-bottom: 1px solid var(--surface0);
		}
	}
</style>
