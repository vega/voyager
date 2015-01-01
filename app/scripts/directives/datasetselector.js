'use strict';

angular.module('vleApp')
  .directive('datasetSelector', function () {
    return {
      templateUrl: 'templates/datasetselector.html',
      restrict: 'E',
      controller: 'DatasetsCtrl'
    };
  });
