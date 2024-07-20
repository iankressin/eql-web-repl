<div class="overflow-y-auto flex flex-col gap-4">
	<h2 class="text-xl font-bold intalic text-orange">Tips</h2>
	<div class="flex flex-col gap-10 max-w-[1200px]">
		<p class="p">
			EQL is a language that allows you to query the Ethereum Virtual Machine (EVM) using a SQL-like
			syntax. It is designed to be the simplest way to ask blockchain questions and get answers.
		</p>

		<div class="flex flex-col gap-4">
			<h3 class="text-lg font-bold text-orange">Expressions</h3>

			<div class="flex flex-col gap-2">
				<p class="text-yellow">GET expressions</p>
				<code class="bg-black p-4 w-full rounded-md">
					GET &lt;[fields, ]&gt; FROM &lt;entity&gt; &lt;entity_id&gt; ON &lt;chain&gt;
				</code>
			</div>

			<div class="flex flex-col gap-2">
				<p class="text-yellow">SEND expressions <span class="text-blue">(Soon)</span></p>
				<code class="bg-black p-4 w-full rounded-md">
					SEND &lt;type&gt; to=&lt;address&gt;, value=&lt;ether&gt;, data=&lt;bytes&gt; ON
					&lt;chain&gt;
				</code>
			</div>

			<div class="flex flex-col gap-2">
				<p class="text-yellow">MATH expressions <span class="text-blue">(Soon)</span></p>
				<code class="bg-black p-4 w-full rounded-md"> &lt;operator&gt;(&lt;[expr, ]&gt;) </code>
			</div>
		</div>

		<div class="flex flex-col gap-2">
			<h3 class="text-lg font-bold text-orange">Entities</h3>

			<div class="flex gap-16">
				<div>
					<p class="text-yellow">Account</p>
					<ul class="list-disc list-inside">
						<li>address [id]</li>
						<li>nonce</li>
						<li>balance</li>
					</ul>
				</div>

				<div>
					<p class="text-yellow">Block</p>
					<ul class="list-disc list-inside">
						<li>number [id]</li>
						<li>hash</li>
						<li>timestamp</li>
						<li>size</li>
						<li>parent_hash</li>
					</ul>
				</div>

				<div>
					<p class="text-yellow">Transaction</p>
					<ul class="list-disc list-inside">
						<li>hash [id]</li>
						<li>from</li>
						<li>to</li>
						<li>value</li>
						<li>data</li>
						<li>fee</li>
						<li>gas_price</li>
						<li>timestamp</li>
						<li>status</li>
					</ul>
				</div>
			</div>
		</div>

		<div class="flex flex-col gap-2">
			<h3 class="text-lg font-bold text-orange">Chains</h3>

			<div class="flex gap-16">
				<ul class="list-disc list-inside">
					<li>eth</li>
					<li>arb</li>
					<li>op</li>
					<li>base</li>
					<li>polygon</li>
				</ul>
			</div>
		</div>

		<div class="flex flex-col gap-4">
			<h3 class="text-lg font-bold text-orange">Examples</h3>

			<div class="flex flex-col gap-2">
				<p>Balance of an account</p>
				<code class="bg-black p-4 w-full rounded-md">
					GET balance FROM account 0x00000000219ab540356cbb839cbe05303d7705fa ON eth
				</code>
			</div>

			<div class="flex flex-col gap-2">
				<p>Transaction count of an account</p>
				<code class="bg-black p-4 w-full rounded-md">
					GET nonce FROM account 0x00000000219ab540356cbb839cbe05303d7705fa ON eth
				</code>
			</div>

			<div class="flex flex-col gap-2">
				<p>Timestamp and size of a block</p>
				<code class="bg-black p-4 w-full rounded-md">
					GET timestamp, size FROM block 1 ON polygon
				</code>
			</div>

			<div class="flex flex-col gap-2">
				<p>From, to, and value of a transaction</p>
				<code class="bg-black p-4 w-full rounded-md">
					GET from, to, value FROM tx
					0xa50a9587ca01ac32590d3bf4dcb8c012166f18845ef170ef149d76bde100430b ON polygon
				</code>
			</div>
		</div>
	</div>
</div>
