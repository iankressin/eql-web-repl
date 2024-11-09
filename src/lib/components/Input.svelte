<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { highlightKeywords } from '$lib/utils/index.svelte';

	let {
		query,
		onsubmit
	}: {
		query: string;
		onsubmit: (query: string) => void;
	} = $props();
	let inputElement: HTMLInputElement;
	const placeholders = [
		'GET * FROM account vitalik.eth ON base',
		'GET from, to, value FROM tx 0xa50a9587ca01ac32590d3bf4dcb8c012166f18845ef170ef149d76bde100430b  ON eth',
		'GET hash, timestamp, size FROM block 123847 ON polygon > blocks.json',
		'GET nonce, balance FROM account 0x00000000219ab540356cbb839cbe05303d7705fa ON arb'
	];
	let currentPlaceholder = $state(0);

	let styledQuery = $state(query);

	let splitQuery = $derived(query.split(' '));

	onMount(() => {
		inputElement.focus();

		setInterval(() => {
			currentPlaceholder = (currentPlaceholder + 1) % placeholders.length;
		}, 3000);
	});

	function handleKeyPress(key: KeyboardEvent) {
		if (key.key === 'Enter' && query !== '') {
			onsubmit(query);
			updateQueryString();
			query = '';
			styledQuery = '';
		}
	}

	function updateQueryString() {
		$page.url.searchParams.set('query', query);
		goto(`?${$page.url.searchParams.toString()}`);
	}

	onMount(() => {
		const params = new URLSearchParams(location.search);
		query = params.get('query') || '';
		styledQuery = highlightKeywords(splitQuery);
	});
</script>

<div class="p-8 text-2xl gap-4 flex justify-center items-center">
	<span class="text-pink whitespace-nowrap italic"> EQL > </span>
	<div class="relative w-full">
		<div
			contenteditable
			role="textbox"
			bind:textContent={query}
			bind:innerHTML={styledQuery}
			spellcheck="false"
			class="w-fit bg-dim-1 focus:outline-none absolute z-10 text-white"
		></div>
		<input
			bind:this={inputElement}
			bind:value={query}
			class="w-full bg-dim-1 focus:outline-none"
			placeholder={placeholders[currentPlaceholder]}
			onkeypress={handleKeyPress}
			oninput={() => {
				styledQuery = highlightKeywords(splitQuery);
			}}
		/>
	</div>
</div>
