const {series, watch} = require('gulp');
const buildTasks = require('./build');
const rollupTasks = require('./rollup');
const cleanTasks = require('./clean');
const {log, TerminalColors} = require('./utils');
const distributeTasks = require('./distribute');

function monitorSource() {
	log('Monitoring build folder.\n', TerminalColors.blue);
	watch(['hdsdk/**/*.ts', 'hdfmc/**/*.ts', 'hdlogger/**/*.ts'], {ignoreInitial: false}, series(buildTasks.buildB78XH, rollupTasks.rollupHDSDK, rollupTasks.rollupHDLogger, rollupTasks.rollupHDFMC, cleanTasks.cleanBuild, distributeTasks.distribute)).on('change', function (path, stats) {
		log('Source files were changed. Starting build process...', TerminalColors.red);
	});
}

exports.monitorSource = monitorSource;