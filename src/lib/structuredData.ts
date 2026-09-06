// JSON-LD (schema.org) builders. settings.seo.organizationName/
// organizationLogo/sameAs exist specifically to feed this (see the "GEO"
// hint in static/admin/config.yml) but, until this file, nothing ever
// consumed them — a search engine or an AI answer engine had no structured
// data to read regardless of what was filled in there.
import { absoluteUrl, settings } from './site';

// Serializes a JSON-LD payload for a <script type="application/ld+json">
// tag. Escapes "<" so a value containing something like "</script>" (a
// post title someone pastes markup into, say) can't break out of the
// script tag — standard practice for embedding JSON inside HTML.
export function ldJsonScript(data: unknown): string {
	return JSON.stringify(data).replace(/</g, '\\u003c');
}

// Site-wide Organization + WebSite graph, meant to be rendered once (in
// +layout.svelte, so it's present on every page — normal practice for
// site-identity schema, unlike page-specific schema like Article below).
// Returns null when organizationName isn't set: an Organization node with
// no name is worse than no structured data at all, so this only ever
// renders once an editor has actually filled in "Paramètres globaux →
// Référencement (SEO & GEO) → Nom de l'organisation".
export function buildSiteStructuredData(): Record<string, unknown> | null {
	if (!settings.seo.organizationName) return null;

	const siteUrl = settings.seo.siteUrl;
	const organizationId = siteUrl ? `${siteUrl}#organization` : undefined;
	const websiteId = siteUrl ? `${siteUrl}#website` : undefined;

	const organization: Record<string, unknown> = {
		'@type': 'Organization',
		'@id': organizationId,
		name: settings.seo.organizationName,
		url: siteUrl || undefined
	};
	if (settings.seo.organizationLogo) {
		organization.logo = absoluteUrl(settings.seo.organizationLogo);
	}
	if (settings.seo.sameAs.length > 0) {
		organization.sameAs = settings.seo.sameAs;
	}

	const website: Record<string, unknown> = {
		'@type': 'WebSite',
		'@id': websiteId,
		name: settings.siteName,
		url: siteUrl || undefined,
		publisher: organizationId ? { '@id': organizationId } : undefined
	};

	return {
		'@context': 'https://schema.org',
		'@graph': [organization, website]
	};
}

// Per-article BlogPosting schema (blog/[slug]/+page.svelte). `author`
// falls back to the organization name (this site has no per-post author
// field), and `image`/`datePublished` are omitted rather than emitted
// empty when the post has none — an empty string in structured data is
// worse than a missing property.
export function buildArticleStructuredData(post: {
	title: string;
	description?: string;
	image?: string;
	datePublished: string;
	url: string;
}): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: post.title,
		description: post.description || undefined,
		image: post.image ? absoluteUrl(post.image) : undefined,
		datePublished: post.datePublished,
		mainEntityOfPage: absoluteUrl(post.url),
		author: settings.seo.organizationName
			? { '@type': 'Organization', name: settings.seo.organizationName }
			: undefined,
		publisher: settings.seo.organizationName
			? {
					'@type': 'Organization',
					name: settings.seo.organizationName,
					logo: settings.seo.organizationLogo
						? { '@type': 'ImageObject', url: absoluteUrl(settings.seo.organizationLogo) }
						: undefined
				}
			: undefined
	};
}
