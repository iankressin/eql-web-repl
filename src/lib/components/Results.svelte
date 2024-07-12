<script lang="ts">
	import { queryHandler } from '$lib/QueryHandler.svelte';
	import ResultTable from '$lib/components/ResultTable.svelte';
</script>

<button class="absolute text-gray right-8" onclick={() => queryHandler.clearResults()}>
	Clear
</button>

{#if queryHandler.results.length > 0}
	{#each queryHandler.results as result}
		<div class="flex flex-col gap-2">
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
