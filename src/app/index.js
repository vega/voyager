'use strict';
/* globals window */

angular.module('vleApp', [
    'ngAnimate',
    'ngCookies',
    'ngSanitize',
    'ngTouch',
    'ngDragDrop',
    'monospaced.elastic',
    'zeroclipboard',
    'ui.router',
    'Chronicle',
    'LocalStorageModule',
    '720kb.tooltips'])
  .constant('_', window._)
  .constant('vl', window.vl)
  .constant('vg', window.vg)
  .constant('Papa', window.Papa)
  .constant('ZSchema', window.ZSchema)
  .constant('Tether', window.Tether)
  .constant('Drop', window.Drop)
  .constant('jsondiffpatch', window.jsondiffpatch)
  .constant('consts', {
    addCount: true, // add count field to Dataset.dataschema
    debug: true,
    useUrl: true,
    logging: false,
    defaultConfigSet: 'large'
  })
  .config(function(uiZeroclipConfigProvider) {
    // config ZeroClipboard
    uiZeroclipConfigProvider.setZcConf({
      swfPath: 'bower_components/zeroclipboard/dist/ZeroClipboard.swf'
    });
  })
  .config(function(localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('vegalite-ui');
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
