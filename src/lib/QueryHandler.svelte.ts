interface ApiResponse {
	result: Record<string, object[]>;
	error: string;
}

export interface Result {
	query: string;
	result?: object[];
	error?: string;
}

interface DumpFile {
	url: string;
	name: string;
}

export class QueryHandler {
	private static readonly API_URL = 'https://api.eql.sh/run';
	public results = $state<Result[]>([]);
	public dumpFile: DumpFile | null = $state(null);
	private _fetchingQuery = $state(false);

	public async runQuery(query: string): Promise<void> {
		this._fetchingQuery = true;
		this.dumpFile = null;

		try {
			const res = await fetch(`${QueryHandler.API_URL}?query=${query.replace(/\s/g, '+')}`);
			const resContentType = res.headers.get('Content-Type');

			if (resContentType?.includes('application/json')) {
				const { result, error } = (await res.json()) as ApiResponse;
				if (error) {
					this.results.push({
						query,
						error
					});
				} else if (this.queryHasResults(result)) {
					this.results.push({
						result: Object.keys(result).map((k) => result[k]),
						query
					});
				} else {
					this.results.push({
						query,
						error: 'No results found'
					});
				}
			} else if (resContentType?.includes('application/octet-stream')) {
				const blob = await res.blob();
				const disposition = res.headers.get('Content-Disposition');

				this.dumpFile = {
					url: URL.createObjectURL(blob),
					name: disposition?.split('filename=')[1].replaceAll('"', '').trim() || 'dump'
				};
			}
		} finally {
			this._fetchingQuery = false;
		}
	}

	public clearResults(): void {
		this.dumpFile = null;
		this.results.splice(0, this.results.length);
	}

	public get fetchingQuery() {
		return this._fetchingQuery;
	}

	private queryHasResults(result: Record<string, object[]>): boolean {
		return !!(
			(result.transaction && result.transaction.length > 0) ||
			(result.log && result.log.length > 0) ||
			(result.account && result.account.length > 0) ||
			(result.block && result.block.length > 0)
		);
	}
}

export const queryHandler = new QueryHandler();
