const exec = require('child_process').exec;
const path = require('path');

const rollupPath = path.join(__dirname, '..', 'node_modules', '.bin', 'rollup');

const configs = {
	logger: ''.concat(' --config', ' ', path.join(__dirname, 'rollup-configs', 'logger.rollup.config.js')),
	fmc: ''.concat(' --config', ' ', path.join(__dirname, 'rollup-configs', 'fmc.rollup.config.js')),
	sdk: ''.concat(' --config', ' ', path.join(__dirname, 'rollup-configs', 'sdk.rollup.config.js'))
};

function rollupHDLogger(callback) {
	exec(rollupPath + configs.logger, function (err, stdout, stderr) {
			console.log(stdout);
			console.log(stderr);
			callback();
		}
	);
}

function rollupHDFMC(callback) {
	exec(rollupPath + configs.fmc, function (err, stdout, stderr) {
			console.log(stdout);
			console.log(stderr);
			callback();
		}
	);
}

function rollupHDSDK(callback) {
	exec(rollupPath + configs.sdk, function (err, stdout, stderr) {
			console.log(stdout);
			console.log(stderr);
			callback();
		}
	);
}

exports.rollupHDSDK = rollupHDSDK;
exports.rollupHDLogger = rollupHDLogger;
exports.rollupHDFMC = rollupHDFMC;