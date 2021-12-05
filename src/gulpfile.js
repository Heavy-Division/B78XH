const buildTasks = require('./__gulpfiles/build');
const rollupTasks = require('./__gulpfiles/rollup');
const cleanTasks = require('./__gulpfiles/clean');
const distributeTasks = require('./__gulpfiles/distribute');
const copyTasks = require('./__gulpfiles/copy');
const {monitorSource} = require('./__gulpfiles/monitor');
const test = require('./__gulpfiles/test');
/**
 * Global
 */
const x = '';
const merge = require('deepmerge');
const path = require('path');
/**
 * Gulp
 */
const gulp = require('gulp');
const {series, parallel} = require('gulp');
/**
 * TypeScript
 */
const ts = require('gulp-typescript');

/**
 * Gulp modules
 */
const rollup = require('gulp-rollup');
const bump = require('gulp-bump');
const zip = require('gulp-zip');
const {exec} = require('child_process');

function testTask(callback) {
	callback();
}

exports.buildB78XH = series(buildTasks.buildB78XH, rollupTasks.rollupHDSDK, rollupTasks.rollupHDLogger, rollupTasks.rollupHDFMC, cleanTasks.cleanBuild);

exports.clean = cleanTasks.clean;
exports.cleanAll = cleanTasks.cleanAll;
exports.cleanBuild = cleanTasks.cleanBuild;

exports.distribute = distributeTasks.distribute;

exports.buildAndDistribute = series(exports.buildB78XH, distributeTasks.distribute);

exports.monitor = monitorSource;
exports.default = exports.buildAndDistribute;
/**
 * Only stream exiting test
 * @type {testTask}
 */
exports.test = testTask;

/**
 * Task for testing resolving modules outside package root
 */


exports.loggerTest = series(test.loggerBuild, test.loggerRollup);