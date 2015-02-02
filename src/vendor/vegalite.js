!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.vl=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var globals = require('./globals'),
    util = require('./util'),
    consts = require('./consts');

var vl = util.merge(consts, util);

vl.Encoding = require('./Encoding');
vl.compile = require('./compile/compile');
vl.data = require('./data');
vl.field = require('./field');
vl.schema = require('./schema/schema');


module.exports = vl;

},{"./Encoding":2,"./compile/compile":6,"./consts":17,"./data":18,"./field":19,"./globals":20,"./schema/schema":21,"./util":23}],2:[function(require,module,exports){
'use strict';

var global = require('./globals'),
  consts = require('./consts'),
  util = require('./util'),
  field = require('./field'),
  schema = require('./schema/schema');

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
    for (var e in defaults.enc) {
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

  proto.enc = function(x) {
    return this._enc[x];
  };

  // get "field" property for vega
  proto.field = function(x, nodata, nofn) {
    if (!this.has(x)) return null;

    var f = (nodata ? '' : 'data.');

    if (this._enc[x].aggr === 'count') {
      return f + 'count';
    } else if (!nofn && this._enc[x].bin) {
      return f + 'bin_' + this._enc[x].name;
    } else if (!nofn && this._enc[x].aggr) {
      return f + this._enc[x].aggr + '_' + this._enc[x].name;
    } else if (!nofn && this._enc[x].fn) {
      return f + this._enc[x].fn + '_' + this._enc[x].name;
    } else {
      return f + this._enc[x].name;
    }
  };

  proto.fieldName = function(x) {
    return this._enc[x].name;
  };

  proto.fieldTitle = function(x) {
    if (this._enc[x].aggr) {
      return this._enc[x].aggr + '(' + this._enc[x].name + ')';
    } else {
      return this._enc[x].name;
    }
  };

  proto.scale = function(x) {
    return this._enc[x].scale || {};
  };

  proto.axis = function(x) {
    return this._enc[x].axis || {};
  };

  proto.band = function(x) {
    return this._enc[x].band || {};
  };

  proto.bandSize = function(encType) {
    var isBandInSmallMultiples =
      (encType === Y && this.has(ROW) && this.has(Y)) ||
      (encType === X && this.has(COL) && this.has(X));

    // if band.size is explicitly specified, follow the specification, otherwise draw value from config.
    return this.band(encType).size ||
      this.config(isBandInSmallMultiples ? 'multipleBandSize' : 'singleBandSize');
  };

  proto.aggr = function(x) {
    return this._enc[x].aggr;
  };

  proto.bin = function(x) {
    return this._enc[x].bin;
  };

  proto.legend = function(x) {
    return this._enc[x].legend;
  };

  proto.value = function(x) {
    return this._enc[x].value;
  };

  proto.fn = function(x) {
    return this._enc[x].fn;
  };

  proto.any = function(f) {
    return util.any(this._enc, f);
  };

  proto.all = function(f) {
    return util.all(this._enc, f);
  };

  proto.length = function() {
    return util.keys(this._enc).length;
  };

  proto.map = function(f) {
    var arr = [], k;
    for (k in this._enc) {
      if(this.has(k)){
        arr.push(f(this._enc[k], k, this._enc));
      }
    }
    return arr;
  };

  proto.reduce = function(f, init) {
    var r = init, i = 0, k;
    for (k in this._enc) {
      if (this.has(k)) {
        r = f(r, this._enc[k], k, this._enc);
      }
    }
    return r;
  };

  proto.forEach = function(f) {
    var i = 0, k;
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
  };

  proto.font = function(prop) {
    var font = this._enc[TEXT].text;
    return prop ? font[prop] : font;
  };

  proto.isType = function(x, t) {
    var xt = this.type(x);
    if (xt === null) return false;
    return (xt & t) > 0;
  };

  function isOrdinalScale(encoding, encType){
    return encoding.isType(encType, O) || encoding.bin(encType) ||
      (encoding.isType(encType, T) && encoding.fn(encType));
  }

  proto.isOrdinalScale = function(encType) {
    return this.has(encType) && isOrdinalScale(this, encType);
  };

  proto.isQuantScale = function(encType) {
    return this.has(encType) && !isOrdinalScale(this, encType);
  };

  proto.isAggregate = function() {
    var i = 0, k;
    for (k in this._enc) {
      if (this.has(k) && this.aggr(k)) {
        return true;
      }
    }
    return false;
  };

  proto.isRaw = function() {
    return !this.isAggregate();
  };

  proto.isDimension = function(encType) {
    return this.has(encType) && this.isAggregate() &&
      isOrdinalScale(this, encType);
  };

  proto.isMeasure = function(encType) {
    return this.has(encType) && this.isAggregate() &&
      !isOrdinalScale(this, encType);
  };

  proto.config = function(name) {
    return this._cfg[name];
  };

  proto.toSpec = function(excludeConfig) {
    var enc = util.duplicate(this._enc),
      spec;

    // convert type's bitcode to type name
    for (var e in enc) {
      enc[e].type = consts.dataTypeNames[enc[e].type];
    }

    spec = {
      marktype: this._marktype,
      enc: enc
    };

    if (!excludeConfig) {
      spec.cfg = util.duplicate(this._cfg);
    }

    // remove defaults
    var defaults = schema.instantiate();
    return schema.util.subtract(spec, defaults);
  };

  proto.toShorthand = function() {
    var enc = this._enc;
    return this._marktype + '.' +
      this.map(function(v, e) {
        return e + '-' + field.shorthand(v);
      }).join('.');
  };

  Encoding.parseShorthand = function(shorthand, cfg) {
    var enc = shorthand.split('.'),
      marktype = enc.shift();

    enc = enc.reduce(function(m, e) {
      var split = e.split('-'),
        enctype = split[0],
        o = {name: split[1], type: consts.dataTypes[split[2]]};

      // check aggregate type
      for (var i in schema.aggr.enum) {
        var a = schema.aggr.enum[i];
        if (o.name.indexOf(a + '_') === 0) {
          o.name = o.name.substr(a.length + 1);
          if (a == 'count' && o.name.length === 0) o.name = '*';
          o.aggr = a;
          break;
        }
      }
      // check time fn
      for (var i in schema.timefns) {
        var f = schema.timefns[i];
        if (o.name && o.name.indexOf(f + '_') === 0) {
          o.name = o.name.substr(o.length + 1);
          o.fn = f;
          break;
        }
      }

      // check bin
      if (o.name && o.name.indexOf('bin_') === 0) {
        o.name = o.name.substr(4);
        o.bin = true;
      }

      m[enctype] = o;
      return m;
    }, {});

    return new Encoding(marktype, enc, cfg);
  };

  Encoding.fromSpec = function(spec, extraCfg) {
    var enc = util.duplicate(spec.enc);

    //convert type from string to bitcode (e.g, O=1)
    for (var e in enc) {
      enc[e].type = consts.dataTypes[enc[e].type];
    }

    return new Encoding(spec.marktype, enc, util.merge(spec.cfg, extraCfg || {}));
  };

  return Encoding;

})();

},{"./consts":17,"./field":19,"./globals":20,"./schema/schema":21,"./util":23}],3:[function(require,module,exports){
var globals = require('../globals'),
  util = require('../util');

module.exports = aggregates;

function aggregates(spec, encoding, opt) {
  opt = opt || {};
  var dims = {}, meas = {}, detail = {}, facets = {};
  encoding.forEach(function(encType, field) {
    if (field.aggr) {
      if (field.aggr === 'count') {
        meas['count'] = {op: 'count', field: '*'};
      }else {
        meas[field.aggr + '|'+ field.name] = {
          op: field.aggr,
          field: 'data.'+ field.name
        };
      }
    } else {
      dims[field.name] = encoding.field(encType);
      if (encType == ROW || encType == COL) {
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
      type: 'aggregate',
      groupby: dims,
      fields: meas
    });

    if (encoding.marktype() === TEXT) {
      meas.forEach(function(m) {
        var fieldName = m.field.substr(5), //remove "data."
          field = 'data.' + (m.op ? m.op + '_' : '') + fieldName;
        spec.transform.push({
          type: 'formula',
          field: field,
          expr: "d3.format('.2f')(d." + field + ')'
        });
      });
    }
  }
  return {
    details: util.vals(detail),
    dims: dims,
    facets: util.vals(facets),
    aggregated: meas.length > 0
  };
}

},{"../globals":20,"../util":23}],4:[function(require,module,exports){
var globals = require('../globals'),
  util = require('../util');

var axis = module.exports = {};

axis.names = function(props) {
  return util.keys(util.keys(props).reduce(function(a, x) {
    var s = props[x].scale;
    if (s === X || s === Y) a[props[x].scale] = 1;
    return a;
  }, {}));
};

axis.defs = function(names, encoding, opt) {
  return names.reduce(function(a, name) {
    a.push(axis.def(name, encoding, opt));
    return a;
  }, []);
};

axis.def = function(name, encoding, opt) {
  var type = name;
  var isCol = name == COL, isRow = name == ROW;
  if (isCol) type = 'x';
  if (isRow) type = 'y';

  var def = {
    type: type,
    scale: name
  };

  if (encoding.isQuantScale(name)) {
    //TODO(kanitw): better determine # of ticks
    def.ticks = 3;
  }

  if (encoding.axis(name).grid) {
    def.grid = true;
    def.layer = 'back';
  }

  if (encoding.axis(name).title) {
    //show title by default

    def = axis_title(def, name, encoding, opt);
  }

  if (isRow || isCol) {
    def.properties = {
      ticks: { opacity: {value: 0} },
      majorTicks: { opacity: {value: 0} },
      axis: { opacity: {value: 0} }
    };
  }
  if (isCol) {
    def.offset = [opt.xAxisMargin || 0, encoding.config('yAxisMargin')];
    def.orient = 'top';
  }

  if (name == 'x' && encoding.isOrdinalScale(X)) {
    def.properties = {
      labels: {
        angle: {value: 270},
        align: {value: 'right'},
        baseline: {value: 'middle'}
      }
    };
  }

  if (encoding.axis(X).format) {
    def.format = encoding.axis(X).format;
  } else if (encoding.isType(name, Q)) {
    def.format = "s";
  } else if (encoding.isType(name, T)) {
    def.format = "%Y-%m-%d";
  }

  // add custom label for time type
  if (encoding.isType(name, T) && encoding.fn(name)) {
    var fn = encoding.fn(name),
      properties = def.properties = def.properties || {},
      labels = properties.labels = properties.labels || {},
      text = labels.text = labels.text || {};

    switch (fn) {
      case 'day':
      case 'month':
        text.scale = 'time-'+ fn;
        break;
    }
  }

  return def;
};

function axis_title(axis, name, encoding, opt) {
  axis.title = encoding.fieldTitle(name);
  if (name == Y) {
    axis.titleOffset = 60;
    // TODO: set appropriate titleOffset
    // maybe based on some string length from stats
  }
  return axis;
}

},{"../globals":20,"../util":23}],5:[function(require,module,exports){
var globals = require('../globals'),
  util = require('../util');

module.exports = binning;

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
      type: 'bin',
      field: 'data.' + d,
      output: 'data.bin_' + d,
      maxbins: MAX_BINS
    });
  });
  return bins;
}

},{"../globals":20,"../util":23}],6:[function(require,module,exports){
var globals = require('../globals'),
  util = require('../util');

module.exports = compile;

var template = compile.template = require('./template'),
  layout = compile.layout = require('./layout'),
  axis = compile.axis = require('./axis'),
  group = compile.group = require('./group'),
  legend = compile.legend = require('./legend'),
  marks = compile.marks = require('./marks'),
  scale = compile.scale = require('./scale'),
  time = compile.time = require('./time'),
  aggregates = compile.aggregates = require('./aggregates'),
  binning = compile.binning = require('./binning'),
  faceting = compile.faceting = require('./faceting'),
  stacking = compile.stacking = require('./stacking');
  subfaceting = compile.subfaceting = require('./subfaceting');


function compile(encoding, stats) {
  var size = layout.setSize(encoding, stats),
    cellWidth = size.cellWidth,
    cellHeight = size.cellHeight;

  var hasAgg = encoding.any(function(v, k) {
    return v.aggr !== undefined;
  });

  var spec = template(encoding, size, stats),
    group = spec.marks[0],
    mark = marks[encoding.marktype()],
    mdef = marks.def(mark, encoding, {
      hasAggregate: hasAgg
    });

  var hasRow = encoding.has(ROW), hasCol = encoding.has(COL);

  var preaggregatedData = encoding.config('useVegaServer');

  group.marks.push(mdef);
  // TODO: return value not used
  binning(spec.data[0], encoding, {preaggregatedData: preaggregatedData});

  var lineType = marks[encoding.marktype()].line;

  if (!preaggregatedData) {
    spec = time(spec, encoding);
  }

  // handle subfacets
  var aggResult = aggregates(spec.data[0], encoding, {preaggregatedData: preaggregatedData}),
    details = aggResult.details,
    hasDetails = details && details.length > 0,
    stack = hasDetails && stacking(spec, encoding, mdef, aggResult.facets);

  if (hasDetails && (stack || lineType)) {
    //subfacet to group stack / line together in one group
    subfaceting(group, mdef, details, stack, encoding);
  }

  // auto-sort line/area values
  //TODO(kanitw): have some config to turn off auto-sort for line (for line chart that encodes temporal information)
  if (lineType) {
    var f = (encoding.isQuantScale(X) && encoding.isOrdinalScale(Y)) ? Y : X;
    if (!mdef.from) mdef.from = {};
    mdef.from.transform = [{type: 'sort', by: encoding.field(f)}];
  }

  // Small Multiples
  if (hasRow || hasCol) {
    spec = faceting(group, encoding, cellHeight, cellWidth, spec, mdef, stack, stats);
    spec.legends = legend.defs(encoding);
  } else {
    group.scales = scale.defs(scale.names(mdef.properties.update), encoding,
      {stack: stack, stats: stats});
    group.axes = axis.defs(axis.names(mdef.properties.update), encoding);
    group.legends = legend.defs(encoding);
  }
  return spec;
}


},{"../globals":20,"../util":23,"./aggregates":3,"./axis":4,"./binning":5,"./faceting":7,"./group":8,"./layout":9,"./legend":10,"./marks":11,"./scale":12,"./stacking":13,"./subfaceting":14,"./template":15,"./time":16}],7:[function(require,module,exports){
var globals = require('../globals'),
  util = require('../util');

var axis = require('./axis'),
  groupdef = require('./group').def,
  scale = require('./scale');

module.exports = faceting;

function faceting(group, encoding, cellHeight, cellWidth, spec, mdef, stack, stats) {
  var enter = group.properties.enter;
  var facetKeys = [], cellAxes = [];

  var hasRow = encoding.has(ROW), hasCol = encoding.has(COL);

  var xAxisMargin = encoding.has(Y) ? encoding.config('xAxisMargin') : undefined;

  enter.fill = {value: encoding.config('cellBackgroundColor')};

  //move "from" to cell level and add facet transform
  group.from = {data: group.marks[0].from.data};

  if (group.marks[0].from.transform) {
    delete group.marks[0].from.data; //need to keep transform for subfacetting case
  } else {
    delete group.marks[0].from;
  }
  if (hasRow) {
    if (!encoding.isOrdinalScale(ROW)) {
      util.error('Row encoding should be ordinal.');
    }
    enter.y = {scale: ROW, field: 'keys.' + facetKeys.length};
    enter.height = {'value': cellHeight}; // HACK

    facetKeys.push(encoding.field(ROW));

    var from;
    if (hasCol) {
      from = util.duplicate(group.from);
      from.transform = from.transform || [];
      from.transform.unshift({type: 'facet', keys: [encoding.field(COL)]});
    }

    var axesGrp = groupdef('x-axes', {
        axes: encoding.has(X) ? axis.defs(['x'], encoding) : undefined,
        x: hasCol ? {scale: COL, field: 'keys.0', offset: xAxisMargin} : {value: xAxisMargin},
        width: hasCol && {'value': cellWidth}, //HACK?
        from: from
      });

    spec.marks.push(axesGrp);
    (spec.axes = spec.axes || []);
    spec.axes.push.apply(spec.axes, axis.defs(['row'], encoding));
  } else { // doesn't have row
    if (encoding.has(X)) {
      //keep x axis in the cell
      cellAxes.push.apply(cellAxes, axis.defs(['x'], encoding));
    }
  }

  if (hasCol) {
    if (!encoding.isOrdinalScale(COL)) {
      util.error('Col encoding should be ordinal.');
    }
    enter.x = {scale: COL, field: 'keys.' + facetKeys.length};
    enter.width = {'value': cellWidth}; // HACK

    facetKeys.push(encoding.field(COL));

    var from;
    if (hasRow) {
      from = util.duplicate(group.from);
      from.transform = from.transform || [];
      from.transform.unshift({type: 'facet', keys: [encoding.field(ROW)]});
    }

    var axesGrp = groupdef('y-axes', {
      axes: encoding.has(Y) ? axis.defs(['y'], encoding) : undefined,
      y: hasRow && {scale: ROW, field: 'keys.0'},
      x: hasRow && {value: xAxisMargin},
      height: hasRow && {'value': cellHeight}, //HACK?
      from: from
    });

    spec.marks.push(axesGrp);
    (spec.axes = spec.axes || []);
    spec.axes.push.apply(spec.axes, axis.defs(['col'], encoding, {
      xAxisMargin: xAxisMargin
    }));
  } else { // doesn't have col
    if (encoding.has(Y)) {
      cellAxes.push.apply(cellAxes, axis.defs(['y'], encoding));
    }
  }

  if (hasRow) {
    if (enter.x) enter.x.offset = xAxisMargin;
    else enter.x = {value: xAxisMargin};
  }
  if (hasCol) {
    //TODO fill here..
  }

  // assuming equal cellWidth here
  // TODO: support heterogenous cellWidth (maybe by using multiple scales?)
  spec.scales = (spec.scales || []).concat(scale.defs(
    scale.names(enter).concat(scale.names(mdef.properties.update)),
    encoding,
    {cellWidth: cellWidth, cellHeight: cellHeight, stack: stack, facet: true, stats: stats}
  )); // row/col scales + cell scales

  if (cellAxes.length > 0) {
    group.axes = cellAxes;
  }

  // add facet transform
  var trans = (group.from.transform || (group.from.transform = []));
  trans.unshift({type: 'facet', keys: facetKeys});

  return spec;
}

},{"../globals":20,"../util":23,"./axis":4,"./group":8,"./scale":12}],8:[function(require,module,exports){
module.exports = {
  def: groupdef
};

function groupdef(name, opt) {
  opt = opt || {};
  return {
    _name: name || undefined,
    type: 'group',
    from: opt.from,
    properties: {
      enter: {
        x: opt.x || undefined,
        y: opt.y || undefined,
        width: opt.width || {group: 'width'},
        height: opt.height || {group: 'height'}
      }
    },
    scales: opt.scales || undefined,
    axes: opt.axes || undefined,
    marks: opt.marks || []
  };
}

},{}],9:[function(require,module,exports){
var globals = require('../globals'),
  util = require('../util'),
  schema = require('../schema/schema');

module.exports = {
  setSize: setSize
};

function getCardinality(encoding, encType, stats) {
  var field = encoding.fieldName(encType);
  if (encoding.bin(encType)) {
    var bins = util.getbins(stats[field]);
    return (bins.stop - bins.start) / bins.step;
  }
  return stats[field].cardinality;
}

/*
  HACK to set chart size
  NOTE: this fails for plots driven by derived values (e.g., aggregates)
  One solution is to update Vega to support auto-sizing
  In the meantime, auto-padding (mostly) does the trick
 */
function setSize(encoding, stats) {
  var hasRow = encoding.has(ROW),
      hasCol = encoding.has(COL),
      marktype = encoding.marktype();

  var cellWidth, cellHeight, cellPadding = encoding.config('cellPadding');

  // set cellWidth
  if (encoding.has(X)) {
    if (encoding.isOrdinalScale(X)) {
      // for ordinal, hasCol or not doesn't matter -- we scale based on cardinality
      var xCardinality = getCardinality(encoding, X, stats);
      cellWidth = (xCardinality + encoding.band(X).padding) * encoding.bandSize(X);
    } else {
      cellWidth = hasCol ? encoding.enc(COL).width :  encoding.config("singleWidth");
    }
  } else {
    if (marktype === TEXT) {
      cellWidth = encoding.config('textCellWidth');
    } else {
      cellWidth = encoding.bandSize(X);
    }
  }

  // set cellHeight
  if (encoding.has(Y)) {
    if (encoding.isOrdinalScale(Y)) {
      // for ordinal, hasCol or not doesn't matter -- we scale based on cardinality
      var yCardinality = getCardinality(encoding, Y, stats);
      cellHeight = (yCardinality + encoding.band(Y).padding) * encoding.bandSize(Y);
    } else {
      cellHeight = hasRow ? encoding.enc(ROW).height :  encoding.config("singleHeight");
    }
  } else {
    cellHeight = encoding.bandSize(Y);
  }

  // Cell bands use rangeBands(). There are n-1 padding.  Outerpadding = 0 for cells

  var width = cellWidth, height = cellHeight;

  if (hasCol) {
    var colCardinality = getCardinality(encoding, COL, stats);
    width = cellWidth * ((1 + cellPadding) * (colCardinality - 1) + 1);
  }

  if (hasRow) {
    var rowCardinality = getCardinality(encoding, ROW, stats);
    height = cellHeight * ((1 + cellPadding) * (rowCardinality - 1) + 1);
  }

  return {
    cellWidth: cellWidth,
    cellHeight: cellHeight,
    width: width,
    height: height
  };
}

},{"../globals":20,"../schema/schema":21,"../util":23}],10:[function(require,module,exports){
var global = require('../globals');

var legend = module.exports = {};

legend.defs = function(encoding) {
  var defs = [];

  // TODO: support alpha

  if (encoding.has(COLOR) && encoding.legend(COLOR)) {
    defs.push(legend.def(COLOR, encoding, {
      fill: COLOR,
      orient: 'right'
    }));
  }

  if (encoding.has(SIZE) && encoding.legend(SIZE)) {
    defs.push(legend.def(SIZE, encoding, {
      size: SIZE,
      orient: defs.length === 1 ? 'left' : 'right'
    }));
  }

  if (encoding.has(SHAPE) && encoding.legend(SHAPE)) {
    if (defs.length === 2) {
      // TODO: fix this
      console.error('Vegalite currently only supports two legends');
      return defs;
    }
    defs.push(legend.def(SHAPE, encoding, {
      shape: SHAPE,
      orient: defs.length === 1 ? 'left' : 'right'
    }));
  }

  return defs;
};

legend.def = function(name, encoding, props) {
  var def = props, fn;

  def.title = encoding.fieldTitle(name);

  if (encoding.isType(name, T) && (fn = encoding.fn(name))) {
    var properties = def.properties = def.properties || {},
      labels = properties.labels = properties.labels || {},
      text = labels.text = labels.text || {};

    switch (fn) {
      case 'day':
      case 'month':
        text.scale = 'time-'+ fn;
        break;
    }
  }

  return def;
};

},{"../globals":20}],11:[function(require,module,exports){
var globals = require('../globals'),
  util = require('../util');

var marks = module.exports = {};

marks.def = function(mark, encoding, opt) {
  var p = mark.prop(encoding, opt);
  return {
    type: mark.type,
    from: {data: TABLE},
    properties: {enter: p, update: p}
  };
};

marks.bar = {
  type: 'rect',
  stack: true,
  prop: bar_props,
  requiredEncoding: ['x', 'y'],
  supportedEncoding: {row: 1, col: 1, x: 1, y: 1, size: 1, color: 1, alpha: 1}
};

marks.line = {
  type: 'line',
  line: true,
  prop: line_props,
  requiredEncoding: ['x', 'y'],
  supportedEncoding: {row: 1, col: 1, x: 1, y: 1, color: 1, alpha: 1}
};

marks.area = {
  type: 'area',
  stack: true,
  line: true,
  requiredEncoding: ['x', 'y'],
  prop: area_props,
  supportedEncoding: marks.line.supportedEncoding
};

marks.circle = {
  type: 'symbol',
  prop: filled_point_props('circle'),
  supportedEncoding: {row: 1, col: 1, x: 1, y: 1, size: 1, color: 1, alpha: 1}
};

marks.square = {
  type: 'symbol',
  prop: filled_point_props('square'),
  supportedEncoding: marks.circle.supportedEncoding
};

marks.point = {
  type: 'symbol',
  prop: point_props,
  supportedEncoding: {row: 1, col: 1, x: 1, y: 1, size: 1, color: 1, alpha: 1, shape: 1}
};

marks.text = {
  type: 'text',
  prop: text_props,
  requiredEncoding: ['text'],
  supportedEncoding: {row: 1, col: 1, size: 1, color: 1, alpha: 1, text: 1}
};

function bar_props(e) {
  var p = {};

  // x
  if (e.isQuantScale(X)) {
    p.x = {scale: X, field: e.field(X)};
    if (e.isOrdinalScale(Y)) {
      p.x2 = {scale: X, value: 0};
    }
  } else if (e.has(X)) { // is ordinal
    p.xc = {scale: X, field: e.field(X)};
  } else {
    // TODO add single bar offset
    p.xc = {value: 0};
  }

  // y
  if (e.isQuantScale(Y)) {
    p.y = {scale: Y, field: e.field(Y)};
    p.y2 = {scale: Y, value: 0};
  } else if (e.has(Y)) { // is ordinal
    p.yc = {scale: Y, field: e.field(Y)};
  } else {
    // TODO add single bar offset
    p.yc = {group: 'height'};
  }

  // width
  if (!e.isQuantScale(X)) { // no X or X is ordinal
    if (e.has(SIZE)) {
      p.width = {scale: SIZE, field: e.field(SIZE)};
    } else {
      // p.width = {scale: X, band: true, offset: -1};
      p.width = {value: e.bandSize(X), offset: -1};
    }
  } else { // X is Quant
    p.width = {value: e.bandSize(X), offset: -1};
  }

  // height
  if (!e.isQuantScale(Y)) { // no Y or Y is ordinal
    if (e.has(SIZE)) {
      p.height = {scale: SIZE, field: e.field(SIZE)};
    } else {
      // p.height = {scale: Y, band: true, offset: -1};
      p.height = {value: e.bandSize(Y), offset: -1};
    }
  } else { // Y is Quant
    p.height = {value: e.bandSize(Y), offset: -1};
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
    p.x = {value: e.bandSize(X) / 2};
  }

  // y
  if (e.has(Y)) {
    p.y = {scale: Y, field: e.field(Y)};
  } else if (!e.has(Y)) {
    p.y = {value: e.bandSize(Y) / 2};
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
  }else {
    p.opacity = {
      value: e.value(ALPHA)
    };
  }

  p.strokeWidth = {value: e.config('strokeWidth')};

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
    p.y = {group: 'height'};
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

  p.strokeWidth = {value: e.config('strokeWidth')};

  return p;
}

function area_props(e) {
  var p = {};

  // x
  if (e.isQuantScale(X)) {
    p.x = {scale: X, field: e.field(X)};
    if (e.isOrdinalScale(Y)) {
      p.x2 = {scale: X, value: 0};
      p.orient = {value: 'horizontal'};
    }
  } else if (e.has(X)) {
    p.x = {scale: X, field: e.field(X)};
  } else {
    p.x = {value: 0};
  }

  // y
  if (e.isQuantScale(Y)) {
    p.y = {scale: Y, field: e.field(Y)};
    p.y2 = {scale: Y, value: 0};
  } else if (e.has(Y)) {
    p.y = {scale: Y, field: e.field(Y)};
  } else {
    p.y = {group: 'height'};
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
      p.x = {value: e.bandSize(X) / 2};
    }

    // y
    if (e.has(Y)) {
      p.y = {scale: Y, field: e.field(Y)};
    } else if (!e.has(Y)) {
      p.y = {value: e.bandSize(Y) / 2};
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
    p.x = {value: e.bandSize(X) / 2};
  }

  // y
  if (e.has(Y)) {
    p.y = {scale: Y, field: e.field(Y)};
  } else if (!e.has(Y)) {
    p.y = {value: e.bandSize(Y) / 2};
  }

  // size
  if (e.has(SIZE)) {
    p.fontSize = {scale: SIZE, field: e.field(SIZE)};
  } else if (!e.has(X)) {
    p.fontSize = {value: e.font('size')};
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

  // text
  if (e.has(TEXT)) {
    p.text = {field: e.field(TEXT)};
  } else {
    p.text = {value: 'Abc'};
  }

  p.font = {value: e.font('family')};
  p.fontWeight = {value: e.font('weight')};
  p.fontStyle = {value: e.font('style')};
  p.baseline = {value: e.text('baseline')};

  // align
  if (e.has(X)) {
    if (e.isOrdinalScale(X)) {
      p.align = {value: 'left'};
      p.dx = {value: e.text('margin')};
    } else {
      p.align = {value: 'center'};
    }
  } else if (e.has(Y)) {
    p.align = {value: 'left'};
    p.dx = {value: e.text('margin')};
  } else {
    p.align = {value: e.text('align')};
  }

  return p;
}

},{"../globals":20,"../util":23}],12:[function(require,module,exports){
var globals = require('../globals'),
  util = require('../util');

var scale = module.exports = {};

scale.names = function(props) {
  return util.keys(util.keys(props).reduce(function(a, x) {
    if (props[x] && props[x].scale) a[props[x].scale] = 1;
    return a;
  }, {}));
};

scale.defs = function(names, encoding, opt) {
  opt = opt || {};

  return names.reduce(function(a, name) {
    var s = {
      name: name,
      type: scale.type(name, encoding),
      domain: scale_domain(name, encoding, opt)
    };
    if (s.type === 'ordinal' && !encoding.bin(name)) {
      s.sort = true;
    }

    scale_range(s, encoding, opt);

    return (a.push(s), a);
  }, []);
};

scale.type = function(name, encoding) {
  var fn;
  switch (encoding.type(name)) {
    case O: return 'ordinal';
    case T:
      switch (encoding.fn(name)) {
        case 'second':
        case 'minute':
        case 'hour':
        case 'day':
        case 'date':
        case 'month':
          return 'ordinal';
        case 'year':
          return 'linear';
      }
      return 'time';
    case Q:
      if (encoding.bin(name)) {
        return 'ordinal';
      }
      return encoding.scale(name).type;
  }
};

function scale_domain(name, encoding, opt) {
  if (encoding.type(name) === T) {
    switch (encoding.fn(name)) {
      case 'second':
      case 'minute': return util.range(0, 60);
      case 'hour': return util.range(0, 24);
      case 'day': return util.range(0, 7);
      case 'date': return util.range(0, 32);
      case 'month': return util.range(0, 12);
    }
  }

  if (encoding.bin(name)) {
    // TODO: add includeEmptyConfig here
    if (opt.stats) {
      var bins = util.getbins(opt.stats[encoding.fieldName(name)]);
      var domain = util.range(bins.start, bins.stop, bins.step);
      return name === Y ? domain.reverse() : domain;
    }
  }

  return name == opt.stack ?
    {
      data: STACKED,
      field: 'data.' + (opt.facet ? 'max_' : '') + 'sum_' + encoding.field(name, true)
    } :
    {data: TABLE, field: encoding.field(name)};
}

function scale_range(s, encoding, opt) {
  var spec = encoding.scale(s.name);
  switch (s.name) {
    case X:
      if (s.type === 'ordinal') {
        s.bandWidth = encoding.bandSize(X);
      } else {
        s.range = opt.cellWidth ? [0, opt.cellWidth] : 'width';
        s.zero = spec.zero;
        s.reverse = spec.reverse;
      }
      s.round = true;
      if (s.type === 'time') {
        s.nice = encoding.fn(s.name);
      }else {
        s.nice = true;
      }
      break;
    case Y:
      if (s.type === 'ordinal') {
        s.bandWidth = encoding.bandSize(Y);
      } else {
        s.range = opt.cellHeight ? [opt.cellHeight, 0] : 'height';
        s.zero = spec.zero;
        s.reverse = spec.reverse;
      }

      s.round = true;

      if (s.type === 'time') {
        s.nice = encoding.fn(s.name) || encoding.config('timeScaleNice');
      }else {
        s.nice = true;
      }
      break;
    case ROW: // support only ordinal
      s.bandWidth = opt.cellHeight || encoding.config('cellHeight');
      s.round = true;
      s.nice = true;
      break;
    case COL: // support only ordinal
      s.bandWidth = opt.cellWidth || encoding.config('cellWidth');
      s.round = true;
      s.nice = true;
      break;
    case SIZE:
      if (encoding.is('bar')) {
        // FIXME this is definitely incorrect
        // but let's fix it later since bar size is a bad encoding anyway
        s.range = [3, Math.max(encoding.bandSize(X), encoding.bandSize(Y))];
      } else if (encoding.is(TEXT)) {
        s.range = [8, 40];
      } else {
        s.range = [10, 1000];
      }
      s.round = true;
      s.zero = false;
      break;
    case SHAPE:
      s.range = 'shapes';
      break;
    case COLOR:
      var range = encoding.scale(COLOR).range;
      if (range === undefined) {
        if (s.type === 'ordinal') {
          range = 'category10';
        } else {
          range = ['#ddf', 'steelblue'];
          s.zero = false;
        }
      }
      s.range = range;
      break;
    case ALPHA:
      s.range = [0.2, 1.0];
      break;
    default:
      throw new Error('Unknown encoding name: '+ s.name);
  }

  switch (s.name) {
    case ROW:
    case COL:
      s.padding = encoding.config('cellPadding');
      s.outerPadding = 0;
      break;
    case X:
    case Y:
      if (s.type === 'ordinal') { //&& !s.bandWidth
        s.points = true;
        s.padding = encoding.band(s.name).padding;
      }
  }
}

},{"../globals":20,"../util":23}],13:[function(require,module,exports){
"use strict";

var globals = require('../globals'),
  util = require('../util'),
  marks = require('./marks');

module.exports = stacking;

function stacking(spec, encoding, mdef, facets) {
  if (!marks[encoding.marktype()].stack) return false;

  // TODO: add || encoding.has(LOD) here once LOD is implemented
  if (!encoding.has(COLOR)) return false;

  var dim=null, val=null, idx =null,
    isXMeasure = encoding.isMeasure(X),
    isYMeasure = encoding.isMeasure(Y);

  if (isXMeasure && !isYMeasure) {
    dim = Y;
    val = X;
    idx = 0;
  } else if (isYMeasure && !isXMeasure) {
    dim = X;
    val = Y;
    idx = 1;
  } else {
    return null; // no stack encoding
  }

  // add transform to compute sums for scale
  var stacked = {
    name: STACKED,
    source: TABLE,
    transform: [{
      type: 'aggregate',
      groupby: [encoding.field(dim)].concat(facets), // dim and other facets
      fields: [{op: 'sum', field: encoding.field(val)}] // TODO check if field with aggr is correct?
    }]
  };

  if (facets && facets.length > 0) {
    stacked.transform.push({ //calculate max for each facet
      type: 'aggregate',
      groupby: facets,
      fields: [{op: 'max', field: 'data.sum_' + encoding.field(val, true)}]
    });
  }

  spec.data.push(stacked);

  // add stack transform to mark
  mdef.from.transform = [{
    type: 'stack',
    point: encoding.field(dim),
    height: encoding.field(val),
    output: {y1: val, y0: val + '2'}
  }];

  // TODO: This is super hack-ish -- consolidate into modular mark properties?
  mdef.properties.update[val] = mdef.properties.enter[val] = {scale: val, field: val};
  mdef.properties.update[val + '2'] = mdef.properties.enter[val + '2'] = {scale: val, field: val + '2'};

  return val; //return stack encoding
}

},{"../globals":20,"../util":23,"./marks":11}],14:[function(require,module,exports){
var global = require('../globals');

var groupdef = require('./group').def;

module.exports = subfaceting;

function subfaceting(group, mdef, details, stack, encoding) {
  var m = group.marks,
    g = groupdef('subfacet', {marks: m});

  group.marks = [g];
  g.from = mdef.from;
  delete mdef.from;

  //TODO test LOD -- we should support stack / line without color (LOD) field
  var trans = (g.from.transform || (g.from.transform = []));
  trans.unshift({type: 'facet', keys: details});

  if (stack && encoding.has(COLOR)) {
    trans.unshift({type: 'sort', by: encoding.field(COLOR)});
  }
}

},{"../globals":20,"./group":8}],15:[function(require,module,exports){
var globals = require('../globals');

var groupdef = require('./group').def,
  vldata = require('../data');

module.exports = template;

function template(encoding, size, stats) { //hack use stats

  var data = {name: TABLE, format: {type: encoding.config('dataFormatType')}},
    dataUrl = vldata.getUrl(encoding, stats);
  if (dataUrl) data.url = dataUrl;

  var preaggregatedData = encoding.config('useVegaServer');

  encoding.forEach(function(encType, field) {
    if (field.type == T) {
      data.format.parse = data.format.parse || {};
      data.format.parse[field.name] = 'date';
    }else if (field.type == Q) {
      data.format.parse = data.format.parse || {};
      if (field.aggr === 'count') {
        var name = 'count';
      } else if (preaggregatedData && field.bin) {
        var name = 'bin_' + field.name;
      } else if (preaggregatedData && field.aggr) {
        var name = field.aggr + '_' + field.name;
      } else {
        var name = field.name;
      }
      data.format.parse[name] = 'number';
    }
  });

  return {
    width: size.width,
    height: size.height,
    padding: 'auto',
    data: [data],
    marks: [groupdef('cell', {
      width: size.cellWidth ? {value: size.cellWidth} : undefined,
      height: size.cellHeight ? {value: size.cellHeight} : undefined
    })]
  };
}

},{"../data":18,"../globals":20,"./group":8}],16:[function(require,module,exports){
var globals = require('../globals'),
  util = require('../util');

module.exports = time;

function time(spec, encoding, opt) {
  var timeFields = {}, timeFn = {};

  // find unique formula transformation and bin function
  encoding.forEach(function(encType, field) {
    if (field.type === T && field.fn) {
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
time.formula = function(field) {
  var date = 'new Date(d.data.'+ field.name + ')';
  switch (field.fn) {
    case 'second': return date + '.getUTCSeconds()';
    case 'minute': return date + '.getUTCMinutes()';
    case 'hour': return date + '.getUTCHours()';
    case 'day': return date + '.getUTCDay()';
    case 'date': return date + '.getUTCDate()';
    case 'month': return date + '.getUTCMonth()';
    case 'year': return date + '.getUTCFullYear()';
  }
  // TODO add continuous binning
  console.error('no function specified for date');
};

/** add formula transforms to data */
time.transform = function(transform, encoding, encType, field) {
  transform.push({
    type: 'formula',
    field: encoding.field(encType),
    expr: time.formula(field)
  });
};

time.scale = function(scales, fn, encoding) {
  var labelLength = encoding.config('timeScaleLabelLength');
  // TODO add option for shorter scale / custom range
  switch (fn) {
    case 'day':
      scales.push({
        name: 'time-day',
        type: 'ordinal',
        domain: util.range(0, 7),
        range: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
          function(s) { return s.substr(0, labelLength);}
        )
      });
      break;
    case 'month':
      scales.push({
        name: 'time-month',
        type: 'ordinal',
        domain: util.range(0, 12),
        range: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(
            function(s) { return s.substr(0, labelLength);}
          )
      });
      break;
  }
};

},{"../globals":20,"../util":23}],17:[function(require,module,exports){
var globals = require('./globals');

var consts = module.exports = {};

consts.encodingTypes = [X, Y, ROW, COL, SIZE, SHAPE, COLOR, ALPHA, TEXT];

consts.dataTypes = {'O': O, 'Q': Q, 'T': T};

consts.dataTypeNames = ['O', 'Q', 'T'].reduce(function(r, x) {
  r[consts.dataTypes[x]] = x; return r;
},{});

consts.DEFAULTS = {
  // single plot
  singleHeight: 200, // will be overwritten by bandWidth * (cardinality + padding)
  singleWidth: 200, // will be overwritten by bandWidth * (cardinality + padding)
  singleBandSize: 21,

  //small multiples
  multipleBandSize: 13,

  cellPadding: 0.1,
  cellBackgroundColor: '#fdfdfd',
  xAxisMargin: 0,
  yAxisMargin: 0,
  textCellWidth: 90,

  // marks
  strokeWidth: 2,

  // scales
  timeScaleLabelLength: 3
};

},{"./globals":20}],18:[function(require,module,exports){
// TODO rename getDataUrl to vl.data.getUrl() ?

var util = require('./util');

var data = module.exports = {};

data.getUrl = function getDataUrl(encoding, stats) {
  if (!encoding.config('useVegaServer')) {
    // don't use vega server
    return encoding.config('dataUrl');
  }

  if (encoding.length() === 0) {
    // no fields
    return;
  }

  var fields = [];
  encoding.forEach(function(encType, field) {
    var obj = {
      name: encoding.field(encType, true),
      field: field.name
    };
    if (field.aggr) {
      obj.aggr = field.aggr;
    }
    if (field.bin) {
      obj.binSize = util.getbins(stats[field.name]).step;
    }
    fields.push(obj);
  });

  var query = {
    table: encoding.config('vegaServerTable'),
    fields: fields
  };

  return encoding.config('vegaServerUrl') + '/query/?q=' + JSON.stringify(query);
};

/**
 * @param  {Object} data data in JSON/javascript object format
 * @return Array of {name: __name__, type: "number|text|time|location"}
 */
data.getSchema = function(data) {
  var schema = [],
    fields = util.keys(data[0]);

  fields.forEach(function(k) {
    // find non-null data
    var i = 0, datum = data[i][k];
    while (datum === '' || datum === null || datum === undefined) {
      datum = data[++i][k];
    }

    //TODO(kanitw): better type inference here
    var type = (typeof datum === 'number') ? 'Q':
      isNaN(Date.parse(datum)) ? 'O' : 'T';

    schema.push({name: k, type: type});
  });

  return schema;
};

data.getStats = function(data) { // hack
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

},{"./util":23}],19:[function(require,module,exports){
// utility for field

var consts = require('./consts');

var field = module.exports = {};

field.shorthand = function(f) {
  return (f.aggr ? f.aggr + '_' : '') +
    (f.fn ? f.fn + '_' : '') +
    (f.bin ? 'bin_' : '') +
    (f.name || '') + '-' +
    (consts.dataTypeNames[f.type] || f.type);
};

field.shorthands = function(fields, delim){
  delim = delim || ',';
  return fields.map(field.shorthand).join(delim);
};

var typeOrder = {
  O: 0,
  G: 1,
  T: 2,
  Q: 3
};

field.order = {};

field.order.typeThenName = function(field) {
  return typeOrder[field.type] + '_' + field.name;
};

field.order.original = function() {
  return 0; // no swap will occur
};

field.order.name = function(field) {
  return field.name;
};

field.order.typeThenCardinality = function(field, stats){
  return stats[field.name].cardinality;
};

},{"./consts":17}],20:[function(require,module,exports){
(function (global){
// declare global constant
var g = global || window;

g.TABLE = 'table';
g.STACKED = 'stacked';
g.INDEX = 'index';

g.X = 'x';
g.Y = 'y';
g.ROW = 'row';
g.COL = 'col';
g.SIZE = 'size';
g.SHAPE = 'shape';
g.COLOR = 'color';
g.ALPHA = 'alpha';
g.TEXT = 'text';

g.O = 1;
g.Q = 2;
g.T = 4;

//TODO refactor this to be config?
g.MAX_BINS = 20;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],21:[function(require,module,exports){
// Package of defining Vegalite Specification's json schema

var schema = module.exports = {},
  util = require('../util');

schema.util = require('./schemautil');

schema.marktype = {
  type: 'string',
  enum: ['point', 'bar', 'line', 'area', 'circle', 'square', 'text']
};

schema.aggr = {
  type: 'string',
  enum: ['avg', 'sum', 'min', 'max', 'count'],
  supportedEnums: {
    Q: ['avg', 'sum', 'min', 'max', 'count'],
    O: [],
    T: ['avg', 'min', 'max'],
    '': ['count']
  },
  supportedTypes: {'Q': true, 'O': true, 'T': true, '': true}
};

schema.band = {
  type: 'object',
  properties: {
    size: {
      type: 'integer',
      minimum: 0
    },
    padding: {
      type: 'integer',
      minimum: 0,
      default: 1
    }
  }
};

schema.timefns = ['month', 'year', 'day', 'date', 'hour', 'minute', 'second'];

schema.fn = {
  type: 'string',
  enum: schema.timefns,
  supportedTypes: {'T': true}
};

//TODO(kanitw): add other type of function here

schema.scale_type = {
  type: 'string',
  enum: ['linear', 'log', 'pow', 'sqrt', 'quantile'],
  default: 'linear',
  supportedTypes: {'Q': true}
};

schema.field = {
  type: 'object',
  properties: {
    name: {
      type: 'string'
    }
  }
};

var clone = util.duplicate;
var merge = schema.util.merge;

var typicalField = merge(clone(schema.field), {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['O', 'Q', 'T']
    },
    bin: {
      type: 'boolean',
      default: false,
      supportedTypes: {'Q': true} // TODO: add 'O' after finishing #81
    },
    aggr: schema.aggr,
    fn: schema.fn,
    scale: {
      type: 'object',
      properties: {
        type: schema.scale_type,
        reverse: { type: 'boolean', default: false },
        zero: {
          type: 'boolean',
          description: 'Include zero',
          default: true,
          supportedTypes: {'Q': true}
        },
        nice: {
          type: 'string',
          enum: ['second', 'minute', 'hour', 'day', 'week', 'month', 'year'],
          supportedTypes: {'T': true}
        }
      }
    }
  }
});

var onlyOrdinalField = merge(clone(schema.field), {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['O','Q'] // ordinal-only field supports Q when bin is applied
    },
    bin: {
      type: 'boolean',
      default: false,
      supportedTypes: {'Q': true} // TODO: add 'O' after finishing #81
    },
    aggr: {
      type: 'string',
      enum: ['count'],
      supportedTypes: {'O': true}
    }
  }
});

var axisMixin = {
  type: 'object',
  properties: {
    axis: {
      type: 'object',
      properties: {
        grid: {
          type: 'boolean',
          default: false,
          description: 'A flag indicate if gridlines should be created in addition to ticks.'
        },
        title: {
          type: 'boolean',
          default: true,
          description: 'A title for the axis.'
        },
        format: {
          type: 'string',
          description: 'The formatting pattern for axis labels.'
        }
      }
    }
  }
};

var bandMixin = {
  type: 'object',
  properties: {
    band: schema.band
  }
};

var legendMixin = {
  type: 'object',
  properties: {
    legend: {
      type: 'boolean',
      default: true
    }
  }
};

var textMixin = {
  type: 'object',
  properties: {
    text: {
      type: 'object',
      properties: {
        text: {
          type: 'object',
          properties: {
            align: {
              type: 'string',
              default: 'left'
            },
            baseline: {
              type: 'string',
              default: 'middle'
            },
            margin: {
              type: 'integer',
              default: 4,
              minimum: 0
            }
          }
        },
        font: {
          type: 'object',
          properties: {
            weight: {
              type: 'string',
              enum: ['normal', 'bold'],
              default: 'normal'
            },
            size: {
              type: 'integer',
              default: 10,
              minimum: 0
            },
            family: {
              type: 'string',
              default: 'Helvetica Neue'
            },
            style: {
              type: 'string',
              default: 'normal',
              enum: ['normal', 'italic']
            }
          }
        }
      }
    }
  }
};

var sizeMixin = {
  type: 'object',
  properties: {
    value: {
      type: 'integer',
      default: 10,
      minimum: 0
    }
  }
};

var colorMixin = {
  type: 'object',
  properties: {
    value: {
      type: 'string',
      default: 'steelblue'
    },
    scale: {
      type: 'object',
      properties: {
        range: {
          type: ['string', 'array']
        }
      }
    }
  }
};

var alphaMixin = {
  type: 'object',
  properties: {
    value: {
      type: 'number',
      default: 1,
      minimum: 0,
      maximum: 1
    }
  }
};

var shapeMixin = {
  type: 'object',
  properties: {
    value: {
      type: 'string',
      enum: ['circle', 'square', 'cross', 'diamond', 'triangle-up', 'triangle-down'],
      default: 'circle'
    }
  }
};

var rowMixin = {
  properties: {
    height: {
      type: 'number',
      minimum: 0,
      default: 150
    },
    padding: {
      type: 'number',
      minimum: 0,
      maximum: 1,
      default: 0.1
    }
  }
};

var colMixin = {
  properties: {
    width: {
      type: 'number',
      minimum: 0,
      default: 150
    },
    padding: {
      type: 'number',
      minimum: 0,
      maximum: 1,
      default: 0.1
    }
  }
};

var requiredNameType = {
  required: ['name', 'type']
};

var x = merge(merge(merge(clone(typicalField), axisMixin), bandMixin), requiredNameType);
var y = clone(x);

var facet = merge(clone(onlyOrdinalField), requiredNameType);
var row = merge(clone(facet), rowMixin);
var col = merge(clone(facet), colMixin);

var size = merge(merge(clone(typicalField), legendMixin), sizeMixin);
var color = merge(merge(clone(typicalField), legendMixin), colorMixin);
var alpha = merge(clone(typicalField), alphaMixin);
var shape = merge(merge(clone(onlyOrdinalField), legendMixin), shapeMixin);

var text = merge(clone(typicalField), textMixin);

var cfg = {
  type: 'object',
  properties: {
    // template
    width: {
      type: 'integer',
      default: undefined
    },
    height: {
      type: 'integer',
      default: undefined
    },
    viewport: {
      type: 'array',
      items: {
        type: ['integer']
      },
      default: undefined
    },
    _minWidth: {
      type: 'integer',
      default: 20,
      minimum: 0
    },
    _minHeight: {
      type: 'integer',
      default: 20,
      minimum: 0
    },

    // data source
    dataFormatType: {
      type: 'string',
      enum: ['json', 'csv'],
      default: 'json'
    },
    useVegaServer: {
      type: 'boolean',
      default: false
    },
    dataUrl: {
      type: 'string',
      default: undefined
    },
    vegaServerTable: {
      type: 'string',
      default: undefined
    },
    vegaServerUrl: {
      type: 'string',
      default: 'http://localhost:3001'
    }
  }
};

/** @type Object Schema of a vegalite specification */
schema.schema = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  type: 'object',
  required: ['marktype', 'enc', 'cfg'],
  properties: {
    marktype: schema.marktype,
    enc: {
      type: 'object',
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
schema.instantiate = function() {
  return schema.util.instantiate(schema.schema);
};

},{"../util":23,"./schemautil":22}],22:[function(require,module,exports){
var util = module.exports = {};

var isEmpty = function(obj) {
  return Object.keys(obj).length === 0;
};

// instantiate a schema
util.instantiate = function(schema) {
  if (schema.type === 'object') {
    var instance = {};
    for (var name in schema.properties) {
      var val = util.instantiate(schema.properties[name]);
      if (val !== undefined) {
        instance[name] = val;
      }
    }
    return instance;
  } else if ('default' in schema) {
    return schema.default;
  }
  return undefined;
};

// remove all defaults from an instance
util.subtract = function(instance, defaults) {
  var changes = {};
  for (var prop in instance) {
    if (!defaults || defaults[prop] !== instance[prop]) {
      if (typeof instance[prop] === 'object' && !(instance[prop] instanceof Array)) {
        var c = util.subtract(instance[prop], defaults[prop]);
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
util.merge = function(defaults, instance) {
  if (typeof instance !== 'object' || instance === null) {
    return defaults;
  }

  for (var p in instance) {
    if (!instance.hasOwnProperty(p))
      continue;
    if (instance[p] === undefined)
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
};

},{}],23:[function(require,module,exports){
var util = module.exports = {};

util.keys = function(obj) {
  var k = [], x;
  for (x in obj) k.push(x);
  return k;
};

util.vals = function(obj) {
  var v = [], x;
  for (x in obj) v.push(obj[x]);
  return v;
};

util.range = function(start, stop, step) {
  if (arguments.length < 3) {
    step = 1;
    if (arguments.length < 2) {
      stop = start;
      start = 0;
    }
  }
  if ((stop - start) / step == Infinity) throw new Error('infinite range');
  var range = [], i = -1, j;
  if (step < 0) while ((j = start + step * ++i) > stop) range.push(j);
  else while ((j = start + step * ++i) < stop) range.push(j);
  return range;
};

util.find = function(list, pattern) {
  var l = list.filter(function(x) {
    return x[pattern.name] === pattern.value;
  });
  return l.length && l[0] || null;
};

util.uniq = function(data, field) {
  var map = {}, count = 0, i, k;
  for (i = 0; i < data.length; ++i) {
    k = data[i][field];
    if (!map[k]) {
      map[k] = 1;
      count += 1;
    }
  }
  return count;
};

util.minmax = function(data, field) {
  var stats = {min: +Infinity, max: -Infinity};
  for (i = 0; i < data.length; ++i) {
    var v = data[i][field];
    if (v > stats.max) stats.max = v;
    if (v < stats.min) stats.min = v;
  }
  return stats;
};

util.duplicate = function(obj) {
  return JSON.parse(JSON.stringify(obj));
};

util.any = function(arr, f) {
  var i = 0, k;
  for (k in arr) {
    if (f(arr[k], k, i++)) return true;
  }
  return false;
};

util.all = function(arr, f) {
  var i = 0, k;
  for (k in arr) {
    if (!f(arr[k], k, i++)) return false;
  }
  return true;
};

util.merge = function(dest, src) {
  return util.keys(src).reduce(function(c, k) {
    c[k] = src[k];
    return c;
  }, dest);
};

util.getbins = function(stats) {
  return vg.bins({
    min: stats.min,
    max: stats.max,
    maxbins: MAX_BINS
  });
};


util.error = function(msg) {
  console.error('[VL Error]', msg);
};


},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvdmwiLCJzcmMvRW5jb2RpbmcuanMiLCJzcmMvY29tcGlsZS9hZ2dyZWdhdGVzLmpzIiwic3JjL2NvbXBpbGUvYXhpcy5qcyIsInNyYy9jb21waWxlL2Jpbm5pbmcuanMiLCJzcmMvY29tcGlsZS9jb21waWxlLmpzIiwic3JjL2NvbXBpbGUvZmFjZXRpbmcuanMiLCJzcmMvY29tcGlsZS9ncm91cC5qcyIsInNyYy9jb21waWxlL2xheW91dC5qcyIsInNyYy9jb21waWxlL2xlZ2VuZC5qcyIsInNyYy9jb21waWxlL21hcmtzLmpzIiwic3JjL2NvbXBpbGUvc2NhbGUuanMiLCJzcmMvY29tcGlsZS9zdGFja2luZy5qcyIsInNyYy9jb21waWxlL3N1YmZhY2V0aW5nLmpzIiwic3JjL2NvbXBpbGUvdGVtcGxhdGUuanMiLCJzcmMvY29tcGlsZS90aW1lLmpzIiwic3JjL2NvbnN0cy5qcyIsInNyYy9kYXRhLmpzIiwic3JjL2ZpZWxkLmpzIiwic3JjL2dsb2JhbHMuanMiLCJzcmMvc2NoZW1hL3NjaGVtYS5qcyIsInNyYy9zY2hlbWEvc2NoZW1hdXRpbC5qcyIsInNyYy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi9nbG9iYWxzJyksXG4gICAgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpLFxuICAgIGNvbnN0cyA9IHJlcXVpcmUoJy4vY29uc3RzJyk7XG5cbnZhciB2bCA9IHV0aWwubWVyZ2UoY29uc3RzLCB1dGlsKTtcblxudmwuRW5jb2RpbmcgPSByZXF1aXJlKCcuL0VuY29kaW5nJyk7XG52bC5jb21waWxlID0gcmVxdWlyZSgnLi9jb21waWxlL2NvbXBpbGUnKTtcbnZsLmRhdGEgPSByZXF1aXJlKCcuL2RhdGEnKTtcbnZsLmZpZWxkID0gcmVxdWlyZSgnLi9maWVsZCcpO1xudmwuc2NoZW1hID0gcmVxdWlyZSgnLi9zY2hlbWEvc2NoZW1hJyk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSB2bDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vZ2xvYmFscycpLFxuICBjb25zdHMgPSByZXF1aXJlKCcuL2NvbnN0cycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyksXG4gIGZpZWxkID0gcmVxdWlyZSgnLi9maWVsZCcpLFxuICBzY2hlbWEgPSByZXF1aXJlKCcuL3NjaGVtYS9zY2hlbWEnKTtcblxudmFyIEVuY29kaW5nID0gbW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG5cbiAgZnVuY3Rpb24gRW5jb2RpbmcobWFya3R5cGUsIGVuYywgY29uZmlnKSB7XG4gICAgdmFyIGRlZmF1bHRzID0gc2NoZW1hLmluc3RhbnRpYXRlKCk7XG5cbiAgICB2YXIgc3BlYyA9IHtcbiAgICAgIG1hcmt0eXBlOiBtYXJrdHlwZSxcbiAgICAgIGVuYzogZW5jLFxuICAgICAgY2ZnOiBjb25maWdcbiAgICB9O1xuXG4gICAgLy8gSGFjayB0byBhZGQgZGVmYXVsdCBjb25zdGFudHMgdGhhdCBhcmUgbm90IGluIHRoZSBzY2hlbWFcbiAgICBmb3IgKHZhciBrIGluIGNvbnN0cy5ERUZBVUxUUykge1xuICAgICAgZGVmYXVsdHMuY2ZnW2tdID0gY29uc3RzLkRFRkFVTFRTW2tdO1xuICAgIH1cblxuICAgIC8vIHR5cGUgdG8gYml0Y29kZVxuICAgIGZvciAodmFyIGUgaW4gZGVmYXVsdHMuZW5jKSB7XG4gICAgICBkZWZhdWx0cy5lbmNbZV0udHlwZSA9IGNvbnN0cy5kYXRhVHlwZXNbZGVmYXVsdHMuZW5jW2VdLnR5cGVdO1xuICAgIH1cblxuICAgIHZhciBzcGVjRXh0ZW5kZWQgPSBzY2hlbWEudXRpbC5tZXJnZShkZWZhdWx0cywgc3BlYyk7XG5cbiAgICB0aGlzLl9tYXJrdHlwZSA9IHNwZWNFeHRlbmRlZC5tYXJrdHlwZTtcbiAgICB0aGlzLl9lbmMgPSBzcGVjRXh0ZW5kZWQuZW5jO1xuICAgIHRoaXMuX2NmZyA9IHNwZWNFeHRlbmRlZC5jZmc7XG4gIH1cblxuICB2YXIgcHJvdG8gPSBFbmNvZGluZy5wcm90b3R5cGU7XG5cbiAgcHJvdG8ubWFya3R5cGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFya3R5cGU7XG4gIH07XG5cbiAgcHJvdG8uaXMgPSBmdW5jdGlvbihtKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcmt0eXBlID09PSBtO1xuICB9O1xuXG4gIHByb3RvLmhhcyA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW5jW3hdLm5hbWUgIT09IHVuZGVmaW5lZDtcbiAgfTtcblxuICBwcm90by5lbmMgPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuY1t4XTtcbiAgfTtcblxuICAvLyBnZXQgXCJmaWVsZFwiIHByb3BlcnR5IGZvciB2ZWdhXG4gIHByb3RvLmZpZWxkID0gZnVuY3Rpb24oeCwgbm9kYXRhLCBub2ZuKSB7XG4gICAgaWYgKCF0aGlzLmhhcyh4KSkgcmV0dXJuIG51bGw7XG5cbiAgICB2YXIgZiA9IChub2RhdGEgPyAnJyA6ICdkYXRhLicpO1xuXG4gICAgaWYgKHRoaXMuX2VuY1t4XS5hZ2dyID09PSAnY291bnQnKSB7XG4gICAgICByZXR1cm4gZiArICdjb3VudCc7XG4gICAgfSBlbHNlIGlmICghbm9mbiAmJiB0aGlzLl9lbmNbeF0uYmluKSB7XG4gICAgICByZXR1cm4gZiArICdiaW5fJyArIHRoaXMuX2VuY1t4XS5uYW1lO1xuICAgIH0gZWxzZSBpZiAoIW5vZm4gJiYgdGhpcy5fZW5jW3hdLmFnZ3IpIHtcbiAgICAgIHJldHVybiBmICsgdGhpcy5fZW5jW3hdLmFnZ3IgKyAnXycgKyB0aGlzLl9lbmNbeF0ubmFtZTtcbiAgICB9IGVsc2UgaWYgKCFub2ZuICYmIHRoaXMuX2VuY1t4XS5mbikge1xuICAgICAgcmV0dXJuIGYgKyB0aGlzLl9lbmNbeF0uZm4gKyAnXycgKyB0aGlzLl9lbmNbeF0ubmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGYgKyB0aGlzLl9lbmNbeF0ubmFtZTtcbiAgICB9XG4gIH07XG5cbiAgcHJvdG8uZmllbGROYW1lID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB0aGlzLl9lbmNbeF0ubmFtZTtcbiAgfTtcblxuICBwcm90by5maWVsZFRpdGxlID0gZnVuY3Rpb24oeCkge1xuICAgIGlmICh0aGlzLl9lbmNbeF0uYWdncikge1xuICAgICAgcmV0dXJuIHRoaXMuX2VuY1t4XS5hZ2dyICsgJygnICsgdGhpcy5fZW5jW3hdLm5hbWUgKyAnKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLl9lbmNbeF0ubmFtZTtcbiAgICB9XG4gIH07XG5cbiAgcHJvdG8uc2NhbGUgPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuY1t4XS5zY2FsZSB8fCB7fTtcbiAgfTtcblxuICBwcm90by5heGlzID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB0aGlzLl9lbmNbeF0uYXhpcyB8fCB7fTtcbiAgfTtcblxuICBwcm90by5iYW5kID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB0aGlzLl9lbmNbeF0uYmFuZCB8fCB7fTtcbiAgfTtcblxuICBwcm90by5iYW5kU2l6ZSA9IGZ1bmN0aW9uKGVuY1R5cGUpIHtcbiAgICB2YXIgaXNCYW5kSW5TbWFsbE11bHRpcGxlcyA9XG4gICAgICAoZW5jVHlwZSA9PT0gWSAmJiB0aGlzLmhhcyhST1cpICYmIHRoaXMuaGFzKFkpKSB8fFxuICAgICAgKGVuY1R5cGUgPT09IFggJiYgdGhpcy5oYXMoQ09MKSAmJiB0aGlzLmhhcyhYKSk7XG5cbiAgICAvLyBpZiBiYW5kLnNpemUgaXMgZXhwbGljaXRseSBzcGVjaWZpZWQsIGZvbGxvdyB0aGUgc3BlY2lmaWNhdGlvbiwgb3RoZXJ3aXNlIGRyYXcgdmFsdWUgZnJvbSBjb25maWcuXG4gICAgcmV0dXJuIHRoaXMuYmFuZChlbmNUeXBlKS5zaXplIHx8XG4gICAgICB0aGlzLmNvbmZpZyhpc0JhbmRJblNtYWxsTXVsdGlwbGVzID8gJ211bHRpcGxlQmFuZFNpemUnIDogJ3NpbmdsZUJhbmRTaXplJyk7XG4gIH07XG5cbiAgcHJvdG8uYWdnciA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW5jW3hdLmFnZ3I7XG4gIH07XG5cbiAgcHJvdG8uYmluID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB0aGlzLl9lbmNbeF0uYmluO1xuICB9O1xuXG4gIHByb3RvLmxlZ2VuZCA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW5jW3hdLmxlZ2VuZDtcbiAgfTtcblxuICBwcm90by52YWx1ZSA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW5jW3hdLnZhbHVlO1xuICB9O1xuXG4gIHByb3RvLmZuID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB0aGlzLl9lbmNbeF0uZm47XG4gIH07XG5cbiAgcHJvdG8uYW55ID0gZnVuY3Rpb24oZikge1xuICAgIHJldHVybiB1dGlsLmFueSh0aGlzLl9lbmMsIGYpO1xuICB9O1xuXG4gIHByb3RvLmFsbCA9IGZ1bmN0aW9uKGYpIHtcbiAgICByZXR1cm4gdXRpbC5hbGwodGhpcy5fZW5jLCBmKTtcbiAgfTtcblxuICBwcm90by5sZW5ndGggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdXRpbC5rZXlzKHRoaXMuX2VuYykubGVuZ3RoO1xuICB9O1xuXG4gIHByb3RvLm1hcCA9IGZ1bmN0aW9uKGYpIHtcbiAgICB2YXIgYXJyID0gW10sIGs7XG4gICAgZm9yIChrIGluIHRoaXMuX2VuYykge1xuICAgICAgaWYodGhpcy5oYXMoaykpe1xuICAgICAgICBhcnIucHVzaChmKHRoaXMuX2VuY1trXSwgaywgdGhpcy5fZW5jKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhcnI7XG4gIH07XG5cbiAgcHJvdG8ucmVkdWNlID0gZnVuY3Rpb24oZiwgaW5pdCkge1xuICAgIHZhciByID0gaW5pdCwgaSA9IDAsIGs7XG4gICAgZm9yIChrIGluIHRoaXMuX2VuYykge1xuICAgICAgaWYgKHRoaXMuaGFzKGspKSB7XG4gICAgICAgIHIgPSBmKHIsIHRoaXMuX2VuY1trXSwgaywgdGhpcy5fZW5jKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHI7XG4gIH07XG5cbiAgcHJvdG8uZm9yRWFjaCA9IGZ1bmN0aW9uKGYpIHtcbiAgICB2YXIgaSA9IDAsIGs7XG4gICAgZm9yIChrIGluIHRoaXMuX2VuYykge1xuICAgICAgaWYgKHRoaXMuaGFzKGspKSB7XG4gICAgICAgIGYoaywgdGhpcy5fZW5jW2tdLCBpKyspO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBwcm90by50eXBlID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB0aGlzLmhhcyh4KSA/IHRoaXMuX2VuY1t4XS50eXBlIDogbnVsbDtcbiAgfTtcblxuICBwcm90by50ZXh0ID0gZnVuY3Rpb24ocHJvcCkge1xuICAgIHZhciB0ZXh0ID0gdGhpcy5fZW5jW1RFWFRdLnRleHQ7XG4gICAgcmV0dXJuIHByb3AgPyB0ZXh0W3Byb3BdIDogdGV4dDtcbiAgfTtcblxuICBwcm90by5mb250ID0gZnVuY3Rpb24ocHJvcCkge1xuICAgIHZhciBmb250ID0gdGhpcy5fZW5jW1RFWFRdLnRleHQ7XG4gICAgcmV0dXJuIHByb3AgPyBmb250W3Byb3BdIDogZm9udDtcbiAgfTtcblxuICBwcm90by5pc1R5cGUgPSBmdW5jdGlvbih4LCB0KSB7XG4gICAgdmFyIHh0ID0gdGhpcy50eXBlKHgpO1xuICAgIGlmICh4dCA9PT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiAoeHQgJiB0KSA+IDA7XG4gIH07XG5cbiAgZnVuY3Rpb24gaXNPcmRpbmFsU2NhbGUoZW5jb2RpbmcsIGVuY1R5cGUpe1xuICAgIHJldHVybiBlbmNvZGluZy5pc1R5cGUoZW5jVHlwZSwgTykgfHwgZW5jb2RpbmcuYmluKGVuY1R5cGUpIHx8XG4gICAgICAoZW5jb2RpbmcuaXNUeXBlKGVuY1R5cGUsIFQpICYmIGVuY29kaW5nLmZuKGVuY1R5cGUpKTtcbiAgfVxuXG4gIHByb3RvLmlzT3JkaW5hbFNjYWxlID0gZnVuY3Rpb24oZW5jVHlwZSkge1xuICAgIHJldHVybiB0aGlzLmhhcyhlbmNUeXBlKSAmJiBpc09yZGluYWxTY2FsZSh0aGlzLCBlbmNUeXBlKTtcbiAgfTtcblxuICBwcm90by5pc1F1YW50U2NhbGUgPSBmdW5jdGlvbihlbmNUeXBlKSB7XG4gICAgcmV0dXJuIHRoaXMuaGFzKGVuY1R5cGUpICYmICFpc09yZGluYWxTY2FsZSh0aGlzLCBlbmNUeXBlKTtcbiAgfTtcblxuICBwcm90by5pc0FnZ3JlZ2F0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpID0gMCwgaztcbiAgICBmb3IgKGsgaW4gdGhpcy5fZW5jKSB7XG4gICAgICBpZiAodGhpcy5oYXMoaykgJiYgdGhpcy5hZ2dyKGspKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgcHJvdG8uaXNSYXcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gIXRoaXMuaXNBZ2dyZWdhdGUoKTtcbiAgfTtcblxuICBwcm90by5pc0RpbWVuc2lvbiA9IGZ1bmN0aW9uKGVuY1R5cGUpIHtcbiAgICByZXR1cm4gdGhpcy5oYXMoZW5jVHlwZSkgJiYgdGhpcy5pc0FnZ3JlZ2F0ZSgpICYmXG4gICAgICBpc09yZGluYWxTY2FsZSh0aGlzLCBlbmNUeXBlKTtcbiAgfTtcblxuICBwcm90by5pc01lYXN1cmUgPSBmdW5jdGlvbihlbmNUeXBlKSB7XG4gICAgcmV0dXJuIHRoaXMuaGFzKGVuY1R5cGUpICYmIHRoaXMuaXNBZ2dyZWdhdGUoKSAmJlxuICAgICAgIWlzT3JkaW5hbFNjYWxlKHRoaXMsIGVuY1R5cGUpO1xuICB9O1xuXG4gIHByb3RvLmNvbmZpZyA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5fY2ZnW25hbWVdO1xuICB9O1xuXG4gIHByb3RvLnRvU3BlYyA9IGZ1bmN0aW9uKGV4Y2x1ZGVDb25maWcpIHtcbiAgICB2YXIgZW5jID0gdXRpbC5kdXBsaWNhdGUodGhpcy5fZW5jKSxcbiAgICAgIHNwZWM7XG5cbiAgICAvLyBjb252ZXJ0IHR5cGUncyBiaXRjb2RlIHRvIHR5cGUgbmFtZVxuICAgIGZvciAodmFyIGUgaW4gZW5jKSB7XG4gICAgICBlbmNbZV0udHlwZSA9IGNvbnN0cy5kYXRhVHlwZU5hbWVzW2VuY1tlXS50eXBlXTtcbiAgICB9XG5cbiAgICBzcGVjID0ge1xuICAgICAgbWFya3R5cGU6IHRoaXMuX21hcmt0eXBlLFxuICAgICAgZW5jOiBlbmNcbiAgICB9O1xuXG4gICAgaWYgKCFleGNsdWRlQ29uZmlnKSB7XG4gICAgICBzcGVjLmNmZyA9IHV0aWwuZHVwbGljYXRlKHRoaXMuX2NmZyk7XG4gICAgfVxuXG4gICAgLy8gcmVtb3ZlIGRlZmF1bHRzXG4gICAgdmFyIGRlZmF1bHRzID0gc2NoZW1hLmluc3RhbnRpYXRlKCk7XG4gICAgcmV0dXJuIHNjaGVtYS51dGlsLnN1YnRyYWN0KHNwZWMsIGRlZmF1bHRzKTtcbiAgfTtcblxuICBwcm90by50b1Nob3J0aGFuZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBlbmMgPSB0aGlzLl9lbmM7XG4gICAgcmV0dXJuIHRoaXMuX21hcmt0eXBlICsgJy4nICtcbiAgICAgIHRoaXMubWFwKGZ1bmN0aW9uKHYsIGUpIHtcbiAgICAgICAgcmV0dXJuIGUgKyAnLScgKyBmaWVsZC5zaG9ydGhhbmQodik7XG4gICAgICB9KS5qb2luKCcuJyk7XG4gIH07XG5cbiAgRW5jb2RpbmcucGFyc2VTaG9ydGhhbmQgPSBmdW5jdGlvbihzaG9ydGhhbmQsIGNmZykge1xuICAgIHZhciBlbmMgPSBzaG9ydGhhbmQuc3BsaXQoJy4nKSxcbiAgICAgIG1hcmt0eXBlID0gZW5jLnNoaWZ0KCk7XG5cbiAgICBlbmMgPSBlbmMucmVkdWNlKGZ1bmN0aW9uKG0sIGUpIHtcbiAgICAgIHZhciBzcGxpdCA9IGUuc3BsaXQoJy0nKSxcbiAgICAgICAgZW5jdHlwZSA9IHNwbGl0WzBdLFxuICAgICAgICBvID0ge25hbWU6IHNwbGl0WzFdLCB0eXBlOiBjb25zdHMuZGF0YVR5cGVzW3NwbGl0WzJdXX07XG5cbiAgICAgIC8vIGNoZWNrIGFnZ3JlZ2F0ZSB0eXBlXG4gICAgICBmb3IgKHZhciBpIGluIHNjaGVtYS5hZ2dyLmVudW0pIHtcbiAgICAgICAgdmFyIGEgPSBzY2hlbWEuYWdnci5lbnVtW2ldO1xuICAgICAgICBpZiAoby5uYW1lLmluZGV4T2YoYSArICdfJykgPT09IDApIHtcbiAgICAgICAgICBvLm5hbWUgPSBvLm5hbWUuc3Vic3RyKGEubGVuZ3RoICsgMSk7XG4gICAgICAgICAgaWYgKGEgPT0gJ2NvdW50JyAmJiBvLm5hbWUubGVuZ3RoID09PSAwKSBvLm5hbWUgPSAnKic7XG4gICAgICAgICAgby5hZ2dyID0gYTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gY2hlY2sgdGltZSBmblxuICAgICAgZm9yICh2YXIgaSBpbiBzY2hlbWEudGltZWZucykge1xuICAgICAgICB2YXIgZiA9IHNjaGVtYS50aW1lZm5zW2ldO1xuICAgICAgICBpZiAoby5uYW1lICYmIG8ubmFtZS5pbmRleE9mKGYgKyAnXycpID09PSAwKSB7XG4gICAgICAgICAgby5uYW1lID0gby5uYW1lLnN1YnN0cihvLmxlbmd0aCArIDEpO1xuICAgICAgICAgIG8uZm4gPSBmO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIGNoZWNrIGJpblxuICAgICAgaWYgKG8ubmFtZSAmJiBvLm5hbWUuaW5kZXhPZignYmluXycpID09PSAwKSB7XG4gICAgICAgIG8ubmFtZSA9IG8ubmFtZS5zdWJzdHIoNCk7XG4gICAgICAgIG8uYmluID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgbVtlbmN0eXBlXSA9IG87XG4gICAgICByZXR1cm4gbTtcbiAgICB9LCB7fSk7XG5cbiAgICByZXR1cm4gbmV3IEVuY29kaW5nKG1hcmt0eXBlLCBlbmMsIGNmZyk7XG4gIH07XG5cbiAgRW5jb2RpbmcuZnJvbVNwZWMgPSBmdW5jdGlvbihzcGVjLCBleHRyYUNmZykge1xuICAgIHZhciBlbmMgPSB1dGlsLmR1cGxpY2F0ZShzcGVjLmVuYyk7XG5cbiAgICAvL2NvbnZlcnQgdHlwZSBmcm9tIHN0cmluZyB0byBiaXRjb2RlIChlLmcsIE89MSlcbiAgICBmb3IgKHZhciBlIGluIGVuYykge1xuICAgICAgZW5jW2VdLnR5cGUgPSBjb25zdHMuZGF0YVR5cGVzW2VuY1tlXS50eXBlXTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IEVuY29kaW5nKHNwZWMubWFya3R5cGUsIGVuYywgdXRpbC5tZXJnZShzcGVjLmNmZywgZXh0cmFDZmcgfHwge30pKTtcbiAgfTtcblxuICByZXR1cm4gRW5jb2Rpbmc7XG5cbn0pKCk7XG4iLCJ2YXIgZ2xvYmFscyA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBhZ2dyZWdhdGVzO1xuXG5mdW5jdGlvbiBhZ2dyZWdhdGVzKHNwZWMsIGVuY29kaW5nLCBvcHQpIHtcbiAgb3B0ID0gb3B0IHx8IHt9O1xuICB2YXIgZGltcyA9IHt9LCBtZWFzID0ge30sIGRldGFpbCA9IHt9LCBmYWNldHMgPSB7fTtcbiAgZW5jb2RpbmcuZm9yRWFjaChmdW5jdGlvbihlbmNUeXBlLCBmaWVsZCkge1xuICAgIGlmIChmaWVsZC5hZ2dyKSB7XG4gICAgICBpZiAoZmllbGQuYWdnciA9PT0gJ2NvdW50Jykge1xuICAgICAgICBtZWFzWydjb3VudCddID0ge29wOiAnY291bnQnLCBmaWVsZDogJyonfTtcbiAgICAgIH1lbHNlIHtcbiAgICAgICAgbWVhc1tmaWVsZC5hZ2dyICsgJ3wnKyBmaWVsZC5uYW1lXSA9IHtcbiAgICAgICAgICBvcDogZmllbGQuYWdncixcbiAgICAgICAgICBmaWVsZDogJ2RhdGEuJysgZmllbGQubmFtZVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBkaW1zW2ZpZWxkLm5hbWVdID0gZW5jb2RpbmcuZmllbGQoZW5jVHlwZSk7XG4gICAgICBpZiAoZW5jVHlwZSA9PSBST1cgfHwgZW5jVHlwZSA9PSBDT0wpIHtcbiAgICAgICAgZmFjZXRzW2ZpZWxkLm5hbWVdID0gZGltc1tmaWVsZC5uYW1lXTtcbiAgICAgIH1lbHNlIGlmIChlbmNUeXBlICE9PSBYICYmIGVuY1R5cGUgIT09IFkpIHtcbiAgICAgICAgZGV0YWlsW2ZpZWxkLm5hbWVdID0gZGltc1tmaWVsZC5uYW1lXTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICBkaW1zID0gdXRpbC52YWxzKGRpbXMpO1xuICBtZWFzID0gdXRpbC52YWxzKG1lYXMpO1xuXG4gIGlmIChtZWFzLmxlbmd0aCA+IDAgJiYgIW9wdC5wcmVhZ2dyZWdhdGVkRGF0YSkge1xuICAgIGlmICghc3BlYy50cmFuc2Zvcm0pIHNwZWMudHJhbnNmb3JtID0gW107XG4gICAgc3BlYy50cmFuc2Zvcm0ucHVzaCh7XG4gICAgICB0eXBlOiAnYWdncmVnYXRlJyxcbiAgICAgIGdyb3VwYnk6IGRpbXMsXG4gICAgICBmaWVsZHM6IG1lYXNcbiAgICB9KTtcblxuICAgIGlmIChlbmNvZGluZy5tYXJrdHlwZSgpID09PSBURVhUKSB7XG4gICAgICBtZWFzLmZvckVhY2goZnVuY3Rpb24obSkge1xuICAgICAgICB2YXIgZmllbGROYW1lID0gbS5maWVsZC5zdWJzdHIoNSksIC8vcmVtb3ZlIFwiZGF0YS5cIlxuICAgICAgICAgIGZpZWxkID0gJ2RhdGEuJyArIChtLm9wID8gbS5vcCArICdfJyA6ICcnKSArIGZpZWxkTmFtZTtcbiAgICAgICAgc3BlYy50cmFuc2Zvcm0ucHVzaCh7XG4gICAgICAgICAgdHlwZTogJ2Zvcm11bGEnLFxuICAgICAgICAgIGZpZWxkOiBmaWVsZCxcbiAgICAgICAgICBleHByOiBcImQzLmZvcm1hdCgnLjJmJykoZC5cIiArIGZpZWxkICsgJyknXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIHJldHVybiB7XG4gICAgZGV0YWlsczogdXRpbC52YWxzKGRldGFpbCksXG4gICAgZGltczogZGltcyxcbiAgICBmYWNldHM6IHV0aWwudmFscyhmYWNldHMpLFxuICAgIGFnZ3JlZ2F0ZWQ6IG1lYXMubGVuZ3RoID4gMFxuICB9O1xufVxuIiwidmFyIGdsb2JhbHMgPSByZXF1aXJlKCcuLi9nbG9iYWxzJyksXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cbnZhciBheGlzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuYXhpcy5uYW1lcyA9IGZ1bmN0aW9uKHByb3BzKSB7XG4gIHJldHVybiB1dGlsLmtleXModXRpbC5rZXlzKHByb3BzKS5yZWR1Y2UoZnVuY3Rpb24oYSwgeCkge1xuICAgIHZhciBzID0gcHJvcHNbeF0uc2NhbGU7XG4gICAgaWYgKHMgPT09IFggfHwgcyA9PT0gWSkgYVtwcm9wc1t4XS5zY2FsZV0gPSAxO1xuICAgIHJldHVybiBhO1xuICB9LCB7fSkpO1xufTtcblxuYXhpcy5kZWZzID0gZnVuY3Rpb24obmFtZXMsIGVuY29kaW5nLCBvcHQpIHtcbiAgcmV0dXJuIG5hbWVzLnJlZHVjZShmdW5jdGlvbihhLCBuYW1lKSB7XG4gICAgYS5wdXNoKGF4aXMuZGVmKG5hbWUsIGVuY29kaW5nLCBvcHQpKTtcbiAgICByZXR1cm4gYTtcbiAgfSwgW10pO1xufTtcblxuYXhpcy5kZWYgPSBmdW5jdGlvbihuYW1lLCBlbmNvZGluZywgb3B0KSB7XG4gIHZhciB0eXBlID0gbmFtZTtcbiAgdmFyIGlzQ29sID0gbmFtZSA9PSBDT0wsIGlzUm93ID0gbmFtZSA9PSBST1c7XG4gIGlmIChpc0NvbCkgdHlwZSA9ICd4JztcbiAgaWYgKGlzUm93KSB0eXBlID0gJ3knO1xuXG4gIHZhciBkZWYgPSB7XG4gICAgdHlwZTogdHlwZSxcbiAgICBzY2FsZTogbmFtZVxuICB9O1xuXG4gIGlmIChlbmNvZGluZy5pc1F1YW50U2NhbGUobmFtZSkpIHtcbiAgICAvL1RPRE8oa2FuaXR3KTogYmV0dGVyIGRldGVybWluZSAjIG9mIHRpY2tzXG4gICAgZGVmLnRpY2tzID0gMztcbiAgfVxuXG4gIGlmIChlbmNvZGluZy5heGlzKG5hbWUpLmdyaWQpIHtcbiAgICBkZWYuZ3JpZCA9IHRydWU7XG4gICAgZGVmLmxheWVyID0gJ2JhY2snO1xuICB9XG5cbiAgaWYgKGVuY29kaW5nLmF4aXMobmFtZSkudGl0bGUpIHtcbiAgICAvL3Nob3cgdGl0bGUgYnkgZGVmYXVsdFxuXG4gICAgZGVmID0gYXhpc190aXRsZShkZWYsIG5hbWUsIGVuY29kaW5nLCBvcHQpO1xuICB9XG5cbiAgaWYgKGlzUm93IHx8IGlzQ29sKSB7XG4gICAgZGVmLnByb3BlcnRpZXMgPSB7XG4gICAgICB0aWNrczogeyBvcGFjaXR5OiB7dmFsdWU6IDB9IH0sXG4gICAgICBtYWpvclRpY2tzOiB7IG9wYWNpdHk6IHt2YWx1ZTogMH0gfSxcbiAgICAgIGF4aXM6IHsgb3BhY2l0eToge3ZhbHVlOiAwfSB9XG4gICAgfTtcbiAgfVxuICBpZiAoaXNDb2wpIHtcbiAgICBkZWYub2Zmc2V0ID0gW29wdC54QXhpc01hcmdpbiB8fCAwLCBlbmNvZGluZy5jb25maWcoJ3lBeGlzTWFyZ2luJyldO1xuICAgIGRlZi5vcmllbnQgPSAndG9wJztcbiAgfVxuXG4gIGlmIChuYW1lID09ICd4JyAmJiBlbmNvZGluZy5pc09yZGluYWxTY2FsZShYKSkge1xuICAgIGRlZi5wcm9wZXJ0aWVzID0ge1xuICAgICAgbGFiZWxzOiB7XG4gICAgICAgIGFuZ2xlOiB7dmFsdWU6IDI3MH0sXG4gICAgICAgIGFsaWduOiB7dmFsdWU6ICdyaWdodCd9LFxuICAgICAgICBiYXNlbGluZToge3ZhbHVlOiAnbWlkZGxlJ31cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgaWYgKGVuY29kaW5nLmF4aXMoWCkuZm9ybWF0KSB7XG4gICAgZGVmLmZvcm1hdCA9IGVuY29kaW5nLmF4aXMoWCkuZm9ybWF0O1xuICB9IGVsc2UgaWYgKGVuY29kaW5nLmlzVHlwZShuYW1lLCBRKSkge1xuICAgIGRlZi5mb3JtYXQgPSBcInNcIjtcbiAgfSBlbHNlIGlmIChlbmNvZGluZy5pc1R5cGUobmFtZSwgVCkpIHtcbiAgICBkZWYuZm9ybWF0ID0gXCIlWS0lbS0lZFwiO1xuICB9XG5cbiAgLy8gYWRkIGN1c3RvbSBsYWJlbCBmb3IgdGltZSB0eXBlXG4gIGlmIChlbmNvZGluZy5pc1R5cGUobmFtZSwgVCkgJiYgZW5jb2RpbmcuZm4obmFtZSkpIHtcbiAgICB2YXIgZm4gPSBlbmNvZGluZy5mbihuYW1lKSxcbiAgICAgIHByb3BlcnRpZXMgPSBkZWYucHJvcGVydGllcyA9IGRlZi5wcm9wZXJ0aWVzIHx8IHt9LFxuICAgICAgbGFiZWxzID0gcHJvcGVydGllcy5sYWJlbHMgPSBwcm9wZXJ0aWVzLmxhYmVscyB8fCB7fSxcbiAgICAgIHRleHQgPSBsYWJlbHMudGV4dCA9IGxhYmVscy50ZXh0IHx8IHt9O1xuXG4gICAgc3dpdGNoIChmbikge1xuICAgICAgY2FzZSAnZGF5JzpcbiAgICAgIGNhc2UgJ21vbnRoJzpcbiAgICAgICAgdGV4dC5zY2FsZSA9ICd0aW1lLScrIGZuO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZGVmO1xufTtcblxuZnVuY3Rpb24gYXhpc190aXRsZShheGlzLCBuYW1lLCBlbmNvZGluZywgb3B0KSB7XG4gIGF4aXMudGl0bGUgPSBlbmNvZGluZy5maWVsZFRpdGxlKG5hbWUpO1xuICBpZiAobmFtZSA9PSBZKSB7XG4gICAgYXhpcy50aXRsZU9mZnNldCA9IDYwO1xuICAgIC8vIFRPRE86IHNldCBhcHByb3ByaWF0ZSB0aXRsZU9mZnNldFxuICAgIC8vIG1heWJlIGJhc2VkIG9uIHNvbWUgc3RyaW5nIGxlbmd0aCBmcm9tIHN0YXRzXG4gIH1cbiAgcmV0dXJuIGF4aXM7XG59XG4iLCJ2YXIgZ2xvYmFscyA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBiaW5uaW5nO1xuXG5mdW5jdGlvbiBiaW5uaW5nKHNwZWMsIGVuY29kaW5nLCBvcHQpIHtcbiAgb3B0ID0gb3B0IHx8IHt9O1xuICB2YXIgYmlucyA9IHt9O1xuICBlbmNvZGluZy5mb3JFYWNoKGZ1bmN0aW9uKHZ2LCBkKSB7XG4gICAgaWYgKGQuYmluKSBiaW5zW2QubmFtZV0gPSBkLm5hbWU7XG4gIH0pO1xuICBiaW5zID0gdXRpbC5rZXlzKGJpbnMpO1xuXG4gIGlmIChiaW5zLmxlbmd0aCA9PT0gMCB8fCBvcHQucHJlYWdncmVnYXRlZERhdGEpIHJldHVybiBmYWxzZTtcblxuICBpZiAoIXNwZWMudHJhbnNmb3JtKSBzcGVjLnRyYW5zZm9ybSA9IFtdO1xuICBiaW5zLmZvckVhY2goZnVuY3Rpb24oZCkge1xuICAgIHNwZWMudHJhbnNmb3JtLnB1c2goe1xuICAgICAgdHlwZTogJ2JpbicsXG4gICAgICBmaWVsZDogJ2RhdGEuJyArIGQsXG4gICAgICBvdXRwdXQ6ICdkYXRhLmJpbl8nICsgZCxcbiAgICAgIG1heGJpbnM6IE1BWF9CSU5TXG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gYmlucztcbn1cbiIsInZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbXBpbGU7XG5cbnZhciB0ZW1wbGF0ZSA9IGNvbXBpbGUudGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlJyksXG4gIGxheW91dCA9IGNvbXBpbGUubGF5b3V0ID0gcmVxdWlyZSgnLi9sYXlvdXQnKSxcbiAgYXhpcyA9IGNvbXBpbGUuYXhpcyA9IHJlcXVpcmUoJy4vYXhpcycpLFxuICBncm91cCA9IGNvbXBpbGUuZ3JvdXAgPSByZXF1aXJlKCcuL2dyb3VwJyksXG4gIGxlZ2VuZCA9IGNvbXBpbGUubGVnZW5kID0gcmVxdWlyZSgnLi9sZWdlbmQnKSxcbiAgbWFya3MgPSBjb21waWxlLm1hcmtzID0gcmVxdWlyZSgnLi9tYXJrcycpLFxuICBzY2FsZSA9IGNvbXBpbGUuc2NhbGUgPSByZXF1aXJlKCcuL3NjYWxlJyksXG4gIHRpbWUgPSBjb21waWxlLnRpbWUgPSByZXF1aXJlKCcuL3RpbWUnKSxcbiAgYWdncmVnYXRlcyA9IGNvbXBpbGUuYWdncmVnYXRlcyA9IHJlcXVpcmUoJy4vYWdncmVnYXRlcycpLFxuICBiaW5uaW5nID0gY29tcGlsZS5iaW5uaW5nID0gcmVxdWlyZSgnLi9iaW5uaW5nJyksXG4gIGZhY2V0aW5nID0gY29tcGlsZS5mYWNldGluZyA9IHJlcXVpcmUoJy4vZmFjZXRpbmcnKSxcbiAgc3RhY2tpbmcgPSBjb21waWxlLnN0YWNraW5nID0gcmVxdWlyZSgnLi9zdGFja2luZycpO1xuICBzdWJmYWNldGluZyA9IGNvbXBpbGUuc3ViZmFjZXRpbmcgPSByZXF1aXJlKCcuL3N1YmZhY2V0aW5nJyk7XG5cblxuZnVuY3Rpb24gY29tcGlsZShlbmNvZGluZywgc3RhdHMpIHtcbiAgdmFyIHNpemUgPSBsYXlvdXQuc2V0U2l6ZShlbmNvZGluZywgc3RhdHMpLFxuICAgIGNlbGxXaWR0aCA9IHNpemUuY2VsbFdpZHRoLFxuICAgIGNlbGxIZWlnaHQgPSBzaXplLmNlbGxIZWlnaHQ7XG5cbiAgdmFyIGhhc0FnZyA9IGVuY29kaW5nLmFueShmdW5jdGlvbih2LCBrKSB7XG4gICAgcmV0dXJuIHYuYWdnciAhPT0gdW5kZWZpbmVkO1xuICB9KTtcblxuICB2YXIgc3BlYyA9IHRlbXBsYXRlKGVuY29kaW5nLCBzaXplLCBzdGF0cyksXG4gICAgZ3JvdXAgPSBzcGVjLm1hcmtzWzBdLFxuICAgIG1hcmsgPSBtYXJrc1tlbmNvZGluZy5tYXJrdHlwZSgpXSxcbiAgICBtZGVmID0gbWFya3MuZGVmKG1hcmssIGVuY29kaW5nLCB7XG4gICAgICBoYXNBZ2dyZWdhdGU6IGhhc0FnZ1xuICAgIH0pO1xuXG4gIHZhciBoYXNSb3cgPSBlbmNvZGluZy5oYXMoUk9XKSwgaGFzQ29sID0gZW5jb2RpbmcuaGFzKENPTCk7XG5cbiAgdmFyIHByZWFnZ3JlZ2F0ZWREYXRhID0gZW5jb2RpbmcuY29uZmlnKCd1c2VWZWdhU2VydmVyJyk7XG5cbiAgZ3JvdXAubWFya3MucHVzaChtZGVmKTtcbiAgLy8gVE9ETzogcmV0dXJuIHZhbHVlIG5vdCB1c2VkXG4gIGJpbm5pbmcoc3BlYy5kYXRhWzBdLCBlbmNvZGluZywge3ByZWFnZ3JlZ2F0ZWREYXRhOiBwcmVhZ2dyZWdhdGVkRGF0YX0pO1xuXG4gIHZhciBsaW5lVHlwZSA9IG1hcmtzW2VuY29kaW5nLm1hcmt0eXBlKCldLmxpbmU7XG5cbiAgaWYgKCFwcmVhZ2dyZWdhdGVkRGF0YSkge1xuICAgIHNwZWMgPSB0aW1lKHNwZWMsIGVuY29kaW5nKTtcbiAgfVxuXG4gIC8vIGhhbmRsZSBzdWJmYWNldHNcbiAgdmFyIGFnZ1Jlc3VsdCA9IGFnZ3JlZ2F0ZXMoc3BlYy5kYXRhWzBdLCBlbmNvZGluZywge3ByZWFnZ3JlZ2F0ZWREYXRhOiBwcmVhZ2dyZWdhdGVkRGF0YX0pLFxuICAgIGRldGFpbHMgPSBhZ2dSZXN1bHQuZGV0YWlscyxcbiAgICBoYXNEZXRhaWxzID0gZGV0YWlscyAmJiBkZXRhaWxzLmxlbmd0aCA+IDAsXG4gICAgc3RhY2sgPSBoYXNEZXRhaWxzICYmIHN0YWNraW5nKHNwZWMsIGVuY29kaW5nLCBtZGVmLCBhZ2dSZXN1bHQuZmFjZXRzKTtcblxuICBpZiAoaGFzRGV0YWlscyAmJiAoc3RhY2sgfHwgbGluZVR5cGUpKSB7XG4gICAgLy9zdWJmYWNldCB0byBncm91cCBzdGFjayAvIGxpbmUgdG9nZXRoZXIgaW4gb25lIGdyb3VwXG4gICAgc3ViZmFjZXRpbmcoZ3JvdXAsIG1kZWYsIGRldGFpbHMsIHN0YWNrLCBlbmNvZGluZyk7XG4gIH1cblxuICAvLyBhdXRvLXNvcnQgbGluZS9hcmVhIHZhbHVlc1xuICAvL1RPRE8oa2FuaXR3KTogaGF2ZSBzb21lIGNvbmZpZyB0byB0dXJuIG9mZiBhdXRvLXNvcnQgZm9yIGxpbmUgKGZvciBsaW5lIGNoYXJ0IHRoYXQgZW5jb2RlcyB0ZW1wb3JhbCBpbmZvcm1hdGlvbilcbiAgaWYgKGxpbmVUeXBlKSB7XG4gICAgdmFyIGYgPSAoZW5jb2RpbmcuaXNRdWFudFNjYWxlKFgpICYmIGVuY29kaW5nLmlzT3JkaW5hbFNjYWxlKFkpKSA/IFkgOiBYO1xuICAgIGlmICghbWRlZi5mcm9tKSBtZGVmLmZyb20gPSB7fTtcbiAgICBtZGVmLmZyb20udHJhbnNmb3JtID0gW3t0eXBlOiAnc29ydCcsIGJ5OiBlbmNvZGluZy5maWVsZChmKX1dO1xuICB9XG5cbiAgLy8gU21hbGwgTXVsdGlwbGVzXG4gIGlmIChoYXNSb3cgfHwgaGFzQ29sKSB7XG4gICAgc3BlYyA9IGZhY2V0aW5nKGdyb3VwLCBlbmNvZGluZywgY2VsbEhlaWdodCwgY2VsbFdpZHRoLCBzcGVjLCBtZGVmLCBzdGFjaywgc3RhdHMpO1xuICAgIHNwZWMubGVnZW5kcyA9IGxlZ2VuZC5kZWZzKGVuY29kaW5nKTtcbiAgfSBlbHNlIHtcbiAgICBncm91cC5zY2FsZXMgPSBzY2FsZS5kZWZzKHNjYWxlLm5hbWVzKG1kZWYucHJvcGVydGllcy51cGRhdGUpLCBlbmNvZGluZyxcbiAgICAgIHtzdGFjazogc3RhY2ssIHN0YXRzOiBzdGF0c30pO1xuICAgIGdyb3VwLmF4ZXMgPSBheGlzLmRlZnMoYXhpcy5uYW1lcyhtZGVmLnByb3BlcnRpZXMudXBkYXRlKSwgZW5jb2RpbmcpO1xuICAgIGdyb3VwLmxlZ2VuZHMgPSBsZWdlbmQuZGVmcyhlbmNvZGluZyk7XG4gIH1cbiAgcmV0dXJuIHNwZWM7XG59XG5cbiIsInZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG52YXIgYXhpcyA9IHJlcXVpcmUoJy4vYXhpcycpLFxuICBncm91cGRlZiA9IHJlcXVpcmUoJy4vZ3JvdXAnKS5kZWYsXG4gIHNjYWxlID0gcmVxdWlyZSgnLi9zY2FsZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZhY2V0aW5nO1xuXG5mdW5jdGlvbiBmYWNldGluZyhncm91cCwgZW5jb2RpbmcsIGNlbGxIZWlnaHQsIGNlbGxXaWR0aCwgc3BlYywgbWRlZiwgc3RhY2ssIHN0YXRzKSB7XG4gIHZhciBlbnRlciA9IGdyb3VwLnByb3BlcnRpZXMuZW50ZXI7XG4gIHZhciBmYWNldEtleXMgPSBbXSwgY2VsbEF4ZXMgPSBbXTtcblxuICB2YXIgaGFzUm93ID0gZW5jb2RpbmcuaGFzKFJPVyksIGhhc0NvbCA9IGVuY29kaW5nLmhhcyhDT0wpO1xuXG4gIHZhciB4QXhpc01hcmdpbiA9IGVuY29kaW5nLmhhcyhZKSA/IGVuY29kaW5nLmNvbmZpZygneEF4aXNNYXJnaW4nKSA6IHVuZGVmaW5lZDtcblxuICBlbnRlci5maWxsID0ge3ZhbHVlOiBlbmNvZGluZy5jb25maWcoJ2NlbGxCYWNrZ3JvdW5kQ29sb3InKX07XG5cbiAgLy9tb3ZlIFwiZnJvbVwiIHRvIGNlbGwgbGV2ZWwgYW5kIGFkZCBmYWNldCB0cmFuc2Zvcm1cbiAgZ3JvdXAuZnJvbSA9IHtkYXRhOiBncm91cC5tYXJrc1swXS5mcm9tLmRhdGF9O1xuXG4gIGlmIChncm91cC5tYXJrc1swXS5mcm9tLnRyYW5zZm9ybSkge1xuICAgIGRlbGV0ZSBncm91cC5tYXJrc1swXS5mcm9tLmRhdGE7IC8vbmVlZCB0byBrZWVwIHRyYW5zZm9ybSBmb3Igc3ViZmFjZXR0aW5nIGNhc2VcbiAgfSBlbHNlIHtcbiAgICBkZWxldGUgZ3JvdXAubWFya3NbMF0uZnJvbTtcbiAgfVxuICBpZiAoaGFzUm93KSB7XG4gICAgaWYgKCFlbmNvZGluZy5pc09yZGluYWxTY2FsZShST1cpKSB7XG4gICAgICB1dGlsLmVycm9yKCdSb3cgZW5jb2Rpbmcgc2hvdWxkIGJlIG9yZGluYWwuJyk7XG4gICAgfVxuICAgIGVudGVyLnkgPSB7c2NhbGU6IFJPVywgZmllbGQ6ICdrZXlzLicgKyBmYWNldEtleXMubGVuZ3RofTtcbiAgICBlbnRlci5oZWlnaHQgPSB7J3ZhbHVlJzogY2VsbEhlaWdodH07IC8vIEhBQ0tcblxuICAgIGZhY2V0S2V5cy5wdXNoKGVuY29kaW5nLmZpZWxkKFJPVykpO1xuXG4gICAgdmFyIGZyb207XG4gICAgaWYgKGhhc0NvbCkge1xuICAgICAgZnJvbSA9IHV0aWwuZHVwbGljYXRlKGdyb3VwLmZyb20pO1xuICAgICAgZnJvbS50cmFuc2Zvcm0gPSBmcm9tLnRyYW5zZm9ybSB8fCBbXTtcbiAgICAgIGZyb20udHJhbnNmb3JtLnVuc2hpZnQoe3R5cGU6ICdmYWNldCcsIGtleXM6IFtlbmNvZGluZy5maWVsZChDT0wpXX0pO1xuICAgIH1cblxuICAgIHZhciBheGVzR3JwID0gZ3JvdXBkZWYoJ3gtYXhlcycsIHtcbiAgICAgICAgYXhlczogZW5jb2RpbmcuaGFzKFgpID8gYXhpcy5kZWZzKFsneCddLCBlbmNvZGluZykgOiB1bmRlZmluZWQsXG4gICAgICAgIHg6IGhhc0NvbCA/IHtzY2FsZTogQ09MLCBmaWVsZDogJ2tleXMuMCcsIG9mZnNldDogeEF4aXNNYXJnaW59IDoge3ZhbHVlOiB4QXhpc01hcmdpbn0sXG4gICAgICAgIHdpZHRoOiBoYXNDb2wgJiYgeyd2YWx1ZSc6IGNlbGxXaWR0aH0sIC8vSEFDSz9cbiAgICAgICAgZnJvbTogZnJvbVxuICAgICAgfSk7XG5cbiAgICBzcGVjLm1hcmtzLnB1c2goYXhlc0dycCk7XG4gICAgKHNwZWMuYXhlcyA9IHNwZWMuYXhlcyB8fCBbXSk7XG4gICAgc3BlYy5heGVzLnB1c2guYXBwbHkoc3BlYy5heGVzLCBheGlzLmRlZnMoWydyb3cnXSwgZW5jb2RpbmcpKTtcbiAgfSBlbHNlIHsgLy8gZG9lc24ndCBoYXZlIHJvd1xuICAgIGlmIChlbmNvZGluZy5oYXMoWCkpIHtcbiAgICAgIC8va2VlcCB4IGF4aXMgaW4gdGhlIGNlbGxcbiAgICAgIGNlbGxBeGVzLnB1c2guYXBwbHkoY2VsbEF4ZXMsIGF4aXMuZGVmcyhbJ3gnXSwgZW5jb2RpbmcpKTtcbiAgICB9XG4gIH1cblxuICBpZiAoaGFzQ29sKSB7XG4gICAgaWYgKCFlbmNvZGluZy5pc09yZGluYWxTY2FsZShDT0wpKSB7XG4gICAgICB1dGlsLmVycm9yKCdDb2wgZW5jb2Rpbmcgc2hvdWxkIGJlIG9yZGluYWwuJyk7XG4gICAgfVxuICAgIGVudGVyLnggPSB7c2NhbGU6IENPTCwgZmllbGQ6ICdrZXlzLicgKyBmYWNldEtleXMubGVuZ3RofTtcbiAgICBlbnRlci53aWR0aCA9IHsndmFsdWUnOiBjZWxsV2lkdGh9OyAvLyBIQUNLXG5cbiAgICBmYWNldEtleXMucHVzaChlbmNvZGluZy5maWVsZChDT0wpKTtcblxuICAgIHZhciBmcm9tO1xuICAgIGlmIChoYXNSb3cpIHtcbiAgICAgIGZyb20gPSB1dGlsLmR1cGxpY2F0ZShncm91cC5mcm9tKTtcbiAgICAgIGZyb20udHJhbnNmb3JtID0gZnJvbS50cmFuc2Zvcm0gfHwgW107XG4gICAgICBmcm9tLnRyYW5zZm9ybS51bnNoaWZ0KHt0eXBlOiAnZmFjZXQnLCBrZXlzOiBbZW5jb2RpbmcuZmllbGQoUk9XKV19KTtcbiAgICB9XG5cbiAgICB2YXIgYXhlc0dycCA9IGdyb3VwZGVmKCd5LWF4ZXMnLCB7XG4gICAgICBheGVzOiBlbmNvZGluZy5oYXMoWSkgPyBheGlzLmRlZnMoWyd5J10sIGVuY29kaW5nKSA6IHVuZGVmaW5lZCxcbiAgICAgIHk6IGhhc1JvdyAmJiB7c2NhbGU6IFJPVywgZmllbGQ6ICdrZXlzLjAnfSxcbiAgICAgIHg6IGhhc1JvdyAmJiB7dmFsdWU6IHhBeGlzTWFyZ2lufSxcbiAgICAgIGhlaWdodDogaGFzUm93ICYmIHsndmFsdWUnOiBjZWxsSGVpZ2h0fSwgLy9IQUNLP1xuICAgICAgZnJvbTogZnJvbVxuICAgIH0pO1xuXG4gICAgc3BlYy5tYXJrcy5wdXNoKGF4ZXNHcnApO1xuICAgIChzcGVjLmF4ZXMgPSBzcGVjLmF4ZXMgfHwgW10pO1xuICAgIHNwZWMuYXhlcy5wdXNoLmFwcGx5KHNwZWMuYXhlcywgYXhpcy5kZWZzKFsnY29sJ10sIGVuY29kaW5nLCB7XG4gICAgICB4QXhpc01hcmdpbjogeEF4aXNNYXJnaW5cbiAgICB9KSk7XG4gIH0gZWxzZSB7IC8vIGRvZXNuJ3QgaGF2ZSBjb2xcbiAgICBpZiAoZW5jb2RpbmcuaGFzKFkpKSB7XG4gICAgICBjZWxsQXhlcy5wdXNoLmFwcGx5KGNlbGxBeGVzLCBheGlzLmRlZnMoWyd5J10sIGVuY29kaW5nKSk7XG4gICAgfVxuICB9XG5cbiAgaWYgKGhhc1Jvdykge1xuICAgIGlmIChlbnRlci54KSBlbnRlci54Lm9mZnNldCA9IHhBeGlzTWFyZ2luO1xuICAgIGVsc2UgZW50ZXIueCA9IHt2YWx1ZTogeEF4aXNNYXJnaW59O1xuICB9XG4gIGlmIChoYXNDb2wpIHtcbiAgICAvL1RPRE8gZmlsbCBoZXJlLi5cbiAgfVxuXG4gIC8vIGFzc3VtaW5nIGVxdWFsIGNlbGxXaWR0aCBoZXJlXG4gIC8vIFRPRE86IHN1cHBvcnQgaGV0ZXJvZ2Vub3VzIGNlbGxXaWR0aCAobWF5YmUgYnkgdXNpbmcgbXVsdGlwbGUgc2NhbGVzPylcbiAgc3BlYy5zY2FsZXMgPSAoc3BlYy5zY2FsZXMgfHwgW10pLmNvbmNhdChzY2FsZS5kZWZzKFxuICAgIHNjYWxlLm5hbWVzKGVudGVyKS5jb25jYXQoc2NhbGUubmFtZXMobWRlZi5wcm9wZXJ0aWVzLnVwZGF0ZSkpLFxuICAgIGVuY29kaW5nLFxuICAgIHtjZWxsV2lkdGg6IGNlbGxXaWR0aCwgY2VsbEhlaWdodDogY2VsbEhlaWdodCwgc3RhY2s6IHN0YWNrLCBmYWNldDogdHJ1ZSwgc3RhdHM6IHN0YXRzfVxuICApKTsgLy8gcm93L2NvbCBzY2FsZXMgKyBjZWxsIHNjYWxlc1xuXG4gIGlmIChjZWxsQXhlcy5sZW5ndGggPiAwKSB7XG4gICAgZ3JvdXAuYXhlcyA9IGNlbGxBeGVzO1xuICB9XG5cbiAgLy8gYWRkIGZhY2V0IHRyYW5zZm9ybVxuICB2YXIgdHJhbnMgPSAoZ3JvdXAuZnJvbS50cmFuc2Zvcm0gfHwgKGdyb3VwLmZyb20udHJhbnNmb3JtID0gW10pKTtcbiAgdHJhbnMudW5zaGlmdCh7dHlwZTogJ2ZhY2V0Jywga2V5czogZmFjZXRLZXlzfSk7XG5cbiAgcmV0dXJuIHNwZWM7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgZGVmOiBncm91cGRlZlxufTtcblxuZnVuY3Rpb24gZ3JvdXBkZWYobmFtZSwgb3B0KSB7XG4gIG9wdCA9IG9wdCB8fCB7fTtcbiAgcmV0dXJuIHtcbiAgICBfbmFtZTogbmFtZSB8fCB1bmRlZmluZWQsXG4gICAgdHlwZTogJ2dyb3VwJyxcbiAgICBmcm9tOiBvcHQuZnJvbSxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICBlbnRlcjoge1xuICAgICAgICB4OiBvcHQueCB8fCB1bmRlZmluZWQsXG4gICAgICAgIHk6IG9wdC55IHx8IHVuZGVmaW5lZCxcbiAgICAgICAgd2lkdGg6IG9wdC53aWR0aCB8fCB7Z3JvdXA6ICd3aWR0aCd9LFxuICAgICAgICBoZWlnaHQ6IG9wdC5oZWlnaHQgfHwge2dyb3VwOiAnaGVpZ2h0J31cbiAgICAgIH1cbiAgICB9LFxuICAgIHNjYWxlczogb3B0LnNjYWxlcyB8fCB1bmRlZmluZWQsXG4gICAgYXhlczogb3B0LmF4ZXMgfHwgdW5kZWZpbmVkLFxuICAgIG1hcmtzOiBvcHQubWFya3MgfHwgW11cbiAgfTtcbn1cbiIsInZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpLFxuICBzY2hlbWEgPSByZXF1aXJlKCcuLi9zY2hlbWEvc2NoZW1hJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzZXRTaXplOiBzZXRTaXplXG59O1xuXG5mdW5jdGlvbiBnZXRDYXJkaW5hbGl0eShlbmNvZGluZywgZW5jVHlwZSwgc3RhdHMpIHtcbiAgdmFyIGZpZWxkID0gZW5jb2RpbmcuZmllbGROYW1lKGVuY1R5cGUpO1xuICBpZiAoZW5jb2RpbmcuYmluKGVuY1R5cGUpKSB7XG4gICAgdmFyIGJpbnMgPSB1dGlsLmdldGJpbnMoc3RhdHNbZmllbGRdKTtcbiAgICByZXR1cm4gKGJpbnMuc3RvcCAtIGJpbnMuc3RhcnQpIC8gYmlucy5zdGVwO1xuICB9XG4gIHJldHVybiBzdGF0c1tmaWVsZF0uY2FyZGluYWxpdHk7XG59XG5cbi8qXG4gIEhBQ0sgdG8gc2V0IGNoYXJ0IHNpemVcbiAgTk9URTogdGhpcyBmYWlscyBmb3IgcGxvdHMgZHJpdmVuIGJ5IGRlcml2ZWQgdmFsdWVzIChlLmcuLCBhZ2dyZWdhdGVzKVxuICBPbmUgc29sdXRpb24gaXMgdG8gdXBkYXRlIFZlZ2EgdG8gc3VwcG9ydCBhdXRvLXNpemluZ1xuICBJbiB0aGUgbWVhbnRpbWUsIGF1dG8tcGFkZGluZyAobW9zdGx5KSBkb2VzIHRoZSB0cmlja1xuICovXG5mdW5jdGlvbiBzZXRTaXplKGVuY29kaW5nLCBzdGF0cykge1xuICB2YXIgaGFzUm93ID0gZW5jb2RpbmcuaGFzKFJPVyksXG4gICAgICBoYXNDb2wgPSBlbmNvZGluZy5oYXMoQ09MKSxcbiAgICAgIG1hcmt0eXBlID0gZW5jb2RpbmcubWFya3R5cGUoKTtcblxuICB2YXIgY2VsbFdpZHRoLCBjZWxsSGVpZ2h0LCBjZWxsUGFkZGluZyA9IGVuY29kaW5nLmNvbmZpZygnY2VsbFBhZGRpbmcnKTtcblxuICAvLyBzZXQgY2VsbFdpZHRoXG4gIGlmIChlbmNvZGluZy5oYXMoWCkpIHtcbiAgICBpZiAoZW5jb2RpbmcuaXNPcmRpbmFsU2NhbGUoWCkpIHtcbiAgICAgIC8vIGZvciBvcmRpbmFsLCBoYXNDb2wgb3Igbm90IGRvZXNuJ3QgbWF0dGVyIC0tIHdlIHNjYWxlIGJhc2VkIG9uIGNhcmRpbmFsaXR5XG4gICAgICB2YXIgeENhcmRpbmFsaXR5ID0gZ2V0Q2FyZGluYWxpdHkoZW5jb2RpbmcsIFgsIHN0YXRzKTtcbiAgICAgIGNlbGxXaWR0aCA9ICh4Q2FyZGluYWxpdHkgKyBlbmNvZGluZy5iYW5kKFgpLnBhZGRpbmcpICogZW5jb2RpbmcuYmFuZFNpemUoWCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNlbGxXaWR0aCA9IGhhc0NvbCA/IGVuY29kaW5nLmVuYyhDT0wpLndpZHRoIDogIGVuY29kaW5nLmNvbmZpZyhcInNpbmdsZVdpZHRoXCIpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAobWFya3R5cGUgPT09IFRFWFQpIHtcbiAgICAgIGNlbGxXaWR0aCA9IGVuY29kaW5nLmNvbmZpZygndGV4dENlbGxXaWR0aCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjZWxsV2lkdGggPSBlbmNvZGluZy5iYW5kU2l6ZShYKTtcbiAgICB9XG4gIH1cblxuICAvLyBzZXQgY2VsbEhlaWdodFxuICBpZiAoZW5jb2RpbmcuaGFzKFkpKSB7XG4gICAgaWYgKGVuY29kaW5nLmlzT3JkaW5hbFNjYWxlKFkpKSB7XG4gICAgICAvLyBmb3Igb3JkaW5hbCwgaGFzQ29sIG9yIG5vdCBkb2Vzbid0IG1hdHRlciAtLSB3ZSBzY2FsZSBiYXNlZCBvbiBjYXJkaW5hbGl0eVxuICAgICAgdmFyIHlDYXJkaW5hbGl0eSA9IGdldENhcmRpbmFsaXR5KGVuY29kaW5nLCBZLCBzdGF0cyk7XG4gICAgICBjZWxsSGVpZ2h0ID0gKHlDYXJkaW5hbGl0eSArIGVuY29kaW5nLmJhbmQoWSkucGFkZGluZykgKiBlbmNvZGluZy5iYW5kU2l6ZShZKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2VsbEhlaWdodCA9IGhhc1JvdyA/IGVuY29kaW5nLmVuYyhST1cpLmhlaWdodCA6ICBlbmNvZGluZy5jb25maWcoXCJzaW5nbGVIZWlnaHRcIik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNlbGxIZWlnaHQgPSBlbmNvZGluZy5iYW5kU2l6ZShZKTtcbiAgfVxuXG4gIC8vIENlbGwgYmFuZHMgdXNlIHJhbmdlQmFuZHMoKS4gVGhlcmUgYXJlIG4tMSBwYWRkaW5nLiAgT3V0ZXJwYWRkaW5nID0gMCBmb3IgY2VsbHNcblxuICB2YXIgd2lkdGggPSBjZWxsV2lkdGgsIGhlaWdodCA9IGNlbGxIZWlnaHQ7XG5cbiAgaWYgKGhhc0NvbCkge1xuICAgIHZhciBjb2xDYXJkaW5hbGl0eSA9IGdldENhcmRpbmFsaXR5KGVuY29kaW5nLCBDT0wsIHN0YXRzKTtcbiAgICB3aWR0aCA9IGNlbGxXaWR0aCAqICgoMSArIGNlbGxQYWRkaW5nKSAqIChjb2xDYXJkaW5hbGl0eSAtIDEpICsgMSk7XG4gIH1cblxuICBpZiAoaGFzUm93KSB7XG4gICAgdmFyIHJvd0NhcmRpbmFsaXR5ID0gZ2V0Q2FyZGluYWxpdHkoZW5jb2RpbmcsIFJPVywgc3RhdHMpO1xuICAgIGhlaWdodCA9IGNlbGxIZWlnaHQgKiAoKDEgKyBjZWxsUGFkZGluZykgKiAocm93Q2FyZGluYWxpdHkgLSAxKSArIDEpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBjZWxsV2lkdGg6IGNlbGxXaWR0aCxcbiAgICBjZWxsSGVpZ2h0OiBjZWxsSGVpZ2h0LFxuICAgIHdpZHRoOiB3aWR0aCxcbiAgICBoZWlnaHQ6IGhlaWdodFxuICB9O1xufVxuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKTtcblxudmFyIGxlZ2VuZCA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbmxlZ2VuZC5kZWZzID0gZnVuY3Rpb24oZW5jb2RpbmcpIHtcbiAgdmFyIGRlZnMgPSBbXTtcblxuICAvLyBUT0RPOiBzdXBwb3J0IGFscGhhXG5cbiAgaWYgKGVuY29kaW5nLmhhcyhDT0xPUikgJiYgZW5jb2RpbmcubGVnZW5kKENPTE9SKSkge1xuICAgIGRlZnMucHVzaChsZWdlbmQuZGVmKENPTE9SLCBlbmNvZGluZywge1xuICAgICAgZmlsbDogQ09MT1IsXG4gICAgICBvcmllbnQ6ICdyaWdodCdcbiAgICB9KSk7XG4gIH1cblxuICBpZiAoZW5jb2RpbmcuaGFzKFNJWkUpICYmIGVuY29kaW5nLmxlZ2VuZChTSVpFKSkge1xuICAgIGRlZnMucHVzaChsZWdlbmQuZGVmKFNJWkUsIGVuY29kaW5nLCB7XG4gICAgICBzaXplOiBTSVpFLFxuICAgICAgb3JpZW50OiBkZWZzLmxlbmd0aCA9PT0gMSA/ICdsZWZ0JyA6ICdyaWdodCdcbiAgICB9KSk7XG4gIH1cblxuICBpZiAoZW5jb2RpbmcuaGFzKFNIQVBFKSAmJiBlbmNvZGluZy5sZWdlbmQoU0hBUEUpKSB7XG4gICAgaWYgKGRlZnMubGVuZ3RoID09PSAyKSB7XG4gICAgICAvLyBUT0RPOiBmaXggdGhpc1xuICAgICAgY29uc29sZS5lcnJvcignVmVnYWxpdGUgY3VycmVudGx5IG9ubHkgc3VwcG9ydHMgdHdvIGxlZ2VuZHMnKTtcbiAgICAgIHJldHVybiBkZWZzO1xuICAgIH1cbiAgICBkZWZzLnB1c2gobGVnZW5kLmRlZihTSEFQRSwgZW5jb2RpbmcsIHtcbiAgICAgIHNoYXBlOiBTSEFQRSxcbiAgICAgIG9yaWVudDogZGVmcy5sZW5ndGggPT09IDEgPyAnbGVmdCcgOiAncmlnaHQnXG4gICAgfSkpO1xuICB9XG5cbiAgcmV0dXJuIGRlZnM7XG59O1xuXG5sZWdlbmQuZGVmID0gZnVuY3Rpb24obmFtZSwgZW5jb2RpbmcsIHByb3BzKSB7XG4gIHZhciBkZWYgPSBwcm9wcywgZm47XG5cbiAgZGVmLnRpdGxlID0gZW5jb2RpbmcuZmllbGRUaXRsZShuYW1lKTtcblxuICBpZiAoZW5jb2RpbmcuaXNUeXBlKG5hbWUsIFQpICYmIChmbiA9IGVuY29kaW5nLmZuKG5hbWUpKSkge1xuICAgIHZhciBwcm9wZXJ0aWVzID0gZGVmLnByb3BlcnRpZXMgPSBkZWYucHJvcGVydGllcyB8fCB7fSxcbiAgICAgIGxhYmVscyA9IHByb3BlcnRpZXMubGFiZWxzID0gcHJvcGVydGllcy5sYWJlbHMgfHwge30sXG4gICAgICB0ZXh0ID0gbGFiZWxzLnRleHQgPSBsYWJlbHMudGV4dCB8fCB7fTtcblxuICAgIHN3aXRjaCAoZm4pIHtcbiAgICAgIGNhc2UgJ2RheSc6XG4gICAgICBjYXNlICdtb250aCc6XG4gICAgICAgIHRleHQuc2NhbGUgPSAndGltZS0nKyBmbjtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGRlZjtcbn07XG4iLCJ2YXIgZ2xvYmFscyA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcblxudmFyIG1hcmtzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxubWFya3MuZGVmID0gZnVuY3Rpb24obWFyaywgZW5jb2RpbmcsIG9wdCkge1xuICB2YXIgcCA9IG1hcmsucHJvcChlbmNvZGluZywgb3B0KTtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiBtYXJrLnR5cGUsXG4gICAgZnJvbToge2RhdGE6IFRBQkxFfSxcbiAgICBwcm9wZXJ0aWVzOiB7ZW50ZXI6IHAsIHVwZGF0ZTogcH1cbiAgfTtcbn07XG5cbm1hcmtzLmJhciA9IHtcbiAgdHlwZTogJ3JlY3QnLFxuICBzdGFjazogdHJ1ZSxcbiAgcHJvcDogYmFyX3Byb3BzLFxuICByZXF1aXJlZEVuY29kaW5nOiBbJ3gnLCAneSddLFxuICBzdXBwb3J0ZWRFbmNvZGluZzoge3JvdzogMSwgY29sOiAxLCB4OiAxLCB5OiAxLCBzaXplOiAxLCBjb2xvcjogMSwgYWxwaGE6IDF9XG59O1xuXG5tYXJrcy5saW5lID0ge1xuICB0eXBlOiAnbGluZScsXG4gIGxpbmU6IHRydWUsXG4gIHByb3A6IGxpbmVfcHJvcHMsXG4gIHJlcXVpcmVkRW5jb2Rpbmc6IFsneCcsICd5J10sXG4gIHN1cHBvcnRlZEVuY29kaW5nOiB7cm93OiAxLCBjb2w6IDEsIHg6IDEsIHk6IDEsIGNvbG9yOiAxLCBhbHBoYTogMX1cbn07XG5cbm1hcmtzLmFyZWEgPSB7XG4gIHR5cGU6ICdhcmVhJyxcbiAgc3RhY2s6IHRydWUsXG4gIGxpbmU6IHRydWUsXG4gIHJlcXVpcmVkRW5jb2Rpbmc6IFsneCcsICd5J10sXG4gIHByb3A6IGFyZWFfcHJvcHMsXG4gIHN1cHBvcnRlZEVuY29kaW5nOiBtYXJrcy5saW5lLnN1cHBvcnRlZEVuY29kaW5nXG59O1xuXG5tYXJrcy5jaXJjbGUgPSB7XG4gIHR5cGU6ICdzeW1ib2wnLFxuICBwcm9wOiBmaWxsZWRfcG9pbnRfcHJvcHMoJ2NpcmNsZScpLFxuICBzdXBwb3J0ZWRFbmNvZGluZzoge3JvdzogMSwgY29sOiAxLCB4OiAxLCB5OiAxLCBzaXplOiAxLCBjb2xvcjogMSwgYWxwaGE6IDF9XG59O1xuXG5tYXJrcy5zcXVhcmUgPSB7XG4gIHR5cGU6ICdzeW1ib2wnLFxuICBwcm9wOiBmaWxsZWRfcG9pbnRfcHJvcHMoJ3NxdWFyZScpLFxuICBzdXBwb3J0ZWRFbmNvZGluZzogbWFya3MuY2lyY2xlLnN1cHBvcnRlZEVuY29kaW5nXG59O1xuXG5tYXJrcy5wb2ludCA9IHtcbiAgdHlwZTogJ3N5bWJvbCcsXG4gIHByb3A6IHBvaW50X3Byb3BzLFxuICBzdXBwb3J0ZWRFbmNvZGluZzoge3JvdzogMSwgY29sOiAxLCB4OiAxLCB5OiAxLCBzaXplOiAxLCBjb2xvcjogMSwgYWxwaGE6IDEsIHNoYXBlOiAxfVxufTtcblxubWFya3MudGV4dCA9IHtcbiAgdHlwZTogJ3RleHQnLFxuICBwcm9wOiB0ZXh0X3Byb3BzLFxuICByZXF1aXJlZEVuY29kaW5nOiBbJ3RleHQnXSxcbiAgc3VwcG9ydGVkRW5jb2Rpbmc6IHtyb3c6IDEsIGNvbDogMSwgc2l6ZTogMSwgY29sb3I6IDEsIGFscGhhOiAxLCB0ZXh0OiAxfVxufTtcblxuZnVuY3Rpb24gYmFyX3Byb3BzKGUpIHtcbiAgdmFyIHAgPSB7fTtcblxuICAvLyB4XG4gIGlmIChlLmlzUXVhbnRTY2FsZShYKSkge1xuICAgIHAueCA9IHtzY2FsZTogWCwgZmllbGQ6IGUuZmllbGQoWCl9O1xuICAgIGlmIChlLmlzT3JkaW5hbFNjYWxlKFkpKSB7XG4gICAgICBwLngyID0ge3NjYWxlOiBYLCB2YWx1ZTogMH07XG4gICAgfVxuICB9IGVsc2UgaWYgKGUuaGFzKFgpKSB7IC8vIGlzIG9yZGluYWxcbiAgICBwLnhjID0ge3NjYWxlOiBYLCBmaWVsZDogZS5maWVsZChYKX07XG4gIH0gZWxzZSB7XG4gICAgLy8gVE9ETyBhZGQgc2luZ2xlIGJhciBvZmZzZXRcbiAgICBwLnhjID0ge3ZhbHVlOiAwfTtcbiAgfVxuXG4gIC8vIHlcbiAgaWYgKGUuaXNRdWFudFNjYWxlKFkpKSB7XG4gICAgcC55ID0ge3NjYWxlOiBZLCBmaWVsZDogZS5maWVsZChZKX07XG4gICAgcC55MiA9IHtzY2FsZTogWSwgdmFsdWU6IDB9O1xuICB9IGVsc2UgaWYgKGUuaGFzKFkpKSB7IC8vIGlzIG9yZGluYWxcbiAgICBwLnljID0ge3NjYWxlOiBZLCBmaWVsZDogZS5maWVsZChZKX07XG4gIH0gZWxzZSB7XG4gICAgLy8gVE9ETyBhZGQgc2luZ2xlIGJhciBvZmZzZXRcbiAgICBwLnljID0ge2dyb3VwOiAnaGVpZ2h0J307XG4gIH1cblxuICAvLyB3aWR0aFxuICBpZiAoIWUuaXNRdWFudFNjYWxlKFgpKSB7IC8vIG5vIFggb3IgWCBpcyBvcmRpbmFsXG4gICAgaWYgKGUuaGFzKFNJWkUpKSB7XG4gICAgICBwLndpZHRoID0ge3NjYWxlOiBTSVpFLCBmaWVsZDogZS5maWVsZChTSVpFKX07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHAud2lkdGggPSB7c2NhbGU6IFgsIGJhbmQ6IHRydWUsIG9mZnNldDogLTF9O1xuICAgICAgcC53aWR0aCA9IHt2YWx1ZTogZS5iYW5kU2l6ZShYKSwgb2Zmc2V0OiAtMX07XG4gICAgfVxuICB9IGVsc2UgeyAvLyBYIGlzIFF1YW50XG4gICAgcC53aWR0aCA9IHt2YWx1ZTogZS5iYW5kU2l6ZShYKSwgb2Zmc2V0OiAtMX07XG4gIH1cblxuICAvLyBoZWlnaHRcbiAgaWYgKCFlLmlzUXVhbnRTY2FsZShZKSkgeyAvLyBubyBZIG9yIFkgaXMgb3JkaW5hbFxuICAgIGlmIChlLmhhcyhTSVpFKSkge1xuICAgICAgcC5oZWlnaHQgPSB7c2NhbGU6IFNJWkUsIGZpZWxkOiBlLmZpZWxkKFNJWkUpfTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gcC5oZWlnaHQgPSB7c2NhbGU6IFksIGJhbmQ6IHRydWUsIG9mZnNldDogLTF9O1xuICAgICAgcC5oZWlnaHQgPSB7dmFsdWU6IGUuYmFuZFNpemUoWSksIG9mZnNldDogLTF9O1xuICAgIH1cbiAgfSBlbHNlIHsgLy8gWSBpcyBRdWFudFxuICAgIHAuaGVpZ2h0ID0ge3ZhbHVlOiBlLmJhbmRTaXplKFkpLCBvZmZzZXQ6IC0xfTtcbiAgfVxuXG4gIC8vIGZpbGxcbiAgaWYgKGUuaGFzKENPTE9SKSkge1xuICAgIHAuZmlsbCA9IHtzY2FsZTogQ09MT1IsIGZpZWxkOiBlLmZpZWxkKENPTE9SKX07XG4gIH0gZWxzZSBpZiAoIWUuaGFzKENPTE9SKSkge1xuICAgIHAuZmlsbCA9IHt2YWx1ZTogZS52YWx1ZShDT0xPUil9O1xuICB9XG5cbiAgLy8gYWxwaGFcbiAgaWYgKGUuaGFzKEFMUEhBKSkge1xuICAgIHAub3BhY2l0eSA9IHtzY2FsZTogQUxQSEEsIGZpZWxkOiBlLmZpZWxkKEFMUEhBKX07XG4gIH1cblxuICByZXR1cm4gcDtcbn1cblxuZnVuY3Rpb24gcG9pbnRfcHJvcHMoZSwgb3B0KSB7XG4gIHZhciBwID0ge307XG4gIG9wdCA9IG9wdCB8fCB7fTtcblxuICAvLyB4XG4gIGlmIChlLmhhcyhYKSkge1xuICAgIHAueCA9IHtzY2FsZTogWCwgZmllbGQ6IGUuZmllbGQoWCl9O1xuICB9IGVsc2UgaWYgKCFlLmhhcyhYKSkge1xuICAgIHAueCA9IHt2YWx1ZTogZS5iYW5kU2l6ZShYKSAvIDJ9O1xuICB9XG5cbiAgLy8geVxuICBpZiAoZS5oYXMoWSkpIHtcbiAgICBwLnkgPSB7c2NhbGU6IFksIGZpZWxkOiBlLmZpZWxkKFkpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoWSkpIHtcbiAgICBwLnkgPSB7dmFsdWU6IGUuYmFuZFNpemUoWSkgLyAyfTtcbiAgfVxuXG4gIC8vIHNpemVcbiAgaWYgKGUuaGFzKFNJWkUpKSB7XG4gICAgcC5zaXplID0ge3NjYWxlOiBTSVpFLCBmaWVsZDogZS5maWVsZChTSVpFKX07XG4gIH0gZWxzZSBpZiAoIWUuaGFzKFNJWkUpKSB7XG4gICAgcC5zaXplID0ge3ZhbHVlOiBlLnZhbHVlKFNJWkUpfTtcbiAgfVxuXG4gIC8vIHNoYXBlXG4gIGlmIChlLmhhcyhTSEFQRSkpIHtcbiAgICBwLnNoYXBlID0ge3NjYWxlOiBTSEFQRSwgZmllbGQ6IGUuZmllbGQoU0hBUEUpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoU0hBUEUpKSB7XG4gICAgcC5zaGFwZSA9IHt2YWx1ZTogZS52YWx1ZShTSEFQRSl9O1xuICB9XG5cbiAgLy8gc3Ryb2tlXG4gIGlmIChlLmhhcyhDT0xPUikpIHtcbiAgICBwLnN0cm9rZSA9IHtzY2FsZTogQ09MT1IsIGZpZWxkOiBlLmZpZWxkKENPTE9SKX07XG4gIH0gZWxzZSBpZiAoIWUuaGFzKENPTE9SKSkge1xuICAgIHAuc3Ryb2tlID0ge3ZhbHVlOiBlLnZhbHVlKENPTE9SKX07XG4gIH1cblxuICAvLyBhbHBoYVxuICBpZiAoZS5oYXMoQUxQSEEpKSB7XG4gICAgcC5vcGFjaXR5ID0ge3NjYWxlOiBBTFBIQSwgZmllbGQ6IGUuZmllbGQoQUxQSEEpfTtcbiAgfWVsc2Uge1xuICAgIHAub3BhY2l0eSA9IHtcbiAgICAgIHZhbHVlOiBlLnZhbHVlKEFMUEhBKVxuICAgIH07XG4gIH1cblxuICBwLnN0cm9rZVdpZHRoID0ge3ZhbHVlOiBlLmNvbmZpZygnc3Ryb2tlV2lkdGgnKX07XG5cbiAgcmV0dXJuIHA7XG59XG5cbmZ1bmN0aW9uIGxpbmVfcHJvcHMoZSkge1xuICB2YXIgcCA9IHt9O1xuXG4gIC8vIHhcbiAgaWYgKGUuaGFzKFgpKSB7XG4gICAgcC54ID0ge3NjYWxlOiBYLCBmaWVsZDogZS5maWVsZChYKX07XG4gIH0gZWxzZSBpZiAoIWUuaGFzKFgpKSB7XG4gICAgcC54ID0ge3ZhbHVlOiAwfTtcbiAgfVxuXG4gIC8vIHlcbiAgaWYgKGUuaGFzKFkpKSB7XG4gICAgcC55ID0ge3NjYWxlOiBZLCBmaWVsZDogZS5maWVsZChZKX07XG4gIH0gZWxzZSBpZiAoIWUuaGFzKFkpKSB7XG4gICAgcC55ID0ge2dyb3VwOiAnaGVpZ2h0J307XG4gIH1cblxuICAvLyBzdHJva2VcbiAgaWYgKGUuaGFzKENPTE9SKSkge1xuICAgIHAuc3Ryb2tlID0ge3NjYWxlOiBDT0xPUiwgZmllbGQ6IGUuZmllbGQoQ09MT1IpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoQ09MT1IpKSB7XG4gICAgcC5zdHJva2UgPSB7dmFsdWU6IGUudmFsdWUoQ09MT1IpfTtcbiAgfVxuXG4gIC8vIGFscGhhXG4gIGlmIChlLmhhcyhBTFBIQSkpIHtcbiAgICBwLm9wYWNpdHkgPSB7c2NhbGU6IEFMUEhBLCBmaWVsZDogZS5maWVsZChBTFBIQSl9O1xuICB9XG5cbiAgcC5zdHJva2VXaWR0aCA9IHt2YWx1ZTogZS5jb25maWcoJ3N0cm9rZVdpZHRoJyl9O1xuXG4gIHJldHVybiBwO1xufVxuXG5mdW5jdGlvbiBhcmVhX3Byb3BzKGUpIHtcbiAgdmFyIHAgPSB7fTtcblxuICAvLyB4XG4gIGlmIChlLmlzUXVhbnRTY2FsZShYKSkge1xuICAgIHAueCA9IHtzY2FsZTogWCwgZmllbGQ6IGUuZmllbGQoWCl9O1xuICAgIGlmIChlLmlzT3JkaW5hbFNjYWxlKFkpKSB7XG4gICAgICBwLngyID0ge3NjYWxlOiBYLCB2YWx1ZTogMH07XG4gICAgICBwLm9yaWVudCA9IHt2YWx1ZTogJ2hvcml6b250YWwnfTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoZS5oYXMoWCkpIHtcbiAgICBwLnggPSB7c2NhbGU6IFgsIGZpZWxkOiBlLmZpZWxkKFgpfTtcbiAgfSBlbHNlIHtcbiAgICBwLnggPSB7dmFsdWU6IDB9O1xuICB9XG5cbiAgLy8geVxuICBpZiAoZS5pc1F1YW50U2NhbGUoWSkpIHtcbiAgICBwLnkgPSB7c2NhbGU6IFksIGZpZWxkOiBlLmZpZWxkKFkpfTtcbiAgICBwLnkyID0ge3NjYWxlOiBZLCB2YWx1ZTogMH07XG4gIH0gZWxzZSBpZiAoZS5oYXMoWSkpIHtcbiAgICBwLnkgPSB7c2NhbGU6IFksIGZpZWxkOiBlLmZpZWxkKFkpfTtcbiAgfSBlbHNlIHtcbiAgICBwLnkgPSB7Z3JvdXA6ICdoZWlnaHQnfTtcbiAgfVxuXG4gIC8vIHN0cm9rZVxuICBpZiAoZS5oYXMoQ09MT1IpKSB7XG4gICAgcC5maWxsID0ge3NjYWxlOiBDT0xPUiwgZmllbGQ6IGUuZmllbGQoQ09MT1IpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoQ09MT1IpKSB7XG4gICAgcC5maWxsID0ge3ZhbHVlOiBlLnZhbHVlKENPTE9SKX07XG4gIH1cblxuICAvLyBhbHBoYVxuICBpZiAoZS5oYXMoQUxQSEEpKSB7XG4gICAgcC5vcGFjaXR5ID0ge3NjYWxlOiBBTFBIQSwgZmllbGQ6IGUuZmllbGQoQUxQSEEpfTtcbiAgfVxuXG4gIHJldHVybiBwO1xufVxuXG5mdW5jdGlvbiBmaWxsZWRfcG9pbnRfcHJvcHMoc2hhcGUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGUsIG9wdCkge1xuICAgIHZhciBwID0ge307XG4gICAgb3B0ID0gb3B0IHx8IHt9O1xuXG4gICAgLy8geFxuICAgIGlmIChlLmhhcyhYKSkge1xuICAgICAgcC54ID0ge3NjYWxlOiBYLCBmaWVsZDogZS5maWVsZChYKX07XG4gICAgfSBlbHNlIGlmICghZS5oYXMoWCkpIHtcbiAgICAgIHAueCA9IHt2YWx1ZTogZS5iYW5kU2l6ZShYKSAvIDJ9O1xuICAgIH1cblxuICAgIC8vIHlcbiAgICBpZiAoZS5oYXMoWSkpIHtcbiAgICAgIHAueSA9IHtzY2FsZTogWSwgZmllbGQ6IGUuZmllbGQoWSl9O1xuICAgIH0gZWxzZSBpZiAoIWUuaGFzKFkpKSB7XG4gICAgICBwLnkgPSB7dmFsdWU6IGUuYmFuZFNpemUoWSkgLyAyfTtcbiAgICB9XG5cbiAgICAvLyBzaXplXG4gICAgaWYgKGUuaGFzKFNJWkUpKSB7XG4gICAgICBwLnNpemUgPSB7c2NhbGU6IFNJWkUsIGZpZWxkOiBlLmZpZWxkKFNJWkUpfTtcbiAgICB9IGVsc2UgaWYgKCFlLmhhcyhYKSkge1xuICAgICAgcC5zaXplID0ge3ZhbHVlOiBlLnZhbHVlKFNJWkUpfTtcbiAgICB9XG5cbiAgICAvLyBzaGFwZVxuICAgIHAuc2hhcGUgPSB7dmFsdWU6IHNoYXBlfTtcblxuICAgIC8vIGZpbGxcbiAgICBpZiAoZS5oYXMoQ09MT1IpKSB7XG4gICAgICBwLmZpbGwgPSB7c2NhbGU6IENPTE9SLCBmaWVsZDogZS5maWVsZChDT0xPUil9O1xuICAgIH0gZWxzZSBpZiAoIWUuaGFzKENPTE9SKSkge1xuICAgICAgcC5maWxsID0ge3ZhbHVlOiBlLnZhbHVlKENPTE9SKX07XG4gICAgfVxuXG4gICAgLy8gYWxwaGFcbiAgICBpZiAoZS5oYXMoQUxQSEEpKSB7XG4gICAgICBwLm9wYWNpdHkgPSB7c2NhbGU6IEFMUEhBLCBmaWVsZDogZS5maWVsZChBTFBIQSl9O1xuICAgIH1lbHNlIHtcbiAgICAgIHAub3BhY2l0eSA9IHtcbiAgICAgICAgdmFsdWU6IGUudmFsdWUoQUxQSEEpXG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBwO1xuICB9O1xufVxuXG5mdW5jdGlvbiB0ZXh0X3Byb3BzKGUpIHtcbiAgdmFyIHAgPSB7fTtcblxuICAvLyB4XG4gIGlmIChlLmhhcyhYKSkge1xuICAgIHAueCA9IHtzY2FsZTogWCwgZmllbGQ6IGUuZmllbGQoWCl9O1xuICB9IGVsc2UgaWYgKCFlLmhhcyhYKSkge1xuICAgIHAueCA9IHt2YWx1ZTogZS5iYW5kU2l6ZShYKSAvIDJ9O1xuICB9XG5cbiAgLy8geVxuICBpZiAoZS5oYXMoWSkpIHtcbiAgICBwLnkgPSB7c2NhbGU6IFksIGZpZWxkOiBlLmZpZWxkKFkpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoWSkpIHtcbiAgICBwLnkgPSB7dmFsdWU6IGUuYmFuZFNpemUoWSkgLyAyfTtcbiAgfVxuXG4gIC8vIHNpemVcbiAgaWYgKGUuaGFzKFNJWkUpKSB7XG4gICAgcC5mb250U2l6ZSA9IHtzY2FsZTogU0laRSwgZmllbGQ6IGUuZmllbGQoU0laRSl9O1xuICB9IGVsc2UgaWYgKCFlLmhhcyhYKSkge1xuICAgIHAuZm9udFNpemUgPSB7dmFsdWU6IGUuZm9udCgnc2l6ZScpfTtcbiAgfVxuXG4gIC8vIGZpbGxcbiAgaWYgKGUuaGFzKENPTE9SKSkge1xuICAgIHAuZmlsbCA9IHtzY2FsZTogQ09MT1IsIGZpZWxkOiBlLmZpZWxkKENPTE9SKX07XG4gIH0gZWxzZSBpZiAoIWUuaGFzKENPTE9SKSkge1xuICAgIHAuZmlsbCA9IHt2YWx1ZTogZS52YWx1ZShDT0xPUil9O1xuICB9XG5cbiAgLy8gYWxwaGFcbiAgaWYgKGUuaGFzKEFMUEhBKSkge1xuICAgIHAub3BhY2l0eSA9IHtzY2FsZTogQUxQSEEsIGZpZWxkOiBlLmZpZWxkKEFMUEhBKX07XG4gIH1cblxuICAvLyB0ZXh0XG4gIGlmIChlLmhhcyhURVhUKSkge1xuICAgIHAudGV4dCA9IHtmaWVsZDogZS5maWVsZChURVhUKX07XG4gIH0gZWxzZSB7XG4gICAgcC50ZXh0ID0ge3ZhbHVlOiAnQWJjJ307XG4gIH1cblxuICBwLmZvbnQgPSB7dmFsdWU6IGUuZm9udCgnZmFtaWx5Jyl9O1xuICBwLmZvbnRXZWlnaHQgPSB7dmFsdWU6IGUuZm9udCgnd2VpZ2h0Jyl9O1xuICBwLmZvbnRTdHlsZSA9IHt2YWx1ZTogZS5mb250KCdzdHlsZScpfTtcbiAgcC5iYXNlbGluZSA9IHt2YWx1ZTogZS50ZXh0KCdiYXNlbGluZScpfTtcblxuICAvLyBhbGlnblxuICBpZiAoZS5oYXMoWCkpIHtcbiAgICBpZiAoZS5pc09yZGluYWxTY2FsZShYKSkge1xuICAgICAgcC5hbGlnbiA9IHt2YWx1ZTogJ2xlZnQnfTtcbiAgICAgIHAuZHggPSB7dmFsdWU6IGUudGV4dCgnbWFyZ2luJyl9O1xuICAgIH0gZWxzZSB7XG4gICAgICBwLmFsaWduID0ge3ZhbHVlOiAnY2VudGVyJ307XG4gICAgfVxuICB9IGVsc2UgaWYgKGUuaGFzKFkpKSB7XG4gICAgcC5hbGlnbiA9IHt2YWx1ZTogJ2xlZnQnfTtcbiAgICBwLmR4ID0ge3ZhbHVlOiBlLnRleHQoJ21hcmdpbicpfTtcbiAgfSBlbHNlIHtcbiAgICBwLmFsaWduID0ge3ZhbHVlOiBlLnRleHQoJ2FsaWduJyl9O1xuICB9XG5cbiAgcmV0dXJuIHA7XG59XG4iLCJ2YXIgZ2xvYmFscyA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcblxudmFyIHNjYWxlID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuc2NhbGUubmFtZXMgPSBmdW5jdGlvbihwcm9wcykge1xuICByZXR1cm4gdXRpbC5rZXlzKHV0aWwua2V5cyhwcm9wcykucmVkdWNlKGZ1bmN0aW9uKGEsIHgpIHtcbiAgICBpZiAocHJvcHNbeF0gJiYgcHJvcHNbeF0uc2NhbGUpIGFbcHJvcHNbeF0uc2NhbGVdID0gMTtcbiAgICByZXR1cm4gYTtcbiAgfSwge30pKTtcbn07XG5cbnNjYWxlLmRlZnMgPSBmdW5jdGlvbihuYW1lcywgZW5jb2RpbmcsIG9wdCkge1xuICBvcHQgPSBvcHQgfHwge307XG5cbiAgcmV0dXJuIG5hbWVzLnJlZHVjZShmdW5jdGlvbihhLCBuYW1lKSB7XG4gICAgdmFyIHMgPSB7XG4gICAgICBuYW1lOiBuYW1lLFxuICAgICAgdHlwZTogc2NhbGUudHlwZShuYW1lLCBlbmNvZGluZyksXG4gICAgICBkb21haW46IHNjYWxlX2RvbWFpbihuYW1lLCBlbmNvZGluZywgb3B0KVxuICAgIH07XG4gICAgaWYgKHMudHlwZSA9PT0gJ29yZGluYWwnICYmICFlbmNvZGluZy5iaW4obmFtZSkpIHtcbiAgICAgIHMuc29ydCA9IHRydWU7XG4gICAgfVxuXG4gICAgc2NhbGVfcmFuZ2UocywgZW5jb2RpbmcsIG9wdCk7XG5cbiAgICByZXR1cm4gKGEucHVzaChzKSwgYSk7XG4gIH0sIFtdKTtcbn07XG5cbnNjYWxlLnR5cGUgPSBmdW5jdGlvbihuYW1lLCBlbmNvZGluZykge1xuICB2YXIgZm47XG4gIHN3aXRjaCAoZW5jb2RpbmcudHlwZShuYW1lKSkge1xuICAgIGNhc2UgTzogcmV0dXJuICdvcmRpbmFsJztcbiAgICBjYXNlIFQ6XG4gICAgICBzd2l0Y2ggKGVuY29kaW5nLmZuKG5hbWUpKSB7XG4gICAgICAgIGNhc2UgJ3NlY29uZCc6XG4gICAgICAgIGNhc2UgJ21pbnV0ZSc6XG4gICAgICAgIGNhc2UgJ2hvdXInOlxuICAgICAgICBjYXNlICdkYXknOlxuICAgICAgICBjYXNlICdkYXRlJzpcbiAgICAgICAgY2FzZSAnbW9udGgnOlxuICAgICAgICAgIHJldHVybiAnb3JkaW5hbCc7XG4gICAgICAgIGNhc2UgJ3llYXInOlxuICAgICAgICAgIHJldHVybiAnbGluZWFyJztcbiAgICAgIH1cbiAgICAgIHJldHVybiAndGltZSc7XG4gICAgY2FzZSBROlxuICAgICAgaWYgKGVuY29kaW5nLmJpbihuYW1lKSkge1xuICAgICAgICByZXR1cm4gJ29yZGluYWwnO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGVuY29kaW5nLnNjYWxlKG5hbWUpLnR5cGU7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIHNjYWxlX2RvbWFpbihuYW1lLCBlbmNvZGluZywgb3B0KSB7XG4gIGlmIChlbmNvZGluZy50eXBlKG5hbWUpID09PSBUKSB7XG4gICAgc3dpdGNoIChlbmNvZGluZy5mbihuYW1lKSkge1xuICAgICAgY2FzZSAnc2Vjb25kJzpcbiAgICAgIGNhc2UgJ21pbnV0ZSc6IHJldHVybiB1dGlsLnJhbmdlKDAsIDYwKTtcbiAgICAgIGNhc2UgJ2hvdXInOiByZXR1cm4gdXRpbC5yYW5nZSgwLCAyNCk7XG4gICAgICBjYXNlICdkYXknOiByZXR1cm4gdXRpbC5yYW5nZSgwLCA3KTtcbiAgICAgIGNhc2UgJ2RhdGUnOiByZXR1cm4gdXRpbC5yYW5nZSgwLCAzMik7XG4gICAgICBjYXNlICdtb250aCc6IHJldHVybiB1dGlsLnJhbmdlKDAsIDEyKTtcbiAgICB9XG4gIH1cblxuICBpZiAoZW5jb2RpbmcuYmluKG5hbWUpKSB7XG4gICAgLy8gVE9ETzogYWRkIGluY2x1ZGVFbXB0eUNvbmZpZyBoZXJlXG4gICAgaWYgKG9wdC5zdGF0cykge1xuICAgICAgdmFyIGJpbnMgPSB1dGlsLmdldGJpbnMob3B0LnN0YXRzW2VuY29kaW5nLmZpZWxkTmFtZShuYW1lKV0pO1xuICAgICAgdmFyIGRvbWFpbiA9IHV0aWwucmFuZ2UoYmlucy5zdGFydCwgYmlucy5zdG9wLCBiaW5zLnN0ZXApO1xuICAgICAgcmV0dXJuIG5hbWUgPT09IFkgPyBkb21haW4ucmV2ZXJzZSgpIDogZG9tYWluO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuYW1lID09IG9wdC5zdGFjayA/XG4gICAge1xuICAgICAgZGF0YTogU1RBQ0tFRCxcbiAgICAgIGZpZWxkOiAnZGF0YS4nICsgKG9wdC5mYWNldCA/ICdtYXhfJyA6ICcnKSArICdzdW1fJyArIGVuY29kaW5nLmZpZWxkKG5hbWUsIHRydWUpXG4gICAgfSA6XG4gICAge2RhdGE6IFRBQkxFLCBmaWVsZDogZW5jb2RpbmcuZmllbGQobmFtZSl9O1xufVxuXG5mdW5jdGlvbiBzY2FsZV9yYW5nZShzLCBlbmNvZGluZywgb3B0KSB7XG4gIHZhciBzcGVjID0gZW5jb2Rpbmcuc2NhbGUocy5uYW1lKTtcbiAgc3dpdGNoIChzLm5hbWUpIHtcbiAgICBjYXNlIFg6XG4gICAgICBpZiAocy50eXBlID09PSAnb3JkaW5hbCcpIHtcbiAgICAgICAgcy5iYW5kV2lkdGggPSBlbmNvZGluZy5iYW5kU2l6ZShYKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHMucmFuZ2UgPSBvcHQuY2VsbFdpZHRoID8gWzAsIG9wdC5jZWxsV2lkdGhdIDogJ3dpZHRoJztcbiAgICAgICAgcy56ZXJvID0gc3BlYy56ZXJvO1xuICAgICAgICBzLnJldmVyc2UgPSBzcGVjLnJldmVyc2U7XG4gICAgICB9XG4gICAgICBzLnJvdW5kID0gdHJ1ZTtcbiAgICAgIGlmIChzLnR5cGUgPT09ICd0aW1lJykge1xuICAgICAgICBzLm5pY2UgPSBlbmNvZGluZy5mbihzLm5hbWUpO1xuICAgICAgfWVsc2Uge1xuICAgICAgICBzLm5pY2UgPSB0cnVlO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSBZOlxuICAgICAgaWYgKHMudHlwZSA9PT0gJ29yZGluYWwnKSB7XG4gICAgICAgIHMuYmFuZFdpZHRoID0gZW5jb2RpbmcuYmFuZFNpemUoWSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzLnJhbmdlID0gb3B0LmNlbGxIZWlnaHQgPyBbb3B0LmNlbGxIZWlnaHQsIDBdIDogJ2hlaWdodCc7XG4gICAgICAgIHMuemVybyA9IHNwZWMuemVybztcbiAgICAgICAgcy5yZXZlcnNlID0gc3BlYy5yZXZlcnNlO1xuICAgICAgfVxuXG4gICAgICBzLnJvdW5kID0gdHJ1ZTtcblxuICAgICAgaWYgKHMudHlwZSA9PT0gJ3RpbWUnKSB7XG4gICAgICAgIHMubmljZSA9IGVuY29kaW5nLmZuKHMubmFtZSkgfHwgZW5jb2RpbmcuY29uZmlnKCd0aW1lU2NhbGVOaWNlJyk7XG4gICAgICB9ZWxzZSB7XG4gICAgICAgIHMubmljZSA9IHRydWU7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlIFJPVzogLy8gc3VwcG9ydCBvbmx5IG9yZGluYWxcbiAgICAgIHMuYmFuZFdpZHRoID0gb3B0LmNlbGxIZWlnaHQgfHwgZW5jb2RpbmcuY29uZmlnKCdjZWxsSGVpZ2h0Jyk7XG4gICAgICBzLnJvdW5kID0gdHJ1ZTtcbiAgICAgIHMubmljZSA9IHRydWU7XG4gICAgICBicmVhaztcbiAgICBjYXNlIENPTDogLy8gc3VwcG9ydCBvbmx5IG9yZGluYWxcbiAgICAgIHMuYmFuZFdpZHRoID0gb3B0LmNlbGxXaWR0aCB8fCBlbmNvZGluZy5jb25maWcoJ2NlbGxXaWR0aCcpO1xuICAgICAgcy5yb3VuZCA9IHRydWU7XG4gICAgICBzLm5pY2UgPSB0cnVlO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBTSVpFOlxuICAgICAgaWYgKGVuY29kaW5nLmlzKCdiYXInKSkge1xuICAgICAgICAvLyBGSVhNRSB0aGlzIGlzIGRlZmluaXRlbHkgaW5jb3JyZWN0XG4gICAgICAgIC8vIGJ1dCBsZXQncyBmaXggaXQgbGF0ZXIgc2luY2UgYmFyIHNpemUgaXMgYSBiYWQgZW5jb2RpbmcgYW55d2F5XG4gICAgICAgIHMucmFuZ2UgPSBbMywgTWF0aC5tYXgoZW5jb2RpbmcuYmFuZFNpemUoWCksIGVuY29kaW5nLmJhbmRTaXplKFkpKV07XG4gICAgICB9IGVsc2UgaWYgKGVuY29kaW5nLmlzKFRFWFQpKSB7XG4gICAgICAgIHMucmFuZ2UgPSBbOCwgNDBdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcy5yYW5nZSA9IFsxMCwgMTAwMF07XG4gICAgICB9XG4gICAgICBzLnJvdW5kID0gdHJ1ZTtcbiAgICAgIHMuemVybyA9IGZhbHNlO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBTSEFQRTpcbiAgICAgIHMucmFuZ2UgPSAnc2hhcGVzJztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgQ09MT1I6XG4gICAgICB2YXIgcmFuZ2UgPSBlbmNvZGluZy5zY2FsZShDT0xPUikucmFuZ2U7XG4gICAgICBpZiAocmFuZ2UgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAocy50eXBlID09PSAnb3JkaW5hbCcpIHtcbiAgICAgICAgICByYW5nZSA9ICdjYXRlZ29yeTEwJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByYW5nZSA9IFsnI2RkZicsICdzdGVlbGJsdWUnXTtcbiAgICAgICAgICBzLnplcm8gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcy5yYW5nZSA9IHJhbmdlO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBBTFBIQTpcbiAgICAgIHMucmFuZ2UgPSBbMC4yLCAxLjBdO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZyBuYW1lOiAnKyBzLm5hbWUpO1xuICB9XG5cbiAgc3dpdGNoIChzLm5hbWUpIHtcbiAgICBjYXNlIFJPVzpcbiAgICBjYXNlIENPTDpcbiAgICAgIHMucGFkZGluZyA9IGVuY29kaW5nLmNvbmZpZygnY2VsbFBhZGRpbmcnKTtcbiAgICAgIHMub3V0ZXJQYWRkaW5nID0gMDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgWDpcbiAgICBjYXNlIFk6XG4gICAgICBpZiAocy50eXBlID09PSAnb3JkaW5hbCcpIHsgLy8mJiAhcy5iYW5kV2lkdGhcbiAgICAgICAgcy5wb2ludHMgPSB0cnVlO1xuICAgICAgICBzLnBhZGRpbmcgPSBlbmNvZGluZy5iYW5kKHMubmFtZSkucGFkZGluZztcbiAgICAgIH1cbiAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpLFxuICBtYXJrcyA9IHJlcXVpcmUoJy4vbWFya3MnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBzdGFja2luZztcblxuZnVuY3Rpb24gc3RhY2tpbmcoc3BlYywgZW5jb2RpbmcsIG1kZWYsIGZhY2V0cykge1xuICBpZiAoIW1hcmtzW2VuY29kaW5nLm1hcmt0eXBlKCldLnN0YWNrKSByZXR1cm4gZmFsc2U7XG5cbiAgLy8gVE9ETzogYWRkIHx8IGVuY29kaW5nLmhhcyhMT0QpIGhlcmUgb25jZSBMT0QgaXMgaW1wbGVtZW50ZWRcbiAgaWYgKCFlbmNvZGluZy5oYXMoQ09MT1IpKSByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIGRpbT1udWxsLCB2YWw9bnVsbCwgaWR4ID1udWxsLFxuICAgIGlzWE1lYXN1cmUgPSBlbmNvZGluZy5pc01lYXN1cmUoWCksXG4gICAgaXNZTWVhc3VyZSA9IGVuY29kaW5nLmlzTWVhc3VyZShZKTtcblxuICBpZiAoaXNYTWVhc3VyZSAmJiAhaXNZTWVhc3VyZSkge1xuICAgIGRpbSA9IFk7XG4gICAgdmFsID0gWDtcbiAgICBpZHggPSAwO1xuICB9IGVsc2UgaWYgKGlzWU1lYXN1cmUgJiYgIWlzWE1lYXN1cmUpIHtcbiAgICBkaW0gPSBYO1xuICAgIHZhbCA9IFk7XG4gICAgaWR4ID0gMTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDsgLy8gbm8gc3RhY2sgZW5jb2RpbmdcbiAgfVxuXG4gIC8vIGFkZCB0cmFuc2Zvcm0gdG8gY29tcHV0ZSBzdW1zIGZvciBzY2FsZVxuICB2YXIgc3RhY2tlZCA9IHtcbiAgICBuYW1lOiBTVEFDS0VELFxuICAgIHNvdXJjZTogVEFCTEUsXG4gICAgdHJhbnNmb3JtOiBbe1xuICAgICAgdHlwZTogJ2FnZ3JlZ2F0ZScsXG4gICAgICBncm91cGJ5OiBbZW5jb2RpbmcuZmllbGQoZGltKV0uY29uY2F0KGZhY2V0cyksIC8vIGRpbSBhbmQgb3RoZXIgZmFjZXRzXG4gICAgICBmaWVsZHM6IFt7b3A6ICdzdW0nLCBmaWVsZDogZW5jb2RpbmcuZmllbGQodmFsKX1dIC8vIFRPRE8gY2hlY2sgaWYgZmllbGQgd2l0aCBhZ2dyIGlzIGNvcnJlY3Q/XG4gICAgfV1cbiAgfTtcblxuICBpZiAoZmFjZXRzICYmIGZhY2V0cy5sZW5ndGggPiAwKSB7XG4gICAgc3RhY2tlZC50cmFuc2Zvcm0ucHVzaCh7IC8vY2FsY3VsYXRlIG1heCBmb3IgZWFjaCBmYWNldFxuICAgICAgdHlwZTogJ2FnZ3JlZ2F0ZScsXG4gICAgICBncm91cGJ5OiBmYWNldHMsXG4gICAgICBmaWVsZHM6IFt7b3A6ICdtYXgnLCBmaWVsZDogJ2RhdGEuc3VtXycgKyBlbmNvZGluZy5maWVsZCh2YWwsIHRydWUpfV1cbiAgICB9KTtcbiAgfVxuXG4gIHNwZWMuZGF0YS5wdXNoKHN0YWNrZWQpO1xuXG4gIC8vIGFkZCBzdGFjayB0cmFuc2Zvcm0gdG8gbWFya1xuICBtZGVmLmZyb20udHJhbnNmb3JtID0gW3tcbiAgICB0eXBlOiAnc3RhY2snLFxuICAgIHBvaW50OiBlbmNvZGluZy5maWVsZChkaW0pLFxuICAgIGhlaWdodDogZW5jb2RpbmcuZmllbGQodmFsKSxcbiAgICBvdXRwdXQ6IHt5MTogdmFsLCB5MDogdmFsICsgJzInfVxuICB9XTtcblxuICAvLyBUT0RPOiBUaGlzIGlzIHN1cGVyIGhhY2staXNoIC0tIGNvbnNvbGlkYXRlIGludG8gbW9kdWxhciBtYXJrIHByb3BlcnRpZXM/XG4gIG1kZWYucHJvcGVydGllcy51cGRhdGVbdmFsXSA9IG1kZWYucHJvcGVydGllcy5lbnRlclt2YWxdID0ge3NjYWxlOiB2YWwsIGZpZWxkOiB2YWx9O1xuICBtZGVmLnByb3BlcnRpZXMudXBkYXRlW3ZhbCArICcyJ10gPSBtZGVmLnByb3BlcnRpZXMuZW50ZXJbdmFsICsgJzInXSA9IHtzY2FsZTogdmFsLCBmaWVsZDogdmFsICsgJzInfTtcblxuICByZXR1cm4gdmFsOyAvL3JldHVybiBzdGFjayBlbmNvZGluZ1xufVxuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKTtcblxudmFyIGdyb3VwZGVmID0gcmVxdWlyZSgnLi9ncm91cCcpLmRlZjtcblxubW9kdWxlLmV4cG9ydHMgPSBzdWJmYWNldGluZztcblxuZnVuY3Rpb24gc3ViZmFjZXRpbmcoZ3JvdXAsIG1kZWYsIGRldGFpbHMsIHN0YWNrLCBlbmNvZGluZykge1xuICB2YXIgbSA9IGdyb3VwLm1hcmtzLFxuICAgIGcgPSBncm91cGRlZignc3ViZmFjZXQnLCB7bWFya3M6IG19KTtcblxuICBncm91cC5tYXJrcyA9IFtnXTtcbiAgZy5mcm9tID0gbWRlZi5mcm9tO1xuICBkZWxldGUgbWRlZi5mcm9tO1xuXG4gIC8vVE9ETyB0ZXN0IExPRCAtLSB3ZSBzaG91bGQgc3VwcG9ydCBzdGFjayAvIGxpbmUgd2l0aG91dCBjb2xvciAoTE9EKSBmaWVsZFxuICB2YXIgdHJhbnMgPSAoZy5mcm9tLnRyYW5zZm9ybSB8fCAoZy5mcm9tLnRyYW5zZm9ybSA9IFtdKSk7XG4gIHRyYW5zLnVuc2hpZnQoe3R5cGU6ICdmYWNldCcsIGtleXM6IGRldGFpbHN9KTtcblxuICBpZiAoc3RhY2sgJiYgZW5jb2RpbmcuaGFzKENPTE9SKSkge1xuICAgIHRyYW5zLnVuc2hpZnQoe3R5cGU6ICdzb3J0JywgYnk6IGVuY29kaW5nLmZpZWxkKENPTE9SKX0pO1xuICB9XG59XG4iLCJ2YXIgZ2xvYmFscyA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKTtcblxudmFyIGdyb3VwZGVmID0gcmVxdWlyZSgnLi9ncm91cCcpLmRlZixcbiAgdmxkYXRhID0gcmVxdWlyZSgnLi4vZGF0YScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRlbXBsYXRlO1xuXG5mdW5jdGlvbiB0ZW1wbGF0ZShlbmNvZGluZywgc2l6ZSwgc3RhdHMpIHsgLy9oYWNrIHVzZSBzdGF0c1xuXG4gIHZhciBkYXRhID0ge25hbWU6IFRBQkxFLCBmb3JtYXQ6IHt0eXBlOiBlbmNvZGluZy5jb25maWcoJ2RhdGFGb3JtYXRUeXBlJyl9fSxcbiAgICBkYXRhVXJsID0gdmxkYXRhLmdldFVybChlbmNvZGluZywgc3RhdHMpO1xuICBpZiAoZGF0YVVybCkgZGF0YS51cmwgPSBkYXRhVXJsO1xuXG4gIHZhciBwcmVhZ2dyZWdhdGVkRGF0YSA9IGVuY29kaW5nLmNvbmZpZygndXNlVmVnYVNlcnZlcicpO1xuXG4gIGVuY29kaW5nLmZvckVhY2goZnVuY3Rpb24oZW5jVHlwZSwgZmllbGQpIHtcbiAgICBpZiAoZmllbGQudHlwZSA9PSBUKSB7XG4gICAgICBkYXRhLmZvcm1hdC5wYXJzZSA9IGRhdGEuZm9ybWF0LnBhcnNlIHx8IHt9O1xuICAgICAgZGF0YS5mb3JtYXQucGFyc2VbZmllbGQubmFtZV0gPSAnZGF0ZSc7XG4gICAgfWVsc2UgaWYgKGZpZWxkLnR5cGUgPT0gUSkge1xuICAgICAgZGF0YS5mb3JtYXQucGFyc2UgPSBkYXRhLmZvcm1hdC5wYXJzZSB8fCB7fTtcbiAgICAgIGlmIChmaWVsZC5hZ2dyID09PSAnY291bnQnKSB7XG4gICAgICAgIHZhciBuYW1lID0gJ2NvdW50JztcbiAgICAgIH0gZWxzZSBpZiAocHJlYWdncmVnYXRlZERhdGEgJiYgZmllbGQuYmluKSB7XG4gICAgICAgIHZhciBuYW1lID0gJ2Jpbl8nICsgZmllbGQubmFtZTtcbiAgICAgIH0gZWxzZSBpZiAocHJlYWdncmVnYXRlZERhdGEgJiYgZmllbGQuYWdncikge1xuICAgICAgICB2YXIgbmFtZSA9IGZpZWxkLmFnZ3IgKyAnXycgKyBmaWVsZC5uYW1lO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIG5hbWUgPSBmaWVsZC5uYW1lO1xuICAgICAgfVxuICAgICAgZGF0YS5mb3JtYXQucGFyc2VbbmFtZV0gPSAnbnVtYmVyJztcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgd2lkdGg6IHNpemUud2lkdGgsXG4gICAgaGVpZ2h0OiBzaXplLmhlaWdodCxcbiAgICBwYWRkaW5nOiAnYXV0bycsXG4gICAgZGF0YTogW2RhdGFdLFxuICAgIG1hcmtzOiBbZ3JvdXBkZWYoJ2NlbGwnLCB7XG4gICAgICB3aWR0aDogc2l6ZS5jZWxsV2lkdGggPyB7dmFsdWU6IHNpemUuY2VsbFdpZHRofSA6IHVuZGVmaW5lZCxcbiAgICAgIGhlaWdodDogc2l6ZS5jZWxsSGVpZ2h0ID8ge3ZhbHVlOiBzaXplLmNlbGxIZWlnaHR9IDogdW5kZWZpbmVkXG4gICAgfSldXG4gIH07XG59XG4iLCJ2YXIgZ2xvYmFscyA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB0aW1lO1xuXG5mdW5jdGlvbiB0aW1lKHNwZWMsIGVuY29kaW5nLCBvcHQpIHtcbiAgdmFyIHRpbWVGaWVsZHMgPSB7fSwgdGltZUZuID0ge307XG5cbiAgLy8gZmluZCB1bmlxdWUgZm9ybXVsYSB0cmFuc2Zvcm1hdGlvbiBhbmQgYmluIGZ1bmN0aW9uXG4gIGVuY29kaW5nLmZvckVhY2goZnVuY3Rpb24oZW5jVHlwZSwgZmllbGQpIHtcbiAgICBpZiAoZmllbGQudHlwZSA9PT0gVCAmJiBmaWVsZC5mbikge1xuICAgICAgdGltZUZpZWxkc1tlbmNvZGluZy5maWVsZChlbmNUeXBlKV0gPSB7XG4gICAgICAgIGZpZWxkOiBmaWVsZCxcbiAgICAgICAgZW5jVHlwZTogZW5jVHlwZVxuICAgICAgfTtcbiAgICAgIHRpbWVGbltmaWVsZC5mbl0gPSB0cnVlO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gYWRkIGZvcm11bGEgdHJhbnNmb3JtXG4gIHZhciBkYXRhID0gc3BlYy5kYXRhWzBdLFxuICAgIHRyYW5zZm9ybSA9IGRhdGEudHJhbnNmb3JtID0gZGF0YS50cmFuc2Zvcm0gfHwgW107XG5cbiAgZm9yICh2YXIgZiBpbiB0aW1lRmllbGRzKSB7XG4gICAgdmFyIHRmID0gdGltZUZpZWxkc1tmXTtcbiAgICB0aW1lLnRyYW5zZm9ybSh0cmFuc2Zvcm0sIGVuY29kaW5nLCB0Zi5lbmNUeXBlLCB0Zi5maWVsZCk7XG4gIH1cblxuICAvLyBhZGQgc2NhbGVzXG4gIHZhciBzY2FsZXMgPSBzcGVjLnNjYWxlcyA9IHNwZWMuc2NhbGVzIHx8IFtdO1xuICBmb3IgKHZhciBmbiBpbiB0aW1lRm4pIHtcbiAgICB0aW1lLnNjYWxlKHNjYWxlcywgZm4sIGVuY29kaW5nKTtcbiAgfVxuICByZXR1cm4gc3BlYztcbn1cblxuLyoqXG4gKiBAcmV0dXJuIHtTdHJpbmd9IGRhdGUgYmlubmluZyBmb3JtdWxhIG9mIHRoZSBnaXZlbiBmaWVsZFxuICovXG50aW1lLmZvcm11bGEgPSBmdW5jdGlvbihmaWVsZCkge1xuICB2YXIgZGF0ZSA9ICduZXcgRGF0ZShkLmRhdGEuJysgZmllbGQubmFtZSArICcpJztcbiAgc3dpdGNoIChmaWVsZC5mbikge1xuICAgIGNhc2UgJ3NlY29uZCc6IHJldHVybiBkYXRlICsgJy5nZXRVVENTZWNvbmRzKCknO1xuICAgIGNhc2UgJ21pbnV0ZSc6IHJldHVybiBkYXRlICsgJy5nZXRVVENNaW51dGVzKCknO1xuICAgIGNhc2UgJ2hvdXInOiByZXR1cm4gZGF0ZSArICcuZ2V0VVRDSG91cnMoKSc7XG4gICAgY2FzZSAnZGF5JzogcmV0dXJuIGRhdGUgKyAnLmdldFVUQ0RheSgpJztcbiAgICBjYXNlICdkYXRlJzogcmV0dXJuIGRhdGUgKyAnLmdldFVUQ0RhdGUoKSc7XG4gICAgY2FzZSAnbW9udGgnOiByZXR1cm4gZGF0ZSArICcuZ2V0VVRDTW9udGgoKSc7XG4gICAgY2FzZSAneWVhcic6IHJldHVybiBkYXRlICsgJy5nZXRVVENGdWxsWWVhcigpJztcbiAgfVxuICAvLyBUT0RPIGFkZCBjb250aW51b3VzIGJpbm5pbmdcbiAgY29uc29sZS5lcnJvcignbm8gZnVuY3Rpb24gc3BlY2lmaWVkIGZvciBkYXRlJyk7XG59O1xuXG4vKiogYWRkIGZvcm11bGEgdHJhbnNmb3JtcyB0byBkYXRhICovXG50aW1lLnRyYW5zZm9ybSA9IGZ1bmN0aW9uKHRyYW5zZm9ybSwgZW5jb2RpbmcsIGVuY1R5cGUsIGZpZWxkKSB7XG4gIHRyYW5zZm9ybS5wdXNoKHtcbiAgICB0eXBlOiAnZm9ybXVsYScsXG4gICAgZmllbGQ6IGVuY29kaW5nLmZpZWxkKGVuY1R5cGUpLFxuICAgIGV4cHI6IHRpbWUuZm9ybXVsYShmaWVsZClcbiAgfSk7XG59O1xuXG50aW1lLnNjYWxlID0gZnVuY3Rpb24oc2NhbGVzLCBmbiwgZW5jb2RpbmcpIHtcbiAgdmFyIGxhYmVsTGVuZ3RoID0gZW5jb2RpbmcuY29uZmlnKCd0aW1lU2NhbGVMYWJlbExlbmd0aCcpO1xuICAvLyBUT0RPIGFkZCBvcHRpb24gZm9yIHNob3J0ZXIgc2NhbGUgLyBjdXN0b20gcmFuZ2VcbiAgc3dpdGNoIChmbikge1xuICAgIGNhc2UgJ2RheSc6XG4gICAgICBzY2FsZXMucHVzaCh7XG4gICAgICAgIG5hbWU6ICd0aW1lLWRheScsXG4gICAgICAgIHR5cGU6ICdvcmRpbmFsJyxcbiAgICAgICAgZG9tYWluOiB1dGlsLnJhbmdlKDAsIDcpLFxuICAgICAgICByYW5nZTogWydNb25kYXknLCAnVHVlc2RheScsICdXZWRuZXNkYXknLCAnVGh1cnNkYXknLCAnRnJpZGF5JywgJ1NhdHVyZGF5JywgJ1N1bmRheSddLm1hcChcbiAgICAgICAgICBmdW5jdGlvbihzKSB7IHJldHVybiBzLnN1YnN0cigwLCBsYWJlbExlbmd0aCk7fVxuICAgICAgICApXG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ21vbnRoJzpcbiAgICAgIHNjYWxlcy5wdXNoKHtcbiAgICAgICAgbmFtZTogJ3RpbWUtbW9udGgnLFxuICAgICAgICB0eXBlOiAnb3JkaW5hbCcsXG4gICAgICAgIGRvbWFpbjogdXRpbC5yYW5nZSgwLCAxMiksXG4gICAgICAgIHJhbmdlOiBbJ0phbnVhcnknLCAnRmVicnVhcnknLCAnTWFyY2gnLCAnQXByaWwnLCAnTWF5JywgJ0p1bmUnLCAnSnVseScsICdBdWd1c3QnLCAnU2VwdGVtYmVyJywgJ09jdG9iZXInLCAnTm92ZW1iZXInLCAnRGVjZW1iZXInXS5tYXAoXG4gICAgICAgICAgICBmdW5jdGlvbihzKSB7IHJldHVybiBzLnN1YnN0cigwLCBsYWJlbExlbmd0aCk7fVxuICAgICAgICAgIClcbiAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gIH1cbn07XG4iLCJ2YXIgZ2xvYmFscyA9IHJlcXVpcmUoJy4vZ2xvYmFscycpO1xuXG52YXIgY29uc3RzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuY29uc3RzLmVuY29kaW5nVHlwZXMgPSBbWCwgWSwgUk9XLCBDT0wsIFNJWkUsIFNIQVBFLCBDT0xPUiwgQUxQSEEsIFRFWFRdO1xuXG5jb25zdHMuZGF0YVR5cGVzID0geydPJzogTywgJ1EnOiBRLCAnVCc6IFR9O1xuXG5jb25zdHMuZGF0YVR5cGVOYW1lcyA9IFsnTycsICdRJywgJ1QnXS5yZWR1Y2UoZnVuY3Rpb24ociwgeCkge1xuICByW2NvbnN0cy5kYXRhVHlwZXNbeF1dID0geDsgcmV0dXJuIHI7XG59LHt9KTtcblxuY29uc3RzLkRFRkFVTFRTID0ge1xuICAvLyBzaW5nbGUgcGxvdFxuICBzaW5nbGVIZWlnaHQ6IDIwMCwgLy8gd2lsbCBiZSBvdmVyd3JpdHRlbiBieSBiYW5kV2lkdGggKiAoY2FyZGluYWxpdHkgKyBwYWRkaW5nKVxuICBzaW5nbGVXaWR0aDogMjAwLCAvLyB3aWxsIGJlIG92ZXJ3cml0dGVuIGJ5IGJhbmRXaWR0aCAqIChjYXJkaW5hbGl0eSArIHBhZGRpbmcpXG4gIHNpbmdsZUJhbmRTaXplOiAyMSxcblxuICAvL3NtYWxsIG11bHRpcGxlc1xuICBtdWx0aXBsZUJhbmRTaXplOiAxMyxcblxuICBjZWxsUGFkZGluZzogMC4xLFxuICBjZWxsQmFja2dyb3VuZENvbG9yOiAnI2ZkZmRmZCcsXG4gIHhBeGlzTWFyZ2luOiAwLFxuICB5QXhpc01hcmdpbjogMCxcbiAgdGV4dENlbGxXaWR0aDogOTAsXG5cbiAgLy8gbWFya3NcbiAgc3Ryb2tlV2lkdGg6IDIsXG5cbiAgLy8gc2NhbGVzXG4gIHRpbWVTY2FsZUxhYmVsTGVuZ3RoOiAzXG59O1xuIiwiLy8gVE9ETyByZW5hbWUgZ2V0RGF0YVVybCB0byB2bC5kYXRhLmdldFVybCgpID9cblxudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxudmFyIGRhdGEgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5kYXRhLmdldFVybCA9IGZ1bmN0aW9uIGdldERhdGFVcmwoZW5jb2RpbmcsIHN0YXRzKSB7XG4gIGlmICghZW5jb2RpbmcuY29uZmlnKCd1c2VWZWdhU2VydmVyJykpIHtcbiAgICAvLyBkb24ndCB1c2UgdmVnYSBzZXJ2ZXJcbiAgICByZXR1cm4gZW5jb2RpbmcuY29uZmlnKCdkYXRhVXJsJyk7XG4gIH1cblxuICBpZiAoZW5jb2RpbmcubGVuZ3RoKCkgPT09IDApIHtcbiAgICAvLyBubyBmaWVsZHNcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgZmllbGRzID0gW107XG4gIGVuY29kaW5nLmZvckVhY2goZnVuY3Rpb24oZW5jVHlwZSwgZmllbGQpIHtcbiAgICB2YXIgb2JqID0ge1xuICAgICAgbmFtZTogZW5jb2RpbmcuZmllbGQoZW5jVHlwZSwgdHJ1ZSksXG4gICAgICBmaWVsZDogZmllbGQubmFtZVxuICAgIH07XG4gICAgaWYgKGZpZWxkLmFnZ3IpIHtcbiAgICAgIG9iai5hZ2dyID0gZmllbGQuYWdncjtcbiAgICB9XG4gICAgaWYgKGZpZWxkLmJpbikge1xuICAgICAgb2JqLmJpblNpemUgPSB1dGlsLmdldGJpbnMoc3RhdHNbZmllbGQubmFtZV0pLnN0ZXA7XG4gICAgfVxuICAgIGZpZWxkcy5wdXNoKG9iaik7XG4gIH0pO1xuXG4gIHZhciBxdWVyeSA9IHtcbiAgICB0YWJsZTogZW5jb2RpbmcuY29uZmlnKCd2ZWdhU2VydmVyVGFibGUnKSxcbiAgICBmaWVsZHM6IGZpZWxkc1xuICB9O1xuXG4gIHJldHVybiBlbmNvZGluZy5jb25maWcoJ3ZlZ2FTZXJ2ZXJVcmwnKSArICcvcXVlcnkvP3E9JyArIEpTT04uc3RyaW5naWZ5KHF1ZXJ5KTtcbn07XG5cbi8qKlxuICogQHBhcmFtICB7T2JqZWN0fSBkYXRhIGRhdGEgaW4gSlNPTi9qYXZhc2NyaXB0IG9iamVjdCBmb3JtYXRcbiAqIEByZXR1cm4gQXJyYXkgb2Yge25hbWU6IF9fbmFtZV9fLCB0eXBlOiBcIm51bWJlcnx0ZXh0fHRpbWV8bG9jYXRpb25cIn1cbiAqL1xuZGF0YS5nZXRTY2hlbWEgPSBmdW5jdGlvbihkYXRhKSB7XG4gIHZhciBzY2hlbWEgPSBbXSxcbiAgICBmaWVsZHMgPSB1dGlsLmtleXMoZGF0YVswXSk7XG5cbiAgZmllbGRzLmZvckVhY2goZnVuY3Rpb24oaykge1xuICAgIC8vIGZpbmQgbm9uLW51bGwgZGF0YVxuICAgIHZhciBpID0gMCwgZGF0dW0gPSBkYXRhW2ldW2tdO1xuICAgIHdoaWxlIChkYXR1bSA9PT0gJycgfHwgZGF0dW0gPT09IG51bGwgfHwgZGF0dW0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgZGF0dW0gPSBkYXRhWysraV1ba107XG4gICAgfVxuXG4gICAgLy9UT0RPKGthbml0dyk6IGJldHRlciB0eXBlIGluZmVyZW5jZSBoZXJlXG4gICAgdmFyIHR5cGUgPSAodHlwZW9mIGRhdHVtID09PSAnbnVtYmVyJykgPyAnUSc6XG4gICAgICBpc05hTihEYXRlLnBhcnNlKGRhdHVtKSkgPyAnTycgOiAnVCc7XG5cbiAgICBzY2hlbWEucHVzaCh7bmFtZTogaywgdHlwZTogdHlwZX0pO1xuICB9KTtcblxuICByZXR1cm4gc2NoZW1hO1xufTtcblxuZGF0YS5nZXRTdGF0cyA9IGZ1bmN0aW9uKGRhdGEpIHsgLy8gaGFja1xuICB2YXIgc3RhdHMgPSB7fSxcbiAgICBmaWVsZHMgPSB1dGlsLmtleXMoZGF0YVswXSk7XG5cbiAgZmllbGRzLmZvckVhY2goZnVuY3Rpb24oaykge1xuICAgIHZhciBzdGF0ID0gdXRpbC5taW5tYXgoZGF0YSwgayk7XG4gICAgc3RhdC5jYXJkaW5hbGl0eSA9IHV0aWwudW5pcShkYXRhLCBrKTtcbiAgICBzdGF0LmNvdW50ID0gZGF0YS5sZW5ndGg7XG4gICAgc3RhdHNba10gPSBzdGF0O1xuICB9KTtcbiAgcmV0dXJuIHN0YXRzO1xufTtcbiIsIi8vIHV0aWxpdHkgZm9yIGZpZWxkXG5cbnZhciBjb25zdHMgPSByZXF1aXJlKCcuL2NvbnN0cycpO1xuXG52YXIgZmllbGQgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5maWVsZC5zaG9ydGhhbmQgPSBmdW5jdGlvbihmKSB7XG4gIHJldHVybiAoZi5hZ2dyID8gZi5hZ2dyICsgJ18nIDogJycpICtcbiAgICAoZi5mbiA/IGYuZm4gKyAnXycgOiAnJykgK1xuICAgIChmLmJpbiA/ICdiaW5fJyA6ICcnKSArXG4gICAgKGYubmFtZSB8fCAnJykgKyAnLScgK1xuICAgIChjb25zdHMuZGF0YVR5cGVOYW1lc1tmLnR5cGVdIHx8IGYudHlwZSk7XG59O1xuXG5maWVsZC5zaG9ydGhhbmRzID0gZnVuY3Rpb24oZmllbGRzLCBkZWxpbSl7XG4gIGRlbGltID0gZGVsaW0gfHwgJywnO1xuICByZXR1cm4gZmllbGRzLm1hcChmaWVsZC5zaG9ydGhhbmQpLmpvaW4oZGVsaW0pO1xufTtcblxudmFyIHR5cGVPcmRlciA9IHtcbiAgTzogMCxcbiAgRzogMSxcbiAgVDogMixcbiAgUTogM1xufTtcblxuZmllbGQub3JkZXIgPSB7fTtcblxuZmllbGQub3JkZXIudHlwZVRoZW5OYW1lID0gZnVuY3Rpb24oZmllbGQpIHtcbiAgcmV0dXJuIHR5cGVPcmRlcltmaWVsZC50eXBlXSArICdfJyArIGZpZWxkLm5hbWU7XG59O1xuXG5maWVsZC5vcmRlci5vcmlnaW5hbCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gMDsgLy8gbm8gc3dhcCB3aWxsIG9jY3VyXG59O1xuXG5maWVsZC5vcmRlci5uYW1lID0gZnVuY3Rpb24oZmllbGQpIHtcbiAgcmV0dXJuIGZpZWxkLm5hbWU7XG59O1xuXG5maWVsZC5vcmRlci50eXBlVGhlbkNhcmRpbmFsaXR5ID0gZnVuY3Rpb24oZmllbGQsIHN0YXRzKXtcbiAgcmV0dXJuIHN0YXRzW2ZpZWxkLm5hbWVdLmNhcmRpbmFsaXR5O1xufTtcbiIsIi8vIGRlY2xhcmUgZ2xvYmFsIGNvbnN0YW50XG52YXIgZyA9IGdsb2JhbCB8fCB3aW5kb3c7XG5cbmcuVEFCTEUgPSAndGFibGUnO1xuZy5TVEFDS0VEID0gJ3N0YWNrZWQnO1xuZy5JTkRFWCA9ICdpbmRleCc7XG5cbmcuWCA9ICd4JztcbmcuWSA9ICd5JztcbmcuUk9XID0gJ3Jvdyc7XG5nLkNPTCA9ICdjb2wnO1xuZy5TSVpFID0gJ3NpemUnO1xuZy5TSEFQRSA9ICdzaGFwZSc7XG5nLkNPTE9SID0gJ2NvbG9yJztcbmcuQUxQSEEgPSAnYWxwaGEnO1xuZy5URVhUID0gJ3RleHQnO1xuXG5nLk8gPSAxO1xuZy5RID0gMjtcbmcuVCA9IDQ7XG5cbi8vVE9ETyByZWZhY3RvciB0aGlzIHRvIGJlIGNvbmZpZz9cbmcuTUFYX0JJTlMgPSAyMDtcbiIsIi8vIFBhY2thZ2Ugb2YgZGVmaW5pbmcgVmVnYWxpdGUgU3BlY2lmaWNhdGlvbidzIGpzb24gc2NoZW1hXG5cbnZhciBzY2hlbWEgPSBtb2R1bGUuZXhwb3J0cyA9IHt9LFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG5zY2hlbWEudXRpbCA9IHJlcXVpcmUoJy4vc2NoZW1hdXRpbCcpO1xuXG5zY2hlbWEubWFya3R5cGUgPSB7XG4gIHR5cGU6ICdzdHJpbmcnLFxuICBlbnVtOiBbJ3BvaW50JywgJ2JhcicsICdsaW5lJywgJ2FyZWEnLCAnY2lyY2xlJywgJ3NxdWFyZScsICd0ZXh0J11cbn07XG5cbnNjaGVtYS5hZ2dyID0ge1xuICB0eXBlOiAnc3RyaW5nJyxcbiAgZW51bTogWydhdmcnLCAnc3VtJywgJ21pbicsICdtYXgnLCAnY291bnQnXSxcbiAgc3VwcG9ydGVkRW51bXM6IHtcbiAgICBROiBbJ2F2ZycsICdzdW0nLCAnbWluJywgJ21heCcsICdjb3VudCddLFxuICAgIE86IFtdLFxuICAgIFQ6IFsnYXZnJywgJ21pbicsICdtYXgnXSxcbiAgICAnJzogWydjb3VudCddXG4gIH0sXG4gIHN1cHBvcnRlZFR5cGVzOiB7J1EnOiB0cnVlLCAnTyc6IHRydWUsICdUJzogdHJ1ZSwgJyc6IHRydWV9XG59O1xuXG5zY2hlbWEuYmFuZCA9IHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHByb3BlcnRpZXM6IHtcbiAgICBzaXplOiB7XG4gICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICBtaW5pbXVtOiAwXG4gICAgfSxcbiAgICBwYWRkaW5nOiB7XG4gICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICBtaW5pbXVtOiAwLFxuICAgICAgZGVmYXVsdDogMVxuICAgIH1cbiAgfVxufTtcblxuc2NoZW1hLnRpbWVmbnMgPSBbJ21vbnRoJywgJ3llYXInLCAnZGF5JywgJ2RhdGUnLCAnaG91cicsICdtaW51dGUnLCAnc2Vjb25kJ107XG5cbnNjaGVtYS5mbiA9IHtcbiAgdHlwZTogJ3N0cmluZycsXG4gIGVudW06IHNjaGVtYS50aW1lZm5zLFxuICBzdXBwb3J0ZWRUeXBlczogeydUJzogdHJ1ZX1cbn07XG5cbi8vVE9ETyhrYW5pdHcpOiBhZGQgb3RoZXIgdHlwZSBvZiBmdW5jdGlvbiBoZXJlXG5cbnNjaGVtYS5zY2FsZV90eXBlID0ge1xuICB0eXBlOiAnc3RyaW5nJyxcbiAgZW51bTogWydsaW5lYXInLCAnbG9nJywgJ3BvdycsICdzcXJ0JywgJ3F1YW50aWxlJ10sXG4gIGRlZmF1bHQ6ICdsaW5lYXInLFxuICBzdXBwb3J0ZWRUeXBlczogeydRJzogdHJ1ZX1cbn07XG5cbnNjaGVtYS5maWVsZCA9IHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHByb3BlcnRpZXM6IHtcbiAgICBuYW1lOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgIH1cbiAgfVxufTtcblxudmFyIGNsb25lID0gdXRpbC5kdXBsaWNhdGU7XG52YXIgbWVyZ2UgPSBzY2hlbWEudXRpbC5tZXJnZTtcblxudmFyIHR5cGljYWxGaWVsZCA9IG1lcmdlKGNsb25lKHNjaGVtYS5maWVsZCksIHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHByb3BlcnRpZXM6IHtcbiAgICB0eXBlOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGVudW06IFsnTycsICdRJywgJ1QnXVxuICAgIH0sXG4gICAgYmluOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIHN1cHBvcnRlZFR5cGVzOiB7J1EnOiB0cnVlfSAvLyBUT0RPOiBhZGQgJ08nIGFmdGVyIGZpbmlzaGluZyAjODFcbiAgICB9LFxuICAgIGFnZ3I6IHNjaGVtYS5hZ2dyLFxuICAgIGZuOiBzY2hlbWEuZm4sXG4gICAgc2NhbGU6IHtcbiAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgcHJvcGVydGllczoge1xuICAgICAgICB0eXBlOiBzY2hlbWEuc2NhbGVfdHlwZSxcbiAgICAgICAgcmV2ZXJzZTogeyB0eXBlOiAnYm9vbGVhbicsIGRlZmF1bHQ6IGZhbHNlIH0sXG4gICAgICAgIHplcm86IHtcbiAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdJbmNsdWRlIHplcm8nLFxuICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgICAgc3VwcG9ydGVkVHlwZXM6IHsnUSc6IHRydWV9XG4gICAgICAgIH0sXG4gICAgICAgIG5pY2U6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICBlbnVtOiBbJ3NlY29uZCcsICdtaW51dGUnLCAnaG91cicsICdkYXknLCAnd2VlaycsICdtb250aCcsICd5ZWFyJ10sXG4gICAgICAgICAgc3VwcG9ydGVkVHlwZXM6IHsnVCc6IHRydWV9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pO1xuXG52YXIgb25seU9yZGluYWxGaWVsZCA9IG1lcmdlKGNsb25lKHNjaGVtYS5maWVsZCksIHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHByb3BlcnRpZXM6IHtcbiAgICB0eXBlOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGVudW06IFsnTycsJ1EnXSAvLyBvcmRpbmFsLW9ubHkgZmllbGQgc3VwcG9ydHMgUSB3aGVuIGJpbiBpcyBhcHBsaWVkXG4gICAgfSxcbiAgICBiaW46IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgc3VwcG9ydGVkVHlwZXM6IHsnUSc6IHRydWV9IC8vIFRPRE86IGFkZCAnTycgYWZ0ZXIgZmluaXNoaW5nICM4MVxuICAgIH0sXG4gICAgYWdncjoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBlbnVtOiBbJ2NvdW50J10sXG4gICAgICBzdXBwb3J0ZWRUeXBlczogeydPJzogdHJ1ZX1cbiAgICB9XG4gIH1cbn0pO1xuXG52YXIgYXhpc01peGluID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgcHJvcGVydGllczoge1xuICAgIGF4aXM6IHtcbiAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgcHJvcGVydGllczoge1xuICAgICAgICBncmlkOiB7XG4gICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQSBmbGFnIGluZGljYXRlIGlmIGdyaWRsaW5lcyBzaG91bGQgYmUgY3JlYXRlZCBpbiBhZGRpdGlvbiB0byB0aWNrcy4nXG4gICAgICAgIH0sXG4gICAgICAgIHRpdGxlOiB7XG4gICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdBIHRpdGxlIGZvciB0aGUgYXhpcy4nXG4gICAgICAgIH0sXG4gICAgICAgIGZvcm1hdDoge1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIGZvcm1hdHRpbmcgcGF0dGVybiBmb3IgYXhpcyBsYWJlbHMuJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG52YXIgYmFuZE1peGluID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgcHJvcGVydGllczoge1xuICAgIGJhbmQ6IHNjaGVtYS5iYW5kXG4gIH1cbn07XG5cbnZhciBsZWdlbmRNaXhpbiA9IHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHByb3BlcnRpZXM6IHtcbiAgICBsZWdlbmQ6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICB9XG4gIH1cbn07XG5cbnZhciB0ZXh0TWl4aW4gPSB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgdGV4dDoge1xuICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIHRleHQ6IHtcbiAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBhbGlnbjoge1xuICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgZGVmYXVsdDogJ2xlZnQnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYmFzZWxpbmU6IHtcbiAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgIGRlZmF1bHQ6ICdtaWRkbGUnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbWFyZ2luOiB7XG4gICAgICAgICAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgICAgICAgICAgZGVmYXVsdDogNCxcbiAgICAgICAgICAgICAgbWluaW11bTogMFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZm9udDoge1xuICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIHdlaWdodDoge1xuICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgZW51bTogWydub3JtYWwnLCAnYm9sZCddLFxuICAgICAgICAgICAgICBkZWZhdWx0OiAnbm9ybWFsJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNpemU6IHtcbiAgICAgICAgICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgICAgICAgICBkZWZhdWx0OiAxMCxcbiAgICAgICAgICAgICAgbWluaW11bTogMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZhbWlseToge1xuICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgZGVmYXVsdDogJ0hlbHZldGljYSBOZXVlJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICBkZWZhdWx0OiAnbm9ybWFsJyxcbiAgICAgICAgICAgICAgZW51bTogWydub3JtYWwnLCAnaXRhbGljJ11cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbnZhciBzaXplTWl4aW4gPSB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgdmFsdWU6IHtcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgIGRlZmF1bHQ6IDEwLFxuICAgICAgbWluaW11bTogMFxuICAgIH1cbiAgfVxufTtcblxudmFyIGNvbG9yTWl4aW4gPSB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgdmFsdWU6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogJ3N0ZWVsYmx1ZSdcbiAgICB9LFxuICAgIHNjYWxlOiB7XG4gICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgcmFuZ2U6IHtcbiAgICAgICAgICB0eXBlOiBbJ3N0cmluZycsICdhcnJheSddXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbnZhciBhbHBoYU1peGluID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgcHJvcGVydGllczoge1xuICAgIHZhbHVlOiB7XG4gICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgIGRlZmF1bHQ6IDEsXG4gICAgICBtaW5pbXVtOiAwLFxuICAgICAgbWF4aW11bTogMVxuICAgIH1cbiAgfVxufTtcblxudmFyIHNoYXBlTWl4aW4gPSB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgdmFsdWU6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZW51bTogWydjaXJjbGUnLCAnc3F1YXJlJywgJ2Nyb3NzJywgJ2RpYW1vbmQnLCAndHJpYW5nbGUtdXAnLCAndHJpYW5nbGUtZG93biddLFxuICAgICAgZGVmYXVsdDogJ2NpcmNsZSdcbiAgICB9XG4gIH1cbn07XG5cbnZhciByb3dNaXhpbiA9IHtcbiAgcHJvcGVydGllczoge1xuICAgIGhlaWdodDoge1xuICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICBtaW5pbXVtOiAwLFxuICAgICAgZGVmYXVsdDogMTUwXG4gICAgfSxcbiAgICBwYWRkaW5nOiB7XG4gICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgIG1pbmltdW06IDAsXG4gICAgICBtYXhpbXVtOiAxLFxuICAgICAgZGVmYXVsdDogMC4xXG4gICAgfVxuICB9XG59O1xuXG52YXIgY29sTWl4aW4gPSB7XG4gIHByb3BlcnRpZXM6IHtcbiAgICB3aWR0aDoge1xuICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICBtaW5pbXVtOiAwLFxuICAgICAgZGVmYXVsdDogMTUwXG4gICAgfSxcbiAgICBwYWRkaW5nOiB7XG4gICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgIG1pbmltdW06IDAsXG4gICAgICBtYXhpbXVtOiAxLFxuICAgICAgZGVmYXVsdDogMC4xXG4gICAgfVxuICB9XG59O1xuXG52YXIgcmVxdWlyZWROYW1lVHlwZSA9IHtcbiAgcmVxdWlyZWQ6IFsnbmFtZScsICd0eXBlJ11cbn07XG5cbnZhciB4ID0gbWVyZ2UobWVyZ2UobWVyZ2UoY2xvbmUodHlwaWNhbEZpZWxkKSwgYXhpc01peGluKSwgYmFuZE1peGluKSwgcmVxdWlyZWROYW1lVHlwZSk7XG52YXIgeSA9IGNsb25lKHgpO1xuXG52YXIgZmFjZXQgPSBtZXJnZShjbG9uZShvbmx5T3JkaW5hbEZpZWxkKSwgcmVxdWlyZWROYW1lVHlwZSk7XG52YXIgcm93ID0gbWVyZ2UoY2xvbmUoZmFjZXQpLCByb3dNaXhpbik7XG52YXIgY29sID0gbWVyZ2UoY2xvbmUoZmFjZXQpLCBjb2xNaXhpbik7XG5cbnZhciBzaXplID0gbWVyZ2UobWVyZ2UoY2xvbmUodHlwaWNhbEZpZWxkKSwgbGVnZW5kTWl4aW4pLCBzaXplTWl4aW4pO1xudmFyIGNvbG9yID0gbWVyZ2UobWVyZ2UoY2xvbmUodHlwaWNhbEZpZWxkKSwgbGVnZW5kTWl4aW4pLCBjb2xvck1peGluKTtcbnZhciBhbHBoYSA9IG1lcmdlKGNsb25lKHR5cGljYWxGaWVsZCksIGFscGhhTWl4aW4pO1xudmFyIHNoYXBlID0gbWVyZ2UobWVyZ2UoY2xvbmUob25seU9yZGluYWxGaWVsZCksIGxlZ2VuZE1peGluKSwgc2hhcGVNaXhpbik7XG5cbnZhciB0ZXh0ID0gbWVyZ2UoY2xvbmUodHlwaWNhbEZpZWxkKSwgdGV4dE1peGluKTtcblxudmFyIGNmZyA9IHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHByb3BlcnRpZXM6IHtcbiAgICAvLyB0ZW1wbGF0ZVxuICAgIHdpZHRoOiB7XG4gICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICBkZWZhdWx0OiB1bmRlZmluZWRcbiAgICB9LFxuICAgIGhlaWdodDoge1xuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgZGVmYXVsdDogdW5kZWZpbmVkXG4gICAgfSxcbiAgICB2aWV3cG9ydDoge1xuICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgIGl0ZW1zOiB7XG4gICAgICAgIHR5cGU6IFsnaW50ZWdlciddXG4gICAgICB9LFxuICAgICAgZGVmYXVsdDogdW5kZWZpbmVkXG4gICAgfSxcbiAgICBfbWluV2lkdGg6IHtcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgIGRlZmF1bHQ6IDIwLFxuICAgICAgbWluaW11bTogMFxuICAgIH0sXG4gICAgX21pbkhlaWdodDoge1xuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgZGVmYXVsdDogMjAsXG4gICAgICBtaW5pbXVtOiAwXG4gICAgfSxcblxuICAgIC8vIGRhdGEgc291cmNlXG4gICAgZGF0YUZvcm1hdFR5cGU6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZW51bTogWydqc29uJywgJ2NzdiddLFxuICAgICAgZGVmYXVsdDogJ2pzb24nXG4gICAgfSxcbiAgICB1c2VWZWdhU2VydmVyOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIH0sXG4gICAgZGF0YVVybDoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiB1bmRlZmluZWRcbiAgICB9LFxuICAgIHZlZ2FTZXJ2ZXJUYWJsZToge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiB1bmRlZmluZWRcbiAgICB9LFxuICAgIHZlZ2FTZXJ2ZXJVcmw6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMSdcbiAgICB9XG4gIH1cbn07XG5cbi8qKiBAdHlwZSBPYmplY3QgU2NoZW1hIG9mIGEgdmVnYWxpdGUgc3BlY2lmaWNhdGlvbiAqL1xuc2NoZW1hLnNjaGVtYSA9IHtcbiAgJHNjaGVtYTogJ2h0dHA6Ly9qc29uLXNjaGVtYS5vcmcvZHJhZnQtMDQvc2NoZW1hIycsXG4gIHR5cGU6ICdvYmplY3QnLFxuICByZXF1aXJlZDogWydtYXJrdHlwZScsICdlbmMnLCAnY2ZnJ10sXG4gIHByb3BlcnRpZXM6IHtcbiAgICBtYXJrdHlwZTogc2NoZW1hLm1hcmt0eXBlLFxuICAgIGVuYzoge1xuICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIHg6IHgsXG4gICAgICAgIHk6IHksXG4gICAgICAgIHJvdzogcm93LFxuICAgICAgICBjb2w6IGNvbCxcbiAgICAgICAgc2l6ZTogc2l6ZSxcbiAgICAgICAgY29sb3I6IGNvbG9yLFxuICAgICAgICBhbHBoYTogYWxwaGEsXG4gICAgICAgIHNoYXBlOiBzaGFwZSxcbiAgICAgICAgdGV4dDogdGV4dFxuICAgICAgfVxuICAgIH0sXG4gICAgY2ZnOiBjZmdcbiAgfVxufTtcblxuLyoqIEluc3RhbnRpYXRlIGEgdmVyYm9zZSB2bCBzcGVjIGZyb20gdGhlIHNjaGVtYSAqL1xuc2NoZW1hLmluc3RhbnRpYXRlID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBzY2hlbWEudXRpbC5pbnN0YW50aWF0ZShzY2hlbWEuc2NoZW1hKTtcbn07XG4iLCJ2YXIgdXRpbCA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnZhciBpc0VtcHR5ID0gZnVuY3Rpb24ob2JqKSB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhvYmopLmxlbmd0aCA9PT0gMDtcbn07XG5cbi8vIGluc3RhbnRpYXRlIGEgc2NoZW1hXG51dGlsLmluc3RhbnRpYXRlID0gZnVuY3Rpb24oc2NoZW1hKSB7XG4gIGlmIChzY2hlbWEudHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICB2YXIgaW5zdGFuY2UgPSB7fTtcbiAgICBmb3IgKHZhciBuYW1lIGluIHNjaGVtYS5wcm9wZXJ0aWVzKSB7XG4gICAgICB2YXIgdmFsID0gdXRpbC5pbnN0YW50aWF0ZShzY2hlbWEucHJvcGVydGllc1tuYW1lXSk7XG4gICAgICBpZiAodmFsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaW5zdGFuY2VbbmFtZV0gPSB2YWw7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBpbnN0YW5jZTtcbiAgfSBlbHNlIGlmICgnZGVmYXVsdCcgaW4gc2NoZW1hKSB7XG4gICAgcmV0dXJuIHNjaGVtYS5kZWZhdWx0O1xuICB9XG4gIHJldHVybiB1bmRlZmluZWQ7XG59O1xuXG4vLyByZW1vdmUgYWxsIGRlZmF1bHRzIGZyb20gYW4gaW5zdGFuY2VcbnV0aWwuc3VidHJhY3QgPSBmdW5jdGlvbihpbnN0YW5jZSwgZGVmYXVsdHMpIHtcbiAgdmFyIGNoYW5nZXMgPSB7fTtcbiAgZm9yICh2YXIgcHJvcCBpbiBpbnN0YW5jZSkge1xuICAgIGlmICghZGVmYXVsdHMgfHwgZGVmYXVsdHNbcHJvcF0gIT09IGluc3RhbmNlW3Byb3BdKSB7XG4gICAgICBpZiAodHlwZW9mIGluc3RhbmNlW3Byb3BdID09PSAnb2JqZWN0JyAmJiAhKGluc3RhbmNlW3Byb3BdIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgICAgIHZhciBjID0gdXRpbC5zdWJ0cmFjdChpbnN0YW5jZVtwcm9wXSwgZGVmYXVsdHNbcHJvcF0pO1xuICAgICAgICBpZiAoIWlzRW1wdHkoYykpXG4gICAgICAgICAgY2hhbmdlc1twcm9wXSA9IGM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjaGFuZ2VzW3Byb3BdID0gaW5zdGFuY2VbcHJvcF07XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBjaGFuZ2VzO1xufTtcblxuLy8gcmVjdXJzaXZlbHkgbWVyZ2VzIGluc3RhbmNlIGludG8gZGVmYXVsdHNcbnV0aWwubWVyZ2UgPSBmdW5jdGlvbihkZWZhdWx0cywgaW5zdGFuY2UpIHtcbiAgaWYgKHR5cGVvZiBpbnN0YW5jZSAhPT0gJ29iamVjdCcgfHwgaW5zdGFuY2UgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZGVmYXVsdHM7XG4gIH1cblxuICBmb3IgKHZhciBwIGluIGluc3RhbmNlKSB7XG4gICAgaWYgKCFpbnN0YW5jZS5oYXNPd25Qcm9wZXJ0eShwKSlcbiAgICAgIGNvbnRpbnVlO1xuICAgIGlmIChpbnN0YW5jZVtwXSA9PT0gdW5kZWZpbmVkKVxuICAgICAgY29udGludWU7XG4gICAgaWYgKHR5cGVvZiBpbnN0YW5jZVtwXSAhPT0gJ29iamVjdCcgfHwgaW5zdGFuY2VbcF0gPT09IG51bGwpIHtcbiAgICAgIGRlZmF1bHRzW3BdID0gaW5zdGFuY2VbcF07XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGVmYXVsdHNbcF0gIT09ICdvYmplY3QnIHx8IGRlZmF1bHRzW3BdID09PSBudWxsKSB7XG4gICAgICBkZWZhdWx0c1twXSA9IHV0aWwubWVyZ2UoaW5zdGFuY2VbcF0uY29uc3RydWN0b3IgPT09IEFycmF5ID8gW10gOiB7fSwgaW5zdGFuY2VbcF0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB1dGlsLm1lcmdlKGRlZmF1bHRzW3BdLCBpbnN0YW5jZVtwXSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBkZWZhdWx0cztcbn07XG4iLCJ2YXIgdXRpbCA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnV0aWwua2V5cyA9IGZ1bmN0aW9uKG9iaikge1xuICB2YXIgayA9IFtdLCB4O1xuICBmb3IgKHggaW4gb2JqKSBrLnB1c2goeCk7XG4gIHJldHVybiBrO1xufTtcblxudXRpbC52YWxzID0gZnVuY3Rpb24ob2JqKSB7XG4gIHZhciB2ID0gW10sIHg7XG4gIGZvciAoeCBpbiBvYmopIHYucHVzaChvYmpbeF0pO1xuICByZXR1cm4gdjtcbn07XG5cbnV0aWwucmFuZ2UgPSBmdW5jdGlvbihzdGFydCwgc3RvcCwgc3RlcCkge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIHtcbiAgICBzdGVwID0gMTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgIHN0b3AgPSBzdGFydDtcbiAgICAgIHN0YXJ0ID0gMDtcbiAgICB9XG4gIH1cbiAgaWYgKChzdG9wIC0gc3RhcnQpIC8gc3RlcCA9PSBJbmZpbml0eSkgdGhyb3cgbmV3IEVycm9yKCdpbmZpbml0ZSByYW5nZScpO1xuICB2YXIgcmFuZ2UgPSBbXSwgaSA9IC0xLCBqO1xuICBpZiAoc3RlcCA8IDApIHdoaWxlICgoaiA9IHN0YXJ0ICsgc3RlcCAqICsraSkgPiBzdG9wKSByYW5nZS5wdXNoKGopO1xuICBlbHNlIHdoaWxlICgoaiA9IHN0YXJ0ICsgc3RlcCAqICsraSkgPCBzdG9wKSByYW5nZS5wdXNoKGopO1xuICByZXR1cm4gcmFuZ2U7XG59O1xuXG51dGlsLmZpbmQgPSBmdW5jdGlvbihsaXN0LCBwYXR0ZXJuKSB7XG4gIHZhciBsID0gbGlzdC5maWx0ZXIoZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB4W3BhdHRlcm4ubmFtZV0gPT09IHBhdHRlcm4udmFsdWU7XG4gIH0pO1xuICByZXR1cm4gbC5sZW5ndGggJiYgbFswXSB8fCBudWxsO1xufTtcblxudXRpbC51bmlxID0gZnVuY3Rpb24oZGF0YSwgZmllbGQpIHtcbiAgdmFyIG1hcCA9IHt9LCBjb3VudCA9IDAsIGksIGs7XG4gIGZvciAoaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgKytpKSB7XG4gICAgayA9IGRhdGFbaV1bZmllbGRdO1xuICAgIGlmICghbWFwW2tdKSB7XG4gICAgICBtYXBba10gPSAxO1xuICAgICAgY291bnQgKz0gMTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNvdW50O1xufTtcblxudXRpbC5taW5tYXggPSBmdW5jdGlvbihkYXRhLCBmaWVsZCkge1xuICB2YXIgc3RhdHMgPSB7bWluOiArSW5maW5pdHksIG1heDogLUluZmluaXR5fTtcbiAgZm9yIChpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgdiA9IGRhdGFbaV1bZmllbGRdO1xuICAgIGlmICh2ID4gc3RhdHMubWF4KSBzdGF0cy5tYXggPSB2O1xuICAgIGlmICh2IDwgc3RhdHMubWluKSBzdGF0cy5taW4gPSB2O1xuICB9XG4gIHJldHVybiBzdGF0cztcbn07XG5cbnV0aWwuZHVwbGljYXRlID0gZnVuY3Rpb24ob2JqKSB7XG4gIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9iaikpO1xufTtcblxudXRpbC5hbnkgPSBmdW5jdGlvbihhcnIsIGYpIHtcbiAgdmFyIGkgPSAwLCBrO1xuICBmb3IgKGsgaW4gYXJyKSB7XG4gICAgaWYgKGYoYXJyW2tdLCBrLCBpKyspKSByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG51dGlsLmFsbCA9IGZ1bmN0aW9uKGFyciwgZikge1xuICB2YXIgaSA9IDAsIGs7XG4gIGZvciAoayBpbiBhcnIpIHtcbiAgICBpZiAoIWYoYXJyW2tdLCBrLCBpKyspKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xuXG51dGlsLm1lcmdlID0gZnVuY3Rpb24oZGVzdCwgc3JjKSB7XG4gIHJldHVybiB1dGlsLmtleXMoc3JjKS5yZWR1Y2UoZnVuY3Rpb24oYywgaykge1xuICAgIGNba10gPSBzcmNba107XG4gICAgcmV0dXJuIGM7XG4gIH0sIGRlc3QpO1xufTtcblxudXRpbC5nZXRiaW5zID0gZnVuY3Rpb24oc3RhdHMpIHtcbiAgcmV0dXJuIHZnLmJpbnMoe1xuICAgIG1pbjogc3RhdHMubWluLFxuICAgIG1heDogc3RhdHMubWF4LFxuICAgIG1heGJpbnM6IE1BWF9CSU5TXG4gIH0pO1xufTtcblxuXG51dGlsLmVycm9yID0gZnVuY3Rpb24obXNnKSB7XG4gIGNvbnNvbGUuZXJyb3IoJ1tWTCBFcnJvcl0nLCBtc2cpO1xufTtcblxuIl19
