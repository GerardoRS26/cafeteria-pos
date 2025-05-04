<!-- src/routes/(admin)/products/new/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';

	let formError: string | null = null;
	let formData = {
		name: '',
		description: '',
		price: '0.00',
		cost: '0.00'
	};

	async function handleSubmit({ result }: { result: ActionResult }) {
		if (result?.type === 'failure') {
			formError = result.data?.error || 'Error al crear el producto';
		}
	}
</script>

<div class="form-container">
	<h1 class="form-title">Nuevo Producto</h1>

	{#if formError}
		<div class="error-message">
			{formError}
		</div>
	{/if}

	<form method="POST" use:enhance={handleSubmit}>
		<div class="form-group">
			<label for="name" class="form-label">Nombre*</label>
			<input
				id="name"
				name="name"
				type="text"
				bind:value={formData.name}
				required
				minlength="3"
				class="form-input"
			/>
		</div>

		<div class="form-group">
			<label for="description" class="form-label">Descripción</label>
			<textarea
				id="description"
				name="description"
				bind:value={formData.description}
				class="form-input form-textarea"
			></textarea>
		</div>

		<div class="grid-cols-2">
			<div class="form-group">
				<label for="price" class="form-label">Precio*</label>
				<div class="money-input">
					<span class="currency-symbol">$</span>
					<input
						id="price"
						name="price"
						type="number"
						bind:value={formData.price}
						required
						min="0"
						step="0.01"
						class="form-input"
					/>
				</div>
			</div>

			<div class="form-group">
				<label for="cost" class="form-label">Costo*</label>
				<div class="money-input">
					<span class="currency-symbol">$</span>
					<input
						id="cost"
						name="cost"
						type="number"
						bind:value={formData.cost}
						required
						min="0"
						step="0.01"
						class="form-input"
					/>
				</div>
			</div>
		</div>

		<div class="form-actions">
			<a href="/admin/products" class="btn btn-secondary">Cancelar</a>
			<button type="submit" class="btn btn-primary"> Guardar Producto </button>
		</div>
	</form>
</div>

<style>
	.form-container {
		max-width: 600px;
		margin: 2rem auto;
		padding: 2rem;
		background-color: var(--mantle);
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.form-title {
		font-size: 1.75rem;
		color: var(--rosewater);
		margin-bottom: 1.5rem;
		text-align: center;
	}

	.error-message {
		background-color: color-mix(in srgb, var(--red) 20%, transparent);
		color: var(--red);
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1.5rem;
		border-left: 4px solid var(--red);
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-label {
		display: block;
		margin-bottom: 0.5rem;
		color: var(--subtext1);
		font-weight: 500;
	}

	.form-input {
		width: 100%;
		padding: 0.75rem;
		background-color: var(--surface0);
		border: 1px solid var(--surface1);
		border-radius: 8px;
		color: var(--text);
		font-size: 1rem;
		transition: border-color 0.2s ease;

		&:focus {
			outline: none;
			border-color: var(--mauve);
			box-shadow: 0 0 0 2px color-mix(in srgb, var(--mauve) 30%, transparent);
		}
	}

	.form-textarea {
		min-height: 120px;
		resize: vertical;
	}

	.grid-cols-2 {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		margin-top: 2rem;
	}

	.btn {
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;

		&-secondary {
			background-color: var(--surface1);
			color: var(--text);

			&:hover {
				background-color: var(--surface2);
			}
		}

		&-primary {
			background-color: var(--mauve);
			color: var(--crust);

			&:hover {
				background-color: color-mix(in srgb, var(--mauve) 90%, white);
			}
		}
	}

	.money-input {
		position: relative;

		.currency-symbol {
			position: absolute;
			left: 12px;
			top: 50%;
			transform: translateY(-50%);
			color: var(--subtext0);
		}

		input {
			padding-left: 32px !important;
		}
	}
</style>
