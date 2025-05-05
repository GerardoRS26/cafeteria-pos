import { writable } from 'svelte/store';

function createSidebarStore() {
	const { subscribe, set, update } = writable(false);

	return {
		subscribe,
		collapse: () => set(true),
		expand: () => set(false),
		toggle: () => update((n) => !n)
	};
}

export const sidebar = createSidebarStore();
