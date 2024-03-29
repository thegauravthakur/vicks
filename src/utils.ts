import type { RequestConfig } from './types.ts';

export function withSearchParams(
	url: string,
	params?: Record<string, any> | URLSearchParams | string,
) {
	if (!params) return url;
	if (params instanceof URLSearchParams) return `${url}?${params.toString()}`;
	if (typeof params === 'string') {
		if (params.startsWith('?')) return `${url}${params}`;
		return `${url}?${params}`;
	}
	const searchParams = new URLSearchParams(params);
	return `${url}?${searchParams.toString()}`;
}

export function makeFetchConfig(config?: RequestConfig): RequestInit {
	const fetchConfig: RequestInit = {};
	fetchConfig.method = config?.method ?? 'GET';
	fetchConfig.headers = config?.headers ?? {};
	const { body, header } = transformBody(config?.body);
	fetchConfig.body = body;
	fetchConfig.headers = { ...fetchConfig.headers, ...header, ...config?.headers };
	return fetchConfig;
}

export function createSafeUrl(endpoint?: string, baseUrl?: string) {
	if (!endpoint) throw new Error('Endpoint is required');
	try {
		new URL(endpoint);
		return endpoint;
	} catch (_) {
		if (!baseUrl) return endpoint;
		if (endpoint.startsWith('/') && baseUrl.endsWith('/'))
			return baseUrl + endpoint.substring(1);
		if (endpoint.startsWith('/') || baseUrl.endsWith('/')) return baseUrl + endpoint;
		return `${baseUrl}/${endpoint}`;
	}
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
		// Content-Type should be automatically set to 'multipart/form-data' by the browser
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
