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
	result: { query: string; result: Block | Transaction | Account }[];
	error: {
		query: string;
		message: string;
	};
}

export interface Result {
	query: string;
	result?: Block | Transaction | Account;
	error?: string;
}

export class QueryHandler {
	private static readonly API_URL = 'https://eql-api.vercel.app/api/run';
	public readonly results = $state<Result[]>([]);
	private _fetchingQuery = $state(false);

	public async runQuery(query: string): Promise<void> {
		this._fetchingQuery = true;

		try {
			const res = await fetch(`${QueryHandler.API_URL}?query=${query.replace(/\s/g, '+')}`);
			const { result, error } = (await res.json()) as ApiResponse;

			if (error) {
				this.results.push({
					query: error.query,
					error: error.message
				});
			} else if (result && result.length > 0) {
				this.results.push({
					...result[0]
				});
			} else {
				this.results.push({
					query,
					error: 'No results found'
				});
			}
		} finally {
			this._fetchingQuery = false;
		}
	}

	public clearResults(): void {
		console.log('clearing results');

		this.results.splice(0, this.results.length);
	}

	public get fetchingQuery() {
		return this._fetchingQuery;
	}
}

export const queryHandler = new QueryHandler();
