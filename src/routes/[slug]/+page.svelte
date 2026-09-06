<script lang="ts">
	import Blocks from '$lib/components/Blocks.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.page.seo.metaTitle || data.page.title}</title>
</svelte:head>

<article class="mx-auto max-w-3xl px-4 py-12">
	<h1 class="text-3xl font-bold tracking-tight">{data.page.title}</h1>
	<div class="mt-8">
		<Blocks blocks={data.page.blocks} />
	</div>
</article>
