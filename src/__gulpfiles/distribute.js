const gulp = require('gulp');
const {parallel} = require('gulp');
const ts = require('gulp-typescript');
const merge = require('merge2');
const rename = require('gulp-rename');

const projects = {
	b78xh: ts.createProject('tsconfig.json')
};

const paths = {
	sdk: ['dist/hdsdk/hdsdk.js', '../html_ui/Heavy/libs'],
	logger: ['dist/hdlogger/hdlogger.js', '../html_ui/Heavy/libs'],
	fmc: ['dist/hdfmc/hdfmc.js', '../html_ui/Pages/VCockpit/Instruments/Airliners/B787_10/FMC']
};


function distributeFile(file) {
	return gulp.src(file[0])
	.pipe(gulp.dest(file[1]));
}

function distributeSDK() {
	return distributeFile(paths.sdk);
}

function distributeLogger() {
	return distributeFile(paths.logger);
}

function distributeFMC() {
	return distributeFile(paths.fmc);
}

exports.distribute = parallel(distributeSDK, distributeLogger, distributeFMC);
exports.distributeSDK = distributeSDK;
exports.distributeLogger = distributeLogger;
exports.distributeFMC = distributeFMC;