<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Articles</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-12">
	<h1 class="text-3xl font-bold tracking-tight">Articles</h1>

	<div class="mt-8 flex flex-col gap-4">
		{#each data.posts as post}
			<a href={`/blog/${post.slug}`} class="block">
				<Card>
					<CardHeader>
						<CardTitle>{post.title}</CardTitle>
						<CardDescription>{new Date(post.date).toLocaleDateString('fr-FR')}</CardDescription>
					</CardHeader>
					{#if post.excerpt}
						<CardContent>
							<p class="text-sm text-muted-foreground">{post.excerpt}</p>
						</CardContent>
					{/if}
				</Card>
			</a>
		{/each}
	</div>
</div>
