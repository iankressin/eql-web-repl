import {
	allEntityFields,
	chains,
	chainsWithoutWildcard,
	entityFields,
	entityFilters,
	keywords,
	parseQuery,
	type Chain,
	type Keywords
} from './parser';

const entities = ['account', 'block', 'tx', 'log'] as const;
type Entities = (typeof entities)[number];

export type SuggestionWithFields = { schema: Entities; fields: string[] };
export type Suggestion = SuggestionWithFields | string;

export const keywordSuggestions: Record<Keywords, Suggestion[]> = {
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

const entitySuggestions: Record<Entities, string[]> = {
	tx: ['WHERE', '0x'],
	log: ['WHERE'],
	account: ['.eth', '0x'],
	block: ['1', '1:10', 'latest', 'pending', 'finalized', 'earliest']
};

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
		if (parsedQuery.fields?.length && query.endsWith(' ') && !query.endsWith(', ')) {
			return ['FROM'];
		}

		const lastField = parsedQuery.fields?.at(-1);
		const restFields = parsedQuery.fields?.slice(0, -1);

		if (query.endsWith(',') || (lastWordRaw && allEntityFields.includes(lastWordRaw))) {
			return [];
		}

		if (parsedQuery.entity) {
			const entityFieldList = entityFields[parsedQuery.entity];

			if (lastField && !entityFieldList.includes(lastField)) {
				return entityFieldList.filter((field) => field.includes(lastField));
			}

			return entityFieldList.filter((field) => !parsedQuery.fields?.includes(field));
		}

		// If no entity but fields exist, suggest matching fields across all entities
		if (lastField) {
			const filteredSuggestions = keywordSuggestions[parsedQuery.lastKeyword].filter(
				(suggestion) => {
					if (typeof suggestion === 'string') {
						return suggestion.startsWith(lastField);
					}
					return (
						suggestion.fields.some((field) => field.startsWith(lastField)) &&
						restFields?.every((f) => suggestion.fields.includes(f))
					);
				}
			);

			const filtered = filteredSuggestions.map((suggestion) => {
				if (!isSuggestionWithFields(suggestion)) return suggestion;

				return {
					...suggestion,
					fields:
						lastWordRaw === ''
							? suggestion.fields
							: suggestion.fields.filter((field) => field.startsWith(lastField))
				};
			});

			if (filtered.length === 1 && isSuggestionWithFields(filtered[0])) {
				return filtered[0].fields;
			}

			return filtered;
		}

		return keywordSuggestions[parsedQuery.lastKeyword];
	}

	if (parsedQuery.lastKeyword === 'FROM') {
		if (!parsedQuery.entity) {
			return keywordSuggestions[parsedQuery.lastKeyword];
		}

		if (parsedQuery.entity && query.endsWith(`${parsedQuery.entity} `)) {
			return entitySuggestions[parsedQuery.entity];
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
		if (parsedQuery.chains?.length && query.endsWith(' ') && !query.endsWith(', ')) {
			return ['>>'];
		}

		if (lastWord === 'ON') {
			return [...chains];
		}

		if (query.endsWith(',') || lastWord === '*' || chains.includes(lastWord as Chain)) {
			return [];
		}

		if (lastWord === '*') {
			return [];
		}

		if (lastWordRaw && !chainsWithoutWildcard.some((chain) => chain === lastWordRaw)) {
			return chainsWithoutWildcard.filter((chain) => chain.startsWith(lastWordRaw));
		}

		return [...chainsWithoutWildcard].filter((chain) => !parsedQuery.chains?.includes(chain));
	}

	return [];
}

export function isSuggestionWithFields(suggestion: Suggestion): suggestion is SuggestionWithFields {
	return typeof suggestion === 'object' && 'fields' in suggestion;
}
