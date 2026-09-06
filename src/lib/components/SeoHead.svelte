<script lang="ts">
	import { page } from '$app/state';
	import { absoluteUrl, buildPageTitle, settings } from '$lib/site';

	// One component, used by every route, so the SEO/GEO data collected in
	// "Paramètres globaux" (and the per-entry "seo" field on posts/pages)
	// actually reaches the HTML instead of sitting unused in
	// content/*.json — previously only <title> was set anywhere on the
	// site, despite all this data being editable in the CMS.
	//
	// `title` is the page-specific title only (e.g. "Contact", or a post's
	// title/metaTitle) — settings.seo.titleTemplate is applied here, once,
	// rather than by every caller. The homepage has no title of its own
	// (see src/routes/+page.svelte) and passes `applyTemplate={false}` to
	// skip that (a template like "%s · %s" would otherwise repeat the site
	// name twice).
	let {
		title,
		description,
		image,
		noIndex = false,
		type = 'website',
		publishedTime,
		applyTemplate = true
	}: {
		title: string;
		description?: string;
		image?: string;
		noIndex?: boolean;
		type?: 'website' | 'article';
		publishedTime?: string;
		applyTemplate?: boolean;
	} = $props();

	let pageTitle = $derived(applyTemplate ? buildPageTitle(title) : title);
	let metaDescription = $derived(description || settings.siteDescription || '');
	let ogImage = $derived(absoluteUrl(image || settings.defaultImage || ''));
	// page.url.pathname is correct even during prerendering (SvelteKit sets
	// it per crawled route), so every route gets a real canonical URL
	// without having to pass its own path in.
	let canonical = $derived(absoluteUrl(page.url.pathname));
	let robots = $derived(
		noIndex || !settings.seo.robotsIndexing ? 'noindex, nofollow' : 'index, follow'
	);
</script>

<svelte:head>
	<title>{pageTitle}</title>
	{#if metaDescription}
		<meta name="description" content={metaDescription} />
	{/if}
	<meta name="robots" content={robots} />
	{#if canonical}
		<link rel="canonical" href={canonical} />
	{/if}

	<meta property="og:type" content={type} />
	<meta property="og:title" content={pageTitle} />
	{#if metaDescription}
		<meta property="og:description" content={metaDescription} />
	{/if}
	{#if canonical}
		<meta property="og:url" content={canonical} />
	{/if}
	<meta property="og:site_name" content={settings.siteName} />
	{#if settings.seo.locale}
		<meta property="og:locale" content={settings.seo.locale} />
	{/if}
	{#if ogImage}
		<meta property="og:image" content={ogImage} />
	{/if}
	{#if type === 'article' && publishedTime}
		<meta property="article:published_time" content={publishedTime} />
	{/if}

	<meta name="twitter:card" content={settings.seo.twitterCardType} />
	{#if settings.seo.twitterHandle}
		<meta name="twitter:site" content={settings.seo.twitterHandle} />
	{/if}
	<meta name="twitter:title" content={pageTitle} />
	{#if metaDescription}
		<meta name="twitter:description" content={metaDescription} />
	{/if}
	{#if ogImage}
		<meta name="twitter:image" content={ogImage} />
	{/if}

	{#if settings.seo.googleSiteVerification}
		<meta name="google-site-verification" content={settings.seo.googleSiteVerification} />
	{/if}
</svelte:head>
