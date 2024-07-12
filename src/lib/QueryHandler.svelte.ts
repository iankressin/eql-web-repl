interface Result {
    query: string
    result: string
}

export class QueryHandler {
    private static readonly API_URL = "https://eql-api.onrender.com/run-query"
    public readonly results = $state<Result[]>([])

    public async runQuery(query: string): Promise<void> {
        const res = await fetch(`${QueryHandler.API_URL}?query=${query.replace(/\s/g, "+")}`)
        const result = await res.json()
        console.log(result)

        this.results.push({
            query,
            result: "one more result"
        })
    }
}

export const queryHandler = new QueryHandler()
