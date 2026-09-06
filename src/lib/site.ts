import navigationDataRaw from '../../content/navigation.json';
import settingsDataRaw from '../../content/settings.json';

// The imports above get their TypeScript type from the literal JSON files
// on disk (Vite/TS infer the shape from what's actually there), which
// would break the moment a field is missing from content/*.json (e.g. a
// nav link written before "type" existed, or a fresh settings.json without
// "seo" yet). Casting to a loose shape here — instead of relying on that
// inferred type — means the parsing below is the single source of truth
// for what's optional, not the current contents of the file.
type RawNavLink = {
	type?: string;
	label?: string;
	page?: string;
	post?: string;
	anchor?: string;
	url?: string;
	links?: RawNavLink[];
};

type RawNavigation = {
	navLinks?: RawNavLink[];
	footerText?: string;
	footerLinks?: RawNavLink[];
};

type RawSeo = {
	siteUrl?: string;
	titleTemplate?: string;
	locale?: string;
	robotsIndexing?: boolean;
	twitterHandle?: string;
	twitterCardType?: string;
	organizationName?: string;
	organizationLogo?: string;
	sameAs?: string[];
	googleSiteVerification?: string;
};

type RawSettings = {
	siteName?: string;
	siteDescription?: string;
	favicon?: string;
	defaultImage?: string;
	contactEmail?: string;
	seo?: RawSeo;
};

const navigationData = navigationDataRaw as RawNavigation;
const settingsData = settingsDataRaw as RawSettings;

// A nav/footer link points at one of five things depending on `type` (the
// list-with-types widget's discriminator field — see the individually
// anchored &navLinkTypePage/Post/Anchor/Url in config.yml, same idea as the
// &blockTypes page builder): a CMS "Pages" entry, a blog article, an anchor
// on the current page, a free-typed URL, or (nav menu only, not the
// footer) a "dropdown" holding its own nested `links`. `page`/`post` store
// just the slug (Sveltia's relation widget with `value_field:
// "{{slug}}"`). `anchor` is optional on page/post links (jumps to a
// section of that page) and required on "anchor" links (jumps to a
// section of the current page). A dropdown's `links` only ever contains
// the four simple types — config.yml doesn't offer "dropdown" as one of
// its own sub-link types, so this doesn't nest further in practice, but
// the type stays recursive (`NavLink[]`) rather than a separate narrower
// type to keep resolveLinkHref/consumers simple.
export type NavLink = {
	type?: 'page' | 'post' | 'anchor' | 'url' | 'dropdown';
	label: string;
	page?: string;
	post?: string;
	anchor?: string;
	url?: string;
	links?: NavLink[];
};

export type Navigation = {
	navLinks: NavLink[];
	footerText?: string;
	footerLinks: NavLink[];
};

export type SiteSeo = {
	siteUrl: string;
	titleTemplate: string;
	locale: string;
	robotsIndexing: boolean;
	twitterHandle?: string;
	twitterCardType: string;
	organizationName?: string;
	organizationLogo?: string;
	sameAs: string[];
	googleSiteVerification?: string;
};

export type Settings = {
	siteName: string;
	siteDescription?: string;
	favicon?: string;
	defaultImage?: string;
	contactEmail?: string;
	seo: SiteSeo;
};

// Read at build time (same principle as src/lib/posts.ts): these come from
// the CMS's "Navigation" and "Paramètres globaux" singletons
// (content/navigation.json, content/settings.json), and Vite bundles a
// plain `import` of a .json file as a parsed object with no extra work.
// Normalizes a raw nav/footer link recursively — a "dropdown" link's own
// `links` go through the same parsing (defaulting to [] when absent), so
// nothing downstream needs to special-case a dropdown with no sub-links.
function parseNavLink(raw: RawNavLink): NavLink {
	return {
		type: raw.type as NavLink['type'],
		label: raw.label ?? '',
		page: raw.page,
		post: raw.post,
		anchor: raw.anchor,
		url: raw.url,
		links: raw.links?.map(parseNavLink) ?? []
	};
}

export const navigation: Navigation = {
	navLinks: (navigationData.navLinks ?? []).map(parseNavLink),
	footerText: navigationData.footerText,
	footerLinks: (navigationData.footerLinks ?? []).map(parseNavLink)
};

export const settings: Settings = {
	siteName: settingsData.siteName ?? '',
	siteDescription: settingsData.siteDescription,
	favicon: settingsData.favicon,
	defaultImage: settingsData.defaultImage,
	contactEmail: settingsData.contactEmail,
	seo: {
		siteUrl: (settingsData.seo?.siteUrl ?? '').replace(/\/$/, ''),
		titleTemplate: settingsData.seo?.titleTemplate || '%s · %s',
		locale: settingsData.seo?.locale || 'fr_FR',
		robotsIndexing: settingsData.seo?.robotsIndexing ?? true,
		twitterHandle: settingsData.seo?.twitterHandle,
		twitterCardType: settingsData.seo?.twitterCardType || 'summary_large_image',
		organizationName: settingsData.seo?.organizationName,
		organizationLogo: settingsData.seo?.organizationLogo,
		sameAs: settingsData.seo?.sameAs ?? [],
		googleSiteVerification: settingsData.seo?.googleSiteVerification
	}
};

// Turns a nav/footer link into an actual href. Not meaningful for a
// "dropdown" link itself (it has no destination of its own — only its
// nested `links` do); callers render a dropdown as a trigger + submenu
// instead of a plain <a>, so this just falls through to '#' for one.
// Mirrored in static/admin/preview.js (resolveLinkHref) so the
// "Navigation" preview stays consistent with the real header/footer — if
// you change this, change that too.
export function resolveLinkHref(link: NavLink): string {
	const anchor = link.anchor ? `#${link.anchor}` : '';

	if (link.type === 'page' && link.page) return `/${link.page}${anchor}`;
	if (link.type === 'post' && link.post) return `/blog/${link.post}${anchor}`;
	if (link.type === 'anchor' && link.anchor) return `#${link.anchor}`;
	if (link.type === 'dropdown') return '#';
	return link.url || '#';
}

// Composes a page-specific title with settings.seo.titleTemplate (default
// "%s · %s": page title, then site name — see the hint in config.yml).
// Replaces the two "%s" placeholders in order rather than assuming exactly
// two, so a template with a different number of them (or none) degrades
// gracefully instead of throwing. Used by SeoHead.svelte for every page
// except the homepage, which has no "page title" of its own to prefix (see
// src/routes/+page.svelte).
export function buildPageTitle(pageTitle: string): string {
	let first = true;
	return settings.seo.titleTemplate.replace(/%s/g, () => {
		const value = first ? pageTitle : settings.siteName;
		first = false;
		return value;
	});
}

// Turns a possibly-relative path/URL (a CMS image field, or the current
// page's pathname) into an absolute one against settings.seo.siteUrl — Open
// Graph/Twitter Card images and <link rel="canonical"> must be absolute
// per spec, and JSON-LD image/logo fields should be too. Same fallback
// philosophy as sitemap.xml/+server.ts: if siteUrl isn't set yet, returns
// the path as-is (relative) rather than throwing, with the same
// "set this before deploying" burden already documented there.
export function absoluteUrl(path: string): string {
	if (!path) return '';
	if (/^https?:\/\//.test(path)) return path;
	if (!settings.seo.siteUrl) return path;
	return `${settings.seo.siteUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}
