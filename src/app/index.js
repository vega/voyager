'use strict';
/* globals window */

angular.module('vleApp', [])
  .constant('_', window._)
  .constant('vl', window.vl)
  .constant('vg', window.vg)
  .constant('Papa', window.Papa);

angular.module('facetedviz', ['vleApp', 'ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'ui.router'])
  .constant('_', window._)
  .constant('vl', window.vl)
  .constant('vg', window.vg)
  .constant('vr', window.vr)
  .constant('Papa', window.Papa)
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
