!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.vr=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var vr = module.exports = {
  cluster: require('./cluster/cluster'),
  gen: require('./gen/gen'),
  rank: require('./rank/rank'),
  util: require('./util')
};



},{"./cluster/cluster":2,"./gen/gen":9,"./rank/rank":13,"./util":15}],2:[function(require,module,exports){
(function (global){
"use strict";

module.exports = cluster;

var vl = (typeof window !== "undefined" ? window.vl : typeof global !== "undefined" ? global.vl : null),
  clusterfck = (typeof window !== "undefined" ? window.clusterfck : typeof global !== "undefined" ? global.clusterfck : null),
  consts = require('./clusterconsts'),
  util = require('../util');

cluster.distance = require('./distance');


function cluster(encodings) {
  var dist = cluster.distance.table(encodings),
    n = encodings.length;

  var clusterTrees = clusterfck.hcluster(vl.range(n), function(i, j) {
    return dist[i][j];
  }, 'average', consts.CLUSTER_THRESHOLD);

  var clusters = clusterTrees.map(function(tree) {
    return util.traverse(tree, []);
  });

  //console.log("clusters", clusters.map(function(c){ return c.join("+"); }));
  return clusters;
}
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../util":15,"./clusterconsts":3,"./distance":4}],3:[function(require,module,exports){
var c = module.exports = {};

c.SWAPPABLE = 0.05;
c.DIST_MISSING = 1;
c.CLUSTER_THRESHOLD = 1.1;

function reduceTupleToTable(r, x) {
  var a = x[0], b = x[1], d = x[2];
  r[a] = r[a] || {};
  r[b] = r[b] || {};
  r[a][b] = r[b][a] = d;
  return r;
}

c.DIST_BY_ENCTYPE = [
  // positional
  ['x', 'y', c.SWAPPABLE],
  ['row', 'col', c.SWAPPABLE],

  // ordinal mark properties
  ['color', 'shape', c.SWAPPABLE],

  // quantitative mark properties
  ['color', 'alpha', c.SWAPPABLE],
  ['size', 'alpha', c.SWAPPABLE],
  ['size', 'color', c.SWAPPABLE]
].reduce(reduceTupleToTable, {});

},{}],4:[function(require,module,exports){
(function (global){
var vl = (typeof window !== "undefined" ? window.vl : typeof global !== "undefined" ? global.vl : null),
  consts = require('./clusterconsts'),
  util = require('../util');

module.exports = distance = {};

distance.table = function (encodings) {
  var len = encodings.length,
    colencs = encodings.map(function(e) { return distance.getEncTypeByColumnName(e);}),
    diff = new Array(len), i, j;

  for (i = 0; i < len; i++) diff[i] = new Array(len);

  for (i = 0; i < len; i++) {
    for (j = i + 1; j < len; j++) {
      diff[j][i] = diff[i][j] = distance.get(colencs[i], colencs[j]);
    }
  }
  return diff;
};

distance.get = function (colenc1, colenc2) {
  var cols = util.union(vl.keys(colenc1.col), vl.keys(colenc2.col)),
    dist = 0;

  cols.forEach(function(col) {
    var e1 = colenc1.col[col], e2 = colenc2.col[col];

    if (e1 && e2) {
      if (e1.encType != e2.encType) {
        dist += (consts.DIST_BY_ENCTYPE[e1.encType] || {})[e2.encType] || 1;
      }
    } else {
      dist += consts.DIST_MISSING;
    }
  });

  // do not group stacked chart with similar non-stacked chart!
  var isStack1 = vl.Encoding.isStack(colenc1),
    isStack2 = vl.Encoding.isStack(colenc2);

  if(isStack1 || isStack2) {
    if(isStack1 && isStack2) {
      if(colenc1.enc.color.name !== colenc2.enc.color.name) {
        dist+=1;
      }
    } else {
      dist+=1; // surely different
    }
  }
  return dist;
};

// get encoding type by fieldname
distance.getEncTypeByColumnName = function(encoding) {
  var _colenc = {},
    enc = encoding.enc;

  vl.keys(enc).forEach(function(encType) {
    var e = vl.duplicate(enc[encType]);
    e.encType = encType;
    _colenc[e.name || ''] = e;
    delete e.name;
  });

  return {
    marktype: encoding.marktype,
    col: _colenc,
    enc: encoding.enc
  };
};
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
    omitDotPlot: { //FIXME remove this!
      type: 'boolean',
      default: false,
      description: 'remove all dot plots'
    },
    maxCardinalityForAutoAddOrdinal: {
      type: 'integer',
      default: 50,
      description: 'max cardinality for ordinal field to be considered for auto adding'
    },
    alwaysAddHistogram: {
      type: 'boolean',
      default: true
    }
  }
};

consts.gen.aggregates = {
  type: 'object',
  properties: {
    tableTypes: {
      type: 'boolean',
      default: 'both',
      enum: ['both', 'aggregated', 'disaggregated']
    },
    genBin: {
      type: 'boolean',
      default: true,
      description: 'Generate Binning'
    },
    minCardinalityForBin: {
      type: 'integer',
      default: 20,
      description: 'minimum cardinality of a field if we were to bin'
    },
    genTypeCasting: {
      type: 'boolean',
      default: true,
      description: 'Include type casting e.g., from Q to O'
    },
    omitDotPlot: {
      type: 'boolean',
      default: false,
      description: 'remove all dot plots'
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
    addCountForDimensionOnly: {
      type: 'boolean',
      default: true,
      description: 'Add count when there are dimension(s) only'
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
    marktypeList: {
      type: 'array',
      items: {type: 'string'},
      default: ['point', 'bar', 'line', 'area', 'text', 'tick'], //filled_map
      description: 'allowed marktypes'
    },
    encodingTypeList: {
      type: 'array',
      items: {type: 'string'},
      default: ['x', 'y', 'row', 'col', 'size', 'color', 'text', 'detail'],
      description: 'allowed encoding types'
    },
    maxGoodCardinalityForFacets: {
      type: 'integer',
      default: 6,
      description: 'maximum cardinality of a field to be put on facet (row/col) effectively'
    },
    maxCardinalityForFacets: {
      type: 'integer',
      default: 20,
      description: 'maximum cardinality of a field to be put on facet (row/col)'
    },
    maxGoodCardinalityForColor: {
      type: 'integer',
      default: 7,
      description: 'maximum cardinality of an ordinal field to be put on color effectively'
    },
    maxCardinalityForColor: {
      type: 'integer',
      default: 20,
      description: 'maximum cardinality of an ordinal field to be put on color'
    },
    maxCardinalityForShape: {
      type: 'integer',
      default: 6,
      description: 'maximum cardinality of an ordinal field to be put on shape'
    },
    omitTranpose:  {
      type: 'boolean',
      default: true,
      description: 'Eliminate all transpose by (1) keeping horizontal dot plot only (2) for OxQ charts, always put O on Y (3) show only one DxD, MxM (currently sorted by name)'
    },
    omitDotPlot: {
      type: 'boolean',
      default: false,
      description: 'remove all dot plots'
    },
    omitDotPlotWithExtraEncoding: {
      type: 'boolean',
      default: true,
      description: 'remove all dot plots with >1 encoding'
    },
    omitMultipleRetinalEncodings: {
      type: 'boolean',
      default: true,
      description: 'omit using multiple retinal variables (size, color, alpha, shape)'
    },
    omitNonTextAggrWithAllDimsOnFacets: {
      type: 'boolean',
      default: true,
      description: 'remove all aggregated charts (except text tables) with all dims on facets (row, col)'
    },
    omitSizeOnBar: {
      type: 'boolean',
      default: false,
      description: 'do not use bar\'s size'
    },
    omitStackedAverage: {
      type: 'boolean',
      default: true,
      description: 'do not stack bar chart with average'
    },
    alwaysGenerateTableAsHeatmap: {
      type: 'boolean',
      default: true
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

function genAggregates(output, fields, stats, opt) {
  opt = vl.schema.util.extend(opt||{}, consts.gen.aggregates);
  var tf = new Array(fields.length);

  function emit(fieldSet) {
    fieldSet = vl.duplicate(fieldSet);
    fieldSet.key = vl.field.shorthands(fieldSet);
    output.push(fieldSet);
  }

  function checkAndPush() {
    if (opt.omitMeasureOnly || opt.omitDimensionOnly) {
      var hasMeasure = false, hasDimension = false, hasRaw = false;
      tf.forEach(function(f) {
        if (vl.field.isDimension(f)) {
          hasDimension = true;
        } else {
          hasMeasure = true;
          if (!f.aggr) hasRaw = true;
        }
      });
      if (!hasDimension && !hasRaw && opt.omitMeasureOnly) return;
      if (!hasMeasure) {
        if (opt.addCountForDimensionOnly) {
          tf.push(vl.field.count());
          emit(tf);
          tf.pop();
        }
        if (opt.omitDimensionOnly) return;
      }
    }
    if (opt.omitDotPlot && tf.length === 1) return;
    emit(tf);
  }

  function assignQ(i, hasAggr) {
    var f = fields[i],
      canHaveAggr = hasAggr === true || hasAggr === null,
      cantHaveAggr = hasAggr === false || hasAggr === null;

    tf[i] = {name: f.name, type: f.type};

    if (f.aggr === 'count') { // if count is included in the selected fields
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
        if(vl.field.cardinality(tf[i], stats) > opt.minCardinalityForBin) {
          assignField(i + 1, hasAggr);
        }
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

    var fns = (!f._fn || f._fn === '*') ? opt.timeFnList : f._fn;
    for (var j in fns) {
      var fn = fns[j];
      if (fn === undefined) {
        if (!hasAggr) { // can't aggregate over raw time
          assignField(i+1, false);
        }
      } else {
        tf[i].fn = fn;
        assignField(i+1, hasAggr);
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

  assignField(0, opt.tableTypes === 'aggregated' ? true : opt.tableTypes === 'disaggregated' ? false : null);

  return output;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../consts":5,"../util":15}],7:[function(require,module,exports){
(function (global){
'use strict';

var vl = (typeof window !== "undefined" ? window.vl : typeof global !== "undefined" ? global.vl : null),
  genEncs = require('./encs'),
  getMarktypes = require('./marktypes'),
  rank = require('../rank/rank'),
  consts = require('../consts');

module.exports = genEncodingsFromFields;

function genEncodingsFromFields(output, fields, stats, opt, cfg, nested) {
  opt = vl.schema.util.extend(opt||{}, consts.gen.encodings);
  var encs = genEncs([], fields, stats, opt);

  if (nested) {
    return encs.reduce(function(dict, enc) {
      dict[enc] = genEncodingsFromEncs([], enc, stats, opt, cfg);
      return dict;
    }, {});
  } else {
    return encs.reduce(function(list, enc) {
      return genEncodingsFromEncs(list, enc, stats, opt, cfg);
    }, []);
  }
}

function genEncodingsFromEncs(output, enc, stats, opt, cfg) {
  getMarktypes(enc, stats, opt)
    .forEach(function(markType) {
      var encoding = finalTouch({marktype: markType, enc: enc, cfg: cfg}, opt),
        score = rank.encoding(encoding, stats, opt);

      encoding.score = score.score;
      encoding.scoreFeatures = score.features;
      output.push(encoding);
    });
  return output;
}

//FIXME this should be refactors
function finalTouch(encoding, opt) {
  if (encoding.marktype === 'text' && opt.alwaysGenerateTableAsHeatmap) {
    encoding.enc.color = encoding.enc.text;
  }
  return encoding;
}
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../consts":5,"../rank/rank":13,"./encs":8,"./marktypes":10}],8:[function(require,module,exports){
(function (global){
"use strict";

var vl = (typeof window !== "undefined" ? window.vl : typeof global !== "undefined" ? global.vl : null),
  globals = require('../globals'),
  util = require('../util'),
  consts = require('../consts'),
  genMarkTypes = require('./marktypes'),
  isDimension = vl.field.isDimension,
  isMeasure = vl.field.isMeasure;

module.exports = genEncs;

// FIXME remove dimension, measure and use information in vegalite instead!
var rules = {
  x: {
    dimension: true,
    measure: true,
    multiple: true //FIXME should allow multiple only for Q, T
  },
  y: {
    dimension: true,
    measure: true,
    multiple: true //FIXME should allow multiple only for Q, T
  },
  row: {
    dimension: true,
    multiple: true
  },
  col: {
    dimension: true,
    multiple: true
  },
  shape: {
    dimension: true,
    rules: shapeRules
  },
  size: {
    measure: true,
    rules: retinalEncRules
  },
  color: {
    dimension: true,
    measure: true,
    rules: colorRules
  },
  alpha: {
    measure: true,
    rules: retinalEncRules
  },
  text: {
    measure: true
  },
  detail: {
    dimension: true
  }
  //geo: {
  //  geo: true
  //},
  //arc: { // pie
  //
  //}
};

function retinalEncRules(enc, field, stats, opt) {
  if (opt.omitMultipleRetinalEncodings) {
    if (enc.color || enc.size || enc.shape || enc.alpha) return false;
  }
  return true;
}

function colorRules(enc, field, stats, opt) {
  if(!retinalEncRules(enc, field, stats, opt)) return false;

  return vl.field.isMeasure(field) ||
    vl.field.cardinality(field, stats) <= opt.maxCardinalityForColor;
}

function shapeRules(enc, field, stats, opt) {
  if(!retinalEncRules(enc, field, stats, opt)) return false;

  if (field.bin && field.type === 'Q') return false;
  if (field.fn && field.type === 'T') return false;
  return vl.field.cardinality(field, stats) <= opt.maxCardinalityForColor;
}

function dimMeaTransposeRule(enc) {
  // create horizontal histogram for ordinal
  if (enc.y.type === 'O' && isMeasure(enc.x)) return true;

  // vertical histogram for Q and T
  if (isMeasure(enc.y) && (enc.x.type !== 'O' && isDimension(enc.x))) return true;

  return false;
}

function generalRules(enc, stats, opt) {
  // enc.text is only used for TEXT TABLE
  if (enc.text) {
    return genMarkTypes.satisfyRules(enc, 'text', stats, opt);
  }

  // CARTESIAN PLOT OR MAP
  if (enc.x || enc.y || enc.geo || enc.arc) {

    if (enc.row || enc.col) { //have facet(s)

      // don't use facets before filling up x,y
      if (!enc.x || !enc.y) return false;

      if (opt.omitNonTextAggrWithAllDimsOnFacets) {
        // remove all aggregated charts with all dims on facets (row, col)
        if (genEncs.isAggrWithAllDimOnFacets(enc)) return false;
      }
    }

    if (enc.x && enc.y) {
      if (opt.omitTranpose) {
        if ((!!isDimension(enc.x)) ^ (!!isDimension(enc.y))) { // dim x mea
          if (!dimMeaTransposeRule(enc)) return false;
        } else if (enc.y.type==='T' || enc.x.type === 'T') {
          if (enc.y.type==='T' && enc.x.type !== 'T') return false;
        } else { // show only one OxO, QxQ
          if (enc.x.name > enc.y.name) return false;
        }
      }
      return true;
    }

    // DOT PLOTS
    // // plot with one axis = dot plot
    if (opt.omitDotPlot) return false;

    // Dot plot should always be horizontal
    if (opt.omitTranpose && enc.y) return false;

    // dot plot shouldn't have other encoding
    if (opt.omitDotPlotWithExtraEncoding && vl.keys(enc).length > 1) return false;

    // one dimension "count" is useless
    if (enc.x && enc.x.aggr == 'count' && !enc.y) return false;
    if (enc.y && enc.y.aggr == 'count' && !enc.x) return false;

    return true;
  }
  return false;
}

genEncs.isAggrWithAllDimOnFacets = function (enc) {
  var hasAggr = false, hasOtherO = false;
  for (var encType in enc) {
    var field = enc[encType];
    if (field.aggr) {
      hasAggr = true;
    }
    if (vl.field.isDimension(field) && (encType !== 'row' && encType !== 'col')) {
      hasOtherO = true;
    }
    if (hasAggr && hasOtherO) break;
  }

  return hasAggr && !hasOtherO;
};


function genEncs(encs, fields, stats, opt) {
  opt = vl.schema.util.extend(opt||{}, consts.gen.encodings);
  // generate a collection vegalite's enc
  var tmpEnc = {};

  function assignField(i) {
    // If all fields are assigned, save
    if (i === fields.length) {
      // at the minimal all chart should have x, y, geo, text or arc
      if (generalRules(tmpEnc, stats, opt)) {
        encs.push(vl.duplicate(tmpEnc));
      }
      return;
    }

    // Otherwise, assign i-th field
    var field = fields[i];
    for (var j in opt.encodingTypeList) {
      var et = opt.encodingTypeList[j],
        isDim = isDimension(field);

      //TODO: support "multiple" assignment
      if (!(et in tmpEnc) && // encoding not used
        ((isDim && rules[et].dimension) || (!isDim && rules[et].measure)) &&
        (!rules[et].rules || rules[et].rules(tmpEnc, field, stats, opt))
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

},{"../consts":5,"../globals":12,"../util":15,"./marktypes":10}],9:[function(require,module,exports){
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
  consts = require('../consts'),
  isDimension = vl.field.isDimension;

var vlmarktypes = module.exports = getMarktypes;

var marksRule = vlmarktypes.rule = {
  point:  pointRule,
  bar:    barRule,
  line:   lineRule,
  area:   areaRule, // area is similar to line
  text:   textRule,
  tick:   tickRule
};

function getMarktypes(enc, stats, opt) {
  opt = vl.schema.util.extend(opt||{}, consts.gen.encodings);

  var markTypes = opt.marktypeList.filter(function(markType){
    return vlmarktypes.satisfyRules(enc, markType, stats, opt);
  });

  return markTypes;
}

vlmarktypes.satisfyRules = function (enc, markType, stats, opt) {
  var mark = vl.compile.marks[markType],
    reqs = mark.requiredEncoding,
    support = mark.supportedEncoding;

  for (var i in reqs) { // all required encodings in enc
    if (!(reqs[i] in enc)) return false;
  }

  for (var encType in enc) { // all encodings in enc are supported
    if (!support[encType]) return false;
  }

  return !marksRule[markType] || marksRule[markType](enc, stats, opt);
};

function facetRule(field, stats, opt) {
  return vl.field.cardinality(field, stats) <= opt.maxCardinalityForFacets;
}

function facetsRule(enc, stats, opt) {
  if(enc.row && !facetRule(enc.row, stats, opt)) return false;
  if(enc.col && !facetRule(enc.col, stats, opt)) return false;
  return true;
}

function pointRule(enc, stats, opt) {
  if(!facetsRule(enc, stats, opt)) return false;
  if (enc.x && enc.y) {
    // have both x & y ==> scatter plot / bubble plot

    var xIsDim = isDimension(enc.x),
      yIsDim = isDimension(enc.y);

    // For OxO
    if (xIsDim && yIsDim) {
      // shape doesn't work with both x, y as ordinal
      if (enc.shape) {
        return false;
      }

      // TODO(kanitw): check that there is quant at least ...
      if (enc.color && isDimension(enc.color)) {
        return false;
      }
    }

  } else { // plot with one axis = dot plot
    if (opt.omitDotPlot) return false;

    // Dot plot should always be horizontal
    if (opt.omitTranpose && enc.y) return false;

    // dot plot shouldn't have other encoding
    if (opt.omitDotPlotWithExtraEncoding && vl.keys(enc).length > 1) return false;

    // dot plot with shape is non-sense
    if (enc.shape) return false;
  }
  return true;
}

function tickRule(enc, stats, opt) {
  if (enc.x || enc.y) {
    if(vl.enc.isAggregate(enc)) return false;

    var xIsDim = isDimension(enc.x),
      yIsDim = isDimension(enc.y);

    return (!xIsDim && (!enc.y || yIsDim)) ||
      (!yIsDim && (!enc.x || xIsDim));
  }
  return false;
}

function barRule(enc, stats, opt) {
  if(!facetsRule(enc, stats, opt)) return false;

  // need to aggregate on either x or y
  if (opt.omitSizeOnBar && enc.size !== undefined) return false;

  if (((enc.x.aggr !== undefined) ^ (enc.y.aggr !== undefined)) &&
      (isDimension(enc.x) ^ isDimension(enc.y))) {

    var aggr = enc.x.aggr || enc.y.aggr;
    return !(opt.omitStackedAverage && aggr ==='avg' && enc.color);
  }

  return false;
}

function lineRule(enc, stats, opt) {
  if(!facetsRule(enc, stats, opt)) return false;

  // TODO(kanitw): add omitVerticalLine as config

  // FIXME truly ordinal data is fine here too.
  // Line chart should be only horizontal
  // and use only temporal data
  return enc.x.type == 'T' && enc.x.fn && enc.y.type == 'Q' && enc.y.aggr;
}

function areaRule(enc, stats, opt) {
  if(!facetsRule(enc, stats, opt)) return false;

  if(!lineRule(enc, stats, opt)) return false;

  return !(opt.omitStackedAverage && enc.y.aggr ==='avg' && enc.color);
}

function textRule(enc, stats, opt) {
  // at least must have row or col and aggregated text values
  return (enc.row || enc.col) && enc.text && enc.text.aggr && !enc.x && !enc.y &&
    (!opt.alwaysGenerateTableAsHeatmap || !enc.color);
}
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../consts":5,"../util":15}],11:[function(require,module,exports){
(function (global){
var util = require('../util'),
  consts = require('../consts'),
  vl = (typeof window !== "undefined" ? window.vl : typeof global !== "undefined" ? global.vl : null),
  isDimension = vl.field.isDimension;

module.exports = projections;

// TODO support other mode of projections generation
// powerset, chooseK, chooseKorLess are already included in the util

/**
 * fields
 * @param  {[type]} fields array of fields and query information
 * @return {[type]}        [description]
 */
function projections(fields, stats, opt) {
  opt = vl.schema.util.extend(opt||{}, consts.gen.projections);

  // First categorize field, selected, fieldsToAdd, and save indices
  var selected = [], fieldsToAdd = [], fieldSets = [],
    hasSelectedDimension = false,
    hasSelectedMeasure = false,
    indices = {};

  fields.forEach(function(field, index){
    //save indices for stable sort later
    indices[field.name] = index;

    if (field.selected) {
      selected.push(field);
      if (isDimension(field)) {
        hasSelectedDimension = true;
      } else {
        hasSelectedMeasure = true;
      }
    } else if (!field.excluded && !vl.field.isCount(field)) {
      if (vl.field.isDimension(field) &&
          vl.field.cardinality(field, stats, 15) > opt.maxCardinalityForAutoAddOrdinal) {
        return;
      }
      fieldsToAdd.push(field);
    }
  });

  fieldsToAdd.sort(compareFieldsToAdd(hasSelectedDimension, hasSelectedMeasure, indices));

  var setsToAdd = util.chooseKorLess(fieldsToAdd, 1);

  setsToAdd.forEach(function(setToAdd) {
    var fieldSet = selected.concat(setToAdd);
    if (fieldSet.length > 0) {
      if (opt.omitDotPlot && fieldSet.length === 1) return;
      fieldSets.push(fieldSet);
    }
  });

  fieldSets.forEach(function(fieldSet) {
      // always append projection's key to each projection returned, d3 style.
    fieldSet.key = projections.key(fieldSet);
  });

  return fieldSets;
}

function compareFieldsToAdd(hasSelectedDimension, hasSelectedMeasure, indices) {
  return function(a, b){
    var aIsDim = isDimension(a), bIsDim = isDimension(b);
    // sort by type of the data
    if (aIsDim ^ bIsDim) {
      if (!hasSelectedDimension) {
        if (!aIsDim && bIsDim) {
          return 1;
        }
        return -1;
      } else if (!hasSelectedMeasure) {
        if (aIsDim && !bIsDim) {
          return 1;
        }
        return 1;
      }
    }
    //make the sort stable
    return indices[a.name] - indices[b.name];
  };
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
var rank = module.exports = {
  encoding: require('./rankEncodings')
};



},{"./rankEncodings":14}],14:[function(require,module,exports){
(function (global){
var vl = (typeof window !== "undefined" ? window.vl : typeof global !== "undefined" ? global.vl : null);

module.exports = rankEncodings;

// bad score not specified in the table above
var BAD_ENCODING_SCORE = 0.01,
  UNUSED_POSITION = 0.5;

var MARK_SCORE = {
  line: 0.99,
  area: 0.98,
  bar: 0.97,
  tick: 0.96,
  point: 0.95,
  circle: 0.94,
  square: 0.94,
  text: 0.8
};

function rankEncodings(encoding, stats, opt) {
  var features = [],
    encTypes = vl.keys(encoding.enc);

  // var encodingMappingByField = vl.enc.reduce(encoding.enc, function(m, encType, field) {
  //   m[vl.field.shorthand(field)] = {encType: encType, field: field};
  //   return m;
  // }, {});

  vl.enc.forEach(encoding.enc, function(encType, field) {
    var role = vl.field.role(field);
    features.push({
      reason: encType+vl.shorthand.assign+vl.field.shorthand(field),
      score: rankEncodings.score[role](field, encType, encoding.marktype, stats, opt)
    });
  });

  // penalize not using positional only penalize for non-text
  if (encTypes.length > 1 && encoding.marktype !== 'text') {
    if ((!encoding.enc.x || !encoding.enc.y) && !encoding.enc.geo && !encoding.enc.text) {
      features.push({
        reason: 'unused position',
        score: UNUSED_POSITION
      });
    }
  }

  features.push({
    reason: 'marktype='+encoding.marktype,
    score: MARK_SCORE[encoding.marktype]
  });

  return {
    score: features.reduce(function(p, f) {
      return p * f.score;
    }, 1),
    features: features
  };
}

rankEncodings.dimensionScore = function (field, encType, marktype, stats, opt){
  var cardinality = vl.field.cardinality(field, stats);
  switch (encType) {
    case 'x':
      if(field.type === 'O') return 0.99;
      return 1;

    case 'y':
      if(field.type === 'O') return 1; //prefer ordinal on y
      if(field.type === 'T') return 0.8; // time should not be on Y
      return 0.99;

    case 'col':
      if (marktype === 'text') return 1;
      //prefer column over row due to scrolling issues
      return cardinality <= opt.maxGoodCardinalityForFacets ? 0.7 :
        cardinality <= opt.maxCardinalityForFacets ? 0.6 : 0.5;

    case 'row':
      if (marktype === 'text') return 0.99;
      return cardinality <= opt.maxGoodCardinalityForFacets ? 0.69 :
        cardinality <= opt.maxCardinalityForFacets ? 0.59 : 0.49;

    case 'color':
      //stacking gets lower score
      //FIXME add stacking option once we have control ..
      if (marktype ==='bar' || marktype ==='area') return 0.3;

      // true ordinal on color is currently bad (until we have good ordinal color scale support)
      if ((field.bin && field.type==='Q') || (field.fn && field.type==='T')) return 0.3;

      return cardinality <= opt.maxGoodCardinalityForColor ? 0.7: cardinality <= opt.maxCardinalityForColor ? 0.61 : 0.1;
    case 'shape':
      return cardinality <= opt.maxCardinalityForShape ? 0.6 : 0.1;
    case 'detail':
      return 0.5;
  }
  return BAD_ENCODING_SCORE;
};

rankEncodings.measureScore = function (field, encType, marktype, stats, opt) {
  switch (encType){
    case 'x': return 1;
    case 'y': return 1;
    case 'size':
      if (marktype === 'bar') return 0.1; //size of bar is very bad
      if (marktype === 'text') return 0.1;
      if (marktype === 'line') return 0.1;
      return 0.6;
    case 'color': return 0.5;
    case 'alpha': return 0.49;
    case 'text': return 0.4;
  }
  return BAD_ENCODING_SCORE;
};


rankEncodings.score = {
  dimension: rankEncodings.dimensionScore,
  measure: rankEncodings.measureScore
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],15:[function(require,module,exports){
"use strict";

var consts = require('./consts');

var util = module.exports = {
  gen: {}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvdnIiLCJzcmMvY2x1c3Rlci9jbHVzdGVyLmpzIiwic3JjL2NsdXN0ZXIvY2x1c3RlcmNvbnN0cy5qcyIsInNyYy9jbHVzdGVyL2Rpc3RhbmNlLmpzIiwic3JjL2NvbnN0cy5qcyIsInNyYy9nZW4vYWdncmVnYXRlcy5qcyIsInNyYy9nZW4vZW5jb2RpbmdzLmpzIiwic3JjL2dlbi9lbmNzLmpzIiwic3JjL2dlbi9nZW4uanMiLCJzcmMvZ2VuL21hcmt0eXBlcy5qcyIsInNyYy9nZW4vcHJvamVjdGlvbnMuanMiLCJzcmMvZ2xvYmFscy5qcyIsInNyYy9yYW5rL3JhbmsuanMiLCJzcmMvcmFuay9yYW5rRW5jb2RpbmdzLmpzIiwic3JjL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMxS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNqSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3pNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQzlJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN4SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciB2ciA9IG1vZHVsZS5leHBvcnRzID0ge1xuICBjbHVzdGVyOiByZXF1aXJlKCcuL2NsdXN0ZXIvY2x1c3RlcicpLFxuICBnZW46IHJlcXVpcmUoJy4vZ2VuL2dlbicpLFxuICByYW5rOiByZXF1aXJlKCcuL3JhbmsvcmFuaycpLFxuICB1dGlsOiByZXF1aXJlKCcuL3V0aWwnKVxufTtcblxuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBjbHVzdGVyO1xuXG52YXIgdmwgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy52bCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwudmwgOiBudWxsKSxcbiAgY2x1c3RlcmZjayA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LmNsdXN0ZXJmY2sgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLmNsdXN0ZXJmY2sgOiBudWxsKSxcbiAgY29uc3RzID0gcmVxdWlyZSgnLi9jbHVzdGVyY29uc3RzJyksXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cbmNsdXN0ZXIuZGlzdGFuY2UgPSByZXF1aXJlKCcuL2Rpc3RhbmNlJyk7XG5cblxuZnVuY3Rpb24gY2x1c3RlcihlbmNvZGluZ3MpIHtcbiAgdmFyIGRpc3QgPSBjbHVzdGVyLmRpc3RhbmNlLnRhYmxlKGVuY29kaW5ncyksXG4gICAgbiA9IGVuY29kaW5ncy5sZW5ndGg7XG5cbiAgdmFyIGNsdXN0ZXJUcmVlcyA9IGNsdXN0ZXJmY2suaGNsdXN0ZXIodmwucmFuZ2UobiksIGZ1bmN0aW9uKGksIGopIHtcbiAgICByZXR1cm4gZGlzdFtpXVtqXTtcbiAgfSwgJ2F2ZXJhZ2UnLCBjb25zdHMuQ0xVU1RFUl9USFJFU0hPTEQpO1xuXG4gIHZhciBjbHVzdGVycyA9IGNsdXN0ZXJUcmVlcy5tYXAoZnVuY3Rpb24odHJlZSkge1xuICAgIHJldHVybiB1dGlsLnRyYXZlcnNlKHRyZWUsIFtdKTtcbiAgfSk7XG5cbiAgLy9jb25zb2xlLmxvZyhcImNsdXN0ZXJzXCIsIGNsdXN0ZXJzLm1hcChmdW5jdGlvbihjKXsgcmV0dXJuIGMuam9pbihcIitcIik7IH0pKTtcbiAgcmV0dXJuIGNsdXN0ZXJzO1xufSIsInZhciBjID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuYy5TV0FQUEFCTEUgPSAwLjA1O1xuYy5ESVNUX01JU1NJTkcgPSAxO1xuYy5DTFVTVEVSX1RIUkVTSE9MRCA9IDEuMTtcblxuZnVuY3Rpb24gcmVkdWNlVHVwbGVUb1RhYmxlKHIsIHgpIHtcbiAgdmFyIGEgPSB4WzBdLCBiID0geFsxXSwgZCA9IHhbMl07XG4gIHJbYV0gPSByW2FdIHx8IHt9O1xuICByW2JdID0gcltiXSB8fCB7fTtcbiAgclthXVtiXSA9IHJbYl1bYV0gPSBkO1xuICByZXR1cm4gcjtcbn1cblxuYy5ESVNUX0JZX0VOQ1RZUEUgPSBbXG4gIC8vIHBvc2l0aW9uYWxcbiAgWyd4JywgJ3knLCBjLlNXQVBQQUJMRV0sXG4gIFsncm93JywgJ2NvbCcsIGMuU1dBUFBBQkxFXSxcblxuICAvLyBvcmRpbmFsIG1hcmsgcHJvcGVydGllc1xuICBbJ2NvbG9yJywgJ3NoYXBlJywgYy5TV0FQUEFCTEVdLFxuXG4gIC8vIHF1YW50aXRhdGl2ZSBtYXJrIHByb3BlcnRpZXNcbiAgWydjb2xvcicsICdhbHBoYScsIGMuU1dBUFBBQkxFXSxcbiAgWydzaXplJywgJ2FscGhhJywgYy5TV0FQUEFCTEVdLFxuICBbJ3NpemUnLCAnY29sb3InLCBjLlNXQVBQQUJMRV1cbl0ucmVkdWNlKHJlZHVjZVR1cGxlVG9UYWJsZSwge30pO1xuIiwidmFyIHZsID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cudmwgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLnZsIDogbnVsbCksXG4gIGNvbnN0cyA9IHJlcXVpcmUoJy4vY2x1c3RlcmNvbnN0cycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRpc3RhbmNlID0ge307XG5cbmRpc3RhbmNlLnRhYmxlID0gZnVuY3Rpb24gKGVuY29kaW5ncykge1xuICB2YXIgbGVuID0gZW5jb2RpbmdzLmxlbmd0aCxcbiAgICBjb2xlbmNzID0gZW5jb2RpbmdzLm1hcChmdW5jdGlvbihlKSB7IHJldHVybiBkaXN0YW5jZS5nZXRFbmNUeXBlQnlDb2x1bW5OYW1lKGUpO30pLFxuICAgIGRpZmYgPSBuZXcgQXJyYXkobGVuKSwgaSwgajtcblxuICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIGRpZmZbaV0gPSBuZXcgQXJyYXkobGVuKTtcblxuICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBmb3IgKGogPSBpICsgMTsgaiA8IGxlbjsgaisrKSB7XG4gICAgICBkaWZmW2pdW2ldID0gZGlmZltpXVtqXSA9IGRpc3RhbmNlLmdldChjb2xlbmNzW2ldLCBjb2xlbmNzW2pdKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRpZmY7XG59O1xuXG5kaXN0YW5jZS5nZXQgPSBmdW5jdGlvbiAoY29sZW5jMSwgY29sZW5jMikge1xuICB2YXIgY29scyA9IHV0aWwudW5pb24odmwua2V5cyhjb2xlbmMxLmNvbCksIHZsLmtleXMoY29sZW5jMi5jb2wpKSxcbiAgICBkaXN0ID0gMDtcblxuICBjb2xzLmZvckVhY2goZnVuY3Rpb24oY29sKSB7XG4gICAgdmFyIGUxID0gY29sZW5jMS5jb2xbY29sXSwgZTIgPSBjb2xlbmMyLmNvbFtjb2xdO1xuXG4gICAgaWYgKGUxICYmIGUyKSB7XG4gICAgICBpZiAoZTEuZW5jVHlwZSAhPSBlMi5lbmNUeXBlKSB7XG4gICAgICAgIGRpc3QgKz0gKGNvbnN0cy5ESVNUX0JZX0VOQ1RZUEVbZTEuZW5jVHlwZV0gfHwge30pW2UyLmVuY1R5cGVdIHx8IDE7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGRpc3QgKz0gY29uc3RzLkRJU1RfTUlTU0lORztcbiAgICB9XG4gIH0pO1xuXG4gIC8vIGRvIG5vdCBncm91cCBzdGFja2VkIGNoYXJ0IHdpdGggc2ltaWxhciBub24tc3RhY2tlZCBjaGFydCFcbiAgdmFyIGlzU3RhY2sxID0gdmwuRW5jb2RpbmcuaXNTdGFjayhjb2xlbmMxKSxcbiAgICBpc1N0YWNrMiA9IHZsLkVuY29kaW5nLmlzU3RhY2soY29sZW5jMik7XG5cbiAgaWYoaXNTdGFjazEgfHwgaXNTdGFjazIpIHtcbiAgICBpZihpc1N0YWNrMSAmJiBpc1N0YWNrMikge1xuICAgICAgaWYoY29sZW5jMS5lbmMuY29sb3IubmFtZSAhPT0gY29sZW5jMi5lbmMuY29sb3IubmFtZSkge1xuICAgICAgICBkaXN0Kz0xO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBkaXN0Kz0xOyAvLyBzdXJlbHkgZGlmZmVyZW50XG4gICAgfVxuICB9XG4gIHJldHVybiBkaXN0O1xufTtcblxuLy8gZ2V0IGVuY29kaW5nIHR5cGUgYnkgZmllbGRuYW1lXG5kaXN0YW5jZS5nZXRFbmNUeXBlQnlDb2x1bW5OYW1lID0gZnVuY3Rpb24oZW5jb2RpbmcpIHtcbiAgdmFyIF9jb2xlbmMgPSB7fSxcbiAgICBlbmMgPSBlbmNvZGluZy5lbmM7XG5cbiAgdmwua2V5cyhlbmMpLmZvckVhY2goZnVuY3Rpb24oZW5jVHlwZSkge1xuICAgIHZhciBlID0gdmwuZHVwbGljYXRlKGVuY1tlbmNUeXBlXSk7XG4gICAgZS5lbmNUeXBlID0gZW5jVHlwZTtcbiAgICBfY29sZW5jW2UubmFtZSB8fCAnJ10gPSBlO1xuICAgIGRlbGV0ZSBlLm5hbWU7XG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgbWFya3R5cGU6IGVuY29kaW5nLm1hcmt0eXBlLFxuICAgIGNvbDogX2NvbGVuYyxcbiAgICBlbmM6IGVuY29kaW5nLmVuY1xuICB9O1xufTsiLCJ2YXIgY29uc3RzID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdlbjoge30sXG4gIGNsdXN0ZXI6IHt9LFxuICByYW5rOiB7fVxufTtcblxuY29uc3RzLmdlbi5wcm9qZWN0aW9ucyA9IHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHByb3BlcnRpZXM6IHtcbiAgICBvbWl0RG90UGxvdDogeyAvL0ZJWE1FIHJlbW92ZSB0aGlzIVxuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICBkZXNjcmlwdGlvbjogJ3JlbW92ZSBhbGwgZG90IHBsb3RzJ1xuICAgIH0sXG4gICAgbWF4Q2FyZGluYWxpdHlGb3JBdXRvQWRkT3JkaW5hbDoge1xuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgZGVmYXVsdDogNTAsXG4gICAgICBkZXNjcmlwdGlvbjogJ21heCBjYXJkaW5hbGl0eSBmb3Igb3JkaW5hbCBmaWVsZCB0byBiZSBjb25zaWRlcmVkIGZvciBhdXRvIGFkZGluZydcbiAgICB9LFxuICAgIGFsd2F5c0FkZEhpc3RvZ3JhbToge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH1cbiAgfVxufTtcblxuY29uc3RzLmdlbi5hZ2dyZWdhdGVzID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgcHJvcGVydGllczoge1xuICAgIHRhYmxlVHlwZXM6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6ICdib3RoJyxcbiAgICAgIGVudW06IFsnYm90aCcsICdhZ2dyZWdhdGVkJywgJ2Rpc2FnZ3JlZ2F0ZWQnXVxuICAgIH0sXG4gICAgZ2VuQmluOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgZGVzY3JpcHRpb246ICdHZW5lcmF0ZSBCaW5uaW5nJ1xuICAgIH0sXG4gICAgbWluQ2FyZGluYWxpdHlGb3JCaW46IHtcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgIGRlZmF1bHQ6IDIwLFxuICAgICAgZGVzY3JpcHRpb246ICdtaW5pbXVtIGNhcmRpbmFsaXR5IG9mIGEgZmllbGQgaWYgd2Ugd2VyZSB0byBiaW4nXG4gICAgfSxcbiAgICBnZW5UeXBlQ2FzdGluZzoge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnSW5jbHVkZSB0eXBlIGNhc3RpbmcgZS5nLiwgZnJvbSBRIHRvIE8nXG4gICAgfSxcbiAgICBvbWl0RG90UGxvdDoge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICBkZXNjcmlwdGlvbjogJ3JlbW92ZSBhbGwgZG90IHBsb3RzJ1xuICAgIH0sXG4gICAgb21pdE1lYXN1cmVPbmx5OiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgZGVzY3JpcHRpb246ICdPbWl0IGFnZ3JlZ2F0aW9uIHdpdGggbWVhc3VyZShzKSBvbmx5J1xuICAgIH0sXG4gICAgb21pdERpbWVuc2lvbk9ubHk6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ09taXQgYWdncmVnYXRpb24gd2l0aCBkaW1lbnNpb24ocykgb25seSdcbiAgICB9LFxuICAgIGFkZENvdW50Rm9yRGltZW5zaW9uT25seToge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQWRkIGNvdW50IHdoZW4gdGhlcmUgYXJlIGRpbWVuc2lvbihzKSBvbmx5J1xuICAgIH0sXG4gICAgYWdnckxpc3Q6IHtcbiAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICBpdGVtczoge1xuICAgICAgICB0eXBlOiBbJ3N0cmluZyddXG4gICAgICB9LFxuICAgICAgZGVmYXVsdDogW3VuZGVmaW5lZCwgJ2F2ZyddXG4gICAgfSxcbiAgICB0aW1lRm5MaXN0OiB7XG4gICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgaXRlbXM6IHtcbiAgICAgICAgdHlwZTogWydzdHJpbmcnXVxuICAgICAgfSxcbiAgICAgIGRlZmF1bHQ6IFsneWVhciddXG4gICAgfVxuICB9XG59O1xuXG5jb25zdHMuZ2VuLmVuY29kaW5ncyA9IHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHByb3BlcnRpZXM6IHtcbiAgICBtYXJrdHlwZUxpc3Q6IHtcbiAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICBpdGVtczoge3R5cGU6ICdzdHJpbmcnfSxcbiAgICAgIGRlZmF1bHQ6IFsncG9pbnQnLCAnYmFyJywgJ2xpbmUnLCAnYXJlYScsICd0ZXh0JywgJ3RpY2snXSwgLy9maWxsZWRfbWFwXG4gICAgICBkZXNjcmlwdGlvbjogJ2FsbG93ZWQgbWFya3R5cGVzJ1xuICAgIH0sXG4gICAgZW5jb2RpbmdUeXBlTGlzdDoge1xuICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgIGl0ZW1zOiB7dHlwZTogJ3N0cmluZyd9LFxuICAgICAgZGVmYXVsdDogWyd4JywgJ3knLCAncm93JywgJ2NvbCcsICdzaXplJywgJ2NvbG9yJywgJ3RleHQnLCAnZGV0YWlsJ10sXG4gICAgICBkZXNjcmlwdGlvbjogJ2FsbG93ZWQgZW5jb2RpbmcgdHlwZXMnXG4gICAgfSxcbiAgICBtYXhHb29kQ2FyZGluYWxpdHlGb3JGYWNldHM6IHtcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgIGRlZmF1bHQ6IDYsXG4gICAgICBkZXNjcmlwdGlvbjogJ21heGltdW0gY2FyZGluYWxpdHkgb2YgYSBmaWVsZCB0byBiZSBwdXQgb24gZmFjZXQgKHJvdy9jb2wpIGVmZmVjdGl2ZWx5J1xuICAgIH0sXG4gICAgbWF4Q2FyZGluYWxpdHlGb3JGYWNldHM6IHtcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgIGRlZmF1bHQ6IDIwLFxuICAgICAgZGVzY3JpcHRpb246ICdtYXhpbXVtIGNhcmRpbmFsaXR5IG9mIGEgZmllbGQgdG8gYmUgcHV0IG9uIGZhY2V0IChyb3cvY29sKSdcbiAgICB9LFxuICAgIG1heEdvb2RDYXJkaW5hbGl0eUZvckNvbG9yOiB7XG4gICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICBkZWZhdWx0OiA3LFxuICAgICAgZGVzY3JpcHRpb246ICdtYXhpbXVtIGNhcmRpbmFsaXR5IG9mIGFuIG9yZGluYWwgZmllbGQgdG8gYmUgcHV0IG9uIGNvbG9yIGVmZmVjdGl2ZWx5J1xuICAgIH0sXG4gICAgbWF4Q2FyZGluYWxpdHlGb3JDb2xvcjoge1xuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgZGVmYXVsdDogMjAsXG4gICAgICBkZXNjcmlwdGlvbjogJ21heGltdW0gY2FyZGluYWxpdHkgb2YgYW4gb3JkaW5hbCBmaWVsZCB0byBiZSBwdXQgb24gY29sb3InXG4gICAgfSxcbiAgICBtYXhDYXJkaW5hbGl0eUZvclNoYXBlOiB7XG4gICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICBkZWZhdWx0OiA2LFxuICAgICAgZGVzY3JpcHRpb246ICdtYXhpbXVtIGNhcmRpbmFsaXR5IG9mIGFuIG9yZGluYWwgZmllbGQgdG8gYmUgcHV0IG9uIHNoYXBlJ1xuICAgIH0sXG4gICAgb21pdFRyYW5wb3NlOiAge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnRWxpbWluYXRlIGFsbCB0cmFuc3Bvc2UgYnkgKDEpIGtlZXBpbmcgaG9yaXpvbnRhbCBkb3QgcGxvdCBvbmx5ICgyKSBmb3IgT3hRIGNoYXJ0cywgYWx3YXlzIHB1dCBPIG9uIFkgKDMpIHNob3cgb25seSBvbmUgRHhELCBNeE0gKGN1cnJlbnRseSBzb3J0ZWQgYnkgbmFtZSknXG4gICAgfSxcbiAgICBvbWl0RG90UGxvdDoge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICBkZXNjcmlwdGlvbjogJ3JlbW92ZSBhbGwgZG90IHBsb3RzJ1xuICAgIH0sXG4gICAgb21pdERvdFBsb3RXaXRoRXh0cmFFbmNvZGluZzoge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAncmVtb3ZlIGFsbCBkb3QgcGxvdHMgd2l0aCA+MSBlbmNvZGluZydcbiAgICB9LFxuICAgIG9taXRNdWx0aXBsZVJldGluYWxFbmNvZGluZ3M6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ29taXQgdXNpbmcgbXVsdGlwbGUgcmV0aW5hbCB2YXJpYWJsZXMgKHNpemUsIGNvbG9yLCBhbHBoYSwgc2hhcGUpJ1xuICAgIH0sXG4gICAgb21pdE5vblRleHRBZ2dyV2l0aEFsbERpbXNPbkZhY2V0czoge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAncmVtb3ZlIGFsbCBhZ2dyZWdhdGVkIGNoYXJ0cyAoZXhjZXB0IHRleHQgdGFibGVzKSB3aXRoIGFsbCBkaW1zIG9uIGZhY2V0cyAocm93LCBjb2wpJ1xuICAgIH0sXG4gICAgb21pdFNpemVPbkJhcjoge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICBkZXNjcmlwdGlvbjogJ2RvIG5vdCB1c2UgYmFyXFwncyBzaXplJ1xuICAgIH0sXG4gICAgb21pdFN0YWNrZWRBdmVyYWdlOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgZGVzY3JpcHRpb246ICdkbyBub3Qgc3RhY2sgYmFyIGNoYXJ0IHdpdGggYXZlcmFnZSdcbiAgICB9LFxuICAgIGFsd2F5c0dlbmVyYXRlVGFibGVBc0hlYXRtYXA6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICB9XG4gIH1cbn07XG5cblxuXG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB2bCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LnZsIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC52bCA6IG51bGwpO1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKSxcbiAgY29uc3RzID0gcmVxdWlyZSgnLi4vY29uc3RzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZ2VuQWdncmVnYXRlcztcblxuZnVuY3Rpb24gZ2VuQWdncmVnYXRlcyhvdXRwdXQsIGZpZWxkcywgc3RhdHMsIG9wdCkge1xuICBvcHQgPSB2bC5zY2hlbWEudXRpbC5leHRlbmQob3B0fHx7fSwgY29uc3RzLmdlbi5hZ2dyZWdhdGVzKTtcbiAgdmFyIHRmID0gbmV3IEFycmF5KGZpZWxkcy5sZW5ndGgpO1xuXG4gIGZ1bmN0aW9uIGVtaXQoZmllbGRTZXQpIHtcbiAgICBmaWVsZFNldCA9IHZsLmR1cGxpY2F0ZShmaWVsZFNldCk7XG4gICAgZmllbGRTZXQua2V5ID0gdmwuZmllbGQuc2hvcnRoYW5kcyhmaWVsZFNldCk7XG4gICAgb3V0cHV0LnB1c2goZmllbGRTZXQpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tBbmRQdXNoKCkge1xuICAgIGlmIChvcHQub21pdE1lYXN1cmVPbmx5IHx8IG9wdC5vbWl0RGltZW5zaW9uT25seSkge1xuICAgICAgdmFyIGhhc01lYXN1cmUgPSBmYWxzZSwgaGFzRGltZW5zaW9uID0gZmFsc2UsIGhhc1JhdyA9IGZhbHNlO1xuICAgICAgdGYuZm9yRWFjaChmdW5jdGlvbihmKSB7XG4gICAgICAgIGlmICh2bC5maWVsZC5pc0RpbWVuc2lvbihmKSkge1xuICAgICAgICAgIGhhc0RpbWVuc2lvbiA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaGFzTWVhc3VyZSA9IHRydWU7XG4gICAgICAgICAgaWYgKCFmLmFnZ3IpIGhhc1JhdyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaWYgKCFoYXNEaW1lbnNpb24gJiYgIWhhc1JhdyAmJiBvcHQub21pdE1lYXN1cmVPbmx5KSByZXR1cm47XG4gICAgICBpZiAoIWhhc01lYXN1cmUpIHtcbiAgICAgICAgaWYgKG9wdC5hZGRDb3VudEZvckRpbWVuc2lvbk9ubHkpIHtcbiAgICAgICAgICB0Zi5wdXNoKHZsLmZpZWxkLmNvdW50KCkpO1xuICAgICAgICAgIGVtaXQodGYpO1xuICAgICAgICAgIHRmLnBvcCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHQub21pdERpbWVuc2lvbk9ubHkpIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG9wdC5vbWl0RG90UGxvdCAmJiB0Zi5sZW5ndGggPT09IDEpIHJldHVybjtcbiAgICBlbWl0KHRmKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFzc2lnblEoaSwgaGFzQWdncikge1xuICAgIHZhciBmID0gZmllbGRzW2ldLFxuICAgICAgY2FuSGF2ZUFnZ3IgPSBoYXNBZ2dyID09PSB0cnVlIHx8IGhhc0FnZ3IgPT09IG51bGwsXG4gICAgICBjYW50SGF2ZUFnZ3IgPSBoYXNBZ2dyID09PSBmYWxzZSB8fCBoYXNBZ2dyID09PSBudWxsO1xuXG4gICAgdGZbaV0gPSB7bmFtZTogZi5uYW1lLCB0eXBlOiBmLnR5cGV9O1xuXG4gICAgaWYgKGYuYWdnciA9PT0gJ2NvdW50JykgeyAvLyBpZiBjb3VudCBpcyBpbmNsdWRlZCBpbiB0aGUgc2VsZWN0ZWQgZmllbGRzXG4gICAgICBpZiAoY2FuSGF2ZUFnZ3IpIHtcbiAgICAgICAgdGZbaV0uYWdnciA9IGYuYWdncjtcbiAgICAgICAgYXNzaWduRmllbGQoaSArIDEsIHRydWUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYWdncmVnYXRlcyA9ICghZi5fYWdnciB8fCBmLl9hZ2dyID09PSAnKicpID8gb3B0LmFnZ3JMaXN0IDogZi5fYWdncjtcblxuICAgICAgZm9yICh2YXIgaiBpbiBhZ2dyZWdhdGVzKSB7XG4gICAgICAgIHZhciBhID0gYWdncmVnYXRlc1tqXTtcbiAgICAgICAgaWYgKGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGlmIChjYW5IYXZlQWdncikge1xuICAgICAgICAgICAgdGZbaV0uYWdnciA9IGE7XG4gICAgICAgICAgICBhc3NpZ25GaWVsZChpICsgMSwgdHJ1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgeyAvLyBpZihhID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgaWYgKGNhbnRIYXZlQWdncikge1xuICAgICAgICAgICAgZGVsZXRlIHRmW2ldLmFnZ3I7XG4gICAgICAgICAgICBhc3NpZ25GaWVsZChpICsgMSwgZmFsc2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAob3B0LmdlbkJpbikge1xuICAgICAgICAvLyBiaW4gdGhlIGZpZWxkIGluc3RlYWQhXG4gICAgICAgIGRlbGV0ZSB0ZltpXS5hZ2dyO1xuICAgICAgICB0ZltpXS5iaW4gPSB0cnVlO1xuICAgICAgICB0ZltpXS50eXBlID0gJ1EnO1xuICAgICAgICBpZih2bC5maWVsZC5jYXJkaW5hbGl0eSh0ZltpXSwgc3RhdHMpID4gb3B0Lm1pbkNhcmRpbmFsaXR5Rm9yQmluKSB7XG4gICAgICAgICAgYXNzaWduRmllbGQoaSArIDEsIGhhc0FnZ3IpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHQuZ2VuVHlwZUNhc3RpbmcpIHtcbiAgICAgICAgLy8gd2UgY2FuIGFsc28gY2hhbmdlIGl0IHRvIGRpbWVuc2lvbiAoY2FzdCB0eXBlPVwiT1wiKVxuICAgICAgICBkZWxldGUgdGZbaV0uYWdncjtcbiAgICAgICAgZGVsZXRlIHRmW2ldLmJpbjtcbiAgICAgICAgdGZbaV0udHlwZSA9ICdPJztcbiAgICAgICAgYXNzaWduRmllbGQoaSArIDEsIGhhc0FnZ3IpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGFzc2lnblQoaSwgaGFzQWdncikge1xuICAgIHZhciBmID0gZmllbGRzW2ldO1xuICAgIHRmW2ldID0ge25hbWU6IGYubmFtZSwgdHlwZTogZi50eXBlfTtcblxuICAgIHZhciBmbnMgPSAoIWYuX2ZuIHx8IGYuX2ZuID09PSAnKicpID8gb3B0LnRpbWVGbkxpc3QgOiBmLl9mbjtcbiAgICBmb3IgKHZhciBqIGluIGZucykge1xuICAgICAgdmFyIGZuID0gZm5zW2pdO1xuICAgICAgaWYgKGZuID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKCFoYXNBZ2dyKSB7IC8vIGNhbid0IGFnZ3JlZ2F0ZSBvdmVyIHJhdyB0aW1lXG4gICAgICAgICAgYXNzaWduRmllbGQoaSsxLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRmW2ldLmZuID0gZm47XG4gICAgICAgIGFzc2lnbkZpZWxkKGkrMSwgaGFzQWdncik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRklYTUUgd2hhdCBpZiB5b3UgYWdncmVnYXRlIHRpbWU/XG4gIH1cblxuICBmdW5jdGlvbiBhc3NpZ25GaWVsZChpLCBoYXNBZ2dyKSB7XG4gICAgaWYgKGkgPT09IGZpZWxkcy5sZW5ndGgpIHsgLy8gSWYgYWxsIGZpZWxkcyBhcmUgYXNzaWduZWRcbiAgICAgIGNoZWNrQW5kUHVzaCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBmID0gZmllbGRzW2ldO1xuICAgIC8vIE90aGVyd2lzZSwgYXNzaWduIGktdGggZmllbGRcbiAgICBzd2l0Y2ggKGYudHlwZSkge1xuICAgICAgLy9UT0RPIFwiRFwiLCBcIkdcIlxuICAgICAgY2FzZSAnUSc6XG4gICAgICAgIGFzc2lnblEoaSwgaGFzQWdncik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdUJzpcbiAgICAgICAgYXNzaWduVChpLCBoYXNBZ2dyKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ08nOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGZbaV0gPSBmO1xuICAgICAgICBhc3NpZ25GaWVsZChpICsgMSwgaGFzQWdncik7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICB9XG5cbiAgYXNzaWduRmllbGQoMCwgb3B0LnRhYmxlVHlwZXMgPT09ICdhZ2dyZWdhdGVkJyA/IHRydWUgOiBvcHQudGFibGVUeXBlcyA9PT0gJ2Rpc2FnZ3JlZ2F0ZWQnID8gZmFsc2UgOiBudWxsKTtcblxuICByZXR1cm4gb3V0cHV0O1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdmwgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy52bCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwudmwgOiBudWxsKSxcbiAgZ2VuRW5jcyA9IHJlcXVpcmUoJy4vZW5jcycpLFxuICBnZXRNYXJrdHlwZXMgPSByZXF1aXJlKCcuL21hcmt0eXBlcycpLFxuICByYW5rID0gcmVxdWlyZSgnLi4vcmFuay9yYW5rJyksXG4gIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdlbkVuY29kaW5nc0Zyb21GaWVsZHM7XG5cbmZ1bmN0aW9uIGdlbkVuY29kaW5nc0Zyb21GaWVsZHMob3V0cHV0LCBmaWVsZHMsIHN0YXRzLCBvcHQsIGNmZywgbmVzdGVkKSB7XG4gIG9wdCA9IHZsLnNjaGVtYS51dGlsLmV4dGVuZChvcHR8fHt9LCBjb25zdHMuZ2VuLmVuY29kaW5ncyk7XG4gIHZhciBlbmNzID0gZ2VuRW5jcyhbXSwgZmllbGRzLCBzdGF0cywgb3B0KTtcblxuICBpZiAobmVzdGVkKSB7XG4gICAgcmV0dXJuIGVuY3MucmVkdWNlKGZ1bmN0aW9uKGRpY3QsIGVuYykge1xuICAgICAgZGljdFtlbmNdID0gZ2VuRW5jb2RpbmdzRnJvbUVuY3MoW10sIGVuYywgc3RhdHMsIG9wdCwgY2ZnKTtcbiAgICAgIHJldHVybiBkaWN0O1xuICAgIH0sIHt9KTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZW5jcy5yZWR1Y2UoZnVuY3Rpb24obGlzdCwgZW5jKSB7XG4gICAgICByZXR1cm4gZ2VuRW5jb2RpbmdzRnJvbUVuY3MobGlzdCwgZW5jLCBzdGF0cywgb3B0LCBjZmcpO1xuICAgIH0sIFtdKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZW5FbmNvZGluZ3NGcm9tRW5jcyhvdXRwdXQsIGVuYywgc3RhdHMsIG9wdCwgY2ZnKSB7XG4gIGdldE1hcmt0eXBlcyhlbmMsIHN0YXRzLCBvcHQpXG4gICAgLmZvckVhY2goZnVuY3Rpb24obWFya1R5cGUpIHtcbiAgICAgIHZhciBlbmNvZGluZyA9IGZpbmFsVG91Y2goe21hcmt0eXBlOiBtYXJrVHlwZSwgZW5jOiBlbmMsIGNmZzogY2ZnfSwgb3B0KSxcbiAgICAgICAgc2NvcmUgPSByYW5rLmVuY29kaW5nKGVuY29kaW5nLCBzdGF0cywgb3B0KTtcblxuICAgICAgZW5jb2Rpbmcuc2NvcmUgPSBzY29yZS5zY29yZTtcbiAgICAgIGVuY29kaW5nLnNjb3JlRmVhdHVyZXMgPSBzY29yZS5mZWF0dXJlcztcbiAgICAgIG91dHB1dC5wdXNoKGVuY29kaW5nKTtcbiAgICB9KTtcbiAgcmV0dXJuIG91dHB1dDtcbn1cblxuLy9GSVhNRSB0aGlzIHNob3VsZCBiZSByZWZhY3RvcnNcbmZ1bmN0aW9uIGZpbmFsVG91Y2goZW5jb2RpbmcsIG9wdCkge1xuICBpZiAoZW5jb2RpbmcubWFya3R5cGUgPT09ICd0ZXh0JyAmJiBvcHQuYWx3YXlzR2VuZXJhdGVUYWJsZUFzSGVhdG1hcCkge1xuICAgIGVuY29kaW5nLmVuYy5jb2xvciA9IGVuY29kaW5nLmVuYy50ZXh0O1xuICB9XG4gIHJldHVybiBlbmNvZGluZztcbn0iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHZsID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cudmwgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLnZsIDogbnVsbCksXG4gIGdsb2JhbHMgPSByZXF1aXJlKCcuLi9nbG9iYWxzJyksXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyksXG4gIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpLFxuICBnZW5NYXJrVHlwZXMgPSByZXF1aXJlKCcuL21hcmt0eXBlcycpLFxuICBpc0RpbWVuc2lvbiA9IHZsLmZpZWxkLmlzRGltZW5zaW9uLFxuICBpc01lYXN1cmUgPSB2bC5maWVsZC5pc01lYXN1cmU7XG5cbm1vZHVsZS5leHBvcnRzID0gZ2VuRW5jcztcblxuLy8gRklYTUUgcmVtb3ZlIGRpbWVuc2lvbiwgbWVhc3VyZSBhbmQgdXNlIGluZm9ybWF0aW9uIGluIHZlZ2FsaXRlIGluc3RlYWQhXG52YXIgcnVsZXMgPSB7XG4gIHg6IHtcbiAgICBkaW1lbnNpb246IHRydWUsXG4gICAgbWVhc3VyZTogdHJ1ZSxcbiAgICBtdWx0aXBsZTogdHJ1ZSAvL0ZJWE1FIHNob3VsZCBhbGxvdyBtdWx0aXBsZSBvbmx5IGZvciBRLCBUXG4gIH0sXG4gIHk6IHtcbiAgICBkaW1lbnNpb246IHRydWUsXG4gICAgbWVhc3VyZTogdHJ1ZSxcbiAgICBtdWx0aXBsZTogdHJ1ZSAvL0ZJWE1FIHNob3VsZCBhbGxvdyBtdWx0aXBsZSBvbmx5IGZvciBRLCBUXG4gIH0sXG4gIHJvdzoge1xuICAgIGRpbWVuc2lvbjogdHJ1ZSxcbiAgICBtdWx0aXBsZTogdHJ1ZVxuICB9LFxuICBjb2w6IHtcbiAgICBkaW1lbnNpb246IHRydWUsXG4gICAgbXVsdGlwbGU6IHRydWVcbiAgfSxcbiAgc2hhcGU6IHtcbiAgICBkaW1lbnNpb246IHRydWUsXG4gICAgcnVsZXM6IHNoYXBlUnVsZXNcbiAgfSxcbiAgc2l6ZToge1xuICAgIG1lYXN1cmU6IHRydWUsXG4gICAgcnVsZXM6IHJldGluYWxFbmNSdWxlc1xuICB9LFxuICBjb2xvcjoge1xuICAgIGRpbWVuc2lvbjogdHJ1ZSxcbiAgICBtZWFzdXJlOiB0cnVlLFxuICAgIHJ1bGVzOiBjb2xvclJ1bGVzXG4gIH0sXG4gIGFscGhhOiB7XG4gICAgbWVhc3VyZTogdHJ1ZSxcbiAgICBydWxlczogcmV0aW5hbEVuY1J1bGVzXG4gIH0sXG4gIHRleHQ6IHtcbiAgICBtZWFzdXJlOiB0cnVlXG4gIH0sXG4gIGRldGFpbDoge1xuICAgIGRpbWVuc2lvbjogdHJ1ZVxuICB9XG4gIC8vZ2VvOiB7XG4gIC8vICBnZW86IHRydWVcbiAgLy99LFxuICAvL2FyYzogeyAvLyBwaWVcbiAgLy9cbiAgLy99XG59O1xuXG5mdW5jdGlvbiByZXRpbmFsRW5jUnVsZXMoZW5jLCBmaWVsZCwgc3RhdHMsIG9wdCkge1xuICBpZiAob3B0Lm9taXRNdWx0aXBsZVJldGluYWxFbmNvZGluZ3MpIHtcbiAgICBpZiAoZW5jLmNvbG9yIHx8IGVuYy5zaXplIHx8IGVuYy5zaGFwZSB8fCBlbmMuYWxwaGEpIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gY29sb3JSdWxlcyhlbmMsIGZpZWxkLCBzdGF0cywgb3B0KSB7XG4gIGlmKCFyZXRpbmFsRW5jUnVsZXMoZW5jLCBmaWVsZCwgc3RhdHMsIG9wdCkpIHJldHVybiBmYWxzZTtcblxuICByZXR1cm4gdmwuZmllbGQuaXNNZWFzdXJlKGZpZWxkKSB8fFxuICAgIHZsLmZpZWxkLmNhcmRpbmFsaXR5KGZpZWxkLCBzdGF0cykgPD0gb3B0Lm1heENhcmRpbmFsaXR5Rm9yQ29sb3I7XG59XG5cbmZ1bmN0aW9uIHNoYXBlUnVsZXMoZW5jLCBmaWVsZCwgc3RhdHMsIG9wdCkge1xuICBpZighcmV0aW5hbEVuY1J1bGVzKGVuYywgZmllbGQsIHN0YXRzLCBvcHQpKSByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGZpZWxkLmJpbiAmJiBmaWVsZC50eXBlID09PSAnUScpIHJldHVybiBmYWxzZTtcbiAgaWYgKGZpZWxkLmZuICYmIGZpZWxkLnR5cGUgPT09ICdUJykgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gdmwuZmllbGQuY2FyZGluYWxpdHkoZmllbGQsIHN0YXRzKSA8PSBvcHQubWF4Q2FyZGluYWxpdHlGb3JDb2xvcjtcbn1cblxuZnVuY3Rpb24gZGltTWVhVHJhbnNwb3NlUnVsZShlbmMpIHtcbiAgLy8gY3JlYXRlIGhvcml6b250YWwgaGlzdG9ncmFtIGZvciBvcmRpbmFsXG4gIGlmIChlbmMueS50eXBlID09PSAnTycgJiYgaXNNZWFzdXJlKGVuYy54KSkgcmV0dXJuIHRydWU7XG5cbiAgLy8gdmVydGljYWwgaGlzdG9ncmFtIGZvciBRIGFuZCBUXG4gIGlmIChpc01lYXN1cmUoZW5jLnkpICYmIChlbmMueC50eXBlICE9PSAnTycgJiYgaXNEaW1lbnNpb24oZW5jLngpKSkgcmV0dXJuIHRydWU7XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBnZW5lcmFsUnVsZXMoZW5jLCBzdGF0cywgb3B0KSB7XG4gIC8vIGVuYy50ZXh0IGlzIG9ubHkgdXNlZCBmb3IgVEVYVCBUQUJMRVxuICBpZiAoZW5jLnRleHQpIHtcbiAgICByZXR1cm4gZ2VuTWFya1R5cGVzLnNhdGlzZnlSdWxlcyhlbmMsICd0ZXh0Jywgc3RhdHMsIG9wdCk7XG4gIH1cblxuICAvLyBDQVJURVNJQU4gUExPVCBPUiBNQVBcbiAgaWYgKGVuYy54IHx8IGVuYy55IHx8IGVuYy5nZW8gfHwgZW5jLmFyYykge1xuXG4gICAgaWYgKGVuYy5yb3cgfHwgZW5jLmNvbCkgeyAvL2hhdmUgZmFjZXQocylcblxuICAgICAgLy8gZG9uJ3QgdXNlIGZhY2V0cyBiZWZvcmUgZmlsbGluZyB1cCB4LHlcbiAgICAgIGlmICghZW5jLnggfHwgIWVuYy55KSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIGlmIChvcHQub21pdE5vblRleHRBZ2dyV2l0aEFsbERpbXNPbkZhY2V0cykge1xuICAgICAgICAvLyByZW1vdmUgYWxsIGFnZ3JlZ2F0ZWQgY2hhcnRzIHdpdGggYWxsIGRpbXMgb24gZmFjZXRzIChyb3csIGNvbClcbiAgICAgICAgaWYgKGdlbkVuY3MuaXNBZ2dyV2l0aEFsbERpbU9uRmFjZXRzKGVuYykpIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZW5jLnggJiYgZW5jLnkpIHtcbiAgICAgIGlmIChvcHQub21pdFRyYW5wb3NlKSB7XG4gICAgICAgIGlmICgoISFpc0RpbWVuc2lvbihlbmMueCkpIF4gKCEhaXNEaW1lbnNpb24oZW5jLnkpKSkgeyAvLyBkaW0geCBtZWFcbiAgICAgICAgICBpZiAoIWRpbU1lYVRyYW5zcG9zZVJ1bGUoZW5jKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKGVuYy55LnR5cGU9PT0nVCcgfHwgZW5jLngudHlwZSA9PT0gJ1QnKSB7XG4gICAgICAgICAgaWYgKGVuYy55LnR5cGU9PT0nVCcgJiYgZW5jLngudHlwZSAhPT0gJ1QnKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7IC8vIHNob3cgb25seSBvbmUgT3hPLCBReFFcbiAgICAgICAgICBpZiAoZW5jLngubmFtZSA+IGVuYy55Lm5hbWUpIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gRE9UIFBMT1RTXG4gICAgLy8gLy8gcGxvdCB3aXRoIG9uZSBheGlzID0gZG90IHBsb3RcbiAgICBpZiAob3B0Lm9taXREb3RQbG90KSByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBEb3QgcGxvdCBzaG91bGQgYWx3YXlzIGJlIGhvcml6b250YWxcbiAgICBpZiAob3B0Lm9taXRUcmFucG9zZSAmJiBlbmMueSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gZG90IHBsb3Qgc2hvdWxkbid0IGhhdmUgb3RoZXIgZW5jb2RpbmdcbiAgICBpZiAob3B0Lm9taXREb3RQbG90V2l0aEV4dHJhRW5jb2RpbmcgJiYgdmwua2V5cyhlbmMpLmxlbmd0aCA+IDEpIHJldHVybiBmYWxzZTtcblxuICAgIC8vIG9uZSBkaW1lbnNpb24gXCJjb3VudFwiIGlzIHVzZWxlc3NcbiAgICBpZiAoZW5jLnggJiYgZW5jLnguYWdnciA9PSAnY291bnQnICYmICFlbmMueSkgcmV0dXJuIGZhbHNlO1xuICAgIGlmIChlbmMueSAmJiBlbmMueS5hZ2dyID09ICdjb3VudCcgJiYgIWVuYy54KSByZXR1cm4gZmFsc2U7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmdlbkVuY3MuaXNBZ2dyV2l0aEFsbERpbU9uRmFjZXRzID0gZnVuY3Rpb24gKGVuYykge1xuICB2YXIgaGFzQWdnciA9IGZhbHNlLCBoYXNPdGhlck8gPSBmYWxzZTtcbiAgZm9yICh2YXIgZW5jVHlwZSBpbiBlbmMpIHtcbiAgICB2YXIgZmllbGQgPSBlbmNbZW5jVHlwZV07XG4gICAgaWYgKGZpZWxkLmFnZ3IpIHtcbiAgICAgIGhhc0FnZ3IgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAodmwuZmllbGQuaXNEaW1lbnNpb24oZmllbGQpICYmIChlbmNUeXBlICE9PSAncm93JyAmJiBlbmNUeXBlICE9PSAnY29sJykpIHtcbiAgICAgIGhhc090aGVyTyA9IHRydWU7XG4gICAgfVxuICAgIGlmIChoYXNBZ2dyICYmIGhhc090aGVyTykgYnJlYWs7XG4gIH1cblxuICByZXR1cm4gaGFzQWdnciAmJiAhaGFzT3RoZXJPO1xufTtcblxuXG5mdW5jdGlvbiBnZW5FbmNzKGVuY3MsIGZpZWxkcywgc3RhdHMsIG9wdCkge1xuICBvcHQgPSB2bC5zY2hlbWEudXRpbC5leHRlbmQob3B0fHx7fSwgY29uc3RzLmdlbi5lbmNvZGluZ3MpO1xuICAvLyBnZW5lcmF0ZSBhIGNvbGxlY3Rpb24gdmVnYWxpdGUncyBlbmNcbiAgdmFyIHRtcEVuYyA9IHt9O1xuXG4gIGZ1bmN0aW9uIGFzc2lnbkZpZWxkKGkpIHtcbiAgICAvLyBJZiBhbGwgZmllbGRzIGFyZSBhc3NpZ25lZCwgc2F2ZVxuICAgIGlmIChpID09PSBmaWVsZHMubGVuZ3RoKSB7XG4gICAgICAvLyBhdCB0aGUgbWluaW1hbCBhbGwgY2hhcnQgc2hvdWxkIGhhdmUgeCwgeSwgZ2VvLCB0ZXh0IG9yIGFyY1xuICAgICAgaWYgKGdlbmVyYWxSdWxlcyh0bXBFbmMsIHN0YXRzLCBvcHQpKSB7XG4gICAgICAgIGVuY3MucHVzaCh2bC5kdXBsaWNhdGUodG1wRW5jKSk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gT3RoZXJ3aXNlLCBhc3NpZ24gaS10aCBmaWVsZFxuICAgIHZhciBmaWVsZCA9IGZpZWxkc1tpXTtcbiAgICBmb3IgKHZhciBqIGluIG9wdC5lbmNvZGluZ1R5cGVMaXN0KSB7XG4gICAgICB2YXIgZXQgPSBvcHQuZW5jb2RpbmdUeXBlTGlzdFtqXSxcbiAgICAgICAgaXNEaW0gPSBpc0RpbWVuc2lvbihmaWVsZCk7XG5cbiAgICAgIC8vVE9ETzogc3VwcG9ydCBcIm11bHRpcGxlXCIgYXNzaWdubWVudFxuICAgICAgaWYgKCEoZXQgaW4gdG1wRW5jKSAmJiAvLyBlbmNvZGluZyBub3QgdXNlZFxuICAgICAgICAoKGlzRGltICYmIHJ1bGVzW2V0XS5kaW1lbnNpb24pIHx8ICghaXNEaW0gJiYgcnVsZXNbZXRdLm1lYXN1cmUpKSAmJlxuICAgICAgICAoIXJ1bGVzW2V0XS5ydWxlcyB8fCBydWxlc1tldF0ucnVsZXModG1wRW5jLCBmaWVsZCwgc3RhdHMsIG9wdCkpXG4gICAgICApIHtcbiAgICAgICAgdG1wRW5jW2V0XSA9IGZpZWxkO1xuICAgICAgICBhc3NpZ25GaWVsZChpICsgMSk7XG4gICAgICAgIGRlbGV0ZSB0bXBFbmNbZXRdO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFzc2lnbkZpZWxkKDApO1xuXG4gIHJldHVybiBlbmNzO1xufVxuIiwidmFyIHZsID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cudmwgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLnZsIDogbnVsbCksXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cbnZhciBnZW4gPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgLy8gZGF0YSB2YXJpYXRpb25zXG4gIGFnZ3JlZ2F0ZXM6IHJlcXVpcmUoJy4vYWdncmVnYXRlcycpLFxuICBwcm9qZWN0aW9uczogcmVxdWlyZSgnLi9wcm9qZWN0aW9ucycpLFxuICAvLyBlbmNvZGluZ3MgLyB2aXN1YWwgdmFyaWF0b25zXG4gIGVuY29kaW5nczogcmVxdWlyZSgnLi9lbmNvZGluZ3MnKSxcbiAgZW5jczogcmVxdWlyZSgnLi9lbmNzJyksXG4gIG1hcmt0eXBlczogcmVxdWlyZSgnLi9tYXJrdHlwZXMnKVxufTtcblxuLy9GSVhNRSBtb3ZlIHRoZXNlIHRvIHZsXG52YXIgQUdHUkVHQVRJT05fRk4gPSB7IC8vYWxsIHBvc3NpYmxlIGFnZ3JlZ2F0ZSBmdW5jdGlvbiBsaXN0ZWQgYnkgZWFjaCBkYXRhIHR5cGVcbiAgUTogdmwuc2NoZW1hLmFnZ3Iuc3VwcG9ydGVkRW51bXMuUVxufTtcblxudmFyIFRSQU5TRk9STV9GTiA9IHsgLy9hbGwgcG9zc2libGUgdHJhbnNmb3JtIGZ1bmN0aW9uIGxpc3RlZCBieSBlYWNoIGRhdGEgdHlwZVxuICAvLyBROiBbJ2xvZycsICdzcXJ0JywgJ2FicyddLCAvLyBcImxvZ2l0P1wiXG4gIFQ6IHZsLnNjaGVtYS50aW1lZm5zXG59O1xuXG5nZW4uY2hhcnRzID0gZnVuY3Rpb24oZmllbGRzLCBvcHQsIGNmZywgZmxhdCkge1xuICBvcHQgPSB1dGlsLmdlbi5nZXRPcHQob3B0KTtcbiAgZmxhdCA9IGZsYXQgPT09IHVuZGVmaW5lZCA/IHtlbmNvZGluZ3M6IDF9IDogZmxhdDtcblxuICAvLyBUT0RPIGdlbmVyYXRlXG5cbiAgLy8gZ2VuZXJhdGUgcGVybXV0YXRpb24gb2YgZW5jb2RpbmcgbWFwcGluZ3NcbiAgdmFyIGZpZWxkU2V0cyA9IG9wdC5nZW5BZ2dyID8gZ2VuLmFnZ3JlZ2F0ZXMoW10sIGZpZWxkcywgb3B0KSA6IFtmaWVsZHNdLFxuICAgIGVuY3MsIGNoYXJ0cywgbGV2ZWwgPSAwO1xuXG4gIGlmIChmbGF0ID09PSB0cnVlIHx8IChmbGF0ICYmIGZsYXQuYWdncikpIHtcbiAgICBlbmNzID0gZmllbGRTZXRzLnJlZHVjZShmdW5jdGlvbihvdXRwdXQsIGZpZWxkcykge1xuICAgICAgcmV0dXJuIGdlbi5lbmNzKG91dHB1dCwgZmllbGRzLCBvcHQpO1xuICAgIH0sIFtdKTtcbiAgfSBlbHNlIHtcbiAgICBlbmNzID0gZmllbGRTZXRzLm1hcChmdW5jdGlvbihmaWVsZHMpIHtcbiAgICAgIHJldHVybiBnZW4uZW5jcyhbXSwgZmllbGRzLCBvcHQpO1xuICAgIH0sIHRydWUpO1xuICAgIGxldmVsICs9IDE7XG4gIH1cblxuICBpZiAoZmxhdCA9PT0gdHJ1ZSB8fCAoZmxhdCAmJiBmbGF0LmVuY29kaW5ncykpIHtcbiAgICBjaGFydHMgPSB1dGlsLm5lc3RlZFJlZHVjZShlbmNzLCBmdW5jdGlvbihvdXRwdXQsIGVuYykge1xuICAgICAgcmV0dXJuIGdlbi5tYXJrdHlwZXMob3V0cHV0LCBlbmMsIG9wdCwgY2ZnKTtcbiAgICB9LCBsZXZlbCwgdHJ1ZSk7XG4gIH0gZWxzZSB7XG4gICAgY2hhcnRzID0gdXRpbC5uZXN0ZWRNYXAoZW5jcywgZnVuY3Rpb24oZW5jKSB7XG4gICAgICByZXR1cm4gZ2VuLm1hcmt0eXBlcyhbXSwgZW5jLCBvcHQsIGNmZyk7XG4gICAgfSwgbGV2ZWwsIHRydWUpO1xuICAgIGxldmVsICs9IDE7XG4gIH1cbiAgcmV0dXJuIGNoYXJ0cztcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciB2bCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LnZsIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC52bCA6IG51bGwpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpLFxuICBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKSxcbiAgaXNEaW1lbnNpb24gPSB2bC5maWVsZC5pc0RpbWVuc2lvbjtcblxudmFyIHZsbWFya3R5cGVzID0gbW9kdWxlLmV4cG9ydHMgPSBnZXRNYXJrdHlwZXM7XG5cbnZhciBtYXJrc1J1bGUgPSB2bG1hcmt0eXBlcy5ydWxlID0ge1xuICBwb2ludDogIHBvaW50UnVsZSxcbiAgYmFyOiAgICBiYXJSdWxlLFxuICBsaW5lOiAgIGxpbmVSdWxlLFxuICBhcmVhOiAgIGFyZWFSdWxlLCAvLyBhcmVhIGlzIHNpbWlsYXIgdG8gbGluZVxuICB0ZXh0OiAgIHRleHRSdWxlLFxuICB0aWNrOiAgIHRpY2tSdWxlXG59O1xuXG5mdW5jdGlvbiBnZXRNYXJrdHlwZXMoZW5jLCBzdGF0cywgb3B0KSB7XG4gIG9wdCA9IHZsLnNjaGVtYS51dGlsLmV4dGVuZChvcHR8fHt9LCBjb25zdHMuZ2VuLmVuY29kaW5ncyk7XG5cbiAgdmFyIG1hcmtUeXBlcyA9IG9wdC5tYXJrdHlwZUxpc3QuZmlsdGVyKGZ1bmN0aW9uKG1hcmtUeXBlKXtcbiAgICByZXR1cm4gdmxtYXJrdHlwZXMuc2F0aXNmeVJ1bGVzKGVuYywgbWFya1R5cGUsIHN0YXRzLCBvcHQpO1xuICB9KTtcblxuICByZXR1cm4gbWFya1R5cGVzO1xufVxuXG52bG1hcmt0eXBlcy5zYXRpc2Z5UnVsZXMgPSBmdW5jdGlvbiAoZW5jLCBtYXJrVHlwZSwgc3RhdHMsIG9wdCkge1xuICB2YXIgbWFyayA9IHZsLmNvbXBpbGUubWFya3NbbWFya1R5cGVdLFxuICAgIHJlcXMgPSBtYXJrLnJlcXVpcmVkRW5jb2RpbmcsXG4gICAgc3VwcG9ydCA9IG1hcmsuc3VwcG9ydGVkRW5jb2Rpbmc7XG5cbiAgZm9yICh2YXIgaSBpbiByZXFzKSB7IC8vIGFsbCByZXF1aXJlZCBlbmNvZGluZ3MgaW4gZW5jXG4gICAgaWYgKCEocmVxc1tpXSBpbiBlbmMpKSByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmb3IgKHZhciBlbmNUeXBlIGluIGVuYykgeyAvLyBhbGwgZW5jb2RpbmdzIGluIGVuYyBhcmUgc3VwcG9ydGVkXG4gICAgaWYgKCFzdXBwb3J0W2VuY1R5cGVdKSByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gIW1hcmtzUnVsZVttYXJrVHlwZV0gfHwgbWFya3NSdWxlW21hcmtUeXBlXShlbmMsIHN0YXRzLCBvcHQpO1xufTtcblxuZnVuY3Rpb24gZmFjZXRSdWxlKGZpZWxkLCBzdGF0cywgb3B0KSB7XG4gIHJldHVybiB2bC5maWVsZC5jYXJkaW5hbGl0eShmaWVsZCwgc3RhdHMpIDw9IG9wdC5tYXhDYXJkaW5hbGl0eUZvckZhY2V0cztcbn1cblxuZnVuY3Rpb24gZmFjZXRzUnVsZShlbmMsIHN0YXRzLCBvcHQpIHtcbiAgaWYoZW5jLnJvdyAmJiAhZmFjZXRSdWxlKGVuYy5yb3csIHN0YXRzLCBvcHQpKSByZXR1cm4gZmFsc2U7XG4gIGlmKGVuYy5jb2wgJiYgIWZhY2V0UnVsZShlbmMuY29sLCBzdGF0cywgb3B0KSkgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gcG9pbnRSdWxlKGVuYywgc3RhdHMsIG9wdCkge1xuICBpZighZmFjZXRzUnVsZShlbmMsIHN0YXRzLCBvcHQpKSByZXR1cm4gZmFsc2U7XG4gIGlmIChlbmMueCAmJiBlbmMueSkge1xuICAgIC8vIGhhdmUgYm90aCB4ICYgeSA9PT4gc2NhdHRlciBwbG90IC8gYnViYmxlIHBsb3RcblxuICAgIHZhciB4SXNEaW0gPSBpc0RpbWVuc2lvbihlbmMueCksXG4gICAgICB5SXNEaW0gPSBpc0RpbWVuc2lvbihlbmMueSk7XG5cbiAgICAvLyBGb3IgT3hPXG4gICAgaWYgKHhJc0RpbSAmJiB5SXNEaW0pIHtcbiAgICAgIC8vIHNoYXBlIGRvZXNuJ3Qgd29yayB3aXRoIGJvdGggeCwgeSBhcyBvcmRpbmFsXG4gICAgICBpZiAoZW5jLnNoYXBlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gVE9ETyhrYW5pdHcpOiBjaGVjayB0aGF0IHRoZXJlIGlzIHF1YW50IGF0IGxlYXN0IC4uLlxuICAgICAgaWYgKGVuYy5jb2xvciAmJiBpc0RpbWVuc2lvbihlbmMuY29sb3IpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfSBlbHNlIHsgLy8gcGxvdCB3aXRoIG9uZSBheGlzID0gZG90IHBsb3RcbiAgICBpZiAob3B0Lm9taXREb3RQbG90KSByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBEb3QgcGxvdCBzaG91bGQgYWx3YXlzIGJlIGhvcml6b250YWxcbiAgICBpZiAob3B0Lm9taXRUcmFucG9zZSAmJiBlbmMueSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gZG90IHBsb3Qgc2hvdWxkbid0IGhhdmUgb3RoZXIgZW5jb2RpbmdcbiAgICBpZiAob3B0Lm9taXREb3RQbG90V2l0aEV4dHJhRW5jb2RpbmcgJiYgdmwua2V5cyhlbmMpLmxlbmd0aCA+IDEpIHJldHVybiBmYWxzZTtcblxuICAgIC8vIGRvdCBwbG90IHdpdGggc2hhcGUgaXMgbm9uLXNlbnNlXG4gICAgaWYgKGVuYy5zaGFwZSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiB0aWNrUnVsZShlbmMsIHN0YXRzLCBvcHQpIHtcbiAgaWYgKGVuYy54IHx8IGVuYy55KSB7XG4gICAgaWYodmwuZW5jLmlzQWdncmVnYXRlKGVuYykpIHJldHVybiBmYWxzZTtcblxuICAgIHZhciB4SXNEaW0gPSBpc0RpbWVuc2lvbihlbmMueCksXG4gICAgICB5SXNEaW0gPSBpc0RpbWVuc2lvbihlbmMueSk7XG5cbiAgICByZXR1cm4gKCF4SXNEaW0gJiYgKCFlbmMueSB8fCB5SXNEaW0pKSB8fFxuICAgICAgKCF5SXNEaW0gJiYgKCFlbmMueCB8fCB4SXNEaW0pKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGJhclJ1bGUoZW5jLCBzdGF0cywgb3B0KSB7XG4gIGlmKCFmYWNldHNSdWxlKGVuYywgc3RhdHMsIG9wdCkpIHJldHVybiBmYWxzZTtcblxuICAvLyBuZWVkIHRvIGFnZ3JlZ2F0ZSBvbiBlaXRoZXIgeCBvciB5XG4gIGlmIChvcHQub21pdFNpemVPbkJhciAmJiBlbmMuc2l6ZSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKCgoZW5jLnguYWdnciAhPT0gdW5kZWZpbmVkKSBeIChlbmMueS5hZ2dyICE9PSB1bmRlZmluZWQpKSAmJlxuICAgICAgKGlzRGltZW5zaW9uKGVuYy54KSBeIGlzRGltZW5zaW9uKGVuYy55KSkpIHtcblxuICAgIHZhciBhZ2dyID0gZW5jLnguYWdnciB8fCBlbmMueS5hZ2dyO1xuICAgIHJldHVybiAhKG9wdC5vbWl0U3RhY2tlZEF2ZXJhZ2UgJiYgYWdnciA9PT0nYXZnJyAmJiBlbmMuY29sb3IpO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBsaW5lUnVsZShlbmMsIHN0YXRzLCBvcHQpIHtcbiAgaWYoIWZhY2V0c1J1bGUoZW5jLCBzdGF0cywgb3B0KSkgcmV0dXJuIGZhbHNlO1xuXG4gIC8vIFRPRE8oa2FuaXR3KTogYWRkIG9taXRWZXJ0aWNhbExpbmUgYXMgY29uZmlnXG5cbiAgLy8gRklYTUUgdHJ1bHkgb3JkaW5hbCBkYXRhIGlzIGZpbmUgaGVyZSB0b28uXG4gIC8vIExpbmUgY2hhcnQgc2hvdWxkIGJlIG9ubHkgaG9yaXpvbnRhbFxuICAvLyBhbmQgdXNlIG9ubHkgdGVtcG9yYWwgZGF0YVxuICByZXR1cm4gZW5jLngudHlwZSA9PSAnVCcgJiYgZW5jLnguZm4gJiYgZW5jLnkudHlwZSA9PSAnUScgJiYgZW5jLnkuYWdncjtcbn1cblxuZnVuY3Rpb24gYXJlYVJ1bGUoZW5jLCBzdGF0cywgb3B0KSB7XG4gIGlmKCFmYWNldHNSdWxlKGVuYywgc3RhdHMsIG9wdCkpIHJldHVybiBmYWxzZTtcblxuICBpZighbGluZVJ1bGUoZW5jLCBzdGF0cywgb3B0KSkgcmV0dXJuIGZhbHNlO1xuXG4gIHJldHVybiAhKG9wdC5vbWl0U3RhY2tlZEF2ZXJhZ2UgJiYgZW5jLnkuYWdnciA9PT0nYXZnJyAmJiBlbmMuY29sb3IpO1xufVxuXG5mdW5jdGlvbiB0ZXh0UnVsZShlbmMsIHN0YXRzLCBvcHQpIHtcbiAgLy8gYXQgbGVhc3QgbXVzdCBoYXZlIHJvdyBvciBjb2wgYW5kIGFnZ3JlZ2F0ZWQgdGV4dCB2YWx1ZXNcbiAgcmV0dXJuIChlbmMucm93IHx8IGVuYy5jb2wpICYmIGVuYy50ZXh0ICYmIGVuYy50ZXh0LmFnZ3IgJiYgIWVuYy54ICYmICFlbmMueSAmJlxuICAgICghb3B0LmFsd2F5c0dlbmVyYXRlVGFibGVBc0hlYXRtYXAgfHwgIWVuYy5jb2xvcik7XG59IiwidmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyksXG4gIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpLFxuICB2bCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LnZsIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC52bCA6IG51bGwpLFxuICBpc0RpbWVuc2lvbiA9IHZsLmZpZWxkLmlzRGltZW5zaW9uO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHByb2plY3Rpb25zO1xuXG4vLyBUT0RPIHN1cHBvcnQgb3RoZXIgbW9kZSBvZiBwcm9qZWN0aW9ucyBnZW5lcmF0aW9uXG4vLyBwb3dlcnNldCwgY2hvb3NlSywgY2hvb3NlS29yTGVzcyBhcmUgYWxyZWFkeSBpbmNsdWRlZCBpbiB0aGUgdXRpbFxuXG4vKipcbiAqIGZpZWxkc1xuICogQHBhcmFtICB7W3R5cGVdfSBmaWVsZHMgYXJyYXkgb2YgZmllbGRzIGFuZCBxdWVyeSBpbmZvcm1hdGlvblxuICogQHJldHVybiB7W3R5cGVdfSAgICAgICAgW2Rlc2NyaXB0aW9uXVxuICovXG5mdW5jdGlvbiBwcm9qZWN0aW9ucyhmaWVsZHMsIHN0YXRzLCBvcHQpIHtcbiAgb3B0ID0gdmwuc2NoZW1hLnV0aWwuZXh0ZW5kKG9wdHx8e30sIGNvbnN0cy5nZW4ucHJvamVjdGlvbnMpO1xuXG4gIC8vIEZpcnN0IGNhdGVnb3JpemUgZmllbGQsIHNlbGVjdGVkLCBmaWVsZHNUb0FkZCwgYW5kIHNhdmUgaW5kaWNlc1xuICB2YXIgc2VsZWN0ZWQgPSBbXSwgZmllbGRzVG9BZGQgPSBbXSwgZmllbGRTZXRzID0gW10sXG4gICAgaGFzU2VsZWN0ZWREaW1lbnNpb24gPSBmYWxzZSxcbiAgICBoYXNTZWxlY3RlZE1lYXN1cmUgPSBmYWxzZSxcbiAgICBpbmRpY2VzID0ge307XG5cbiAgZmllbGRzLmZvckVhY2goZnVuY3Rpb24oZmllbGQsIGluZGV4KXtcbiAgICAvL3NhdmUgaW5kaWNlcyBmb3Igc3RhYmxlIHNvcnQgbGF0ZXJcbiAgICBpbmRpY2VzW2ZpZWxkLm5hbWVdID0gaW5kZXg7XG5cbiAgICBpZiAoZmllbGQuc2VsZWN0ZWQpIHtcbiAgICAgIHNlbGVjdGVkLnB1c2goZmllbGQpO1xuICAgICAgaWYgKGlzRGltZW5zaW9uKGZpZWxkKSkge1xuICAgICAgICBoYXNTZWxlY3RlZERpbWVuc2lvbiA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBoYXNTZWxlY3RlZE1lYXN1cmUgPSB0cnVlO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIWZpZWxkLmV4Y2x1ZGVkICYmICF2bC5maWVsZC5pc0NvdW50KGZpZWxkKSkge1xuICAgICAgaWYgKHZsLmZpZWxkLmlzRGltZW5zaW9uKGZpZWxkKSAmJlxuICAgICAgICAgIHZsLmZpZWxkLmNhcmRpbmFsaXR5KGZpZWxkLCBzdGF0cywgMTUpID4gb3B0Lm1heENhcmRpbmFsaXR5Rm9yQXV0b0FkZE9yZGluYWwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgZmllbGRzVG9BZGQucHVzaChmaWVsZCk7XG4gICAgfVxuICB9KTtcblxuICBmaWVsZHNUb0FkZC5zb3J0KGNvbXBhcmVGaWVsZHNUb0FkZChoYXNTZWxlY3RlZERpbWVuc2lvbiwgaGFzU2VsZWN0ZWRNZWFzdXJlLCBpbmRpY2VzKSk7XG5cbiAgdmFyIHNldHNUb0FkZCA9IHV0aWwuY2hvb3NlS29yTGVzcyhmaWVsZHNUb0FkZCwgMSk7XG5cbiAgc2V0c1RvQWRkLmZvckVhY2goZnVuY3Rpb24oc2V0VG9BZGQpIHtcbiAgICB2YXIgZmllbGRTZXQgPSBzZWxlY3RlZC5jb25jYXQoc2V0VG9BZGQpO1xuICAgIGlmIChmaWVsZFNldC5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAob3B0Lm9taXREb3RQbG90ICYmIGZpZWxkU2V0Lmxlbmd0aCA9PT0gMSkgcmV0dXJuO1xuICAgICAgZmllbGRTZXRzLnB1c2goZmllbGRTZXQpO1xuICAgIH1cbiAgfSk7XG5cbiAgZmllbGRTZXRzLmZvckVhY2goZnVuY3Rpb24oZmllbGRTZXQpIHtcbiAgICAgIC8vIGFsd2F5cyBhcHBlbmQgcHJvamVjdGlvbidzIGtleSB0byBlYWNoIHByb2plY3Rpb24gcmV0dXJuZWQsIGQzIHN0eWxlLlxuICAgIGZpZWxkU2V0LmtleSA9IHByb2plY3Rpb25zLmtleShmaWVsZFNldCk7XG4gIH0pO1xuXG4gIHJldHVybiBmaWVsZFNldHM7XG59XG5cbmZ1bmN0aW9uIGNvbXBhcmVGaWVsZHNUb0FkZChoYXNTZWxlY3RlZERpbWVuc2lvbiwgaGFzU2VsZWN0ZWRNZWFzdXJlLCBpbmRpY2VzKSB7XG4gIHJldHVybiBmdW5jdGlvbihhLCBiKXtcbiAgICB2YXIgYUlzRGltID0gaXNEaW1lbnNpb24oYSksIGJJc0RpbSA9IGlzRGltZW5zaW9uKGIpO1xuICAgIC8vIHNvcnQgYnkgdHlwZSBvZiB0aGUgZGF0YVxuICAgIGlmIChhSXNEaW0gXiBiSXNEaW0pIHtcbiAgICAgIGlmICghaGFzU2VsZWN0ZWREaW1lbnNpb24pIHtcbiAgICAgICAgaWYgKCFhSXNEaW0gJiYgYklzRGltKSB7XG4gICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgfSBlbHNlIGlmICghaGFzU2VsZWN0ZWRNZWFzdXJlKSB7XG4gICAgICAgIGlmIChhSXNEaW0gJiYgIWJJc0RpbSkge1xuICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAxO1xuICAgICAgfVxuICAgIH1cbiAgICAvL21ha2UgdGhlIHNvcnQgc3RhYmxlXG4gICAgcmV0dXJuIGluZGljZXNbYS5uYW1lXSAtIGluZGljZXNbYi5uYW1lXTtcbiAgfTtcbn1cblxucHJvamVjdGlvbnMua2V5ID0gZnVuY3Rpb24ocHJvamVjdGlvbikge1xuICByZXR1cm4gcHJvamVjdGlvbi5tYXAoZnVuY3Rpb24oZmllbGQpIHtcbiAgICByZXR1cm4gdmwuZmllbGQuaXNDb3VudChmaWVsZCkgPyAnY291bnQnIDogZmllbGQubmFtZTtcbiAgfSkuam9pbignLCcpO1xufTtcbiIsInZhciBnID0gZ2xvYmFsIHx8IHdpbmRvdztcblxuZy5DSEFSVF9UWVBFUyA9IHtcbiAgVEFCTEU6ICdUQUJMRScsXG4gIEJBUjogJ0JBUicsXG4gIFBMT1Q6ICdQTE9UJyxcbiAgTElORTogJ0xJTkUnLFxuICBBUkVBOiAnQVJFQScsXG4gIE1BUDogJ01BUCcsXG4gIEhJU1RPR1JBTTogJ0hJU1RPR1JBTSdcbn07XG5cbmcuQU5ZX0RBVEFfVFlQRVMgPSAoMSA8PCA0KSAtIDE7IiwidmFyIHJhbmsgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgZW5jb2Rpbmc6IHJlcXVpcmUoJy4vcmFua0VuY29kaW5ncycpXG59O1xuXG5cbiIsInZhciB2bCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LnZsIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC52bCA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJhbmtFbmNvZGluZ3M7XG5cbi8vIGJhZCBzY29yZSBub3Qgc3BlY2lmaWVkIGluIHRoZSB0YWJsZSBhYm92ZVxudmFyIEJBRF9FTkNPRElOR19TQ09SRSA9IDAuMDEsXG4gIFVOVVNFRF9QT1NJVElPTiA9IDAuNTtcblxudmFyIE1BUktfU0NPUkUgPSB7XG4gIGxpbmU6IDAuOTksXG4gIGFyZWE6IDAuOTgsXG4gIGJhcjogMC45NyxcbiAgdGljazogMC45NixcbiAgcG9pbnQ6IDAuOTUsXG4gIGNpcmNsZTogMC45NCxcbiAgc3F1YXJlOiAwLjk0LFxuICB0ZXh0OiAwLjhcbn07XG5cbmZ1bmN0aW9uIHJhbmtFbmNvZGluZ3MoZW5jb2RpbmcsIHN0YXRzLCBvcHQpIHtcbiAgdmFyIGZlYXR1cmVzID0gW10sXG4gICAgZW5jVHlwZXMgPSB2bC5rZXlzKGVuY29kaW5nLmVuYyk7XG5cbiAgLy8gdmFyIGVuY29kaW5nTWFwcGluZ0J5RmllbGQgPSB2bC5lbmMucmVkdWNlKGVuY29kaW5nLmVuYywgZnVuY3Rpb24obSwgZW5jVHlwZSwgZmllbGQpIHtcbiAgLy8gICBtW3ZsLmZpZWxkLnNob3J0aGFuZChmaWVsZCldID0ge2VuY1R5cGU6IGVuY1R5cGUsIGZpZWxkOiBmaWVsZH07XG4gIC8vICAgcmV0dXJuIG07XG4gIC8vIH0sIHt9KTtcblxuICB2bC5lbmMuZm9yRWFjaChlbmNvZGluZy5lbmMsIGZ1bmN0aW9uKGVuY1R5cGUsIGZpZWxkKSB7XG4gICAgdmFyIHJvbGUgPSB2bC5maWVsZC5yb2xlKGZpZWxkKTtcbiAgICBmZWF0dXJlcy5wdXNoKHtcbiAgICAgIHJlYXNvbjogZW5jVHlwZSt2bC5zaG9ydGhhbmQuYXNzaWduK3ZsLmZpZWxkLnNob3J0aGFuZChmaWVsZCksXG4gICAgICBzY29yZTogcmFua0VuY29kaW5ncy5zY29yZVtyb2xlXShmaWVsZCwgZW5jVHlwZSwgZW5jb2RpbmcubWFya3R5cGUsIHN0YXRzLCBvcHQpXG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIHBlbmFsaXplIG5vdCB1c2luZyBwb3NpdGlvbmFsIG9ubHkgcGVuYWxpemUgZm9yIG5vbi10ZXh0XG4gIGlmIChlbmNUeXBlcy5sZW5ndGggPiAxICYmIGVuY29kaW5nLm1hcmt0eXBlICE9PSAndGV4dCcpIHtcbiAgICBpZiAoKCFlbmNvZGluZy5lbmMueCB8fCAhZW5jb2RpbmcuZW5jLnkpICYmICFlbmNvZGluZy5lbmMuZ2VvICYmICFlbmNvZGluZy5lbmMudGV4dCkge1xuICAgICAgZmVhdHVyZXMucHVzaCh7XG4gICAgICAgIHJlYXNvbjogJ3VudXNlZCBwb3NpdGlvbicsXG4gICAgICAgIHNjb3JlOiBVTlVTRURfUE9TSVRJT05cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGZlYXR1cmVzLnB1c2goe1xuICAgIHJlYXNvbjogJ21hcmt0eXBlPScrZW5jb2RpbmcubWFya3R5cGUsXG4gICAgc2NvcmU6IE1BUktfU0NPUkVbZW5jb2RpbmcubWFya3R5cGVdXG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgc2NvcmU6IGZlYXR1cmVzLnJlZHVjZShmdW5jdGlvbihwLCBmKSB7XG4gICAgICByZXR1cm4gcCAqIGYuc2NvcmU7XG4gICAgfSwgMSksXG4gICAgZmVhdHVyZXM6IGZlYXR1cmVzXG4gIH07XG59XG5cbnJhbmtFbmNvZGluZ3MuZGltZW5zaW9uU2NvcmUgPSBmdW5jdGlvbiAoZmllbGQsIGVuY1R5cGUsIG1hcmt0eXBlLCBzdGF0cywgb3B0KXtcbiAgdmFyIGNhcmRpbmFsaXR5ID0gdmwuZmllbGQuY2FyZGluYWxpdHkoZmllbGQsIHN0YXRzKTtcbiAgc3dpdGNoIChlbmNUeXBlKSB7XG4gICAgY2FzZSAneCc6XG4gICAgICBpZihmaWVsZC50eXBlID09PSAnTycpIHJldHVybiAwLjk5O1xuICAgICAgcmV0dXJuIDE7XG5cbiAgICBjYXNlICd5JzpcbiAgICAgIGlmKGZpZWxkLnR5cGUgPT09ICdPJykgcmV0dXJuIDE7IC8vcHJlZmVyIG9yZGluYWwgb24geVxuICAgICAgaWYoZmllbGQudHlwZSA9PT0gJ1QnKSByZXR1cm4gMC44OyAvLyB0aW1lIHNob3VsZCBub3QgYmUgb24gWVxuICAgICAgcmV0dXJuIDAuOTk7XG5cbiAgICBjYXNlICdjb2wnOlxuICAgICAgaWYgKG1hcmt0eXBlID09PSAndGV4dCcpIHJldHVybiAxO1xuICAgICAgLy9wcmVmZXIgY29sdW1uIG92ZXIgcm93IGR1ZSB0byBzY3JvbGxpbmcgaXNzdWVzXG4gICAgICByZXR1cm4gY2FyZGluYWxpdHkgPD0gb3B0Lm1heEdvb2RDYXJkaW5hbGl0eUZvckZhY2V0cyA/IDAuNyA6XG4gICAgICAgIGNhcmRpbmFsaXR5IDw9IG9wdC5tYXhDYXJkaW5hbGl0eUZvckZhY2V0cyA/IDAuNiA6IDAuNTtcblxuICAgIGNhc2UgJ3Jvdyc6XG4gICAgICBpZiAobWFya3R5cGUgPT09ICd0ZXh0JykgcmV0dXJuIDAuOTk7XG4gICAgICByZXR1cm4gY2FyZGluYWxpdHkgPD0gb3B0Lm1heEdvb2RDYXJkaW5hbGl0eUZvckZhY2V0cyA/IDAuNjkgOlxuICAgICAgICBjYXJkaW5hbGl0eSA8PSBvcHQubWF4Q2FyZGluYWxpdHlGb3JGYWNldHMgPyAwLjU5IDogMC40OTtcblxuICAgIGNhc2UgJ2NvbG9yJzpcbiAgICAgIC8vc3RhY2tpbmcgZ2V0cyBsb3dlciBzY29yZVxuICAgICAgLy9GSVhNRSBhZGQgc3RhY2tpbmcgb3B0aW9uIG9uY2Ugd2UgaGF2ZSBjb250cm9sIC4uXG4gICAgICBpZiAobWFya3R5cGUgPT09J2JhcicgfHwgbWFya3R5cGUgPT09J2FyZWEnKSByZXR1cm4gMC4zO1xuXG4gICAgICAvLyB0cnVlIG9yZGluYWwgb24gY29sb3IgaXMgY3VycmVudGx5IGJhZCAodW50aWwgd2UgaGF2ZSBnb29kIG9yZGluYWwgY29sb3Igc2NhbGUgc3VwcG9ydClcbiAgICAgIGlmICgoZmllbGQuYmluICYmIGZpZWxkLnR5cGU9PT0nUScpIHx8IChmaWVsZC5mbiAmJiBmaWVsZC50eXBlPT09J1QnKSkgcmV0dXJuIDAuMztcblxuICAgICAgcmV0dXJuIGNhcmRpbmFsaXR5IDw9IG9wdC5tYXhHb29kQ2FyZGluYWxpdHlGb3JDb2xvciA/IDAuNzogY2FyZGluYWxpdHkgPD0gb3B0Lm1heENhcmRpbmFsaXR5Rm9yQ29sb3IgPyAwLjYxIDogMC4xO1xuICAgIGNhc2UgJ3NoYXBlJzpcbiAgICAgIHJldHVybiBjYXJkaW5hbGl0eSA8PSBvcHQubWF4Q2FyZGluYWxpdHlGb3JTaGFwZSA/IDAuNiA6IDAuMTtcbiAgICBjYXNlICdkZXRhaWwnOlxuICAgICAgcmV0dXJuIDAuNTtcbiAgfVxuICByZXR1cm4gQkFEX0VOQ09ESU5HX1NDT1JFO1xufTtcblxucmFua0VuY29kaW5ncy5tZWFzdXJlU2NvcmUgPSBmdW5jdGlvbiAoZmllbGQsIGVuY1R5cGUsIG1hcmt0eXBlLCBzdGF0cywgb3B0KSB7XG4gIHN3aXRjaCAoZW5jVHlwZSl7XG4gICAgY2FzZSAneCc6IHJldHVybiAxO1xuICAgIGNhc2UgJ3knOiByZXR1cm4gMTtcbiAgICBjYXNlICdzaXplJzpcbiAgICAgIGlmIChtYXJrdHlwZSA9PT0gJ2JhcicpIHJldHVybiAwLjE7IC8vc2l6ZSBvZiBiYXIgaXMgdmVyeSBiYWRcbiAgICAgIGlmIChtYXJrdHlwZSA9PT0gJ3RleHQnKSByZXR1cm4gMC4xO1xuICAgICAgaWYgKG1hcmt0eXBlID09PSAnbGluZScpIHJldHVybiAwLjE7XG4gICAgICByZXR1cm4gMC42O1xuICAgIGNhc2UgJ2NvbG9yJzogcmV0dXJuIDAuNTtcbiAgICBjYXNlICdhbHBoYSc6IHJldHVybiAwLjQ5O1xuICAgIGNhc2UgJ3RleHQnOiByZXR1cm4gMC40O1xuICB9XG4gIHJldHVybiBCQURfRU5DT0RJTkdfU0NPUkU7XG59O1xuXG5cbnJhbmtFbmNvZGluZ3Muc2NvcmUgPSB7XG4gIGRpbWVuc2lvbjogcmFua0VuY29kaW5ncy5kaW1lbnNpb25TY29yZSxcbiAgbWVhc3VyZTogcmFua0VuY29kaW5ncy5tZWFzdXJlU2NvcmVcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIGNvbnN0cyA9IHJlcXVpcmUoJy4vY29uc3RzJyk7XG5cbnZhciB1dGlsID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdlbjoge31cbn07XG5cbnV0aWwuaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKG9iaikge1xuICByZXR1cm4ge30udG9TdHJpbmcuY2FsbChvYmopID09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG51dGlsLmpzb24gPSBmdW5jdGlvbihzLCBzcCkge1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocywgbnVsbCwgc3ApO1xufTtcblxudXRpbC5rZXlzID0gZnVuY3Rpb24ob2JqKSB7XG4gIHZhciBrID0gW10sIHg7XG4gIGZvciAoeCBpbiBvYmopIGsucHVzaCh4KTtcbiAgcmV0dXJuIGs7XG59O1xuXG51dGlsLm5lc3RlZE1hcCA9IGZ1bmN0aW9uIChjb2wsIGYsIGxldmVsLCBmaWx0ZXIpIHtcbiAgcmV0dXJuIGxldmVsID09PSAwID9cbiAgICBjb2wubWFwKGYpIDpcbiAgICBjb2wubWFwKGZ1bmN0aW9uKHYpIHtcbiAgICAgIHZhciByID0gdXRpbC5uZXN0ZWRNYXAodiwgZiwgbGV2ZWwgLSAxKTtcbiAgICAgIHJldHVybiBmaWx0ZXIgPyByLmZpbHRlcih1dGlsLm5vbkVtcHR5KSA6IHI7XG4gICAgfSk7XG59O1xuXG51dGlsLm5lc3RlZFJlZHVjZSA9IGZ1bmN0aW9uIChjb2wsIGYsIGxldmVsLCBmaWx0ZXIpIHtcbiAgcmV0dXJuIGxldmVsID09PSAwID9cbiAgICBjb2wucmVkdWNlKGYsIFtdKSA6XG4gICAgY29sLm1hcChmdW5jdGlvbih2KSB7XG4gICAgICB2YXIgciA9IHV0aWwubmVzdGVkUmVkdWNlKHYsIGYsIGxldmVsIC0gMSk7XG4gICAgICByZXR1cm4gZmlsdGVyID8gci5maWx0ZXIodXRpbC5ub25FbXB0eSkgOiByO1xuICAgIH0pO1xufTtcblxudXRpbC5ub25FbXB0eSA9IGZ1bmN0aW9uKGdycCkge1xuICByZXR1cm4gIXV0aWwuaXNBcnJheShncnApIHx8IGdycC5sZW5ndGggPiAwO1xufTtcblxuXG51dGlsLnRyYXZlcnNlID0gZnVuY3Rpb24gKG5vZGUsIGFycikge1xuICBpZiAobm9kZS52YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgYXJyLnB1c2gobm9kZS52YWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKG5vZGUubGVmdCkgdXRpbC50cmF2ZXJzZShub2RlLmxlZnQsIGFycik7XG4gICAgaWYgKG5vZGUucmlnaHQpIHV0aWwudHJhdmVyc2Uobm9kZS5yaWdodCwgYXJyKTtcbiAgfVxuICByZXR1cm4gYXJyO1xufTtcblxudXRpbC51bmlvbiA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIHZhciBvID0ge307XG4gIGEuZm9yRWFjaChmdW5jdGlvbih4KSB7IG9beF0gPSB0cnVlO30pO1xuICBiLmZvckVhY2goZnVuY3Rpb24oeCkgeyBvW3hdID0gdHJ1ZTt9KTtcbiAgcmV0dXJuIHV0aWwua2V5cyhvKTtcbn07XG5cblxudXRpbC5nZW4uZ2V0T3B0ID0gZnVuY3Rpb24gKG9wdCkge1xuICAvL21lcmdlIHdpdGggZGVmYXVsdFxuICByZXR1cm4gKG9wdCA/IHV0aWwua2V5cyhvcHQpIDogW10pLnJlZHVjZShmdW5jdGlvbihjLCBrKSB7XG4gICAgY1trXSA9IG9wdFtrXTtcbiAgICByZXR1cm4gYztcbiAgfSwgT2JqZWN0LmNyZWF0ZShjb25zdHMuZ2VuLkRFRkFVTFRfT1BUKSk7XG59O1xuXG4vKipcbiAqIHBvd2Vyc2V0IGNvZGUgZnJvbSBodHRwOi8vcm9zZXR0YWNvZGUub3JnL3dpa2kvUG93ZXJfU2V0I0phdmFTY3JpcHRcbiAqXG4gKiAgIHZhciByZXMgPSBwb3dlcnNldChbMSwyLDMsNF0pO1xuICpcbiAqIHJldHVybnNcbiAqXG4gKiBbW10sWzFdLFsyXSxbMSwyXSxbM10sWzEsM10sWzIsM10sWzEsMiwzXSxbNF0sWzEsNF0sXG4gKiBbMiw0XSxbMSwyLDRdLFszLDRdLFsxLDMsNF0sWzIsMyw0XSxbMSwyLDMsNF1dXG5bZWRpdF1cbiovXG5cbnV0aWwucG93ZXJzZXQgPSBmdW5jdGlvbihsaXN0KSB7XG4gIHZhciBwcyA9IFtcbiAgICBbXVxuICBdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICBmb3IgKHZhciBqID0gMCwgbGVuID0gcHMubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgIHBzLnB1c2gocHNbal0uY29uY2F0KGxpc3RbaV0pKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBzO1xufTtcblxudXRpbC5jaG9vc2VLb3JMZXNzID0gZnVuY3Rpb24obGlzdCwgaykge1xuICB2YXIgc3Vic2V0ID0gW1tdXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgZm9yICh2YXIgaiA9IDAsIGxlbiA9IHN1YnNldC5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgdmFyIHN1YiA9IHN1YnNldFtqXS5jb25jYXQobGlzdFtpXSk7XG4gICAgICBpZihzdWIubGVuZ3RoIDw9IGspe1xuICAgICAgICBzdWJzZXQucHVzaChzdWIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gc3Vic2V0O1xufTtcblxudXRpbC5jaG9vc2VLID0gZnVuY3Rpb24obGlzdCwgaykge1xuICB2YXIgc3Vic2V0ID0gW1tdXTtcbiAgdmFyIGtBcnJheSA9W107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIGZvciAodmFyIGogPSAwLCBsZW4gPSBzdWJzZXQubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgIHZhciBzdWIgPSBzdWJzZXRbal0uY29uY2F0KGxpc3RbaV0pO1xuICAgICAgaWYoc3ViLmxlbmd0aCA8IGspe1xuICAgICAgICBzdWJzZXQucHVzaChzdWIpO1xuICAgICAgfWVsc2UgaWYgKHN1Yi5sZW5ndGggPT09IGspe1xuICAgICAgICBrQXJyYXkucHVzaChzdWIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4ga0FycmF5O1xufTtcblxudXRpbC5jcm9zcyA9IGZ1bmN0aW9uKGEsYil7XG4gIHZhciB4ID0gW107XG4gIGZvcih2YXIgaT0wOyBpPCBhLmxlbmd0aDsgaSsrKXtcbiAgICBmb3IodmFyIGo9MDtqPCBiLmxlbmd0aDsgaisrKXtcbiAgICAgIHgucHVzaChhW2ldLmNvbmNhdChiW2pdKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiB4O1xufTtcblxuIl19
