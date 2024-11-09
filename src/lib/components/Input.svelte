<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount, tick } from 'svelte';
	import Autocomplete from '$lib/components/Autocomplete.svelte';
	import { isQueryComplete } from '$lib/helpers/parser';
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
			isQueryComplete(query) &&
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

	$effect(() => {
		if (inputElement) {
			const computedStyle = window.getComputedStyle(inputElement);
			const width = getTextWidth(query || inputElement.placeholder, computedStyle.font);
			inputElement.style.width = query ? `${width}px` : '100%';
		}
	});
</script>

<div class="px-8 text-2xl gap-4 flex justify-center relative">
	<span class="text-pink whitespace-nowrap italic">EQL > </span>
	<Autocomplete bind:value={query} containerPosition={lastWordPosition}>
		{#snippet input(hoveredSuggestion: string)}
			<div class="flex">
				<input
					bind:this={inputElement}
					bind:value={query}
					class="bg-transparent focus:outline-none min-w-0 w-full"
					placeholder={placeholders[currentPlaceholder]}
					onkeydown={handleKeyDown}
					id="query-input"
					autocomplete="off"
				/>
				<span class="text-gray">{getDiffFromSuggestion(hoveredSuggestion)}</span>
			</div>
		{/snippet}
	</Autocomplete>
</div>
