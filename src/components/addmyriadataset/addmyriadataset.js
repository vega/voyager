'use strict';

/**
 * @ngdoc directive
 * @name polestar.directive:addMyriaDataset
 * @description
 * # addMyriaDataset
 */
angular.module('polestar')
  .directive('addMyriaDataset', function ($http, Dataset, consts) {
    return {
      templateUrl: 'components/addmyriadataset/addmyriadataset.html',
      restrict: 'E',
      replace: true,
      scope: false,  // use scope from datasetSeletor
      link: function postLink(scope/*, element, attrs*/) {
        scope.myriaRestUrl = consts.myriaRest;

        scope.myriaDatasets = [];

        scope.myriaDataset = null;

        scope.loadDatasets = function(query) {
          return $http.get(scope.myriaRestUrl + '/dataset/search/?q=' + query)
            .then(function(response) {
              scope.myriaDatasets = response.data;
            });
        };

        scope.add = function(myriaDataset) {
          var dataset = {
            group: 'myria',
            name: myriaDataset.relationName,
            url: scope.myriaRestUrl + '/dataset/user-' + myriaDataset.userName +
              '/program-' + myriaDataset.programName +
              '/relation-' + myriaDataset.relationName + '/data?format=json'
          };

          Dataset.dataset = Dataset.add(angular.copy(dataset));
          scope.datasetChanged();

          scope.myriaDataset = null;
          scope.doneAdd();
        };
      }
    };
  });