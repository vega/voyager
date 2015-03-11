'use strict';

/**
 * @ngdoc service
 * @name vleApp.Pills
 * @description
 * # Pills
 * Service in the vleApp.
 */
angular.module('vleApp')
  .service('Pills', function (vl, Spec, _) {
    var Pills = {
      pills: {}
    };

    Pills.getSchemaPill = function(field) {
      return {
        name: field.name,
        type: field.type,
        aggr: field.aggr
      };
    };


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

    Pills.remove = function (encType) {
      delete Pills.pills[encType];
      updateFieldDef(Spec.spec.enc[encType], {}, encType); // remove all pill detail from the fieldDef
    };

    Pills.update = function (encType) {
      updateFieldDef(Spec.spec.enc[encType], Pills.pills[encType], encType);
    };

    Pills.dragStart = function (pill, encType) {
      Pills.pills.dragging = pill;
      console.log('dragging', Pills, pill, Pills.pills.dragging, 'from', Pills.pills.etDragFrom);
      Pills.pills.etDragFrom = encType;
    };

    Pills.dragStop = function () {
      delete Pills.dragging;
      Pills.pills.etDragFrom = null;
    };

    Pills.dragDrop = function (etDragTo) {
      var enc = _.clone(Spec.spec.enc),
        etDragFrom = Pills.pills.etDragFrom;
      // update the clone of the enc
      console.log('dragDrop', enc, Pills, 'from:', etDragFrom, Pills.pills[etDragFrom]);
      if(etDragFrom){
        // if pill is dragged from another shelf, not the schemalist
        //
        console.log('pillDragFrom', Pills.pills[etDragFrom]);
        updateFieldDef(enc[etDragFrom], Pills.pills[etDragFrom] || {}, etDragFrom);
      }
      updateFieldDef(enc[etDragTo], Pills.pills[etDragTo] || {}, etDragTo);

      // console.log('Pills.dragDrop',
      //   'from:', etDragFrom, Pills.pills[etDragFrom], enc[etDragFrom],
      //   'to:', etDragTo, Pills.pills[etDragTo], enc[etDragTo]);

      // Finally, update the enc only once to prevent glitches
      Spec.spec.enc = enc;
      etDragFrom = null;
    };

    return Pills;
  });
