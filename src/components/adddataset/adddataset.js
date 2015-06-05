'use strict';

/**
 * @ngdoc directive
 * @name voyager.directive:addDataset
 * @description
 * # addDataset
 */
angular.module('voyager')
  .directive('addDataset', function (Dataset, Drop) {
    return {
      templateUrl: 'components/adddataset/adddataset.html',
      restrict: 'E',
      replace: true,
      scope: {},
      link: function postLink(scope , element/*, attrs*/) {
        scope.dataset = {};

        scope.add = function(dataset) {
          Dataset.add(angular.copy(dataset));
          scope.dataset.name = '';
          scope.dataset.url = '';
          funcsPopup.close();
        };

        var funcsPopup = new Drop({
          content: element.find('.popup-new-dataset')[0],
          target: element.find('.open-dataset-popup')[0],
          position: 'bottom left',
          openOn: 'click'
        });

        scope.$on('$destroy', function() {
          funcsPopup.destroy();
          funcsPopup = null;
        });
      }
    };
  });
