const gulp = require('gulp');

function copySocketIO() {
	return gulp.src('./__external/socket.io.js')
	.pipe(gulp.dest('build/__external'));
}

exports.copySocketIO = copySocketIO;