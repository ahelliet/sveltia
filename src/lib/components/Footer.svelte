<script lang="ts">
	import { navigation, resolveLinkHref, settings } from '$lib/site';
</script>

<footer class="border-t border-border">
	<div
		class="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
	>
		<p>{navigation.footerText || settings.siteName}</p>
		{#if navigation.footerLinks.length}
			<nav class="flex flex-wrap gap-4">
				{#each navigation.footerLinks as link}
					<a href={resolveLinkHref(link)} class="transition-colors hover:text-foreground">
						{link.label}
					</a>
				{/each}
			</nav>
		{/if}
	</div>
</footer>
