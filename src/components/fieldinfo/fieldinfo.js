'use strict';

/**
 * @ngdoc directive
 * @name vleApp.directive:fieldInfo
 * @description
 * # fieldInfo
 */
angular.module('vleApp')
  .directive('fieldInfo', function (Dataset) {
    return {
      templateUrl: 'components/fieldinfo/fieldinfo.html',
      restrict: 'E',
      replace: true,
      scope: {
        field: '=',
        showType: '='
      },
      link: function(scope) {
        scope.typeNames = Dataset.typeNames;
      }
    };
  });