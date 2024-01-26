import { createSafeUrl, makeFetchConfig, withSearchParams } from './utils.ts';
import type {
	DeleteRequestOptions,
	GetRequestOptions,
	NonGetRequestOptions,
	RequestConfig,
	TypedResponse,
} from './types.ts';
import { HTTP_METHODS } from './constant.ts';

/**
 * Create a new instance of Vicks
 * @param options - Default options for all requests
 */
export function create(options: RequestConfig = {}) {
	const requestInterceptors: Array<(config: RequestConfig) => RequestConfig> = [];
	const responseInterceptors: Array<(response: Response) => Response> = [];

	const executeRequestInterceptors = (config: RequestConfig) => {
		return requestInterceptors.reduce((acc, interceptor) => interceptor(acc), config);
	};

	const executeResponseInterceptors = (response: Response) => {
		return responseInterceptors.reduce((acc, interceptor) => interceptor(acc), response);
	};

	function makeRequest(completeOptions: RequestConfig) {
		const config = executeRequestInterceptors(completeOptions);
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
		get: async <T extends any>(endpoint: string, requestConfig?: GetRequestOptions) => {
			const initialOptions = { ...options, ...requestConfig };
			const completeOptions = { ...initialOptions, endpoint, method: HTTP_METHODS.GET };
			const response = await makeRequest(completeOptions);
			return executeResponseInterceptors(response) as TypedResponse<T>;
		},
		/**
		 * Make a POST request
		 * @param endpoint - Endpoint to make the request to (can be a full URL)
		 * @param body - Body of the request
		 * @param requestConfig - Request configuration
		 */
		post: async <T extends any>(
			endpoint: string,
			body: Record<string, any>,
			requestConfig?: NonGetRequestOptions,
		) => {
			const initialOptions = { ...options, ...requestConfig, data: body };
			const completeOptions = { ...initialOptions, endpoint, method: HTTP_METHODS.POST };
			const response = await makeRequest(completeOptions);
			return executeResponseInterceptors(response) as TypedResponse<T>;
		},
		/**
		 * Make a PUT request
		 * @param endpoint - Endpoint to make the request to (can be a full URL)
		 * @param body - Body of the request
		 * @param requestConfig - Request configuration
		 */
		put: async <T extends any>(
			endpoint: string,
			body: Record<string, any>,
			requestConfig?: NonGetRequestOptions,
		) => {
			const initialOptions = { ...options, ...requestConfig, data: body };
			const completeOptions = { ...initialOptions, endpoint, method: HTTP_METHODS.PUT };
			const response = await makeRequest(completeOptions);
			return executeResponseInterceptors(response) as TypedResponse<T>;
		},
		/**
		 * Make a PATCH request
		 * @param endpoint - Endpoint to make the request to (can be a full URL)
		 * @param body - Body of the request
		 * @param requestConfig - Request configuration
		 */
		patch: async <T extends any>(
			endpoint: string,
			body: Record<string, any>,
			requestConfig?: NonGetRequestOptions,
		) => {
			const initialOptions = { ...options, ...requestConfig, data: body };
			const completeOptions = { ...initialOptions, endpoint, method: HTTP_METHODS.PATCH };
			const response = await makeRequest(completeOptions);
			return executeResponseInterceptors(response) as TypedResponse<T>;
		},
		/**
		 * Make a DELETE request
		 * @param endpoint - Endpoint to make the request to (can be a full URL)
		 * @param requestConfig - Request configuration
		 */
		delete: async <T extends any>(endpoint: string, requestConfig?: DeleteRequestOptions) => {
			const initialOptions = { ...options, ...requestConfig };
			const completeOptions = { ...initialOptions, endpoint, method: HTTP_METHODS.DELETE };
			const response = await makeRequest(completeOptions);
			return executeResponseInterceptors(response) as TypedResponse<T>;
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
		defaults: options,
	};
}
