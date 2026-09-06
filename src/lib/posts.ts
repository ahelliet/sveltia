import matter from 'gray-matter';
import { marked } from 'marked';

export type TextBlock = { type: 'text'; html: string };
export type ImageBlock = { type: 'image'; image: string; caption?: string; alt?: string };
export type ImageTextBlock = {
	type: 'image_text';
	image: string;
	html: string;
	imageOnRight: boolean;
};
export type QuoteBlock = { type: 'quote'; quote: string; author?: string };
export type GalleryBlock = { type: 'gallery'; images: { image: string; alt?: string }[] };

export type Block = TextBlock | ImageBlock | ImageTextBlock | QuoteBlock | GalleryBlock;

export type Post = {
	slug: string;
	title: string;
	date: string;
	excerpt?: string;
	heroImage?: string;
	blocks: Block[];
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

// Turns the raw frontmatter `blocks` array (written by Sveltia CMS's
// list-with-types widget — one variant per block `name` in config.yml) into
// typed blocks, rendering any Markdown sub-fields to HTML along the way.
function parseBlocks(raw: unknown): Block[] {
	if (!Array.isArray(raw)) return [];

	return raw
		.map((entry): Block | null => {
			const block = entry as Record<string, unknown>;

			switch (block.type) {
				case 'text':
					return {
						type: 'text',
						html: marked.parse(String(block.body ?? ''), { async: false }) as string
					};
				case 'image':
					return {
						type: 'image',
						image: String(block.image ?? ''),
						caption: block.caption as string | undefined,
						alt: block.alt as string | undefined
					};
				case 'image_text':
					return {
						type: 'image_text',
						image: String(block.image ?? ''),
						html: marked.parse(String(block.body ?? ''), { async: false }) as string,
						imageOnRight: Boolean(block.imageOnRight)
					};
				case 'quote':
					return {
						type: 'quote',
						quote: String(block.quote ?? ''),
						author: block.author as string | undefined
					};
				case 'gallery':
					return {
						type: 'gallery',
						images: Array.isArray(block.images)
							? (block.images as Record<string, unknown>[]).map((img) => ({
									image: String(img.image ?? ''),
									alt: img.alt as string | undefined
								}))
							: []
					};
				default:
					return null;
			}
		})
		.filter((block): block is Block => block !== null);
}

function parsePost(path: string, raw: string): Post {
	const slug = path.split('/').pop()!.replace(/\.md$/, '');
	const { data } = matter(raw);
	return {
		slug,
		title: data.title ?? slug,
		date: data.date ? new Date(data.date).toISOString() : new Date(0).toISOString(),
		excerpt: data.excerpt,
		heroImage: data.heroImage,
		blocks: parseBlocks(data.blocks)
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
