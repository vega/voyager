'use strict';

/**
 * @ngdoc directive
 * @name vlui.directive:voyagerWelcomeModal
 * @description
 * # voyagerWelcomeModal
 */
angular.module('vlui')
  .directive('voyagerWelcomeModal', function (Modals) {
    return {
      templateUrl: 'components/voyagerwelcomemodal/voyagerwelcomemodal.html',
      restrict: 'E',
      require: '^^modal',
      scope: false,
      link: function(scope, element, attrs, modalController) {
        scope.closeModal = function() {
          modalController.close();
        };

        scope.showDatasetModal = function() {
          modalController.close();
          Modals.open('dataset-modal');
        };

        scope.showTutorial = function() {
          //TODO: hook in tutorial
          modalController.close();
        };

      }
    };
  });
