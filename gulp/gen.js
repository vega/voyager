'use strict';

var gulp = require('gulp'),
  argv = require('yargs').argv,
  fs = require('fs'),
  request = require('request'),
  pack = require('../package.json');

var APP_NAME = pack.name;
var COMP_PATH = 'src/components/';

var GIST_URL = 'https://gist.githubusercontent.com/kanitw/15256571933310366d00/raw/';

var DIRECTIVE_URL = GIST_URL + 'directive.js';
var DIRECTIVE_TEST_URL = GIST_URL + 'directive.spec.js';
var SERVICE_URL = GIST_URL + 'service.js';
var SERVICE_TEST_URL = GIST_URL + 'service.spec.js';

function createFile(path){
  fs.closeSync(fs.openSync(path, 'w'));
}

function fetchUrl(url, callback){
  //console.log(url);
  request.get(url, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      callback(body);
    }
  })
  .on('error', function(err){
    console.log(err);
  });
}

function replace(str, template){
  for(var key in template){
    str = str.replace(new RegExp(key, 'g'), template[key]);
  }
  return str;
}

function genDirective(dir){
  var ldir = dir.toLowerCase(),
    dirpath = COMP_PATH + ldir +'/';

  if(! fs.existsSync(dirpath)){
    fs.mkdirSync(dirpath);
  }
  // create template, scss
  createFile(dirpath+ ldir +'.scss');
  fs.writeFileSync(dirpath + ldir + '.html' , '<div></div>');

  // create directive file
  fetchUrl(DIRECTIVE_URL, function(str) {
    fs.writeFileSync(dirpath + ldir + '.js' , replace(str, {
      __appname__: APP_NAME,
      __directive__: dir
    }));
  });

  // create spec file
  fetchUrl(DIRECTIVE_TEST_URL, function(str) {
    fs.writeFileSync(dirpath + ldir + '.spec.js' , replace(str, {
      __appname__: APP_NAME,
      __directive__: dir
    }));
  });

}

function genService(srv){
  var lsrv = srv.toLowerCase(),
    dirpath = COMP_PATH + lsrv +'/';

  // create directive file
  fetchUrl(SERVICE_URL, function(str) {
    fs.writeFileSync(dirpath + lsrv + '.js' , replace(str, {
      __appname__: APP_NAME,
      __service__: srv
    }));
  });

  // create spec file
  fetchUrl(SERVICE_TEST_URL, function(str) {
    fs.writeFileSync(dirpath + lsrv + '.spec.js' , replace(str, {
      __appname__: APP_NAME,
      __service__: srv
    }));
  });
}

gulp.task('gen', function() {
  if (argv.d || argv.directive) {
    genDirective(argv.d || argv.directive);
  }else if (argv.s || argv.service) {
    genService(argv.s || argv.service);
  }
});
