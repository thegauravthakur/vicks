import _dts from 'rollup-plugin-dts';
import _esbuild from 'rollup-plugin-esbuild';

const name = require('./package.json').main.replace(/\.js$/, '');

const esbuild = _esbuild.default ?? _esbuild;
const dts = _dts.default ?? _dts;

const bundle = config => ({
	...config,
	input: 'src/index.ts',
	external: id => !/^[./]/.test(id),
});

export default [
	bundle({
		plugins: [esbuild()],
		output: [
			{
				file: `${name}.js`,
				format: 'cjs',
				sourcemap: true,
			},
			{
				file: `${name}.mjs`,
				format: 'es',
				sourcemap: true,
			},
		],
	}),
	bundle({
		plugins: [dts()],
		output: {
			file: `${name}.d.ts`,
			format: 'es',
		},
	}),
];
