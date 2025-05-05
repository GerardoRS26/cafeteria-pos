<script lang="ts">
	import { sidebar } from '@stores/sidebar';
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	let { children } = $props();

	const isAdmin = $derived(page.data?.user?.role === 'admin');
	const showSidebar = $derived(page.data?.user && !page.url.pathname.startsWith('/login'));
</script>

{#if showSidebar}
	<div class="dashboard-container" class:collapsed={$sidebar}>
		<aside class="sidebar">
			<div class="user-info">
				{#if !$sidebar}
					<div class="user-avatar">{page.data?.user.username.charAt(0).toUpperCase()}</div>
					<div class="user-details">
						<h3 class="username">{page.data?.user.username}</h3>
						<div class="status-badge {isAdmin ? 'active' : 'inactive'}">
							{isAdmin ? 'Administrador' : 'Vendedor'}
						</div>
					</div>
				{:else}
					<div class="user-avatar">{page.data?.user.username.charAt(0).toUpperCase()}</div>
				{/if}
			</div>

			<nav class="nav-menu">
				<ul>
					<li>
						<a href="/dashboard" class="nav-link" class:active={page.url.pathname === '/dashboard'}>
							<span class="nav-icon">📊</span>
							{#if !$sidebar}
								<span class="nav-text">Inicio</span>
							{/if}
						</a>
					</li>
					<li>
						<a
							href="/products"
							class="nav-link"
							class:active={page.url.pathname.startsWith('/products')}
						>
							<span class="nav-icon">📦</span>
							{#if !$sidebar}
								<span class="nav-text">Productos</span>
							{/if}
						</a>
					</li>
					<li>
						<a href="/pos" class="nav-link" class:active={page.url.pathname.startsWith('/pos')}>
							<span class="nav-icon">💳</span>
							{#if !$sidebar}
								<span class="nav-text">Punto de Venta</span>
							{/if}
						</a>
					</li>
					{#if isAdmin}
						<li>
							<a
								href="/reports"
								class="nav-link"
								class:active={page.url.pathname.startsWith('/reports')}
							>
								<span class="nav-icon">📈</span>
								{#if !$sidebar}
									<span class="nav-text">Reportes</span>
								{/if}
							</a>
						</li>
					{/if}
				</ul>
			</nav>

			<!-- Botón para colapsar/expandir -->
			<button
				onclick={sidebar.toggle}
				class="collapse-button"
				class:collapsed={$sidebar}
				aria-label={$sidebar ? 'Expandir menú' : 'Colapsar menú'}
			>
				{#if $sidebar}
					<span>➡️</span>
				{:else}
					<span>⬅️</span>
				{/if}
			</button>

			<form method="post" action="?/logout" use:enhance class="logout-form">
				<button type="submit" class="btn btn-secondary">
					<span class="nav-icon">🚪</span>
					{#if !$sidebar}
						<span class="nav-text">Cerrar sesión</span>
					{/if}
				</button>
			</form>
		</aside>

		<main class="main-content">
			{@render children()}
		</main>
	</div>
{:else}
	{@render children()}
{/if}

<style>
	/* Estructura principal */
	.dashboard-container {
		display: grid;
		grid-template-columns: auto 1fr;
		min-height: 100vh;
		background: var(--base);
		transition: grid-template-columns 0.3s ease;
	}

	.dashboard-container.collapsed {
		grid-template-columns: 80px 1fr;
	}

	/* Sidebar */
	.sidebar {
		width: 280px;
		background: var(--mantle);
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		border-right: 1px solid var(--surface1);
		transition:
			width 0.3s ease,
			padding 0.3s ease;
		overflow: hidden;
		height: 100vh;
		position: sticky;
		top: 0;
		box-sizing: border-box;
	}

	.dashboard-container.collapsed .sidebar {
		width: 80px;
		padding: 1rem 0.5rem;
		align-items: center;
	}

	/* Botón de colapsar */
	.collapse-button {
		background: none;
		border: none;
		color: var(--text);
		cursor: pointer;
		padding: 0.5rem;
		margin-bottom: 1rem;
		border-radius: 0px;
		transition: background-color 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: end;
		width: 100%;
		margin-top: auto;
		padding-top: 1.5rem;
		border-top: 1px solid var(--surface1);
	}
	.collapse-button.collapsed {
		justify-content: center;
	}

	/* Información de usuario */
	.user-info {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--surface1);
		transition: all 0.3s ease;
	}

	.user-info.collapsed {
		flex-direction: column;
		align-items: center;
		padding-bottom: 1rem;
		margin-bottom: 1rem;
		gap: 0.5rem;
	}

	.user-avatar {
		width: 50px;
		height: 50px;
		border-radius: 50%;
		background: var(--mauve);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		font-weight: bold;
		flex-shrink: 0;
	}

	.user-details {
		flex: 1;
		overflow: hidden;
	}

	.username {
		font-size: 1.2rem;
		color: var(--text);
		margin-bottom: 0.25rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.status-badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 999px;
		font-size: 0.8rem;
		font-weight: 500;
	}

	.status-badge.active {
		background-color: color-mix(in srgb, var(--green) 20%, transparent);
		color: var(--green);
	}

	.status-badge.inactive {
		background-color: color-mix(in srgb, var(--blue) 20%, transparent);
		color: var(--blue);
	}

	/* Menú de navegación */
	.nav-menu ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		color: var(--subtext1);
		text-decoration: none;
		transition: all 0.2s ease;
		white-space: nowrap;
	}

	.nav-link:hover {
		background: var(--surface0);
		color: var(--text);
	}

	.nav-link.active {
		background: var(--surface0);
		color: var(--mauve);
		font-weight: 500;
	}

	.nav-icon {
		font-size: 1.5rem;
		width: 1.5rem;
		text-align: center;
		flex-shrink: 0;
	}

	.nav-text {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.dashboard-container.collapsed .nav-text,
	.dashboard-container.collapsed .user-details {
		display: none;
	}

	.dashboard-container.collapsed .nav-link {
		justify-content: center;
		padding: 0.75rem;
	}

	/* Formulario de logout */
	/* .logout-form {
		margin-top: auto;
		padding-top: 1.5rem;
		border-top: 1px solid var(--surface1);
	} */

	.logout-form button {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem 1rem;
	}

	.dashboard-container.collapsed .logout-form button {
		justify-content: center;
	}

	/* Contenido principal */
	.main-content {
		padding: 2rem;
		background: var(--base);
		overflow-y: auto;
		height: 100vh;
		box-sizing: border-box;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.dashboard-container {
			grid-template-columns: 1fr;
		}

		.sidebar {
			width: 100%;
			position: static;
			height: auto;
		}

		.main-content {
			height: auto;
			min-height: calc(100vh - 200px);
		}
	}
</style>
