export const keywords = ['GET', 'FROM', 'WHERE', 'ON'] as const;
export type Keywords = (typeof keywords)[number];

export const chains = [
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
type Entity = 'account' | 'block' | 'tx' | 'log';
type Chain = (typeof chains)[number];

export const entityFields: Record<Entity, string[]> = {
	account: ['nonce', 'balance', 'code', 'chain'],
	block: ['hash', 'number', 'timestamp', 'transactions'],
	tx: ['hash', 'nonce', 'from', 'to', 'value', 'gas', 'gasprice', 'input', 'status'],
	log: ['address', 'topics', 'data', 'block', 'transaction', 'index']
} as const;

export const entityFilters: Record<Entity, string[]> = {
	account: entityFields.account,
	block: entityFields.block,
	tx: entityFields.tx,
	log: ['topic0', 'topic1', 'topic2', 'topic3', 'block_hash', 'event_signature', 'address']
} as const;

export interface ParsedQuery {
	entity: Entity | null;
	fields: (typeof entityFields)[Entity] | null;
	filters: (typeof entityFilters)[Entity] | null;
	chain: Chain | null;
	lastKeyword: Keywords | null;
}

const defaultQuery: ParsedQuery = {
	entity: null,
	fields: null,
	filters: null,
	chain: null,
	lastKeyword: null
};

// TODO: should consider wildcard (*) operators for fields and chains
export function parseQuery(query: string): ParsedQuery {
	let currentQuery: ParsedQuery = { ...defaultQuery };

	query = query.trim();
	if (query === '') {
		return defaultQuery;
	}

	const parts = query.split(/\s+(FROM|WHERE|ON)(?:\s+|$)/i);

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

			// Check each entity for matching fields
			for (const [entity, fields] of Object.entries(entityFields)) {
				const matchCount = fieldsList.filter((field) => fields.includes(field)).length;

				if (matchCount > 0) {
					// At least one field must match
					if (matchCount > maxMatchCount) {
						maxMatchCount = matchCount;
						bestMatch = entity as Entity;
						hasTie = false;
					} else if (matchCount === maxMatchCount) {
						hasTie = true;
					}
				}
			}

			// Only set entity if there's a clear winner (no tie)
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
	currentQuery.filters = filtersList as any;
}

function parseOnChain(onPart: string, currentQuery: ParsedQuery) {
	const chain = onPart.trim().toLowerCase();
	if (chains.includes(chain as Chain)) {
		currentQuery.chain = chain as Chain;
	}
}
