<script lang="ts">
	import '../app.css';
	import faviconDefault from '$lib/assets/favicon.svg';
	import Footer from '$lib/components/Footer.svelte';
	import Navigation from '$lib/components/Navigation.svelte';
	import { settings } from '$lib/site';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={settings.favicon || faviconDefault} />
</svelte:head>

<div class="flex min-h-screen flex-col">
	<Navigation />
	<main class="flex-1">
		{@render children()}
	</main>
	<Footer />
</div>
