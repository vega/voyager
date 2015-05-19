'use strict';

var gulp = require('gulp');

var paths = gulp.paths;

gulp.task('watch', ['inject'], function () {
  gulp.watch([
    paths.src + '/*.html',
    paths.src + '/{app,components}/**/*.scss',
    paths.src + '/{app,components}/**/*.js',
    paths.src + '/{app,components}/**/*.html',
    paths.src + '/assets/*.scss',
    paths.src + '/bower_components/vega-lite/vega-lite.js',
    paths.src + '/bower_components/datalib/datalib.js',
    paths.src + '/bower_components/viscompass/compass.js',
    paths.src + '/bower_components/vega-lite-ui/vlui.js',
    paths.src + '/bower_components/vega-lite-ui/vlui.scss',
    'bower.json'
  ], ['inject']);
});
