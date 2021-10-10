const gulp = require('gulp');
const through = require('through2');
const fs = require('fs');
const zip = require('gulp-zip');
const del = require('del');
const bump = require('gulp-update-version');
const pipeline = require('readable-stream').pipeline;
const mergeStream = require('merge-stream');
const rollup = require('gulp-rollup');
const ts = require('gulp-typescript');


/** Default mathjs configuration does not support BigNumbers */
//const math = require('mathjs');
/** MathJS configuration for BigNumbers **/
const {create, all} = require('mathjs');
const math = create(all);
math.config({
	number: 'BigNumber',
	precision: 256
});

/** Constants definitions **/
const datePlusConstant = 116444736000000000;
const dividedDatePlusConstant = datePlusConstant / 1000;
/** Global layout output variable **/
const layoutOutput = {content: []};
var packageSize = 0;

/** Directories configuration **/
/** Directories for layout and manifest **/
const directoriesToProcess = ['./**', '!*.*', '!*', '!./DOCS/**', '!./build/**', '!./release/**', '!./node_modules/**', '!./src/**'];
/** Directories for release**/
const directoriesToRelease = ['./**', '!*', 'LICENSE', 'thirdparty_licenses.txt', './manifest.json', './layout.json', '!./DOCS/**', '!./build/**', '!./release/**', '!./node_modules/**', '!./src/**'];

/** Internal Transformers */
const _prepareLayoutFile = (data) => {
	let newPath = data.relativePath.replace(/\\/g, '\/');
	packageSize += data.fileSize;
	layoutOutput.content.push({
		'path': newPath,
		'size': data.fileSize,
		'date': data.fileDate
	});
};

const TerminalColors = {
	default: '\x1b[0m',
	black: '\x1b[30m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
	white: '\x1b[37m'
};

function log(message, color = TerminalColors.default) {
	console.log(color + message + TerminalColors.default);
}

const _updateManifest = () => {
	log('Updating manifest.json.', TerminalColors.yellow);
	let originalManifest = fs.readFileSync('manifest.json').toString();
	let manifestJson = JSON.parse(originalManifest);
	manifestJson.total_package_size = String(packageSize).padStart(20, '0');
	fs.writeFile('manifest.json', JSON.stringify(manifestJson, null, 4), () => {
	});
	log('manifest.json updated.', TerminalColors.green);
};

const copyPackageVersion = () => {
	let originalManifest = fs.readFileSync('manifest.json').toString();
	let manifestJson = JSON.parse(originalManifest);
	let version = {};
	version.package_version = manifestJson.package_version;
	let versionChunks = manifestJson.package_version.replace(/\./g, '-').split('-');
	let versionChunks2 = versionChunks;
	if (versionChunks.length < 4) {
		versionChunks.push('STA');
		versionChunks2.push('BAK');
	}
	versionChunks[0] = String(versionChunks[0]).padStart(3, '0');

	const versionString = versionChunks.join('-');
	const version2String = versionChunks.join('-');
	version.fms_man_version = 'HD-P' + versionString;
	version.fms_bak_version = 'HD-C' + version2String;

	fs.writeFile('./html_ui/b78xh/b78xh.json', JSON.stringify(version, null, 4), () => {
		console.log('version copied successfully.');
	});
};

function defaultTask(callback) {
	callback();
}

function buildTask() {
	/**
	 * This is important for resetting the array with watch (monitorSDKSource and so on)
	 * @type {number}
	 */
	layoutOutput.content.length = 0;

	console.log(layoutOutput.content.length);
	return gulp.src(directoriesToProcess, {nodir: true, cwd: './'})
	.pipe(
		through.obj(function (file, _, callback) {
			const data = {
				relativePath: file.relative,
				fileSize: file.stat.size,
				fileDate: math.chain(file.stat.mtimeMs).multiply(10000.0).add(datePlusConstant).done()
			};
			this.push(data);
			callback();
		})
	).on('data', function (data) {
		_prepareLayoutFile(data);
	}).on('end', function () {
		log('Creating layout.json', TerminalColors.yellow);
		fs.writeFile('layout.json', JSON.stringify(layoutOutput, null, 4), _updateManifest);
		log('layout.json created.', TerminalColors.green);
	});
}

function releaseTask(callback) {
	return gulp.src('release/cache/**')
	.pipe(zip('release.zip'))
	.pipe(gulp.dest('release'))
	.on('finish', function () {
		console.log('Release done.');
		callback();
	});
}

function copyFilesForReleaseToCache(callback) {
	return gulp.src(directoriesToRelease)
	.pipe(gulp.dest('release/cache/B78XH/'))
	.on('finish', function () {
		console.log('Files for release copied.');
		callback();
	});
}

