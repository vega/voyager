!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.vl=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var globals = require("./globals"),
    util = require("./util"),
    consts = require('./consts');

var vl = util.merge(consts, util);

vl.schema = require('./schema');
vl.Encoding = require('./Encoding');
vl.axis = require('./axis');
vl.compile = require('./compile');
vl.data = require('./data');
vl.legends = require('./legends');
vl.marks = require('./marks')
vl.scale = require('./scale');

module.exports = vl;

},{"./Encoding":2,"./axis":3,"./compile":4,"./consts":5,"./data":6,"./globals":7,"./legends":8,"./marks":9,"./scale":10,"./schema":11,"./util":14}],2:[function(require,module,exports){
"use strict";

var global = require('./globals'),
  consts = require('./consts'),
  util = require('./util'),
  schema = require('./schema');

var Encoding = module.exports = (function() {

  function Encoding(marktype, enc, config) {
    var defaults = schema.instantiate();

    var spec = {
      marktype: marktype,
      enc: enc,
      cfg: config
    };

    // Hack to add default constants that are not in the schema
    for (var k in consts.DEFAULTS) {
      defaults.cfg[k] = consts.DEFAULTS[k];
    }

    // type to bitcode
    for (var e in defaults.enc){
      defaults.enc[e].type = consts.dataTypes[defaults.enc[e].type];
    }

    var specExtended = schema.util.merge(defaults, spec);

    this._marktype = specExtended.marktype;
    this._enc = specExtended.enc;
    this._cfg = specExtended.cfg;
  }

  var proto = Encoding.prototype;

  proto.marktype = function() {
    return this._marktype;
  };

  proto.is = function(m) {
    return this._marktype === m;
  };

  proto.has = function(x) {
    return this._enc[x].name !== undefined;
  };

  proto.enc = function(x){
    return this._enc[x];
  };

  // get "field" property for vega
  proto.field = function(x, nodata, nofn) {
    if (!this.has(x)) return null;

    var f = (nodata ? "" : "data.");

    if (this._enc[x].aggr === "count") {
      return f + "count";
    } else if (!nofn && this._enc[x].bin) {
      return f + "bin_" + this._enc[x].name;
    } else if (!nofn && this._enc[x].aggr) {
      return f + this._enc[x].aggr + "_" + this._enc[x].name;
    } else if (!nofn && this._enc[x].fn){
      return f + this._enc[x].fn + "_" + this._enc[x].name;
    } else {
      return f + this._enc[x].name;
    }
  };

  proto.fieldName = function(x){
    return this._enc[x].name;
  }

  proto.fieldTitle = function(x){
    if (this._enc[x].aggr) {
      return this._enc[x].aggr + "(" + this._enc[x].name + ")";
    } else {
      return this._enc[x].name;
    }
  }

  proto.scale = function(x){
    return this._enc[x].scale || {};
  }

  proto.axis = function(x){
    return this._enc[x].axis || {};
  }

  proto.band = function(x){
    return this._enc[x].band || {};
  }

  proto.aggr = function(x){
    return this._enc[x].aggr;
  }

  proto.bin = function(x){
    return this._enc[x].bin;
  }

  proto.legend = function(x){
    return this._enc[x].legend;
  }

  proto.value = function(x){
    return this._enc[x].value;
  }

  proto.fn = function(x){
    return this._enc[x].fn;
  }

  proto.any = function(f){
    return util.any(this._enc, f);
  }

  proto.all = function(f){
    return util.all(this._enc, f);
  }

  proto.length = function(){
    return util.keys(this._enc).length;
  }

  proto.reduce = function(f, init){
    var r = init, i=0;
    for (k in this._enc){
      r = f(r, this._enc[k], k, this._enc);
    }
    return r;
  }

  proto.forEach = function(f) {
    var i=0, k;
    for (k in this._enc) {
      if (this.has(k)) {
        f(k, this._enc[k], i++);
      }
    }
  };

  proto.type = function(x) {
    return this.has(x) ? this._enc[x].type : null;
  };

  proto.text = function(prop) {
    var text = this._enc[TEXT].text;
    return prop ? text[prop] : text;
  }

  proto.font = function(prop) {
    var font = this._enc[TEXT].text;
    return prop ? font[prop] : font;
  }

  proto.isType = function(x, t) {
    var xt = this.type(x);
    if (xt == null) return false;
    return (xt & t) > 0;
  };

  proto.config = function(name) {
    return this._cfg[name];
  };

  proto.toSpec = function(excludeConfig){
    var enc = util.duplicate(this._enc),
      spec;

    // convert type's bitcode to type name
    for(var e in enc){
      enc[e].type = consts.dataTypeNames[enc[e].type];
    }

    spec = {
      marktype: this._marktype,
      enc: enc
    }

    if(!excludeConfig){
      spec.cfg = util.duplicate(this._cfg)
    }

    // remove defaults
    var defaults = schema.instantiate();
    return schema.util.subtract(defaults, spec);
  };

  proto.toShorthand = function(){
    var enc = this._enc;
    return this._marktype + "." + util.keys(enc).map(function(e){
      var v = enc[e];
        return e + "-" +
          (v.aggr ? v.aggr+"_" : "") +
          (v.fn ? v.fn+"_" : "") +
          (v.bin ? "bin_" : "") +
          (v.name || "") + "-" +
          consts.dataTypeNames[v.type];
      }
    ).join(".");
  }

  Encoding.parseShorthand = function(shorthand, cfg){
    var enc = shorthand.split("."),
      marktype = enc.shift();

    enc = enc.reduce(function(m, e){
      var split = e.split("-"),
        enctype = split[0],
        o = {name: split[1], type: consts.dataTypes[split[2]]};

      // check aggregate type
      for(var i in schema.aggr.enum){
        var a = schema.aggr.enum[i];
        if(o.name.indexOf(a+"_") == 0){
          o.name = o.name.substr(a.length+1);
          if (a=="count" && o.name.length === 0) o.name = "*";
          o.aggr = a;
          break;
        }
      }
      // check time fn
      for(var i in schema.timefns){
        var f = schema.timefns[i];
        if(o.name && o.name.indexOf(f+"_") == 0){
          o.name = o.name.substr(o.length+1);
          o.fn = f;
          break;
        }
      }

      // check bin
      if(o.name && o.name.indexOf("bin_") == 0){
        o.name = o.name.substr(4);
        o.bin = true;
      }

      m[enctype] = o;
      return m;
    }, {});

    return new Encoding(marktype, enc, cfg);
  }

  Encoding.fromSpec = function(spec, extraCfg) {
    var enc = util.duplicate(spec.enc);

    //convert type from string to bitcode (e.g, O=1)
    for(var e in enc){
      enc[e].type = consts.dataTypes[enc[e].type];
    }

    return new Encoding(spec.marktype, enc, util.merge(spec.cfg, extraCfg || {}));
  }

  return Encoding;

})();

},{"./consts":5,"./globals":7,"./schema":11,"./util":14}],3:[function(require,module,exports){
var globals = require('./globals'),
  util = require('./util');

var axis = module.exports = {};

axis.names = function (props) {
  return util.keys(util.keys(props).reduce(function(a, x) {
    var s = props[x].scale;
    if (s===X || s===Y) a[props[x].scale] = 1;
    return a;
  }, {}));
};

axis.defs = function(names, encoding, opt) {
  return names.reduce(function(a, name) {
    a.push(axis.def(name, encoding, opt));
    return a;
  }, []);
};

axis.def = function (name, encoding, opt){
  var type = name;
  var isCol = name==COL, isRow = name==ROW;
  if(isCol) type = "x";
  if(isRow) type = "y";

  var axis = {
    type: type,
    scale: name,
  };

  if (encoding.isType(name, Q)) {
    //TODO(kanitw): better determine # of ticks
    axis.ticks = 3;
  }

  if (encoding.axis(name).grid) {
    axis.grid = true;
    axis.layer = "back";
  }

  if (encoding.axis(name).title) {
    //show title by default

    axis = axis_title(axis, name, encoding, opt);
  }

  if(isRow || isCol){
    axis.properties = {
      ticks: { opacity: {value: 0} },
      majorTicks: { opacity: {value: 0} },
      axis: { opacity: {value: 0} }
    };
  }
  if(isCol){
    axis.offset = [opt.xAxisMargin || 0, encoding.config("yAxisMargin")];
    axis.orient = "top";
  }

  if (name=="x" && (encoding.isType(name, O|T) || encoding.bin(name))) {
    axis.properties = {
      labels: {
        angle: {value: 270},
        align: {value: "right"},
        baseline: {value: "middle"}
      }
    };
  }

  // add custom label for time type
  if (encoding.isType(name, T)) {
    var fn = encoding.fn(name),
      properties = axis.properties = axis.properties || {},
      labels = properties.labels = properties.labels || {},
      text = labels.text = labels.text || {};

    switch (fn) {
      case "day":
      case "month":
        text.scale = "time-"+fn;
        break;
    }
  }

  return axis;
};

function axis_title(axis, name, encoding, opt){
  axis.title = encoding.fieldTitle(name);
  if(name==Y){
    axis.titleOffset = 60;
    // TODO: set appropriate titleOffset
    // maybe based on some string length from stats
  }
  return axis;
}

},{"./globals":7,"./util":14}],4:[function(require,module,exports){
var globals = require('./globals'),
  util = require('./util'),
  axis = require('./axis'),
  legends = require('./legends'),
  marks = require('./marks'),
  scale = require('./scale'),
  time = require('./time');

var compile = module.exports = function(encoding, stats) {
  var size = setSize(encoding, stats),
    cellWidth = size.cellWidth,
    cellHeight = size.cellHeight;

  var hasAgg = encoding.any(function(v, k){
    return v.aggr !== undefined;
  });

  var spec = template(encoding, size, stats),
    group = spec.marks[0],
    mark = marks[encoding.marktype()],
    mdef = markdef(mark, encoding, {
      hasAggregate: hasAgg
    });

  var hasRow = encoding.has(ROW), hasCol = encoding.has(COL);

  var preaggregatedData = encoding.config("useVegaServer");

  group.marks.push(mdef);
  // TODO: return value not used
  binning(spec.data[0], encoding, {preaggregatedData: preaggregatedData});

  var lineType = marks[encoding.marktype()].line;

  if(!preaggregatedData){
    spec = time(spec, encoding);
  }

  // handle subfacets
  var aggResult = aggregates(spec.data[0], encoding, {preaggregatedData: preaggregatedData}),
    details = aggResult.details,
    hasDetails = details && details.length > 0,
    stack = hasDetails && stacking(spec, encoding, mdef, aggResult.facets);

  if (hasDetails && (stack || lineType)) {
    //subfacet to group stack / line together in one group
    subfacet(group, mdef, details, stack, encoding);
  }

  // auto-sort line/area values
  //TODO(kanitw): have some config to turn off auto-sort for line (for line chart that encodes temporal information)
  if (lineType) {
    var f = (encoding.isType(X, Q | T) && encoding.isType(Y, O)) ? Y : X;
    if (!mdef.from) mdef.from = {};
    mdef.from.transform = [{type: "sort", by: encoding.field(f)}];
  }

  // Small Multiples
  if (hasRow || hasCol) {
    spec = facet(group, encoding, cellHeight, cellWidth, spec, mdef, stack, stats);
  } else {
    group.scales = scale.defs(scale.names(mdef.properties.update), encoding,
      {stack: stack, stats: stats});
    group.axes = axis.defs(axis.names(mdef.properties.update), encoding);
    group.legends = legends.defs(encoding);
  }
  return spec;
};

function getCardinality(encoding, encType, stats){
  var field = encoding.fieldName(encType);
  if (encoding.bin(encType)) {
    var bins = util.getbins(stats[field]);
    return (bins.stop - bins.start) / bins.step;
  }
  return stats[field].cardinality;
}

function setSize(encoding, stats) {
  var hasRow = encoding.has(ROW),
      hasCol = encoding.has(COL),
      hasX = encoding.has(X),
      hasY = encoding.has(Y);

  // HACK to set chart size
  // NOTE: this fails for plots driven by derived values (e.g., aggregates)
  // One solution is to update Vega to support auto-sizing
  // In the meantime, auto-padding (mostly) does the trick
  //
  var colCardinality = hasCol ? getCardinality(encoding, COL, stats) : 1,
    rowCardinality = hasRow ? getCardinality(encoding, ROW, stats) : 1;

  var cellWidth = hasX ?
      +encoding.config("cellWidth") || encoding.config("width") * 1.0 / colCardinality :
      encoding.marktype() === "text" ?
        +encoding.config("textCellWidth") :
        +encoding.config("bandSize"),
    cellHeight = hasY ?
      +encoding.config("cellHeight") || encoding.config("height") * 1.0 / rowCardinality :
      +encoding.config("bandSize"),
    cellPadding = encoding.config("cellPadding"),
    bandPadding = encoding.config("bandPadding"),
    width = encoding.config("_minWidth"),
    height = encoding.config("_minHeight");

  if (hasX && (encoding.isType(X, O) || encoding.bin(X))) { //ordinal field will override parent
    // bands within cell use rangePoints()
    var xCardinality = getCardinality(encoding, X, stats);
    cellWidth = (xCardinality + bandPadding) * +encoding.config("bandSize");
  }
  // Cell bands use rangeBands(). There are n-1 padding.  Outerpadding = 0 for cells
  width = cellWidth * ((1 + cellPadding) * (colCardinality-1) + 1);

  if (hasY && (encoding.isType(Y, O) || encoding.bin(Y))) {
    // bands within cell use rangePoint()
    var yCardinality = getCardinality(encoding, Y, stats);
    cellHeight = (yCardinality + bandPadding) * +encoding.config("bandSize");
  }
  // Cell bands use rangeBands(). There are n-1 padding.  Outerpadding = 0 for cells
  height = cellHeight * ((1 + cellPadding) * (rowCardinality-1) + 1);

  return {
    cellWidth: cellWidth,
    cellHeight: cellHeight,
    width: width,
    height:height
  };
}

function facet(group, encoding, cellHeight, cellWidth, spec, mdef, stack, stats) {
    var enter = group.properties.enter;
    var facetKeys = [], cellAxes = [];

    var hasRow = encoding.has(ROW), hasCol = encoding.has(COL);

    var xAxisMargin = encoding.has(Y) ? encoding.config("xAxisMargin") : undefined;

    enter.fill = {value: encoding.config("cellBackgroundColor")};

    //move "from" to cell level and add facet transform
    group.from = {data: group.marks[0].from.data};

    if (group.marks[0].from.transform) {
      delete group.marks[0].from.data; //need to keep transform for subfacetting case
    } else {
      delete group.marks[0].from;
    }
    if (hasRow) {
      if (!encoding.isType(ROW, O)) {
        util.error("Row encoding should be ordinal.");
      }
      enter.y = {scale: ROW, field: "keys." + facetKeys.length};
      enter.height = {"value": cellHeight}; // HACK

      facetKeys.push(encoding.field(ROW));

      var from;
      if (hasCol) {
        from = util.duplicate(group.from);
        from.transform = from.transform || [];
        from.transform.unshift({type: "facet", keys: [encoding.field(COL)]});
      }

      var axesGrp = groupdef("x-axes", {
          axes: encoding.has(X) ?  axis.defs(["x"], encoding) : undefined,
          x: hasCol ? {scale: COL, field: "keys.0", offset: xAxisMargin} : {value: xAxisMargin},
          width: hasCol && {"value": cellWidth}, //HACK?
          from: from
        });

      spec.marks.push(axesGrp);
      (spec.axes = spec.axes || []);
      spec.axes.push.apply(spec.axes, axis.defs(["row"], encoding));
    } else { // doesn't have row
      if(encoding.has(X)){
        //keep x axis in the cell
        cellAxes.push.apply(cellAxes, axis.defs(["x"], encoding));
      }
    }

    if (hasCol) {
      if (!encoding.isType(COL, O)) {
        util.error("Col encoding should be ordinal.");
      }
      enter.x = {scale: COL, field: "keys." + facetKeys.length};
      enter.width = {"value": cellWidth}; // HACK

      facetKeys.push(encoding.field(COL));

      var from;
      if (hasRow) {
        from = util.duplicate(group.from);
        from.transform = from.transform || [];
        from.transform.unshift({type: "facet", keys: [encoding.field(ROW)]});
      }

      var axesGrp = groupdef("y-axes", {
        axes: encoding.has(Y) ? axis.defs(["y"], encoding) : undefined,
        y: hasRow && {scale: ROW, field: "keys.0"},
        x: hasRow && {value: xAxisMargin},
        height: hasRow && {"value": cellHeight}, //HACK?
        from: from
      });

      spec.marks.push(axesGrp);
      (spec.axes = spec.axes || [])
      spec.axes.push.apply(spec.axes, axis.defs(["col"], encoding, {
        xAxisMargin: xAxisMargin
      }));
    } else { // doesn't have col
      if(encoding.has(Y)){
        cellAxes.push.apply(cellAxes, axis.defs(["y"], encoding));
      }
    }

    if(hasRow){
      if(enter.x) enter.x.offset= xAxisMargin;
      else enter.x = {value: xAxisMargin};
    }
    if(hasCol){
      //TODO fill here..
    }

    // assuming equal cellWidth here
    // TODO: support heterogenous cellWidth (maybe by using multiple scales?)
    spec.scales = (spec.scales ||[]).concat(scale.defs(
      scale.names(enter).concat(scale.names(mdef.properties.update)),
      encoding,
      {cellWidth: cellWidth, cellHeight: cellHeight, stack: stack, facet:true, stats: stats}
    )); // row/col scales + cell scales

    if (cellAxes.length > 0) {
      group.axes = cellAxes;
    }

    // add facet transform
    var trans = (group.from.transform || (group.from.transform = []));
    trans.unshift({type: "facet", keys: facetKeys});

  return spec;
  }

function subfacet(group, mdef, details, stack, encoding) {
  var m = group.marks,
    g = groupdef("subfacet", {marks: m});

  group.marks = [g];
  g.from = mdef.from;
  delete mdef.from;

  //TODO test LOD -- we should support stack / line without color (LOD) field
  var trans = (g.from.transform || (g.from.transform = []));
  trans.unshift({type: "facet", keys: details});

  if (stack && encoding.has(COLOR)) {
    trans.unshift({type: "sort", by: encoding.field(COLOR)});
  }
}

function binning(spec, encoding, opt) {
  opt = opt || {};
  var bins = {};
  encoding.forEach(function(vv, d) {
    if (d.bin) bins[d.name] = d.name;
  });
  bins = util.keys(bins);

  if (bins.length === 0 || opt.preaggregatedData) return false;

  if (!spec.transform) spec.transform = [];
  bins.forEach(function(d) {
    spec.transform.push({
      type: "bin",
      field: "data." + d,
      output: "data.bin_" + d,
      maxbins: MAX_BINS
    });
  });
  return bins;
}

function aggregates(spec, encoding, opt) {
  opt = opt || {};
  var dims = {}, meas = {}, detail = {}, facets={};
  encoding.forEach(function(encType, field) {
    if (field.aggr) {
      if(field.aggr==="count"){
        meas["count"] = {op:"count", field:"*"};
      }else{
        meas[field.aggr+"|"+field.name] = {
          op:field.aggr,
          field:"data."+field.name
        };
      }
    } else {
      dims[field.name] = encoding.field(encType);
      if (encType==ROW || encType == COL){
        facets[field.name] = dims[field.name];
      }else if (encType !== X && encType !== Y) {
        detail[field.name] = dims[field.name];
      }
    }
  });
  dims = util.vals(dims);
  meas = util.vals(meas);

  if (meas.length > 0 && !opt.preaggregatedData) {
    if (!spec.transform) spec.transform = [];
    spec.transform.push({
      type: "aggregate",
      groupby: dims,
      fields: meas
    });

    if (encoding.marktype() === TEXT) {
      meas.forEach( function (m) {
        var fieldName = m.field.substr(5), //remove "data."
          field = "data." + (m.op ? m.op + "_" : "") + fieldName;
        spec.transform.push({
          type: "formula",
          field: field,
          expr: "d3.format('.2f')(d."+field+")"
        });
      });
    }
  }
  return {
    details: util.vals(detail),
    dims: dims,
    facets: util.vals(facets),
    aggregated: meas.length > 0
  }
}

function stacking(spec, encoding, mdef, facets) {
  if (!marks[encoding.marktype()].stack) return false;
  if (!encoding.has(COLOR)) return false;

  var dim = X, val = Y, idx = 1;
  if (encoding.isType(X,Q|T) && !encoding.isType(Y,Q|T) && encoding.has(Y)) {
    dim = Y;
    val = X;
    idx = 0;
  }

  // add transform to compute sums for scale
  var stacked = {
    name: STACKED,
    source: TABLE,
    transform: [{
      type: "aggregate",
      groupby: [encoding.field(dim)].concat(facets), // dim and other facets
      fields: [{op: "sum", field: encoding.field(val)}] // TODO check if field with aggr is correct?
    }]
  };

  if(facets && facets.length > 0){
    stacked.transform.push({ //calculate max for each facet
      type: "aggregate",
      groupby: facets,
      fields: [{op: "max", field: "data.sum_" + encoding.field(val, true)}]
    });
  }

  spec.data.push(stacked);

  // add stack transform to mark
  mdef.from.transform = [{
    type: "stack",
    point: encoding.field(dim),
    height: encoding.field(val),
    output: {y1: val, y0: val+"2"}
  }];

  // TODO: This is super hack-ish -- consolidate into modular mark properties?
  mdef.properties.update[val] = mdef.properties.enter[val] = {scale: val, field: val};
  mdef.properties.update[val+"2"] = mdef.properties.enter[val+"2"] = {scale: val, field: val+"2"};

  return val; //return stack encoding
}


function markdef(mark, encoding, opt) {
  var p = mark.prop(encoding, opt)
  return {
    type: mark.type,
    from: {data: TABLE},
    properties: {enter: p, update: p}
  };
}

function groupdef(name, opt) {
  opt = opt || {};
  return {
    _name: name || undefined,
    type: "group",
    from: opt.from,
    properties: {
      enter: {
        x: opt.x || undefined,
        y: opt.y || undefined,
        width: opt.width || {group: "width"},
        height: opt.height || {group: "height"}
      }
    },
    scales: opt.scales || undefined,
    axes: opt.axes || undefined,
    marks: opt.marks || []
  };
}

function template(encoding, size, stats) { //hack use stats

  var data = {name:TABLE, format: {type: encoding.config("dataFormatType")}},
    dataUrl = vl.data.getUrl(encoding, stats);
  if(dataUrl) data.url = dataUrl;

  var preaggregatedData = encoding.config("useVegaServer");

  encoding.forEach(function(encType, field){
    if(field.type == T){
      data.format.parse = data.format.parse || {};
      data.format.parse[field.name] = "date";
    }else if(field.type == Q){
      data.format.parse = data.format.parse || {};
      if (field.aggr === "count") {
        var name = "count";
      } else if(preaggregatedData && field.bin){
        var name = "bin_" + field.name;
      } else if(preaggregatedData && field.aggr){
        var name = field.aggr + "_" + field.name;
      } else{
        var name = field.name;
      }
      data.format.parse[name] = "number";
    }
  });

  return {
    width: size.width,
    height: size.height,
    padding: "auto",
    data: [data],
    marks: [groupdef("cell", {
      width: size.cellWidth ? {value: size.cellWidth}: undefined,
      height: size.cellHeight ? {value: size.cellHeight} : undefined
    })]
  };
}

},{"./axis":3,"./globals":7,"./legends":8,"./marks":9,"./scale":10,"./time":13,"./util":14}],5:[function(require,module,exports){
var globals = require('./globals');

var consts = module.exports = {};

consts.encodingTypes = [X, Y, ROW, COL, SIZE, SHAPE, COLOR, ALPHA, TEXT];

consts.dataTypes = {"O": O, "Q": Q, "T": T};

consts.dataTypeNames = ["O","Q","T"].reduce(function(r,x) {
  r[consts.dataTypes[x]] = x; return r;
},{});

consts.DEFAULTS = {
  //small multiples
  cellHeight: 200, // will be overwritten by bandWidth
  cellWidth: 200, // will be overwritten by bandWidth
  cellPadding: 0.1,
  cellBackgroundColor: "#fdfdfd",
  xAxisMargin: 80,
  yAxisMargin: 0,
  textCellWidth: 90,

  // marks
  strokeWidth: 2,

  // scales
  timeScaleLabelLength: 3
};

},{"./globals":7}],6:[function(require,module,exports){
// TODO rename getDataUrl to vl.data.getUrl() ?

var util = require('./util');

var data = module.exports = {};

data.getUrl = function getDataUrl(encoding, stats) {
  if (!encoding.config("useVegaServer")) {
    // don't use vega server
    return encoding.config("dataUrl");
  }

  if (encoding.length() === 0) {
    // no fields
    return;
  }

  var fields = []
  encoding.forEach(function(encType, field){
    var obj = {
      name: encoding.field(encType, true),
      field: field.name
    }
    if (field.aggr) {
      obj.aggr = field.aggr
    }
    if (field.bin) {
      obj.binSize = util.getbins(stats[field.name]).step;
    }
    fields.push(obj);
  });

  var query = {
    table: encoding.config("vegaServerTable"),
    fields: fields
  }

  return encoding.config("vegaServerUrl") + "/query/?q=" + JSON.stringify(query)
};

/**
 * @param  {Object} data data in JSON/javascript object format
 * @return Array of {name: __name__, type: "number|text|time|location"}
 */
data.getSchema = function(data){
  var schema = [],
    fields = util.keys(data[0]);

  fields.forEach(function(k){
    // find non-null data
    var i=0, datum = data[i][k];
    while(datum === "" || datum === null || datum === undefined){
      datum = data[++i][k];
    }

    //TODO(kanitw): better type inference here
    var type = (typeof datum === "number") ? "Q":
      isNaN(Date.parse(datum)) ? "O" : "T";

    schema.push({name: k, type: type});
  });

  return schema;
};

data.getStats = function(data){ // hack
  var stats = {},
    fields = util.keys(data[0]);

  fields.forEach(function(k) {
    var stat = util.minmax(data, k);
    stat.cardinality = util.uniq(data, k);
    stat.count = data.length;
    stats[k] = stat;
  });
  return stats;
};

},{"./util":14}],7:[function(require,module,exports){
(function (global){
// declare global constant
var g = global || window;

g.TABLE = "table";
g.STACKED = "stacked";
g.INDEX = "index";

g.X = "x";
g.Y = "y";
g.ROW = "row";
g.COL = "col";
g.SIZE = "size";
g.SHAPE = "shape";
g.COLOR = "color";
g.ALPHA = "alpha";
g.TEXT = "text";

g.O = 1;
g.Q = 2;
g.T = 4;

//TODO refactor this to be config?
g.MAX_BINS = 20;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],8:[function(require,module,exports){
var global = require('./globals');

var legends = module.exports = {};

legends.defs = function(encoding) {
  var _legends = [];

  // TODO: support alpha

  if (encoding.has(COLOR) && encoding.legend(COLOR)) {
    _legends.push(legends.def(COLOR, encoding, {
      fill: COLOR,
      orient: "right"
    }));
  }

  if (encoding.has(SIZE) && encoding.legend(SIZE)) {
    _legends.push(legends.def(SIZE, encoding, {
      size: SIZE,
      orient: _legends.length === 1 ? "left" : "right"
    }));
  }

  if (encoding.has(SHAPE) && encoding.legend(SHAPE)) {
    if (_legends.length === 2) {
      // TODO: fix this
      console.error("Vegalite currently only supports two _legends");
      return _legends;
    }
    _legends.push(legends.def(SHAPE, encoding, {
      shape: SHAPE,
      orient: _legends.length === 1 ? "left" : "right"
    }));
  }

  return _legends;
};

legends.def = function(name, encoding, props){
  var _legend = props;

  _legend.title = encoding.fieldTitle(name);

  if (encoding.isType(name, T)) {
    var fn = encoding.fn(name),
      properties = _legend.properties = _legend.properties || {},
      labels = properties.labels = properties.labels || {},
      text = labels.text = labels.text || {};

    switch (fn) {
      case "day":
      case "month":
        text.scale = "time-"+fn;
        break;
    }
  }

  return _legend;
};
},{"./globals":7}],9:[function(require,module,exports){
var globals = require("./globals"),
  util = require("./util");

var marks = module.exports = {};

marks.bar = {
  type: "rect",
  stack: true,
  prop: bar_props,
  requiredEncoding: ["x", "y"],
  supportedEncoding: {row:1, col:1, x:1, y:1, size:1, color:1, alpha:1}
};

marks.line = {
  type: "line",
  line: true,
  prop: line_props,
  requiredEncoding: ["x", "y"],
  supportedEncoding: {row:1, col:1, x:1, y:1, color:1, alpha:1}
};

marks.area = {
  type: "area",
  stack: true,
  line: true,
  requiredEncoding: ["x", "y"],
  prop: area_props,
  supportedEncoding: marks.line.supportedEncoding
};

marks.circle = {
  type: "symbol",
  prop: filled_point_props("circle"),
  supportedEncoding: {row:1, col:1, x:1, y:1, size:1, color:1, alpha:1}
};

marks.square = {
  type: "symbol",
  prop: filled_point_props("square"),
  supportedEncoding: marks.circle.supportedEncoding
};

marks.point = {
  type: "symbol",
  prop: point_props,
  supportedEncoding: {row:1, col:1, x:1, y:1, size:1, color:1, alpha:1, shape:1}
};

marks.text = {
  type: "text",
  prop: text_props,
  requiredEncoding: ["text"],
  supportedEncoding: {row:1, col:1, size:1, color:1, alpha:1, text:1}
};

function bar_props(e) {
  var p = {};

  // x
  if (e.isType(X,Q|T) && !e.bin(X)) {
    p.x = {scale: X, field: e.field(X)};
    if (e.has(Y) && (!e.isType(Y,Q|T) || e.bin(Y))) {
      p.x2 = {scale: X, value: 0};
    }
  } else if (e.has(X)) {
    p.xc = {scale: X, field: e.field(X)};
  } else {
    p.xc = {value: 0};
  }

  // y
  if (e.isType(Y,Q|T) && !e.bin(Y)) {
    p.y = {scale: Y, field: e.field(Y)};
    p.y2 = {scale: Y, value: 0};
  } else if (e.has(Y)) {
    p.yc = {scale: Y, field: e.field(Y)};
  } else {
    p.yc = {group: "height"};
  }

  // width
  if (!e.isType(X,Q|T)) {
    if (e.has(SIZE)) {
      p.width = {scale: SIZE, field: e.field(SIZE)};
    } else {
      // p.width = {scale: X, band: true, offset: -1};
      p.width = {value: e.band(X).size, offset: -1};
    }
  } else if (!e.isType(Y,O) && !e.bin(Y)) {
    p.width = {value: e.band(X).size, offset: -1};
  }

  // height
  if (!e.isType(Y,Q|T)) {
    if (e.has(SIZE)) {
      p.height = {scale: SIZE, field: e.field(SIZE)};
    } else {
      // p.height = {scale: Y, band: true, offset: -1};
      p.height = {value: e.band(Y).size, offset: -1};
    }
  } else if (!e.isType(X,O) && !e.bin(X)) {
    p.height = {value: e.band(Y).size, offset: -1};
  }

  // fill
  if (e.has(COLOR)) {
    p.fill = {scale: COLOR, field: e.field(COLOR)};
  } else if (!e.has(COLOR)) {
    p.fill = {value: e.value(COLOR)};
  }

  // alpha
  if (e.has(ALPHA)) {
    p.opacity = {scale: ALPHA, field: e.field(ALPHA)};
  }

  return p;
}

function point_props(e, opt) {
  var p = {};
  opt = opt || {};

  // x
  if (e.has(X)) {
    p.x = {scale: X, field: e.field(X)};
  } else if (!e.has(X)) {
    p.x = {value: e.band(X).size/2};
  }

  // y
  if (e.has(Y)) {
    p.y = {scale: Y, field: e.field(Y)};
  } else if (!e.has(Y)) {
    p.y = {value: e.band(Y).size/2};
  }

  // size
  if (e.has(SIZE)) {
    p.size = {scale: SIZE, field: e.field(SIZE)};
  } else if (!e.has(SIZE)) {
    p.size = {value: e.value(SIZE)};
  }

  // shape
  if (e.has(SHAPE)) {
    p.shape = {scale: SHAPE, field: e.field(SHAPE)};
  } else if (!e.has(SHAPE)) {
    p.shape = {value: e.value(SHAPE)};
  }

  // stroke
  if (e.has(COLOR)) {
    p.stroke = {scale: COLOR, field: e.field(COLOR)};
  } else if (!e.has(COLOR)) {
    p.stroke = {value: e.value(COLOR)};
  }

  // alpha
  if (e.has(ALPHA)) {
    p.opacity = {scale: ALPHA, field: e.field(ALPHA)};
  }else{
    p.opacity = {
      value: e.value(ALPHA)
    };
  }

  p.strokeWidth = {value: e.config("strokeWidth")};

  return p;
}

function line_props(e) {
  var p = {};

  // x
  if (e.has(X)) {
    p.x = {scale: X, field: e.field(X)};
  } else if (!e.has(X)) {
    p.x = {value: 0};
  }

  // y
  if (e.has(Y)) {
    p.y = {scale: Y, field: e.field(Y)};
  } else if (!e.has(Y)) {
    p.y = {group: "height"};
  }

  // stroke
  if (e.has(COLOR)) {
    p.stroke = {scale: COLOR, field: e.field(COLOR)};
  } else if (!e.has(COLOR)) {
    p.stroke = {value: e.value(COLOR)};
  }

  // alpha
  if (e.has(ALPHA)) {
    p.opacity = {scale: ALPHA, field: e.field(ALPHA)};
  }

  p.strokeWidth = {value: e.config("strokeWidth")};

  return p;
}

function area_props(e) {
  var p = {};

  // x
  if (e.isType(X,Q|T)) {
    p.x = {scale: X, field: e.field(X)};
    if (!e.isType(Y,Q|T) && e.has(Y)) {
      p.x2 = {scale: X, value: 0};
      p.orient = {value: "horizontal"};
    }
  } else if (e.has(X)) {
    p.x = {scale: X, field: e.field(X)};
  } else {
    p.x = {value: 0};
  }

  // y
  if (e.isType(Y,Q|T)) {
    p.y = {scale: Y, field: e.field(Y)};
    p.y2 = {scale: Y, value: 0};
  } else if (e.has(Y)) {
    p.y = {scale: Y, field: e.field(Y)};
  } else {
    p.y = {group: "height"};
  }

  // stroke
  if (e.has(COLOR)) {
    p.fill = {scale: COLOR, field: e.field(COLOR)};
  } else if (!e.has(COLOR)) {
    p.fill = {value: e.value(COLOR)};
  }

  // alpha
  if (e.has(ALPHA)) {
    p.opacity = {scale: ALPHA, field: e.field(ALPHA)};
  }

  return p;
}

function filled_point_props(shape) {
  return function(e, opt) {
    var p = {};
    opt = opt || {};

    // x
    if (e.has(X)) {
      p.x = {scale: X, field: e.field(X)};
    } else if (!e.has(X)) {
      p.x = {value: e.band(X).size/2};
    }

    // y
    if (e.has(Y)) {
      p.y = {scale: Y, field: e.field(Y)};
    } else if (!e.has(Y)) {
      p.y = {value: e.band(Y).size/2};
    }

    // size
    if (e.has(SIZE)) {
      p.size = {scale: SIZE, field: e.field(SIZE)};
    } else if (!e.has(X)) {
      p.size = {value: e.value(SIZE)};
    }

    // shape
    p.shape = {value: shape};

    // fill
    if (e.has(COLOR)) {
      p.fill = {scale: COLOR, field: e.field(COLOR)};
    } else if (!e.has(COLOR)) {
      p.fill = {value: e.value(COLOR)};
    }

    // alpha
    if (e.has(ALPHA)) {
      p.opacity = {scale: ALPHA, field: e.field(ALPHA)};
    }else {
      p.opacity = {
        value: e.value(ALPHA)
      };
    }

    return p;
  };
}

function text_props(e) {
  var p = {};

  // x
  if (e.has(X)) {
    p.x = {scale: X, field: e.field(X)};
  } else if (!e.has(X)) {
    p.x = {value: e.band(X).size/2};
  }

  // y
  if (e.has(Y)) {
    p.y = {scale: Y, field: e.field(Y)};
  } else if (!e.has(Y)) {
    p.y = {value: e.band(Y).size/2};
  }

  // size
  if (e.has(SIZE)) {
    p.fontSize = {scale: SIZE, field: e.field(SIZE)};
  } else if (!e.has(X)) {
    p.fontSize = {value: e.font("size")};
  }

  // fill
  if (e.has(COLOR)) {
    p.fill = {scale: COLOR, field: e.field(COLOR)};
  } else if (!e.has(COLOR)) {
    p.fill = {value: e.text("color")};
  }

  // alpha
  if (e.has(ALPHA)) {
    p.opacity = {scale: ALPHA, field: e.field(ALPHA)};
  }

  // text
  if (e.has(TEXT)) {
    p.text = {field: e.field(TEXT)};
  } else {
    p.text = {value: "Abc"};
  }

  p.font = {value: e.font("family")};
  p.fontWeight = {value: e.font("weight")};
  p.fontStyle = {value: e.font("style")};
  p.baseline = {value: e.text("baseline")};

  // align
  if (e.has(X)) {
    if (e.isType(X,O)) {
      p.align = {value: "left"};
      p.dx = {value: e.text("margin")};
    } else {
      p.align = {value: "center"}
    }
  } else if (e.has(Y)) {
    p.align = {value: "left"};
    p.dx = {value: e.text("margin")};
  } else {
    p.align = {value: e.text("align")};
  }

  return p;
}

},{"./globals":7,"./util":14}],10:[function(require,module,exports){
var globals = require("./globals"),
  util = require("./util");

var scale = module.exports = {};

scale.names = function (props) {
  return util.keys(util.keys(props).reduce(function(a, x) {
    if (props[x] && props[x].scale) a[props[x].scale] = 1;
    return a;
  }, {}));
};

scale.defs = function (names, encoding, opt) {
  opt = opt || {};

  return names.reduce(function(a, name) {
    var s = {
      name: name,
      type: scale.type(name, encoding),
      domain: scale_domain(name, encoding, opt)
    };
    if (s.type === "ordinal" && !encoding.bin(name)) {
      s.sort = true;
    }

    scale_range(s, encoding, opt);

    return (a.push(s), a);
  }, []);
};

scale.type = function (name, encoding) {
  var fn;
  switch (encoding.type(name)) {
    case O: return "ordinal";
    case T:
      switch(encoding.fn(name)){
        case "second":
        case "minute":
        case "hour":
        case "day":
        case "date":
        case "month":
          return "ordinal";
        case "year":
          return "linear";
      }
      return "time";
    case Q:
      if (encoding.bin(name)) {
        return "ordinal";
      }
      return encoding.scale(name).type;
  }
};

function scale_domain(name, encoding, opt) {
  if (encoding.type(name) === T){
    switch(encoding.fn(name)){
      case "second":
      case "minute":  return util.range(0, 60);
      case "hour":    return util.range(0, 24);
      case "day":     return util.range(0, 7);
      case "date":    return util.range(0, 32);
      case "month":   return util.range(0, 12);
    }
  }

  if (encoding.bin(name)) {
    // TODO: add includeEmptyConfig here
    if (opt.stats) {
      var bins = util.getbins(opt.stats[encoding.fieldName(name)]);
      var domain = util.range(bins.start, bins.stop, bins.step);
      return name===Y ? domain.reverse() : domain;
    }
  }

  return name == opt.stack ?
    {
      data: STACKED,
      field: "data." + (opt.facet ? "max_" :"") + "sum_" + encoding.field(name, true)
    }:
    {data: TABLE, field: encoding.field(name)};
}

function scale_range(s, encoding, opt) {
  var spec = encoding.scale(s.name);
  switch (s.name) {
    case X:
      if (s.type==="ordinal") {
        s.bandWidth = encoding.band(X).size;
      } else {
        s.range = opt.cellWidth ? [0, opt.cellWidth] : "width";
        s.zero = spec.zero;
        s.reverse = spec.reverse;
      }
      s.round = true;
      if (s.type==="time"){
        s.nice = encoding.fn(s.name);
      }else{
        s.nice = true;
      }
      break;
    case Y:
      if (s.type==="ordinal") {
        s.bandWidth = encoding.band(Y).size;
      } else {
        s.range = opt.cellHeight ? [opt.cellHeight, 0] : "height";
        s.zero = spec.zero;
        s.reverse = spec.reverse;
      }

      s.round = true;

      if (s.type==="time"){
        s.nice = encoding.fn(s.name) || encoding.config("timeScaleNice");
      }else{
        s.nice = true;
      }
      break;
    case ROW: // support only ordinal
      s.bandWidth = opt.cellHeight || encoding.config("cellHeight");
      s.round = true;
      s.nice = true;
      break;
    case COL: // support only ordinal
      s.bandWidth = opt.cellWidth || encoding.config("cellWidth");
      s.round = true;
      s.nice = true;
      break;
    case SIZE:
      if (encoding.is("bar")) {
        s.range = [3, Math.max(encoding.band(X).size, encoding.band(Y).size)];
      } else if (encoding.is(TEXT)) {
        s.range = [8, 40];
      } else {
        s.range = [10, 1000];
      }
      s.round = true;
      s.zero = false;
      break;
    case SHAPE:
      s.range = "shapes";
      break;
    case COLOR:
      if (s.type === "ordinal") {
        s.range = "category10";
      } else {
        s.range = ["#ddf", "steelblue"];
        s.zero = false;
      }
      break;
    case ALPHA:
      s.range = [0.2, 1.0];
      break;
    default:
      throw new Error("Unknown encoding name: "+s.name);
  }

  switch(s.name){
    case ROW:
    case COL:
      s.padding = encoding.config("cellPadding");
      s.outerPadding = 0;
      break;
    case X:
    case Y:
      if (s.type === "ordinal") { //&& !s.bandWidth
        s.points = true;
        s.padding = encoding.config("bandPadding");
      }
  }
}

},{"./globals":7,"./util":14}],11:[function(require,module,exports){
// Package of defining Vegalite Specification's json schema
//
var schema = module.exports = {},
  util = require('./util');

schema.util = require('./schemautil');

schema.marktype = {
  type: "string",
  enum: ["point", "bar", "line", "area", "circle", "square", "text"]
};

schema.aggr = {
  type: "string",
  enum: ["avg", "sum", "min", "max", "count"],
  supportedEnums: {
    Q: ["avg", "sum", "min", "max", "count"],
    O: ["count"],
    T: ["avg", "min", "max", "count"],
    "": ["count"],
  },
  supportedTypes: {"Q": true, "O": true, "T": true, "": true}
};

schema.timefns = ["month", "year", "day", "date", "hour", "minute", "second"];

schema.fn = {
  type: "string",
  enum: schema.timefns,
  supportedTypes: {"T": true}
}

//TODO(kanitw): add other type of function here

schema.scale_type = {
  type: "string",
  enum: ["linear", "log","pow", "sqrt", "quantile"],
  default: "linear",
  supportedTypes: {"Q": true}
};

schema.field = {
  type: "object",
  properties: {
    name: {
      type: "string"
    }
  }
};

var clone = util.duplicate;
var merge = schema.util.merge;

var typicalField = merge(clone(schema.field), {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: ["O", "Q", "T"]
    },
    bin: {
      type: "boolean",
      default: false,
      supportedTypes: {"Q": true, "O": true}
    },
    aggr: schema.aggr,
    fn: schema.fn,
    scale: {
      type: "object",
      properties: {
        type: schema.scale_type,
        reverse: { type: "boolean", default: false },
        zero: {
          type: "boolean",
          description: "Include zero",
          default: false,
          supportedTypes: {"Q": true}
        },
        nice: {
          type: "string",
          enum: ["second", "minute", "hour", "day", "week", "month", "year"],
          supportedTypes: {"T": true}
        }
      }
    }
  }
});

var onlyOrdinalField = merge(clone(schema.field), {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: ["O"]
    },
    bin: {
      type: "boolean",
      default: false,
      supportedTypes: {"O": true}
    },
    aggr: {
      type: "string",
      enum: ["count"],
      supportedTypes: {"O": true}
    }
  }
});

var axisMixin = {
  type: "object",
  properties: {
    axis: {
      type: "object",
      properties: {
        grid: { type: "boolean", default: false },
        title: { type: "boolean", default: true }
      }
    }
  }
}

var bandMixin = {
  type: "object",
  properties: {
    band: {
      type: "object",
      properties: {
        size: {
          type: "integer",
          minimum: 0,
          default: 21
        },
        padding: {
          type: "integer",
          minimum: 0,
          default: 1
        }
      }
    }
  }
}

var legendMixin = {
  type: "object",
  properties: {
    legend: { type: "boolean", default: true }
  }
}

var textMixin = {
  type: "object",
  properties: {
    text: {
      type: "object",
      properties: {
        text: {
          type: "object",
          properties: {
            color: {
              type: "string",
              default: "black"
            },
            align: {
              type: "string",
              default: "left"
            },
            baseline: {
              type: "string",
              default: "middle"
            },
            margin: {
              type: "integer",
              default: 4,
              minimum: 0
            }
          }
        },
        font: {
          type: "object",
          properties: {
            weight: {
              type: "string",
              enum: ["normal", "bold"],
              default: "normal"
            },
            size: {
              type: "integer",
              default: 10,
              minimum: 0
            },
            family: {
              type: "string",
              default: "Helvetica Neue"
            },
            style: {
              type: "string",
              default: "normal",
              enum: ["normal", "italic"]
            }
          }
        }
      }
    }
  }
}

var sizeMixin = {
  type: "object",
  properties: {
    value : {
      type: "integer",
      default: 10,
      minimum: 0
    }
  }
}

var colorMixin = {
  type: "object",
  properties: {
    value : {
      type: "string",
      default: "steelblue"
    }
  }
}

var alphaMixin = {
  type: "object",
  properties: {
    value: {
      type: "number",
      default: 1,
      minimum: 0,
      maximum: 1
    }
  }
}

var shapeMixin = {
  type: "object",
  properties: {
    value : {
      type: "string",
      enum: ["circle", "square", "cross", "diamond", "triangle-up", "triangle-down"],
      default: "circle"
    }
  }
}

var requiredNameType = {
  required: ["name", "type"]
}

var x = merge(merge(merge(clone(typicalField), axisMixin), bandMixin), requiredNameType);
var y = clone(x);

var row = merge(clone(onlyOrdinalField), requiredNameType);
var col = clone(row);

var size = merge(merge(clone(typicalField), legendMixin), sizeMixin);
var color = merge(merge(clone(typicalField), legendMixin), colorMixin);
var alpha = merge(clone(typicalField), alphaMixin);
var shape = merge(merge(clone(onlyOrdinalField), legendMixin), shapeMixin);

var text = merge(clone(typicalField), textMixin);

var cfg = {
  type: "object",
  properties: {
    // template
    width: {
      type: "integer",
      default: undefined
    },
    height: {
      type: "integer",
      default: undefined
    },
    viewport: {
      type: "array",
      items: {
        type: ["integer"]
      },
      default: undefined
    },
    _minWidth: {
      type: "integer",
      default: 20,
      minimum: 0
    },
    _minHeight: {
      type: "integer",
      default: 20,
      minimum: 0
    },

    // data source
    dataFormatType: {
      type: "string",
      enum: ["json", "csv"],
      default: "json"
    },
    useVegaServer: {
      type: "boolean",
      default: false
    },
    dataUrl: {
      type: "string",
      default: undefined
    },
    vegaServerTable: {
      type: "string",
      default: undefined
    },
    vegaServerUrl: {
      type: "string",
      default: "http://localhost:3001"
    }
  }
}

/** @type Object Schema of a vegalite specification */
schema.schema = {
  $schema: "http://json-schema.org/draft-04/schema#",
  type: "object",
  required: ["marktype", "enc", "cfg"],
  properties: {
    marktype: schema.marktype,
    enc: {
      type: "object",
      properties: {
        x: x,
        y: y,
        row: row,
        col: col,
        size: size,
        color: color,
        alpha: alpha,
        shape: shape,
        text: text
      }
    },
    cfg: cfg
  }
};

/** Instantiate a verbose vl spec from the schema */
schema.instantiate = function(){
  return schema.util.instantiate(schema.schema);
}

},{"./schemautil":12,"./util":14}],12:[function(require,module,exports){
var util = module.exports = {};

var isEmpty = function(obj) {
  return Object.keys(obj).length === 0
}

// instantiate a schema
util.instantiate = function(schema, required) {
  if (schema.type === 'object') {
    var required = schema.required ? schema.required : [];
    var instance = {};
    for (var name in schema.properties) {
      var child = schema.properties[name];
      instance[name] = util.instantiate(child, required.indexOf(name) != -1);
    };
    return instance;
  } else if ('default' in schema) {
    return schema.default;
  } else if (schema.enum && required) {
    return schema.enum[0];
  }
  return undefined;
};

// remove all defaults from an instance
util.subtract = function(defaults, instance) {
  var changes = {};
  for (var prop in instance) {
    if (!defaults || defaults[prop] !== instance[prop]) {
      if (typeof instance[prop] == "object") {
        var c = util.subtract(defaults[prop], instance[prop]);
        if (!isEmpty(c))
          changes[prop] = c;
      } else {
        changes[prop] = instance[prop];
      }
    }
  }
  return changes;
};

// recursively merges instance into defaults
util.merge = function (defaults, instance) {
  if (typeof instance!=='object' || instance===null) {
    return defaults;
  }

  for (var p in instance) {
    if (!instance.hasOwnProperty(p))
      continue;
    if (instance[p]===undefined )
      continue;
    if (typeof instance[p] !== 'object' || instance[p] === null) {
      defaults[p] = instance[p];
    } else if (typeof defaults[p] !== 'object' || defaults[p] === null) {
      defaults[p] = util.merge(instance[p].constructor === Array ? [] : {}, instance[p]);
    } else {
      util.merge(defaults[p], instance[p]);
    }
  }
  return defaults;
}

},{}],13:[function(require,module,exports){
var globals = require('./globals'),
  util = require('./util');

module.exports = time;

function time(spec, encoding, opt){
  var timeFields = {}, timeFn = {};

  // find unique formula transformation and bin function
  encoding.forEach(function(encType, field){
    if(field.type === T && field.fn){
      timeFields[encoding.field(encType)] = {
        field: field,
        encType: encType
      };
      timeFn[field.fn] = true;
    }
  });

  // add formula transform
  var data = spec.data[0],
    transform = data.transform = data.transform || [];

  for (var f in timeFields) {
    var tf = timeFields[f];
    time.transform(transform, encoding, tf.encType, tf.field);
  }

  // add scales
  var scales = spec.scales = spec.scales || [];
  for (var fn in timeFn) {
    time.scale(scales, fn, encoding);
  }
  return spec;
}

/**
 * @return {String} date binning formula of the given field
 */
time.formula = function (field) {
  var date = "new Date(d.data."+field.name+")";
  switch(field.fn){
    case "second":  return date + ".getUTCSeconds()";
    case "minute":  return date + ".getUTCMinutes()";
    case "hour":    return date + ".getUTCHours()";
    case "day":     return date + ".getUTCDay()";
    case "date":    return date + ".getUTCDate()";
    case "month":   return date + ".getUTCMonth()";
    case "year":    return date + ".getUTCFullYear()";
  }
  // TODO add continuous binning
  console.error("no function specified for date");
};

/** add formula transforms to data */
time.transform = function (transform, encoding, encType, field) {
  transform.push({
    type: "formula",
    field: encoding.field(encType),
    expr: time.formula(field)
  });
};

time.scale = function (scales, fn, encoding) {
  var labelLength = encoding.config("timeScaleLabelLength");
  // TODO add option for shorter scale / custom range
  switch(fn){
    case "day":
      scales.push({
        name: "time-day",
        type: "ordinal",
        domain: util.range(0,7),
        range: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
          function(s){ return s.substr(0, labelLength);}
        )
      });
      break;
    case "month":
      scales.push({
        name: "time-month",
        type: "ordinal",
        domain: util.range(0,12),
        range: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(
            function(s){ return s.substr(0, labelLength);}
          )
      });
      break;
  }
};

},{"./globals":7,"./util":14}],14:[function(require,module,exports){
var util = module.exports = {};

util.keys = function (obj) {
  var k = [], x;
  for (x in obj) k.push(x);
  return k;
}

util.vals = function (obj) {
  var v = [], x;
  for (x in obj) v.push(obj[x]);
  return v;
}

util.range = function (start, stop, step) {
  if (arguments.length < 3) {
    step = 1;
    if (arguments.length < 2) {
      stop = start;
      start = 0;
    }
  }
  if ((stop - start) / step == Infinity) throw new Error("infinite range");
  var range = [], i = -1, j;
  if (step < 0) while ((j = start + step * ++i) > stop) range.push(j);
  else while ((j = start + step * ++i) < stop) range.push(j);
  return range;
}

util.find = function (list, pattern) {
  var l = list.filter(function(x) {
    return x[pattern.name] === pattern.value;
  });
  return l.length && l[0] || null;
}

util.uniq = function (data, field) {
  var map = {}, count = 0, i, k;
  for (i=0; i<data.length; ++i) {
    k = data[i][field];
    if (!map[k]) {
      map[k] = 1;
      count += 1;
    }
  }
  return count;
}

util.minmax = function (data, field) {
  var stats = {min: +Infinity, max: -Infinity};
  for (i=0; i<data.length; ++i) {
    var v = data[i][field];
    if (v > stats.max) stats.max = v;
    if (v < stats.min) stats.min = v;
  }
  return stats;
}

util.duplicate = function (obj) {
  return JSON.parse(JSON.stringify(obj));
};

util.any = function(arr, f){
  var i=0, k;
  for (k in arr) {
    if(f(arr[k], k, i++)) return true;
  }
  return false;
}

util.all = function(arr, f){
  var i=0, k;
  for (k in arr) {
    if(!f(arr[k], k, i++)) return false;
  }
  return true;
}

util.merge = function(dest, src){
  return util.keys(src).reduce(function(c, k){
    c[k] = src[k];
    return c;
  }, dest);
};

util.getbins = function (stats) {
  return vg.bins({
    min: stats.min,
    max: stats.max,
    maxbins: MAX_BINS
  });
}


util.error = function(msg){
  console.error("[VL Error]", msg);
}


},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvdmwiLCJzcmMvRW5jb2RpbmcuanMiLCJzcmMvYXhpcy5qcyIsInNyYy9jb21waWxlLmpzIiwic3JjL2NvbnN0cy5qcyIsInNyYy9kYXRhLmpzIiwic3JjL2dsb2JhbHMuanMiLCJzcmMvbGVnZW5kcy5qcyIsInNyYy9tYXJrcy5qcyIsInNyYy9zY2FsZS5qcyIsInNyYy9zY2hlbWEuanMiLCJzcmMvc2NoZW1hdXRpbC5qcyIsInNyYy90aW1lLmpzIiwic3JjL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeldBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGdsb2JhbHMgPSByZXF1aXJlKFwiLi9nbG9iYWxzXCIpLFxuICAgIHV0aWwgPSByZXF1aXJlKFwiLi91dGlsXCIpLFxuICAgIGNvbnN0cyA9IHJlcXVpcmUoJy4vY29uc3RzJyk7XG5cbnZhciB2bCA9IHV0aWwubWVyZ2UoY29uc3RzLCB1dGlsKTtcblxudmwuc2NoZW1hID0gcmVxdWlyZSgnLi9zY2hlbWEnKTtcbnZsLkVuY29kaW5nID0gcmVxdWlyZSgnLi9FbmNvZGluZycpO1xudmwuYXhpcyA9IHJlcXVpcmUoJy4vYXhpcycpO1xudmwuY29tcGlsZSA9IHJlcXVpcmUoJy4vY29tcGlsZScpO1xudmwuZGF0YSA9IHJlcXVpcmUoJy4vZGF0YScpO1xudmwubGVnZW5kcyA9IHJlcXVpcmUoJy4vbGVnZW5kcycpO1xudmwubWFya3MgPSByZXF1aXJlKCcuL21hcmtzJylcbnZsLnNjYWxlID0gcmVxdWlyZSgnLi9zY2FsZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHZsO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBnbG9iYWwgPSByZXF1aXJlKCcuL2dsb2JhbHMnKSxcbiAgY29uc3RzID0gcmVxdWlyZSgnLi9jb25zdHMnKSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpLFxuICBzY2hlbWEgPSByZXF1aXJlKCcuL3NjaGVtYScpO1xuXG52YXIgRW5jb2RpbmcgPSBtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcblxuICBmdW5jdGlvbiBFbmNvZGluZyhtYXJrdHlwZSwgZW5jLCBjb25maWcpIHtcbiAgICB2YXIgZGVmYXVsdHMgPSBzY2hlbWEuaW5zdGFudGlhdGUoKTtcblxuICAgIHZhciBzcGVjID0ge1xuICAgICAgbWFya3R5cGU6IG1hcmt0eXBlLFxuICAgICAgZW5jOiBlbmMsXG4gICAgICBjZmc6IGNvbmZpZ1xuICAgIH07XG5cbiAgICAvLyBIYWNrIHRvIGFkZCBkZWZhdWx0IGNvbnN0YW50cyB0aGF0IGFyZSBub3QgaW4gdGhlIHNjaGVtYVxuICAgIGZvciAodmFyIGsgaW4gY29uc3RzLkRFRkFVTFRTKSB7XG4gICAgICBkZWZhdWx0cy5jZmdba10gPSBjb25zdHMuREVGQVVMVFNba107XG4gICAgfVxuXG4gICAgLy8gdHlwZSB0byBiaXRjb2RlXG4gICAgZm9yICh2YXIgZSBpbiBkZWZhdWx0cy5lbmMpe1xuICAgICAgZGVmYXVsdHMuZW5jW2VdLnR5cGUgPSBjb25zdHMuZGF0YVR5cGVzW2RlZmF1bHRzLmVuY1tlXS50eXBlXTtcbiAgICB9XG5cbiAgICB2YXIgc3BlY0V4dGVuZGVkID0gc2NoZW1hLnV0aWwubWVyZ2UoZGVmYXVsdHMsIHNwZWMpO1xuXG4gICAgdGhpcy5fbWFya3R5cGUgPSBzcGVjRXh0ZW5kZWQubWFya3R5cGU7XG4gICAgdGhpcy5fZW5jID0gc3BlY0V4dGVuZGVkLmVuYztcbiAgICB0aGlzLl9jZmcgPSBzcGVjRXh0ZW5kZWQuY2ZnO1xuICB9XG5cbiAgdmFyIHByb3RvID0gRW5jb2RpbmcucHJvdG90eXBlO1xuXG4gIHByb3RvLm1hcmt0eXBlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcmt0eXBlO1xuICB9O1xuXG4gIHByb3RvLmlzID0gZnVuY3Rpb24obSkge1xuICAgIHJldHVybiB0aGlzLl9tYXJrdHlwZSA9PT0gbTtcbiAgfTtcblxuICBwcm90by5oYXMgPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuY1t4XS5uYW1lICE9PSB1bmRlZmluZWQ7XG4gIH07XG5cbiAgcHJvdG8uZW5jID0gZnVuY3Rpb24oeCl7XG4gICAgcmV0dXJuIHRoaXMuX2VuY1t4XTtcbiAgfTtcblxuICAvLyBnZXQgXCJmaWVsZFwiIHByb3BlcnR5IGZvciB2ZWdhXG4gIHByb3RvLmZpZWxkID0gZnVuY3Rpb24oeCwgbm9kYXRhLCBub2ZuKSB7XG4gICAgaWYgKCF0aGlzLmhhcyh4KSkgcmV0dXJuIG51bGw7XG5cbiAgICB2YXIgZiA9IChub2RhdGEgPyBcIlwiIDogXCJkYXRhLlwiKTtcblxuICAgIGlmICh0aGlzLl9lbmNbeF0uYWdnciA9PT0gXCJjb3VudFwiKSB7XG4gICAgICByZXR1cm4gZiArIFwiY291bnRcIjtcbiAgICB9IGVsc2UgaWYgKCFub2ZuICYmIHRoaXMuX2VuY1t4XS5iaW4pIHtcbiAgICAgIHJldHVybiBmICsgXCJiaW5fXCIgKyB0aGlzLl9lbmNbeF0ubmFtZTtcbiAgICB9IGVsc2UgaWYgKCFub2ZuICYmIHRoaXMuX2VuY1t4XS5hZ2dyKSB7XG4gICAgICByZXR1cm4gZiArIHRoaXMuX2VuY1t4XS5hZ2dyICsgXCJfXCIgKyB0aGlzLl9lbmNbeF0ubmFtZTtcbiAgICB9IGVsc2UgaWYgKCFub2ZuICYmIHRoaXMuX2VuY1t4XS5mbil7XG4gICAgICByZXR1cm4gZiArIHRoaXMuX2VuY1t4XS5mbiArIFwiX1wiICsgdGhpcy5fZW5jW3hdLm5hbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmICsgdGhpcy5fZW5jW3hdLm5hbWU7XG4gICAgfVxuICB9O1xuXG4gIHByb3RvLmZpZWxkTmFtZSA9IGZ1bmN0aW9uKHgpe1xuICAgIHJldHVybiB0aGlzLl9lbmNbeF0ubmFtZTtcbiAgfVxuXG4gIHByb3RvLmZpZWxkVGl0bGUgPSBmdW5jdGlvbih4KXtcbiAgICBpZiAodGhpcy5fZW5jW3hdLmFnZ3IpIHtcbiAgICAgIHJldHVybiB0aGlzLl9lbmNbeF0uYWdnciArIFwiKFwiICsgdGhpcy5fZW5jW3hdLm5hbWUgKyBcIilcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuX2VuY1t4XS5uYW1lO1xuICAgIH1cbiAgfVxuXG4gIHByb3RvLnNjYWxlID0gZnVuY3Rpb24oeCl7XG4gICAgcmV0dXJuIHRoaXMuX2VuY1t4XS5zY2FsZSB8fCB7fTtcbiAgfVxuXG4gIHByb3RvLmF4aXMgPSBmdW5jdGlvbih4KXtcbiAgICByZXR1cm4gdGhpcy5fZW5jW3hdLmF4aXMgfHwge307XG4gIH1cblxuICBwcm90by5iYW5kID0gZnVuY3Rpb24oeCl7XG4gICAgcmV0dXJuIHRoaXMuX2VuY1t4XS5iYW5kIHx8IHt9O1xuICB9XG5cbiAgcHJvdG8uYWdnciA9IGZ1bmN0aW9uKHgpe1xuICAgIHJldHVybiB0aGlzLl9lbmNbeF0uYWdncjtcbiAgfVxuXG4gIHByb3RvLmJpbiA9IGZ1bmN0aW9uKHgpe1xuICAgIHJldHVybiB0aGlzLl9lbmNbeF0uYmluO1xuICB9XG5cbiAgcHJvdG8ubGVnZW5kID0gZnVuY3Rpb24oeCl7XG4gICAgcmV0dXJuIHRoaXMuX2VuY1t4XS5sZWdlbmQ7XG4gIH1cblxuICBwcm90by52YWx1ZSA9IGZ1bmN0aW9uKHgpe1xuICAgIHJldHVybiB0aGlzLl9lbmNbeF0udmFsdWU7XG4gIH1cblxuICBwcm90by5mbiA9IGZ1bmN0aW9uKHgpe1xuICAgIHJldHVybiB0aGlzLl9lbmNbeF0uZm47XG4gIH1cblxuICBwcm90by5hbnkgPSBmdW5jdGlvbihmKXtcbiAgICByZXR1cm4gdXRpbC5hbnkodGhpcy5fZW5jLCBmKTtcbiAgfVxuXG4gIHByb3RvLmFsbCA9IGZ1bmN0aW9uKGYpe1xuICAgIHJldHVybiB1dGlsLmFsbCh0aGlzLl9lbmMsIGYpO1xuICB9XG5cbiAgcHJvdG8ubGVuZ3RoID0gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdXRpbC5rZXlzKHRoaXMuX2VuYykubGVuZ3RoO1xuICB9XG5cbiAgcHJvdG8ucmVkdWNlID0gZnVuY3Rpb24oZiwgaW5pdCl7XG4gICAgdmFyIHIgPSBpbml0LCBpPTA7XG4gICAgZm9yIChrIGluIHRoaXMuX2VuYyl7XG4gICAgICByID0gZihyLCB0aGlzLl9lbmNba10sIGssIHRoaXMuX2VuYyk7XG4gICAgfVxuICAgIHJldHVybiByO1xuICB9XG5cbiAgcHJvdG8uZm9yRWFjaCA9IGZ1bmN0aW9uKGYpIHtcbiAgICB2YXIgaT0wLCBrO1xuICAgIGZvciAoayBpbiB0aGlzLl9lbmMpIHtcbiAgICAgIGlmICh0aGlzLmhhcyhrKSkge1xuICAgICAgICBmKGssIHRoaXMuX2VuY1trXSwgaSsrKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgcHJvdG8udHlwZSA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gdGhpcy5oYXMoeCkgPyB0aGlzLl9lbmNbeF0udHlwZSA6IG51bGw7XG4gIH07XG5cbiAgcHJvdG8udGV4dCA9IGZ1bmN0aW9uKHByb3ApIHtcbiAgICB2YXIgdGV4dCA9IHRoaXMuX2VuY1tURVhUXS50ZXh0O1xuICAgIHJldHVybiBwcm9wID8gdGV4dFtwcm9wXSA6IHRleHQ7XG4gIH1cblxuICBwcm90by5mb250ID0gZnVuY3Rpb24ocHJvcCkge1xuICAgIHZhciBmb250ID0gdGhpcy5fZW5jW1RFWFRdLnRleHQ7XG4gICAgcmV0dXJuIHByb3AgPyBmb250W3Byb3BdIDogZm9udDtcbiAgfVxuXG4gIHByb3RvLmlzVHlwZSA9IGZ1bmN0aW9uKHgsIHQpIHtcbiAgICB2YXIgeHQgPSB0aGlzLnR5cGUoeCk7XG4gICAgaWYgKHh0ID09IG51bGwpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gKHh0ICYgdCkgPiAwO1xuICB9O1xuXG4gIHByb3RvLmNvbmZpZyA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5fY2ZnW25hbWVdO1xuICB9O1xuXG4gIHByb3RvLnRvU3BlYyA9IGZ1bmN0aW9uKGV4Y2x1ZGVDb25maWcpe1xuICAgIHZhciBlbmMgPSB1dGlsLmR1cGxpY2F0ZSh0aGlzLl9lbmMpLFxuICAgICAgc3BlYztcblxuICAgIC8vIGNvbnZlcnQgdHlwZSdzIGJpdGNvZGUgdG8gdHlwZSBuYW1lXG4gICAgZm9yKHZhciBlIGluIGVuYyl7XG4gICAgICBlbmNbZV0udHlwZSA9IGNvbnN0cy5kYXRhVHlwZU5hbWVzW2VuY1tlXS50eXBlXTtcbiAgICB9XG5cbiAgICBzcGVjID0ge1xuICAgICAgbWFya3R5cGU6IHRoaXMuX21hcmt0eXBlLFxuICAgICAgZW5jOiBlbmNcbiAgICB9XG5cbiAgICBpZighZXhjbHVkZUNvbmZpZyl7XG4gICAgICBzcGVjLmNmZyA9IHV0aWwuZHVwbGljYXRlKHRoaXMuX2NmZylcbiAgICB9XG5cbiAgICAvLyByZW1vdmUgZGVmYXVsdHNcbiAgICB2YXIgZGVmYXVsdHMgPSBzY2hlbWEuaW5zdGFudGlhdGUoKTtcbiAgICByZXR1cm4gc2NoZW1hLnV0aWwuc3VidHJhY3QoZGVmYXVsdHMsIHNwZWMpO1xuICB9O1xuXG4gIHByb3RvLnRvU2hvcnRoYW5kID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgZW5jID0gdGhpcy5fZW5jO1xuICAgIHJldHVybiB0aGlzLl9tYXJrdHlwZSArIFwiLlwiICsgdXRpbC5rZXlzKGVuYykubWFwKGZ1bmN0aW9uKGUpe1xuICAgICAgdmFyIHYgPSBlbmNbZV07XG4gICAgICAgIHJldHVybiBlICsgXCItXCIgK1xuICAgICAgICAgICh2LmFnZ3IgPyB2LmFnZ3IrXCJfXCIgOiBcIlwiKSArXG4gICAgICAgICAgKHYuZm4gPyB2LmZuK1wiX1wiIDogXCJcIikgK1xuICAgICAgICAgICh2LmJpbiA/IFwiYmluX1wiIDogXCJcIikgK1xuICAgICAgICAgICh2Lm5hbWUgfHwgXCJcIikgKyBcIi1cIiArXG4gICAgICAgICAgY29uc3RzLmRhdGFUeXBlTmFtZXNbdi50eXBlXTtcbiAgICAgIH1cbiAgICApLmpvaW4oXCIuXCIpO1xuICB9XG5cbiAgRW5jb2RpbmcucGFyc2VTaG9ydGhhbmQgPSBmdW5jdGlvbihzaG9ydGhhbmQsIGNmZyl7XG4gICAgdmFyIGVuYyA9IHNob3J0aGFuZC5zcGxpdChcIi5cIiksXG4gICAgICBtYXJrdHlwZSA9IGVuYy5zaGlmdCgpO1xuXG4gICAgZW5jID0gZW5jLnJlZHVjZShmdW5jdGlvbihtLCBlKXtcbiAgICAgIHZhciBzcGxpdCA9IGUuc3BsaXQoXCItXCIpLFxuICAgICAgICBlbmN0eXBlID0gc3BsaXRbMF0sXG4gICAgICAgIG8gPSB7bmFtZTogc3BsaXRbMV0sIHR5cGU6IGNvbnN0cy5kYXRhVHlwZXNbc3BsaXRbMl1dfTtcblxuICAgICAgLy8gY2hlY2sgYWdncmVnYXRlIHR5cGVcbiAgICAgIGZvcih2YXIgaSBpbiBzY2hlbWEuYWdnci5lbnVtKXtcbiAgICAgICAgdmFyIGEgPSBzY2hlbWEuYWdnci5lbnVtW2ldO1xuICAgICAgICBpZihvLm5hbWUuaW5kZXhPZihhK1wiX1wiKSA9PSAwKXtcbiAgICAgICAgICBvLm5hbWUgPSBvLm5hbWUuc3Vic3RyKGEubGVuZ3RoKzEpO1xuICAgICAgICAgIGlmIChhPT1cImNvdW50XCIgJiYgby5uYW1lLmxlbmd0aCA9PT0gMCkgby5uYW1lID0gXCIqXCI7XG4gICAgICAgICAgby5hZ2dyID0gYTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gY2hlY2sgdGltZSBmblxuICAgICAgZm9yKHZhciBpIGluIHNjaGVtYS50aW1lZm5zKXtcbiAgICAgICAgdmFyIGYgPSBzY2hlbWEudGltZWZuc1tpXTtcbiAgICAgICAgaWYoby5uYW1lICYmIG8ubmFtZS5pbmRleE9mKGYrXCJfXCIpID09IDApe1xuICAgICAgICAgIG8ubmFtZSA9IG8ubmFtZS5zdWJzdHIoby5sZW5ndGgrMSk7XG4gICAgICAgICAgby5mbiA9IGY7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gY2hlY2sgYmluXG4gICAgICBpZihvLm5hbWUgJiYgby5uYW1lLmluZGV4T2YoXCJiaW5fXCIpID09IDApe1xuICAgICAgICBvLm5hbWUgPSBvLm5hbWUuc3Vic3RyKDQpO1xuICAgICAgICBvLmJpbiA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIG1bZW5jdHlwZV0gPSBvO1xuICAgICAgcmV0dXJuIG07XG4gICAgfSwge30pO1xuXG4gICAgcmV0dXJuIG5ldyBFbmNvZGluZyhtYXJrdHlwZSwgZW5jLCBjZmcpO1xuICB9XG5cbiAgRW5jb2RpbmcuZnJvbVNwZWMgPSBmdW5jdGlvbihzcGVjLCBleHRyYUNmZykge1xuICAgIHZhciBlbmMgPSB1dGlsLmR1cGxpY2F0ZShzcGVjLmVuYyk7XG5cbiAgICAvL2NvbnZlcnQgdHlwZSBmcm9tIHN0cmluZyB0byBiaXRjb2RlIChlLmcsIE89MSlcbiAgICBmb3IodmFyIGUgaW4gZW5jKXtcbiAgICAgIGVuY1tlXS50eXBlID0gY29uc3RzLmRhdGFUeXBlc1tlbmNbZV0udHlwZV07XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBFbmNvZGluZyhzcGVjLm1hcmt0eXBlLCBlbmMsIHV0aWwubWVyZ2Uoc3BlYy5jZmcsIGV4dHJhQ2ZnIHx8IHt9KSk7XG4gIH1cblxuICByZXR1cm4gRW5jb2Rpbmc7XG5cbn0pKCk7XG4iLCJ2YXIgZ2xvYmFscyA9IHJlcXVpcmUoJy4vZ2xvYmFscycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbnZhciBheGlzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuYXhpcy5uYW1lcyA9IGZ1bmN0aW9uIChwcm9wcykge1xuICByZXR1cm4gdXRpbC5rZXlzKHV0aWwua2V5cyhwcm9wcykucmVkdWNlKGZ1bmN0aW9uKGEsIHgpIHtcbiAgICB2YXIgcyA9IHByb3BzW3hdLnNjYWxlO1xuICAgIGlmIChzPT09WCB8fCBzPT09WSkgYVtwcm9wc1t4XS5zY2FsZV0gPSAxO1xuICAgIHJldHVybiBhO1xuICB9LCB7fSkpO1xufTtcblxuYXhpcy5kZWZzID0gZnVuY3Rpb24obmFtZXMsIGVuY29kaW5nLCBvcHQpIHtcbiAgcmV0dXJuIG5hbWVzLnJlZHVjZShmdW5jdGlvbihhLCBuYW1lKSB7XG4gICAgYS5wdXNoKGF4aXMuZGVmKG5hbWUsIGVuY29kaW5nLCBvcHQpKTtcbiAgICByZXR1cm4gYTtcbiAgfSwgW10pO1xufTtcblxuYXhpcy5kZWYgPSBmdW5jdGlvbiAobmFtZSwgZW5jb2RpbmcsIG9wdCl7XG4gIHZhciB0eXBlID0gbmFtZTtcbiAgdmFyIGlzQ29sID0gbmFtZT09Q09MLCBpc1JvdyA9IG5hbWU9PVJPVztcbiAgaWYoaXNDb2wpIHR5cGUgPSBcInhcIjtcbiAgaWYoaXNSb3cpIHR5cGUgPSBcInlcIjtcblxuICB2YXIgYXhpcyA9IHtcbiAgICB0eXBlOiB0eXBlLFxuICAgIHNjYWxlOiBuYW1lLFxuICB9O1xuXG4gIGlmIChlbmNvZGluZy5pc1R5cGUobmFtZSwgUSkpIHtcbiAgICAvL1RPRE8oa2FuaXR3KTogYmV0dGVyIGRldGVybWluZSAjIG9mIHRpY2tzXG4gICAgYXhpcy50aWNrcyA9IDM7XG4gIH1cblxuICBpZiAoZW5jb2RpbmcuYXhpcyhuYW1lKS5ncmlkKSB7XG4gICAgYXhpcy5ncmlkID0gdHJ1ZTtcbiAgICBheGlzLmxheWVyID0gXCJiYWNrXCI7XG4gIH1cblxuICBpZiAoZW5jb2RpbmcuYXhpcyhuYW1lKS50aXRsZSkge1xuICAgIC8vc2hvdyB0aXRsZSBieSBkZWZhdWx0XG5cbiAgICBheGlzID0gYXhpc190aXRsZShheGlzLCBuYW1lLCBlbmNvZGluZywgb3B0KTtcbiAgfVxuXG4gIGlmKGlzUm93IHx8IGlzQ29sKXtcbiAgICBheGlzLnByb3BlcnRpZXMgPSB7XG4gICAgICB0aWNrczogeyBvcGFjaXR5OiB7dmFsdWU6IDB9IH0sXG4gICAgICBtYWpvclRpY2tzOiB7IG9wYWNpdHk6IHt2YWx1ZTogMH0gfSxcbiAgICAgIGF4aXM6IHsgb3BhY2l0eToge3ZhbHVlOiAwfSB9XG4gICAgfTtcbiAgfVxuICBpZihpc0NvbCl7XG4gICAgYXhpcy5vZmZzZXQgPSBbb3B0LnhBeGlzTWFyZ2luIHx8IDAsIGVuY29kaW5nLmNvbmZpZyhcInlBeGlzTWFyZ2luXCIpXTtcbiAgICBheGlzLm9yaWVudCA9IFwidG9wXCI7XG4gIH1cblxuICBpZiAobmFtZT09XCJ4XCIgJiYgKGVuY29kaW5nLmlzVHlwZShuYW1lLCBPfFQpIHx8IGVuY29kaW5nLmJpbihuYW1lKSkpIHtcbiAgICBheGlzLnByb3BlcnRpZXMgPSB7XG4gICAgICBsYWJlbHM6IHtcbiAgICAgICAgYW5nbGU6IHt2YWx1ZTogMjcwfSxcbiAgICAgICAgYWxpZ246IHt2YWx1ZTogXCJyaWdodFwifSxcbiAgICAgICAgYmFzZWxpbmU6IHt2YWx1ZTogXCJtaWRkbGVcIn1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLy8gYWRkIGN1c3RvbSBsYWJlbCBmb3IgdGltZSB0eXBlXG4gIGlmIChlbmNvZGluZy5pc1R5cGUobmFtZSwgVCkpIHtcbiAgICB2YXIgZm4gPSBlbmNvZGluZy5mbihuYW1lKSxcbiAgICAgIHByb3BlcnRpZXMgPSBheGlzLnByb3BlcnRpZXMgPSBheGlzLnByb3BlcnRpZXMgfHwge30sXG4gICAgICBsYWJlbHMgPSBwcm9wZXJ0aWVzLmxhYmVscyA9IHByb3BlcnRpZXMubGFiZWxzIHx8IHt9LFxuICAgICAgdGV4dCA9IGxhYmVscy50ZXh0ID0gbGFiZWxzLnRleHQgfHwge307XG5cbiAgICBzd2l0Y2ggKGZuKSB7XG4gICAgICBjYXNlIFwiZGF5XCI6XG4gICAgICBjYXNlIFwibW9udGhcIjpcbiAgICAgICAgdGV4dC5zY2FsZSA9IFwidGltZS1cIitmbjtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGF4aXM7XG59O1xuXG5mdW5jdGlvbiBheGlzX3RpdGxlKGF4aXMsIG5hbWUsIGVuY29kaW5nLCBvcHQpe1xuICBheGlzLnRpdGxlID0gZW5jb2RpbmcuZmllbGRUaXRsZShuYW1lKTtcbiAgaWYobmFtZT09WSl7XG4gICAgYXhpcy50aXRsZU9mZnNldCA9IDYwO1xuICAgIC8vIFRPRE86IHNldCBhcHByb3ByaWF0ZSB0aXRsZU9mZnNldFxuICAgIC8vIG1heWJlIGJhc2VkIG9uIHNvbWUgc3RyaW5nIGxlbmd0aCBmcm9tIHN0YXRzXG4gIH1cbiAgcmV0dXJuIGF4aXM7XG59XG4iLCJ2YXIgZ2xvYmFscyA9IHJlcXVpcmUoJy4vZ2xvYmFscycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyksXG4gIGF4aXMgPSByZXF1aXJlKCcuL2F4aXMnKSxcbiAgbGVnZW5kcyA9IHJlcXVpcmUoJy4vbGVnZW5kcycpLFxuICBtYXJrcyA9IHJlcXVpcmUoJy4vbWFya3MnKSxcbiAgc2NhbGUgPSByZXF1aXJlKCcuL3NjYWxlJyksXG4gIHRpbWUgPSByZXF1aXJlKCcuL3RpbWUnKTtcblxudmFyIGNvbXBpbGUgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVuY29kaW5nLCBzdGF0cykge1xuICB2YXIgc2l6ZSA9IHNldFNpemUoZW5jb2RpbmcsIHN0YXRzKSxcbiAgICBjZWxsV2lkdGggPSBzaXplLmNlbGxXaWR0aCxcbiAgICBjZWxsSGVpZ2h0ID0gc2l6ZS5jZWxsSGVpZ2h0O1xuXG4gIHZhciBoYXNBZ2cgPSBlbmNvZGluZy5hbnkoZnVuY3Rpb24odiwgayl7XG4gICAgcmV0dXJuIHYuYWdnciAhPT0gdW5kZWZpbmVkO1xuICB9KTtcblxuICB2YXIgc3BlYyA9IHRlbXBsYXRlKGVuY29kaW5nLCBzaXplLCBzdGF0cyksXG4gICAgZ3JvdXAgPSBzcGVjLm1hcmtzWzBdLFxuICAgIG1hcmsgPSBtYXJrc1tlbmNvZGluZy5tYXJrdHlwZSgpXSxcbiAgICBtZGVmID0gbWFya2RlZihtYXJrLCBlbmNvZGluZywge1xuICAgICAgaGFzQWdncmVnYXRlOiBoYXNBZ2dcbiAgICB9KTtcblxuICB2YXIgaGFzUm93ID0gZW5jb2RpbmcuaGFzKFJPVyksIGhhc0NvbCA9IGVuY29kaW5nLmhhcyhDT0wpO1xuXG4gIHZhciBwcmVhZ2dyZWdhdGVkRGF0YSA9IGVuY29kaW5nLmNvbmZpZyhcInVzZVZlZ2FTZXJ2ZXJcIik7XG5cbiAgZ3JvdXAubWFya3MucHVzaChtZGVmKTtcbiAgLy8gVE9ETzogcmV0dXJuIHZhbHVlIG5vdCB1c2VkXG4gIGJpbm5pbmcoc3BlYy5kYXRhWzBdLCBlbmNvZGluZywge3ByZWFnZ3JlZ2F0ZWREYXRhOiBwcmVhZ2dyZWdhdGVkRGF0YX0pO1xuXG4gIHZhciBsaW5lVHlwZSA9IG1hcmtzW2VuY29kaW5nLm1hcmt0eXBlKCldLmxpbmU7XG5cbiAgaWYoIXByZWFnZ3JlZ2F0ZWREYXRhKXtcbiAgICBzcGVjID0gdGltZShzcGVjLCBlbmNvZGluZyk7XG4gIH1cblxuICAvLyBoYW5kbGUgc3ViZmFjZXRzXG4gIHZhciBhZ2dSZXN1bHQgPSBhZ2dyZWdhdGVzKHNwZWMuZGF0YVswXSwgZW5jb2RpbmcsIHtwcmVhZ2dyZWdhdGVkRGF0YTogcHJlYWdncmVnYXRlZERhdGF9KSxcbiAgICBkZXRhaWxzID0gYWdnUmVzdWx0LmRldGFpbHMsXG4gICAgaGFzRGV0YWlscyA9IGRldGFpbHMgJiYgZGV0YWlscy5sZW5ndGggPiAwLFxuICAgIHN0YWNrID0gaGFzRGV0YWlscyAmJiBzdGFja2luZyhzcGVjLCBlbmNvZGluZywgbWRlZiwgYWdnUmVzdWx0LmZhY2V0cyk7XG5cbiAgaWYgKGhhc0RldGFpbHMgJiYgKHN0YWNrIHx8IGxpbmVUeXBlKSkge1xuICAgIC8vc3ViZmFjZXQgdG8gZ3JvdXAgc3RhY2sgLyBsaW5lIHRvZ2V0aGVyIGluIG9uZSBncm91cFxuICAgIHN1YmZhY2V0KGdyb3VwLCBtZGVmLCBkZXRhaWxzLCBzdGFjaywgZW5jb2RpbmcpO1xuICB9XG5cbiAgLy8gYXV0by1zb3J0IGxpbmUvYXJlYSB2YWx1ZXNcbiAgLy9UT0RPKGthbml0dyk6IGhhdmUgc29tZSBjb25maWcgdG8gdHVybiBvZmYgYXV0by1zb3J0IGZvciBsaW5lIChmb3IgbGluZSBjaGFydCB0aGF0IGVuY29kZXMgdGVtcG9yYWwgaW5mb3JtYXRpb24pXG4gIGlmIChsaW5lVHlwZSkge1xuICAgIHZhciBmID0gKGVuY29kaW5nLmlzVHlwZShYLCBRIHwgVCkgJiYgZW5jb2RpbmcuaXNUeXBlKFksIE8pKSA/IFkgOiBYO1xuICAgIGlmICghbWRlZi5mcm9tKSBtZGVmLmZyb20gPSB7fTtcbiAgICBtZGVmLmZyb20udHJhbnNmb3JtID0gW3t0eXBlOiBcInNvcnRcIiwgYnk6IGVuY29kaW5nLmZpZWxkKGYpfV07XG4gIH1cblxuICAvLyBTbWFsbCBNdWx0aXBsZXNcbiAgaWYgKGhhc1JvdyB8fCBoYXNDb2wpIHtcbiAgICBzcGVjID0gZmFjZXQoZ3JvdXAsIGVuY29kaW5nLCBjZWxsSGVpZ2h0LCBjZWxsV2lkdGgsIHNwZWMsIG1kZWYsIHN0YWNrLCBzdGF0cyk7XG4gIH0gZWxzZSB7XG4gICAgZ3JvdXAuc2NhbGVzID0gc2NhbGUuZGVmcyhzY2FsZS5uYW1lcyhtZGVmLnByb3BlcnRpZXMudXBkYXRlKSwgZW5jb2RpbmcsXG4gICAgICB7c3RhY2s6IHN0YWNrLCBzdGF0czogc3RhdHN9KTtcbiAgICBncm91cC5heGVzID0gYXhpcy5kZWZzKGF4aXMubmFtZXMobWRlZi5wcm9wZXJ0aWVzLnVwZGF0ZSksIGVuY29kaW5nKTtcbiAgICBncm91cC5sZWdlbmRzID0gbGVnZW5kcy5kZWZzKGVuY29kaW5nKTtcbiAgfVxuICByZXR1cm4gc3BlYztcbn07XG5cbmZ1bmN0aW9uIGdldENhcmRpbmFsaXR5KGVuY29kaW5nLCBlbmNUeXBlLCBzdGF0cyl7XG4gIHZhciBmaWVsZCA9IGVuY29kaW5nLmZpZWxkTmFtZShlbmNUeXBlKTtcbiAgaWYgKGVuY29kaW5nLmJpbihlbmNUeXBlKSkge1xuICAgIHZhciBiaW5zID0gdXRpbC5nZXRiaW5zKHN0YXRzW2ZpZWxkXSk7XG4gICAgcmV0dXJuIChiaW5zLnN0b3AgLSBiaW5zLnN0YXJ0KSAvIGJpbnMuc3RlcDtcbiAgfVxuICByZXR1cm4gc3RhdHNbZmllbGRdLmNhcmRpbmFsaXR5O1xufVxuXG5mdW5jdGlvbiBzZXRTaXplKGVuY29kaW5nLCBzdGF0cykge1xuICB2YXIgaGFzUm93ID0gZW5jb2RpbmcuaGFzKFJPVyksXG4gICAgICBoYXNDb2wgPSBlbmNvZGluZy5oYXMoQ09MKSxcbiAgICAgIGhhc1ggPSBlbmNvZGluZy5oYXMoWCksXG4gICAgICBoYXNZID0gZW5jb2RpbmcuaGFzKFkpO1xuXG4gIC8vIEhBQ0sgdG8gc2V0IGNoYXJ0IHNpemVcbiAgLy8gTk9URTogdGhpcyBmYWlscyBmb3IgcGxvdHMgZHJpdmVuIGJ5IGRlcml2ZWQgdmFsdWVzIChlLmcuLCBhZ2dyZWdhdGVzKVxuICAvLyBPbmUgc29sdXRpb24gaXMgdG8gdXBkYXRlIFZlZ2EgdG8gc3VwcG9ydCBhdXRvLXNpemluZ1xuICAvLyBJbiB0aGUgbWVhbnRpbWUsIGF1dG8tcGFkZGluZyAobW9zdGx5KSBkb2VzIHRoZSB0cmlja1xuICAvL1xuICB2YXIgY29sQ2FyZGluYWxpdHkgPSBoYXNDb2wgPyBnZXRDYXJkaW5hbGl0eShlbmNvZGluZywgQ09MLCBzdGF0cykgOiAxLFxuICAgIHJvd0NhcmRpbmFsaXR5ID0gaGFzUm93ID8gZ2V0Q2FyZGluYWxpdHkoZW5jb2RpbmcsIFJPVywgc3RhdHMpIDogMTtcblxuICB2YXIgY2VsbFdpZHRoID0gaGFzWCA/XG4gICAgICArZW5jb2RpbmcuY29uZmlnKFwiY2VsbFdpZHRoXCIpIHx8IGVuY29kaW5nLmNvbmZpZyhcIndpZHRoXCIpICogMS4wIC8gY29sQ2FyZGluYWxpdHkgOlxuICAgICAgZW5jb2RpbmcubWFya3R5cGUoKSA9PT0gXCJ0ZXh0XCIgP1xuICAgICAgICArZW5jb2RpbmcuY29uZmlnKFwidGV4dENlbGxXaWR0aFwiKSA6XG4gICAgICAgICtlbmNvZGluZy5jb25maWcoXCJiYW5kU2l6ZVwiKSxcbiAgICBjZWxsSGVpZ2h0ID0gaGFzWSA/XG4gICAgICArZW5jb2RpbmcuY29uZmlnKFwiY2VsbEhlaWdodFwiKSB8fCBlbmNvZGluZy5jb25maWcoXCJoZWlnaHRcIikgKiAxLjAgLyByb3dDYXJkaW5hbGl0eSA6XG4gICAgICArZW5jb2RpbmcuY29uZmlnKFwiYmFuZFNpemVcIiksXG4gICAgY2VsbFBhZGRpbmcgPSBlbmNvZGluZy5jb25maWcoXCJjZWxsUGFkZGluZ1wiKSxcbiAgICBiYW5kUGFkZGluZyA9IGVuY29kaW5nLmNvbmZpZyhcImJhbmRQYWRkaW5nXCIpLFxuICAgIHdpZHRoID0gZW5jb2RpbmcuY29uZmlnKFwiX21pbldpZHRoXCIpLFxuICAgIGhlaWdodCA9IGVuY29kaW5nLmNvbmZpZyhcIl9taW5IZWlnaHRcIik7XG5cbiAgaWYgKGhhc1ggJiYgKGVuY29kaW5nLmlzVHlwZShYLCBPKSB8fCBlbmNvZGluZy5iaW4oWCkpKSB7IC8vb3JkaW5hbCBmaWVsZCB3aWxsIG92ZXJyaWRlIHBhcmVudFxuICAgIC8vIGJhbmRzIHdpdGhpbiBjZWxsIHVzZSByYW5nZVBvaW50cygpXG4gICAgdmFyIHhDYXJkaW5hbGl0eSA9IGdldENhcmRpbmFsaXR5KGVuY29kaW5nLCBYLCBzdGF0cyk7XG4gICAgY2VsbFdpZHRoID0gKHhDYXJkaW5hbGl0eSArIGJhbmRQYWRkaW5nKSAqICtlbmNvZGluZy5jb25maWcoXCJiYW5kU2l6ZVwiKTtcbiAgfVxuICAvLyBDZWxsIGJhbmRzIHVzZSByYW5nZUJhbmRzKCkuIFRoZXJlIGFyZSBuLTEgcGFkZGluZy4gIE91dGVycGFkZGluZyA9IDAgZm9yIGNlbGxzXG4gIHdpZHRoID0gY2VsbFdpZHRoICogKCgxICsgY2VsbFBhZGRpbmcpICogKGNvbENhcmRpbmFsaXR5LTEpICsgMSk7XG5cbiAgaWYgKGhhc1kgJiYgKGVuY29kaW5nLmlzVHlwZShZLCBPKSB8fCBlbmNvZGluZy5iaW4oWSkpKSB7XG4gICAgLy8gYmFuZHMgd2l0aGluIGNlbGwgdXNlIHJhbmdlUG9pbnQoKVxuICAgIHZhciB5Q2FyZGluYWxpdHkgPSBnZXRDYXJkaW5hbGl0eShlbmNvZGluZywgWSwgc3RhdHMpO1xuICAgIGNlbGxIZWlnaHQgPSAoeUNhcmRpbmFsaXR5ICsgYmFuZFBhZGRpbmcpICogK2VuY29kaW5nLmNvbmZpZyhcImJhbmRTaXplXCIpO1xuICB9XG4gIC8vIENlbGwgYmFuZHMgdXNlIHJhbmdlQmFuZHMoKS4gVGhlcmUgYXJlIG4tMSBwYWRkaW5nLiAgT3V0ZXJwYWRkaW5nID0gMCBmb3IgY2VsbHNcbiAgaGVpZ2h0ID0gY2VsbEhlaWdodCAqICgoMSArIGNlbGxQYWRkaW5nKSAqIChyb3dDYXJkaW5hbGl0eS0xKSArIDEpO1xuXG4gIHJldHVybiB7XG4gICAgY2VsbFdpZHRoOiBjZWxsV2lkdGgsXG4gICAgY2VsbEhlaWdodDogY2VsbEhlaWdodCxcbiAgICB3aWR0aDogd2lkdGgsXG4gICAgaGVpZ2h0OmhlaWdodFxuICB9O1xufVxuXG5mdW5jdGlvbiBmYWNldChncm91cCwgZW5jb2RpbmcsIGNlbGxIZWlnaHQsIGNlbGxXaWR0aCwgc3BlYywgbWRlZiwgc3RhY2ssIHN0YXRzKSB7XG4gICAgdmFyIGVudGVyID0gZ3JvdXAucHJvcGVydGllcy5lbnRlcjtcbiAgICB2YXIgZmFjZXRLZXlzID0gW10sIGNlbGxBeGVzID0gW107XG5cbiAgICB2YXIgaGFzUm93ID0gZW5jb2RpbmcuaGFzKFJPVyksIGhhc0NvbCA9IGVuY29kaW5nLmhhcyhDT0wpO1xuXG4gICAgdmFyIHhBeGlzTWFyZ2luID0gZW5jb2RpbmcuaGFzKFkpID8gZW5jb2RpbmcuY29uZmlnKFwieEF4aXNNYXJnaW5cIikgOiB1bmRlZmluZWQ7XG5cbiAgICBlbnRlci5maWxsID0ge3ZhbHVlOiBlbmNvZGluZy5jb25maWcoXCJjZWxsQmFja2dyb3VuZENvbG9yXCIpfTtcblxuICAgIC8vbW92ZSBcImZyb21cIiB0byBjZWxsIGxldmVsIGFuZCBhZGQgZmFjZXQgdHJhbnNmb3JtXG4gICAgZ3JvdXAuZnJvbSA9IHtkYXRhOiBncm91cC5tYXJrc1swXS5mcm9tLmRhdGF9O1xuXG4gICAgaWYgKGdyb3VwLm1hcmtzWzBdLmZyb20udHJhbnNmb3JtKSB7XG4gICAgICBkZWxldGUgZ3JvdXAubWFya3NbMF0uZnJvbS5kYXRhOyAvL25lZWQgdG8ga2VlcCB0cmFuc2Zvcm0gZm9yIHN1YmZhY2V0dGluZyBjYXNlXG4gICAgfSBlbHNlIHtcbiAgICAgIGRlbGV0ZSBncm91cC5tYXJrc1swXS5mcm9tO1xuICAgIH1cbiAgICBpZiAoaGFzUm93KSB7XG4gICAgICBpZiAoIWVuY29kaW5nLmlzVHlwZShST1csIE8pKSB7XG4gICAgICAgIHV0aWwuZXJyb3IoXCJSb3cgZW5jb2Rpbmcgc2hvdWxkIGJlIG9yZGluYWwuXCIpO1xuICAgICAgfVxuICAgICAgZW50ZXIueSA9IHtzY2FsZTogUk9XLCBmaWVsZDogXCJrZXlzLlwiICsgZmFjZXRLZXlzLmxlbmd0aH07XG4gICAgICBlbnRlci5oZWlnaHQgPSB7XCJ2YWx1ZVwiOiBjZWxsSGVpZ2h0fTsgLy8gSEFDS1xuXG4gICAgICBmYWNldEtleXMucHVzaChlbmNvZGluZy5maWVsZChST1cpKTtcblxuICAgICAgdmFyIGZyb207XG4gICAgICBpZiAoaGFzQ29sKSB7XG4gICAgICAgIGZyb20gPSB1dGlsLmR1cGxpY2F0ZShncm91cC5mcm9tKTtcbiAgICAgICAgZnJvbS50cmFuc2Zvcm0gPSBmcm9tLnRyYW5zZm9ybSB8fCBbXTtcbiAgICAgICAgZnJvbS50cmFuc2Zvcm0udW5zaGlmdCh7dHlwZTogXCJmYWNldFwiLCBrZXlzOiBbZW5jb2RpbmcuZmllbGQoQ09MKV19KTtcbiAgICAgIH1cblxuICAgICAgdmFyIGF4ZXNHcnAgPSBncm91cGRlZihcIngtYXhlc1wiLCB7XG4gICAgICAgICAgYXhlczogZW5jb2RpbmcuaGFzKFgpID8gIGF4aXMuZGVmcyhbXCJ4XCJdLCBlbmNvZGluZykgOiB1bmRlZmluZWQsXG4gICAgICAgICAgeDogaGFzQ29sID8ge3NjYWxlOiBDT0wsIGZpZWxkOiBcImtleXMuMFwiLCBvZmZzZXQ6IHhBeGlzTWFyZ2lufSA6IHt2YWx1ZTogeEF4aXNNYXJnaW59LFxuICAgICAgICAgIHdpZHRoOiBoYXNDb2wgJiYge1widmFsdWVcIjogY2VsbFdpZHRofSwgLy9IQUNLP1xuICAgICAgICAgIGZyb206IGZyb21cbiAgICAgICAgfSk7XG5cbiAgICAgIHNwZWMubWFya3MucHVzaChheGVzR3JwKTtcbiAgICAgIChzcGVjLmF4ZXMgPSBzcGVjLmF4ZXMgfHwgW10pO1xuICAgICAgc3BlYy5heGVzLnB1c2guYXBwbHkoc3BlYy5heGVzLCBheGlzLmRlZnMoW1wicm93XCJdLCBlbmNvZGluZykpO1xuICAgIH0gZWxzZSB7IC8vIGRvZXNuJ3QgaGF2ZSByb3dcbiAgICAgIGlmKGVuY29kaW5nLmhhcyhYKSl7XG4gICAgICAgIC8va2VlcCB4IGF4aXMgaW4gdGhlIGNlbGxcbiAgICAgICAgY2VsbEF4ZXMucHVzaC5hcHBseShjZWxsQXhlcywgYXhpcy5kZWZzKFtcInhcIl0sIGVuY29kaW5nKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGhhc0NvbCkge1xuICAgICAgaWYgKCFlbmNvZGluZy5pc1R5cGUoQ09MLCBPKSkge1xuICAgICAgICB1dGlsLmVycm9yKFwiQ29sIGVuY29kaW5nIHNob3VsZCBiZSBvcmRpbmFsLlwiKTtcbiAgICAgIH1cbiAgICAgIGVudGVyLnggPSB7c2NhbGU6IENPTCwgZmllbGQ6IFwia2V5cy5cIiArIGZhY2V0S2V5cy5sZW5ndGh9O1xuICAgICAgZW50ZXIud2lkdGggPSB7XCJ2YWx1ZVwiOiBjZWxsV2lkdGh9OyAvLyBIQUNLXG5cbiAgICAgIGZhY2V0S2V5cy5wdXNoKGVuY29kaW5nLmZpZWxkKENPTCkpO1xuXG4gICAgICB2YXIgZnJvbTtcbiAgICAgIGlmIChoYXNSb3cpIHtcbiAgICAgICAgZnJvbSA9IHV0aWwuZHVwbGljYXRlKGdyb3VwLmZyb20pO1xuICAgICAgICBmcm9tLnRyYW5zZm9ybSA9IGZyb20udHJhbnNmb3JtIHx8IFtdO1xuICAgICAgICBmcm9tLnRyYW5zZm9ybS51bnNoaWZ0KHt0eXBlOiBcImZhY2V0XCIsIGtleXM6IFtlbmNvZGluZy5maWVsZChST1cpXX0pO1xuICAgICAgfVxuXG4gICAgICB2YXIgYXhlc0dycCA9IGdyb3VwZGVmKFwieS1heGVzXCIsIHtcbiAgICAgICAgYXhlczogZW5jb2RpbmcuaGFzKFkpID8gYXhpcy5kZWZzKFtcInlcIl0sIGVuY29kaW5nKSA6IHVuZGVmaW5lZCxcbiAgICAgICAgeTogaGFzUm93ICYmIHtzY2FsZTogUk9XLCBmaWVsZDogXCJrZXlzLjBcIn0sXG4gICAgICAgIHg6IGhhc1JvdyAmJiB7dmFsdWU6IHhBeGlzTWFyZ2lufSxcbiAgICAgICAgaGVpZ2h0OiBoYXNSb3cgJiYge1widmFsdWVcIjogY2VsbEhlaWdodH0sIC8vSEFDSz9cbiAgICAgICAgZnJvbTogZnJvbVxuICAgICAgfSk7XG5cbiAgICAgIHNwZWMubWFya3MucHVzaChheGVzR3JwKTtcbiAgICAgIChzcGVjLmF4ZXMgPSBzcGVjLmF4ZXMgfHwgW10pXG4gICAgICBzcGVjLmF4ZXMucHVzaC5hcHBseShzcGVjLmF4ZXMsIGF4aXMuZGVmcyhbXCJjb2xcIl0sIGVuY29kaW5nLCB7XG4gICAgICAgIHhBeGlzTWFyZ2luOiB4QXhpc01hcmdpblxuICAgICAgfSkpO1xuICAgIH0gZWxzZSB7IC8vIGRvZXNuJ3QgaGF2ZSBjb2xcbiAgICAgIGlmKGVuY29kaW5nLmhhcyhZKSl7XG4gICAgICAgIGNlbGxBeGVzLnB1c2guYXBwbHkoY2VsbEF4ZXMsIGF4aXMuZGVmcyhbXCJ5XCJdLCBlbmNvZGluZykpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmKGhhc1Jvdyl7XG4gICAgICBpZihlbnRlci54KSBlbnRlci54Lm9mZnNldD0geEF4aXNNYXJnaW47XG4gICAgICBlbHNlIGVudGVyLnggPSB7dmFsdWU6IHhBeGlzTWFyZ2lufTtcbiAgICB9XG4gICAgaWYoaGFzQ29sKXtcbiAgICAgIC8vVE9ETyBmaWxsIGhlcmUuLlxuICAgIH1cblxuICAgIC8vIGFzc3VtaW5nIGVxdWFsIGNlbGxXaWR0aCBoZXJlXG4gICAgLy8gVE9ETzogc3VwcG9ydCBoZXRlcm9nZW5vdXMgY2VsbFdpZHRoIChtYXliZSBieSB1c2luZyBtdWx0aXBsZSBzY2FsZXM/KVxuICAgIHNwZWMuc2NhbGVzID0gKHNwZWMuc2NhbGVzIHx8W10pLmNvbmNhdChzY2FsZS5kZWZzKFxuICAgICAgc2NhbGUubmFtZXMoZW50ZXIpLmNvbmNhdChzY2FsZS5uYW1lcyhtZGVmLnByb3BlcnRpZXMudXBkYXRlKSksXG4gICAgICBlbmNvZGluZyxcbiAgICAgIHtjZWxsV2lkdGg6IGNlbGxXaWR0aCwgY2VsbEhlaWdodDogY2VsbEhlaWdodCwgc3RhY2s6IHN0YWNrLCBmYWNldDp0cnVlLCBzdGF0czogc3RhdHN9XG4gICAgKSk7IC8vIHJvdy9jb2wgc2NhbGVzICsgY2VsbCBzY2FsZXNcblxuICAgIGlmIChjZWxsQXhlcy5sZW5ndGggPiAwKSB7XG4gICAgICBncm91cC5heGVzID0gY2VsbEF4ZXM7XG4gICAgfVxuXG4gICAgLy8gYWRkIGZhY2V0IHRyYW5zZm9ybVxuICAgIHZhciB0cmFucyA9IChncm91cC5mcm9tLnRyYW5zZm9ybSB8fCAoZ3JvdXAuZnJvbS50cmFuc2Zvcm0gPSBbXSkpO1xuICAgIHRyYW5zLnVuc2hpZnQoe3R5cGU6IFwiZmFjZXRcIiwga2V5czogZmFjZXRLZXlzfSk7XG5cbiAgcmV0dXJuIHNwZWM7XG4gIH1cblxuZnVuY3Rpb24gc3ViZmFjZXQoZ3JvdXAsIG1kZWYsIGRldGFpbHMsIHN0YWNrLCBlbmNvZGluZykge1xuICB2YXIgbSA9IGdyb3VwLm1hcmtzLFxuICAgIGcgPSBncm91cGRlZihcInN1YmZhY2V0XCIsIHttYXJrczogbX0pO1xuXG4gIGdyb3VwLm1hcmtzID0gW2ddO1xuICBnLmZyb20gPSBtZGVmLmZyb207XG4gIGRlbGV0ZSBtZGVmLmZyb207XG5cbiAgLy9UT0RPIHRlc3QgTE9EIC0tIHdlIHNob3VsZCBzdXBwb3J0IHN0YWNrIC8gbGluZSB3aXRob3V0IGNvbG9yIChMT0QpIGZpZWxkXG4gIHZhciB0cmFucyA9IChnLmZyb20udHJhbnNmb3JtIHx8IChnLmZyb20udHJhbnNmb3JtID0gW10pKTtcbiAgdHJhbnMudW5zaGlmdCh7dHlwZTogXCJmYWNldFwiLCBrZXlzOiBkZXRhaWxzfSk7XG5cbiAgaWYgKHN0YWNrICYmIGVuY29kaW5nLmhhcyhDT0xPUikpIHtcbiAgICB0cmFucy51bnNoaWZ0KHt0eXBlOiBcInNvcnRcIiwgYnk6IGVuY29kaW5nLmZpZWxkKENPTE9SKX0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGJpbm5pbmcoc3BlYywgZW5jb2RpbmcsIG9wdCkge1xuICBvcHQgPSBvcHQgfHwge307XG4gIHZhciBiaW5zID0ge307XG4gIGVuY29kaW5nLmZvckVhY2goZnVuY3Rpb24odnYsIGQpIHtcbiAgICBpZiAoZC5iaW4pIGJpbnNbZC5uYW1lXSA9IGQubmFtZTtcbiAgfSk7XG4gIGJpbnMgPSB1dGlsLmtleXMoYmlucyk7XG5cbiAgaWYgKGJpbnMubGVuZ3RoID09PSAwIHx8IG9wdC5wcmVhZ2dyZWdhdGVkRGF0YSkgcmV0dXJuIGZhbHNlO1xuXG4gIGlmICghc3BlYy50cmFuc2Zvcm0pIHNwZWMudHJhbnNmb3JtID0gW107XG4gIGJpbnMuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgc3BlYy50cmFuc2Zvcm0ucHVzaCh7XG4gICAgICB0eXBlOiBcImJpblwiLFxuICAgICAgZmllbGQ6IFwiZGF0YS5cIiArIGQsXG4gICAgICBvdXRwdXQ6IFwiZGF0YS5iaW5fXCIgKyBkLFxuICAgICAgbWF4YmluczogTUFYX0JJTlNcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBiaW5zO1xufVxuXG5mdW5jdGlvbiBhZ2dyZWdhdGVzKHNwZWMsIGVuY29kaW5nLCBvcHQpIHtcbiAgb3B0ID0gb3B0IHx8IHt9O1xuICB2YXIgZGltcyA9IHt9LCBtZWFzID0ge30sIGRldGFpbCA9IHt9LCBmYWNldHM9e307XG4gIGVuY29kaW5nLmZvckVhY2goZnVuY3Rpb24oZW5jVHlwZSwgZmllbGQpIHtcbiAgICBpZiAoZmllbGQuYWdncikge1xuICAgICAgaWYoZmllbGQuYWdncj09PVwiY291bnRcIil7XG4gICAgICAgIG1lYXNbXCJjb3VudFwiXSA9IHtvcDpcImNvdW50XCIsIGZpZWxkOlwiKlwifTtcbiAgICAgIH1lbHNle1xuICAgICAgICBtZWFzW2ZpZWxkLmFnZ3IrXCJ8XCIrZmllbGQubmFtZV0gPSB7XG4gICAgICAgICAgb3A6ZmllbGQuYWdncixcbiAgICAgICAgICBmaWVsZDpcImRhdGEuXCIrZmllbGQubmFtZVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBkaW1zW2ZpZWxkLm5hbWVdID0gZW5jb2RpbmcuZmllbGQoZW5jVHlwZSk7XG4gICAgICBpZiAoZW5jVHlwZT09Uk9XIHx8IGVuY1R5cGUgPT0gQ09MKXtcbiAgICAgICAgZmFjZXRzW2ZpZWxkLm5hbWVdID0gZGltc1tmaWVsZC5uYW1lXTtcbiAgICAgIH1lbHNlIGlmIChlbmNUeXBlICE9PSBYICYmIGVuY1R5cGUgIT09IFkpIHtcbiAgICAgICAgZGV0YWlsW2ZpZWxkLm5hbWVdID0gZGltc1tmaWVsZC5uYW1lXTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICBkaW1zID0gdXRpbC52YWxzKGRpbXMpO1xuICBtZWFzID0gdXRpbC52YWxzKG1lYXMpO1xuXG4gIGlmIChtZWFzLmxlbmd0aCA+IDAgJiYgIW9wdC5wcmVhZ2dyZWdhdGVkRGF0YSkge1xuICAgIGlmICghc3BlYy50cmFuc2Zvcm0pIHNwZWMudHJhbnNmb3JtID0gW107XG4gICAgc3BlYy50cmFuc2Zvcm0ucHVzaCh7XG4gICAgICB0eXBlOiBcImFnZ3JlZ2F0ZVwiLFxuICAgICAgZ3JvdXBieTogZGltcyxcbiAgICAgIGZpZWxkczogbWVhc1xuICAgIH0pO1xuXG4gICAgaWYgKGVuY29kaW5nLm1hcmt0eXBlKCkgPT09IFRFWFQpIHtcbiAgICAgIG1lYXMuZm9yRWFjaCggZnVuY3Rpb24gKG0pIHtcbiAgICAgICAgdmFyIGZpZWxkTmFtZSA9IG0uZmllbGQuc3Vic3RyKDUpLCAvL3JlbW92ZSBcImRhdGEuXCJcbiAgICAgICAgICBmaWVsZCA9IFwiZGF0YS5cIiArIChtLm9wID8gbS5vcCArIFwiX1wiIDogXCJcIikgKyBmaWVsZE5hbWU7XG4gICAgICAgIHNwZWMudHJhbnNmb3JtLnB1c2goe1xuICAgICAgICAgIHR5cGU6IFwiZm9ybXVsYVwiLFxuICAgICAgICAgIGZpZWxkOiBmaWVsZCxcbiAgICAgICAgICBleHByOiBcImQzLmZvcm1hdCgnLjJmJykoZC5cIitmaWVsZCtcIilcIlxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4ge1xuICAgIGRldGFpbHM6IHV0aWwudmFscyhkZXRhaWwpLFxuICAgIGRpbXM6IGRpbXMsXG4gICAgZmFjZXRzOiB1dGlsLnZhbHMoZmFjZXRzKSxcbiAgICBhZ2dyZWdhdGVkOiBtZWFzLmxlbmd0aCA+IDBcbiAgfVxufVxuXG5mdW5jdGlvbiBzdGFja2luZyhzcGVjLCBlbmNvZGluZywgbWRlZiwgZmFjZXRzKSB7XG4gIGlmICghbWFya3NbZW5jb2RpbmcubWFya3R5cGUoKV0uc3RhY2spIHJldHVybiBmYWxzZTtcbiAgaWYgKCFlbmNvZGluZy5oYXMoQ09MT1IpKSByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIGRpbSA9IFgsIHZhbCA9IFksIGlkeCA9IDE7XG4gIGlmIChlbmNvZGluZy5pc1R5cGUoWCxRfFQpICYmICFlbmNvZGluZy5pc1R5cGUoWSxRfFQpICYmIGVuY29kaW5nLmhhcyhZKSkge1xuICAgIGRpbSA9IFk7XG4gICAgdmFsID0gWDtcbiAgICBpZHggPSAwO1xuICB9XG5cbiAgLy8gYWRkIHRyYW5zZm9ybSB0byBjb21wdXRlIHN1bXMgZm9yIHNjYWxlXG4gIHZhciBzdGFja2VkID0ge1xuICAgIG5hbWU6IFNUQUNLRUQsXG4gICAgc291cmNlOiBUQUJMRSxcbiAgICB0cmFuc2Zvcm06IFt7XG4gICAgICB0eXBlOiBcImFnZ3JlZ2F0ZVwiLFxuICAgICAgZ3JvdXBieTogW2VuY29kaW5nLmZpZWxkKGRpbSldLmNvbmNhdChmYWNldHMpLCAvLyBkaW0gYW5kIG90aGVyIGZhY2V0c1xuICAgICAgZmllbGRzOiBbe29wOiBcInN1bVwiLCBmaWVsZDogZW5jb2RpbmcuZmllbGQodmFsKX1dIC8vIFRPRE8gY2hlY2sgaWYgZmllbGQgd2l0aCBhZ2dyIGlzIGNvcnJlY3Q/XG4gICAgfV1cbiAgfTtcblxuICBpZihmYWNldHMgJiYgZmFjZXRzLmxlbmd0aCA+IDApe1xuICAgIHN0YWNrZWQudHJhbnNmb3JtLnB1c2goeyAvL2NhbGN1bGF0ZSBtYXggZm9yIGVhY2ggZmFjZXRcbiAgICAgIHR5cGU6IFwiYWdncmVnYXRlXCIsXG4gICAgICBncm91cGJ5OiBmYWNldHMsXG4gICAgICBmaWVsZHM6IFt7b3A6IFwibWF4XCIsIGZpZWxkOiBcImRhdGEuc3VtX1wiICsgZW5jb2RpbmcuZmllbGQodmFsLCB0cnVlKX1dXG4gICAgfSk7XG4gIH1cblxuICBzcGVjLmRhdGEucHVzaChzdGFja2VkKTtcblxuICAvLyBhZGQgc3RhY2sgdHJhbnNmb3JtIHRvIG1hcmtcbiAgbWRlZi5mcm9tLnRyYW5zZm9ybSA9IFt7XG4gICAgdHlwZTogXCJzdGFja1wiLFxuICAgIHBvaW50OiBlbmNvZGluZy5maWVsZChkaW0pLFxuICAgIGhlaWdodDogZW5jb2RpbmcuZmllbGQodmFsKSxcbiAgICBvdXRwdXQ6IHt5MTogdmFsLCB5MDogdmFsK1wiMlwifVxuICB9XTtcblxuICAvLyBUT0RPOiBUaGlzIGlzIHN1cGVyIGhhY2staXNoIC0tIGNvbnNvbGlkYXRlIGludG8gbW9kdWxhciBtYXJrIHByb3BlcnRpZXM/XG4gIG1kZWYucHJvcGVydGllcy51cGRhdGVbdmFsXSA9IG1kZWYucHJvcGVydGllcy5lbnRlclt2YWxdID0ge3NjYWxlOiB2YWwsIGZpZWxkOiB2YWx9O1xuICBtZGVmLnByb3BlcnRpZXMudXBkYXRlW3ZhbCtcIjJcIl0gPSBtZGVmLnByb3BlcnRpZXMuZW50ZXJbdmFsK1wiMlwiXSA9IHtzY2FsZTogdmFsLCBmaWVsZDogdmFsK1wiMlwifTtcblxuICByZXR1cm4gdmFsOyAvL3JldHVybiBzdGFjayBlbmNvZGluZ1xufVxuXG5cbmZ1bmN0aW9uIG1hcmtkZWYobWFyaywgZW5jb2RpbmcsIG9wdCkge1xuICB2YXIgcCA9IG1hcmsucHJvcChlbmNvZGluZywgb3B0KVxuICByZXR1cm4ge1xuICAgIHR5cGU6IG1hcmsudHlwZSxcbiAgICBmcm9tOiB7ZGF0YTogVEFCTEV9LFxuICAgIHByb3BlcnRpZXM6IHtlbnRlcjogcCwgdXBkYXRlOiBwfVxuICB9O1xufVxuXG5mdW5jdGlvbiBncm91cGRlZihuYW1lLCBvcHQpIHtcbiAgb3B0ID0gb3B0IHx8IHt9O1xuICByZXR1cm4ge1xuICAgIF9uYW1lOiBuYW1lIHx8IHVuZGVmaW5lZCxcbiAgICB0eXBlOiBcImdyb3VwXCIsXG4gICAgZnJvbTogb3B0LmZyb20sXG4gICAgcHJvcGVydGllczoge1xuICAgICAgZW50ZXI6IHtcbiAgICAgICAgeDogb3B0LnggfHwgdW5kZWZpbmVkLFxuICAgICAgICB5OiBvcHQueSB8fCB1bmRlZmluZWQsXG4gICAgICAgIHdpZHRoOiBvcHQud2lkdGggfHwge2dyb3VwOiBcIndpZHRoXCJ9LFxuICAgICAgICBoZWlnaHQ6IG9wdC5oZWlnaHQgfHwge2dyb3VwOiBcImhlaWdodFwifVxuICAgICAgfVxuICAgIH0sXG4gICAgc2NhbGVzOiBvcHQuc2NhbGVzIHx8IHVuZGVmaW5lZCxcbiAgICBheGVzOiBvcHQuYXhlcyB8fCB1bmRlZmluZWQsXG4gICAgbWFya3M6IG9wdC5tYXJrcyB8fCBbXVxuICB9O1xufVxuXG5mdW5jdGlvbiB0ZW1wbGF0ZShlbmNvZGluZywgc2l6ZSwgc3RhdHMpIHsgLy9oYWNrIHVzZSBzdGF0c1xuXG4gIHZhciBkYXRhID0ge25hbWU6VEFCTEUsIGZvcm1hdDoge3R5cGU6IGVuY29kaW5nLmNvbmZpZyhcImRhdGFGb3JtYXRUeXBlXCIpfX0sXG4gICAgZGF0YVVybCA9IHZsLmRhdGEuZ2V0VXJsKGVuY29kaW5nLCBzdGF0cyk7XG4gIGlmKGRhdGFVcmwpIGRhdGEudXJsID0gZGF0YVVybDtcblxuICB2YXIgcHJlYWdncmVnYXRlZERhdGEgPSBlbmNvZGluZy5jb25maWcoXCJ1c2VWZWdhU2VydmVyXCIpO1xuXG4gIGVuY29kaW5nLmZvckVhY2goZnVuY3Rpb24oZW5jVHlwZSwgZmllbGQpe1xuICAgIGlmKGZpZWxkLnR5cGUgPT0gVCl7XG4gICAgICBkYXRhLmZvcm1hdC5wYXJzZSA9IGRhdGEuZm9ybWF0LnBhcnNlIHx8IHt9O1xuICAgICAgZGF0YS5mb3JtYXQucGFyc2VbZmllbGQubmFtZV0gPSBcImRhdGVcIjtcbiAgICB9ZWxzZSBpZihmaWVsZC50eXBlID09IFEpe1xuICAgICAgZGF0YS5mb3JtYXQucGFyc2UgPSBkYXRhLmZvcm1hdC5wYXJzZSB8fCB7fTtcbiAgICAgIGlmIChmaWVsZC5hZ2dyID09PSBcImNvdW50XCIpIHtcbiAgICAgICAgdmFyIG5hbWUgPSBcImNvdW50XCI7XG4gICAgICB9IGVsc2UgaWYocHJlYWdncmVnYXRlZERhdGEgJiYgZmllbGQuYmluKXtcbiAgICAgICAgdmFyIG5hbWUgPSBcImJpbl9cIiArIGZpZWxkLm5hbWU7XG4gICAgICB9IGVsc2UgaWYocHJlYWdncmVnYXRlZERhdGEgJiYgZmllbGQuYWdncil7XG4gICAgICAgIHZhciBuYW1lID0gZmllbGQuYWdnciArIFwiX1wiICsgZmllbGQubmFtZTtcbiAgICAgIH0gZWxzZXtcbiAgICAgICAgdmFyIG5hbWUgPSBmaWVsZC5uYW1lO1xuICAgICAgfVxuICAgICAgZGF0YS5mb3JtYXQucGFyc2VbbmFtZV0gPSBcIm51bWJlclwiO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHtcbiAgICB3aWR0aDogc2l6ZS53aWR0aCxcbiAgICBoZWlnaHQ6IHNpemUuaGVpZ2h0LFxuICAgIHBhZGRpbmc6IFwiYXV0b1wiLFxuICAgIGRhdGE6IFtkYXRhXSxcbiAgICBtYXJrczogW2dyb3VwZGVmKFwiY2VsbFwiLCB7XG4gICAgICB3aWR0aDogc2l6ZS5jZWxsV2lkdGggPyB7dmFsdWU6IHNpemUuY2VsbFdpZHRofTogdW5kZWZpbmVkLFxuICAgICAgaGVpZ2h0OiBzaXplLmNlbGxIZWlnaHQgPyB7dmFsdWU6IHNpemUuY2VsbEhlaWdodH0gOiB1bmRlZmluZWRcbiAgICB9KV1cbiAgfTtcbn1cbiIsInZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi9nbG9iYWxzJyk7XG5cbnZhciBjb25zdHMgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5jb25zdHMuZW5jb2RpbmdUeXBlcyA9IFtYLCBZLCBST1csIENPTCwgU0laRSwgU0hBUEUsIENPTE9SLCBBTFBIQSwgVEVYVF07XG5cbmNvbnN0cy5kYXRhVHlwZXMgPSB7XCJPXCI6IE8sIFwiUVwiOiBRLCBcIlRcIjogVH07XG5cbmNvbnN0cy5kYXRhVHlwZU5hbWVzID0gW1wiT1wiLFwiUVwiLFwiVFwiXS5yZWR1Y2UoZnVuY3Rpb24ocix4KSB7XG4gIHJbY29uc3RzLmRhdGFUeXBlc1t4XV0gPSB4OyByZXR1cm4gcjtcbn0se30pO1xuXG5jb25zdHMuREVGQVVMVFMgPSB7XG4gIC8vc21hbGwgbXVsdGlwbGVzXG4gIGNlbGxIZWlnaHQ6IDIwMCwgLy8gd2lsbCBiZSBvdmVyd3JpdHRlbiBieSBiYW5kV2lkdGhcbiAgY2VsbFdpZHRoOiAyMDAsIC8vIHdpbGwgYmUgb3ZlcndyaXR0ZW4gYnkgYmFuZFdpZHRoXG4gIGNlbGxQYWRkaW5nOiAwLjEsXG4gIGNlbGxCYWNrZ3JvdW5kQ29sb3I6IFwiI2ZkZmRmZFwiLFxuICB4QXhpc01hcmdpbjogODAsXG4gIHlBeGlzTWFyZ2luOiAwLFxuICB0ZXh0Q2VsbFdpZHRoOiA5MCxcblxuICAvLyBtYXJrc1xuICBzdHJva2VXaWR0aDogMixcblxuICAvLyBzY2FsZXNcbiAgdGltZVNjYWxlTGFiZWxMZW5ndGg6IDNcbn07XG4iLCIvLyBUT0RPIHJlbmFtZSBnZXREYXRhVXJsIHRvIHZsLmRhdGEuZ2V0VXJsKCkgP1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG52YXIgZGF0YSA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbmRhdGEuZ2V0VXJsID0gZnVuY3Rpb24gZ2V0RGF0YVVybChlbmNvZGluZywgc3RhdHMpIHtcbiAgaWYgKCFlbmNvZGluZy5jb25maWcoXCJ1c2VWZWdhU2VydmVyXCIpKSB7XG4gICAgLy8gZG9uJ3QgdXNlIHZlZ2Egc2VydmVyXG4gICAgcmV0dXJuIGVuY29kaW5nLmNvbmZpZyhcImRhdGFVcmxcIik7XG4gIH1cblxuICBpZiAoZW5jb2RpbmcubGVuZ3RoKCkgPT09IDApIHtcbiAgICAvLyBubyBmaWVsZHNcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgZmllbGRzID0gW11cbiAgZW5jb2RpbmcuZm9yRWFjaChmdW5jdGlvbihlbmNUeXBlLCBmaWVsZCl7XG4gICAgdmFyIG9iaiA9IHtcbiAgICAgIG5hbWU6IGVuY29kaW5nLmZpZWxkKGVuY1R5cGUsIHRydWUpLFxuICAgICAgZmllbGQ6IGZpZWxkLm5hbWVcbiAgICB9XG4gICAgaWYgKGZpZWxkLmFnZ3IpIHtcbiAgICAgIG9iai5hZ2dyID0gZmllbGQuYWdnclxuICAgIH1cbiAgICBpZiAoZmllbGQuYmluKSB7XG4gICAgICBvYmouYmluU2l6ZSA9IHV0aWwuZ2V0YmlucyhzdGF0c1tmaWVsZC5uYW1lXSkuc3RlcDtcbiAgICB9XG4gICAgZmllbGRzLnB1c2gob2JqKTtcbiAgfSk7XG5cbiAgdmFyIHF1ZXJ5ID0ge1xuICAgIHRhYmxlOiBlbmNvZGluZy5jb25maWcoXCJ2ZWdhU2VydmVyVGFibGVcIiksXG4gICAgZmllbGRzOiBmaWVsZHNcbiAgfVxuXG4gIHJldHVybiBlbmNvZGluZy5jb25maWcoXCJ2ZWdhU2VydmVyVXJsXCIpICsgXCIvcXVlcnkvP3E9XCIgKyBKU09OLnN0cmluZ2lmeShxdWVyeSlcbn07XG5cbi8qKlxuICogQHBhcmFtICB7T2JqZWN0fSBkYXRhIGRhdGEgaW4gSlNPTi9qYXZhc2NyaXB0IG9iamVjdCBmb3JtYXRcbiAqIEByZXR1cm4gQXJyYXkgb2Yge25hbWU6IF9fbmFtZV9fLCB0eXBlOiBcIm51bWJlcnx0ZXh0fHRpbWV8bG9jYXRpb25cIn1cbiAqL1xuZGF0YS5nZXRTY2hlbWEgPSBmdW5jdGlvbihkYXRhKXtcbiAgdmFyIHNjaGVtYSA9IFtdLFxuICAgIGZpZWxkcyA9IHV0aWwua2V5cyhkYXRhWzBdKTtcblxuICBmaWVsZHMuZm9yRWFjaChmdW5jdGlvbihrKXtcbiAgICAvLyBmaW5kIG5vbi1udWxsIGRhdGFcbiAgICB2YXIgaT0wLCBkYXR1bSA9IGRhdGFbaV1ba107XG4gICAgd2hpbGUoZGF0dW0gPT09IFwiXCIgfHwgZGF0dW0gPT09IG51bGwgfHwgZGF0dW0gPT09IHVuZGVmaW5lZCl7XG4gICAgICBkYXR1bSA9IGRhdGFbKytpXVtrXTtcbiAgICB9XG5cbiAgICAvL1RPRE8oa2FuaXR3KTogYmV0dGVyIHR5cGUgaW5mZXJlbmNlIGhlcmVcbiAgICB2YXIgdHlwZSA9ICh0eXBlb2YgZGF0dW0gPT09IFwibnVtYmVyXCIpID8gXCJRXCI6XG4gICAgICBpc05hTihEYXRlLnBhcnNlKGRhdHVtKSkgPyBcIk9cIiA6IFwiVFwiO1xuXG4gICAgc2NoZW1hLnB1c2goe25hbWU6IGssIHR5cGU6IHR5cGV9KTtcbiAgfSk7XG5cbiAgcmV0dXJuIHNjaGVtYTtcbn07XG5cbmRhdGEuZ2V0U3RhdHMgPSBmdW5jdGlvbihkYXRhKXsgLy8gaGFja1xuICB2YXIgc3RhdHMgPSB7fSxcbiAgICBmaWVsZHMgPSB1dGlsLmtleXMoZGF0YVswXSk7XG5cbiAgZmllbGRzLmZvckVhY2goZnVuY3Rpb24oaykge1xuICAgIHZhciBzdGF0ID0gdXRpbC5taW5tYXgoZGF0YSwgayk7XG4gICAgc3RhdC5jYXJkaW5hbGl0eSA9IHV0aWwudW5pcShkYXRhLCBrKTtcbiAgICBzdGF0LmNvdW50ID0gZGF0YS5sZW5ndGg7XG4gICAgc3RhdHNba10gPSBzdGF0O1xuICB9KTtcbiAgcmV0dXJuIHN0YXRzO1xufTtcbiIsIi8vIGRlY2xhcmUgZ2xvYmFsIGNvbnN0YW50XG52YXIgZyA9IGdsb2JhbCB8fCB3aW5kb3c7XG5cbmcuVEFCTEUgPSBcInRhYmxlXCI7XG5nLlNUQUNLRUQgPSBcInN0YWNrZWRcIjtcbmcuSU5ERVggPSBcImluZGV4XCI7XG5cbmcuWCA9IFwieFwiO1xuZy5ZID0gXCJ5XCI7XG5nLlJPVyA9IFwicm93XCI7XG5nLkNPTCA9IFwiY29sXCI7XG5nLlNJWkUgPSBcInNpemVcIjtcbmcuU0hBUEUgPSBcInNoYXBlXCI7XG5nLkNPTE9SID0gXCJjb2xvclwiO1xuZy5BTFBIQSA9IFwiYWxwaGFcIjtcbmcuVEVYVCA9IFwidGV4dFwiO1xuXG5nLk8gPSAxO1xuZy5RID0gMjtcbmcuVCA9IDQ7XG5cbi8vVE9ETyByZWZhY3RvciB0aGlzIHRvIGJlIGNvbmZpZz9cbmcuTUFYX0JJTlMgPSAyMDsiLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9nbG9iYWxzJyk7XG5cbnZhciBsZWdlbmRzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxubGVnZW5kcy5kZWZzID0gZnVuY3Rpb24oZW5jb2RpbmcpIHtcbiAgdmFyIF9sZWdlbmRzID0gW107XG5cbiAgLy8gVE9ETzogc3VwcG9ydCBhbHBoYVxuXG4gIGlmIChlbmNvZGluZy5oYXMoQ09MT1IpICYmIGVuY29kaW5nLmxlZ2VuZChDT0xPUikpIHtcbiAgICBfbGVnZW5kcy5wdXNoKGxlZ2VuZHMuZGVmKENPTE9SLCBlbmNvZGluZywge1xuICAgICAgZmlsbDogQ09MT1IsXG4gICAgICBvcmllbnQ6IFwicmlnaHRcIlxuICAgIH0pKTtcbiAgfVxuXG4gIGlmIChlbmNvZGluZy5oYXMoU0laRSkgJiYgZW5jb2RpbmcubGVnZW5kKFNJWkUpKSB7XG4gICAgX2xlZ2VuZHMucHVzaChsZWdlbmRzLmRlZihTSVpFLCBlbmNvZGluZywge1xuICAgICAgc2l6ZTogU0laRSxcbiAgICAgIG9yaWVudDogX2xlZ2VuZHMubGVuZ3RoID09PSAxID8gXCJsZWZ0XCIgOiBcInJpZ2h0XCJcbiAgICB9KSk7XG4gIH1cblxuICBpZiAoZW5jb2RpbmcuaGFzKFNIQVBFKSAmJiBlbmNvZGluZy5sZWdlbmQoU0hBUEUpKSB7XG4gICAgaWYgKF9sZWdlbmRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgLy8gVE9ETzogZml4IHRoaXNcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJWZWdhbGl0ZSBjdXJyZW50bHkgb25seSBzdXBwb3J0cyB0d28gX2xlZ2VuZHNcIik7XG4gICAgICByZXR1cm4gX2xlZ2VuZHM7XG4gICAgfVxuICAgIF9sZWdlbmRzLnB1c2gobGVnZW5kcy5kZWYoU0hBUEUsIGVuY29kaW5nLCB7XG4gICAgICBzaGFwZTogU0hBUEUsXG4gICAgICBvcmllbnQ6IF9sZWdlbmRzLmxlbmd0aCA9PT0gMSA/IFwibGVmdFwiIDogXCJyaWdodFwiXG4gICAgfSkpO1xuICB9XG5cbiAgcmV0dXJuIF9sZWdlbmRzO1xufTtcblxubGVnZW5kcy5kZWYgPSBmdW5jdGlvbihuYW1lLCBlbmNvZGluZywgcHJvcHMpe1xuICB2YXIgX2xlZ2VuZCA9IHByb3BzO1xuXG4gIF9sZWdlbmQudGl0bGUgPSBlbmNvZGluZy5maWVsZFRpdGxlKG5hbWUpO1xuXG4gIGlmIChlbmNvZGluZy5pc1R5cGUobmFtZSwgVCkpIHtcbiAgICB2YXIgZm4gPSBlbmNvZGluZy5mbihuYW1lKSxcbiAgICAgIHByb3BlcnRpZXMgPSBfbGVnZW5kLnByb3BlcnRpZXMgPSBfbGVnZW5kLnByb3BlcnRpZXMgfHwge30sXG4gICAgICBsYWJlbHMgPSBwcm9wZXJ0aWVzLmxhYmVscyA9IHByb3BlcnRpZXMubGFiZWxzIHx8IHt9LFxuICAgICAgdGV4dCA9IGxhYmVscy50ZXh0ID0gbGFiZWxzLnRleHQgfHwge307XG5cbiAgICBzd2l0Y2ggKGZuKSB7XG4gICAgICBjYXNlIFwiZGF5XCI6XG4gICAgICBjYXNlIFwibW9udGhcIjpcbiAgICAgICAgdGV4dC5zY2FsZSA9IFwidGltZS1cIitmbjtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIF9sZWdlbmQ7XG59OyIsInZhciBnbG9iYWxzID0gcmVxdWlyZShcIi4vZ2xvYmFsc1wiKSxcbiAgdXRpbCA9IHJlcXVpcmUoXCIuL3V0aWxcIik7XG5cbnZhciBtYXJrcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbm1hcmtzLmJhciA9IHtcbiAgdHlwZTogXCJyZWN0XCIsXG4gIHN0YWNrOiB0cnVlLFxuICBwcm9wOiBiYXJfcHJvcHMsXG4gIHJlcXVpcmVkRW5jb2Rpbmc6IFtcInhcIiwgXCJ5XCJdLFxuICBzdXBwb3J0ZWRFbmNvZGluZzoge3JvdzoxLCBjb2w6MSwgeDoxLCB5OjEsIHNpemU6MSwgY29sb3I6MSwgYWxwaGE6MX1cbn07XG5cbm1hcmtzLmxpbmUgPSB7XG4gIHR5cGU6IFwibGluZVwiLFxuICBsaW5lOiB0cnVlLFxuICBwcm9wOiBsaW5lX3Byb3BzLFxuICByZXF1aXJlZEVuY29kaW5nOiBbXCJ4XCIsIFwieVwiXSxcbiAgc3VwcG9ydGVkRW5jb2Rpbmc6IHtyb3c6MSwgY29sOjEsIHg6MSwgeToxLCBjb2xvcjoxLCBhbHBoYToxfVxufTtcblxubWFya3MuYXJlYSA9IHtcbiAgdHlwZTogXCJhcmVhXCIsXG4gIHN0YWNrOiB0cnVlLFxuICBsaW5lOiB0cnVlLFxuICByZXF1aXJlZEVuY29kaW5nOiBbXCJ4XCIsIFwieVwiXSxcbiAgcHJvcDogYXJlYV9wcm9wcyxcbiAgc3VwcG9ydGVkRW5jb2Rpbmc6IG1hcmtzLmxpbmUuc3VwcG9ydGVkRW5jb2Rpbmdcbn07XG5cbm1hcmtzLmNpcmNsZSA9IHtcbiAgdHlwZTogXCJzeW1ib2xcIixcbiAgcHJvcDogZmlsbGVkX3BvaW50X3Byb3BzKFwiY2lyY2xlXCIpLFxuICBzdXBwb3J0ZWRFbmNvZGluZzoge3JvdzoxLCBjb2w6MSwgeDoxLCB5OjEsIHNpemU6MSwgY29sb3I6MSwgYWxwaGE6MX1cbn07XG5cbm1hcmtzLnNxdWFyZSA9IHtcbiAgdHlwZTogXCJzeW1ib2xcIixcbiAgcHJvcDogZmlsbGVkX3BvaW50X3Byb3BzKFwic3F1YXJlXCIpLFxuICBzdXBwb3J0ZWRFbmNvZGluZzogbWFya3MuY2lyY2xlLnN1cHBvcnRlZEVuY29kaW5nXG59O1xuXG5tYXJrcy5wb2ludCA9IHtcbiAgdHlwZTogXCJzeW1ib2xcIixcbiAgcHJvcDogcG9pbnRfcHJvcHMsXG4gIHN1cHBvcnRlZEVuY29kaW5nOiB7cm93OjEsIGNvbDoxLCB4OjEsIHk6MSwgc2l6ZToxLCBjb2xvcjoxLCBhbHBoYToxLCBzaGFwZToxfVxufTtcblxubWFya3MudGV4dCA9IHtcbiAgdHlwZTogXCJ0ZXh0XCIsXG4gIHByb3A6IHRleHRfcHJvcHMsXG4gIHJlcXVpcmVkRW5jb2Rpbmc6IFtcInRleHRcIl0sXG4gIHN1cHBvcnRlZEVuY29kaW5nOiB7cm93OjEsIGNvbDoxLCBzaXplOjEsIGNvbG9yOjEsIGFscGhhOjEsIHRleHQ6MX1cbn07XG5cbmZ1bmN0aW9uIGJhcl9wcm9wcyhlKSB7XG4gIHZhciBwID0ge307XG5cbiAgLy8geFxuICBpZiAoZS5pc1R5cGUoWCxRfFQpICYmICFlLmJpbihYKSkge1xuICAgIHAueCA9IHtzY2FsZTogWCwgZmllbGQ6IGUuZmllbGQoWCl9O1xuICAgIGlmIChlLmhhcyhZKSAmJiAoIWUuaXNUeXBlKFksUXxUKSB8fCBlLmJpbihZKSkpIHtcbiAgICAgIHAueDIgPSB7c2NhbGU6IFgsIHZhbHVlOiAwfTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoZS5oYXMoWCkpIHtcbiAgICBwLnhjID0ge3NjYWxlOiBYLCBmaWVsZDogZS5maWVsZChYKX07XG4gIH0gZWxzZSB7XG4gICAgcC54YyA9IHt2YWx1ZTogMH07XG4gIH1cblxuICAvLyB5XG4gIGlmIChlLmlzVHlwZShZLFF8VCkgJiYgIWUuYmluKFkpKSB7XG4gICAgcC55ID0ge3NjYWxlOiBZLCBmaWVsZDogZS5maWVsZChZKX07XG4gICAgcC55MiA9IHtzY2FsZTogWSwgdmFsdWU6IDB9O1xuICB9IGVsc2UgaWYgKGUuaGFzKFkpKSB7XG4gICAgcC55YyA9IHtzY2FsZTogWSwgZmllbGQ6IGUuZmllbGQoWSl9O1xuICB9IGVsc2Uge1xuICAgIHAueWMgPSB7Z3JvdXA6IFwiaGVpZ2h0XCJ9O1xuICB9XG5cbiAgLy8gd2lkdGhcbiAgaWYgKCFlLmlzVHlwZShYLFF8VCkpIHtcbiAgICBpZiAoZS5oYXMoU0laRSkpIHtcbiAgICAgIHAud2lkdGggPSB7c2NhbGU6IFNJWkUsIGZpZWxkOiBlLmZpZWxkKFNJWkUpfTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gcC53aWR0aCA9IHtzY2FsZTogWCwgYmFuZDogdHJ1ZSwgb2Zmc2V0OiAtMX07XG4gICAgICBwLndpZHRoID0ge3ZhbHVlOiBlLmJhbmQoWCkuc2l6ZSwgb2Zmc2V0OiAtMX07XG4gICAgfVxuICB9IGVsc2UgaWYgKCFlLmlzVHlwZShZLE8pICYmICFlLmJpbihZKSkge1xuICAgIHAud2lkdGggPSB7dmFsdWU6IGUuYmFuZChYKS5zaXplLCBvZmZzZXQ6IC0xfTtcbiAgfVxuXG4gIC8vIGhlaWdodFxuICBpZiAoIWUuaXNUeXBlKFksUXxUKSkge1xuICAgIGlmIChlLmhhcyhTSVpFKSkge1xuICAgICAgcC5oZWlnaHQgPSB7c2NhbGU6IFNJWkUsIGZpZWxkOiBlLmZpZWxkKFNJWkUpfTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gcC5oZWlnaHQgPSB7c2NhbGU6IFksIGJhbmQ6IHRydWUsIG9mZnNldDogLTF9O1xuICAgICAgcC5oZWlnaHQgPSB7dmFsdWU6IGUuYmFuZChZKS5zaXplLCBvZmZzZXQ6IC0xfTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoIWUuaXNUeXBlKFgsTykgJiYgIWUuYmluKFgpKSB7XG4gICAgcC5oZWlnaHQgPSB7dmFsdWU6IGUuYmFuZChZKS5zaXplLCBvZmZzZXQ6IC0xfTtcbiAgfVxuXG4gIC8vIGZpbGxcbiAgaWYgKGUuaGFzKENPTE9SKSkge1xuICAgIHAuZmlsbCA9IHtzY2FsZTogQ09MT1IsIGZpZWxkOiBlLmZpZWxkKENPTE9SKX07XG4gIH0gZWxzZSBpZiAoIWUuaGFzKENPTE9SKSkge1xuICAgIHAuZmlsbCA9IHt2YWx1ZTogZS52YWx1ZShDT0xPUil9O1xuICB9XG5cbiAgLy8gYWxwaGFcbiAgaWYgKGUuaGFzKEFMUEhBKSkge1xuICAgIHAub3BhY2l0eSA9IHtzY2FsZTogQUxQSEEsIGZpZWxkOiBlLmZpZWxkKEFMUEhBKX07XG4gIH1cblxuICByZXR1cm4gcDtcbn1cblxuZnVuY3Rpb24gcG9pbnRfcHJvcHMoZSwgb3B0KSB7XG4gIHZhciBwID0ge307XG4gIG9wdCA9IG9wdCB8fCB7fTtcblxuICAvLyB4XG4gIGlmIChlLmhhcyhYKSkge1xuICAgIHAueCA9IHtzY2FsZTogWCwgZmllbGQ6IGUuZmllbGQoWCl9O1xuICB9IGVsc2UgaWYgKCFlLmhhcyhYKSkge1xuICAgIHAueCA9IHt2YWx1ZTogZS5iYW5kKFgpLnNpemUvMn07XG4gIH1cblxuICAvLyB5XG4gIGlmIChlLmhhcyhZKSkge1xuICAgIHAueSA9IHtzY2FsZTogWSwgZmllbGQ6IGUuZmllbGQoWSl9O1xuICB9IGVsc2UgaWYgKCFlLmhhcyhZKSkge1xuICAgIHAueSA9IHt2YWx1ZTogZS5iYW5kKFkpLnNpemUvMn07XG4gIH1cblxuICAvLyBzaXplXG4gIGlmIChlLmhhcyhTSVpFKSkge1xuICAgIHAuc2l6ZSA9IHtzY2FsZTogU0laRSwgZmllbGQ6IGUuZmllbGQoU0laRSl9O1xuICB9IGVsc2UgaWYgKCFlLmhhcyhTSVpFKSkge1xuICAgIHAuc2l6ZSA9IHt2YWx1ZTogZS52YWx1ZShTSVpFKX07XG4gIH1cblxuICAvLyBzaGFwZVxuICBpZiAoZS5oYXMoU0hBUEUpKSB7XG4gICAgcC5zaGFwZSA9IHtzY2FsZTogU0hBUEUsIGZpZWxkOiBlLmZpZWxkKFNIQVBFKX07XG4gIH0gZWxzZSBpZiAoIWUuaGFzKFNIQVBFKSkge1xuICAgIHAuc2hhcGUgPSB7dmFsdWU6IGUudmFsdWUoU0hBUEUpfTtcbiAgfVxuXG4gIC8vIHN0cm9rZVxuICBpZiAoZS5oYXMoQ09MT1IpKSB7XG4gICAgcC5zdHJva2UgPSB7c2NhbGU6IENPTE9SLCBmaWVsZDogZS5maWVsZChDT0xPUil9O1xuICB9IGVsc2UgaWYgKCFlLmhhcyhDT0xPUikpIHtcbiAgICBwLnN0cm9rZSA9IHt2YWx1ZTogZS52YWx1ZShDT0xPUil9O1xuICB9XG5cbiAgLy8gYWxwaGFcbiAgaWYgKGUuaGFzKEFMUEhBKSkge1xuICAgIHAub3BhY2l0eSA9IHtzY2FsZTogQUxQSEEsIGZpZWxkOiBlLmZpZWxkKEFMUEhBKX07XG4gIH1lbHNle1xuICAgIHAub3BhY2l0eSA9IHtcbiAgICAgIHZhbHVlOiBlLnZhbHVlKEFMUEhBKVxuICAgIH07XG4gIH1cblxuICBwLnN0cm9rZVdpZHRoID0ge3ZhbHVlOiBlLmNvbmZpZyhcInN0cm9rZVdpZHRoXCIpfTtcblxuICByZXR1cm4gcDtcbn1cblxuZnVuY3Rpb24gbGluZV9wcm9wcyhlKSB7XG4gIHZhciBwID0ge307XG5cbiAgLy8geFxuICBpZiAoZS5oYXMoWCkpIHtcbiAgICBwLnggPSB7c2NhbGU6IFgsIGZpZWxkOiBlLmZpZWxkKFgpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoWCkpIHtcbiAgICBwLnggPSB7dmFsdWU6IDB9O1xuICB9XG5cbiAgLy8geVxuICBpZiAoZS5oYXMoWSkpIHtcbiAgICBwLnkgPSB7c2NhbGU6IFksIGZpZWxkOiBlLmZpZWxkKFkpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoWSkpIHtcbiAgICBwLnkgPSB7Z3JvdXA6IFwiaGVpZ2h0XCJ9O1xuICB9XG5cbiAgLy8gc3Ryb2tlXG4gIGlmIChlLmhhcyhDT0xPUikpIHtcbiAgICBwLnN0cm9rZSA9IHtzY2FsZTogQ09MT1IsIGZpZWxkOiBlLmZpZWxkKENPTE9SKX07XG4gIH0gZWxzZSBpZiAoIWUuaGFzKENPTE9SKSkge1xuICAgIHAuc3Ryb2tlID0ge3ZhbHVlOiBlLnZhbHVlKENPTE9SKX07XG4gIH1cblxuICAvLyBhbHBoYVxuICBpZiAoZS5oYXMoQUxQSEEpKSB7XG4gICAgcC5vcGFjaXR5ID0ge3NjYWxlOiBBTFBIQSwgZmllbGQ6IGUuZmllbGQoQUxQSEEpfTtcbiAgfVxuXG4gIHAuc3Ryb2tlV2lkdGggPSB7dmFsdWU6IGUuY29uZmlnKFwic3Ryb2tlV2lkdGhcIil9O1xuXG4gIHJldHVybiBwO1xufVxuXG5mdW5jdGlvbiBhcmVhX3Byb3BzKGUpIHtcbiAgdmFyIHAgPSB7fTtcblxuICAvLyB4XG4gIGlmIChlLmlzVHlwZShYLFF8VCkpIHtcbiAgICBwLnggPSB7c2NhbGU6IFgsIGZpZWxkOiBlLmZpZWxkKFgpfTtcbiAgICBpZiAoIWUuaXNUeXBlKFksUXxUKSAmJiBlLmhhcyhZKSkge1xuICAgICAgcC54MiA9IHtzY2FsZTogWCwgdmFsdWU6IDB9O1xuICAgICAgcC5vcmllbnQgPSB7dmFsdWU6IFwiaG9yaXpvbnRhbFwifTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoZS5oYXMoWCkpIHtcbiAgICBwLnggPSB7c2NhbGU6IFgsIGZpZWxkOiBlLmZpZWxkKFgpfTtcbiAgfSBlbHNlIHtcbiAgICBwLnggPSB7dmFsdWU6IDB9O1xuICB9XG5cbiAgLy8geVxuICBpZiAoZS5pc1R5cGUoWSxRfFQpKSB7XG4gICAgcC55ID0ge3NjYWxlOiBZLCBmaWVsZDogZS5maWVsZChZKX07XG4gICAgcC55MiA9IHtzY2FsZTogWSwgdmFsdWU6IDB9O1xuICB9IGVsc2UgaWYgKGUuaGFzKFkpKSB7XG4gICAgcC55ID0ge3NjYWxlOiBZLCBmaWVsZDogZS5maWVsZChZKX07XG4gIH0gZWxzZSB7XG4gICAgcC55ID0ge2dyb3VwOiBcImhlaWdodFwifTtcbiAgfVxuXG4gIC8vIHN0cm9rZVxuICBpZiAoZS5oYXMoQ09MT1IpKSB7XG4gICAgcC5maWxsID0ge3NjYWxlOiBDT0xPUiwgZmllbGQ6IGUuZmllbGQoQ09MT1IpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoQ09MT1IpKSB7XG4gICAgcC5maWxsID0ge3ZhbHVlOiBlLnZhbHVlKENPTE9SKX07XG4gIH1cblxuICAvLyBhbHBoYVxuICBpZiAoZS5oYXMoQUxQSEEpKSB7XG4gICAgcC5vcGFjaXR5ID0ge3NjYWxlOiBBTFBIQSwgZmllbGQ6IGUuZmllbGQoQUxQSEEpfTtcbiAgfVxuXG4gIHJldHVybiBwO1xufVxuXG5mdW5jdGlvbiBmaWxsZWRfcG9pbnRfcHJvcHMoc2hhcGUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGUsIG9wdCkge1xuICAgIHZhciBwID0ge307XG4gICAgb3B0ID0gb3B0IHx8IHt9O1xuXG4gICAgLy8geFxuICAgIGlmIChlLmhhcyhYKSkge1xuICAgICAgcC54ID0ge3NjYWxlOiBYLCBmaWVsZDogZS5maWVsZChYKX07XG4gICAgfSBlbHNlIGlmICghZS5oYXMoWCkpIHtcbiAgICAgIHAueCA9IHt2YWx1ZTogZS5iYW5kKFgpLnNpemUvMn07XG4gICAgfVxuXG4gICAgLy8geVxuICAgIGlmIChlLmhhcyhZKSkge1xuICAgICAgcC55ID0ge3NjYWxlOiBZLCBmaWVsZDogZS5maWVsZChZKX07XG4gICAgfSBlbHNlIGlmICghZS5oYXMoWSkpIHtcbiAgICAgIHAueSA9IHt2YWx1ZTogZS5iYW5kKFkpLnNpemUvMn07XG4gICAgfVxuXG4gICAgLy8gc2l6ZVxuICAgIGlmIChlLmhhcyhTSVpFKSkge1xuICAgICAgcC5zaXplID0ge3NjYWxlOiBTSVpFLCBmaWVsZDogZS5maWVsZChTSVpFKX07XG4gICAgfSBlbHNlIGlmICghZS5oYXMoWCkpIHtcbiAgICAgIHAuc2l6ZSA9IHt2YWx1ZTogZS52YWx1ZShTSVpFKX07XG4gICAgfVxuXG4gICAgLy8gc2hhcGVcbiAgICBwLnNoYXBlID0ge3ZhbHVlOiBzaGFwZX07XG5cbiAgICAvLyBmaWxsXG4gICAgaWYgKGUuaGFzKENPTE9SKSkge1xuICAgICAgcC5maWxsID0ge3NjYWxlOiBDT0xPUiwgZmllbGQ6IGUuZmllbGQoQ09MT1IpfTtcbiAgICB9IGVsc2UgaWYgKCFlLmhhcyhDT0xPUikpIHtcbiAgICAgIHAuZmlsbCA9IHt2YWx1ZTogZS52YWx1ZShDT0xPUil9O1xuICAgIH1cblxuICAgIC8vIGFscGhhXG4gICAgaWYgKGUuaGFzKEFMUEhBKSkge1xuICAgICAgcC5vcGFjaXR5ID0ge3NjYWxlOiBBTFBIQSwgZmllbGQ6IGUuZmllbGQoQUxQSEEpfTtcbiAgICB9ZWxzZSB7XG4gICAgICBwLm9wYWNpdHkgPSB7XG4gICAgICAgIHZhbHVlOiBlLnZhbHVlKEFMUEhBKVxuICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gcDtcbiAgfTtcbn1cblxuZnVuY3Rpb24gdGV4dF9wcm9wcyhlKSB7XG4gIHZhciBwID0ge307XG5cbiAgLy8geFxuICBpZiAoZS5oYXMoWCkpIHtcbiAgICBwLnggPSB7c2NhbGU6IFgsIGZpZWxkOiBlLmZpZWxkKFgpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoWCkpIHtcbiAgICBwLnggPSB7dmFsdWU6IGUuYmFuZChYKS5zaXplLzJ9O1xuICB9XG5cbiAgLy8geVxuICBpZiAoZS5oYXMoWSkpIHtcbiAgICBwLnkgPSB7c2NhbGU6IFksIGZpZWxkOiBlLmZpZWxkKFkpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoWSkpIHtcbiAgICBwLnkgPSB7dmFsdWU6IGUuYmFuZChZKS5zaXplLzJ9O1xuICB9XG5cbiAgLy8gc2l6ZVxuICBpZiAoZS5oYXMoU0laRSkpIHtcbiAgICBwLmZvbnRTaXplID0ge3NjYWxlOiBTSVpFLCBmaWVsZDogZS5maWVsZChTSVpFKX07XG4gIH0gZWxzZSBpZiAoIWUuaGFzKFgpKSB7XG4gICAgcC5mb250U2l6ZSA9IHt2YWx1ZTogZS5mb250KFwic2l6ZVwiKX07XG4gIH1cblxuICAvLyBmaWxsXG4gIGlmIChlLmhhcyhDT0xPUikpIHtcbiAgICBwLmZpbGwgPSB7c2NhbGU6IENPTE9SLCBmaWVsZDogZS5maWVsZChDT0xPUil9O1xuICB9IGVsc2UgaWYgKCFlLmhhcyhDT0xPUikpIHtcbiAgICBwLmZpbGwgPSB7dmFsdWU6IGUudGV4dChcImNvbG9yXCIpfTtcbiAgfVxuXG4gIC8vIGFscGhhXG4gIGlmIChlLmhhcyhBTFBIQSkpIHtcbiAgICBwLm9wYWNpdHkgPSB7c2NhbGU6IEFMUEhBLCBmaWVsZDogZS5maWVsZChBTFBIQSl9O1xuICB9XG5cbiAgLy8gdGV4dFxuICBpZiAoZS5oYXMoVEVYVCkpIHtcbiAgICBwLnRleHQgPSB7ZmllbGQ6IGUuZmllbGQoVEVYVCl9O1xuICB9IGVsc2Uge1xuICAgIHAudGV4dCA9IHt2YWx1ZTogXCJBYmNcIn07XG4gIH1cblxuICBwLmZvbnQgPSB7dmFsdWU6IGUuZm9udChcImZhbWlseVwiKX07XG4gIHAuZm9udFdlaWdodCA9IHt2YWx1ZTogZS5mb250KFwid2VpZ2h0XCIpfTtcbiAgcC5mb250U3R5bGUgPSB7dmFsdWU6IGUuZm9udChcInN0eWxlXCIpfTtcbiAgcC5iYXNlbGluZSA9IHt2YWx1ZTogZS50ZXh0KFwiYmFzZWxpbmVcIil9O1xuXG4gIC8vIGFsaWduXG4gIGlmIChlLmhhcyhYKSkge1xuICAgIGlmIChlLmlzVHlwZShYLE8pKSB7XG4gICAgICBwLmFsaWduID0ge3ZhbHVlOiBcImxlZnRcIn07XG4gICAgICBwLmR4ID0ge3ZhbHVlOiBlLnRleHQoXCJtYXJnaW5cIil9O1xuICAgIH0gZWxzZSB7XG4gICAgICBwLmFsaWduID0ge3ZhbHVlOiBcImNlbnRlclwifVxuICAgIH1cbiAgfSBlbHNlIGlmIChlLmhhcyhZKSkge1xuICAgIHAuYWxpZ24gPSB7dmFsdWU6IFwibGVmdFwifTtcbiAgICBwLmR4ID0ge3ZhbHVlOiBlLnRleHQoXCJtYXJnaW5cIil9O1xuICB9IGVsc2Uge1xuICAgIHAuYWxpZ24gPSB7dmFsdWU6IGUudGV4dChcImFsaWduXCIpfTtcbiAgfVxuXG4gIHJldHVybiBwO1xufVxuIiwidmFyIGdsb2JhbHMgPSByZXF1aXJlKFwiLi9nbG9iYWxzXCIpLFxuICB1dGlsID0gcmVxdWlyZShcIi4vdXRpbFwiKTtcblxudmFyIHNjYWxlID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuc2NhbGUubmFtZXMgPSBmdW5jdGlvbiAocHJvcHMpIHtcbiAgcmV0dXJuIHV0aWwua2V5cyh1dGlsLmtleXMocHJvcHMpLnJlZHVjZShmdW5jdGlvbihhLCB4KSB7XG4gICAgaWYgKHByb3BzW3hdICYmIHByb3BzW3hdLnNjYWxlKSBhW3Byb3BzW3hdLnNjYWxlXSA9IDE7XG4gICAgcmV0dXJuIGE7XG4gIH0sIHt9KSk7XG59O1xuXG5zY2FsZS5kZWZzID0gZnVuY3Rpb24gKG5hbWVzLCBlbmNvZGluZywgb3B0KSB7XG4gIG9wdCA9IG9wdCB8fCB7fTtcblxuICByZXR1cm4gbmFtZXMucmVkdWNlKGZ1bmN0aW9uKGEsIG5hbWUpIHtcbiAgICB2YXIgcyA9IHtcbiAgICAgIG5hbWU6IG5hbWUsXG4gICAgICB0eXBlOiBzY2FsZS50eXBlKG5hbWUsIGVuY29kaW5nKSxcbiAgICAgIGRvbWFpbjogc2NhbGVfZG9tYWluKG5hbWUsIGVuY29kaW5nLCBvcHQpXG4gICAgfTtcbiAgICBpZiAocy50eXBlID09PSBcIm9yZGluYWxcIiAmJiAhZW5jb2RpbmcuYmluKG5hbWUpKSB7XG4gICAgICBzLnNvcnQgPSB0cnVlO1xuICAgIH1cblxuICAgIHNjYWxlX3JhbmdlKHMsIGVuY29kaW5nLCBvcHQpO1xuXG4gICAgcmV0dXJuIChhLnB1c2gocyksIGEpO1xuICB9LCBbXSk7XG59O1xuXG5zY2FsZS50eXBlID0gZnVuY3Rpb24gKG5hbWUsIGVuY29kaW5nKSB7XG4gIHZhciBmbjtcbiAgc3dpdGNoIChlbmNvZGluZy50eXBlKG5hbWUpKSB7XG4gICAgY2FzZSBPOiByZXR1cm4gXCJvcmRpbmFsXCI7XG4gICAgY2FzZSBUOlxuICAgICAgc3dpdGNoKGVuY29kaW5nLmZuKG5hbWUpKXtcbiAgICAgICAgY2FzZSBcInNlY29uZFwiOlxuICAgICAgICBjYXNlIFwibWludXRlXCI6XG4gICAgICAgIGNhc2UgXCJob3VyXCI6XG4gICAgICAgIGNhc2UgXCJkYXlcIjpcbiAgICAgICAgY2FzZSBcImRhdGVcIjpcbiAgICAgICAgY2FzZSBcIm1vbnRoXCI6XG4gICAgICAgICAgcmV0dXJuIFwib3JkaW5hbFwiO1xuICAgICAgICBjYXNlIFwieWVhclwiOlxuICAgICAgICAgIHJldHVybiBcImxpbmVhclwiO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFwidGltZVwiO1xuICAgIGNhc2UgUTpcbiAgICAgIGlmIChlbmNvZGluZy5iaW4obmFtZSkpIHtcbiAgICAgICAgcmV0dXJuIFwib3JkaW5hbFwiO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGVuY29kaW5nLnNjYWxlKG5hbWUpLnR5cGU7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIHNjYWxlX2RvbWFpbihuYW1lLCBlbmNvZGluZywgb3B0KSB7XG4gIGlmIChlbmNvZGluZy50eXBlKG5hbWUpID09PSBUKXtcbiAgICBzd2l0Y2goZW5jb2RpbmcuZm4obmFtZSkpe1xuICAgICAgY2FzZSBcInNlY29uZFwiOlxuICAgICAgY2FzZSBcIm1pbnV0ZVwiOiAgcmV0dXJuIHV0aWwucmFuZ2UoMCwgNjApO1xuICAgICAgY2FzZSBcImhvdXJcIjogICAgcmV0dXJuIHV0aWwucmFuZ2UoMCwgMjQpO1xuICAgICAgY2FzZSBcImRheVwiOiAgICAgcmV0dXJuIHV0aWwucmFuZ2UoMCwgNyk7XG4gICAgICBjYXNlIFwiZGF0ZVwiOiAgICByZXR1cm4gdXRpbC5yYW5nZSgwLCAzMik7XG4gICAgICBjYXNlIFwibW9udGhcIjogICByZXR1cm4gdXRpbC5yYW5nZSgwLCAxMik7XG4gICAgfVxuICB9XG5cbiAgaWYgKGVuY29kaW5nLmJpbihuYW1lKSkge1xuICAgIC8vIFRPRE86IGFkZCBpbmNsdWRlRW1wdHlDb25maWcgaGVyZVxuICAgIGlmIChvcHQuc3RhdHMpIHtcbiAgICAgIHZhciBiaW5zID0gdXRpbC5nZXRiaW5zKG9wdC5zdGF0c1tlbmNvZGluZy5maWVsZE5hbWUobmFtZSldKTtcbiAgICAgIHZhciBkb21haW4gPSB1dGlsLnJhbmdlKGJpbnMuc3RhcnQsIGJpbnMuc3RvcCwgYmlucy5zdGVwKTtcbiAgICAgIHJldHVybiBuYW1lPT09WSA/IGRvbWFpbi5yZXZlcnNlKCkgOiBkb21haW47XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5hbWUgPT0gb3B0LnN0YWNrID9cbiAgICB7XG4gICAgICBkYXRhOiBTVEFDS0VELFxuICAgICAgZmllbGQ6IFwiZGF0YS5cIiArIChvcHQuZmFjZXQgPyBcIm1heF9cIiA6XCJcIikgKyBcInN1bV9cIiArIGVuY29kaW5nLmZpZWxkKG5hbWUsIHRydWUpXG4gICAgfTpcbiAgICB7ZGF0YTogVEFCTEUsIGZpZWxkOiBlbmNvZGluZy5maWVsZChuYW1lKX07XG59XG5cbmZ1bmN0aW9uIHNjYWxlX3JhbmdlKHMsIGVuY29kaW5nLCBvcHQpIHtcbiAgdmFyIHNwZWMgPSBlbmNvZGluZy5zY2FsZShzLm5hbWUpO1xuICBzd2l0Y2ggKHMubmFtZSkge1xuICAgIGNhc2UgWDpcbiAgICAgIGlmIChzLnR5cGU9PT1cIm9yZGluYWxcIikge1xuICAgICAgICBzLmJhbmRXaWR0aCA9IGVuY29kaW5nLmJhbmQoWCkuc2l6ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHMucmFuZ2UgPSBvcHQuY2VsbFdpZHRoID8gWzAsIG9wdC5jZWxsV2lkdGhdIDogXCJ3aWR0aFwiO1xuICAgICAgICBzLnplcm8gPSBzcGVjLnplcm87XG4gICAgICAgIHMucmV2ZXJzZSA9IHNwZWMucmV2ZXJzZTtcbiAgICAgIH1cbiAgICAgIHMucm91bmQgPSB0cnVlO1xuICAgICAgaWYgKHMudHlwZT09PVwidGltZVwiKXtcbiAgICAgICAgcy5uaWNlID0gZW5jb2RpbmcuZm4ocy5uYW1lKTtcbiAgICAgIH1lbHNle1xuICAgICAgICBzLm5pY2UgPSB0cnVlO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSBZOlxuICAgICAgaWYgKHMudHlwZT09PVwib3JkaW5hbFwiKSB7XG4gICAgICAgIHMuYmFuZFdpZHRoID0gZW5jb2RpbmcuYmFuZChZKS5zaXplO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcy5yYW5nZSA9IG9wdC5jZWxsSGVpZ2h0ID8gW29wdC5jZWxsSGVpZ2h0LCAwXSA6IFwiaGVpZ2h0XCI7XG4gICAgICAgIHMuemVybyA9IHNwZWMuemVybztcbiAgICAgICAgcy5yZXZlcnNlID0gc3BlYy5yZXZlcnNlO1xuICAgICAgfVxuXG4gICAgICBzLnJvdW5kID0gdHJ1ZTtcblxuICAgICAgaWYgKHMudHlwZT09PVwidGltZVwiKXtcbiAgICAgICAgcy5uaWNlID0gZW5jb2RpbmcuZm4ocy5uYW1lKSB8fCBlbmNvZGluZy5jb25maWcoXCJ0aW1lU2NhbGVOaWNlXCIpO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHMubmljZSA9IHRydWU7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlIFJPVzogLy8gc3VwcG9ydCBvbmx5IG9yZGluYWxcbiAgICAgIHMuYmFuZFdpZHRoID0gb3B0LmNlbGxIZWlnaHQgfHwgZW5jb2RpbmcuY29uZmlnKFwiY2VsbEhlaWdodFwiKTtcbiAgICAgIHMucm91bmQgPSB0cnVlO1xuICAgICAgcy5uaWNlID0gdHJ1ZTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgQ09MOiAvLyBzdXBwb3J0IG9ubHkgb3JkaW5hbFxuICAgICAgcy5iYW5kV2lkdGggPSBvcHQuY2VsbFdpZHRoIHx8IGVuY29kaW5nLmNvbmZpZyhcImNlbGxXaWR0aFwiKTtcbiAgICAgIHMucm91bmQgPSB0cnVlO1xuICAgICAgcy5uaWNlID0gdHJ1ZTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgU0laRTpcbiAgICAgIGlmIChlbmNvZGluZy5pcyhcImJhclwiKSkge1xuICAgICAgICBzLnJhbmdlID0gWzMsIE1hdGgubWF4KGVuY29kaW5nLmJhbmQoWCkuc2l6ZSwgZW5jb2RpbmcuYmFuZChZKS5zaXplKV07XG4gICAgICB9IGVsc2UgaWYgKGVuY29kaW5nLmlzKFRFWFQpKSB7XG4gICAgICAgIHMucmFuZ2UgPSBbOCwgNDBdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcy5yYW5nZSA9IFsxMCwgMTAwMF07XG4gICAgICB9XG4gICAgICBzLnJvdW5kID0gdHJ1ZTtcbiAgICAgIHMuemVybyA9IGZhbHNlO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBTSEFQRTpcbiAgICAgIHMucmFuZ2UgPSBcInNoYXBlc1wiO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBDT0xPUjpcbiAgICAgIGlmIChzLnR5cGUgPT09IFwib3JkaW5hbFwiKSB7XG4gICAgICAgIHMucmFuZ2UgPSBcImNhdGVnb3J5MTBcIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHMucmFuZ2UgPSBbXCIjZGRmXCIsIFwic3RlZWxibHVlXCJdO1xuICAgICAgICBzLnplcm8gPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgQUxQSEE6XG4gICAgICBzLnJhbmdlID0gWzAuMiwgMS4wXTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIGVuY29kaW5nIG5hbWU6IFwiK3MubmFtZSk7XG4gIH1cblxuICBzd2l0Y2gocy5uYW1lKXtcbiAgICBjYXNlIFJPVzpcbiAgICBjYXNlIENPTDpcbiAgICAgIHMucGFkZGluZyA9IGVuY29kaW5nLmNvbmZpZyhcImNlbGxQYWRkaW5nXCIpO1xuICAgICAgcy5vdXRlclBhZGRpbmcgPSAwO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBYOlxuICAgIGNhc2UgWTpcbiAgICAgIGlmIChzLnR5cGUgPT09IFwib3JkaW5hbFwiKSB7IC8vJiYgIXMuYmFuZFdpZHRoXG4gICAgICAgIHMucG9pbnRzID0gdHJ1ZTtcbiAgICAgICAgcy5wYWRkaW5nID0gZW5jb2RpbmcuY29uZmlnKFwiYmFuZFBhZGRpbmdcIik7XG4gICAgICB9XG4gIH1cbn1cbiIsIi8vIFBhY2thZ2Ugb2YgZGVmaW5pbmcgVmVnYWxpdGUgU3BlY2lmaWNhdGlvbidzIGpzb24gc2NoZW1hXG4vL1xudmFyIHNjaGVtYSA9IG1vZHVsZS5leHBvcnRzID0ge30sXG4gIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxuc2NoZW1hLnV0aWwgPSByZXF1aXJlKCcuL3NjaGVtYXV0aWwnKTtcblxuc2NoZW1hLm1hcmt0eXBlID0ge1xuICB0eXBlOiBcInN0cmluZ1wiLFxuICBlbnVtOiBbXCJwb2ludFwiLCBcImJhclwiLCBcImxpbmVcIiwgXCJhcmVhXCIsIFwiY2lyY2xlXCIsIFwic3F1YXJlXCIsIFwidGV4dFwiXVxufTtcblxuc2NoZW1hLmFnZ3IgPSB7XG4gIHR5cGU6IFwic3RyaW5nXCIsXG4gIGVudW06IFtcImF2Z1wiLCBcInN1bVwiLCBcIm1pblwiLCBcIm1heFwiLCBcImNvdW50XCJdLFxuICBzdXBwb3J0ZWRFbnVtczoge1xuICAgIFE6IFtcImF2Z1wiLCBcInN1bVwiLCBcIm1pblwiLCBcIm1heFwiLCBcImNvdW50XCJdLFxuICAgIE86IFtcImNvdW50XCJdLFxuICAgIFQ6IFtcImF2Z1wiLCBcIm1pblwiLCBcIm1heFwiLCBcImNvdW50XCJdLFxuICAgIFwiXCI6IFtcImNvdW50XCJdLFxuICB9LFxuICBzdXBwb3J0ZWRUeXBlczoge1wiUVwiOiB0cnVlLCBcIk9cIjogdHJ1ZSwgXCJUXCI6IHRydWUsIFwiXCI6IHRydWV9XG59O1xuXG5zY2hlbWEudGltZWZucyA9IFtcIm1vbnRoXCIsIFwieWVhclwiLCBcImRheVwiLCBcImRhdGVcIiwgXCJob3VyXCIsIFwibWludXRlXCIsIFwic2Vjb25kXCJdO1xuXG5zY2hlbWEuZm4gPSB7XG4gIHR5cGU6IFwic3RyaW5nXCIsXG4gIGVudW06IHNjaGVtYS50aW1lZm5zLFxuICBzdXBwb3J0ZWRUeXBlczoge1wiVFwiOiB0cnVlfVxufVxuXG4vL1RPRE8oa2FuaXR3KTogYWRkIG90aGVyIHR5cGUgb2YgZnVuY3Rpb24gaGVyZVxuXG5zY2hlbWEuc2NhbGVfdHlwZSA9IHtcbiAgdHlwZTogXCJzdHJpbmdcIixcbiAgZW51bTogW1wibGluZWFyXCIsIFwibG9nXCIsXCJwb3dcIiwgXCJzcXJ0XCIsIFwicXVhbnRpbGVcIl0sXG4gIGRlZmF1bHQ6IFwibGluZWFyXCIsXG4gIHN1cHBvcnRlZFR5cGVzOiB7XCJRXCI6IHRydWV9XG59O1xuXG5zY2hlbWEuZmllbGQgPSB7XG4gIHR5cGU6IFwib2JqZWN0XCIsXG4gIHByb3BlcnRpZXM6IHtcbiAgICBuYW1lOiB7XG4gICAgICB0eXBlOiBcInN0cmluZ1wiXG4gICAgfVxuICB9XG59O1xuXG52YXIgY2xvbmUgPSB1dGlsLmR1cGxpY2F0ZTtcbnZhciBtZXJnZSA9IHNjaGVtYS51dGlsLm1lcmdlO1xuXG52YXIgdHlwaWNhbEZpZWxkID0gbWVyZ2UoY2xvbmUoc2NoZW1hLmZpZWxkKSwge1xuICB0eXBlOiBcIm9iamVjdFwiLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgdHlwZToge1xuICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgIGVudW06IFtcIk9cIiwgXCJRXCIsIFwiVFwiXVxuICAgIH0sXG4gICAgYmluOiB7XG4gICAgICB0eXBlOiBcImJvb2xlYW5cIixcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgc3VwcG9ydGVkVHlwZXM6IHtcIlFcIjogdHJ1ZSwgXCJPXCI6IHRydWV9XG4gICAgfSxcbiAgICBhZ2dyOiBzY2hlbWEuYWdncixcbiAgICBmbjogc2NoZW1hLmZuLFxuICAgIHNjYWxlOiB7XG4gICAgICB0eXBlOiBcIm9iamVjdFwiLFxuICAgICAgcHJvcGVydGllczoge1xuICAgICAgICB0eXBlOiBzY2hlbWEuc2NhbGVfdHlwZSxcbiAgICAgICAgcmV2ZXJzZTogeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdDogZmFsc2UgfSxcbiAgICAgICAgemVybzoge1xuICAgICAgICAgIHR5cGU6IFwiYm9vbGVhblwiLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkluY2x1ZGUgemVyb1wiLFxuICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgIHN1cHBvcnRlZFR5cGVzOiB7XCJRXCI6IHRydWV9XG4gICAgICAgIH0sXG4gICAgICAgIG5pY2U6IHtcbiAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgIGVudW06IFtcInNlY29uZFwiLCBcIm1pbnV0ZVwiLCBcImhvdXJcIiwgXCJkYXlcIiwgXCJ3ZWVrXCIsIFwibW9udGhcIiwgXCJ5ZWFyXCJdLFxuICAgICAgICAgIHN1cHBvcnRlZFR5cGVzOiB7XCJUXCI6IHRydWV9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pO1xuXG52YXIgb25seU9yZGluYWxGaWVsZCA9IG1lcmdlKGNsb25lKHNjaGVtYS5maWVsZCksIHtcbiAgdHlwZTogXCJvYmplY3RcIixcbiAgcHJvcGVydGllczoge1xuICAgIHR5cGU6IHtcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICBlbnVtOiBbXCJPXCJdXG4gICAgfSxcbiAgICBiaW46IHtcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICBzdXBwb3J0ZWRUeXBlczoge1wiT1wiOiB0cnVlfVxuICAgIH0sXG4gICAgYWdncjoge1xuICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgIGVudW06IFtcImNvdW50XCJdLFxuICAgICAgc3VwcG9ydGVkVHlwZXM6IHtcIk9cIjogdHJ1ZX1cbiAgICB9XG4gIH1cbn0pO1xuXG52YXIgYXhpc01peGluID0ge1xuICB0eXBlOiBcIm9iamVjdFwiLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgYXhpczoge1xuICAgICAgdHlwZTogXCJvYmplY3RcIixcbiAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgZ3JpZDogeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdDogZmFsc2UgfSxcbiAgICAgICAgdGl0bGU6IHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHQ6IHRydWUgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG52YXIgYmFuZE1peGluID0ge1xuICB0eXBlOiBcIm9iamVjdFwiLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgYmFuZDoge1xuICAgICAgdHlwZTogXCJvYmplY3RcIixcbiAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgc2l6ZToge1xuICAgICAgICAgIHR5cGU6IFwiaW50ZWdlclwiLFxuICAgICAgICAgIG1pbmltdW06IDAsXG4gICAgICAgICAgZGVmYXVsdDogMjFcbiAgICAgICAgfSxcbiAgICAgICAgcGFkZGluZzoge1xuICAgICAgICAgIHR5cGU6IFwiaW50ZWdlclwiLFxuICAgICAgICAgIG1pbmltdW06IDAsXG4gICAgICAgICAgZGVmYXVsdDogMVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbnZhciBsZWdlbmRNaXhpbiA9IHtcbiAgdHlwZTogXCJvYmplY3RcIixcbiAgcHJvcGVydGllczoge1xuICAgIGxlZ2VuZDogeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdDogdHJ1ZSB9XG4gIH1cbn1cblxudmFyIHRleHRNaXhpbiA9IHtcbiAgdHlwZTogXCJvYmplY3RcIixcbiAgcHJvcGVydGllczoge1xuICAgIHRleHQ6IHtcbiAgICAgIHR5cGU6IFwib2JqZWN0XCIsXG4gICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIHRleHQ6IHtcbiAgICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxuICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIGNvbG9yOiB7XG4gICAgICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgICAgIGRlZmF1bHQ6IFwiYmxhY2tcIlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGFsaWduOiB7XG4gICAgICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgICAgIGRlZmF1bHQ6IFwibGVmdFwiXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYmFzZWxpbmU6IHtcbiAgICAgICAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgICAgICAgZGVmYXVsdDogXCJtaWRkbGVcIlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1hcmdpbjoge1xuICAgICAgICAgICAgICB0eXBlOiBcImludGVnZXJcIixcbiAgICAgICAgICAgICAgZGVmYXVsdDogNCxcbiAgICAgICAgICAgICAgbWluaW11bTogMFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZm9udDoge1xuICAgICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXG4gICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgd2VpZ2h0OiB7XG4gICAgICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgICAgIGVudW06IFtcIm5vcm1hbFwiLCBcImJvbGRcIl0sXG4gICAgICAgICAgICAgIGRlZmF1bHQ6IFwibm9ybWFsXCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzaXplOiB7XG4gICAgICAgICAgICAgIHR5cGU6IFwiaW50ZWdlclwiLFxuICAgICAgICAgICAgICBkZWZhdWx0OiAxMCxcbiAgICAgICAgICAgICAgbWluaW11bTogMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZhbWlseToge1xuICAgICAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgICAgICBkZWZhdWx0OiBcIkhlbHZldGljYSBOZXVlXCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgICAgICBkZWZhdWx0OiBcIm5vcm1hbFwiLFxuICAgICAgICAgICAgICBlbnVtOiBbXCJub3JtYWxcIiwgXCJpdGFsaWNcIl1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxudmFyIHNpemVNaXhpbiA9IHtcbiAgdHlwZTogXCJvYmplY3RcIixcbiAgcHJvcGVydGllczoge1xuICAgIHZhbHVlIDoge1xuICAgICAgdHlwZTogXCJpbnRlZ2VyXCIsXG4gICAgICBkZWZhdWx0OiAxMCxcbiAgICAgIG1pbmltdW06IDBcbiAgICB9XG4gIH1cbn1cblxudmFyIGNvbG9yTWl4aW4gPSB7XG4gIHR5cGU6IFwib2JqZWN0XCIsXG4gIHByb3BlcnRpZXM6IHtcbiAgICB2YWx1ZSA6IHtcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICBkZWZhdWx0OiBcInN0ZWVsYmx1ZVwiXG4gICAgfVxuICB9XG59XG5cbnZhciBhbHBoYU1peGluID0ge1xuICB0eXBlOiBcIm9iamVjdFwiLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgdmFsdWU6IHtcbiAgICAgIHR5cGU6IFwibnVtYmVyXCIsXG4gICAgICBkZWZhdWx0OiAxLFxuICAgICAgbWluaW11bTogMCxcbiAgICAgIG1heGltdW06IDFcbiAgICB9XG4gIH1cbn1cblxudmFyIHNoYXBlTWl4aW4gPSB7XG4gIHR5cGU6IFwib2JqZWN0XCIsXG4gIHByb3BlcnRpZXM6IHtcbiAgICB2YWx1ZSA6IHtcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICBlbnVtOiBbXCJjaXJjbGVcIiwgXCJzcXVhcmVcIiwgXCJjcm9zc1wiLCBcImRpYW1vbmRcIiwgXCJ0cmlhbmdsZS11cFwiLCBcInRyaWFuZ2xlLWRvd25cIl0sXG4gICAgICBkZWZhdWx0OiBcImNpcmNsZVwiXG4gICAgfVxuICB9XG59XG5cbnZhciByZXF1aXJlZE5hbWVUeXBlID0ge1xuICByZXF1aXJlZDogW1wibmFtZVwiLCBcInR5cGVcIl1cbn1cblxudmFyIHggPSBtZXJnZShtZXJnZShtZXJnZShjbG9uZSh0eXBpY2FsRmllbGQpLCBheGlzTWl4aW4pLCBiYW5kTWl4aW4pLCByZXF1aXJlZE5hbWVUeXBlKTtcbnZhciB5ID0gY2xvbmUoeCk7XG5cbnZhciByb3cgPSBtZXJnZShjbG9uZShvbmx5T3JkaW5hbEZpZWxkKSwgcmVxdWlyZWROYW1lVHlwZSk7XG52YXIgY29sID0gY2xvbmUocm93KTtcblxudmFyIHNpemUgPSBtZXJnZShtZXJnZShjbG9uZSh0eXBpY2FsRmllbGQpLCBsZWdlbmRNaXhpbiksIHNpemVNaXhpbik7XG52YXIgY29sb3IgPSBtZXJnZShtZXJnZShjbG9uZSh0eXBpY2FsRmllbGQpLCBsZWdlbmRNaXhpbiksIGNvbG9yTWl4aW4pO1xudmFyIGFscGhhID0gbWVyZ2UoY2xvbmUodHlwaWNhbEZpZWxkKSwgYWxwaGFNaXhpbik7XG52YXIgc2hhcGUgPSBtZXJnZShtZXJnZShjbG9uZShvbmx5T3JkaW5hbEZpZWxkKSwgbGVnZW5kTWl4aW4pLCBzaGFwZU1peGluKTtcblxudmFyIHRleHQgPSBtZXJnZShjbG9uZSh0eXBpY2FsRmllbGQpLCB0ZXh0TWl4aW4pO1xuXG52YXIgY2ZnID0ge1xuICB0eXBlOiBcIm9iamVjdFwiLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgLy8gdGVtcGxhdGVcbiAgICB3aWR0aDoge1xuICAgICAgdHlwZTogXCJpbnRlZ2VyXCIsXG4gICAgICBkZWZhdWx0OiB1bmRlZmluZWRcbiAgICB9LFxuICAgIGhlaWdodDoge1xuICAgICAgdHlwZTogXCJpbnRlZ2VyXCIsXG4gICAgICBkZWZhdWx0OiB1bmRlZmluZWRcbiAgICB9LFxuICAgIHZpZXdwb3J0OiB7XG4gICAgICB0eXBlOiBcImFycmF5XCIsXG4gICAgICBpdGVtczoge1xuICAgICAgICB0eXBlOiBbXCJpbnRlZ2VyXCJdXG4gICAgICB9LFxuICAgICAgZGVmYXVsdDogdW5kZWZpbmVkXG4gICAgfSxcbiAgICBfbWluV2lkdGg6IHtcbiAgICAgIHR5cGU6IFwiaW50ZWdlclwiLFxuICAgICAgZGVmYXVsdDogMjAsXG4gICAgICBtaW5pbXVtOiAwXG4gICAgfSxcbiAgICBfbWluSGVpZ2h0OiB7XG4gICAgICB0eXBlOiBcImludGVnZXJcIixcbiAgICAgIGRlZmF1bHQ6IDIwLFxuICAgICAgbWluaW11bTogMFxuICAgIH0sXG5cbiAgICAvLyBkYXRhIHNvdXJjZVxuICAgIGRhdGFGb3JtYXRUeXBlOiB7XG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgZW51bTogW1wianNvblwiLCBcImNzdlwiXSxcbiAgICAgIGRlZmF1bHQ6IFwianNvblwiXG4gICAgfSxcbiAgICB1c2VWZWdhU2VydmVyOiB7XG4gICAgICB0eXBlOiBcImJvb2xlYW5cIixcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgfSxcbiAgICBkYXRhVXJsOiB7XG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgZGVmYXVsdDogdW5kZWZpbmVkXG4gICAgfSxcbiAgICB2ZWdhU2VydmVyVGFibGU6IHtcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICBkZWZhdWx0OiB1bmRlZmluZWRcbiAgICB9LFxuICAgIHZlZ2FTZXJ2ZXJVcmw6IHtcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICBkZWZhdWx0OiBcImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMVwiXG4gICAgfVxuICB9XG59XG5cbi8qKiBAdHlwZSBPYmplY3QgU2NoZW1hIG9mIGEgdmVnYWxpdGUgc3BlY2lmaWNhdGlvbiAqL1xuc2NoZW1hLnNjaGVtYSA9IHtcbiAgJHNjaGVtYTogXCJodHRwOi8vanNvbi1zY2hlbWEub3JnL2RyYWZ0LTA0L3NjaGVtYSNcIixcbiAgdHlwZTogXCJvYmplY3RcIixcbiAgcmVxdWlyZWQ6IFtcIm1hcmt0eXBlXCIsIFwiZW5jXCIsIFwiY2ZnXCJdLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgbWFya3R5cGU6IHNjaGVtYS5tYXJrdHlwZSxcbiAgICBlbmM6IHtcbiAgICAgIHR5cGU6IFwib2JqZWN0XCIsXG4gICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIHg6IHgsXG4gICAgICAgIHk6IHksXG4gICAgICAgIHJvdzogcm93LFxuICAgICAgICBjb2w6IGNvbCxcbiAgICAgICAgc2l6ZTogc2l6ZSxcbiAgICAgICAgY29sb3I6IGNvbG9yLFxuICAgICAgICBhbHBoYTogYWxwaGEsXG4gICAgICAgIHNoYXBlOiBzaGFwZSxcbiAgICAgICAgdGV4dDogdGV4dFxuICAgICAgfVxuICAgIH0sXG4gICAgY2ZnOiBjZmdcbiAgfVxufTtcblxuLyoqIEluc3RhbnRpYXRlIGEgdmVyYm9zZSB2bCBzcGVjIGZyb20gdGhlIHNjaGVtYSAqL1xuc2NoZW1hLmluc3RhbnRpYXRlID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHNjaGVtYS51dGlsLmluc3RhbnRpYXRlKHNjaGVtYS5zY2hlbWEpO1xufVxuIiwidmFyIHV0aWwgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG52YXIgaXNFbXB0eSA9IGZ1bmN0aW9uKG9iaikge1xuICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5sZW5ndGggPT09IDBcbn1cblxuLy8gaW5zdGFudGlhdGUgYSBzY2hlbWFcbnV0aWwuaW5zdGFudGlhdGUgPSBmdW5jdGlvbihzY2hlbWEsIHJlcXVpcmVkKSB7XG4gIGlmIChzY2hlbWEudHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICB2YXIgcmVxdWlyZWQgPSBzY2hlbWEucmVxdWlyZWQgPyBzY2hlbWEucmVxdWlyZWQgOiBbXTtcbiAgICB2YXIgaW5zdGFuY2UgPSB7fTtcbiAgICBmb3IgKHZhciBuYW1lIGluIHNjaGVtYS5wcm9wZXJ0aWVzKSB7XG4gICAgICB2YXIgY2hpbGQgPSBzY2hlbWEucHJvcGVydGllc1tuYW1lXTtcbiAgICAgIGluc3RhbmNlW25hbWVdID0gdXRpbC5pbnN0YW50aWF0ZShjaGlsZCwgcmVxdWlyZWQuaW5kZXhPZihuYW1lKSAhPSAtMSk7XG4gICAgfTtcbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH0gZWxzZSBpZiAoJ2RlZmF1bHQnIGluIHNjaGVtYSkge1xuICAgIHJldHVybiBzY2hlbWEuZGVmYXVsdDtcbiAgfSBlbHNlIGlmIChzY2hlbWEuZW51bSAmJiByZXF1aXJlZCkge1xuICAgIHJldHVybiBzY2hlbWEuZW51bVswXTtcbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufTtcblxuLy8gcmVtb3ZlIGFsbCBkZWZhdWx0cyBmcm9tIGFuIGluc3RhbmNlXG51dGlsLnN1YnRyYWN0ID0gZnVuY3Rpb24oZGVmYXVsdHMsIGluc3RhbmNlKSB7XG4gIHZhciBjaGFuZ2VzID0ge307XG4gIGZvciAodmFyIHByb3AgaW4gaW5zdGFuY2UpIHtcbiAgICBpZiAoIWRlZmF1bHRzIHx8IGRlZmF1bHRzW3Byb3BdICE9PSBpbnN0YW5jZVtwcm9wXSkge1xuICAgICAgaWYgKHR5cGVvZiBpbnN0YW5jZVtwcm9wXSA9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHZhciBjID0gdXRpbC5zdWJ0cmFjdChkZWZhdWx0c1twcm9wXSwgaW5zdGFuY2VbcHJvcF0pO1xuICAgICAgICBpZiAoIWlzRW1wdHkoYykpXG4gICAgICAgICAgY2hhbmdlc1twcm9wXSA9IGM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjaGFuZ2VzW3Byb3BdID0gaW5zdGFuY2VbcHJvcF07XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBjaGFuZ2VzO1xufTtcblxuLy8gcmVjdXJzaXZlbHkgbWVyZ2VzIGluc3RhbmNlIGludG8gZGVmYXVsdHNcbnV0aWwubWVyZ2UgPSBmdW5jdGlvbiAoZGVmYXVsdHMsIGluc3RhbmNlKSB7XG4gIGlmICh0eXBlb2YgaW5zdGFuY2UhPT0nb2JqZWN0JyB8fCBpbnN0YW5jZT09PW51bGwpIHtcbiAgICByZXR1cm4gZGVmYXVsdHM7XG4gIH1cblxuICBmb3IgKHZhciBwIGluIGluc3RhbmNlKSB7XG4gICAgaWYgKCFpbnN0YW5jZS5oYXNPd25Qcm9wZXJ0eShwKSlcbiAgICAgIGNvbnRpbnVlO1xuICAgIGlmIChpbnN0YW5jZVtwXT09PXVuZGVmaW5lZCApXG4gICAgICBjb250aW51ZTtcbiAgICBpZiAodHlwZW9mIGluc3RhbmNlW3BdICE9PSAnb2JqZWN0JyB8fCBpbnN0YW5jZVtwXSA9PT0gbnVsbCkge1xuICAgICAgZGVmYXVsdHNbcF0gPSBpbnN0YW5jZVtwXTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZhdWx0c1twXSAhPT0gJ29iamVjdCcgfHwgZGVmYXVsdHNbcF0gPT09IG51bGwpIHtcbiAgICAgIGRlZmF1bHRzW3BdID0gdXRpbC5tZXJnZShpbnN0YW5jZVtwXS5jb25zdHJ1Y3RvciA9PT0gQXJyYXkgPyBbXSA6IHt9LCBpbnN0YW5jZVtwXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHV0aWwubWVyZ2UoZGVmYXVsdHNbcF0sIGluc3RhbmNlW3BdKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlZmF1bHRzO1xufVxuIiwidmFyIGdsb2JhbHMgPSByZXF1aXJlKCcuL2dsb2JhbHMnKSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRpbWU7XG5cbmZ1bmN0aW9uIHRpbWUoc3BlYywgZW5jb2RpbmcsIG9wdCl7XG4gIHZhciB0aW1lRmllbGRzID0ge30sIHRpbWVGbiA9IHt9O1xuXG4gIC8vIGZpbmQgdW5pcXVlIGZvcm11bGEgdHJhbnNmb3JtYXRpb24gYW5kIGJpbiBmdW5jdGlvblxuICBlbmNvZGluZy5mb3JFYWNoKGZ1bmN0aW9uKGVuY1R5cGUsIGZpZWxkKXtcbiAgICBpZihmaWVsZC50eXBlID09PSBUICYmIGZpZWxkLmZuKXtcbiAgICAgIHRpbWVGaWVsZHNbZW5jb2RpbmcuZmllbGQoZW5jVHlwZSldID0ge1xuICAgICAgICBmaWVsZDogZmllbGQsXG4gICAgICAgIGVuY1R5cGU6IGVuY1R5cGVcbiAgICAgIH07XG4gICAgICB0aW1lRm5bZmllbGQuZm5dID0gdHJ1ZTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIGFkZCBmb3JtdWxhIHRyYW5zZm9ybVxuICB2YXIgZGF0YSA9IHNwZWMuZGF0YVswXSxcbiAgICB0cmFuc2Zvcm0gPSBkYXRhLnRyYW5zZm9ybSA9IGRhdGEudHJhbnNmb3JtIHx8IFtdO1xuXG4gIGZvciAodmFyIGYgaW4gdGltZUZpZWxkcykge1xuICAgIHZhciB0ZiA9IHRpbWVGaWVsZHNbZl07XG4gICAgdGltZS50cmFuc2Zvcm0odHJhbnNmb3JtLCBlbmNvZGluZywgdGYuZW5jVHlwZSwgdGYuZmllbGQpO1xuICB9XG5cbiAgLy8gYWRkIHNjYWxlc1xuICB2YXIgc2NhbGVzID0gc3BlYy5zY2FsZXMgPSBzcGVjLnNjYWxlcyB8fCBbXTtcbiAgZm9yICh2YXIgZm4gaW4gdGltZUZuKSB7XG4gICAgdGltZS5zY2FsZShzY2FsZXMsIGZuLCBlbmNvZGluZyk7XG4gIH1cbiAgcmV0dXJuIHNwZWM7XG59XG5cbi8qKlxuICogQHJldHVybiB7U3RyaW5nfSBkYXRlIGJpbm5pbmcgZm9ybXVsYSBvZiB0aGUgZ2l2ZW4gZmllbGRcbiAqL1xudGltZS5mb3JtdWxhID0gZnVuY3Rpb24gKGZpZWxkKSB7XG4gIHZhciBkYXRlID0gXCJuZXcgRGF0ZShkLmRhdGEuXCIrZmllbGQubmFtZStcIilcIjtcbiAgc3dpdGNoKGZpZWxkLmZuKXtcbiAgICBjYXNlIFwic2Vjb25kXCI6ICByZXR1cm4gZGF0ZSArIFwiLmdldFVUQ1NlY29uZHMoKVwiO1xuICAgIGNhc2UgXCJtaW51dGVcIjogIHJldHVybiBkYXRlICsgXCIuZ2V0VVRDTWludXRlcygpXCI7XG4gICAgY2FzZSBcImhvdXJcIjogICAgcmV0dXJuIGRhdGUgKyBcIi5nZXRVVENIb3VycygpXCI7XG4gICAgY2FzZSBcImRheVwiOiAgICAgcmV0dXJuIGRhdGUgKyBcIi5nZXRVVENEYXkoKVwiO1xuICAgIGNhc2UgXCJkYXRlXCI6ICAgIHJldHVybiBkYXRlICsgXCIuZ2V0VVRDRGF0ZSgpXCI7XG4gICAgY2FzZSBcIm1vbnRoXCI6ICAgcmV0dXJuIGRhdGUgKyBcIi5nZXRVVENNb250aCgpXCI7XG4gICAgY2FzZSBcInllYXJcIjogICAgcmV0dXJuIGRhdGUgKyBcIi5nZXRVVENGdWxsWWVhcigpXCI7XG4gIH1cbiAgLy8gVE9ETyBhZGQgY29udGludW91cyBiaW5uaW5nXG4gIGNvbnNvbGUuZXJyb3IoXCJubyBmdW5jdGlvbiBzcGVjaWZpZWQgZm9yIGRhdGVcIik7XG59O1xuXG4vKiogYWRkIGZvcm11bGEgdHJhbnNmb3JtcyB0byBkYXRhICovXG50aW1lLnRyYW5zZm9ybSA9IGZ1bmN0aW9uICh0cmFuc2Zvcm0sIGVuY29kaW5nLCBlbmNUeXBlLCBmaWVsZCkge1xuICB0cmFuc2Zvcm0ucHVzaCh7XG4gICAgdHlwZTogXCJmb3JtdWxhXCIsXG4gICAgZmllbGQ6IGVuY29kaW5nLmZpZWxkKGVuY1R5cGUpLFxuICAgIGV4cHI6IHRpbWUuZm9ybXVsYShmaWVsZClcbiAgfSk7XG59O1xuXG50aW1lLnNjYWxlID0gZnVuY3Rpb24gKHNjYWxlcywgZm4sIGVuY29kaW5nKSB7XG4gIHZhciBsYWJlbExlbmd0aCA9IGVuY29kaW5nLmNvbmZpZyhcInRpbWVTY2FsZUxhYmVsTGVuZ3RoXCIpO1xuICAvLyBUT0RPIGFkZCBvcHRpb24gZm9yIHNob3J0ZXIgc2NhbGUgLyBjdXN0b20gcmFuZ2VcbiAgc3dpdGNoKGZuKXtcbiAgICBjYXNlIFwiZGF5XCI6XG4gICAgICBzY2FsZXMucHVzaCh7XG4gICAgICAgIG5hbWU6IFwidGltZS1kYXlcIixcbiAgICAgICAgdHlwZTogXCJvcmRpbmFsXCIsXG4gICAgICAgIGRvbWFpbjogdXRpbC5yYW5nZSgwLDcpLFxuICAgICAgICByYW5nZTogW1wiTW9uZGF5XCIsIFwiVHVlc2RheVwiLCBcIldlZG5lc2RheVwiLCBcIlRodXJzZGF5XCIsIFwiRnJpZGF5XCIsIFwiU2F0dXJkYXlcIiwgXCJTdW5kYXlcIl0ubWFwKFxuICAgICAgICAgIGZ1bmN0aW9uKHMpeyByZXR1cm4gcy5zdWJzdHIoMCwgbGFiZWxMZW5ndGgpO31cbiAgICAgICAgKVxuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwibW9udGhcIjpcbiAgICAgIHNjYWxlcy5wdXNoKHtcbiAgICAgICAgbmFtZTogXCJ0aW1lLW1vbnRoXCIsXG4gICAgICAgIHR5cGU6IFwib3JkaW5hbFwiLFxuICAgICAgICBkb21haW46IHV0aWwucmFuZ2UoMCwxMiksXG4gICAgICAgIHJhbmdlOiBbXCJKYW51YXJ5XCIsIFwiRmVicnVhcnlcIiwgXCJNYXJjaFwiLCBcIkFwcmlsXCIsIFwiTWF5XCIsIFwiSnVuZVwiLCBcIkp1bHlcIiwgXCJBdWd1c3RcIiwgXCJTZXB0ZW1iZXJcIiwgXCJPY3RvYmVyXCIsIFwiTm92ZW1iZXJcIiwgXCJEZWNlbWJlclwiXS5tYXAoXG4gICAgICAgICAgICBmdW5jdGlvbihzKXsgcmV0dXJuIHMuc3Vic3RyKDAsIGxhYmVsTGVuZ3RoKTt9XG4gICAgICAgICAgKVxuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgfVxufTtcbiIsInZhciB1dGlsID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxudXRpbC5rZXlzID0gZnVuY3Rpb24gKG9iaikge1xuICB2YXIgayA9IFtdLCB4O1xuICBmb3IgKHggaW4gb2JqKSBrLnB1c2goeCk7XG4gIHJldHVybiBrO1xufVxuXG51dGlsLnZhbHMgPSBmdW5jdGlvbiAob2JqKSB7XG4gIHZhciB2ID0gW10sIHg7XG4gIGZvciAoeCBpbiBvYmopIHYucHVzaChvYmpbeF0pO1xuICByZXR1cm4gdjtcbn1cblxudXRpbC5yYW5nZSA9IGZ1bmN0aW9uIChzdGFydCwgc3RvcCwgc3RlcCkge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIHtcbiAgICBzdGVwID0gMTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgIHN0b3AgPSBzdGFydDtcbiAgICAgIHN0YXJ0ID0gMDtcbiAgICB9XG4gIH1cbiAgaWYgKChzdG9wIC0gc3RhcnQpIC8gc3RlcCA9PSBJbmZpbml0eSkgdGhyb3cgbmV3IEVycm9yKFwiaW5maW5pdGUgcmFuZ2VcIik7XG4gIHZhciByYW5nZSA9IFtdLCBpID0gLTEsIGo7XG4gIGlmIChzdGVwIDwgMCkgd2hpbGUgKChqID0gc3RhcnQgKyBzdGVwICogKytpKSA+IHN0b3ApIHJhbmdlLnB1c2goaik7XG4gIGVsc2Ugd2hpbGUgKChqID0gc3RhcnQgKyBzdGVwICogKytpKSA8IHN0b3ApIHJhbmdlLnB1c2goaik7XG4gIHJldHVybiByYW5nZTtcbn1cblxudXRpbC5maW5kID0gZnVuY3Rpb24gKGxpc3QsIHBhdHRlcm4pIHtcbiAgdmFyIGwgPSBsaXN0LmZpbHRlcihmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHhbcGF0dGVybi5uYW1lXSA9PT0gcGF0dGVybi52YWx1ZTtcbiAgfSk7XG4gIHJldHVybiBsLmxlbmd0aCAmJiBsWzBdIHx8IG51bGw7XG59XG5cbnV0aWwudW5pcSA9IGZ1bmN0aW9uIChkYXRhLCBmaWVsZCkge1xuICB2YXIgbWFwID0ge30sIGNvdW50ID0gMCwgaSwgaztcbiAgZm9yIChpPTA7IGk8ZGF0YS5sZW5ndGg7ICsraSkge1xuICAgIGsgPSBkYXRhW2ldW2ZpZWxkXTtcbiAgICBpZiAoIW1hcFtrXSkge1xuICAgICAgbWFwW2tdID0gMTtcbiAgICAgIGNvdW50ICs9IDE7XG4gICAgfVxuICB9XG4gIHJldHVybiBjb3VudDtcbn1cblxudXRpbC5taW5tYXggPSBmdW5jdGlvbiAoZGF0YSwgZmllbGQpIHtcbiAgdmFyIHN0YXRzID0ge21pbjogK0luZmluaXR5LCBtYXg6IC1JbmZpbml0eX07XG4gIGZvciAoaT0wOyBpPGRhdGEubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgdiA9IGRhdGFbaV1bZmllbGRdO1xuICAgIGlmICh2ID4gc3RhdHMubWF4KSBzdGF0cy5tYXggPSB2O1xuICAgIGlmICh2IDwgc3RhdHMubWluKSBzdGF0cy5taW4gPSB2O1xuICB9XG4gIHJldHVybiBzdGF0cztcbn1cblxudXRpbC5kdXBsaWNhdGUgPSBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9iaikpO1xufTtcblxudXRpbC5hbnkgPSBmdW5jdGlvbihhcnIsIGYpe1xuICB2YXIgaT0wLCBrO1xuICBmb3IgKGsgaW4gYXJyKSB7XG4gICAgaWYoZihhcnJba10sIGssIGkrKykpIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxudXRpbC5hbGwgPSBmdW5jdGlvbihhcnIsIGYpe1xuICB2YXIgaT0wLCBrO1xuICBmb3IgKGsgaW4gYXJyKSB7XG4gICAgaWYoIWYoYXJyW2tdLCBrLCBpKyspKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbnV0aWwubWVyZ2UgPSBmdW5jdGlvbihkZXN0LCBzcmMpe1xuICByZXR1cm4gdXRpbC5rZXlzKHNyYykucmVkdWNlKGZ1bmN0aW9uKGMsIGspe1xuICAgIGNba10gPSBzcmNba107XG4gICAgcmV0dXJuIGM7XG4gIH0sIGRlc3QpO1xufTtcblxudXRpbC5nZXRiaW5zID0gZnVuY3Rpb24gKHN0YXRzKSB7XG4gIHJldHVybiB2Zy5iaW5zKHtcbiAgICBtaW46IHN0YXRzLm1pbixcbiAgICBtYXg6IHN0YXRzLm1heCxcbiAgICBtYXhiaW5zOiBNQVhfQklOU1xuICB9KTtcbn1cblxuXG51dGlsLmVycm9yID0gZnVuY3Rpb24obXNnKXtcbiAgY29uc29sZS5lcnJvcihcIltWTCBFcnJvcl1cIiwgbXNnKTtcbn1cblxuIl19
