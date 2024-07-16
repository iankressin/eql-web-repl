<script lang="ts">
	import { queryHandler } from '$lib/QueryHandler.svelte';
	import ResultTable from '$lib/components/ResultTable.svelte';

	let lastItem = $derived(queryHandler.results.length);
	let fetching = $derived(queryHandler.fetchingQuery);

	$effect(() => {
		if (lastItem) document.querySelector('.last')?.scrollIntoView();
		if (fetching) document.getElementById('loading')?.scrollIntoView();
	});
</script>

<div class="overflow-y-auto relative flex flex-col gap-8">
	<button class="absolute text-gray right-8" onclick={() => queryHandler.clearResults()}>
		Clear
	</button>

	{#if queryHandler.results.length > 0}
		{#each queryHandler.results as result, index}
			<div class="flex flex-col gap-2" class:last={index === queryHandler.results.length - 1}>
				<div>
					<span class="text-lg">
						> {result.query}
					</span>
				</div>
				<div>
					{#if result.error}
						<span class="text-red whitespace-pre-line">
							{result.error}
						</span>
					{/if}
					{#if result.result}
						<ResultTable result={result.result} />
					{/if}
				</div>
			</div>
		{/each}
	{:else}
		<span class="text-gray">Waiting for queries...</span>
	{/if}

	{#if queryHandler.fetchingQuery}
		<span id="loading"> > Loading</span>
	{/if}
</div>
