<script lang="ts">
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

	// Estados de búsqueda y filtrado
	let showInactive = $state(false);
	let searchQuery = $state('');
	let showSuggestions = $state(false);
	let focusedSuggestionIndex = $state(-1);

	// Computar productos filtrados
	const filteredProducts = $derived(
		data.products
			.filter((p) => showInactive || p.isActive)
			.filter((p) => searchQuery === '' || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
	);

	// Computar sugerencias para autocompletado
	const suggestions = $derived(
		searchQuery.length > 1
			? Array.from(
					new Set(
						data.products
							.filter((p) => showInactive || p.isActive)
							.map((p) => p.name)
							.filter((name) => name.toLowerCase().includes(searchQuery.toLowerCase()))
							.slice(0, 5) // Limitar a 5 sugerencias
					)
				)
			: []
	);

	// Manejar selección de sugerencia
	function selectSuggestion(suggestion: string) {
		searchQuery = suggestion;
		showSuggestions = false;
	}

	// Manejar eventos de teclado
	function handleKeydown(e: KeyboardEvent) {
		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				focusedSuggestionIndex = Math.min(focusedSuggestionIndex + 1, suggestions.length - 1);
				break;
			case 'ArrowUp':
				e.preventDefault();
				focusedSuggestionIndex = Math.max(focusedSuggestionIndex - 1, -1);
				break;
			case 'Enter':
				if (focusedSuggestionIndex >= 0) {
					e.preventDefault();
					selectSuggestion(suggestions[focusedSuggestionIndex]);
				}
				break;
			case 'Escape':
				showSuggestions = false;
				break;
		}
	}

	const isAdmin = $derived(data.user?.role === 'admin');
</script>

<div class="page-container">
	<h1 class="page-title">Gestión de Productos</h1>

	<div class="actions-header">
		<div class="search-and-filter">
			<!-- Barra de búsqueda -->
			<div class="search-container">
				<input
					type="text"
					bind:value={searchQuery}
					oninput={() => {
						showSuggestions = searchQuery.length > 1;
						focusedSuggestionIndex = -1;
					}}
					onfocus={() => (showSuggestions = searchQuery.length > 1)}
					onblur={() => setTimeout(() => (showSuggestions = false), 200)}
					onkeydown={handleKeydown}
					placeholder="Buscar productos..."
					class="search-input"
				/>
				{#if searchQuery}
					<button
						onclick={() => (searchQuery = '')}
						class="search-clear"
						aria-label="Limpiar búsqueda"
					>
						×
					</button>
				{/if}
				{#if showSuggestions && suggestions.length > 0}
					<ul class="suggestions-list">
						{#each suggestions as suggestion, index}
							<div
								role="button"
								tabindex="0"
								onmousedown={() => selectSuggestion(suggestion as string)}
							>
								<li class:selected={index === focusedSuggestionIndex}>
									{suggestion}
								</li>
							</div>
						{/each}
					</ul>
				{/if}
			</div>

			{#if isAdmin}
				<!-- Filtro de estado -->
				<div class="status-filter">
					<label class="toggle-container">
						<span class="toggle-switch">
							<input type="checkbox" bind:checked={showInactive} />
							<span class="slider round"></span>
						</span>
						<span class="toggle-label">Mostrar inactivos</span>
					</label>
				</div>
			{/if}
		</div>
		{#if isAdmin}
			<a href="/products/admin/new" class="btn btn-primary"> + Nuevo Producto </a>
		{/if}
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
				{#if isAdmin}
					<div class="product-actions">
						<a href="/products/admin/edit/{product.id}" class="btn btn-secondary"> Editar </a>
						<form method="POST" action="?/toggleStatus">
							<input type="hidden" name="id" value={product.id} />
							<button type="submit" class="btn btn-secondary">
								{product.isActive ? 'Desactivar' : 'Activar'}
							</button>
						</form>
					</div>
				{/if}
			</div>
		{:else}
			<div class="empty-state">
				{#if showInactive}
					<p>No hay productos registrados</p>
				{:else if searchQuery}
					<p>No se encontraron productos para "{searchQuery}"</p>
				{:else}
					<p>No hay productos activos</p>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.actions-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
		gap: 1rem;
	}

	.search-and-filter {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		flex-grow: 1;
	}

	.search-container {
		position: relative;
		flex-grow: 1;
		max-width: 400px;
	}

	.search-input {
		width: 100%;
		padding: 0.75rem 2rem 0.75rem 1rem;
		background: var(--surface0);
		border: 1px solid var(--surface2);
		border-radius: 8px;
		color: var(--text);
		font-size: 1rem;
		transition: border-color 0.2s ease;
	}

	.search-input:focus {
		outline: none;
		border-color: var(--mauve);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--mauve) 20%, transparent);
	}

	.search-clear {
		position: absolute;
		right: 0.75rem;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		color: var(--subtext0);
		font-size: 1.25rem;
		cursor: pointer;
		padding: 0.25rem;
	}

	.suggestions-list {
		position: absolute;
		width: 100%;
		background: var(--surface0);
		border: 1px solid var(--surface1);
		border-radius: 0 0 8px 8px;
		margin-top: -1px;
		max-height: 200px;
		overflow-y: auto;
		z-index: 10;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.suggestions-list li {
		padding: 0.75rem 1rem;
		cursor: pointer;
		color: var(--text);
	}

	.suggestions-list li:hover,
	.suggestions-list li.selected {
		background: var(--surface1);
		color: var(--mauve);
	}

	/* El resto de tus estilos existentes se mantienen igual */
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
		user-select: none;
	}

	.empty-state {
		grid-column: 1 / -1;
		text-align: center;
		padding: 2rem;
		background: var(--surface0);
		border-radius: 12px;
	}

	@media (max-width: 768px) {
		.actions-header {
			flex-direction: column;
			align-items: stretch;
			gap: 1rem;
		}

		.search-and-filter {
			flex-direction: column;
			gap: 1rem;
		}

		.search-container {
			max-width: 100%;
		}
	}
</style>
