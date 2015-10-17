'use strict';

/**
 * @ngdoc directive
 * @name vlui.directive:welcomeModal
 * @description
 * # welcomeModal
 */
angular.module('voyager')
  .directive('welcomeModal', function (Modals, localStorageService) {
    return {
      templateUrl: 'components/welcomemodal/welcomemodal.html',
      restrict: 'E',
      // replace: true,
      scope: true,
      link: function(scope) {
        var modalHasBeenShown = localStorageService.get('welcomeModalShown');
        if ( ! modalHasBeenShown ) {
          scope.showWelcomeModal = true;
          localStorageService.set('welcomeModalShown', true);
        }

        scope.closeModal = function() {
          Modals.close('welcome-modal');
        };

        scope.showDatasetModal = function() {
          scope.closeModal();
          Modals.open('dataset-modal');
        };

        scope.showTutorial = function() {
          //TODO: hook in tutorial
          scope.closeModal();
        };

      }
    };
  });
