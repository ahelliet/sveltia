import { getHomePage } from '$lib/pages';
import type { PageServerLoad } from './$types';

// If an editor flags a CMS page as "page d'accueil" (Pages collection,
// `isHomePage`), it replaces the hardcoded intro below at "/" — no route
// change needed, the client just ticks the box on whichever page should be
// the homepage.
export const load: PageServerLoad = async () => {
	return { homePage: getHomePage() };
};
