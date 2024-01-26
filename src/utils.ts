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
	if (config?.data) {
		fetchConfig.body = JSON.stringify(config.data);
		fetchConfig.headers['Content-Type'] = 'application/json';
	}
	fetchConfig.headers = { ...fetchConfig.headers, ...config?.headers };
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
