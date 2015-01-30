'use strict';

/**
 * @ngdoc directive
 * @name facetedviz.directive:visList
 * @description
 * # visList
 */
angular.module('facetedviz')
  .directive('visList', function (Fields, Visrec, vl) {
    return {
      templateUrl: 'components/visList/visList.html',
      restrict: 'E',
      scope: {},
      link: function postLink(scope /*, element, attrs*/) {
        scope.Fields = Fields;
        scope.Visrec = Visrec;
        scope.shorthands = vl.field.shorthands;

        scope.$watch('Fields.fields', function(){
          var fieldList = Fields.getList();
          Visrec.update.projections(fieldList);
        }, true);
      }
    };
  });