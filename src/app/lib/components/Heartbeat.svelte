<script lang="ts">
	// Configuración con props usando runes
	let { endpoint = '/api/heartbeat', interval = 60000 } = $props<{
		endpoint?: string;
		interval?: number;
	}>();

	// Estado reactivo
	let lastSuccess = $state<Date | null>(null);
	let lastAttempt = $state<Date | null>(null);
	let errorCount = $state(0);
	let isActive = $state(true);
	let isManualRequest = $state(false);
	let nextRequest = $state<Date | null>(new Date(Date.now() + interval));
	const MAX_ERRORS = 3;

	// Función para el POST con manejo de errores mejorado
	async function postHeartbeat(manual = false) {
		if (!isActive && !manual) return;

		isManualRequest = manual;
		lastAttempt = new Date();

		try {
			const response = await fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});

			if (response.ok) {
				lastSuccess = new Date();
				errorCount = 0;
			} else {
				throw new Error(`HTTP error: ${response.status}`);
			}
		} catch (error) {
			console.error('Heartbeat failed:', error);
			errorCount++;

			if (errorCount >= MAX_ERRORS) {
				isActive = false;
			}
		} finally {
			isManualRequest = false;
		}
	}

	// Efecto para manejar el intervalo automático
	$effect(() => {
		if (typeof window === 'undefined') return;

		let intervalId: NodeJS.Timeout;

		if (isActive) {
			postHeartbeat(false); // Llamada inicial automática
			intervalId = setInterval(() => postHeartbeat(false), interval);
			nextRequest = new Date(Date.now() + interval);
		}

		return () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
		};
	});

	function toggleHeartbeat() {
		isActive = !isActive;
		if (isActive) {
			errorCount = 0; // Reset error counter when reactivating
			postHeartbeat(false);
		}
	}
</script>

<div class="heartbeat-monitor">
	<div class="status-line">
		<span>
			{isActive ? `Activo` : 'Pausado'}
		</span>
		<span class="status-indicator {isActive ? 'active' : 'inactive'}">
			{isActive ? '🟢' : '🔴'}
		</span>
	</div>

	{#if lastSuccess}
		<div class="last-success">
			Última: {lastSuccess.toLocaleTimeString()}
		</div>
	{/if}

	{#if lastAttempt && !lastSuccess}
		<div class="last-attempt">
			Última: {lastAttempt.toLocaleTimeString()}
		</div>
	{/if}

	{#if nextRequest}
		<div class="next-request">
			Proximo: {nextRequest.toLocaleTimeString()}
		</div>
	{/if}

	{#if errorCount > 0}
		<div class="error-count">
			Errores: {errorCount}/{MAX_ERRORS}
		</div>
	{/if}

	<div class="controls">
		<button onclick={() => postHeartbeat(true)} disabled={isManualRequest} class="manual-trigger">
			{isManualRequest ? 'Sync...' : 'Ahora'}
		</button>

		<button onclick={toggleHeartbeat} class="toggle-heartbeat">
			{isActive ? 'Pausar' : 'Reanudar'}
		</button>
	</div>
</div>

<style>
	.heartbeat-monitor {
		position: fixed;
		bottom: 20px;
		right: 20px;
		font-size: 0.6rem;
		background: var(--surface-1);
		padding: 0.55rem;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		border: 1px solid var(--surface-3);
		max-width: 260px;
		z-index: 1000;
	}

	.status-line {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
		font-weight: 500;
	}

	.status-indicator {
		font-size: 0.8rem;
	}

	.status-indicator.active {
		color: var(--success);
	}

	.status-indicator.inactive {
		color: var(--error);
	}

	.last-success,
	.last-attempt,
	.next-request,
	.error-count {
		font-size: 0.55rem;
		margin: 0.15rem 0;
		color: var(--text-2);
	}

	.last-success {
		color: var(--success);
	}

	.next-request {
		color: var(--warning);
	}

	.error-count {
		color: var(--error);
	}

	.controls {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.65rem;
	}

	button {
		flex: 1;
		padding: 0.25rem 0.4rem;
		border: none;
		border-radius: 4px;
		font-size: 0.6rem;
		cursor: pointer;
		transition: background 0.2s;
		min-height: 25px;
	}

	.manual-trigger {
		background: var(--brand);
	}

	.manual-trigger:hover {
		background: var(--surface-4);
	}

	.manual-trigger:disabled {
		background: var(--surface-3);
		cursor: not-allowed;
	}

	.toggle-heartbeat {
		background: var(--surface-3);
	}

	.toggle-heartbeat:hover {
		background: var(--surface-4);
	}

	@media (max-width: 768px) {
		.heartbeat-monitor {
			bottom: 10px;
			right: 10px;
			max-width: 200px;
		}
	}
</style>
