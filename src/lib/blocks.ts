// Shared "page builder" block types + parser, used by both src/lib/posts.ts
// (blog articles) and src/lib/pages.ts (freeform pages) since both content
// types share the exact same `blocks` field/types in
// static/admin/config.yml (see the `&blockTypes` YAML anchor there).

export type TextBlock = { type: 'text'; html: string };
export type ImageBlock = { type: 'image'; image: string; caption?: string; alt?: string };
export type ImageTextBlock = {
	type: 'image_text';
	image: string;
	alt?: string;
	html: string;
	imageOnRight: boolean;
};
export type QuoteBlock = { type: 'quote'; quote: string; author?: string };
export type GalleryBlock = { type: 'gallery'; images: { image: string; alt?: string }[] };
export type DocumentItem = { label: string; file: string; description?: string };
export type DocumentsBlock = { type: 'documents'; documents: DocumentItem[] };

export type Block =
	| TextBlock
	| ImageBlock
	| ImageTextBlock
	| QuoteBlock
	| GalleryBlock
	| DocumentsBlock;

// Turns the raw frontmatter `blocks` array (written by Sveltia CMS's
// list-with-types widget — one variant per block `name` in config.yml) into
// typed blocks, rendering any Markdown sub-fields to HTML along the way.
export function parseBlocks(raw: unknown, marked: { parse: (s: string, o: { async: false }) => string }): Block[] {
	if (!Array.isArray(raw)) return [];

	return raw
		.map((entry): Block | null => {
			const block = entry as Record<string, unknown>;

			switch (block.type) {
				case 'text':
					return {
						type: 'text',
						html: marked.parse(String(block.body ?? ''), { async: false })
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
						alt: block.alt as string | undefined,
						html: marked.parse(String(block.body ?? ''), { async: false }),
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
				case 'documents':
					return {
						type: 'documents',
						documents: Array.isArray(block.documents)
							? (block.documents as Record<string, unknown>[]).map((doc) => ({
									label: String(doc.label ?? ''),
									file: String(doc.file ?? ''),
									description: doc.description as string | undefined
								}))
							: []
					};
				default:
					return null;
			}
		})
		.filter((block): block is Block => block !== null);
}
