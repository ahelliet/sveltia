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
					<img
						src={block.image}
						alt={block.alt ?? ''}
						loading="lazy"
						class="h-full w-full object-cover"
					/>
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
					<img
						src={block.image}
						alt={block.alt ?? ''}
						loading="lazy"
						class="h-full w-full object-cover"
					/>
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
											loading="lazy"
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
		{:else if block.type === 'documents'}
			<div class="flex flex-col gap-3">
				{#each block.documents as doc}
					<a
						href={doc.file}
						target="_blank"
						rel="noopener"
						class="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-md ring-1 ring-foreground/5 transition-colors hover:bg-muted"
					>
						<svg
							viewBox="0 0 24 24"
							width="20"
							height="20"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
							class="mt-0.5 shrink-0 text-muted-foreground"
						>
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
							<path d="M14 2v6h6" />
							<line x1="9" y1="13" x2="15" y2="13" />
							<line x1="9" y1="17" x2="15" y2="17" />
						</svg>
						<div>
							<p class="font-medium">{doc.label}</p>
							{#if doc.description}
								<p class="mt-1 text-sm text-muted-foreground">{doc.description}</p>
							{/if}
						</div>
					</a>
				{/each}
			</div>
		{/if}
	{/each}
</div>
