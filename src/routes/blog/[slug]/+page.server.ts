import { error } from '@sveltejs/kit';
import { getAllPosts, getPostBySlug } from '$lib/posts';
import type { EntryGenerator, PageServerLoad } from './$types';


// Tells `adapter-static` which `[slug]` values exist, so every article gets
// its own prerendered HTML file at build time.
export const entries: EntryGenerator = () => {
	return getAllPosts().map((post) => ({ slug: post.slug }));
};

export const load: PageServerLoad = async ({ params }) => {
	const post = getPostBySlug(params.slug);
	if (!post) {
		throw error(404, 'Article introuvable');
	}
	return { post };
};
