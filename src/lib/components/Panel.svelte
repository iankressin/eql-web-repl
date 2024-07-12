<script lang="ts">
	import Results from '$lib/components/Results.svelte';
	import Tips from '$lib/components/Tips.svelte';
	import InstallEql from './InstallEql.svelte';

	let selectedPannel = $state(0);
	let panels = ['output', 'tips', 'install eql'];
</script>

<div>
	<div class="ml-4 p-2 bg-dim-0 w-min rounded-t-md flex gap-2">
		{#each panels as panelLabel, index}
			<button
				class="px-4 py-1 text-md w-max rounded-md transition-all"
				onclick={() => (selectedPannel = index)}
				class:bg-olive={selectedPannel === index}
			>
				<span>{panelLabel}</span>
			</button>
		{/each}
	</div>

	<div
		class="w-full bg-dim-0 h-96 px-8 py-8 flex flex-col gap-8 relative overflow-y-auto transition-all"
	>
		{#if selectedPannel === 0}
			<Results />
		{/if}
		{#if selectedPannel === 1}
			<Tips />
		{/if}
		{#if selectedPannel === 2}
			<InstallEql />
		{/if}
	</div>
</div>