function deleteReleaseCache(callback) {
	del('release/cache');
	console.log('Release cache deleted.');
	callback();
}

function bumpTask(callback) {
	return gulp.src('./manifest.json')
	.pipe(bump())
	.pipe(gulp.dest('./')).on('end', function () {
		copyPackageVersion();
	});
}

function preBumpTask(callback) {
	return gulp.src('./manifest.json')
	.pipe(bump({type: 'prerelease'}))
	.pipe(gulp.dest('./')).on('finish', function () {
		console.log('Release done.');
		callback();
	}).on('end', function () {
		copyPackageVersion();
	});
}

const HDSDKProject = ts.createProject('./src/hdsdk/tsconfig.json');

function buildHDSDKTask() {
	let res = gulp.src('src/hdsdk/**/*.ts').pipe(HDSDKProject());
	return pipeline(
		res.dts,
		gulp.dest('src/hdsdk/types'),
		res.js,
		gulp.dest('build/cache/hdsdk')
	);
}

const HDLoggerProject = ts.createProject('./src/hdlogger/tsconfig.json');

function buildHDLoggerTask() {
	let res = gulp.src('src/hdlogger/**/*.ts').pipe(HDLoggerProject());
	return pipeline(
		res.dts,
		gulp.dest('src/hdlogger/types'),
		res.js,
		gulp.dest('build/cache/hdlogger')
	);
}

function rollupHDSDKTask() {
	return pipeline(
		gulp.src('build/cache/hdsdk/**/*.js'),
		rollup({
			input: 'build/cache/hdsdk/hdsdk.js',
			output: {
				format: 'umd',
				sourcemap: false,
				extend: true,
				name: 'window'
			}
		}),
		gulp.dest('build/cache/rollups')
	);
}

function rollupHDLoggerTask() {
	return pipeline(
		gulp.src('build/cache/hdlogger/**/*.js'),
		rollup({
			input: 'build/cache/hdlogger/hdlogger.js',
			output: {
				format: 'umd',
				sourcemap: false,
				extend: true,
				name: 'window'
			}
		}),
		gulp.dest('build/cache/rollups')
	);
}

function copyHDSDKTask() {
	return pipeline(
		gulp.src('build/cache/rollups/hdsdk.js'),
		gulp.dest('html_ui/Heavy/libs')
	);
}

function copyHDLoggerTask() {
	return pipeline(
		gulp.src('build/cache/rollups/hdlogger.js'),
		gulp.dest('html_ui/Heavy/libs')
	);
}

function cleanBuildCache(callback) {
	del('build/**/*');
	callback();
}

function cleanBuildCacheSDK(callback) {
	del('build/hdsdk/**/*');
	callback();
}

function cleanBuildCacheLogger(callback) {
	del('build/hdlogger/**/*');
	callback();
}

function monitorHDSDKSourceDirectory() {
	log('Monitoring build folder.\n', TerminalColors.blue);
	gulp.watch(['src/hdsdk/**/*', '!src/hdsdk/tsconfig.json'], {ignoreInitial: true}, gulp.series(cleanBuildCache, buildHDSDKTask, rollupHDSDKTask, copyHDSDKTask, cleanBuildCache, buildTask)).on('change', function (path, stats) {
		log('Source files were changed. Starting build process...', TerminalColors.red);
	});
}

function monitorHDLoggerSourceDirectory() {
	log('Monitoring build folder.\n', TerminalColors.blue);
	gulp.watch(['src/hdlogger/**/*', '!src/hdlogger/tsconfig.json'], {ignoreInitial: true}, gulp.series(cleanBuildCacheLogger, buildHDLoggerTask, rollupHDLoggerTask, copyHDLoggerTask, cleanBuildCacheLogger, buildTask)).on('change', function (path, stats) {
		log('Source files were changed. Starting build process...', TerminalColors.red);
	});
}

exports.release = gulp.series(deleteReleaseCache, buildTask, copyFilesForReleaseToCache, releaseTask, deleteReleaseCache);
exports.default = buildTask;
exports.build = buildTask;
exports.bump = bumpTask;
exports.prebump = preBumpTask;
exports.buildSDK = gulp.series(cleanBuildCache, buildHDSDKTask, rollupHDSDKTask, copyHDSDKTask, cleanBuildCacheSDK, buildTask);
exports.buildLogger = gulp.series(cleanBuildCacheLogger, buildHDLoggerTask, rollupHDLoggerTask, copyHDLoggerTask, cleanBuildCacheLogger, buildTask);

/**
 * Monitoring
 */
exports.monitorSDKSource = monitorHDSDKSourceDirectory;
exports.monitorHDLoggerSource = monitorHDLoggerSourceDirectory;
