'use strict';

/**
 * @ngdoc service
 * @name polestar.Pills
 * @description
 * # Pills
 * Service in the polestar.
 */
angular.module('polestar')
  .service('Pills', function (vl, Spec, _, $window) {
    var encSchemaProps = vl.schema.schema.properties.enc.properties;

    function instantiate(encType) {
      return vl.schema.util.instantiate(encSchemaProps[encType]);
    }

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
    function updateFieldDef(enc, pill, encType){
      var type = pill.type,
        supportedRole = vl.schema.getSupportedRole(encType),
        dimensionOnly = supportedRole.dimension && !supportedRole.measure;

      // auto cast binning / time binning for dimension only encoding type.
      if (pill.name && dimensionOnly) {
        if (pill.aggr==='count') {
          pill = {};
          $window.alert('COUNT not supported here!');
        } else if (type==='Q' && !pill.bin) {
          pill.aggr = undefined;
          pill.bin = {maxbins: vl.schema.MAXBINS_DEFAULT};
        } else if(type==='T' && !pill.fn) {
          pill.fn = vl.schema.defaultTimeFn;
        }
      } else if (!pill.name) {
        // no name, it's actually the empty shelf that
        // got processed in the opposite direction
        pill = {};
      }

      // filter unsupported properties
      var base = instantiate(encType),
        shelfProps = encSchemaProps[encType].properties;
      // console.log('updateFieldDef', encType, base, '<-', pill);
      for (var prop in shelfProps) {
        if (pill[prop]) {
          if (prop==='value' && pill.name) {
            // only copy value if name is not defined
            // (which should never be the case)
            delete base[prop];
          } else {
            //FXIME In some case this should be merge / recursive merge instead ?
            base[prop] = pill[prop];
          }
        }
      }
      enc[encType] = base;
    }

    Pills.remove = function (encType) {
      delete Pills.pills[encType];
      updateFieldDef(Spec.spec.enc, {}, encType); // remove all pill detail from the fieldDef
    };

    Pills.update = function (encType) {
      updateFieldDef(Spec.spec.enc, Pills.pills[encType], encType);
    };

    Pills.dragStart = function (pill, encType) {
      Pills.pills.dragging = pill;
      Pills.pills.etDragFrom = encType;
    };

    Pills.dragStop = function () {
      delete Pills.pills.dragging;
    };

    Pills.dragDrop = function (etDragTo) {
      var enc = _.clone(Spec.spec.enc),
        etDragFrom = Pills.pills.etDragFrom;
      // update the clone of the enc
      // console.log('dragDrop', enc, Pills, 'from:', etDragFrom, Pills.pills[etDragFrom]);
      if(etDragFrom){
        // if pill is dragged from another shelf, not the schemalist
        //
        // console.log('pillDragFrom', Pills.pills[etDragFrom]);
        updateFieldDef(enc, Pills.pills[etDragFrom] || {}, etDragFrom);
      }
      updateFieldDef(enc, Pills.pills[etDragTo] || {}, etDragTo);

      // console.log('Pills.dragDrop',
      //   'from:', etDragFrom, Pills.pills[etDragFrom], enc[etDragFrom],
      //   'to:', etDragTo, Pills.pills[etDragTo], enc[etDragTo]);

      // Finally, update the enc only once to prevent glitches
      Spec.spec.enc = enc;
      etDragFrom = null;
    };

    return Pills;
  });
