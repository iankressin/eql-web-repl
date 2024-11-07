import { chains, entityFields, entityFilters, keywords, parseQuery, type Keywords } from './parser';

const entities = ['account', 'block', 'tx', 'log'] as const;
type Entities = (typeof entities)[number];

export type SuggestionWithFields = { schema: Entities; fields: string[] };
export type Suggestion = SuggestionWithFields | string;

export const suggestions: Record<Keywords, Suggestion[]> = {
	GET: [
		{
			schema: 'account',
			fields: ['nonce', 'balance', 'code', 'chain']
		},
		{
			schema: 'block',
			fields: ['hash', 'number', 'timestamp', 'transactions']
		},
		{
			schema: 'tx',
			fields: ['hash', 'nonce', 'from', 'to', 'value', 'gas', 'gasprice', 'input', 'status']
		},
		{
			schema: 'log',
			fields: ['address', 'topics', 'data', 'block', 'transaction', 'index']
		}
	],
	FROM: ['account', 'block', 'tx', 'log'],
	WHERE: [],
	ON: ['eth', 'arb', 'op', 'base', 'sepolia']
} as const;

export function autocomplete(query: string): Suggestion[] {
	// Autocomplete only shows suggestions after a keyword and a space. This feels more natural for the user.
	const lastWord = query.trim().split(' ').pop();
	const lastWordRaw = query.split(' ').pop();
	if (keywords.includes(lastWordRaw as Keywords)) return [];

	const parsedQuery = parseQuery(query);

	if (!parsedQuery.lastKeyword) {
		return ['GET'];
	}

	if (parsedQuery.lastKeyword === 'GET') {
		// Suggest FROM if fields are provided and query doesn't end with comma
		if (parsedQuery.fields?.length && query.endsWith(' ') && !query.endsWith(', ')) {
			return ['FROM'];
		}

		const lastField = parsedQuery.fields?.at(-1);

		// If entity is known, filter its fields
		if (parsedQuery.entity) {
			const entityFieldList = entityFields[parsedQuery.entity];

			// If user is typing a field, suggest matching fields
			if (lastField && !entityFieldList.includes(lastField)) {
				return entityFieldList.filter((field) => field.includes(lastField));
			}

			// Otherwise suggest remaining unused fields
			return entityFieldList.filter((field) => !parsedQuery.fields?.includes(field));
		}

		// If no entity but fields exist, suggest matching fields across all entities
		if (lastField) {
			return suggestions[parsedQuery.lastKeyword].filter((suggestion) =>
				typeof suggestion === 'string'
					? suggestion.includes(lastField)
					: suggestion.fields.some((field) => field.includes(lastField))
			) as Suggestion[];
		}

		// Default to showing all GET suggestions
		return suggestions[parsedQuery.lastKeyword];
	}

	if (parsedQuery.lastKeyword === 'FROM') {
		if (!parsedQuery.entity) {
			return suggestions[parsedQuery.lastKeyword];
		}

		if (lastWord === 'FROM') {
			return [parsedQuery.entity];
		}

		if (
			!entities.includes(lastWord as Entities) &&
			!keywords.includes(lastWord as Keywords) &&
			query.endsWith(' ')
		) {
			return ['WHERE', 'ON'];
		}

		return [];
	}

	if (parsedQuery.lastKeyword === 'WHERE' && parsedQuery.entity) {
		return entityFilters[parsedQuery.entity];
	}

	if (parsedQuery.lastKeyword === 'ON') {
		return ['*', ...chains];
	}

	return [];
}
