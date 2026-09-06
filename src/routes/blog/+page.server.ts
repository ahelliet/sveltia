import { getAllPosts } from '$lib/posts';
import type { PageServerLoad } from './$types';


export const load: PageServerLoad = async () => {
	const posts = getAllPosts().map(({ slug, title, date, excerpt }) => ({
		slug,
		title,
		date,
		excerpt
	}));
	return { posts };
};
