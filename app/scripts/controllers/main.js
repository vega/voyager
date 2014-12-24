'use strict';

var vle = {'version' : 0.1}

vle.App = angular.module('vle', []);

vle.App.controller('MainCtrl', function ($scope) {
    $scope.foos = ['Item 1', 'Item 2', 'Item 3'];
  });
