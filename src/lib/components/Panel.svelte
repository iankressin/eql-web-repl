<script lang="ts">
	import Results from '$lib/components/Results.svelte';
	import Tips from '$lib/components/Tips.svelte';
	import InstallEql from './InstallEql.svelte';

	let selectedPannel = $state(0);
	let panels = ['output', 'tips', 'install eql'];

	let resizableContainer: HTMLElement;
	let startY: number, startHeight: number;

	function mouseDownHandler(e: MouseEvent) {
		startY = e.clientY;
		startHeight = resizableContainer.offsetHeight;
		document.documentElement.addEventListener('mousemove', mouseMoveHandler);
		document.documentElement.addEventListener('mouseup', mouseUpHandler);
	}

	function mouseMoveHandler(e: MouseEvent) {
		const newHeight = startHeight - (e.clientY - startY);
		resizableContainer.style.height = `${newHeight}px`;
	}

	function mouseUpHandler() {
		document.documentElement.removeEventListener('mousemove', mouseMoveHandler);
		document.documentElement.removeEventListener('mouseup', mouseUpHandler);
	}
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

    <div class="w-full h-1 bg-dim-0 cursor-row-resize" onmousedown={mouseDownHandler} role="row" tabindex="0"></div>
	<div
		bind:this={resizableContainer}
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

