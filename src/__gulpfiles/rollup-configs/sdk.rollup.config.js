import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
	input: 'build/hdsdk/index.js',
	output: {
		file: 'dist/hdsdk/hdsdk.js',
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