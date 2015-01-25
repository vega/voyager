'use strict';

angular.module('vleApp')
  .directive('vlSpecEditor', function (Spec) {
    return {
      templateUrl: 'components/vlSpecEditor/vlSpecEditor.html',
      restrict: 'E',
      scope: {},
      link: function postLink(scope /*, element, attrs*/) {
        scope.Spec = Spec;

        scope.parseShorthand = Spec.parseShorthand;
      }
    };
  });
