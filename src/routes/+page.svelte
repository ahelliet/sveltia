<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import Blocks from '$lib/components/Blocks.svelte';
	import { settings } from '$lib/site';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.homePage?.seo.metaTitle || settings.siteName}</title>
</svelte:head>

{#if data.homePage}
	<article class="mx-auto max-w-3xl px-4 py-12">
		<h1 class="text-3xl font-bold tracking-tight">{data.homePage.title}</h1>
		<div class="mt-8">
			<Blocks blocks={data.homePage.blocks} />
		</div>
	</article>
{:else}
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
		<p class="mt-2 text-sm text-muted-foreground">
			Astuce : crée une page dans le CMS et coche « Définir comme page d'accueil » pour remplacer
			ce texte par du contenu géré depuis le page builder.
		</p>
		<div class="mt-8">
			<Button href="/blog">Voir les articles</Button>
		</div>
	</section>
{/if}
