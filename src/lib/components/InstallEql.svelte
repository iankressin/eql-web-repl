<div class="overflow-y-auto flex flex-col gap-4">
	<h2 class="text-xl font-bold intalic text-orange">Install EQL locally</h2>
	<div class="flex flex-col gap-8 max-w-[1000px]">
		<div class="flex flex-col gap-4">
			<div class="flex flex-col gap-2">
				<p>
					To install EQL locally, first install EQL version manager by running the following
					command:
				</p>
				<code class="bg-black p-4 w-full rounded-md">
					curl https://raw.githubusercontent.com/iankressin/eql/main/eqlup/install.sh | sh
				</code>
			</div>
			<div class="flex flex-col gap-2">
				<p>Next, install the latest version of EQL using this command:</p>
				<code class="bg-black p-4 w-full rounded-md">eqlup</code>
			</div>
		</div>

		<div class="flex flex-col gap-4">
			<h3 class="text-lg font-bold text-orange">UpdatingInstall it EQL</h3>
			<div class="flex flex-col gap-2">
				<p>To update EQL to the latest version, you can simply run `eqlup` again:</p>
				<code class="bg-black p-4 w-full rounded-md">eqlup</code>
			</div>
		</div>

		<div class="flex flex-col gap-4">
			<h3 class="text-lg font-bold text-orange">Usage</h3>
			<div class="flex flex-col gap-2">
				<p>Queries can be run by executing `.eql` files with `run` command:</p>
				<code class="bg-black p-4 w-full rounded-md">eql run my-query.eql</code>
			</div>

			<div class="flex flex-col gap-2">
				<p>Or using the language REPL, similar to this app:</p>
				<code class="bg-black p-4 w-full rounded-md"> eql repl</code>
			</div>
		</div>
	</div>
</div>
