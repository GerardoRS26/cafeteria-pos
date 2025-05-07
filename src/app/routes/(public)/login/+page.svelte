<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let isLoginView = $state(true);
	let formData = {
		username: '',
		password: '',
		confirmPassword: ''
	};
</script>

<div class="form-container">
	<h1 class="form-title">{isLoginView ? 'Iniciar Sesión' : 'Registrarse'}</h1>

	{#if form?.message}
		<div class="error-message">
			{form.message}
		</div>
	{/if}

	<form method="POST" use:enhance action={isLoginView ? '?/login' : '?/register'}>
		<div class="form-group">
			<label for="username" class="form-label">Usuario*</label>
			<input
				id="username"
				name="username"
				type="text"
				bind:value={formData.username}
				required
				minlength="3"
				maxlength="31"
				class="form-input"
				autocomplete="username"
			/>
		</div>

		<div class="form-group">
			<label for="password" class="form-label">Contraseña*</label>
			<input
				id="password"
				name="password"
				type="password"
				bind:value={formData.password}
				required
				minlength="6"
				class="form-input"
				autocomplete={isLoginView ? 'current-password' : 'new-password'}
			/>
		</div>

		{#if !isLoginView}
			<div class="form-group">
				<label for="confirmPassword" class="form-label">Confirmar Contraseña*</label>
				<input
					id="confirmPassword"
					name="confirmPassword"
					type="password"
					bind:value={formData.confirmPassword}
					required
					minlength="6"
					class="form-input"
					autocomplete="new-password"
				/>
			</div>
		{/if}

		<div class="form-actions">
			<button type="button" onclick={() => (isLoginView = !isLoginView)} class="btn btn-secondary">
				{isLoginView ? 'Crear cuenta' : 'Ya tengo cuenta'}
			</button>
			<button type="submit" class="btn btn-primary">
				{isLoginView ? 'Ingresar' : 'Registrarse'}
			</button>
		</div>
	</form>
</div>

<style>
	@import '@styles/forms';
</style>
