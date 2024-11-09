<script lang="ts">
	import {
		autocomplete,
		isSuggestionWithFields,
		type Suggestion,
		type SuggestionWithFields
	} from '$lib/helpers/autocomplete';
	import { ChevronRightIcon } from 'lucide-svelte';
	import { onMount, type Snippet } from 'svelte';

	let {
		value = $bindable(''),
		containerPosition = 0,
		input
	}: {
		value: string;
		containerPosition: number;
		input: Snippet<[string]>;
	} = $props();
	let focusedFirstContainerIndex = $state(0);
	let focusedSecondContainerIndex: number | null = $state(null);
	let focusedContainerIndex = $state(0);
	let suggestionsVisible = $state(true);
	const currentSuggestions = $derived(suggestionsVisible ? autocomplete(value) : []);
	const lastWord = $derived(value.split(' ').pop());

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

		if ((event.key === 'Enter' || event.key === 'Tab') && currentSuggestions.length > 0) {
			event.preventDefault();
			event.stopPropagation();
			handleConfirmation();
		} else if (event.key === 'ArrowUp' || (event.ctrlKey && event.key === 'p')) {
			event.preventDefault();
			updateFocusedItem(-1);
		} else if (event.key === 'ArrowDown' || (event.ctrlKey && event.key === 'n')) {
			event.preventDefault();
			updateFocusedItem(1);
		} else if (event.key === 'ArrowRight' || (event.ctrlKey && event.key === 'l')) {
			if (isSuggestionWithFields(currentSuggestions[focusedFirstContainerIndex])) {
				event.preventDefault();
				toggleContainer();
			}
		} else if (event.key === 'ArrowLeft' || (event.ctrlKey && event.key === 'h')) {
			if (isSuggestionWithFields(currentSuggestions[focusedFirstContainerIndex])) {
				event.preventDefault();
				toggleContainer();
			}
		}
	}

	function handleConfirmation() {
		const curr = currentSuggestions[focusedFirstContainerIndex];
		if (typeof curr === 'string') {
			appendSuggestion(curr);
		} else if (focusedContainerIndex === 1) {
			appendSuggestion(curr.fields[focusedSecondContainerIndex as number]);
		}
	}

	function appendSuggestion(suggestion: string) {
		const words = value.split(' ');
		words.pop();

		words.push(suggestion);
		if (suggestion === '.eth') {
			repositionCursor(words, 0);
		}

		value = words.join(' ');
		resetFocus();
	}

	function repositionCursor(words: string[], newPositionOffset: number) {
		const input = document.getElementById('query-input') as HTMLInputElement;
		const currentPosition = input.selectionStart || 0;
		const newPosition = currentPosition + newPositionOffset;

		value = words.join(' ');

		setTimeout(() => {
			input.focus();
			input.setSelectionRange(newPosition, newPosition);
		}, 0);
		return;
	}

	function updateFocusedItem(direction: number) {
		if (focusedContainerIndex === 0) {
			const suggestionCount = currentSuggestions.length;
			focusedFirstContainerIndex =
				(focusedFirstContainerIndex + direction + suggestionCount) % suggestionCount;
		} else {
			const suggestion = currentSuggestions[focusedFirstContainerIndex];
			if (isSuggestionWithFields(suggestion) && focusedSecondContainerIndex !== null) {
				const fieldsCount = suggestion.fields.length;
				focusedSecondContainerIndex =
					(focusedSecondContainerIndex + direction + fieldsCount) % fieldsCount;
			}
		}
	}

	function toggleContainer() {
		const suggestion = currentSuggestions[focusedFirstContainerIndex];
		if (focusedContainerIndex === 0 && isSuggestionWithFields(suggestion)) {
			focusedContainerIndex = 1;
			focusedSecondContainerIndex = 0;
		} else {
			focusedContainerIndex = 0;
			focusedSecondContainerIndex = null;
		}
	}

	function resetFocus() {
		focusedFirstContainerIndex = 0;
		focusedSecondContainerIndex = 0;
		focusedContainerIndex = 0;
	}

	function handleMouseEnter(index: number) {
		focusedFirstContainerIndex = index;
		focusedContainerIndex = 0;
	}

	function handleMouseEnterSecondContainer(index: number) {
		focusedSecondContainerIndex = index;
		focusedContainerIndex = 1;
	}

	function hoveredSuggestion(): string {
		if (!value) return '';

		const curr = currentSuggestions[focusedFirstContainerIndex];
		if (typeof curr === 'string') {
			return curr;
		} else if (focusedContainerIndex === 1) {
			return curr.fields[focusedSecondContainerIndex as number];
		}

		return '';
	}
</script>

<div class="relative w-full">
	{@render input(hoveredSuggestion())}
	{#if currentSuggestions.length > 0 && value.length > 0}
		{@const suggestion = currentSuggestions[focusedFirstContainerIndex]}
		<div class="absolute flex" style="left: {containerPosition}px">
			<div
				class="mt-1 bg-dim-0 rounded-md shadow flex flex-col p-2 w-fit border border-dim-2 mr-[1px] h-fit"
				class:border-dim-3={focusedContainerIndex === 0}
			>
				{#each currentSuggestions as suggestion, index}
					<button
						class="px-2 py-1 cursor-pointer text-base text-left rounded"
						class:bg-dim-2={focusedFirstContainerIndex === index}
						onclick={handleConfirmation}
						onmouseenter={() => handleMouseEnter(index)}
					>
						{#if typeof suggestion === 'string'}
							{@render highlightedMatch(suggestion)}
						{:else}
							<span class="capitalize flex items-center justify-between w-full">
								{suggestion.schema}
								<ChevronRightIcon class="w-4 h-4 ml-8" />
							</span>
						{/if}
					</button>
				{/each}
			</div>

			{#if isSuggestionWithFields(suggestion)}
				<div class="mt-1 bg-dim-0 rounded-md shadow flex flex-col px-1 py-1 border border-dim-2">
					{#each suggestion.fields as field, index}
						<button
							class="py-1 pl-1 pr-8 cursor-pointer text-base text-left rounded"
							class:bg-dim-2={focusedContainerIndex === 1 && focusedSecondContainerIndex === index}
							onclick={handleConfirmation}
							onmouseenter={() => handleMouseEnterSecondContainer(index)}
						>
							{@render highlightedMatch(field)}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

{#snippet highlightedMatch(suggestion: string)}
	{#if lastWord}
		{@const index = suggestion.toLowerCase().indexOf(lastWord.toLowerCase())}
		<span>
			{suggestion.slice(0, index)}<span class=""
				>{suggestion.slice(index, index + lastWord.length)}</span
			><span class="text-gray m-0 p-0">{suggestion.slice(index + lastWord.length)}</span>
		</span>
	{:else}
		{suggestion}
	{/if}
{/snippet}
