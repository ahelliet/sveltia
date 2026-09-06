import { getAllPages } from '$lib/pages';
import { getAllPosts } from '$lib/posts';
import { settings } from '$lib/site';

// Prerendered to a literal static/build file (SvelteKit treats a route
// segment with a dot, like "sitemap.xml", as a file rather than a
// directory) — no server needed at runtime, consistent with the rest of
// this fully static site.
export const prerender = true;

export function GET() {
	const siteUrl = settings.seo.siteUrl;

	if (!siteUrl) {
		console.warn(
			'[sitemap.xml] "URL du site (production)" est vide dans Paramètres globaux → ' +
				'Référencement (SEO & GEO) : les URLs du sitemap seront relatives, ce que les ' +
				"moteurs de recherche n'accepteront pas. À renseigner avant de déployer."
		);
	}

	const paths = [
		'/',
		'/blog',
		...getAllPages().map((page) => `/${page.slug}`),
		...getAllPosts().map((post) => `/blog/${post.slug}`)
	];

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `  <url><loc>${siteUrl}${path}</loc></url>`).join('\n')}
</urlset>
`;

	return new Response(body, {
		headers: { 'Content-Type': 'application/xml' }
	});
}
