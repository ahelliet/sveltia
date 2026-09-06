import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// Sveltia CMS needs no backend at all (it talks to GitHub directly from
			// the browser), so the whole site can be plain static HTML — deployable
			// anywhere (Netlify, Cloudflare Pages, GitHub Pages, a plain web server).
			adapter: adapter({ fallback: undefined })
		})
	]
});
