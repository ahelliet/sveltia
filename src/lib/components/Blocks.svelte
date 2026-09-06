<script lang="ts">
	import { AspectRatio } from '$lib/components/ui/aspect-ratio/index.js';
	import { Card, CardContent } from '$lib/components/ui/card/index.js';
	import {
		Carousel,
		CarouselContent,
		CarouselItem,
		CarouselNext,
		CarouselPrevious
	} from '$lib/components/ui/carousel/index.js';
	import type { Block } from '$lib/posts';

	let { blocks }: { blocks: Block[] } = $props();
</script>

<div class="flex flex-col gap-10">
	{#each blocks as block}
		{#if block.type === 'text'}
			<div class="prose dark:prose-invert max-w-none">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html block.html}
			</div>
		{:else if block.type === 'image'}
			<figure>
				<AspectRatio ratio={16 / 9} class="overflow-hidden rounded-2xl bg-muted">
					<img src={block.image} alt={block.alt ?? ''} class="h-full w-full object-cover" />
				</AspectRatio>
				{#if block.caption}
					<figcaption class="mt-2 text-center text-sm text-muted-foreground">
						{block.caption}
					</figcaption>
				{/if}
			</figure>
		{:else if block.type === 'image_text'}
			<div class="grid items-center gap-6 md:grid-cols-2">
				<AspectRatio
					ratio={4 / 3}
					class="overflow-hidden rounded-2xl bg-muted {block.imageOnRight ? 'md:order-2' : ''}"
				>
					<img src={block.image} alt="" class="h-full w-full object-cover" />
				</AspectRatio>
				<div class="prose dark:prose-invert max-w-none">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html block.html}
				</div>
			</div>
		{:else if block.type === 'quote'}
			<blockquote class="border-l-2 pl-6 italic">
				<p>{block.quote}</p>
				{#if block.author}
					<cite class="mt-2 block text-sm not-italic text-muted-foreground">
						— {block.author}
					</cite>
				{/if}
			</blockquote>
		{:else if block.type === 'gallery'}
			<Carousel class="mx-auto w-full max-w-xl">
				<CarouselContent>
					{#each block.images as img}
						<CarouselItem>
							<Card>
								<CardContent class="p-0">
									<AspectRatio ratio={4 / 3} class="overflow-hidden">
										<img
											src={img.image}
											alt={img.alt ?? ''}
											class="h-full w-full object-cover"
										/>
									</AspectRatio>
								</CardContent>
							</Card>
						</CarouselItem>
					{/each}
				</CarouselContent>
				<CarouselPrevious />
				<CarouselNext />
			</Carousel>
		{/if}
	{/each}
</div>
