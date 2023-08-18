import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
	input: 'build/hdlogger/index.js',
	output: {
		file: 'dist/hdlogger/hdlogger.js',
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