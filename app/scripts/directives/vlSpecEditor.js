'use strict';

angular.module('vleApp')
  .directive('vlSpecEditor', function (Vegalite, VegaliteSpec) {
    return {
      templateUrl: 'templates/vlSpecEditor.html',
      restrict: 'E',
      scope: {},
      link: function postLink(scope, element, attrs) {

        scope.parseShorthand = function(shorthand) {
          VegaliteSpec.parseShorthand(shorthand);
        };

        // TODO(kanitw): I don't know how expensive is this "function" watcher.
        // should we use some event listener instead?
        scope.$watch(
          function(){ return Vegalite.vegaSpec; },
          function(newSpec) {
            if (!newSpec) {
              return;
            }
            scope.vlSpec = Vegalite.vlSpec;
            scope.shorthand = Vegalite.shorthand;
          }
        );

      }
    };
  });
