'use strict';

angular.module('vleApp')
  .controller('MenuCtrl', function ($scope, $modal, Vegalite) {
    $scope.showConfig = function(){
      $modal.open({
        templateUrl: 'configTemplate'
      });
    };

    $scope.showVgSpec = function(){
      $modal.open({
        templateUrl: 'vgSpecTemplate'
      });
    };

    $scope.showVlSpec = function(){
      $modal.open({
        templateUrl: 'vlSpecTemplate'
      });
    };
  });
