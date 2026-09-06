<script lang="ts">
	import Blocks from '$lib/components/Blocks.svelte';
	import type { Page } from '$lib/pages';

	let { page }: { page: Page } = $props();
</script>

<svelte:head>
	<title>{page.seo.metaTitle || page.title}</title>
</svelte:head>

<article class="mx-auto max-w-3xl px-4 py-12">
	<h1 class="text-3xl font-bold tracking-tight">{page.title}</h1>
	<div class="mt-8">
		<Blocks blocks={page.blocks} />
	</div>
</article>
