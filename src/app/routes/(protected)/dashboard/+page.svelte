<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();
</script>

<div class="form-container">
	<h1 class="form-title">Hola, {data.user.username}!</h1>

	<div class="status-badge {data.user.role === 'admin' ? 'active' : 'inactive'}">
		Rol: {data.user.role === 'admin' ? 'Administrador' : 'Vendedor'}
	</div>

	<p>Tu ID de usuario es: {data.user.id}</p>

	<form method="post" action="?/logout" use:enhance class="form-actions">
		<button type="submit" class="btn btn-secondary">Cerrar sesión</button>
	</form>
</div>
