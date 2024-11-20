<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { highlightKeywords } from '$lib/utils/index.svelte';
	import { onMount, tick } from 'svelte';
	import Autocomplete from '$lib/components/Autocomplete.svelte';
	import { isQueryComplete, isQueryError, parseQuery } from '$lib/helpers/parser';
	import { repositionCursor } from '$lib/helpers/reposition-cursor';

	let {
		query = $bindable(),
		onsubmit
	}: {
		query: string;
		onsubmit: (query: string) => void;
	} = $props();
	let inputElement: HTMLInputElement | null = $state(null);
	const placeholders = [
		'GET * FROM account vitalik.eth ON base',
		'GET from, to, value, hash, chain FROM tx WHERE block = latest, value > 0 ON eth, base, op',
		'GET hash, timestamp, size FROM block 123847 ON polygon >> blocks.json',
		'GET * FROM log WHERE event_signature = Transfer(address,address,uint256) ON arb',
		'GET from, to, value FROM tx 0xa50a9587ca01ac32590d3bf4dcb8c012166f18845ef170ef149d76bde100430b  ON eth',
		'GET nonce, balance FROM account 0x00000000219ab540356cbb839cbe05303d7705fa ON arb'
	];
	let currentPlaceholder = $state(0);
	const parsedQuery = $derived(parseQuery(query, { validatePartial: true }));
	const lastWordPosition = $derived.by(() => {
		if (!inputElement) return 0;

		const words = query.split(' ');
		const textBefore = words.slice(0, -1).join(' ');
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');

		if (!context) return 0;

		const computedStyle = window.getComputedStyle(inputElement);
		context.font = computedStyle.font;
		return context.measureText(textBefore + ' ').width;
	});

	let styledQuery = $derived(highlightKeywords(query.split(' ')));

	onMount(() => {
		if (inputElement) inputElement.focus();

		setInterval(() => {
			currentPlaceholder = (currentPlaceholder + 1) % placeholders.length;
		}, 3000);

		window.addEventListener('keydown', handleWindowKeyDown);

		return () => {
			window.removeEventListener('keydown', handleWindowKeyDown);
		};
	});

	function handleWindowKeyDown(event: KeyboardEvent) {
		if (event.key === '(') {
			setTimeout(() => {
				const input = document.getElementById('query-input') as HTMLInputElement;
				query += ')';
				repositionCursor(input, 0);
			});
		} else if (
			(/^[a-zA-Z0-9 ,]$/.test(event.key) ||
				event.key === 'Backspace' ||
				event.key === 'ArrowLeft' ||
				event.key === 'ArrowRight') &&
			inputElement
		)
			inputElement.focus();
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (
			event.key === 'Enter' &&
			isQueryComplete(parsedQuery) &&
			!query.endsWith(',') &&
			!query.endsWith(', ')
		) {
			event.preventDefault();
			event.stopPropagation();
			onsubmit(query);
			updateQueryString();
			query = '';
		} else if (event.key === 'ArrowDown' || (event.ctrlKey && event.key === 'n')) {
			event.preventDefault();
			if (inputElement) inputElement.blur();
		}
	}

	function updateQueryString() {
		$page.url.searchParams.set('query', query);
		goto(`?${$page.url.searchParams.toString()}`);
	}

	onMount(() => {
		const params = new URLSearchParams(location.search);
		query = params.get('query') || '';
	});

	function getTextWidth(text: string, font: string) {
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');
		if (!context) return 0;
		context.font = font;
		return context.measureText(text || ' ').width;
	}

	function getDiffFromSuggestion(hoverdSuggestion: string): string {
		const lastWord = query.split(' ').pop() || '';
		if (!hoverdSuggestion.startsWith(lastWord)) return '';
		return hoverdSuggestion.slice(lastWord.length);
	}

	function updateInputWidth() {
		if (inputElement) {
			const computedStyle = window.getComputedStyle(inputElement);
			const width = getTextWidth(query || inputElement.placeholder, computedStyle.font);
			inputElement.style.width = query ? `${width}px` : '100%';
		}
	}

	$effect(() => {
		updateInputWidth();
	});

	onMount(() => {
		// TODO: this is a tempory fix to ensure the width of input when a querystring param is set
		setTimeout(() => updateInputWidth(), 10);
	});
</script>

<div class="px-8 text-2xl gap-4 flex justify-center relative">
	<span class="text-pink whitespace-nowrap italic">EQL > </span>
	<Autocomplete bind:value={query} containerPosition={lastWordPosition}>
		{#snippet input(hoveredSuggestion: string)}
			<div class="flex">
				<div class="relative w-full flex">
					<div
						tabindex="0"
						contenteditable
						role="textbox"
						bind:textContent={query}
						onkeypress={handleKeyDown}
						spellcheck="false"
						class="w-fit bg-dim-1 focus:outline-none absolute z-10"
					>
						{@html styledQuery}
					</div>
					<input
						bind:this={inputElement}
						bind:value={query}
						class="bg-transparent focus:outline-none min-w-0 w-full"
						placeholder={placeholders[currentPlaceholder]}
						onkeydown={handleKeyDown}
						id="query-input"
						spellcheck="false"
					/>
					<span class="text-gray">{getDiffFromSuggestion(hoveredSuggestion)}</span>
					{#if isQueryError(parsedQuery) && parsedQuery.position}
						<div class="absolute top-0 pointer-events-none group" style="left: 0">
							<span class="text-transparent">{query.slice(0, parsedQuery.position.start)}</span>
							<span class="text-transparent border-red border-b-2 group relative">
								{query.slice(parsedQuery.position.start, parsedQuery.position.end)}
								<div
									class="absolute left-1/2 -translate-x-1/2 text-center text-red text-sm bg-dim-0 rounded-md p-2 mt-2 w-max max-w-[300px]"
								>
									{parsedQuery.message}
								</div>
							</span>
						</div>
					{/if}
				</div>
			</div>
		{/snippet}
	</Autocomplete>
</div>
