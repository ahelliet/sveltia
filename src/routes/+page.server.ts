import { home } from '$lib/home';
import type { PageServerLoad } from './$types';

// content/home.md (the "home" singleton in the CMS) always drives "/" — no
// flag or lookup needed, unlike the old "isHomePage" checkbox on a Pages
// entry (see the README for why that approach was replaced).
export const load: PageServerLoad = async () => {
	return { home };
};
