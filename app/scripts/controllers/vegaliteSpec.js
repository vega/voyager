'use strict';

angular.module('vleApp')
  .controller('VegaliteSpecCtrl', function ($scope, $modal, VegaliteSpec, VegaliteSpecSchema, Vegalite, Alerts) {

    $scope.spec = null;
    $scope.schema = null;

    VegaliteSpecSchema.getSchema().then(function(schema) {
      $scope.schema = schema;
    }, function(reason) {
      console.warn(reason);
    });

    $scope.$watch(
      function(){ return VegaliteSpec.spec; },
      function(newSpec) {
        $scope.spec = newSpec;
      }
    );

    $scope.$watch('spec', function(newSpec) {
      if (!newSpec || !newSpec.marktype || !newSpec.cfg) {
        return;
      }

      Vegalite.updateVegaliteSpec(newSpec).then(function() {}, function(errors) {
        _.each(errors, function(error) {
          Alerts.add({msg: error});
        });
      });
    }, true); // TODO: is this needed?
  });
