<script lang="ts">
	import { navigation, resolveLinkHref, settings } from '$lib/site';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
</script>

<header class="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
	<div class="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-4 py-4">
		<a href="/" class="text-lg font-semibold tracking-tight">
			{settings.siteName}
		</a>
		{#if navigation.navLinks.length}
			<nav class="flex flex-wrap items-center gap-6 text-sm">
				{#each navigation.navLinks as link}
					{#if link.type === 'dropdown'}
						<!-- A "dropdown" link has no href of its own — only its nested
						     `links` do (see resolveLinkHref in $lib/site.ts) — so it's a
						     menu trigger + popover instead of a plain <a>. -->
						<DropdownMenu.Root>
							<DropdownMenu.Trigger
								class="text-muted-foreground transition-colors hover:text-foreground"
							>
								{link.label}
								<svg
									viewBox="0 0 24 24"
									width="14"
									height="14"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									aria-hidden="true"
									class="mt-px"
								>
									<path d="m6 9 6 6 6-6" />
								</svg>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content>
								{#each link.links ?? [] as sublink}
									<DropdownMenu.Item>
										{#snippet child({ props })}
											<a href={resolveLinkHref(sublink)} {...props}>
												{sublink.label}
											</a>
										{/snippet}
									</DropdownMenu.Item>
								{/each}
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					{:else}
						<a
							href={resolveLinkHref(link)}
							class="text-muted-foreground transition-colors hover:text-foreground"
						>
							{link.label}
						</a>
					{/if}
				{/each}
			</nav>
		{/if}
	</div>
</header>
