<script lang="ts">
	import ContentList from '$lib/components/ContentList.svelte';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Ian - Essays</title>
</svelte:head>

<ContentList list={data.essays} />
