<script lang="ts">
	import type { Block } from '$lib/posts';

	let { blocks }: { blocks: Block[] } = $props();
</script>

{#each blocks as block}
	{#if block.type === 'text'}
		<div class="block block-text">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html block.html}
		</div>
	{:else if block.type === 'image'}
		<figure class="block block-image">
			<img src={block.image} alt={block.alt ?? ''} />
			{#if block.caption}
				<figcaption>{block.caption}</figcaption>
			{/if}
		</figure>
	{:else if block.type === 'image_text'}
		<div class="block block-image-text" class:reverse={block.imageOnRight}>
			<img src={block.image} alt="" />
			<div class="text">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html block.html}
			</div>
		</div>
	{:else if block.type === 'quote'}
		<blockquote class="block block-quote">
			<p>{block.quote}</p>
			{#if block.author}
				<cite>— {block.author}</cite>
			{/if}
		</blockquote>
	{:else if block.type === 'gallery'}
		<div class="block block-gallery">
			{#each block.images as img}
				<img src={img.image} alt={img.alt ?? ''} />
			{/each}
		</div>
	{/if}
{/each}

<style>
	.block {
		margin: 2rem 0;
	}

	.block-image img,
	.block-image-text img,
	.block-gallery img {
		max-width: 100%;
		border-radius: 8px;
		display: block;
	}

	.block-image figcaption {
		margin-top: 0.5rem;
		font-size: 0.875rem;
		color: #666;
		text-align: center;
	}

	.block-image-text {
		display: flex;
		gap: 1.5rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.block-image-text.reverse {
		flex-direction: row-reverse;
	}

	.block-image-text img,
	.block-image-text .text {
		flex: 1 1 280px;
	}

	.block-quote {
		margin: 2rem 0;
		padding-left: 1rem;
		border-left: 4px solid #ddd;
		font-style: italic;
	}

	.block-quote cite {
		display: block;
		margin-top: 0.5rem;
		font-style: normal;
		font-size: 0.875rem;
		color: #666;
	}

	.block-gallery {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 0.75rem;
	}
</style>
