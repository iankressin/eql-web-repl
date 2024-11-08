import { describe, expect, it } from 'vitest';
import { allOperators, chains, chainsWithoutWildcard } from '$lib/helpers/parser';
import { autocomplete } from '$lib/helpers/autocomplete';

describe('autocomplete', () => {
	describe('empty query', () => {
		it('return suggestions for empty query', () => {
			expect(autocomplete('')).toEqual(['GET']);
		});
	});

	describe('GET keyword', () => {
		it('return suggestions for GET ', () =>
			expect(autocomplete('GET ')).toEqual([
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
			]));

		it('suggest account fields if query is mid-word and already contains account fields', () =>
			expect(autocomplete('GET balance, non')).toEqual(['nonce']));

		it('return field suggestions if the last character of the query is a comma and last keyword is GET', () =>
			expect(autocomplete('GET balance, ')).toEqual(['nonce', 'code', 'chain']));

		it('not return field suggestions if last word is field', () =>
			expect(autocomplete('GET nonce')).toEqual([]));

		it('suggest FROM if the last keyword is GET, the query already contains fields, and the last character in the query is a space', () =>
			expect(autocomplete('GET nonce, balance ')).toEqual(['FROM']));
	});

	describe('FROM keyword', () => {
		it('return suggestions for FROM', () =>
			expect(autocomplete('GET * FROM ')).toEqual(['account', 'block', 'tx', 'log']));

		it('return only one suggestion for FROM when fields are provided', () =>
			expect(autocomplete('GET nonce, balance FROM ')).toEqual(['account']));

		it('suggest WHERE if entity and entity_id are provided', () =>
			expect(autocomplete('GET nonce, balance FROM account vitalik.eth ')).toEqual([
				'WHERE',
				'ON'
			]));

		it('suggest account ids and .eth if entity is account', () =>
			expect(autocomplete('GET nonce, balance FROM account ')).toEqual(['.eth', '0x']));

		it('suggest WHERE if entity is log', () =>
			expect(autocomplete('GET nonce, balance FROM log ')).toEqual(['WHERE']));

		it('only suggest entities which contain the specified fields', () =>
			expect(autocomplete('GET nonce FROM ')).toEqual(['account', 'tx']));
	});

	describe('WHERE keyword', () => {
		it('return suggestions for WHERE', () =>
			expect(autocomplete('GET * FROM log WHERE ')).toEqual([
				'block',
				'event_signature',
				'topic0',
				'topic1',
				'topic2',
				'topic3',
				'address'
			]));

		it('suggest operators for fields', () => {
			expect(autocomplete('GET * FROM log WHERE topic0 ')).toEqual(['=']);
			expect(autocomplete('GET * FROM tx WHERE value ')).toEqual(allOperators);
		});

		it('continue suggesting fields after the first filter filled', () =>
			expect(autocomplete('GET * FROM log WHERE block = 123, ')).toEqual([
				'block',
				'event_signature',
				'topic0',
				'topic1',
				'topic2',
				'topic3',
				'address'
			]));

		it('suggest only fields containing a character sequence that matches the last filter field', () =>
			expect(autocomplete('GET * FROM tx WHERE bl')).toEqual(['block', 'blob_versioned_hashes']));

		it('suggest ON if last keyword is WHERE, query has filters and last character is space', () =>
			expect(autocomplete('GET * FROM log WHERE block = 123 ')).toEqual(['ON']));

		it('suggest operators if filter already has an operator', () =>
			expect(autocomplete('GET * FROM tx WHERE value =')).toEqual([]));

		it('not suggest filter fields if last characters are not comma plus space', () =>
			expect(autocomplete('GET * FROM tx WHERE value = 123')).toEqual([]));
	});

	describe('ON keyword', () => {
		it('return suggestions for ON', () =>
			expect(autocomplete('GET * FROM account vitalik.eth ON ')).toEqual(chains));

		it('only return chain suggestions if last word is not *', () =>
			expect(autocomplete('GET balance, nonce FROM account vitalik.eth ON *')).toEqual([]));

		it('only return chain suggestions if query ends with comma + space', () =>
			expect(autocomplete('GET * FROM account vitalik.eth ON eth, ')).toEqual(
				chainsWithoutWildcard.filter((chain) => chain !== 'eth')
			));

		// This is the same test as above, but it's duplicated for spec purposes
		it('not return the wildcard if there is already a chain selected', () =>
			expect(autocomplete('GET * FROM account vitalik.eth ON eth, ')).toEqual(
				chainsWithoutWildcard.filter((chain) => chain !== 'eth')
			));

		it('filters only for chains that start with the last word', () =>
			expect(autocomplete('GET * FROM account vitalik.eth ON eth, ar')).toEqual(['arb']));

		it('not suggest a chain if it is already selected', () =>
			expect(autocomplete('GET * FROM account vitalik.eth ON eth, arb, ')).toEqual(
				chainsWithoutWildcard.filter((chain) => chain !== 'arb' && chain !== 'eth')
			));
	});
});
