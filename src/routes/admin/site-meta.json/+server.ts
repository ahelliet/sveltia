import { settings } from '$lib/site';

// Tiny static JSON file exposing just the site name, fetched by
// static/admin/preview.js before the CMS initializes (see the
// `window.CMS_MANUAL_INIT` flag in static/admin/index.html) so the admin's
// title can read "<Nom du site>" instead of the default "Sveltia CMS" once
// it's set in Paramètres globaux — see the README's "Titre de l'admin"
// section. Prerendered like sitemap.xml/robots.txt/rss.xml, so this stays a
// plain static file with no server at runtime.
export const prerender = true;

export function GET() {
	return new Response(JSON.stringify({ siteName: settings.siteName || null }), {
		headers: { 'Content-Type': 'application/json' }
	});
}
