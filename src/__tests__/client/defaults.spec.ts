import { it, jest, expect, describe, beforeAll } from 'bun:test';
import { create } from '../../vicks.ts';
import { faker } from '@faker-js/faker';
import { createSafeUrl } from '../../utils.ts';

function generateRandomConfig() {
	const defaultOptions = {
		baseUrl: faker.internet.url(),
		headers: { 'Content-Type': 'application/json' },
	};
	const endpoint = faker.word.sample();

	return { defaultOptions, endpoint };
}

describe('Client defaults', () => {
	beforeAll(() => {
		const response = new Response(JSON.stringify({ message: 'Success' }), { status: 200 });
		global.fetch = jest.fn(async () => Promise.resolve(response));
	});

	it('should apply default options to all requests', async () => {
		const { defaultOptions, endpoint } = generateRandomConfig();
		const client = create(defaultOptions);
		await client.get(endpoint);

		expect(global.fetch).toHaveBeenCalledWith(
			createSafeUrl(endpoint, defaultOptions.baseUrl),
			expect.objectContaining({ headers: defaultOptions.headers }),
		);
	});

	it('should overwrite default options with request-specific options', async () => {
		const { defaultOptions, endpoint } = generateRandomConfig();
		const client = create(defaultOptions);
		const requestHeaders = { Authorization: 'Bearer TOKEN' };

		await client.get(endpoint, { headers: requestHeaders });

		expect(global.fetch).toHaveBeenCalledWith(
			createSafeUrl(endpoint, defaultOptions.baseUrl),
			expect.objectContaining({ headers: requestHeaders }),
		);
	});

	it('should reflect runtime modifications to defaults in subsequent requests', async () => {
		const client = create({
			baseUrl: 'https://api.example.com',
			headers: { 'Content-Type': 'application/json' },
		});

		if (client.defaults.headers) client.defaults.headers.Authorization = 'Bearer TOKEN';
		await client.get('/new-endpoint');

		expect(global.fetch).toHaveBeenCalledWith(
			'https://api.example.com/new-endpoint',
			expect.objectContaining({
				headers: { 'Content-Type': 'application/json', Authorization: 'Bearer TOKEN' },
			}),
		);
	});

	it('should not share defaults between client instances', async () => {
		const client1 = create({
			baseUrl: 'https://api.instance1.com',
			headers: { Authorization: 'Bearer TOKEN1' },
		});

		const client2 = create({
			baseUrl: 'https://api.instance2.com',
			headers: { Authorization: 'Bearer TOKEN2' },
		});

		await client1.get('/endpoint');
		expect(global.fetch).toHaveBeenCalledWith(
			'https://api.instance1.com/endpoint',
			expect.objectContaining({ headers: { Authorization: 'Bearer TOKEN1' } }),
		);

		await client2.get('/endpoint');
		expect(global.fetch).toHaveBeenCalledWith(
			'https://api.instance2.com/endpoint',
			expect.objectContaining({ headers: { Authorization: 'Bearer TOKEN2' } }),
		);
	});

	it.todo(
		'should deeply merge default nested options with request-specific options',
		async () => {
			const client = create({
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer TOKEN1',
				},
			});

			global.fetch = jest.fn(async () =>
				Promise.resolve(
					new Response(JSON.stringify({ message: 'Success' }), { status: 200 }),
				),
			);

			await client.get('/endpoint', {
				headers: {
					Authorization: 'Bearer TOKEN2', // Overrides the default value
					'Accept-Language': 'en-US', // Adds a new header
				},
			});

			expect(global.fetch).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					headers: {
						'Content-Type': 'application/json', // Keeps default
						Authorization: 'Bearer TOKEN2', // Overwritten
						'Accept-Language': 'en-US', // Added
					},
				}),
			);
		},
	);
	it('should clear defaults when explicitly modified', async () => {
		const client = create({
			baseUrl: 'https://api.example.com',
			headers: { 'Content-Type': 'application/json', Authorization: 'Bearer TOKEN1' },
		});

		client.defaults.headers = {};

		await client.get('/endpoint');
		expect(global.fetch).toHaveBeenCalledWith(
			'https://api.example.com/endpoint',
			expect.objectContaining({ headers: {} }),
		);
	});

	it.todo('should not mutate shared defaults across clients', async () => {
		const sharedDefaults = {
			baseUrl: 'https://api.example.com',
			headers: { Authorization: 'Bearer TOKEN1' },
		};

		const client1 = create(sharedDefaults);
		const client2 = create(sharedDefaults);

		if (client1.defaults.headers) client1.defaults.headers.Authorization = 'Bearer TOKEN2';
		if (client2.defaults.headers)
			expect(client2.defaults.headers.Authorization).toBe('Bearer TOKEN1');
	});
});
