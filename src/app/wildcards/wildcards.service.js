'use strict';

angular.module('voyager2')
  // TODO: rename to Query once it's complete independent from Polestar
  .service('Wildcards', function(ANY, vl) {
    var Wildcards = {
      list: [
        {
          title: 'Categorical Fields',
          field: '?',
          type: {values: [vl.type.NOMINAL, vl.type.ORDINAL]}
        },
        {
          title: 'Temporal Fields',
          field: '?',
          type: vl.type.TEMPORAL
        },
        {
          title: 'Quantitative Fields',
          field: '?',
          type: vl.type.QUANTITATIVE
        }
      ]
    };

    return Wildcards;
  });
