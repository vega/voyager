'use strict';

angular.module('vleApp')
  .controller('MenuCtrl', function ($scope, $modal, Vegalite) {
    $scope.parseShorthand = function(shorthand) {
      VegaliteSpec.parseShorthand(shorthand);
    };

    //TODO make popup rely on local scope of this controller instead of global scope that's set by directives/vegaliteplot.js

    $scope.showVgSpec = function(){
      var vgModal = $modal.open({
        templateUrl: 'vgSpecTemplate',
        // resolve: {
        //   vegaSpec: function(){
        //     return $scope.vegaSpec;
        //   }
        // }
      });
    };

    $scope.showVlSpec = function(){
      var vlModal = $modal.open({
        templateUrl: 'vlSpecTemplate',
        // resolve: {
        //   vlSpec: function(){
        //     return $scope.vlSpec;
        //   }
        // }
      });
    };

    // $scope.$watch(function(){ return Vegalite.vegaSpec; },
    //   function(newSpec) {
    //     console.log('watcherUpdated', Vegalite.vegaSpec);
    //     $scope.vegaSpec = Vegalite.vegaSpec;
    //     $scope.vlSpec = Vegalite.vlSpec;
    //     $scope.shorthand = Vegalite.shorthand;
    //   }
    // );
  });
