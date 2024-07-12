interface Result {
    query: string
    result: string
}

export class QueryHandler {
    public readonly results = $state<Result[]>([])

    public async runQuery(query: string): Promise<void> {
        this.results.push({
            query,
            result: "one more result"
        })
    }
}

export const queryHandler = new QueryHandler()
