<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import Blocks from '$lib/components/Blocks.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { settings } from '$lib/site';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<!-- No <h1> repeating a "title" here: the homepage doesn't have one (see
     content/home.md / static/admin/config.yml, "home" singleton) — a
     visitor already knows they're on the homepage. metaTitle (per-page SEO
     override) falls back to the site name instead of a page title.
     applyTemplate={false}: settings.seo.titleTemplate ("%s · %s") would
     otherwise repeat the site name twice, since there's no separate page
     title to prefix it with here. -->
<SeoHead
	title={data.home.seo.metaTitle || settings.siteName}
	applyTemplate={false}
	description={data.home.seo.metaDescription}
	image={data.home.seo.ogImage}
	noIndex={data.home.seo.noIndex}
/>

{#if data.home.blocks.length > 0}
	<div class="mx-auto max-w-4xl px-4 py-12">
		<Blocks blocks={data.home.blocks} />
	</div>
{:else}
	<section class="mx-auto max-w-4xl px-4 py-16">
		<h1 class="text-4xl font-bold tracking-tight">{settings.siteName}</h1>
		{#if settings.siteDescription}
			<p class="mt-4 text-lg text-muted-foreground">{settings.siteDescription}</p>
		{/if}
		<p class="mt-6 text-sm text-muted-foreground">
			Aucun contenu n'est défini pour la page d'accueil. Ajoute des blocs depuis
			<a
				href="/admin/index.html"
				class="underline underline-offset-4 transition-colors hover:text-foreground"
			>
				Sveltia CMS
			</a>
			(« Page d'accueil » dans le menu) pour remplacer ce message.
		</p>
		<div class="mt-8">
			<Button href="/blog">Voir les articles</Button>
		</div>
	</section>
{/if}
