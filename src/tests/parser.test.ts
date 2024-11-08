import { describe, it, expect } from 'vitest';
import { parseQuery } from '$lib/helpers/parser';

describe('parseQuery', () => {
	it('parse full query', () => {
		expect(parseQuery('GET hash, value FROM tx WHERE value > 1000000 ON eth')).toEqual({
			fields: ['hash', 'value'],
			entity: 'tx',
			filters: [{ field: 'value', operator: '>', value: '1000000' }],
			chains: ['eth'],
			lastKeyword: 'ON'
		});
	});

	it('parse query with filters', () => {
		expect(parseQuery('GET hash, value FROM tx WHERE value > 1000000')).toEqual({
			fields: ['hash', 'value'],
			entity: 'tx',
			filters: [{ field: 'value', operator: '>', value: '1000000' }],
			chains: null,
			lastKeyword: 'WHERE'
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
			lastKeyword: 'WHERE'
		});
	});

	it('partially fill filters', () => {
		expect(parseQuery('GET hash, value FROM tx WHERE value')).toEqual({
			fields: ['hash', 'value'],
			entity: 'tx',
			filters: [{ field: 'value', operator: null, value: null }],
			chains: null,
			lastKeyword: 'WHERE'
		});
	});

	it('parse query with chain', () => {
		expect(parseQuery('GET hash, number FROM block')).toEqual({
			fields: ['hash', 'number'],
			entity: 'block',
			filters: null,
			chains: null,
			lastKeyword: 'FROM'
		});
	});

	it('parse query with fields', () => {
		expect(parseQuery('GET nonce, balance')).toEqual({
			fields: ['nonce', 'balance'],
			entity: 'account',
			filters: null,
			chains: null,
			lastKeyword: 'GET'
		});
	});

	it('return null for entity when field has collision between entities', () => {
		expect(parseQuery('GET nonce')).toEqual({
			fields: ['nonce'],
			entity: null,
			filters: null,
			chains: null,
			lastKeyword: 'GET'
		});
	});

	it('return entity when field is mid-word', () => {
		expect(parseQuery('GET balance, non')).toEqual({
			fields: ['balance', 'non'],
			entity: 'account',
			filters: null,
			chains: null,
			lastKeyword: 'GET'
		});
	});

	it('parse query with fields ending with a comma', () => {
		expect(parseQuery('GET nonce, balance,')).toEqual({
			fields: ['nonce', 'balance'],
			entity: 'account',
			filters: null,
			chains: null,
			lastKeyword: 'GET'
		});
	});

	it("return null to entity if fields doens't match any entity", () => {
		expect(parseQuery('GET nonce, topics')).toEqual({
			fields: ['nonce', 'topics'],
			entity: null,
			filters: null,
			chains: null,
			lastKeyword: 'GET'
		});
	});

	it('parse entity with wildcard', () => {
		expect(parseQuery('GET * FROM block 10:1000')).toEqual({
			fields: ['*'],
			entity: 'block',
			chains: null,
			filters: null,
			lastKeyword: 'FROM'
		});
	});

	it('parse ON keyword when no chain was specified', () => {
		expect(parseQuery('GET * FROM block 10:1000 ON')).toEqual({
			fields: ['*'],
			entity: 'block',
			chains: null,
			filters: null,
			lastKeyword: 'ON'
		});
	});

	it('parse query with multiple chains', () => {
		expect(parseQuery('GET hash, value FROM tx WHERE value > 1000000 ON eth, polygon')).toEqual({
			fields: ['hash', 'value'],
			entity: 'tx',
			filters: [{ field: 'value', operator: '>', value: '1000000' }],
			chains: ['eth', 'polygon'],
			lastKeyword: 'ON'
		});
	});
});
