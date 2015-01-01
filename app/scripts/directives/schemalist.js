'use strict';

angular.module('vleApp')
  .directive('schemaList', function () {
    return {
      templateUrl: 'templates/schemalist.html',
      restrict: 'E',
      controller: 'DatasetsCtrl'
    };
  });
