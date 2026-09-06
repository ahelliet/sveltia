<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import PageContent from '$lib/components/PageContent.svelte';
	import { settings } from '$lib/site';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<!-- <svelte:head> must be an unconditional, direct child of the component
     (Svelte doesn't allow the tag itself inside an {#if}/{:else} block) —
     so it stays at the top level here, with the conditional *inside* it
     instead. PageContent.svelte sets its own <title> when data.homePage
     exists, so this one only applies to the fallback case. -->
<svelte:head>
	{#if !data.homePage}
		<title>{settings.siteName}</title>
	{/if}
</svelte:head>

{#if data.homePage}
	<PageContent page={data.homePage} />
{:else}
	<section class="mx-auto max-w-3xl px-4 py-16">
		<h1 class="text-4xl font-bold tracking-tight">{settings.siteName}</h1>
		{#if settings.siteDescription}
			<p class="mt-4 text-lg text-muted-foreground">{settings.siteDescription}</p>
		{/if}
		<p class="mt-6 text-sm text-muted-foreground">
			Aucune page d'accueil n'est définie. Crée une page dans
			<a
				href="/admin/index.html"
				class="underline underline-offset-4 transition-colors hover:text-foreground"
			>
				Sveltia CMS
			</a>
			(collection « Pages ») et coche « Définir comme page d'accueil » pour remplacer ce message.
		</p>
		<div class="mt-8">
			<Button href="/blog">Voir les articles</Button>
		</div>
	</section>
{/if}
