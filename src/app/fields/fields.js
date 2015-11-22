'use strict';

angular.module('voyager')
  .factory('Fields', function(_, Dataset, vl, cp, Logger){

    var Fields = {
      fields: {},
      highlighted: {},
      selected: [],
      selectedKey: null
    };

    function resetField(fieldDef) {
      fieldDef.selected = undefined;
      fieldDef._any = fieldDef.type !== vl.type.ORDINAL && fieldDef.type !== vl.type.NOMINAL && fieldDef.aggregate!=='count';
      delete fieldDef._raw;
      delete fieldDef._aggregate;
      delete fieldDef._timeUnit;
    }

    Fields.updateSchema = function(dataschema) {
      dataschema = dataschema || Dataset.dataschema;

      Fields.fields = _(dataschema).reduce(function(d, fieldDef){
        resetField(fieldDef);
        d[fieldDef.field] = fieldDef;
        return d;
      }, {});
      Fields.highlighted = {};
    };

    Fields.update = function() {
      var list = Fields.getList();
      Fields.selected = list.filter(function(d) { return d.selected; });
      Fields.selectedPKey = cp.gen.projections.key(Fields.selected);

      Logger.logInteraction(Logger.actions.FIELDS_CHANGE, Fields.selectedPKey, {
        selected: Fields.selected,
        list: list
      });

      return list;
    };

    Fields.reset = function() {
      _.each(Fields.fields, resetField);
    };

    Fields.getList = function() {
      var list = _.sortBy(_.values(Fields.fields), function(fieldDef) {
        return Dataset.fieldOrderBy.typeThenName(fieldDef);
      });
      return list;
    };

    Fields.setSelected = function(fieldName, val) {
      (Fields.fields[fieldName] || {}).selected = val;
    };

    Fields.toggleSelected = function(fieldName) {
      var fieldDef = Fields.fields[fieldName] || {};
      fieldDef.selected = fieldDef.selected ? undefined : true;
    };

    Fields.isSelected = function(fieldName) {
      return (Fields.fields[fieldName] || {}).selected;
    };

    Fields.setHighlight = function(fieldName, val) {
      Fields.highlighted[fieldName] = val;
    };

    Dataset.onUpdate.push(Fields.updateSchema);

    return Fields;
  });
