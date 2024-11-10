import { describe, it, expect } from 'vitest';
import { parseQuery } from '$lib/helpers/parser';

describe('parseQuery - success', () => {
	it('parse full query', () => {
		expect(parseQuery('GET hash, value FROM tx WHERE value > 1000000 ON eth')).toEqual({
			fields: ['hash', 'value'],
			entity: 'tx',
			filters: [{ field: 'value', operator: '>', value: '1000000' }],
			chains: ['eth'],
			lastKeyword: 'ON',
			dump: null
		});
	});

	it('parse query with filters', () => {
		expect(parseQuery('GET hash, value FROM tx WHERE value > 1000000')).toEqual({
			fields: ['hash', 'value'],
			entity: 'tx',
			filters: [{ field: 'value', operator: '>', value: '1000000' }],
			chains: null,
			lastKeyword: 'WHERE',
			dump: null
		});
	});

	it('parse multiple filters', () => {
		expect(parseQuery('GET hash, value FROM tx WHERE value > 1000000, from = 0x123')).toEqual({
			fields: ['hash', 'value'],
			entity: 'tx',
			filters: [
				{ field: 'value', operator: '>', value: '1000000' },
				{ field: 'from', operator: '=', value: '0x123' }
			],
			chains: null,
			lastKeyword: 'WHERE',
			dump: null
		});
	});

	it('partially fill filters', () => {
		expect(parseQuery('GET hash, value FROM tx WHERE value')).toEqual({
			fields: ['hash', 'value'],
			entity: 'tx',
			filters: [{ field: 'value', operator: null, value: null }],
			chains: null,
			lastKeyword: 'WHERE',
			dump: null
		});
	});

	it('parse query with chain', () => {
		expect(parseQuery('GET hash, number FROM block')).toEqual({
			fields: ['hash', 'number'],
			entity: 'block',
			filters: null,
			chains: null,
			lastKeyword: 'FROM',
			dump: null
		});
	});

	it('parse query with fields', () => {
		expect(parseQuery('GET nonce, balance')).toEqual({
			fields: ['nonce', 'balance'],
			entity: 'account',
			filters: null,
			chains: null,
			lastKeyword: 'GET',
			dump: null
		});
	});

	it('return null for entity when field has collision between entities', () => {
		expect(parseQuery('GET nonce')).toEqual({
			fields: ['nonce'],
			entity: null,
			filters: null,
			chains: null,
			lastKeyword: 'GET',
			dump: null
		});
	});

	it('return entity when field is mid-word', () => {
		expect(parseQuery('GET balance, non')).toEqual({
			fields: ['balance', 'non'],
			entity: 'account',
			filters: null,
			chains: null,
			lastKeyword: 'GET',
			dump: null
		});
	});

	it('parse query with fields ending with a comma', () => {
		expect(parseQuery('GET nonce, balance,')).toEqual({
			fields: ['nonce', 'balance'],
			entity: 'account',
			filters: null,
			chains: null,
			lastKeyword: 'GET',
			dump: null
		});
	});

	it("return null to entity if fields doens't match any entity", () => {
		expect(parseQuery('GET nonce, topics')).toEqual({
			fields: ['nonce', 'topics'],
			entity: null,
			filters: null,
			chains: null,
			lastKeyword: 'GET',
			dump: null
		});
	});

	it('parse entity with wildcard', () => {
		expect(parseQuery('GET * FROM block 10:1000')).toEqual({
			fields: ['*'],
			entity: 'block',
			chains: null,
			filters: null,
			lastKeyword: 'FROM',
			dump: null
		});
	});

	it('parse ON keyword when no chain was specified', () => {
		expect(parseQuery('GET * FROM block 10:1000 ON')).toEqual({
			fields: ['*'],
			entity: 'block',
			chains: null,
			filters: null,
			lastKeyword: 'ON',
			dump: null
		});
	});

	it('parse query with multiple chains', () => {
		expect(parseQuery('GET hash, value FROM tx WHERE value > 1000000 ON eth, polygon')).toEqual({
			fields: ['hash', 'value'],
			entity: 'tx',
			filters: [{ field: 'value', operator: '>', value: '1000000' }],
			chains: ['eth', 'polygon'],
			lastKeyword: 'ON',
			dump: null
		});
	});

	it('parse event_signature correctly', () =>
		expect(
			parseQuery('GET * FROM log WHERE event_signature = Transfer(address,address,uint)')
		).toEqual({
			fields: ['*'],
			entity: 'log',
			filters: [
				{ field: 'event_signature', operator: '=', value: 'Transfer(address,address,uint)' }
			],
			chains: null,
			lastKeyword: 'WHERE',
			dump: null
		}));

	it('parse query with dump', () =>
		expect(parseQuery('GET * FROM account vitalik.eth ON eth >> vitalik.json')).toEqual({
			fields: ['*'],
			entity: 'account',
			chains: ['eth'],
			lastKeyword: '>>',
			filters: null,
			dump: 'vitalik.json'
		}));

	it('not return error when wildcard is used', () =>
		expect(parseQuery('GET * FROM account ', { validatePartial: true })).toEqual({
			chains: null,
			dump: null,
			entity: 'account',
			fields: ['*'],
			filters: null,
			lastKeyword: 'FROM'
		}));

	it('not return error when entity is mid-word and validatePartial is true', () =>
		expect(parseQuery('GET nonce, balance FROM acc', { validatePartial: true })).toEqual({
			chains: null,
			dump: null,
			entity: 'acc',
			fields: ['nonce', 'balance'],
			filters: null,
			lastKeyword: 'FROM'
		}));

	it('validate full query not ending with space', () =>
		expect(parseQuery('GET * FROM block 10:1000 ON eth', { validatePartial: true })).toEqual({
			fields: ['*'],
			entity: 'block',
			chains: ['eth'],
			lastKeyword: 'ON',
			filters: null,
			dump: null
		}));
});

describe('parseQuery - errors', () => {
	it('error when WHERE fields are invalid', () =>
		expect(
			parseQuery('GET hash, from, to FROM tx WHERE valuex > 1000000, from = 0x123 ', {
				validatePartial: true
			})
		).toEqual({
			position: { start: 33, end: 39 },
			message: 'Invalid filter "valuex" for entity "tx"'
		}));

	it('error when field is invalid', () =>
		expect(parseQuery('GET asdf FROM account ', { validatePartial: true })).toEqual({
			position: { start: 4, end: 8 },
			message: 'Invalid field "asdf" for entity "account"'
		}));

	it('error when entity is invalid', () =>
		expect(parseQuery('GET * FROM asdf ', { validatePartial: true })).toEqual({
			position: { start: 11, end: 15 },
			message: 'Invalid entity "asdf"'
		}));

	it('error when query does not start with GET', () =>
		expect(parseQuery('some_other_word ', { validatePartial: true })).toEqual({
			position: { start: 0, end: 16 },
			message: 'Query must start with GET'
		}));

	it('error when chain is invalid', () =>
		expect(parseQuery('GET * FROM block ON invalid_chain', { validatePartial: true })).toEqual({
			position: { start: 20, end: 33 },
			message: 'Invalid chain "invalid_chain"'
		}));

	it('error when filter operator is invalid', () =>
		expect(parseQuery('GET * FROM tx WHERE value a ', { validatePartial: true })).toEqual({
			position: { start: 20, end: 27 },
			message: 'Invalid filter "value a" for entity "tx"'
		}));
});
