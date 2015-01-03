'use strict';

// TODO: rename to vegalite spec
angular.module('vleApp')
  .controller('EncodingCtrl', function ($scope, Encoding, EncodingSchema, Vegalite) {

    $scope.encoding = null;
    $scope.$watch(
      function(){ return Encoding.encoding },
      function(newEncoding) {
        $scope.encoding = newEncoding;
      }
    );

    $scope.schema = null;
    EncodingSchema.getEncodingSchema().then(function(schema) {
      $scope.schema = schema;
    }, function(reason) {
      console.warn(reason);
    });

    $scope.$watch('encoding', function(newSpec, oldSpec) {
      if (!newSpec) {
        return;
      }

      Vegalite.updateVegaliteSpec(newSpec);
    }, true); // TODO: is this needed?
  });
