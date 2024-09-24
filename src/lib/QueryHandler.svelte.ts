interface Account {
	nonce: number;
	balance: string;
	address: string;
}

interface Block {
	number: number;
	timestamp: number;
	hash: string;
	size: number;
	parent_hash: string;
}

interface Transaction {
	hash: string;
	from: string;
	to: string;
	data: string;
	value: string;
	gas_price: string;
	status: boolean;
}

interface ApiResponse {
	result: { query: string; result: Block[] | Transaction[] | Account[] }[];
	error: {
		query: string;
		message: string;
	};
}

export interface Result {
	query: string;
	result?: Block[] | Transaction[] | Account[];
	error?: string;
}

interface DumpFile {
	url: string;
	name: string;
}

export class QueryHandler {
	private static readonly API_URL = 'https://eql-api.vercel.app/api/run';
	public results = $state<Result[]>([]);
	public dumpFile: DumpFile | null = $state(null);
	private _fetchingQuery = $state(false);

	public async runQuery(query: string): Promise<void> {
		this._fetchingQuery = true;
		this.dumpFile = null;
		this.results = [];

		try {
			const res = await fetch(`${QueryHandler.API_URL}?query=${query.replace(/\s/g, '+')}`);
			const resContentType = res.headers.get('Content-Type');

			if (resContentType?.includes('application/json')) {
				const { result, error } = (await res.json()) as ApiResponse;

				if (error) {
					this.results.push({
						query: error.query,
						error: error.message
					});
				} else if (result && result.length > 0) {
					this.results = result;
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
}

export const queryHandler = new QueryHandler();
