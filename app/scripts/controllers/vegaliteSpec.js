'use strict';

angular.module('vleApp')
  .controller('VegaliteSpecCtrl', function ($scope, VegaliteSpec, VegaliteSpecSchema, Vegalite) {

    $scope.spec = null;
    $scope.$watch(
      function(){ return VegaliteSpec.spec },
      function(newSpec) {
        $scope.spec = newSpec;
      }
    );

    $scope.schema = null;
    VegaliteSpecSchema.getSchema().then(function(schema) {
      $scope.schema = schema;
    }, function(reason) {
      console.warn(reason);
    });

    $scope.$watch('spec', function(newSpec, oldSpec) {
      if (!newSpec || !newSpec.marktype) {
        return;
      }

      Vegalite.updateVegaliteSpec(newSpec);
    }, true); // TODO: is this needed?
  });
