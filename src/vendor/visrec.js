!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.vr=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var vr = module.exports = {
  cluster: require('./cluster/cluster'),
  gen: require('./gen/gen'),
  rank: require('./rank/rank'),
  util: require('./util')
};



},{"./cluster/cluster":2,"./gen/gen":9,"./rank/rank":13,"./util":14}],2:[function(require,module,exports){
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

},{"../util":14,"./clusterconsts":3,"./distancetable":4}],3:[function(require,module,exports){
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

},{"../util":14,"./clusterconsts":3}],5:[function(require,module,exports){
var consts = module.exports = {
  gen: {},
  cluster: {},
  rank: {}
};

consts.gen.projections = {
  type: 'object',
  properties: {
    addCountInProjection: {
      type: 'boolean',
      default: false
    },
    addCountIfNothingIsSelected: {
      type: 'boolean',
      default: false,
      description: 'When no field is selected, add extra count field'
    },
    //FIXME remove this!
    omitDotPlot: {
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

},{"../consts":5,"../util":14}],7:[function(require,module,exports){
(function (global){
'use strict';

var vl = (typeof window !== "undefined" ? window.vl : typeof global !== "undefined" ? global.vl : null),
  genEncs = require('./encs'),
  getMarktypes = require('./marktypes'),
  rank = require('../rank/rank'),
  consts = require('../consts');

module.exports = genEncodingsFromFields;

function genEncodingsFromFields(output, fields, stats, opt, cfg, nested) {
  var encs = genEncs([], fields, stats, opt);

  if (nested) {
    return encs.reduce(function(dict, enc) {
      dict[enc] = genEncodingsFromEncs([], enc, opt, cfg);
      return dict;
    }, {});
  } else {
    return encs.reduce(function(list, enc) {
      return genEncodingsFromEncs(list, enc, opt, cfg);
    }, []);
  }
}

function genEncodingsFromEncs(output, enc, opt, cfg) {
  getMarktypes(enc, opt)
    .forEach(function(markType) {
      var encoding = { marktype: markType, enc: enc, cfg: cfg },
        score = rank.encoding(encoding);
      encoding.score = score.score;
      encoding.scoreFeatures = score.features;
      output.push(encoding);
    });
  return output;
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
    dimension: true
  },
  size: {
    measure: true
  },
  color: {
    dimension: true,
    measure: true
  },
  alpha: {
    measure: true
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

function maxCardinality(field, stats) {
  return stats[field].cardinality <= 20;
}

function dimMeaTransposeRule(enc) {
  // create horizontal histogram for ordinal
  if (enc.y.type === 'O' && isMeasure(enc.x)) return true;

  // vertical histogram for Q and T
  if (isMeasure(enc.y) && (enc.x.type !== 'O' && isDimension(enc.x))) return true;

  return false;
}

function generalRules(enc, opt) {
  // enc.text is only used for TEXT TABLE
  if (enc.text) {
    return genMarkTypes.satisfyRules(enc, 'text', opt);
  }

  // CARTESIAN PLOT OR MAP
  if (enc.x || enc.y || enc.geo || enc.arc) {

    if (enc.row || enc.col) { //have facet(s)
      if (!enc.x || !enc.y) {
        return false; // don't use facets before filling up x,y
      }

      if (opt.omitNonTextAggrWithAllDimsOnFacets) {
        // remove all aggregated charts with all dims on facets (row, col)
        if (genEncs.isAggrWithAllDimOnFacets(enc)) return false;
      }
    }

    if (enc.x && enc.y) {
      if (opt.omitTranpose) {
        if (isDimension(enc.x) ^ isDimension(enc.y)) { // dim x mea
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
      if (generalRules(tmpEnc, opt)) {
        encs.push(vl.duplicate(tmpEnc));
      }
      return;
    }

    // Otherwise, assign i-th field
    var field = fields[i];
    for (var j in vl.encodingTypes) {
      var et = vl.encodingTypes[j],
        isDim = isDimension(field);

      //TODO: support "multiple" assignment
      if (!(et in tmpEnc) && // encoding not used
        ((isDim && rules[et].dimension) || (!isDim && rules[et].measure)) &&
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

},{"../consts":5,"../globals":12,"../util":14,"./marktypes":10}],9:[function(require,module,exports){
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

},{"../util":14,"./aggregates":6,"./encodings":7,"./encs":8,"./marktypes":10,"./projections":11}],10:[function(require,module,exports){
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
  area:   lineRule, // area is similar to line
  text:   textRule
};

function getMarktypes(enc, opt) {
  opt = vl.schema.util.extend(opt||{}, consts.gen.encodings);

  var markTypes = opt.marktypeList.filter(function(markType){
    return vlmarktypes.satisfyRules(enc, markType, opt);
  });

  //console.log('enc:', util.json(enc), " ~ marks:", markTypes);

  return markTypes;
}

vlmarktypes.satisfyRules = function (enc, markType, opt) {
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
};


function pointRule(enc, opt) {
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

function barRule(enc, opt) {
  // need to aggregate on either x or y

  if (opt.omitSizeOnBar && enc.size !== undefined) return false;

  if (((enc.x.aggr !== undefined) ^ (enc.y.aggr !== undefined)) &&
      (vl.field.isDimension(enc.x) ^ vl.field.isDimension(enc.y))) {

    return true;
  }

  return false;
}

function lineRule(enc, opt) {
  // TODO(kanitw): add omitVerticalLine as config

  // FIXME truly ordinal data is fine here too.
  // Line chart should be only horizontal
  // and use only temporal data
  return enc.x.type == 'T' && enc.x.fn && enc.y.type == 'Q' && enc.y.aggr;
}

function textRule(enc, opt) {
  // at least must have row or col and aggregated text values
  return (enc.row || enc.col) && enc.text && enc.text.aggr && !enc.x && !enc.y && !enc.color;
}
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../consts":5,"../util":14}],11:[function(require,module,exports){
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
function projections(fields, stats, opt) {
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

  unselected = unselected.filter(function(field){
    if(!opt.addCountInProjection && vl.field.isCount(field)) return false;
    //FIXME load maxbins value from somewhere else
    return (opt.alwaysAddHistogram && selected.length === 0) ||
      !(opt.maxCardinalityForAutoAddOrdinal &&
        vl.field.isDimension(field) &&
        vl.field.cardinality(field, stats, 15) > opt.maxCardinalityForAutoAddOrdinal);
  });

  if (opt.addCountInProjection) {
    // put count on top!
    unselected.sort(function(a, b){
      if(a.aggr==='count') return -1;
      if(b.aggr==='count') return 1;
      return 0;
    });
  }

  var setsToAdd = util.chooseKorLess(unselected, 1);

  setsToAdd.forEach(function(setToAdd) {
    var fieldSet = selected.concat(setToAdd);
    if (fieldSet.length > 0) {
      //single count field is useless
      if (fieldSet.length === 1 && vl.field.isCount(fieldSet[0])) {
        return;
      }

      if (opt.omitDotPlot && fieldSet.length === 1) return;

      fieldSets.push(fieldSet);
    }
  });

  if (opt.addCountInProjection && opt.addCountIfNothingIsSelected && selected.length===0) {
    var countField = vl.field.count();

    unselected.forEach(function(field) {
      if (!vl.field.isCount(field)) {
        fieldSets.push([field, countField]);
      }
    });
  }

  fieldSets.forEach(function(fieldSet) {
      // always append projection's key to each projection returned, d3 style.
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

},{"../consts":5,"../util":14}],12:[function(require,module,exports){
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
(function (global){
var vl = (typeof window !== "undefined" ? window.vl : typeof global !== "undefined" ? global.vl : null);

var rank = module.exports = {

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
    var field = encoding.enc[encType],
      role = encoding.enc[encType];

    features[field.name] = {
      value: encType + ':' + field.type,
      score: ENCODING_SCORE[field.type][encType] || BAD_ENCODING_SCORE
    };
  });

  // penalize not using positional
  if (encTypes.length > 1) {
    if ((!encoding.enc.x || !encoding.enc.y) && !encoding.enc.geo && !encoding.enc.text) {
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

},{}],14:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvdnIiLCJzcmMvY2x1c3Rlci9jbHVzdGVyLmpzIiwic3JjL2NsdXN0ZXIvY2x1c3RlcmNvbnN0cy5qcyIsInNyYy9jbHVzdGVyL2Rpc3RhbmNldGFibGUuanMiLCJzcmMvY29uc3RzLmpzIiwic3JjL2dlbi9hZ2dyZWdhdGVzLmpzIiwic3JjL2dlbi9lbmNvZGluZ3MuanMiLCJzcmMvZ2VuL2VuY3MuanMiLCJzcmMvZ2VuL2dlbi5qcyIsInNyYy9nZW4vbWFya3R5cGVzLmpzIiwic3JjL2dlbi9wcm9qZWN0aW9ucy5qcyIsInNyYy9nbG9iYWxzLmpzIiwic3JjL3JhbmsvcmFuay5qcyIsInNyYy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDN0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDakpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNsTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIHZyID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNsdXN0ZXI6IHJlcXVpcmUoJy4vY2x1c3Rlci9jbHVzdGVyJyksXG4gIGdlbjogcmVxdWlyZSgnLi9nZW4vZ2VuJyksXG4gIHJhbms6IHJlcXVpcmUoJy4vcmFuay9yYW5rJyksXG4gIHV0aWw6IHJlcXVpcmUoJy4vdXRpbCcpXG59O1xuXG5cbiIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsdXN0ZXI7XG5cbnZhciB2bCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LnZsIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC52bCA6IG51bGwpLFxuICBjbHVzdGVyZmNrID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuY2x1c3RlcmZjayA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuY2x1c3RlcmZjayA6IG51bGwpLFxuICBjb25zdHMgPSByZXF1aXJlKCcuL2NsdXN0ZXJjb25zdHMnKSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcblxudmFyIGRpc3RhbmNlVGFibGUgPSBjbHVzdGVyLmRpc3RhbmNlVGFibGUgPSByZXF1aXJlKCcuL2Rpc3RhbmNldGFibGUnKTtcblxuXG5mdW5jdGlvbiBjbHVzdGVyKGVuY29kaW5ncywgbWF4RGlzdGFuY2UpIHtcbiAgdmFyIGRpc3QgPSBkaXN0YW5jZVRhYmxlKGVuY29kaW5ncyksXG4gICAgbiA9IGVuY29kaW5ncy5sZW5ndGg7XG5cbiAgdmFyIGNsdXN0ZXJUcmVlcyA9IGNsdXN0ZXJmY2suaGNsdXN0ZXIodmwucmFuZ2UobiksIGZ1bmN0aW9uKGksIGopIHtcbiAgICByZXR1cm4gZGlzdFtpXVtqXTtcbiAgfSwgJ2F2ZXJhZ2UnLCBjb25zdHMuQ0xVU1RFUl9USFJFU0hPTEQpO1xuXG4gIHZhciBjbHVzdGVycyA9IGNsdXN0ZXJUcmVlcy5tYXAoZnVuY3Rpb24odHJlZSkge1xuICAgIHJldHVybiB1dGlsLnRyYXZlcnNlKHRyZWUsIFtdKTtcbiAgfSk7XG5cbiAgLy9jb25zb2xlLmxvZyhcImNsdXN0ZXJzXCIsIGNsdXN0ZXJzLm1hcChmdW5jdGlvbihjKXsgcmV0dXJuIGMuam9pbihcIitcIik7IH0pKTtcbiAgcmV0dXJuIGNsdXN0ZXJzO1xufTsiLCJ2YXIgYyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbmMuRElTVF9CWV9FTkNUWVBFID0gW1xuICAvLyBwb3NpdGlvbmFsXG4gIFsneCcsICd5JywgMC4yXSxcbiAgWydyb3cnLCAnY29sJywgMC4yXSxcblxuICAvLyBvcmRpbmFsIG1hcmsgcHJvcGVydGllc1xuICBbJ2NvbG9yJywgJ3NoYXBlJywgMC4yXSxcblxuICAvLyBxdWFudGl0YXRpdmUgbWFyayBwcm9wZXJ0aWVzXG4gIFsnY29sb3InLCAnYWxwaGEnLCAwLjJdLFxuICBbJ3NpemUnLCAnYWxwaGEnLCAwLjJdLFxuICBbJ3NpemUnLCAnY29sb3InLCAwLjJdXG5dLnJlZHVjZShmdW5jdGlvbihyLCB4KSB7XG52YXIgYSA9IHhbMF0sIGIgPSB4WzFdLCBkID0geFsyXTtcbiAgclthXSA9IHJbYV0gfHwge307XG4gIHJbYl0gPSByW2JdIHx8IHt9O1xuICByW2FdW2JdID0gcltiXVthXSA9IGQ7XG4gIHJldHVybiByO1xufSwge30pO1xuXG5jLkRJU1RfTUlTU0lORyA9IDEwMDtcblxuYy5DTFVTVEVSX1RIUkVTSE9MRCA9IDE7IiwidmFyIHZsID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cudmwgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLnZsIDogbnVsbCksXG4gIGNvbnN0cyA9IHJlcXVpcmUoJy4vY2x1c3RlcmNvbnN0cycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRpc3RhbmNlVGFibGU7XG5cbmZ1bmN0aW9uIGRpc3RhbmNlVGFibGUoZW5jb2RpbmdzKSB7XG4gIHZhciBsZW4gPSBlbmNvZGluZ3MubGVuZ3RoLFxuICAgIGNvbGVuY3MgPSBlbmNvZGluZ3MubWFwKGZ1bmN0aW9uKGUpIHsgcmV0dXJuIGNvbGVuYyhlKTt9KSxcbiAgICBkaWZmID0gbmV3IEFycmF5KGxlbiksIGksIGo7XG5cbiAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSBkaWZmW2ldID0gbmV3IEFycmF5KGxlbik7XG5cbiAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgZm9yIChqID0gaSArIDE7IGogPCBsZW47IGorKykge1xuICAgICAgZGlmZltqXVtpXSA9IGRpZmZbaV1bal0gPSBnZXREaXN0YW5jZShjb2xlbmNzW2ldLCBjb2xlbmNzW2pdKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRpZmY7XG59XG5cbmZ1bmN0aW9uIGdldERpc3RhbmNlKGNvbGVuYzEsIGNvbGVuYzIpIHtcbiAgdmFyIGNvbHMgPSB1dGlsLnVuaW9uKHZsLmtleXMoY29sZW5jMS5jb2wpLCB2bC5rZXlzKGNvbGVuYzIuY29sKSksXG4gICAgZGlzdCA9IDA7XG5cbiAgY29scy5mb3JFYWNoKGZ1bmN0aW9uKGNvbCkge1xuICAgIHZhciBlMSA9IGNvbGVuYzEuY29sW2NvbF0sIGUyID0gY29sZW5jMi5jb2xbY29sXTtcblxuICAgIGlmIChlMSAmJiBlMikge1xuICAgICAgaWYgKGUxLnR5cGUgIT0gZTIudHlwZSkge1xuICAgICAgICBkaXN0ICs9IChjb25zdHMuRElTVF9CWV9FTkNUWVBFW2UxLnR5cGVdIHx8IHt9KVtlMi50eXBlXSB8fCAxO1xuICAgICAgfVxuICAgICAgLy9GSVhNRSBhZGQgYWdncmVnYXRpb25cbiAgICB9IGVsc2Uge1xuICAgICAgZGlzdCArPSBjb25zdHMuRElTVF9NSVNTSU5HO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBkaXN0O1xufVxuXG5mdW5jdGlvbiBjb2xlbmMoZW5jb2RpbmcpIHtcbiAgdmFyIF9jb2xlbmMgPSB7fSxcbiAgICBlbmMgPSBlbmNvZGluZy5lbmM7XG5cbiAgdmwua2V5cyhlbmMpLmZvckVhY2goZnVuY3Rpb24oZW5jVHlwZSkge1xuICAgIHZhciBlID0gdmwuZHVwbGljYXRlKGVuY1tlbmNUeXBlXSk7XG4gICAgZS50eXBlID0gZW5jVHlwZTtcbiAgICBfY29sZW5jW2UubmFtZSB8fCAnJ10gPSBlO1xuICAgIGRlbGV0ZSBlLm5hbWU7XG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgbWFya3R5cGU6IGVuY29kaW5nLm1hcmt0eXBlLFxuICAgIGNvbDogX2NvbGVuY1xuICB9O1xufSIsInZhciBjb25zdHMgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2VuOiB7fSxcbiAgY2x1c3Rlcjoge30sXG4gIHJhbms6IHt9XG59O1xuXG5jb25zdHMuZ2VuLnByb2plY3Rpb25zID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgcHJvcGVydGllczoge1xuICAgIGFkZENvdW50SW5Qcm9qZWN0aW9uOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIH0sXG4gICAgYWRkQ291bnRJZk5vdGhpbmdJc1NlbGVjdGVkOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnV2hlbiBubyBmaWVsZCBpcyBzZWxlY3RlZCwgYWRkIGV4dHJhIGNvdW50IGZpZWxkJ1xuICAgIH0sXG4gICAgLy9GSVhNRSByZW1vdmUgdGhpcyFcbiAgICBvbWl0RG90UGxvdDoge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICBkZXNjcmlwdGlvbjogJ3JlbW92ZSBhbGwgZG90IHBsb3RzJ1xuICAgIH0sXG4gICAgbWF4Q2FyZGluYWxpdHlGb3JBdXRvQWRkT3JkaW5hbDoge1xuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgZGVmYXVsdDogNTAsXG4gICAgICBkZXNjcmlwdGlvbjogJ21heCBjYXJkaW5hbGl0eSBmb3Igb3JkaW5hbCBmaWVsZCB0byBiZSBjb25zaWRlcmVkIGZvciBhdXRvIGFkZGluZydcbiAgICB9LFxuICAgIGFsd2F5c0FkZEhpc3RvZ3JhbToge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH1cbiAgfVxufTtcblxuY29uc3RzLmdlbi5hZ2dyZWdhdGVzID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgcHJvcGVydGllczoge1xuICAgIGdlbkJpbjoge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnR2VuZXJhdGUgQmlubmluZydcbiAgICB9LFxuICAgIGdlblR5cGVDYXN0aW5nOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgZGVzY3JpcHRpb246ICdJbmNsdWRlIHR5cGUgY2FzdGluZyBlLmcuLCBmcm9tIFEgdG8gTydcbiAgICB9LFxuICAgIG9taXREb3RQbG90OiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAncmVtb3ZlIGFsbCBkb3QgcGxvdHMnXG4gICAgfSxcbiAgICBvbWl0TWVhc3VyZU9ubHk6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ09taXQgYWdncmVnYXRpb24gd2l0aCBtZWFzdXJlKHMpIG9ubHknXG4gICAgfSxcbiAgICBvbWl0RGltZW5zaW9uT25seToge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnT21pdCBhZ2dyZWdhdGlvbiB3aXRoIGRpbWVuc2lvbihzKSBvbmx5J1xuICAgIH0sXG4gICAgYWRkQ291bnRGb3JEaW1lbnNpb25Pbmx5OiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgZGVzY3JpcHRpb246ICdBZGQgY291bnQgd2hlbiB0aGVyZSBhcmUgZGltZW5zaW9uKHMpIG9ubHknXG4gICAgfSxcbiAgICBhZ2dyTGlzdDoge1xuICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgIGl0ZW1zOiB7XG4gICAgICAgIHR5cGU6IFsnc3RyaW5nJ11cbiAgICAgIH0sXG4gICAgICBkZWZhdWx0OiBbdW5kZWZpbmVkLCAnYXZnJ11cbiAgICB9LFxuICAgIHRpbWVGbkxpc3Q6IHtcbiAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICBpdGVtczoge1xuICAgICAgICB0eXBlOiBbJ3N0cmluZyddXG4gICAgICB9LFxuICAgICAgZGVmYXVsdDogWyd5ZWFyJ11cbiAgICB9XG4gIH1cbn07XG5cbmNvbnN0cy5nZW4uZW5jb2RpbmdzID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgcHJvcGVydGllczoge1xuICAgIG9taXRUcmFucG9zZTogIHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ0VsaW1pbmF0ZSBhbGwgdHJhbnNwb3NlIGJ5ICgxKSBrZWVwaW5nIGhvcml6b250YWwgZG90IHBsb3Qgb25seSAoMikgZm9yIE94USBjaGFydHMsIGFsd2F5cyBwdXQgTyBvbiBZICgzKSBzaG93IG9ubHkgb25lIER4RCwgTXhNIChjdXJyZW50bHkgc29ydGVkIGJ5IG5hbWUpJ1xuICAgIH0sXG4gICAgb21pdERvdFBsb3Q6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgZGVzY3JpcHRpb246ICdyZW1vdmUgYWxsIGRvdCBwbG90cydcbiAgICB9LFxuICAgIG9taXREb3RQbG90V2l0aEV4dHJhRW5jb2Rpbmc6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ3JlbW92ZSBhbGwgZG90IHBsb3RzIHdpdGggPjEgZW5jb2RpbmcnXG4gICAgfSxcbiAgICBvbWl0Tm9uVGV4dEFnZ3JXaXRoQWxsRGltc09uRmFjZXRzOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgZGVzY3JpcHRpb246ICdyZW1vdmUgYWxsIGFnZ3JlZ2F0ZWQgY2hhcnRzIChleGNlcHQgdGV4dCB0YWJsZXMpIHdpdGggYWxsIGRpbXMgb24gZmFjZXRzIChyb3csIGNvbCknXG4gICAgfSxcbiAgICBvbWl0U2l6ZU9uQmFyOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnZG8gbm90IHVzZSBiYXJcXCdzIHNpemUnXG4gICAgfSxcbiAgICBtYXJrdHlwZUxpc3Q6IHtcbiAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICBpdGVtczoge3R5cGU6ICdzdHJpbmcnfSxcbiAgICAgIGRlZmF1bHQ6IFsncG9pbnQnLCAnYmFyJywgJ2xpbmUnLCAnYXJlYScsICd0ZXh0J10sIC8vZmlsbGVkX21hcFxuICAgICAgZGVzY3JpcHRpb246ICdhbGxvd2VkIG1hcmt0eXBlcydcbiAgICB9XG4gIH1cbn07XG5cblxuXG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB2bCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LnZsIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC52bCA6IG51bGwpO1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKSxcbiAgY29uc3RzID0gcmVxdWlyZSgnLi4vY29uc3RzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZ2VuQWdncmVnYXRlcztcblxuZnVuY3Rpb24gZ2VuQWdncmVnYXRlcyhvdXRwdXQsIGZpZWxkcywgb3B0KSB7XG4gIG9wdCA9IHZsLnNjaGVtYS51dGlsLmV4dGVuZChvcHR8fHt9LCBjb25zdHMuZ2VuLmFnZ3JlZ2F0ZXMpO1xuICB2YXIgdGYgPSBuZXcgQXJyYXkoZmllbGRzLmxlbmd0aCk7XG5cbiAgZnVuY3Rpb24gZW1pdChmaWVsZFNldCkge1xuICAgIGZpZWxkU2V0ID0gdmwuZHVwbGljYXRlKGZpZWxkU2V0KTtcbiAgICBmaWVsZFNldC5rZXkgPSB2bC5maWVsZC5zaG9ydGhhbmRzKGZpZWxkU2V0KTtcbiAgICBvdXRwdXQucHVzaChmaWVsZFNldCk7XG4gIH1cblxuICBmdW5jdGlvbiBjaGVja0FuZFB1c2goKSB7XG4gICAgaWYgKG9wdC5vbWl0TWVhc3VyZU9ubHkgfHwgb3B0Lm9taXREaW1lbnNpb25Pbmx5KSB7XG4gICAgICB2YXIgaGFzTWVhc3VyZSA9IGZhbHNlLCBoYXNEaW1lbnNpb24gPSBmYWxzZSwgaGFzUmF3ID0gZmFsc2U7XG4gICAgICB0Zi5mb3JFYWNoKGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgaWYgKHZsLmZpZWxkLmlzRGltZW5zaW9uKGYpKSB7XG4gICAgICAgICAgaGFzRGltZW5zaW9uID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBoYXNNZWFzdXJlID0gdHJ1ZTtcbiAgICAgICAgICBpZiAoIWYuYWdncikgaGFzUmF3ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZiAoIWhhc0RpbWVuc2lvbiAmJiAhaGFzUmF3ICYmIG9wdC5vbWl0TWVhc3VyZU9ubHkpIHJldHVybjtcbiAgICAgIGlmICghaGFzTWVhc3VyZSkge1xuICAgICAgICBpZiAob3B0LmFkZENvdW50Rm9yRGltZW5zaW9uT25seSkge1xuICAgICAgICAgIHRmLnB1c2godmwuZmllbGQuY291bnQoKSk7XG4gICAgICAgICAgZW1pdCh0Zik7XG4gICAgICAgICAgdGYucG9wKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wdC5vbWl0RGltZW5zaW9uT25seSkgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAob3B0Lm9taXREb3RQbG90ICYmIHRmLmxlbmd0aCA9PT0gMSkgcmV0dXJuO1xuICAgIGVtaXQodGYpO1xuICB9XG5cbiAgZnVuY3Rpb24gYXNzaWduUShpLCBoYXNBZ2dyKSB7XG4gICAgdmFyIGYgPSBmaWVsZHNbaV0sXG4gICAgICBjYW5IYXZlQWdnciA9IGhhc0FnZ3IgPT09IHRydWUgfHwgaGFzQWdnciA9PT0gbnVsbCxcbiAgICAgIGNhbnRIYXZlQWdnciA9IGhhc0FnZ3IgPT09IGZhbHNlIHx8IGhhc0FnZ3IgPT09IG51bGw7XG5cbiAgICB0ZltpXSA9IHtuYW1lOiBmLm5hbWUsIHR5cGU6IGYudHlwZX07XG5cbiAgICBpZiAoZi5hZ2dyKSB7XG4gICAgICBpZiAoY2FuSGF2ZUFnZ3IpIHtcbiAgICAgICAgdGZbaV0uYWdnciA9IGYuYWdncjtcbiAgICAgICAgYXNzaWduRmllbGQoaSArIDEsIHRydWUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYWdncmVnYXRlcyA9ICghZi5fYWdnciB8fCBmLl9hZ2dyID09PSAnKicpID8gb3B0LmFnZ3JMaXN0IDogZi5fYWdncjtcblxuICAgICAgZm9yICh2YXIgaiBpbiBhZ2dyZWdhdGVzKSB7XG4gICAgICAgIHZhciBhID0gYWdncmVnYXRlc1tqXTtcbiAgICAgICAgaWYgKGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGlmIChjYW5IYXZlQWdncikge1xuICAgICAgICAgICAgdGZbaV0uYWdnciA9IGE7XG4gICAgICAgICAgICBhc3NpZ25GaWVsZChpICsgMSwgdHJ1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgeyAvLyBpZihhID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgaWYgKGNhbnRIYXZlQWdncikge1xuICAgICAgICAgICAgZGVsZXRlIHRmW2ldLmFnZ3I7XG4gICAgICAgICAgICBhc3NpZ25GaWVsZChpICsgMSwgZmFsc2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAob3B0LmdlbkJpbikge1xuICAgICAgICAvLyBiaW4gdGhlIGZpZWxkIGluc3RlYWQhXG4gICAgICAgIGRlbGV0ZSB0ZltpXS5hZ2dyO1xuICAgICAgICB0ZltpXS5iaW4gPSB0cnVlO1xuICAgICAgICB0ZltpXS50eXBlID0gJ1EnO1xuICAgICAgICBhc3NpZ25GaWVsZChpICsgMSwgaGFzQWdncik7XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHQuZ2VuVHlwZUNhc3RpbmcpIHtcbiAgICAgICAgLy8gd2UgY2FuIGFsc28gY2hhbmdlIGl0IHRvIGRpbWVuc2lvbiAoY2FzdCB0eXBlPVwiT1wiKVxuICAgICAgICBkZWxldGUgdGZbaV0uYWdncjtcbiAgICAgICAgZGVsZXRlIHRmW2ldLmJpbjtcbiAgICAgICAgdGZbaV0udHlwZSA9ICdPJztcbiAgICAgICAgYXNzaWduRmllbGQoaSArIDEsIGhhc0FnZ3IpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGFzc2lnblQoaSwgaGFzQWdncikge1xuICAgIHZhciBmID0gZmllbGRzW2ldO1xuICAgIHRmW2ldID0ge25hbWU6IGYubmFtZSwgdHlwZTogZi50eXBlfTtcblxuICAgIGlmIChmLmZuKSB7XG4gICAgICAvLyBGSVhNRSBkZWFsIHdpdGggYXNzaWduZWQgZnVuY3Rpb25cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGZucyA9ICghZi5fZm4gfHwgZi5fZm4gPT09ICcqJykgPyBvcHQudGltZUZuTGlzdCA6IGYuX2ZuO1xuICAgICAgZm9yICh2YXIgaiBpbiBmbnMpIHtcbiAgICAgICAgdmFyIGZuID0gZm5zW2pdO1xuICAgICAgICBpZiAoZm4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGFzc2lnbkZpZWxkKGkrMSwgaGFzQWdncik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGZbaV0uZm4gPSBmbjtcbiAgICAgICAgICBhc3NpZ25GaWVsZChpKzEsIGhhc0FnZ3IpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIC8vIEZJWE1FIHdoYXQgaWYgeW91IGFnZ3JlZ2F0ZSB0aW1lP1xuXG4gIH1cblxuICBmdW5jdGlvbiBhc3NpZ25GaWVsZChpLCBoYXNBZ2dyKSB7XG4gICAgaWYgKGkgPT09IGZpZWxkcy5sZW5ndGgpIHsgLy8gSWYgYWxsIGZpZWxkcyBhcmUgYXNzaWduZWRcbiAgICAgIGNoZWNrQW5kUHVzaCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBmID0gZmllbGRzW2ldO1xuICAgIC8vIE90aGVyd2lzZSwgYXNzaWduIGktdGggZmllbGRcbiAgICBzd2l0Y2ggKGYudHlwZSkge1xuICAgICAgLy9UT0RPIFwiRFwiLCBcIkdcIlxuICAgICAgY2FzZSAnUSc6XG4gICAgICAgIGFzc2lnblEoaSwgaGFzQWdncik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdUJzpcbiAgICAgICAgYXNzaWduVChpLCBoYXNBZ2dyKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ08nOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGZbaV0gPSBmO1xuICAgICAgICBhc3NpZ25GaWVsZChpICsgMSwgaGFzQWdncik7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICB9XG5cbiAgYXNzaWduRmllbGQoMCwgbnVsbCk7XG5cbiAgcmV0dXJuIG91dHB1dDtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHZsID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cudmwgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLnZsIDogbnVsbCksXG4gIGdlbkVuY3MgPSByZXF1aXJlKCcuL2VuY3MnKSxcbiAgZ2V0TWFya3R5cGVzID0gcmVxdWlyZSgnLi9tYXJrdHlwZXMnKSxcbiAgcmFuayA9IHJlcXVpcmUoJy4uL3JhbmsvcmFuaycpLFxuICBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBnZW5FbmNvZGluZ3NGcm9tRmllbGRzO1xuXG5mdW5jdGlvbiBnZW5FbmNvZGluZ3NGcm9tRmllbGRzKG91dHB1dCwgZmllbGRzLCBzdGF0cywgb3B0LCBjZmcsIG5lc3RlZCkge1xuICB2YXIgZW5jcyA9IGdlbkVuY3MoW10sIGZpZWxkcywgc3RhdHMsIG9wdCk7XG5cbiAgaWYgKG5lc3RlZCkge1xuICAgIHJldHVybiBlbmNzLnJlZHVjZShmdW5jdGlvbihkaWN0LCBlbmMpIHtcbiAgICAgIGRpY3RbZW5jXSA9IGdlbkVuY29kaW5nc0Zyb21FbmNzKFtdLCBlbmMsIG9wdCwgY2ZnKTtcbiAgICAgIHJldHVybiBkaWN0O1xuICAgIH0sIHt9KTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZW5jcy5yZWR1Y2UoZnVuY3Rpb24obGlzdCwgZW5jKSB7XG4gICAgICByZXR1cm4gZ2VuRW5jb2RpbmdzRnJvbUVuY3MobGlzdCwgZW5jLCBvcHQsIGNmZyk7XG4gICAgfSwgW10pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdlbkVuY29kaW5nc0Zyb21FbmNzKG91dHB1dCwgZW5jLCBvcHQsIGNmZykge1xuICBnZXRNYXJrdHlwZXMoZW5jLCBvcHQpXG4gICAgLmZvckVhY2goZnVuY3Rpb24obWFya1R5cGUpIHtcbiAgICAgIHZhciBlbmNvZGluZyA9IHsgbWFya3R5cGU6IG1hcmtUeXBlLCBlbmM6IGVuYywgY2ZnOiBjZmcgfSxcbiAgICAgICAgc2NvcmUgPSByYW5rLmVuY29kaW5nKGVuY29kaW5nKTtcbiAgICAgIGVuY29kaW5nLnNjb3JlID0gc2NvcmUuc2NvcmU7XG4gICAgICBlbmNvZGluZy5zY29yZUZlYXR1cmVzID0gc2NvcmUuZmVhdHVyZXM7XG4gICAgICBvdXRwdXQucHVzaChlbmNvZGluZyk7XG4gICAgfSk7XG4gIHJldHVybiBvdXRwdXQ7XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciB2bCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LnZsIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC52bCA6IG51bGwpLFxuICBnbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpLFxuICBjb25zdHMgPSByZXF1aXJlKCcuLi9jb25zdHMnKSxcbiAgZ2VuTWFya1R5cGVzID0gcmVxdWlyZSgnLi9tYXJrdHlwZXMnKSxcbiAgaXNEaW1lbnNpb24gPSB2bC5maWVsZC5pc0RpbWVuc2lvbixcbiAgaXNNZWFzdXJlID0gdmwuZmllbGQuaXNNZWFzdXJlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdlbkVuY3M7XG5cbnZhciBydWxlcyA9IHtcbiAgeDoge1xuICAgIGRpbWVuc2lvbjogdHJ1ZSxcbiAgICBtZWFzdXJlOiB0cnVlLFxuICAgIG11bHRpcGxlOiB0cnVlIC8vRklYTUUgc2hvdWxkIGFsbG93IG11bHRpcGxlIG9ubHkgZm9yIFEsIFRcbiAgfSxcbiAgeToge1xuICAgIGRpbWVuc2lvbjogdHJ1ZSxcbiAgICBtZWFzdXJlOiB0cnVlLFxuICAgIG11bHRpcGxlOiB0cnVlIC8vRklYTUUgc2hvdWxkIGFsbG93IG11bHRpcGxlIG9ubHkgZm9yIFEsIFRcbiAgfSxcbiAgcm93OiB7XG4gICAgZGltZW5zaW9uOiB0cnVlLFxuICAgIG11bHRpcGxlOiB0cnVlXG4gIH0sXG4gIGNvbDoge1xuICAgIGRpbWVuc2lvbjogdHJ1ZSxcbiAgICBtdWx0aXBsZTogdHJ1ZVxuICB9LFxuICBzaGFwZToge1xuICAgIGRpbWVuc2lvbjogdHJ1ZVxuICB9LFxuICBzaXplOiB7XG4gICAgbWVhc3VyZTogdHJ1ZVxuICB9LFxuICBjb2xvcjoge1xuICAgIGRpbWVuc2lvbjogdHJ1ZSxcbiAgICBtZWFzdXJlOiB0cnVlXG4gIH0sXG4gIGFscGhhOiB7XG4gICAgbWVhc3VyZTogdHJ1ZVxuICB9LFxuICB0ZXh0OiB7XG4gICAgbWVhc3VyZTogdHJ1ZVxuICB9LFxuICBkZXRhaWw6IHtcbiAgICBkaW1lbnNpb246IHRydWVcbiAgfVxuICAvL2dlbzoge1xuICAvLyAgZ2VvOiB0cnVlXG4gIC8vfSxcbiAgLy9hcmM6IHsgLy8gcGllXG4gIC8vXG4gIC8vfVxufTtcblxuZnVuY3Rpb24gbWF4Q2FyZGluYWxpdHkoZmllbGQsIHN0YXRzKSB7XG4gIHJldHVybiBzdGF0c1tmaWVsZF0uY2FyZGluYWxpdHkgPD0gMjA7XG59XG5cbmZ1bmN0aW9uIGRpbU1lYVRyYW5zcG9zZVJ1bGUoZW5jKSB7XG4gIC8vIGNyZWF0ZSBob3Jpem9udGFsIGhpc3RvZ3JhbSBmb3Igb3JkaW5hbFxuICBpZiAoZW5jLnkudHlwZSA9PT0gJ08nICYmIGlzTWVhc3VyZShlbmMueCkpIHJldHVybiB0cnVlO1xuXG4gIC8vIHZlcnRpY2FsIGhpc3RvZ3JhbSBmb3IgUSBhbmQgVFxuICBpZiAoaXNNZWFzdXJlKGVuYy55KSAmJiAoZW5jLngudHlwZSAhPT0gJ08nICYmIGlzRGltZW5zaW9uKGVuYy54KSkpIHJldHVybiB0cnVlO1xuXG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gZ2VuZXJhbFJ1bGVzKGVuYywgb3B0KSB7XG4gIC8vIGVuYy50ZXh0IGlzIG9ubHkgdXNlZCBmb3IgVEVYVCBUQUJMRVxuICBpZiAoZW5jLnRleHQpIHtcbiAgICByZXR1cm4gZ2VuTWFya1R5cGVzLnNhdGlzZnlSdWxlcyhlbmMsICd0ZXh0Jywgb3B0KTtcbiAgfVxuXG4gIC8vIENBUlRFU0lBTiBQTE9UIE9SIE1BUFxuICBpZiAoZW5jLnggfHwgZW5jLnkgfHwgZW5jLmdlbyB8fCBlbmMuYXJjKSB7XG5cbiAgICBpZiAoZW5jLnJvdyB8fCBlbmMuY29sKSB7IC8vaGF2ZSBmYWNldChzKVxuICAgICAgaWYgKCFlbmMueCB8fCAhZW5jLnkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyBkb24ndCB1c2UgZmFjZXRzIGJlZm9yZSBmaWxsaW5nIHVwIHgseVxuICAgICAgfVxuXG4gICAgICBpZiAob3B0Lm9taXROb25UZXh0QWdncldpdGhBbGxEaW1zT25GYWNldHMpIHtcbiAgICAgICAgLy8gcmVtb3ZlIGFsbCBhZ2dyZWdhdGVkIGNoYXJ0cyB3aXRoIGFsbCBkaW1zIG9uIGZhY2V0cyAocm93LCBjb2wpXG4gICAgICAgIGlmIChnZW5FbmNzLmlzQWdncldpdGhBbGxEaW1PbkZhY2V0cyhlbmMpKSByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGVuYy54ICYmIGVuYy55KSB7XG4gICAgICBpZiAob3B0Lm9taXRUcmFucG9zZSkge1xuICAgICAgICBpZiAoaXNEaW1lbnNpb24oZW5jLngpIF4gaXNEaW1lbnNpb24oZW5jLnkpKSB7IC8vIGRpbSB4IG1lYVxuICAgICAgICAgIGlmICghZGltTWVhVHJhbnNwb3NlUnVsZShlbmMpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAoZW5jLnkudHlwZT09PSdUJyB8fCBlbmMueC50eXBlID09PSAnVCcpIHtcbiAgICAgICAgICBpZiAoZW5jLnkudHlwZT09PSdUJyAmJiBlbmMueC50eXBlICE9PSAnVCcpIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHsgLy8gc2hvdyBvbmx5IG9uZSBPeE8sIFF4UVxuICAgICAgICAgIGlmIChlbmMueC5uYW1lID4gZW5jLnkubmFtZSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBET1QgUExPVFNcbiAgICAvLyAvLyBwbG90IHdpdGggb25lIGF4aXMgPSBkb3QgcGxvdFxuICAgIGlmIChvcHQub21pdERvdFBsb3QpIHJldHVybiBmYWxzZTtcblxuICAgIC8vIERvdCBwbG90IHNob3VsZCBhbHdheXMgYmUgaG9yaXpvbnRhbFxuICAgIGlmIChvcHQub21pdFRyYW5wb3NlICYmIGVuYy55KSByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBkb3QgcGxvdCBzaG91bGRuJ3QgaGF2ZSBvdGhlciBlbmNvZGluZ1xuICAgIGlmIChvcHQub21pdERvdFBsb3RXaXRoRXh0cmFFbmNvZGluZyAmJiB2bC5rZXlzKGVuYykubGVuZ3RoID4gMSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gb25lIGRpbWVuc2lvbiBcImNvdW50XCIgaXMgdXNlbGVzc1xuICAgIGlmIChlbmMueCAmJiBlbmMueC5hZ2dyID09ICdjb3VudCcgJiYgIWVuYy55KSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKGVuYy55ICYmIGVuYy55LmFnZ3IgPT0gJ2NvdW50JyAmJiAhZW5jLngpIHJldHVybiBmYWxzZTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZ2VuRW5jcy5pc0FnZ3JXaXRoQWxsRGltT25GYWNldHMgPSBmdW5jdGlvbiAoZW5jKSB7XG4gIHZhciBoYXNBZ2dyID0gZmFsc2UsIGhhc090aGVyTyA9IGZhbHNlO1xuICBmb3IgKHZhciBlbmNUeXBlIGluIGVuYykge1xuICAgIHZhciBmaWVsZCA9IGVuY1tlbmNUeXBlXTtcbiAgICBpZiAoZmllbGQuYWdncikge1xuICAgICAgaGFzQWdnciA9IHRydWU7XG4gICAgfVxuICAgIGlmICh2bC5maWVsZC5pc0RpbWVuc2lvbihmaWVsZCkgJiYgKGVuY1R5cGUgIT09ICdyb3cnICYmIGVuY1R5cGUgIT09ICdjb2wnKSkge1xuICAgICAgaGFzT3RoZXJPID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGhhc0FnZ3IgJiYgaGFzT3RoZXJPKSBicmVhaztcbiAgfVxuXG4gIHJldHVybiBoYXNBZ2dyICYmICFoYXNPdGhlck87XG59O1xuXG5cbmZ1bmN0aW9uIGdlbkVuY3MoZW5jcywgZmllbGRzLCBzdGF0cywgb3B0KSB7XG4gIG9wdCA9IHZsLnNjaGVtYS51dGlsLmV4dGVuZChvcHR8fHt9LCBjb25zdHMuZ2VuLmVuY29kaW5ncyk7XG4gIC8vIGdlbmVyYXRlIGEgY29sbGVjdGlvbiB2ZWdhbGl0ZSdzIGVuY1xuICB2YXIgdG1wRW5jID0ge307XG5cbiAgZnVuY3Rpb24gYXNzaWduRmllbGQoaSkge1xuICAgIC8vIElmIGFsbCBmaWVsZHMgYXJlIGFzc2lnbmVkLCBzYXZlXG4gICAgaWYgKGkgPT09IGZpZWxkcy5sZW5ndGgpIHtcbiAgICAgIC8vIGF0IHRoZSBtaW5pbWFsIGFsbCBjaGFydCBzaG91bGQgaGF2ZSB4LCB5LCBnZW8sIHRleHQgb3IgYXJjXG4gICAgICBpZiAoZ2VuZXJhbFJ1bGVzKHRtcEVuYywgb3B0KSkge1xuICAgICAgICBlbmNzLnB1c2godmwuZHVwbGljYXRlKHRtcEVuYykpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIE90aGVyd2lzZSwgYXNzaWduIGktdGggZmllbGRcbiAgICB2YXIgZmllbGQgPSBmaWVsZHNbaV07XG4gICAgZm9yICh2YXIgaiBpbiB2bC5lbmNvZGluZ1R5cGVzKSB7XG4gICAgICB2YXIgZXQgPSB2bC5lbmNvZGluZ1R5cGVzW2pdLFxuICAgICAgICBpc0RpbSA9IGlzRGltZW5zaW9uKGZpZWxkKTtcblxuICAgICAgLy9UT0RPOiBzdXBwb3J0IFwibXVsdGlwbGVcIiBhc3NpZ25tZW50XG4gICAgICBpZiAoIShldCBpbiB0bXBFbmMpICYmIC8vIGVuY29kaW5nIG5vdCB1c2VkXG4gICAgICAgICgoaXNEaW0gJiYgcnVsZXNbZXRdLmRpbWVuc2lvbikgfHwgKCFpc0RpbSAmJiBydWxlc1tldF0ubWVhc3VyZSkpICYmXG4gICAgICAgICghcnVsZXNbZXRdLnJ1bGVzIHx8ICFydWxlc1tldF0ucnVsZXMoZmllbGQsIHN0YXRzKSlcbiAgICAgICAgKSB7XG4gICAgICAgIHRtcEVuY1tldF0gPSBmaWVsZDtcbiAgICAgICAgYXNzaWduRmllbGQoaSArIDEpO1xuICAgICAgICBkZWxldGUgdG1wRW5jW2V0XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhc3NpZ25GaWVsZCgwKTtcblxuICByZXR1cm4gZW5jcztcbn1cbiIsInZhciB2bCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LnZsIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC52bCA6IG51bGwpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG52YXIgZ2VuID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIC8vIGRhdGEgdmFyaWF0aW9uc1xuICBhZ2dyZWdhdGVzOiByZXF1aXJlKCcuL2FnZ3JlZ2F0ZXMnKSxcbiAgcHJvamVjdGlvbnM6IHJlcXVpcmUoJy4vcHJvamVjdGlvbnMnKSxcbiAgLy8gZW5jb2RpbmdzIC8gdmlzdWFsIHZhcmlhdG9uc1xuICBlbmNvZGluZ3M6IHJlcXVpcmUoJy4vZW5jb2RpbmdzJyksXG4gIGVuY3M6IHJlcXVpcmUoJy4vZW5jcycpLFxuICBtYXJrdHlwZXM6IHJlcXVpcmUoJy4vbWFya3R5cGVzJylcbn07XG5cbi8vRklYTUUgbW92ZSB0aGVzZSB0byB2bFxudmFyIEFHR1JFR0FUSU9OX0ZOID0geyAvL2FsbCBwb3NzaWJsZSBhZ2dyZWdhdGUgZnVuY3Rpb24gbGlzdGVkIGJ5IGVhY2ggZGF0YSB0eXBlXG4gIFE6IHZsLnNjaGVtYS5hZ2dyLnN1cHBvcnRlZEVudW1zLlFcbn07XG5cbnZhciBUUkFOU0ZPUk1fRk4gPSB7IC8vYWxsIHBvc3NpYmxlIHRyYW5zZm9ybSBmdW5jdGlvbiBsaXN0ZWQgYnkgZWFjaCBkYXRhIHR5cGVcbiAgLy8gUTogWydsb2cnLCAnc3FydCcsICdhYnMnXSwgLy8gXCJsb2dpdD9cIlxuICBUOiB2bC5zY2hlbWEudGltZWZuc1xufTtcblxuZ2VuLmNoYXJ0cyA9IGZ1bmN0aW9uKGZpZWxkcywgb3B0LCBjZmcsIGZsYXQpIHtcbiAgb3B0ID0gdXRpbC5nZW4uZ2V0T3B0KG9wdCk7XG4gIGZsYXQgPSBmbGF0ID09PSB1bmRlZmluZWQgPyB7ZW5jb2RpbmdzOiAxfSA6IGZsYXQ7XG5cbiAgLy8gVE9ETyBnZW5lcmF0ZVxuXG4gIC8vIGdlbmVyYXRlIHBlcm11dGF0aW9uIG9mIGVuY29kaW5nIG1hcHBpbmdzXG4gIHZhciBmaWVsZFNldHMgPSBvcHQuZ2VuQWdnciA/IGdlbi5hZ2dyZWdhdGVzKFtdLCBmaWVsZHMsIG9wdCkgOiBbZmllbGRzXSxcbiAgICBlbmNzLCBjaGFydHMsIGxldmVsID0gMDtcblxuICBpZiAoZmxhdCA9PT0gdHJ1ZSB8fCAoZmxhdCAmJiBmbGF0LmFnZ3IpKSB7XG4gICAgZW5jcyA9IGZpZWxkU2V0cy5yZWR1Y2UoZnVuY3Rpb24ob3V0cHV0LCBmaWVsZHMpIHtcbiAgICAgIHJldHVybiBnZW4uZW5jcyhvdXRwdXQsIGZpZWxkcywgb3B0KTtcbiAgICB9LCBbXSk7XG4gIH0gZWxzZSB7XG4gICAgZW5jcyA9IGZpZWxkU2V0cy5tYXAoZnVuY3Rpb24oZmllbGRzKSB7XG4gICAgICByZXR1cm4gZ2VuLmVuY3MoW10sIGZpZWxkcywgb3B0KTtcbiAgICB9LCB0cnVlKTtcbiAgICBsZXZlbCArPSAxO1xuICB9XG5cbiAgaWYgKGZsYXQgPT09IHRydWUgfHwgKGZsYXQgJiYgZmxhdC5lbmNvZGluZ3MpKSB7XG4gICAgY2hhcnRzID0gdXRpbC5uZXN0ZWRSZWR1Y2UoZW5jcywgZnVuY3Rpb24ob3V0cHV0LCBlbmMpIHtcbiAgICAgIHJldHVybiBnZW4ubWFya3R5cGVzKG91dHB1dCwgZW5jLCBvcHQsIGNmZyk7XG4gICAgfSwgbGV2ZWwsIHRydWUpO1xuICB9IGVsc2Uge1xuICAgIGNoYXJ0cyA9IHV0aWwubmVzdGVkTWFwKGVuY3MsIGZ1bmN0aW9uKGVuYykge1xuICAgICAgcmV0dXJuIGdlbi5tYXJrdHlwZXMoW10sIGVuYywgb3B0LCBjZmcpO1xuICAgIH0sIGxldmVsLCB0cnVlKTtcbiAgICBsZXZlbCArPSAxO1xuICB9XG4gIHJldHVybiBjaGFydHM7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgdmwgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy52bCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwudmwgOiBudWxsKSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKSxcbiAgY29uc3RzID0gcmVxdWlyZSgnLi4vY29uc3RzJyksXG4gIGlzRGltZW5zaW9uID0gdmwuZmllbGQuaXNEaW1lbnNpb247XG5cbnZhciB2bG1hcmt0eXBlcyA9IG1vZHVsZS5leHBvcnRzID0gZ2V0TWFya3R5cGVzO1xuXG52YXIgbWFya3NSdWxlID0gdmxtYXJrdHlwZXMucnVsZSA9IHtcbiAgcG9pbnQ6ICBwb2ludFJ1bGUsXG4gIGJhcjogICAgYmFyUnVsZSxcbiAgbGluZTogICBsaW5lUnVsZSxcbiAgYXJlYTogICBsaW5lUnVsZSwgLy8gYXJlYSBpcyBzaW1pbGFyIHRvIGxpbmVcbiAgdGV4dDogICB0ZXh0UnVsZVxufTtcblxuZnVuY3Rpb24gZ2V0TWFya3R5cGVzKGVuYywgb3B0KSB7XG4gIG9wdCA9IHZsLnNjaGVtYS51dGlsLmV4dGVuZChvcHR8fHt9LCBjb25zdHMuZ2VuLmVuY29kaW5ncyk7XG5cbiAgdmFyIG1hcmtUeXBlcyA9IG9wdC5tYXJrdHlwZUxpc3QuZmlsdGVyKGZ1bmN0aW9uKG1hcmtUeXBlKXtcbiAgICByZXR1cm4gdmxtYXJrdHlwZXMuc2F0aXNmeVJ1bGVzKGVuYywgbWFya1R5cGUsIG9wdCk7XG4gIH0pO1xuXG4gIC8vY29uc29sZS5sb2coJ2VuYzonLCB1dGlsLmpzb24oZW5jKSwgXCIgfiBtYXJrczpcIiwgbWFya1R5cGVzKTtcblxuICByZXR1cm4gbWFya1R5cGVzO1xufVxuXG52bG1hcmt0eXBlcy5zYXRpc2Z5UnVsZXMgPSBmdW5jdGlvbiAoZW5jLCBtYXJrVHlwZSwgb3B0KSB7XG4gIHZhciBtYXJrID0gdmwuY29tcGlsZS5tYXJrc1ttYXJrVHlwZV0sXG4gICAgcmVxcyA9IG1hcmsucmVxdWlyZWRFbmNvZGluZyxcbiAgICBzdXBwb3J0ID0gbWFyay5zdXBwb3J0ZWRFbmNvZGluZztcblxuICBmb3IgKHZhciBpIGluIHJlcXMpIHsgLy8gYWxsIHJlcXVpcmVkIGVuY29kaW5ncyBpbiBlbmNcbiAgICBpZiAoIShyZXFzW2ldIGluIGVuYykpIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZvciAodmFyIGVuY1R5cGUgaW4gZW5jKSB7IC8vIGFsbCBlbmNvZGluZ3MgaW4gZW5jIGFyZSBzdXBwb3J0ZWRcbiAgICBpZiAoIXN1cHBvcnRbZW5jVHlwZV0pIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiAhbWFya3NSdWxlW21hcmtUeXBlXSB8fCBtYXJrc1J1bGVbbWFya1R5cGVdKGVuYywgb3B0KTtcbn07XG5cblxuZnVuY3Rpb24gcG9pbnRSdWxlKGVuYywgb3B0KSB7XG4gIGlmIChlbmMueCAmJiBlbmMueSkge1xuICAgIC8vIGhhdmUgYm90aCB4ICYgeSA9PT4gc2NhdHRlciBwbG90IC8gYnViYmxlIHBsb3RcblxuICAgIHZhciB4SXNEaW0gPSBpc0RpbWVuc2lvbihlbmMueCksXG4gICAgICB5SXNEaW0gPSBpc0RpbWVuc2lvbihlbmMueSk7XG5cbiAgICAvLyBGb3IgT3hPXG4gICAgaWYgKHhJc0RpbSAmJiB5SXNEaW0pIHtcbiAgICAgIC8vIHNoYXBlIGRvZXNuJ3Qgd29yayB3aXRoIGJvdGggeCwgeSBhcyBvcmRpbmFsXG4gICAgICBpZiAoZW5jLnNoYXBlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gVE9ETyhrYW5pdHcpOiBjaGVjayB0aGF0IHRoZXJlIGlzIHF1YW50IGF0IGxlYXN0IC4uLlxuICAgICAgaWYgKGVuYy5jb2xvciAmJiBpc0RpbWVuc2lvbihlbmMuY29sb3IpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfSBlbHNlIHsgLy8gcGxvdCB3aXRoIG9uZSBheGlzID0gZG90IHBsb3RcbiAgICBpZiAob3B0Lm9taXREb3RQbG90KSByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBEb3QgcGxvdCBzaG91bGQgYWx3YXlzIGJlIGhvcml6b250YWxcbiAgICBpZiAob3B0Lm9taXRUcmFucG9zZSAmJiBlbmMueSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gZG90IHBsb3Qgc2hvdWxkbid0IGhhdmUgb3RoZXIgZW5jb2RpbmdcbiAgICBpZiAob3B0Lm9taXREb3RQbG90V2l0aEV4dHJhRW5jb2RpbmcgJiYgdmwua2V5cyhlbmMpLmxlbmd0aCA+IDEpIHJldHVybiBmYWxzZTtcblxuICAgIC8vIGRvdCBwbG90IHdpdGggc2hhcGUgaXMgbm9uLXNlbnNlXG4gICAgaWYgKGVuYy5zaGFwZSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBiYXJSdWxlKGVuYywgb3B0KSB7XG4gIC8vIG5lZWQgdG8gYWdncmVnYXRlIG9uIGVpdGhlciB4IG9yIHlcblxuICBpZiAob3B0Lm9taXRTaXplT25CYXIgJiYgZW5jLnNpemUgIT09IHVuZGVmaW5lZCkgcmV0dXJuIGZhbHNlO1xuXG4gIGlmICgoKGVuYy54LmFnZ3IgIT09IHVuZGVmaW5lZCkgXiAoZW5jLnkuYWdnciAhPT0gdW5kZWZpbmVkKSkgJiZcbiAgICAgICh2bC5maWVsZC5pc0RpbWVuc2lvbihlbmMueCkgXiB2bC5maWVsZC5pc0RpbWVuc2lvbihlbmMueSkpKSB7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gbGluZVJ1bGUoZW5jLCBvcHQpIHtcbiAgLy8gVE9ETyhrYW5pdHcpOiBhZGQgb21pdFZlcnRpY2FsTGluZSBhcyBjb25maWdcblxuICAvLyBGSVhNRSB0cnVseSBvcmRpbmFsIGRhdGEgaXMgZmluZSBoZXJlIHRvby5cbiAgLy8gTGluZSBjaGFydCBzaG91bGQgYmUgb25seSBob3Jpem9udGFsXG4gIC8vIGFuZCB1c2Ugb25seSB0ZW1wb3JhbCBkYXRhXG4gIHJldHVybiBlbmMueC50eXBlID09ICdUJyAmJiBlbmMueC5mbiAmJiBlbmMueS50eXBlID09ICdRJyAmJiBlbmMueS5hZ2dyO1xufVxuXG5mdW5jdGlvbiB0ZXh0UnVsZShlbmMsIG9wdCkge1xuICAvLyBhdCBsZWFzdCBtdXN0IGhhdmUgcm93IG9yIGNvbCBhbmQgYWdncmVnYXRlZCB0ZXh0IHZhbHVlc1xuICByZXR1cm4gKGVuYy5yb3cgfHwgZW5jLmNvbCkgJiYgZW5jLnRleHQgJiYgZW5jLnRleHQuYWdnciAmJiAhZW5jLnggJiYgIWVuYy55ICYmICFlbmMuY29sb3I7XG59IiwidmFyIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyksXG4gIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpLFxuICB2bCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LnZsIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC52bCA6IG51bGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHByb2plY3Rpb25zO1xuXG4vKipcbiAqIGZpZWxkc1xuICogQHBhcmFtICB7W3R5cGVdfSBmaWVsZHMgYXJyYXkgb2YgZmllbGRzIGFuZCBxdWVyeSBpbmZvcm1hdGlvblxuICogQHJldHVybiB7W3R5cGVdfSAgICAgICAgW2Rlc2NyaXB0aW9uXVxuICovXG5mdW5jdGlvbiBwcm9qZWN0aW9ucyhmaWVsZHMsIHN0YXRzLCBvcHQpIHtcbiAgb3B0ID0gdmwuc2NoZW1hLnV0aWwuZXh0ZW5kKG9wdHx8e30sIGNvbnN0cy5nZW4ucHJvamVjdGlvbnMpO1xuICAvLyBUT0RPIHN1cHBvcnQgb3RoZXIgbW9kZSBvZiBwcm9qZWN0aW9ucyBnZW5lcmF0aW9uXG4gIC8vIHBvd2Vyc2V0LCBjaG9vc2VLLCBjaG9vc2VLb3JMZXNzIGFyZSBhbHJlYWR5IGluY2x1ZGVkIGluIHRoZSB1dGlsXG4gIC8vIFJpZ2h0IG5vdyBqdXN0IGFkZCBvbmUgbW9yZSBmaWVsZFxuXG4gIHZhciBzZWxlY3RlZCA9IFtdLCB1bnNlbGVjdGVkID0gW10sIGZpZWxkU2V0cyA9IFtdO1xuXG4gIGZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uKGZpZWxkKXtcbiAgICBpZiAoZmllbGQuc2VsZWN0ZWQpIHtcbiAgICAgIHNlbGVjdGVkLnB1c2goZmllbGQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB1bnNlbGVjdGVkLnB1c2goZmllbGQpO1xuICAgIH1cbiAgfSk7XG5cbiAgdW5zZWxlY3RlZCA9IHVuc2VsZWN0ZWQuZmlsdGVyKGZ1bmN0aW9uKGZpZWxkKXtcbiAgICBpZighb3B0LmFkZENvdW50SW5Qcm9qZWN0aW9uICYmIHZsLmZpZWxkLmlzQ291bnQoZmllbGQpKSByZXR1cm4gZmFsc2U7XG4gICAgLy9GSVhNRSBsb2FkIG1heGJpbnMgdmFsdWUgZnJvbSBzb21ld2hlcmUgZWxzZVxuICAgIHJldHVybiAob3B0LmFsd2F5c0FkZEhpc3RvZ3JhbSAmJiBzZWxlY3RlZC5sZW5ndGggPT09IDApIHx8XG4gICAgICAhKG9wdC5tYXhDYXJkaW5hbGl0eUZvckF1dG9BZGRPcmRpbmFsICYmXG4gICAgICAgIHZsLmZpZWxkLmlzRGltZW5zaW9uKGZpZWxkKSAmJlxuICAgICAgICB2bC5maWVsZC5jYXJkaW5hbGl0eShmaWVsZCwgc3RhdHMsIDE1KSA+IG9wdC5tYXhDYXJkaW5hbGl0eUZvckF1dG9BZGRPcmRpbmFsKTtcbiAgfSk7XG5cbiAgaWYgKG9wdC5hZGRDb3VudEluUHJvamVjdGlvbikge1xuICAgIC8vIHB1dCBjb3VudCBvbiB0b3AhXG4gICAgdW5zZWxlY3RlZC5zb3J0KGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgaWYoYS5hZ2dyPT09J2NvdW50JykgcmV0dXJuIC0xO1xuICAgICAgaWYoYi5hZ2dyPT09J2NvdW50JykgcmV0dXJuIDE7XG4gICAgICByZXR1cm4gMDtcbiAgICB9KTtcbiAgfVxuXG4gIHZhciBzZXRzVG9BZGQgPSB1dGlsLmNob29zZUtvckxlc3ModW5zZWxlY3RlZCwgMSk7XG5cbiAgc2V0c1RvQWRkLmZvckVhY2goZnVuY3Rpb24oc2V0VG9BZGQpIHtcbiAgICB2YXIgZmllbGRTZXQgPSBzZWxlY3RlZC5jb25jYXQoc2V0VG9BZGQpO1xuICAgIGlmIChmaWVsZFNldC5sZW5ndGggPiAwKSB7XG4gICAgICAvL3NpbmdsZSBjb3VudCBmaWVsZCBpcyB1c2VsZXNzXG4gICAgICBpZiAoZmllbGRTZXQubGVuZ3RoID09PSAxICYmIHZsLmZpZWxkLmlzQ291bnQoZmllbGRTZXRbMF0pKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdC5vbWl0RG90UGxvdCAmJiBmaWVsZFNldC5sZW5ndGggPT09IDEpIHJldHVybjtcblxuICAgICAgZmllbGRTZXRzLnB1c2goZmllbGRTZXQpO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKG9wdC5hZGRDb3VudEluUHJvamVjdGlvbiAmJiBvcHQuYWRkQ291bnRJZk5vdGhpbmdJc1NlbGVjdGVkICYmIHNlbGVjdGVkLmxlbmd0aD09PTApIHtcbiAgICB2YXIgY291bnRGaWVsZCA9IHZsLmZpZWxkLmNvdW50KCk7XG5cbiAgICB1bnNlbGVjdGVkLmZvckVhY2goZnVuY3Rpb24oZmllbGQpIHtcbiAgICAgIGlmICghdmwuZmllbGQuaXNDb3VudChmaWVsZCkpIHtcbiAgICAgICAgZmllbGRTZXRzLnB1c2goW2ZpZWxkLCBjb3VudEZpZWxkXSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBmaWVsZFNldHMuZm9yRWFjaChmdW5jdGlvbihmaWVsZFNldCkge1xuICAgICAgLy8gYWx3YXlzIGFwcGVuZCBwcm9qZWN0aW9uJ3Mga2V5IHRvIGVhY2ggcHJvamVjdGlvbiByZXR1cm5lZCwgZDMgc3R5bGUuXG4gICAgZmllbGRTZXQua2V5ID0gcHJvamVjdGlvbnMua2V5KGZpZWxkU2V0KTtcbiAgfSk7XG5cbiAgcmV0dXJuIGZpZWxkU2V0cztcbn1cblxucHJvamVjdGlvbnMua2V5ID0gZnVuY3Rpb24ocHJvamVjdGlvbikge1xuICByZXR1cm4gcHJvamVjdGlvbi5tYXAoZnVuY3Rpb24oZmllbGQpIHtcbiAgICByZXR1cm4gdmwuZmllbGQuaXNDb3VudChmaWVsZCkgPyAnY291bnQnIDogZmllbGQubmFtZTtcbiAgfSkuam9pbignLCcpO1xufTtcbiIsInZhciBnID0gZ2xvYmFsIHx8IHdpbmRvdztcblxuZy5DSEFSVF9UWVBFUyA9IHtcbiAgVEFCTEU6ICdUQUJMRScsXG4gIEJBUjogJ0JBUicsXG4gIFBMT1Q6ICdQTE9UJyxcbiAgTElORTogJ0xJTkUnLFxuICBBUkVBOiAnQVJFQScsXG4gIE1BUDogJ01BUCcsXG4gIEhJU1RPR1JBTTogJ0hJU1RPR1JBTSdcbn07XG5cbmcuQU5ZX0RBVEFfVFlQRVMgPSAoMSA8PCA0KSAtIDE7IiwidmFyIHZsID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cudmwgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLnZsIDogbnVsbCk7XG5cbnZhciByYW5rID0gbW9kdWxlLmV4cG9ydHMgPSB7XG5cbn07XG5cbi8vVE9ETyBsb3dlciBzY29yZSBpZiB3ZSB1c2UgRyBhcyBPP1xudmFyIEVOQ09ESU5HX1NDT1JFID0ge1xuICBROiB7XG4gICAgeDogMSwgLy8gYmV0dGVyIGZvciBzaW5nbGUgcGxvdFxuICAgIHk6IDAuOTksXG4gICAgc2l6ZTogMC42LCAvL0ZJWE1FIFNJWkUgZm9yIEJhciBpcyBob3JyaWJsZSFcbiAgICBjb2xvcjogMC40LFxuICAgIGFscGhhOiAwLjRcbiAgfSxcbiAgTzogeyAvLyBUT0RPIG5lZWQgdG8gdGFrZSBjYXJkaW5hbGl0eSBpbnRvIGFjY291bnRcbiAgICB4OiAwLjk5LCAvLyBoYXJkZXIgdG8gcmVhZCBheGlzXG4gICAgeTogMSxcbiAgICByb3c6IDAuNyxcbiAgICBjb2w6IDAuNyxcbiAgICBjb2xvcjogMC44LFxuICAgIHNoYXBlOiAwLjZcbiAgfSxcbiAgVDogeyAvLyBGSVggcmV0aGluayB0aGlzXG4gICAgeDogMSxcbiAgICB5OiAwLjgsXG4gICAgcm93OiAwLjQsXG4gICAgY29sOiAwLjQsXG4gICAgY29sb3I6IDAuMyxcbiAgICBzaGFwZTogMC4zXG4gIH1cbn07XG5cbi8vIGJhZCBzY29yZSBub3Qgc3BlY2lmaWVkIGluIHRoZSB0YWJsZSBhYm92ZVxudmFyIEJBRF9FTkNPRElOR19TQ09SRSA9IDAuMDEsXG4gIFVOVVNFRF9QT1NJVElPTiA9IDAuNTtcblxudmFyIE1BUktfU0NPUkUgPSB7XG4gIGxpbmU6IDAuOTksXG4gIGFyZWE6IDAuOTgsXG4gIGJhcjogMC45NyxcbiAgcG9pbnQ6IDAuOTYsXG4gIGNpcmNsZTogMC45NSxcbiAgc3F1YXJlOiAwLjk1LFxuICB0ZXh0OiAwLjhcbn07XG5cbnJhbmsuZW5jb2RpbmcgPSBmdW5jdGlvbihlbmNvZGluZykge1xuICB2YXIgZmVhdHVyZXMgPSB7fSxcbiAgICBlbmNUeXBlcyA9IHZsLmtleXMoZW5jb2RpbmcuZW5jKTtcblxuICBlbmNUeXBlcy5mb3JFYWNoKGZ1bmN0aW9uKGVuY1R5cGUpIHtcbiAgICB2YXIgZmllbGQgPSBlbmNvZGluZy5lbmNbZW5jVHlwZV0sXG4gICAgICByb2xlID0gZW5jb2RpbmcuZW5jW2VuY1R5cGVdO1xuXG4gICAgZmVhdHVyZXNbZmllbGQubmFtZV0gPSB7XG4gICAgICB2YWx1ZTogZW5jVHlwZSArICc6JyArIGZpZWxkLnR5cGUsXG4gICAgICBzY29yZTogRU5DT0RJTkdfU0NPUkVbZmllbGQudHlwZV1bZW5jVHlwZV0gfHwgQkFEX0VOQ09ESU5HX1NDT1JFXG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gcGVuYWxpemUgbm90IHVzaW5nIHBvc2l0aW9uYWxcbiAgaWYgKGVuY1R5cGVzLmxlbmd0aCA+IDEpIHtcbiAgICBpZiAoKCFlbmNvZGluZy5lbmMueCB8fCAhZW5jb2RpbmcuZW5jLnkpICYmICFlbmNvZGluZy5lbmMuZ2VvICYmICFlbmNvZGluZy5lbmMudGV4dCkge1xuICAgICAgZmVhdHVyZXMudW51c2VkUG9zaXRpb24gPSB7c2NvcmU6IFVOVVNFRF9QT1NJVElPTn07XG4gICAgfVxuICB9XG5cbiAgZmVhdHVyZXMubWFya1R5cGUgPSB7XG4gICAgdmFsdWU6IGVuY29kaW5nLm1hcmt0eXBlLFxuICAgIHNjb3JlOiBNQVJLX1NDT1JFW2VuY29kaW5nLm1hcmt0eXBlXVxuICB9O1xuXG4gIHJldHVybiB7XG4gICAgc2NvcmU6IHZsLmtleXMoZmVhdHVyZXMpLnJlZHVjZShmdW5jdGlvbihwLCBzKSB7XG4gICAgICByZXR1cm4gcCAqIGZlYXR1cmVzW3NdLnNjb3JlO1xuICAgIH0sIDEpLFxuICAgIGZlYXR1cmVzOiBmZWF0dXJlc1xuICB9O1xufTtcblxuXG4vLyByYXcgPiBhdmcsIHN1bSA+IG1pbixtYXggPiBiaW5cblxucmFuay5maWVsZHNTY29yZSA9IGZ1bmN0aW9uKGZpZWxkcykge1xuXG59O1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIGNvbnN0cyA9IHJlcXVpcmUoJy4vY29uc3RzJyk7XG5cbnZhciB1dGlsID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdlbjoge31cbn07XG5cbnV0aWwuaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKG9iaikge1xuICByZXR1cm4ge30udG9TdHJpbmcuY2FsbChvYmopID09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG51dGlsLmpzb24gPSBmdW5jdGlvbihzLCBzcCkge1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocywgbnVsbCwgc3ApO1xufTtcblxudXRpbC5rZXlzID0gZnVuY3Rpb24ob2JqKSB7XG4gIHZhciBrID0gW10sIHg7XG4gIGZvciAoeCBpbiBvYmopIGsucHVzaCh4KTtcbiAgcmV0dXJuIGs7XG59O1xuXG51dGlsLm5lc3RlZE1hcCA9IGZ1bmN0aW9uIChjb2wsIGYsIGxldmVsLCBmaWx0ZXIpIHtcbiAgcmV0dXJuIGxldmVsID09PSAwID9cbiAgICBjb2wubWFwKGYpIDpcbiAgICBjb2wubWFwKGZ1bmN0aW9uKHYpIHtcbiAgICAgIHZhciByID0gdXRpbC5uZXN0ZWRNYXAodiwgZiwgbGV2ZWwgLSAxKTtcbiAgICAgIHJldHVybiBmaWx0ZXIgPyByLmZpbHRlcih1dGlsLm5vbkVtcHR5KSA6IHI7XG4gICAgfSk7XG59O1xuXG51dGlsLm5lc3RlZFJlZHVjZSA9IGZ1bmN0aW9uIChjb2wsIGYsIGxldmVsLCBmaWx0ZXIpIHtcbiAgcmV0dXJuIGxldmVsID09PSAwID9cbiAgICBjb2wucmVkdWNlKGYsIFtdKSA6XG4gICAgY29sLm1hcChmdW5jdGlvbih2KSB7XG4gICAgICB2YXIgciA9IHV0aWwubmVzdGVkUmVkdWNlKHYsIGYsIGxldmVsIC0gMSk7XG4gICAgICByZXR1cm4gZmlsdGVyID8gci5maWx0ZXIodXRpbC5ub25FbXB0eSkgOiByO1xuICAgIH0pO1xufTtcblxudXRpbC5ub25FbXB0eSA9IGZ1bmN0aW9uKGdycCkge1xuICByZXR1cm4gIXV0aWwuaXNBcnJheShncnApIHx8IGdycC5sZW5ndGggPiAwO1xufTtcblxuXG51dGlsLnRyYXZlcnNlID0gZnVuY3Rpb24gKG5vZGUsIGFycikge1xuICBpZiAobm9kZS52YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgYXJyLnB1c2gobm9kZS52YWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKG5vZGUubGVmdCkgdXRpbC50cmF2ZXJzZShub2RlLmxlZnQsIGFycik7XG4gICAgaWYgKG5vZGUucmlnaHQpIHV0aWwudHJhdmVyc2Uobm9kZS5yaWdodCwgYXJyKTtcbiAgfVxuICByZXR1cm4gYXJyO1xufTtcblxudXRpbC51bmlvbiA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIHZhciBvID0ge307XG4gIGEuZm9yRWFjaChmdW5jdGlvbih4KSB7IG9beF0gPSB0cnVlO30pO1xuICBiLmZvckVhY2goZnVuY3Rpb24oeCkgeyBvW3hdID0gdHJ1ZTt9KTtcbiAgcmV0dXJuIHV0aWwua2V5cyhvKTtcbn07XG5cblxudXRpbC5nZW4uZ2V0T3B0ID0gZnVuY3Rpb24gKG9wdCkge1xuICAvL21lcmdlIHdpdGggZGVmYXVsdFxuICByZXR1cm4gKG9wdCA/IHV0aWwua2V5cyhvcHQpIDogW10pLnJlZHVjZShmdW5jdGlvbihjLCBrKSB7XG4gICAgY1trXSA9IG9wdFtrXTtcbiAgICByZXR1cm4gYztcbiAgfSwgT2JqZWN0LmNyZWF0ZShjb25zdHMuZ2VuLkRFRkFVTFRfT1BUKSk7XG59O1xuXG4vKipcbiAqIHBvd2Vyc2V0IGNvZGUgZnJvbSBodHRwOi8vcm9zZXR0YWNvZGUub3JnL3dpa2kvUG93ZXJfU2V0I0phdmFTY3JpcHRcbiAqXG4gKiAgIHZhciByZXMgPSBwb3dlcnNldChbMSwyLDMsNF0pO1xuICpcbiAqIHJldHVybnNcbiAqXG4gKiBbW10sWzFdLFsyXSxbMSwyXSxbM10sWzEsM10sWzIsM10sWzEsMiwzXSxbNF0sWzEsNF0sXG4gKiBbMiw0XSxbMSwyLDRdLFszLDRdLFsxLDMsNF0sWzIsMyw0XSxbMSwyLDMsNF1dXG5bZWRpdF1cbiovXG5cbnV0aWwucG93ZXJzZXQgPSBmdW5jdGlvbihsaXN0KSB7XG4gIHZhciBwcyA9IFtcbiAgICBbXVxuICBdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICBmb3IgKHZhciBqID0gMCwgbGVuID0gcHMubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgIHBzLnB1c2gocHNbal0uY29uY2F0KGxpc3RbaV0pKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBzO1xufTtcblxudXRpbC5jaG9vc2VLb3JMZXNzID0gZnVuY3Rpb24obGlzdCwgaykge1xuICB2YXIgc3Vic2V0ID0gW1tdXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgZm9yICh2YXIgaiA9IDAsIGxlbiA9IHN1YnNldC5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgdmFyIHN1YiA9IHN1YnNldFtqXS5jb25jYXQobGlzdFtpXSk7XG4gICAgICBpZihzdWIubGVuZ3RoIDw9IGspe1xuICAgICAgICBzdWJzZXQucHVzaChzdWIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gc3Vic2V0O1xufTtcblxudXRpbC5jaG9vc2VLID0gZnVuY3Rpb24obGlzdCwgaykge1xuICB2YXIgc3Vic2V0ID0gW1tdXTtcbiAgdmFyIGtBcnJheSA9W107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIGZvciAodmFyIGogPSAwLCBsZW4gPSBzdWJzZXQubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgIHZhciBzdWIgPSBzdWJzZXRbal0uY29uY2F0KGxpc3RbaV0pO1xuICAgICAgaWYoc3ViLmxlbmd0aCA8IGspe1xuICAgICAgICBzdWJzZXQucHVzaChzdWIpO1xuICAgICAgfWVsc2UgaWYgKHN1Yi5sZW5ndGggPT09IGspe1xuICAgICAgICBrQXJyYXkucHVzaChzdWIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4ga0FycmF5O1xufTtcblxudXRpbC5jcm9zcyA9IGZ1bmN0aW9uKGEsYil7XG4gIHZhciB4ID0gW107XG4gIGZvcih2YXIgaT0wOyBpPCBhLmxlbmd0aDsgaSsrKXtcbiAgICBmb3IodmFyIGo9MDtqPCBiLmxlbmd0aDsgaisrKXtcbiAgICAgIHgucHVzaChhW2ldLmNvbmNhdChiW2pdKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiB4O1xufTtcblxuIl19
