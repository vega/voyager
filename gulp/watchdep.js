'use strict';

// watch for dependencies

var gulp = require('gulp');

var paths = gulp.paths,
  vendorPath = paths.src+'/vendor/';

gulp.task('watchdep', ['watchvl', 'watchvlui', 'watchvr']);
gulp.task('copydep', ['copyvl', 'copyvlui', 'copyvr']);

// Vegalite
var vlPath = '../vegalite/';
gulp.task('watchvl', function(){
  gulp.watch([vlPath + 'vegalite.js'], ['copyvl']);
});

gulp.task('copyvl', function(){
  gulp.src(vlPath+'vegalite.js')
    .pipe(gulp.dest(vendorPath))
});

// Vegalite-ui

var vluiPath = '../vegalite-ui/',
  uiWatchList = [
    ["app/styles/vlui-common.scss", "src/assets"]
  ];


gulp.task('watchvlui', function(){
  gulp.watch(uiWatchList.map(function(f){ return vluiPath+f[0];}), ['copyvlui']);
});

gulp.task('copyvlui', function(){
  uiWatchList.forEach(function(f){
    // console.log('copying', vluiPath+f[0], f[1]);
    gulp.src(vluiPath+f[0])
      .pipe(gulp.dest(f[1]));
  });
});

// Visrec

var vrPath = '../visrec/',
  vrWatchList = ["visrec.js"];

gulp.task('watchvr', function(){
  gulp.watch(vrWatchList.map(function(f){return vrPath+f;}), ['copyvr']);
});

gulp.task('copyvr', function(){
  vrWatchList.forEach(function(f){
    gulp.src(vrPath+f)
    .pipe(gulp.dest(vendorPath));
  });
});