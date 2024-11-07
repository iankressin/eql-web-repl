<script lang="ts">
	import { autocomplete, type Suggestion } from '$lib/helpers/autocomplete';
	import { ChevronRightIcon } from 'lucide-svelte';
	import { onMount, type Snippet } from 'svelte';

	let {
		value = $bindable(),
		containerPosition = 0,
		children
	}: {
		value: string;
		containerPosition: number;
		children: Snippet;
	} = $props();
	let focusedSchemaIndex = $state(0);
	let focusedFieldIndex = $state(0);
	let focusedContainerIndex = $state(0);
	let suggestionsVisible = $state(true);
	const currentSuggestions = $derived(suggestionsVisible ? autocomplete(value) : []);

	$effect(() => {
		console.log({ currentSuggestions });
	});

	onMount(() => {
		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			suggestionsVisible = false;
			return;
		}

		if (event.key.length === 1 || event.key === 'Backspace') {
			suggestionsVisible = true;
		}

		if (currentSuggestions.length === 0) return;

		if (event.key === 'Enter') {
			event.preventDefault();
			handleEnter();
		} else if (event.key === 'ArrowUp' || (event.ctrlKey && event.key === 'p')) {
			event.preventDefault();
			updateFocusedItem(-1);
		} else if (event.key === 'ArrowDown' || (event.ctrlKey && event.key === 'n')) {
			event.preventDefault();
			updateFocusedItem(1);
		} else if (event.key === 'ArrowRight') {
			event.preventDefault();
			focusNextContainer();
		} else if (event.key === 'Tab' && currentSuggestions.length === 1) {
			event.preventDefault();
			appendSuggestion(currentSuggestions[0]);
		}
	}

	function handleEnter() {
		if (currentSuggestions.length === 1) {
			console.log('Appending suggestion', currentSuggestions[0]);

			appendSuggestion(currentSuggestions[0]);
			return;
		}

		const suggestion = currentSuggestions[focusedSchemaIndex];
		if (focusedContainerIndex === 0 && suggestion?.fields) {
			focusNextContainer();
		} else {
			appendSuggestion(suggestion);
		}
	}

	function appendSuggestion(suggestion: string | { schema: string; fields: string[] }) {
		const words = value.split(' ');
		const lastWord = words.pop() || '';

		if (typeof suggestion === 'string') {
			words.push(suggestion);
		} else if ('fields' in suggestion) {
			const field = suggestion.fields[focusedFieldIndex];
			words.push(field);
		}

		value = words.join(' ');
		resetFocus();
	}

	function updateFocusedItem(direction: number) {
		if (focusedContainerIndex === 0) {
			const suggestionCount = currentSuggestions.length;
			focusedSchemaIndex = (focusedSchemaIndex + direction + suggestionCount) % suggestionCount;
		} else {
			const fieldsCount = currentSuggestions[focusedSchemaIndex]?.fields?.length || 0;
			focusedFieldIndex = (focusedFieldIndex + direction + fieldsCount) % fieldsCount;
		}
	}

	function focusNextContainer() {
		if (focusedContainerIndex === 0 && currentSuggestions[focusedSchemaIndex]?.fields) {
			focusedContainerIndex = 1;
			focusedFieldIndex = 0;
		}
	}

	function resetFocus() {
		focusedSchemaIndex = 0;
		focusedFieldIndex = 0;
		focusedContainerIndex = 0;
	}

	function handleMouseEnter(index: number) {
		if (focusedContainerIndex === 0) {
			focusedSchemaIndex = index;
			if (currentSuggestions[index]?.fields) {
				focusedContainerIndex = 1;
				focusedFieldIndex = 0;
			}
		}
	}

	function handleClick(suggestion: string | { schema: string; fields: string[] }) {
		appendSuggestion(suggestion);
	}
</script>

<div class="relative w-full" bind:this={containerRef}>
	{@render children()}
	{#if currentSuggestions.length > 0}
		<div class="absolute flex" style="left: {containerPosition}px">
			<div class="mt-1 bg-dim-0 rounded shadow flex flex-col px-1 py-1 w-fit">
				{#each currentSuggestions as suggestion, index}
					<button
						class="px-2 py-1 cursor-pointer text-base text-left rounded"
						class:bg-dim-2={focusedContainerIndex === 0 && focusedSchemaIndex === index}
						onmouseenter={() => handleMouseEnter(index)}
						onclick={() => handleClick(suggestion)}
					>
						{#if typeof suggestion === 'string'}
							{suggestion}
						{:else}
							<span class="capitalize flex items-center justify-between w-full">
								{suggestion.schema}
								<ChevronRightIcon class="w-4 h-4 ml-3" />
							</span>
						{/if}
					</button>
				{/each}
			</div>
			{#if focusedContainerIndex === 1 && currentSuggestions[focusedSchemaIndex]?.fields}
				<div class="mt-1 bg-dim-0 rounded shadow flex flex-col px-1 py-1">
					{#each currentSuggestions[focusedSchemaIndex].fields as field, index}
						<button
							class="p-1 cursor-pointer text-base text-left rounded"
							class:bg-dim-2={focusedFieldIndex === index}
							onclick={() => handleClick({ schema: '', fields: [field] })}
						>
							{field}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
