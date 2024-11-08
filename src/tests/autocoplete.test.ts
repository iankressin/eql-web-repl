import { describe, expect, it } from 'vitest';
import { chains, chainsWithoutWildcard } from '$lib/helpers/parser';
import { autocomplete } from '$lib/helpers/autocomplete';

describe('autocomplete', () => {
	describe('empty query', () => {
		it('should return suggestions for empty query', () => {
			expect(autocomplete('')).toEqual(['GET']);
		});
	});

	describe('GET keyword', () => {
		it('should return suggestions for GET ', () => {
			expect(autocomplete('GET ')).toEqual([
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
			]);
		});

		it('suggest account fields if query is mid-word and already contains account fields', () => {
			expect(autocomplete('GET balance, non')).toEqual(['nonce']);
		});

		it('should return field suggestions if the last character of the query is a comma and last keyword is GET', () => {
			expect(autocomplete('GET balance, ')).toEqual(['nonce', 'code', 'chain']);
		});

		it('should not return field suggestions if last word is field', () => {
			expect(autocomplete('GET nonce')).toEqual([]);
		});

		it('should suggest FROM if the last keyword is GET, the query already contains fields, and the last character in the query is a space', () => {
			expect(autocomplete('GET nonce, balance ')).toEqual(['FROM']);
		});
	});

	describe('FROM keyword', () => {
		it('should return suggestions for FROM', () => {
			expect(autocomplete('GET * FROM ')).toEqual(['account', 'block', 'tx', 'log']);
		});

		it('should return only one suggestion for FROM when fields are provided', () => {
			expect(autocomplete('GET nonce, balance FROM ')).toEqual(['account']);
		});

		it('should suggest WHERE if entity and entity_id are provided', () => {
			expect(autocomplete('GET nonce, balance FROM account vitalik.eth ')).toEqual(['WHERE', 'ON']);
		});

		it('should not suggest WHERE if only FROM and entity are provided + space', () => {
			expect(autocomplete('GET nonce, balance FROM account ')).toEqual([]);
		});

		it('suggest account ids and .eth if entity is account', () => {
			expect(autocomplete('GET nonce, balance FROM account')).toEqual(['.eth', '0x']);
		});

		it('suggest WHERE if entity is log', () => {
			expect(autocomplete('GET nonce, balance FROM log')).toEqual(['WHERE']);
		});
	});

	describe('WHERE keyword', () => {
		it('should return suggestions for WHERE', () => {
			expect(autocomplete('GET * FROM account vitalik.eth WHERE ')).toEqual([
				'nonce',
				'balance',
				'code',
				'chain'
			]);
		});
	});

	describe('ON keyword', () => {
		it('should return suggestions for ON', () => {
			expect(autocomplete('GET * FROM account ON ')).toEqual(chains);
		});

		it('should only return chain suggestions if last word is not *', () => {
			expect(autocomplete('GET balance, nonce FROM account ON *')).toEqual([]);
		});

		it('should only return chain suggestions if query ends with comma + space', () => {
			expect(autocomplete('GET * FROM account ON eth, ')).toEqual(
				chainsWithoutWildcard.filter((chain) => chain !== 'eth')
			);
		});

		// This is the same test as above, but it's duplicated for specs purposes
		it('not return the wildcard if there is already a chain selected', () => {
			expect(autocomplete('GET * FROM account ON eth, ')).toEqual(
				chainsWithoutWildcard.filter((chain) => chain !== 'eth')
			);
		});

		it('filters only for chains that start with the last word', () => {
			expect(autocomplete('GET * FROM account ON eth, ar')).toEqual(['arb']);
		});

		it('should not suggest a chain if it is already selected', () => {
			expect(autocomplete('GET * FROM account ON eth, arb, ')).toEqual(
				chainsWithoutWildcard.filter((chain) => chain !== 'arb' && chain !== 'eth')
			);
		});
	});
});
