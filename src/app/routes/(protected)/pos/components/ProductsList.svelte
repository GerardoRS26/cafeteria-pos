<script lang="ts">
	import type { Product } from './types';

	// Definir props
	const { products = [], addProduct } = $props<{
		products: Product[];
		addProduct: (product: Product) => void;
	}>();

	// Estados locales
	let searchTerm = $state('');
	const filteredProducts = $derived(
		products.filter(
			(p) => searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase())
		)
	);
</script>

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
			<button type="button" class="product-card" onclick={() => addProduct(product)}>
				<div class="product-info">
					<h3>{product.name}</h3>
					<span class="price">${product.price.toFixed(2)}</span>
				</div>
			</button>
		{/each}
	</div>
</div>

<style>
	@import '@styles/forms';
	.products-column {
		padding: 1rem;
		overflow-y: auto;
	}

	.search-box {
		margin: 1rem 0;
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
		min-height: fit-content;
	}

	.product-card:hover {
		transform: translateY(-2px);
		background-color: var(--surface1);
	}

	.product-info {
		display: flex;
		flex-direction: column;
		margin-bottom: 0.25rem;
		text-align: start;
	}

	.product-info h3 {
		font-size: 0.9rem;
		color: var(--text);
		display: flex;
	}

	.price {
		color: var(--peach);
		font-weight: 500;
		font-size: 0.9rem;
		display: flex;
	}

	.category {
		font-size: 0.7rem;
		color: var(--subtext0);
	}

	@media (max-width: 1200px) {
		.products-column {
			grid-column: span 2;
			height: 40vh;
			overflow-y: auto;
		}
	}

	@media (max-width: 768px) {
		.products-column {
			border-right: none;
			border-bottom: 1px solid var(--surface0);
			height: auto;
		}
	}
</style>
