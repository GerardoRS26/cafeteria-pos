<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import type { PageData as OriginalPageData } from './$types';

	interface Product {
		id: string;
		name: string;
		description: string;
		price: number;
		cost: number;
	}

	interface PageData extends OriginalPageData {
		product: Product;
	}

	export let data: PageData;
	let formError: string | null = null;
	let formData = {
		name: data.product.name,
		description: data.product.description,
		price: data.product.price.toString(),
		cost: data.product.cost.toString()
	};

	async function handleSubmit({ result }: { result: ActionResult }) {
		if (result?.type === 'failure') {
			formError = result.data?.error || 'Error al actualizar el producto';
			formData = result.data?.formData || formData;
		}
	}
</script>

<div class="form-container">
	<h1 class="form-title">Editar Producto</h1>

	{#if formError}
		<div class="error-message">
			{formError}
		</div>
	{/if}

	<form method="POST" use:enhance={handleSubmit}>
		<input type="hidden" name="id" value={data.product.id} />

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
			<button type="submit" class="btn btn-primary"> Actualizar Producto </button>
		</div>
	</form>
</div>

<style>
	@import '@styles/forms';
</style>
