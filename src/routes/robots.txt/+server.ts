import { settings } from '$lib/site';

// Same principle as sitemap.xml/+server.ts: prerendered to a literal
// static file, no server needed at runtime.
export const prerender = true;

export function GET() {
	const allowAll = settings.seo.robotsIndexing;
	const lines = allowAll ? ['User-agent: *', 'Allow: /'] : ['User-agent: *', 'Disallow: /'];

	if (settings.seo.siteUrl) {
		lines.push('', `Sitemap: ${settings.seo.siteUrl}/sitemap.xml`);
	}

	return new Response(lines.join('\n') + '\n', {
		headers: { 'Content-Type': 'text/plain' }
	});
}
