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
      replace: true,
      scope: false,  // use scope from datasetSelector
      link: function postLink(scope/*, element, attrs*/) {
        // the dataset to add
        scope.addedDataset = {
          group: 'user'
        };

        // need to give this a unique name because we share the namespace
        scope.addFromUrl = function(dataset) {
          Dataset.dataset = Dataset.add(angular.copy(dataset));
          scope.datasetChanged();

          scope.addedDataset.name = '';
          scope.addedDataset.url = '';
          scope.doneAdd();
        };
      }
    };
  });