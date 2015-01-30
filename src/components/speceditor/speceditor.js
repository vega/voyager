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

        /** copy value from the pill to the fieldDef */
        function updateFieldDef(fieldDef, pill){
          // console.log('updateFieldDef', JSON.stringify(pill, null, '  ', 80));
          fieldDef.name = pill.name;
          fieldDef.type = pill.type;
          fieldDef.aggr = pill.aggr;
          fieldDef.fn = pill.fn;
          fieldDef.bin = pill.bin;
        }

        pills.remove = function (encType) {
          delete pills[encType];
          updateFieldDef(Spec.spec.enc[encType], {}); // remove all pill detail from the fieldDef
        };

        pills.update = function (encType) {
          updateFieldDef(Spec.spec.enc[encType], pills[encType]);
        };

        pills.dragStart = function (encType) {
          etDragFrom = encType;
        };

        pills.dragDrop = function (etDragTo) {
          var enc = _.clone(Spec.spec.enc);
          // update the clone of the enc
          if(etDragFrom){
            // if pill is dragged from another shelf, not the schemalist
            updateFieldDef(enc[etDragFrom], pills[etDragFrom] || {});
          }
          updateFieldDef(enc[etDragTo], pills[etDragTo] || {});

          // console.log('pills.dragDrop',
          //   'from:', etDragFrom, pills[etDragFrom], enc[etDragFrom],
          //   'to:', etDragTo, pills[etDragTo], enc[etDragTo]);

          // Finally, update the enc only once to prevent glitches
          Spec.spec.enc = enc;
          etDragFrom = null;
        };

        $scope.transpose = function(){
          var oldenc = Spec.spec.enc,
            enc = _.clone(Spec.spec.enc);
          enc.x = oldenc.y;
          enc.y = oldenc.x;
          enc.row = oldenc.col;
          enc.col = oldenc.row;
          Spec.spec.enc = enc;
        };

        $scope.clear = function(){
          Spec.reset();
        };

        $scope.$watch('Spec.spec', function(spec) {
          Spec.update(spec);
        }, true /* watch equality rather than reference */);
      }
    };
  });
