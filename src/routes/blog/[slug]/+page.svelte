<script lang="ts">
	import { AspectRatio } from '$lib/components/ui/aspect-ratio/index.js';
	import Blocks from '$lib/components/Blocks.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.post.title}</title>
</svelte:head>

<article class="mx-auto max-w-3xl px-4 py-12">
	<h1 class="text-3xl font-bold tracking-tight">{data.post.title}</h1>
	<p class="mt-2 text-sm text-muted-foreground">
		{new Date(data.post.date).toLocaleDateString('fr-FR')}
	</p>
	{#if data.post.heroImage}
		<AspectRatio ratio={16 / 9} class="mt-6 overflow-hidden rounded-2xl bg-muted">
			<img src={data.post.heroImage} alt={data.post.title} class="h-full w-full object-cover" />
		</AspectRatio>
	{/if}

	<div class="mt-8">
		<Blocks blocks={data.post.blocks} />
	</div>
</article>
