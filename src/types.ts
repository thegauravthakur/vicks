import { HTTP_METHODS } from './constant.ts';

export interface RequestConfig {
	baseUrl?: string;
	headers?: Record<string, string>;
	params?: Record<string, any> | URLSearchParams | string;
	data?: Record<string, string>;
	method?: HttpMethod;
	endpoint?: string;
}

export type HttpMethod = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS];

export interface TypedResponse<T extends any> extends Response {
	json(): Promise<T>;
}
