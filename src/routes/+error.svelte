<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button/index.js';
</script>

<!--
	Rendered both for `error(status, message)` thrown from a load function
	(blog/[slug], [slug]) and, once the site is built, as the literal
	404.html adapter-static/SvelteKit write for unknown URLs on any static
	host — this replaces SvelteKit's plain default error page with one that
	matches the site's design (and still gets the header/footer for free,
	since it renders inside the root +layout.svelte like any other page).
-->
<svelte:head>
	<title>Erreur {page.status}</title>
</svelte:head>

<section class="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
	<p class="text-sm font-medium text-muted-foreground">Erreur {page.status}</p>
	<h1 class="mt-2 text-3xl font-bold tracking-tight">
		{page.status === 404 ? 'Page introuvable' : 'Une erreur est survenue'}
	</h1>
	<p class="mt-4 text-muted-foreground">
		{page.error?.message || "Le contenu demandé n'existe pas ou plus."}
	</p>
	<div class="mt-8">
		<Button href="/">Retour à l'accueil</Button>
	</div>
</section>
