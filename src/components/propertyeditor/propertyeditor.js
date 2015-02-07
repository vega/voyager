'use strict';

/**
 * @ngdoc directive
 * @name vegalite-ui.directive:propertyEditor
 * @description
 * # propertyEditor
 */
angular.module('vleApp')
  .directive('propertyEditor', function () {
    return {
      templateUrl: 'components/propertyeditor/propertyeditor.html',
      restrict: 'E',
      scope: {
        id: '=',
        type: '=',
        enum: '=',
        propName: '=',
        group: '='
      },
      link: function postLink(/*scope, element, attrs*/) {
      }
    };
  });