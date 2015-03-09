'use strict';

angular.module('vleApp')
  .directive('shelves', function() {

    return {
      templateUrl: 'components/shelves/shelves.html',
      restrict: 'E',
      scope: {},
      replace: true,
      controller: function($scope, vl, _, jsondiffpatch, Spec, Config, Dataset, Logger) {
        $scope.Spec = Spec;
        $scope.schema = vl.schema.schema;
        var pills = $scope.pills = {};

        var etDragFrom = null;

        /** copy value from the pill to the fieldDef */
        function updateFieldDef(fieldDef, pill, encType){
          var type = fieldDef.type = pill.type,
            supportedRole = vl.schema.getSupportedRole(encType),
            dimensionOnly = supportedRole.dimension && !supportedRole.measure;

          // auto cast binning / time binning for dimension only encoding type.
          if (pill.name && dimensionOnly) {
            if (type==='Q' && !pill.bin) {
              pill.aggr = undefined;
              pill.bin = {maxbins: vl.schema.MAXBINS_DEFAULT};
            } else if(type==='T' && !pill.fn) {
              pill.fn = vl.schema.defaultTimeFn;
            }
          }

          fieldDef.name = pill.name;
          fieldDef.aggr = pill.aggr;
          fieldDef.fn = pill.fn;
          fieldDef.bin = pill.bin;
        }

        pills.remove = function (encType) {
          delete pills[encType];
          updateFieldDef(Spec.spec.enc[encType], {}, encType); // remove all pill detail from the fieldDef
        };

        pills.update = function (encType) {
          updateFieldDef(Spec.spec.enc[encType], pills[encType], encType);
        };

        pills.dragStart = function (encType) {
          etDragFrom = encType;
        };

        pills.dragDrop = function (etDragTo) {
          var enc = _.clone(Spec.spec.enc);
          // update the clone of the enc
          if(etDragFrom){
            // if pill is dragged from another shelf, not the schemalist
            updateFieldDef(enc[etDragFrom], pills[etDragFrom] || {}, etDragFrom);
          }
          updateFieldDef(enc[etDragTo], pills[etDragTo] || {}, etDragTo);

          // console.log('pills.dragDrop',
          //   'from:', etDragFrom, pills[etDragFrom], enc[etDragFrom],
          //   'to:', etDragTo, pills[etDragTo], enc[etDragTo]);

          // Finally, update the enc only once to prevent glitches
          Spec.spec.enc = enc;
          etDragFrom = null;
        };

        $scope.transpose = function(){
          vl.Encoding.transpose(Spec.spec);
        };

        $scope.clear = function(){
          Spec.reset();
        };

        $scope.$watch('Spec.spec', function(spec, oldSpec) {
          Logger.logInteraction('Spec changed: ' + JSON.stringify(jsondiffpatch.diff(oldSpec, spec)));

          Spec.update(spec);
        }, true /* watch equality rather than reference */);
      }
    };
  });
