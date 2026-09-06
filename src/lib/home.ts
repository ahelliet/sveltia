import matter from 'gray-matter';
import { marked } from 'marked';
import { parseBlocks, type Block } from './blocks';
import { parseSeo, type Seo } from './seo';
// Server-only import (see src/routes/+page.server.ts): gray-matter/marked
// are Node-oriented and shouldn't end up in the client bundle — same
// rationale as src/lib/posts.ts/pages.ts, just for a single file instead of
// a `folder:` collection, so a plain `?raw` import replaces
// import.meta.glob here.
import raw from '../../content/home.md?raw';

export type Home = {
	blocks: Block[];
	seo: Seo;
};

// content/home.md is the "home" singleton in static/admin/config.yml — the
// homepage ("/") always renders this file's blocks, no "isHomePage" flag or
// lookup involved (see src/routes/+page.svelte).
const { data } = matter(raw);

export const home: Home = {
	blocks: parseBlocks(data.blocks, marked),
	seo: parseSeo(data.seo)
};
