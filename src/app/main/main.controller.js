'use strict';

angular.module('facetedviz')
  .controller('MainCtrl', function($scope, Spec) {
    $scope.Spec = Spec;
  });
