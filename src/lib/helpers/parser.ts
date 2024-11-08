export const keywords = ['GET', 'FROM', 'WHERE', 'ON'] as const;
export type Keywords = (typeof keywords)[number];

export const chains = [
	'*',
	'eth',
	'arb',
	'op',
	'base',
	'blast',
	'polygon',
	'sepolia',
	'mantle',
	'zksync',
	'taiko',
	'celo',
	'avalanche'
] as const;
export const chainsWithoutWildcard = chains.filter((chain) => chain !== '*');

type Entity = 'account' | 'block' | 'tx' | 'log';
export type Chain = (typeof chains)[number];

export const entityFields: Record<Entity, string[]> = {
	account: ['nonce', 'balance', 'code', 'chain'],
	block: ['hash', 'number', 'timestamp', 'transactions'],
	tx: ['hash', 'nonce', 'from', 'to', 'value', 'gas', 'gasprice', 'input', 'status'],
	log: ['address', 'topics', 'data', 'block', 'transaction', 'index']
} as const;
export const allEntityFields = Object.values(entityFields).flat();

export const equalityOperators = ['=', '!='];
export const comparisonOperators = ['>', '>=', '<', '<='];
export const allOperators = [...equalityOperators, ...comparisonOperators];

export type EqualityOperator = (typeof equalityOperators)[number];
export type ComparisonOperator = (typeof comparisonOperators)[number];
export type Operator = EqualityOperator | ComparisonOperator;

export const entityFilters: Record<Entity, { field: string; operators: Operator[] }[]> = {
	account: [],
	block: [],
	tx: [
		{ field: 'block', operators: ['='] },
		{ field: 'from', operators: equalityOperators },
		{ field: 'to', operators: equalityOperators },
		{ field: 'data', operators: equalityOperators },
		{ field: 'value', operators: allOperators },
		{ field: 'fee', operators: allOperators },
		{ field: 'gas', operators: allOperators },
		{ field: 'gas_price', operators: allOperators },
		{ field: 'chain', operators: equalityOperators },
		{ field: 'max_fee_per_blob_gas', operators: allOperators },
		{ field: 'blob_versioned_hashes', operators: equalityOperators },
		{ field: 'max_fee_per_gas', operators: allOperators },
		{ field: 'max_priority_fee_per_gas', operators: allOperators },
		{ field: 'access_list', operators: equalityOperators },
		{ field: 'y_parity', operators: equalityOperators }
	],
	log: [
		{ field: 'block', operators: ['='] },
		{ field: 'event_signature', operators: ['='] },
		{ field: 'topic0', operators: ['='] },
		{ field: 'topic1', operators: ['='] },
		{ field: 'topic2', operators: ['='] },
		{ field: 'topic3', operators: ['='] },
		{ field: 'address', operators: ['='] }
	]
} as const;

interface Filter {
	field: (typeof entityFilters)[Entity][number]['field'];
	operator: Operator | null;
	value: string | null;
}

export interface ParsedQuery {
	entity: Entity | null;
	fields: (typeof entityFields)[Entity] | null;
	filters: Filter[] | null;
	chains: Chain[] | null;
	lastKeyword: Keywords | null;
}

const defaultQuery: ParsedQuery = {
	entity: null,
	fields: null,
	filters: null,
	chains: null,
	lastKeyword: null
};

// TODO: should consider wildcard (*) operators for fields and chains
export function parseQuery(query: string): ParsedQuery {
	let currentQuery: ParsedQuery = { ...defaultQuery };

	query = query.trim();
	if (query === '') {
		return defaultQuery;
	}

	const parts = query.split(/\s+(FROM|WHERE|ON)(?:\s+|$)/);

	if (parts[0].startsWith('GET')) {
		currentQuery.lastKeyword = 'GET';
		parseGetFields(parts[0], currentQuery);
	}

	if (parts.length >= 3) {
		currentQuery.lastKeyword = 'FROM';
		parseFromEntity(parts[2], currentQuery);
	}

	if (parts.includes('WHERE')) {
		currentQuery.lastKeyword = 'WHERE';
		const whereIndex = parts.indexOf('WHERE');
		parseWhereFilters(parts[whereIndex + 1], currentQuery);
	}

	if (parts.includes('ON')) {
		currentQuery.lastKeyword = 'ON';
		const onIndex = parts.indexOf('ON');
		parseOnChain(parts[onIndex + 1], currentQuery);
	}

	return currentQuery;
}

