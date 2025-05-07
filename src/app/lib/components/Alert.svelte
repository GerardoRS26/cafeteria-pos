<script lang="ts">
	const {
		type = 'info',
		message,
		dismissible = true,
		dismiss
	} = $props<{
		type?: 'success' | 'error' | 'warning' | 'info';
		message: string;
		dismissible?: boolean;
		dismiss: () => void;
	}>();
</script>

<div class={['alert', type]}>
	<span class="alert-message">{message}</span>
	{#if dismissible}
		<button class="alert-close" onclick={dismiss}>×</button>
	{/if}
</div>

<style>
	.alert {
		display: flex;
		align-items: center;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1.5rem;
		position: relative;
	}

	.alert.success {
		background-color: color-mix(in srgb, var(--green) 15%, transparent);
		border-left: 4px solid var(--green);
		color: var(--green);
	}

	.alert.error {
		background-color: color-mix(in srgb, var(--red) 15%, transparent);
		border-left: 4px solid var(--red);
		color: var(--red);
	}

	.alert-close {
		background: none;
		border: none;
		color: inherit;
		font-size: 1.25rem;
		cursor: pointer;
		margin-left: auto;
		padding: 0;
		display: flex;
	}
</style>
