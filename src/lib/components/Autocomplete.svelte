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
		children
	}: {
		value: string;
		containerPosition: number;
		children: Snippet;
	} = $props();
	let focusedSchemaIndex = $state(0);
	let focusedFieldIndex: number | null = $state(null);
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
			if (isSuggestionWithFields(currentSuggestions[focusedSchemaIndex])) {
				event.preventDefault();
				toggleContainer();
			}
		} else if (event.key === 'ArrowLeft') {
			if (isSuggestionWithFields(currentSuggestions[focusedSchemaIndex])) {
				event.preventDefault();
				toggleContainer();
			}
		} else if (event.key === 'Tab' && currentSuggestions.length > 0) {
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
		if (focusedContainerIndex === 0 && isSuggestionWithFields(suggestion)) {
			toggleContainer();
		} else {
			appendSuggestion(suggestion);
		}
	}

	function appendSuggestion(suggestion: Suggestion) {
		const words = value.split(' ');
		const lastWord = words.pop() || '';

		if (typeof suggestion === 'string') {
			words.push(suggestion);
		} else if (isSuggestionWithFields(suggestion) && focusedFieldIndex !== null) {
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
			const suggestion = currentSuggestions[focusedSchemaIndex];
			if (isSuggestionWithFields(suggestion) && focusedFieldIndex !== null) {
				const fieldsCount = suggestion.fields.length;
				focusedFieldIndex = (focusedFieldIndex + direction + fieldsCount) % fieldsCount;
			}
		}
	}

	function toggleContainer() {
		const suggestion = currentSuggestions[focusedSchemaIndex];
		if (focusedContainerIndex === 0 && isSuggestionWithFields(suggestion)) {
			focusedContainerIndex = 1;
			focusedFieldIndex = 0;
		} else {
			focusedContainerIndex = 0;
			focusedFieldIndex = null;
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
			const suggestion = currentSuggestions[index];
			if (isSuggestionWithFields(suggestion)) {
				focusedContainerIndex = 1;
				focusedFieldIndex = 0;
			}
		}
	}

	function handleClick(suggestion: Suggestion) {
		appendSuggestion(suggestion);
	}
</script>

<div class="relative w-full">
	{@render children()}
	{#if currentSuggestions.length > 0 && value.length > 0}
		{@const suggestion = currentSuggestions[focusedSchemaIndex]}
		<div class="absolute flex" style="left: {containerPosition}px">
			<div
				class="mt-1 bg-dim-0 rounded-md shadow flex flex-col p-2 w-fit border border-dim-2 mr-[1px] h-fit"
				class:border-dim-3={focusedContainerIndex === 0}
			>
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
							class:bg-dim-2={focusedContainerIndex === 1 && focusedFieldIndex === index}
							onclick={() => handleClick({ schema: suggestion.schema, fields: [field] })}
						>
							{field}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
