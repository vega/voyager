'use strict';

angular.module('vleApp')
  .directive('vgSpecEditor', function (Vegalite) {
    return {
      templateUrl: 'templates/vgSpecEditor.html',
      restrict: 'E',
      scope: {},
      link: function postLink(scope, element, attrs) {
        scope.Vegalite = Vegalite;
      }
    };
  });
