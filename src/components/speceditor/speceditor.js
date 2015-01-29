'use strict';

angular.module('vleApp')
  .directive('specEditor', function() {
    return {
      templateUrl: 'components/speceditor/speceditor.html',
      restrict: 'E',
      scope: {},
      controller: function($scope, vl, _, Spec) {
        $scope.Spec = Spec;
        $scope.schema = vl.schema.schema;
        var pills = $scope.pills = {};

        var etDragFrom = null;

        pills.remove = function (encName) {
          delete pills[encName];
          pills.updated(Spec.spec.enc[encName], {}); // remove all pill detail from the fieldDef
        };

        /** copy value from the pill to the fieldDef */
        pills.updated = function(fieldDef, pill){
          fieldDef.name = pill.name;
          fieldDef.type = pill.type;
          fieldDef.aggr = pill.aggr;
          fieldDef.fn = pill.fn;
          fieldDef.bin = pill.bin;
        };

        pills.dragStart = function(encType){
          etDragFrom = encType;
        };

        pills.dragDrop = function(etDragTo){
          var enc = _.clone(Spec.spec.enc);
          // update the clone of the enc
          if(etDragFrom){
            // if pill is dragged from another shelf, not the schemalist
            pills.updated(enc[etDragFrom], pills[etDragFrom] || {});
          }
          pills.updated(enc[etDragTo], pills[etDragTo] || {});

          // Finally, update the enc only once to prevent glitches
          Spec.spec.enc = enc;
          etDragFrom = null;
        };

        $scope.$watch('Spec.spec', function(spec) {
          Spec.update(spec);
        }, true /* watch equality rather than reference */);
      }
    };
  });
