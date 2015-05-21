'use strict';

angular.module('polestar')
  .directive('datasetSelector', function(Drop, Dataset, Config, Spec, Logger) {
    return {
      templateUrl: 'components/datasetselector/datasetselector.html',
      restrict: 'E',
      replace: true,
      scope: {},
      link: function postLink(scope , element/*, attrs*/) {
        scope.Dataset = Dataset;

        scope.datasetChanged = function() {
          if (!Dataset.dataset) {
            // reset if no dataset has been set
            Dataset.dataset = Dataset.currentDataset;
            funcsPopup.open();
            return;
          }

          Logger.logInteraction(Logger.actions.DATASET_CHANGE, Dataset.dataset.name);

          Dataset.update(Dataset.dataset).then(function() {
            Config.updateDataset(Dataset.dataset, Dataset.type);
            Spec.reset();
          });
        };

        scope.doneAdd = function() {
          funcsPopup.close();
        };

        var funcsPopup = new Drop({
          content: element.find('.popup-new-dataset')[0],
          target: element.find('.open-dataset-popup')[0],
          position: 'right top',
          openOn: false
        });

        scope.$on('$destroy', function() {
          funcsPopup.destroy();
          funcsPopup = null;
        });
      }
    };
  });
