export const keywords = ['GET', 'FROM', 'WHERE', 'ON', '>>'] as const;
export type Keywords = (typeof keywords)[number];

export const WILDCARD = '*';

export const chains = [
	WILDCARD,
	'eth',
	'sepolia',
	'mekong',
	'arb',
	'op',
	'base',
	'blast',
	'polygon',
	'mantle',
	'zksync',
	'taiko',
	'celo',
	'avalanche'
] as const;
export const chainsWithoutWildcard = chains.filter((chain) => chain !== WILDCARD);

const entities = ['account', 'block', 'tx', 'log'] as const;
type Entity = (typeof entities)[number];
export type Chain = (typeof chains)[number];

export const entityFields: Record<Entity, string[]> = {
	account: ['nonce', 'balance', 'code', 'chain'],
	block: [
		'number',
		'hash',
		'parent_hash',
		'timestamp',
		'state_root',
		'transactions_root',
		'receipts_root',
		'logs_bloom',
		'extra_data',
		'mix_hash',
		'total_difficulty',
		'base_fee_per_gas',
		'withdrawals_root',
		'blob_gas_used',
		'excess_blob_gas',
		'parent_beacon_block_root',
		'size',
		'chain'
	],
	tx: [
		'type',
		'hash',
		'from',
		'to',
		'data',
		'value',
		'fee',
		'gas_price',
		'gas',
		'status',
		'chain_id',
		'v',
		'r',
		's',
		'max_fee_per_blob_gas',
		'blob_versioned_hashes',
		'max_fee_per_gas',
		'max_priority_fee_per_gas',
		'access_list',
		'y_parity',
		'chain',
		'authorization_list'
	],
	log: [
		'address',
		'topic0',
		'topic1',
		'topic2',
		'topic3',
		'data',
		'block_hash',
		'block_number',
		'block_timestamp',
		'transaction_hash',
		'transaction_index',
		'log_index',
		'removed',
		'chain'
	]
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
		{ field: 'y_parity', operators: equalityOperators },
		{ field: 'status', operators: equalityOperators },
		{ field: 'type', operators: equalityOperators }
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
	dump: string | null;
}

export interface QueryError {
	position: { start: number; end: number } | null;
	message: string;
}

export type QueryResult = ParsedQuery | QueryError;

const defaultQuery: ParsedQuery = {
	entity: null,
	fields: null,
	filters: null,
	chains: null,
	lastKeyword: null,
	dump: null
};

interface Options {
	validatePartial?: boolean;
}

export function parseQuery(query: string, options: Options = {}): QueryResult {
	let currentQuery: ParsedQuery = { ...defaultQuery };
	const rawQuery = query;

	query = query.trim();
	if (query === '') {
		return defaultQuery;
	}

	const parts = query.split(/\s+(FROM|WHERE|ON|>>)(?:\s+|$)/);

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

	if (parts.includes('>>')) {
		const dumpIndex = parts.indexOf('>>');
		currentQuery.lastKeyword = '>>';
		parseDump(parts[dumpIndex + 1], currentQuery);
	}

	const error = checkQueryErrors(currentQuery, rawQuery, options.validatePartial ?? false);

	return error ?? currentQuery;
}

