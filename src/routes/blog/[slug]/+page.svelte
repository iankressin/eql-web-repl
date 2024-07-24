<script lang="ts">
	export let data;
</script>

<article class="flex flex-col gap-5 bg-dim-1">
	<div
		class="
        flex flex-col gap-4 font-body font text-xl overflow-auto
        [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mt-2 [&>h1]:font-sans [&>h1]:text-red
        [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-2 [&>h2]:font-sans [&>h2]:text-blue
        [&>h3]:text-xg [&>h3]:font-bold [&>h3]:mt-2 [&>h3]:font-sans [&>h3]:text-green
        [&>h4]:text-lg [&>h4]:font-bold [&>h4]:mt-2 [&>h4]:font-sans [&>h4]:text-yellow
        [&>blockquote]:px-4 [&>blockquote]:border-l-4 [&>blockquote]:italic
        [&>pre]:bg-stone-900 [&>pre]:p-4 [&>pre]:rounded [&>pre]:text-sm
        [&>p>a]:text-blue-400 [&>p>a]:underline [&>p>a]:underline-offset-2
        [&>p>em]:text-xl [&>p>em]:text-center
        [&>ul>li]:list-disc [&>ul]:gap-2 [&>ul]:flex [&>ul]:flex-col
        [&>ul>li>ul]:list-[circle] [&>ul>li>ul]:px-8
        [&>ul>li>p>code]:bg-stone-900 [&>ul>li>p>code]:p-1 [&>ul>li>p>code]:rounded [&>ul>li>p>code]:text-sm
    "
	>
		<svelte:component this={data.content} />
	</div>
</article>
