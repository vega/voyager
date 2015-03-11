'use strict';

angular.module('vleApp')
  .directive('schemaList', function(Dataset) {
    return {
      templateUrl: 'components/schemalist/schemalist.html',
      restrict: 'E',
      scope: {},
      replace: true,
      // link: function postLink(scope, element /*, attrs*/) {
      // },
      controller: function($scope) {
        $scope.Dataset = Dataset;
      }
    };
  });
