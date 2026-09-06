<script lang="ts">
	import Blocks from '$lib/components/Blocks.svelte';
	import type { Page } from '$lib/pages';

	let { page }: { page: Page } = $props();
</script>

<svelte:head>
	<title>{page.seo.metaTitle || page.title}</title>
</svelte:head>

<article class="mx-auto max-w-3xl px-4 py-12">
	<!-- La page d'accueil n'affiche pas son propre titre en <h1> : un
	     visiteur sait déjà qu'il est sur l'accueil, donc répéter "Accueil"
	     (ou quel que soit le titre saisi dans le CMS) juste au-dessus du
	     contenu est redondant — contrairement aux autres pages, où ce titre
	     sert de repère. Le <title> ci-dessus (onglet du navigateur, SEO)
	     reste inchangé : toute page en a besoin, y compris l'accueil. -->
	{#if !page.isHomePage}
		<h1 class="text-3xl font-bold tracking-tight">{page.title}</h1>
	{/if}
	<div class={page.isHomePage ? '' : 'mt-8'}>
		<Blocks blocks={page.blocks} />
	</div>
</article>
