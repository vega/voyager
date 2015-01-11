'use strict';

angular.module('vleApp')
  .directive('vgSpecEditor', function (Vegalite) {
    return {
      templateUrl: 'templates/vgSpecEditor.html',
      restrict: 'E',
      scope: {},
      link: function postLink(scope, element, attrs) {
        // TODO(kanitw): I don't know how expensive is this "function" watcher.
        // should we use some event listener instead?
        scope.$watch(
          function(){ return Vegalite.vegaSpec; },
          function(newSpec) {
            if (!newSpec) {
              return;
            }
            scope.vgSpec = Vegalite.vegaSpec;
          }
        );
      }
    };
  });
