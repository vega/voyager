'use strict';

angular.module('voyager2')
  .directive('cqlQueryEditor', function(Spec) {
    return {
      templateUrl: 'components/cqlQueryEditor/cqlQueryEditor.html',
      restrict: 'E',
      scope: {},
      link: function postLink(scope /*, element, attrs*/) {
        scope.Spec = Spec;
      }
    };
  });
