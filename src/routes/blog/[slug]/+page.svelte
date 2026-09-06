<script lang="ts">
	import { AspectRatio } from '$lib/components/ui/aspect-ratio/index.js';
	import Blocks from '$lib/components/Blocks.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { page } from '$app/state';
	import { buildArticleStructuredData, ldJsonScript } from '$lib/structuredData';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// BlogPosting schema for this one article — separate from the
	// site-wide Organization/WebSite graph in +layout.svelte, since this
	// is per-entry data (title, date, image) that only makes sense here.
	let articleStructuredData = $derived(
		buildArticleStructuredData({
			title: data.post.seo.metaTitle || data.post.title,
			description: data.post.seo.metaDescription || data.post.excerpt,
			image: data.post.seo.ogImage || data.post.heroImage,
			datePublished: data.post.date,
			url: page.url.pathname
		})
	);
</script>

<SeoHead
	title={data.post.seo.metaTitle || data.post.title}
	description={data.post.seo.metaDescription || data.post.excerpt}
	image={data.post.seo.ogImage || data.post.heroImage}
	noIndex={data.post.seo.noIndex}
	type="article"
	publishedTime={data.post.date}
/>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html `<script type="application/ld+json">${ldJsonScript(articleStructuredData)}<\/script>`}
</svelte:head>

<article class="mx-auto max-w-3xl px-4 py-12">
	<h1 class="text-3xl font-bold tracking-tight">{data.post.title}</h1>
	<p class="mt-2 text-sm text-muted-foreground">
		{new Date(data.post.date).toLocaleDateString('fr-FR')}
	</p>
	{#if data.post.heroImage}
		<AspectRatio ratio={16 / 9} class="mt-6 overflow-hidden rounded-2xl bg-muted">
			<img
				src={data.post.heroImage}
				alt={data.post.heroImageAlt || data.post.title}
				class="h-full w-full object-cover"
			/>
		</AspectRatio>
	{/if}

	<div class="mt-8">
		<Blocks blocks={data.post.blocks} />
	</div>
</article>
