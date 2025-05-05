<script lang="ts">
	let { data } = $props();
	let showInactive = $state(false);

	let filteredProducts = $derived(
		showInactive ? data.products : data.products.filter((p) => p.isActive)
	);
</script>

<div class="page-container">
	<h1 class="page-title">Gestión de Productos</h1>

	<div class="actions-header">
		<div class="status-filter">
			<label class="toggle-container">
				<span class="toggle-switch">
					<input type="checkbox" bind:checked={showInactive} />
					<span class="slider round"></span>
				</span>
				<span class="toggle-label">Mostrar inactivos</span>
			</label>
		</div>
		<a href="/admin/products/new" class="btn btn-primary"> + Nuevo Producto </a>
	</div>

	<div class="products-grid">
		{#each filteredProducts as product}
			<div class="product-card" class:inactive={!product.isActive}>
				<h3 class="product-name">{product.name}</h3>
				<div class="status-badge {product.isActive ? 'active' : 'inactive'}">
					{product.isActive ? 'Activo' : 'Inactivo'}
				</div>
				<p class="product-price">${product.price.toFixed(2)}</p>
				<p class="product-description">
					{product.description || 'Sin descripción'}
				</p>
				<div class="product-actions">
					<a href="/admin/products/edit/{product.id}" class="btn btn-secondary"> Editar </a>
					<form method="POST" action="?/toggleStatus">
						<input type="hidden" name="id" value={product.id} />
						<button type="submit" class="btn btn-secondary">
							{product.isActive ? 'Desactivar' : 'Activar'}
						</button>
					</form>
				</div>
			</div>
		{:else}
			<div class="empty-state">
				{#if showInactive}
					<p>No hay productos registrados</p>
				{:else}
					<p>No hay productos activos</p>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.page-container {
		max-width: 1200px;
		margin: 2rem auto;
		padding: 0 1rem;
	}

	.page-title {
		font-size: 2rem;
		color: var(--rosewater);
		margin-bottom: 1.5rem;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid var(--surface1);
	}

	.actions-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.btn {
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;

		&.primary {
			background-color: var(--mauve);
			color: var(--crust);

			&:hover {
				background-color: color-mix(in srgb, var(--mauve) 90%, white);
			}
		}

		&.secondary {
			background-color: var(--surface1);
			color: var(--text);

			&:hover {
				background-color: var(--surface2);
			}
		}
	}

	.products-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1.5rem;
	}

	.product-card {
		background: var(--surface0);
		border-radius: 12px;
		padding: 1.5rem;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
		border-left: 4px solid var(--peach);

		&:hover {
			transform: translateY(-4px);
			box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
		}

		&.inactive {
			opacity: 0.8;
			border-left-color: var(--surface2);
		}
	}

	.product-name {
		color: var(--green);
		font-size: 1.25rem;
		margin-bottom: 0.5rem;
	}

	.product-price {
		color: var(--yellow);
		font-weight: bold;
		font-size: 1.1rem;
		margin: 0.5rem 0;
	}

	.product-description {
		color: var(--subtext0);
		margin-bottom: 1rem;
		font-size: 0.9rem;
	}

	.product-actions {
		display: flex;
		gap: 0.75rem;
		margin-top: 1rem;
	}

	.status-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 999px;
		font-size: 0.8rem;
		font-weight: 500;

		&.active {
			background-color: color-mix(in srgb, var(--green) 20%, transparent);
			color: var(--green);
		}

		&.inactive {
			background-color: color-mix(in srgb, var(--red) 20%, transparent);
			color: var(--red);
		}
	}

	.status-filter {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.toggle-container {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		cursor: pointer;
	}

	.toggle-switch {
		position: relative;
		display: inline-block;
		width: 50px;
		height: 24px;
	}

	.toggle-switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: var(--surface2);
		transition: 0.4s;
		border-radius: 24px;
	}

	.slider:before {
		position: absolute;
		content: '';
		height: 16px;
		width: 16px;
		left: 4px;
		bottom: 4px;
		background-color: var(--text);
		transition: 0.4s;
		border-radius: 50%;
	}

	input:checked + .slider {
		background-color: var(--mauve);
	}

	input:checked + .slider:before {
		transform: translateX(26px);
	}

	.toggle-label {
		font-size: 0.9rem;
		color: var(--subtext1);
		user-select: none; /* Evita que el texto se seleccione al hacer clic */
	}
</style>