function parseGetFields(getPart: string, currentQuery: ParsedQuery) {
	if (getPart.startsWith('GET ')) {
		const fieldsStr = getPart.replace('GET ', '').trim();

		// Don't try to determine entity from fields when using wildcard
		if (fieldsStr === WILDCARD) {
			currentQuery.fields = [WILDCARD] as any;
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
	currentQuery.entity = entity as Entity;
}

function parseWhereFilters(wherePart: string, currentQuery: ParsedQuery) {
	const filtersList =
		wherePart
			.match(/(?:[^,()]|\([^)]*\))+/g)
			?.map((f) => f.trim())
			.filter((f) => f !== '') || [];

	const parsedFilters = filtersList
		.map((filterStr) => parseFilter(filterStr))
		.filter((f): f is Filter => f !== null);

	currentQuery.filters = parsedFilters.length > 0 ? parsedFilters : null;
}

function parseFilter(filterStr: string): Filter | null {
	const fullMatch = filterStr.match(/(\w+)\s*([=!<>]+[=]?)\s*(.+)/);
	const fieldOnlyMatch = filterStr.match(/^(\w+)$/);
	const fieldAndOperatorMatch = filterStr.match(/(\w+)\s*([=!<>]+[=]?)$/);
	const errorMatch = filterStr.match(/\w+\s+\w+/);

	if (fullMatch) {
		const [, field, operator, value] = fullMatch;
		return { field, operator, value: value.trim() };
	} else if (fieldAndOperatorMatch) {
		const [, field, operator] = fieldAndOperatorMatch;
		return { field, operator, value: null };
	} else if (fieldOnlyMatch) {
		const [, field] = fieldOnlyMatch;
		return { field, operator: null, value: null };
	} else if (errorMatch) {
		return {
			field: errorMatch[0],
			operator: null,
			value: null
		};
	}

	return null;
}

function parseOnChain(onPart: string, currentQuery: ParsedQuery) {
	const chainsList = onPart
		.split(',')
		.map((c) => c.trim().toLowerCase())
		.filter((c) => c !== '');

	currentQuery.chains = chainsList.length > 0 ? (chainsList as Chain[]) : null;
}

function parseDump(dumpPart: string, currentQuery: ParsedQuery) {
	currentQuery.dump = dumpPart;
}

export function isQueryComplete(parsedQuery: QueryResult): boolean {
	if (isQueryError(parsedQuery)) {
		return false;
	}

	return parsedQuery.entity !== null && parsedQuery.fields !== null && parsedQuery.chains !== null;
}

function checkQueryErrors(
	currentQuery: ParsedQuery,
	query: string,
	validatePartial: boolean
): QueryError | null {
	const shouldValidateWhenPartial =
		validatePartial && (isQueryComplete(currentQuery) || query.endsWith(' '));

	if (!shouldValidateWhenPartial) return null;

	if (!query.startsWith('GET ')) {
		return {
			position: { start: 0, end: query.length },
			message: 'Query must start with GET'
		};
	}

	// Validate entity
	if (currentQuery.entity && !isEntityValid(currentQuery.entity)) {
		return {
			position: {
				start: query.indexOf(currentQuery.entity),
				end: query.indexOf(currentQuery.entity) + currentQuery.entity.length
			},
			message: `Invalid entity "${currentQuery.entity}"`
		};
	}

	// Validate fields
	if (currentQuery.fields) {
		if (currentQuery.entity) {
			const fields = entityFields[currentQuery.entity];

			for (const field of currentQuery.fields) {
				if (!fields.includes(field) && field !== WILDCARD) {
					return {
						position: {
							start: query.indexOf(field),
							end: query.indexOf(field) + field.length
						},
						message: `Invalid field "${field}" for entity "${currentQuery.entity}"`
					};
				}
			}
		} else {
			for (const field of currentQuery.fields) {
				if (!allEntityFields.includes(field) && field !== WILDCARD) {
					return {
						position: {
							start: query.indexOf(field),
							end: query.indexOf(field) + field.length
						},
						message: `Invalid field "${field}"`
					};
				}
			}
		}

		// Validate filters
		if (currentQuery.filters && currentQuery.filters.length > 0) {
			for (const filter of currentQuery.filters) {
				if (
					filter.field &&
					currentQuery.entity &&
					!entityFilters[currentQuery.entity].some((f) => f.field === filter.field)
				) {
					return {
						position: {
							start: query.indexOf(filter.field),
							end: query.indexOf(filter.field) + filter.field.length
						},
						message: `Invalid filter "${filter.field}" for entity "${currentQuery.entity}"`
					};
				}
			}
		}
	}

	// Validate chains
	if (currentQuery.chains && currentQuery.chains.length > 0) {
		for (const chain of currentQuery.chains) {
			if (!chains.some((c) => c.startsWith(chain))) {
				return {
					position: {
						start: query.indexOf(chain),
						end: query.indexOf(chain) + chain.length
					},
					message: `Invalid chain "${chain}"`
				};
			}
		}
	}

	return null;
}

export function isEntityValid(entity: Entity) {
	return entities.includes(entity);
}

export function isQueryError(parsedQuery: QueryResult): parsedQuery is QueryError {
	return 'position' in parsedQuery && 'message' in parsedQuery;
}
