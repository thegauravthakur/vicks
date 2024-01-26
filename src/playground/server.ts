import { createClient } from '../index.ts';

const client = createClient({
	baseUrl: 'https://jsonplaceholder.typicode.com',
});

client.interceptors.request.use(request => {
	if (request.endpoint === '/comments') {
		request.params = { postId: '1' };
	}
	return request;
});

client.interceptors.response.use(response => {
	if (!response.ok) {
		throw new Error(response.statusText);
	}
	return response;
});

interface Post {
	postId: number;
	id: number;
	name: string;
	email: string;
	body: string;
}
client
	.get<Post[]>('/comments')
	.then(response => {
		console.log('here');
		return response;
	})
	.then(response => response.json())
	.then(data => console.log(data.at(0)?.body));
