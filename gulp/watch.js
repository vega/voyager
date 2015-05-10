'use strict';

var gulp = require('gulp');

var paths = gulp.paths;

gulp.task('watch', ['inject'], function () {
  gulp.watch([
    paths.src + '/*.html',
    paths.src + '/{app,components}/**/*.scss',
    paths.src + '/{app,components}/**/*.js',
    paths.src + '/assets/*.scss',
    paths.src + '/bower_components/vegalite/vegalite.js',
    paths.src + '/bower_components/datalib/datalib.js',
    paths.src + '/bower_components/vegalite-ui/vlui.js',
    'bower.json'
  ], ['inject']);
});
