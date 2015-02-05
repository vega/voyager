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
  console.log(opt);
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

function genEncodings(output, fields, opt, cfg, nested) {
  var encs = genEncs([], fields, opt);

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

var ENCODING_RULES = {
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
    multiple: true
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

function rules(enc, opt) {
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

function genEncs(encs, fields, opt) {
  // generate a collection vegalite's enc
  var tmpEnc = {};

  function assignField(i) {
    // If all fields are assigned, save
    if (i === fields.length) {
      // at the minimal all chart should have x, y, geo, text or arc
      if (rules(tmpEnc, opt)) {
        encs.push(vl.duplicate(tmpEnc));
      }
      return;
    }

    // Otherwise, assign i-th field
    var field = fields[i];
    for (var j in vl.encodingTypes) {
      var et = vl.encodingTypes[j];

      //TODO: support "multiple" assignment
      if (!(et in tmpEnc) &&
        (ENCODING_RULES[et].dataTypes & vl.dataTypes[field.type]) > 0) {
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
  area:   lineRule // area is similar to line
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvdnIiLCJzcmMvY2x1c3Rlci9jbHVzdGVyLmpzIiwic3JjL2NsdXN0ZXIvY2x1c3RlcmNvbnN0cy5qcyIsInNyYy9jbHVzdGVyL2Rpc3RhbmNldGFibGUuanMiLCJzcmMvY29uc3RzLmpzIiwic3JjL2dlbi9hZ2dyZWdhdGVzLmpzIiwic3JjL2dlbi9lbmNvZGluZ3MuanMiLCJzcmMvZ2VuL2VuY3MuanMiLCJzcmMvZ2VuL2dlbi5qcyIsInNyYy9nZW4vbWFya3R5cGVzLmpzIiwic3JjL2dlbi9wcm9qZWN0aW9ucy5qcyIsInNyYy9nbG9iYWxzLmpzIiwic3JjL3JhbmsvcmFuay1wcm9qZWN0aW9ucy5qcyIsInNyYy9yYW5rL3JhbmsuanMiLCJzcmMvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNoSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQzdIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgdnIgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgY2x1c3RlcjogcmVxdWlyZSgnLi9jbHVzdGVyL2NsdXN0ZXInKSxcbiAgZ2VuOiByZXF1aXJlKCcuL2dlbi9nZW4nKSxcbiAgcmFuazogcmVxdWlyZSgnLi9yYW5rL3JhbmsnKSxcbiAgdXRpbDogcmVxdWlyZSgnLi91dGlsJylcbn07XG5cblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gY2x1c3RlcjtcblxudmFyIHZsID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cudmwgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLnZsIDogbnVsbCksXG4gIGNsdXN0ZXJmY2sgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5jbHVzdGVyZmNrIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5jbHVzdGVyZmNrIDogbnVsbCksXG4gIGNvbnN0cyA9IHJlcXVpcmUoJy4vY2x1c3RlcmNvbnN0cycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG52YXIgZGlzdGFuY2VUYWJsZSA9IGNsdXN0ZXIuZGlzdGFuY2VUYWJsZSA9IHJlcXVpcmUoJy4vZGlzdGFuY2V0YWJsZScpO1xuXG5cbmZ1bmN0aW9uIGNsdXN0ZXIoZW5jb2RpbmdzLCBtYXhEaXN0YW5jZSkge1xuICB2YXIgZGlzdCA9IGRpc3RhbmNlVGFibGUoZW5jb2RpbmdzKSxcbiAgICBuID0gZW5jb2RpbmdzLmxlbmd0aDtcblxuICB2YXIgY2x1c3RlclRyZWVzID0gY2x1c3RlcmZjay5oY2x1c3Rlcih2bC5yYW5nZShuKSwgZnVuY3Rpb24oaSwgaikge1xuICAgIHJldHVybiBkaXN0W2ldW2pdO1xuICB9LCAnYXZlcmFnZScsIGNvbnN0cy5DTFVTVEVSX1RIUkVTSE9MRCk7XG5cbiAgdmFyIGNsdXN0ZXJzID0gY2x1c3RlclRyZWVzLm1hcChmdW5jdGlvbih0cmVlKSB7XG4gICAgcmV0dXJuIHV0aWwudHJhdmVyc2UodHJlZSwgW10pO1xuICB9KTtcblxuICAvL2NvbnNvbGUubG9nKFwiY2x1c3RlcnNcIiwgY2x1c3RlcnMubWFwKGZ1bmN0aW9uKGMpeyByZXR1cm4gYy5qb2luKFwiK1wiKTsgfSkpO1xuICByZXR1cm4gY2x1c3RlcnM7XG59OyIsInZhciBjID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuYy5ESVNUX0JZX0VOQ1RZUEUgPSBbXG4gIC8vIHBvc2l0aW9uYWxcbiAgWyd4JywgJ3knLCAwLjJdLFxuICBbJ3JvdycsICdjb2wnLCAwLjJdLFxuXG4gIC8vIG9yZGluYWwgbWFyayBwcm9wZXJ0aWVzXG4gIFsnY29sb3InLCAnc2hhcGUnLCAwLjJdLFxuXG4gIC8vIHF1YW50aXRhdGl2ZSBtYXJrIHByb3BlcnRpZXNcbiAgWydjb2xvcicsICdhbHBoYScsIDAuMl0sXG4gIFsnc2l6ZScsICdhbHBoYScsIDAuMl0sXG4gIFsnc2l6ZScsICdjb2xvcicsIDAuMl1cbl0ucmVkdWNlKGZ1bmN0aW9uKHIsIHgpIHtcbnZhciBhID0geFswXSwgYiA9IHhbMV0sIGQgPSB4WzJdO1xuICByW2FdID0gclthXSB8fCB7fTtcbiAgcltiXSA9IHJbYl0gfHwge307XG4gIHJbYV1bYl0gPSByW2JdW2FdID0gZDtcbiAgcmV0dXJuIHI7XG59LCB7fSk7XG5cbmMuRElTVF9NSVNTSU5HID0gMTAwO1xuXG5jLkNMVVNURVJfVEhSRVNIT0xEID0gMTsiLCJ2YXIgdmwgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy52bCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwudmwgOiBudWxsKSxcbiAgY29uc3RzID0gcmVxdWlyZSgnLi9jbHVzdGVyY29uc3RzJyksXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZGlzdGFuY2VUYWJsZTtcblxuZnVuY3Rpb24gZGlzdGFuY2VUYWJsZShlbmNvZGluZ3MpIHtcbiAgdmFyIGxlbiA9IGVuY29kaW5ncy5sZW5ndGgsXG4gICAgY29sZW5jcyA9IGVuY29kaW5ncy5tYXAoZnVuY3Rpb24oZSkgeyByZXR1cm4gY29sZW5jKGUpO30pLFxuICAgIGRpZmYgPSBuZXcgQXJyYXkobGVuKSwgaSwgajtcblxuICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIGRpZmZbaV0gPSBuZXcgQXJyYXkobGVuKTtcblxuICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBmb3IgKGogPSBpICsgMTsgaiA8IGxlbjsgaisrKSB7XG4gICAgICBkaWZmW2pdW2ldID0gZGlmZltpXVtqXSA9IGdldERpc3RhbmNlKGNvbGVuY3NbaV0sIGNvbGVuY3Nbal0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGlmZjtcbn1cblxuZnVuY3Rpb24gZ2V0RGlzdGFuY2UoY29sZW5jMSwgY29sZW5jMikge1xuICB2YXIgY29scyA9IHV0aWwudW5pb24odmwua2V5cyhjb2xlbmMxLmNvbCksIHZsLmtleXMoY29sZW5jMi5jb2wpKSxcbiAgICBkaXN0ID0gMDtcblxuICBjb2xzLmZvckVhY2goZnVuY3Rpb24oY29sKSB7XG4gICAgdmFyIGUxID0gY29sZW5jMS5jb2xbY29sXSwgZTIgPSBjb2xlbmMyLmNvbFtjb2xdO1xuXG4gICAgaWYgKGUxICYmIGUyKSB7XG4gICAgICBpZiAoZTEudHlwZSAhPSBlMi50eXBlKSB7XG4gICAgICAgIGRpc3QgKz0gKGNvbnN0cy5ESVNUX0JZX0VOQ1RZUEVbZTEudHlwZV0gfHwge30pW2UyLnR5cGVdIHx8IDE7XG4gICAgICB9XG4gICAgICAvL0ZJWE1FIGFkZCBhZ2dyZWdhdGlvblxuICAgIH0gZWxzZSB7XG4gICAgICBkaXN0ICs9IGNvbnN0cy5ESVNUX01JU1NJTkc7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGRpc3Q7XG59XG5cbmZ1bmN0aW9uIGNvbGVuYyhlbmNvZGluZykge1xuICB2YXIgX2NvbGVuYyA9IHt9LFxuICAgIGVuYyA9IGVuY29kaW5nLmVuYztcblxuICB2bC5rZXlzKGVuYykuZm9yRWFjaChmdW5jdGlvbihlbmNUeXBlKSB7XG4gICAgdmFyIGUgPSB2bC5kdXBsaWNhdGUoZW5jW2VuY1R5cGVdKTtcbiAgICBlLnR5cGUgPSBlbmNUeXBlO1xuICAgIF9jb2xlbmNbZS5uYW1lIHx8ICcnXSA9IGU7XG4gICAgZGVsZXRlIGUubmFtZTtcbiAgfSk7XG5cbiAgcmV0dXJuIHtcbiAgICBtYXJrdHlwZTogZW5jb2RpbmcubWFya3R5cGUsXG4gICAgY29sOiBfY29sZW5jXG4gIH07XG59IiwidmFyIGNvbnN0cyA9IG1vZHVsZS5leHBvcnRzID0ge1xuICBnZW46IHt9LFxuICBjbHVzdGVyOiB7fSxcbiAgcmFuazoge31cbn07XG5cbmNvbnN0cy5nZW4ucHJvamVjdGlvbnMgPSB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgYWRkQ291bnRJZk5vdGhpbmdJc1NlbGVjdGVkOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgZGVzY3JpcHRpb246ICdXaGVuIG5vIGZpZWxkIGlzIHNlbGVjdGVkLCBhZGQgZXh0cmEgY291bnQgZmllbGQnXG4gICAgfVxuICB9XG59O1xuXG5jb25zdHMuZ2VuLmFnZ3JlZ2F0ZXMgPSB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgZ2VuQmluOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgZGVzY3JpcHRpb246ICdHZW5lcmF0ZSBCaW5uaW5nJ1xuICAgIH0sXG4gICAgZ2VuVHlwZUNhc3Rpbmc6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ0luY2x1ZGUgdHlwZSBjYXN0aW5nIGUuZy4sIGZyb20gUSB0byBPJ1xuICAgIH0sXG4gICAgb21pdE1lYXN1cmVPbmx5OiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgZGVzY3JpcHRpb246ICdPbWl0IGFnZ3JlZ2F0aW9uIHdpdGggbWVhc3VyZShzKSBvbmx5J1xuICAgIH0sXG4gICAgb21pdERpbWVuc2lvbk9ubHk6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ09taXQgYWdncmVnYXRpb24gd2l0aCBkaW1lbnNpb24ocykgb25seSdcbiAgICB9LFxuICAgIGFnZ3JMaXN0OiB7XG4gICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgaXRlbXM6IHtcbiAgICAgICAgdHlwZTogWydzdHJpbmcnXVxuICAgICAgfSxcbiAgICAgIGRlZmF1bHQ6IFt1bmRlZmluZWQsICdhdmcnXVxuICAgIH1cbiAgfVxufTtcblxuY29uc3RzLmdlbi5ERUZBVUxUX09QVCA9IHtcbiAgZ2VuQWdncjogdHJ1ZSxcbiAgZ2VuQmluOiB0cnVlLFxuICBnZW5UeXBlQ2FzdGluZzogdHJ1ZSxcblxuICBhZ2dyTGlzdDogW3VuZGVmaW5lZCwgJ2F2ZyddLCAvL3VuZGVmaW5lZCA9IG5vIGFnZ3JlZ2F0aW9uXG4gIG1hcmt0eXBlTGlzdDogWydwb2ludCcsICdiYXInLCAnbGluZScsICdhcmVhJywgJ3RleHQnXSwgLy9maWxsZWRfbWFwXG5cbiAgLy8gUFJVTklORyBSVUxFUyBGT1IgRU5DT0RJTkcgVkFSSUFUSU9OU1xuXG4gIC8qKlxuICAgKiBFbGltaW5hdGUgYWxsIHRyYW5zcG9zZVxuICAgKiAtIGtlZXBpbmcgaG9yaXpvbnRhbCBkb3QgcGxvdCBvbmx5LlxuICAgKiAtIGZvciBPeFEgY2hhcnRzLCBhbHdheXMgcHV0IE8gb24gWVxuICAgKiAtIHNob3cgb25seSBvbmUgT3hPLCBReFEgKGN1cnJlbnRseSBzb3J0ZWQgYnkgbmFtZSlcbiAgICovXG4gIG9taXRUcmFucG9zZTogZmFsc2UsXG4gIC8qKiByZW1vdmUgYWxsIGRvdCBwbG90IHdpdGggPjEgZW5jb2RpbmcgKi9cbiAgb21pdERvdFBsb3RXaXRoRXh0cmFFbmNvZGluZzogZmFsc2UsXG5cbiAgLyoqIHJlbW92ZSBhbGwgYWdncmVnYXRlIGNoYXJ0cyB3aXRoIGFsbCBkaW1zIG9uIGZhY2V0cyAocm93LCBjb2wpICovXG4gIC8vRklYTUUgdGhpcyBpcyBnb29kIGZvciB0ZXh0IHRob3VnaCFcbiAgb21pdEFnZ3JXaXRoQWxsRGltc09uRmFjZXRzOiBmYWxzZSxcblxuICAvLyBQUlVOSU5HIFJVTEVTIEZPUiBUUkFORk9STUFUSU9OIFZBUklBVElPTlNcblxuICAvKiogb21pdCBmaWVsZCBzZXRzIHdpdGggb25seSBkaW1lbnNpb25zICovXG4gIG9taXREaW1lbnNpb25Pbmx5OiBmYWxzZSxcbiAgLyoqIG9taXQgYWdncmVnYXRlIGZpZWxkIHNldHMgd2l0aCBvbmx5IG1lYXN1cmVzICovXG4gIG9taXRBZ2dyZWdhdGVXaXRoTWVhc3VyZU9ubHk6IGZhbHNlXG59O1xuXG5cblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdmwgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy52bCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwudmwgOiBudWxsKTtcblxudmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyksXG4gIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdlbkFnZ3JlZ2F0ZXM7XG5cbmZ1bmN0aW9uIGdlbkFnZ3JlZ2F0ZXMob3V0cHV0LCBmaWVsZHMsIG9wdCkge1xuICBvcHQgPSB2bC5zY2hlbWEudXRpbC5leHRlbmQob3B0fHx7fSwgY29uc3RzLmdlbi5hZ2dyZWdhdGVzKTtcbiAgY29uc29sZS5sb2cob3B0KTtcbiAgdmFyIHRmID0gbmV3IEFycmF5KGZpZWxkcy5sZW5ndGgpO1xuXG4gIGZ1bmN0aW9uIGNoZWNrQW5kUHVzaCgpIHtcbiAgICBpZiAob3B0Lm9taXRNZWFzdXJlT25seSB8fCBvcHQub21pdERpbWVuc2lvbk9ubHkpIHtcbiAgICAgIHZhciBoYXNNZWFzdXJlID0gZmFsc2UsIGhhc0RpbWVuc2lvbiA9IGZhbHNlLCBoYXNSYXcgPSBmYWxzZTtcbiAgICAgIHRmLmZvckVhY2goZnVuY3Rpb24oZikge1xuICAgICAgICBpZiAodXRpbC5pc0RpbShmKSkge1xuICAgICAgICAgIGhhc0RpbWVuc2lvbiA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaGFzTWVhc3VyZSA9IHRydWU7XG4gICAgICAgICAgaWYgKCFmLmFnZ3IpIGhhc1JhdyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaWYgKCFoYXNNZWFzdXJlICYmIG9wdC5vbWl0RGltZW5zaW9uT25seSkgcmV0dXJuO1xuICAgICAgaWYgKCFoYXNEaW1lbnNpb24gJiYgIWhhc1JhdyAmJiBvcHQub21pdE1lYXN1cmVPbmx5KSByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGZpZWxkU2V0ID0gdmwuZHVwbGljYXRlKHRmKTtcbiAgICBmaWVsZFNldC5rZXkgPSB2bC5maWVsZC5zaG9ydGhhbmRzKGZpZWxkU2V0KTtcblxuICAgIG91dHB1dC5wdXNoKGZpZWxkU2V0KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFzc2lnblEoaSwgaGFzQWdncikge1xuICAgIHZhciBmID0gZmllbGRzW2ldLFxuICAgICAgY2FuSGF2ZUFnZ3IgPSBoYXNBZ2dyID09PSB0cnVlIHx8IGhhc0FnZ3IgPT09IG51bGwsXG4gICAgICBjYW50SGF2ZUFnZ3IgPSBoYXNBZ2dyID09PSBmYWxzZSB8fCBoYXNBZ2dyID09PSBudWxsO1xuXG4gICAgdGZbaV0gPSB7bmFtZTogZi5uYW1lLCB0eXBlOiBmLnR5cGV9O1xuXG4gICAgaWYgKGYuYWdncikge1xuICAgICAgaWYgKGNhbkhhdmVBZ2dyKSB7XG4gICAgICAgIHRmW2ldLmFnZ3IgPSBmLmFnZ3I7XG4gICAgICAgIGFzc2lnbkZpZWxkKGkgKyAxLCB0cnVlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGFnZ3JlZ2F0ZXMgPSAoIWYuX2FnZ3IgfHwgZi5fYWdnciA9PT0gJyonKSA/IG9wdC5hZ2dyTGlzdCA6IGYuX2FnZ3I7XG5cbiAgICAgIGZvciAodmFyIGogaW4gYWdncmVnYXRlcykge1xuICAgICAgICB2YXIgYSA9IGFnZ3JlZ2F0ZXNbal07XG4gICAgICAgIGlmIChhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBpZiAoY2FuSGF2ZUFnZ3IpIHtcbiAgICAgICAgICAgIHRmW2ldLmFnZ3IgPSBhO1xuICAgICAgICAgICAgYXNzaWduRmllbGQoaSArIDEsIHRydWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHsgLy8gaWYoYSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgIGlmIChjYW50SGF2ZUFnZ3IpIHtcbiAgICAgICAgICAgIGRlbGV0ZSB0ZltpXS5hZ2dyO1xuICAgICAgICAgICAgYXNzaWduRmllbGQoaSArIDEsIGZhbHNlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKG9wdC5nZW5CaW4pIHtcbiAgICAgICAgLy8gYmluIHRoZSBmaWVsZCBpbnN0ZWFkIVxuICAgICAgICBkZWxldGUgdGZbaV0uYWdncjtcbiAgICAgICAgdGZbaV0uYmluID0gdHJ1ZTtcbiAgICAgICAgdGZbaV0udHlwZSA9ICdRJztcbiAgICAgICAgYXNzaWduRmllbGQoaSArIDEsIGhhc0FnZ3IpO1xuICAgICAgfVxuXG4gICAgICBpZiAob3B0LmdlblR5cGVDYXN0aW5nKSB7XG4gICAgICAgIC8vIHdlIGNhbiBhbHNvIGNoYW5nZSBpdCB0byBkaW1lbnNpb24gKGNhc3QgdHlwZT1cIk9cIilcbiAgICAgICAgZGVsZXRlIHRmW2ldLmFnZ3I7XG4gICAgICAgIGRlbGV0ZSB0ZltpXS5iaW47XG4gICAgICAgIHRmW2ldLnR5cGUgPSAnTyc7XG4gICAgICAgIGFzc2lnbkZpZWxkKGkgKyAxLCBoYXNBZ2dyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBhc3NpZ25GaWVsZChpLCBoYXNBZ2dyKSB7XG4gICAgaWYgKGkgPT09IGZpZWxkcy5sZW5ndGgpIHsgLy8gSWYgYWxsIGZpZWxkcyBhcmUgYXNzaWduZWRcbiAgICAgIGNoZWNrQW5kUHVzaCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBmID0gZmllbGRzW2ldO1xuICAgIC8vIE90aGVyd2lzZSwgYXNzaWduIGktdGggZmllbGRcbiAgICBzd2l0Y2ggKGYudHlwZSkge1xuICAgICAgLy9UT0RPIFwiRFwiLCBcIkdcIlxuICAgICAgY2FzZSAnUSc6XG4gICAgICAgIGFzc2lnblEoaSwgaGFzQWdncik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdUJzpcblxuICAgICAgY2FzZSAnTyc6XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0ZltpXSA9IGY7XG4gICAgICAgIGFzc2lnbkZpZWxkKGkgKyAxLCBoYXNBZ2dyKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gIH1cblxuICBhc3NpZ25GaWVsZCgwLCBudWxsKTtcblxuICByZXR1cm4gb3V0cHV0O1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2VuRW5jcyA9IHJlcXVpcmUoJy4vZW5jcycpLFxuICBnZW5NYXJrdHlwZXMgPSByZXF1aXJlKCcuL21hcmt0eXBlcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdlbkVuY29kaW5ncztcblxuZnVuY3Rpb24gZ2VuRW5jb2RpbmdzKG91dHB1dCwgZmllbGRzLCBvcHQsIGNmZywgbmVzdGVkKSB7XG4gIHZhciBlbmNzID0gZ2VuRW5jcyhbXSwgZmllbGRzLCBvcHQpO1xuXG4gIGlmIChuZXN0ZWQpIHtcbiAgICByZXR1cm4gZW5jcy5yZWR1Y2UoZnVuY3Rpb24oZGljdCwgZW5jKSB7XG4gICAgICBkaWN0W2VuY10gPSBnZW5NYXJrdHlwZXMoW10sIGVuYywgb3B0LCBjZmcpO1xuICAgICAgcmV0dXJuIGRpY3Q7XG4gICAgfSwge30pO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBlbmNzLnJlZHVjZShmdW5jdGlvbihsaXN0LCBlbmMpIHtcbiAgICAgIHJldHVybiBnZW5NYXJrdHlwZXMobGlzdCwgZW5jLCBvcHQsIGNmZyk7XG4gICAgfSwgW10pO1xuICB9XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciB2bCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LnZsIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC52bCA6IG51bGwpLFxuICBnbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdlbkVuY3M7XG5cbnZhciBFTkNPRElOR19SVUxFUyA9IHtcbiAgeDoge1xuICAgIGRhdGFUeXBlczogdmwuZGF0YVR5cGVzLk8gKyB2bC5kYXRhVHlwZXMuUSArIHZsLmRhdGFUeXBlcy5ULFxuICAgIG11bHRpcGxlOiB0cnVlIC8vRklYTUUgc2hvdWxkIGFsbG93IG11bHRpcGxlIG9ubHkgZm9yIFEsIFRcbiAgfSxcbiAgeToge1xuICAgIGRhdGFUeXBlczogdmwuZGF0YVR5cGVzLk8gKyB2bC5kYXRhVHlwZXMuUSArIHZsLmRhdGFUeXBlcy5ULFxuICAgIG11bHRpcGxlOiB0cnVlIC8vRklYTUUgc2hvdWxkIGFsbG93IG11bHRpcGxlIG9ubHkgZm9yIFEsIFRcbiAgfSxcbiAgcm93OiB7XG4gICAgZGF0YVR5cGVzOiB2bC5kYXRhVHlwZXMuTyxcbiAgICBtdWx0aXBsZTogdHJ1ZVxuICB9LFxuICBjb2w6IHtcbiAgICBkYXRhVHlwZXM6IHZsLmRhdGFUeXBlcy5PLFxuICAgIG11bHRpcGxlOiB0cnVlXG4gIH0sXG4gIHNoYXBlOiB7XG4gICAgZGF0YVR5cGVzOiB2bC5kYXRhVHlwZXMuT1xuICB9LFxuICBzaXplOiB7XG4gICAgZGF0YVR5cGVzOiB2bC5kYXRhVHlwZXMuUVxuICB9LFxuICBjb2xvcjoge1xuICAgIGRhdGFUeXBlczogdmwuZGF0YVR5cGVzLk8gKyB2bC5kYXRhVHlwZXMuUVxuICB9LFxuICBhbHBoYToge1xuICAgIGRhdGFUeXBlczogdmwuZGF0YVR5cGVzLlFcbiAgfSxcbiAgdGV4dDoge1xuICAgIGRhdGFUeXBlczogQU5ZX0RBVEFfVFlQRVNcbiAgfVxuICAvL2dlbzoge1xuICAvLyAgZGF0YVR5cGVzOiBbdmwuZGF0YVR5cGVzLkddXG4gIC8vfSxcbiAgLy9hcmM6IHsgLy8gcGllXG4gIC8vXG4gIC8vfVxufTtcblxuZnVuY3Rpb24gcnVsZXMoZW5jLCBvcHQpIHtcbiAgLy8gbmVlZCBhdCBsZWFzdCBvbmUgYmFzaWMgZW5jb2RpbmdcbiAgaWYgKGVuYy54IHx8IGVuYy55IHx8IGVuYy5nZW8gfHwgZW5jLnRleHQgfHwgZW5jLmFyYykge1xuXG4gICAgaWYgKGVuYy54ICYmIGVuYy55KSB7XG4gICAgICAvLyBzaG93IG9ubHkgb25lIE94TywgUXhRXG4gICAgICBpZiAob3B0Lm9taXRUcmFucG9zZSAmJiBlbmMueC50eXBlID09IGVuYy55LnR5cGUpIHtcbiAgICAgICAgLy9UT0RPIGJldHRlciBjcml0ZXJpYSB0aGFuIG5hbWVcbiAgICAgICAgaWYgKGVuYy54Lm5hbWUgPiBlbmMueS5uYW1lKSByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGVuYy5yb3cgfHwgZW5jLmNvbCkgeyAvL2hhdmUgZmFjZXQocylcbiAgICAgIC8vIGRvbid0IHVzZSBmYWNldHMgYmVmb3JlIGZpbGxpbmcgdXAgeCx5XG4gICAgICBpZiAoKCFlbmMueCB8fCAhZW5jLnkpKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIGlmIChvcHQub21pdEFnZ3JXaXRoQWxsRGltc09uRmFjZXRzKSB7XG4gICAgICAgIC8vIGRvbid0IHVzZSBmYWNldCB3aXRoIGFnZ3JlZ2F0ZSBwbG90IHdpdGggb3RoZXIgb3RoZXIgb3JkaW5hbCBvbiBMT0RcblxuICAgICAgICB2YXIgaGFzQWdnciA9IGZhbHNlLCBoYXNPdGhlck8gPSBmYWxzZTtcbiAgICAgICAgZm9yICh2YXIgZW5jVHlwZSBpbiBlbmMpIHtcbiAgICAgICAgICB2YXIgZmllbGQgPSBlbmNbZW5jVHlwZV07XG4gICAgICAgICAgaWYgKGZpZWxkLmFnZ3IpIHtcbiAgICAgICAgICAgIGhhc0FnZ3IgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodXRpbC5pc0RpbShmaWVsZCkgJiYgKGVuY1R5cGUgIT09ICdyb3cnICYmIGVuY1R5cGUgIT09ICdjb2wnKSkge1xuICAgICAgICAgICAgaGFzT3RoZXJPID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGhhc0FnZ3IgJiYgaGFzT3RoZXJPKSBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChoYXNBZ2dyICYmICFoYXNPdGhlck8pIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBvbmUgZGltZW5zaW9uIFwiY291bnRcIiBpcyB1c2VsZXNzXG4gICAgaWYgKGVuYy54ICYmIGVuYy54LmFnZ3IgPT0gJ2NvdW50JyAmJiAhZW5jLnkpIHJldHVybiBmYWxzZTtcbiAgICBpZiAoZW5jLnkgJiYgZW5jLnkuYWdnciA9PSAnY291bnQnICYmICFlbmMueCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBnZW5FbmNzKGVuY3MsIGZpZWxkcywgb3B0KSB7XG4gIC8vIGdlbmVyYXRlIGEgY29sbGVjdGlvbiB2ZWdhbGl0ZSdzIGVuY1xuICB2YXIgdG1wRW5jID0ge307XG5cbiAgZnVuY3Rpb24gYXNzaWduRmllbGQoaSkge1xuICAgIC8vIElmIGFsbCBmaWVsZHMgYXJlIGFzc2lnbmVkLCBzYXZlXG4gICAgaWYgKGkgPT09IGZpZWxkcy5sZW5ndGgpIHtcbiAgICAgIC8vIGF0IHRoZSBtaW5pbWFsIGFsbCBjaGFydCBzaG91bGQgaGF2ZSB4LCB5LCBnZW8sIHRleHQgb3IgYXJjXG4gICAgICBpZiAocnVsZXModG1wRW5jLCBvcHQpKSB7XG4gICAgICAgIGVuY3MucHVzaCh2bC5kdXBsaWNhdGUodG1wRW5jKSk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gT3RoZXJ3aXNlLCBhc3NpZ24gaS10aCBmaWVsZFxuICAgIHZhciBmaWVsZCA9IGZpZWxkc1tpXTtcbiAgICBmb3IgKHZhciBqIGluIHZsLmVuY29kaW5nVHlwZXMpIHtcbiAgICAgIHZhciBldCA9IHZsLmVuY29kaW5nVHlwZXNbal07XG5cbiAgICAgIC8vVE9ETzogc3VwcG9ydCBcIm11bHRpcGxlXCIgYXNzaWdubWVudFxuICAgICAgaWYgKCEoZXQgaW4gdG1wRW5jKSAmJlxuICAgICAgICAoRU5DT0RJTkdfUlVMRVNbZXRdLmRhdGFUeXBlcyAmIHZsLmRhdGFUeXBlc1tmaWVsZC50eXBlXSkgPiAwKSB7XG4gICAgICAgIHRtcEVuY1tldF0gPSBmaWVsZDtcbiAgICAgICAgYXNzaWduRmllbGQoaSArIDEpO1xuICAgICAgICBkZWxldGUgdG1wRW5jW2V0XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhc3NpZ25GaWVsZCgwKTtcblxuICByZXR1cm4gZW5jcztcbn1cbiIsInZhciB2bCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LnZsIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC52bCA6IG51bGwpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG52YXIgZ2VuID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIC8vIGRhdGEgdmFyaWF0aW9uc1xuICBhZ2dyZWdhdGVzOiByZXF1aXJlKCcuL2FnZ3JlZ2F0ZXMnKSxcbiAgcHJvamVjdGlvbnM6IHJlcXVpcmUoJy4vcHJvamVjdGlvbnMnKSxcbiAgLy8gZW5jb2RpbmdzIC8gdmlzdWFsIHZhcmlhdG9uc1xuICBlbmNvZGluZ3M6IHJlcXVpcmUoJy4vZW5jb2RpbmdzJyksXG4gIGVuY3M6IHJlcXVpcmUoJy4vZW5jcycpLFxuICBtYXJrdHlwZXM6IHJlcXVpcmUoJy4vbWFya3R5cGVzJylcbn07XG5cbi8vRklYTUUgbW92ZSB0aGVzZSB0byB2bFxudmFyIEFHR1JFR0FUSU9OX0ZOID0geyAvL2FsbCBwb3NzaWJsZSBhZ2dyZWdhdGUgZnVuY3Rpb24gbGlzdGVkIGJ5IGVhY2ggZGF0YSB0eXBlXG4gIFE6IHZsLnNjaGVtYS5hZ2dyLnN1cHBvcnRlZEVudW1zLlFcbn07XG5cbnZhciBUUkFOU0ZPUk1fRk4gPSB7IC8vYWxsIHBvc3NpYmxlIHRyYW5zZm9ybSBmdW5jdGlvbiBsaXN0ZWQgYnkgZWFjaCBkYXRhIHR5cGVcbiAgLy8gUTogWydsb2cnLCAnc3FydCcsICdhYnMnXSwgLy8gXCJsb2dpdD9cIlxuICBUOiB2bC5zY2hlbWEudGltZWZuc1xufTtcblxuZ2VuLmNoYXJ0cyA9IGZ1bmN0aW9uKGZpZWxkcywgb3B0LCBjZmcsIGZsYXQpIHtcbiAgb3B0ID0gdXRpbC5nZW4uZ2V0T3B0KG9wdCk7XG4gIGZsYXQgPSBmbGF0ID09PSB1bmRlZmluZWQgPyB7ZW5jb2RpbmdzOiAxfSA6IGZsYXQ7XG5cbiAgLy8gVE9ETyBnZW5lcmF0ZVxuXG4gIC8vIGdlbmVyYXRlIHBlcm11dGF0aW9uIG9mIGVuY29kaW5nIG1hcHBpbmdzXG4gIHZhciBmaWVsZFNldHMgPSBvcHQuZ2VuQWdnciA/IGdlbi5hZ2dyZWdhdGVzKFtdLCBmaWVsZHMsIG9wdCkgOiBbZmllbGRzXSxcbiAgICBlbmNzLCBjaGFydHMsIGxldmVsID0gMDtcblxuICBpZiAoZmxhdCA9PT0gdHJ1ZSB8fCAoZmxhdCAmJiBmbGF0LmFnZ3IpKSB7XG4gICAgZW5jcyA9IGZpZWxkU2V0cy5yZWR1Y2UoZnVuY3Rpb24ob3V0cHV0LCBmaWVsZHMpIHtcbiAgICAgIHJldHVybiBnZW4uZW5jcyhvdXRwdXQsIGZpZWxkcywgb3B0KTtcbiAgICB9LCBbXSk7XG4gIH0gZWxzZSB7XG4gICAgZW5jcyA9IGZpZWxkU2V0cy5tYXAoZnVuY3Rpb24oZmllbGRzKSB7XG4gICAgICByZXR1cm4gZ2VuLmVuY3MoW10sIGZpZWxkcywgb3B0KTtcbiAgICB9LCB0cnVlKTtcbiAgICBsZXZlbCArPSAxO1xuICB9XG5cbiAgaWYgKGZsYXQgPT09IHRydWUgfHwgKGZsYXQgJiYgZmxhdC5lbmNvZGluZ3MpKSB7XG4gICAgY2hhcnRzID0gdXRpbC5uZXN0ZWRSZWR1Y2UoZW5jcywgZnVuY3Rpb24ob3V0cHV0LCBlbmMpIHtcbiAgICAgIHJldHVybiBnZW4ubWFya3R5cGVzKG91dHB1dCwgZW5jLCBvcHQsIGNmZyk7XG4gICAgfSwgbGV2ZWwsIHRydWUpO1xuICB9IGVsc2Uge1xuICAgIGNoYXJ0cyA9IHV0aWwubmVzdGVkTWFwKGVuY3MsIGZ1bmN0aW9uKGVuYykge1xuICAgICAgcmV0dXJuIGdlbi5tYXJrdHlwZXMoW10sIGVuYywgb3B0LCBjZmcpO1xuICAgIH0sIGxldmVsLCB0cnVlKTtcbiAgICBsZXZlbCArPSAxO1xuICB9XG4gIHJldHVybiBjaGFydHM7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgdmwgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy52bCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwudmwgOiBudWxsKSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKSxcbiAgcmFuayA9IHJlcXVpcmUoJy4uL3JhbmsvcmFuaycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG91dHB1dCwgZW5jLCBvcHQsIGNmZykge1xuICBvcHQgPSB1dGlsLmdlbi5nZXRPcHQob3B0KTtcbiAgZ2V0U3VwcG9ydGVkTWFya1R5cGVzKGVuYywgb3B0KVxuICAgIC5mb3JFYWNoKGZ1bmN0aW9uKG1hcmtUeXBlKSB7XG4gICAgICB2YXIgZW5jb2RpbmcgPSB7IG1hcmt0eXBlOiBtYXJrVHlwZSwgZW5jOiBlbmMsIGNmZzogY2ZnIH0sXG4gICAgICAgIHNjb3JlID0gcmFuay5lbmNvZGluZyhlbmNvZGluZyk7XG4gICAgICBlbmNvZGluZy5zY29yZSA9IHNjb3JlLnNjb3JlO1xuICAgICAgZW5jb2Rpbmcuc2NvcmVGZWF0dXJlcyA9IHNjb3JlLmZlYXR1cmVzO1xuICAgICAgb3V0cHV0LnB1c2goZW5jb2RpbmcpO1xuICAgIH0pO1xuICByZXR1cm4gb3V0cHV0O1xufTtcblxudmFyIG1hcmtzUnVsZSA9IHtcbiAgcG9pbnQ6ICBwb2ludFJ1bGUsXG4gIGJhcjogICAgYmFyUnVsZSxcbiAgbGluZTogICBsaW5lUnVsZSxcbiAgYXJlYTogICBsaW5lUnVsZSAvLyBhcmVhIGlzIHNpbWlsYXIgdG8gbGluZVxufTtcblxuLy9UT0RPKGthbml0dyk6IHdyaXRlIHRlc3QgY2FzZVxuZnVuY3Rpb24gZ2V0U3VwcG9ydGVkTWFya1R5cGVzKGVuYywgb3B0KSB7XG4gIHZhciBtYXJrVHlwZXMgPSBvcHQubWFya3R5cGVMaXN0LmZpbHRlcihmdW5jdGlvbihtYXJrVHlwZSkge1xuICAgIHZhciBtYXJrID0gdmwuY29tcGlsZS5tYXJrc1ttYXJrVHlwZV0sXG4gICAgICByZXFzID0gbWFyay5yZXF1aXJlZEVuY29kaW5nLFxuICAgICAgc3VwcG9ydCA9IG1hcmsuc3VwcG9ydGVkRW5jb2Rpbmc7XG5cbiAgICBmb3IgKHZhciBpIGluIHJlcXMpIHsgLy8gYWxsIHJlcXVpcmVkIGVuY29kaW5ncyBpbiBlbmNcbiAgICAgIGlmICghKHJlcXNbaV0gaW4gZW5jKSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGZvciAodmFyIGVuY1R5cGUgaW4gZW5jKSB7IC8vIGFsbCBlbmNvZGluZ3MgaW4gZW5jIGFyZSBzdXBwb3J0ZWRcbiAgICAgIGlmICghc3VwcG9ydFtlbmNUeXBlXSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiAhbWFya3NSdWxlW21hcmtUeXBlXSB8fCBtYXJrc1J1bGVbbWFya1R5cGVdKGVuYywgb3B0KTtcbiAgfSk7XG5cbiAgLy9jb25zb2xlLmxvZygnZW5jOicsIHV0aWwuanNvbihlbmMpLCBcIiB+IG1hcmtzOlwiLCBtYXJrVHlwZXMpO1xuXG4gIHJldHVybiBtYXJrVHlwZXM7XG59XG5cbmZ1bmN0aW9uIHBvaW50UnVsZShlbmMsIG9wdCkge1xuICBpZiAoZW5jLnggJiYgZW5jLnkpIHtcbiAgICAvLyBoYXZlIGJvdGggeCAmIHkgPT0+IHNjYXR0ZXIgcGxvdCAvIGJ1YmJsZSBwbG90XG5cbiAgICAvLyBGb3IgT3hRXG4gICAgaWYgKG9wdC5vbWl0VHJhbnBvc2UgJiYgdXRpbC54T3lRKGVuYykpIHtcbiAgICAgIC8vIGlmIG9taXRUcmFucG9zZSwgcHV0IFEgb24gWCwgTyBvbiBZXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gRm9yIE94T1xuICAgIGlmICh1dGlsLmlzRGltKGVuYy54KSAmJiB1dGlsLmlzRGltKGVuYy55KSkge1xuICAgICAgLy8gc2hhcGUgZG9lc24ndCB3b3JrIHdpdGggYm90aCB4LCB5IGFzIG9yZGluYWxcbiAgICAgIGlmIChlbmMuc2hhcGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyBUT0RPKGthbml0dyk6IGNoZWNrIHRoYXQgdGhlcmUgaXMgcXVhbnQgYXQgbGVhc3QgLi4uXG4gICAgICBpZiAoZW5jLmNvbG9yICYmIHV0aWwuaXNEaW0oZW5jLmNvbG9yKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gIH0gZWxzZSB7IC8vIHBsb3Qgd2l0aCBvbmUgYXhpcyA9IGRvdCBwbG90XG4gICAgLy8gRG90IHBsb3Qgc2hvdWxkIGFsd2F5cyBiZSBob3Jpem9udGFsXG4gICAgaWYgKG9wdC5vbWl0VHJhbnBvc2UgJiYgZW5jLnkpIHJldHVybiBmYWxzZTtcblxuICAgIC8vIGRvdCBwbG90IHNob3VsZG4ndCBoYXZlIG90aGVyIGVuY29kaW5nXG4gICAgaWYgKG9wdC5vbWl0RG90UGxvdFdpdGhFeHRyYUVuY29kaW5nICYmIHZsLmtleXMoZW5jKS5sZW5ndGggPiAxKSByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBkb3QgcGxvdCB3aXRoIHNoYXBlIGlzIG5vbi1zZW5zZVxuICAgIGlmIChlbmMuc2hhcGUpIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gYmFyUnVsZShlbmMsIG9wdCkge1xuICAvLyBuZWVkIHRvIGFnZ3JlZ2F0ZSBvbiBlaXRoZXIgeCBvciB5XG4gIGlmICgoKGVuYy54LmFnZ3IgIT09IHVuZGVmaW5lZCkgXiAoZW5jLnkuYWdnciAhPT0gdW5kZWZpbmVkKSkgJiZcbiAgICAgICh2bC5maWVsZC5pc09yZGluYWxTY2FsZShlbmMueCkgXiB2bC5maWVsZC5pc09yZGluYWxTY2FsZShlbmMueSkpKSB7XG5cbiAgICAvLyBpZiBvbWl0VHJhbnBvc2UsIHB1dCBRIG9uIFgsIE8gb24gWVxuICAgIGlmIChvcHQub21pdFRyYW5wb3NlICYmIHV0aWwueE95UShlbmMpKSByZXR1cm4gZmFsc2U7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gbGluZVJ1bGUoZW5jLCBvcHQpIHtcbiAgLy8gVE9ETyhrYW5pdHcpOiBhZGQgb21pdFZlcnRpY2FsTGluZSBhcyBjb25maWdcblxuICAvLyBMaW5lIGNoYXJ0IHNob3VsZCBiZSBvbmx5IGhvcml6b250YWxcbiAgLy8gYW5kIHVzZSBvbmx5IHRlbXBvcmFsIGRhdGFcbiAgcmV0dXJuIGVuYy54ID09ICdUJyAmJiBlbmMueSA9PSAnUSc7XG59XG4iLCJ2YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKSxcbiAgY29uc3RzID0gcmVxdWlyZSgnLi4vY29uc3RzJyksXG4gIHZsID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cudmwgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLnZsIDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gcHJvamVjdGlvbnM7XG5cbi8qKlxuICogZmllbGRzXG4gKiBAcGFyYW0gIHtbdHlwZV19IGZpZWxkcyBhcnJheSBvZiBmaWVsZHMgYW5kIHF1ZXJ5IGluZm9ybWF0aW9uXG4gKiBAcmV0dXJuIHtbdHlwZV19ICAgICAgICBbZGVzY3JpcHRpb25dXG4gKi9cbmZ1bmN0aW9uIHByb2plY3Rpb25zKGZpZWxkcywgb3B0KSB7XG4gIG9wdCA9IHZsLnNjaGVtYS51dGlsLmV4dGVuZChvcHR8fHt9LCBjb25zdHMuZ2VuLnByb2plY3Rpb25zKTtcbiAgLy8gVE9ETyBzdXBwb3J0IG90aGVyIG1vZGUgb2YgcHJvamVjdGlvbnMgZ2VuZXJhdGlvblxuICAvLyBwb3dlcnNldCwgY2hvb3NlSywgY2hvb3NlS29yTGVzcyBhcmUgYWxyZWFkeSBpbmNsdWRlZCBpbiB0aGUgdXRpbFxuICAvLyBSaWdodCBub3cganVzdCBhZGQgb25lIG1vcmUgZmllbGRcblxuICB2YXIgc2VsZWN0ZWQgPSBbXSwgdW5zZWxlY3RlZCA9IFtdLCBmaWVsZFNldHMgPSBbXTtcblxuICBmaWVsZHMuZm9yRWFjaChmdW5jdGlvbihmaWVsZCl7XG4gICAgaWYgKGZpZWxkLnNlbGVjdGVkKSB7XG4gICAgICBzZWxlY3RlZC5wdXNoKGZpZWxkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdW5zZWxlY3RlZC5wdXNoKGZpZWxkKTtcbiAgICB9XG4gIH0pO1xuXG4gIHZhciBzZXRzVG9BZGQgPSB1dGlsLmNob29zZUtvckxlc3ModW5zZWxlY3RlZCwgMSk7XG5cbiAgc2V0c1RvQWRkLmZvckVhY2goZnVuY3Rpb24oc2V0VG9BZGQpIHtcbiAgICB2YXIgZmllbGRTZXQgPSBzZWxlY3RlZC5jb25jYXQoc2V0VG9BZGQpO1xuICAgIGlmIChmaWVsZFNldC5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAoZmllbGRTZXQubGVuZ3RoID09PSAxICYmIHZsLmZpZWxkLmlzQ291bnQoZmllbGRTZXRbMF0pKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIGFsd2F5cyBhcHBlbmQgcHJvamVjdGlvbidzIGtleSB0byBlYWNoIHByb2plY3Rpb24gcmV0dXJuZWQsIGQzIHN0eWxlLlxuICAgICAgZmllbGRTZXRzLnB1c2goZmllbGRTZXQpO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKG9wdC5hZGRDb3VudElmTm90aGluZ0lzU2VsZWN0ZWQgJiYgc2VsZWN0ZWQubGVuZ3RoPT09MCkge1xuICAgIHZhciBjb3VudEZpZWxkID0gdmwuZmllbGQuY291bnQoKTtcblxuICAgIHVuc2VsZWN0ZWQuZm9yRWFjaChmdW5jdGlvbihmaWVsZCkge1xuICAgICAgaWYgKCF2bC5maWVsZC5pc0NvdW50KGZpZWxkKSkge1xuICAgICAgICBmaWVsZFNldHMucHVzaChbZmllbGQsIGNvdW50RmllbGRdKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZpZWxkU2V0cy5mb3JFYWNoKGZ1bmN0aW9uKGZpZWxkU2V0KSB7XG4gICAgZmllbGRTZXQua2V5ID0gcHJvamVjdGlvbnMua2V5KGZpZWxkU2V0KTtcbiAgfSk7XG5cbiAgcmV0dXJuIGZpZWxkU2V0cztcbn1cblxucHJvamVjdGlvbnMua2V5ID0gZnVuY3Rpb24ocHJvamVjdGlvbikge1xuICByZXR1cm4gcHJvamVjdGlvbi5tYXAoZnVuY3Rpb24oZmllbGQpIHtcbiAgICByZXR1cm4gdmwuZmllbGQuaXNDb3VudChmaWVsZCkgPyAnY291bnQnIDogZmllbGQubmFtZTtcbiAgfSkuam9pbignLCcpO1xufTtcbiIsInZhciBnID0gZ2xvYmFsIHx8IHdpbmRvdztcblxuZy5DSEFSVF9UWVBFUyA9IHtcbiAgVEFCTEU6ICdUQUJMRScsXG4gIEJBUjogJ0JBUicsXG4gIFBMT1Q6ICdQTE9UJyxcbiAgTElORTogJ0xJTkUnLFxuICBBUkVBOiAnQVJFQScsXG4gIE1BUDogJ01BUCcsXG4gIEhJU1RPR1JBTTogJ0hJU1RPR1JBTSdcbn07XG5cbmcuQU5ZX0RBVEFfVFlQRVMgPSAoMSA8PCA0KSAtIDE7IiwibW9kdWxlLmV4cG9ydHMgPSByYW5rUHJvamVjdGlvbnM7XG5cbmZ1bmN0aW9uIHJhbmtQcm9qZWN0aW9ucyhzZWxlY3RlZEZpZWxkcywgcHJvamVjdGlvbikge1xuXG59XG5cbiIsInZhciB2bCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LnZsIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC52bCA6IG51bGwpO1xuXG52YXIgcmFuayA9IG1vZHVsZS5leHBvcnRzID0ge1xuICBwcm9qZWN0aW9uczogcmVxdWlyZSgnLi9yYW5rLXByb2plY3Rpb25zJylcbn07XG5cbi8vVE9ETyBsb3dlciBzY29yZSBpZiB3ZSB1c2UgRyBhcyBPP1xudmFyIEVOQ09ESU5HX1NDT1JFID0ge1xuICBROiB7XG4gICAgeDogMSwgLy8gYmV0dGVyIGZvciBzaW5nbGUgcGxvdFxuICAgIHk6IDAuOTksXG4gICAgc2l6ZTogMC42LCAvL0ZJWE1FIFNJWkUgZm9yIEJhciBpcyBob3JyaWJsZSFcbiAgICBjb2xvcjogMC40LFxuICAgIGFscGhhOiAwLjRcbiAgfSxcbiAgTzogeyAvLyBUT0RPIG5lZWQgdG8gdGFrZSBjYXJkaW5hbGl0eSBpbnRvIGFjY291bnRcbiAgICB4OiAwLjk5LCAvLyBoYXJkZXIgdG8gcmVhZCBheGlzXG4gICAgeTogMSxcbiAgICByb3c6IDAuNyxcbiAgICBjb2w6IDAuNyxcbiAgICBjb2xvcjogMC44LFxuICAgIHNoYXBlOiAwLjZcbiAgfSxcbiAgVDogeyAvLyBGSVggcmV0aGluayB0aGlzXG4gICAgeDogMSxcbiAgICB5OiAwLjgsXG4gICAgcm93OiAwLjQsXG4gICAgY29sOiAwLjQsXG4gICAgY29sb3I6IDAuMyxcbiAgICBzaGFwZTogMC4zXG4gIH1cbn07XG5cbi8vIGJhZCBzY29yZSBub3Qgc3BlY2lmaWVkIGluIHRoZSB0YWJsZSBhYm92ZVxudmFyIEJBRF9FTkNPRElOR19TQ09SRSA9IDAuMDEsXG4gIFVOVVNFRF9QT1NJVElPTiA9IDAuNTtcblxudmFyIE1BUktfU0NPUkUgPSB7XG4gIGxpbmU6IDAuOTksXG4gIGFyZWE6IDAuOTgsXG4gIGJhcjogMC45NyxcbiAgcG9pbnQ6IDAuOTYsXG4gIGNpcmNsZTogMC45NSxcbiAgc3F1YXJlOiAwLjk1LFxuICB0ZXh0OiAwLjhcbn07XG5cbnJhbmsuZW5jb2RpbmcgPSBmdW5jdGlvbihlbmNvZGluZykge1xuICB2YXIgZmVhdHVyZXMgPSB7fSxcbiAgICBlbmNUeXBlcyA9IHZsLmtleXMoZW5jb2RpbmcuZW5jKTtcbiAgZW5jVHlwZXMuZm9yRWFjaChmdW5jdGlvbihlbmNUeXBlKSB7XG4gICAgdmFyIGZpZWxkID0gZW5jb2RpbmcuZW5jW2VuY1R5cGVdO1xuICAgIGZlYXR1cmVzW2ZpZWxkLm5hbWVdID0ge1xuICAgICAgdmFsdWU6IGZpZWxkLnR5cGUgKyAnOicrIGVuY1R5cGUsXG4gICAgICBzY29yZTogRU5DT0RJTkdfU0NPUkVbZmllbGQudHlwZV1bZW5jVHlwZV0gfHwgQkFEX0VOQ09ESU5HX1NDT1JFXG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gcGVuYWxpemUgbm90IHVzaW5nIHBvc2l0aW9uYWxcbiAgaWYgKGVuY1R5cGVzLmxlbmd0aCA+IDEpIHtcbiAgICBpZiAoKCFlbmNvZGluZy5lbmMueCB8fCAhZW5jb2RpbmcuZW5jLnkpICYmICFlbmNvZGluZy5lbmMuZ2VvKSB7XG4gICAgICBmZWF0dXJlcy51bnVzZWRQb3NpdGlvbiA9IHtzY29yZTogVU5VU0VEX1BPU0lUSU9OfTtcbiAgICB9XG4gIH1cblxuICBmZWF0dXJlcy5tYXJrVHlwZSA9IHtcbiAgICB2YWx1ZTogZW5jb2RpbmcubWFya3R5cGUsXG4gICAgc2NvcmU6IE1BUktfU0NPUkVbZW5jb2RpbmcubWFya3R5cGVdXG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBzY29yZTogdmwua2V5cyhmZWF0dXJlcykucmVkdWNlKGZ1bmN0aW9uKHAsIHMpIHtcbiAgICAgIHJldHVybiBwICogZmVhdHVyZXNbc10uc2NvcmU7XG4gICAgfSwgMSksXG4gICAgZmVhdHVyZXM6IGZlYXR1cmVzXG4gIH07XG59O1xuXG5cbi8vIHJhdyA+IGF2Zywgc3VtID4gbWluLG1heCA+IGJpblxuXG5yYW5rLmZpZWxkc1Njb3JlID0gZnVuY3Rpb24oZmllbGRzKSB7XG5cbn07XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgY29uc3RzID0gcmVxdWlyZSgnLi9jb25zdHMnKTtcblxudmFyIHV0aWwgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2VuOiB7fVxufTtcblxudmFyIGlzRGltID0gdXRpbC5pc0RpbSA9IGZ1bmN0aW9uIChmaWVsZCkge1xuICByZXR1cm4gZmllbGQuYmluIHx8IGZpZWxkLnR5cGUgPT09ICdPJztcbn07XG5cbnV0aWwueE95USA9IGZ1bmN0aW9uIHhPeVEgKGVuYykge1xuICByZXR1cm4gZW5jLnggJiYgZW5jLnkgJiYgaXNEaW0oZW5jLngpICYmIGlzRGltKGVuYy55KTtcbn07XG5cbnV0aWwuaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKG9iaikge1xuICByZXR1cm4ge30udG9TdHJpbmcuY2FsbChvYmopID09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG51dGlsLmpzb24gPSBmdW5jdGlvbihzLCBzcCkge1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocywgbnVsbCwgc3ApO1xufTtcblxudXRpbC5rZXlzID0gZnVuY3Rpb24ob2JqKSB7XG4gIHZhciBrID0gW10sIHg7XG4gIGZvciAoeCBpbiBvYmopIGsucHVzaCh4KTtcbiAgcmV0dXJuIGs7XG59O1xuXG51dGlsLm5lc3RlZE1hcCA9IGZ1bmN0aW9uIChjb2wsIGYsIGxldmVsLCBmaWx0ZXIpIHtcbiAgcmV0dXJuIGxldmVsID09PSAwID9cbiAgICBjb2wubWFwKGYpIDpcbiAgICBjb2wubWFwKGZ1bmN0aW9uKHYpIHtcbiAgICAgIHZhciByID0gdXRpbC5uZXN0ZWRNYXAodiwgZiwgbGV2ZWwgLSAxKTtcbiAgICAgIHJldHVybiBmaWx0ZXIgPyByLmZpbHRlcih1dGlsLm5vbkVtcHR5KSA6IHI7XG4gICAgfSk7XG59O1xuXG51dGlsLm5lc3RlZFJlZHVjZSA9IGZ1bmN0aW9uIChjb2wsIGYsIGxldmVsLCBmaWx0ZXIpIHtcbiAgcmV0dXJuIGxldmVsID09PSAwID9cbiAgICBjb2wucmVkdWNlKGYsIFtdKSA6XG4gICAgY29sLm1hcChmdW5jdGlvbih2KSB7XG4gICAgICB2YXIgciA9IHV0aWwubmVzdGVkUmVkdWNlKHYsIGYsIGxldmVsIC0gMSk7XG4gICAgICByZXR1cm4gZmlsdGVyID8gci5maWx0ZXIodXRpbC5ub25FbXB0eSkgOiByO1xuICAgIH0pO1xufTtcblxudXRpbC5ub25FbXB0eSA9IGZ1bmN0aW9uKGdycCkge1xuICByZXR1cm4gIXV0aWwuaXNBcnJheShncnApIHx8IGdycC5sZW5ndGggPiAwO1xufTtcblxuXG51dGlsLnRyYXZlcnNlID0gZnVuY3Rpb24gKG5vZGUsIGFycikge1xuICBpZiAobm9kZS52YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgYXJyLnB1c2gobm9kZS52YWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKG5vZGUubGVmdCkgdXRpbC50cmF2ZXJzZShub2RlLmxlZnQsIGFycik7XG4gICAgaWYgKG5vZGUucmlnaHQpIHV0aWwudHJhdmVyc2Uobm9kZS5yaWdodCwgYXJyKTtcbiAgfVxuICByZXR1cm4gYXJyO1xufTtcblxudXRpbC51bmlvbiA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIHZhciBvID0ge307XG4gIGEuZm9yRWFjaChmdW5jdGlvbih4KSB7IG9beF0gPSB0cnVlO30pO1xuICBiLmZvckVhY2goZnVuY3Rpb24oeCkgeyBvW3hdID0gdHJ1ZTt9KTtcbiAgcmV0dXJuIHV0aWwua2V5cyhvKTtcbn07XG5cblxudXRpbC5nZW4uZ2V0T3B0ID0gZnVuY3Rpb24gKG9wdCkge1xuICAvL21lcmdlIHdpdGggZGVmYXVsdFxuICByZXR1cm4gKG9wdCA/IHV0aWwua2V5cyhvcHQpIDogW10pLnJlZHVjZShmdW5jdGlvbihjLCBrKSB7XG4gICAgY1trXSA9IG9wdFtrXTtcbiAgICByZXR1cm4gYztcbiAgfSwgT2JqZWN0LmNyZWF0ZShjb25zdHMuZ2VuLkRFRkFVTFRfT1BUKSk7XG59O1xuXG4vKipcbiAqIHBvd2Vyc2V0IGNvZGUgZnJvbSBodHRwOi8vcm9zZXR0YWNvZGUub3JnL3dpa2kvUG93ZXJfU2V0I0phdmFTY3JpcHRcbiAqXG4gKiAgIHZhciByZXMgPSBwb3dlcnNldChbMSwyLDMsNF0pO1xuICpcbiAqIHJldHVybnNcbiAqXG4gKiBbW10sWzFdLFsyXSxbMSwyXSxbM10sWzEsM10sWzIsM10sWzEsMiwzXSxbNF0sWzEsNF0sXG4gKiBbMiw0XSxbMSwyLDRdLFszLDRdLFsxLDMsNF0sWzIsMyw0XSxbMSwyLDMsNF1dXG5bZWRpdF1cbiovXG5cbnV0aWwucG93ZXJzZXQgPSBmdW5jdGlvbihsaXN0KSB7XG4gIHZhciBwcyA9IFtcbiAgICBbXVxuICBdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICBmb3IgKHZhciBqID0gMCwgbGVuID0gcHMubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgIHBzLnB1c2gocHNbal0uY29uY2F0KGxpc3RbaV0pKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBzO1xufTtcblxudXRpbC5jaG9vc2VLb3JMZXNzID0gZnVuY3Rpb24obGlzdCwgaykge1xuICB2YXIgc3Vic2V0ID0gW1tdXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgZm9yICh2YXIgaiA9IDAsIGxlbiA9IHN1YnNldC5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgdmFyIHN1YiA9IHN1YnNldFtqXS5jb25jYXQobGlzdFtpXSk7XG4gICAgICBpZihzdWIubGVuZ3RoIDw9IGspe1xuICAgICAgICBzdWJzZXQucHVzaChzdWIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gc3Vic2V0O1xufTtcblxudXRpbC5jaG9vc2VLID0gZnVuY3Rpb24obGlzdCwgaykge1xuICB2YXIgc3Vic2V0ID0gW1tdXTtcbiAgdmFyIGtBcnJheSA9W107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIGZvciAodmFyIGogPSAwLCBsZW4gPSBzdWJzZXQubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgIHZhciBzdWIgPSBzdWJzZXRbal0uY29uY2F0KGxpc3RbaV0pO1xuICAgICAgaWYoc3ViLmxlbmd0aCA8IGspe1xuICAgICAgICBzdWJzZXQucHVzaChzdWIpO1xuICAgICAgfWVsc2UgaWYgKHN1Yi5sZW5ndGggPT09IGspe1xuICAgICAgICBrQXJyYXkucHVzaChzdWIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4ga0FycmF5O1xufTtcblxudXRpbC5jcm9zcyA9IGZ1bmN0aW9uKGEsYil7XG4gIHZhciB4ID0gW107XG4gIGZvcih2YXIgaT0wOyBpPCBhLmxlbmd0aDsgaSsrKXtcbiAgICBmb3IodmFyIGo9MDtqPCBiLmxlbmd0aDsgaisrKXtcbiAgICAgIHgucHVzaChhW2ldLmNvbmNhdChiW2pdKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiB4O1xufTtcblxuIl19
