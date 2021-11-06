const gulp = require('gulp');
const rollup = require('gulp-rollup');
const rename = require('gulp-rename');

function rollupHDLogger() {
	return gulp.src('build/hdlogger/**/*.js')
	.pipe(rollup({
			input: 'build/hdlogger/index.js',
			output: {
				format: 'umd',
				sourcemap: true,
				extend: true,
				name: 'window'
			}
		})
	)
	.pipe(rename('hdlogger.js'))
	.pipe(gulp.dest('dist'));
}

function rollupHDFMC() {
	return gulp.src('build/hdfmc/**/*.js')
	.pipe(rollup({
			input: 'build/hdfmc/index.js',
			output: {
				format: 'umd',
				sourcemap: true,
				extend: true,
				name: 'window'
			},
			'allowRealFiles': true
		})
	)
	.pipe(rename('hdfmc.js'))
	.pipe(gulp.dest('dist'));
}

function rollupHDSDK() {
	return gulp.src('build/hdsdk/**/*.js')
	.pipe(rollup({
			input: 'build/hdsdk/index.js',
			output: {
				format: 'umd',
				sourcemap: true,
				extend: true,
				name: 'window'
			}
		})
	)
	.pipe(rename('hdsdk.js'))
	.pipe(gulp.dest('dist'));
}

exports.rollupHDSDK = rollupHDSDK;
exports.rollupHDLogger = rollupHDLogger;
exports.rollupHDFMC = rollupHDFMC;