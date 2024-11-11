import {
	allEntityFields,
	allOperators,
	chains,
	chainsWithoutWildcard,
	entityFields,
	entityFilters,
	isEntityValid,
	isQueryError,
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
		'*',
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
	ON: ['eth', 'arb', 'op', 'base', 'sepolia'],
	'>>': ['.json', '.csv', '.parquet']
} as const;

const entityFromSuggestions: Record<Entities, string[]> = {
	tx: ['WHERE', '0x'],
	log: ['WHERE'],
	account: ['.eth', '0x'],
	block: ['1', '1:10', 'latest', 'pending', 'finalized', 'earliest']
};

export function autocomplete(query: string): Suggestion[] {
	const parsedQuery = parseQuery(query, { validatePartial: true });

	if (isQueryError(parsedQuery)) {
		return [];
	}

	// Autocomplete only shows suggestions after a keyword and a space. This feels more natural for the user.
	const lastWord = query.trim().split(' ').pop();
	const lastWordRaw = query.split(' ').pop();

	if (keywords.includes(lastWordRaw as Keywords)) return [];

	if (!parsedQuery.lastKeyword) return ['GET'];

	if (parsedQuery.lastKeyword === 'GET') {
		if (
			(parsedQuery.fields?.length && query.endsWith(' ') && !query.endsWith(', ')) ||
			(lastWordRaw && 'FROM'.startsWith(lastWordRaw)) ||
			(lastWordRaw && 'from'.startsWith(lastWordRaw) && query.split(' ').length > 2) ||
			query.toLowerCase().split('from').length > 2
		) {
			return ['FROM'];
		}

		const lastField = parsedQuery.fields?.at(-1);
		const restFields = parsedQuery.fields?.slice(0, -1);

		if (
			query.endsWith(',') ||
			(lastWordRaw && allEntityFields.includes(lastWordRaw)) ||
			lastWord === '*'
		) {
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
		const hasValidEntity = parsedQuery.entity && isEntityValid(parsedQuery.entity);
		const queryFields = parsedQuery.fields;

		if (!hasValidEntity) {
			const hasSpecificFields = queryFields && !queryFields.includes('*');
			if (hasSpecificFields) {
				return entities.filter((entity) =>
					queryFields.every((field) => entityFields[entity].includes(field))
				);
			}
			return keywordSuggestions.FROM.filter(
				(entity) =>
					lastWordRaw === '' ||
					(typeof entity === 'string' && lastWord && entity.startsWith(lastWord))
			);
		}

		const isEntityComplete = query.endsWith(`${parsedQuery.entity} `);
		const isCommaAfterInvalidEntity =
			query.endsWith(', ') && lastWord && !entities.includes(lastWord as Entities);

		if (parsedQuery.entity && (isEntityComplete || isCommaAfterInvalidEntity)) {
			return entityFromSuggestions[parsedQuery.entity];
		}

		if (lastWord === 'FROM' && parsedQuery.entity) {
			return [parsedQuery.entity];
		}

		const isReadyForNextKeyword =
			!entities.includes(lastWord as Entities) &&
			!keywords.includes(lastWord as Keywords) &&
			query.endsWith(' ');

		const isPartialKeyword =
			lastWordRaw &&
			('WHERE'.toLowerCase().startsWith(lastWordRaw.toLowerCase()) ||
				'ON'.toLowerCase().startsWith(lastWordRaw.toLowerCase()));

		if (isReadyForNextKeyword || isPartialKeyword) {
			const isEntityWithoutFilters =
				parsedQuery.entity === 'account' || parsedQuery.entity === 'block';

			return isEntityWithoutFilters
				? ['ON']
				: ['WHERE', 'ON'].filter(
						(keyword) => lastWordRaw && keyword.toLowerCase().startsWith(lastWordRaw.toLowerCase())
					);
		}

		return [];
	}

	if (parsedQuery.lastKeyword === 'WHERE') {
		if (!parsedQuery.entity) throw Error('WHERE keyword requires an entity');

		const lastFilter = parsedQuery.filters?.at(-1);
		const entityFilterFields = entityFilters[parsedQuery.entity].map((f) => f.field);

		const isFilterComplete = lastFilter?.operator && lastFilter?.value && query.endsWith(' ');
		if (isFilterComplete && !query.endsWith(', ')) {
			return ['ON'];
		}

		const isFilterTerminated = /[,()]$/.test(query);
		const isValueComplete = lastFilter?.value && lastWord === lastFilter.value;
		const isFieldComplete = lastWordRaw && entityFilterFields.includes(lastWordRaw);
		if (isFilterTerminated || isValueComplete || isFieldComplete) {
			return [];
		}

		const isPartialField = lastFilter && !lastFilter.operator && !lastFilter.value;
		if (isPartialField && !entityFilterFields.includes(lastFilter.field)) {
			return entityFilters[parsedQuery.entity]
				.filter((f) => f.field.startsWith(lastFilter.field))
				.map((f) => f.field);
		}

		const hasOperatorAtEnd = /[=!<>]\s*$/.test(query);
		if (hasOperatorAtEnd) {
			return [];
		}

		const lastChar = query.at(-1);
		const shouldShowOperators = lastFilter && !lastFilter.value && lastChar && query.endsWith(' ');
		if (shouldShowOperators && !allOperators.includes(lastChar)) {
			const filterDef = entityFilters[parsedQuery.entity].find(
				(filter) => filter.field === lastFilter.field
			);
			const operators = filterDef?.operators || [];

			if (!operators.length) throw Error(`Operators not found for filter ${lastFilter}`);
			return operators;
		}

		const unusedFields = entityFilterFields.filter(
			(field) => !parsedQuery.filters?.some((filter) => filter.field === field)
		);
		return unusedFields;
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

		if (lastWordRaw && !chainsWithoutWildcard.some((chain) => chain === lastWordRaw)) {
			return chainsWithoutWildcard.filter((chain) => chain.startsWith(lastWordRaw));
		}

		return [...chainsWithoutWildcard].filter((chain) => !parsedQuery.chains?.includes(chain));
	}

	if (parsedQuery.lastKeyword === '>>') {
		if (query.endsWith(' ')) {
			return keywordSuggestions['>>'];
		}
	}

	return [];
}

export function isSuggestionWithFields(suggestion: Suggestion): suggestion is SuggestionWithFields {
	return typeof suggestion === 'object' && 'fields' in suggestion;
}
