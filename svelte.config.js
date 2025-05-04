import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	appDir: 'src/app',

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter(),
		alias: {
			$lib: 'src/app/lib',
			'@domain': './src/core/domain',
			'@infrastructure': './src/core/infrastructure',
			'@presentation': './src/core/presentation',
			'@shared': './src/core/shared',
			'@application': './src/core/application'
		},
		files: {
			appTemplate: 'src/app/app.html',
			routes: 'src/app/routes',
			lib: 'src/app/lib',
			assets: 'src/app/static'
		}
	}
};

export default config;
