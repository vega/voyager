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
    addCountIfNothingIsSelected: {
      type: 'boolean',
      default: true,
      description: 'When no field is selected, add extra count field'
    },
    omitDotPlot: {
      type: 'boolean',
      default: true,
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
    omitDotPlot: {
      type: 'boolean',
      default: true,
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
  return enc.x.type == 'T' && enc.y.type == 'Q';
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
    //FIXME load maxbins value from somewhere else
    return (opt.alwaysAddHistogram && selected.length === 0) ||
      !(opt.maxCardinalityForAutoAddOrdinal &&
        vl.field.isDimension(field) &&
        vl.field.cardinality(field, stats, 15) > opt.maxCardinalityForAutoAddOrdinal);
  });

  // put count on top!
  unselected.sort(function(a, b){
    if(a.aggr==='count') return -1;
    if(b.aggr==='count') return 1;
    return 0;
  });

  var setsToAdd = util.chooseKorLess(unselected, 1);

  setsToAdd.forEach(function(setToAdd) {
    var fieldSet = selected.concat(setToAdd);
    if (fieldSet.length > 0) {
      if (fieldSet.length === 1 && vl.field.isCount(fieldSet[0])) {
        return;
      }

      if (opt.omitDotPlot && fieldSet.length === 1) return;

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
    var field = encoding.enc[encType];
    features[field.name] = {
      value: field.type + ':'+ encType,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvdnIiLCJzcmMvY2x1c3Rlci9jbHVzdGVyLmpzIiwic3JjL2NsdXN0ZXIvY2x1c3RlcmNvbnN0cy5qcyIsInNyYy9jbHVzdGVyL2Rpc3RhbmNldGFibGUuanMiLCJzcmMvY29uc3RzLmpzIiwic3JjL2dlbi9hZ2dyZWdhdGVzLmpzIiwic3JjL2dlbi9lbmNvZGluZ3MuanMiLCJzcmMvZ2VuL2VuY3MuanMiLCJzcmMvZ2VuL2dlbi5qcyIsInNyYy9nZW4vbWFya3R5cGVzLmpzIiwic3JjL2dlbi9wcm9qZWN0aW9ucy5qcyIsInNyYy9nbG9iYWxzLmpzIiwic3JjL3JhbmsvcmFuay5qcyIsInNyYy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDOUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDbExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciB2ciA9IG1vZHVsZS5leHBvcnRzID0ge1xuICBjbHVzdGVyOiByZXF1aXJlKCcuL2NsdXN0ZXIvY2x1c3RlcicpLFxuICBnZW46IHJlcXVpcmUoJy4vZ2VuL2dlbicpLFxuICByYW5rOiByZXF1aXJlKCcuL3JhbmsvcmFuaycpLFxuICB1dGlsOiByZXF1aXJlKCcuL3V0aWwnKVxufTtcblxuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBjbHVzdGVyO1xuXG52YXIgdmwgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy52bCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwudmwgOiBudWxsKSxcbiAgY2x1c3RlcmZjayA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LmNsdXN0ZXJmY2sgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLmNsdXN0ZXJmY2sgOiBudWxsKSxcbiAgY29uc3RzID0gcmVxdWlyZSgnLi9jbHVzdGVyY29uc3RzJyksXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cbnZhciBkaXN0YW5jZVRhYmxlID0gY2x1c3Rlci5kaXN0YW5jZVRhYmxlID0gcmVxdWlyZSgnLi9kaXN0YW5jZXRhYmxlJyk7XG5cblxuZnVuY3Rpb24gY2x1c3RlcihlbmNvZGluZ3MsIG1heERpc3RhbmNlKSB7XG4gIHZhciBkaXN0ID0gZGlzdGFuY2VUYWJsZShlbmNvZGluZ3MpLFxuICAgIG4gPSBlbmNvZGluZ3MubGVuZ3RoO1xuXG4gIHZhciBjbHVzdGVyVHJlZXMgPSBjbHVzdGVyZmNrLmhjbHVzdGVyKHZsLnJhbmdlKG4pLCBmdW5jdGlvbihpLCBqKSB7XG4gICAgcmV0dXJuIGRpc3RbaV1bal07XG4gIH0sICdhdmVyYWdlJywgY29uc3RzLkNMVVNURVJfVEhSRVNIT0xEKTtcblxuICB2YXIgY2x1c3RlcnMgPSBjbHVzdGVyVHJlZXMubWFwKGZ1bmN0aW9uKHRyZWUpIHtcbiAgICByZXR1cm4gdXRpbC50cmF2ZXJzZSh0cmVlLCBbXSk7XG4gIH0pO1xuXG4gIC8vY29uc29sZS5sb2coXCJjbHVzdGVyc1wiLCBjbHVzdGVycy5tYXAoZnVuY3Rpb24oYyl7IHJldHVybiBjLmpvaW4oXCIrXCIpOyB9KSk7XG4gIHJldHVybiBjbHVzdGVycztcbn07IiwidmFyIGMgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5jLkRJU1RfQllfRU5DVFlQRSA9IFtcbiAgLy8gcG9zaXRpb25hbFxuICBbJ3gnLCAneScsIDAuMl0sXG4gIFsncm93JywgJ2NvbCcsIDAuMl0sXG5cbiAgLy8gb3JkaW5hbCBtYXJrIHByb3BlcnRpZXNcbiAgWydjb2xvcicsICdzaGFwZScsIDAuMl0sXG5cbiAgLy8gcXVhbnRpdGF0aXZlIG1hcmsgcHJvcGVydGllc1xuICBbJ2NvbG9yJywgJ2FscGhhJywgMC4yXSxcbiAgWydzaXplJywgJ2FscGhhJywgMC4yXSxcbiAgWydzaXplJywgJ2NvbG9yJywgMC4yXVxuXS5yZWR1Y2UoZnVuY3Rpb24ociwgeCkge1xudmFyIGEgPSB4WzBdLCBiID0geFsxXSwgZCA9IHhbMl07XG4gIHJbYV0gPSByW2FdIHx8IHt9O1xuICByW2JdID0gcltiXSB8fCB7fTtcbiAgclthXVtiXSA9IHJbYl1bYV0gPSBkO1xuICByZXR1cm4gcjtcbn0sIHt9KTtcblxuYy5ESVNUX01JU1NJTkcgPSAxMDA7XG5cbmMuQ0xVU1RFUl9USFJFU0hPTEQgPSAxOyIsInZhciB2bCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LnZsIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC52bCA6IG51bGwpLFxuICBjb25zdHMgPSByZXF1aXJlKCcuL2NsdXN0ZXJjb25zdHMnKSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBkaXN0YW5jZVRhYmxlO1xuXG5mdW5jdGlvbiBkaXN0YW5jZVRhYmxlKGVuY29kaW5ncykge1xuICB2YXIgbGVuID0gZW5jb2RpbmdzLmxlbmd0aCxcbiAgICBjb2xlbmNzID0gZW5jb2RpbmdzLm1hcChmdW5jdGlvbihlKSB7IHJldHVybiBjb2xlbmMoZSk7fSksXG4gICAgZGlmZiA9IG5ldyBBcnJheShsZW4pLCBpLCBqO1xuXG4gIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykgZGlmZltpXSA9IG5ldyBBcnJheShsZW4pO1xuXG4gIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIGZvciAoaiA9IGkgKyAxOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgIGRpZmZbal1baV0gPSBkaWZmW2ldW2pdID0gZ2V0RGlzdGFuY2UoY29sZW5jc1tpXSwgY29sZW5jc1tqXSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBkaWZmO1xufVxuXG5mdW5jdGlvbiBnZXREaXN0YW5jZShjb2xlbmMxLCBjb2xlbmMyKSB7XG4gIHZhciBjb2xzID0gdXRpbC51bmlvbih2bC5rZXlzKGNvbGVuYzEuY29sKSwgdmwua2V5cyhjb2xlbmMyLmNvbCkpLFxuICAgIGRpc3QgPSAwO1xuXG4gIGNvbHMuZm9yRWFjaChmdW5jdGlvbihjb2wpIHtcbiAgICB2YXIgZTEgPSBjb2xlbmMxLmNvbFtjb2xdLCBlMiA9IGNvbGVuYzIuY29sW2NvbF07XG5cbiAgICBpZiAoZTEgJiYgZTIpIHtcbiAgICAgIGlmIChlMS50eXBlICE9IGUyLnR5cGUpIHtcbiAgICAgICAgZGlzdCArPSAoY29uc3RzLkRJU1RfQllfRU5DVFlQRVtlMS50eXBlXSB8fCB7fSlbZTIudHlwZV0gfHwgMTtcbiAgICAgIH1cbiAgICAgIC8vRklYTUUgYWRkIGFnZ3JlZ2F0aW9uXG4gICAgfSBlbHNlIHtcbiAgICAgIGRpc3QgKz0gY29uc3RzLkRJU1RfTUlTU0lORztcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gZGlzdDtcbn1cblxuZnVuY3Rpb24gY29sZW5jKGVuY29kaW5nKSB7XG4gIHZhciBfY29sZW5jID0ge30sXG4gICAgZW5jID0gZW5jb2RpbmcuZW5jO1xuXG4gIHZsLmtleXMoZW5jKS5mb3JFYWNoKGZ1bmN0aW9uKGVuY1R5cGUpIHtcbiAgICB2YXIgZSA9IHZsLmR1cGxpY2F0ZShlbmNbZW5jVHlwZV0pO1xuICAgIGUudHlwZSA9IGVuY1R5cGU7XG4gICAgX2NvbGVuY1tlLm5hbWUgfHwgJyddID0gZTtcbiAgICBkZWxldGUgZS5uYW1lO1xuICB9KTtcblxuICByZXR1cm4ge1xuICAgIG1hcmt0eXBlOiBlbmNvZGluZy5tYXJrdHlwZSxcbiAgICBjb2w6IF9jb2xlbmNcbiAgfTtcbn0iLCJ2YXIgY29uc3RzID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdlbjoge30sXG4gIGNsdXN0ZXI6IHt9LFxuICByYW5rOiB7fVxufTtcblxuY29uc3RzLmdlbi5wcm9qZWN0aW9ucyA9IHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHByb3BlcnRpZXM6IHtcbiAgICBhZGRDb3VudElmTm90aGluZ0lzU2VsZWN0ZWQ6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ1doZW4gbm8gZmllbGQgaXMgc2VsZWN0ZWQsIGFkZCBleHRyYSBjb3VudCBmaWVsZCdcbiAgICB9LFxuICAgIG9taXREb3RQbG90OiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgZGVzY3JpcHRpb246ICdyZW1vdmUgYWxsIGRvdCBwbG90cydcbiAgICB9LFxuICAgIG1heENhcmRpbmFsaXR5Rm9yQXV0b0FkZE9yZGluYWw6IHtcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgIGRlZmF1bHQ6IDUwLFxuICAgICAgZGVzY3JpcHRpb246ICdtYXggY2FyZGluYWxpdHkgZm9yIG9yZGluYWwgZmllbGQgdG8gYmUgY29uc2lkZXJlZCBmb3IgYXV0byBhZGRpbmcnXG4gICAgfSxcbiAgICBhbHdheXNBZGRIaXN0b2dyYW06IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICB9XG4gIH1cbn07XG5cbmNvbnN0cy5nZW4uYWdncmVnYXRlcyA9IHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHByb3BlcnRpZXM6IHtcbiAgICBnZW5CaW46IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ0dlbmVyYXRlIEJpbm5pbmcnXG4gICAgfSxcbiAgICBnZW5UeXBlQ2FzdGluZzoge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnSW5jbHVkZSB0eXBlIGNhc3RpbmcgZS5nLiwgZnJvbSBRIHRvIE8nXG4gICAgfSxcbiAgICBvbWl0TWVhc3VyZU9ubHk6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ09taXQgYWdncmVnYXRpb24gd2l0aCBtZWFzdXJlKHMpIG9ubHknXG4gICAgfSxcbiAgICBvbWl0RGltZW5zaW9uT25seToge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnT21pdCBhZ2dyZWdhdGlvbiB3aXRoIGRpbWVuc2lvbihzKSBvbmx5J1xuICAgIH0sXG4gICAgYWdnckxpc3Q6IHtcbiAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICBpdGVtczoge1xuICAgICAgICB0eXBlOiBbJ3N0cmluZyddXG4gICAgICB9LFxuICAgICAgZGVmYXVsdDogW3VuZGVmaW5lZCwgJ2F2ZyddXG4gICAgfSxcbiAgICB0aW1lRm5MaXN0OiB7XG4gICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgaXRlbXM6IHtcbiAgICAgICAgdHlwZTogWydzdHJpbmcnXVxuICAgICAgfSxcbiAgICAgIGRlZmF1bHQ6IFsneWVhciddXG4gICAgfVxuICB9XG59O1xuXG5jb25zdHMuZ2VuLmVuY29kaW5ncyA9IHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHByb3BlcnRpZXM6IHtcbiAgICBvbWl0VHJhbnBvc2U6ICB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgZGVzY3JpcHRpb246ICdFbGltaW5hdGUgYWxsIHRyYW5zcG9zZSBieSAoMSkga2VlcGluZyBob3Jpem9udGFsIGRvdCBwbG90IG9ubHkgKDIpIGZvciBPeFEgY2hhcnRzLCBhbHdheXMgcHV0IE8gb24gWSAoMykgc2hvdyBvbmx5IG9uZSBEeEQsIE14TSAoY3VycmVudGx5IHNvcnRlZCBieSBuYW1lKSdcbiAgICB9LFxuICAgIG9taXREb3RQbG90OiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgZGVzY3JpcHRpb246ICdyZW1vdmUgYWxsIGRvdCBwbG90cydcbiAgICB9LFxuICAgIG9taXREb3RQbG90V2l0aEV4dHJhRW5jb2Rpbmc6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ3JlbW92ZSBhbGwgZG90IHBsb3RzIHdpdGggPjEgZW5jb2RpbmcnXG4gICAgfSxcbiAgICBvbWl0Tm9uVGV4dEFnZ3JXaXRoQWxsRGltc09uRmFjZXRzOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgZGVzY3JpcHRpb246ICdyZW1vdmUgYWxsIGFnZ3JlZ2F0ZWQgY2hhcnRzIChleGNlcHQgdGV4dCB0YWJsZXMpIHdpdGggYWxsIGRpbXMgb24gZmFjZXRzIChyb3csIGNvbCknXG4gICAgfSxcbiAgICBvbWl0U2l6ZU9uQmFyOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnZG8gbm90IHVzZSBiYXJcXCdzIHNpemUnXG4gICAgfSxcbiAgICBtYXJrdHlwZUxpc3Q6IHtcbiAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICBpdGVtczoge3R5cGU6ICdzdHJpbmcnfSxcbiAgICAgIGRlZmF1bHQ6IFsncG9pbnQnLCAnYmFyJywgJ2xpbmUnLCAnYXJlYScsICd0ZXh0J10sIC8vZmlsbGVkX21hcFxuICAgICAgZGVzY3JpcHRpb246ICdhbGxvd2VkIG1hcmt0eXBlcydcbiAgICB9XG4gIH1cbn07XG5cblxuXG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB2bCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LnZsIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC52bCA6IG51bGwpO1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKSxcbiAgY29uc3RzID0gcmVxdWlyZSgnLi4vY29uc3RzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZ2VuQWdncmVnYXRlcztcblxuZnVuY3Rpb24gZ2VuQWdncmVnYXRlcyhvdXRwdXQsIGZpZWxkcywgb3B0KSB7XG4gIG9wdCA9IHZsLnNjaGVtYS51dGlsLmV4dGVuZChvcHR8fHt9LCBjb25zdHMuZ2VuLmFnZ3JlZ2F0ZXMpO1xuICB2YXIgdGYgPSBuZXcgQXJyYXkoZmllbGRzLmxlbmd0aCk7XG5cbiAgZnVuY3Rpb24gY2hlY2tBbmRQdXNoKCkge1xuICAgIGlmIChvcHQub21pdE1lYXN1cmVPbmx5IHx8IG9wdC5vbWl0RGltZW5zaW9uT25seSkge1xuICAgICAgdmFyIGhhc01lYXN1cmUgPSBmYWxzZSwgaGFzRGltZW5zaW9uID0gZmFsc2UsIGhhc1JhdyA9IGZhbHNlO1xuICAgICAgdGYuZm9yRWFjaChmdW5jdGlvbihmKSB7XG4gICAgICAgIGlmICh2bC5maWVsZC5pc0RpbWVuc2lvbihmKSkge1xuICAgICAgICAgIGhhc0RpbWVuc2lvbiA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaGFzTWVhc3VyZSA9IHRydWU7XG4gICAgICAgICAgaWYgKCFmLmFnZ3IpIGhhc1JhdyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaWYgKCFoYXNNZWFzdXJlICYmIG9wdC5vbWl0RGltZW5zaW9uT25seSkgcmV0dXJuO1xuICAgICAgaWYgKCFoYXNEaW1lbnNpb24gJiYgIWhhc1JhdyAmJiBvcHQub21pdE1lYXN1cmVPbmx5KSByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGZpZWxkU2V0ID0gdmwuZHVwbGljYXRlKHRmKTtcbiAgICBmaWVsZFNldC5rZXkgPSB2bC5maWVsZC5zaG9ydGhhbmRzKGZpZWxkU2V0KTtcblxuICAgIG91dHB1dC5wdXNoKGZpZWxkU2V0KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFzc2lnblEoaSwgaGFzQWdncikge1xuICAgIHZhciBmID0gZmllbGRzW2ldLFxuICAgICAgY2FuSGF2ZUFnZ3IgPSBoYXNBZ2dyID09PSB0cnVlIHx8IGhhc0FnZ3IgPT09IG51bGwsXG4gICAgICBjYW50SGF2ZUFnZ3IgPSBoYXNBZ2dyID09PSBmYWxzZSB8fCBoYXNBZ2dyID09PSBudWxsO1xuXG4gICAgdGZbaV0gPSB7bmFtZTogZi5uYW1lLCB0eXBlOiBmLnR5cGV9O1xuXG4gICAgaWYgKGYuYWdncikge1xuICAgICAgaWYgKGNhbkhhdmVBZ2dyKSB7XG4gICAgICAgIHRmW2ldLmFnZ3IgPSBmLmFnZ3I7XG4gICAgICAgIGFzc2lnbkZpZWxkKGkgKyAxLCB0cnVlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGFnZ3JlZ2F0ZXMgPSAoIWYuX2FnZ3IgfHwgZi5fYWdnciA9PT0gJyonKSA/IG9wdC5hZ2dyTGlzdCA6IGYuX2FnZ3I7XG5cbiAgICAgIGZvciAodmFyIGogaW4gYWdncmVnYXRlcykge1xuICAgICAgICB2YXIgYSA9IGFnZ3JlZ2F0ZXNbal07XG4gICAgICAgIGlmIChhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBpZiAoY2FuSGF2ZUFnZ3IpIHtcbiAgICAgICAgICAgIHRmW2ldLmFnZ3IgPSBhO1xuICAgICAgICAgICAgYXNzaWduRmllbGQoaSArIDEsIHRydWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHsgLy8gaWYoYSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgIGlmIChjYW50SGF2ZUFnZ3IpIHtcbiAgICAgICAgICAgIGRlbGV0ZSB0ZltpXS5hZ2dyO1xuICAgICAgICAgICAgYXNzaWduRmllbGQoaSArIDEsIGZhbHNlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKG9wdC5nZW5CaW4pIHtcbiAgICAgICAgLy8gYmluIHRoZSBmaWVsZCBpbnN0ZWFkIVxuICAgICAgICBkZWxldGUgdGZbaV0uYWdncjtcbiAgICAgICAgdGZbaV0uYmluID0gdHJ1ZTtcbiAgICAgICAgdGZbaV0udHlwZSA9ICdRJztcbiAgICAgICAgYXNzaWduRmllbGQoaSArIDEsIGhhc0FnZ3IpO1xuICAgICAgfVxuXG4gICAgICBpZiAob3B0LmdlblR5cGVDYXN0aW5nKSB7XG4gICAgICAgIC8vIHdlIGNhbiBhbHNvIGNoYW5nZSBpdCB0byBkaW1lbnNpb24gKGNhc3QgdHlwZT1cIk9cIilcbiAgICAgICAgZGVsZXRlIHRmW2ldLmFnZ3I7XG4gICAgICAgIGRlbGV0ZSB0ZltpXS5iaW47XG4gICAgICAgIHRmW2ldLnR5cGUgPSAnTyc7XG4gICAgICAgIGFzc2lnbkZpZWxkKGkgKyAxLCBoYXNBZ2dyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBhc3NpZ25UKGksIGhhc0FnZ3IpIHtcbiAgICB2YXIgZiA9IGZpZWxkc1tpXTtcbiAgICB0ZltpXSA9IHtuYW1lOiBmLm5hbWUsIHR5cGU6IGYudHlwZX07XG5cbiAgICBpZiAoZi5mbikge1xuICAgICAgLy8gRklYTUUgZGVhbCB3aXRoIGFzc2lnbmVkIGZ1bmN0aW9uXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBmbnMgPSAoIWYuX2ZuIHx8IGYuX2ZuID09PSAnKicpID8gb3B0LnRpbWVGbkxpc3QgOiBmLl9mbjtcbiAgICAgIGZvciAodmFyIGogaW4gZm5zKSB7XG4gICAgICAgIHZhciBmbiA9IGZuc1tqXTtcbiAgICAgICAgaWYgKGZuID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBhc3NpZ25GaWVsZChpKzEsIGhhc0FnZ3IpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRmW2ldLmZuID0gZm47XG4gICAgICAgICAgYXNzaWduRmllbGQoaSsxLCBoYXNBZ2dyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICAvLyBGSVhNRSB3aGF0IGlmIHlvdSBhZ2dyZWdhdGUgdGltZT9cblxuICB9XG5cbiAgZnVuY3Rpb24gYXNzaWduRmllbGQoaSwgaGFzQWdncikge1xuICAgIGlmIChpID09PSBmaWVsZHMubGVuZ3RoKSB7IC8vIElmIGFsbCBmaWVsZHMgYXJlIGFzc2lnbmVkXG4gICAgICBjaGVja0FuZFB1c2goKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgZiA9IGZpZWxkc1tpXTtcbiAgICAvLyBPdGhlcndpc2UsIGFzc2lnbiBpLXRoIGZpZWxkXG4gICAgc3dpdGNoIChmLnR5cGUpIHtcbiAgICAgIC8vVE9ETyBcIkRcIiwgXCJHXCJcbiAgICAgIGNhc2UgJ1EnOlxuICAgICAgICBhc3NpZ25RKGksIGhhc0FnZ3IpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnVCc6XG4gICAgICAgIGFzc2lnblQoaSwgaGFzQWdncik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdPJzpcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRmW2ldID0gZjtcbiAgICAgICAgYXNzaWduRmllbGQoaSArIDEsIGhhc0FnZ3IpO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgfVxuXG4gIGFzc2lnbkZpZWxkKDAsIG51bGwpO1xuXG4gIHJldHVybiBvdXRwdXQ7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB2bCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LnZsIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC52bCA6IG51bGwpLFxuICBnZW5FbmNzID0gcmVxdWlyZSgnLi9lbmNzJyksXG4gIGdldE1hcmt0eXBlcyA9IHJlcXVpcmUoJy4vbWFya3R5cGVzJyksXG4gIHJhbmsgPSByZXF1aXJlKCcuLi9yYW5rL3JhbmsnKSxcbiAgY29uc3RzID0gcmVxdWlyZSgnLi4vY29uc3RzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZ2VuRW5jb2RpbmdzRnJvbUZpZWxkcztcblxuZnVuY3Rpb24gZ2VuRW5jb2RpbmdzRnJvbUZpZWxkcyhvdXRwdXQsIGZpZWxkcywgc3RhdHMsIG9wdCwgY2ZnLCBuZXN0ZWQpIHtcbiAgdmFyIGVuY3MgPSBnZW5FbmNzKFtdLCBmaWVsZHMsIHN0YXRzLCBvcHQpO1xuXG4gIGlmIChuZXN0ZWQpIHtcbiAgICByZXR1cm4gZW5jcy5yZWR1Y2UoZnVuY3Rpb24oZGljdCwgZW5jKSB7XG4gICAgICBkaWN0W2VuY10gPSBnZW5FbmNvZGluZ3NGcm9tRW5jcyhbXSwgZW5jLCBvcHQsIGNmZyk7XG4gICAgICByZXR1cm4gZGljdDtcbiAgICB9LCB7fSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGVuY3MucmVkdWNlKGZ1bmN0aW9uKGxpc3QsIGVuYykge1xuICAgICAgcmV0dXJuIGdlbkVuY29kaW5nc0Zyb21FbmNzKGxpc3QsIGVuYywgb3B0LCBjZmcpO1xuICAgIH0sIFtdKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZW5FbmNvZGluZ3NGcm9tRW5jcyhvdXRwdXQsIGVuYywgb3B0LCBjZmcpIHtcbiAgZ2V0TWFya3R5cGVzKGVuYywgb3B0KVxuICAgIC5mb3JFYWNoKGZ1bmN0aW9uKG1hcmtUeXBlKSB7XG4gICAgICB2YXIgZW5jb2RpbmcgPSB7IG1hcmt0eXBlOiBtYXJrVHlwZSwgZW5jOiBlbmMsIGNmZzogY2ZnIH0sXG4gICAgICAgIHNjb3JlID0gcmFuay5lbmNvZGluZyhlbmNvZGluZyk7XG4gICAgICBlbmNvZGluZy5zY29yZSA9IHNjb3JlLnNjb3JlO1xuICAgICAgZW5jb2Rpbmcuc2NvcmVGZWF0dXJlcyA9IHNjb3JlLmZlYXR1cmVzO1xuICAgICAgb3V0cHV0LnB1c2goZW5jb2RpbmcpO1xuICAgIH0pO1xuICByZXR1cm4gb3V0cHV0O1xufSIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgdmwgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy52bCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwudmwgOiBudWxsKSxcbiAgZ2xvYmFscyA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKSxcbiAgY29uc3RzID0gcmVxdWlyZSgnLi4vY29uc3RzJyksXG4gIGdlbk1hcmtUeXBlcyA9IHJlcXVpcmUoJy4vbWFya3R5cGVzJyksXG4gIGlzRGltZW5zaW9uID0gdmwuZmllbGQuaXNEaW1lbnNpb24sXG4gIGlzTWVhc3VyZSA9IHZsLmZpZWxkLmlzTWVhc3VyZTtcblxubW9kdWxlLmV4cG9ydHMgPSBnZW5FbmNzO1xuXG52YXIgcnVsZXMgPSB7XG4gIHg6IHtcbiAgICBkaW1lbnNpb246IHRydWUsXG4gICAgbWVhc3VyZTogdHJ1ZSxcbiAgICBtdWx0aXBsZTogdHJ1ZSAvL0ZJWE1FIHNob3VsZCBhbGxvdyBtdWx0aXBsZSBvbmx5IGZvciBRLCBUXG4gIH0sXG4gIHk6IHtcbiAgICBkaW1lbnNpb246IHRydWUsXG4gICAgbWVhc3VyZTogdHJ1ZSxcbiAgICBtdWx0aXBsZTogdHJ1ZSAvL0ZJWE1FIHNob3VsZCBhbGxvdyBtdWx0aXBsZSBvbmx5IGZvciBRLCBUXG4gIH0sXG4gIHJvdzoge1xuICAgIGRpbWVuc2lvbjogdHJ1ZSxcbiAgICBtdWx0aXBsZTogdHJ1ZVxuICB9LFxuICBjb2w6IHtcbiAgICBkaW1lbnNpb246IHRydWUsXG4gICAgbXVsdGlwbGU6IHRydWVcbiAgfSxcbiAgc2hhcGU6IHtcbiAgICBkaW1lbnNpb246IHRydWVcbiAgfSxcbiAgc2l6ZToge1xuICAgIG1lYXN1cmU6IHRydWVcbiAgfSxcbiAgY29sb3I6IHtcbiAgICBkaW1lbnNpb246IHRydWUsXG4gICAgbWVhc3VyZTogdHJ1ZVxuICB9LFxuICBhbHBoYToge1xuICAgIG1lYXN1cmU6IHRydWVcbiAgfSxcbiAgdGV4dDoge1xuICAgIG1lYXN1cmU6IHRydWVcbiAgfSxcbiAgZGV0YWlsOiB7XG4gICAgZGltZW5zaW9uOiB0cnVlXG4gIH1cbiAgLy9nZW86IHtcbiAgLy8gIGdlbzogdHJ1ZVxuICAvL30sXG4gIC8vYXJjOiB7IC8vIHBpZVxuICAvL1xuICAvL31cbn07XG5cbmZ1bmN0aW9uIG1heENhcmRpbmFsaXR5KGZpZWxkLCBzdGF0cykge1xuICByZXR1cm4gc3RhdHNbZmllbGRdLmNhcmRpbmFsaXR5IDw9IDIwO1xufVxuXG5mdW5jdGlvbiBkaW1NZWFUcmFuc3Bvc2VSdWxlKGVuYykge1xuICAvLyBjcmVhdGUgaG9yaXpvbnRhbCBoaXN0b2dyYW0gZm9yIG9yZGluYWxcbiAgaWYgKGVuYy55LnR5cGUgPT09ICdPJyAmJiBpc01lYXN1cmUoZW5jLngpKSByZXR1cm4gdHJ1ZTtcblxuICAvLyB2ZXJ0aWNhbCBoaXN0b2dyYW0gZm9yIFEgYW5kIFRcbiAgaWYgKGlzTWVhc3VyZShlbmMueSkgJiYgKGVuYy54LnR5cGUgIT09ICdPJyAmJiBpc0RpbWVuc2lvbihlbmMueCkpKSByZXR1cm4gdHJ1ZTtcblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGdlbmVyYWxSdWxlcyhlbmMsIG9wdCkge1xuICAvLyBlbmMudGV4dCBpcyBvbmx5IHVzZWQgZm9yIFRFWFQgVEFCTEVcbiAgaWYgKGVuYy50ZXh0KSB7XG4gICAgcmV0dXJuIGdlbk1hcmtUeXBlcy5zYXRpc2Z5UnVsZXMoZW5jLCAndGV4dCcsIG9wdCk7XG4gIH1cblxuICAvLyBDQVJURVNJQU4gUExPVCBPUiBNQVBcbiAgaWYgKGVuYy54IHx8IGVuYy55IHx8IGVuYy5nZW8gfHwgZW5jLmFyYykge1xuXG4gICAgaWYgKGVuYy5yb3cgfHwgZW5jLmNvbCkgeyAvL2hhdmUgZmFjZXQocylcbiAgICAgIGlmICghZW5jLnggfHwgIWVuYy55KSB7XG4gICAgICAgIHJldHVybiBmYWxzZTsgLy8gZG9uJ3QgdXNlIGZhY2V0cyBiZWZvcmUgZmlsbGluZyB1cCB4LHlcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdC5vbWl0Tm9uVGV4dEFnZ3JXaXRoQWxsRGltc09uRmFjZXRzKSB7XG4gICAgICAgIC8vIHJlbW92ZSBhbGwgYWdncmVnYXRlZCBjaGFydHMgd2l0aCBhbGwgZGltcyBvbiBmYWNldHMgKHJvdywgY29sKVxuICAgICAgICBpZiAoZ2VuRW5jcy5pc0FnZ3JXaXRoQWxsRGltT25GYWNldHMoZW5jKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChlbmMueCAmJiBlbmMueSkge1xuICAgICAgaWYgKG9wdC5vbWl0VHJhbnBvc2UpIHtcbiAgICAgICAgaWYgKGlzRGltZW5zaW9uKGVuYy54KSBeIGlzRGltZW5zaW9uKGVuYy55KSkgeyAvLyBkaW0geCBtZWFcbiAgICAgICAgICBpZiAoIWRpbU1lYVRyYW5zcG9zZVJ1bGUoZW5jKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKGVuYy55LnR5cGU9PT0nVCcgfHwgZW5jLngudHlwZSA9PT0gJ1QnKSB7XG4gICAgICAgICAgaWYgKGVuYy55LnR5cGU9PT0nVCcgJiYgZW5jLngudHlwZSAhPT0gJ1QnKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7IC8vIHNob3cgb25seSBvbmUgT3hPLCBReFFcbiAgICAgICAgICBpZiAoZW5jLngubmFtZSA+IGVuYy55Lm5hbWUpIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gRE9UIFBMT1RTXG4gICAgLy8gLy8gcGxvdCB3aXRoIG9uZSBheGlzID0gZG90IHBsb3RcbiAgICBpZiAob3B0Lm9taXREb3RQbG90KSByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBEb3QgcGxvdCBzaG91bGQgYWx3YXlzIGJlIGhvcml6b250YWxcbiAgICBpZiAob3B0Lm9taXRUcmFucG9zZSAmJiBlbmMueSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gZG90IHBsb3Qgc2hvdWxkbid0IGhhdmUgb3RoZXIgZW5jb2RpbmdcbiAgICBpZiAob3B0Lm9taXREb3RQbG90V2l0aEV4dHJhRW5jb2RpbmcgJiYgdmwua2V5cyhlbmMpLmxlbmd0aCA+IDEpIHJldHVybiBmYWxzZTtcblxuICAgIC8vIG9uZSBkaW1lbnNpb24gXCJjb3VudFwiIGlzIHVzZWxlc3NcbiAgICBpZiAoZW5jLnggJiYgZW5jLnguYWdnciA9PSAnY291bnQnICYmICFlbmMueSkgcmV0dXJuIGZhbHNlO1xuICAgIGlmIChlbmMueSAmJiBlbmMueS5hZ2dyID09ICdjb3VudCcgJiYgIWVuYy54KSByZXR1cm4gZmFsc2U7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmdlbkVuY3MuaXNBZ2dyV2l0aEFsbERpbU9uRmFjZXRzID0gZnVuY3Rpb24gKGVuYykge1xuICB2YXIgaGFzQWdnciA9IGZhbHNlLCBoYXNPdGhlck8gPSBmYWxzZTtcbiAgZm9yICh2YXIgZW5jVHlwZSBpbiBlbmMpIHtcbiAgICB2YXIgZmllbGQgPSBlbmNbZW5jVHlwZV07XG4gICAgaWYgKGZpZWxkLmFnZ3IpIHtcbiAgICAgIGhhc0FnZ3IgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAodmwuZmllbGQuaXNEaW1lbnNpb24oZmllbGQpICYmIChlbmNUeXBlICE9PSAncm93JyAmJiBlbmNUeXBlICE9PSAnY29sJykpIHtcbiAgICAgIGhhc090aGVyTyA9IHRydWU7XG4gICAgfVxuICAgIGlmIChoYXNBZ2dyICYmIGhhc090aGVyTykgYnJlYWs7XG4gIH1cblxuICByZXR1cm4gaGFzQWdnciAmJiAhaGFzT3RoZXJPO1xufTtcblxuXG5mdW5jdGlvbiBnZW5FbmNzKGVuY3MsIGZpZWxkcywgc3RhdHMsIG9wdCkge1xuICBvcHQgPSB2bC5zY2hlbWEudXRpbC5leHRlbmQob3B0fHx7fSwgY29uc3RzLmdlbi5lbmNvZGluZ3MpO1xuICAvLyBnZW5lcmF0ZSBhIGNvbGxlY3Rpb24gdmVnYWxpdGUncyBlbmNcbiAgdmFyIHRtcEVuYyA9IHt9O1xuXG4gIGZ1bmN0aW9uIGFzc2lnbkZpZWxkKGkpIHtcbiAgICAvLyBJZiBhbGwgZmllbGRzIGFyZSBhc3NpZ25lZCwgc2F2ZVxuICAgIGlmIChpID09PSBmaWVsZHMubGVuZ3RoKSB7XG4gICAgICAvLyBhdCB0aGUgbWluaW1hbCBhbGwgY2hhcnQgc2hvdWxkIGhhdmUgeCwgeSwgZ2VvLCB0ZXh0IG9yIGFyY1xuICAgICAgaWYgKGdlbmVyYWxSdWxlcyh0bXBFbmMsIG9wdCkpIHtcbiAgICAgICAgZW5jcy5wdXNoKHZsLmR1cGxpY2F0ZSh0bXBFbmMpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBPdGhlcndpc2UsIGFzc2lnbiBpLXRoIGZpZWxkXG4gICAgdmFyIGZpZWxkID0gZmllbGRzW2ldO1xuICAgIGZvciAodmFyIGogaW4gdmwuZW5jb2RpbmdUeXBlcykge1xuICAgICAgdmFyIGV0ID0gdmwuZW5jb2RpbmdUeXBlc1tqXSxcbiAgICAgICAgaXNEaW0gPSBpc0RpbWVuc2lvbihmaWVsZCk7XG5cbiAgICAgIC8vVE9ETzogc3VwcG9ydCBcIm11bHRpcGxlXCIgYXNzaWdubWVudFxuICAgICAgaWYgKCEoZXQgaW4gdG1wRW5jKSAmJiAvLyBlbmNvZGluZyBub3QgdXNlZFxuICAgICAgICAoKGlzRGltICYmIHJ1bGVzW2V0XS5kaW1lbnNpb24pIHx8ICghaXNEaW0gJiYgcnVsZXNbZXRdLm1lYXN1cmUpKSAmJlxuICAgICAgICAoIXJ1bGVzW2V0XS5ydWxlcyB8fCAhcnVsZXNbZXRdLnJ1bGVzKGZpZWxkLCBzdGF0cykpXG4gICAgICAgICkge1xuICAgICAgICB0bXBFbmNbZXRdID0gZmllbGQ7XG4gICAgICAgIGFzc2lnbkZpZWxkKGkgKyAxKTtcbiAgICAgICAgZGVsZXRlIHRtcEVuY1tldF07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYXNzaWduRmllbGQoMCk7XG5cbiAgcmV0dXJuIGVuY3M7XG59XG4iLCJ2YXIgdmwgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy52bCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwudmwgOiBudWxsKSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcblxudmFyIGdlbiA9IG1vZHVsZS5leHBvcnRzID0ge1xuICAvLyBkYXRhIHZhcmlhdGlvbnNcbiAgYWdncmVnYXRlczogcmVxdWlyZSgnLi9hZ2dyZWdhdGVzJyksXG4gIHByb2plY3Rpb25zOiByZXF1aXJlKCcuL3Byb2plY3Rpb25zJyksXG4gIC8vIGVuY29kaW5ncyAvIHZpc3VhbCB2YXJpYXRvbnNcbiAgZW5jb2RpbmdzOiByZXF1aXJlKCcuL2VuY29kaW5ncycpLFxuICBlbmNzOiByZXF1aXJlKCcuL2VuY3MnKSxcbiAgbWFya3R5cGVzOiByZXF1aXJlKCcuL21hcmt0eXBlcycpXG59O1xuXG4vL0ZJWE1FIG1vdmUgdGhlc2UgdG8gdmxcbnZhciBBR0dSRUdBVElPTl9GTiA9IHsgLy9hbGwgcG9zc2libGUgYWdncmVnYXRlIGZ1bmN0aW9uIGxpc3RlZCBieSBlYWNoIGRhdGEgdHlwZVxuICBROiB2bC5zY2hlbWEuYWdnci5zdXBwb3J0ZWRFbnVtcy5RXG59O1xuXG52YXIgVFJBTlNGT1JNX0ZOID0geyAvL2FsbCBwb3NzaWJsZSB0cmFuc2Zvcm0gZnVuY3Rpb24gbGlzdGVkIGJ5IGVhY2ggZGF0YSB0eXBlXG4gIC8vIFE6IFsnbG9nJywgJ3NxcnQnLCAnYWJzJ10sIC8vIFwibG9naXQ/XCJcbiAgVDogdmwuc2NoZW1hLnRpbWVmbnNcbn07XG5cbmdlbi5jaGFydHMgPSBmdW5jdGlvbihmaWVsZHMsIG9wdCwgY2ZnLCBmbGF0KSB7XG4gIG9wdCA9IHV0aWwuZ2VuLmdldE9wdChvcHQpO1xuICBmbGF0ID0gZmxhdCA9PT0gdW5kZWZpbmVkID8ge2VuY29kaW5nczogMX0gOiBmbGF0O1xuXG4gIC8vIFRPRE8gZ2VuZXJhdGVcblxuICAvLyBnZW5lcmF0ZSBwZXJtdXRhdGlvbiBvZiBlbmNvZGluZyBtYXBwaW5nc1xuICB2YXIgZmllbGRTZXRzID0gb3B0LmdlbkFnZ3IgPyBnZW4uYWdncmVnYXRlcyhbXSwgZmllbGRzLCBvcHQpIDogW2ZpZWxkc10sXG4gICAgZW5jcywgY2hhcnRzLCBsZXZlbCA9IDA7XG5cbiAgaWYgKGZsYXQgPT09IHRydWUgfHwgKGZsYXQgJiYgZmxhdC5hZ2dyKSkge1xuICAgIGVuY3MgPSBmaWVsZFNldHMucmVkdWNlKGZ1bmN0aW9uKG91dHB1dCwgZmllbGRzKSB7XG4gICAgICByZXR1cm4gZ2VuLmVuY3Mob3V0cHV0LCBmaWVsZHMsIG9wdCk7XG4gICAgfSwgW10pO1xuICB9IGVsc2Uge1xuICAgIGVuY3MgPSBmaWVsZFNldHMubWFwKGZ1bmN0aW9uKGZpZWxkcykge1xuICAgICAgcmV0dXJuIGdlbi5lbmNzKFtdLCBmaWVsZHMsIG9wdCk7XG4gICAgfSwgdHJ1ZSk7XG4gICAgbGV2ZWwgKz0gMTtcbiAgfVxuXG4gIGlmIChmbGF0ID09PSB0cnVlIHx8IChmbGF0ICYmIGZsYXQuZW5jb2RpbmdzKSkge1xuICAgIGNoYXJ0cyA9IHV0aWwubmVzdGVkUmVkdWNlKGVuY3MsIGZ1bmN0aW9uKG91dHB1dCwgZW5jKSB7XG4gICAgICByZXR1cm4gZ2VuLm1hcmt0eXBlcyhvdXRwdXQsIGVuYywgb3B0LCBjZmcpO1xuICAgIH0sIGxldmVsLCB0cnVlKTtcbiAgfSBlbHNlIHtcbiAgICBjaGFydHMgPSB1dGlsLm5lc3RlZE1hcChlbmNzLCBmdW5jdGlvbihlbmMpIHtcbiAgICAgIHJldHVybiBnZW4ubWFya3R5cGVzKFtdLCBlbmMsIG9wdCwgY2ZnKTtcbiAgICB9LCBsZXZlbCwgdHJ1ZSk7XG4gICAgbGV2ZWwgKz0gMTtcbiAgfVxuICByZXR1cm4gY2hhcnRzO1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHZsID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cudmwgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLnZsIDogbnVsbCksXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyksXG4gIGNvbnN0cyA9IHJlcXVpcmUoJy4uL2NvbnN0cycpLFxuICBpc0RpbWVuc2lvbiA9IHZsLmZpZWxkLmlzRGltZW5zaW9uO1xuXG52YXIgdmxtYXJrdHlwZXMgPSBtb2R1bGUuZXhwb3J0cyA9IGdldE1hcmt0eXBlcztcblxudmFyIG1hcmtzUnVsZSA9IHZsbWFya3R5cGVzLnJ1bGUgPSB7XG4gIHBvaW50OiAgcG9pbnRSdWxlLFxuICBiYXI6ICAgIGJhclJ1bGUsXG4gIGxpbmU6ICAgbGluZVJ1bGUsXG4gIGFyZWE6ICAgbGluZVJ1bGUsIC8vIGFyZWEgaXMgc2ltaWxhciB0byBsaW5lXG4gIHRleHQ6ICAgdGV4dFJ1bGVcbn07XG5cbmZ1bmN0aW9uIGdldE1hcmt0eXBlcyhlbmMsIG9wdCkge1xuICBvcHQgPSB2bC5zY2hlbWEudXRpbC5leHRlbmQob3B0fHx7fSwgY29uc3RzLmdlbi5lbmNvZGluZ3MpO1xuXG4gIHZhciBtYXJrVHlwZXMgPSBvcHQubWFya3R5cGVMaXN0LmZpbHRlcihmdW5jdGlvbihtYXJrVHlwZSl7XG4gICAgcmV0dXJuIHZsbWFya3R5cGVzLnNhdGlzZnlSdWxlcyhlbmMsIG1hcmtUeXBlLCBvcHQpO1xuICB9KTtcblxuICAvL2NvbnNvbGUubG9nKCdlbmM6JywgdXRpbC5qc29uKGVuYyksIFwiIH4gbWFya3M6XCIsIG1hcmtUeXBlcyk7XG5cbiAgcmV0dXJuIG1hcmtUeXBlcztcbn1cblxudmxtYXJrdHlwZXMuc2F0aXNmeVJ1bGVzID0gZnVuY3Rpb24gKGVuYywgbWFya1R5cGUsIG9wdCkge1xuICB2YXIgbWFyayA9IHZsLmNvbXBpbGUubWFya3NbbWFya1R5cGVdLFxuICAgIHJlcXMgPSBtYXJrLnJlcXVpcmVkRW5jb2RpbmcsXG4gICAgc3VwcG9ydCA9IG1hcmsuc3VwcG9ydGVkRW5jb2Rpbmc7XG5cbiAgZm9yICh2YXIgaSBpbiByZXFzKSB7IC8vIGFsbCByZXF1aXJlZCBlbmNvZGluZ3MgaW4gZW5jXG4gICAgaWYgKCEocmVxc1tpXSBpbiBlbmMpKSByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmb3IgKHZhciBlbmNUeXBlIGluIGVuYykgeyAvLyBhbGwgZW5jb2RpbmdzIGluIGVuYyBhcmUgc3VwcG9ydGVkXG4gICAgaWYgKCFzdXBwb3J0W2VuY1R5cGVdKSByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gIW1hcmtzUnVsZVttYXJrVHlwZV0gfHwgbWFya3NSdWxlW21hcmtUeXBlXShlbmMsIG9wdCk7XG59O1xuXG5cbmZ1bmN0aW9uIHBvaW50UnVsZShlbmMsIG9wdCkge1xuICBpZiAoZW5jLnggJiYgZW5jLnkpIHtcbiAgICAvLyBoYXZlIGJvdGggeCAmIHkgPT0+IHNjYXR0ZXIgcGxvdCAvIGJ1YmJsZSBwbG90XG5cbiAgICB2YXIgeElzRGltID0gaXNEaW1lbnNpb24oZW5jLngpLFxuICAgICAgeUlzRGltID0gaXNEaW1lbnNpb24oZW5jLnkpO1xuXG4gICAgLy8gRm9yIE94T1xuICAgIGlmICh4SXNEaW0gJiYgeUlzRGltKSB7XG4gICAgICAvLyBzaGFwZSBkb2Vzbid0IHdvcmsgd2l0aCBib3RoIHgsIHkgYXMgb3JkaW5hbFxuICAgICAgaWYgKGVuYy5zaGFwZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIC8vIFRPRE8oa2FuaXR3KTogY2hlY2sgdGhhdCB0aGVyZSBpcyBxdWFudCBhdCBsZWFzdCAuLi5cbiAgICAgIGlmIChlbmMuY29sb3IgJiYgaXNEaW1lbnNpb24oZW5jLmNvbG9yKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gIH0gZWxzZSB7IC8vIHBsb3Qgd2l0aCBvbmUgYXhpcyA9IGRvdCBwbG90XG4gICAgaWYgKG9wdC5vbWl0RG90UGxvdCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gRG90IHBsb3Qgc2hvdWxkIGFsd2F5cyBiZSBob3Jpem9udGFsXG4gICAgaWYgKG9wdC5vbWl0VHJhbnBvc2UgJiYgZW5jLnkpIHJldHVybiBmYWxzZTtcblxuICAgIC8vIGRvdCBwbG90IHNob3VsZG4ndCBoYXZlIG90aGVyIGVuY29kaW5nXG4gICAgaWYgKG9wdC5vbWl0RG90UGxvdFdpdGhFeHRyYUVuY29kaW5nICYmIHZsLmtleXMoZW5jKS5sZW5ndGggPiAxKSByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBkb3QgcGxvdCB3aXRoIHNoYXBlIGlzIG5vbi1zZW5zZVxuICAgIGlmIChlbmMuc2hhcGUpIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gYmFyUnVsZShlbmMsIG9wdCkge1xuICAvLyBuZWVkIHRvIGFnZ3JlZ2F0ZSBvbiBlaXRoZXIgeCBvciB5XG5cbiAgaWYgKG9wdC5vbWl0U2l6ZU9uQmFyICYmIGVuYy5zaXplICE9PSB1bmRlZmluZWQpIHJldHVybiBmYWxzZTtcblxuICBpZiAoKChlbmMueC5hZ2dyICE9PSB1bmRlZmluZWQpIF4gKGVuYy55LmFnZ3IgIT09IHVuZGVmaW5lZCkpICYmXG4gICAgICAodmwuZmllbGQuaXNEaW1lbnNpb24oZW5jLngpIF4gdmwuZmllbGQuaXNEaW1lbnNpb24oZW5jLnkpKSkge1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGxpbmVSdWxlKGVuYywgb3B0KSB7XG4gIC8vIFRPRE8oa2FuaXR3KTogYWRkIG9taXRWZXJ0aWNhbExpbmUgYXMgY29uZmlnXG5cbiAgLy8gRklYTUUgdHJ1bHkgb3JkaW5hbCBkYXRhIGlzIGZpbmUgaGVyZSB0b28uXG4gIC8vIExpbmUgY2hhcnQgc2hvdWxkIGJlIG9ubHkgaG9yaXpvbnRhbFxuICAvLyBhbmQgdXNlIG9ubHkgdGVtcG9yYWwgZGF0YVxuICByZXR1cm4gZW5jLngudHlwZSA9PSAnVCcgJiYgZW5jLnkudHlwZSA9PSAnUSc7XG59XG5cbmZ1bmN0aW9uIHRleHRSdWxlKGVuYywgb3B0KSB7XG4gIC8vIGF0IGxlYXN0IG11c3QgaGF2ZSByb3cgb3IgY29sIGFuZCBhZ2dyZWdhdGVkIHRleHQgdmFsdWVzXG4gIHJldHVybiAoZW5jLnJvdyB8fCBlbmMuY29sKSAmJiBlbmMudGV4dCAmJiBlbmMudGV4dC5hZ2dyICYmICFlbmMueCAmJiAhZW5jLnkgJiYgIWVuYy5jb2xvcjtcbn0iLCJ2YXIgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKSxcbiAgY29uc3RzID0gcmVxdWlyZSgnLi4vY29uc3RzJyksXG4gIHZsID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cudmwgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLnZsIDogbnVsbCk7XG5cbm1vZHVsZS5leHBvcnRzID0gcHJvamVjdGlvbnM7XG5cbi8qKlxuICogZmllbGRzXG4gKiBAcGFyYW0gIHtbdHlwZV19IGZpZWxkcyBhcnJheSBvZiBmaWVsZHMgYW5kIHF1ZXJ5IGluZm9ybWF0aW9uXG4gKiBAcmV0dXJuIHtbdHlwZV19ICAgICAgICBbZGVzY3JpcHRpb25dXG4gKi9cbmZ1bmN0aW9uIHByb2plY3Rpb25zKGZpZWxkcywgc3RhdHMsIG9wdCkge1xuICBvcHQgPSB2bC5zY2hlbWEudXRpbC5leHRlbmQob3B0fHx7fSwgY29uc3RzLmdlbi5wcm9qZWN0aW9ucyk7XG4gIC8vIFRPRE8gc3VwcG9ydCBvdGhlciBtb2RlIG9mIHByb2plY3Rpb25zIGdlbmVyYXRpb25cbiAgLy8gcG93ZXJzZXQsIGNob29zZUssIGNob29zZUtvckxlc3MgYXJlIGFscmVhZHkgaW5jbHVkZWQgaW4gdGhlIHV0aWxcbiAgLy8gUmlnaHQgbm93IGp1c3QgYWRkIG9uZSBtb3JlIGZpZWxkXG5cbiAgdmFyIHNlbGVjdGVkID0gW10sIHVuc2VsZWN0ZWQgPSBbXSwgZmllbGRTZXRzID0gW107XG5cbiAgZmllbGRzLmZvckVhY2goZnVuY3Rpb24oZmllbGQpe1xuICAgIGlmIChmaWVsZC5zZWxlY3RlZCkge1xuICAgICAgc2VsZWN0ZWQucHVzaChmaWVsZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHVuc2VsZWN0ZWQucHVzaChmaWVsZCk7XG4gICAgfVxuICB9KTtcblxuICB1bnNlbGVjdGVkID0gdW5zZWxlY3RlZC5maWx0ZXIoZnVuY3Rpb24oZmllbGQpe1xuICAgIC8vRklYTUUgbG9hZCBtYXhiaW5zIHZhbHVlIGZyb20gc29tZXdoZXJlIGVsc2VcbiAgICByZXR1cm4gKG9wdC5hbHdheXNBZGRIaXN0b2dyYW0gJiYgc2VsZWN0ZWQubGVuZ3RoID09PSAwKSB8fFxuICAgICAgIShvcHQubWF4Q2FyZGluYWxpdHlGb3JBdXRvQWRkT3JkaW5hbCAmJlxuICAgICAgICB2bC5maWVsZC5pc0RpbWVuc2lvbihmaWVsZCkgJiZcbiAgICAgICAgdmwuZmllbGQuY2FyZGluYWxpdHkoZmllbGQsIHN0YXRzLCAxNSkgPiBvcHQubWF4Q2FyZGluYWxpdHlGb3JBdXRvQWRkT3JkaW5hbCk7XG4gIH0pO1xuXG4gIC8vIHB1dCBjb3VudCBvbiB0b3AhXG4gIHVuc2VsZWN0ZWQuc29ydChmdW5jdGlvbihhLCBiKXtcbiAgICBpZihhLmFnZ3I9PT0nY291bnQnKSByZXR1cm4gLTE7XG4gICAgaWYoYi5hZ2dyPT09J2NvdW50JykgcmV0dXJuIDE7XG4gICAgcmV0dXJuIDA7XG4gIH0pO1xuXG4gIHZhciBzZXRzVG9BZGQgPSB1dGlsLmNob29zZUtvckxlc3ModW5zZWxlY3RlZCwgMSk7XG5cbiAgc2V0c1RvQWRkLmZvckVhY2goZnVuY3Rpb24oc2V0VG9BZGQpIHtcbiAgICB2YXIgZmllbGRTZXQgPSBzZWxlY3RlZC5jb25jYXQoc2V0VG9BZGQpO1xuICAgIGlmIChmaWVsZFNldC5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAoZmllbGRTZXQubGVuZ3RoID09PSAxICYmIHZsLmZpZWxkLmlzQ291bnQoZmllbGRTZXRbMF0pKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdC5vbWl0RG90UGxvdCAmJiBmaWVsZFNldC5sZW5ndGggPT09IDEpIHJldHVybjtcblxuICAgICAgZmllbGRTZXRzLnB1c2goZmllbGRTZXQpO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKG9wdC5hZGRDb3VudElmTm90aGluZ0lzU2VsZWN0ZWQgJiYgc2VsZWN0ZWQubGVuZ3RoPT09MCkge1xuICAgIHZhciBjb3VudEZpZWxkID0gdmwuZmllbGQuY291bnQoKTtcblxuICAgIHVuc2VsZWN0ZWQuZm9yRWFjaChmdW5jdGlvbihmaWVsZCkge1xuICAgICAgaWYgKCF2bC5maWVsZC5pc0NvdW50KGZpZWxkKSkge1xuICAgICAgICBmaWVsZFNldHMucHVzaChbZmllbGQsIGNvdW50RmllbGRdKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZpZWxkU2V0cy5mb3JFYWNoKGZ1bmN0aW9uKGZpZWxkU2V0KSB7XG4gICAgICAvLyBhbHdheXMgYXBwZW5kIHByb2plY3Rpb24ncyBrZXkgdG8gZWFjaCBwcm9qZWN0aW9uIHJldHVybmVkLCBkMyBzdHlsZS5cbiAgICBmaWVsZFNldC5rZXkgPSBwcm9qZWN0aW9ucy5rZXkoZmllbGRTZXQpO1xuICB9KTtcblxuICByZXR1cm4gZmllbGRTZXRzO1xufVxuXG5wcm9qZWN0aW9ucy5rZXkgPSBmdW5jdGlvbihwcm9qZWN0aW9uKSB7XG4gIHJldHVybiBwcm9qZWN0aW9uLm1hcChmdW5jdGlvbihmaWVsZCkge1xuICAgIHJldHVybiB2bC5maWVsZC5pc0NvdW50KGZpZWxkKSA/ICdjb3VudCcgOiBmaWVsZC5uYW1lO1xuICB9KS5qb2luKCcsJyk7XG59O1xuIiwidmFyIGcgPSBnbG9iYWwgfHwgd2luZG93O1xuXG5nLkNIQVJUX1RZUEVTID0ge1xuICBUQUJMRTogJ1RBQkxFJyxcbiAgQkFSOiAnQkFSJyxcbiAgUExPVDogJ1BMT1QnLFxuICBMSU5FOiAnTElORScsXG4gIEFSRUE6ICdBUkVBJyxcbiAgTUFQOiAnTUFQJyxcbiAgSElTVE9HUkFNOiAnSElTVE9HUkFNJ1xufTtcblxuZy5BTllfREFUQV9UWVBFUyA9ICgxIDw8IDQpIC0gMTsiLCJ2YXIgdmwgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy52bCA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwudmwgOiBudWxsKTtcblxudmFyIHJhbmsgPSBtb2R1bGUuZXhwb3J0cyA9IHtcblxufTtcblxuLy9UT0RPIGxvd2VyIHNjb3JlIGlmIHdlIHVzZSBHIGFzIE8/XG52YXIgRU5DT0RJTkdfU0NPUkUgPSB7XG4gIFE6IHtcbiAgICB4OiAxLCAvLyBiZXR0ZXIgZm9yIHNpbmdsZSBwbG90XG4gICAgeTogMC45OSxcbiAgICBzaXplOiAwLjYsIC8vRklYTUUgU0laRSBmb3IgQmFyIGlzIGhvcnJpYmxlIVxuICAgIGNvbG9yOiAwLjQsXG4gICAgYWxwaGE6IDAuNFxuICB9LFxuICBPOiB7IC8vIFRPRE8gbmVlZCB0byB0YWtlIGNhcmRpbmFsaXR5IGludG8gYWNjb3VudFxuICAgIHg6IDAuOTksIC8vIGhhcmRlciB0byByZWFkIGF4aXNcbiAgICB5OiAxLFxuICAgIHJvdzogMC43LFxuICAgIGNvbDogMC43LFxuICAgIGNvbG9yOiAwLjgsXG4gICAgc2hhcGU6IDAuNlxuICB9LFxuICBUOiB7IC8vIEZJWCByZXRoaW5rIHRoaXNcbiAgICB4OiAxLFxuICAgIHk6IDAuOCxcbiAgICByb3c6IDAuNCxcbiAgICBjb2w6IDAuNCxcbiAgICBjb2xvcjogMC4zLFxuICAgIHNoYXBlOiAwLjNcbiAgfVxufTtcblxuLy8gYmFkIHNjb3JlIG5vdCBzcGVjaWZpZWQgaW4gdGhlIHRhYmxlIGFib3ZlXG52YXIgQkFEX0VOQ09ESU5HX1NDT1JFID0gMC4wMSxcbiAgVU5VU0VEX1BPU0lUSU9OID0gMC41O1xuXG52YXIgTUFSS19TQ09SRSA9IHtcbiAgbGluZTogMC45OSxcbiAgYXJlYTogMC45OCxcbiAgYmFyOiAwLjk3LFxuICBwb2ludDogMC45NixcbiAgY2lyY2xlOiAwLjk1LFxuICBzcXVhcmU6IDAuOTUsXG4gIHRleHQ6IDAuOFxufTtcblxucmFuay5lbmNvZGluZyA9IGZ1bmN0aW9uKGVuY29kaW5nKSB7XG4gIHZhciBmZWF0dXJlcyA9IHt9LFxuICAgIGVuY1R5cGVzID0gdmwua2V5cyhlbmNvZGluZy5lbmMpO1xuXG4gIGVuY1R5cGVzLmZvckVhY2goZnVuY3Rpb24oZW5jVHlwZSkge1xuICAgIHZhciBmaWVsZCA9IGVuY29kaW5nLmVuY1tlbmNUeXBlXTtcbiAgICBmZWF0dXJlc1tmaWVsZC5uYW1lXSA9IHtcbiAgICAgIHZhbHVlOiBmaWVsZC50eXBlICsgJzonKyBlbmNUeXBlLFxuICAgICAgc2NvcmU6IEVOQ09ESU5HX1NDT1JFW2ZpZWxkLnR5cGVdW2VuY1R5cGVdIHx8IEJBRF9FTkNPRElOR19TQ09SRVxuICAgIH07XG4gIH0pO1xuXG4gIC8vIHBlbmFsaXplIG5vdCB1c2luZyBwb3NpdGlvbmFsXG4gIGlmIChlbmNUeXBlcy5sZW5ndGggPiAxKSB7XG4gICAgaWYgKCghZW5jb2RpbmcuZW5jLnggfHwgIWVuY29kaW5nLmVuYy55KSAmJiAhZW5jb2RpbmcuZW5jLmdlbyAmJiAhZW5jb2RpbmcuZW5jLnRleHQpIHtcbiAgICAgIGZlYXR1cmVzLnVudXNlZFBvc2l0aW9uID0ge3Njb3JlOiBVTlVTRURfUE9TSVRJT059O1xuICAgIH1cbiAgfVxuXG4gIGZlYXR1cmVzLm1hcmtUeXBlID0ge1xuICAgIHZhbHVlOiBlbmNvZGluZy5tYXJrdHlwZSxcbiAgICBzY29yZTogTUFSS19TQ09SRVtlbmNvZGluZy5tYXJrdHlwZV1cbiAgfTtcblxuICByZXR1cm4ge1xuICAgIHNjb3JlOiB2bC5rZXlzKGZlYXR1cmVzKS5yZWR1Y2UoZnVuY3Rpb24ocCwgcykge1xuICAgICAgcmV0dXJuIHAgKiBmZWF0dXJlc1tzXS5zY29yZTtcbiAgICB9LCAxKSxcbiAgICBmZWF0dXJlczogZmVhdHVyZXNcbiAgfTtcbn07XG5cblxuLy8gcmF3ID4gYXZnLCBzdW0gPiBtaW4sbWF4ID4gYmluXG5cbnJhbmsuZmllbGRzU2NvcmUgPSBmdW5jdGlvbihmaWVsZHMpIHtcblxufTtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBjb25zdHMgPSByZXF1aXJlKCcuL2NvbnN0cycpO1xuXG52YXIgdXRpbCA9IG1vZHVsZS5leHBvcnRzID0ge1xuICBnZW46IHt9XG59O1xuXG51dGlsLmlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgcmV0dXJuIHt9LnRvU3RyaW5nLmNhbGwob2JqKSA9PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxudXRpbC5qc29uID0gZnVuY3Rpb24ocywgc3ApIHtcbiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHMsIG51bGwsIHNwKTtcbn07XG5cbnV0aWwua2V5cyA9IGZ1bmN0aW9uKG9iaikge1xuICB2YXIgayA9IFtdLCB4O1xuICBmb3IgKHggaW4gb2JqKSBrLnB1c2goeCk7XG4gIHJldHVybiBrO1xufTtcblxudXRpbC5uZXN0ZWRNYXAgPSBmdW5jdGlvbiAoY29sLCBmLCBsZXZlbCwgZmlsdGVyKSB7XG4gIHJldHVybiBsZXZlbCA9PT0gMCA/XG4gICAgY29sLm1hcChmKSA6XG4gICAgY29sLm1hcChmdW5jdGlvbih2KSB7XG4gICAgICB2YXIgciA9IHV0aWwubmVzdGVkTWFwKHYsIGYsIGxldmVsIC0gMSk7XG4gICAgICByZXR1cm4gZmlsdGVyID8gci5maWx0ZXIodXRpbC5ub25FbXB0eSkgOiByO1xuICAgIH0pO1xufTtcblxudXRpbC5uZXN0ZWRSZWR1Y2UgPSBmdW5jdGlvbiAoY29sLCBmLCBsZXZlbCwgZmlsdGVyKSB7XG4gIHJldHVybiBsZXZlbCA9PT0gMCA/XG4gICAgY29sLnJlZHVjZShmLCBbXSkgOlxuICAgIGNvbC5tYXAoZnVuY3Rpb24odikge1xuICAgICAgdmFyIHIgPSB1dGlsLm5lc3RlZFJlZHVjZSh2LCBmLCBsZXZlbCAtIDEpO1xuICAgICAgcmV0dXJuIGZpbHRlciA/IHIuZmlsdGVyKHV0aWwubm9uRW1wdHkpIDogcjtcbiAgICB9KTtcbn07XG5cbnV0aWwubm9uRW1wdHkgPSBmdW5jdGlvbihncnApIHtcbiAgcmV0dXJuICF1dGlsLmlzQXJyYXkoZ3JwKSB8fCBncnAubGVuZ3RoID4gMDtcbn07XG5cblxudXRpbC50cmF2ZXJzZSA9IGZ1bmN0aW9uIChub2RlLCBhcnIpIHtcbiAgaWYgKG5vZGUudmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgIGFyci5wdXNoKG5vZGUudmFsdWUpO1xuICB9IGVsc2Uge1xuICAgIGlmIChub2RlLmxlZnQpIHV0aWwudHJhdmVyc2Uobm9kZS5sZWZ0LCBhcnIpO1xuICAgIGlmIChub2RlLnJpZ2h0KSB1dGlsLnRyYXZlcnNlKG5vZGUucmlnaHQsIGFycik7XG4gIH1cbiAgcmV0dXJuIGFycjtcbn07XG5cbnV0aWwudW5pb24gPSBmdW5jdGlvbiAoYSwgYikge1xuICB2YXIgbyA9IHt9O1xuICBhLmZvckVhY2goZnVuY3Rpb24oeCkgeyBvW3hdID0gdHJ1ZTt9KTtcbiAgYi5mb3JFYWNoKGZ1bmN0aW9uKHgpIHsgb1t4XSA9IHRydWU7fSk7XG4gIHJldHVybiB1dGlsLmtleXMobyk7XG59O1xuXG5cbnV0aWwuZ2VuLmdldE9wdCA9IGZ1bmN0aW9uIChvcHQpIHtcbiAgLy9tZXJnZSB3aXRoIGRlZmF1bHRcbiAgcmV0dXJuIChvcHQgPyB1dGlsLmtleXMob3B0KSA6IFtdKS5yZWR1Y2UoZnVuY3Rpb24oYywgaykge1xuICAgIGNba10gPSBvcHRba107XG4gICAgcmV0dXJuIGM7XG4gIH0sIE9iamVjdC5jcmVhdGUoY29uc3RzLmdlbi5ERUZBVUxUX09QVCkpO1xufTtcblxuLyoqXG4gKiBwb3dlcnNldCBjb2RlIGZyb20gaHR0cDovL3Jvc2V0dGFjb2RlLm9yZy93aWtpL1Bvd2VyX1NldCNKYXZhU2NyaXB0XG4gKlxuICogICB2YXIgcmVzID0gcG93ZXJzZXQoWzEsMiwzLDRdKTtcbiAqXG4gKiByZXR1cm5zXG4gKlxuICogW1tdLFsxXSxbMl0sWzEsMl0sWzNdLFsxLDNdLFsyLDNdLFsxLDIsM10sWzRdLFsxLDRdLFxuICogWzIsNF0sWzEsMiw0XSxbMyw0XSxbMSwzLDRdLFsyLDMsNF0sWzEsMiwzLDRdXVxuW2VkaXRdXG4qL1xuXG51dGlsLnBvd2Vyc2V0ID0gZnVuY3Rpb24obGlzdCkge1xuICB2YXIgcHMgPSBbXG4gICAgW11cbiAgXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgZm9yICh2YXIgaiA9IDAsIGxlbiA9IHBzLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICBwcy5wdXNoKHBzW2pdLmNvbmNhdChsaXN0W2ldKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBwcztcbn07XG5cbnV0aWwuY2hvb3NlS29yTGVzcyA9IGZ1bmN0aW9uKGxpc3QsIGspIHtcbiAgdmFyIHN1YnNldCA9IFtbXV07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIGZvciAodmFyIGogPSAwLCBsZW4gPSBzdWJzZXQubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgIHZhciBzdWIgPSBzdWJzZXRbal0uY29uY2F0KGxpc3RbaV0pO1xuICAgICAgaWYoc3ViLmxlbmd0aCA8PSBrKXtcbiAgICAgICAgc3Vic2V0LnB1c2goc3ViKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN1YnNldDtcbn07XG5cbnV0aWwuY2hvb3NlSyA9IGZ1bmN0aW9uKGxpc3QsIGspIHtcbiAgdmFyIHN1YnNldCA9IFtbXV07XG4gIHZhciBrQXJyYXkgPVtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICBmb3IgKHZhciBqID0gMCwgbGVuID0gc3Vic2V0Lmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICB2YXIgc3ViID0gc3Vic2V0W2pdLmNvbmNhdChsaXN0W2ldKTtcbiAgICAgIGlmKHN1Yi5sZW5ndGggPCBrKXtcbiAgICAgICAgc3Vic2V0LnB1c2goc3ViKTtcbiAgICAgIH1lbHNlIGlmIChzdWIubGVuZ3RoID09PSBrKXtcbiAgICAgICAga0FycmF5LnB1c2goc3ViKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGtBcnJheTtcbn07XG5cbnV0aWwuY3Jvc3MgPSBmdW5jdGlvbihhLGIpe1xuICB2YXIgeCA9IFtdO1xuICBmb3IodmFyIGk9MDsgaTwgYS5sZW5ndGg7IGkrKyl7XG4gICAgZm9yKHZhciBqPTA7ajwgYi5sZW5ndGg7IGorKyl7XG4gICAgICB4LnB1c2goYVtpXS5jb25jYXQoYltqXSkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4geDtcbn07XG5cbiJdfQ==
