!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.vr=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var vr = module.exports = {
  cluster: require('./cluster/cluster'),
  gen: require('./gen/gen'),
  rank: require('./rank/rank'),
  util: require('./util')
};



},{"./cluster/cluster":2,"./gen/gen":9,"./rank/rank":14,"./util":15}],2:[function(require,module,exports){
(function (global){
"use strict";

module.exports = cluster;

var vl = (typeof window !== "undefined" ? window.vl : typeof global !== "undefined" ? global.vl : null),
  clusterfck = (typeof window !== "undefined" ? window.clusterfck : typeof global !== "undefined" ? global.clusterfck : null),
  consts = require('./clusterconsts'),
  util = require('../util');

var distanceTable = cluster.distanceTable = require('./distancetable');


function cluster(encodings, maxDistance) {
  var dist = distanceTable(encodings),
    n = encodings.length;

  var clusterTrees = clusterfck.hcluster(vl.range(n), function(i, j) {
    return dist[i][j];
  }, 'average', consts.CLUSTER_THRESHOLD);

  var clusters = clusterTrees.map(function(tree) {
    return util.traverse(tree, []);
  });

  //console.log("clusters", clusters.map(function(c){ return c.join("+"); }));
  return clusters;
};
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../util":15,"./clusterconsts":3,"./distancetable":4}],3:[function(require,module,exports){
var c = module.exports = {};

c.DIST_BY_ENCTYPE = [
  // positional
  ['x', 'y', 0.2],
  ['row', 'col', 0.2],

  // ordinal mark properties
  ['color', 'shape', 0.2],

  // quantitative mark properties
  ['color', 'alpha', 0.2],
  ['size', 'alpha', 0.2],
  ['size', 'color', 0.2]
].reduce(function(r, x) {
var a = x[0], b = x[1], d = x[2];
  r[a] = r[a] || {};
  r[b] = r[b] || {};
  r[a][b] = r[b][a] = d;
  return r;
}, {});

c.DIST_MISSING = 100;

c.CLUSTER_THRESHOLD = 1;
},{}],4:[function(require,module,exports){
(function (global){
var vl = (typeof window !== "undefined" ? window.vl : typeof global !== "undefined" ? global.vl : null),
  consts = require('./clusterconsts'),
  util = require('../util');

module.exports = distanceTable;

function distanceTable(encodings) {
  var len = encodings.length,
    colencs = encodings.map(function(e) { return colenc(e);}),
    diff = new Array(len), i, j;

  for (i = 0; i < len; i++) diff[i] = new Array(len);

  for (i = 0; i < len; i++) {
    for (j = i + 1; j < len; j++) {
      diff[j][i] = diff[i][j] = getDistance(colencs[i], colencs[j]);
    }
  }
  return diff;
}

function getDistance(colenc1, colenc2) {
  var cols = util.union(vl.keys(colenc1.col), vl.keys(colenc2.col)),
    dist = 0;

  cols.forEach(function(col) {
    var e1 = colenc1.col[col], e2 = colenc2.col[col];

    if (e1 && e2) {
      if (e1.type != e2.type) {
        dist += (consts.DIST_BY_ENCTYPE[e1.type] || {})[e2.type] || 1;
      }
      //FIXME add aggregation
    } else {
      dist += consts.DIST_MISSING;
    }
  });
  return dist;
}

function colenc(encoding) {
  var _colenc = {},
    enc = encoding.enc;

  vl.keys(enc).forEach(function(encType) {
    var e = vl.duplicate(enc[encType]);
    e.type = encType;
    _colenc[e.name || ''] = e;
    delete e.name;
  });

  return {
    marktype: encoding.marktype,
    col: _colenc
  };
}
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../util":15,"./clusterconsts":3}],5:[function(require,module,exports){
var consts = module.exports = {
  gen: {},
  cluster: {},
  rank: {}
};

consts.gen.projections = {
  type: 'object',
  properties: {
    addCountIfNothingIsSelected: {
      type: 'boolean',
      default: true,
      description: 'When no field is selected, add extra count field'
    }
  }
};

consts.gen.aggregates = {
  type: 'object',
  properties: {
    genBin: {
      type: 'boolean',
      default: true,
      description: 'Generate Binning'
    },
    genTypeCasting: {
      type: 'boolean',
      default: true,
      description: 'Include type casting e.g., from Q to O'
    },
    omitMeasureOnly: {
      type: 'boolean',
      default: true,
      description: 'Omit aggregation with measure(s) only'
    },
    omitDimensionOnly: {
      type: 'boolean',
      default: true,
      description: 'Omit aggregation with dimension(s) only'
    },
    aggrList: {
      type: 'array',
      items: {
        type: ['string']
      },
      default: [undefined, 'avg']
    }
  }
};

consts.gen.DEFAULT_OPT = {
  genAggr: true,
  genBin: true,
  genTypeCasting: true,

  aggrList: [undefined, 'avg'], //undefined = no aggregation
  marktypeList: ['point', 'bar', 'line', 'area', 'text'], //filled_map

  // PRUNING RULES FOR ENCODING VARIATIONS

  /**
   * Eliminate all transpose
   * - keeping horizontal dot plot only.
   * - for OxQ charts, always put O on Y
   * - show only one OxO, QxQ (currently sorted by name)
   */
  omitTranpose: false,
  /** remove all dot plot with >1 encoding */
  omitDotPlotWithExtraEncoding: false,

  /** remove all aggregate charts with all dims on facets (row, col) */
  //FIXME this is good for text though!
  omitAggrWithAllDimsOnFacets: false,

  // PRUNING RULES FOR TRANFORMATION VARIATIONS

  /** omit field sets with only dimensions */
  omitDimensionOnly: false,
  /** omit aggregate field sets with only measures */
  omitAggregateWithMeasureOnly: false
};




},{}],6:[function(require,module,exports){
(function (global){
'use strict';

var vl = (typeof window !== "undefined" ? window.vl : typeof global !== "undefined" ? global.vl : null);

var util = require('../util'),
  consts = require('../consts');

module.exports = genAggregates;

function genAggregates(output, fields, opt) {
  opt = vl.schema.util.extend(opt||{}, consts.gen.aggregates);
  var tf = new Array(fields.length);

  function checkAndPush() {
    if (opt.omitMeasureOnly || opt.omitDimensionOnly) {
      var hasMeasure = false, hasDimension = false, hasRaw = false;
      tf.forEach(function(f) {
        if (util.isDim(f)) {
          hasDimension = true;
        } else {
          hasMeasure = true;
          if (!f.aggr) hasRaw = true;
        }
      });
      if (!hasMeasure && opt.omitDimensionOnly) return;
      if (!hasDimension && !hasRaw && opt.omitMeasureOnly) return;
    }

    var fieldSet = vl.duplicate(tf);
    fieldSet.key = vl.field.shorthands(fieldSet);

    output.push(fieldSet);
  }

  function assignQ(i, hasAggr) {
    var f = fields[i],
      canHaveAggr = hasAggr === true || hasAggr === null,
      cantHaveAggr = hasAggr === false || hasAggr === null;

    tf[i] = {name: f.name, type: f.type};

    if (f.aggr) {
      if (canHaveAggr) {
        tf[i].aggr = f.aggr;
        assignField(i + 1, true);
      }
    } else {
      var aggregates = (!f._aggr || f._aggr === '*') ? opt.aggrList : f._aggr;

      for (var j in aggregates) {
        var a = aggregates[j];
        if (a !== undefined) {
          if (canHaveAggr) {
            tf[i].aggr = a;
            assignField(i + 1, true);
          }
        } else { // if(a === undefined)
          if (cantHaveAggr) {
            delete tf[i].aggr;
            assignField(i + 1, false);
          }
        }
      }

      if (opt.genBin) {
        // bin the field instead!
        delete tf[i].aggr;
        tf[i].bin = true;
        tf[i].type = 'Q';
        assignField(i + 1, hasAggr);
      }

      if (opt.genTypeCasting) {
        // we can also change it to dimension (cast type="O")
        delete tf[i].aggr;
        delete tf[i].bin;
        tf[i].type = 'O';
        assignField(i + 1, hasAggr);
      }
    }
  }

  function assignT(i, hasAggr) {
    var f = fields[i];
    tf[i] = {name: f.name, type: f.type};

    if (f.fn) {
      // FIXME deal with assigned function
    } else {
      var fns = (!f._fn || f._fn === '*') ? [undefined, 'month'] : f._fn;

      for (var j in fns) {
        var fn = fns[j];
        if (fn === undefined) {
          assignField(i+1, hasAggr);
        } else {
          tf[i].fn = fn;
          assignField(i+1, hasAggr);
        }
      }
    }
    // FIXME what if you aggregate time?

  }

  function assignField(i, hasAggr) {
    if (i === fields.length) { // If all fields are assigned
      checkAndPush();
      return;
    }

    var f = fields[i];
    // Otherwise, assign i-th field
    switch (f.type) {
      //TODO "D", "G"
      case 'Q':
        assignQ(i, hasAggr);
        break;

      case 'T':
        assignT(i, hasAggr);

      case 'O':
      default:
        tf[i] = f;
        assignField(i + 1, hasAggr);
        break;
    }

  }

  assignField(0, null);

  return output;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../consts":5,"../util":15}],7:[function(require,module,exports){
'use strict';

var genEncs = require('./encs'),
  genMarktypes = require('./marktypes');

module.exports = genEncodings;

function genEncodings(output, fields, stats, opt, cfg, nested) {
  var encs = genEncs([], fields, stats, opt);

  if (nested) {
    return encs.reduce(function(dict, enc) {
      dict[enc] = genMarktypes([], enc, opt, cfg);
      return dict;
    }, {});
  } else {
    return encs.reduce(function(list, enc) {
      return genMarktypes(list, enc, opt, cfg);
    }, []);
  }
}
},{"./encs":8,"./marktypes":10}],8:[function(require,module,exports){
(function (global){
"use strict";

var vl = (typeof window !== "undefined" ? window.vl : typeof global !== "undefined" ? global.vl : null),
  globals = require('../globals'),
  util = require('../util');

module.exports = genEncs;

var rules = {
  x: {
    dataTypes: vl.dataTypes.O + vl.dataTypes.Q + vl.dataTypes.T,
    multiple: true //FIXME should allow multiple only for Q, T
  },
  y: {
    dataTypes: vl.dataTypes.O + vl.dataTypes.Q + vl.dataTypes.T,
    multiple: true //FIXME should allow multiple only for Q, T
  },
  row: {
    dataTypes: vl.dataTypes.O,
    multiple: true,
  },
  col: {
    dataTypes: vl.dataTypes.O,
    multiple: true
  },
  shape: {
    dataTypes: vl.dataTypes.O
  },
  size: {
    dataTypes: vl.dataTypes.Q
  },
  color: {
    dataTypes: vl.dataTypes.O + vl.dataTypes.Q
  },
  alpha: {
    dataTypes: vl.dataTypes.Q
  },
  text: {
    dataTypes: ANY_DATA_TYPES
  }
  //geo: {
  //  dataTypes: [vl.dataTypes.G]
  //},
  //arc: { // pie
  //
  //}
};

function maxCardinality(field, stats) {
  return stats[field].cardinality <= 20;
}

function generalRules(enc, opt) {
  // need at least one basic encoding
  if (enc.x || enc.y || enc.geo || enc.text || enc.arc) {

    if (enc.x && enc.y) {
      // show only one OxO, QxQ
      if (opt.omitTranpose && enc.x.type == enc.y.type) {
        //TODO better criteria than name
        if (enc.x.name > enc.y.name) return false;
      }
    }

    if (enc.row || enc.col) { //have facet(s)
      // don't use facets before filling up x,y
      if ((!enc.x || !enc.y)) return false;

      if (opt.omitAggrWithAllDimsOnFacets) {
        // don't use facet with aggregate plot with other other ordinal on LOD

        var hasAggr = false, hasOtherO = false;
        for (var encType in enc) {
          var field = enc[encType];
          if (field.aggr) {
            hasAggr = true;
          }
          if (util.isDim(field) && (encType !== 'row' && encType !== 'col')) {
            hasOtherO = true;
          }
          if (hasAggr && hasOtherO) break;
        }

        if (hasAggr && !hasOtherO) return false;
      }
    }

    // one dimension "count" is useless
    if (enc.x && enc.x.aggr == 'count' && !enc.y) return false;
    if (enc.y && enc.y.aggr == 'count' && !enc.x) return false;

    return true;
  }
  return false;
}

function genEncs(encs, fields, stats, opt) {
  // generate a collection vegalite's enc
  var tmpEnc = {};

  function assignField(i) {
    // If all fields are assigned, save
    if (i === fields.length) {
      // at the minimal all chart should have x, y, geo, text or arc
      if (generalRules(tmpEnc, opt)) {
        encs.push(vl.duplicate(tmpEnc));
      }
      return;
    }

    // Otherwise, assign i-th field
    var field = fields[i];
    for (var j in vl.encodingTypes) {
      var et = vl.encodingTypes[j];

      //TODO: support "multiple" assignment
      if (!(et in tmpEnc) && // encoding not used
        (rules[et].dataTypes & vl.dataTypes[field.type]) > 0 &&
        (!rules[et].rules || !rules[et].rules(field, stats))
        ) {
        tmpEnc[et] = field;
        assignField(i + 1);
        delete tmpEnc[et];
      }
    }
  }

  assignField(0);

  return encs;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../globals":12,"../util":15}],9:[function(require,module,exports){
(function (global){
var vl = (typeof window !== "undefined" ? window.vl : typeof global !== "undefined" ? global.vl : null),
  util = require('../util');

var gen = module.exports = {
  // data variations
  aggregates: require('./aggregates'),
  projections: require('./projections'),
  // encodings / visual variatons
  encodings: require('./encodings'),
  encs: require('./encs'),
  marktypes: require('./marktypes')
};

//FIXME move these to vl
var AGGREGATION_FN = { //all possible aggregate function listed by each data type
  Q: vl.schema.aggr.supportedEnums.Q
};

var TRANSFORM_FN = { //all possible transform function listed by each data type
  // Q: ['log', 'sqrt', 'abs'], // "logit?"
  T: vl.schema.timefns
};

gen.charts = function(fields, opt, cfg, flat) {
  opt = util.gen.getOpt(opt);
  flat = flat === undefined ? {encodings: 1} : flat;

  // TODO generate

  // generate permutation of encoding mappings
  var fieldSets = opt.genAggr ? gen.aggregates([], fields, opt) : [fields],
    encs, charts, level = 0;

  if (flat === true || (flat && flat.aggr)) {
    encs = fieldSets.reduce(function(output, fields) {
      return gen.encs(output, fields, opt);
    }, []);
  } else {
    encs = fieldSets.map(function(fields) {
      return gen.encs([], fields, opt);
    }, true);
    level += 1;
  }

  if (flat === true || (flat && flat.encodings)) {
    charts = util.nestedReduce(encs, function(output, enc) {
      return gen.marktypes(output, enc, opt, cfg);
    }, level, true);
  } else {
    charts = util.nestedMap(encs, function(enc) {
      return gen.marktypes([], enc, opt, cfg);
    }, level, true);
    level += 1;
  }
  return charts;
};
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../util":15,"./aggregates":6,"./encodings":7,"./encs":8,"./marktypes":10,"./projections":11}],10:[function(require,module,exports){
(function (global){
"use strict";

var vl = (typeof window !== "undefined" ? window.vl : typeof global !== "undefined" ? global.vl : null),
  util = require('../util'),
  rank = require('../rank/rank');

module.exports = function(output, enc, opt, cfg) {
  opt = util.gen.getOpt(opt);
  getSupportedMarkTypes(enc, opt)
    .forEach(function(markType) {
      var encoding = { marktype: markType, enc: enc, cfg: cfg },
        score = rank.encoding(encoding);
      encoding.score = score.score;
      encoding.scoreFeatures = score.features;
      output.push(encoding);
    });
  return output;
};

var marksRule = {
  point:  pointRule,
  bar:    barRule,
  line:   lineRule,
  area:   lineRule, // area is similar to line
  text:   textRule
};

//TODO(kanitw): write test case
function getSupportedMarkTypes(enc, opt) {
  var markTypes = opt.marktypeList.filter(function(markType) {
    var mark = vl.compile.marks[markType],
      reqs = mark.requiredEncoding,
      support = mark.supportedEncoding;

    for (var i in reqs) { // all required encodings in enc
      if (!(reqs[i] in enc)) return false;
    }

    for (var encType in enc) { // all encodings in enc are supported
      if (!support[encType]) return false;
    }

    return !marksRule[markType] || marksRule[markType](enc, opt);
  });

  //console.log('enc:', util.json(enc), " ~ marks:", markTypes);

  return markTypes;
}

function pointRule(enc, opt) {
  if (enc.x && enc.y) {
    // have both x & y ==> scatter plot / bubble plot

    // For OxQ
    if (opt.omitTranpose && util.xOyQ(enc)) {
      // if omitTranpose, put Q on X, O on Y
      return false;
    }

    // For OxO
    if (util.isDim(enc.x) && util.isDim(enc.y)) {
      // shape doesn't work with both x, y as ordinal
      if (enc.shape) {
        return false;
      }

      // TODO(kanitw): check that there is quant at least ...
      if (enc.color && util.isDim(enc.color)) {
        return false;
      }
    }

  } else { // plot with one axis = dot plot
    // Dot plot should always be horizontal
    if (opt.omitTranpose && enc.y) return false;

    // dot plot shouldn't have other encoding
    if (opt.omitDotPlotWithExtraEncoding && vl.keys(enc).length > 1) return false;

    // dot plot with shape is non-sense
    if (enc.shape) return false;
  }
  return true;
}

function barRule(enc, opt) {
  // need to aggregate on either x or y
  if (((enc.x.aggr !== undefined) ^ (enc.y.aggr !== undefined)) &&
      (vl.field.isOrdinalScale(enc.x) ^ vl.field.isOrdinalScale(enc.y))) {

    // if omitTranpose, put Q on X, O on Y
    if (opt.omitTranpose && util.xOyQ(enc)) return false;

    return true;
  }

  return false;
}

function lineRule(enc, opt) {
  // TODO(kanitw): add omitVerticalLine as config

  // Line chart should be only horizontal
  // and use only temporal data
  return enc.x == 'T' && enc.y == 'Q';
}

function textRule(enc, opt) {
  // FIXME should be aggregated
  // at least must have row or col
  return enc.row || enc.col;
}
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../rank/rank":14,"../util":15}],11:[function(require,module,exports){
(function (global){
var util = require('../util'),
  consts = require('../consts'),
  vl = (typeof window !== "undefined" ? window.vl : typeof global !== "undefined" ? global.vl : null);

module.exports = projections;

/**
 * fields
 * @param  {[type]} fields array of fields and query information
 * @return {[type]}        [description]
 */
function projections(fields, opt) {
  opt = vl.schema.util.extend(opt||{}, consts.gen.projections);
  // TODO support other mode of projections generation
  // powerset, chooseK, chooseKorLess are already included in the util
  // Right now just add one more field

  var selected = [], unselected = [], fieldSets = [];

  fields.forEach(function(field){
    if (field.selected) {
      selected.push(field);
    } else {
      unselected.push(field);
    }
  });

  var setsToAdd = util.chooseKorLess(unselected, 1);

  setsToAdd.forEach(function(setToAdd) {
    var fieldSet = selected.concat(setToAdd);
    if (fieldSet.length > 0) {
      if (fieldSet.length === 1 && vl.field.isCount(fieldSet[0])) {
        return;
      }
      // always append projection's key to each projection returned, d3 style.
      fieldSets.push(fieldSet);
    }
  });

  if (opt.addCountIfNothingIsSelected && selected.length===0) {
    var countField = vl.field.count();

    unselected.forEach(function(field) {
      if (!vl.field.isCount(field)) {
        fieldSets.push([field, countField]);
      }
    });
  }

  fieldSets.forEach(function(fieldSet) {
    fieldSet.key = projections.key(fieldSet);
  });

  return fieldSets;
}

projections.key = function(projection) {
  return projection.map(function(field) {
    return vl.field.isCount(field) ? 'count' : field.name;
  }).join(',');
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../consts":5,"../util":15}],12:[function(require,module,exports){
(function (global){
var g = global || window;

g.CHART_TYPES = {
  TABLE: 'TABLE',
  BAR: 'BAR',
  PLOT: 'PLOT',
  LINE: 'LINE',
  AREA: 'AREA',
  MAP: 'MAP',
  HISTOGRAM: 'HISTOGRAM'
};

g.ANY_DATA_TYPES = (1 << 4) - 1;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],13:[function(require,module,exports){
module.exports = rankProjections;

function rankProjections(selectedFields, projection) {

}


},{}],14:[function(require,module,exports){
(function (global){
var vl = (typeof window !== "undefined" ? window.vl : typeof global !== "undefined" ? global.vl : null);

var rank = module.exports = {
  projections: require('./rank-projections')
};

//TODO lower score if we use G as O?
var ENCODING_SCORE = {
  Q: {
    x: 1, // better for single plot
    y: 0.99,
    size: 0.6, //FIXME SIZE for Bar is horrible!
    color: 0.4,
    alpha: 0.4
  },
  O: { // TODO need to take cardinality into account
    x: 0.99, // harder to read axis
    y: 1,
    row: 0.7,
    col: 0.7,
    color: 0.8,
    shape: 0.6
  },
  T: { // FIX rethink this
    x: 1,
    y: 0.8,
    row: 0.4,
    col: 0.4,
    color: 0.3,
    shape: 0.3
  }
};

// bad score not specified in the table above
var BAD_ENCODING_SCORE = 0.01,
  UNUSED_POSITION = 0.5;

var MARK_SCORE = {
  line: 0.99,
  area: 0.98,
  bar: 0.97,
  point: 0.96,
  circle: 0.95,
  square: 0.95,
  text: 0.8
};

rank.encoding = function(encoding) {
  var features = {},
    encTypes = vl.keys(encoding.enc);
  encTypes.forEach(function(encType) {
    var field = encoding.enc[encType];
    features[field.name] = {
      value: field.type + ':'+ encType,
      score: ENCODING_SCORE[field.type][encType] || BAD_ENCODING_SCORE
    };
  });

  // penalize not using positional
  if (encTypes.length > 1) {
    if ((!encoding.enc.x || !encoding.enc.y) && !encoding.enc.geo) {
      features.unusedPosition = {score: UNUSED_POSITION};
    }
  }

  features.markType = {
    value: encoding.marktype,
    score: MARK_SCORE[encoding.marktype]
  };

  return {
    score: vl.keys(features).reduce(function(p, s) {
      return p * features[s].score;
    }, 1),
    features: features
  };
};


// raw > avg, sum > min,max > bin

rank.fieldsScore = function(fields) {

};


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./rank-projections":13}],15:[function(require,module,exports){
"use strict";

var consts = require('./consts');

var util = module.exports = {
  gen: {}
};

var isDim = util.isDim = function (field) {
  return field.bin || field.type === 'O';
};

util.xOyQ = function xOyQ (enc) {
  return enc.x && enc.y && isDim(enc.x) && isDim(enc.y);
};

util.isArray = Array.isArray || function (obj) {
  return {}.toString.call(obj) == '[object Array]';
};

util.json = function(s, sp) {
  return JSON.stringify(s, null, sp);
};

util.keys = function(obj) {
  var k = [], x;
  for (x in obj) k.push(x);
  return k;
};

util.nestedMap = function (col, f, level, filter) {
  return level === 0 ?
    col.map(f) :
    col.map(function(v) {
      var r = util.nestedMap(v, f, level - 1);
      return filter ? r.filter(util.nonEmpty) : r;
    });
};

util.nestedReduce = function (col, f, level, filter) {
  return level === 0 ?
    col.reduce(f, []) :
    col.map(function(v) {
      var r = util.nestedReduce(v, f, level - 1);
      return filter ? r.filter(util.nonEmpty) : r;
    });
};

util.nonEmpty = function(grp) {
  return !util.isArray(grp) || grp.length > 0;
};


util.traverse = function (node, arr) {
  if (node.value !== undefined) {
    arr.push(node.value);
  } else {
    if (node.left) util.traverse(node.left, arr);
    if (node.right) util.traverse(node.right, arr);
  }
  return arr;
};

util.union = function (a, b) {
  var o = {};
  a.forEach(function(x) { o[x] = true;});
  b.forEach(function(x) { o[x] = true;});
  return util.keys(o);
};


util.gen.getOpt = function (opt) {
  //merge with default
  return (opt ? util.keys(opt) : []).reduce(function(c, k) {
    c[k] = opt[k];
    return c;
  }, Object.create(consts.gen.DEFAULT_OPT));
};

/**
 * powerset code from http://rosettacode.org/wiki/Power_Set#JavaScript
 *
 *   var res = powerset([1,2,3,4]);
 *
 * returns
 *
 * [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3],[4],[1,4],
 * [2,4],[1,2,4],[3,4],[1,3,4],[2,3,4],[1,2,3,4]]
[edit]
*/

util.powerset = function(list) {
  var ps = [
    []
  ];
  for (var i = 0; i < list.length; i++) {
    for (var j = 0, len = ps.length; j < len; j++) {
      ps.push(ps[j].concat(list[i]));
    }
  }
  return ps;
};

util.chooseKorLess = function(list, k) {
  var subset = [[]];
  for (var i = 0; i < list.length; i++) {
    for (var j = 0, len = subset.length; j < len; j++) {
      var sub = subset[j].concat(list[i]);
      if(sub.length <= k){
        subset.push(sub);
      }
    }
  }
  return subset;
};

util.chooseK = function(list, k) {
  var subset = [[]];
  var kArray =[];
  for (var i = 0; i < list.length; i++) {
    for (var j = 0, len = subset.length; j < len; j++) {
      var sub = subset[j].concat(list[i]);
      if(sub.length < k){
        subset.push(sub);
      }else if (sub.length === k){
        kArray.push(sub);
      }
    }
  }
  return kArray;
};

util.cross = function(a,b){
  var x = [];
  for(var i=0; i< a.length; i++){
    for(var j=0;j< b.length; j++){
      x.push(a[i].concat(b[j]));
    }
  }
  return x;
};


},{"./consts":5}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvdnIiLCJzcmMvY2x1c3Rlci9jbHVzdGVyLmpzIiwic3JjL2NsdXN0ZXIvY2x1c3RlcmNvbnN0cy5qcyIsInNyYy9jbHVzdGVyL2Rpc3RhbmNldGFibGUuanMiLCJzcmMvY29uc3RzLmpzIiwic3JjL2dlbi9hZ2dyZWdhdGVzLmpzIiwic3JjL2dlbi9lbmNvZGluZ3MuanMiLCJzcmMvZ2VuL2VuY3MuanMiLCJzcmMvZ2VuL2dlbi5qcyIsInNyYy9nZW4vbWFya3R5cGVzLmpzIiwic3JjL2dlbi9wcm9qZWN0aW9ucy5qcyIsInNyYy9nbG9iYWxzLmpzIiwic3JjL3JhbmsvcmFuay1wcm9qZWN0aW9ucy5qcyIsInNyYy9yYW5rL3JhbmsuanMiLCJzcmMvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNuSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNoSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIHZyID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNsdXN0ZXI6IHJlcXVpcmUoJy4vY2x1c3Rlci9jbHVzdGVyJyksXG4gIGdlbjogcmVxdWlyZSgnLi9nZW4vZ2VuJyksXG4gIHJhbms6IHJlcXVpcmUoJy4vcmFuay9yYW5rJyksXG4gIHV0aWw6IHJlcXVpcmUoJy4vdXRpbCcpXG59O1xuXG5cbiIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsdXN0ZXI7XG5cbnZhciB2bCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LnZsIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC52bCA6IG51bGwpLFxuICBjbHVzdGVyZmNrID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuY2x1c3RlcmZjayA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuY2x1c3RlcmZjayA6IG51bGwpLFxuICBjb25zdHMgPSByZXF1aXJlKCcuL2NsdXN0ZXJjb25zdHMnKSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcblxudmFyIGRpc3RhbmNlVGFibGUgPSBjbHVzdGVyLmRpc3RhbmNlVGFibGUgPSByZXF1aXJlKCcuL2Rpc3RhbmNldGFibGUnKTtcblxuXG5mdW5jdGlvbiBjbHVzdGVyKGVuY29kaW5ncywgbWF4RGlzdGFuY2UpIHtcbiAgdmFyIGRpc3QgPSBkaXN0YW5jZVRhYmxlKGVuY29kaW5ncyksXG4gICAgbiA9IGVuY29kaW5ncy5sZW5ndGg7XG5cbiAgdmFyIGNsdXN0ZXJUcmVlcyA9IGNsdXN0ZXJmY2suaGNsdXN0ZXIodmwucmFuZ2UobiksIGZ1bmN0aW9uKGksIGopIHtcbiAgICByZXR1cm4gZGlzdFtpXVtqXTtcbiAgfSwgJ2F2ZXJhZ2UnLCBjb25zdHMuQ0xVU1RFUl9USFJFU0hPTEQpO1xuXG4gIHZhciBjbHVzdGVycyA9IGNsdXN0ZXJUcmVlcy5tYXAoZnVuY3Rpb24odHJlZSkge1xuICAgIHJldHVybiB1dGlsLnRyYXZlcnNlKHRyZWUsIFtdKTtcbiAgfSk7XG5cbiAgLy9jb25zb2xlLmxvZyhcImNsdXN0ZXJzXCIsIGNsdXN0ZXJzLm1hcChmdW5jdGlvbihjKXsgcmV0dXJuIGMuam9pbihcIitcIik7IH0pKTtcbiAgcmV0dXJuIGNsdXN0ZXJzO1xufTsiLCJ2YXIgYyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbmMuRElTVF9CWV9FTkNUWVBFID0gW1xuICAvLyBwb3NpdGlvbmFsXG4gIFsneCcsICd5JywgMC4yXSxcbiAgWydyb3cnLCAnY29sJywgMC4yXSxcblxuICAvLyBvcmRpbmFsIG1hcmsgcHJvcGVydGllc1xuICBbJ2NvbG9yJywgJ3NoYXBlJywgMC4yXSxcblxuICAvLyBxdWFudGl0YXRpdmUgbWFyayBwcm9wZXJ0aWVzXG4gIFsnY29sb3InLCAnYWxwaGEnLCAwLjJdLFxuICBbJ3NpemUnLCAnYWxwaGEnLCAwLjJdLFxuICBbJ3NpemUnLCAnY29sb3InLCAwLjJdXG5dLnJlZHVjZShmdW5jdGlvbihyLCB4KSB7XG52YXIgYSA9IHhbMF0sIGIgPSB4WzFdLCBkID0geFsyXTtcbiAgclthXSA9IHJbYV0gfHwge307XG4gIHJbYl0gPSByW2JdIHx8IHt9O1xuICByW2FdW2JdID0gcltiXVthXSA9IGQ7XG4gIHJldHVybiByO1xufSwge30pO1xuXG5jLkRJU1RfTUlTU0lORyA9IDEwMDtcblxuYy5DTFVTVEVSX1RIUkVTSE9MRCA9IDE7IiwidmFyIHZsID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cudmwgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLnZsIDogbnVsbCksXG4gIGNvbnN0cyA9IHJlcXVpcmUoJy4vY2x1c3RlcmNvbnN0cycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRpc3RhbmNlVGFibGU7XG5cbmZ1bmN0aW9uIGRpc3RhbmNlVGFibGUoZW5jb2RpbmdzKSB7XG4gIHZhciBsZW4gPSBlbmNvZGluZ3MubGVuZ3RoLFxuICAgIGNvbGVuY3MgPSBlbmNvZGluZ3MubWFwKGZ1bmN0aW9uKGUpIHsgcmV0dXJuIGNvbGVuYyhlKTt9KSxcbiAgICBkaWZmID0gbmV3IEFycmF5KGxlbiksIGksIGo7XG5cbiAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSBkaWZmW2ldID0gbmV3IEFycmF5KGxlbik7XG5cbiAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgZm9yIChqID0gaSArIDE7IGogPCBsZW47IGorKykge1xuICAgICAgZGlmZltqXVtpXSA9IGRpZmZbaV1bal0gPSBnZXREaXN0YW5jZShjb2xlbmNzW2ldLCBjb2xlbmNzW2pdKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRpZmY7XG59XG5cbmZ1bmN0aW9uIGdldERpc3RhbmNlKGNvbGVuYzEsIGNvbGVuYzIpIHtcbiAgdmFyIGNvbHMgPSB1dGlsLnVuaW9uKHZsLmtleXMoY29sZW5jMS5jb2wpLCB2bC5rZXlzKGNvbGVuYzIuY29sKSksXG4gICAgZGlzdCA9IDA7XG5cbiAgY29scy5mb3JFYWNoKGZ1bmN0aW9uKGNvbCkge1xuICAgIHZhciBlMSA9IGNvbGVuYzEuY29sW2NvbF0sIGUyID0gY29sZW5jMi5jb2xbY29sXTtcblxuICAgIGlmIChlMSAmJiBlMikge1xuICAgICAgaWYgKGUxLnR5cGUgIT0gZTIudHlwZSkge1xuICAgICAgICBkaXN0ICs9IChjb25zdHMuRElTVF9CWV9FTkNUWVBFW2UxLnR5cGVdIHx8IHt9KVtlMi50eXBlXSB8fCAxO1xuICAgICAgfVxuICAgICAgLy9GSVhNRSBhZGQgYWdncmVnYXRpb25cbiAgICB9IGVsc2Uge1xuICAgICAgZGlzdCArPSBjb25zdHMuRElTVF9NSVNTSU5HO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBkaXN0O1xufVxuXG5mdW5jdGlvbiBjb2xlbmMoZW5jb2RpbmcpIHtcbiAgdmFyIF9jb2xlbmMgPSB7fSxcbiAgICBlbmMgPSBlbmNvZGluZy5lbmM7XG5cbiAgdmwua2V5cyhlbmMpLmZvckVhY2goZnVuY3Rpb24oZW5jVHlwZSkge1xuICAgIHZhciBlID0gdmwuZHVwbGljYXRlKGVuY1tlbmNUeXBlXSk7XG4gICAgZS50eXBlID0gZW5jVHlwZTtcbiAgICBfY29sZW5jW2UubmFtZSB8fCAnJ10gPSBlO1xuICAgIGRlbGV0ZSBlLm5hbWU7XG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgbWFya3R5cGU6IGVuY29kaW5nLm1hcmt0eXBlLFxuICAgIGNvbDogX2NvbGVuY1xuICB9O1xufSIsInZhciBjb25zdHMgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2VuOiB7fSxcbiAgY2x1c3Rlcjoge30sXG4gIHJhbms6IHt9XG59O1xuXG5jb25zdHMuZ2VuLnByb2plY3Rpb25zID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgcHJvcGVydGllczoge1xuICAgIGFkZENvdW50SWZOb3RoaW5nSXNTZWxlY3RlZDoge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnV2hlbiBubyBmaWVsZCBpcyBzZWxlY3RlZCwgYWRkIGV4dHJhIGNvdW50IGZpZWxkJ1xuICAgIH1cbiAgfVxufTtcblxuY29uc3RzLmdlbi5hZ2dyZWdhdGVzID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgcHJvcGVydGllczoge1xuICAgIGdlbkJpbjoge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnR2VuZXJhdGUgQmlubmluZydcbiAgICB9LFxuICAgIGdlblR5cGVDYXN0aW5nOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgZGVzY3JpcHRpb246ICdJbmNsdWRlIHR5cGUgY2FzdGluZyBlLmcuLCBmcm9tIFEgdG8gTydcbiAgICB9LFxuICAgIG9taXRNZWFzdXJlT25seToge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnT21pdCBhZ2dyZWdhdGlvbiB3aXRoIG1lYXN1cmUocykgb25seSdcbiAgICB9LFxuICAgIG9taXREaW1lbnNpb25Pbmx5OiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgZGVzY3JpcHRpb246ICdPbWl0IGFnZ3JlZ2F0aW9uIHdpdGggZGltZW5zaW9uKHMpIG9ubHknXG4gICAgfSxcbiAgICBhZ2dyTGlzdDoge1xuICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgIGl0ZW1zOiB7XG4gICAgICAgIHR5cGU6IFsnc3RyaW5nJ11cbiAgICAgIH0sXG4gICAgICBkZWZhdWx0OiBbdW5kZWZpbmVkLCAnYXZnJ11cbiAgICB9XG4gIH1cbn07XG5cbmNvbnN0cy5nZW4uREVGQVVMVF9PUFQgPSB7XG4gIGdlbkFnZ3I6IHRydWUsXG4gIGdlbkJpbjogdHJ1ZSxcbiAgZ2VuVHlwZUNhc3Rpbmc6IHRydWUsXG5cbiAgYWdnckxpc3Q6IFt1bmRlZmluZWQsICdhdmcnXSwgLy91bmRlZmluZWQgPSBubyBhZ2dyZWdhdGlvblxuICBtYXJrdHlwZUxpc3Q6IFsncG9pbnQnLCAnYmFyJywgJ2xpbmUnLCAnYXJlYScsICd0ZXh0J10sIC8vZmlsbGVkX21hcFxuXG4gIC8vIFBSVU5JTkcgUlVMRVMgRk9SIEVOQ09ESU5HIFZBUklBVElPTlNcblxuICAvKipcbiAgICogRWxpbWluYXRlIGFsbCB0cmFuc3Bvc2VcbiAgICogLSBrZWVwaW5nIGhvcml6b250YWwgZG90IHBsb3Qgb25seS5cbiAgICogLSBmb3IgT3hRIGNoYXJ0cywgYWx3YXlzIHB1dCBPIG9uIFlcbiAgICogLSBzaG93IG9ubHkgb25lIE94TywgUXhRIChjdXJyZW50bHkgc29ydGVkIGJ5IG5hbWUpXG4gICAqL1xuICBvbWl0VHJhbnBvc2U6IGZhbHNlLFxuICAvKiogcmVtb3ZlIGFsbCBkb3QgcGxvdCB3aXRoID4xIGVuY29kaW5nICovXG4gIG9taXREb3RQbG90V2l0aEV4dHJhRW5jb2Rpbmc6IGZhbHNlLFxuXG4gIC8qKiByZW1vdmUgYWxsIGFnZ3JlZ2F0ZSBjaGFydHMgd2l0aCBhbGwgZGltcyBvbiBmYWNldHMgKHJvdywgY29sKSAqL1xuICAvL0ZJWE1FIHRoaXMgaXMgZ29vZCBmb3IgdGV4dCB0aG91Z2ghXG4gIG9taXRBZ2dyV2l0aEFsbERpbXNPbkZhY2V0czogZmFsc2UsXG5cbiAgLy8gUFJVTklORyBSVUxFUyBGT1IgVFJBTkZPUk1BVElPTiBWQVJJQVRJT05TXG5cbiAgLyoqIG9taXQgZmllbGQgc2V0cyB3aXRoIG9ubHkgZGltZW5zaW9ucyAqL1xuICBvbWl0RGltZW5zaW9uT25seTogZmFsc2UsXG4gIC8qKiBvbWl0IGFnZ3JlZ2F0ZSBmaWVsZCBzZXRzIHdpdGggb25seSBtZWFzdXJlcyAqL1xuICBvbWl0QWdncmVnYXRlV2l0aE1lYXN1cmVPbmx5OiBmYWxzZVxufTtcblxuXG5cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHZsID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cudmwgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLnZsIDogbnVsbCk7XG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpLFxuICBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBnZW5BZ2dyZWdhdGVzO1xuXG5mdW5jdGlvbiBnZW5BZ2dyZWdhdGVzKG91dHB1dCwgZmllbGRzLCBvcHQpIHtcbiAgb3B0ID0gdmwuc2NoZW1hLnV0aWwuZXh0ZW5kKG9wdHx8e30sIGNvbnN0cy5nZW4uYWdncmVnYXRlcyk7XG4gIHZhciB0ZiA9IG5ldyBBcnJheShmaWVsZHMubGVuZ3RoKTtcblxuICBmdW5jdGlvbiBjaGVja0FuZFB1c2goKSB7XG4gICAgaWYgKG9wdC5vbWl0TWVhc3VyZU9ubHkgfHwgb3B0Lm9taXREaW1lbnNpb25Pbmx5KSB7XG4gICAgICB2YXIgaGFzTWVhc3VyZSA9IGZhbHNlLCBoYXNEaW1lbnNpb24gPSBmYWxzZSwgaGFzUmF3ID0gZmFsc2U7XG4gICAgICB0Zi5mb3JFYWNoKGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgaWYgKHV0aWwuaXNEaW0oZikpIHtcbiAgICAgICAgICBoYXNEaW1lbnNpb24gPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGhhc01lYXN1cmUgPSB0cnVlO1xuICAgICAgICAgIGlmICghZi5hZ2dyKSBoYXNSYXcgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmICghaGFzTWVhc3VyZSAmJiBvcHQub21pdERpbWVuc2lvbk9ubHkpIHJldHVybjtcbiAgICAgIGlmICghaGFzRGltZW5zaW9uICYmICFoYXNSYXcgJiYgb3B0Lm9taXRNZWFzdXJlT25seSkgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBmaWVsZFNldCA9IHZsLmR1cGxpY2F0ZSh0Zik7XG4gICAgZmllbGRTZXQua2V5ID0gdmwuZmllbGQuc2hvcnRoYW5kcyhmaWVsZFNldCk7XG5cbiAgICBvdXRwdXQucHVzaChmaWVsZFNldCk7XG4gIH1cblxuICBmdW5jdGlvbiBhc3NpZ25RKGksIGhhc0FnZ3IpIHtcbiAgICB2YXIgZiA9IGZpZWxkc1tpXSxcbiAgICAgIGNhbkhhdmVBZ2dyID0gaGFzQWdnciA9PT0gdHJ1ZSB8fCBoYXNBZ2dyID09PSBudWxsLFxuICAgICAgY2FudEhhdmVBZ2dyID0gaGFzQWdnciA9PT0gZmFsc2UgfHwgaGFzQWdnciA9PT0gbnVsbDtcblxuICAgIHRmW2ldID0ge25hbWU6IGYubmFtZSwgdHlwZTogZi50eXBlfTtcblxuICAgIGlmIChmLmFnZ3IpIHtcbiAgICAgIGlmIChjYW5IYXZlQWdncikge1xuICAgICAgICB0ZltpXS5hZ2dyID0gZi5hZ2dyO1xuICAgICAgICBhc3NpZ25GaWVsZChpICsgMSwgdHJ1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBhZ2dyZWdhdGVzID0gKCFmLl9hZ2dyIHx8IGYuX2FnZ3IgPT09ICcqJykgPyBvcHQuYWdnckxpc3QgOiBmLl9hZ2dyO1xuXG4gICAgICBmb3IgKHZhciBqIGluIGFnZ3JlZ2F0ZXMpIHtcbiAgICAgICAgdmFyIGEgPSBhZ2dyZWdhdGVzW2pdO1xuICAgICAgICBpZiAoYSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgaWYgKGNhbkhhdmVBZ2dyKSB7XG4gICAgICAgICAgICB0ZltpXS5hZ2dyID0gYTtcbiAgICAgICAgICAgIGFzc2lnbkZpZWxkKGkgKyAxLCB0cnVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7IC8vIGlmKGEgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICBpZiAoY2FudEhhdmVBZ2dyKSB7XG4gICAgICAgICAgICBkZWxldGUgdGZbaV0uYWdncjtcbiAgICAgICAgICAgIGFzc2lnbkZpZWxkKGkgKyAxLCBmYWxzZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHQuZ2VuQmluKSB7XG4gICAgICAgIC8vIGJpbiB0aGUgZmllbGQgaW5zdGVhZCFcbiAgICAgICAgZGVsZXRlIHRmW2ldLmFnZ3I7XG4gICAgICAgIHRmW2ldLmJpbiA9IHRydWU7XG4gICAgICAgIHRmW2ldLnR5cGUgPSAnUSc7XG4gICAgICAgIGFzc2lnbkZpZWxkKGkgKyAxLCBoYXNBZ2dyKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdC5nZW5UeXBlQ2FzdGluZykge1xuICAgICAgICAvLyB3ZSBjYW4gYWxzbyBjaGFuZ2UgaXQgdG8gZGltZW5zaW9uIChjYXN0IHR5cGU9XCJPXCIpXG4gICAgICAgIGRlbGV0ZSB0ZltpXS5hZ2dyO1xuICAgICAgICBkZWxldGUgdGZbaV0uYmluO1xuICAgICAgICB0ZltpXS50eXBlID0gJ08nO1xuICAgICAgICBhc3NpZ25GaWVsZChpICsgMSwgaGFzQWdncik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gYXNzaWduVChpLCBoYXNBZ2dyKSB7XG4gICAgdmFyIGYgPSBmaWVsZHNbaV07XG4gICAgdGZbaV0gPSB7bmFtZTogZi5uYW1lLCB0eXBlOiBmLnR5cGV9O1xuXG4gICAgaWYgKGYuZm4pIHtcbiAgICAgIC8vIEZJWE1FIGRlYWwgd2l0aCBhc3NpZ25lZCBmdW5jdGlvblxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZm5zID0gKCFmLl9mbiB8fCBmLl9mbiA9PT0gJyonKSA/IFt1bmRlZmluZWQsICdtb250aCddIDogZi5fZm47XG5cbiAgICAgIGZvciAodmFyIGogaW4gZm5zKSB7XG4gICAgICAgIHZhciBmbiA9IGZuc1tqXTtcbiAgICAgICAgaWYgKGZuID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBhc3NpZ25GaWVsZChpKzEsIGhhc0FnZ3IpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRmW2ldLmZuID0gZm47XG4gICAgICAgICAgYXNzaWduRmllbGQoaSsxLCBoYXNBZ2dyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICAvLyBGSVhNRSB3aGF0IGlmIHlvdSBhZ2dyZWdhdGUgdGltZT9cblxuICB9XG5cbiAgZnVuY3Rpb24gYXNzaWduRmllbGQoaSwgaGFzQWdncikge1xuICAgIGlmIChpID09PSBmaWVsZHMubGVuZ3RoKSB7IC8vIElmIGFsbCBmaWVsZHMgYXJlIGFzc2lnbmVkXG4gICAgICBjaGVja0FuZFB1c2goKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgZiA9IGZpZWxkc1tpXTtcbiAgICAvLyBPdGhlcndpc2UsIGFzc2lnbiBpLXRoIGZpZWxkXG4gICAgc3dpdGNoIChmLnR5cGUpIHtcbiAgICAgIC8vVE9ETyBcIkRcIiwgXCJHXCJcbiAgICAgIGNhc2UgJ1EnOlxuICAgICAgICBhc3NpZ25RKGksIGhhc0FnZ3IpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnVCc6XG4gICAgICAgIGFzc2lnblQoaSwgaGFzQWdncik7XG5cbiAgICAgIGNhc2UgJ08nOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGZbaV0gPSBmO1xuICAgICAgICBhc3NpZ25GaWVsZChpICsgMSwgaGFzQWdncik7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICB9XG5cbiAgYXNzaWduRmllbGQoMCwgbnVsbCk7XG5cbiAgcmV0dXJuIG91dHB1dDtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdlbkVuY3MgPSByZXF1aXJlKCcuL2VuY3MnKSxcbiAgZ2VuTWFya3R5cGVzID0gcmVxdWlyZSgnLi9tYXJrdHlwZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBnZW5FbmNvZGluZ3M7XG5cbmZ1bmN0aW9uIGdlbkVuY29kaW5ncyhvdXRwdXQsIGZpZWxkcywgc3RhdHMsIG9wdCwgY2ZnLCBuZXN0ZWQpIHtcbiAgdmFyIGVuY3MgPSBnZW5FbmNzKFtdLCBmaWVsZHMsIHN0YXRzLCBvcHQpO1xuXG4gIGlmIChuZXN0ZWQpIHtcbiAgICByZXR1cm4gZW5jcy5yZWR1Y2UoZnVuY3Rpb24oZGljdCwgZW5jKSB7XG4gICAgICBkaWN0W2VuY10gPSBnZW5NYXJrdHlwZXMoW10sIGVuYywgb3B0LCBjZmcpO1xuICAgICAgcmV0dXJuIGRpY3Q7XG4gICAgfSwge30pO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBlbmNzLnJlZHVjZShmdW5jdGlvbihsaXN0LCBlbmMpIHtcbiAgICAgIHJldHVybiBnZW5NYXJrdHlwZXMobGlzdCwgZW5jLCBvcHQsIGNmZyk7XG4gICAgfSwgW10pO1xuICB9XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciB2bCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LnZsIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC52bCA6IG51bGwpLFxuICBnbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdlbkVuY3M7XG5cbnZhciBydWxlcyA9IHtcbiAgeDoge1xuICAgIGRhdGFUeXBlczogdmwuZGF0YVR5cGVzLk8gKyB2bC5kYXRhVHlwZXMuUSArIHZsLmRhdGFUeXBlcy5ULFxuICAgIG11bHRpcGxlOiB0cnVlIC8vRklYTUUgc2hvdWxkIGFsbG93IG11bHRpcGxlIG9ubHkgZm9yIFEsIFRcbiAgfSxcbiAgeToge1xuICAgIGRhdGFUeXBlczogdmwuZGF0YVR5cGVzLk8gKyB2bC5kYXRhVHlwZXMuUSArIHZsLmRhdGFUeXBlcy5ULFxuICAgIG11bHRpcGxlOiB0cnVlIC8vRklYTUUgc2hvdWxkIGFsbG93IG11bHRpcGxlIG9ubHkgZm9yIFEsIFRcbiAgfSxcbiAgcm93OiB7XG4gICAgZGF0YVR5cGVzOiB2bC5kYXRhVHlwZXMuTyxcbiAgICBtdWx0aXBsZTogdHJ1ZSxcbiAgfSxcbiAgY29sOiB7XG4gICAgZGF0YVR5cGVzOiB2bC5kYXRhVHlwZXMuTyxcbiAgICBtdWx0aXBsZTogdHJ1ZVxuICB9LFxuICBzaGFwZToge1xuICAgIGRhdGFUeXBlczogdmwuZGF0YVR5cGVzLk9cbiAgfSxcbiAgc2l6ZToge1xuICAgIGRhdGFUeXBlczogdmwuZGF0YVR5cGVzLlFcbiAgfSxcbiAgY29sb3I6IHtcbiAgICBkYXRhVHlwZXM6IHZsLmRhdGFUeXBlcy5PICsgdmwuZGF0YVR5cGVzLlFcbiAgfSxcbiAgYWxwaGE6IHtcbiAgICBkYXRhVHlwZXM6IHZsLmRhdGFUeXBlcy5RXG4gIH0sXG4gIHRleHQ6IHtcbiAgICBkYXRhVHlwZXM6IEFOWV9EQVRBX1RZUEVTXG4gIH1cbiAgLy9nZW86IHtcbiAgLy8gIGRhdGFUeXBlczogW3ZsLmRhdGFUeXBlcy5HXVxuICAvL30sXG4gIC8vYXJjOiB7IC8vIHBpZVxuICAvL1xuICAvL31cbn07XG5cbmZ1bmN0aW9uIG1heENhcmRpbmFsaXR5KGZpZWxkLCBzdGF0cykge1xuICByZXR1cm4gc3RhdHNbZmllbGRdLmNhcmRpbmFsaXR5IDw9IDIwO1xufVxuXG5mdW5jdGlvbiBnZW5lcmFsUnVsZXMoZW5jLCBvcHQpIHtcbiAgLy8gbmVlZCBhdCBsZWFzdCBvbmUgYmFzaWMgZW5jb2RpbmdcbiAgaWYgKGVuYy54IHx8IGVuYy55IHx8IGVuYy5nZW8gfHwgZW5jLnRleHQgfHwgZW5jLmFyYykge1xuXG4gICAgaWYgKGVuYy54ICYmIGVuYy55KSB7XG4gICAgICAvLyBzaG93IG9ubHkgb25lIE94TywgUXhRXG4gICAgICBpZiAob3B0Lm9taXRUcmFucG9zZSAmJiBlbmMueC50eXBlID09IGVuYy55LnR5cGUpIHtcbiAgICAgICAgLy9UT0RPIGJldHRlciBjcml0ZXJpYSB0aGFuIG5hbWVcbiAgICAgICAgaWYgKGVuYy54Lm5hbWUgPiBlbmMueS5uYW1lKSByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGVuYy5yb3cgfHwgZW5jLmNvbCkgeyAvL2hhdmUgZmFjZXQocylcbiAgICAgIC8vIGRvbid0IHVzZSBmYWNldHMgYmVmb3JlIGZpbGxpbmcgdXAgeCx5XG4gICAgICBpZiAoKCFlbmMueCB8fCAhZW5jLnkpKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIGlmIChvcHQub21pdEFnZ3JXaXRoQWxsRGltc09uRmFjZXRzKSB7XG4gICAgICAgIC8vIGRvbid0IHVzZSBmYWNldCB3aXRoIGFnZ3JlZ2F0ZSBwbG90IHdpdGggb3RoZXIgb3RoZXIgb3JkaW5hbCBvbiBMT0RcblxuICAgICAgICB2YXIgaGFzQWdnciA9IGZhbHNlLCBoYXNPdGhlck8gPSBmYWxzZTtcbiAgICAgICAgZm9yICh2YXIgZW5jVHlwZSBpbiBlbmMpIHtcbiAgICAgICAgICB2YXIgZmllbGQgPSBlbmNbZW5jVHlwZV07XG4gICAgICAgICAgaWYgKGZpZWxkLmFnZ3IpIHtcbiAgICAgICAgICAgIGhhc0FnZ3IgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodXRpbC5pc0RpbShmaWVsZCkgJiYgKGVuY1R5cGUgIT09ICdyb3cnICYmIGVuY1R5cGUgIT09ICdjb2wnKSkge1xuICAgICAgICAgICAgaGFzT3RoZXJPID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGhhc0FnZ3IgJiYgaGFzT3RoZXJPKSBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChoYXNBZ2dyICYmICFoYXNPdGhlck8pIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBvbmUgZGltZW5zaW9uIFwiY291bnRcIiBpcyB1c2VsZXNzXG4gICAgaWYgKGVuYy54ICYmIGVuYy54LmFnZ3IgPT0gJ2NvdW50JyAmJiAhZW5jLnkpIHJldHVybiBmYWxzZTtcbiAgICBpZiAoZW5jLnkgJiYgZW5jLnkuYWdnciA9PSAnY291bnQnICYmICFlbmMueCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBnZW5FbmNzKGVuY3MsIGZpZWxkcywgc3RhdHMsIG9wdCkge1xuICAvLyBnZW5lcmF0ZSBhIGNvbGxlY3Rpb24gdmVnYWxpdGUncyBlbmNcbiAgdmFyIHRtcEVuYyA9IHt9O1xuXG4gIGZ1bmN0aW9uIGFzc2lnbkZpZWxkKGkpIHtcbiAgICAvLyBJZiBhbGwgZmllbGRzIGFyZSBhc3NpZ25lZCwgc2F2ZVxuICAgIGlmIChpID09PSBmaWVsZHMubGVuZ3RoKSB7XG4gICAgICAvLyBhdCB0aGUgbWluaW1hbCBhbGwgY2hhcnQgc2hvdWxkIGhhdmUgeCwgeSwgZ2VvLCB0ZXh0IG9yIGFyY1xuICAgICAgaWYgKGdlbmVyYWxSdWxlcyh0bXBFbmMsIG9wdCkpIHtcbiAgICAgICAgZW5jcy5wdXNoKHZsLmR1cGxpY2F0ZSh0bXBFbmMpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBPdGhlcndpc2UsIGFzc2lnbiBpLXRoIGZpZWxkXG4gICAgdmFyIGZpZWxkID0gZmllbGRzW2ldO1xuICAgIGZvciAodmFyIGogaW4gdmwuZW5jb2RpbmdUeXBlcykge1xuICAgICAgdmFyIGV0ID0gdmwuZW5jb2RpbmdUeXBlc1tqXTtcblxuICAgICAgLy9UT0RPOiBzdXBwb3J0IFwibXVsdGlwbGVcIiBhc3NpZ25tZW50XG4gICAgICBpZiAoIShldCBpbiB0bXBFbmMpICYmIC8vIGVuY29kaW5nIG5vdCB1c2VkXG4gICAgICAgIChydWxlc1tldF0uZGF0YVR5cGVzICYgdmwuZGF0YVR5cGVzW2ZpZWxkLnR5cGVdKSA+IDAgJiZcbiAgICAgICAgKCFydWxlc1tldF0ucnVsZXMgfHwgIXJ1bGVzW2V0XS5ydWxlcyhmaWVsZCwgc3RhdHMpKVxuICAgICAgICApIHtcbiAgICAgICAgdG1wRW5jW2V0XSA9IGZpZWxkO1xuICAgICAgICBhc3NpZ25GaWVsZChpICsgMSk7XG4gICAgICAgIGRlbGV0ZSB0bXBFbmNbZXRdO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFzc2lnbkZpZWxkKDApO1xuXG4gIHJldHVybiBlbmNzO1xufVxuIiwidmFyIHZsID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cudmwgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLnZsIDogbnVsbCksXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cbnZhciBnZW4gPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgLy8gZGF0YSB2YXJpYXRpb25zXG4gIGFnZ3JlZ2F0ZXM6IHJlcXVpcmUoJy4vYWdncmVnYXRlcycpLFxuICBwcm9qZWN0aW9uczogcmVxdWlyZSgnLi9wcm9qZWN0aW9ucycpLFxuICAvLyBlbmNvZGluZ3MgLyB2aXN1YWwgdmFyaWF0b25zXG4gIGVuY29kaW5nczogcmVxdWlyZSgnLi9lbmNvZGluZ3MnKSxcbiAgZW5jczogcmVxdWlyZSgnLi9lbmNzJyksXG4gIG1hcmt0eXBlczogcmVxdWlyZSgnLi9tYXJrdHlwZXMnKVxufTtcblxuLy9GSVhNRSBtb3ZlIHRoZXNlIHRvIHZsXG52YXIgQUdHUkVHQVRJT05fRk4gPSB7IC8vYWxsIHBvc3NpYmxlIGFnZ3JlZ2F0ZSBmdW5jdGlvbiBsaXN0ZWQgYnkgZWFjaCBkYXRhIHR5cGVcbiAgUTogdmwuc2NoZW1hLmFnZ3Iuc3VwcG9ydGVkRW51bXMuUVxufTtcblxudmFyIFRSQU5TRk9STV9GTiA9IHsgLy9hbGwgcG9zc2libGUgdHJhbnNmb3JtIGZ1bmN0aW9uIGxpc3RlZCBieSBlYWNoIGRhdGEgdHlwZVxuICAvLyBROiBbJ2xvZycsICdzcXJ0JywgJ2FicyddLCAvLyBcImxvZ2l0P1wiXG4gIFQ6IHZsLnNjaGVtYS50aW1lZm5zXG59O1xuXG5nZW4uY2hhcnRzID0gZnVuY3Rpb24oZmllbGRzLCBvcHQsIGNmZywgZmxhdCkge1xuICBvcHQgPSB1dGlsLmdlbi5nZXRPcHQob3B0KTtcbiAgZmxhdCA9IGZsYXQgPT09IHVuZGVmaW5lZCA/IHtlbmNvZGluZ3M6IDF9IDogZmxhdDtcblxuICAvLyBUT0RPIGdlbmVyYXRlXG5cbiAgLy8gZ2VuZXJhdGUgcGVybXV0YXRpb24gb2YgZW5jb2RpbmcgbWFwcGluZ3NcbiAgdmFyIGZpZWxkU2V0cyA9IG9wdC5nZW5BZ2dyID8gZ2VuLmFnZ3JlZ2F0ZXMoW10sIGZpZWxkcywgb3B0KSA6IFtmaWVsZHNdLFxuICAgIGVuY3MsIGNoYXJ0cywgbGV2ZWwgPSAwO1xuXG4gIGlmIChmbGF0ID09PSB0cnVlIHx8IChmbGF0ICYmIGZsYXQuYWdncikpIHtcbiAgICBlbmNzID0gZmllbGRTZXRzLnJlZHVjZShmdW5jdGlvbihvdXRwdXQsIGZpZWxkcykge1xuICAgICAgcmV0dXJuIGdlbi5lbmNzKG91dHB1dCwgZmllbGRzLCBvcHQpO1xuICAgIH0sIFtdKTtcbiAgfSBlbHNlIHtcbiAgICBlbmNzID0gZmllbGRTZXRzLm1hcChmdW5jdGlvbihmaWVsZHMpIHtcbiAgICAgIHJldHVybiBnZW4uZW5jcyhbXSwgZmllbGRzLCBvcHQpO1xuICAgIH0sIHRydWUpO1xuICAgIGxldmVsICs9IDE7XG4gIH1cblxuICBpZiAoZmxhdCA9PT0gdHJ1ZSB8fCAoZmxhdCAmJiBmbGF0LmVuY29kaW5ncykpIHtcbiAgICBjaGFydHMgPSB1dGlsLm5lc3RlZFJlZHVjZShlbmNzLCBmdW5jdGlvbihvdXRwdXQsIGVuYykge1xuICAgICAgcmV0dXJuIGdlbi5tYXJrdHlwZXMob3V0cHV0LCBlbmMsIG9wdCwgY2ZnKTtcbiAgICB9LCBsZXZlbCwgdHJ1ZSk7XG4gIH0gZWxzZSB7XG4gICAgY2hhcnRzID0gdXRpbC5uZXN0ZWRNYXAoZW5jcywgZnVuY3Rpb24oZW5jKSB7XG4gICAgICByZXR1cm4gZ2VuLm1hcmt0eXBlcyhbXSwgZW5jLCBvcHQsIGNmZyk7XG4gICAgfSwgbGV2ZWwsIHRydWUpO1xuICAgIGxldmVsICs9IDE7XG4gIH1cbiAgcmV0dXJuIGNoYXJ0cztcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciB2bCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LnZsIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC52bCA6IG51bGwpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpLFxuICByYW5rID0gcmVxdWlyZSgnLi4vcmFuay9yYW5rJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob3V0cHV0LCBlbmMsIG9wdCwgY2ZnKSB7XG4gIG9wdCA9IHV0aWwuZ2VuLmdldE9wdChvcHQpO1xuICBnZXRTdXBwb3J0ZWRNYXJrVHlwZXMoZW5jLCBvcHQpXG4gICAgLmZvckVhY2goZnVuY3Rpb24obWFya1R5cGUpIHtcbiAgICAgIHZhciBlbmNvZGluZyA9IHsgbWFya3R5cGU6IG1hcmtUeXBlLCBlbmM6IGVuYywgY2ZnOiBjZmcgfSxcbiAgICAgICAgc2NvcmUgPSByYW5rLmVuY29kaW5nKGVuY29kaW5nKTtcbiAgICAgIGVuY29kaW5nLnNjb3JlID0gc2NvcmUuc2NvcmU7XG4gICAgICBlbmNvZGluZy5zY29yZUZlYXR1cmVzID0gc2NvcmUuZmVhdHVyZXM7XG4gICAgICBvdXRwdXQucHVzaChlbmNvZGluZyk7XG4gICAgfSk7XG4gIHJldHVybiBvdXRwdXQ7XG59O1xuXG52YXIgbWFya3NSdWxlID0ge1xuICBwb2ludDogIHBvaW50UnVsZSxcbiAgYmFyOiAgICBiYXJSdWxlLFxuICBsaW5lOiAgIGxpbmVSdWxlLFxuICBhcmVhOiAgIGxpbmVSdWxlLCAvLyBhcmVhIGlzIHNpbWlsYXIgdG8gbGluZVxuICB0ZXh0OiAgIHRleHRSdWxlXG59O1xuXG4vL1RPRE8oa2FuaXR3KTogd3JpdGUgdGVzdCBjYXNlXG5mdW5jdGlvbiBnZXRTdXBwb3J0ZWRNYXJrVHlwZXMoZW5jLCBvcHQpIHtcbiAgdmFyIG1hcmtUeXBlcyA9IG9wdC5tYXJrdHlwZUxpc3QuZmlsdGVyKGZ1bmN0aW9uKG1hcmtUeXBlKSB7XG4gICAgdmFyIG1hcmsgPSB2bC5jb21waWxlLm1hcmtzW21hcmtUeXBlXSxcbiAgICAgIHJlcXMgPSBtYXJrLnJlcXVpcmVkRW5jb2RpbmcsXG4gICAgICBzdXBwb3J0ID0gbWFyay5zdXBwb3J0ZWRFbmNvZGluZztcblxuICAgIGZvciAodmFyIGkgaW4gcmVxcykgeyAvLyBhbGwgcmVxdWlyZWQgZW5jb2RpbmdzIGluIGVuY1xuICAgICAgaWYgKCEocmVxc1tpXSBpbiBlbmMpKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZm9yICh2YXIgZW5jVHlwZSBpbiBlbmMpIHsgLy8gYWxsIGVuY29kaW5ncyBpbiBlbmMgYXJlIHN1cHBvcnRlZFxuICAgICAgaWYgKCFzdXBwb3J0W2VuY1R5cGVdKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuICFtYXJrc1J1bGVbbWFya1R5cGVdIHx8IG1hcmtzUnVsZVttYXJrVHlwZV0oZW5jLCBvcHQpO1xuICB9KTtcblxuICAvL2NvbnNvbGUubG9nKCdlbmM6JywgdXRpbC5qc29uKGVuYyksIFwiIH4gbWFya3M6XCIsIG1hcmtUeXBlcyk7XG5cbiAgcmV0dXJuIG1hcmtUeXBlcztcbn1cblxuZnVuY3Rpb24gcG9pbnRSdWxlKGVuYywgb3B0KSB7XG4gIGlmIChlbmMueCAmJiBlbmMueSkge1xuICAgIC8vIGhhdmUgYm90aCB4ICYgeSA9PT4gc2NhdHRlciBwbG90IC8gYnViYmxlIHBsb3RcblxuICAgIC8vIEZvciBPeFFcbiAgICBpZiAob3B0Lm9taXRUcmFucG9zZSAmJiB1dGlsLnhPeVEoZW5jKSkge1xuICAgICAgLy8gaWYgb21pdFRyYW5wb3NlLCBwdXQgUSBvbiBYLCBPIG9uIFlcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBGb3IgT3hPXG4gICAgaWYgKHV0aWwuaXNEaW0oZW5jLngpICYmIHV0aWwuaXNEaW0oZW5jLnkpKSB7XG4gICAgICAvLyBzaGFwZSBkb2Vzbid0IHdvcmsgd2l0aCBib3RoIHgsIHkgYXMgb3JkaW5hbFxuICAgICAgaWYgKGVuYy5zaGFwZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIFRPRE8oa2FuaXR3KTogY2hlY2sgdGhhdCB0aGVyZSBpcyBxdWFudCBhdCBsZWFzdCAuLi5cbiAgICAgIGlmIChlbmMuY29sb3IgJiYgdXRpbC5pc0RpbShlbmMuY29sb3IpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfSBlbHNlIHsgLy8gcGxvdCB3aXRoIG9uZSBheGlzID0gZG90IHBsb3RcbiAgICAvLyBEb3QgcGxvdCBzaG91bGQgYWx3YXlzIGJlIGhvcml6b250YWxcbiAgICBpZiAob3B0Lm9taXRUcmFucG9zZSAmJiBlbmMueSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gZG90IHBsb3Qgc2hvdWxkbid0IGhhdmUgb3RoZXIgZW5jb2RpbmdcbiAgICBpZiAob3B0Lm9taXREb3RQbG90V2l0aEV4dHJhRW5jb2RpbmcgJiYgdmwua2V5cyhlbmMpLmxlbmd0aCA+IDEpIHJldHVybiBmYWxzZTtcblxuICAgIC8vIGRvdCBwbG90IHdpdGggc2hhcGUgaXMgbm9uLXNlbnNlXG4gICAgaWYgKGVuYy5zaGFwZSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBiYXJSdWxlKGVuYywgb3B0KSB7XG4gIC8vIG5lZWQgdG8gYWdncmVnYXRlIG9uIGVpdGhlciB4IG9yIHlcbiAgaWYgKCgoZW5jLnguYWdnciAhPT0gdW5kZWZpbmVkKSBeIChlbmMueS5hZ2dyICE9PSB1bmRlZmluZWQpKSAmJlxuICAgICAgKHZsLmZpZWxkLmlzT3JkaW5hbFNjYWxlKGVuYy54KSBeIHZsLmZpZWxkLmlzT3JkaW5hbFNjYWxlKGVuYy55KSkpIHtcblxuICAgIC8vIGlmIG9taXRUcmFucG9zZSwgcHV0IFEgb24gWCwgTyBvbiBZXG4gICAgaWYgKG9wdC5vbWl0VHJhbnBvc2UgJiYgdXRpbC54T3lRKGVuYykpIHJldHVybiBmYWxzZTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBsaW5lUnVsZShlbmMsIG9wdCkge1xuICAvLyBUT0RPKGthbml0dyk6IGFkZCBvbWl0VmVydGljYWxMaW5lIGFzIGNvbmZpZ1xuXG4gIC8vIExpbmUgY2hhcnQgc2hvdWxkIGJlIG9ubHkgaG9yaXpvbnRhbFxuICAvLyBhbmQgdXNlIG9ubHkgdGVtcG9yYWwgZGF0YVxuICByZXR1cm4gZW5jLnggPT0gJ1QnICYmIGVuYy55ID09ICdRJztcbn1cblxuZnVuY3Rpb24gdGV4dFJ1bGUoZW5jLCBvcHQpIHtcbiAgLy8gRklYTUUgc2hvdWxkIGJlIGFnZ3JlZ2F0ZWRcbiAgLy8gYXQgbGVhc3QgbXVzdCBoYXZlIHJvdyBvciBjb2xcbiAgcmV0dXJuIGVuYy5yb3cgfHwgZW5jLmNvbDtcbn0iLCJ2YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKSxcbiAgY29uc3RzID0gcmVxdWlyZSgnLi4vY29uc3RzJyksXG4gIHZsID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cudmwgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLnZsIDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gcHJvamVjdGlvbnM7XG5cbi8qKlxuICogZmllbGRzXG4gKiBAcGFyYW0gIHtbdHlwZV19IGZpZWxkcyBhcnJheSBvZiBmaWVsZHMgYW5kIHF1ZXJ5IGluZm9ybWF0aW9uXG4gKiBAcmV0dXJuIHtbdHlwZV19ICAgICAgICBbZGVzY3JpcHRpb25dXG4gKi9cbmZ1bmN0aW9uIHByb2plY3Rpb25zKGZpZWxkcywgb3B0KSB7XG4gIG9wdCA9IHZsLnNjaGVtYS51dGlsLmV4dGVuZChvcHR8fHt9LCBjb25zdHMuZ2VuLnByb2plY3Rpb25zKTtcbiAgLy8gVE9ETyBzdXBwb3J0IG90aGVyIG1vZGUgb2YgcHJvamVjdGlvbnMgZ2VuZXJhdGlvblxuICAvLyBwb3dlcnNldCwgY2hvb3NlSywgY2hvb3NlS29yTGVzcyBhcmUgYWxyZWFkeSBpbmNsdWRlZCBpbiB0aGUgdXRpbFxuICAvLyBSaWdodCBub3cganVzdCBhZGQgb25lIG1vcmUgZmllbGRcblxuICB2YXIgc2VsZWN0ZWQgPSBbXSwgdW5zZWxlY3RlZCA9IFtdLCBmaWVsZFNldHMgPSBbXTtcblxuICBmaWVsZHMuZm9yRWFjaChmdW5jdGlvbihmaWVsZCl7XG4gICAgaWYgKGZpZWxkLnNlbGVjdGVkKSB7XG4gICAgICBzZWxlY3RlZC5wdXNoKGZpZWxkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdW5zZWxlY3RlZC5wdXNoKGZpZWxkKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBzZXRzVG9BZGQgPSB1dGlsLmNob29zZUtvckxlc3ModW5zZWxlY3RlZCwgMSk7XG5cbiAgc2V0c1RvQWRkLmZvckVhY2goZnVuY3Rpb24oc2V0VG9BZGQpIHtcbiAgICB2YXIgZmllbGRTZXQgPSBzZWxlY3RlZC5jb25jYXQoc2V0VG9BZGQpO1xuICAgIGlmIChmaWVsZFNldC5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAoZmllbGRTZXQubGVuZ3RoID09PSAxICYmIHZsLmZpZWxkLmlzQ291bnQoZmllbGRTZXRbMF0pKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIGFsd2F5cyBhcHBlbmQgcHJvamVjdGlvbidzIGtleSB0byBlYWNoIHByb2plY3Rpb24gcmV0dXJuZWQsIGQzIHN0eWxlLlxuICAgICAgZmllbGRTZXRzLnB1c2goZmllbGRTZXQpO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKG9wdC5hZGRDb3VudElmTm90aGluZ0lzU2VsZWN0ZWQgJiYgc2VsZWN0ZWQubGVuZ3RoPT09MCkge1xuICAgIHZhciBjb3VudEZpZWxkID0gdmwuZmllbGQuY291bnQoKTtcblxuICAgIHVuc2VsZWN0ZWQuZm9yRWFjaChmdW5jdGlvbihmaWVsZCkge1xuICAgICAgaWYgKCF2bC5maWVsZC5pc0NvdW50KGZpZWxkKSkge1xuICAgICAgICBmaWVsZFNldHMucHVzaChbZmllbGQsIGNvdW50RmllbGRdKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZpZWxkU2V0cy5mb3JFYWNoKGZ1bmN0aW9uKGZpZWxkU2V0KSB7XG4gICAgZmllbGRTZXQua2V5ID0gcHJvamVjdGlvbnMua2V5KGZpZWxkU2V0KTtcbiAgfSk7XG5cbiAgcmV0dXJuIGZpZWxkU2V0cztcbn1cblxucHJvamVjdGlvbnMua2V5ID0gZnVuY3Rpb24ocHJvamVjdGlvbikge1xuICByZXR1cm4gcHJvamVjdGlvbi5tYXAoZnVuY3Rpb24oZmllbGQpIHtcbiAgICByZXR1cm4gdmwuZmllbGQuaXNDb3VudChmaWVsZCkgPyAnY291bnQnIDogZmllbGQubmFtZTtcbiAgfSkuam9pbignLCcpO1xufTtcbiIsInZhciBnID0gZ2xvYmFsIHx8IHdpbmRvdztcblxuZy5DSEFSVF9UWVBFUyA9IHtcbiAgVEFCTEU6ICdUQUJMRScsXG4gIEJBUjogJ0JBUicsXG4gIFBMT1Q6ICdQTE9UJyxcbiAgTElORTogJ0xJTkUnLFxuICBBUkVBOiAnQVJFQScsXG4gIE1BUDogJ01BUCcsXG4gIEhJU1RPR1JBTTogJ0hJU1RPR1JBTSdcbn07XG5cbmcuQU5ZX0RBVEFfVFlQRVMgPSAoMSA8PCA0KSAtIDE7IiwibW9kdWxlLmV4cG9ydHMgPSByYW5rUHJvamVjdGlvbnM7XG5cbmZ1bmN0aW9uIHJhbmtQcm9qZWN0aW9ucyhzZWxlY3RlZEZpZWxkcywgcHJvamVjdGlvbikge1xuXG59XG5cbiIsInZhciB2bCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LnZsIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC52bCA6IG51bGwpO1xuXG52YXIgcmFuayA9IG1vZHVsZS5leHBvcnRzID0ge1xuICBwcm9qZWN0aW9uczogcmVxdWlyZSgnLi9yYW5rLXByb2plY3Rpb25zJylcbn07XG5cbi8vVE9ETyBsb3dlciBzY29yZSBpZiB3ZSB1c2UgRyBhcyBPP1xudmFyIEVOQ09ESU5HX1NDT1JFID0ge1xuICBROiB7XG4gICAgeDogMSwgLy8gYmV0dGVyIGZvciBzaW5nbGUgcGxvdFxuICAgIHk6IDAuOTksXG4gICAgc2l6ZTogMC42LCAvL0ZJWE1FIFNJWkUgZm9yIEJhciBpcyBob3JyaWJsZSFcbiAgICBjb2xvcjogMC40LFxuICAgIGFscGhhOiAwLjRcbiAgfSxcbiAgTzogeyAvLyBUT0RPIG5lZWQgdG8gdGFrZSBjYXJkaW5hbGl0eSBpbnRvIGFjY291bnRcbiAgICB4OiAwLjk5LCAvLyBoYXJkZXIgdG8gcmVhZCBheGlzXG4gICAgeTogMSxcbiAgICByb3c6IDAuNyxcbiAgICBjb2w6IDAuNyxcbiAgICBjb2xvcjogMC44LFxuICAgIHNoYXBlOiAwLjZcbiAgfSxcbiAgVDogeyAvLyBGSVggcmV0aGluayB0aGlzXG4gICAgeDogMSxcbiAgICB5OiAwLjgsXG4gICAgcm93OiAwLjQsXG4gICAgY29sOiAwLjQsXG4gICAgY29sb3I6IDAuMyxcbiAgICBzaGFwZTogMC4zXG4gIH1cbn07XG5cbi8vIGJhZCBzY29yZSBub3Qgc3BlY2lmaWVkIGluIHRoZSB0YWJsZSBhYm92ZVxudmFyIEJBRF9FTkNPRElOR19TQ09SRSA9IDAuMDEsXG4gIFVOVVNFRF9QT1NJVElPTiA9IDAuNTtcblxudmFyIE1BUktfU0NPUkUgPSB7XG4gIGxpbmU6IDAuOTksXG4gIGFyZWE6IDAuOTgsXG4gIGJhcjogMC45NyxcbiAgcG9pbnQ6IDAuOTYsXG4gIGNpcmNsZTogMC45NSxcbiAgc3F1YXJlOiAwLjk1LFxuICB0ZXh0OiAwLjhcbn07XG5cbnJhbmsuZW5jb2RpbmcgPSBmdW5jdGlvbihlbmNvZGluZykge1xuICB2YXIgZmVhdHVyZXMgPSB7fSxcbiAgICBlbmNUeXBlcyA9IHZsLmtleXMoZW5jb2RpbmcuZW5jKTtcbiAgZW5jVHlwZXMuZm9yRWFjaChmdW5jdGlvbihlbmNUeXBlKSB7XG4gICAgdmFyIGZpZWxkID0gZW5jb2RpbmcuZW5jW2VuY1R5cGVdO1xuICAgIGZlYXR1cmVzW2ZpZWxkLm5hbWVdID0ge1xuICAgICAgdmFsdWU6IGZpZWxkLnR5cGUgKyAnOicrIGVuY1R5cGUsXG4gICAgICBzY29yZTogRU5DT0RJTkdfU0NPUkVbZmllbGQudHlwZV1bZW5jVHlwZV0gfHwgQkFEX0VOQ09ESU5HX1NDT1JFXG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gcGVuYWxpemUgbm90IHVzaW5nIHBvc2l0aW9uYWxcbiAgaWYgKGVuY1R5cGVzLmxlbmd0aCA+IDEpIHtcbiAgICBpZiAoKCFlbmNvZGluZy5lbmMueCB8fCAhZW5jb2RpbmcuZW5jLnkpICYmICFlbmNvZGluZy5lbmMuZ2VvKSB7XG4gICAgICBmZWF0dXJlcy51bnVzZWRQb3NpdGlvbiA9IHtzY29yZTogVU5VU0VEX1BPU0lUSU9OfTtcbiAgICB9XG4gIH1cblxuICBmZWF0dXJlcy5tYXJrVHlwZSA9IHtcbiAgICB2YWx1ZTogZW5jb2RpbmcubWFya3R5cGUsXG4gICAgc2NvcmU6IE1BUktfU0NPUkVbZW5jb2RpbmcubWFya3R5cGVdXG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBzY29yZTogdmwua2V5cyhmZWF0dXJlcykucmVkdWNlKGZ1bmN0aW9uKHAsIHMpIHtcbiAgICAgIHJldHVybiBwICogZmVhdHVyZXNbc10uc2NvcmU7XG4gICAgfSwgMSksXG4gICAgZmVhdHVyZXM6IGZlYXR1cmVzXG4gIH07XG59O1xuXG5cbi8vIHJhdyA+IGF2Zywgc3VtID4gbWluLG1heCA+IGJpblxuXG5yYW5rLmZpZWxkc1Njb3JlID0gZnVuY3Rpb24oZmllbGRzKSB7XG5cbn07XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgY29uc3RzID0gcmVxdWlyZSgnLi9jb25zdHMnKTtcblxudmFyIHV0aWwgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2VuOiB7fVxufTtcblxudmFyIGlzRGltID0gdXRpbC5pc0RpbSA9IGZ1bmN0aW9uIChmaWVsZCkge1xuICByZXR1cm4gZmllbGQuYmluIHx8IGZpZWxkLnR5cGUgPT09ICdPJztcbn07XG5cbnV0aWwueE95USA9IGZ1bmN0aW9uIHhPeVEgKGVuYykge1xuICByZXR1cm4gZW5jLnggJiYgZW5jLnkgJiYgaXNEaW0oZW5jLngpICYmIGlzRGltKGVuYy55KTtcbn07XG5cbnV0aWwuaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKG9iaikge1xuICByZXR1cm4ge30udG9TdHJpbmcuY2FsbChvYmopID09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG51dGlsLmpzb24gPSBmdW5jdGlvbihzLCBzcCkge1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocywgbnVsbCwgc3ApO1xufTtcblxudXRpbC5rZXlzID0gZnVuY3Rpb24ob2JqKSB7XG4gIHZhciBrID0gW10sIHg7XG4gIGZvciAoeCBpbiBvYmopIGsucHVzaCh4KTtcbiAgcmV0dXJuIGs7XG59O1xuXG51dGlsLm5lc3RlZE1hcCA9IGZ1bmN0aW9uIChjb2wsIGYsIGxldmVsLCBmaWx0ZXIpIHtcbiAgcmV0dXJuIGxldmVsID09PSAwID9cbiAgICBjb2wubWFwKGYpIDpcbiAgICBjb2wubWFwKGZ1bmN0aW9uKHYpIHtcbiAgICAgIHZhciByID0gdXRpbC5uZXN0ZWRNYXAodiwgZiwgbGV2ZWwgLSAxKTtcbiAgICAgIHJldHVybiBmaWx0ZXIgPyByLmZpbHRlcih1dGlsLm5vbkVtcHR5KSA6IHI7XG4gICAgfSk7XG59O1xuXG51dGlsLm5lc3RlZFJlZHVjZSA9IGZ1bmN0aW9uIChjb2wsIGYsIGxldmVsLCBmaWx0ZXIpIHtcbiAgcmV0dXJuIGxldmVsID09PSAwID9cbiAgICBjb2wucmVkdWNlKGYsIFtdKSA6XG4gICAgY29sLm1hcChmdW5jdGlvbih2KSB7XG4gICAgICB2YXIgciA9IHV0aWwubmVzdGVkUmVkdWNlKHYsIGYsIGxldmVsIC0gMSk7XG4gICAgICByZXR1cm4gZmlsdGVyID8gci5maWx0ZXIodXRpbC5ub25FbXB0eSkgOiByO1xuICAgIH0pO1xufTtcblxudXRpbC5ub25FbXB0eSA9IGZ1bmN0aW9uKGdycCkge1xuICByZXR1cm4gIXV0aWwuaXNBcnJheShncnApIHx8IGdycC5sZW5ndGggPiAwO1xufTtcblxuXG51dGlsLnRyYXZlcnNlID0gZnVuY3Rpb24gKG5vZGUsIGFycikge1xuICBpZiAobm9kZS52YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgYXJyLnB1c2gobm9kZS52YWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKG5vZGUubGVmdCkgdXRpbC50cmF2ZXJzZShub2RlLmxlZnQsIGFycik7XG4gICAgaWYgKG5vZGUucmlnaHQpIHV0aWwudHJhdmVyc2Uobm9kZS5yaWdodCwgYXJyKTtcbiAgfVxuICByZXR1cm4gYXJyO1xufTtcblxudXRpbC51bmlvbiA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIHZhciBvID0ge307XG4gIGEuZm9yRWFjaChmdW5jdGlvbih4KSB7IG9beF0gPSB0cnVlO30pO1xuICBiLmZvckVhY2goZnVuY3Rpb24oeCkgeyBvW3hdID0gdHJ1ZTt9KTtcbiAgcmV0dXJuIHV0aWwua2V5cyhvKTtcbn07XG5cblxudXRpbC5nZW4uZ2V0T3B0ID0gZnVuY3Rpb24gKG9wdCkge1xuICAvL21lcmdlIHdpdGggZGVmYXVsdFxuICByZXR1cm4gKG9wdCA/IHV0aWwua2V5cyhvcHQpIDogW10pLnJlZHVjZShmdW5jdGlvbihjLCBrKSB7XG4gICAgY1trXSA9IG9wdFtrXTtcbiAgICByZXR1cm4gYztcbiAgfSwgT2JqZWN0LmNyZWF0ZShjb25zdHMuZ2VuLkRFRkFVTFRfT1BUKSk7XG59O1xuXG4vKipcbiAqIHBvd2Vyc2V0IGNvZGUgZnJvbSBodHRwOi8vcm9zZXR0YWNvZGUub3JnL3dpa2kvUG93ZXJfU2V0I0phdmFTY3JpcHRcbiAqXG4gKiAgIHZhciByZXMgPSBwb3dlcnNldChbMSwyLDMsNF0pO1xuICpcbiAqIHJldHVybnNcbiAqXG4gKiBbW10sWzFdLFsyXSxbMSwyXSxbM10sWzEsM10sWzIsM10sWzEsMiwzXSxbNF0sWzEsNF0sXG4gKiBbMiw0XSxbMSwyLDRdLFszLDRdLFsxLDMsNF0sWzIsMyw0XSxbMSwyLDMsNF1dXG5bZWRpdF1cbiovXG5cbnV0aWwucG93ZXJzZXQgPSBmdW5jdGlvbihsaXN0KSB7XG4gIHZhciBwcyA9IFtcbiAgICBbXVxuICBdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICBmb3IgKHZhciBqID0gMCwgbGVuID0gcHMubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgIHBzLnB1c2gocHNbal0uY29uY2F0KGxpc3RbaV0pKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBzO1xufTtcblxudXRpbC5jaG9vc2VLb3JMZXNzID0gZnVuY3Rpb24obGlzdCwgaykge1xuICB2YXIgc3Vic2V0ID0gW1tdXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgZm9yICh2YXIgaiA9IDAsIGxlbiA9IHN1YnNldC5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgdmFyIHN1YiA9IHN1YnNldFtqXS5jb25jYXQobGlzdFtpXSk7XG4gICAgICBpZihzdWIubGVuZ3RoIDw9IGspe1xuICAgICAgICBzdWJzZXQucHVzaChzdWIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gc3Vic2V0O1xufTtcblxudXRpbC5jaG9vc2VLID0gZnVuY3Rpb24obGlzdCwgaykge1xuICB2YXIgc3Vic2V0ID0gW1tdXTtcbiAgdmFyIGtBcnJheSA9W107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIGZvciAodmFyIGogPSAwLCBsZW4gPSBzdWJzZXQubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgIHZhciBzdWIgPSBzdWJzZXRbal0uY29uY2F0KGxpc3RbaV0pO1xuICAgICAgaWYoc3ViLmxlbmd0aCA8IGspe1xuICAgICAgICBzdWJzZXQucHVzaChzdWIpO1xuICAgICAgfWVsc2UgaWYgKHN1Yi5sZW5ndGggPT09IGspe1xuICAgICAgICBrQXJyYXkucHVzaChzdWIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4ga0FycmF5O1xufTtcblxudXRpbC5jcm9zcyA9IGZ1bmN0aW9uKGEsYil7XG4gIHZhciB4ID0gW107XG4gIGZvcih2YXIgaT0wOyBpPCBhLmxlbmd0aDsgaSsrKXtcbiAgICBmb3IodmFyIGo9MDtqPCBiLmxlbmd0aDsgaisrKXtcbiAgICAgIHgucHVzaChhW2ldLmNvbmNhdChiW2pdKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiB4O1xufTtcblxuIl19
