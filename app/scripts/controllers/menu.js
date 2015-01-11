'use strict';

angular.module('vleApp')
  .controller('MenuCtrl', function ($scope, $modal, Vegalite) {
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
