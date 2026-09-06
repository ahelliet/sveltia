<script lang="ts">
	import '../app.css';
	import faviconDefault from '$lib/assets/favicon.svg';
	import Footer from '$lib/components/Footer.svelte';
	import Navigation from '$lib/components/Navigation.svelte';
	import { settings } from '$lib/site';
	import { buildSiteStructuredData, ldJsonScript } from '$lib/structuredData';

	let { children } = $props();

	// Organization + WebSite JSON-LD, site-wide (same data on every page —
	// normal for site-identity schema, unlike an article's own schema).
	// null until "Nom de l'organisation" is filled in (see
	// buildSiteStructuredData's own comment) — nothing renders until then.
	let siteStructuredData = $derived(buildSiteStructuredData());
</script>

<svelte:head>
	<link rel="icon" href={settings.favicon || faviconDefault} />
	{#if siteStructuredData}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html `<script type="application/ld+json">${ldJsonScript(siteStructuredData)}<\/script>`}
	{/if}
</svelte:head>

<div class="flex min-h-screen flex-col">
	<Navigation />
	<main class="flex-1">
		{@render children()}
	</main>
	<Footer />
</div>
