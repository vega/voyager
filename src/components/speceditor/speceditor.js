'use strict';

angular.module('vleApp')
  .directive('specEditor', function() {
    return {
      templateUrl: 'components/speceditor/speceditor.html',
      restrict: 'E',
      scope: {},
      controller: function($scope, vl, Spec) {
        $scope.Spec = Spec;
        $scope.schema = vl.schema.schema;

        $scope.$watch('Spec.spec', function(spec) {
          Spec.update(spec);
        }, true /* watch equality rather than reference */);
      }
    };
  });
