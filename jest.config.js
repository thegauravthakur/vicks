/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
	testEnvironment: 'node',
	transform: {
		'^.+.tsx?$': ['ts-jest', {}],
	},
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
