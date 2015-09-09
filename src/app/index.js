'use strict';
/* globals window */

angular.module('voyager', ['vlui',
    'zeroclipboard',
    '720kb.tooltips',
    'LocalStorageModule',
    'ngOrderObjectBy',
    'Chronicle',
    'ngTouch',
    'ngSanitize',
    'ui.router'])
  .constant('_', window._)
  .constant('jQuery', window.$)
  .constant('vl', window.vl)
  .constant('vg', window.vg)
  .constant('cp', window.cp)
  .constant('tv4', window.tv4)
  .constant('Blob', window.Blob)
  .constant('URL', window.URL)
  .constant('Tether', window.Tether)
  .constant('Drop', window.Drop)
  .constant('dl', window.dl)
  .config(['uiZeroclipConfigProvider', function(uiZeroclipConfigProvider) {
    // config ZeroClipboard
    uiZeroclipConfigProvider.setZcConf({
      swfPath: 'bower_components/zeroclipboard/dist/ZeroClipboard.swf'
    });
  }])
  .config(function ($stateProvider, $urlRouterProvider, consts) {
    window.vl.extend(consts, {
      debug: true,
      debugInList: true,
      numInitClusters: 15,
      numMoreClusters: 9,
      appId: 'voyager',
      enableExclude: true
    });

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      });

    $urlRouterProvider.otherwise('/');
  })
;
