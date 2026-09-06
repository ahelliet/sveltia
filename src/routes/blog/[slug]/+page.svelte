<script lang="ts">
	import Blocks from '$lib/components/Blocks.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.post.title}</title>
</svelte:head>

<article>
	<h1>{data.post.title}</h1>
	<p>{new Date(data.post.date).toLocaleDateString('fr-FR')}</p>
	{#if data.post.heroImage}
		<img src={data.post.heroImage} alt={data.post.title} />
	{/if}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html data.post.html}

	<Blocks blocks={data.post.blocks} />
</article>
