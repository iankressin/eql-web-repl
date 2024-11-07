import { describe, expect, it } from 'vitest';
import { chains } from '$lib/helpers/parser';
import { autocomplete } from '$lib/helpers/autocomplete';

describe('autocomplete', () => {
	it('should return suggestions for empty query', () => {
		expect(autocomplete('')).toEqual(['GET']);
	});

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

	it('should return suggestions for FROM', () => {
		expect(autocomplete('GET * FROM ')).toEqual(['account', 'block', 'tx', 'log']);
	});

	it('should return only one suggestion for FROM when fields are provided', () => {
		expect(autocomplete('GET nonce, balance FROM ')).toEqual(['account']);
	});

	it('should return suggestions for WHERE', () => {
		expect(autocomplete('GET * FROM account vitalik.eth WHERE ')).toEqual([
			'nonce',
			'balance',
			'code',
			'chain'
		]);
	});

	it('suggest account fields if query is mid-word and already contains account fields', () => {
		expect(autocomplete('GET balance, non')).toEqual(['nonce']);
	});

	it('should suggest WHERE if entity and entity_id are provided', () => {
		expect(autocomplete('GET nonce, balance FROM account vitalik.eth ')).toEqual(['WHERE', 'ON']);
	});

	it('should not suggest WHERE if only FROM and entity are provided + space', () => {
		expect(autocomplete('GET nonce, balance FROM account ')).toEqual([]);
	});

	it('should not suggest WHERE if only FROM and entity are provided', () => {
		expect(autocomplete('GET nonce, balance FROM account')).toEqual([]);
	});

	it('should return suggestions for ON', () => {
		expect(autocomplete('GET * FROM account ON ')).toEqual(['*', ...chains]);
	});

	it('should return field suggestions if the last character of the query is a comma and last keyword is GET', () => {
		expect(autocomplete('GET nonce, ')).toEqual(['nonce', 'balance', 'code', 'chain']);
	});

	it('should suggest FROM if the last keyword is GET, the query already contains fields, and the last character in the query is a space', () => {
		expect(autocomplete('GET nonce, balance ')).toEqual(['FROM']);
	});
});
