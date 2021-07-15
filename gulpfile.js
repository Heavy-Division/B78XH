const gulp = require('gulp');
const through = require('through2');
const fs = require('fs');
const zip = require('gulp-zip');
const del = require('del');
const bump = require('gulp-update-version');

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
const directoriesToProcess = ['./**', '!*.*', '!*', '!./DOCS/**', '!./build/**', '!./release/**', '!./node_modules/**'];
/** Directories for release**/
const directoriesToRelease = ['./**', '!*', 'LICENSE', 'thirdparty_licenses.txt', './manifest.json', './layout.json', '!./DOCS/**', '!./build/**', '!./release/**', '!./node_modules/**'];

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

const _updateManifest = () => {
	console.log('Updating manifest.json');
	let originalManifest = fs.readFileSync('manifest.json').toString();
	let manifestJson = JSON.parse(originalManifest);
	manifestJson.total_package_size = String(packageSize).padStart(20, '0');
	fs.writeFile('manifest.json', JSON.stringify(manifestJson, null, 4), () => {
	});
	console.log('manifest.json updated.');
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
		console.log('Creating layout.json');
		fs.writeFile('layout.json', JSON.stringify(layoutOutput, null, 4), _updateManifest);
		console.log('layout.json created.');
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

exports.release = gulp.series(deleteReleaseCache, buildTask, copyFilesForReleaseToCache, releaseTask, deleteReleaseCache);
exports.default = buildTask;
exports.build = buildTask;
exports.bump = bumpTask;
exports.prebump = preBumpTask;