'use strict';

angular.module('polestar')
  .directive('vlSpecEditor', function(Spec) {
    return {
      templateUrl: 'components/vlSpecEditor/vlSpecEditor.html',
      restrict: 'E',
      scope: {},
      link: function postLink(scope /*, element, attrs*/) {
        scope.Spec = Spec;

        scope.parseVegalite = function(specJSON) {
          Spec.reset(JSON.parse(specJSON));
        };
      }
    };
  });
