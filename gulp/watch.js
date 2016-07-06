'use strict';

var gulp = require('gulp');

var paths = gulp.paths;

gulp.task('watch', ['inject'], function () {
  gulp.watch([
    paths.src + '/*.html',
    paths.src + '/{app,components}/**/*.scss',
    paths.src + '/{app,components}/**/*.js',
    paths.src + '/assets/*.scss',
    'bower_components/vega-lite/vega-lite.js',
    'bower_components/datalib/datalib.js',
    'bower_components/vega-lite-ui/vlui.js',
    'bower_components/vega-lite-ui/vlui.scss',
    'bower.json'
  ], ['inject', 'jshint']);
});
