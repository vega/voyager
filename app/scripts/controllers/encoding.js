'use strict';

angular.module('vleApp')
  .controller('EncodingCtrl', function ($scope, Encoding) {
    $scope.encoding = Encoding;
  });
