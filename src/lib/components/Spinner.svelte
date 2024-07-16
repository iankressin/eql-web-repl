<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
	let intervalId: number;
	let currentFrame = $state(0);

	onMount(() => {
		intervalId = setInterval(() => {
			currentFrame = (currentFrame + 1) % frames.length;
		}, 80);
	});

	onDestroy(() => {
		clearInterval(intervalId);
	});
</script>

<span class="text-lg text-yellow">{frames[currentFrame]}</span>
