<script lang="ts">
	import PageContent from '$lib/components/PageContent.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<PageContent page={data.page} />
