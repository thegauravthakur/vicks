import { create } from './vicks.ts';

export const vicks = { ...create(), create };

const client = vicks.create({
	baseUrl: 'https://api.vicks.dev',
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
});
