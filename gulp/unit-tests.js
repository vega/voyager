'use strict';

var gulp = require('gulp');

var $ = require('gulp-load-plugins')();

var wiredep = require('wiredep');

var paths = gulp.paths;

function runTests (singleRun, done) {
  var bowerDeps = wiredep({
    directory: 'bower_components',
    exclude: ['bootstrap-sass-official'],
    dependencies: true,
    devDependencies: true
  });

  var testFiles = bowerDeps.js.concat([
    paths.src + '/{app,components}/**/*.js',
    paths.src + '/vendor/*.js',
    paths.tmp + '/partials/templateCacheHtml.js'
  ]);

  gulp.src(testFiles)
    .pipe($.karma({
      configFile: 'karma.conf.js',
      action: (singleRun)? 'run': 'watch'
    }))
    .on('error', function (err) {
      // Make sure failed tests cause gulp to exit non-zero
      throw err;
    });
  done();
}

gulp.task('test', ['partials'], function (done) {
  runTests(true /* singleRun */, done);
});
gulp.task('test:auto', ['partials'], function (done) {
  runTests(false /* singleRun */, done);
});
