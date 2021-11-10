const ts = require('gulp-typescript');
const gulp = require('gulp');
const merge = require('merge2');
const rollup = require('gulp-rollup');
const rollupStream = require('rollup-stream');
const rename = require('gulp-rename');
const nodeResolve = require('rollup-plugin-node-resolve');
const source = require('vinyl-source-stream');

const project = ts.createProject('tsconfigtest.json');

const paths = [
	'hdlogger/**/*.ts',
	'node_modules/socket.io-client/**/*.ts',
	'!build/**',
	//'!node_modules/**',
	'!tsconfigs/**',
	'!generators/**'
];

function loggerBuild() {
	const res = gulp.src(paths).pipe(project());

	return merge(
		res.dts.pipe(gulp.dest('build/types')),
		res.js.pipe(gulp.dest('./hdlogger'))
	);
}

function loggerRollup22() {
	return gulp.src('hdlogger/**/*.ts').pipe(
		rollup({
			input: './hdlogger/index.js',
			output: {
				format: 'umd',
				sourcemap: true,
				extend: true,
				name: 'window'
			}
		})
	).pipe(rename('hdlogger.js'))
	.pipe(gulp.dest('dist'));
}

function loggerRollup() {
	return rollupStream({
		input: 'hdlogger/index.js',
		format: 'umd',
		//sourcemap: true,
		extend: true,
		name: 'window',
		output: {
			format: 'umd',
			//sourcemap: true,
			extend: true,
			name: 'window'
		}
	})
	.pipe(source('hdlogger.js'))
	.pipe(gulp.dest('dist'));
}


exports.loggerRollup = loggerRollup;
exports.loggerBuild = loggerBuild;