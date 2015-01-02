'use strict';

angular.module('vleApp')
  .directive('fieldDefEditor', function () {
    return {
      templateUrl: 'templates/fielddefeditor.html',
      restrict: 'E',
      scope: {
        encType: '=',
        fieldDef: '=',
        schema: '=fieldDefSchema'
      }
    };
  });
