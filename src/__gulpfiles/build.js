const gulp = require('gulp');
const ts = require('gulp-typescript');
const merge = require('merge2');

const projects = {
	b78xh: ts.createProject('tsconfig.json')
};

const paths = [
	'**/*.ts',
	'!build/**',
	'!node_modules/**',
	'!tsconfigs/**',
	'!generators/**'
];

function buildB78XHTask() {
	const res = gulp.src(paths).pipe(projects.b78xh());

	return merge(
		res.dts.pipe(gulp.dest('build/types')),
		res.js.pipe(gulp.dest('build'))
	);
}

function copyB78XHTypes() {
	return gulp.src('build/**/*.d.ts')
	.pipe(gulp.dest('src/types'));
}

exports.buildB78XH = buildB78XHTask;
exports.copyB78XHTypes = copyB78XHTypes;