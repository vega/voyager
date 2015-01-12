'use strict';

angular.module('vleApp')
  .directive('vlSpecEditor', function (Vegalite, VegaliteSpec) {
    return {
      templateUrl: 'templates/vlSpecEditor.html',
      restrict: 'E',
      scope: {},
      link: function postLink(scope, element, attrs) {
        scope.Vegalite = Vegalite;

        scope.parseShorthand = function(shorthand) {
          VegaliteSpec.parseShorthand(shorthand);
        };
      }
    };
  });
