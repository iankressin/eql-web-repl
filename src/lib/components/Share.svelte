<script lang="ts">
	import { Copy, CircleCheck } from 'lucide-svelte'; // Import Twitter and Reddit icons
	import XLogo from '$lib/icons/logo-white.png';

	const { query }: { query: string } = $props();
	const url = new URL(window.location.href);
	url.searchParams.set('query', query);
	let copied = $state(false);

	const copy = () => {
		copied = true;
		navigator.clipboard.writeText(url.toString());

		setTimeout(() => {
			copied = false;
		}, 2000);
	};

	// Generate the Twitter and Reddit share URLs
	const twitterShareUrl = `https://twitter.com/intent/tweet?text=Check%20out%20this%20EQL%20query&url=${encodeURIComponent(url.toString())}`;
</script>

<div class="flex flex-col items-center justify-center gap-y-4">
	<h1 class="text-xl font-medium">Share this query</h1>

	<!-- URL display and copy functionality -->
	<div class="flex gap-3">
		<input value={url} class="bg-transparent min-w-80 text-[#D3C6AA]" disabled />

		<button class="w-1/12" onclick={copy}>
			{#if copied}
				<CircleCheck class="cursor-pointer w-4 w-4" />
			{:else}
				<Copy class="cursor-pointer w-4 w-4" />
			{/if}
		</button>
	</div>

	<!-- Social sharing buttons -->
	<div class="flex gap-3">
		<!-- Share on Twitter/X -->
		<a
			href={twitterShareUrl}
			target="_blank"
			class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
		>
			<span>Share on</span>
			<img src={XLogo} class="w-4 h-4 ml-1" alt="x" />
		</a>
	</div>
</div>
