import { createSafeUrl } from '../../utils';
import { describe, it, expect } from 'bun:test';

describe('createSafeUrl', () => {
	describe('when endpoint is a valid URL', () => {
		it('should return the endpoint even if baseUrl is provided', () => {
			const endpoint = 'https://another-valid-url.com';
			const baseUrl = 'https://example.com';
			expect(createSafeUrl(endpoint, baseUrl)).toBe(endpoint);
		});
	});

	// Case: Endpoint is not a valid URL
	describe('when endpoint is not a valid URL', () => {
		it('should return the endpoint as-is if baseUrl is not provided', () => {
			const endpoint = 'relative/path';
			expect(createSafeUrl(endpoint)).toBe(endpoint);
		});

		it('should normalize and construct a URL if baseUrl is provided', () => {
			const endpoint = '/api/resource';
			const baseUrl = 'https://example.com/';
			expect(createSafeUrl(endpoint, baseUrl)).toBe('https://example.com/api/resource');
		});

		it('should remove multiple leading slashes from the endpoint', () => {
			const endpoint = '///api/resource';
			const baseUrl = 'https://example.com/';
			expect(createSafeUrl(endpoint, baseUrl)).toBe('https://example.com/api/resource');
		});

		it('should remove multiple trailing slash from baseUrl', () => {
			const endpoint = 'data';
			const baseUrl = 'https://example.com///////';
			expect(createSafeUrl(endpoint, baseUrl)).toBe('https://example.com/data');
		});
	});

	describe('invalid baseUrl handling', () => {
		it('should throw an error for an invalid baseUrl', () => {
			const endpoint = 'resource';
			const baseUrl = 'invalid-url';
			expect(() => createSafeUrl(endpoint, baseUrl)).toThrow('Invalid base URL');
		});
	});
});
