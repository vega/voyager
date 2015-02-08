'use strict';

angular.module('vleApp')
  .controller('MainCtrl', function($scope, $document, Spec, consts, Chronicle) {
    $scope.Spec = Spec;
    $scope.consts = consts;
    $scope.showDevPanel = consts.debug;

    $scope.canUndo = false;
    $scope.canRedo = false;
    $scope.chron = Chronicle.record('Spec.spec', $scope);

    $scope.canUndoRedo = function() {
      $scope.canUndo = $scope.chron.canUndo();
      $scope.canRedo = $scope.chron.canRedo();
    };
    $scope.chron.addOnAdjustFunction($scope.canUndoRedo);
    $scope.chron.addOnUndoFunction($scope.canUndoRedo);
    $scope.chron.addOnRedoFunction($scope.canUndoRedo);

    angular.element($document).on('keydown', function(e) {
      if (e.keyCode == 'Z'.charCodeAt(0) && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        $scope.chron.undo();
        $scope.$digest()
        return false;
      } else if (e.keyCode == 'Y'.charCodeAt(0) && (e.ctrlKey || e.metaKey)) {
        $scope.chron.redo();
        $scope.$digest()
        return false;
      } else if (e.keyCode == 'Z'.charCodeAt(0) && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        $scope.chron.redo();
        $scope.$digest()
        return false;
      }
    });
  });
