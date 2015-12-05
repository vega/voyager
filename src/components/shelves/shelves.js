'use strict';

angular.module('polestar')
  .directive('shelves', function() {

    return {
      templateUrl: 'components/shelves/shelves.html',
      restrict: 'E',
      scope: {},
      replace: true,
      controller: function($scope, vl, Spec, Config, Dataset, Logger, Pills) {
        $scope.Spec = Spec;
        $scope.schema = vl.schema.schema;
        $scope.pills = Pills;

        $scope.markChange = function() {
          Logger.logInteraction(Logger.actions.MARK_CHANGE, Spec.spec.mark);
        };

        $scope.transpose = function(){
          vl.spec.transpose(Spec.spec);
        };

        $scope.clear = function(){
          Spec.reset();
        };

        $scope.$watch('Spec.spec', function(spec) {
          Logger.logInteraction(Logger.actions.SPEC_CHANGE, spec);

          Spec.update(spec);
        }, true /* watch equality rather than reference */);
      }
    };
  });
