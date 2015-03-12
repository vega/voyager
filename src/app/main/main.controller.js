'use strict';

angular.module('facetedviz')
  .controller('MainCtrl', function($scope, $document, Chronicle, Visrec, Config, Dataset, Fields, Bookmarks, Logger, Drop, consts) {

    $scope.consts = consts;
    $scope.canUndo = false;
    $scope.canRedo = false;

    $scope.Visrec = Visrec;
    $scope.Fields = Fields;
    $scope.Dataset = Dataset;
    $scope.Logger = Logger;
    $scope.Bookmarks = Bookmarks;

    $scope.showBookmark = false;
    $scope.hideBookmark = function() {
      $scope.showBookmark = false;
    };

    Bookmarks.load();

    Dataset.update(Dataset.dataset).then(function() {
      // initially set dataset and update fields
      Config.updateDataset(Dataset.dataset);
      Fields.updateSchema(Dataset.dataschema);

      $scope.chron = Chronicle.record('Fields.fields', $scope, true, ['Visrec.numClustersGenerated', 'Dataset.dataset', 'Dataset.dataschema', 'Dataset.stats']);

      $scope.canUndoRedo = function() {
        console.log('record');
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
