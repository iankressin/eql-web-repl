<script lang="ts">
	import { closeModal, getModal } from '$lib/stores/modal.svelte';
	import { X } from 'lucide-svelte';
	const modal = getModal();
</script>

{#if modal.open && modal.component}
	<div class="absolute inset-0 flex items-center justify-center">
		<div class="bg-[#475258] relative z-20 w-11/12 md:w-auto md:max-w-xl rounded-2xl p-8">
			{#if modal.options?.dismissible}
				<div class="w-full flex justify-end mb-4">
					<button onclick={closeModal} class="right-8 p-2 rounded-full border -mt-4">
						<X class="w-3 h-3" />
					</button>
				</div>
			{/if}

			{@render modal.component(modal.options?.param || '')}
		</div>
		<div class="absolute inset-0 flex bg-black/30 backdrop-blur-sm z-10"></div>
	</div>
{/if}
