<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Alert from '$lib/components/Alert.svelte';
	import type { ActionResult } from '@sveltejs/kit';

	let formError = $state<string | null>(null);
	let formSuccess = $state<string | null>(page.url.searchParams.get('success') || null);
	let formData = {
		name: '',
		description: '',
		price: '0.00',
		cost: '0.00'
	};

	$effect(() => {
		if (!formSuccess && !formError) return;

		const timer = setTimeout(() => {
			formSuccess = null;
			formError = null;
		}, 5000);

		return () => clearTimeout(timer);
	});
	// async function handleSubmit({ result }: { result: ActionResult }) {
	// 	if (result?.type === 'failure') {
	// 		formError = result.data?.error || 'Error al crear el producto';
	// 	}
	// }

	async function handleSubmit({ formElement, formData, action, cancel }: ActionResult) {
		return async ({ result }: { result: ActionResult }) => {
			if (result?.type === 'success') {
				formSuccess = 'Producto actualizado correctamente';
				formError = null;
			} else if (result?.type === 'failure') {
				formError = result.data?.error || 'Error al actualizar el producto';
				formData = result.data?.fields || formData;
			}
		};
	}
</script>

<div class="form-container">
	<h1 class="form-title">Nuevo Producto</h1>

	{#if formSuccess}
		<Alert type="success" message={formSuccess} dismiss={() => (formSuccess = null)} />
	{/if}

	{#if formError}
		<Alert type="error" message={formError} dismiss={() => (formError = null)} />
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
			<a href="/products" class="btn btn-secondary">Cancelar</a>
			<button type="submit" class="btn btn-primary"> Guardar Producto </button>
		</div>
	</form>
</div>

<style>
	@import '@styles/forms';
</style>
