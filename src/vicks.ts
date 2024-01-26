import { createSafeUrl, makeFetchConfig, makeRequest, withSearchParams } from './utils.ts';
import type { RequestConfig, TypedResponse } from './types.ts';
import { HTTP_METHODS } from './constant.ts';

export function create(options?: RequestConfig) {
	const requestInterceptors: Array<(config: RequestConfig) => RequestConfig> = [];
	const responseInterceptors: Array<(response: Response) => Response> = [];

	const executeRequestInterceptors = (config: RequestConfig) => {
		return requestInterceptors.reduce((acc, interceptor) => interceptor(acc), config);
	};

	const executeResponseInterceptors = (response: Response) => {
		return responseInterceptors.reduce((acc, interceptor) => interceptor(acc), response);
	};

	return {
		get: async <T extends any>(endpoint: string) => {
			const completeOptions = { ...options, endpoint, method: HTTP_METHODS.GET };
			const config = executeRequestInterceptors(completeOptions as RequestConfig);
			const url = createSafeUrl(config?.endpoint, config?.baseUrl);
			const urlWithParams = withSearchParams(url, config?.params);
			const response = await makeRequest(urlWithParams, makeFetchConfig(config));
			return executeResponseInterceptors(response) as TypedResponse<T>;
		},
		post: async (endpoint: string, body: Record<string, any>) => {
			const completeOptions = { ...options, endpoint, method: HTTP_METHODS.POST, data: body };
			const config = executeRequestInterceptors(completeOptions as RequestConfig);
			const url = createSafeUrl(config?.endpoint, config?.baseUrl);
			const urlWithParams = withSearchParams(url, config?.params);
			const response = await makeRequest(urlWithParams, makeFetchConfig(config));
			return executeResponseInterceptors(response);
		},
		put: async (endpoint: string, body: Record<string, any>) => {
			const completeOptions = { ...options, endpoint, method: HTTP_METHODS.PUT, data: body };
			const config = executeRequestInterceptors(completeOptions as RequestConfig);
			const url = createSafeUrl(config?.endpoint, config?.baseUrl);
			const urlWithParams = withSearchParams(url, config?.params);
			const response = await makeRequest(urlWithParams, makeFetchConfig(config));
			return executeResponseInterceptors(response);
		},
		delete: async (endpoint: string) => {
			const completeOptions = { ...options, endpoint, method: HTTP_METHODS.DELETE };
			const config = executeRequestInterceptors(completeOptions as RequestConfig);
			const url = createSafeUrl(config?.endpoint, config?.baseUrl);
			const urlWithParams = withSearchParams(url, config?.params);
			const response = await makeRequest(urlWithParams, makeFetchConfig(config));
			return executeResponseInterceptors(response);
		},
		interceptors: {
			request: {
				use: (callback: (config: RequestConfig) => RequestConfig) => {
					requestInterceptors.push(callback);
					return () => {
						const index = requestInterceptors.indexOf(callback);
						if (index !== -1) requestInterceptors.splice(index, 1);
					};
				},
				clear: () => {
					requestInterceptors.splice(0, requestInterceptors.length);
				},
			},
			response: {
				use: (callback: (response: Response) => Response) => {
					responseInterceptors.push(callback);
					return () => {
						let index = responseInterceptors.indexOf(callback);
						if (index !== -1) responseInterceptors.splice(index, 1);
					};
				},
				clear: () => {
					responseInterceptors.splice(0, responseInterceptors.length);
				},
			},
			clear: () => {
				requestInterceptors.splice(0, requestInterceptors.length);
				responseInterceptors.splice(0, responseInterceptors.length);
			},
		},
	};
}
