'use strict';

angular.module('voyager2')
  // TODO: rename to Query once it's complete independent from Polestar
  .service('Wildcards', function(ANY, vl) {
    var Wildcards = {
      list: [
        {
          title: 'Any Categorical Field',
          field: '?',
          type: {values: [vl.type.NOMINAL, vl.type.ORDINAL]}
        },
        {
          title: 'Any Temporal Field',
          field: '?',
          type: vl.type.TEMPORAL
        },
        {
          title: 'Any Quantitative Field',
          field: '?',
          type: vl.type.QUANTITATIVE
        }
      ]
    };

    return Wildcards;
  });
