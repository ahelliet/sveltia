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

// A nav/footer link points at one of four things depending on `type` (the
// list-with-types widget's discriminator field — see the &navLinkTypes
// anchor in config.yml, same idea as the &blockTypes page builder): a CMS
// "Pages" entry, a blog article, an anchor on the current page, or a
// free-typed URL. `page`/`post` store just the slug (Sveltia's relation
// widget with `value_field: "{{slug}}"`). `anchor` is optional on
// page/post links (jumps to a section of that page) and required on
// "anchor" links (jumps to a section of the current page).
export type NavLink = {
	type?: 'page' | 'post' | 'anchor' | 'url';
	label: string;
	page?: string;
	post?: string;
	anchor?: string;
	url?: string;
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
export const navigation: Navigation = {
	navLinks: navigationData.navLinks ?? [],
	footerText: navigationData.footerText,
	footerLinks: navigationData.footerLinks ?? []
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

// Turns a nav/footer link into an actual href. Mirrored in
// static/admin/preview.js (resolveLinkHref) so the "Navigation" preview
// stays consistent with the real header/footer — if you change this,
// change that too.
export function resolveLinkHref(link: NavLink): string {
	const anchor = link.anchor ? `#${link.anchor}` : '';

	if (link.type === 'page' && link.page) return `/${link.page}${anchor}`;
	if (link.type === 'post' && link.post) return `/blog/${link.post}${anchor}`;
	if (link.type === 'anchor' && link.anchor) return `#${link.anchor}`;
	return link.url || '#';
}
