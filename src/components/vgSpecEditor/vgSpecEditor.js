'use strict';

angular.module('voyager2')
  .directive('vgSpecEditor', function(Spec) {
    return {
      templateUrl: 'components/vgSpecEditor/vgSpecEditor.html',
      restrict: 'E',
      scope: {},
      link: function postLink(scope /*, element, attrs*/) {
        scope.Spec = Spec;
      }
    };
  });
