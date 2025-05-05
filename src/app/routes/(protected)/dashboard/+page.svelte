<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';

	const { data } = $props<{
		data: {
			user: {
				id: string;
				username: string;
				role: 'admin' | 'seller';
			};
		};
	}>();

	const currentPath = page.url.pathname;
	const isAdmin = $derived(data.user.role === 'admin');
</script>

<div class="dashboard-container">
	<!-- Contenido Principal -->
	<main class="main-content">
		<div class="welcome-card">
			<h1 class="welcome-title">Bienvenido, {data.user.username}!</h1>
			{#if isAdmin}
				<div class="welcome-stats">
					<div class="stat-card">
						<span class="stat-icon">📦</span>
						<span class="stat-value">24</span>
						<span class="stat-label">Productos Activos</span>
					</div>
					<div class="stat-card">
						<span class="stat-icon">💰</span>
						<span class="stat-value">$1,240</span>
						<span class="stat-label">Ventas Hoy</span>
					</div>
					<div class="stat-card">
						<span class="stat-icon">👥</span>
						<span class="stat-value">3</span>
						<span class="stat-label">Usuarios</span>
					</div>
				</div>
			{/if}
		</div>

		<!-- Sección de Acciones Rápidas -->
		<div class="quick-actions">
			<h2 class="section-title">Acciones Rápidas</h2>
			<div class="action-grid">
				<a href="/pos" class="action-card">
					<span class="action-icon">🛒</span>
					<span class="action-text">Nueva Venta</span>
				</a>
				{#if isAdmin}
					<a href="/products/admin/new" class="action-card">
						<span class="action-icon">➕</span>
						<span class="action-text">Nuevo Producto</span>
					</a>
					<a href="/reports" class="action-card">
						<span class="action-icon">📊</span>
						<span class="action-text">Ver Reportes</span>
					</a>
				{/if}
			</div>
		</div>
	</main>
</div>

<style>
	/* Estilos base */
	:global(:root) {
		--sidebar-width: 280px;
		--nav-icon-size: 1.5rem;
		--stat-card-bg: var(--surface0);
	}

	.dashboard-container {
		display: grid;
		grid-template-columns: 1fr;
		min-height: 100vh;
		background: var(--base);
	}

	/* Contenido Principal */
	.main-content {
		padding: 2rem;
		background: var(--base);
	}

	.welcome-card {
		background: var(--surface0);
		border-radius: 12px;
		padding: 2rem;
		margin-bottom: 2rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.welcome-title {
		font-size: 1.75rem;
		color: var(--text);
		margin-bottom: 1.5rem;
	}

	.welcome-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
	}

	.stat-card {
		background: var(--stat-card-bg);
		border-radius: 8px;
		padding: 1.5rem;
		text-align: center;
		border-left: 4px solid var(--peach);
	}

	.stat-icon {
		font-size: 2rem;
		display: block;
		margin-bottom: 0.5rem;
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: bold;
		color: var(--text);
		display: block;
		margin-bottom: 0.25rem;
	}

	.stat-label {
		font-size: 0.9rem;
		color: var(--subtext1);
	}

	/* Acciones Rápidas */
	.section-title {
		font-size: 1.5rem;
		color: var(--text);
		margin-bottom: 1.5rem;
	}

	.action-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
	}

	.action-card {
		background: var(--surface0);
		border-radius: 8px;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		text-decoration: none;
		color: var(--text);
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
		border: 1px solid var(--surface1);
	}

	.action-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		border-color: var(--mauve);
	}

	.action-icon {
		font-size: 2rem;
		margin-bottom: 1rem;
	}

	.action-text {
		font-size: 1rem;
		font-weight: 500;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.dashboard-container {
			grid-template-columns: 1fr;
		}

		.sidebar {
			width: 100%;
			position: sticky;
			top: 0;
			z-index: 10;
		}

		.main-content {
			padding: 1rem;
		}
	}
</style>
