'use strict';

angular.module('voyager2')
  // TODO: rename to Query once it's complete independent from Polestar
  .service('Wildcards', function(ANY, vl) {
    var Wildcards = {
      list: [
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
      ]
    };

    return Wildcards;
  });
