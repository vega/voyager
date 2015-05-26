'use strict';

var gulp = require('gulp');
var karma = require('karma').server;

function runTests (singleRun, done) {
  karma.start({
    configFile: __dirname + '/../karma.conf.js',
    singleRun: singleRun
  }, function() { done(); });
}

gulp.task('test', ['partials'], function (done) {
  runTests(true /* singleRun */, done);
});

gulp.task('test:auto', ['partials'], function (done) {
  runTests(false /* singleRun */, done);
});
