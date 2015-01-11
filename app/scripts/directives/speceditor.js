'use strict';

angular.module('vleApp')
  .directive('specEditor', function () {
    return {
      templateUrl: 'templates/speceditor.html',
      restrict: 'E',
      scope: {},
      controller: function ($scope, VegaliteSpec, VegaliteSpecSchema, Vegalite, Alerts) {
        $scope.spec = null;
        $scope.$watch(
          function(){ return VegaliteSpec.spec; },
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
      }
    };
  });
