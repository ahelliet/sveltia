<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Articles</title>
</svelte:head>

<h1>Articles</h1>

<ul>
	{#each data.posts as post}
		<li>
			<a href={`/blog/${post.slug}`}>{post.title}</a>
			<p>{new Date(post.date).toLocaleDateString('fr-FR')}</p>
			{#if post.excerpt}<p>{post.excerpt}</p>{/if}
		</li>
	{/each}
</ul>
