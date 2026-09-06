<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { settings } from '$lib/site';
</script>

<svelte:head>
	<title>{settings.siteName}</title>
</svelte:head>

<section class="mx-auto max-w-3xl px-4 py-16">
	<h1 class="text-4xl font-bold tracking-tight">{settings.siteName}</h1>
	{#if settings.siteDescription}
		<p class="mt-4 text-lg text-muted-foreground">{settings.siteDescription}</p>
	{/if}
	<p class="mt-6 text-sm text-muted-foreground">
		Le contenu est édité via
		<a
			href="/admin/index.html"
			class="underline underline-offset-4 transition-colors hover:text-foreground"
		>
			Sveltia CMS
		</a>, un CMS Git open source sans backend : les modifications sont commitées directement dans
		ce dépôt via l'API GitHub. Aucun Tina Cloud, aucun Sanity, aucun serveur à héberger.
	</p>
	<div class="mt-8">
		<Button href="/blog">Voir les articles</Button>
	</div>
</section>
