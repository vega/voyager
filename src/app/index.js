'use strict';
/* globals window */

angular.module('polestar', [
    'ngAnimate',
    'ngCookies',
    'ngSanitize',
    'ngTouch',
    'ngDragDrop',
    'monospaced.elastic',
    'zeroclipboard',
    'ui.router',
    'ui.select',
    'Chronicle',
    'LocalStorageModule',
    '720kb.tooltips',
    'ngOrderObjectBy',
    'angular-websql',
    'vlui'])
  .constant('_', window._)
  .constant('vl', window.vl)
  .constant('vg', window.vg)
  .constant('Papa', window.Papa)
  .constant('ZSchema', window.ZSchema)
  .constant('Tether', window.Tether)
  .constant('Drop', window.Drop)
  .constant('Blob', window.Blob)
  .constant('URL', window.URL)
  .constant('dl', window.dl)
  .constant('jsondiffpatch', window.jsondiffpatch)
  .constant('consts', {
    addCount: true, // add count field to Dataset.dataschema
    debug: true,
    useUrl: true,
    logging: false,
    defaultConfigSet: 'large',
    appId: 'polestar'
  })
  .config(function(uiZeroclipConfigProvider) {
    // config ZeroClipboard
    uiZeroclipConfigProvider.setZcConf({
      swfPath: 'bower_components/zeroclipboard/dist/ZeroClipboard.swf'
    });
  })
  .config(function(localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('polestar');
  })
  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      });

    $urlRouterProvider.otherwise('/');
  });
