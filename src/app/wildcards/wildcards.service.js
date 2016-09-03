'use strict';

angular.module('voyager2')
  // TODO: rename to Query once it's complete independent from Polestar
  .service('Wildcards', function(ANY, vl, cql, Dataset, Alerts) {
    var Wildcards = {
      list: null,
      addItem: addItem,
      addField: addField,
      removeItem: removeItem,
      removeField: removeField
    };

    function reset() {
      Wildcards.list = [
        {
          title: 'Categorical Fields',
          field: '?',
          type: {enum: [vl.type.NOMINAL, vl.type.ORDINAL]},
          immutable: true
        },
        {
          title: 'Temporal Fields',
          field: '?',
          type: vl.type.TEMPORAL,
          immutable: true
        },
        {
          title: 'Quantitative Fields',
          field: '?',
          type: vl.type.QUANTITATIVE,
          immutable: true
        }
      ];
    }
    reset();

    Dataset.onUpdate.push(reset);

    function addItem(fieldDef) {
      var wildcard = {
        title: null,
        field: {enum: []},
        type: {enum: []}
      };
      addField(wildcard, fieldDef, true);

      Wildcards.list.push(wildcard);

      return wildcard;
    }

    function pushIfNotExist(array, item) {
      if (array.indexOf(item) === -1) {
        array.push(item);
      }
    }

    function addField(wildcard, fieldDef, allowMixingType) {
      // Augment type
      // Since our wildcard are always created by addItem() method,
      // it is always an enum spec.
      if (allowMixingType) {
        if (cql.enumSpec.isEnumSpec(fieldDef.type)) {
          fieldDef.type.enum.forEach(function(type) {
            pushIfNotExist(wildcard.type.enum, type);
          });
        } else {
          pushIfNotExist(wildcard.type.enum, fieldDef.type);
        }
      } else {
        if (cql.enumSpec.isEnumSpec(fieldDef.type)) {
          var typeMissing = vl.util.some(fieldDef.type.enum, function(type) {
            return !vl.util.contains(wildcard.type.enum, type);
          });
          if (typeMissing) {
            Alerts.add('Cannot create a wildcard that mixes multiple types');
            return;
          }
        } else {
          if (!vl.util.contains(wildcard.type.enum, fieldDef.type)) {
            Alerts.add('Cannot create a wildcard that mixes multiple types');
            return;
          }
        }
      }

      // Augment aggregate(count) and field
      if (cql.enumSpec.isEnumSpec(fieldDef.field)) {
        if (fieldDef.field.enum) {
          fieldDef.field.enum.forEach(function(field) {
            pushIfNotExist(wildcard.field.enum, field);
          });
        } else { // Preset wildcard
          Dataset.schema.fieldSchemas.forEach(function(fieldSchema) {
            if (wildcard.type.enum ?
                  vl.util.contains(wildcard.type.enum, fieldSchema.type) :
                  fieldSchema.type === wildcard.type
               ) {
              pushIfNotExist(wildcard.field.enum, fieldSchema.field);
            }
          });
        }
      } else if (fieldDef.aggregate === 'count') {
        wildcard.aggregate = {enum: [undefined, 'count']};
        pushIfNotExist(wildcard.field.enum, '*');
      } else { // general fieldDef
        pushIfNotExist(wildcard.field.enum, fieldDef.field);
      }

      return wildcard; // support chaining
    }

    function removeItem(wildcard) {
      var index = Wildcards.list.indexOf(wildcard);
      Wildcards.list.splice(index, 1);
    }

    function removeField(wildcard, index) {
      var removedField = wildcard.field.enum.splice(index, 1);
      if (removedField === '*') {
        delete wildcard.aggregate;
      }
      if (wildcard.field.enum.length === 0) {
        removeItem(wildcard);
      }
    }

    return Wildcards;
  });
