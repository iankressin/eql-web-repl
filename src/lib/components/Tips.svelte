<div class="overflow-y-auto flex flex-col gap-4">
	<h2 class="text-xl font-bold intalic text-orange">How to query</h2>
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
						<li>code</li>
					</ul>
				</div>

				<div>
					<p class="text-yellow">Block</p>
					<ul class="list-disc list-inside">
						<li>number [id]</li>
						<li>timestamp</li>
						<li>size</li>
						<li>hash</li>
						<li>parent_hash</li>
						<li>state_root</li>
						<li>transactions_root</li>
						<li>receipts_root</li>
						<li>logs_bloom</li>
						<li>extra_data</li>
						<li>mix_hash</li>
						<li>total_difficulty</li>
						<li>base_fee_per_gas</li>
						<li>withdrawals_root</li>
						<li>blob_gas_used</li>
						<li>excess_blob_gas</li>
						<li>parent_beacon_block_root</li>
					</ul>
				</div>

				<div>
					<p class="text-yellow">Transaction</p>
					<ul class="list-disc list-inside">
						<li>hash [id]</li>
						<li>transaction_type</li>
						<li>from</li>
						<li>to</li>
						<li>data</li>
						<li>value</li>
						<li>gas_price</li>
						<li>gas</li>
						<li>status</li>
						<li>chain_id</li>
						<li>v</li>
						<li>r</li>
						<li>s</li>
						<li>max_fee_per_blob_gas</li>
						<li>max_fee_per_gas</li>
						<li>max_priority_fee_per_gas</li>
						<li>y_parity</li>
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
					<li>blast</li>
					<li>polygon</li>
					<li>sepolia</li>
					<li>anvil</li>
					<li>local</li>
					<li>mantle</li>
					<li>zksync</li>
					<li>taiko</li>
					<li>celo</li>
					<li>avalanche</li>
					<li>scroll</li>
					<li>bnb</li>
					<li>linea</li>
					<li>tron</li>
					<li>zora</li>
					<li>moonbeam</li>
					<li>moonriver</li>
					<li>ronin</li>
					<li>fantom</li>
					<li>kava</li>
					<li>gnosis</li>
				</ul>
			</div>
		</div>

		<div class="flex flex-col gap-4">
			<h3 class="text-lg font-bold text-orange">Ranges</h3>
			<div class="flex flex-col gap-2">
				<p>EQL support block ranges using the syntax below</p>
				<code class="bg-black p-4 w-full rounded-md">
					GET &lt[fields,]&gt FROM block &ltstart&gt:&ltend&gt ON &ltchain&gt
				</code>
				<p>
					<i>Start</i> and <i>end</i> must be valid block tags or numbers where <i>start</i> &lt
					<i>end</i>
				</p>
			</div>

			<div class="flex flex-col gap-2">
				<p class="text-yellow"><b>Supported block tags</b></p>
				<ul class="list-disc list-inside">
					<li>latest</li>
					<li>earliest</li>
					<li>pending</li>
					<li>finalized</li>
					<li>safe</li>
				</ul>
			</div>

			<div class="flex flex-col gap-2">
				<p class="text-yellow"><b>Example</b></p>
				<code class="bg-black p-4 w-full rounded-md">
					GET size, hash, timestamp FROM block 1:10 ON eth
				</code>
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
