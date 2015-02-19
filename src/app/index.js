'use strict';
/* globals window */

angular.module('vleApp', [
    'zeroclipboard',
    'Chronicle',
    '720kb.tooltips',
    'LocalStorageModule'
  ])
  .constant('_', window._)
  .constant('vl', window.vl)
  .constant('vg', window.vg)
  .constant('Papa', window.Papa)
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
  .constant('consts', {
    addCount: true, // add count field to Dataset.dataschema
    debug: true,
    useUrl: false,
    numInitClusters: 9,
    numMoreClusters: 9,
    logging: false
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
