// 'use strict';

angular.module('vleApp')
  .controller('MainCtrl', function($scope, $document, Spec, consts, Chronicle) {
    $scope.Spec = Spec;
    $scope.consts = consts;
    $scope.showDevPanel = consts.debug;

    $scope.canUndo = false;
    $scope.canRedo = false;
    $scope.chron = Chronicle.record('Spec.spec', $scope);

    c = $scope;

    $scope.canUndoRedo = function() {
      $scope.canUndo = $scope.chron.canUndo();
      $scope.canRedo = $scope.chron.canRedo();
    };
    $scope.chron.addOnAdjustFunction($scope.canUndoRedo);
    $scope.chron.addOnUndoFunction($scope.canUndoRedo);
    $scope.chron.addOnRedoFunction($scope.canUndoRedo);

    $scope.chron.addOnUndoFunction(function() {
      $scope.$digest()
    });
    $scope.chron.addOnRedoFunction(function() {
      $scope.$digest()
    });

    angular.element($document).on('keydown', function(e) {
      if (e.keyCode == 'Z'.charCodeAt(0) && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        $scope.chron.undo();
        return false;
      } else if (e.keyCode == 'Y'.charCodeAt(0) && (e.ctrlKey || e.metaKey)) {
        $scope.chron.redo();
        return false;
      } else if (e.keyCode == 'Z'.charCodeAt(0) && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        $scope.chron.redo();
        return false;
      }
    });
  });
