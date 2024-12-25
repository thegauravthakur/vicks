import { HTTP_METHODS } from './constant.ts';

export interface ClientOptions {
	baseUrl?: string;
	headers?: Record<string, string>;
}

export interface RequestConfig extends Omit<RequestInit, 'body'> {
	baseUrl?: string;
	endpoint: string;
	method: HttpMethod;
	headers?: Record<string, string>;
	body?: RequestInit['body'] | Record<string, any>; // modified body
	params?: Record<string, any> | URLSearchParams | string;
}

export type RequestOptions = Omit<RequestConfig, 'endpoint' | 'baseUrl' | 'method'>;

export type HttpMethod = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS];

export interface FetchResponse<T extends any> extends Response {
	json(): Promise<T>;
}
