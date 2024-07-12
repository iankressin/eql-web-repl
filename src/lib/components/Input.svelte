<script lang="ts">
	import { onMount } from "svelte";

    let { 
        query, 
        onsubmit,
    }: {
        query: string,
        onsubmit: (query: string) => void
    } = $props()
    let inputElement: HTMLInputElement
    const placeholders = [
        'GET from, to, value FROM tx 0x... ON eth',
        'GET hash, timestamp, size FROM block 123847 ON polygon',
        'GET nonce, balance FROM account 0x... ON arb',
    ]
    let currentPlaceholder = $state(0);

    onMount(() => {
        inputElement.focus()

        setInterval(() => {
            currentPlaceholder = (currentPlaceholder + 1) % placeholders.length
        }, 3000)
    })

    function handleKeyPress(key: KeyboardEvent) {
        if (key.key === 'Enter') {
            onsubmit(query)
        }
    }
</script>

<div class="p-8 text-2xl gap-4 flex justify-center items-center">
    <span class="text-pink whitespace-nowrap italic">
        EQL >
    </span>
    <input 
        bind:this={inputElement}
        bind:value={query}
        class="w-full bg-dim-1 focus:outline-none"
        placeholder={placeholders[currentPlaceholder]}
        onkeypress={handleKeyPress}
    />
</div>
