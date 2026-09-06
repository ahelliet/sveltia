import matter from 'gray-matter';
import { marked } from 'marked';
import { parseBlocks, type Block } from './blocks';
import { parseSeo, type Seo } from './seo';

export type { Block } from './blocks';

export type Post = {
	slug: string;
	title: string;
	date: string;
	excerpt?: string;
	heroImage?: string;
	heroImageAlt?: string;
	blocks: Block[];
	seo: Seo;
};

// Content lives at the repo root (`content/posts/*.md`) so Sveltia CMS's
// `folder: "content/posts"` in static/admin/config.yml matches exactly what
// gets read here — no API, no backend: this runs at build time (and in dev)
// and reads the Markdown files straight off disk.
const files = import.meta.glob('/content/posts/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
}) as Record<string, string>;

function parsePost(path: string, raw: string): Post {
	const slug = path.split('/').pop()!.replace(/\.md$/, '');
	const { data } = matter(raw);
	return {
		slug,
		title: data.title ?? slug,
		date: data.date ? new Date(data.date).toISOString() : new Date(0).toISOString(),
		excerpt: data.excerpt,
		heroImage: data.heroImage,
		heroImageAlt: data.heroImageAlt,
		blocks: parseBlocks(data.blocks, marked),
		seo: parseSeo(data.seo)
	};
}

const posts = Object.entries(files)
	.map(([path, raw]) => parsePost(path, raw))
	.sort((a, b) => (a.date < b.date ? 1 : -1));

export function getAllPosts(): Post[] {
	return posts;
}

export function getPostBySlug(slug: string): Post | undefined {
	return posts.find((post) => post.slug === slug);
}
