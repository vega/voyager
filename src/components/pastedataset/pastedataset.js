'use strict';

/**
 * @ngdoc directive
 * @name polestar.directive:pasteDataset
 * @description
 * # pasteDataset
 */
angular.module('polestar')
  .directive('pasteDataset', function (Dataset, Alerts, Logger, Spec, Config, _, Papa) {
    return {
      templateUrl: 'components/pastedataset/pastedataset.html',
      restrict: 'E',
      replace: true,
      scope: false,  // use scope from datasetSelector
      link: function postLink(scope/*, element, attrs*/) {
        scope.datasetName = '';
        scope.data = '';

        // need to give this a unique name because we share the namespace
        scope.addPasted = function() {
          var data;

          var result = Papa.parse(scope.data, {
            dynamicTyping: true,
            header: true
          });

          if (result.errors.length === 0) {
            data = result.data;
          } else {
            _.each(result.errors, function(err) {
              Alerts.add(err.message, 2000);
            });
            return;
          }

          var dataset = {
            id: Date.now(),  // time as id
            name: scope.datasetName,
            values: data,
            group: 'pasted'
          };

          Dataset.dataset = Dataset.add(angular.copy(dataset));
          scope.datasetChanged();

          scope.datasetName = '';
          scope.data = '';

          scope.doneAdd();
        };
      }
    };
  });