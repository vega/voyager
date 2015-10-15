'use strict';

/**
 * @ngdoc directive
 * @name vlui.directive:voyagerWelcomeModal
 * @description
 * # voyagerWelcomeModal
 */
angular.module('vlui')
  .directive('voyagerWelcomeModal', function () {
    return {
      templateUrl: 'components/voyagerwelcomemodal/voyagerwelcomemodal.html',
      restrict: 'E',
      require: '^^modal',
      scope: false,
      link: function(scope, element, attrs, modalController) {
        scope.closeModal = function() {
          modalController.close();
        };

        scope.showTutorial = function() {
          //TODO: hook in tutorial
          modalController.close();
        };

      }
    };
  });
