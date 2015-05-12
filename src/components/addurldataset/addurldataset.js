'use strict';

/**
 * @ngdoc directive
 * @name polestar.directive:addUrlDataset
 * @description
 * # addUrlDataset
 */
angular.module('polestar')
  .directive('addUrlDataset', function (Dataset) {
    return {
      templateUrl: 'components/addurldataset/addurldataset.html',
      restrict: 'E',
      replace: false,
      scope: false,  // use scope from datasetSeletor
      link: function postLink(scope/*, element, attrs*/) {
        // the dataset to add
        scope.addedDataset = {
          group: 'user'
        };

        scope.add = function(dataset) {
          Dataset.dataset = Dataset.add(angular.copy(dataset));
          scope.datasetChanged();

          scope.addedDataset.name = '';
          scope.addedDataset.url = '';
          scope.doneAdd();
        };
      }
    };
  });