<script lang="ts">
	import '../app.css';
</script>

<svelte:head>
	<title>EQL - EVM Query Language</title>

	<!-- Open Graph Meta Tags -->
	<meta property="og:title" content="EQL - EVM Query Language" />
	<meta
		property="og:description"
		content="EQL is a language that allows you to query the Ethereum Virtual Machine (EVM) using a SQL-like syntax. It is designed to be the simplest way to ask blockchain questions and get answers."
	/>
	<meta property="og:image" content="https://https://eql-app.vercel.app/open-graph.png" />
	<meta property="og:url" content="" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="EQL - EVM Query Language" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />

	<!-- Twitter Card Meta Tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="EQL - EVM Query Language" />
	<meta
		name="twitter:description"
		content="EQL is a language that allows you to query the Ethereum Virtual Machine (EVM) using a SQL-like syntax. It is designed to be the simplest way to ask blockchain questions and get answers."
	/>
	<meta name="twitter:image" content="https://yourwebsite.com/path/to/thumbnail.jpg" />
	<meta name="twitter:url" content="https://yourwebsite.com/page-url" />
	<meta name="twitter:site" content="@iankguimaraes" />

	<!-- General Meta Tags -->
	<meta name="title" content="EQL - EVM Query Language" />
	<meta
		name="description"
		content="EQL is a language that allows you to query the Ethereum Virtual Machine (EVM) using a SQL-like syntax. It is designed to be the simplest way to ask blockchain questions and get answers."
	/>
	<meta
		name="keywords"
		content="ethereum, evm, ethereum query language, sql, eql, blockchain query language"
	/>
	<meta name="author" content="Ian K. Guimaraes" />
</svelte:head>

<div class="bg-dim-1 text-white font-mono h-full">
	<slot />
</div>
