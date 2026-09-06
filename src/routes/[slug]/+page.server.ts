import { error } from '@sveltejs/kit';
import { getAllPages, getPageBySlug } from '$lib/pages';
import type { EntryGenerator, PageServerLoad } from './$types';

// Tells `adapter-static` which page slugs exist, so every CMS-authored page
// gets its own prerendered HTML file at build time — the client can create
// as many as they want from the "Pages" collection, no route changes ever
// needed. Reserved slugs ("blog", "admin") are already filtered out in
// getAllPages().
export const entries: EntryGenerator = () => {
	return getAllPages().map((page) => ({ slug: page.slug }));
};

export const load: PageServerLoad = async ({ params }) => {
	const page = getPageBySlug(params.slug);
	if (!page) {
		throw error(404, 'Page introuvable');
	}
	return { page };
};
