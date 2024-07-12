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
	// private static readonly API_URL = 'https://eql-api.onrender.com/run-query';
	private static readonly API_URL = 'http://localhost:3000/run-query';
	public readonly results = $state<Result[]>([]);

	public async runQuery(query: string): Promise<void> {
		const res = await fetch(`${QueryHandler.API_URL}?query=${query.replace(/\s/g, '+')}`);
		const { result, error } = (await res.json()) as ApiResponse;

		console.log(result, error);

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
	}

	public clearResults(): void {
		console.log('clearing results');

		this.results.splice(0, this.results.length);
	}
}

export const queryHandler = new QueryHandler();
