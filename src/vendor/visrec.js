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
    },
    timeFnList: {
      type: 'array',
      items: {
        type: ['string']
      },
      default: ['year']
    }
  }
};

consts.gen.encodings = {
  type: 'object',
  properties: {
    omitTranpose:  {
      type: 'boolean',
      default: true,
      description: 'Eliminate all transpose by (1) keeping horizontal dot plot only (2) for OxQ charts, always put O on Y (3) show only one DxD, MxM (currently sorted by name)'
    },
    omitDotPlotWithExtraEncoding: {
      type: 'boolean',
      default: true,
      description: 'remove all dot plot with >1 encoding'
    },
    omitNonTextAggrWithAllDimsOnFacets: {
      type: 'boolean',
      default: true,
      description: 'remove all aggregated charts (except text tables) with all dims on facets (row, col)'
    },
    marktypeList: {
      type: 'array',
      items: {type: 'string'},
      default: ['point', 'bar', 'line', 'area', 'text'], //filled_map
      description: 'allowed marktypes'
    }
  }
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
      var fns = (!f._fn || f._fn === '*') ? opt.timeFnList : f._fn;
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
        break;

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
  util = require('../util'),
  consts = require('../consts');

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
  opt = vl.schema.util.extend(opt||{}, consts.gen.encodings);
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

},{"../consts":5,"../globals":12,"../util":15}],9:[function(require,module,exports){
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
  rank = require('../rank/rank'),
  consts = require('../consts');

module.exports = function(output, enc, opt, cfg) {
  opt = vl.schema.util.extend(opt||{}, consts.gen.encodings);

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

},{"../consts":5,"../rank/rank":14,"../util":15}],11:[function(require,module,exports){
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

// FIXME distinguish between raw / aggregate plot
var isDim = util.isDim = function (field) {
  return field.bin || field.type === 'O' ||
    (field.type === 'T' && field.fn);
};

util.xOyQ = function xOyQ (enc) {
  return enc.x && enc.y && isDim(enc.x) && !isDim(enc.y);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvdnIiLCJzcmMvY2x1c3Rlci9jbHVzdGVyLmpzIiwic3JjL2NsdXN0ZXIvY2x1c3RlcmNvbnN0cy5qcyIsInNyYy9jbHVzdGVyL2Rpc3RhbmNldGFibGUuanMiLCJzcmMvY29uc3RzLmpzIiwic3JjL2dlbi9hZ2dyZWdhdGVzLmpzIiwic3JjL2dlbi9lbmNvZGluZ3MuanMiLCJzcmMvZ2VuL2VuY3MuanMiLCJzcmMvZ2VuL2dlbi5qcyIsInNyYy9nZW4vbWFya3R5cGVzLmpzIiwic3JjL2dlbi9wcm9qZWN0aW9ucy5qcyIsInNyYy9nbG9iYWxzLmpzIiwic3JjL3JhbmsvcmFuay1wcm9qZWN0aW9ucy5qcyIsInNyYy9yYW5rL3JhbmsuanMiLCJzcmMvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3JJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNsSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciB2ciA9IG1vZHVsZS5leHBvcnRzID0ge1xuICBjbHVzdGVyOiByZXF1aXJlKCcuL2NsdXN0ZXIvY2x1c3RlcicpLFxuICBnZW46IHJlcXVpcmUoJy4vZ2VuL2dlbicpLFxuICByYW5rOiByZXF1aXJlKCcuL3JhbmsvcmFuaycpLFxuICB1dGlsOiByZXF1aXJlKCcuL3V0aWwnKVxufTtcblxuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBjbHVzdGVyO1xuXG52YXIgdmwgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy52bCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwudmwgOiBudWxsKSxcbiAgY2x1c3RlcmZjayA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LmNsdXN0ZXJmY2sgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLmNsdXN0ZXJmY2sgOiBudWxsKSxcbiAgY29uc3RzID0gcmVxdWlyZSgnLi9jbHVzdGVyY29uc3RzJyksXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cbnZhciBkaXN0YW5jZVRhYmxlID0gY2x1c3Rlci5kaXN0YW5jZVRhYmxlID0gcmVxdWlyZSgnLi9kaXN0YW5jZXRhYmxlJyk7XG5cblxuZnVuY3Rpb24gY2x1c3RlcihlbmNvZGluZ3MsIG1heERpc3RhbmNlKSB7XG4gIHZhciBkaXN0ID0gZGlzdGFuY2VUYWJsZShlbmNvZGluZ3MpLFxuICAgIG4gPSBlbmNvZGluZ3MubGVuZ3RoO1xuXG4gIHZhciBjbHVzdGVyVHJlZXMgPSBjbHVzdGVyZmNrLmhjbHVzdGVyKHZsLnJhbmdlKG4pLCBmdW5jdGlvbihpLCBqKSB7XG4gICAgcmV0dXJuIGRpc3RbaV1bal07XG4gIH0sICdhdmVyYWdlJywgY29uc3RzLkNMVVNURVJfVEhSRVNIT0xEKTtcblxuICB2YXIgY2x1c3RlcnMgPSBjbHVzdGVyVHJlZXMubWFwKGZ1bmN0aW9uKHRyZWUpIHtcbiAgICByZXR1cm4gdXRpbC50cmF2ZXJzZSh0cmVlLCBbXSk7XG4gIH0pO1xuXG4gIC8vY29uc29sZS5sb2coXCJjbHVzdGVyc1wiLCBjbHVzdGVycy5tYXAoZnVuY3Rpb24oYyl7IHJldHVybiBjLmpvaW4oXCIrXCIpOyB9KSk7XG4gIHJldHVybiBjbHVzdGVycztcbn07IiwidmFyIGMgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5jLkRJU1RfQllfRU5DVFlQRSA9IFtcbiAgLy8gcG9zaXRpb25hbFxuICBbJ3gnLCAneScsIDAuMl0sXG4gIFsncm93JywgJ2NvbCcsIDAuMl0sXG5cbiAgLy8gb3JkaW5hbCBtYXJrIHByb3BlcnRpZXNcbiAgWydjb2xvcicsICdzaGFwZScsIDAuMl0sXG5cbiAgLy8gcXVhbnRpdGF0aXZlIG1hcmsgcHJvcGVydGllc1xuICBbJ2NvbG9yJywgJ2FscGhhJywgMC4yXSxcbiAgWydzaXplJywgJ2FscGhhJywgMC4yXSxcbiAgWydzaXplJywgJ2NvbG9yJywgMC4yXVxuXS5yZWR1Y2UoZnVuY3Rpb24ociwgeCkge1xudmFyIGEgPSB4WzBdLCBiID0geFsxXSwgZCA9IHhbMl07XG4gIHJbYV0gPSByW2FdIHx8IHt9O1xuICByW2JdID0gcltiXSB8fCB7fTtcbiAgclthXVtiXSA9IHJbYl1bYV0gPSBkO1xuICByZXR1cm4gcjtcbn0sIHt9KTtcblxuYy5ESVNUX01JU1NJTkcgPSAxMDA7XG5cbmMuQ0xVU1RFUl9USFJFU0hPTEQgPSAxOyIsInZhciB2bCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LnZsIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC52bCA6IG51bGwpLFxuICBjb25zdHMgPSByZXF1aXJlKCcuL2NsdXN0ZXJjb25zdHMnKSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBkaXN0YW5jZVRhYmxlO1xuXG5mdW5jdGlvbiBkaXN0YW5jZVRhYmxlKGVuY29kaW5ncykge1xuICB2YXIgbGVuID0gZW5jb2RpbmdzLmxlbmd0aCxcbiAgICBjb2xlbmNzID0gZW5jb2RpbmdzLm1hcChmdW5jdGlvbihlKSB7IHJldHVybiBjb2xlbmMoZSk7fSksXG4gICAgZGlmZiA9IG5ldyBBcnJheShsZW4pLCBpLCBqO1xuXG4gIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykgZGlmZltpXSA9IG5ldyBBcnJheShsZW4pO1xuXG4gIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIGZvciAoaiA9IGkgKyAxOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgIGRpZmZbal1baV0gPSBkaWZmW2ldW2pdID0gZ2V0RGlzdGFuY2UoY29sZW5jc1tpXSwgY29sZW5jc1tqXSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBkaWZmO1xufVxuXG5mdW5jdGlvbiBnZXREaXN0YW5jZShjb2xlbmMxLCBjb2xlbmMyKSB7XG4gIHZhciBjb2xzID0gdXRpbC51bmlvbih2bC5rZXlzKGNvbGVuYzEuY29sKSwgdmwua2V5cyhjb2xlbmMyLmNvbCkpLFxuICAgIGRpc3QgPSAwO1xuXG4gIGNvbHMuZm9yRWFjaChmdW5jdGlvbihjb2wpIHtcbiAgICB2YXIgZTEgPSBjb2xlbmMxLmNvbFtjb2xdLCBlMiA9IGNvbGVuYzIuY29sW2NvbF07XG5cbiAgICBpZiAoZTEgJiYgZTIpIHtcbiAgICAgIGlmIChlMS50eXBlICE9IGUyLnR5cGUpIHtcbiAgICAgICAgZGlzdCArPSAoY29uc3RzLkRJU1RfQllfRU5DVFlQRVtlMS50eXBlXSB8fCB7fSlbZTIudHlwZV0gfHwgMTtcbiAgICAgIH1cbiAgICAgIC8vRklYTUUgYWRkIGFnZ3JlZ2F0aW9uXG4gICAgfSBlbHNlIHtcbiAgICAgIGRpc3QgKz0gY29uc3RzLkRJU1RfTUlTU0lORztcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gZGlzdDtcbn1cblxuZnVuY3Rpb24gY29sZW5jKGVuY29kaW5nKSB7XG4gIHZhciBfY29sZW5jID0ge30sXG4gICAgZW5jID0gZW5jb2RpbmcuZW5jO1xuXG4gIHZsLmtleXMoZW5jKS5mb3JFYWNoKGZ1bmN0aW9uKGVuY1R5cGUpIHtcbiAgICB2YXIgZSA9IHZsLmR1cGxpY2F0ZShlbmNbZW5jVHlwZV0pO1xuICAgIGUudHlwZSA9IGVuY1R5cGU7XG4gICAgX2NvbGVuY1tlLm5hbWUgfHwgJyddID0gZTtcbiAgICBkZWxldGUgZS5uYW1lO1xuICB9KTtcblxuICByZXR1cm4ge1xuICAgIG1hcmt0eXBlOiBlbmNvZGluZy5tYXJrdHlwZSxcbiAgICBjb2w6IF9jb2xlbmNcbiAgfTtcbn0iLCJ2YXIgY29uc3RzID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdlbjoge30sXG4gIGNsdXN0ZXI6IHt9LFxuICByYW5rOiB7fVxufTtcblxuY29uc3RzLmdlbi5wcm9qZWN0aW9ucyA9IHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHByb3BlcnRpZXM6IHtcbiAgICBhZGRDb3VudElmTm90aGluZ0lzU2VsZWN0ZWQ6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ1doZW4gbm8gZmllbGQgaXMgc2VsZWN0ZWQsIGFkZCBleHRyYSBjb3VudCBmaWVsZCdcbiAgICB9XG4gIH1cbn07XG5cbmNvbnN0cy5nZW4uYWdncmVnYXRlcyA9IHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHByb3BlcnRpZXM6IHtcbiAgICBnZW5CaW46IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ0dlbmVyYXRlIEJpbm5pbmcnXG4gICAgfSxcbiAgICBnZW5UeXBlQ2FzdGluZzoge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnSW5jbHVkZSB0eXBlIGNhc3RpbmcgZS5nLiwgZnJvbSBRIHRvIE8nXG4gICAgfSxcbiAgICBvbWl0TWVhc3VyZU9ubHk6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ09taXQgYWdncmVnYXRpb24gd2l0aCBtZWFzdXJlKHMpIG9ubHknXG4gICAgfSxcbiAgICBvbWl0RGltZW5zaW9uT25seToge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnT21pdCBhZ2dyZWdhdGlvbiB3aXRoIGRpbWVuc2lvbihzKSBvbmx5J1xuICAgIH0sXG4gICAgYWdnckxpc3Q6IHtcbiAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICBpdGVtczoge1xuICAgICAgICB0eXBlOiBbJ3N0cmluZyddXG4gICAgICB9LFxuICAgICAgZGVmYXVsdDogW3VuZGVmaW5lZCwgJ2F2ZyddXG4gICAgfSxcbiAgICB0aW1lRm5MaXN0OiB7XG4gICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgaXRlbXM6IHtcbiAgICAgICAgdHlwZTogWydzdHJpbmcnXVxuICAgICAgfSxcbiAgICAgIGRlZmF1bHQ6IFsneWVhciddXG4gICAgfVxuICB9XG59O1xuXG5jb25zdHMuZ2VuLmVuY29kaW5ncyA9IHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHByb3BlcnRpZXM6IHtcbiAgICBvbWl0VHJhbnBvc2U6ICB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgZGVzY3JpcHRpb246ICdFbGltaW5hdGUgYWxsIHRyYW5zcG9zZSBieSAoMSkga2VlcGluZyBob3Jpem9udGFsIGRvdCBwbG90IG9ubHkgKDIpIGZvciBPeFEgY2hhcnRzLCBhbHdheXMgcHV0IE8gb24gWSAoMykgc2hvdyBvbmx5IG9uZSBEeEQsIE14TSAoY3VycmVudGx5IHNvcnRlZCBieSBuYW1lKSdcbiAgICB9LFxuICAgIG9taXREb3RQbG90V2l0aEV4dHJhRW5jb2Rpbmc6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ3JlbW92ZSBhbGwgZG90IHBsb3Qgd2l0aCA+MSBlbmNvZGluZydcbiAgICB9LFxuICAgIG9taXROb25UZXh0QWdncldpdGhBbGxEaW1zT25GYWNldHM6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ3JlbW92ZSBhbGwgYWdncmVnYXRlZCBjaGFydHMgKGV4Y2VwdCB0ZXh0IHRhYmxlcykgd2l0aCBhbGwgZGltcyBvbiBmYWNldHMgKHJvdywgY29sKSdcbiAgICB9LFxuICAgIG1hcmt0eXBlTGlzdDoge1xuICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgIGl0ZW1zOiB7dHlwZTogJ3N0cmluZyd9LFxuICAgICAgZGVmYXVsdDogWydwb2ludCcsICdiYXInLCAnbGluZScsICdhcmVhJywgJ3RleHQnXSwgLy9maWxsZWRfbWFwXG4gICAgICBkZXNjcmlwdGlvbjogJ2FsbG93ZWQgbWFya3R5cGVzJ1xuICAgIH1cbiAgfVxufTtcblxuXG5cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHZsID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cudmwgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLnZsIDogbnVsbCk7XG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpLFxuICBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBnZW5BZ2dyZWdhdGVzO1xuXG5mdW5jdGlvbiBnZW5BZ2dyZWdhdGVzKG91dHB1dCwgZmllbGRzLCBvcHQpIHtcbiAgb3B0ID0gdmwuc2NoZW1hLnV0aWwuZXh0ZW5kKG9wdHx8e30sIGNvbnN0cy5nZW4uYWdncmVnYXRlcyk7XG4gIHZhciB0ZiA9IG5ldyBBcnJheShmaWVsZHMubGVuZ3RoKTtcblxuICBmdW5jdGlvbiBjaGVja0FuZFB1c2goKSB7XG4gICAgaWYgKG9wdC5vbWl0TWVhc3VyZU9ubHkgfHwgb3B0Lm9taXREaW1lbnNpb25Pbmx5KSB7XG4gICAgICB2YXIgaGFzTWVhc3VyZSA9IGZhbHNlLCBoYXNEaW1lbnNpb24gPSBmYWxzZSwgaGFzUmF3ID0gZmFsc2U7XG4gICAgICB0Zi5mb3JFYWNoKGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgaWYgKHV0aWwuaXNEaW0oZikpIHtcbiAgICAgICAgICBoYXNEaW1lbnNpb24gPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGhhc01lYXN1cmUgPSB0cnVlO1xuICAgICAgICAgIGlmICghZi5hZ2dyKSBoYXNSYXcgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmICghaGFzTWVhc3VyZSAmJiBvcHQub21pdERpbWVuc2lvbk9ubHkpIHJldHVybjtcbiAgICAgIGlmICghaGFzRGltZW5zaW9uICYmICFoYXNSYXcgJiYgb3B0Lm9taXRNZWFzdXJlT25seSkgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBmaWVsZFNldCA9IHZsLmR1cGxpY2F0ZSh0Zik7XG4gICAgZmllbGRTZXQua2V5ID0gdmwuZmllbGQuc2hvcnRoYW5kcyhmaWVsZFNldCk7XG5cbiAgICBvdXRwdXQucHVzaChmaWVsZFNldCk7XG4gIH1cblxuICBmdW5jdGlvbiBhc3NpZ25RKGksIGhhc0FnZ3IpIHtcbiAgICB2YXIgZiA9IGZpZWxkc1tpXSxcbiAgICAgIGNhbkhhdmVBZ2dyID0gaGFzQWdnciA9PT0gdHJ1ZSB8fCBoYXNBZ2dyID09PSBudWxsLFxuICAgICAgY2FudEhhdmVBZ2dyID0gaGFzQWdnciA9PT0gZmFsc2UgfHwgaGFzQWdnciA9PT0gbnVsbDtcblxuICAgIHRmW2ldID0ge25hbWU6IGYubmFtZSwgdHlwZTogZi50eXBlfTtcblxuICAgIGlmIChmLmFnZ3IpIHtcbiAgICAgIGlmIChjYW5IYXZlQWdncikge1xuICAgICAgICB0ZltpXS5hZ2dyID0gZi5hZ2dyO1xuICAgICAgICBhc3NpZ25GaWVsZChpICsgMSwgdHJ1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBhZ2dyZWdhdGVzID0gKCFmLl9hZ2dyIHx8IGYuX2FnZ3IgPT09ICcqJykgPyBvcHQuYWdnckxpc3QgOiBmLl9hZ2dyO1xuXG4gICAgICBmb3IgKHZhciBqIGluIGFnZ3JlZ2F0ZXMpIHtcbiAgICAgICAgdmFyIGEgPSBhZ2dyZWdhdGVzW2pdO1xuICAgICAgICBpZiAoYSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgaWYgKGNhbkhhdmVBZ2dyKSB7XG4gICAgICAgICAgICB0ZltpXS5hZ2dyID0gYTtcbiAgICAgICAgICAgIGFzc2lnbkZpZWxkKGkgKyAxLCB0cnVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7IC8vIGlmKGEgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICBpZiAoY2FudEhhdmVBZ2dyKSB7XG4gICAgICAgICAgICBkZWxldGUgdGZbaV0uYWdncjtcbiAgICAgICAgICAgIGFzc2lnbkZpZWxkKGkgKyAxLCBmYWxzZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHQuZ2VuQmluKSB7XG4gICAgICAgIC8vIGJpbiB0aGUgZmllbGQgaW5zdGVhZCFcbiAgICAgICAgZGVsZXRlIHRmW2ldLmFnZ3I7XG4gICAgICAgIHRmW2ldLmJpbiA9IHRydWU7XG4gICAgICAgIHRmW2ldLnR5cGUgPSAnUSc7XG4gICAgICAgIGFzc2lnbkZpZWxkKGkgKyAxLCBoYXNBZ2dyKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdC5nZW5UeXBlQ2FzdGluZykge1xuICAgICAgICAvLyB3ZSBjYW4gYWxzbyBjaGFuZ2UgaXQgdG8gZGltZW5zaW9uIChjYXN0IHR5cGU9XCJPXCIpXG4gICAgICAgIGRlbGV0ZSB0ZltpXS5hZ2dyO1xuICAgICAgICBkZWxldGUgdGZbaV0uYmluO1xuICAgICAgICB0ZltpXS50eXBlID0gJ08nO1xuICAgICAgICBhc3NpZ25GaWVsZChpICsgMSwgaGFzQWdncik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gYXNzaWduVChpLCBoYXNBZ2dyKSB7XG4gICAgdmFyIGYgPSBmaWVsZHNbaV07XG4gICAgdGZbaV0gPSB7bmFtZTogZi5uYW1lLCB0eXBlOiBmLnR5cGV9O1xuXG4gICAgaWYgKGYuZm4pIHtcbiAgICAgIC8vIEZJWE1FIGRlYWwgd2l0aCBhc3NpZ25lZCBmdW5jdGlvblxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZm5zID0gKCFmLl9mbiB8fCBmLl9mbiA9PT0gJyonKSA/IG9wdC50aW1lRm5MaXN0IDogZi5fZm47XG4gICAgICBmb3IgKHZhciBqIGluIGZucykge1xuICAgICAgICB2YXIgZm4gPSBmbnNbal07XG4gICAgICAgIGlmIChmbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgYXNzaWduRmllbGQoaSsxLCBoYXNBZ2dyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0ZltpXS5mbiA9IGZuO1xuICAgICAgICAgIGFzc2lnbkZpZWxkKGkrMSwgaGFzQWdncik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gRklYTUUgd2hhdCBpZiB5b3UgYWdncmVnYXRlIHRpbWU/XG5cbiAgfVxuXG4gIGZ1bmN0aW9uIGFzc2lnbkZpZWxkKGksIGhhc0FnZ3IpIHtcbiAgICBpZiAoaSA9PT0gZmllbGRzLmxlbmd0aCkgeyAvLyBJZiBhbGwgZmllbGRzIGFyZSBhc3NpZ25lZFxuICAgICAgY2hlY2tBbmRQdXNoKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGYgPSBmaWVsZHNbaV07XG4gICAgLy8gT3RoZXJ3aXNlLCBhc3NpZ24gaS10aCBmaWVsZFxuICAgIHN3aXRjaCAoZi50eXBlKSB7XG4gICAgICAvL1RPRE8gXCJEXCIsIFwiR1wiXG4gICAgICBjYXNlICdRJzpcbiAgICAgICAgYXNzaWduUShpLCBoYXNBZ2dyKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ1QnOlxuICAgICAgICBhc3NpZ25UKGksIGhhc0FnZ3IpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnTyc6XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0ZltpXSA9IGY7XG4gICAgICAgIGFzc2lnbkZpZWxkKGkgKyAxLCBoYXNBZ2dyKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gIH1cblxuICBhc3NpZ25GaWVsZCgwLCBudWxsKTtcblxuICByZXR1cm4gb3V0cHV0O1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2VuRW5jcyA9IHJlcXVpcmUoJy4vZW5jcycpLFxuICBnZW5NYXJrdHlwZXMgPSByZXF1aXJlKCcuL21hcmt0eXBlcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdlbkVuY29kaW5ncztcblxuZnVuY3Rpb24gZ2VuRW5jb2RpbmdzKG91dHB1dCwgZmllbGRzLCBzdGF0cywgb3B0LCBjZmcsIG5lc3RlZCkge1xuICB2YXIgZW5jcyA9IGdlbkVuY3MoW10sIGZpZWxkcywgc3RhdHMsIG9wdCk7XG5cbiAgaWYgKG5lc3RlZCkge1xuICAgIHJldHVybiBlbmNzLnJlZHVjZShmdW5jdGlvbihkaWN0LCBlbmMpIHtcbiAgICAgIGRpY3RbZW5jXSA9IGdlbk1hcmt0eXBlcyhbXSwgZW5jLCBvcHQsIGNmZyk7XG4gICAgICByZXR1cm4gZGljdDtcbiAgICB9LCB7fSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGVuY3MucmVkdWNlKGZ1bmN0aW9uKGxpc3QsIGVuYykge1xuICAgICAgcmV0dXJuIGdlbk1hcmt0eXBlcyhsaXN0LCBlbmMsIG9wdCwgY2ZnKTtcbiAgICB9LCBbXSk7XG4gIH1cbn0iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHZsID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cudmwgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLnZsIDogbnVsbCksXG4gIGdsb2JhbHMgPSByZXF1aXJlKCcuLi9nbG9iYWxzJyksXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyksXG4gIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdlbkVuY3M7XG5cbnZhciBydWxlcyA9IHtcbiAgeDoge1xuICAgIGRhdGFUeXBlczogdmwuZGF0YVR5cGVzLk8gKyB2bC5kYXRhVHlwZXMuUSArIHZsLmRhdGFUeXBlcy5ULFxuICAgIG11bHRpcGxlOiB0cnVlIC8vRklYTUUgc2hvdWxkIGFsbG93IG11bHRpcGxlIG9ubHkgZm9yIFEsIFRcbiAgfSxcbiAgeToge1xuICAgIGRhdGFUeXBlczogdmwuZGF0YVR5cGVzLk8gKyB2bC5kYXRhVHlwZXMuUSArIHZsLmRhdGFUeXBlcy5ULFxuICAgIG11bHRpcGxlOiB0cnVlIC8vRklYTUUgc2hvdWxkIGFsbG93IG11bHRpcGxlIG9ubHkgZm9yIFEsIFRcbiAgfSxcbiAgcm93OiB7XG4gICAgZGF0YVR5cGVzOiB2bC5kYXRhVHlwZXMuTyxcbiAgICBtdWx0aXBsZTogdHJ1ZSxcbiAgfSxcbiAgY29sOiB7XG4gICAgZGF0YVR5cGVzOiB2bC5kYXRhVHlwZXMuTyxcbiAgICBtdWx0aXBsZTogdHJ1ZVxuICB9LFxuICBzaGFwZToge1xuICAgIGRhdGFUeXBlczogdmwuZGF0YVR5cGVzLk9cbiAgfSxcbiAgc2l6ZToge1xuICAgIGRhdGFUeXBlczogdmwuZGF0YVR5cGVzLlFcbiAgfSxcbiAgY29sb3I6IHtcbiAgICBkYXRhVHlwZXM6IHZsLmRhdGFUeXBlcy5PICsgdmwuZGF0YVR5cGVzLlFcbiAgfSxcbiAgYWxwaGE6IHtcbiAgICBkYXRhVHlwZXM6IHZsLmRhdGFUeXBlcy5RXG4gIH0sXG4gIHRleHQ6IHtcbiAgICBkYXRhVHlwZXM6IEFOWV9EQVRBX1RZUEVTXG4gIH1cbiAgLy9nZW86IHtcbiAgLy8gIGRhdGFUeXBlczogW3ZsLmRhdGFUeXBlcy5HXVxuICAvL30sXG4gIC8vYXJjOiB7IC8vIHBpZVxuICAvL1xuICAvL31cbn07XG5cbmZ1bmN0aW9uIG1heENhcmRpbmFsaXR5KGZpZWxkLCBzdGF0cykge1xuICByZXR1cm4gc3RhdHNbZmllbGRdLmNhcmRpbmFsaXR5IDw9IDIwO1xufVxuXG5mdW5jdGlvbiBnZW5lcmFsUnVsZXMoZW5jLCBvcHQpIHtcbiAgLy8gbmVlZCBhdCBsZWFzdCBvbmUgYmFzaWMgZW5jb2RpbmdcbiAgaWYgKGVuYy54IHx8IGVuYy55IHx8IGVuYy5nZW8gfHwgZW5jLnRleHQgfHwgZW5jLmFyYykge1xuXG4gICAgaWYgKGVuYy54ICYmIGVuYy55KSB7XG4gICAgICAvLyBzaG93IG9ubHkgb25lIE94TywgUXhRXG4gICAgICBpZiAob3B0Lm9taXRUcmFucG9zZSAmJiBlbmMueC50eXBlID09IGVuYy55LnR5cGUpIHtcbiAgICAgICAgLy9UT0RPIGJldHRlciBjcml0ZXJpYSB0aGFuIG5hbWVcbiAgICAgICAgaWYgKGVuYy54Lm5hbWUgPiBlbmMueS5uYW1lKSByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGVuYy5yb3cgfHwgZW5jLmNvbCkgeyAvL2hhdmUgZmFjZXQocylcbiAgICAgIC8vIGRvbid0IHVzZSBmYWNldHMgYmVmb3JlIGZpbGxpbmcgdXAgeCx5XG4gICAgICBpZiAoKCFlbmMueCB8fCAhZW5jLnkpKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIGlmIChvcHQub21pdEFnZ3JXaXRoQWxsRGltc09uRmFjZXRzKSB7XG4gICAgICAgIC8vIGRvbid0IHVzZSBmYWNldCB3aXRoIGFnZ3JlZ2F0ZSBwbG90IHdpdGggb3RoZXIgb3RoZXIgb3JkaW5hbCBvbiBMT0RcblxuICAgICAgICB2YXIgaGFzQWdnciA9IGZhbHNlLCBoYXNPdGhlck8gPSBmYWxzZTtcbiAgICAgICAgZm9yICh2YXIgZW5jVHlwZSBpbiBlbmMpIHtcbiAgICAgICAgICB2YXIgZmllbGQgPSBlbmNbZW5jVHlwZV07XG4gICAgICAgICAgaWYgKGZpZWxkLmFnZ3IpIHtcbiAgICAgICAgICAgIGhhc0FnZ3IgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodXRpbC5pc0RpbShmaWVsZCkgJiYgKGVuY1R5cGUgIT09ICdyb3cnICYmIGVuY1R5cGUgIT09ICdjb2wnKSkge1xuICAgICAgICAgICAgaGFzT3RoZXJPID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGhhc0FnZ3IgJiYgaGFzT3RoZXJPKSBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChoYXNBZ2dyICYmICFoYXNPdGhlck8pIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBvbmUgZGltZW5zaW9uIFwiY291bnRcIiBpcyB1c2VsZXNzXG4gICAgaWYgKGVuYy54ICYmIGVuYy54LmFnZ3IgPT0gJ2NvdW50JyAmJiAhZW5jLnkpIHJldHVybiBmYWxzZTtcbiAgICBpZiAoZW5jLnkgJiYgZW5jLnkuYWdnciA9PSAnY291bnQnICYmICFlbmMueCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBnZW5FbmNzKGVuY3MsIGZpZWxkcywgc3RhdHMsIG9wdCkge1xuICBvcHQgPSB2bC5zY2hlbWEudXRpbC5leHRlbmQob3B0fHx7fSwgY29uc3RzLmdlbi5lbmNvZGluZ3MpO1xuICAvLyBnZW5lcmF0ZSBhIGNvbGxlY3Rpb24gdmVnYWxpdGUncyBlbmNcbiAgdmFyIHRtcEVuYyA9IHt9O1xuXG4gIGZ1bmN0aW9uIGFzc2lnbkZpZWxkKGkpIHtcbiAgICAvLyBJZiBhbGwgZmllbGRzIGFyZSBhc3NpZ25lZCwgc2F2ZVxuICAgIGlmIChpID09PSBmaWVsZHMubGVuZ3RoKSB7XG4gICAgICAvLyBhdCB0aGUgbWluaW1hbCBhbGwgY2hhcnQgc2hvdWxkIGhhdmUgeCwgeSwgZ2VvLCB0ZXh0IG9yIGFyY1xuICAgICAgaWYgKGdlbmVyYWxSdWxlcyh0bXBFbmMsIG9wdCkpIHtcbiAgICAgICAgZW5jcy5wdXNoKHZsLmR1cGxpY2F0ZSh0bXBFbmMpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBPdGhlcndpc2UsIGFzc2lnbiBpLXRoIGZpZWxkXG4gICAgdmFyIGZpZWxkID0gZmllbGRzW2ldO1xuICAgIGZvciAodmFyIGogaW4gdmwuZW5jb2RpbmdUeXBlcykge1xuICAgICAgdmFyIGV0ID0gdmwuZW5jb2RpbmdUeXBlc1tqXTtcblxuICAgICAgLy9UT0RPOiBzdXBwb3J0IFwibXVsdGlwbGVcIiBhc3NpZ25tZW50XG4gICAgICBpZiAoIShldCBpbiB0bXBFbmMpICYmIC8vIGVuY29kaW5nIG5vdCB1c2VkXG4gICAgICAgIChydWxlc1tldF0uZGF0YVR5cGVzICYgdmwuZGF0YVR5cGVzW2ZpZWxkLnR5cGVdKSA+IDAgJiZcbiAgICAgICAgKCFydWxlc1tldF0ucnVsZXMgfHwgIXJ1bGVzW2V0XS5ydWxlcyhmaWVsZCwgc3RhdHMpKVxuICAgICAgICApIHtcbiAgICAgICAgdG1wRW5jW2V0XSA9IGZpZWxkO1xuICAgICAgICBhc3NpZ25GaWVsZChpICsgMSk7XG4gICAgICAgIGRlbGV0ZSB0bXBFbmNbZXRdO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFzc2lnbkZpZWxkKDApO1xuXG4gIHJldHVybiBlbmNzO1xufVxuIiwidmFyIHZsID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cudmwgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLnZsIDogbnVsbCksXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cbnZhciBnZW4gPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgLy8gZGF0YSB2YXJpYXRpb25zXG4gIGFnZ3JlZ2F0ZXM6IHJlcXVpcmUoJy4vYWdncmVnYXRlcycpLFxuICBwcm9qZWN0aW9uczogcmVxdWlyZSgnLi9wcm9qZWN0aW9ucycpLFxuICAvLyBlbmNvZGluZ3MgLyB2aXN1YWwgdmFyaWF0b25zXG4gIGVuY29kaW5nczogcmVxdWlyZSgnLi9lbmNvZGluZ3MnKSxcbiAgZW5jczogcmVxdWlyZSgnLi9lbmNzJyksXG4gIG1hcmt0eXBlczogcmVxdWlyZSgnLi9tYXJrdHlwZXMnKVxufTtcblxuLy9GSVhNRSBtb3ZlIHRoZXNlIHRvIHZsXG52YXIgQUdHUkVHQVRJT05fRk4gPSB7IC8vYWxsIHBvc3NpYmxlIGFnZ3JlZ2F0ZSBmdW5jdGlvbiBsaXN0ZWQgYnkgZWFjaCBkYXRhIHR5cGVcbiAgUTogdmwuc2NoZW1hLmFnZ3Iuc3VwcG9ydGVkRW51bXMuUVxufTtcblxudmFyIFRSQU5TRk9STV9GTiA9IHsgLy9hbGwgcG9zc2libGUgdHJhbnNmb3JtIGZ1bmN0aW9uIGxpc3RlZCBieSBlYWNoIGRhdGEgdHlwZVxuICAvLyBROiBbJ2xvZycsICdzcXJ0JywgJ2FicyddLCAvLyBcImxvZ2l0P1wiXG4gIFQ6IHZsLnNjaGVtYS50aW1lZm5zXG59O1xuXG5nZW4uY2hhcnRzID0gZnVuY3Rpb24oZmllbGRzLCBvcHQsIGNmZywgZmxhdCkge1xuICBvcHQgPSB1dGlsLmdlbi5nZXRPcHQob3B0KTtcbiAgZmxhdCA9IGZsYXQgPT09IHVuZGVmaW5lZCA/IHtlbmNvZGluZ3M6IDF9IDogZmxhdDtcblxuICAvLyBUT0RPIGdlbmVyYXRlXG5cbiAgLy8gZ2VuZXJhdGUgcGVybXV0YXRpb24gb2YgZW5jb2RpbmcgbWFwcGluZ3NcbiAgdmFyIGZpZWxkU2V0cyA9IG9wdC5nZW5BZ2dyID8gZ2VuLmFnZ3JlZ2F0ZXMoW10sIGZpZWxkcywgb3B0KSA6IFtmaWVsZHNdLFxuICAgIGVuY3MsIGNoYXJ0cywgbGV2ZWwgPSAwO1xuXG4gIGlmIChmbGF0ID09PSB0cnVlIHx8IChmbGF0ICYmIGZsYXQuYWdncikpIHtcbiAgICBlbmNzID0gZmllbGRTZXRzLnJlZHVjZShmdW5jdGlvbihvdXRwdXQsIGZpZWxkcykge1xuICAgICAgcmV0dXJuIGdlbi5lbmNzKG91dHB1dCwgZmllbGRzLCBvcHQpO1xuICAgIH0sIFtdKTtcbiAgfSBlbHNlIHtcbiAgICBlbmNzID0gZmllbGRTZXRzLm1hcChmdW5jdGlvbihmaWVsZHMpIHtcbiAgICAgIHJldHVybiBnZW4uZW5jcyhbXSwgZmllbGRzLCBvcHQpO1xuICAgIH0sIHRydWUpO1xuICAgIGxldmVsICs9IDE7XG4gIH1cblxuICBpZiAoZmxhdCA9PT0gdHJ1ZSB8fCAoZmxhdCAmJiBmbGF0LmVuY29kaW5ncykpIHtcbiAgICBjaGFydHMgPSB1dGlsLm5lc3RlZFJlZHVjZShlbmNzLCBmdW5jdGlvbihvdXRwdXQsIGVuYykge1xuICAgICAgcmV0dXJuIGdlbi5tYXJrdHlwZXMob3V0cHV0LCBlbmMsIG9wdCwgY2ZnKTtcbiAgICB9LCBsZXZlbCwgdHJ1ZSk7XG4gIH0gZWxzZSB7XG4gICAgY2hhcnRzID0gdXRpbC5uZXN0ZWRNYXAoZW5jcywgZnVuY3Rpb24oZW5jKSB7XG4gICAgICByZXR1cm4gZ2VuLm1hcmt0eXBlcyhbXSwgZW5jLCBvcHQsIGNmZyk7XG4gICAgfSwgbGV2ZWwsIHRydWUpO1xuICAgIGxldmVsICs9IDE7XG4gIH1cbiAgcmV0dXJuIGNoYXJ0cztcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciB2bCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LnZsIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC52bCA6IG51bGwpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpLFxuICByYW5rID0gcmVxdWlyZSgnLi4vcmFuay9yYW5rJyksXG4gIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG91dHB1dCwgZW5jLCBvcHQsIGNmZykge1xuICBvcHQgPSB2bC5zY2hlbWEudXRpbC5leHRlbmQob3B0fHx7fSwgY29uc3RzLmdlbi5lbmNvZGluZ3MpO1xuXG4gIGdldFN1cHBvcnRlZE1hcmtUeXBlcyhlbmMsIG9wdClcbiAgICAuZm9yRWFjaChmdW5jdGlvbihtYXJrVHlwZSkge1xuICAgICAgdmFyIGVuY29kaW5nID0geyBtYXJrdHlwZTogbWFya1R5cGUsIGVuYzogZW5jLCBjZmc6IGNmZyB9LFxuICAgICAgICBzY29yZSA9IHJhbmsuZW5jb2RpbmcoZW5jb2RpbmcpO1xuICAgICAgZW5jb2Rpbmcuc2NvcmUgPSBzY29yZS5zY29yZTtcbiAgICAgIGVuY29kaW5nLnNjb3JlRmVhdHVyZXMgPSBzY29yZS5mZWF0dXJlcztcbiAgICAgIG91dHB1dC5wdXNoKGVuY29kaW5nKTtcbiAgICB9KTtcbiAgcmV0dXJuIG91dHB1dDtcbn07XG5cbnZhciBtYXJrc1J1bGUgPSB7XG4gIHBvaW50OiAgcG9pbnRSdWxlLFxuICBiYXI6ICAgIGJhclJ1bGUsXG4gIGxpbmU6ICAgbGluZVJ1bGUsXG4gIGFyZWE6ICAgbGluZVJ1bGUsIC8vIGFyZWEgaXMgc2ltaWxhciB0byBsaW5lXG4gIHRleHQ6ICAgdGV4dFJ1bGVcbn07XG5cbi8vVE9ETyhrYW5pdHcpOiB3cml0ZSB0ZXN0IGNhc2VcbmZ1bmN0aW9uIGdldFN1cHBvcnRlZE1hcmtUeXBlcyhlbmMsIG9wdCkge1xuICB2YXIgbWFya1R5cGVzID0gb3B0Lm1hcmt0eXBlTGlzdC5maWx0ZXIoZnVuY3Rpb24obWFya1R5cGUpIHtcbiAgICB2YXIgbWFyayA9IHZsLmNvbXBpbGUubWFya3NbbWFya1R5cGVdLFxuICAgICAgcmVxcyA9IG1hcmsucmVxdWlyZWRFbmNvZGluZyxcbiAgICAgIHN1cHBvcnQgPSBtYXJrLnN1cHBvcnRlZEVuY29kaW5nO1xuXG4gICAgZm9yICh2YXIgaSBpbiByZXFzKSB7IC8vIGFsbCByZXF1aXJlZCBlbmNvZGluZ3MgaW4gZW5jXG4gICAgICBpZiAoIShyZXFzW2ldIGluIGVuYykpIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBlbmNUeXBlIGluIGVuYykgeyAvLyBhbGwgZW5jb2RpbmdzIGluIGVuYyBhcmUgc3VwcG9ydGVkXG4gICAgICBpZiAoIXN1cHBvcnRbZW5jVHlwZV0pIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gIW1hcmtzUnVsZVttYXJrVHlwZV0gfHwgbWFya3NSdWxlW21hcmtUeXBlXShlbmMsIG9wdCk7XG4gIH0pO1xuXG4gIC8vY29uc29sZS5sb2coJ2VuYzonLCB1dGlsLmpzb24oZW5jKSwgXCIgfiBtYXJrczpcIiwgbWFya1R5cGVzKTtcblxuICByZXR1cm4gbWFya1R5cGVzO1xufVxuXG5mdW5jdGlvbiBwb2ludFJ1bGUoZW5jLCBvcHQpIHtcbiAgaWYgKGVuYy54ICYmIGVuYy55KSB7XG4gICAgLy8gaGF2ZSBib3RoIHggJiB5ID09PiBzY2F0dGVyIHBsb3QgLyBidWJibGUgcGxvdFxuXG4gICAgLy8gRm9yIE94UVxuICAgIGlmIChvcHQub21pdFRyYW5wb3NlICYmIHV0aWwueE95UShlbmMpKSB7XG4gICAgICAvLyBpZiBvbWl0VHJhbnBvc2UsIHB1dCBRIG9uIFgsIE8gb24gWVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIEZvciBPeE9cbiAgICBpZiAodXRpbC5pc0RpbShlbmMueCkgJiYgdXRpbC5pc0RpbShlbmMueSkpIHtcbiAgICAgIC8vIHNoYXBlIGRvZXNuJ3Qgd29yayB3aXRoIGJvdGggeCwgeSBhcyBvcmRpbmFsXG4gICAgICBpZiAoZW5jLnNoYXBlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gVE9ETyhrYW5pdHcpOiBjaGVjayB0aGF0IHRoZXJlIGlzIHF1YW50IGF0IGxlYXN0IC4uLlxuICAgICAgaWYgKGVuYy5jb2xvciAmJiB1dGlsLmlzRGltKGVuYy5jb2xvcikpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICB9IGVsc2UgeyAvLyBwbG90IHdpdGggb25lIGF4aXMgPSBkb3QgcGxvdFxuICAgIC8vIERvdCBwbG90IHNob3VsZCBhbHdheXMgYmUgaG9yaXpvbnRhbFxuICAgIGlmIChvcHQub21pdFRyYW5wb3NlICYmIGVuYy55KSByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBkb3QgcGxvdCBzaG91bGRuJ3QgaGF2ZSBvdGhlciBlbmNvZGluZ1xuICAgIGlmIChvcHQub21pdERvdFBsb3RXaXRoRXh0cmFFbmNvZGluZyAmJiB2bC5rZXlzKGVuYykubGVuZ3RoID4gMSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gZG90IHBsb3Qgd2l0aCBzaGFwZSBpcyBub24tc2Vuc2VcbiAgICBpZiAoZW5jLnNoYXBlKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGJhclJ1bGUoZW5jLCBvcHQpIHtcbiAgLy8gbmVlZCB0byBhZ2dyZWdhdGUgb24gZWl0aGVyIHggb3IgeVxuICBpZiAoKChlbmMueC5hZ2dyICE9PSB1bmRlZmluZWQpIF4gKGVuYy55LmFnZ3IgIT09IHVuZGVmaW5lZCkpICYmXG4gICAgICAodmwuZmllbGQuaXNPcmRpbmFsU2NhbGUoZW5jLngpIF4gdmwuZmllbGQuaXNPcmRpbmFsU2NhbGUoZW5jLnkpKSkge1xuXG4gICAgLy8gaWYgb21pdFRyYW5wb3NlLCBwdXQgUSBvbiBYLCBPIG9uIFlcbiAgICBpZiAob3B0Lm9taXRUcmFucG9zZSAmJiB1dGlsLnhPeVEoZW5jKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGxpbmVSdWxlKGVuYywgb3B0KSB7XG4gIC8vIFRPRE8oa2FuaXR3KTogYWRkIG9taXRWZXJ0aWNhbExpbmUgYXMgY29uZmlnXG5cbiAgLy8gTGluZSBjaGFydCBzaG91bGQgYmUgb25seSBob3Jpem9udGFsXG4gIC8vIGFuZCB1c2Ugb25seSB0ZW1wb3JhbCBkYXRhXG4gIHJldHVybiBlbmMueCA9PSAnVCcgJiYgZW5jLnkgPT0gJ1EnO1xufVxuXG5mdW5jdGlvbiB0ZXh0UnVsZShlbmMsIG9wdCkge1xuICAvLyBGSVhNRSBzaG91bGQgYmUgYWdncmVnYXRlZFxuICAvLyBhdCBsZWFzdCBtdXN0IGhhdmUgcm93IG9yIGNvbFxuICByZXR1cm4gZW5jLnJvdyB8fCBlbmMuY29sO1xufSIsInZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpLFxuICBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKSxcbiAgdmwgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy52bCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwudmwgOiBudWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBwcm9qZWN0aW9ucztcblxuLyoqXG4gKiBmaWVsZHNcbiAqIEBwYXJhbSAge1t0eXBlXX0gZmllbGRzIGFycmF5IG9mIGZpZWxkcyBhbmQgcXVlcnkgaW5mb3JtYXRpb25cbiAqIEByZXR1cm4ge1t0eXBlXX0gICAgICAgIFtkZXNjcmlwdGlvbl1cbiAqL1xuZnVuY3Rpb24gcHJvamVjdGlvbnMoZmllbGRzLCBvcHQpIHtcbiAgb3B0ID0gdmwuc2NoZW1hLnV0aWwuZXh0ZW5kKG9wdHx8e30sIGNvbnN0cy5nZW4ucHJvamVjdGlvbnMpO1xuICAvLyBUT0RPIHN1cHBvcnQgb3RoZXIgbW9kZSBvZiBwcm9qZWN0aW9ucyBnZW5lcmF0aW9uXG4gIC8vIHBvd2Vyc2V0LCBjaG9vc2VLLCBjaG9vc2VLb3JMZXNzIGFyZSBhbHJlYWR5IGluY2x1ZGVkIGluIHRoZSB1dGlsXG4gIC8vIFJpZ2h0IG5vdyBqdXN0IGFkZCBvbmUgbW9yZSBmaWVsZFxuXG4gIHZhciBzZWxlY3RlZCA9IFtdLCB1bnNlbGVjdGVkID0gW10sIGZpZWxkU2V0cyA9IFtdO1xuXG4gIGZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uKGZpZWxkKXtcbiAgICBpZiAoZmllbGQuc2VsZWN0ZWQpIHtcbiAgICAgIHNlbGVjdGVkLnB1c2goZmllbGQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB1bnNlbGVjdGVkLnB1c2goZmllbGQpO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIHNldHNUb0FkZCA9IHV0aWwuY2hvb3NlS29yTGVzcyh1bnNlbGVjdGVkLCAxKTtcblxuICBzZXRzVG9BZGQuZm9yRWFjaChmdW5jdGlvbihzZXRUb0FkZCkge1xuICAgIHZhciBmaWVsZFNldCA9IHNlbGVjdGVkLmNvbmNhdChzZXRUb0FkZCk7XG4gICAgaWYgKGZpZWxkU2V0Lmxlbmd0aCA+IDApIHtcbiAgICAgIGlmIChmaWVsZFNldC5sZW5ndGggPT09IDEgJiYgdmwuZmllbGQuaXNDb3VudChmaWVsZFNldFswXSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gYWx3YXlzIGFwcGVuZCBwcm9qZWN0aW9uJ3Mga2V5IHRvIGVhY2ggcHJvamVjdGlvbiByZXR1cm5lZCwgZDMgc3R5bGUuXG4gICAgICBmaWVsZFNldHMucHVzaChmaWVsZFNldCk7XG4gICAgfVxuICB9KTtcblxuICBpZiAob3B0LmFkZENvdW50SWZOb3RoaW5nSXNTZWxlY3RlZCAmJiBzZWxlY3RlZC5sZW5ndGg9PT0wKSB7XG4gICAgdmFyIGNvdW50RmllbGQgPSB2bC5maWVsZC5jb3VudCgpO1xuXG4gICAgdW5zZWxlY3RlZC5mb3JFYWNoKGZ1bmN0aW9uKGZpZWxkKSB7XG4gICAgICBpZiAoIXZsLmZpZWxkLmlzQ291bnQoZmllbGQpKSB7XG4gICAgICAgIGZpZWxkU2V0cy5wdXNoKFtmaWVsZCwgY291bnRGaWVsZF0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZmllbGRTZXRzLmZvckVhY2goZnVuY3Rpb24oZmllbGRTZXQpIHtcbiAgICBmaWVsZFNldC5rZXkgPSBwcm9qZWN0aW9ucy5rZXkoZmllbGRTZXQpO1xuICB9KTtcblxuICByZXR1cm4gZmllbGRTZXRzO1xufVxuXG5wcm9qZWN0aW9ucy5rZXkgPSBmdW5jdGlvbihwcm9qZWN0aW9uKSB7XG4gIHJldHVybiBwcm9qZWN0aW9uLm1hcChmdW5jdGlvbihmaWVsZCkge1xuICAgIHJldHVybiB2bC5maWVsZC5pc0NvdW50KGZpZWxkKSA/ICdjb3VudCcgOiBmaWVsZC5uYW1lO1xuICB9KS5qb2luKCcsJyk7XG59O1xuIiwidmFyIGcgPSBnbG9iYWwgfHwgd2luZG93O1xuXG5nLkNIQVJUX1RZUEVTID0ge1xuICBUQUJMRTogJ1RBQkxFJyxcbiAgQkFSOiAnQkFSJyxcbiAgUExPVDogJ1BMT1QnLFxuICBMSU5FOiAnTElORScsXG4gIEFSRUE6ICdBUkVBJyxcbiAgTUFQOiAnTUFQJyxcbiAgSElTVE9HUkFNOiAnSElTVE9HUkFNJ1xufTtcblxuZy5BTllfREFUQV9UWVBFUyA9ICgxIDw8IDQpIC0gMTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJhbmtQcm9qZWN0aW9ucztcblxuZnVuY3Rpb24gcmFua1Byb2plY3Rpb25zKHNlbGVjdGVkRmllbGRzLCBwcm9qZWN0aW9uKSB7XG5cbn1cblxuIiwidmFyIHZsID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cudmwgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLnZsIDogbnVsbCk7XG5cbnZhciByYW5rID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIHByb2plY3Rpb25zOiByZXF1aXJlKCcuL3JhbmstcHJvamVjdGlvbnMnKVxufTtcblxuLy9UT0RPIGxvd2VyIHNjb3JlIGlmIHdlIHVzZSBHIGFzIE8/XG52YXIgRU5DT0RJTkdfU0NPUkUgPSB7XG4gIFE6IHtcbiAgICB4OiAxLCAvLyBiZXR0ZXIgZm9yIHNpbmdsZSBwbG90XG4gICAgeTogMC45OSxcbiAgICBzaXplOiAwLjYsIC8vRklYTUUgU0laRSBmb3IgQmFyIGlzIGhvcnJpYmxlIVxuICAgIGNvbG9yOiAwLjQsXG4gICAgYWxwaGE6IDAuNFxuICB9LFxuICBPOiB7IC8vIFRPRE8gbmVlZCB0byB0YWtlIGNhcmRpbmFsaXR5IGludG8gYWNjb3VudFxuICAgIHg6IDAuOTksIC8vIGhhcmRlciB0byByZWFkIGF4aXNcbiAgICB5OiAxLFxuICAgIHJvdzogMC43LFxuICAgIGNvbDogMC43LFxuICAgIGNvbG9yOiAwLjgsXG4gICAgc2hhcGU6IDAuNlxuICB9LFxuICBUOiB7IC8vIEZJWCByZXRoaW5rIHRoaXNcbiAgICB4OiAxLFxuICAgIHk6IDAuOCxcbiAgICByb3c6IDAuNCxcbiAgICBjb2w6IDAuNCxcbiAgICBjb2xvcjogMC4zLFxuICAgIHNoYXBlOiAwLjNcbiAgfVxufTtcblxuLy8gYmFkIHNjb3JlIG5vdCBzcGVjaWZpZWQgaW4gdGhlIHRhYmxlIGFib3ZlXG52YXIgQkFEX0VOQ09ESU5HX1NDT1JFID0gMC4wMSxcbiAgVU5VU0VEX1BPU0lUSU9OID0gMC41O1xuXG52YXIgTUFSS19TQ09SRSA9IHtcbiAgbGluZTogMC45OSxcbiAgYXJlYTogMC45OCxcbiAgYmFyOiAwLjk3LFxuICBwb2ludDogMC45NixcbiAgY2lyY2xlOiAwLjk1LFxuICBzcXVhcmU6IDAuOTUsXG4gIHRleHQ6IDAuOFxufTtcblxucmFuay5lbmNvZGluZyA9IGZ1bmN0aW9uKGVuY29kaW5nKSB7XG4gIHZhciBmZWF0dXJlcyA9IHt9LFxuICAgIGVuY1R5cGVzID0gdmwua2V5cyhlbmNvZGluZy5lbmMpO1xuICBlbmNUeXBlcy5mb3JFYWNoKGZ1bmN0aW9uKGVuY1R5cGUpIHtcbiAgICB2YXIgZmllbGQgPSBlbmNvZGluZy5lbmNbZW5jVHlwZV07XG4gICAgZmVhdHVyZXNbZmllbGQubmFtZV0gPSB7XG4gICAgICB2YWx1ZTogZmllbGQudHlwZSArICc6JysgZW5jVHlwZSxcbiAgICAgIHNjb3JlOiBFTkNPRElOR19TQ09SRVtmaWVsZC50eXBlXVtlbmNUeXBlXSB8fCBCQURfRU5DT0RJTkdfU0NPUkVcbiAgICB9O1xuICB9KTtcblxuICAvLyBwZW5hbGl6ZSBub3QgdXNpbmcgcG9zaXRpb25hbFxuICBpZiAoZW5jVHlwZXMubGVuZ3RoID4gMSkge1xuICAgIGlmICgoIWVuY29kaW5nLmVuYy54IHx8ICFlbmNvZGluZy5lbmMueSkgJiYgIWVuY29kaW5nLmVuYy5nZW8pIHtcbiAgICAgIGZlYXR1cmVzLnVudXNlZFBvc2l0aW9uID0ge3Njb3JlOiBVTlVTRURfUE9TSVRJT059O1xuICAgIH1cbiAgfVxuXG4gIGZlYXR1cmVzLm1hcmtUeXBlID0ge1xuICAgIHZhbHVlOiBlbmNvZGluZy5tYXJrdHlwZSxcbiAgICBzY29yZTogTUFSS19TQ09SRVtlbmNvZGluZy5tYXJrdHlwZV1cbiAgfTtcblxuICByZXR1cm4ge1xuICAgIHNjb3JlOiB2bC5rZXlzKGZlYXR1cmVzKS5yZWR1Y2UoZnVuY3Rpb24ocCwgcykge1xuICAgICAgcmV0dXJuIHAgKiBmZWF0dXJlc1tzXS5zY29yZTtcbiAgICB9LCAxKSxcbiAgICBmZWF0dXJlczogZmVhdHVyZXNcbiAgfTtcbn07XG5cblxuLy8gcmF3ID4gYXZnLCBzdW0gPiBtaW4sbWF4ID4gYmluXG5cbnJhbmsuZmllbGRzU2NvcmUgPSBmdW5jdGlvbihmaWVsZHMpIHtcblxufTtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBjb25zdHMgPSByZXF1aXJlKCcuL2NvbnN0cycpO1xuXG52YXIgdXRpbCA9IG1vZHVsZS5leHBvcnRzID0ge1xuICBnZW46IHt9XG59O1xuXG4vLyBGSVhNRSBkaXN0aW5ndWlzaCBiZXR3ZWVuIHJhdyAvIGFnZ3JlZ2F0ZSBwbG90XG52YXIgaXNEaW0gPSB1dGlsLmlzRGltID0gZnVuY3Rpb24gKGZpZWxkKSB7XG4gIHJldHVybiBmaWVsZC5iaW4gfHwgZmllbGQudHlwZSA9PT0gJ08nIHx8XG4gICAgKGZpZWxkLnR5cGUgPT09ICdUJyAmJiBmaWVsZC5mbik7XG59O1xuXG51dGlsLnhPeVEgPSBmdW5jdGlvbiB4T3lRIChlbmMpIHtcbiAgcmV0dXJuIGVuYy54ICYmIGVuYy55ICYmIGlzRGltKGVuYy54KSAmJiAhaXNEaW0oZW5jLnkpO1xufTtcblxudXRpbC5pc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiB7fS50b1N0cmluZy5jYWxsKG9iaikgPT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG5cbnV0aWwuanNvbiA9IGZ1bmN0aW9uKHMsIHNwKSB7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShzLCBudWxsLCBzcCk7XG59O1xuXG51dGlsLmtleXMgPSBmdW5jdGlvbihvYmopIHtcbiAgdmFyIGsgPSBbXSwgeDtcbiAgZm9yICh4IGluIG9iaikgay5wdXNoKHgpO1xuICByZXR1cm4gaztcbn07XG5cbnV0aWwubmVzdGVkTWFwID0gZnVuY3Rpb24gKGNvbCwgZiwgbGV2ZWwsIGZpbHRlcikge1xuICByZXR1cm4gbGV2ZWwgPT09IDAgP1xuICAgIGNvbC5tYXAoZikgOlxuICAgIGNvbC5tYXAoZnVuY3Rpb24odikge1xuICAgICAgdmFyIHIgPSB1dGlsLm5lc3RlZE1hcCh2LCBmLCBsZXZlbCAtIDEpO1xuICAgICAgcmV0dXJuIGZpbHRlciA/IHIuZmlsdGVyKHV0aWwubm9uRW1wdHkpIDogcjtcbiAgICB9KTtcbn07XG5cbnV0aWwubmVzdGVkUmVkdWNlID0gZnVuY3Rpb24gKGNvbCwgZiwgbGV2ZWwsIGZpbHRlcikge1xuICByZXR1cm4gbGV2ZWwgPT09IDAgP1xuICAgIGNvbC5yZWR1Y2UoZiwgW10pIDpcbiAgICBjb2wubWFwKGZ1bmN0aW9uKHYpIHtcbiAgICAgIHZhciByID0gdXRpbC5uZXN0ZWRSZWR1Y2UodiwgZiwgbGV2ZWwgLSAxKTtcbiAgICAgIHJldHVybiBmaWx0ZXIgPyByLmZpbHRlcih1dGlsLm5vbkVtcHR5KSA6IHI7XG4gICAgfSk7XG59O1xuXG51dGlsLm5vbkVtcHR5ID0gZnVuY3Rpb24oZ3JwKSB7XG4gIHJldHVybiAhdXRpbC5pc0FycmF5KGdycCkgfHwgZ3JwLmxlbmd0aCA+IDA7XG59O1xuXG5cbnV0aWwudHJhdmVyc2UgPSBmdW5jdGlvbiAobm9kZSwgYXJyKSB7XG4gIGlmIChub2RlLnZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICBhcnIucHVzaChub2RlLnZhbHVlKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAobm9kZS5sZWZ0KSB1dGlsLnRyYXZlcnNlKG5vZGUubGVmdCwgYXJyKTtcbiAgICBpZiAobm9kZS5yaWdodCkgdXRpbC50cmF2ZXJzZShub2RlLnJpZ2h0LCBhcnIpO1xuICB9XG4gIHJldHVybiBhcnI7XG59O1xuXG51dGlsLnVuaW9uID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgdmFyIG8gPSB7fTtcbiAgYS5mb3JFYWNoKGZ1bmN0aW9uKHgpIHsgb1t4XSA9IHRydWU7fSk7XG4gIGIuZm9yRWFjaChmdW5jdGlvbih4KSB7IG9beF0gPSB0cnVlO30pO1xuICByZXR1cm4gdXRpbC5rZXlzKG8pO1xufTtcblxuXG51dGlsLmdlbi5nZXRPcHQgPSBmdW5jdGlvbiAob3B0KSB7XG4gIC8vbWVyZ2Ugd2l0aCBkZWZhdWx0XG4gIHJldHVybiAob3B0ID8gdXRpbC5rZXlzKG9wdCkgOiBbXSkucmVkdWNlKGZ1bmN0aW9uKGMsIGspIHtcbiAgICBjW2tdID0gb3B0W2tdO1xuICAgIHJldHVybiBjO1xuICB9LCBPYmplY3QuY3JlYXRlKGNvbnN0cy5nZW4uREVGQVVMVF9PUFQpKTtcbn07XG5cbi8qKlxuICogcG93ZXJzZXQgY29kZSBmcm9tIGh0dHA6Ly9yb3NldHRhY29kZS5vcmcvd2lraS9Qb3dlcl9TZXQjSmF2YVNjcmlwdFxuICpcbiAqICAgdmFyIHJlcyA9IHBvd2Vyc2V0KFsxLDIsMyw0XSk7XG4gKlxuICogcmV0dXJuc1xuICpcbiAqIFtbXSxbMV0sWzJdLFsxLDJdLFszXSxbMSwzXSxbMiwzXSxbMSwyLDNdLFs0XSxbMSw0XSxcbiAqIFsyLDRdLFsxLDIsNF0sWzMsNF0sWzEsMyw0XSxbMiwzLDRdLFsxLDIsMyw0XV1cbltlZGl0XVxuKi9cblxudXRpbC5wb3dlcnNldCA9IGZ1bmN0aW9uKGxpc3QpIHtcbiAgdmFyIHBzID0gW1xuICAgIFtdXG4gIF07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIGZvciAodmFyIGogPSAwLCBsZW4gPSBwcy5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgcHMucHVzaChwc1tqXS5jb25jYXQobGlzdFtpXSkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcHM7XG59O1xuXG51dGlsLmNob29zZUtvckxlc3MgPSBmdW5jdGlvbihsaXN0LCBrKSB7XG4gIHZhciBzdWJzZXQgPSBbW11dO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICBmb3IgKHZhciBqID0gMCwgbGVuID0gc3Vic2V0Lmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICB2YXIgc3ViID0gc3Vic2V0W2pdLmNvbmNhdChsaXN0W2ldKTtcbiAgICAgIGlmKHN1Yi5sZW5ndGggPD0gayl7XG4gICAgICAgIHN1YnNldC5wdXNoKHN1Yik7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBzdWJzZXQ7XG59O1xuXG51dGlsLmNob29zZUsgPSBmdW5jdGlvbihsaXN0LCBrKSB7XG4gIHZhciBzdWJzZXQgPSBbW11dO1xuICB2YXIga0FycmF5ID1bXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgZm9yICh2YXIgaiA9IDAsIGxlbiA9IHN1YnNldC5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgdmFyIHN1YiA9IHN1YnNldFtqXS5jb25jYXQobGlzdFtpXSk7XG4gICAgICBpZihzdWIubGVuZ3RoIDwgayl7XG4gICAgICAgIHN1YnNldC5wdXNoKHN1Yik7XG4gICAgICB9ZWxzZSBpZiAoc3ViLmxlbmd0aCA9PT0gayl7XG4gICAgICAgIGtBcnJheS5wdXNoKHN1Yik7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBrQXJyYXk7XG59O1xuXG51dGlsLmNyb3NzID0gZnVuY3Rpb24oYSxiKXtcbiAgdmFyIHggPSBbXTtcbiAgZm9yKHZhciBpPTA7IGk8IGEubGVuZ3RoOyBpKyspe1xuICAgIGZvcih2YXIgaj0wO2o8IGIubGVuZ3RoOyBqKyspe1xuICAgICAgeC5wdXNoKGFbaV0uY29uY2F0KGJbal0pKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHg7XG59O1xuXG4iXX0=
