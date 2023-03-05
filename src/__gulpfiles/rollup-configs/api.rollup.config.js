import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'build/hdapi/index.js',
    output: {
        file: 'dist/hdapi/hdapi.js',
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
