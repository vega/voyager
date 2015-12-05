/**
 * script for generating angular primitives
 *
 * gulp gen -d directiveName (or --directive)
 * gulp gen -s serviceName   (or --service)
 * gulp gen -c controllerName (or --controller)
 * gulp gen --fi filterName  (or --filter)
 * gulp gen --fa factoryName (or --factory)
 */

'use strict';

var gulp = require('gulp'),
  argv = require('yargs').argv,
  fs = require('fs'),
  request = require('request'),
  pack = require('../package.json');

var APP_NAME = pack.name;
var SRC_PATH = 'src/';
var APP_PATH = 'app/';
var COMP_PATH = 'components/';

var GIST_URL = 'https://gist.githubusercontent.com/kanitw/15256571933310366d00/raw/';

function createFile(path){
  fs.closeSync(fs.openSync(path, 'w'));
}

function fetchUrl(url, callback){
  console.log('fetching', url);
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

function getAppName() {
  return argv.a || argv.appname || APP_NAME;
}

function genDirective(dir){
  var ldir = dir.toLowerCase(),
    dirpath = SRC_PATH + COMP_PATH + ldir +'/',
    dirdash = dir.replace(/([A-Z])/g, ' $1') // insert a space before all caps
      .toLowerCase()
      .split(' ')
      .join('-');

  if(! fs.existsSync(dirpath)){
    fs.mkdirSync(dirpath);
  }
  // create template, scss
  createFile(dirpath+ ldir +'.scss');
  fs.writeFileSync(dirpath + ldir + '.html' , '<div></div>');

  // create directive file
  fetchUrl(GIST_URL + 'directive.js', function(str) {
    fs.writeFileSync(dirpath + ldir + '.js' , replace(str, {
      __appname__: getAppName(),
      __directive__: dir,
      __component__dir__: COMP_PATH,
      '__directive_lower__': ldir,
      '__directive_dash__': dirdash
    }));
  });

  // create spec file
  fetchUrl(GIST_URL + 'directive.test.js', function(str) {
    fs.writeFileSync(dirpath + ldir + '.test.js' , replace(str, {
      __appname__: getAppName(),
      __directive__: dir,
      '__directive_lower__': ldir,
      '__directive_dash__': dirdash
    }));
  });
}

function genItem(rootpath, item, fileurl, specurl, itemtype){
  var filename = item.toLowerCase(),
    dirpath = SRC_PATH + rootpath + filename +'/',
    template = { __appname__: getAppName() };

  if(! fs.existsSync(dirpath)){
    fs.mkdirSync(dirpath);
  }

  template['__'+itemtype+'__'] = item;

  // create directive file
  fetchUrl(fileurl, function(str) {
    fs.writeFileSync(dirpath + filename + '.' + itemtype + '.js' , replace(str, template));
  });

  // create spec file
  fetchUrl(specurl, function(str) {
    fs.writeFileSync(dirpath + filename + '.' + itemtype + '.test.js' , replace(str, template));
  });
}

function genService(srv){
  genItem(APP_PATH, srv, GIST_URL + 'service.js',
    GIST_URL + 'service.test.js', 'service');
}

function genFilter(f){
  genItem(COMP_PATH, f, GIST_URL + 'filter.js', GIST_URL + 'filter.test.js', 'filter');
}

function genFactory(f){
  genItem(APP_PATH, f, GIST_URL + 'factory.js', GIST_URL + 'factory.test.js', 'factory');
}

function genController(c){
  // controller name should be title case (Ctrl suffix is already appended in the template)
  var Cc = c.substr(0,1).toUpperCase() + c.substr(1);

  genItem(APP_PATH, Cc, GIST_URL + 'controller.js', GIST_URL + 'controller.test.js', 'controller');
}

gulp.task('gen', function() {
  if (argv.d || argv.directive) {
    genDirective(argv.d || argv.directive);
  } else if (argv.s || argv.service) {
    genService(argv.s || argv.service);
  } else if (argv.c || argv.controller) {
    genController(argv.c || argv.controller);
  } else if (argv.fi || argv.filter) {
    genFilter(argv.fi || argv.filter);
  } else if (argv.fa || argv.factory) {
    genFactory(argv.fa || argv.factory);
  } else {
    console.log('please supply flag to generate an angular object you want');
  }
});
