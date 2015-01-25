'use strict';

// watch for dependencies

var gulp = require('gulp');

var paths = gulp.paths,
  vendorPath = paths.src+'/vendor/';

gulp.task('watchdep', ['watchvl']);
gulp.task('copydep', ['copyvl']);

// Vegalite
var vlPath = '../vegalite/';
gulp.task('watchvl', function(){
  gulp.watch([vlPath + 'vegalite.js'], ['copyvl']);
});

gulp.task('copyvl', function(){
  gulp.src(vlPath+'vegalite.js')
    .pipe(gulp.dest(vendorPath));
});
