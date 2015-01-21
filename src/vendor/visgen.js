// Define module using Universal Module Definition pattern
// https://github.com/umdjs/umd/blob/master/returnExports.js

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['vegalite', 'clusterfck'], factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(
      require('../../vegalite/src/vegalite'),
      require('../src/lib/clusterfck.js')
    );
  } else {
    // Browser globals (root is window)
    root.vgn = factory(root.vl, root.clusterfck);
  }
}(this, function(vl, clusterfck) {
  var vgn = {}; //VisGeN

  vgn.DEFAULT_OPT = {
    genAggr: true,
    genBin: true,
    genTypeCasting: false,

    aggrList: [undefined, "avg"], //undefined = no aggregation
    marktypeList: ["point", "bar", "line", "area", "text"], //filled_map

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

  var ENCODING_TYPES = vl.encodingTypes;

  var CHART_TYPES = {
    TABLE: 'TABLE',
    BAR: 'BAR',
    PLOT: 'PLOT',
    LINE: 'LINE',
    AREA: 'AREA',
    MAP: 'MAP',
    HISTOGRAM: 'HISTOGRAM'
  };

  var ANY_DATA_TYPES = (1 << 4) - 1;

  //FIXME move these to vl
  var AGGREGATION_FN = { //all possible aggregate function listed by each data type
    Q: ["avg", "sum", "min", "max", "count"]
  };

  var TRANSFORM_FN = { //all possible transform function listed by each data type
    Q: ["log", "sqrt", "abs"], // "logit?"
    T: ["year", "month", "day"] //,"hr", "min", "bmon", "bday", "bdow", "bhr"]
  };

  var json = function(s,sp){ return JSON.stringify(s, null, sp);};

  // Begin of Distance

  var DIST_BY_ENCTYPE = [
      // positional
      ["x", "y", 0.2],
      ["row", "col", 0.2],

      // ordinal mark properties
      ["color", "shape", 0.2],

      // quantitative mark properties
      ["color", "alpha", 0.2],
      ["size", "alpha", 0.2],
      ["size", "color", 0.2]
    ].reduce(function(r, x) {
    var a=x[0], b=x[1], d=x[2];
      r[a] = r[a] || {};
      r[b] = r[b] || {};
      r[a][b] = r[b][a] = d;
      return r;
    }, {}),
    DIST_MISSING = 100, CLUSTER_THRESHOLD=1;

  function colenc(encoding) {
    var colenc = {},
      enc = encoding.enc;

    vl.keys(enc).forEach(function(encType) {
      var e = vl.duplicate(enc[encType]);
      e.type = encType;
      colenc[e.name || ""] = e;
      delete e.name;
    });

    return {
      marktype: encoding.marktype,
      col: colenc
    };
  }

  vgn._getDistance = function(colenc1, colenc2) {
    var cols = union(vl.keys(colenc1.col), vl.keys(colenc2.col)),
      dist = 0;

    cols.forEach(function(col) {
      var e1 = colenc1.col[col], e2 = colenc2.col[col];

      if (e1 && e2) {
        if (e1.type != e2.type) {
          dist += (DIST_BY_ENCTYPE[e1.type] || {})[e2.type] || 1;
        }
        //FIXME add aggregation
      } else {
        dist += DIST_MISSING;
      }
    })
    return dist;
  }

  vgn.getDistanceTable = function(encodings) {
    var len = encodings.length,
      colencs = encodings.map(function(e){ return colenc(e);}),
      diff = new Array(len), i;

    for (i = 0; i < len; i++) diff[i] = new Array(len);

    for (i = 0; i < len; i++) {
      for (j = i + 1; j < len; j++) {
        diff[j][i] = diff[i][j] = vgn._getDistance(colencs[i], colencs[j]);
      }
    }
    return diff;
  }

  vgn.cluster = function(encodings, maxDistance) {
    var dist = vgn.getDistanceTable(encodings),
      n = encodings.length;

    var clusterTrees = clusterfck.hcluster(range(n), function(i, j) {
      return dist[i][j];
    }, "average", CLUSTER_THRESHOLD);

    var clusters = clusterTrees.map(function(tree) {
      return traverse(tree, []);
    })

    //console.log("clusters", clusters.map(function(c){ return c.join("+"); }));
    return clusters;
  }

  function traverse(node, arr) {
    if (node.value !== undefined) {
      arr.push(node.value);
    } else {
      if (node.left) traverse(node.left, arr)
      if (node.right) traverse(node.right, arr);
    }
    return arr;
  }

  // End of Clustering


  // BEGINING OF RULES

  //TODO markTypesAggregateSupport

  var marksRule = vgn.marksRule = generalRule;
  marksRule.point = pointRule;
  marksRule.bar = barRule;
  marksRule.line = lineRule;
  marksRule.area = lineRule;

  function isDim(field){
    return field.bin || field.type === "O";
  }

  function xOyQ(enc) {
    return enc.x && enc.y && isDim(enc.x) && isDim(enc.y);
  }

  function generalRule(enc, opt) {
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
            if (isDim(field) && (encType !== "row" && encType !== "col")) {
              hasOtherO = true;
            }
            if (hasAggr && hasOtherO) break;
          }

          if (hasAggr && !hasOtherO) return false;
        }
      }

      // one dimension "count" is useless
      if (enc.x && enc.x.aggr == "count" && !enc.y) return false;
      if (enc.y && enc.y.aggr == "count" && !enc.x) return false;

      return true;
    }
    return false;
  };

  function pointRule(enc, opt) {
    if (enc.x && enc.y) {
      // have both x & y ==> scatter plot / bubble plot

      // For OxQ
      if (opt.omitTranpose && xOyQ(enc)) {
        // if omitTranpose, put Q on X, O on Y
        return false;
      }

      // For OxO
      if (isDim(enc.x) && isDim(enc.y)) {
        // shape doesn't work with both x, y as ordinal
        if (enc.shape) {
          return false;
        }

        // TODO(kanitw): check that there is quant at least ...
        if (enc.color && isDim(enc.color)) {
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
      if (opt.omitTranpose && xOyQ(enc)) return false;

      return true;
    }

    return false;
  }

  function lineRule(enc, opt) {
    // TODO(kanitw): add omitVerticalLine as config

    // Line chart should be only horizontal
    // and use only temporal data
    return enc.x == "T" && enc.y == "Q";
  }

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

  // END OF RULES

  // Beginning of Chart Generation

  var nonEmpty = function(grp) {
    return !isArray(grp) || grp.length > 0;
  };

  function nestedMap(col, f, level, filter) {
    return level === 0 ?
      col.map(f) :
      col.map(function(v) {
        var r = nestedMap(v, f, level - 1);
        return filter ? r.filter(nonEmpty) : r;
      });
  }

  function nestedReduce(col, f, level, filter) {
    return level === 0 ?
      col.reduce(f, []) :
      col.map(function(v) {
        var r = nestedReduce(v, f, level - 1);
        return filter ? r.filter(nonEmpty) : r;
      });
  }

  function getopt(opt) {
    //merge with default
    return (opt ? vl.keys(opt) : []).reduce(function(c, k) {
      c[k] = opt[k];
      return c;
    }, Object.create(vgn.DEFAULT_OPT));
  }

  vgn.generateCharts = function(fields, opt, cfg, flat) {
    opt = getopt(opt);
    flat = flat === undefined ? {encodings: 1} : flat;

    // TODO generate

    // generate permutation of encoding mappings
    var fieldSets = opt.genAggr ? vgn.genAggregate([], fields, opt) : [fields],
      encodings, charts, level = 0;

    if (flat === true || (flat && flat.aggr)) {
      encodings = fieldSets.reduce(function(output, fields) {
        return vgn.genFieldEncodings(output, fields, opt)
      }, []);
    } else {
      encodings = fieldSets.map(function(fields) {
        return vgn.genFieldEncodings([], fields, opt);
      }, true);
      level += 1;
    }

    if (flat === true || (flat && flat.encodings)) {
      charts = nestedReduce(encodings, function(output, encodings) {
        return vgn.genMarkTypes(output, encodings, opt, cfg);
      }, level, true);
    } else {
      charts = nestedMap(encodings, function(encodings) {
        return vgn.genMarkTypes([], encodings, opt, cfg)
      }, level, true);
      level += 1;
    }
    return charts;
  };


  vgn.genMarkTypes = function(output, enc, opt, cfg) {
    opt = getopt(opt);
    vgn._getSupportedMarkTypes(enc, opt)
      .forEach(function(markType) {
        output.push({ marktype: markType, enc: enc, cfg: cfg });
      });
    return output;
  }

  //TODO(kanitw): write test case
  vgn._getSupportedMarkTypes = function(enc, opt) {
    var markTypes = opt.marktypeList.filter(function(markType) {
      var mark = vl.marks[markType],
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

    //console.log('enc:', json(enc), " ~ marks:", markTypes);

    return markTypes;
  };

  vgn.genAggregate = function(output, fields, opt) {
    var tf = new Array(fields.length);
    opt = getopt(opt);

    function assignField(i, hasAggr) {
      // If all fields are assigned, save
      if (i === fields.length) {
        if(opt.omitAggregateWithMeasureOnly || opt.omitDimensionOnly){
          var hasMeasure=false, hasDimension=false, hasRaw=false;
          tf.forEach(function(f){
            if (isDim(f)) {
              hasDimension = true;
            } else {
              hasMeasure = true;
              if(!f.aggr) hasRaw = true;
            }
          });
          if(!hasMeasure && opt.omitDimensionOnly) return;
          if(!hasDimension && !hasRaw && opt.omitAggregateWithMeasureOnly) return;
        }

        output.push(vl.duplicate(tf));
        return;
      }

      var f = fields[i];

      // Otherwise, assign i-th field
      switch (f.type) {
        //TODO "D", "G"
        case "Q":
          tf[i] = {name: f.name, type: f.type};
          if (f.aggr) {
            tf[i].aggr = f.aggr;
            assignField(i + 1, true);
          } else if (f._aggr) {
            var aggregates = f._aggr == "*" ? opt.aggrList : f._aggr;

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
              tf[i].type = "Q";
              assignField(i + 1, hasAggr);
            }

            if (opt.genTypeCasting) {
              // we can also change it to dimension (cast type="O")
              delete tf[i].aggr;
              delete tf[i].bin;
              tf[i].type = "O";
              assignField(i + 1, hasAggr);
            }
          } else { // both "aggr", "_aggr" not in f
            assignField(i + 1, false);
          }
          break;
        case "O":
        default:
          tf[i] = f;
          assignField(i + 1, hasAggr);
          break;
      }

    }

    assignField(0, null);

    return output;
  }

  //TODO(kanitw): write test case
  vgn.genFieldEncodings = function(encodings, fields, opt) { // generate encodings (_enc property in vega)
    var tmpEnc = {};

    function assignField(i) {
      // If all fields are assigned, save
      if (i === fields.length) {
        // at the minimal all chart should have x, y, geo, text or arc
        if (marksRule(tmpEnc, opt)) {
          encodings.push(vl.duplicate(tmpEnc));
        }
        return;
      }

      // Otherwise, assign i-th field
      var field = fields[i];
      for (var j in ENCODING_TYPES) {
        var et = ENCODING_TYPES[j];

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

  // UTILITY

  var isArray = Array.isArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  function union(a, b) {
    var o = {};
    a.forEach(function(x){ o[x] = true;});
    b.forEach(function(x){ o[x] = true;});
    return vl.keys(o);
  }

  var abs = Math.abs;

  function range(start, stop, step) {
    if (arguments.length < 3) {
      step = 1;
      if (arguments.length < 2) {
        stop = start;
        start = 0;
      }
    }
    if ((stop - start) / step === Infinity) throw new Error("infinite range");
    var range = [], k = d3_range_integerScale(abs(step)), i = -1, j;
    start *= k, stop *= k, step *= k;
    if (step < 0) while ((j = start + step * ++i) > stop) range.push(j / k); else while ((j = start + step * ++i) < stop) range.push(j / k);
    return range;
  };

  function d3_range_integerScale(x) {
    var k = 1;
    while (x * k % 1) k *= 10;
    return k;
  }

  return vgn;
}));