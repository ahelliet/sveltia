import { getAllPosts } from '$lib/posts';
import { settings } from '$lib/site';

// Same principle as sitemap.xml/+server.ts: prerendered to a literal
// static file, no server needed at runtime.
export const prerender = true;

function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

export function GET() {
	const siteUrl = settings.seo.siteUrl;
	const posts = getAllPosts();

	const items = posts
		.map((post) => {
			const link = `${siteUrl}/blog/${post.slug}`;
			return `    <item>
      <title>${escapeXml(post.seo.metaTitle || post.title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
${post.excerpt ? `      <description>${escapeXml(post.excerpt)}</description>\n` : ''}    </item>`;
		})
		.join('\n');

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(settings.siteName)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(settings.siteDescription || '')}</description>
${items}
  </channel>
</rss>
`;

	return new Response(body, {
		headers: { 'Content-Type': 'application/xml' }
	});
}
