import { describe, it, expect } from 'vitest';
import { parseQuery } from '$lib/helpers/parser';

describe('parseQuery', () => {
	it('should parse full query', () => {
		expect(parseQuery('GET hash, number FROM block WHERE number > 1000000 ON eth')).toEqual({
			fields: ['hash', 'number'],
			entity: 'block',
			filters: ['number > 1000000'],
			chain: 'eth',
			lastKeyword: 'ON'
		});
	});

	it('should parse query with filters', () => {
		expect(parseQuery('GET hash, number FROM block WHERE number > 1000000')).toEqual({
			fields: ['hash', 'number'],
			entity: 'block',
			filters: ['number > 1000000'],
			chain: null,
			lastKeyword: 'WHERE'
		});
	});

	it('should parse multiple filters', () => {
		expect(parseQuery('GET hash, number FROM block WHERE number > 1000000, hash = 0x123')).toEqual({
			fields: ['hash', 'number'],
			entity: 'block',
			filters: ['number > 1000000', 'hash = 0x123'],
			chain: null,
			lastKeyword: 'WHERE'
		});
	});

	it('should parse query with chain', () => {
		expect(parseQuery('GET hash, number FROM block')).toEqual({
			fields: ['hash', 'number'],
			entity: 'block',
			filters: null,
			chain: null,
			lastKeyword: 'FROM'
		});
	});

	it('should parse query with fields', () => {
		expect(parseQuery('GET nonce, balance')).toEqual({
			fields: ['nonce', 'balance'],
			entity: 'account',
			filters: null,
			chain: null,
			lastKeyword: 'GET'
		});
	});

	it.only('should return null for entity when field has collision between entities', () => {
		expect(parseQuery('GET nonce')).toEqual({
			fields: ['nonce'],
			entity: null,
			filters: null,
			chain: null,
			lastKeyword: 'GET'
		});
	});

	it.only('should return entity when field is mid-word', () => {
		expect(parseQuery('GET balance, non')).toEqual({
			fields: ['balance', 'non'],
			entity: 'account',
			filters: null,
			chain: null,
			lastKeyword: 'GET'
		});
	});

	it('should parse query with fields ending with a comma', () => {
		expect(parseQuery('GET nonce, balance,')).toEqual({
			fields: ['nonce', 'balance'],
			entity: 'account',
			filters: null,
			chain: null,
			lastKeyword: 'GET'
		});
	});

	it("should return null to entity if fields doens't match any entity", () => {
		expect(parseQuery('GET nonce, topics')).toEqual({
			fields: ['nonce', 'topics'],
			entity: null,
			filters: null,
			chain: null,
			lastKeyword: 'GET'
		});
	});

	it('should parse entity with wildcard', () => {
		expect(parseQuery('GET * FROM block 10:1000')).toEqual({
			fields: ['*'],
			entity: 'block',
			chain: null,
			filters: null,
			lastKeyword: 'FROM'
		});
	});

	it('should parse ON keyword when no chain was specified', () => {
		expect(parseQuery('GET * FROM block 10:1000 ON')).toEqual({
			fields: ['*'],
			entity: 'block',
			chain: null,
			filters: null,
			lastKeyword: 'ON'
		});
	});
});
