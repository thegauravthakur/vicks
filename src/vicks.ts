import { createSafeUrl, makeFetchConfig, withSearchParams } from './utils.ts';
import type { ClientOptions, RequestConfig, RequestOptions, TypedResponse } from './types.ts';
import { HTTP_METHODS } from './constant.ts';

type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

/**
 * Create a new instance of Vicks
 * @param options - Default options for all requests
 */
export function create(options: ClientOptions = {}) {
	const requestInterceptors: Array<RequestInterceptor> = [];
	const responseInterceptors: Array<ResponseInterceptor> = [];

	const executeRequestInterceptors = async (config: RequestConfig) => {
		for (const interceptor of requestInterceptors) {
			config = await interceptor(config);
		}
		return config;
	};

	const executeResponseInterceptors = async (response: Response) => {
		let result = response;
		for (const interceptor of responseInterceptors) {
			const clonedResponse = result.clone();
			result = await interceptor(clonedResponse);
		}
		return result;
	};

	async function makeRequest(completeOptions: RequestConfig): Promise<Response> {
		const config = await executeRequestInterceptors(completeOptions);
		const url = createSafeUrl(config?.endpoint, config?.baseUrl);
		const urlWithParams = withSearchParams(url, config?.params);
		return fetch(urlWithParams, makeFetchConfig(config));
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
		) => {
			const initialOptions = { ...options, ...requestConfig };
			const completeOptions = { ...initialOptions, endpoint, method: HTTP_METHODS.GET };
			const response = await makeRequest(completeOptions);
			return (await executeResponseInterceptors(response)) as TypedResponse<T>;
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
		) => {
			const initialOptions = { ...options, body, ...requestConfig };
			const completeOptions = { ...initialOptions, endpoint, method: HTTP_METHODS.POST };
			const response = await makeRequest(completeOptions);
			return (await executeResponseInterceptors(response)) as TypedResponse<T>;
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
		) => {
			const initialOptions = { ...options, body, ...requestConfig };
			const completeOptions = { ...initialOptions, endpoint, method: HTTP_METHODS.PUT };
			const response = await makeRequest(completeOptions);
			return (await executeResponseInterceptors(response)) as TypedResponse<T>;
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
		) => {
			const initialOptions = { ...options, body, ...requestConfig };
			const completeOptions = { ...initialOptions, endpoint, method: HTTP_METHODS.PATCH };
			const response = await makeRequest(completeOptions);
			return (await executeResponseInterceptors(response)) as TypedResponse<T>;
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
			return (await executeResponseInterceptors(response)) as TypedResponse<T>;
		},
		interceptors: {
			request: {
				use: (
					callback: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>,
				) => {
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
				use: (callback: (response: Response) => Response | Promise<Response>) => {
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
		defaults: options,
	};
}
