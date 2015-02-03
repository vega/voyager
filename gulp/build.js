'use strict';

var gulp = require('gulp');

var paths = gulp.paths;

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});


function partials(module) {
  return function () {
    return gulp.src([
      paths.src + '/{app,components}/**/*.html',
      paths.tmp + '/{app,components}/**/*.html'
    ])
      .pipe($.minifyHtml({
        empty: true,
        spare: true,
        quotes: true
      }))
      .pipe($.angularTemplatecache('templateCacheHtml-'+module+'.js', {
        module: module
      }))
      .pipe(gulp.dest(paths.tmp + '/partials/'));
  };
}

gulp.task('partials', ['partials-vlui', 'partials-fv']);
gulp.task('partials-vlui', partials('vleApp'));
gulp.task('partials-fv', partials('facetedviz'));

gulp.task('html', ['inject', 'partials'], function () {
  var partialsInjectFile = gulp.src([
      paths.tmp + '/partials/templateCacheHtml-facetedviz.js',
      paths.tmp + '/partials/templateCacheHtml-vleApp.js'
    ], { read: false });
  var partialsInjectOptions = {
    starttag: '<!-- inject:partials -->',
    ignorePath: paths.tmp + '/partials',
    addRootSlash: false
  };

  var htmlFilter = $.filter('*.html');
  var jsFilter = $.filter('**/*.js');
  var cssFilter = $.filter('**/*.css');
  var assets;

  return gulp.src(paths.tmp + '/serve/*.html')
    .pipe($.inject(partialsInjectFile, partialsInjectOptions))
    .pipe(assets = $.useref.assets())
    .pipe($.rev())
    .pipe(jsFilter)
    .pipe($.ngAnnotate())
    .pipe($.uglify({preserveComments: $.uglifySaveLicense}))
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    .pipe($.csso())
    .pipe(cssFilter.restore())
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.revReplace())
    .pipe(htmlFilter)
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe(htmlFilter.restore())
    .pipe(gulp.dest(paths.dist + '/'))
    .pipe($.size({ title: paths.dist + '/', showFiles: true }));
});

gulp.task('images', function () {
  return gulp.src(paths.src + '/assets/images/**/*')
    .pipe(gulp.dest(paths.dist + '/assets/images/'));
});

gulp.task('data', function () {
  return gulp.src(paths.src + '/data/*')
    .pipe(gulp.dest(paths.dist + '/data/'));
});


gulp.task('fonts', function () {
  return gulp.src($.mainBowerFiles())
    .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe($.flatten())
    .pipe(gulp.dest(paths.dist + '/fonts/'));
});

gulp.task('misc', function () {
  return gulp.src(paths.src + '/**/*.ico')
    .pipe(gulp.dest(paths.dist + '/'));
});

gulp.task('zeroclipboard', function () {
  return gulp.src('bower_components/zeroclipboard/dist/ZeroClipboard.swf')
    .pipe(gulp.dest(paths.dist + '/bower_components/zeroclipboard/dist/'));
});


gulp.task('clean', function (done) {
  $.del([paths.dist + '/', paths.tmp + '/'], done);
});

gulp.task('build', ['copydep', 'html', 'images', 'data', 'fonts', 'misc', 'watchdep', 'zeroclipboard']);
