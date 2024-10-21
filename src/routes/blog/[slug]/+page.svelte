<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>
		EQL - {data.meta.title}
	</title>
</svelte:head>

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
        [&>p>a]:text-orange [&>p>a]:underline [&>p>a]:underline-offset-2
        [&>p>em]:text-xl [&>p>em]:text-center [&>p>code]:text-[16px] [&>p>code]:text-green
        [&>ul>li]:list-disc [&>ul]:gap-2 [&>ul]:flex [&>ul]:flex-col [&>ul>li>code]:text-green [&>ul>li>code]:text-[16px]
        [&>ul>li>ul]:list-circle [&>ul>li>ul]:px-8
        [&>ul>li>p>code]:bg-stone-900 [&>ul>li>p>code]:p-1 [&>ul>li>p>code]:rounded [&>ul>li>p>code]:text-sm
        [&>table]:text-[16px] [&>table>thead>tr>th]:text-left [&>table]:font-mono
        [&>table]:border [&>table]:rounded [&>table>tr]:p-4
        [&>table]:table-auto [&>table]:border-separate [&>table]:border-spacing-0 [&>table]:rounded-xl [&>table]:overflow-hidden
        [&>table>thead>tr>th]:px-4 [&>table>thead>tr>th]:py-2 [&>table>tbody>tr>td]:px-4 [&>table>tbody>tr>td]:py-2
        [&>table>tbody>tr>td]:border-t [&>table>tbody>tr>td]:border-l
        [&>table>thead>tr>th]:border-l [&>p>img]:mt-3 [&>p>em]:text-blue
    "
	>
		<svelte:component this={data.content} />
	</div>
</article>
