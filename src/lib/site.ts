import navigationData from '../../content/navigation.json';
import settingsData from '../../content/settings.json';

export type NavLink = {
	label: string;
	url: string;
};

export type Navigation = {
	navLinks: NavLink[];
	footerText?: string;
	footerLinks: NavLink[];
};

export type Settings = {
	siteName: string;
	siteDescription?: string;
	defaultImage?: string;
	contactEmail?: string;
};

// Read at build time (same principle as src/lib/posts.ts): these come from
// the CMS's "Navigation" and "Paramètres globaux" file collections
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
	defaultImage: settingsData.defaultImage,
	contactEmail: settingsData.contactEmail
};
