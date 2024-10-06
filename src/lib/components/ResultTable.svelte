<script lang="ts">
	import { type Result } from '$lib/QueryHandler.svelte';

	type ResultProp = Exclude<Result['result'], undefined>;

	let { result }: { result: ResultProp } = $props();
	let queryResult = $derived(Object.values(result)[0]);
	let entries: [string, Record<string, number | string>][] = $derived(Object.entries(queryResult));
	let keys = $derived(Object.keys(queryResult[0]));
</script>

<div class="border border-blue rounded-md text-blue w-fit">
	<div class="grid" style={`grid-template-columns: repeat(${keys.length}, minmax(auto, auto))`}>
		{#each keys as key, index}
			<div>
				<div class="flex p-2 border-l border-b" class:border-l={index > 0}>
					<span>{key}</span>
				</div>
				<div class="flex flex-col">
					{#each entries as [_, value]}
						<div class="flex border-l p-2">
							<span>{value[key] ?? '-'}</span>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>
