'use strict';

angular.module('voyager')
  .controller('MainCtrl', function($scope, $document, Chronicle, Visrec, Config, Dataset, Fields, Bookmarks, Logger, Drop, consts, Modals) {

    Config.config.useRawDomain = true;

    $scope.consts = consts;
    $scope.canUndo = false;
    $scope.canRedo = false;
    $scope.embedded = !!consts.embeddedData;

    $scope.Visrec = Visrec;
    $scope.Fields = Fields;
    $scope.Dataset = Dataset;
    $scope.Config = Config;
    $scope.Bookmarks = Bookmarks;

    $scope.showModal = function(modalId) {
      Modals.open(modalId);
    };

    $scope.toggleDevPanel = function() {
      $scope.showDevPanel = ! $scope.showDevPanel;
    };

    if (Bookmarks.isSupported) {
      // load bookmarks from local storage
      Bookmarks.load();
    }

    if ($scope.embedded) {
      // use provided data and we will hide the dataset selector
      Dataset.dataset = {
        values: consts.embeddedData,
        name: 'embedded'
      };
    }

    Dataset.update(Dataset.dataset).then(function() {
      // initially set dataset and update fields
      Config.updateDataset(Dataset.dataset);
      Fields.updateSchema(Dataset.dataschema);

      $scope.chron = Chronicle.record('Fields.fields', $scope, true,
        ['Visrec.numClustersGenerated', 'Dataset.dataset', 'Dataset.dataschema', 'Dataset.stats', 'Config.config']);

      $scope.canUndoRedo = function() {
        $scope.canUndo = $scope.chron.canUndo();
        $scope.canRedo = $scope.chron.canRedo();
      };
      $scope.chron.addOnAdjustFunction($scope.canUndoRedo);
      $scope.chron.addOnUndoFunction($scope.canUndoRedo);
      $scope.chron.addOnRedoFunction($scope.canUndoRedo);

      $scope.chron.addOnUndoFunction(function() {
        Logger.logInteraction(Logger.actions.UNDO);
      });
      $scope.chron.addOnRedoFunction(function() {
        Logger.logInteraction(Logger.actions.REDO);
      });

      angular.element($document).on('keydown', function(e) {
        if (e.keyCode === 'Z'.charCodeAt(0) && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
          $scope.chron.undo();
          $scope.$digest();
          return false;
        } else if (e.keyCode === 'Y'.charCodeAt(0) && (e.ctrlKey || e.metaKey)) {
          $scope.chron.redo();
          $scope.$digest();
          return false;
        } else if (e.keyCode === 'Z'.charCodeAt(0) && (e.ctrlKey || e.metaKey) && e.shiftKey) {
          $scope.chron.redo();
          $scope.$digest();
          return false;
        }
      });
    });

  });
