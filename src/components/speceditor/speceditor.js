'use strict';

angular.module('vleApp')
  .directive('specEditor', function () {
    return {
      templateUrl: 'components/speceditor/speceditor.html',
      restrict: 'E',
      scope: {},
      controller: function ($scope, vl, Spec) {
        $scope.spec = null;
        $scope.$watch(
          function(){ return Spec.spec; },
          function(newSpec) {
            $scope.spec = newSpec;
          }
        );

        $scope.schema = vl.schema.schema;

        $scope.$watch('spec', function(newSpec) {
          if (!newSpec || !newSpec.marktype || !newSpec.cfg) {
            return;
          }
          Spec.updateSpec(newSpec);
        }, true); // TODO: is this needed?
      }
    };
  });
