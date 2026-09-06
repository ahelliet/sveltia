<script lang="ts">
	import Blocks from '$lib/components/Blocks.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import type { Page } from '$lib/pages';

	let { page }: { page: Page } = $props();
</script>

<SeoHead
	title={page.seo.metaTitle || page.title}
	description={page.seo.metaDescription}
	image={page.seo.ogImage}
	noIndex={page.seo.noIndex}
/>

<article class="mx-auto max-w-3xl px-4 py-12">
	<h1 class="text-3xl font-bold tracking-tight">{page.title}</h1>
	<div class="mt-8">
		<Blocks blocks={page.blocks} />
	</div>
</article>
