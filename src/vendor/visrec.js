!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.vr=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var vr = module.exports = {
  consts: require('./consts'),
  cluster: require('./cluster/cluster'),
  gen: require('./gen/gen'),
  rank: require('./rank/rank'),
  util: require('./util'),
  auto: "-, sum"
};



},{"./cluster/cluster":2,"./consts":5,"./gen/gen":9,"./rank/rank":13,"./util":15}],2:[function(require,module,exports){
(function (global){
"use strict";

module.exports = cluster;

var vl = (typeof window !== "undefined" ? window.vl : typeof global !== "undefined" ? global.vl : null),
  clusterfck = (typeof window !== "undefined" ? window.clusterfck : typeof global !== "undefined" ? global.clusterfck : null),
  consts = require('./clusterconsts'),
  util = require('../util');

cluster.distance = require('./distance');

function cluster(encodings, opt) {
  var dist = cluster.distance.table(encodings);

  var clusterTrees = clusterfck.hcluster(encodings, function(e1, e2) {
    var s1 = vl.Encoding.shorthand(e1),
      s2 = vl.Encoding.shorthand(e2);
    return dist[s1][s2];
  }, 'average', consts.CLUSTER_THRESHOLD);

  var clusters = clusterTrees.map(function(tree) {
      return util.traverse(tree, []);
    })
   .map(function(cluster) {
    return cluster.sort(function(encoding1, encoding2) {
      // sort each cluster -- have the highest score as 1st item
      return encoding2.score - encoding1.score;
    });
  }).filter(function(cluster) {  // filter empty cluster
    return cluster.length >0;
  }).sort(function(cluster1, cluster2) {
    //sort by highest scoring item in each cluster
    return cluster2[0].score - cluster1[0].score;
  });

  clusters.dist = dist; //append dist in the array for debugging

  return clusters;
}
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../util":15,"./clusterconsts":3,"./distance":4}],3:[function(require,module,exports){
var c = module.exports = {};

c.SWAPPABLE = 0.05;
c.DIST_MISSING = 1;
c.CLUSTER_THRESHOLD = 1;

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
  ['color', 'detail', c.SWAPPABLE],
  ['detail', 'shape', c.SWAPPABLE],

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
    colencs = encodings.map(function(e) { return distance.getEncTypeByColumnName(e); }),
    shorthands = encodings.map(vl.Encoding.shorthand),
    diff = {}, i, j;

  for (i = 0; i < len; i++) diff[shorthands[i]] = {};

  for (i = 0; i < len; i++) {
    for (j = i + 1; j < len; j++) {
      var sj = shorthands[j], si = shorthands[i];

      diff[sj][si] = diff[si][sj] = distance.get(colencs[i], colencs[j]);
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
    config: {
      type: 'object'
    },
    data: {
      type: 'object'
    },
    tableTypes: {
      type: 'boolean',
      default: 'both',
      enum: ['both', 'aggregated', 'disaggregated']
    },
    genDimQ: {
      type: 'string',
      default: 'auto',
      enum: ['auto', 'bin', 'cast', 'none'],
      description: 'Use Q as Dimension either by binning or casting'
    },
    minCardinalityForBin: {
      type: 'integer',
      default: 20,
      description: 'minimum cardinality of a field if we were to bin'
    },
    omitDotPlot: {
      type: 'boolean',
      default: false,
      description: 'remove all dot plots'
    },
    omitMeasureOnly: {
      type: 'boolean',
      default: false,
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
    },
    consistentAutoQ: {
      type: 'boolean',
      default: true,
      description: "generate similar auto transform for quant"
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
      default: 5,
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

var ANY='*';

module.exports = genAggregates;

function genAggregates(output, fields, stats, opt) {
  opt = vl.schema.util.extend(opt||{}, consts.gen.aggregates);
  var tf = new Array(fields.length);
  var hasO = vl.any(fields, function(f) {
    return f.type === 'O';
  });

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

  function assignAggrQ(i, hasAggr, autoMode, a) {
    var canHaveAggr = hasAggr === true || hasAggr === null,
      cantHaveAggr = hasAggr === false || hasAggr === null;
    if (a) {
      if (canHaveAggr) {
        tf[i].aggr = a;
        assignField(i + 1, true, autoMode);
        delete tf[i].aggr;
      }
    } else { // if(a === undefined)
      if (cantHaveAggr) {
        assignField(i + 1, false, autoMode);
      }
    }
  }

  function assignBinQ(i, hasAggr, autoMode) {
    tf[i].bin = true;
    assignField(i + 1, hasAggr, autoMode);
    delete tf[i].bin;
  }

  function assignQ(i, hasAggr, autoMode) {
    var f = fields[i],
      canHaveAggr = hasAggr === true || hasAggr === null;

    tf[i] = {name: f.name, type: f.type};

    if (f.aggr === 'count') { // if count is included in the selected fields
      if (canHaveAggr) {
        tf[i].aggr = f.aggr;
        assignField(i + 1, true, autoMode);
      }
    } else if (f._aggr) {
      // TODO support array of f._aggrs too
      assignAggrQ(i, hasAggr, autoMode, f._aggr);
    } else if (f._raw) {
      assignAggrQ(i, hasAggr, autoMode, undefined);
    } else if (f._bin) {
      assignBinQ(i, hasAggr, autoMode);
    } else {
      opt.aggrList.forEach(function(a) {
        if (!opt.consistentAutoQ || autoMode === ANY || autoMode === a) {
          assignAggrQ(i, hasAggr, a /*assign autoMode*/, a);
        }
      });

      if ((!opt.consistentAutoQ || vl.isin(autoMode, [ANY, 'bin', 'cast', 'autocast'])) && !hasO) {
        var highCardinality = vl.field.cardinality(f, stats) > opt.minCardinalityForBin;

        var isAuto = opt.genDimQ === 'auto',
          genBin = opt.genDimQ  === 'bin' || (isAuto && highCardinality),
          genCast = opt.genDimQ === 'cast' || (isAuto && !highCardinality);

        if (genBin && vl.isin(autoMode, [ANY, 'bin', 'autocast'])) {
          assignBinQ(i, hasAggr, isAuto ? 'autocast' : 'bin');
        }
        if (genCast && vl.isin(autoMode, [ANY, 'cast', 'autocast'])) {
          tf[i].type = 'O';
          assignField(i + 1, hasAggr, isAuto ? 'autocast' : 'cast');
          tf[i].type = 'Q';
        }
      }
    }
  }

  function assignFnT(i, hasAggr, autoMode, fn) {
    tf[i].fn = fn;
    assignField(i+1, hasAggr, autoMode);
    delete tf[i].fn;
  }

  function assignT(i, hasAggr, autoMode) {
    var f = fields[i];
    tf[i] = {name: f.name, type: f.type};

    // TODO support array of f._fns
    if (f._fn) {
      assignFnT(i, hasAggr, autoMode, f._fn);
    } else {
      opt.timeFnList.forEach(function(fn) {
        if (fn === undefined) {
          if (!hasAggr) { // can't aggregate over raw time
            assignField(i+1, false, autoMode);
          }
        } else {
          assignFnT(i, hasAggr, autoMode, fn);
        }
      });
    }

    // FIXME what if you aggregate time?
  }

  function assignField(i, hasAggr, autoMode) {
    if (i === fields.length) { // If all fields are assigned
      checkAndPush();
      return;
    }

    var f = fields[i];
    // Otherwise, assign i-th field
    switch (f.type) {
      //TODO "D", "G"
      case 'Q':
        assignQ(i, hasAggr, autoMode);
        break;

      case 'T':
        assignT(i, hasAggr, autoMode);
        break;

      case 'O':
      default:
        tf[i] = f;
        assignField(i + 1, hasAggr, autoMode);
        break;
    }
  }

  var hasAggr = opt.tableTypes === 'aggregated' ? true : opt.tableTypes === 'disaggregated' ? false : null;
  assignField(0, hasAggr, ANY);

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

function genEncodingsFromFields(output, fields, stats, opt, nested) {
  opt = vl.schema.util.extend(opt||{}, consts.gen.encodings);
  var encs = genEncs([], fields, stats, opt);

  if (nested) {
    return encs.reduce(function(dict, enc) {
      dict[enc] = genEncodingsFromEncs([], enc, stats, opt);
      return dict;
    }, {});
  } else {
    return encs.reduce(function(list, enc) {
      return genEncodingsFromEncs(list, enc, stats, opt);
    }, []);
  }
}

function genEncodingsFromEncs(output, enc, stats, opt) {
  getMarktypes(enc, stats, opt)
    .forEach(function(markType) {
      var e = vl.duplicate({
          data: opt.data,
          marktype: markType,
          enc: enc,
          config: opt.config
        }),
        encoding = finalTouch(e, stats, opt),
        score = rank.encoding(encoding, stats, opt);

      encoding.score = score.score;
      encoding.scoreFeatures = score.features;
      output.push(encoding);
    });
  return output;
}

//FIXME this should be refactors
function finalTouch(encoding, stats, opt) {
  if (encoding.marktype === 'text' && opt.alwaysGenerateTableAsHeatmap) {
    encoding.enc.color = encoding.enc.text;
  }

  // don't include zero if stdev/avg < 0.01
  // https://github.com/uwdata/visrec/issues/69
  var enc = encoding.enc;
  ['x', 'y'].forEach(function(et) {
    var field = enc[et];
    if (field && vl.field.isMeasure(field) && !vl.field.isCount(field)) {
      var stat = stats[field.name];
      if (stat.stdev / stat.avg < 0.01) {
        field.scale = {zero: false};
      }
    }
  });
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
      var isDimX = !!isDimension(enc.x),
        isDimY = !!isDimension(enc.y);

      if (isDimX && isDimY && !vl.enc.isAggregate(enc)) {
        // FIXME actually check if there would be occlusion #90
        return false;
      }

      if (opt.omitTranpose) {
        if (isDimX ^ isDimY) { // dim x mea
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
  isDimension = vl.field.isDimension,
  isOrdinalScale = vl.field.isOrdinalScale;

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

    return (!xIsDim && (!enc.y || isOrdinalScale(enc.y))) ||
      (!yIsDim && (!enc.x || isOrdinalScale(enc.x)));
  }
  return false;
}

function barRule(enc, stats, opt) {
  if(!facetsRule(enc, stats, opt)) return false;

  // need to aggregate on either x or y
  if (opt.omitSizeOnBar && enc.size !== undefined) return false;

  // FIXME actually check if there would be occlusion #90
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
  return (enc.row || enc.col) && enc.text && enc.text.aggr && !enc.x && !enc.y && !enc.size &&
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
      if (isDimension(field) || field.type ==='T') { // FIXME / HACK
        hasSelectedDimension = true;
      } else {
        hasSelectedMeasure = true;
      }
    } else if (field.selected !== false && !vl.field.isCount(field)) {
      if (vl.field.isDimension(field) &&
          !opt.maxCardinalityForAutoAddOrdinal &&
          vl.field.cardinality(field, stats, 15) > opt.maxCardinalityForAutoAddOrdinal
        ) {
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

var typeIsMeasureScore = {
  O: 0,
  T: 1,
  Q: 2
};

function compareFieldsToAdd(hasSelectedDimension, hasSelectedMeasure, indices) {
  return function(a, b){
    var aIsDim = isDimension(a), bIsDim = isDimension(b);
    // sort by type of the data
    if (a.type !== b.type) {
      if (!hasSelectedDimension) {
        return typeIsMeasureScore[a.type] - typeIsMeasureScore[b.type];
      } else if (!hasSelectedMeasure) {
        return typeIsMeasureScore[b.type] - typeIsMeasureScore[a.type];
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
var vl = (typeof window !== "undefined" ? window.vl : typeof global !== "undefined" ? global.vl : null),
  isDimension = vl.field.isDimension;

module.exports = rankEncodings;

// bad score not specified in the table above
var UNUSED_POSITION = 0.5;

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

function rankEncodings(encoding, stats, opt, selected) {
  var features = [],
    encTypes = vl.keys(encoding.enc),
    marktype = encoding.marktype,
    enc = encoding.enc;

  var encodingMappingByField = vl.enc.reduce(encoding.enc, function(o, field, encType) {
    var key = vl.field.shorthand(field);
    var mappings = o[key] = o[key] || [];
    mappings.push({encType: encType, field: field});
    return o;
  }, {});

  // data - encoding mapping score
  vl.forEach(encodingMappingByField, function(mappings) {
    var reasons = mappings.map(function(m) {
        return m.encType + vl.shorthand.assign + vl.field.shorthand(m.field) +
          ' ' + (selected && selected[m.field.name] ? '[x]' : '[ ]');
      }),
      scores = mappings.map(function(m) {
        var role = vl.field.role(m.field);
        var score = rankEncodings.score[role](m.field, m.encType, encoding.marktype, stats, opt);

        return !selected || selected[m.field.name] ? score : Math.pow(score, 0.125);
      });

    features.push({
      reason: reasons.join(" | "),
      score: Math.max.apply(null, scores)
    });
  });

  // plot type
  if (marktype === 'text') {
    // TODO
  } else {
    if (enc.x && enc.y) {
      if (isDimension(enc.x) ^ isDimension(enc.y)) {
        features.push({
          reason: 'OxQ plot',
          score: 0.8
        });
      }
    }
  }

  // penalize not using positional only penalize for non-text
  if (encTypes.length > 1 && marktype !== 'text') {
    if ((!enc.x || !enc.y) && !enc.geo && !enc.text) {
      features.push({
        reason: 'unused position',
        score: UNUSED_POSITION
      });
    }
  }

  // mark type score
  features.push({
    reason: 'marktype='+marktype,
    score: MARK_SCORE[marktype]
  });

  return {
    score: features.reduce(function(p, f) {
      return p * f.score;
    }, 1),
    features: features
  };
}


var D = {}, M = {}, BAD = 0.1, TERRIBLE = 0.01;

D.minor = 0.01;
D.pos = 1;
D.Y_T = 0.8;
D.facet_text = 1;
D.facet_good = 0.675; // < color_ok, > color_bad
D.facet_ok = 0.55;
D.facet_bad = 0.4;
D.color_good = 0.7;
D.color_ok = 0.65; // > M.Size
D.color_bad = 0.3;
D.color_stack = 0.6;
D.shape = 0.6;
D.detail = 0.5;
D.bad = BAD;
D.terrible = TERRIBLE;

M.pos = 1;
M.size = 0.6;
M.color = 0.5;
M.alpha = 0.45;
M.text = 0.4;
M.bad = BAD;
M.terrible = TERRIBLE;

rankEncodings.dimensionScore = function (field, encType, marktype, stats, opt){
  var cardinality = vl.field.cardinality(field, stats);
  switch (encType) {
    case 'x':
      if(field.type === 'O') return D.pos - D.minor;
      return D.pos;

    case 'y':
      if(field.type === 'O') return D.pos - D.minor; //prefer ordinal on y
      if(field.type === 'T') return D.Y_T; // time should not be on Y
      return D.pos - D.minor;

    case 'col':
      if (marktype === 'text') return D.facet_text;
      //prefer column over row due to scrolling issues
      return cardinality <= opt.maxGoodCardinalityForFacets ? D.facet_good :
        cardinality <= opt.maxCardinalityForFacets ? D.facet_ok : D.facet_bad;

    case 'row':
      if (marktype === 'text') return D.facet_text;
      return (cardinality <= opt.maxGoodCardinalityForFacets ? D.facet_good :
        cardinality <= opt.maxCardinalityForFacets ? D.facet_ok : D.facet_bad) - D.minor;

    case 'color':
      var hasOrder = (field.bin && field.type==='Q') || (field.fn && field.type==='T');

      //FIXME add stacking option once we have control ..
      var isStacked = marktype ==='bar' || marktype ==='area';

      // true ordinal on color is currently BAD (until we have good ordinal color scale support)
      if (hasOrder) return D.color_bad;

      //stacking gets lower score
      if (isStacked) return D.color_stack;

      return cardinality <= opt.maxGoodCardinalityForColor ? D.color_good: cardinality <= opt.maxCardinalityForColor ? D.color_ok : D.color_bad;
    case 'shape':
      return cardinality <= opt.maxCardinalityForShape ? D.shape : TERRIBLE;
    case 'detail':
      return D.detail;
  }
  return TERRIBLE;
};

rankEncodings.dimensionScore.consts = D;

rankEncodings.measureScore = function (field, encType, marktype, stats, opt) {
  switch (encType){
    case 'x': return M.pos;
    case 'y': return M.pos;
    case 'size':
      if (marktype === 'bar') return BAD; //size of bar is very bad
      if (marktype === 'text') return BAD;
      if (marktype === 'line') return BAD;
      return M.size;
    case 'color': return M.color;
    case 'alpha': return M.alpha;
    case 'text': return M.text;
  }
  return BAD;
};

rankEncodings.measureScore.consts = M;


rankEncodings.score = {
  dimension: rankEncodings.dimensionScore,
  measure: rankEncodings.measureScore,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvdnIiLCJzcmMvY2x1c3Rlci9jbHVzdGVyLmpzIiwic3JjL2NsdXN0ZXIvY2x1c3RlcmNvbnN0cy5qcyIsInNyYy9jbHVzdGVyL2Rpc3RhbmNlLmpzIiwic3JjL2NvbnN0cy5qcyIsInNyYy9nZW4vYWdncmVnYXRlcy5qcyIsInNyYy9nZW4vZW5jb2RpbmdzLmpzIiwic3JjL2dlbi9lbmNzLmpzIiwic3JjL2dlbi9nZW4uanMiLCJzcmMvZ2VuL21hcmt0eXBlcy5qcyIsInNyYy9nZW4vcHJvamVjdGlvbnMuanMiLCJzcmMvZ2xvYmFscy5qcyIsInNyYy9yYW5rL3JhbmsuanMiLCJzcmMvcmFuay9yYW5rRW5jb2RpbmdzLmpzIiwic3JjL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDakxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQzlLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDak5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDekxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgdnIgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgY29uc3RzOiByZXF1aXJlKCcuL2NvbnN0cycpLFxuICBjbHVzdGVyOiByZXF1aXJlKCcuL2NsdXN0ZXIvY2x1c3RlcicpLFxuICBnZW46IHJlcXVpcmUoJy4vZ2VuL2dlbicpLFxuICByYW5rOiByZXF1aXJlKCcuL3JhbmsvcmFuaycpLFxuICB1dGlsOiByZXF1aXJlKCcuL3V0aWwnKSxcbiAgYXV0bzogXCItLCBzdW1cIlxufTtcblxuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBjbHVzdGVyO1xuXG52YXIgdmwgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy52bCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwudmwgOiBudWxsKSxcbiAgY2x1c3RlcmZjayA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LmNsdXN0ZXJmY2sgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLmNsdXN0ZXJmY2sgOiBudWxsKSxcbiAgY29uc3RzID0gcmVxdWlyZSgnLi9jbHVzdGVyY29uc3RzJyksXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cbmNsdXN0ZXIuZGlzdGFuY2UgPSByZXF1aXJlKCcuL2Rpc3RhbmNlJyk7XG5cbmZ1bmN0aW9uIGNsdXN0ZXIoZW5jb2RpbmdzLCBvcHQpIHtcbiAgdmFyIGRpc3QgPSBjbHVzdGVyLmRpc3RhbmNlLnRhYmxlKGVuY29kaW5ncyk7XG5cbiAgdmFyIGNsdXN0ZXJUcmVlcyA9IGNsdXN0ZXJmY2suaGNsdXN0ZXIoZW5jb2RpbmdzLCBmdW5jdGlvbihlMSwgZTIpIHtcbiAgICB2YXIgczEgPSB2bC5FbmNvZGluZy5zaG9ydGhhbmQoZTEpLFxuICAgICAgczIgPSB2bC5FbmNvZGluZy5zaG9ydGhhbmQoZTIpO1xuICAgIHJldHVybiBkaXN0W3MxXVtzMl07XG4gIH0sICdhdmVyYWdlJywgY29uc3RzLkNMVVNURVJfVEhSRVNIT0xEKTtcblxuICB2YXIgY2x1c3RlcnMgPSBjbHVzdGVyVHJlZXMubWFwKGZ1bmN0aW9uKHRyZWUpIHtcbiAgICAgIHJldHVybiB1dGlsLnRyYXZlcnNlKHRyZWUsIFtdKTtcbiAgICB9KVxuICAgLm1hcChmdW5jdGlvbihjbHVzdGVyKSB7XG4gICAgcmV0dXJuIGNsdXN0ZXIuc29ydChmdW5jdGlvbihlbmNvZGluZzEsIGVuY29kaW5nMikge1xuICAgICAgLy8gc29ydCBlYWNoIGNsdXN0ZXIgLS0gaGF2ZSB0aGUgaGlnaGVzdCBzY29yZSBhcyAxc3QgaXRlbVxuICAgICAgcmV0dXJuIGVuY29kaW5nMi5zY29yZSAtIGVuY29kaW5nMS5zY29yZTtcbiAgICB9KTtcbiAgfSkuZmlsdGVyKGZ1bmN0aW9uKGNsdXN0ZXIpIHsgIC8vIGZpbHRlciBlbXB0eSBjbHVzdGVyXG4gICAgcmV0dXJuIGNsdXN0ZXIubGVuZ3RoID4wO1xuICB9KS5zb3J0KGZ1bmN0aW9uKGNsdXN0ZXIxLCBjbHVzdGVyMikge1xuICAgIC8vc29ydCBieSBoaWdoZXN0IHNjb3JpbmcgaXRlbSBpbiBlYWNoIGNsdXN0ZXJcbiAgICByZXR1cm4gY2x1c3RlcjJbMF0uc2NvcmUgLSBjbHVzdGVyMVswXS5zY29yZTtcbiAgfSk7XG5cbiAgY2x1c3RlcnMuZGlzdCA9IGRpc3Q7IC8vYXBwZW5kIGRpc3QgaW4gdGhlIGFycmF5IGZvciBkZWJ1Z2dpbmdcblxuICByZXR1cm4gY2x1c3RlcnM7XG59IiwidmFyIGMgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5jLlNXQVBQQUJMRSA9IDAuMDU7XG5jLkRJU1RfTUlTU0lORyA9IDE7XG5jLkNMVVNURVJfVEhSRVNIT0xEID0gMTtcblxuZnVuY3Rpb24gcmVkdWNlVHVwbGVUb1RhYmxlKHIsIHgpIHtcbiAgdmFyIGEgPSB4WzBdLCBiID0geFsxXSwgZCA9IHhbMl07XG4gIHJbYV0gPSByW2FdIHx8IHt9O1xuICByW2JdID0gcltiXSB8fCB7fTtcbiAgclthXVtiXSA9IHJbYl1bYV0gPSBkO1xuICByZXR1cm4gcjtcbn1cblxuYy5ESVNUX0JZX0VOQ1RZUEUgPSBbXG4gIC8vIHBvc2l0aW9uYWxcbiAgWyd4JywgJ3knLCBjLlNXQVBQQUJMRV0sXG4gIFsncm93JywgJ2NvbCcsIGMuU1dBUFBBQkxFXSxcblxuICAvLyBvcmRpbmFsIG1hcmsgcHJvcGVydGllc1xuICBbJ2NvbG9yJywgJ3NoYXBlJywgYy5TV0FQUEFCTEVdLFxuICBbJ2NvbG9yJywgJ2RldGFpbCcsIGMuU1dBUFBBQkxFXSxcbiAgWydkZXRhaWwnLCAnc2hhcGUnLCBjLlNXQVBQQUJMRV0sXG5cbiAgLy8gcXVhbnRpdGF0aXZlIG1hcmsgcHJvcGVydGllc1xuICBbJ2NvbG9yJywgJ2FscGhhJywgYy5TV0FQUEFCTEVdLFxuICBbJ3NpemUnLCAnYWxwaGEnLCBjLlNXQVBQQUJMRV0sXG4gIFsnc2l6ZScsICdjb2xvcicsIGMuU1dBUFBBQkxFXVxuXS5yZWR1Y2UocmVkdWNlVHVwbGVUb1RhYmxlLCB7fSk7XG4iLCJ2YXIgdmwgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy52bCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwudmwgOiBudWxsKSxcbiAgY29uc3RzID0gcmVxdWlyZSgnLi9jbHVzdGVyY29uc3RzJyksXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZGlzdGFuY2UgPSB7fTtcblxuZGlzdGFuY2UudGFibGUgPSBmdW5jdGlvbiAoZW5jb2RpbmdzKSB7XG4gIHZhciBsZW4gPSBlbmNvZGluZ3MubGVuZ3RoLFxuICAgIGNvbGVuY3MgPSBlbmNvZGluZ3MubWFwKGZ1bmN0aW9uKGUpIHsgcmV0dXJuIGRpc3RhbmNlLmdldEVuY1R5cGVCeUNvbHVtbk5hbWUoZSk7IH0pLFxuICAgIHNob3J0aGFuZHMgPSBlbmNvZGluZ3MubWFwKHZsLkVuY29kaW5nLnNob3J0aGFuZCksXG4gICAgZGlmZiA9IHt9LCBpLCBqO1xuXG4gIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykgZGlmZltzaG9ydGhhbmRzW2ldXSA9IHt9O1xuXG4gIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIGZvciAoaiA9IGkgKyAxOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgIHZhciBzaiA9IHNob3J0aGFuZHNbal0sIHNpID0gc2hvcnRoYW5kc1tpXTtcblxuICAgICAgZGlmZltzal1bc2ldID0gZGlmZltzaV1bc2pdID0gZGlzdGFuY2UuZ2V0KGNvbGVuY3NbaV0sIGNvbGVuY3Nbal0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGlmZjtcbn07XG5cbmRpc3RhbmNlLmdldCA9IGZ1bmN0aW9uIChjb2xlbmMxLCBjb2xlbmMyKSB7XG4gIHZhciBjb2xzID0gdXRpbC51bmlvbih2bC5rZXlzKGNvbGVuYzEuY29sKSwgdmwua2V5cyhjb2xlbmMyLmNvbCkpLFxuICAgIGRpc3QgPSAwO1xuXG4gIGNvbHMuZm9yRWFjaChmdW5jdGlvbihjb2wpIHtcbiAgICB2YXIgZTEgPSBjb2xlbmMxLmNvbFtjb2xdLCBlMiA9IGNvbGVuYzIuY29sW2NvbF07XG5cbiAgICBpZiAoZTEgJiYgZTIpIHtcbiAgICAgIGlmIChlMS5lbmNUeXBlICE9IGUyLmVuY1R5cGUpIHtcbiAgICAgICAgZGlzdCArPSAoY29uc3RzLkRJU1RfQllfRU5DVFlQRVtlMS5lbmNUeXBlXSB8fCB7fSlbZTIuZW5jVHlwZV0gfHwgMTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZGlzdCArPSBjb25zdHMuRElTVF9NSVNTSU5HO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gZG8gbm90IGdyb3VwIHN0YWNrZWQgY2hhcnQgd2l0aCBzaW1pbGFyIG5vbi1zdGFja2VkIGNoYXJ0IVxuICB2YXIgaXNTdGFjazEgPSB2bC5FbmNvZGluZy5pc1N0YWNrKGNvbGVuYzEpLFxuICAgIGlzU3RhY2syID0gdmwuRW5jb2RpbmcuaXNTdGFjayhjb2xlbmMyKTtcblxuICBpZihpc1N0YWNrMSB8fCBpc1N0YWNrMikge1xuICAgIGlmKGlzU3RhY2sxICYmIGlzU3RhY2syKSB7XG4gICAgICBpZihjb2xlbmMxLmVuYy5jb2xvci5uYW1lICE9PSBjb2xlbmMyLmVuYy5jb2xvci5uYW1lKSB7XG4gICAgICAgIGRpc3QrPTE7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGRpc3QrPTE7IC8vIHN1cmVseSBkaWZmZXJlbnRcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRpc3Q7XG59O1xuXG4vLyBnZXQgZW5jb2RpbmcgdHlwZSBieSBmaWVsZG5hbWVcbmRpc3RhbmNlLmdldEVuY1R5cGVCeUNvbHVtbk5hbWUgPSBmdW5jdGlvbihlbmNvZGluZykge1xuICB2YXIgX2NvbGVuYyA9IHt9LFxuICAgIGVuYyA9IGVuY29kaW5nLmVuYztcblxuICB2bC5rZXlzKGVuYykuZm9yRWFjaChmdW5jdGlvbihlbmNUeXBlKSB7XG4gICAgdmFyIGUgPSB2bC5kdXBsaWNhdGUoZW5jW2VuY1R5cGVdKTtcbiAgICBlLmVuY1R5cGUgPSBlbmNUeXBlO1xuICAgIF9jb2xlbmNbZS5uYW1lIHx8ICcnXSA9IGU7XG4gICAgZGVsZXRlIGUubmFtZTtcbiAgfSk7XG5cbiAgcmV0dXJuIHtcbiAgICBtYXJrdHlwZTogZW5jb2RpbmcubWFya3R5cGUsXG4gICAgY29sOiBfY29sZW5jLFxuICAgIGVuYzogZW5jb2RpbmcuZW5jXG4gIH07XG59OyIsInZhciBjb25zdHMgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2VuOiB7fSxcbiAgY2x1c3Rlcjoge30sXG4gIHJhbms6IHt9XG59O1xuXG5jb25zdHMuZ2VuLnByb2plY3Rpb25zID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgcHJvcGVydGllczoge1xuICAgIG9taXREb3RQbG90OiB7IC8vRklYTUUgcmVtb3ZlIHRoaXMhXG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAncmVtb3ZlIGFsbCBkb3QgcGxvdHMnXG4gICAgfSxcbiAgICBtYXhDYXJkaW5hbGl0eUZvckF1dG9BZGRPcmRpbmFsOiB7XG4gICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICBkZWZhdWx0OiA1MCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnbWF4IGNhcmRpbmFsaXR5IGZvciBvcmRpbmFsIGZpZWxkIHRvIGJlIGNvbnNpZGVyZWQgZm9yIGF1dG8gYWRkaW5nJ1xuICAgIH0sXG4gICAgYWx3YXlzQWRkSGlzdG9ncmFtOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgfVxuICB9XG59O1xuXG5jb25zdHMuZ2VuLmFnZ3JlZ2F0ZXMgPSB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgY29uZmlnOiB7XG4gICAgICB0eXBlOiAnb2JqZWN0J1xuICAgIH0sXG4gICAgZGF0YToge1xuICAgICAgdHlwZTogJ29iamVjdCdcbiAgICB9LFxuICAgIHRhYmxlVHlwZXM6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6ICdib3RoJyxcbiAgICAgIGVudW06IFsnYm90aCcsICdhZ2dyZWdhdGVkJywgJ2Rpc2FnZ3JlZ2F0ZWQnXVxuICAgIH0sXG4gICAgZ2VuRGltUToge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiAnYXV0bycsXG4gICAgICBlbnVtOiBbJ2F1dG8nLCAnYmluJywgJ2Nhc3QnLCAnbm9uZSddLFxuICAgICAgZGVzY3JpcHRpb246ICdVc2UgUSBhcyBEaW1lbnNpb24gZWl0aGVyIGJ5IGJpbm5pbmcgb3IgY2FzdGluZydcbiAgICB9LFxuICAgIG1pbkNhcmRpbmFsaXR5Rm9yQmluOiB7XG4gICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICBkZWZhdWx0OiAyMCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnbWluaW11bSBjYXJkaW5hbGl0eSBvZiBhIGZpZWxkIGlmIHdlIHdlcmUgdG8gYmluJ1xuICAgIH0sXG4gICAgb21pdERvdFBsb3Q6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgZGVzY3JpcHRpb246ICdyZW1vdmUgYWxsIGRvdCBwbG90cydcbiAgICB9LFxuICAgIG9taXRNZWFzdXJlT25seToge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICBkZXNjcmlwdGlvbjogJ09taXQgYWdncmVnYXRpb24gd2l0aCBtZWFzdXJlKHMpIG9ubHknXG4gICAgfSxcbiAgICBvbWl0RGltZW5zaW9uT25seToge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnT21pdCBhZ2dyZWdhdGlvbiB3aXRoIGRpbWVuc2lvbihzKSBvbmx5J1xuICAgIH0sXG4gICAgYWRkQ291bnRGb3JEaW1lbnNpb25Pbmx5OiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgZGVzY3JpcHRpb246ICdBZGQgY291bnQgd2hlbiB0aGVyZSBhcmUgZGltZW5zaW9uKHMpIG9ubHknXG4gICAgfSxcbiAgICBhZ2dyTGlzdDoge1xuICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgIGl0ZW1zOiB7XG4gICAgICAgIHR5cGU6IFsnc3RyaW5nJ11cbiAgICAgIH0sXG4gICAgICBkZWZhdWx0OiBbdW5kZWZpbmVkLCAnYXZnJ11cbiAgICB9LFxuICAgIHRpbWVGbkxpc3Q6IHtcbiAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICBpdGVtczoge1xuICAgICAgICB0eXBlOiBbJ3N0cmluZyddXG4gICAgICB9LFxuICAgICAgZGVmYXVsdDogWyd5ZWFyJ11cbiAgICB9LFxuICAgIGNvbnNpc3RlbnRBdXRvUToge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgIGRlc2NyaXB0aW9uOiBcImdlbmVyYXRlIHNpbWlsYXIgYXV0byB0cmFuc2Zvcm0gZm9yIHF1YW50XCJcbiAgICB9XG4gIH1cbn07XG5cbmNvbnN0cy5nZW4uZW5jb2RpbmdzID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgcHJvcGVydGllczoge1xuICAgIG1hcmt0eXBlTGlzdDoge1xuICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgIGl0ZW1zOiB7dHlwZTogJ3N0cmluZyd9LFxuICAgICAgZGVmYXVsdDogWydwb2ludCcsICdiYXInLCAnbGluZScsICdhcmVhJywgJ3RleHQnLCAndGljayddLCAvL2ZpbGxlZF9tYXBcbiAgICAgIGRlc2NyaXB0aW9uOiAnYWxsb3dlZCBtYXJrdHlwZXMnXG4gICAgfSxcbiAgICBlbmNvZGluZ1R5cGVMaXN0OiB7XG4gICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgaXRlbXM6IHt0eXBlOiAnc3RyaW5nJ30sXG4gICAgICBkZWZhdWx0OiBbJ3gnLCAneScsICdyb3cnLCAnY29sJywgJ3NpemUnLCAnY29sb3InLCAndGV4dCcsICdkZXRhaWwnXSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnYWxsb3dlZCBlbmNvZGluZyB0eXBlcydcbiAgICB9LFxuICAgIG1heEdvb2RDYXJkaW5hbGl0eUZvckZhY2V0czoge1xuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgZGVmYXVsdDogNSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnbWF4aW11bSBjYXJkaW5hbGl0eSBvZiBhIGZpZWxkIHRvIGJlIHB1dCBvbiBmYWNldCAocm93L2NvbCkgZWZmZWN0aXZlbHknXG4gICAgfSxcbiAgICBtYXhDYXJkaW5hbGl0eUZvckZhY2V0czoge1xuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgZGVmYXVsdDogMjAsXG4gICAgICBkZXNjcmlwdGlvbjogJ21heGltdW0gY2FyZGluYWxpdHkgb2YgYSBmaWVsZCB0byBiZSBwdXQgb24gZmFjZXQgKHJvdy9jb2wpJ1xuICAgIH0sXG4gICAgbWF4R29vZENhcmRpbmFsaXR5Rm9yQ29sb3I6IHtcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgIGRlZmF1bHQ6IDcsXG4gICAgICBkZXNjcmlwdGlvbjogJ21heGltdW0gY2FyZGluYWxpdHkgb2YgYW4gb3JkaW5hbCBmaWVsZCB0byBiZSBwdXQgb24gY29sb3IgZWZmZWN0aXZlbHknXG4gICAgfSxcbiAgICBtYXhDYXJkaW5hbGl0eUZvckNvbG9yOiB7XG4gICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICBkZWZhdWx0OiAyMCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnbWF4aW11bSBjYXJkaW5hbGl0eSBvZiBhbiBvcmRpbmFsIGZpZWxkIHRvIGJlIHB1dCBvbiBjb2xvcidcbiAgICB9LFxuICAgIG1heENhcmRpbmFsaXR5Rm9yU2hhcGU6IHtcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgIGRlZmF1bHQ6IDYsXG4gICAgICBkZXNjcmlwdGlvbjogJ21heGltdW0gY2FyZGluYWxpdHkgb2YgYW4gb3JkaW5hbCBmaWVsZCB0byBiZSBwdXQgb24gc2hhcGUnXG4gICAgfSxcbiAgICBvbWl0VHJhbnBvc2U6ICB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgZGVzY3JpcHRpb246ICdFbGltaW5hdGUgYWxsIHRyYW5zcG9zZSBieSAoMSkga2VlcGluZyBob3Jpem9udGFsIGRvdCBwbG90IG9ubHkgKDIpIGZvciBPeFEgY2hhcnRzLCBhbHdheXMgcHV0IE8gb24gWSAoMykgc2hvdyBvbmx5IG9uZSBEeEQsIE14TSAoY3VycmVudGx5IHNvcnRlZCBieSBuYW1lKSdcbiAgICB9LFxuICAgIG9taXREb3RQbG90OiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAncmVtb3ZlIGFsbCBkb3QgcGxvdHMnXG4gICAgfSxcbiAgICBvbWl0RG90UGxvdFdpdGhFeHRyYUVuY29kaW5nOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgZGVzY3JpcHRpb246ICdyZW1vdmUgYWxsIGRvdCBwbG90cyB3aXRoID4xIGVuY29kaW5nJ1xuICAgIH0sXG4gICAgb21pdE11bHRpcGxlUmV0aW5hbEVuY29kaW5nczoge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnb21pdCB1c2luZyBtdWx0aXBsZSByZXRpbmFsIHZhcmlhYmxlcyAoc2l6ZSwgY29sb3IsIGFscGhhLCBzaGFwZSknXG4gICAgfSxcbiAgICBvbWl0Tm9uVGV4dEFnZ3JXaXRoQWxsRGltc09uRmFjZXRzOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgZGVzY3JpcHRpb246ICdyZW1vdmUgYWxsIGFnZ3JlZ2F0ZWQgY2hhcnRzIChleGNlcHQgdGV4dCB0YWJsZXMpIHdpdGggYWxsIGRpbXMgb24gZmFjZXRzIChyb3csIGNvbCknXG4gICAgfSxcbiAgICBvbWl0U2l6ZU9uQmFyOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnZG8gbm90IHVzZSBiYXJcXCdzIHNpemUnXG4gICAgfSxcbiAgICBvbWl0U3RhY2tlZEF2ZXJhZ2U6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ2RvIG5vdCBzdGFjayBiYXIgY2hhcnQgd2l0aCBhdmVyYWdlJ1xuICAgIH0sXG4gICAgYWx3YXlzR2VuZXJhdGVUYWJsZUFzSGVhdG1hcDoge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH1cbiAgfVxufTtcblxuXG5cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHZsID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cudmwgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLnZsIDogbnVsbCk7XG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpLFxuICBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKTtcblxudmFyIEFOWT0nKic7XG5cbm1vZHVsZS5leHBvcnRzID0gZ2VuQWdncmVnYXRlcztcblxuZnVuY3Rpb24gZ2VuQWdncmVnYXRlcyhvdXRwdXQsIGZpZWxkcywgc3RhdHMsIG9wdCkge1xuICBvcHQgPSB2bC5zY2hlbWEudXRpbC5leHRlbmQob3B0fHx7fSwgY29uc3RzLmdlbi5hZ2dyZWdhdGVzKTtcbiAgdmFyIHRmID0gbmV3IEFycmF5KGZpZWxkcy5sZW5ndGgpO1xuICB2YXIgaGFzTyA9IHZsLmFueShmaWVsZHMsIGZ1bmN0aW9uKGYpIHtcbiAgICByZXR1cm4gZi50eXBlID09PSAnTyc7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGVtaXQoZmllbGRTZXQpIHtcbiAgICBmaWVsZFNldCA9IHZsLmR1cGxpY2F0ZShmaWVsZFNldCk7XG4gICAgZmllbGRTZXQua2V5ID0gdmwuZmllbGQuc2hvcnRoYW5kcyhmaWVsZFNldCk7XG4gICAgb3V0cHV0LnB1c2goZmllbGRTZXQpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tBbmRQdXNoKCkge1xuICAgIGlmIChvcHQub21pdE1lYXN1cmVPbmx5IHx8IG9wdC5vbWl0RGltZW5zaW9uT25seSkge1xuICAgICAgdmFyIGhhc01lYXN1cmUgPSBmYWxzZSwgaGFzRGltZW5zaW9uID0gZmFsc2UsIGhhc1JhdyA9IGZhbHNlO1xuICAgICAgdGYuZm9yRWFjaChmdW5jdGlvbihmKSB7XG4gICAgICAgIGlmICh2bC5maWVsZC5pc0RpbWVuc2lvbihmKSkge1xuICAgICAgICAgIGhhc0RpbWVuc2lvbiA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaGFzTWVhc3VyZSA9IHRydWU7XG4gICAgICAgICAgaWYgKCFmLmFnZ3IpIGhhc1JhdyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaWYgKCFoYXNEaW1lbnNpb24gJiYgIWhhc1JhdyAmJiBvcHQub21pdE1lYXN1cmVPbmx5KSByZXR1cm47XG4gICAgICBpZiAoIWhhc01lYXN1cmUpIHtcbiAgICAgICAgaWYgKG9wdC5hZGRDb3VudEZvckRpbWVuc2lvbk9ubHkpIHtcbiAgICAgICAgICB0Zi5wdXNoKHZsLmZpZWxkLmNvdW50KCkpO1xuICAgICAgICAgIGVtaXQodGYpO1xuICAgICAgICAgIHRmLnBvcCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHQub21pdERpbWVuc2lvbk9ubHkpIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG9wdC5vbWl0RG90UGxvdCAmJiB0Zi5sZW5ndGggPT09IDEpIHJldHVybjtcbiAgICBlbWl0KHRmKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFzc2lnbkFnZ3JRKGksIGhhc0FnZ3IsIGF1dG9Nb2RlLCBhKSB7XG4gICAgdmFyIGNhbkhhdmVBZ2dyID0gaGFzQWdnciA9PT0gdHJ1ZSB8fCBoYXNBZ2dyID09PSBudWxsLFxuICAgICAgY2FudEhhdmVBZ2dyID0gaGFzQWdnciA9PT0gZmFsc2UgfHwgaGFzQWdnciA9PT0gbnVsbDtcbiAgICBpZiAoYSkge1xuICAgICAgaWYgKGNhbkhhdmVBZ2dyKSB7XG4gICAgICAgIHRmW2ldLmFnZ3IgPSBhO1xuICAgICAgICBhc3NpZ25GaWVsZChpICsgMSwgdHJ1ZSwgYXV0b01vZGUpO1xuICAgICAgICBkZWxldGUgdGZbaV0uYWdncjtcbiAgICAgIH1cbiAgICB9IGVsc2UgeyAvLyBpZihhID09PSB1bmRlZmluZWQpXG4gICAgICBpZiAoY2FudEhhdmVBZ2dyKSB7XG4gICAgICAgIGFzc2lnbkZpZWxkKGkgKyAxLCBmYWxzZSwgYXV0b01vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGFzc2lnbkJpblEoaSwgaGFzQWdnciwgYXV0b01vZGUpIHtcbiAgICB0ZltpXS5iaW4gPSB0cnVlO1xuICAgIGFzc2lnbkZpZWxkKGkgKyAxLCBoYXNBZ2dyLCBhdXRvTW9kZSk7XG4gICAgZGVsZXRlIHRmW2ldLmJpbjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFzc2lnblEoaSwgaGFzQWdnciwgYXV0b01vZGUpIHtcbiAgICB2YXIgZiA9IGZpZWxkc1tpXSxcbiAgICAgIGNhbkhhdmVBZ2dyID0gaGFzQWdnciA9PT0gdHJ1ZSB8fCBoYXNBZ2dyID09PSBudWxsO1xuXG4gICAgdGZbaV0gPSB7bmFtZTogZi5uYW1lLCB0eXBlOiBmLnR5cGV9O1xuXG4gICAgaWYgKGYuYWdnciA9PT0gJ2NvdW50JykgeyAvLyBpZiBjb3VudCBpcyBpbmNsdWRlZCBpbiB0aGUgc2VsZWN0ZWQgZmllbGRzXG4gICAgICBpZiAoY2FuSGF2ZUFnZ3IpIHtcbiAgICAgICAgdGZbaV0uYWdnciA9IGYuYWdncjtcbiAgICAgICAgYXNzaWduRmllbGQoaSArIDEsIHRydWUsIGF1dG9Nb2RlKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGYuX2FnZ3IpIHtcbiAgICAgIC8vIFRPRE8gc3VwcG9ydCBhcnJheSBvZiBmLl9hZ2dycyB0b29cbiAgICAgIGFzc2lnbkFnZ3JRKGksIGhhc0FnZ3IsIGF1dG9Nb2RlLCBmLl9hZ2dyKTtcbiAgICB9IGVsc2UgaWYgKGYuX3Jhdykge1xuICAgICAgYXNzaWduQWdnclEoaSwgaGFzQWdnciwgYXV0b01vZGUsIHVuZGVmaW5lZCk7XG4gICAgfSBlbHNlIGlmIChmLl9iaW4pIHtcbiAgICAgIGFzc2lnbkJpblEoaSwgaGFzQWdnciwgYXV0b01vZGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvcHQuYWdnckxpc3QuZm9yRWFjaChmdW5jdGlvbihhKSB7XG4gICAgICAgIGlmICghb3B0LmNvbnNpc3RlbnRBdXRvUSB8fCBhdXRvTW9kZSA9PT0gQU5ZIHx8IGF1dG9Nb2RlID09PSBhKSB7XG4gICAgICAgICAgYXNzaWduQWdnclEoaSwgaGFzQWdnciwgYSAvKmFzc2lnbiBhdXRvTW9kZSovLCBhKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmICgoIW9wdC5jb25zaXN0ZW50QXV0b1EgfHwgdmwuaXNpbihhdXRvTW9kZSwgW0FOWSwgJ2JpbicsICdjYXN0JywgJ2F1dG9jYXN0J10pKSAmJiAhaGFzTykge1xuICAgICAgICB2YXIgaGlnaENhcmRpbmFsaXR5ID0gdmwuZmllbGQuY2FyZGluYWxpdHkoZiwgc3RhdHMpID4gb3B0Lm1pbkNhcmRpbmFsaXR5Rm9yQmluO1xuXG4gICAgICAgIHZhciBpc0F1dG8gPSBvcHQuZ2VuRGltUSA9PT0gJ2F1dG8nLFxuICAgICAgICAgIGdlbkJpbiA9IG9wdC5nZW5EaW1RICA9PT0gJ2JpbicgfHwgKGlzQXV0byAmJiBoaWdoQ2FyZGluYWxpdHkpLFxuICAgICAgICAgIGdlbkNhc3QgPSBvcHQuZ2VuRGltUSA9PT0gJ2Nhc3QnIHx8IChpc0F1dG8gJiYgIWhpZ2hDYXJkaW5hbGl0eSk7XG5cbiAgICAgICAgaWYgKGdlbkJpbiAmJiB2bC5pc2luKGF1dG9Nb2RlLCBbQU5ZLCAnYmluJywgJ2F1dG9jYXN0J10pKSB7XG4gICAgICAgICAgYXNzaWduQmluUShpLCBoYXNBZ2dyLCBpc0F1dG8gPyAnYXV0b2Nhc3QnIDogJ2JpbicpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChnZW5DYXN0ICYmIHZsLmlzaW4oYXV0b01vZGUsIFtBTlksICdjYXN0JywgJ2F1dG9jYXN0J10pKSB7XG4gICAgICAgICAgdGZbaV0udHlwZSA9ICdPJztcbiAgICAgICAgICBhc3NpZ25GaWVsZChpICsgMSwgaGFzQWdnciwgaXNBdXRvID8gJ2F1dG9jYXN0JyA6ICdjYXN0Jyk7XG4gICAgICAgICAgdGZbaV0udHlwZSA9ICdRJztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGFzc2lnbkZuVChpLCBoYXNBZ2dyLCBhdXRvTW9kZSwgZm4pIHtcbiAgICB0ZltpXS5mbiA9IGZuO1xuICAgIGFzc2lnbkZpZWxkKGkrMSwgaGFzQWdnciwgYXV0b01vZGUpO1xuICAgIGRlbGV0ZSB0ZltpXS5mbjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFzc2lnblQoaSwgaGFzQWdnciwgYXV0b01vZGUpIHtcbiAgICB2YXIgZiA9IGZpZWxkc1tpXTtcbiAgICB0ZltpXSA9IHtuYW1lOiBmLm5hbWUsIHR5cGU6IGYudHlwZX07XG5cbiAgICAvLyBUT0RPIHN1cHBvcnQgYXJyYXkgb2YgZi5fZm5zXG4gICAgaWYgKGYuX2ZuKSB7XG4gICAgICBhc3NpZ25GblQoaSwgaGFzQWdnciwgYXV0b01vZGUsIGYuX2ZuKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3B0LnRpbWVGbkxpc3QuZm9yRWFjaChmdW5jdGlvbihmbikge1xuICAgICAgICBpZiAoZm4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGlmICghaGFzQWdncikgeyAvLyBjYW4ndCBhZ2dyZWdhdGUgb3ZlciByYXcgdGltZVxuICAgICAgICAgICAgYXNzaWduRmllbGQoaSsxLCBmYWxzZSwgYXV0b01vZGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhc3NpZ25GblQoaSwgaGFzQWdnciwgYXV0b01vZGUsIGZuKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gRklYTUUgd2hhdCBpZiB5b3UgYWdncmVnYXRlIHRpbWU/XG4gIH1cblxuICBmdW5jdGlvbiBhc3NpZ25GaWVsZChpLCBoYXNBZ2dyLCBhdXRvTW9kZSkge1xuICAgIGlmIChpID09PSBmaWVsZHMubGVuZ3RoKSB7IC8vIElmIGFsbCBmaWVsZHMgYXJlIGFzc2lnbmVkXG4gICAgICBjaGVja0FuZFB1c2goKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgZiA9IGZpZWxkc1tpXTtcbiAgICAvLyBPdGhlcndpc2UsIGFzc2lnbiBpLXRoIGZpZWxkXG4gICAgc3dpdGNoIChmLnR5cGUpIHtcbiAgICAgIC8vVE9ETyBcIkRcIiwgXCJHXCJcbiAgICAgIGNhc2UgJ1EnOlxuICAgICAgICBhc3NpZ25RKGksIGhhc0FnZ3IsIGF1dG9Nb2RlKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ1QnOlxuICAgICAgICBhc3NpZ25UKGksIGhhc0FnZ3IsIGF1dG9Nb2RlKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ08nOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGZbaV0gPSBmO1xuICAgICAgICBhc3NpZ25GaWVsZChpICsgMSwgaGFzQWdnciwgYXV0b01vZGUpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICB2YXIgaGFzQWdnciA9IG9wdC50YWJsZVR5cGVzID09PSAnYWdncmVnYXRlZCcgPyB0cnVlIDogb3B0LnRhYmxlVHlwZXMgPT09ICdkaXNhZ2dyZWdhdGVkJyA/IGZhbHNlIDogbnVsbDtcbiAgYXNzaWduRmllbGQoMCwgaGFzQWdnciwgQU5ZKTtcblxuICByZXR1cm4gb3V0cHV0O1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdmwgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy52bCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwudmwgOiBudWxsKSxcbiAgZ2VuRW5jcyA9IHJlcXVpcmUoJy4vZW5jcycpLFxuICBnZXRNYXJrdHlwZXMgPSByZXF1aXJlKCcuL21hcmt0eXBlcycpLFxuICByYW5rID0gcmVxdWlyZSgnLi4vcmFuay9yYW5rJyksXG4gIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdlbkVuY29kaW5nc0Zyb21GaWVsZHM7XG5cbmZ1bmN0aW9uIGdlbkVuY29kaW5nc0Zyb21GaWVsZHMob3V0cHV0LCBmaWVsZHMsIHN0YXRzLCBvcHQsIG5lc3RlZCkge1xuICBvcHQgPSB2bC5zY2hlbWEudXRpbC5leHRlbmQob3B0fHx7fSwgY29uc3RzLmdlbi5lbmNvZGluZ3MpO1xuICB2YXIgZW5jcyA9IGdlbkVuY3MoW10sIGZpZWxkcywgc3RhdHMsIG9wdCk7XG5cbiAgaWYgKG5lc3RlZCkge1xuICAgIHJldHVybiBlbmNzLnJlZHVjZShmdW5jdGlvbihkaWN0LCBlbmMpIHtcbiAgICAgIGRpY3RbZW5jXSA9IGdlbkVuY29kaW5nc0Zyb21FbmNzKFtdLCBlbmMsIHN0YXRzLCBvcHQpO1xuICAgICAgcmV0dXJuIGRpY3Q7XG4gICAgfSwge30pO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBlbmNzLnJlZHVjZShmdW5jdGlvbihsaXN0LCBlbmMpIHtcbiAgICAgIHJldHVybiBnZW5FbmNvZGluZ3NGcm9tRW5jcyhsaXN0LCBlbmMsIHN0YXRzLCBvcHQpO1xuICAgIH0sIFtdKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZW5FbmNvZGluZ3NGcm9tRW5jcyhvdXRwdXQsIGVuYywgc3RhdHMsIG9wdCkge1xuICBnZXRNYXJrdHlwZXMoZW5jLCBzdGF0cywgb3B0KVxuICAgIC5mb3JFYWNoKGZ1bmN0aW9uKG1hcmtUeXBlKSB7XG4gICAgICB2YXIgZSA9IHZsLmR1cGxpY2F0ZSh7XG4gICAgICAgICAgZGF0YTogb3B0LmRhdGEsXG4gICAgICAgICAgbWFya3R5cGU6IG1hcmtUeXBlLFxuICAgICAgICAgIGVuYzogZW5jLFxuICAgICAgICAgIGNvbmZpZzogb3B0LmNvbmZpZ1xuICAgICAgICB9KSxcbiAgICAgICAgZW5jb2RpbmcgPSBmaW5hbFRvdWNoKGUsIHN0YXRzLCBvcHQpLFxuICAgICAgICBzY29yZSA9IHJhbmsuZW5jb2RpbmcoZW5jb2RpbmcsIHN0YXRzLCBvcHQpO1xuXG4gICAgICBlbmNvZGluZy5zY29yZSA9IHNjb3JlLnNjb3JlO1xuICAgICAgZW5jb2Rpbmcuc2NvcmVGZWF0dXJlcyA9IHNjb3JlLmZlYXR1cmVzO1xuICAgICAgb3V0cHV0LnB1c2goZW5jb2RpbmcpO1xuICAgIH0pO1xuICByZXR1cm4gb3V0cHV0O1xufVxuXG4vL0ZJWE1FIHRoaXMgc2hvdWxkIGJlIHJlZmFjdG9yc1xuZnVuY3Rpb24gZmluYWxUb3VjaChlbmNvZGluZywgc3RhdHMsIG9wdCkge1xuICBpZiAoZW5jb2RpbmcubWFya3R5cGUgPT09ICd0ZXh0JyAmJiBvcHQuYWx3YXlzR2VuZXJhdGVUYWJsZUFzSGVhdG1hcCkge1xuICAgIGVuY29kaW5nLmVuYy5jb2xvciA9IGVuY29kaW5nLmVuYy50ZXh0O1xuICB9XG5cbiAgLy8gZG9uJ3QgaW5jbHVkZSB6ZXJvIGlmIHN0ZGV2L2F2ZyA8IDAuMDFcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3V3ZGF0YS92aXNyZWMvaXNzdWVzLzY5XG4gIHZhciBlbmMgPSBlbmNvZGluZy5lbmM7XG4gIFsneCcsICd5J10uZm9yRWFjaChmdW5jdGlvbihldCkge1xuICAgIHZhciBmaWVsZCA9IGVuY1tldF07XG4gICAgaWYgKGZpZWxkICYmIHZsLmZpZWxkLmlzTWVhc3VyZShmaWVsZCkgJiYgIXZsLmZpZWxkLmlzQ291bnQoZmllbGQpKSB7XG4gICAgICB2YXIgc3RhdCA9IHN0YXRzW2ZpZWxkLm5hbWVdO1xuICAgICAgaWYgKHN0YXQuc3RkZXYgLyBzdGF0LmF2ZyA8IDAuMDEpIHtcbiAgICAgICAgZmllbGQuc2NhbGUgPSB7emVybzogZmFsc2V9O1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIHJldHVybiBlbmNvZGluZztcbn0iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHZsID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cudmwgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLnZsIDogbnVsbCksXG4gIGdsb2JhbHMgPSByZXF1aXJlKCcuLi9nbG9iYWxzJyksXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyksXG4gIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpLFxuICBnZW5NYXJrVHlwZXMgPSByZXF1aXJlKCcuL21hcmt0eXBlcycpLFxuICBpc0RpbWVuc2lvbiA9IHZsLmZpZWxkLmlzRGltZW5zaW9uLFxuICBpc01lYXN1cmUgPSB2bC5maWVsZC5pc01lYXN1cmU7XG5cbm1vZHVsZS5leHBvcnRzID0gZ2VuRW5jcztcblxuLy8gRklYTUUgcmVtb3ZlIGRpbWVuc2lvbiwgbWVhc3VyZSBhbmQgdXNlIGluZm9ybWF0aW9uIGluIHZlZ2FsaXRlIGluc3RlYWQhXG52YXIgcnVsZXMgPSB7XG4gIHg6IHtcbiAgICBkaW1lbnNpb246IHRydWUsXG4gICAgbWVhc3VyZTogdHJ1ZSxcbiAgICBtdWx0aXBsZTogdHJ1ZSAvL0ZJWE1FIHNob3VsZCBhbGxvdyBtdWx0aXBsZSBvbmx5IGZvciBRLCBUXG4gIH0sXG4gIHk6IHtcbiAgICBkaW1lbnNpb246IHRydWUsXG4gICAgbWVhc3VyZTogdHJ1ZSxcbiAgICBtdWx0aXBsZTogdHJ1ZSAvL0ZJWE1FIHNob3VsZCBhbGxvdyBtdWx0aXBsZSBvbmx5IGZvciBRLCBUXG4gIH0sXG4gIHJvdzoge1xuICAgIGRpbWVuc2lvbjogdHJ1ZSxcbiAgICBtdWx0aXBsZTogdHJ1ZVxuICB9LFxuICBjb2w6IHtcbiAgICBkaW1lbnNpb246IHRydWUsXG4gICAgbXVsdGlwbGU6IHRydWVcbiAgfSxcbiAgc2hhcGU6IHtcbiAgICBkaW1lbnNpb246IHRydWUsXG4gICAgcnVsZXM6IHNoYXBlUnVsZXNcbiAgfSxcbiAgc2l6ZToge1xuICAgIG1lYXN1cmU6IHRydWUsXG4gICAgcnVsZXM6IHJldGluYWxFbmNSdWxlc1xuICB9LFxuICBjb2xvcjoge1xuICAgIGRpbWVuc2lvbjogdHJ1ZSxcbiAgICBtZWFzdXJlOiB0cnVlLFxuICAgIHJ1bGVzOiBjb2xvclJ1bGVzXG4gIH0sXG4gIGFscGhhOiB7XG4gICAgbWVhc3VyZTogdHJ1ZSxcbiAgICBydWxlczogcmV0aW5hbEVuY1J1bGVzXG4gIH0sXG4gIHRleHQ6IHtcbiAgICBtZWFzdXJlOiB0cnVlXG4gIH0sXG4gIGRldGFpbDoge1xuICAgIGRpbWVuc2lvbjogdHJ1ZVxuICB9XG4gIC8vZ2VvOiB7XG4gIC8vICBnZW86IHRydWVcbiAgLy99LFxuICAvL2FyYzogeyAvLyBwaWVcbiAgLy9cbiAgLy99XG59O1xuXG5mdW5jdGlvbiByZXRpbmFsRW5jUnVsZXMoZW5jLCBmaWVsZCwgc3RhdHMsIG9wdCkge1xuICBpZiAob3B0Lm9taXRNdWx0aXBsZVJldGluYWxFbmNvZGluZ3MpIHtcbiAgICBpZiAoZW5jLmNvbG9yIHx8IGVuYy5zaXplIHx8IGVuYy5zaGFwZSB8fCBlbmMuYWxwaGEpIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gY29sb3JSdWxlcyhlbmMsIGZpZWxkLCBzdGF0cywgb3B0KSB7XG4gIGlmKCFyZXRpbmFsRW5jUnVsZXMoZW5jLCBmaWVsZCwgc3RhdHMsIG9wdCkpIHJldHVybiBmYWxzZTtcblxuICByZXR1cm4gdmwuZmllbGQuaXNNZWFzdXJlKGZpZWxkKSB8fFxuICAgIHZsLmZpZWxkLmNhcmRpbmFsaXR5KGZpZWxkLCBzdGF0cykgPD0gb3B0Lm1heENhcmRpbmFsaXR5Rm9yQ29sb3I7XG59XG5cbmZ1bmN0aW9uIHNoYXBlUnVsZXMoZW5jLCBmaWVsZCwgc3RhdHMsIG9wdCkge1xuICBpZighcmV0aW5hbEVuY1J1bGVzKGVuYywgZmllbGQsIHN0YXRzLCBvcHQpKSByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGZpZWxkLmJpbiAmJiBmaWVsZC50eXBlID09PSAnUScpIHJldHVybiBmYWxzZTtcbiAgaWYgKGZpZWxkLmZuICYmIGZpZWxkLnR5cGUgPT09ICdUJykgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gdmwuZmllbGQuY2FyZGluYWxpdHkoZmllbGQsIHN0YXRzKSA8PSBvcHQubWF4Q2FyZGluYWxpdHlGb3JDb2xvcjtcbn1cblxuZnVuY3Rpb24gZGltTWVhVHJhbnNwb3NlUnVsZShlbmMpIHtcbiAgLy8gY3JlYXRlIGhvcml6b250YWwgaGlzdG9ncmFtIGZvciBvcmRpbmFsXG4gIGlmIChlbmMueS50eXBlID09PSAnTycgJiYgaXNNZWFzdXJlKGVuYy54KSkgcmV0dXJuIHRydWU7XG5cbiAgLy8gdmVydGljYWwgaGlzdG9ncmFtIGZvciBRIGFuZCBUXG4gIGlmIChpc01lYXN1cmUoZW5jLnkpICYmIChlbmMueC50eXBlICE9PSAnTycgJiYgaXNEaW1lbnNpb24oZW5jLngpKSkgcmV0dXJuIHRydWU7XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBnZW5lcmFsUnVsZXMoZW5jLCBzdGF0cywgb3B0KSB7XG4gIC8vIGVuYy50ZXh0IGlzIG9ubHkgdXNlZCBmb3IgVEVYVCBUQUJMRVxuICBpZiAoZW5jLnRleHQpIHtcbiAgICByZXR1cm4gZ2VuTWFya1R5cGVzLnNhdGlzZnlSdWxlcyhlbmMsICd0ZXh0Jywgc3RhdHMsIG9wdCk7XG4gIH1cblxuICAvLyBDQVJURVNJQU4gUExPVCBPUiBNQVBcbiAgaWYgKGVuYy54IHx8IGVuYy55IHx8IGVuYy5nZW8gfHwgZW5jLmFyYykge1xuXG4gICAgaWYgKGVuYy5yb3cgfHwgZW5jLmNvbCkgeyAvL2hhdmUgZmFjZXQocylcblxuICAgICAgLy8gZG9uJ3QgdXNlIGZhY2V0cyBiZWZvcmUgZmlsbGluZyB1cCB4LHlcbiAgICAgIGlmICghZW5jLnggfHwgIWVuYy55KSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIGlmIChvcHQub21pdE5vblRleHRBZ2dyV2l0aEFsbERpbXNPbkZhY2V0cykge1xuICAgICAgICAvLyByZW1vdmUgYWxsIGFnZ3JlZ2F0ZWQgY2hhcnRzIHdpdGggYWxsIGRpbXMgb24gZmFjZXRzIChyb3csIGNvbClcbiAgICAgICAgaWYgKGdlbkVuY3MuaXNBZ2dyV2l0aEFsbERpbU9uRmFjZXRzKGVuYykpIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZW5jLnggJiYgZW5jLnkpIHtcbiAgICAgIHZhciBpc0RpbVggPSAhIWlzRGltZW5zaW9uKGVuYy54KSxcbiAgICAgICAgaXNEaW1ZID0gISFpc0RpbWVuc2lvbihlbmMueSk7XG5cbiAgICAgIGlmIChpc0RpbVggJiYgaXNEaW1ZICYmICF2bC5lbmMuaXNBZ2dyZWdhdGUoZW5jKSkge1xuICAgICAgICAvLyBGSVhNRSBhY3R1YWxseSBjaGVjayBpZiB0aGVyZSB3b3VsZCBiZSBvY2NsdXNpb24gIzkwXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdC5vbWl0VHJhbnBvc2UpIHtcbiAgICAgICAgaWYgKGlzRGltWCBeIGlzRGltWSkgeyAvLyBkaW0geCBtZWFcbiAgICAgICAgICBpZiAoIWRpbU1lYVRyYW5zcG9zZVJ1bGUoZW5jKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKGVuYy55LnR5cGU9PT0nVCcgfHwgZW5jLngudHlwZSA9PT0gJ1QnKSB7XG4gICAgICAgICAgaWYgKGVuYy55LnR5cGU9PT0nVCcgJiYgZW5jLngudHlwZSAhPT0gJ1QnKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7IC8vIHNob3cgb25seSBvbmUgT3hPLCBReFFcbiAgICAgICAgICBpZiAoZW5jLngubmFtZSA+IGVuYy55Lm5hbWUpIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gRE9UIFBMT1RTXG4gICAgLy8gLy8gcGxvdCB3aXRoIG9uZSBheGlzID0gZG90IHBsb3RcbiAgICBpZiAob3B0Lm9taXREb3RQbG90KSByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBEb3QgcGxvdCBzaG91bGQgYWx3YXlzIGJlIGhvcml6b250YWxcbiAgICBpZiAob3B0Lm9taXRUcmFucG9zZSAmJiBlbmMueSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gZG90IHBsb3Qgc2hvdWxkbid0IGhhdmUgb3RoZXIgZW5jb2RpbmdcbiAgICBpZiAob3B0Lm9taXREb3RQbG90V2l0aEV4dHJhRW5jb2RpbmcgJiYgdmwua2V5cyhlbmMpLmxlbmd0aCA+IDEpIHJldHVybiBmYWxzZTtcblxuICAgIC8vIG9uZSBkaW1lbnNpb24gXCJjb3VudFwiIGlzIHVzZWxlc3NcbiAgICBpZiAoZW5jLnggJiYgZW5jLnguYWdnciA9PSAnY291bnQnICYmICFlbmMueSkgcmV0dXJuIGZhbHNlO1xuICAgIGlmIChlbmMueSAmJiBlbmMueS5hZ2dyID09ICdjb3VudCcgJiYgIWVuYy54KSByZXR1cm4gZmFsc2U7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmdlbkVuY3MuaXNBZ2dyV2l0aEFsbERpbU9uRmFjZXRzID0gZnVuY3Rpb24gKGVuYykge1xuICB2YXIgaGFzQWdnciA9IGZhbHNlLCBoYXNPdGhlck8gPSBmYWxzZTtcbiAgZm9yICh2YXIgZW5jVHlwZSBpbiBlbmMpIHtcbiAgICB2YXIgZmllbGQgPSBlbmNbZW5jVHlwZV07XG4gICAgaWYgKGZpZWxkLmFnZ3IpIHtcbiAgICAgIGhhc0FnZ3IgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAodmwuZmllbGQuaXNEaW1lbnNpb24oZmllbGQpICYmIChlbmNUeXBlICE9PSAncm93JyAmJiBlbmNUeXBlICE9PSAnY29sJykpIHtcbiAgICAgIGhhc090aGVyTyA9IHRydWU7XG4gICAgfVxuICAgIGlmIChoYXNBZ2dyICYmIGhhc090aGVyTykgYnJlYWs7XG4gIH1cblxuICByZXR1cm4gaGFzQWdnciAmJiAhaGFzT3RoZXJPO1xufTtcblxuXG5mdW5jdGlvbiBnZW5FbmNzKGVuY3MsIGZpZWxkcywgc3RhdHMsIG9wdCkge1xuICBvcHQgPSB2bC5zY2hlbWEudXRpbC5leHRlbmQob3B0fHx7fSwgY29uc3RzLmdlbi5lbmNvZGluZ3MpO1xuICAvLyBnZW5lcmF0ZSBhIGNvbGxlY3Rpb24gdmVnYWxpdGUncyBlbmNcbiAgdmFyIHRtcEVuYyA9IHt9O1xuXG4gIGZ1bmN0aW9uIGFzc2lnbkZpZWxkKGkpIHtcbiAgICAvLyBJZiBhbGwgZmllbGRzIGFyZSBhc3NpZ25lZCwgc2F2ZVxuICAgIGlmIChpID09PSBmaWVsZHMubGVuZ3RoKSB7XG4gICAgICAvLyBhdCB0aGUgbWluaW1hbCBhbGwgY2hhcnQgc2hvdWxkIGhhdmUgeCwgeSwgZ2VvLCB0ZXh0IG9yIGFyY1xuICAgICAgaWYgKGdlbmVyYWxSdWxlcyh0bXBFbmMsIHN0YXRzLCBvcHQpKSB7XG4gICAgICAgIGVuY3MucHVzaCh2bC5kdXBsaWNhdGUodG1wRW5jKSk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gT3RoZXJ3aXNlLCBhc3NpZ24gaS10aCBmaWVsZFxuICAgIHZhciBmaWVsZCA9IGZpZWxkc1tpXTtcbiAgICBmb3IgKHZhciBqIGluIG9wdC5lbmNvZGluZ1R5cGVMaXN0KSB7XG4gICAgICB2YXIgZXQgPSBvcHQuZW5jb2RpbmdUeXBlTGlzdFtqXSxcbiAgICAgICAgaXNEaW0gPSBpc0RpbWVuc2lvbihmaWVsZCk7XG5cbiAgICAgIC8vVE9ETzogc3VwcG9ydCBcIm11bHRpcGxlXCIgYXNzaWdubWVudFxuICAgICAgaWYgKCEoZXQgaW4gdG1wRW5jKSAmJiAvLyBlbmNvZGluZyBub3QgdXNlZFxuICAgICAgICAoKGlzRGltICYmIHJ1bGVzW2V0XS5kaW1lbnNpb24pIHx8ICghaXNEaW0gJiYgcnVsZXNbZXRdLm1lYXN1cmUpKSAmJlxuICAgICAgICAoIXJ1bGVzW2V0XS5ydWxlcyB8fCBydWxlc1tldF0ucnVsZXModG1wRW5jLCBmaWVsZCwgc3RhdHMsIG9wdCkpXG4gICAgICApIHtcbiAgICAgICAgdG1wRW5jW2V0XSA9IGZpZWxkO1xuICAgICAgICBhc3NpZ25GaWVsZChpICsgMSk7XG4gICAgICAgIGRlbGV0ZSB0bXBFbmNbZXRdO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFzc2lnbkZpZWxkKDApO1xuXG4gIHJldHVybiBlbmNzO1xufVxuIiwidmFyIHZsID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cudmwgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLnZsIDogbnVsbCksXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cbnZhciBnZW4gPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgLy8gZGF0YSB2YXJpYXRpb25zXG4gIGFnZ3JlZ2F0ZXM6IHJlcXVpcmUoJy4vYWdncmVnYXRlcycpLFxuICBwcm9qZWN0aW9uczogcmVxdWlyZSgnLi9wcm9qZWN0aW9ucycpLFxuICAvLyBlbmNvZGluZ3MgLyB2aXN1YWwgdmFyaWF0b25zXG4gIGVuY29kaW5nczogcmVxdWlyZSgnLi9lbmNvZGluZ3MnKSxcbiAgZW5jczogcmVxdWlyZSgnLi9lbmNzJyksXG4gIG1hcmt0eXBlczogcmVxdWlyZSgnLi9tYXJrdHlwZXMnKVxufTtcblxuLy9GSVhNRSBtb3ZlIHRoZXNlIHRvIHZsXG52YXIgQUdHUkVHQVRJT05fRk4gPSB7IC8vYWxsIHBvc3NpYmxlIGFnZ3JlZ2F0ZSBmdW5jdGlvbiBsaXN0ZWQgYnkgZWFjaCBkYXRhIHR5cGVcbiAgUTogdmwuc2NoZW1hLmFnZ3Iuc3VwcG9ydGVkRW51bXMuUVxufTtcblxudmFyIFRSQU5TRk9STV9GTiA9IHsgLy9hbGwgcG9zc2libGUgdHJhbnNmb3JtIGZ1bmN0aW9uIGxpc3RlZCBieSBlYWNoIGRhdGEgdHlwZVxuICAvLyBROiBbJ2xvZycsICdzcXJ0JywgJ2FicyddLCAvLyBcImxvZ2l0P1wiXG4gIFQ6IHZsLnNjaGVtYS50aW1lZm5zXG59O1xuXG5nZW4uY2hhcnRzID0gZnVuY3Rpb24oZmllbGRzLCBvcHQsIGNmZywgZmxhdCkge1xuICBvcHQgPSB1dGlsLmdlbi5nZXRPcHQob3B0KTtcbiAgZmxhdCA9IGZsYXQgPT09IHVuZGVmaW5lZCA/IHtlbmNvZGluZ3M6IDF9IDogZmxhdDtcblxuICAvLyBUT0RPIGdlbmVyYXRlXG5cbiAgLy8gZ2VuZXJhdGUgcGVybXV0YXRpb24gb2YgZW5jb2RpbmcgbWFwcGluZ3NcbiAgdmFyIGZpZWxkU2V0cyA9IG9wdC5nZW5BZ2dyID8gZ2VuLmFnZ3JlZ2F0ZXMoW10sIGZpZWxkcywgb3B0KSA6IFtmaWVsZHNdLFxuICAgIGVuY3MsIGNoYXJ0cywgbGV2ZWwgPSAwO1xuXG4gIGlmIChmbGF0ID09PSB0cnVlIHx8IChmbGF0ICYmIGZsYXQuYWdncikpIHtcbiAgICBlbmNzID0gZmllbGRTZXRzLnJlZHVjZShmdW5jdGlvbihvdXRwdXQsIGZpZWxkcykge1xuICAgICAgcmV0dXJuIGdlbi5lbmNzKG91dHB1dCwgZmllbGRzLCBvcHQpO1xuICAgIH0sIFtdKTtcbiAgfSBlbHNlIHtcbiAgICBlbmNzID0gZmllbGRTZXRzLm1hcChmdW5jdGlvbihmaWVsZHMpIHtcbiAgICAgIHJldHVybiBnZW4uZW5jcyhbXSwgZmllbGRzLCBvcHQpO1xuICAgIH0sIHRydWUpO1xuICAgIGxldmVsICs9IDE7XG4gIH1cblxuICBpZiAoZmxhdCA9PT0gdHJ1ZSB8fCAoZmxhdCAmJiBmbGF0LmVuY29kaW5ncykpIHtcbiAgICBjaGFydHMgPSB1dGlsLm5lc3RlZFJlZHVjZShlbmNzLCBmdW5jdGlvbihvdXRwdXQsIGVuYykge1xuICAgICAgcmV0dXJuIGdlbi5tYXJrdHlwZXMob3V0cHV0LCBlbmMsIG9wdCwgY2ZnKTtcbiAgICB9LCBsZXZlbCwgdHJ1ZSk7XG4gIH0gZWxzZSB7XG4gICAgY2hhcnRzID0gdXRpbC5uZXN0ZWRNYXAoZW5jcywgZnVuY3Rpb24oZW5jKSB7XG4gICAgICByZXR1cm4gZ2VuLm1hcmt0eXBlcyhbXSwgZW5jLCBvcHQsIGNmZyk7XG4gICAgfSwgbGV2ZWwsIHRydWUpO1xuICAgIGxldmVsICs9IDE7XG4gIH1cbiAgcmV0dXJuIGNoYXJ0cztcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciB2bCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LnZsIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC52bCA6IG51bGwpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpLFxuICBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKSxcbiAgaXNEaW1lbnNpb24gPSB2bC5maWVsZC5pc0RpbWVuc2lvbixcbiAgaXNPcmRpbmFsU2NhbGUgPSB2bC5maWVsZC5pc09yZGluYWxTY2FsZTtcblxudmFyIHZsbWFya3R5cGVzID0gbW9kdWxlLmV4cG9ydHMgPSBnZXRNYXJrdHlwZXM7XG5cbnZhciBtYXJrc1J1bGUgPSB2bG1hcmt0eXBlcy5ydWxlID0ge1xuICBwb2ludDogIHBvaW50UnVsZSxcbiAgYmFyOiAgICBiYXJSdWxlLFxuICBsaW5lOiAgIGxpbmVSdWxlLFxuICBhcmVhOiAgIGFyZWFSdWxlLCAvLyBhcmVhIGlzIHNpbWlsYXIgdG8gbGluZVxuICB0ZXh0OiAgIHRleHRSdWxlLFxuICB0aWNrOiAgIHRpY2tSdWxlXG59O1xuXG5mdW5jdGlvbiBnZXRNYXJrdHlwZXMoZW5jLCBzdGF0cywgb3B0KSB7XG4gIG9wdCA9IHZsLnNjaGVtYS51dGlsLmV4dGVuZChvcHR8fHt9LCBjb25zdHMuZ2VuLmVuY29kaW5ncyk7XG5cbiAgdmFyIG1hcmtUeXBlcyA9IG9wdC5tYXJrdHlwZUxpc3QuZmlsdGVyKGZ1bmN0aW9uKG1hcmtUeXBlKXtcbiAgICByZXR1cm4gdmxtYXJrdHlwZXMuc2F0aXNmeVJ1bGVzKGVuYywgbWFya1R5cGUsIHN0YXRzLCBvcHQpO1xuICB9KTtcblxuICByZXR1cm4gbWFya1R5cGVzO1xufVxuXG52bG1hcmt0eXBlcy5zYXRpc2Z5UnVsZXMgPSBmdW5jdGlvbiAoZW5jLCBtYXJrVHlwZSwgc3RhdHMsIG9wdCkge1xuICB2YXIgbWFyayA9IHZsLmNvbXBpbGUubWFya3NbbWFya1R5cGVdLFxuICAgIHJlcXMgPSBtYXJrLnJlcXVpcmVkRW5jb2RpbmcsXG4gICAgc3VwcG9ydCA9IG1hcmsuc3VwcG9ydGVkRW5jb2Rpbmc7XG5cbiAgZm9yICh2YXIgaSBpbiByZXFzKSB7IC8vIGFsbCByZXF1aXJlZCBlbmNvZGluZ3MgaW4gZW5jXG4gICAgaWYgKCEocmVxc1tpXSBpbiBlbmMpKSByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmb3IgKHZhciBlbmNUeXBlIGluIGVuYykgeyAvLyBhbGwgZW5jb2RpbmdzIGluIGVuYyBhcmUgc3VwcG9ydGVkXG4gICAgaWYgKCFzdXBwb3J0W2VuY1R5cGVdKSByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gIW1hcmtzUnVsZVttYXJrVHlwZV0gfHwgbWFya3NSdWxlW21hcmtUeXBlXShlbmMsIHN0YXRzLCBvcHQpO1xufTtcblxuZnVuY3Rpb24gZmFjZXRSdWxlKGZpZWxkLCBzdGF0cywgb3B0KSB7XG4gIHJldHVybiB2bC5maWVsZC5jYXJkaW5hbGl0eShmaWVsZCwgc3RhdHMpIDw9IG9wdC5tYXhDYXJkaW5hbGl0eUZvckZhY2V0cztcbn1cblxuZnVuY3Rpb24gZmFjZXRzUnVsZShlbmMsIHN0YXRzLCBvcHQpIHtcbiAgaWYoZW5jLnJvdyAmJiAhZmFjZXRSdWxlKGVuYy5yb3csIHN0YXRzLCBvcHQpKSByZXR1cm4gZmFsc2U7XG4gIGlmKGVuYy5jb2wgJiYgIWZhY2V0UnVsZShlbmMuY29sLCBzdGF0cywgb3B0KSkgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gcG9pbnRSdWxlKGVuYywgc3RhdHMsIG9wdCkge1xuICBpZighZmFjZXRzUnVsZShlbmMsIHN0YXRzLCBvcHQpKSByZXR1cm4gZmFsc2U7XG4gIGlmIChlbmMueCAmJiBlbmMueSkge1xuICAgIC8vIGhhdmUgYm90aCB4ICYgeSA9PT4gc2NhdHRlciBwbG90IC8gYnViYmxlIHBsb3RcblxuICAgIHZhciB4SXNEaW0gPSBpc0RpbWVuc2lvbihlbmMueCksXG4gICAgICB5SXNEaW0gPSBpc0RpbWVuc2lvbihlbmMueSk7XG5cbiAgICAvLyBGb3IgT3hPXG4gICAgaWYgKHhJc0RpbSAmJiB5SXNEaW0pIHtcbiAgICAgIC8vIHNoYXBlIGRvZXNuJ3Qgd29yayB3aXRoIGJvdGggeCwgeSBhcyBvcmRpbmFsXG4gICAgICBpZiAoZW5jLnNoYXBlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gVE9ETyhrYW5pdHcpOiBjaGVjayB0aGF0IHRoZXJlIGlzIHF1YW50IGF0IGxlYXN0IC4uLlxuICAgICAgaWYgKGVuYy5jb2xvciAmJiBpc0RpbWVuc2lvbihlbmMuY29sb3IpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfSBlbHNlIHsgLy8gcGxvdCB3aXRoIG9uZSBheGlzID0gZG90IHBsb3RcbiAgICBpZiAob3B0Lm9taXREb3RQbG90KSByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBEb3QgcGxvdCBzaG91bGQgYWx3YXlzIGJlIGhvcml6b250YWxcbiAgICBpZiAob3B0Lm9taXRUcmFucG9zZSAmJiBlbmMueSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gZG90IHBsb3Qgc2hvdWxkbid0IGhhdmUgb3RoZXIgZW5jb2RpbmdcbiAgICBpZiAob3B0Lm9taXREb3RQbG90V2l0aEV4dHJhRW5jb2RpbmcgJiYgdmwua2V5cyhlbmMpLmxlbmd0aCA+IDEpIHJldHVybiBmYWxzZTtcblxuICAgIC8vIGRvdCBwbG90IHdpdGggc2hhcGUgaXMgbm9uLXNlbnNlXG4gICAgaWYgKGVuYy5zaGFwZSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiB0aWNrUnVsZShlbmMsIHN0YXRzLCBvcHQpIHtcbiAgaWYgKGVuYy54IHx8IGVuYy55KSB7XG4gICAgaWYodmwuZW5jLmlzQWdncmVnYXRlKGVuYykpIHJldHVybiBmYWxzZTtcblxuICAgIHZhciB4SXNEaW0gPSBpc0RpbWVuc2lvbihlbmMueCksXG4gICAgICB5SXNEaW0gPSBpc0RpbWVuc2lvbihlbmMueSk7XG5cbiAgICByZXR1cm4gKCF4SXNEaW0gJiYgKCFlbmMueSB8fCBpc09yZGluYWxTY2FsZShlbmMueSkpKSB8fFxuICAgICAgKCF5SXNEaW0gJiYgKCFlbmMueCB8fCBpc09yZGluYWxTY2FsZShlbmMueCkpKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGJhclJ1bGUoZW5jLCBzdGF0cywgb3B0KSB7XG4gIGlmKCFmYWNldHNSdWxlKGVuYywgc3RhdHMsIG9wdCkpIHJldHVybiBmYWxzZTtcblxuICAvLyBuZWVkIHRvIGFnZ3JlZ2F0ZSBvbiBlaXRoZXIgeCBvciB5XG4gIGlmIChvcHQub21pdFNpemVPbkJhciAmJiBlbmMuc2l6ZSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gZmFsc2U7XG5cbiAgLy8gRklYTUUgYWN0dWFsbHkgY2hlY2sgaWYgdGhlcmUgd291bGQgYmUgb2NjbHVzaW9uICM5MFxuICBpZiAoKChlbmMueC5hZ2dyICE9PSB1bmRlZmluZWQpIF4gKGVuYy55LmFnZ3IgIT09IHVuZGVmaW5lZCkpICYmXG4gICAgICAoaXNEaW1lbnNpb24oZW5jLngpIF4gaXNEaW1lbnNpb24oZW5jLnkpKSkge1xuXG4gICAgdmFyIGFnZ3IgPSBlbmMueC5hZ2dyIHx8IGVuYy55LmFnZ3I7XG4gICAgcmV0dXJuICEob3B0Lm9taXRTdGFja2VkQXZlcmFnZSAmJiBhZ2dyID09PSdhdmcnICYmIGVuYy5jb2xvcik7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGxpbmVSdWxlKGVuYywgc3RhdHMsIG9wdCkge1xuICBpZighZmFjZXRzUnVsZShlbmMsIHN0YXRzLCBvcHQpKSByZXR1cm4gZmFsc2U7XG5cbiAgLy8gVE9ETyhrYW5pdHcpOiBhZGQgb21pdFZlcnRpY2FsTGluZSBhcyBjb25maWdcblxuICAvLyBGSVhNRSB0cnVseSBvcmRpbmFsIGRhdGEgaXMgZmluZSBoZXJlIHRvby5cbiAgLy8gTGluZSBjaGFydCBzaG91bGQgYmUgb25seSBob3Jpem9udGFsXG4gIC8vIGFuZCB1c2Ugb25seSB0ZW1wb3JhbCBkYXRhXG4gIHJldHVybiBlbmMueC50eXBlID09ICdUJyAmJiBlbmMueC5mbiAmJiBlbmMueS50eXBlID09ICdRJyAmJiBlbmMueS5hZ2dyO1xufVxuXG5mdW5jdGlvbiBhcmVhUnVsZShlbmMsIHN0YXRzLCBvcHQpIHtcbiAgaWYoIWZhY2V0c1J1bGUoZW5jLCBzdGF0cywgb3B0KSkgcmV0dXJuIGZhbHNlO1xuXG4gIGlmKCFsaW5lUnVsZShlbmMsIHN0YXRzLCBvcHQpKSByZXR1cm4gZmFsc2U7XG5cbiAgcmV0dXJuICEob3B0Lm9taXRTdGFja2VkQXZlcmFnZSAmJiBlbmMueS5hZ2dyID09PSdhdmcnICYmIGVuYy5jb2xvcik7XG59XG5cbmZ1bmN0aW9uIHRleHRSdWxlKGVuYywgc3RhdHMsIG9wdCkge1xuICAvLyBhdCBsZWFzdCBtdXN0IGhhdmUgcm93IG9yIGNvbCBhbmQgYWdncmVnYXRlZCB0ZXh0IHZhbHVlc1xuICByZXR1cm4gKGVuYy5yb3cgfHwgZW5jLmNvbCkgJiYgZW5jLnRleHQgJiYgZW5jLnRleHQuYWdnciAmJiAhZW5jLnggJiYgIWVuYy55ICYmICFlbmMuc2l6ZSAmJlxuICAgICghb3B0LmFsd2F5c0dlbmVyYXRlVGFibGVBc0hlYXRtYXAgfHwgIWVuYy5jb2xvcik7XG59IiwidmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyksXG4gIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpLFxuICB2bCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LnZsIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC52bCA6IG51bGwpLFxuICBpc0RpbWVuc2lvbiA9IHZsLmZpZWxkLmlzRGltZW5zaW9uO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHByb2plY3Rpb25zO1xuXG4vLyBUT0RPIHN1cHBvcnQgb3RoZXIgbW9kZSBvZiBwcm9qZWN0aW9ucyBnZW5lcmF0aW9uXG4vLyBwb3dlcnNldCwgY2hvb3NlSywgY2hvb3NlS29yTGVzcyBhcmUgYWxyZWFkeSBpbmNsdWRlZCBpbiB0aGUgdXRpbFxuXG4vKipcbiAqIGZpZWxkc1xuICogQHBhcmFtICB7W3R5cGVdfSBmaWVsZHMgYXJyYXkgb2YgZmllbGRzIGFuZCBxdWVyeSBpbmZvcm1hdGlvblxuICogQHJldHVybiB7W3R5cGVdfSAgICAgICAgW2Rlc2NyaXB0aW9uXVxuICovXG5mdW5jdGlvbiBwcm9qZWN0aW9ucyhmaWVsZHMsIHN0YXRzLCBvcHQpIHtcbiAgb3B0ID0gdmwuc2NoZW1hLnV0aWwuZXh0ZW5kKG9wdHx8e30sIGNvbnN0cy5nZW4ucHJvamVjdGlvbnMpO1xuXG4gIC8vIEZpcnN0IGNhdGVnb3JpemUgZmllbGQsIHNlbGVjdGVkLCBmaWVsZHNUb0FkZCwgYW5kIHNhdmUgaW5kaWNlc1xuICB2YXIgc2VsZWN0ZWQgPSBbXSwgZmllbGRzVG9BZGQgPSBbXSwgZmllbGRTZXRzID0gW10sXG4gICAgaGFzU2VsZWN0ZWREaW1lbnNpb24gPSBmYWxzZSxcbiAgICBoYXNTZWxlY3RlZE1lYXN1cmUgPSBmYWxzZSxcbiAgICBpbmRpY2VzID0ge307XG5cbiAgZmllbGRzLmZvckVhY2goZnVuY3Rpb24oZmllbGQsIGluZGV4KXtcbiAgICAvL3NhdmUgaW5kaWNlcyBmb3Igc3RhYmxlIHNvcnQgbGF0ZXJcbiAgICBpbmRpY2VzW2ZpZWxkLm5hbWVdID0gaW5kZXg7XG5cbiAgICBpZiAoZmllbGQuc2VsZWN0ZWQpIHtcbiAgICAgIHNlbGVjdGVkLnB1c2goZmllbGQpO1xuICAgICAgaWYgKGlzRGltZW5zaW9uKGZpZWxkKSB8fCBmaWVsZC50eXBlID09PSdUJykgeyAvLyBGSVhNRSAvIEhBQ0tcbiAgICAgICAgaGFzU2VsZWN0ZWREaW1lbnNpb24gPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaGFzU2VsZWN0ZWRNZWFzdXJlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGZpZWxkLnNlbGVjdGVkICE9PSBmYWxzZSAmJiAhdmwuZmllbGQuaXNDb3VudChmaWVsZCkpIHtcbiAgICAgIGlmICh2bC5maWVsZC5pc0RpbWVuc2lvbihmaWVsZCkgJiZcbiAgICAgICAgICAhb3B0Lm1heENhcmRpbmFsaXR5Rm9yQXV0b0FkZE9yZGluYWwgJiZcbiAgICAgICAgICB2bC5maWVsZC5jYXJkaW5hbGl0eShmaWVsZCwgc3RhdHMsIDE1KSA+IG9wdC5tYXhDYXJkaW5hbGl0eUZvckF1dG9BZGRPcmRpbmFsXG4gICAgICAgICkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBmaWVsZHNUb0FkZC5wdXNoKGZpZWxkKTtcbiAgICB9XG4gIH0pO1xuXG4gIGZpZWxkc1RvQWRkLnNvcnQoY29tcGFyZUZpZWxkc1RvQWRkKGhhc1NlbGVjdGVkRGltZW5zaW9uLCBoYXNTZWxlY3RlZE1lYXN1cmUsIGluZGljZXMpKTtcblxuICB2YXIgc2V0c1RvQWRkID0gdXRpbC5jaG9vc2VLb3JMZXNzKGZpZWxkc1RvQWRkLCAxKTtcblxuICBzZXRzVG9BZGQuZm9yRWFjaChmdW5jdGlvbihzZXRUb0FkZCkge1xuICAgIHZhciBmaWVsZFNldCA9IHNlbGVjdGVkLmNvbmNhdChzZXRUb0FkZCk7XG4gICAgaWYgKGZpZWxkU2V0Lmxlbmd0aCA+IDApIHtcbiAgICAgIGlmIChvcHQub21pdERvdFBsb3QgJiYgZmllbGRTZXQubGVuZ3RoID09PSAxKSByZXR1cm47XG4gICAgICBmaWVsZFNldHMucHVzaChmaWVsZFNldCk7XG4gICAgfVxuICB9KTtcblxuICBmaWVsZFNldHMuZm9yRWFjaChmdW5jdGlvbihmaWVsZFNldCkge1xuICAgICAgLy8gYWx3YXlzIGFwcGVuZCBwcm9qZWN0aW9uJ3Mga2V5IHRvIGVhY2ggcHJvamVjdGlvbiByZXR1cm5lZCwgZDMgc3R5bGUuXG4gICAgZmllbGRTZXQua2V5ID0gcHJvamVjdGlvbnMua2V5KGZpZWxkU2V0KTtcbiAgfSk7XG5cbiAgcmV0dXJuIGZpZWxkU2V0cztcbn1cblxudmFyIHR5cGVJc01lYXN1cmVTY29yZSA9IHtcbiAgTzogMCxcbiAgVDogMSxcbiAgUTogMlxufTtcblxuZnVuY3Rpb24gY29tcGFyZUZpZWxkc1RvQWRkKGhhc1NlbGVjdGVkRGltZW5zaW9uLCBoYXNTZWxlY3RlZE1lYXN1cmUsIGluZGljZXMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGEsIGIpe1xuICAgIHZhciBhSXNEaW0gPSBpc0RpbWVuc2lvbihhKSwgYklzRGltID0gaXNEaW1lbnNpb24oYik7XG4gICAgLy8gc29ydCBieSB0eXBlIG9mIHRoZSBkYXRhXG4gICAgaWYgKGEudHlwZSAhPT0gYi50eXBlKSB7XG4gICAgICBpZiAoIWhhc1NlbGVjdGVkRGltZW5zaW9uKSB7XG4gICAgICAgIHJldHVybiB0eXBlSXNNZWFzdXJlU2NvcmVbYS50eXBlXSAtIHR5cGVJc01lYXN1cmVTY29yZVtiLnR5cGVdO1xuICAgICAgfSBlbHNlIGlmICghaGFzU2VsZWN0ZWRNZWFzdXJlKSB7XG4gICAgICAgIHJldHVybiB0eXBlSXNNZWFzdXJlU2NvcmVbYi50eXBlXSAtIHR5cGVJc01lYXN1cmVTY29yZVthLnR5cGVdO1xuICAgICAgfVxuICAgIH1cbiAgICAvL21ha2UgdGhlIHNvcnQgc3RhYmxlXG4gICAgcmV0dXJuIGluZGljZXNbYS5uYW1lXSAtIGluZGljZXNbYi5uYW1lXTtcbiAgfTtcbn1cblxucHJvamVjdGlvbnMua2V5ID0gZnVuY3Rpb24ocHJvamVjdGlvbikge1xuICByZXR1cm4gcHJvamVjdGlvbi5tYXAoZnVuY3Rpb24oZmllbGQpIHtcbiAgICByZXR1cm4gdmwuZmllbGQuaXNDb3VudChmaWVsZCkgPyAnY291bnQnIDogZmllbGQubmFtZTtcbiAgfSkuam9pbignLCcpO1xufTtcblxuIiwidmFyIGcgPSBnbG9iYWwgfHwgd2luZG93O1xuXG5nLkNIQVJUX1RZUEVTID0ge1xuICBUQUJMRTogJ1RBQkxFJyxcbiAgQkFSOiAnQkFSJyxcbiAgUExPVDogJ1BMT1QnLFxuICBMSU5FOiAnTElORScsXG4gIEFSRUE6ICdBUkVBJyxcbiAgTUFQOiAnTUFQJyxcbiAgSElTVE9HUkFNOiAnSElTVE9HUkFNJ1xufTtcblxuZy5BTllfREFUQV9UWVBFUyA9ICgxIDw8IDQpIC0gMTsiLCJ2YXIgcmFuayA9IG1vZHVsZS5leHBvcnRzID0ge1xuICBlbmNvZGluZzogcmVxdWlyZSgnLi9yYW5rRW5jb2RpbmdzJylcbn07XG5cblxuIiwidmFyIHZsID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cudmwgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLnZsIDogbnVsbCksXG4gIGlzRGltZW5zaW9uID0gdmwuZmllbGQuaXNEaW1lbnNpb247XG5cbm1vZHVsZS5leHBvcnRzID0gcmFua0VuY29kaW5ncztcblxuLy8gYmFkIHNjb3JlIG5vdCBzcGVjaWZpZWQgaW4gdGhlIHRhYmxlIGFib3ZlXG52YXIgVU5VU0VEX1BPU0lUSU9OID0gMC41O1xuXG52YXIgTUFSS19TQ09SRSA9IHtcbiAgbGluZTogMC45OSxcbiAgYXJlYTogMC45OCxcbiAgYmFyOiAwLjk3LFxuICB0aWNrOiAwLjk2LFxuICBwb2ludDogMC45NSxcbiAgY2lyY2xlOiAwLjk0LFxuICBzcXVhcmU6IDAuOTQsXG4gIHRleHQ6IDAuOFxufTtcblxuZnVuY3Rpb24gcmFua0VuY29kaW5ncyhlbmNvZGluZywgc3RhdHMsIG9wdCwgc2VsZWN0ZWQpIHtcbiAgdmFyIGZlYXR1cmVzID0gW10sXG4gICAgZW5jVHlwZXMgPSB2bC5rZXlzKGVuY29kaW5nLmVuYyksXG4gICAgbWFya3R5cGUgPSBlbmNvZGluZy5tYXJrdHlwZSxcbiAgICBlbmMgPSBlbmNvZGluZy5lbmM7XG5cbiAgdmFyIGVuY29kaW5nTWFwcGluZ0J5RmllbGQgPSB2bC5lbmMucmVkdWNlKGVuY29kaW5nLmVuYywgZnVuY3Rpb24obywgZmllbGQsIGVuY1R5cGUpIHtcbiAgICB2YXIga2V5ID0gdmwuZmllbGQuc2hvcnRoYW5kKGZpZWxkKTtcbiAgICB2YXIgbWFwcGluZ3MgPSBvW2tleV0gPSBvW2tleV0gfHwgW107XG4gICAgbWFwcGluZ3MucHVzaCh7ZW5jVHlwZTogZW5jVHlwZSwgZmllbGQ6IGZpZWxkfSk7XG4gICAgcmV0dXJuIG87XG4gIH0sIHt9KTtcblxuICAvLyBkYXRhIC0gZW5jb2RpbmcgbWFwcGluZyBzY29yZVxuICB2bC5mb3JFYWNoKGVuY29kaW5nTWFwcGluZ0J5RmllbGQsIGZ1bmN0aW9uKG1hcHBpbmdzKSB7XG4gICAgdmFyIHJlYXNvbnMgPSBtYXBwaW5ncy5tYXAoZnVuY3Rpb24obSkge1xuICAgICAgICByZXR1cm4gbS5lbmNUeXBlICsgdmwuc2hvcnRoYW5kLmFzc2lnbiArIHZsLmZpZWxkLnNob3J0aGFuZChtLmZpZWxkKSArXG4gICAgICAgICAgJyAnICsgKHNlbGVjdGVkICYmIHNlbGVjdGVkW20uZmllbGQubmFtZV0gPyAnW3hdJyA6ICdbIF0nKTtcbiAgICAgIH0pLFxuICAgICAgc2NvcmVzID0gbWFwcGluZ3MubWFwKGZ1bmN0aW9uKG0pIHtcbiAgICAgICAgdmFyIHJvbGUgPSB2bC5maWVsZC5yb2xlKG0uZmllbGQpO1xuICAgICAgICB2YXIgc2NvcmUgPSByYW5rRW5jb2RpbmdzLnNjb3JlW3JvbGVdKG0uZmllbGQsIG0uZW5jVHlwZSwgZW5jb2RpbmcubWFya3R5cGUsIHN0YXRzLCBvcHQpO1xuXG4gICAgICAgIHJldHVybiAhc2VsZWN0ZWQgfHwgc2VsZWN0ZWRbbS5maWVsZC5uYW1lXSA/IHNjb3JlIDogTWF0aC5wb3coc2NvcmUsIDAuMTI1KTtcbiAgICAgIH0pO1xuXG4gICAgZmVhdHVyZXMucHVzaCh7XG4gICAgICByZWFzb246IHJlYXNvbnMuam9pbihcIiB8IFwiKSxcbiAgICAgIHNjb3JlOiBNYXRoLm1heC5hcHBseShudWxsLCBzY29yZXMpXG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIHBsb3QgdHlwZVxuICBpZiAobWFya3R5cGUgPT09ICd0ZXh0Jykge1xuICAgIC8vIFRPRE9cbiAgfSBlbHNlIHtcbiAgICBpZiAoZW5jLnggJiYgZW5jLnkpIHtcbiAgICAgIGlmIChpc0RpbWVuc2lvbihlbmMueCkgXiBpc0RpbWVuc2lvbihlbmMueSkpIHtcbiAgICAgICAgZmVhdHVyZXMucHVzaCh7XG4gICAgICAgICAgcmVhc29uOiAnT3hRIHBsb3QnLFxuICAgICAgICAgIHNjb3JlOiAwLjhcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gcGVuYWxpemUgbm90IHVzaW5nIHBvc2l0aW9uYWwgb25seSBwZW5hbGl6ZSBmb3Igbm9uLXRleHRcbiAgaWYgKGVuY1R5cGVzLmxlbmd0aCA+IDEgJiYgbWFya3R5cGUgIT09ICd0ZXh0Jykge1xuICAgIGlmICgoIWVuYy54IHx8ICFlbmMueSkgJiYgIWVuYy5nZW8gJiYgIWVuYy50ZXh0KSB7XG4gICAgICBmZWF0dXJlcy5wdXNoKHtcbiAgICAgICAgcmVhc29uOiAndW51c2VkIHBvc2l0aW9uJyxcbiAgICAgICAgc2NvcmU6IFVOVVNFRF9QT1NJVElPTlxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLy8gbWFyayB0eXBlIHNjb3JlXG4gIGZlYXR1cmVzLnB1c2goe1xuICAgIHJlYXNvbjogJ21hcmt0eXBlPScrbWFya3R5cGUsXG4gICAgc2NvcmU6IE1BUktfU0NPUkVbbWFya3R5cGVdXG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgc2NvcmU6IGZlYXR1cmVzLnJlZHVjZShmdW5jdGlvbihwLCBmKSB7XG4gICAgICByZXR1cm4gcCAqIGYuc2NvcmU7XG4gICAgfSwgMSksXG4gICAgZmVhdHVyZXM6IGZlYXR1cmVzXG4gIH07XG59XG5cblxudmFyIEQgPSB7fSwgTSA9IHt9LCBCQUQgPSAwLjEsIFRFUlJJQkxFID0gMC4wMTtcblxuRC5taW5vciA9IDAuMDE7XG5ELnBvcyA9IDE7XG5ELllfVCA9IDAuODtcbkQuZmFjZXRfdGV4dCA9IDE7XG5ELmZhY2V0X2dvb2QgPSAwLjY3NTsgLy8gPCBjb2xvcl9vaywgPiBjb2xvcl9iYWRcbkQuZmFjZXRfb2sgPSAwLjU1O1xuRC5mYWNldF9iYWQgPSAwLjQ7XG5ELmNvbG9yX2dvb2QgPSAwLjc7XG5ELmNvbG9yX29rID0gMC42NTsgLy8gPiBNLlNpemVcbkQuY29sb3JfYmFkID0gMC4zO1xuRC5jb2xvcl9zdGFjayA9IDAuNjtcbkQuc2hhcGUgPSAwLjY7XG5ELmRldGFpbCA9IDAuNTtcbkQuYmFkID0gQkFEO1xuRC50ZXJyaWJsZSA9IFRFUlJJQkxFO1xuXG5NLnBvcyA9IDE7XG5NLnNpemUgPSAwLjY7XG5NLmNvbG9yID0gMC41O1xuTS5hbHBoYSA9IDAuNDU7XG5NLnRleHQgPSAwLjQ7XG5NLmJhZCA9IEJBRDtcbk0udGVycmlibGUgPSBURVJSSUJMRTtcblxucmFua0VuY29kaW5ncy5kaW1lbnNpb25TY29yZSA9IGZ1bmN0aW9uIChmaWVsZCwgZW5jVHlwZSwgbWFya3R5cGUsIHN0YXRzLCBvcHQpe1xuICB2YXIgY2FyZGluYWxpdHkgPSB2bC5maWVsZC5jYXJkaW5hbGl0eShmaWVsZCwgc3RhdHMpO1xuICBzd2l0Y2ggKGVuY1R5cGUpIHtcbiAgICBjYXNlICd4JzpcbiAgICAgIGlmKGZpZWxkLnR5cGUgPT09ICdPJykgcmV0dXJuIEQucG9zIC0gRC5taW5vcjtcbiAgICAgIHJldHVybiBELnBvcztcblxuICAgIGNhc2UgJ3knOlxuICAgICAgaWYoZmllbGQudHlwZSA9PT0gJ08nKSByZXR1cm4gRC5wb3MgLSBELm1pbm9yOyAvL3ByZWZlciBvcmRpbmFsIG9uIHlcbiAgICAgIGlmKGZpZWxkLnR5cGUgPT09ICdUJykgcmV0dXJuIEQuWV9UOyAvLyB0aW1lIHNob3VsZCBub3QgYmUgb24gWVxuICAgICAgcmV0dXJuIEQucG9zIC0gRC5taW5vcjtcblxuICAgIGNhc2UgJ2NvbCc6XG4gICAgICBpZiAobWFya3R5cGUgPT09ICd0ZXh0JykgcmV0dXJuIEQuZmFjZXRfdGV4dDtcbiAgICAgIC8vcHJlZmVyIGNvbHVtbiBvdmVyIHJvdyBkdWUgdG8gc2Nyb2xsaW5nIGlzc3Vlc1xuICAgICAgcmV0dXJuIGNhcmRpbmFsaXR5IDw9IG9wdC5tYXhHb29kQ2FyZGluYWxpdHlGb3JGYWNldHMgPyBELmZhY2V0X2dvb2QgOlxuICAgICAgICBjYXJkaW5hbGl0eSA8PSBvcHQubWF4Q2FyZGluYWxpdHlGb3JGYWNldHMgPyBELmZhY2V0X29rIDogRC5mYWNldF9iYWQ7XG5cbiAgICBjYXNlICdyb3cnOlxuICAgICAgaWYgKG1hcmt0eXBlID09PSAndGV4dCcpIHJldHVybiBELmZhY2V0X3RleHQ7XG4gICAgICByZXR1cm4gKGNhcmRpbmFsaXR5IDw9IG9wdC5tYXhHb29kQ2FyZGluYWxpdHlGb3JGYWNldHMgPyBELmZhY2V0X2dvb2QgOlxuICAgICAgICBjYXJkaW5hbGl0eSA8PSBvcHQubWF4Q2FyZGluYWxpdHlGb3JGYWNldHMgPyBELmZhY2V0X29rIDogRC5mYWNldF9iYWQpIC0gRC5taW5vcjtcblxuICAgIGNhc2UgJ2NvbG9yJzpcbiAgICAgIHZhciBoYXNPcmRlciA9IChmaWVsZC5iaW4gJiYgZmllbGQudHlwZT09PSdRJykgfHwgKGZpZWxkLmZuICYmIGZpZWxkLnR5cGU9PT0nVCcpO1xuXG4gICAgICAvL0ZJWE1FIGFkZCBzdGFja2luZyBvcHRpb24gb25jZSB3ZSBoYXZlIGNvbnRyb2wgLi5cbiAgICAgIHZhciBpc1N0YWNrZWQgPSBtYXJrdHlwZSA9PT0nYmFyJyB8fCBtYXJrdHlwZSA9PT0nYXJlYSc7XG5cbiAgICAgIC8vIHRydWUgb3JkaW5hbCBvbiBjb2xvciBpcyBjdXJyZW50bHkgQkFEICh1bnRpbCB3ZSBoYXZlIGdvb2Qgb3JkaW5hbCBjb2xvciBzY2FsZSBzdXBwb3J0KVxuICAgICAgaWYgKGhhc09yZGVyKSByZXR1cm4gRC5jb2xvcl9iYWQ7XG5cbiAgICAgIC8vc3RhY2tpbmcgZ2V0cyBsb3dlciBzY29yZVxuICAgICAgaWYgKGlzU3RhY2tlZCkgcmV0dXJuIEQuY29sb3Jfc3RhY2s7XG5cbiAgICAgIHJldHVybiBjYXJkaW5hbGl0eSA8PSBvcHQubWF4R29vZENhcmRpbmFsaXR5Rm9yQ29sb3IgPyBELmNvbG9yX2dvb2Q6IGNhcmRpbmFsaXR5IDw9IG9wdC5tYXhDYXJkaW5hbGl0eUZvckNvbG9yID8gRC5jb2xvcl9vayA6IEQuY29sb3JfYmFkO1xuICAgIGNhc2UgJ3NoYXBlJzpcbiAgICAgIHJldHVybiBjYXJkaW5hbGl0eSA8PSBvcHQubWF4Q2FyZGluYWxpdHlGb3JTaGFwZSA/IEQuc2hhcGUgOiBURVJSSUJMRTtcbiAgICBjYXNlICdkZXRhaWwnOlxuICAgICAgcmV0dXJuIEQuZGV0YWlsO1xuICB9XG4gIHJldHVybiBURVJSSUJMRTtcbn07XG5cbnJhbmtFbmNvZGluZ3MuZGltZW5zaW9uU2NvcmUuY29uc3RzID0gRDtcblxucmFua0VuY29kaW5ncy5tZWFzdXJlU2NvcmUgPSBmdW5jdGlvbiAoZmllbGQsIGVuY1R5cGUsIG1hcmt0eXBlLCBzdGF0cywgb3B0KSB7XG4gIHN3aXRjaCAoZW5jVHlwZSl7XG4gICAgY2FzZSAneCc6IHJldHVybiBNLnBvcztcbiAgICBjYXNlICd5JzogcmV0dXJuIE0ucG9zO1xuICAgIGNhc2UgJ3NpemUnOlxuICAgICAgaWYgKG1hcmt0eXBlID09PSAnYmFyJykgcmV0dXJuIEJBRDsgLy9zaXplIG9mIGJhciBpcyB2ZXJ5IGJhZFxuICAgICAgaWYgKG1hcmt0eXBlID09PSAndGV4dCcpIHJldHVybiBCQUQ7XG4gICAgICBpZiAobWFya3R5cGUgPT09ICdsaW5lJykgcmV0dXJuIEJBRDtcbiAgICAgIHJldHVybiBNLnNpemU7XG4gICAgY2FzZSAnY29sb3InOiByZXR1cm4gTS5jb2xvcjtcbiAgICBjYXNlICdhbHBoYSc6IHJldHVybiBNLmFscGhhO1xuICAgIGNhc2UgJ3RleHQnOiByZXR1cm4gTS50ZXh0O1xuICB9XG4gIHJldHVybiBCQUQ7XG59O1xuXG5yYW5rRW5jb2RpbmdzLm1lYXN1cmVTY29yZS5jb25zdHMgPSBNO1xuXG5cbnJhbmtFbmNvZGluZ3Muc2NvcmUgPSB7XG4gIGRpbWVuc2lvbjogcmFua0VuY29kaW5ncy5kaW1lbnNpb25TY29yZSxcbiAgbWVhc3VyZTogcmFua0VuY29kaW5ncy5tZWFzdXJlU2NvcmUsXG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBjb25zdHMgPSByZXF1aXJlKCcuL2NvbnN0cycpO1xuXG52YXIgdXRpbCA9IG1vZHVsZS5leHBvcnRzID0ge1xuICBnZW46IHt9XG59O1xuXG51dGlsLmlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgcmV0dXJuIHt9LnRvU3RyaW5nLmNhbGwob2JqKSA9PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxudXRpbC5qc29uID0gZnVuY3Rpb24ocywgc3ApIHtcbiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHMsIG51bGwsIHNwKTtcbn07XG5cbnV0aWwua2V5cyA9IGZ1bmN0aW9uKG9iaikge1xuICB2YXIgayA9IFtdLCB4O1xuICBmb3IgKHggaW4gb2JqKSBrLnB1c2goeCk7XG4gIHJldHVybiBrO1xufTtcblxudXRpbC5uZXN0ZWRNYXAgPSBmdW5jdGlvbiAoY29sLCBmLCBsZXZlbCwgZmlsdGVyKSB7XG4gIHJldHVybiBsZXZlbCA9PT0gMCA/XG4gICAgY29sLm1hcChmKSA6XG4gICAgY29sLm1hcChmdW5jdGlvbih2KSB7XG4gICAgICB2YXIgciA9IHV0aWwubmVzdGVkTWFwKHYsIGYsIGxldmVsIC0gMSk7XG4gICAgICByZXR1cm4gZmlsdGVyID8gci5maWx0ZXIodXRpbC5ub25FbXB0eSkgOiByO1xuICAgIH0pO1xufTtcblxudXRpbC5uZXN0ZWRSZWR1Y2UgPSBmdW5jdGlvbiAoY29sLCBmLCBsZXZlbCwgZmlsdGVyKSB7XG4gIHJldHVybiBsZXZlbCA9PT0gMCA/XG4gICAgY29sLnJlZHVjZShmLCBbXSkgOlxuICAgIGNvbC5tYXAoZnVuY3Rpb24odikge1xuICAgICAgdmFyIHIgPSB1dGlsLm5lc3RlZFJlZHVjZSh2LCBmLCBsZXZlbCAtIDEpO1xuICAgICAgcmV0dXJuIGZpbHRlciA/IHIuZmlsdGVyKHV0aWwubm9uRW1wdHkpIDogcjtcbiAgICB9KTtcbn07XG5cbnV0aWwubm9uRW1wdHkgPSBmdW5jdGlvbihncnApIHtcbiAgcmV0dXJuICF1dGlsLmlzQXJyYXkoZ3JwKSB8fCBncnAubGVuZ3RoID4gMDtcbn07XG5cblxudXRpbC50cmF2ZXJzZSA9IGZ1bmN0aW9uIChub2RlLCBhcnIpIHtcbiAgaWYgKG5vZGUudmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgIGFyci5wdXNoKG5vZGUudmFsdWUpO1xuICB9IGVsc2Uge1xuICAgIGlmIChub2RlLmxlZnQpIHV0aWwudHJhdmVyc2Uobm9kZS5sZWZ0LCBhcnIpO1xuICAgIGlmIChub2RlLnJpZ2h0KSB1dGlsLnRyYXZlcnNlKG5vZGUucmlnaHQsIGFycik7XG4gIH1cbiAgcmV0dXJuIGFycjtcbn07XG5cbnV0aWwudW5pb24gPSBmdW5jdGlvbiAoYSwgYikge1xuICB2YXIgbyA9IHt9O1xuICBhLmZvckVhY2goZnVuY3Rpb24oeCkgeyBvW3hdID0gdHJ1ZTt9KTtcbiAgYi5mb3JFYWNoKGZ1bmN0aW9uKHgpIHsgb1t4XSA9IHRydWU7fSk7XG4gIHJldHVybiB1dGlsLmtleXMobyk7XG59O1xuXG5cbnV0aWwuZ2VuLmdldE9wdCA9IGZ1bmN0aW9uIChvcHQpIHtcbiAgLy9tZXJnZSB3aXRoIGRlZmF1bHRcbiAgcmV0dXJuIChvcHQgPyB1dGlsLmtleXMob3B0KSA6IFtdKS5yZWR1Y2UoZnVuY3Rpb24oYywgaykge1xuICAgIGNba10gPSBvcHRba107XG4gICAgcmV0dXJuIGM7XG4gIH0sIE9iamVjdC5jcmVhdGUoY29uc3RzLmdlbi5ERUZBVUxUX09QVCkpO1xufTtcblxuLyoqXG4gKiBwb3dlcnNldCBjb2RlIGZyb20gaHR0cDovL3Jvc2V0dGFjb2RlLm9yZy93aWtpL1Bvd2VyX1NldCNKYXZhU2NyaXB0XG4gKlxuICogICB2YXIgcmVzID0gcG93ZXJzZXQoWzEsMiwzLDRdKTtcbiAqXG4gKiByZXR1cm5zXG4gKlxuICogW1tdLFsxXSxbMl0sWzEsMl0sWzNdLFsxLDNdLFsyLDNdLFsxLDIsM10sWzRdLFsxLDRdLFxuICogWzIsNF0sWzEsMiw0XSxbMyw0XSxbMSwzLDRdLFsyLDMsNF0sWzEsMiwzLDRdXVxuW2VkaXRdXG4qL1xuXG51dGlsLnBvd2Vyc2V0ID0gZnVuY3Rpb24obGlzdCkge1xuICB2YXIgcHMgPSBbXG4gICAgW11cbiAgXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgZm9yICh2YXIgaiA9IDAsIGxlbiA9IHBzLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICBwcy5wdXNoKHBzW2pdLmNvbmNhdChsaXN0W2ldKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBwcztcbn07XG5cbnV0aWwuY2hvb3NlS29yTGVzcyA9IGZ1bmN0aW9uKGxpc3QsIGspIHtcbiAgdmFyIHN1YnNldCA9IFtbXV07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIGZvciAodmFyIGogPSAwLCBsZW4gPSBzdWJzZXQubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgIHZhciBzdWIgPSBzdWJzZXRbal0uY29uY2F0KGxpc3RbaV0pO1xuICAgICAgaWYoc3ViLmxlbmd0aCA8PSBrKXtcbiAgICAgICAgc3Vic2V0LnB1c2goc3ViKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN1YnNldDtcbn07XG5cbnV0aWwuY2hvb3NlSyA9IGZ1bmN0aW9uKGxpc3QsIGspIHtcbiAgdmFyIHN1YnNldCA9IFtbXV07XG4gIHZhciBrQXJyYXkgPVtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICBmb3IgKHZhciBqID0gMCwgbGVuID0gc3Vic2V0Lmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICB2YXIgc3ViID0gc3Vic2V0W2pdLmNvbmNhdChsaXN0W2ldKTtcbiAgICAgIGlmKHN1Yi5sZW5ndGggPCBrKXtcbiAgICAgICAgc3Vic2V0LnB1c2goc3ViKTtcbiAgICAgIH1lbHNlIGlmIChzdWIubGVuZ3RoID09PSBrKXtcbiAgICAgICAga0FycmF5LnB1c2goc3ViKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGtBcnJheTtcbn07XG5cbnV0aWwuY3Jvc3MgPSBmdW5jdGlvbihhLGIpe1xuICB2YXIgeCA9IFtdO1xuICBmb3IodmFyIGk9MDsgaTwgYS5sZW5ndGg7IGkrKyl7XG4gICAgZm9yKHZhciBqPTA7ajwgYi5sZW5ndGg7IGorKyl7XG4gICAgICB4LnB1c2goYVtpXS5jb25jYXQoYltqXSkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4geDtcbn07XG5cbiJdfQ==
