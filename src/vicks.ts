import { createSafeUrl, deepMerge, makeFetchConfig, withSearchParams } from './utils.ts';
import type { ClientOptions, RequestConfig, RequestOptions, FetchResponse } from './types.ts';
import { type AllowedMethods, HTTP_METHODS } from './constant.ts';

type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

/**
 * Create a new instance of Vicks
 * @param options - Default options for all requests
 */
export function create(options: ClientOptions = {}) {
	const requestInterceptors: Array<RequestInterceptor> = [];
	const responseInterceptors: Array<ResponseInterceptor> = [];

	const executeRequestInterceptors = async (config: RequestConfig): Promise<RequestConfig> => {
		try {
			const baseConfig = deepMerge({}, config);
			return await requestInterceptors.reduce(async (prevConfigPromise, interceptor) => {
				try {
					const prevConfig = await prevConfigPromise;
					const interceptorResult = await interceptor(prevConfig);

					if (!interceptorResult || typeof interceptorResult !== 'object') {
						console.error('Interceptor must return a valid config object');
						console.error('Ignoring interceptor result');
						return prevConfig;
					}

					// Deep merge the interceptor results with the previous config
					return deepMerge(prevConfig, interceptorResult);
				} catch (error) {
					console.error('Request interceptor failed:', error);
					console.error('Ignoring interceptor result');
					return prevConfigPromise;
				}
			}, Promise.resolve(baseConfig));
		} catch (error) {
			console.error('Failed to execute request interceptors:', error);
			console.error('Ignoring request interceptors');
			return config;
		}
	};

	const executeResponseInterceptors = async <T>(response: Response) => {
		let result = response;
		for (const interceptor of responseInterceptors) {
			const clonedResponse = result.clone();
			result = await interceptor(clonedResponse);
		}
		return result as FetchResponse<T>;
	};

	async function makeRequest(completeOptions: RequestConfig): Promise<Response> {
		const config = await executeRequestInterceptors(completeOptions);
		const url = createSafeUrl(config?.endpoint, config?.baseUrl);
		const urlWithParams = withSearchParams(url, config?.params);
		return fetch(urlWithParams, makeFetchConfig(config));
	}

	function makeCombinedOptions(
		endpoint: string,
		method: AllowedMethods,
		config: RequestOptions,
	): RequestConfig {
		const initialOptions = deepMerge(options, config);
		return { ...initialOptions, endpoint, method };
	}

	return {
		/**
		 * Make a GET request
		 * @param endpoint - Endpoint to make the request to (can be a full URL)
		 * @param requestConfig - Request configuration
		 */
		get: async <T extends any>(
			endpoint: string,
			requestConfig?: Omit<RequestOptions, 'body'>,
		): Promise<FetchResponse<T>> => {
			const options = makeCombinedOptions(endpoint, HTTP_METHODS.GET, requestConfig ?? {});
			const response = await makeRequest(options);
			return executeResponseInterceptors<T>(response);
		},
		/**
		 * Make a POST request
		 * @param endpoint - Endpoint to make the request to (can be a full URL)
		 * @param body - Body of the request
		 * @param requestConfig - Request configuration
		 */
		post: async <T extends any>(
			endpoint: string,
			body?: RequestConfig['body'],
			requestConfig?: RequestOptions,
		): Promise<FetchResponse<T>> => {
			const configWithBody = { body, ...requestConfig };
			const options = makeCombinedOptions(endpoint, HTTP_METHODS.POST, configWithBody);
			const response = await makeRequest(options);
			return executeResponseInterceptors<T>(response);
		},
		/**
		 * Make a PUT request
		 * @param endpoint - Endpoint to make the request to (can be a full URL)
		 * @param body - Body of the request
		 * @param requestConfig - Request configuration
		 */
		put: async <T extends any>(
			endpoint: string,
			body?: RequestConfig['body'],
			requestConfig?: RequestOptions,
		): Promise<FetchResponse<T>> => {
			const configWithBody = { body, ...requestConfig };
			const options = makeCombinedOptions(endpoint, HTTP_METHODS.PUT, configWithBody);
			const response = await makeRequest(options);
			return executeResponseInterceptors<T>(response);
		},
		/**
		 * Make a PATCH request
		 * @param endpoint - Endpoint to make the request to (can be a full URL)
		 * @param body - Body of the request
		 * @param requestConfig - Request configuration
		 */
		patch: async <T extends any>(
			endpoint: string,
			body?: RequestConfig['body'],
			requestConfig?: RequestOptions,
		): Promise<FetchResponse<T>> => {
			const configWithBody = { body, ...requestConfig };
			const options = makeCombinedOptions(endpoint, HTTP_METHODS.PATCH, configWithBody);
			const response = await makeRequest(options);
			return executeResponseInterceptors<T>(response);
		},
		/**
		 * Make a DELETE request
		 * @param endpoint - Endpoint to make the request to (can be a full URL)
		 * @param requestConfig - Request configuration
		 */
		delete: async <T extends any>(endpoint: string, requestConfig?: RequestOptions) => {
			const initialOptions = { ...options, ...requestConfig };
			const completeOptions = { ...initialOptions, endpoint, method: HTTP_METHODS.DELETE };
			const response = await makeRequest(completeOptions);
			return executeResponseInterceptors<T>(response);
		},
		interceptors: {
			request: {
				use: (interceptor: RequestInterceptor) => {
					requestInterceptors.push(interceptor);
					// Return a function to remove the interceptor
					return () => {
						const index = requestInterceptors.indexOf(interceptor);
						if (index !== -1) requestInterceptors.splice(index, 1);
					};
				},
				// Clear all request interceptors
				clear: () => {
					requestInterceptors.splice(0, requestInterceptors.length);
				},
			},
			response: {
				use: (interceptor: ResponseInterceptor) => {
					responseInterceptors.push(interceptor);
					// Return a function to remove the interceptor
					return () => {
						let index = responseInterceptors.indexOf(interceptor);
						if (index !== -1) responseInterceptors.splice(index, 1);
					};
				},
				// Clear all response interceptors
				clear: () => {
					responseInterceptors.splice(0, responseInterceptors.length);
				},
			},
			// Clear all interceptors
			clear: () => {
				requestInterceptors.splice(0, requestInterceptors.length);
				responseInterceptors.splice(0, responseInterceptors.length);
			},
		},
		defaults: options,
	};
}
