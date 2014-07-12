'use strict';

var jshint = require('gulp-jshint');
var gulp = require('gulp');

gulp.task('lint', function() {
  return gulp.src(['**/*.js', '!node_modules/**'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('watch', function () {
  gulp.watch(['**/*.js', '!node_modules/**', '.jshintrc'], function(event) {
    console.log('File '+event.path+' was '+event.type+', running tasks...');
    gulp.run('lint');
  });
});

gulp.task('default', ['lint', 'watch']);
