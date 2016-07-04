'use strict';

angular.module('polestar')
  .directive('shelves', function() {

    return {
      templateUrl: 'components/shelves/shelves.html',
      restrict: 'E',
      scope: {
        spec: '='
      },
      replace: true,
      controller: function($scope, vl, Config, Dataset, Logger, Pills) {
        $scope.markChange = function() {
          Logger.logInteraction(Logger.actions.MARK_CHANGE, scope.spec.mark);
        };

        $scope.transpose = function(){
          vl.spec.transpose(Spec.spec);
        };

        $scope.clear = function(){
          Pills.reset();
        };

        $scope.$watch('spec', function(spec) {
          Logger.logInteraction(Logger.actions.SPEC_CHANGE, spec);

          Pills.update(spec);
        }, true); //, true /* watch equality rather than reference */);
      }
    };
  });
