<script lang="ts">
	import Panel from '$lib/components/Panel.svelte';
	import Input from '$lib/components/Input.svelte';
	import { queryHandler } from '$lib/QueryHandler.svelte';

	let query = $state('');
</script>

<div class="flex flex-col justify-between h-full">
	<div>
		<Input {query} onsubmit={(query) => queryHandler.runQuery(query)} />
	</div>
	<Panel />
</div>
