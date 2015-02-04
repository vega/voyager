'use strict';

angular.module('facetedviz')
  .factory('Fields', function(_){

    var Fields = {
      fields: {}
    };

    Fields.updateSchema = function(dataschema) {
      Fields.fields = _.reduce(dataschema, function(d, field){
        d[field.name] = {
          name: field.name,
          type: field.type,
          selected: false
          // TODO set _aggr to default value for each type
        };
        return d;
      }, {});
    };

    Fields.getList = function() {
      return _.values(Fields.fields);
    };

    Fields.isSelected = function(fieldName) {
      return Fields.fields[fieldName].selected;
    };

    // [{"name":"Cost__Total_$","type":"Q","_aggr":"*","_bin":"*"}]
    return Fields;
  });