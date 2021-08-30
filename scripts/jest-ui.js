#!/usr/bin/env node

/**
 * This file builds the app as a library and runs a test suite against it
 * Only tests that end in .ui.[tsx|ts] will be run by this test runner.
 */

const path = require('path');
const webpack = require('webpack');
const config = require('../config/webpack.config.lib');
const glob = require('glob');


// Set the output path for the build to lib-test
// so that we do not clobber the built library.
config.output.publicPath = '/lib-test/';
config.output.path = path.resolve(__dirname, '../lib-test');
config.output.filename = '[name].js';
config.externals = {};

const basedir = path.resolve(__dirname, '../src');
const tests = glob.sync('*.{test,spec}.ui.{ts,tsx,js,jsx}', {
  cwd: basedir,
  matchBase: true,
});

config.entry = tests
  .reduce(function(carry, key) {
    carry[key] = path.resolve(basedir, key);
    return carry;
  }, {});


const compiler = webpack(config);
compiler.run(function() {});

compiler.plugin('done', function(compilation) {

  if (process.env.NODE_ENV == null) {
    process.env.NODE_ENV = 'test';
  }

  const jestConf = `--config ${path.resolve(__dirname, '../config', 'jest-ui.config.json')}`;

  try {
    require('jest-cli/build/cli').run(jestConf);
  }
  catch (_) {
    require('jest/node_modules/jest-cli/build/cli').run(jestConf);
  }
});
