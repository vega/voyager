'use strict';

angular.module('facetedviz')
  .factory('Fields', function(_, Dataset){

    var Fields = {
      fields: {}
    };

    Fields.updateSchema = function(dataschema) {
      Fields.fields = _(dataschema).sortBy(function(field) {
        return Dataset.fieldOrder(field);
      }).reduce(function(d, field){
        d[field.name] = _.merge({selected: false}, field);
        // TODO set _aggr to default value for each type
        return d;
      }, {});
    };

    Fields.deselectAll = function() {
      var fields = _.cloneDeep(Fields.fields);
      _.each(fields, function(field){
        field.selected = false;
      });
      Fields.fields = fields;
    };

    Fields.getList = function() {
      return _.values(Fields.fields);
    };

    Fields.isSelected = function(fieldName) {
      return (Fields.fields[fieldName] || {}).selected;
    };

    // [{"name":"Cost__Total_$","type":"Q","_aggr":"*","_bin":"*"}]
    return Fields;
  });