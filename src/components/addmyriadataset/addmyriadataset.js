'use strict';

/**
 * @ngdoc directive
 * @name polestar.directive:addMyriaDataset
 * @description
 * # addMyriaDataset
 */
angular.module('polestar')
  .directive('addMyriaDataset', function ($http, Dataset) {
    return {
      templateUrl: 'components/addmyriadataset/addmyriadataset.html',
      restrict: 'E',
      replace: true,
      scope: false,  // use scope from datasetSeletor
      link: function postLink(scope/*, element, attrs*/) {
        scope.myriaDatasets = [];

        scope.addedDataset = {
          user: "Brandon",
          program: "Demo",
          relation: "Demo"
        };

        scope.myriaDataset = '';

        scope.loadDatasets = function(query) {
          return $http.get('http://ec2-52-1-38-182.compute-1.amazonaws.com:8753/dataset/search/?q=' + query)
            .then(function(response) {
              scope.myriaDatasets = response.data;
            });
        };

        scope.add = function(rel) {
          var dataset = {
            group: 'myria',
            name: rel.relation,
            url: "http://ec2-52-1-38-182.compute-1.amazonaws.com:8753/dataset/user-" + rel.user + "/program-" + rel.program + "/relation-" + rel.relation + "/data?format=json"
          };

          console.log(dataset)

          Dataset.dataset = Dataset.add(angular.copy(dataset));
          scope.datasetChanged();

          // scope.addedDataset.user = '';
          // scope.addedDataset.program = '';
          // scope.addedDataset.relation = '';
          scope.doneAdd();
        };
      }
    };
  });