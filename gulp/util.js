'use strict';

var gulp = require('gulp'),
  fs = require('fs'),
  argv = require('yargs').argv,
  shell = require('gulp-shell');

var paths = gulp.paths;

function find(f, path) {
  path = path || '';

  if (fs.existsSync(path + 'src/app/' + f)) {
    return 'src/app/' + f + '/';
  }
  if (fs.existsSync(path + 'src/components/' + f)) {
    return 'src/components/' + f + '/';
  }
  if (fs.existsSync(path + 'gulp/' + f + '.js')) {
    return 'gulp/';
  }
  return '';
}

function fixjsstyle(){

  var opt = '--nojsdoc --max_line_length=120 --disable=200,201,202,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,230,231,232,233,250,251,252',
    fixcmd = 'fixjsstyle '+ opt + ' <%= file.path %>',
    gjslintcmd = 'gjslintcmd' + opt + ' <%= file.path %>';

  if(argv.f){
    var path = find(argv.f);
    console.log(path +'.*');
    gulp.src(path +'.*')
      .pipe(shell(fixcmd));
  } else {
    gulp.src([
        'src/**/*.js',
        'gulp/*.js',
        'e2e/**/*.js',
        'gulpfile.js',
        'karma.conf.js',
        'protractor.conf.js'
      ])
      .pipe(shell([fixcmd, gjslintcmd]));
  }

}

function copy() {
  var path = find(argv.f, paths.vlui);
  gulp.src(paths.vlui + path + argv.f+'.*')
    .pipe(gulp.dest(path));
}

gulp.task('c', copy);
gulp.task('copy', copy);

gulp.task('f', fixjsstyle);
gulp.task('fix', fixjsstyle);
gulp.task('fixjsstyle', fixjsstyle);