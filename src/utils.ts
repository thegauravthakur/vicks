import type { RequestConfig } from './types.ts';

export function withSearchParams(
	url: string,
	params?: Record<string, string | number | boolean | null> | URLSearchParams | string,
) {
	if (!params) return url;

	// Check if the URL already has query parameters
	const hasQueryParams = url.includes('?');
	const separator = hasQueryParams ? '&' : '?';

	if (params instanceof URLSearchParams) {
		return `${url}${separator}${params.toString()}`;
	}

	if (typeof params === 'string') {
		const cleanParams = params.startsWith('?') ? params.slice(1) : params;
		return `${url}${separator}${cleanParams}`;
	}

	// Convert Record values to strings before creating URLSearchParams
	const convertedParams: Record<string, string> = {};
	for (const [key, value] of Object.entries(params)) {
		if (value === null) continue;
		convertedParams[key] = String(value);
	}

	const searchParams = new URLSearchParams(convertedParams);
	return `${url}${separator}${searchParams.toString()}`;
}

export function makeFetchConfig(config: RequestConfig): RequestInit {
	const fetchConfig: RequestInit = {};
	fetchConfig.method = config.method;
	fetchConfig.headers = config?.headers ?? {};
	const { body, header } = transformBody(config?.body);
	fetchConfig.body = body;
	fetchConfig.headers = { ...header, ...fetchConfig.headers };
	return fetchConfig;
}

export function createSafeUrl(endpoint: string, baseUrl?: string): string {
	if (!endpoint) throw new Error('Endpoint is required');

	// Return endpoint if it's a valid URL
	if (isValidUrl(endpoint)) return endpoint;

	// Return endpoint if no baseUrl provided
	if (!baseUrl) return endpoint;

	const normalizedBase = normalizeBaseUrl(baseUrl);
	const normalizedEndpoint = normalizeEndpoint(endpoint);

	return `${normalizedBase}/${normalizedEndpoint}`;
}

function isValidUrl(url: string): boolean {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

function normalizeBaseUrl(url: string): string {
	try {
		const urlObject = new URL(url);
		// Remove trailing slash
		return urlObject.toString().replace(/\/+$/, '');
	} catch {
		throw new Error('Invalid base URL');
	}
}

function normalizeEndpoint(endpoint: string): string {
	// Remove the leading slash
	return endpoint.replace(/^\/+/, '');
}

function transformBody(body?: RequestConfig['body']): {
	header: RequestInit['headers'];
	body: RequestInit['body'];
} {
	if (!body) return { body: undefined, header: {} };
	if (typeof body === 'string') {
		return { body, header: { 'Content-Type': 'text/plain' } };
	} else if (body instanceof Blob) {
		return { body, header: { 'Content-Type': 'application/octet-stream' } };
	} else if (body instanceof FormData) {
		// The browser should automatically set Content-Type to 'multipart/form-data'
		return { body, header: {} };
	} else if (body instanceof URLSearchParams) {
		const header = { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' };
		return { body, header };
	} else if (typeof body === 'object') {
		const header = { 'Content-Type': 'application/json' };
		return { body: JSON.stringify(body), header };
	} else {
		return { body, header: {} };
	}
}
