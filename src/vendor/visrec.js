!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.vr=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var vr = module.exports = {
  cluster: require('./cluster/cluster'),
  gen: require('./gen/gen'),
  rank: require('./rank/rank'),
  util: require('./util')
};



},{"./cluster/cluster":2,"./gen/gen":8,"./rank/rank":12,"./util":13}],2:[function(require,module,exports){
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

},{"../util":13,"./clusterconsts":3,"./distancetable":4}],3:[function(require,module,exports){
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

},{"../util":13,"./clusterconsts":3}],5:[function(require,module,exports){
var consts = module.exports = {
  gen: {},
  cluster: {},
  rank: {}
};

consts.gen.DEFAULT_OPT = {
  genAggr: true,
  genBin: true,
  genTypeCasting: false,

  aggrList: [undefined, 'avg'], //undefined = no aggregation
  marktypeList: ['point', 'bar', 'line', 'area', 'text'], //filled_map

  // PRUNING RULES FOR ENCODING VARIATIONS

  /**
   * Eliminate all transpose
   * - keeping horizontal dot plot only.
   * - for OxQ charts, always put O on Y
   * - show only one OxO, QxQ (currently sorted by name)
   */
  omitTranpose: true,
  /** remove all dot plot with >1 encoding */
  omitDotPlotWithExtraEncoding: true,

  /** remove all aggregate charts with all dims on facets (row, col) */
  //FIXME this is good for text though!
  omitAggrWithAllDimsOnFacets: true,

  // PRUNING RULES FOR TRANFORMATION VARIATIONS

  /** omit field sets with only dimensions */
  omitDimensionOnly: true,
  /** omit aggregate field sets with only measures */
  omitAggregateWithMeasureOnly: true
};
},{}],6:[function(require,module,exports){
(function (global){
'use strict';

var vl = (typeof window !== "undefined" ? window.vl : typeof global !== "undefined" ? global.vl : null);

var util = require('../util');

module.exports = function(output, fields, opt) {
  var tf = new Array(fields.length);
  opt = util.gen.getOpt(opt);

  function assignField(i, hasAggr) {
    // If all fields are assigned, save
    if (i === fields.length) {
      if (opt.omitAggregateWithMeasureOnly || opt.omitDimensionOnly) {
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
        if (!hasDimension && !hasRaw && opt.omitAggregateWithMeasureOnly) return;
      }

      output.push(vl.duplicate(tf));
      return;
    }

    var f = fields[i];

    // Otherwise, assign i-th field
    switch (f.type) {
      //TODO "D", "G"
      case 'Q':
        tf[i] = {name: f.name, type: f.type};
        if (f.aggr) {
          tf[i].aggr = f.aggr;
          assignField(i + 1, true);
        } else if (f._aggr) {
          var aggregates = f._aggr == '*' ? opt.aggrList : f._aggr;

          for (var j in aggregates) {
            var a = aggregates[j];
            if (a !== undefined) {
              if (hasAggr === true || hasAggr === null) {
                // must be aggregated, or no constraint
                //set aggregate to that one
                tf[i].aggr = a;
                assignField(i + 1, true);
              }
            } else { // if(a === undefined)
              if (hasAggr === false || hasAggr === null) {
                // must be raw plot, or no constraint
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
        } else { // both "aggr", "_aggr" not in f
          assignField(i + 1, false);
        }
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
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../util":13}],7:[function(require,module,exports){
(function (global){
"use strict";

var vl = (typeof window !== "undefined" ? window.vl : typeof global !== "undefined" ? global.vl : null),
  globals = require('../globals'),
  util = require('../util');


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

module.exports = function(encodings, fields, opt) {
  // generate encodings (_enc property in vegalite)
  var tmpEnc = {};

  function assignField(i) {
    // If all fields are assigned, save
    if (i === fields.length) {
      // at the minimal all chart should have x, y, geo, text or arc
      if (rules(tmpEnc, opt)) {
        encodings.push(vl.duplicate(tmpEnc));
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

  return encodings;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../globals":11,"../util":13}],8:[function(require,module,exports){
(function (global){
var vl = (typeof window !== "undefined" ? window.vl : typeof global !== "undefined" ? global.vl : null),
  util = require('../util');

var gen = module.exports = {
  // data variations
  aggregates: require('./aggregates'),
  projections: require('./projections'),
  // encodings / visual variatons
  fields: require('./fields'),
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
  var fieldSets = opt.genAggr ? gen.genAggregate([], fields, opt) : [fields],
    encodings, charts, level = 0;

  if (flat === true || (flat && flat.aggr)) {
    encodings = fieldSets.reduce(function(output, fields) {
      return gen.fields(output, fields, opt);
    }, []);
  } else {
    encodings = fieldSets.map(function(fields) {
      return gen.fields([], fields, opt);
    }, true);
    level += 1;
  }

  if (flat === true || (flat && flat.encodings)) {
    charts = util.nestedReduce(encodings, function(output, encodings) {
      return gen.marktypes(output, encodings, opt, cfg);
    }, level, true);
  } else {
    charts = util.nestedMap(encodings, function(encodings) {
      return gen.marktypes([], encodings, opt, cfg);
    }, level, true);
    level += 1;
  }
  return charts;
};
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../util":13,"./aggregates":6,"./fields":7,"./marktypes":9,"./projections":10}],9:[function(require,module,exports){
(function (global){
"use strict";

var vl = (typeof window !== "undefined" ? window.vl : typeof global !== "undefined" ? global.vl : null),
  util = require('../util');

module.exports = function(output, enc, opt, cfg) {
  opt = util.gen.getOpt(opt);
  getSupportedMarkTypes(enc, opt)
    .forEach(function(markType) {
      output.push({ marktype: markType, enc: enc, cfg: cfg });
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
  if ((enc.x.aggr !== undefined) ^ (enc.y.aggr !== undefined)) {

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

},{"../util":13}],10:[function(require,module,exports){
var util = require('../util');

module.exports = projections;

/**
 * fields
 * @param  {[type]} fields array of fields and query information
 * @return {[type]}        [description]
 */
function projections(fields) {
  // TODO support other mode of projections generation
  // powerset, chooseK, chooseKorLess are already included in the util
  // Right now just add one more field

  var selected = [], unselected = [], fieldSets;

  fields.forEach(function(field){
    if (field.selected) {
      selected.push(field);
    } else {
      unselected.push(field);
    }
  });

  var setsToAdd = util.chooseKorLess(unselected, 1);

  fieldSets = setsToAdd.map(function(setToAdd){
    return setToAdd.concat(selected);
  });

  return fieldSets;
}


},{"../util":13}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
(function (global){
var vl = (typeof window !== "undefined" ? window.vl : typeof global !== "undefined" ? global.vl : null);

var rank = module.exports = {};

//TODO lower score if we use G as O?
var ENCODING_SCORE = {
  Q: {
    x: 1,
    y: 1,
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

rank.encodingScore = function(encoding) {
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

},{}],13:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvdnIiLCJzcmMvY2x1c3Rlci9jbHVzdGVyLmpzIiwic3JjL2NsdXN0ZXIvY2x1c3RlcmNvbnN0cy5qcyIsInNyYy9jbHVzdGVyL2Rpc3RhbmNldGFibGUuanMiLCJzcmMvY29uc3RzLmpzIiwic3JjL2dlbi9hZ2dyZWdhdGVzLmpzIiwic3JjL2dlbi9maWVsZHMuanMiLCJzcmMvZ2VuL2dlbi5qcyIsInNyYy9nZW4vbWFya3R5cGVzLmpzIiwic3JjL2dlbi9wcm9qZWN0aW9ucy5qcyIsInNyYy9nbG9iYWxzLmpzIiwic3JjL3JhbmsvcmFuay5qcyIsInNyYy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQzVIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDM0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIHZyID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNsdXN0ZXI6IHJlcXVpcmUoJy4vY2x1c3Rlci9jbHVzdGVyJyksXG4gIGdlbjogcmVxdWlyZSgnLi9nZW4vZ2VuJyksXG4gIHJhbms6IHJlcXVpcmUoJy4vcmFuay9yYW5rJyksXG4gIHV0aWw6IHJlcXVpcmUoJy4vdXRpbCcpXG59O1xuXG5cbiIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsdXN0ZXI7XG5cbnZhciB2bCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LnZsIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC52bCA6IG51bGwpLFxuICBjbHVzdGVyZmNrID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuY2x1c3RlcmZjayA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuY2x1c3RlcmZjayA6IG51bGwpLFxuICBjb25zdHMgPSByZXF1aXJlKCcuL2NsdXN0ZXJjb25zdHMnKSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcblxudmFyIGRpc3RhbmNlVGFibGUgPSBjbHVzdGVyLmRpc3RhbmNlVGFibGUgPSByZXF1aXJlKCcuL2Rpc3RhbmNldGFibGUnKTtcblxuXG5mdW5jdGlvbiBjbHVzdGVyKGVuY29kaW5ncywgbWF4RGlzdGFuY2UpIHtcbiAgdmFyIGRpc3QgPSBkaXN0YW5jZVRhYmxlKGVuY29kaW5ncyksXG4gICAgbiA9IGVuY29kaW5ncy5sZW5ndGg7XG5cbiAgdmFyIGNsdXN0ZXJUcmVlcyA9IGNsdXN0ZXJmY2suaGNsdXN0ZXIodmwucmFuZ2UobiksIGZ1bmN0aW9uKGksIGopIHtcbiAgICByZXR1cm4gZGlzdFtpXVtqXTtcbiAgfSwgJ2F2ZXJhZ2UnLCBjb25zdHMuQ0xVU1RFUl9USFJFU0hPTEQpO1xuXG4gIHZhciBjbHVzdGVycyA9IGNsdXN0ZXJUcmVlcy5tYXAoZnVuY3Rpb24odHJlZSkge1xuICAgIHJldHVybiB1dGlsLnRyYXZlcnNlKHRyZWUsIFtdKTtcbiAgfSk7XG5cbiAgLy9jb25zb2xlLmxvZyhcImNsdXN0ZXJzXCIsIGNsdXN0ZXJzLm1hcChmdW5jdGlvbihjKXsgcmV0dXJuIGMuam9pbihcIitcIik7IH0pKTtcbiAgcmV0dXJuIGNsdXN0ZXJzO1xufTsiLCJ2YXIgYyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbmMuRElTVF9CWV9FTkNUWVBFID0gW1xuICAvLyBwb3NpdGlvbmFsXG4gIFsneCcsICd5JywgMC4yXSxcbiAgWydyb3cnLCAnY29sJywgMC4yXSxcblxuICAvLyBvcmRpbmFsIG1hcmsgcHJvcGVydGllc1xuICBbJ2NvbG9yJywgJ3NoYXBlJywgMC4yXSxcblxuICAvLyBxdWFudGl0YXRpdmUgbWFyayBwcm9wZXJ0aWVzXG4gIFsnY29sb3InLCAnYWxwaGEnLCAwLjJdLFxuICBbJ3NpemUnLCAnYWxwaGEnLCAwLjJdLFxuICBbJ3NpemUnLCAnY29sb3InLCAwLjJdXG5dLnJlZHVjZShmdW5jdGlvbihyLCB4KSB7XG52YXIgYSA9IHhbMF0sIGIgPSB4WzFdLCBkID0geFsyXTtcbiAgclthXSA9IHJbYV0gfHwge307XG4gIHJbYl0gPSByW2JdIHx8IHt9O1xuICByW2FdW2JdID0gcltiXVthXSA9IGQ7XG4gIHJldHVybiByO1xufSwge30pO1xuXG5jLkRJU1RfTUlTU0lORyA9IDEwMDtcblxuYy5DTFVTVEVSX1RIUkVTSE9MRCA9IDE7IiwidmFyIHZsID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cudmwgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLnZsIDogbnVsbCksXG4gIGNvbnN0cyA9IHJlcXVpcmUoJy4vY2x1c3RlcmNvbnN0cycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRpc3RhbmNlVGFibGU7XG5cbmZ1bmN0aW9uIGRpc3RhbmNlVGFibGUoZW5jb2RpbmdzKSB7XG4gIHZhciBsZW4gPSBlbmNvZGluZ3MubGVuZ3RoLFxuICAgIGNvbGVuY3MgPSBlbmNvZGluZ3MubWFwKGZ1bmN0aW9uKGUpIHsgcmV0dXJuIGNvbGVuYyhlKTt9KSxcbiAgICBkaWZmID0gbmV3IEFycmF5KGxlbiksIGksIGo7XG5cbiAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSBkaWZmW2ldID0gbmV3IEFycmF5KGxlbik7XG5cbiAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgZm9yIChqID0gaSArIDE7IGogPCBsZW47IGorKykge1xuICAgICAgZGlmZltqXVtpXSA9IGRpZmZbaV1bal0gPSBnZXREaXN0YW5jZShjb2xlbmNzW2ldLCBjb2xlbmNzW2pdKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRpZmY7XG59XG5cbmZ1bmN0aW9uIGdldERpc3RhbmNlKGNvbGVuYzEsIGNvbGVuYzIpIHtcbiAgdmFyIGNvbHMgPSB1dGlsLnVuaW9uKHZsLmtleXMoY29sZW5jMS5jb2wpLCB2bC5rZXlzKGNvbGVuYzIuY29sKSksXG4gICAgZGlzdCA9IDA7XG5cbiAgY29scy5mb3JFYWNoKGZ1bmN0aW9uKGNvbCkge1xuICAgIHZhciBlMSA9IGNvbGVuYzEuY29sW2NvbF0sIGUyID0gY29sZW5jMi5jb2xbY29sXTtcblxuICAgIGlmIChlMSAmJiBlMikge1xuICAgICAgaWYgKGUxLnR5cGUgIT0gZTIudHlwZSkge1xuICAgICAgICBkaXN0ICs9IChjb25zdHMuRElTVF9CWV9FTkNUWVBFW2UxLnR5cGVdIHx8IHt9KVtlMi50eXBlXSB8fCAxO1xuICAgICAgfVxuICAgICAgLy9GSVhNRSBhZGQgYWdncmVnYXRpb25cbiAgICB9IGVsc2Uge1xuICAgICAgZGlzdCArPSBjb25zdHMuRElTVF9NSVNTSU5HO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBkaXN0O1xufVxuXG5mdW5jdGlvbiBjb2xlbmMoZW5jb2RpbmcpIHtcbiAgdmFyIF9jb2xlbmMgPSB7fSxcbiAgICBlbmMgPSBlbmNvZGluZy5lbmM7XG5cbiAgdmwua2V5cyhlbmMpLmZvckVhY2goZnVuY3Rpb24oZW5jVHlwZSkge1xuICAgIHZhciBlID0gdmwuZHVwbGljYXRlKGVuY1tlbmNUeXBlXSk7XG4gICAgZS50eXBlID0gZW5jVHlwZTtcbiAgICBfY29sZW5jW2UubmFtZSB8fCAnJ10gPSBlO1xuICAgIGRlbGV0ZSBlLm5hbWU7XG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgbWFya3R5cGU6IGVuY29kaW5nLm1hcmt0eXBlLFxuICAgIGNvbDogX2NvbGVuY1xuICB9O1xufSIsInZhciBjb25zdHMgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2VuOiB7fSxcbiAgY2x1c3Rlcjoge30sXG4gIHJhbms6IHt9XG59O1xuXG5jb25zdHMuZ2VuLkRFRkFVTFRfT1BUID0ge1xuICBnZW5BZ2dyOiB0cnVlLFxuICBnZW5CaW46IHRydWUsXG4gIGdlblR5cGVDYXN0aW5nOiBmYWxzZSxcblxuICBhZ2dyTGlzdDogW3VuZGVmaW5lZCwgJ2F2ZyddLCAvL3VuZGVmaW5lZCA9IG5vIGFnZ3JlZ2F0aW9uXG4gIG1hcmt0eXBlTGlzdDogWydwb2ludCcsICdiYXInLCAnbGluZScsICdhcmVhJywgJ3RleHQnXSwgLy9maWxsZWRfbWFwXG5cbiAgLy8gUFJVTklORyBSVUxFUyBGT1IgRU5DT0RJTkcgVkFSSUFUSU9OU1xuXG4gIC8qKlxuICAgKiBFbGltaW5hdGUgYWxsIHRyYW5zcG9zZVxuICAgKiAtIGtlZXBpbmcgaG9yaXpvbnRhbCBkb3QgcGxvdCBvbmx5LlxuICAgKiAtIGZvciBPeFEgY2hhcnRzLCBhbHdheXMgcHV0IE8gb24gWVxuICAgKiAtIHNob3cgb25seSBvbmUgT3hPLCBReFEgKGN1cnJlbnRseSBzb3J0ZWQgYnkgbmFtZSlcbiAgICovXG4gIG9taXRUcmFucG9zZTogdHJ1ZSxcbiAgLyoqIHJlbW92ZSBhbGwgZG90IHBsb3Qgd2l0aCA+MSBlbmNvZGluZyAqL1xuICBvbWl0RG90UGxvdFdpdGhFeHRyYUVuY29kaW5nOiB0cnVlLFxuXG4gIC8qKiByZW1vdmUgYWxsIGFnZ3JlZ2F0ZSBjaGFydHMgd2l0aCBhbGwgZGltcyBvbiBmYWNldHMgKHJvdywgY29sKSAqL1xuICAvL0ZJWE1FIHRoaXMgaXMgZ29vZCBmb3IgdGV4dCB0aG91Z2ghXG4gIG9taXRBZ2dyV2l0aEFsbERpbXNPbkZhY2V0czogdHJ1ZSxcblxuICAvLyBQUlVOSU5HIFJVTEVTIEZPUiBUUkFORk9STUFUSU9OIFZBUklBVElPTlNcblxuICAvKiogb21pdCBmaWVsZCBzZXRzIHdpdGggb25seSBkaW1lbnNpb25zICovXG4gIG9taXREaW1lbnNpb25Pbmx5OiB0cnVlLFxuICAvKiogb21pdCBhZ2dyZWdhdGUgZmllbGQgc2V0cyB3aXRoIG9ubHkgbWVhc3VyZXMgKi9cbiAgb21pdEFnZ3JlZ2F0ZVdpdGhNZWFzdXJlT25seTogdHJ1ZVxufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciB2bCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LnZsIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC52bCA6IG51bGwpO1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvdXRwdXQsIGZpZWxkcywgb3B0KSB7XG4gIHZhciB0ZiA9IG5ldyBBcnJheShmaWVsZHMubGVuZ3RoKTtcbiAgb3B0ID0gdXRpbC5nZW4uZ2V0T3B0KG9wdCk7XG5cbiAgZnVuY3Rpb24gYXNzaWduRmllbGQoaSwgaGFzQWdncikge1xuICAgIC8vIElmIGFsbCBmaWVsZHMgYXJlIGFzc2lnbmVkLCBzYXZlXG4gICAgaWYgKGkgPT09IGZpZWxkcy5sZW5ndGgpIHtcbiAgICAgIGlmIChvcHQub21pdEFnZ3JlZ2F0ZVdpdGhNZWFzdXJlT25seSB8fCBvcHQub21pdERpbWVuc2lvbk9ubHkpIHtcbiAgICAgICAgdmFyIGhhc01lYXN1cmUgPSBmYWxzZSwgaGFzRGltZW5zaW9uID0gZmFsc2UsIGhhc1JhdyA9IGZhbHNlO1xuICAgICAgICB0Zi5mb3JFYWNoKGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgICBpZiAodXRpbC5pc0RpbShmKSkge1xuICAgICAgICAgICAgaGFzRGltZW5zaW9uID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaGFzTWVhc3VyZSA9IHRydWU7XG4gICAgICAgICAgICBpZiAoIWYuYWdncikgaGFzUmF3ID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIWhhc01lYXN1cmUgJiYgb3B0Lm9taXREaW1lbnNpb25Pbmx5KSByZXR1cm47XG4gICAgICAgIGlmICghaGFzRGltZW5zaW9uICYmICFoYXNSYXcgJiYgb3B0Lm9taXRBZ2dyZWdhdGVXaXRoTWVhc3VyZU9ubHkpIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgb3V0cHV0LnB1c2godmwuZHVwbGljYXRlKHRmKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGYgPSBmaWVsZHNbaV07XG5cbiAgICAvLyBPdGhlcndpc2UsIGFzc2lnbiBpLXRoIGZpZWxkXG4gICAgc3dpdGNoIChmLnR5cGUpIHtcbiAgICAgIC8vVE9ETyBcIkRcIiwgXCJHXCJcbiAgICAgIGNhc2UgJ1EnOlxuICAgICAgICB0ZltpXSA9IHtuYW1lOiBmLm5hbWUsIHR5cGU6IGYudHlwZX07XG4gICAgICAgIGlmIChmLmFnZ3IpIHtcbiAgICAgICAgICB0ZltpXS5hZ2dyID0gZi5hZ2dyO1xuICAgICAgICAgIGFzc2lnbkZpZWxkKGkgKyAxLCB0cnVlKTtcbiAgICAgICAgfSBlbHNlIGlmIChmLl9hZ2dyKSB7XG4gICAgICAgICAgdmFyIGFnZ3JlZ2F0ZXMgPSBmLl9hZ2dyID09ICcqJyA/IG9wdC5hZ2dyTGlzdCA6IGYuX2FnZ3I7XG5cbiAgICAgICAgICBmb3IgKHZhciBqIGluIGFnZ3JlZ2F0ZXMpIHtcbiAgICAgICAgICAgIHZhciBhID0gYWdncmVnYXRlc1tqXTtcbiAgICAgICAgICAgIGlmIChhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgaWYgKGhhc0FnZ3IgPT09IHRydWUgfHwgaGFzQWdnciA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8vIG11c3QgYmUgYWdncmVnYXRlZCwgb3Igbm8gY29uc3RyYWludFxuICAgICAgICAgICAgICAgIC8vc2V0IGFnZ3JlZ2F0ZSB0byB0aGF0IG9uZVxuICAgICAgICAgICAgICAgIHRmW2ldLmFnZ3IgPSBhO1xuICAgICAgICAgICAgICAgIGFzc2lnbkZpZWxkKGkgKyAxLCB0cnVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHsgLy8gaWYoYSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICBpZiAoaGFzQWdnciA9PT0gZmFsc2UgfHwgaGFzQWdnciA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8vIG11c3QgYmUgcmF3IHBsb3QsIG9yIG5vIGNvbnN0cmFpbnRcbiAgICAgICAgICAgICAgICBkZWxldGUgdGZbaV0uYWdncjtcbiAgICAgICAgICAgICAgICBhc3NpZ25GaWVsZChpICsgMSwgZmFsc2UpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKG9wdC5nZW5CaW4pIHtcbiAgICAgICAgICAgIC8vIGJpbiB0aGUgZmllbGQgaW5zdGVhZCFcbiAgICAgICAgICAgIGRlbGV0ZSB0ZltpXS5hZ2dyO1xuICAgICAgICAgICAgdGZbaV0uYmluID0gdHJ1ZTtcbiAgICAgICAgICAgIHRmW2ldLnR5cGUgPSAnUSc7XG4gICAgICAgICAgICBhc3NpZ25GaWVsZChpICsgMSwgaGFzQWdncik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKG9wdC5nZW5UeXBlQ2FzdGluZykge1xuICAgICAgICAgICAgLy8gd2UgY2FuIGFsc28gY2hhbmdlIGl0IHRvIGRpbWVuc2lvbiAoY2FzdCB0eXBlPVwiT1wiKVxuICAgICAgICAgICAgZGVsZXRlIHRmW2ldLmFnZ3I7XG4gICAgICAgICAgICBkZWxldGUgdGZbaV0uYmluO1xuICAgICAgICAgICAgdGZbaV0udHlwZSA9ICdPJztcbiAgICAgICAgICAgIGFzc2lnbkZpZWxkKGkgKyAxLCBoYXNBZ2dyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7IC8vIGJvdGggXCJhZ2dyXCIsIFwiX2FnZ3JcIiBub3QgaW4gZlxuICAgICAgICAgIGFzc2lnbkZpZWxkKGkgKyAxLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ08nOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGZbaV0gPSBmO1xuICAgICAgICBhc3NpZ25GaWVsZChpICsgMSwgaGFzQWdncik7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICB9XG5cbiAgYXNzaWduRmllbGQoMCwgbnVsbCk7XG5cbiAgcmV0dXJuIG91dHB1dDtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHZsID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cudmwgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLnZsIDogbnVsbCksXG4gIGdsb2JhbHMgPSByZXF1aXJlKCcuLi9nbG9iYWxzJyksXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cblxudmFyIEVOQ09ESU5HX1JVTEVTID0ge1xuICB4OiB7XG4gICAgZGF0YVR5cGVzOiB2bC5kYXRhVHlwZXMuTyArIHZsLmRhdGFUeXBlcy5RICsgdmwuZGF0YVR5cGVzLlQsXG4gICAgbXVsdGlwbGU6IHRydWUgLy9GSVhNRSBzaG91bGQgYWxsb3cgbXVsdGlwbGUgb25seSBmb3IgUSwgVFxuICB9LFxuICB5OiB7XG4gICAgZGF0YVR5cGVzOiB2bC5kYXRhVHlwZXMuTyArIHZsLmRhdGFUeXBlcy5RICsgdmwuZGF0YVR5cGVzLlQsXG4gICAgbXVsdGlwbGU6IHRydWUgLy9GSVhNRSBzaG91bGQgYWxsb3cgbXVsdGlwbGUgb25seSBmb3IgUSwgVFxuICB9LFxuICByb3c6IHtcbiAgICBkYXRhVHlwZXM6IHZsLmRhdGFUeXBlcy5PLFxuICAgIG11bHRpcGxlOiB0cnVlXG4gIH0sXG4gIGNvbDoge1xuICAgIGRhdGFUeXBlczogdmwuZGF0YVR5cGVzLk8sXG4gICAgbXVsdGlwbGU6IHRydWVcbiAgfSxcbiAgc2hhcGU6IHtcbiAgICBkYXRhVHlwZXM6IHZsLmRhdGFUeXBlcy5PXG4gIH0sXG4gIHNpemU6IHtcbiAgICBkYXRhVHlwZXM6IHZsLmRhdGFUeXBlcy5RXG4gIH0sXG4gIGNvbG9yOiB7XG4gICAgZGF0YVR5cGVzOiB2bC5kYXRhVHlwZXMuTyArIHZsLmRhdGFUeXBlcy5RXG4gIH0sXG4gIGFscGhhOiB7XG4gICAgZGF0YVR5cGVzOiB2bC5kYXRhVHlwZXMuUVxuICB9LFxuICB0ZXh0OiB7XG4gICAgZGF0YVR5cGVzOiBBTllfREFUQV9UWVBFU1xuICB9XG4gIC8vZ2VvOiB7XG4gIC8vICBkYXRhVHlwZXM6IFt2bC5kYXRhVHlwZXMuR11cbiAgLy99LFxuICAvL2FyYzogeyAvLyBwaWVcbiAgLy9cbiAgLy99XG59O1xuXG5mdW5jdGlvbiBydWxlcyhlbmMsIG9wdCkge1xuICAvLyBuZWVkIGF0IGxlYXN0IG9uZSBiYXNpYyBlbmNvZGluZ1xuICBpZiAoZW5jLnggfHwgZW5jLnkgfHwgZW5jLmdlbyB8fCBlbmMudGV4dCB8fCBlbmMuYXJjKSB7XG5cbiAgICBpZiAoZW5jLnggJiYgZW5jLnkpIHtcbiAgICAgIC8vIHNob3cgb25seSBvbmUgT3hPLCBReFFcbiAgICAgIGlmIChvcHQub21pdFRyYW5wb3NlICYmIGVuYy54LnR5cGUgPT0gZW5jLnkudHlwZSkge1xuICAgICAgICAvL1RPRE8gYmV0dGVyIGNyaXRlcmlhIHRoYW4gbmFtZVxuICAgICAgICBpZiAoZW5jLngubmFtZSA+IGVuYy55Lm5hbWUpIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZW5jLnJvdyB8fCBlbmMuY29sKSB7IC8vaGF2ZSBmYWNldChzKVxuICAgICAgLy8gZG9uJ3QgdXNlIGZhY2V0cyBiZWZvcmUgZmlsbGluZyB1cCB4LHlcbiAgICAgIGlmICgoIWVuYy54IHx8ICFlbmMueSkpIHJldHVybiBmYWxzZTtcblxuICAgICAgaWYgKG9wdC5vbWl0QWdncldpdGhBbGxEaW1zT25GYWNldHMpIHtcbiAgICAgICAgLy8gZG9uJ3QgdXNlIGZhY2V0IHdpdGggYWdncmVnYXRlIHBsb3Qgd2l0aCBvdGhlciBvdGhlciBvcmRpbmFsIG9uIExPRFxuXG4gICAgICAgIHZhciBoYXNBZ2dyID0gZmFsc2UsIGhhc090aGVyTyA9IGZhbHNlO1xuICAgICAgICBmb3IgKHZhciBlbmNUeXBlIGluIGVuYykge1xuICAgICAgICAgIHZhciBmaWVsZCA9IGVuY1tlbmNUeXBlXTtcbiAgICAgICAgICBpZiAoZmllbGQuYWdncikge1xuICAgICAgICAgICAgaGFzQWdnciA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh1dGlsLmlzRGltKGZpZWxkKSAmJiAoZW5jVHlwZSAhPT0gJ3JvdycgJiYgZW5jVHlwZSAhPT0gJ2NvbCcpKSB7XG4gICAgICAgICAgICBoYXNPdGhlck8gPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaGFzQWdnciAmJiBoYXNPdGhlck8pIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGhhc0FnZ3IgJiYgIWhhc090aGVyTykgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIG9uZSBkaW1lbnNpb24gXCJjb3VudFwiIGlzIHVzZWxlc3NcbiAgICBpZiAoZW5jLnggJiYgZW5jLnguYWdnciA9PSAnY291bnQnICYmICFlbmMueSkgcmV0dXJuIGZhbHNlO1xuICAgIGlmIChlbmMueSAmJiBlbmMueS5hZ2dyID09ICdjb3VudCcgJiYgIWVuYy54KSByZXR1cm4gZmFsc2U7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZW5jb2RpbmdzLCBmaWVsZHMsIG9wdCkge1xuICAvLyBnZW5lcmF0ZSBlbmNvZGluZ3MgKF9lbmMgcHJvcGVydHkgaW4gdmVnYWxpdGUpXG4gIHZhciB0bXBFbmMgPSB7fTtcblxuICBmdW5jdGlvbiBhc3NpZ25GaWVsZChpKSB7XG4gICAgLy8gSWYgYWxsIGZpZWxkcyBhcmUgYXNzaWduZWQsIHNhdmVcbiAgICBpZiAoaSA9PT0gZmllbGRzLmxlbmd0aCkge1xuICAgICAgLy8gYXQgdGhlIG1pbmltYWwgYWxsIGNoYXJ0IHNob3VsZCBoYXZlIHgsIHksIGdlbywgdGV4dCBvciBhcmNcbiAgICAgIGlmIChydWxlcyh0bXBFbmMsIG9wdCkpIHtcbiAgICAgICAgZW5jb2RpbmdzLnB1c2godmwuZHVwbGljYXRlKHRtcEVuYykpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIE90aGVyd2lzZSwgYXNzaWduIGktdGggZmllbGRcbiAgICB2YXIgZmllbGQgPSBmaWVsZHNbaV07XG4gICAgZm9yICh2YXIgaiBpbiB2bC5lbmNvZGluZ1R5cGVzKSB7XG4gICAgICB2YXIgZXQgPSB2bC5lbmNvZGluZ1R5cGVzW2pdO1xuXG4gICAgICAvL1RPRE86IHN1cHBvcnQgXCJtdWx0aXBsZVwiIGFzc2lnbm1lbnRcbiAgICAgIGlmICghKGV0IGluIHRtcEVuYykgJiZcbiAgICAgICAgKEVOQ09ESU5HX1JVTEVTW2V0XS5kYXRhVHlwZXMgJiB2bC5kYXRhVHlwZXNbZmllbGQudHlwZV0pID4gMCkge1xuICAgICAgICB0bXBFbmNbZXRdID0gZmllbGQ7XG4gICAgICAgIGFzc2lnbkZpZWxkKGkgKyAxKTtcbiAgICAgICAgZGVsZXRlIHRtcEVuY1tldF07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYXNzaWduRmllbGQoMCk7XG5cbiAgcmV0dXJuIGVuY29kaW5ncztcbn07XG4iLCJ2YXIgdmwgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy52bCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwudmwgOiBudWxsKSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcblxudmFyIGdlbiA9IG1vZHVsZS5leHBvcnRzID0ge1xuICAvLyBkYXRhIHZhcmlhdGlvbnNcbiAgYWdncmVnYXRlczogcmVxdWlyZSgnLi9hZ2dyZWdhdGVzJyksXG4gIHByb2plY3Rpb25zOiByZXF1aXJlKCcuL3Byb2plY3Rpb25zJyksXG4gIC8vIGVuY29kaW5ncyAvIHZpc3VhbCB2YXJpYXRvbnNcbiAgZmllbGRzOiByZXF1aXJlKCcuL2ZpZWxkcycpLFxuICBtYXJrdHlwZXM6IHJlcXVpcmUoJy4vbWFya3R5cGVzJylcbn07XG5cbi8vRklYTUUgbW92ZSB0aGVzZSB0byB2bFxudmFyIEFHR1JFR0FUSU9OX0ZOID0geyAvL2FsbCBwb3NzaWJsZSBhZ2dyZWdhdGUgZnVuY3Rpb24gbGlzdGVkIGJ5IGVhY2ggZGF0YSB0eXBlXG4gIFE6IHZsLnNjaGVtYS5hZ2dyLnN1cHBvcnRlZEVudW1zLlFcbn07XG5cbnZhciBUUkFOU0ZPUk1fRk4gPSB7IC8vYWxsIHBvc3NpYmxlIHRyYW5zZm9ybSBmdW5jdGlvbiBsaXN0ZWQgYnkgZWFjaCBkYXRhIHR5cGVcbiAgLy8gUTogWydsb2cnLCAnc3FydCcsICdhYnMnXSwgLy8gXCJsb2dpdD9cIlxuICBUOiB2bC5zY2hlbWEudGltZWZuc1xufTtcblxuZ2VuLmNoYXJ0cyA9IGZ1bmN0aW9uKGZpZWxkcywgb3B0LCBjZmcsIGZsYXQpIHtcbiAgb3B0ID0gdXRpbC5nZW4uZ2V0T3B0KG9wdCk7XG4gIGZsYXQgPSBmbGF0ID09PSB1bmRlZmluZWQgPyB7ZW5jb2RpbmdzOiAxfSA6IGZsYXQ7XG5cbiAgLy8gVE9ETyBnZW5lcmF0ZVxuXG4gIC8vIGdlbmVyYXRlIHBlcm11dGF0aW9uIG9mIGVuY29kaW5nIG1hcHBpbmdzXG4gIHZhciBmaWVsZFNldHMgPSBvcHQuZ2VuQWdnciA/IGdlbi5nZW5BZ2dyZWdhdGUoW10sIGZpZWxkcywgb3B0KSA6IFtmaWVsZHNdLFxuICAgIGVuY29kaW5ncywgY2hhcnRzLCBsZXZlbCA9IDA7XG5cbiAgaWYgKGZsYXQgPT09IHRydWUgfHwgKGZsYXQgJiYgZmxhdC5hZ2dyKSkge1xuICAgIGVuY29kaW5ncyA9IGZpZWxkU2V0cy5yZWR1Y2UoZnVuY3Rpb24ob3V0cHV0LCBmaWVsZHMpIHtcbiAgICAgIHJldHVybiBnZW4uZmllbGRzKG91dHB1dCwgZmllbGRzLCBvcHQpO1xuICAgIH0sIFtdKTtcbiAgfSBlbHNlIHtcbiAgICBlbmNvZGluZ3MgPSBmaWVsZFNldHMubWFwKGZ1bmN0aW9uKGZpZWxkcykge1xuICAgICAgcmV0dXJuIGdlbi5maWVsZHMoW10sIGZpZWxkcywgb3B0KTtcbiAgICB9LCB0cnVlKTtcbiAgICBsZXZlbCArPSAxO1xuICB9XG5cbiAgaWYgKGZsYXQgPT09IHRydWUgfHwgKGZsYXQgJiYgZmxhdC5lbmNvZGluZ3MpKSB7XG4gICAgY2hhcnRzID0gdXRpbC5uZXN0ZWRSZWR1Y2UoZW5jb2RpbmdzLCBmdW5jdGlvbihvdXRwdXQsIGVuY29kaW5ncykge1xuICAgICAgcmV0dXJuIGdlbi5tYXJrdHlwZXMob3V0cHV0LCBlbmNvZGluZ3MsIG9wdCwgY2ZnKTtcbiAgICB9LCBsZXZlbCwgdHJ1ZSk7XG4gIH0gZWxzZSB7XG4gICAgY2hhcnRzID0gdXRpbC5uZXN0ZWRNYXAoZW5jb2RpbmdzLCBmdW5jdGlvbihlbmNvZGluZ3MpIHtcbiAgICAgIHJldHVybiBnZW4ubWFya3R5cGVzKFtdLCBlbmNvZGluZ3MsIG9wdCwgY2ZnKTtcbiAgICB9LCBsZXZlbCwgdHJ1ZSk7XG4gICAgbGV2ZWwgKz0gMTtcbiAgfVxuICByZXR1cm4gY2hhcnRzO1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHZsID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cudmwgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLnZsIDogbnVsbCksXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob3V0cHV0LCBlbmMsIG9wdCwgY2ZnKSB7XG4gIG9wdCA9IHV0aWwuZ2VuLmdldE9wdChvcHQpO1xuICBnZXRTdXBwb3J0ZWRNYXJrVHlwZXMoZW5jLCBvcHQpXG4gICAgLmZvckVhY2goZnVuY3Rpb24obWFya1R5cGUpIHtcbiAgICAgIG91dHB1dC5wdXNoKHsgbWFya3R5cGU6IG1hcmtUeXBlLCBlbmM6IGVuYywgY2ZnOiBjZmcgfSk7XG4gICAgfSk7XG4gIHJldHVybiBvdXRwdXQ7XG59O1xuXG52YXIgbWFya3NSdWxlID0ge1xuICBwb2ludDogIHBvaW50UnVsZSxcbiAgYmFyOiAgICBiYXJSdWxlLFxuICBsaW5lOiAgIGxpbmVSdWxlLFxuICBhcmVhOiAgIGxpbmVSdWxlIC8vIGFyZWEgaXMgc2ltaWxhciB0byBsaW5lXG59O1xuXG4vL1RPRE8oa2FuaXR3KTogd3JpdGUgdGVzdCBjYXNlXG5mdW5jdGlvbiBnZXRTdXBwb3J0ZWRNYXJrVHlwZXMoZW5jLCBvcHQpIHtcbiAgdmFyIG1hcmtUeXBlcyA9IG9wdC5tYXJrdHlwZUxpc3QuZmlsdGVyKGZ1bmN0aW9uKG1hcmtUeXBlKSB7XG4gICAgdmFyIG1hcmsgPSB2bC5jb21waWxlLm1hcmtzW21hcmtUeXBlXSxcbiAgICAgIHJlcXMgPSBtYXJrLnJlcXVpcmVkRW5jb2RpbmcsXG4gICAgICBzdXBwb3J0ID0gbWFyay5zdXBwb3J0ZWRFbmNvZGluZztcblxuICAgIGZvciAodmFyIGkgaW4gcmVxcykgeyAvLyBhbGwgcmVxdWlyZWQgZW5jb2RpbmdzIGluIGVuY1xuICAgICAgaWYgKCEocmVxc1tpXSBpbiBlbmMpKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZm9yICh2YXIgZW5jVHlwZSBpbiBlbmMpIHsgLy8gYWxsIGVuY29kaW5ncyBpbiBlbmMgYXJlIHN1cHBvcnRlZFxuICAgICAgaWYgKCFzdXBwb3J0W2VuY1R5cGVdKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuICFtYXJrc1J1bGVbbWFya1R5cGVdIHx8IG1hcmtzUnVsZVttYXJrVHlwZV0oZW5jLCBvcHQpO1xuICB9KTtcblxuICAvL2NvbnNvbGUubG9nKCdlbmM6JywgdXRpbC5qc29uKGVuYyksIFwiIH4gbWFya3M6XCIsIG1hcmtUeXBlcyk7XG5cbiAgcmV0dXJuIG1hcmtUeXBlcztcbn1cblxuZnVuY3Rpb24gcG9pbnRSdWxlKGVuYywgb3B0KSB7XG4gIGlmIChlbmMueCAmJiBlbmMueSkge1xuICAgIC8vIGhhdmUgYm90aCB4ICYgeSA9PT4gc2NhdHRlciBwbG90IC8gYnViYmxlIHBsb3RcblxuICAgIC8vIEZvciBPeFFcbiAgICBpZiAob3B0Lm9taXRUcmFucG9zZSAmJiB1dGlsLnhPeVEoZW5jKSkge1xuICAgICAgLy8gaWYgb21pdFRyYW5wb3NlLCBwdXQgUSBvbiBYLCBPIG9uIFlcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBGb3IgT3hPXG4gICAgaWYgKHV0aWwuaXNEaW0oZW5jLngpICYmIHV0aWwuaXNEaW0oZW5jLnkpKSB7XG4gICAgICAvLyBzaGFwZSBkb2Vzbid0IHdvcmsgd2l0aCBib3RoIHgsIHkgYXMgb3JkaW5hbFxuICAgICAgaWYgKGVuYy5zaGFwZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIFRPRE8oa2FuaXR3KTogY2hlY2sgdGhhdCB0aGVyZSBpcyBxdWFudCBhdCBsZWFzdCAuLi5cbiAgICAgIGlmIChlbmMuY29sb3IgJiYgdXRpbC5pc0RpbShlbmMuY29sb3IpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfSBlbHNlIHsgLy8gcGxvdCB3aXRoIG9uZSBheGlzID0gZG90IHBsb3RcbiAgICAvLyBEb3QgcGxvdCBzaG91bGQgYWx3YXlzIGJlIGhvcml6b250YWxcbiAgICBpZiAob3B0Lm9taXRUcmFucG9zZSAmJiBlbmMueSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gZG90IHBsb3Qgc2hvdWxkbid0IGhhdmUgb3RoZXIgZW5jb2RpbmdcbiAgICBpZiAob3B0Lm9taXREb3RQbG90V2l0aEV4dHJhRW5jb2RpbmcgJiYgdmwua2V5cyhlbmMpLmxlbmd0aCA+IDEpIHJldHVybiBmYWxzZTtcblxuICAgIC8vIGRvdCBwbG90IHdpdGggc2hhcGUgaXMgbm9uLXNlbnNlXG4gICAgaWYgKGVuYy5zaGFwZSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBiYXJSdWxlKGVuYywgb3B0KSB7XG4gIC8vIG5lZWQgdG8gYWdncmVnYXRlIG9uIGVpdGhlciB4IG9yIHlcbiAgaWYgKChlbmMueC5hZ2dyICE9PSB1bmRlZmluZWQpIF4gKGVuYy55LmFnZ3IgIT09IHVuZGVmaW5lZCkpIHtcblxuICAgIC8vIGlmIG9taXRUcmFucG9zZSwgcHV0IFEgb24gWCwgTyBvbiBZXG4gICAgaWYgKG9wdC5vbWl0VHJhbnBvc2UgJiYgdXRpbC54T3lRKGVuYykpIHJldHVybiBmYWxzZTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBsaW5lUnVsZShlbmMsIG9wdCkge1xuICAvLyBUT0RPKGthbml0dyk6IGFkZCBvbWl0VmVydGljYWxMaW5lIGFzIGNvbmZpZ1xuXG4gIC8vIExpbmUgY2hhcnQgc2hvdWxkIGJlIG9ubHkgaG9yaXpvbnRhbFxuICAvLyBhbmQgdXNlIG9ubHkgdGVtcG9yYWwgZGF0YVxuICByZXR1cm4gZW5jLnggPT0gJ1QnICYmIGVuYy55ID09ICdRJztcbn1cbiIsInZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHByb2plY3Rpb25zO1xuXG4vKipcbiAqIGZpZWxkc1xuICogQHBhcmFtICB7W3R5cGVdfSBmaWVsZHMgYXJyYXkgb2YgZmllbGRzIGFuZCBxdWVyeSBpbmZvcm1hdGlvblxuICogQHJldHVybiB7W3R5cGVdfSAgICAgICAgW2Rlc2NyaXB0aW9uXVxuICovXG5mdW5jdGlvbiBwcm9qZWN0aW9ucyhmaWVsZHMpIHtcbiAgLy8gVE9ETyBzdXBwb3J0IG90aGVyIG1vZGUgb2YgcHJvamVjdGlvbnMgZ2VuZXJhdGlvblxuICAvLyBwb3dlcnNldCwgY2hvb3NlSywgY2hvb3NlS29yTGVzcyBhcmUgYWxyZWFkeSBpbmNsdWRlZCBpbiB0aGUgdXRpbFxuICAvLyBSaWdodCBub3cganVzdCBhZGQgb25lIG1vcmUgZmllbGRcblxuICB2YXIgc2VsZWN0ZWQgPSBbXSwgdW5zZWxlY3RlZCA9IFtdLCBmaWVsZFNldHM7XG5cbiAgZmllbGRzLmZvckVhY2goZnVuY3Rpb24oZmllbGQpe1xuICAgIGlmIChmaWVsZC5zZWxlY3RlZCkge1xuICAgICAgc2VsZWN0ZWQucHVzaChmaWVsZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHVuc2VsZWN0ZWQucHVzaChmaWVsZCk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgc2V0c1RvQWRkID0gdXRpbC5jaG9vc2VLb3JMZXNzKHVuc2VsZWN0ZWQsIDEpO1xuXG4gIGZpZWxkU2V0cyA9IHNldHNUb0FkZC5tYXAoZnVuY3Rpb24oc2V0VG9BZGQpe1xuICAgIHJldHVybiBzZXRUb0FkZC5jb25jYXQoc2VsZWN0ZWQpO1xuICB9KTtcblxuICByZXR1cm4gZmllbGRTZXRzO1xufVxuXG4iLCJ2YXIgZyA9IGdsb2JhbCB8fCB3aW5kb3c7XG5cbmcuQ0hBUlRfVFlQRVMgPSB7XG4gIFRBQkxFOiAnVEFCTEUnLFxuICBCQVI6ICdCQVInLFxuICBQTE9UOiAnUExPVCcsXG4gIExJTkU6ICdMSU5FJyxcbiAgQVJFQTogJ0FSRUEnLFxuICBNQVA6ICdNQVAnLFxuICBISVNUT0dSQU06ICdISVNUT0dSQU0nXG59O1xuXG5nLkFOWV9EQVRBX1RZUEVTID0gKDEgPDwgNCkgLSAxOyIsInZhciB2bCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LnZsIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC52bCA6IG51bGwpO1xuXG52YXIgcmFuayA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vVE9ETyBsb3dlciBzY29yZSBpZiB3ZSB1c2UgRyBhcyBPP1xudmFyIEVOQ09ESU5HX1NDT1JFID0ge1xuICBROiB7XG4gICAgeDogMSxcbiAgICB5OiAxLFxuICAgIHNpemU6IDAuNiwgLy9GSVhNRSBTSVpFIGZvciBCYXIgaXMgaG9ycmlibGUhXG4gICAgY29sb3I6IDAuNCxcbiAgICBhbHBoYTogMC40XG4gIH0sXG4gIE86IHsgLy8gVE9ETyBuZWVkIHRvIHRha2UgY2FyZGluYWxpdHkgaW50byBhY2NvdW50XG4gICAgeDogMC45OSwgLy8gaGFyZGVyIHRvIHJlYWQgYXhpc1xuICAgIHk6IDEsXG4gICAgcm93OiAwLjcsXG4gICAgY29sOiAwLjcsXG4gICAgY29sb3I6IDAuOCxcbiAgICBzaGFwZTogMC42XG4gIH1cbn07XG5cbi8vIGJhZCBzY29yZSBub3Qgc3BlY2lmaWVkIGluIHRoZSB0YWJsZSBhYm92ZVxudmFyIEJBRF9FTkNPRElOR19TQ09SRSA9IDAuMDEsXG4gIFVOVVNFRF9QT1NJVElPTiA9IDAuNTtcblxudmFyIE1BUktfU0NPUkUgPSB7XG4gIGxpbmU6IDAuOTksXG4gIGFyZWE6IDAuOTgsXG4gIGJhcjogMC45NyxcbiAgcG9pbnQ6IDAuOTYsXG4gIGNpcmNsZTogMC45NSxcbiAgc3F1YXJlOiAwLjk1LFxuICB0ZXh0OiAwLjhcbn07XG5cbnJhbmsuZW5jb2RpbmdTY29yZSA9IGZ1bmN0aW9uKGVuY29kaW5nKSB7XG4gIHZhciBmZWF0dXJlcyA9IHt9LFxuICAgIGVuY1R5cGVzID0gdmwua2V5cyhlbmNvZGluZy5lbmMpO1xuICBlbmNUeXBlcy5mb3JFYWNoKGZ1bmN0aW9uKGVuY1R5cGUpIHtcbiAgICB2YXIgZmllbGQgPSBlbmNvZGluZy5lbmNbZW5jVHlwZV07XG4gICAgZmVhdHVyZXNbZmllbGQubmFtZV0gPSB7XG4gICAgICB2YWx1ZTogZmllbGQudHlwZSArICc6JysgZW5jVHlwZSxcbiAgICAgIHNjb3JlOiBFTkNPRElOR19TQ09SRVtmaWVsZC50eXBlXVtlbmNUeXBlXSB8fCBCQURfRU5DT0RJTkdfU0NPUkVcbiAgICB9O1xuICB9KTtcblxuICAvLyBwZW5hbGl6ZSBub3QgdXNpbmcgcG9zaXRpb25hbFxuICBpZiAoZW5jVHlwZXMubGVuZ3RoID4gMSkge1xuICAgIGlmICgoIWVuY29kaW5nLmVuYy54IHx8ICFlbmNvZGluZy5lbmMueSkgJiYgIWVuY29kaW5nLmVuYy5nZW8pIHtcbiAgICAgIGZlYXR1cmVzLnVudXNlZFBvc2l0aW9uID0ge3Njb3JlOiBVTlVTRURfUE9TSVRJT059O1xuICAgIH1cbiAgfVxuXG4gIGZlYXR1cmVzLm1hcmtUeXBlID0ge1xuICAgIHZhbHVlOiBlbmNvZGluZy5tYXJrdHlwZSxcbiAgICBzY29yZTogTUFSS19TQ09SRVtlbmNvZGluZy5tYXJrdHlwZV1cbiAgfTtcblxuICByZXR1cm4ge1xuICAgIHNjb3JlOiB2bC5rZXlzKGZlYXR1cmVzKS5yZWR1Y2UoZnVuY3Rpb24ocCwgcykge1xuICAgICAgcmV0dXJuIHAgKiBmZWF0dXJlc1tzXS5zY29yZTtcbiAgICB9LCAxKSxcbiAgICBmZWF0dXJlczogZmVhdHVyZXNcbiAgfTtcbn07XG5cblxuLy8gcmF3ID4gYXZnLCBzdW0gPiBtaW4sbWF4ID4gYmluXG5cbnJhbmsuZmllbGRzU2NvcmUgPSBmdW5jdGlvbihmaWVsZHMpIHtcblxufTtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBjb25zdHMgPSByZXF1aXJlKCcuL2NvbnN0cycpO1xuXG52YXIgdXRpbCA9IG1vZHVsZS5leHBvcnRzID0ge1xuICBnZW46IHt9XG59O1xuXG52YXIgaXNEaW0gPSB1dGlsLmlzRGltID0gZnVuY3Rpb24gKGZpZWxkKSB7XG4gIHJldHVybiBmaWVsZC5iaW4gfHwgZmllbGQudHlwZSA9PT0gJ08nO1xufTtcblxudXRpbC54T3lRID0gZnVuY3Rpb24geE95USAoZW5jKSB7XG4gIHJldHVybiBlbmMueCAmJiBlbmMueSAmJiBpc0RpbShlbmMueCkgJiYgaXNEaW0oZW5jLnkpO1xufTtcblxudXRpbC5pc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiB7fS50b1N0cmluZy5jYWxsKG9iaikgPT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG5cbnV0aWwuanNvbiA9IGZ1bmN0aW9uKHMsIHNwKSB7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShzLCBudWxsLCBzcCk7XG59O1xuXG51dGlsLmtleXMgPSBmdW5jdGlvbihvYmopIHtcbiAgdmFyIGsgPSBbXSwgeDtcbiAgZm9yICh4IGluIG9iaikgay5wdXNoKHgpO1xuICByZXR1cm4gaztcbn07XG5cbnV0aWwubmVzdGVkTWFwID0gZnVuY3Rpb24gKGNvbCwgZiwgbGV2ZWwsIGZpbHRlcikge1xuICByZXR1cm4gbGV2ZWwgPT09IDAgP1xuICAgIGNvbC5tYXAoZikgOlxuICAgIGNvbC5tYXAoZnVuY3Rpb24odikge1xuICAgICAgdmFyIHIgPSB1dGlsLm5lc3RlZE1hcCh2LCBmLCBsZXZlbCAtIDEpO1xuICAgICAgcmV0dXJuIGZpbHRlciA/IHIuZmlsdGVyKHV0aWwubm9uRW1wdHkpIDogcjtcbiAgICB9KTtcbn07XG5cbnV0aWwubmVzdGVkUmVkdWNlID0gZnVuY3Rpb24gKGNvbCwgZiwgbGV2ZWwsIGZpbHRlcikge1xuICByZXR1cm4gbGV2ZWwgPT09IDAgP1xuICAgIGNvbC5yZWR1Y2UoZiwgW10pIDpcbiAgICBjb2wubWFwKGZ1bmN0aW9uKHYpIHtcbiAgICAgIHZhciByID0gdXRpbC5uZXN0ZWRSZWR1Y2UodiwgZiwgbGV2ZWwgLSAxKTtcbiAgICAgIHJldHVybiBmaWx0ZXIgPyByLmZpbHRlcih1dGlsLm5vbkVtcHR5KSA6IHI7XG4gICAgfSk7XG59O1xuXG51dGlsLm5vbkVtcHR5ID0gZnVuY3Rpb24oZ3JwKSB7XG4gIHJldHVybiAhdXRpbC5pc0FycmF5KGdycCkgfHwgZ3JwLmxlbmd0aCA+IDA7XG59O1xuXG5cbnV0aWwudHJhdmVyc2UgPSBmdW5jdGlvbiAobm9kZSwgYXJyKSB7XG4gIGlmIChub2RlLnZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICBhcnIucHVzaChub2RlLnZhbHVlKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAobm9kZS5sZWZ0KSB1dGlsLnRyYXZlcnNlKG5vZGUubGVmdCwgYXJyKTtcbiAgICBpZiAobm9kZS5yaWdodCkgdXRpbC50cmF2ZXJzZShub2RlLnJpZ2h0LCBhcnIpO1xuICB9XG4gIHJldHVybiBhcnI7XG59O1xuXG51dGlsLnVuaW9uID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgdmFyIG8gPSB7fTtcbiAgYS5mb3JFYWNoKGZ1bmN0aW9uKHgpIHsgb1t4XSA9IHRydWU7fSk7XG4gIGIuZm9yRWFjaChmdW5jdGlvbih4KSB7IG9beF0gPSB0cnVlO30pO1xuICByZXR1cm4gdXRpbC5rZXlzKG8pO1xufTtcblxuXG51dGlsLmdlbi5nZXRPcHQgPSBmdW5jdGlvbiAob3B0KSB7XG4gIC8vbWVyZ2Ugd2l0aCBkZWZhdWx0XG4gIHJldHVybiAob3B0ID8gdXRpbC5rZXlzKG9wdCkgOiBbXSkucmVkdWNlKGZ1bmN0aW9uKGMsIGspIHtcbiAgICBjW2tdID0gb3B0W2tdO1xuICAgIHJldHVybiBjO1xuICB9LCBPYmplY3QuY3JlYXRlKGNvbnN0cy5nZW4uREVGQVVMVF9PUFQpKTtcbn07XG5cbi8qKlxuICogcG93ZXJzZXQgY29kZSBmcm9tIGh0dHA6Ly9yb3NldHRhY29kZS5vcmcvd2lraS9Qb3dlcl9TZXQjSmF2YVNjcmlwdFxuICpcbiAqICAgdmFyIHJlcyA9IHBvd2Vyc2V0KFsxLDIsMyw0XSk7XG4gKlxuICogcmV0dXJuc1xuICpcbiAqIFtbXSxbMV0sWzJdLFsxLDJdLFszXSxbMSwzXSxbMiwzXSxbMSwyLDNdLFs0XSxbMSw0XSxcbiAqIFsyLDRdLFsxLDIsNF0sWzMsNF0sWzEsMyw0XSxbMiwzLDRdLFsxLDIsMyw0XV1cbltlZGl0XVxuKi9cblxudXRpbC5wb3dlcnNldCA9IGZ1bmN0aW9uKGxpc3QpIHtcbiAgdmFyIHBzID0gW1xuICAgIFtdXG4gIF07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIGZvciAodmFyIGogPSAwLCBsZW4gPSBwcy5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgcHMucHVzaChwc1tqXS5jb25jYXQobGlzdFtpXSkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcHM7XG59O1xuXG51dGlsLmNob29zZUtvckxlc3MgPSBmdW5jdGlvbihsaXN0LCBrKSB7XG4gIHZhciBzdWJzZXQgPSBbW11dO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICBmb3IgKHZhciBqID0gMCwgbGVuID0gc3Vic2V0Lmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICB2YXIgc3ViID0gc3Vic2V0W2pdLmNvbmNhdChsaXN0W2ldKTtcbiAgICAgIGlmKHN1Yi5sZW5ndGggPD0gayl7XG4gICAgICAgIHN1YnNldC5wdXNoKHN1Yik7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBzdWJzZXQ7XG59O1xuXG51dGlsLmNob29zZUsgPSBmdW5jdGlvbihsaXN0LCBrKSB7XG4gIHZhciBzdWJzZXQgPSBbW11dO1xuICB2YXIga0FycmF5ID1bXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgZm9yICh2YXIgaiA9IDAsIGxlbiA9IHN1YnNldC5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgdmFyIHN1YiA9IHN1YnNldFtqXS5jb25jYXQobGlzdFtpXSk7XG4gICAgICBpZihzdWIubGVuZ3RoIDwgayl7XG4gICAgICAgIHN1YnNldC5wdXNoKHN1Yik7XG4gICAgICB9ZWxzZSBpZiAoc3ViLmxlbmd0aCA9PT0gayl7XG4gICAgICAgIGtBcnJheS5wdXNoKHN1Yik7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBrQXJyYXk7XG59O1xuXG51dGlsLmNyb3NzID0gZnVuY3Rpb24oYSxiKXtcbiAgdmFyIHggPSBbXTtcbiAgZm9yKHZhciBpPTA7IGk8IGEubGVuZ3RoOyBpKyspe1xuICAgIGZvcih2YXIgaj0wO2o8IGIubGVuZ3RoOyBqKyspe1xuICAgICAgeC5wdXNoKGFbaV0uY29uY2F0KGJbal0pKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHg7XG59O1xuXG4iXX0=
