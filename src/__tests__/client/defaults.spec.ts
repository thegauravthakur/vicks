import { create } from '../../vicks.ts';
import { faker } from '@faker-js/faker';
import { createSafeUrl } from '../../utils.ts';
import type { ClientOptions } from '../../types.ts';

function generateRandomConfig() {
	const defaultOptions: ClientOptions = {
		baseUrl: faker.internet.url(),
		headers: { 'Content-Type': 'application/json' },
	};
	const endpoint = faker.word.sample();

	return { defaultOptions, endpoint };
}

describe('Client Default Configuration', () => {
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

		await client.post(endpoint);

		expect(global.fetch).toHaveBeenCalledWith(
			createSafeUrl(endpoint, defaultOptions.baseUrl),
			expect.objectContaining({ headers: defaultOptions.headers }),
		);
	});

	it('should overwrite default options with request-specific options', async () => {
		const { defaultOptions, endpoint } = generateRandomConfig();
		const client = create(defaultOptions);
		{
			const requestHeaders = { Authorization: 'Bearer TOKEN' };
			await client.get(endpoint, { headers: requestHeaders });
			const combinedHeaders = { ...defaultOptions.headers, ...requestHeaders };

			expect(global.fetch).toHaveBeenCalledWith(
				createSafeUrl(endpoint, defaultOptions.baseUrl),
				expect.objectContaining({ headers: combinedHeaders }),
			);
		}

		{
			const requestHeaders = { 'X-Custom-Header': 'Custom Value' };
			await client.post(endpoint, undefined, { headers: requestHeaders });
			const combinedHeaders = { ...defaultOptions.headers, ...requestHeaders };

			expect(global.fetch).toHaveBeenCalledWith(
				createSafeUrl(endpoint, defaultOptions.baseUrl),
				expect.objectContaining({ headers: combinedHeaders }),
			);
		}
	});

	it('should reflect runtime modifications to defaults in subsequent requests', async () => {
		const { defaultOptions, endpoint } = generateRandomConfig();
		const client = create(defaultOptions);

		{
			const token = faker.word.sample();
			if (client.defaults.headers) client.defaults.headers.Authorization = token;
			await client.get(endpoint);

			expect(global.fetch).toHaveBeenCalledWith(
				createSafeUrl(endpoint, defaultOptions.baseUrl),
				expect.objectContaining({
					headers: { 'Content-Type': 'application/json', Authorization: token },
				}),
			);
		}
		{
			const token = faker.word.sample();
			if (client.defaults.headers) client.defaults.headers.Authorization = token;
			const newEndpoint = faker.word.sample();
			await client.get(newEndpoint);

			expect(global.fetch).toHaveBeenCalledWith(
				createSafeUrl(newEndpoint, defaultOptions.baseUrl),
				expect.objectContaining({
					headers: { 'Content-Type': 'application/json', Authorization: token },
				}),
			);
		}
	});

	it('should not share defaults between client instances', async () => {
		{
			const { defaultOptions, endpoint } = generateRandomConfig();
			const client1 = create(defaultOptions);
			await client1.get(endpoint);

			expect(global.fetch).toHaveBeenCalledWith(
				createSafeUrl(endpoint, defaultOptions.baseUrl),
				expect.objectContaining({ headers: defaultOptions.headers }),
			);
		}
		{
			const { defaultOptions, endpoint } = generateRandomConfig();
			const client2 = create(defaultOptions);
			await client2.get(endpoint);

			expect(global.fetch).toHaveBeenCalledWith(
				createSafeUrl(endpoint, defaultOptions.baseUrl),
				expect.objectContaining({ headers: defaultOptions.headers }),
			);
		}
	});

	it('should deeply merge default nested options with request-specific options', async () => {
		const baseUrl = faker.internet.url();
		const initialHeaders = {
			[faker.word.sample()]: faker.word.sample(),
			[faker.word.sample()]: faker.word.sample(),
		};
		const client = create({ baseUrl, headers: initialHeaders });
		const requestHeaders = {
			[faker.word.sample()]: faker.word.sample(),
			[faker.word.sample()]: faker.word.sample(),
		};
		const endpoint = faker.word.sample();
		await client.get(endpoint, { headers: requestHeaders });

		const combinedHeaders = { ...initialHeaders, ...requestHeaders };

		expect(global.fetch).toHaveBeenCalledWith(
			createSafeUrl(endpoint, baseUrl),
			expect.objectContaining({ headers: combinedHeaders }),
		);
	});

	it('should clear defaults when explicitly modified', async () => {
		const { defaultOptions } = generateRandomConfig();
		const client = create(defaultOptions);

		client.defaults.headers = {};
		await client.get('/endpoint');

		expect(global.fetch).toHaveBeenCalledWith(
			createSafeUrl('/endpoint', defaultOptions.baseUrl),
			expect.objectContaining({ headers: {} }),
		);
	});

	it('should not mutate shared defaults across clients', async () => {
		const { defaultOptions } = generateRandomConfig();
		const client1 = create(defaultOptions);
		const client2 = create(defaultOptions);

		client1.defaults.headers = {};
		await client1.get('/endpoint');

		expect(global.fetch).toHaveBeenCalledWith(
			createSafeUrl('/endpoint', defaultOptions.baseUrl),
			expect.objectContaining({ headers: {} }),
		);

		await client2.get('/endpoint');

		expect(global.fetch).toHaveBeenCalledWith(
			createSafeUrl('/endpoint', defaultOptions.baseUrl),
			expect.not.objectContaining({ headers: {} }),
		);
	});
});