function parseGetFields(getPart: string, currentQuery: ParsedQuery) {
	if (getPart.startsWith('GET ')) {
		const fieldsStr = getPart.replace('GET ', '').trim();

		// Don't try to determine entity from fields when using wildcard
		if (fieldsStr === '*') {
			currentQuery.fields = ['*'] as any;
			return;
		}

		const fieldsList = fieldsStr
			.split(',')
			.map((f) => f.trim())
			.filter((str) => str !== '');
		currentQuery.fields = fieldsList as any;

		// Determine entity based on requested fields if not explicitly specified
		if (!currentQuery.entity) {
			let maxMatchCount = 0;
			let bestMatch: Entity | null = null;
			let hasTie = false;

			for (const [entity, fields] of Object.entries(entityFields)) {
				const matchCount = fieldsList.filter((field) => fields.includes(field)).length;

				if (matchCount > 0) {
					if (matchCount > maxMatchCount) {
						maxMatchCount = matchCount;
						bestMatch = entity as Entity;
						hasTie = false;
					} else if (matchCount === maxMatchCount) {
						hasTie = true;
					}
				}
			}

			currentQuery.entity = hasTie ? null : bestMatch;
		}
	}
}

function parseFromEntity(fromPart: string, currentQuery: ParsedQuery) {
	const entity = fromPart.trim().toLowerCase().split(' ')[0];
	if (Object.keys(entityFields).includes(entity)) {
		currentQuery.entity = entity as Entity;
	}
}

function parseWhereFilters(wherePart: string, currentQuery: ParsedQuery) {
	const filtersList = wherePart
		.split(',')
		.map((f) => f.trim())
		.filter((f) => f !== '');

	const parsedFilters = filtersList
		.map((filterStr) => parseFilter(filterStr, currentQuery.entity))
		.filter((f): f is Filter => f !== null);

	currentQuery.filters = parsedFilters.length > 0 ? parsedFilters : null;
}

function parseFilter(filterStr: string, entity: Entity | null): Filter | null {
	const fullMatch = filterStr.match(/(\w+)\s*([=!<>]+[=]?)\s*(.+)/);
	const fieldOnlyMatch = filterStr.match(/^(\w+)$/);
	const fieldAndOperatorMatch = filterStr.match(/(\w+)\s*([=!<>]+[=]?)$/);

	if (fullMatch) {
		const [, field, operator, value] = fullMatch;
		return { field, operator, value: value.trim() };
	} else if (fieldAndOperatorMatch) {
		const [, field, operator] = fieldAndOperatorMatch;
		return { field, operator, value: null };
	} else if (fieldOnlyMatch) {
		const [, field] = fieldOnlyMatch;
		return { field, operator: null, value: null };
	}

	return null;
}

function parseOnChain(onPart: string, currentQuery: ParsedQuery) {
	const chainsList = onPart
		.split(',')
		.map((c) => c.trim().toLowerCase())
		.filter((c) => c !== '');

	const validChains = chainsList.filter((chain) => chains.includes(chain as Chain));
	currentQuery.chains = validChains.length > 0 ? (validChains as Chain[]) : null;
}

export function isQueryComplete(query: string): boolean {
	const parsedQuery = parseQuery(query);

	return parsedQuery.entity !== null && parsedQuery.fields !== null && parsedQuery.chains !== null;
}
