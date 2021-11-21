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

exports.TerminalColors = TerminalColors;
exports.log = log;
