'use strict';

angular.module('vleApp')
  .controller('EncodingCtrl', function ($scope, Encoding, Vegalite) {

    $scope.encoding = null;
    Encoding.getEncoding().then(function(encoding) {
      $scope.encoding = encoding;
    });

    $scope.schema = null;
    Encoding.getEncodingSchema().then(function(schema) {
      console.log(schema)
      $scope.schema = schema;
    });

    // define order
    $scope.encTypes = ['x', 'y', 'row', 'col', 'size', 'color', 'alpha', 'shape', 'text'];

    $scope.$watch('encoding', function(newEncoding, oldEncoding) {
      if (!newEncoding) {
        return;
      }

      Vegalite.update(newEncoding);
    }, true); // TODO: is this needed?
  });
