'use strict';
/* globals window */

angular.module('vleApp', [
    'zeroclipboard',
    'Chronicle',
    '720kb.tooltips',
    'LocalStorageModule',
    'ngOrderObjectBy',
    'angular-websql'
  ])
  .constant('_', window._)
  .constant('vl', window.vl)
  .constant('vg', window.vg)
  .constant('Papa', window.Papa)
  .constant('Blob', window.Blob)
  .constant('URL', window.URL)
  .config(['uiZeroclipConfigProvider', function(uiZeroclipConfigProvider) {

    // config ZeroClipboard
    uiZeroclipConfigProvider.setZcConf({
      swfPath: 'bower_components/zeroclipboard/dist/ZeroClipboard.swf'
    });
  }]);

angular.module('facetedviz', ['vleApp', 'ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'ui.router'])
  .constant('_', window._)
  .constant('jQuery', window.$)
  .constant('vl', window.vl)
  .constant('vg', window.vg)
  .constant('vr', window.vr)
  .constant('tv4', window.tv4)
  .constant('Papa', window.Papa)
  .constant('Tether', window.Tether)
  .constant('Drop', window.Drop)
  .constant('consts', {
    addCount: true, // add count field to Dataset.dataschema
    debug: true,
    debugInList: false,
    useUrl: true,
    numInitClusters: 9,
    numMoreClusters: 9,
    logging: true,
    defaultConfigSet: 'small',
    appId: 'voyager',
    enableExclude: false
  })
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      });

    $urlRouterProvider.otherwise('/');
  })
;
