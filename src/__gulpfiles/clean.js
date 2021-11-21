const gulp = require('gulp');
const del = require('del');

function clean() {
	return del([
		'dist/**/*.js',
		'hdsdk/**/*.js',
		'hdfmc/**/*.js',
		'hdlogger/**/*.js'
	]);
}

function cleanAll() {
	return del([
		'dist',
		'build',
		'hdsdk/**/*.js',
		'hdfmc/**/*.js',
		'hdlogger/**/*.js'
	]);
}

function cleanBuild() {
	return del([
		'build'
	]);
}

exports.clean = clean;
exports.cleanAll = cleanAll;
exports.cleanBuild = cleanBuild;