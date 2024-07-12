<script lang="ts">
    import { queryHandler } from "$lib/QueryHandler.svelte";

    let selectedPannel = $state(0);
    let panels = ['output', 'tips', 'install eql']
</script>

<div>
    <div class="ml-4 p-2 bg-dim-0 w-min rounded-t-md flex gap-2">
        {#each panels as panelLabel, index}
            <button 
                class="px-4 py-1 text-lg w-max rounded-md transition-all"
                onclick={() => selectedPannel = index}
                class:bg-olive={selectedPannel === index}
            >
                <span>{panelLabel}</span>
            </button>
        {/each}
    </div>

    <div class="w-full bg-dim-0 h-96 px-8 py-4">
        {#each queryHandler.results as result}
            <span class="text-xl">
                > {result.query}
            </span>
            <div>
                {result.result}
            </div>
        {/each}
    </div>
</div>
