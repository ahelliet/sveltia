import matter from 'gray-matter';
import { marked } from 'marked';
import { parseBlocks, type Block } from './blocks';
import { parseSeo, type Seo } from './seo';

export type { Block } from './blocks';

export type Page = {
	slug: string;
	title: string;
	blocks: Block[];
	seo: Seo;
};

// Routes that a CMS-authored page must not shadow: `/blog` (and its
// sub-routes) is a dedicated SvelteKit route, and `/admin` is served as a
// static file (the Sveltia CMS admin app) rather than going through
// SvelteKit routing at all. Both would silently either 404 or be
// unreachable if a page used one of these slugs, so such pages are
// filtered out here (with a build-time warning) instead of only being
// documented as "please don't do this" in the CMS. The homepage ("/") is a
// separate singleton (content/home.md, src/lib/home.ts), not a slug here,
// so there's no "home"/"" entry to reserve.
const RESERVED_SLUGS = new Set(['blog', 'admin']);

// Content lives at the repo root (`content/pages/*.md`), matching Sveltia
// CMS's `folder: "content/pages"` in static/admin/config.yml — same
// principle as src/lib/posts.ts.
const files = import.meta.glob('/content/pages/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
}) as Record<string, string>;

function parsePage(path: string, raw: string): Page {
	const slug = path.split('/').pop()!.replace(/\.md$/, '');
	const { data } = matter(raw);

	return {
		slug,
		title: data.title ?? slug,
		blocks: parseBlocks(data.blocks, marked),
		seo: parseSeo(data.seo)
	};
}

const pages = Object.entries(files)
	.map(([path, raw]) => parsePage(path, raw))
	.filter((page) => {
		if (RESERVED_SLUGS.has(page.slug)) {
			console.warn(
				`[content/pages] "${page.slug}.md" uses a reserved slug ("/${page.slug}" is already ` +
					'a built-in route) and will be skipped. Rename the file / its slug to publish it.'
			);
			return false;
		}
		return true;
	});

export function getAllPages(): Page[] {
	return pages;
}

export function getPageBySlug(slug: string): Page | undefined {
	return pages.find((page) => page.slug === slug);
}
