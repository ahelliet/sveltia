import type { Handle } from '@sveltejs/kit';
import { settings } from '$lib/site';

// src/app.html has `<html lang="%lang%">` — a plain placeholder, not a
// SvelteKit built-in like %sveltekit.head% — replaced here with the real
// language from "Paramètres globaux → Référencement (SEO & GEO) → Langue /
// locale" (settings.seo.locale, e.g. "fr_FR") converted to a valid HTML
// lang attribute ("fr-FR"). This runs at prerender time (the site has no
// runtime server — see adapter: adapter({ fallback: undefined }) in
// vite.config.ts), so the result is baked into the static HTML like
// everything else; it was hardcoded to "en" before, which is wrong for a
// French site both for accessibility (screen readers picking the wrong
// pronunciation) and SEO (search engines using the wrong language signal).
export const handle: Handle = async ({ event, resolve }) => {
	const lang = (settings.seo.locale || 'fr_FR').replace('_', '-');

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', lang)
	});
};
