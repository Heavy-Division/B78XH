import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
	input: 'build/hdfmc/index.js',
	output: {
		file: 'dist/hdfmc/hdfmc.js',
		format: 'umd',
		extend: true,
		name: 'window'
	},
	plugins: [
		resolve({
			browser: true
		}),
		commonjs()
	]
};