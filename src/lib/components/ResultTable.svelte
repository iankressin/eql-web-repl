<script lang="ts">
	import { type Result } from '$lib/QueryHandler.svelte';

	type ResultProp = Exclude<Result['result'], undefined>;

	let { result }: { result: ResultProp } = $props();
	let queryResult = $derived(Object.values(result)[0]);
	let entries = $derived(Object.entries(queryResult));
</script>

<div class="border border-blue rounded-md text-blue w-fit">
	<div class="grid" style={`grid-template-columns: repeat(${entries.length}, minmax(0, auto))`}>
		{#each entries as [key, value], index}
			<div class="flex flex-col">
				<div class="flex p-2 border-l border-b" class:border-l={index > 0}>
					<span>{key}</span>
				</div>
				<div class="flex border-l p-2" class:border-l={index > 0}>
					<span>{value || '-'}</span>
				</div>
			</div>
		{/each}
	</div>
</div>
