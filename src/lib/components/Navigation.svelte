<script lang="ts">
	import { navigation, resolveLinkHref, settings } from '$lib/site';
</script>

<header class="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
	<div class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
		<a href="/" class="text-lg font-semibold tracking-tight">
			{settings.siteName}
		</a>
		{#if navigation.navLinks.length}
			<nav class="flex flex-wrap items-center gap-6 text-sm">
				{#each navigation.navLinks as link}
					<a
						href={resolveLinkHref(link)}
						class="text-muted-foreground transition-colors hover:text-foreground"
					>
						{link.label}
					</a>
				{/each}
			</nav>
		{/if}
	</div>
</header>
