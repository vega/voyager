'use strict';

angular.module('vleApp')
  .controller('SchemaCtrl', function ($scope, schemaService) {
    $scope.schema = schemaService.getSchema();
  });
