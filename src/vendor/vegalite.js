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
  schema = require('./schema/schema'),
  time = require('./compile/time');

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
    var fn;
    return encoding.isType(encType, O) || encoding.bin(encType) ||
      ( encoding.isType(encType, T) &&
        (fn = encoding.fn(encType)) &&
        time.isOrdinalFn(fn));
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

},{"./compile/time":16,"./consts":17,"./field":19,"./globals":20,"./schema/schema":21,"./util":23}],3:[function(require,module,exports){
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
  util = require('../util'),
  setter = util.setter,
  time = require('./time');

var axis = module.exports = {};

axis.names = function(props) {
  return util.keys(util.keys(props).reduce(function(a, x) {
    var s = props[x].scale;
    if (s === X || s === Y) a[props[x].scale] = 1;
    return a;
  }, {}));
};

axis.defs = function(names, encoding, layout, opt) {
  return names.reduce(function(a, name) {
    a.push(axis.def(name, encoding, layout, opt));
    return a;
  }, []);
};

axis.def = function(name, encoding, layout, opt) {
  var type = name;
  var isCol = name == COL, isRow = name == ROW;
  if (isCol) type = 'x';
  if (isRow) type = 'y';

  var def = {
    type: type,
    scale: name
  };

  if (encoding.axis(name).grid) {
    def.grid = true;
    def.layer = 'back';
  }

  if (encoding.axis(name).title) {
    def = axis_title(def, name, encoding, layout, opt);
  }

  if (isRow || isCol) {
    def.properties = {
      ticks: { opacity: {value: 0} },
      majorTicks: { opacity: {value: 0} },
      axis: { opacity: {value: 0} }
    };
  }

  if (isCol) {
    def.orient = 'top';
  }

  if (isRow) {
    def.offset = axisTitleOffset(encoding, layout, Y) + 20;
  }

  if (name == X && encoding.isOrdinalScale(X)) {
    setter(def, ['properties','labels'], {
      angle: {value: 270},
      align: {value: 'right'},
      baseline: {value: 'middle'}
    });
  }

  if (encoding.axis(name).format) {
    def.format = encoding.axis(name).format;
  } else if (encoding.isType(name, Q)) {
    def.format = "s";
  } else if (encoding.isType(name, T) && !encoding.fn(name)) {
    def.format = "%Y-%m-%d";
  }

  var fn;
  // add custom label for time type
  if (encoding.isType(name, T) && (fn = encoding.fn(name)) && (time.hasScale(fn))) {
    setter(def, ['properties','labels','text','scale'], 'time-'+ fn);
  }

  return def;
};

function axis_title(axis, name, encoding, layout, opt) {
  var maxLength = null,
    fieldTitle = encoding.fieldTitle(name);
  if (name===X) {
    maxlength = layout.cellWidth / layout.characterWidth;
  } else if (name === Y) {
    maxlength = layout.cellHeight / layout.characterWidth;
  }

  axis.title = maxlength ? util.truncate(fieldTitle, maxlength) : fieldTitle;

  if (encoding.isOrdinalScale(name)) {
    axis.titleOffset = axisTitleOffset(encoding, layout, name);
  }
  return axis;
}

function axisTitleOffset(encoding, layout, name) {
  return encoding.axis(name).titleOffset ||
      layout[name].axisTitleOffset;
}

},{"../globals":20,"../util":23,"./time":16}],5:[function(require,module,exports){
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
  axis = compile.axis = require('./axis'),
  legend = compile.legend = require('./legend'),
  marks = compile.marks = require('./marks'),
  scale = compile.scale = require('./scale'),
  time = compile.time = require('./time'),
  aggregates = compile.aggregates = require('./aggregates'),
  binning = compile.binning = require('./binning'),
  faceting = compile.faceting = require('./faceting'),
  stacking = compile.stacking = require('./stacking');
  subfaceting = compile.subfaceting = require('./subfaceting');

compile.layout = require('./layout');
compile.group = require('./group');

function compile(encoding, stats) {
  var layout = compile.layout(encoding, stats);

  var spec = template(encoding, layout, stats),
    group = spec.marks[0],
    mark = marks[encoding.marktype()],
    mdef = marks.def(mark, encoding);

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
    spec = faceting(group, encoding, layout, spec, mdef, stack, stats);
    spec.legends = legend.defs(encoding);
  } else {
    group.scales = scale.defs(scale.names(mdef.properties.update), encoding,
      {stack: stack, stats: stats});
    group.axes = axis.defs(axis.names(mdef.properties.update), encoding, layout);
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

function faceting(group, encoding, layout, spec, mdef, stack, stats) {
  var enter = group.properties.enter;
  var facetKeys = [], cellAxes = [], from, axesGrp;

  var hasRow = encoding.has(ROW), hasCol = encoding.has(COL);

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
    enter.height = {'value': layout.cellHeight}; // HACK

    facetKeys.push(encoding.field(ROW));

    if (hasCol) {
      from = util.duplicate(group.from);
      from.transform = from.transform || [];
      from.transform.unshift({type: 'facet', keys: [encoding.field(COL)]});
    }

    axesGrp = groupdef('x-axes', {
        axes: encoding.has(X) ? axis.defs(['x'], encoding, layout) : undefined,
        x: hasCol ? {scale: COL, field: 'keys.0'} : {value: 0},
        width: hasCol && {'value': layout.cellWidth}, //HACK?
        from: from
      });

    spec.marks.push(axesGrp);
    (spec.axes = spec.axes || []);
    spec.axes.push.apply(spec.axes, axis.defs(['row'], encoding, layout));
  } else { // doesn't have row
    if (encoding.has(X)) {
      //keep x axis in the cell
      cellAxes.push.apply(cellAxes, axis.defs(['x'], encoding, layout));
    }
  }

  if (hasCol) {
    if (!encoding.isOrdinalScale(COL)) {
      util.error('Col encoding should be ordinal.');
    }
    enter.x = {scale: COL, field: 'keys.' + facetKeys.length};
    enter.width = {'value': layout.cellWidth}; // HACK

    facetKeys.push(encoding.field(COL));

    if (hasRow) {
      from = util.duplicate(group.from);
      from.transform = from.transform || [];
      from.transform.unshift({type: 'facet', keys: [encoding.field(ROW)]});
    }

    axesGrp = groupdef('y-axes', {
      axes: encoding.has(Y) ? axis.defs(['y'], encoding, layout) : undefined,
      y: hasRow && {scale: ROW, field: 'keys.0'},
      x: hasRow && {value: 0},
      height: hasRow && {'value': layout.cellHeight}, //HACK?
      from: from
    });

    spec.marks.push(axesGrp);
    (spec.axes = spec.axes || []);
    spec.axes.push.apply(spec.axes, axis.defs(['col'], encoding, layout));
  } else { // doesn't have col
    if (encoding.has(Y)) {
      cellAxes.push.apply(cellAxes, axis.defs(['y'], encoding, layout));
    }
  }

  // assuming equal cellWidth here
  // TODO: support heterogenous cellWidth (maybe by using multiple scales?)
  spec.scales = (spec.scales || []).concat(scale.defs(
    scale.names(enter).concat(scale.names(mdef.properties.update)),
    encoding,
    {cellWidth: layout.cellWidth, cellHeight: layout.cellHeight, stack: stack, facet: true, stats: stats}
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
  schema = require('../schema/schema'),
  time = require('./time');

module.exports = vllayout;
var CHARACTER_WIDTH = 6;

function vllayout(encoding, stats) {
  var layout = box(encoding, stats);
  layout = offset(encoding, stats, layout);
  layout.characterWidth = CHARACTER_WIDTH;
  return layout;
}

function getCardinality(encoding, encType, stats) {
  var field = encoding.fieldName(encType);
  if (encoding.bin(encType)) {
    var bins = util.getbins(stats[field]);
    return (bins.stop - bins.start) / bins.step;
  }
  if (encoding.isType(encType, T)) {
    return time.cardinality(encoding, encType, stats);
  }
  return stats[field].cardinality;
}

/*
  HACK to set chart size
  NOTE: this fails for plots driven by derived values (e.g., aggregates)
  One solution is to update Vega to support auto-sizing
  In the meantime, auto-padding (mostly) does the trick
 */
function box(encoding, stats) {
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

function offset(encoding, stats, layout) {
  [X, Y].forEach(function (x) {
    if (encoding.isOrdinalScale(x)) {
      var maxLength = stats[encoding.fieldName(x)].maxlength;
      layout[x] = {
        axisTitleOffset: CHARACTER_WIDTH *  maxLength + 20
      };
    }
  });
  return layout;
}

},{"../globals":20,"../schema/schema":21,"../util":23,"./time":16}],10:[function(require,module,exports){
var global = require('../globals'),
  time = require('./time');

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

  if (encoding.isType(name, T) && (fn = encoding.fn(name)) &&
    time.hasScale(fn)) {
    var properties = def.properties = def.properties || {},
      labels = properties.labels = properties.labels || {},
      text = labels.text = labels.text || {};

    text.scale = 'time-'+ fn;
  }

  return def;
};

},{"../globals":20,"./time":16}],11:[function(require,module,exports){
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
  util = require('../util'),
  time = require('./time');

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

  switch (encoding.type(name)) {
    case O: return 'ordinal';
    case T:
      var fn = encoding.fn(name);
      return (fn && time.scale.type(fn)) || 'time';
    case Q:
      if (encoding.bin(name)) {
        return 'ordinal';
      }
      return encoding.scale(name).type;
  }
};

function scale_domain(name, encoding, opt) {
  if (encoding.isType(name, T)) {
    var range = time.scale.domain(encoding.fn(name));
    if(range) return range;
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
        s.zero = spec.zero ||
          ( encoding.isType(s.name,T) && encoding.fn(s.name) === 'year' ? false : true );
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
        s.zero = spec.zero ||
          ( encoding.isType(s.name, T) && encoding.fn(s.name) === 'year' ? false : true );
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

},{"../globals":20,"../util":23,"./time":16}],13:[function(require,module,exports){
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

function template(encoding, layout, stats) { //hack use stats

  var data = {name: TABLE, format: {type: encoding.config('dataFormatType')}},
    dataUrl = vldata.getUrl(encoding, stats);
  if (dataUrl) data.url = dataUrl;

  var preaggregatedData = encoding.config('useVegaServer');

  encoding.forEach(function(encType, field) {
    var name;
    if (field.type == T) {
      data.format.parse = data.format.parse || {};
      data.format.parse[field.name] = 'date';
    }else if (field.type == Q) {
      data.format.parse = data.format.parse || {};
      if (field.aggr === 'count') {
        name = 'count';
      } else if (preaggregatedData && field.bin) {
        name = 'bin_' + field.name;
      } else if (preaggregatedData && field.aggr) {
        name = field.aggr + '_' + field.name;
      } else {
        name = field.name;
      }
      data.format.parse[name] = 'number';
    }
  });

  return {
    width: layout.width,
    height: layout.height,
    padding: 'auto',
    data: [data],
    marks: [groupdef('cell', {
      width: layout.cellWidth ? {value: layout.cellWidth} : undefined,
      height: layout.cellHeight ? {value: layout.cellHeight} : undefined
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

time.cardinality = function(encoding, encType, stats) {
  var fn = encoding.fn(encType);
  switch (fn) {
    case 'second': return 60;
    case 'minute': return 60;
    case 'hour': return 24;
    case 'dayofweek': return 7;
    case 'date': return 31;
    case 'month': return 12;
    // case 'year':  -- need real cardinality
  }

  var field = encoding.field(encType, /*nodata*/ true); // fn_fieldname
  return stats[field].cardinality;
};

/**
 * @return {String} date binning formula of the given field
 */
time.formula = function(field) {
  var date = 'new Date(d.data.'+ field.name + ')';
  switch (field.fn) {
    case 'second': return date + '.getUTCSeconds()';
    case 'minute': return date + '.getUTCMinutes()';
    case 'hour': return date + '.getUTCHours()';
    case 'dayofweek': return date + '.getUTCDay()';
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

/** append custom time scales for axis label */
time.scale = function(scales, fn, encoding) {
  var labelLength = encoding.config('timeScaleLabelLength');
  // TODO add option for shorter scale / custom range
  switch (fn) {
    case 'dayofweek':
      scales.push({
        name: 'time-'+fn,
        type: 'ordinal',
        domain: util.range(0, 7),
        range: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
          function(s) { return s.substr(0, labelLength);}
        )
      });
      break;
    case 'month':
      scales.push({
        name: 'time-'+fn,
        type: 'ordinal',
        domain: util.range(0, 12),
        range: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(
            function(s) { return s.substr(0, labelLength);}
          )
      });
      break;
  }
};

time.isOrdinalFn = function(fn) {
  switch (fn) {
    case 'second':
    case 'minute':
    case 'hour':
    case 'dayofweek':
    case 'date':
    case 'month':
      return true;
  }
  return false;
};

time.scale.type = function(fn) {
  return time.isOrdinalFn(fn) ? 'ordinal' : 'linear';
};

time.scale.domain = function(fn) {
  switch (fn) {
    case 'second':
    case 'minute': return util.range(0, 60);
    case 'hour': return util.range(0, 24);
    case 'dayofweek': return util.range(0, 7);
    case 'date': return util.range(0, 32);
    case 'month': return util.range(0, 12);
  }
  return null;
};

/** whether a particular time function has custom scale for labels implemented in time.scale */
time.hasScale = function(fn) {
  switch (fn) {
    case 'dayofweek':
    case 'month':
      return true;
  }
  return false;
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
  textCellWidth: 90,

  // marks
  strokeWidth: 2,

  // scales
  timeScaleLabelLength: 3
};

},{"./globals":20}],18:[function(require,module,exports){
// TODO rename getDataUrl to vl.data.getUrl() ?

var util = require('./util');

var vldata = module.exports = {};

vldata.getUrl = function getDataUrl(encoding, stats) {
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
vldata.getSchema = function(data) {
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

vldata.getStats = function(data) { // hack
  var stats = {},
    fields = util.keys(data[0]);

  fields.forEach(function(k) {
    var stat = util.minmax(data, k);
    stat.cardinality = util.uniq(data, k);
    stat.maxlength = data.reduce(function(max,row) {
      var len = row[k].toString().length;
      return len > max ? len : max;
    }, 0);
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

schema.timefns = ['month', 'year', 'dayofweek', 'date', 'hour', 'minute', 'second'];

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
        titleOffset: {
          type: 'integer',
          description: 'A title offset value for the axis.'
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
    k = field ? data[i][field] : data[i];
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
    var v = field ? data[i][field] : data[i];
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

/**
 * x[p[0]]...[p[n]] = val
 * @param noaugment determine whether new object should be added f
 * or non-existing properties along the path
 */
util.setter = function(x, p, val, noaugment) {
  for (var i=0; i<p.length-1; ++i) {
    if (!noaugment && !(p[i] in x)){
      x = x[p[i]] = {};
    } else {
      x = x[p[i]];
    }
  }
  x[p[i]] = val;
};


/**
 * returns x[p[0]]...[p[n]]
 * @param augment determine whether new object should be added f
 * or non-existing properties along the path
 */
util.getter = function(x, p, noaugment) {
  for (var i=0; i<p.length; ++i) {
    if (!noaugment && !(p[i] in x)){
      x = x[p[i]] = {};
    } else {
      x = x[p[i]];
    }
  }
  return x;
};

// copied from vega
util.truncate = function(s, length, pos, word, ellipsis) {
  var len = s.length;
  if (len <= length) return s;
  ellipsis = ellipsis || "...";
  var l = Math.max(0, length - ellipsis.length);

  switch (pos) {
    case "left":
      return ellipsis + (word ? vg_truncateOnWord(s,l,1) : s.slice(len-l));
    case "middle":
    case "center":
      var l1 = Math.ceil(l/2), l2 = Math.floor(l/2);
      return (word ? vg_truncateOnWord(s,l1) : s.slice(0,l1)) + ellipsis +
        (word ? vg_truncateOnWord(s,l2,1) : s.slice(len-l2));
    default:
      return (word ? vg_truncateOnWord(s,l) : s.slice(0,l)) + ellipsis;
  }
};

util.error = function(msg) {
  console.error('[VL Error]', msg);
};


},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvdmwiLCJzcmMvRW5jb2RpbmcuanMiLCJzcmMvY29tcGlsZS9hZ2dyZWdhdGVzLmpzIiwic3JjL2NvbXBpbGUvYXhpcy5qcyIsInNyYy9jb21waWxlL2Jpbm5pbmcuanMiLCJzcmMvY29tcGlsZS9jb21waWxlLmpzIiwic3JjL2NvbXBpbGUvZmFjZXRpbmcuanMiLCJzcmMvY29tcGlsZS9ncm91cC5qcyIsInNyYy9jb21waWxlL2xheW91dC5qcyIsInNyYy9jb21waWxlL2xlZ2VuZC5qcyIsInNyYy9jb21waWxlL21hcmtzLmpzIiwic3JjL2NvbXBpbGUvc2NhbGUuanMiLCJzcmMvY29tcGlsZS9zdGFja2luZy5qcyIsInNyYy9jb21waWxlL3N1YmZhY2V0aW5nLmpzIiwic3JjL2NvbXBpbGUvdGVtcGxhdGUuanMiLCJzcmMvY29tcGlsZS90aW1lLmpzIiwic3JjL2NvbnN0cy5qcyIsInNyYy9kYXRhLmpzIiwic3JjL2ZpZWxkLmpzIiwic3JjL2dsb2JhbHMuanMiLCJzcmMvc2NoZW1hL3NjaGVtYS5qcyIsInNyYy9zY2hlbWEvc2NoZW1hdXRpbC5qcyIsInNyYy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi9nbG9iYWxzJyksXG4gICAgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpLFxuICAgIGNvbnN0cyA9IHJlcXVpcmUoJy4vY29uc3RzJyk7XG5cbnZhciB2bCA9IHV0aWwubWVyZ2UoY29uc3RzLCB1dGlsKTtcblxudmwuRW5jb2RpbmcgPSByZXF1aXJlKCcuL0VuY29kaW5nJyk7XG52bC5jb21waWxlID0gcmVxdWlyZSgnLi9jb21waWxlL2NvbXBpbGUnKTtcbnZsLmRhdGEgPSByZXF1aXJlKCcuL2RhdGEnKTtcbnZsLmZpZWxkID0gcmVxdWlyZSgnLi9maWVsZCcpO1xudmwuc2NoZW1hID0gcmVxdWlyZSgnLi9zY2hlbWEvc2NoZW1hJyk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSB2bDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vZ2xvYmFscycpLFxuICBjb25zdHMgPSByZXF1aXJlKCcuL2NvbnN0cycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyksXG4gIGZpZWxkID0gcmVxdWlyZSgnLi9maWVsZCcpLFxuICBzY2hlbWEgPSByZXF1aXJlKCcuL3NjaGVtYS9zY2hlbWEnKSxcbiAgdGltZSA9IHJlcXVpcmUoJy4vY29tcGlsZS90aW1lJyk7XG5cbnZhciBFbmNvZGluZyA9IG1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuXG4gIGZ1bmN0aW9uIEVuY29kaW5nKG1hcmt0eXBlLCBlbmMsIGNvbmZpZykge1xuICAgIHZhciBkZWZhdWx0cyA9IHNjaGVtYS5pbnN0YW50aWF0ZSgpO1xuXG4gICAgdmFyIHNwZWMgPSB7XG4gICAgICBtYXJrdHlwZTogbWFya3R5cGUsXG4gICAgICBlbmM6IGVuYyxcbiAgICAgIGNmZzogY29uZmlnXG4gICAgfTtcblxuICAgIC8vIEhhY2sgdG8gYWRkIGRlZmF1bHQgY29uc3RhbnRzIHRoYXQgYXJlIG5vdCBpbiB0aGUgc2NoZW1hXG4gICAgZm9yICh2YXIgayBpbiBjb25zdHMuREVGQVVMVFMpIHtcbiAgICAgIGRlZmF1bHRzLmNmZ1trXSA9IGNvbnN0cy5ERUZBVUxUU1trXTtcbiAgICB9XG5cbiAgICAvLyB0eXBlIHRvIGJpdGNvZGVcbiAgICBmb3IgKHZhciBlIGluIGRlZmF1bHRzLmVuYykge1xuICAgICAgZGVmYXVsdHMuZW5jW2VdLnR5cGUgPSBjb25zdHMuZGF0YVR5cGVzW2RlZmF1bHRzLmVuY1tlXS50eXBlXTtcbiAgICB9XG5cbiAgICB2YXIgc3BlY0V4dGVuZGVkID0gc2NoZW1hLnV0aWwubWVyZ2UoZGVmYXVsdHMsIHNwZWMpO1xuXG4gICAgdGhpcy5fbWFya3R5cGUgPSBzcGVjRXh0ZW5kZWQubWFya3R5cGU7XG4gICAgdGhpcy5fZW5jID0gc3BlY0V4dGVuZGVkLmVuYztcbiAgICB0aGlzLl9jZmcgPSBzcGVjRXh0ZW5kZWQuY2ZnO1xuICB9XG5cbiAgdmFyIHByb3RvID0gRW5jb2RpbmcucHJvdG90eXBlO1xuXG4gIHByb3RvLm1hcmt0eXBlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcmt0eXBlO1xuICB9O1xuXG4gIHByb3RvLmlzID0gZnVuY3Rpb24obSkge1xuICAgIHJldHVybiB0aGlzLl9tYXJrdHlwZSA9PT0gbTtcbiAgfTtcblxuICBwcm90by5oYXMgPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuY1t4XS5uYW1lICE9PSB1bmRlZmluZWQ7XG4gIH07XG5cbiAgcHJvdG8uZW5jID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB0aGlzLl9lbmNbeF07XG4gIH07XG5cbiAgLy8gZ2V0IFwiZmllbGRcIiBwcm9wZXJ0eSBmb3IgdmVnYVxuICBwcm90by5maWVsZCA9IGZ1bmN0aW9uKHgsIG5vZGF0YSwgbm9mbikge1xuICAgIGlmICghdGhpcy5oYXMoeCkpIHJldHVybiBudWxsO1xuXG4gICAgdmFyIGYgPSAobm9kYXRhID8gJycgOiAnZGF0YS4nKTtcblxuICAgIGlmICh0aGlzLl9lbmNbeF0uYWdnciA9PT0gJ2NvdW50Jykge1xuICAgICAgcmV0dXJuIGYgKyAnY291bnQnO1xuICAgIH0gZWxzZSBpZiAoIW5vZm4gJiYgdGhpcy5fZW5jW3hdLmJpbikge1xuICAgICAgcmV0dXJuIGYgKyAnYmluXycgKyB0aGlzLl9lbmNbeF0ubmFtZTtcbiAgICB9IGVsc2UgaWYgKCFub2ZuICYmIHRoaXMuX2VuY1t4XS5hZ2dyKSB7XG4gICAgICByZXR1cm4gZiArIHRoaXMuX2VuY1t4XS5hZ2dyICsgJ18nICsgdGhpcy5fZW5jW3hdLm5hbWU7XG4gICAgfSBlbHNlIGlmICghbm9mbiAmJiB0aGlzLl9lbmNbeF0uZm4pIHtcbiAgICAgIHJldHVybiBmICsgdGhpcy5fZW5jW3hdLmZuICsgJ18nICsgdGhpcy5fZW5jW3hdLm5hbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmICsgdGhpcy5fZW5jW3hdLm5hbWU7XG4gICAgfVxuICB9O1xuXG4gIHByb3RvLmZpZWxkTmFtZSA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW5jW3hdLm5hbWU7XG4gIH07XG5cbiAgcHJvdG8uZmllbGRUaXRsZSA9IGZ1bmN0aW9uKHgpIHtcbiAgICBpZiAodGhpcy5fZW5jW3hdLmFnZ3IpIHtcbiAgICAgIHJldHVybiB0aGlzLl9lbmNbeF0uYWdnciArICcoJyArIHRoaXMuX2VuY1t4XS5uYW1lICsgJyknO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fZW5jW3hdLm5hbWU7XG4gICAgfVxuICB9O1xuXG4gIHByb3RvLnNjYWxlID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB0aGlzLl9lbmNbeF0uc2NhbGUgfHwge307XG4gIH07XG5cbiAgcHJvdG8uYXhpcyA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW5jW3hdLmF4aXMgfHwge307XG4gIH07XG5cbiAgcHJvdG8uYmFuZCA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW5jW3hdLmJhbmQgfHwge307XG4gIH07XG5cbiAgcHJvdG8uYmFuZFNpemUgPSBmdW5jdGlvbihlbmNUeXBlKSB7XG4gICAgdmFyIGlzQmFuZEluU21hbGxNdWx0aXBsZXMgPVxuICAgICAgKGVuY1R5cGUgPT09IFkgJiYgdGhpcy5oYXMoUk9XKSAmJiB0aGlzLmhhcyhZKSkgfHxcbiAgICAgIChlbmNUeXBlID09PSBYICYmIHRoaXMuaGFzKENPTCkgJiYgdGhpcy5oYXMoWCkpO1xuXG4gICAgLy8gaWYgYmFuZC5zaXplIGlzIGV4cGxpY2l0bHkgc3BlY2lmaWVkLCBmb2xsb3cgdGhlIHNwZWNpZmljYXRpb24sIG90aGVyd2lzZSBkcmF3IHZhbHVlIGZyb20gY29uZmlnLlxuICAgIHJldHVybiB0aGlzLmJhbmQoZW5jVHlwZSkuc2l6ZSB8fFxuICAgICAgdGhpcy5jb25maWcoaXNCYW5kSW5TbWFsbE11bHRpcGxlcyA/ICdtdWx0aXBsZUJhbmRTaXplJyA6ICdzaW5nbGVCYW5kU2l6ZScpO1xuICB9O1xuXG4gIHByb3RvLmFnZ3IgPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuY1t4XS5hZ2dyO1xuICB9O1xuXG4gIHByb3RvLmJpbiA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW5jW3hdLmJpbjtcbiAgfTtcblxuICBwcm90by5sZWdlbmQgPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuY1t4XS5sZWdlbmQ7XG4gIH07XG5cbiAgcHJvdG8udmFsdWUgPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuY1t4XS52YWx1ZTtcbiAgfTtcblxuICBwcm90by5mbiA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW5jW3hdLmZuO1xuICB9O1xuXG4gIHByb3RvLmFueSA9IGZ1bmN0aW9uKGYpIHtcbiAgICByZXR1cm4gdXRpbC5hbnkodGhpcy5fZW5jLCBmKTtcbiAgfTtcblxuICBwcm90by5hbGwgPSBmdW5jdGlvbihmKSB7XG4gICAgcmV0dXJuIHV0aWwuYWxsKHRoaXMuX2VuYywgZik7XG4gIH07XG5cbiAgcHJvdG8ubGVuZ3RoID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHV0aWwua2V5cyh0aGlzLl9lbmMpLmxlbmd0aDtcbiAgfTtcblxuICBwcm90by5tYXAgPSBmdW5jdGlvbihmKSB7XG4gICAgdmFyIGFyciA9IFtdLCBrO1xuICAgIGZvciAoayBpbiB0aGlzLl9lbmMpIHtcbiAgICAgIGlmKHRoaXMuaGFzKGspKXtcbiAgICAgICAgYXJyLnB1c2goZih0aGlzLl9lbmNba10sIGssIHRoaXMuX2VuYykpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYXJyO1xuICB9O1xuXG4gIHByb3RvLnJlZHVjZSA9IGZ1bmN0aW9uKGYsIGluaXQpIHtcbiAgICB2YXIgciA9IGluaXQsIGkgPSAwLCBrO1xuICAgIGZvciAoayBpbiB0aGlzLl9lbmMpIHtcbiAgICAgIGlmICh0aGlzLmhhcyhrKSkge1xuICAgICAgICByID0gZihyLCB0aGlzLl9lbmNba10sIGssIHRoaXMuX2VuYyk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByO1xuICB9O1xuXG4gIHByb3RvLmZvckVhY2ggPSBmdW5jdGlvbihmKSB7XG4gICAgdmFyIGkgPSAwLCBrO1xuICAgIGZvciAoayBpbiB0aGlzLl9lbmMpIHtcbiAgICAgIGlmICh0aGlzLmhhcyhrKSkge1xuICAgICAgICBmKGssIHRoaXMuX2VuY1trXSwgaSsrKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgcHJvdG8udHlwZSA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gdGhpcy5oYXMoeCkgPyB0aGlzLl9lbmNbeF0udHlwZSA6IG51bGw7XG4gIH07XG5cbiAgcHJvdG8udGV4dCA9IGZ1bmN0aW9uKHByb3ApIHtcbiAgICB2YXIgdGV4dCA9IHRoaXMuX2VuY1tURVhUXS50ZXh0O1xuICAgIHJldHVybiBwcm9wID8gdGV4dFtwcm9wXSA6IHRleHQ7XG4gIH07XG5cbiAgcHJvdG8uZm9udCA9IGZ1bmN0aW9uKHByb3ApIHtcbiAgICB2YXIgZm9udCA9IHRoaXMuX2VuY1tURVhUXS50ZXh0O1xuICAgIHJldHVybiBwcm9wID8gZm9udFtwcm9wXSA6IGZvbnQ7XG4gIH07XG5cbiAgcHJvdG8uaXNUeXBlID0gZnVuY3Rpb24oeCwgdCkge1xuICAgIHZhciB4dCA9IHRoaXMudHlwZSh4KTtcbiAgICBpZiAoeHQgPT09IG51bGwpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gKHh0ICYgdCkgPiAwO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGlzT3JkaW5hbFNjYWxlKGVuY29kaW5nLCBlbmNUeXBlKXtcbiAgICB2YXIgZm47XG4gICAgcmV0dXJuIGVuY29kaW5nLmlzVHlwZShlbmNUeXBlLCBPKSB8fCBlbmNvZGluZy5iaW4oZW5jVHlwZSkgfHxcbiAgICAgICggZW5jb2RpbmcuaXNUeXBlKGVuY1R5cGUsIFQpICYmXG4gICAgICAgIChmbiA9IGVuY29kaW5nLmZuKGVuY1R5cGUpKSAmJlxuICAgICAgICB0aW1lLmlzT3JkaW5hbEZuKGZuKSk7XG4gIH1cblxuICBwcm90by5pc09yZGluYWxTY2FsZSA9IGZ1bmN0aW9uKGVuY1R5cGUpIHtcbiAgICByZXR1cm4gdGhpcy5oYXMoZW5jVHlwZSkgJiYgaXNPcmRpbmFsU2NhbGUodGhpcywgZW5jVHlwZSk7XG4gIH07XG5cbiAgcHJvdG8uaXNRdWFudFNjYWxlID0gZnVuY3Rpb24oZW5jVHlwZSkge1xuICAgIHJldHVybiB0aGlzLmhhcyhlbmNUeXBlKSAmJiAhaXNPcmRpbmFsU2NhbGUodGhpcywgZW5jVHlwZSk7XG4gIH07XG5cbiAgcHJvdG8uaXNBZ2dyZWdhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaSA9IDAsIGs7XG4gICAgZm9yIChrIGluIHRoaXMuX2VuYykge1xuICAgICAgaWYgKHRoaXMuaGFzKGspICYmIHRoaXMuYWdncihrKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIHByb3RvLmlzUmF3ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICF0aGlzLmlzQWdncmVnYXRlKCk7XG4gIH07XG5cbiAgcHJvdG8uaXNEaW1lbnNpb24gPSBmdW5jdGlvbihlbmNUeXBlKSB7XG4gICAgcmV0dXJuIHRoaXMuaGFzKGVuY1R5cGUpICYmIHRoaXMuaXNBZ2dyZWdhdGUoKSAmJlxuICAgICAgaXNPcmRpbmFsU2NhbGUodGhpcywgZW5jVHlwZSk7XG4gIH07XG5cbiAgcHJvdG8uaXNNZWFzdXJlID0gZnVuY3Rpb24oZW5jVHlwZSkge1xuICAgIHJldHVybiB0aGlzLmhhcyhlbmNUeXBlKSAmJiB0aGlzLmlzQWdncmVnYXRlKCkgJiZcbiAgICAgICFpc09yZGluYWxTY2FsZSh0aGlzLCBlbmNUeXBlKTtcbiAgfTtcblxuICBwcm90by5jb25maWcgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NmZ1tuYW1lXTtcbiAgfTtcblxuICBwcm90by50b1NwZWMgPSBmdW5jdGlvbihleGNsdWRlQ29uZmlnKSB7XG4gICAgdmFyIGVuYyA9IHV0aWwuZHVwbGljYXRlKHRoaXMuX2VuYyksXG4gICAgICBzcGVjO1xuXG4gICAgLy8gY29udmVydCB0eXBlJ3MgYml0Y29kZSB0byB0eXBlIG5hbWVcbiAgICBmb3IgKHZhciBlIGluIGVuYykge1xuICAgICAgZW5jW2VdLnR5cGUgPSBjb25zdHMuZGF0YVR5cGVOYW1lc1tlbmNbZV0udHlwZV07XG4gICAgfVxuXG4gICAgc3BlYyA9IHtcbiAgICAgIG1hcmt0eXBlOiB0aGlzLl9tYXJrdHlwZSxcbiAgICAgIGVuYzogZW5jXG4gICAgfTtcblxuICAgIGlmICghZXhjbHVkZUNvbmZpZykge1xuICAgICAgc3BlYy5jZmcgPSB1dGlsLmR1cGxpY2F0ZSh0aGlzLl9jZmcpO1xuICAgIH1cblxuICAgIC8vIHJlbW92ZSBkZWZhdWx0c1xuICAgIHZhciBkZWZhdWx0cyA9IHNjaGVtYS5pbnN0YW50aWF0ZSgpO1xuICAgIHJldHVybiBzY2hlbWEudXRpbC5zdWJ0cmFjdChzcGVjLCBkZWZhdWx0cyk7XG4gIH07XG5cbiAgcHJvdG8udG9TaG9ydGhhbmQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZW5jID0gdGhpcy5fZW5jO1xuICAgIHJldHVybiB0aGlzLl9tYXJrdHlwZSArICcuJyArXG4gICAgICB0aGlzLm1hcChmdW5jdGlvbih2LCBlKSB7XG4gICAgICAgIHJldHVybiBlICsgJy0nICsgZmllbGQuc2hvcnRoYW5kKHYpO1xuICAgICAgfSkuam9pbignLicpO1xuICB9O1xuXG4gIEVuY29kaW5nLnBhcnNlU2hvcnRoYW5kID0gZnVuY3Rpb24oc2hvcnRoYW5kLCBjZmcpIHtcbiAgICB2YXIgZW5jID0gc2hvcnRoYW5kLnNwbGl0KCcuJyksXG4gICAgICBtYXJrdHlwZSA9IGVuYy5zaGlmdCgpO1xuXG4gICAgZW5jID0gZW5jLnJlZHVjZShmdW5jdGlvbihtLCBlKSB7XG4gICAgICB2YXIgc3BsaXQgPSBlLnNwbGl0KCctJyksXG4gICAgICAgIGVuY3R5cGUgPSBzcGxpdFswXSxcbiAgICAgICAgbyA9IHtuYW1lOiBzcGxpdFsxXSwgdHlwZTogY29uc3RzLmRhdGFUeXBlc1tzcGxpdFsyXV19O1xuXG4gICAgICAvLyBjaGVjayBhZ2dyZWdhdGUgdHlwZVxuICAgICAgZm9yICh2YXIgaSBpbiBzY2hlbWEuYWdnci5lbnVtKSB7XG4gICAgICAgIHZhciBhID0gc2NoZW1hLmFnZ3IuZW51bVtpXTtcbiAgICAgICAgaWYgKG8ubmFtZS5pbmRleE9mKGEgKyAnXycpID09PSAwKSB7XG4gICAgICAgICAgby5uYW1lID0gby5uYW1lLnN1YnN0cihhLmxlbmd0aCArIDEpO1xuICAgICAgICAgIGlmIChhID09ICdjb3VudCcgJiYgby5uYW1lLmxlbmd0aCA9PT0gMCkgby5uYW1lID0gJyonO1xuICAgICAgICAgIG8uYWdnciA9IGE7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIGNoZWNrIHRpbWUgZm5cbiAgICAgIGZvciAodmFyIGkgaW4gc2NoZW1hLnRpbWVmbnMpIHtcbiAgICAgICAgdmFyIGYgPSBzY2hlbWEudGltZWZuc1tpXTtcbiAgICAgICAgaWYgKG8ubmFtZSAmJiBvLm5hbWUuaW5kZXhPZihmICsgJ18nKSA9PT0gMCkge1xuICAgICAgICAgIG8ubmFtZSA9IG8ubmFtZS5zdWJzdHIoby5sZW5ndGggKyAxKTtcbiAgICAgICAgICBvLmZuID0gZjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBjaGVjayBiaW5cbiAgICAgIGlmIChvLm5hbWUgJiYgby5uYW1lLmluZGV4T2YoJ2Jpbl8nKSA9PT0gMCkge1xuICAgICAgICBvLm5hbWUgPSBvLm5hbWUuc3Vic3RyKDQpO1xuICAgICAgICBvLmJpbiA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIG1bZW5jdHlwZV0gPSBvO1xuICAgICAgcmV0dXJuIG07XG4gICAgfSwge30pO1xuXG4gICAgcmV0dXJuIG5ldyBFbmNvZGluZyhtYXJrdHlwZSwgZW5jLCBjZmcpO1xuICB9O1xuXG4gIEVuY29kaW5nLmZyb21TcGVjID0gZnVuY3Rpb24oc3BlYywgZXh0cmFDZmcpIHtcbiAgICB2YXIgZW5jID0gdXRpbC5kdXBsaWNhdGUoc3BlYy5lbmMpO1xuXG4gICAgLy9jb252ZXJ0IHR5cGUgZnJvbSBzdHJpbmcgdG8gYml0Y29kZSAoZS5nLCBPPTEpXG4gICAgZm9yICh2YXIgZSBpbiBlbmMpIHtcbiAgICAgIGVuY1tlXS50eXBlID0gY29uc3RzLmRhdGFUeXBlc1tlbmNbZV0udHlwZV07XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBFbmNvZGluZyhzcGVjLm1hcmt0eXBlLCBlbmMsIHV0aWwubWVyZ2Uoc3BlYy5jZmcsIGV4dHJhQ2ZnIHx8IHt9KSk7XG4gIH07XG5cbiAgcmV0dXJuIEVuY29kaW5nO1xuXG59KSgpO1xuIiwidmFyIGdsb2JhbHMgPSByZXF1aXJlKCcuLi9nbG9iYWxzJyksXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gYWdncmVnYXRlcztcblxuZnVuY3Rpb24gYWdncmVnYXRlcyhzcGVjLCBlbmNvZGluZywgb3B0KSB7XG4gIG9wdCA9IG9wdCB8fCB7fTtcbiAgdmFyIGRpbXMgPSB7fSwgbWVhcyA9IHt9LCBkZXRhaWwgPSB7fSwgZmFjZXRzID0ge307XG4gIGVuY29kaW5nLmZvckVhY2goZnVuY3Rpb24oZW5jVHlwZSwgZmllbGQpIHtcbiAgICBpZiAoZmllbGQuYWdncikge1xuICAgICAgaWYgKGZpZWxkLmFnZ3IgPT09ICdjb3VudCcpIHtcbiAgICAgICAgbWVhc1snY291bnQnXSA9IHtvcDogJ2NvdW50JywgZmllbGQ6ICcqJ307XG4gICAgICB9ZWxzZSB7XG4gICAgICAgIG1lYXNbZmllbGQuYWdnciArICd8JysgZmllbGQubmFtZV0gPSB7XG4gICAgICAgICAgb3A6IGZpZWxkLmFnZ3IsXG4gICAgICAgICAgZmllbGQ6ICdkYXRhLicrIGZpZWxkLm5hbWVcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZGltc1tmaWVsZC5uYW1lXSA9IGVuY29kaW5nLmZpZWxkKGVuY1R5cGUpO1xuICAgICAgaWYgKGVuY1R5cGUgPT0gUk9XIHx8IGVuY1R5cGUgPT0gQ09MKSB7XG4gICAgICAgIGZhY2V0c1tmaWVsZC5uYW1lXSA9IGRpbXNbZmllbGQubmFtZV07XG4gICAgICB9ZWxzZSBpZiAoZW5jVHlwZSAhPT0gWCAmJiBlbmNUeXBlICE9PSBZKSB7XG4gICAgICAgIGRldGFpbFtmaWVsZC5uYW1lXSA9IGRpbXNbZmllbGQubmFtZV07XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgZGltcyA9IHV0aWwudmFscyhkaW1zKTtcbiAgbWVhcyA9IHV0aWwudmFscyhtZWFzKTtcblxuICBpZiAobWVhcy5sZW5ndGggPiAwICYmICFvcHQucHJlYWdncmVnYXRlZERhdGEpIHtcbiAgICBpZiAoIXNwZWMudHJhbnNmb3JtKSBzcGVjLnRyYW5zZm9ybSA9IFtdO1xuICAgIHNwZWMudHJhbnNmb3JtLnB1c2goe1xuICAgICAgdHlwZTogJ2FnZ3JlZ2F0ZScsXG4gICAgICBncm91cGJ5OiBkaW1zLFxuICAgICAgZmllbGRzOiBtZWFzXG4gICAgfSk7XG5cbiAgICBpZiAoZW5jb2RpbmcubWFya3R5cGUoKSA9PT0gVEVYVCkge1xuICAgICAgbWVhcy5mb3JFYWNoKGZ1bmN0aW9uKG0pIHtcbiAgICAgICAgdmFyIGZpZWxkTmFtZSA9IG0uZmllbGQuc3Vic3RyKDUpLCAvL3JlbW92ZSBcImRhdGEuXCJcbiAgICAgICAgICBmaWVsZCA9ICdkYXRhLicgKyAobS5vcCA/IG0ub3AgKyAnXycgOiAnJykgKyBmaWVsZE5hbWU7XG4gICAgICAgIHNwZWMudHJhbnNmb3JtLnB1c2goe1xuICAgICAgICAgIHR5cGU6ICdmb3JtdWxhJyxcbiAgICAgICAgICBmaWVsZDogZmllbGQsXG4gICAgICAgICAgZXhwcjogXCJkMy5mb3JtYXQoJy4yZicpKGQuXCIgKyBmaWVsZCArICcpJ1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4ge1xuICAgIGRldGFpbHM6IHV0aWwudmFscyhkZXRhaWwpLFxuICAgIGRpbXM6IGRpbXMsXG4gICAgZmFjZXRzOiB1dGlsLnZhbHMoZmFjZXRzKSxcbiAgICBhZ2dyZWdhdGVkOiBtZWFzLmxlbmd0aCA+IDBcbiAgfTtcbn1cbiIsInZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpLFxuICBzZXR0ZXIgPSB1dGlsLnNldHRlcixcbiAgdGltZSA9IHJlcXVpcmUoJy4vdGltZScpO1xuXG52YXIgYXhpcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbmF4aXMubmFtZXMgPSBmdW5jdGlvbihwcm9wcykge1xuICByZXR1cm4gdXRpbC5rZXlzKHV0aWwua2V5cyhwcm9wcykucmVkdWNlKGZ1bmN0aW9uKGEsIHgpIHtcbiAgICB2YXIgcyA9IHByb3BzW3hdLnNjYWxlO1xuICAgIGlmIChzID09PSBYIHx8IHMgPT09IFkpIGFbcHJvcHNbeF0uc2NhbGVdID0gMTtcbiAgICByZXR1cm4gYTtcbiAgfSwge30pKTtcbn07XG5cbmF4aXMuZGVmcyA9IGZ1bmN0aW9uKG5hbWVzLCBlbmNvZGluZywgbGF5b3V0LCBvcHQpIHtcbiAgcmV0dXJuIG5hbWVzLnJlZHVjZShmdW5jdGlvbihhLCBuYW1lKSB7XG4gICAgYS5wdXNoKGF4aXMuZGVmKG5hbWUsIGVuY29kaW5nLCBsYXlvdXQsIG9wdCkpO1xuICAgIHJldHVybiBhO1xuICB9LCBbXSk7XG59O1xuXG5heGlzLmRlZiA9IGZ1bmN0aW9uKG5hbWUsIGVuY29kaW5nLCBsYXlvdXQsIG9wdCkge1xuICB2YXIgdHlwZSA9IG5hbWU7XG4gIHZhciBpc0NvbCA9IG5hbWUgPT0gQ09MLCBpc1JvdyA9IG5hbWUgPT0gUk9XO1xuICBpZiAoaXNDb2wpIHR5cGUgPSAneCc7XG4gIGlmIChpc1JvdykgdHlwZSA9ICd5JztcblxuICB2YXIgZGVmID0ge1xuICAgIHR5cGU6IHR5cGUsXG4gICAgc2NhbGU6IG5hbWVcbiAgfTtcblxuICBpZiAoZW5jb2RpbmcuYXhpcyhuYW1lKS5ncmlkKSB7XG4gICAgZGVmLmdyaWQgPSB0cnVlO1xuICAgIGRlZi5sYXllciA9ICdiYWNrJztcbiAgfVxuXG4gIGlmIChlbmNvZGluZy5heGlzKG5hbWUpLnRpdGxlKSB7XG4gICAgZGVmID0gYXhpc190aXRsZShkZWYsIG5hbWUsIGVuY29kaW5nLCBsYXlvdXQsIG9wdCk7XG4gIH1cblxuICBpZiAoaXNSb3cgfHwgaXNDb2wpIHtcbiAgICBkZWYucHJvcGVydGllcyA9IHtcbiAgICAgIHRpY2tzOiB7IG9wYWNpdHk6IHt2YWx1ZTogMH0gfSxcbiAgICAgIG1ham9yVGlja3M6IHsgb3BhY2l0eToge3ZhbHVlOiAwfSB9LFxuICAgICAgYXhpczogeyBvcGFjaXR5OiB7dmFsdWU6IDB9IH1cbiAgICB9O1xuICB9XG5cbiAgaWYgKGlzQ29sKSB7XG4gICAgZGVmLm9yaWVudCA9ICd0b3AnO1xuICB9XG5cbiAgaWYgKGlzUm93KSB7XG4gICAgZGVmLm9mZnNldCA9IGF4aXNUaXRsZU9mZnNldChlbmNvZGluZywgbGF5b3V0LCBZKSArIDIwO1xuICB9XG5cbiAgaWYgKG5hbWUgPT0gWCAmJiBlbmNvZGluZy5pc09yZGluYWxTY2FsZShYKSkge1xuICAgIHNldHRlcihkZWYsIFsncHJvcGVydGllcycsJ2xhYmVscyddLCB7XG4gICAgICBhbmdsZToge3ZhbHVlOiAyNzB9LFxuICAgICAgYWxpZ246IHt2YWx1ZTogJ3JpZ2h0J30sXG4gICAgICBiYXNlbGluZToge3ZhbHVlOiAnbWlkZGxlJ31cbiAgICB9KTtcbiAgfVxuXG4gIGlmIChlbmNvZGluZy5heGlzKG5hbWUpLmZvcm1hdCkge1xuICAgIGRlZi5mb3JtYXQgPSBlbmNvZGluZy5heGlzKG5hbWUpLmZvcm1hdDtcbiAgfSBlbHNlIGlmIChlbmNvZGluZy5pc1R5cGUobmFtZSwgUSkpIHtcbiAgICBkZWYuZm9ybWF0ID0gXCJzXCI7XG4gIH0gZWxzZSBpZiAoZW5jb2RpbmcuaXNUeXBlKG5hbWUsIFQpICYmICFlbmNvZGluZy5mbihuYW1lKSkge1xuICAgIGRlZi5mb3JtYXQgPSBcIiVZLSVtLSVkXCI7XG4gIH1cblxuICB2YXIgZm47XG4gIC8vIGFkZCBjdXN0b20gbGFiZWwgZm9yIHRpbWUgdHlwZVxuICBpZiAoZW5jb2RpbmcuaXNUeXBlKG5hbWUsIFQpICYmIChmbiA9IGVuY29kaW5nLmZuKG5hbWUpKSAmJiAodGltZS5oYXNTY2FsZShmbikpKSB7XG4gICAgc2V0dGVyKGRlZiwgWydwcm9wZXJ0aWVzJywnbGFiZWxzJywndGV4dCcsJ3NjYWxlJ10sICd0aW1lLScrIGZuKTtcbiAgfVxuXG4gIHJldHVybiBkZWY7XG59O1xuXG5mdW5jdGlvbiBheGlzX3RpdGxlKGF4aXMsIG5hbWUsIGVuY29kaW5nLCBsYXlvdXQsIG9wdCkge1xuICB2YXIgbWF4TGVuZ3RoID0gbnVsbCxcbiAgICBmaWVsZFRpdGxlID0gZW5jb2RpbmcuZmllbGRUaXRsZShuYW1lKTtcbiAgaWYgKG5hbWU9PT1YKSB7XG4gICAgbWF4bGVuZ3RoID0gbGF5b3V0LmNlbGxXaWR0aCAvIGxheW91dC5jaGFyYWN0ZXJXaWR0aDtcbiAgfSBlbHNlIGlmIChuYW1lID09PSBZKSB7XG4gICAgbWF4bGVuZ3RoID0gbGF5b3V0LmNlbGxIZWlnaHQgLyBsYXlvdXQuY2hhcmFjdGVyV2lkdGg7XG4gIH1cblxuICBheGlzLnRpdGxlID0gbWF4bGVuZ3RoID8gdXRpbC50cnVuY2F0ZShmaWVsZFRpdGxlLCBtYXhsZW5ndGgpIDogZmllbGRUaXRsZTtcblxuICBpZiAoZW5jb2RpbmcuaXNPcmRpbmFsU2NhbGUobmFtZSkpIHtcbiAgICBheGlzLnRpdGxlT2Zmc2V0ID0gYXhpc1RpdGxlT2Zmc2V0KGVuY29kaW5nLCBsYXlvdXQsIG5hbWUpO1xuICB9XG4gIHJldHVybiBheGlzO1xufVxuXG5mdW5jdGlvbiBheGlzVGl0bGVPZmZzZXQoZW5jb2RpbmcsIGxheW91dCwgbmFtZSkge1xuICByZXR1cm4gZW5jb2RpbmcuYXhpcyhuYW1lKS50aXRsZU9mZnNldCB8fFxuICAgICAgbGF5b3V0W25hbWVdLmF4aXNUaXRsZU9mZnNldDtcbn1cbiIsInZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJpbm5pbmc7XG5cbmZ1bmN0aW9uIGJpbm5pbmcoc3BlYywgZW5jb2RpbmcsIG9wdCkge1xuICBvcHQgPSBvcHQgfHwge307XG4gIHZhciBiaW5zID0ge307XG4gIGVuY29kaW5nLmZvckVhY2goZnVuY3Rpb24odnYsIGQpIHtcbiAgICBpZiAoZC5iaW4pIGJpbnNbZC5uYW1lXSA9IGQubmFtZTtcbiAgfSk7XG4gIGJpbnMgPSB1dGlsLmtleXMoYmlucyk7XG5cbiAgaWYgKGJpbnMubGVuZ3RoID09PSAwIHx8IG9wdC5wcmVhZ2dyZWdhdGVkRGF0YSkgcmV0dXJuIGZhbHNlO1xuXG4gIGlmICghc3BlYy50cmFuc2Zvcm0pIHNwZWMudHJhbnNmb3JtID0gW107XG4gIGJpbnMuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgc3BlYy50cmFuc2Zvcm0ucHVzaCh7XG4gICAgICB0eXBlOiAnYmluJyxcbiAgICAgIGZpZWxkOiAnZGF0YS4nICsgZCxcbiAgICAgIG91dHB1dDogJ2RhdGEuYmluXycgKyBkLFxuICAgICAgbWF4YmluczogTUFYX0JJTlNcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBiaW5zO1xufVxuIiwidmFyIGdsb2JhbHMgPSByZXF1aXJlKCcuLi9nbG9iYWxzJyksXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29tcGlsZTtcblxudmFyIHRlbXBsYXRlID0gY29tcGlsZS50ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGUnKSxcbiAgYXhpcyA9IGNvbXBpbGUuYXhpcyA9IHJlcXVpcmUoJy4vYXhpcycpLFxuICBsZWdlbmQgPSBjb21waWxlLmxlZ2VuZCA9IHJlcXVpcmUoJy4vbGVnZW5kJyksXG4gIG1hcmtzID0gY29tcGlsZS5tYXJrcyA9IHJlcXVpcmUoJy4vbWFya3MnKSxcbiAgc2NhbGUgPSBjb21waWxlLnNjYWxlID0gcmVxdWlyZSgnLi9zY2FsZScpLFxuICB0aW1lID0gY29tcGlsZS50aW1lID0gcmVxdWlyZSgnLi90aW1lJyksXG4gIGFnZ3JlZ2F0ZXMgPSBjb21waWxlLmFnZ3JlZ2F0ZXMgPSByZXF1aXJlKCcuL2FnZ3JlZ2F0ZXMnKSxcbiAgYmlubmluZyA9IGNvbXBpbGUuYmlubmluZyA9IHJlcXVpcmUoJy4vYmlubmluZycpLFxuICBmYWNldGluZyA9IGNvbXBpbGUuZmFjZXRpbmcgPSByZXF1aXJlKCcuL2ZhY2V0aW5nJyksXG4gIHN0YWNraW5nID0gY29tcGlsZS5zdGFja2luZyA9IHJlcXVpcmUoJy4vc3RhY2tpbmcnKTtcbiAgc3ViZmFjZXRpbmcgPSBjb21waWxlLnN1YmZhY2V0aW5nID0gcmVxdWlyZSgnLi9zdWJmYWNldGluZycpO1xuXG5jb21waWxlLmxheW91dCA9IHJlcXVpcmUoJy4vbGF5b3V0Jyk7XG5jb21waWxlLmdyb3VwID0gcmVxdWlyZSgnLi9ncm91cCcpO1xuXG5mdW5jdGlvbiBjb21waWxlKGVuY29kaW5nLCBzdGF0cykge1xuICB2YXIgbGF5b3V0ID0gY29tcGlsZS5sYXlvdXQoZW5jb2RpbmcsIHN0YXRzKTtcblxuICB2YXIgc3BlYyA9IHRlbXBsYXRlKGVuY29kaW5nLCBsYXlvdXQsIHN0YXRzKSxcbiAgICBncm91cCA9IHNwZWMubWFya3NbMF0sXG4gICAgbWFyayA9IG1hcmtzW2VuY29kaW5nLm1hcmt0eXBlKCldLFxuICAgIG1kZWYgPSBtYXJrcy5kZWYobWFyaywgZW5jb2RpbmcpO1xuXG4gIHZhciBoYXNSb3cgPSBlbmNvZGluZy5oYXMoUk9XKSwgaGFzQ29sID0gZW5jb2RpbmcuaGFzKENPTCk7XG5cbiAgdmFyIHByZWFnZ3JlZ2F0ZWREYXRhID0gZW5jb2RpbmcuY29uZmlnKCd1c2VWZWdhU2VydmVyJyk7XG5cbiAgZ3JvdXAubWFya3MucHVzaChtZGVmKTtcbiAgLy8gVE9ETzogcmV0dXJuIHZhbHVlIG5vdCB1c2VkXG4gIGJpbm5pbmcoc3BlYy5kYXRhWzBdLCBlbmNvZGluZywge3ByZWFnZ3JlZ2F0ZWREYXRhOiBwcmVhZ2dyZWdhdGVkRGF0YX0pO1xuXG4gIHZhciBsaW5lVHlwZSA9IG1hcmtzW2VuY29kaW5nLm1hcmt0eXBlKCldLmxpbmU7XG5cbiAgaWYgKCFwcmVhZ2dyZWdhdGVkRGF0YSkge1xuICAgIHNwZWMgPSB0aW1lKHNwZWMsIGVuY29kaW5nKTtcbiAgfVxuXG4gIC8vIGhhbmRsZSBzdWJmYWNldHNcbiAgdmFyIGFnZ1Jlc3VsdCA9IGFnZ3JlZ2F0ZXMoc3BlYy5kYXRhWzBdLCBlbmNvZGluZywge3ByZWFnZ3JlZ2F0ZWREYXRhOiBwcmVhZ2dyZWdhdGVkRGF0YX0pLFxuICAgIGRldGFpbHMgPSBhZ2dSZXN1bHQuZGV0YWlscyxcbiAgICBoYXNEZXRhaWxzID0gZGV0YWlscyAmJiBkZXRhaWxzLmxlbmd0aCA+IDAsXG4gICAgc3RhY2sgPSBoYXNEZXRhaWxzICYmIHN0YWNraW5nKHNwZWMsIGVuY29kaW5nLCBtZGVmLCBhZ2dSZXN1bHQuZmFjZXRzKTtcblxuICBpZiAoaGFzRGV0YWlscyAmJiAoc3RhY2sgfHwgbGluZVR5cGUpKSB7XG4gICAgLy9zdWJmYWNldCB0byBncm91cCBzdGFjayAvIGxpbmUgdG9nZXRoZXIgaW4gb25lIGdyb3VwXG4gICAgc3ViZmFjZXRpbmcoZ3JvdXAsIG1kZWYsIGRldGFpbHMsIHN0YWNrLCBlbmNvZGluZyk7XG4gIH1cblxuICAvLyBhdXRvLXNvcnQgbGluZS9hcmVhIHZhbHVlc1xuICAvL1RPRE8oa2FuaXR3KTogaGF2ZSBzb21lIGNvbmZpZyB0byB0dXJuIG9mZiBhdXRvLXNvcnQgZm9yIGxpbmUgKGZvciBsaW5lIGNoYXJ0IHRoYXQgZW5jb2RlcyB0ZW1wb3JhbCBpbmZvcm1hdGlvbilcbiAgaWYgKGxpbmVUeXBlKSB7XG4gICAgdmFyIGYgPSAoZW5jb2RpbmcuaXNRdWFudFNjYWxlKFgpICYmIGVuY29kaW5nLmlzT3JkaW5hbFNjYWxlKFkpKSA/IFkgOiBYO1xuICAgIGlmICghbWRlZi5mcm9tKSBtZGVmLmZyb20gPSB7fTtcbiAgICBtZGVmLmZyb20udHJhbnNmb3JtID0gW3t0eXBlOiAnc29ydCcsIGJ5OiBlbmNvZGluZy5maWVsZChmKX1dO1xuICB9XG5cbiAgLy8gU21hbGwgTXVsdGlwbGVzXG4gIGlmIChoYXNSb3cgfHwgaGFzQ29sKSB7XG4gICAgc3BlYyA9IGZhY2V0aW5nKGdyb3VwLCBlbmNvZGluZywgbGF5b3V0LCBzcGVjLCBtZGVmLCBzdGFjaywgc3RhdHMpO1xuICAgIHNwZWMubGVnZW5kcyA9IGxlZ2VuZC5kZWZzKGVuY29kaW5nKTtcbiAgfSBlbHNlIHtcbiAgICBncm91cC5zY2FsZXMgPSBzY2FsZS5kZWZzKHNjYWxlLm5hbWVzKG1kZWYucHJvcGVydGllcy51cGRhdGUpLCBlbmNvZGluZyxcbiAgICAgIHtzdGFjazogc3RhY2ssIHN0YXRzOiBzdGF0c30pO1xuICAgIGdyb3VwLmF4ZXMgPSBheGlzLmRlZnMoYXhpcy5uYW1lcyhtZGVmLnByb3BlcnRpZXMudXBkYXRlKSwgZW5jb2RpbmcsIGxheW91dCk7XG4gICAgZ3JvdXAubGVnZW5kcyA9IGxlZ2VuZC5kZWZzKGVuY29kaW5nKTtcbiAgfVxuICByZXR1cm4gc3BlYztcbn1cblxuIiwidmFyIGdsb2JhbHMgPSByZXF1aXJlKCcuLi9nbG9iYWxzJyksXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cbnZhciBheGlzID0gcmVxdWlyZSgnLi9heGlzJyksXG4gIGdyb3VwZGVmID0gcmVxdWlyZSgnLi9ncm91cCcpLmRlZixcbiAgc2NhbGUgPSByZXF1aXJlKCcuL3NjYWxlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZmFjZXRpbmc7XG5cbmZ1bmN0aW9uIGZhY2V0aW5nKGdyb3VwLCBlbmNvZGluZywgbGF5b3V0LCBzcGVjLCBtZGVmLCBzdGFjaywgc3RhdHMpIHtcbiAgdmFyIGVudGVyID0gZ3JvdXAucHJvcGVydGllcy5lbnRlcjtcbiAgdmFyIGZhY2V0S2V5cyA9IFtdLCBjZWxsQXhlcyA9IFtdLCBmcm9tLCBheGVzR3JwO1xuXG4gIHZhciBoYXNSb3cgPSBlbmNvZGluZy5oYXMoUk9XKSwgaGFzQ29sID0gZW5jb2RpbmcuaGFzKENPTCk7XG5cbiAgZW50ZXIuZmlsbCA9IHt2YWx1ZTogZW5jb2RpbmcuY29uZmlnKCdjZWxsQmFja2dyb3VuZENvbG9yJyl9O1xuXG4gIC8vbW92ZSBcImZyb21cIiB0byBjZWxsIGxldmVsIGFuZCBhZGQgZmFjZXQgdHJhbnNmb3JtXG4gIGdyb3VwLmZyb20gPSB7ZGF0YTogZ3JvdXAubWFya3NbMF0uZnJvbS5kYXRhfTtcblxuICBpZiAoZ3JvdXAubWFya3NbMF0uZnJvbS50cmFuc2Zvcm0pIHtcbiAgICBkZWxldGUgZ3JvdXAubWFya3NbMF0uZnJvbS5kYXRhOyAvL25lZWQgdG8ga2VlcCB0cmFuc2Zvcm0gZm9yIHN1YmZhY2V0dGluZyBjYXNlXG4gIH0gZWxzZSB7XG4gICAgZGVsZXRlIGdyb3VwLm1hcmtzWzBdLmZyb207XG4gIH1cbiAgaWYgKGhhc1Jvdykge1xuICAgIGlmICghZW5jb2RpbmcuaXNPcmRpbmFsU2NhbGUoUk9XKSkge1xuICAgICAgdXRpbC5lcnJvcignUm93IGVuY29kaW5nIHNob3VsZCBiZSBvcmRpbmFsLicpO1xuICAgIH1cbiAgICBlbnRlci55ID0ge3NjYWxlOiBST1csIGZpZWxkOiAna2V5cy4nICsgZmFjZXRLZXlzLmxlbmd0aH07XG4gICAgZW50ZXIuaGVpZ2h0ID0geyd2YWx1ZSc6IGxheW91dC5jZWxsSGVpZ2h0fTsgLy8gSEFDS1xuXG4gICAgZmFjZXRLZXlzLnB1c2goZW5jb2RpbmcuZmllbGQoUk9XKSk7XG5cbiAgICBpZiAoaGFzQ29sKSB7XG4gICAgICBmcm9tID0gdXRpbC5kdXBsaWNhdGUoZ3JvdXAuZnJvbSk7XG4gICAgICBmcm9tLnRyYW5zZm9ybSA9IGZyb20udHJhbnNmb3JtIHx8IFtdO1xuICAgICAgZnJvbS50cmFuc2Zvcm0udW5zaGlmdCh7dHlwZTogJ2ZhY2V0Jywga2V5czogW2VuY29kaW5nLmZpZWxkKENPTCldfSk7XG4gICAgfVxuXG4gICAgYXhlc0dycCA9IGdyb3VwZGVmKCd4LWF4ZXMnLCB7XG4gICAgICAgIGF4ZXM6IGVuY29kaW5nLmhhcyhYKSA/IGF4aXMuZGVmcyhbJ3gnXSwgZW5jb2RpbmcsIGxheW91dCkgOiB1bmRlZmluZWQsXG4gICAgICAgIHg6IGhhc0NvbCA/IHtzY2FsZTogQ09MLCBmaWVsZDogJ2tleXMuMCd9IDoge3ZhbHVlOiAwfSxcbiAgICAgICAgd2lkdGg6IGhhc0NvbCAmJiB7J3ZhbHVlJzogbGF5b3V0LmNlbGxXaWR0aH0sIC8vSEFDSz9cbiAgICAgICAgZnJvbTogZnJvbVxuICAgICAgfSk7XG5cbiAgICBzcGVjLm1hcmtzLnB1c2goYXhlc0dycCk7XG4gICAgKHNwZWMuYXhlcyA9IHNwZWMuYXhlcyB8fCBbXSk7XG4gICAgc3BlYy5heGVzLnB1c2guYXBwbHkoc3BlYy5heGVzLCBheGlzLmRlZnMoWydyb3cnXSwgZW5jb2RpbmcsIGxheW91dCkpO1xuICB9IGVsc2UgeyAvLyBkb2Vzbid0IGhhdmUgcm93XG4gICAgaWYgKGVuY29kaW5nLmhhcyhYKSkge1xuICAgICAgLy9rZWVwIHggYXhpcyBpbiB0aGUgY2VsbFxuICAgICAgY2VsbEF4ZXMucHVzaC5hcHBseShjZWxsQXhlcywgYXhpcy5kZWZzKFsneCddLCBlbmNvZGluZywgbGF5b3V0KSk7XG4gICAgfVxuICB9XG5cbiAgaWYgKGhhc0NvbCkge1xuICAgIGlmICghZW5jb2RpbmcuaXNPcmRpbmFsU2NhbGUoQ09MKSkge1xuICAgICAgdXRpbC5lcnJvcignQ29sIGVuY29kaW5nIHNob3VsZCBiZSBvcmRpbmFsLicpO1xuICAgIH1cbiAgICBlbnRlci54ID0ge3NjYWxlOiBDT0wsIGZpZWxkOiAna2V5cy4nICsgZmFjZXRLZXlzLmxlbmd0aH07XG4gICAgZW50ZXIud2lkdGggPSB7J3ZhbHVlJzogbGF5b3V0LmNlbGxXaWR0aH07IC8vIEhBQ0tcblxuICAgIGZhY2V0S2V5cy5wdXNoKGVuY29kaW5nLmZpZWxkKENPTCkpO1xuXG4gICAgaWYgKGhhc1Jvdykge1xuICAgICAgZnJvbSA9IHV0aWwuZHVwbGljYXRlKGdyb3VwLmZyb20pO1xuICAgICAgZnJvbS50cmFuc2Zvcm0gPSBmcm9tLnRyYW5zZm9ybSB8fCBbXTtcbiAgICAgIGZyb20udHJhbnNmb3JtLnVuc2hpZnQoe3R5cGU6ICdmYWNldCcsIGtleXM6IFtlbmNvZGluZy5maWVsZChST1cpXX0pO1xuICAgIH1cblxuICAgIGF4ZXNHcnAgPSBncm91cGRlZigneS1heGVzJywge1xuICAgICAgYXhlczogZW5jb2RpbmcuaGFzKFkpID8gYXhpcy5kZWZzKFsneSddLCBlbmNvZGluZywgbGF5b3V0KSA6IHVuZGVmaW5lZCxcbiAgICAgIHk6IGhhc1JvdyAmJiB7c2NhbGU6IFJPVywgZmllbGQ6ICdrZXlzLjAnfSxcbiAgICAgIHg6IGhhc1JvdyAmJiB7dmFsdWU6IDB9LFxuICAgICAgaGVpZ2h0OiBoYXNSb3cgJiYgeyd2YWx1ZSc6IGxheW91dC5jZWxsSGVpZ2h0fSwgLy9IQUNLP1xuICAgICAgZnJvbTogZnJvbVxuICAgIH0pO1xuXG4gICAgc3BlYy5tYXJrcy5wdXNoKGF4ZXNHcnApO1xuICAgIChzcGVjLmF4ZXMgPSBzcGVjLmF4ZXMgfHwgW10pO1xuICAgIHNwZWMuYXhlcy5wdXNoLmFwcGx5KHNwZWMuYXhlcywgYXhpcy5kZWZzKFsnY29sJ10sIGVuY29kaW5nLCBsYXlvdXQpKTtcbiAgfSBlbHNlIHsgLy8gZG9lc24ndCBoYXZlIGNvbFxuICAgIGlmIChlbmNvZGluZy5oYXMoWSkpIHtcbiAgICAgIGNlbGxBeGVzLnB1c2guYXBwbHkoY2VsbEF4ZXMsIGF4aXMuZGVmcyhbJ3knXSwgZW5jb2RpbmcsIGxheW91dCkpO1xuICAgIH1cbiAgfVxuXG4gIC8vIGFzc3VtaW5nIGVxdWFsIGNlbGxXaWR0aCBoZXJlXG4gIC8vIFRPRE86IHN1cHBvcnQgaGV0ZXJvZ2Vub3VzIGNlbGxXaWR0aCAobWF5YmUgYnkgdXNpbmcgbXVsdGlwbGUgc2NhbGVzPylcbiAgc3BlYy5zY2FsZXMgPSAoc3BlYy5zY2FsZXMgfHwgW10pLmNvbmNhdChzY2FsZS5kZWZzKFxuICAgIHNjYWxlLm5hbWVzKGVudGVyKS5jb25jYXQoc2NhbGUubmFtZXMobWRlZi5wcm9wZXJ0aWVzLnVwZGF0ZSkpLFxuICAgIGVuY29kaW5nLFxuICAgIHtjZWxsV2lkdGg6IGxheW91dC5jZWxsV2lkdGgsIGNlbGxIZWlnaHQ6IGxheW91dC5jZWxsSGVpZ2h0LCBzdGFjazogc3RhY2ssIGZhY2V0OiB0cnVlLCBzdGF0czogc3RhdHN9XG4gICkpOyAvLyByb3cvY29sIHNjYWxlcyArIGNlbGwgc2NhbGVzXG5cbiAgaWYgKGNlbGxBeGVzLmxlbmd0aCA+IDApIHtcbiAgICBncm91cC5heGVzID0gY2VsbEF4ZXM7XG4gIH1cblxuICAvLyBhZGQgZmFjZXQgdHJhbnNmb3JtXG4gIHZhciB0cmFucyA9IChncm91cC5mcm9tLnRyYW5zZm9ybSB8fCAoZ3JvdXAuZnJvbS50cmFuc2Zvcm0gPSBbXSkpO1xuICB0cmFucy51bnNoaWZ0KHt0eXBlOiAnZmFjZXQnLCBrZXlzOiBmYWNldEtleXN9KTtcblxuICByZXR1cm4gc3BlYztcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBkZWY6IGdyb3VwZGVmXG59O1xuXG5mdW5jdGlvbiBncm91cGRlZihuYW1lLCBvcHQpIHtcbiAgb3B0ID0gb3B0IHx8IHt9O1xuICByZXR1cm4ge1xuICAgIF9uYW1lOiBuYW1lIHx8IHVuZGVmaW5lZCxcbiAgICB0eXBlOiAnZ3JvdXAnLFxuICAgIGZyb206IG9wdC5mcm9tLFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIGVudGVyOiB7XG4gICAgICAgIHg6IG9wdC54IHx8IHVuZGVmaW5lZCxcbiAgICAgICAgeTogb3B0LnkgfHwgdW5kZWZpbmVkLFxuICAgICAgICB3aWR0aDogb3B0LndpZHRoIHx8IHtncm91cDogJ3dpZHRoJ30sXG4gICAgICAgIGhlaWdodDogb3B0LmhlaWdodCB8fCB7Z3JvdXA6ICdoZWlnaHQnfVxuICAgICAgfVxuICAgIH0sXG4gICAgc2NhbGVzOiBvcHQuc2NhbGVzIHx8IHVuZGVmaW5lZCxcbiAgICBheGVzOiBvcHQuYXhlcyB8fCB1bmRlZmluZWQsXG4gICAgbWFya3M6IG9wdC5tYXJrcyB8fCBbXVxuICB9O1xufVxuIiwidmFyIGdsb2JhbHMgPSByZXF1aXJlKCcuLi9nbG9iYWxzJyksXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyksXG4gIHNjaGVtYSA9IHJlcXVpcmUoJy4uL3NjaGVtYS9zY2hlbWEnKSxcbiAgdGltZSA9IHJlcXVpcmUoJy4vdGltZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHZsbGF5b3V0O1xudmFyIENIQVJBQ1RFUl9XSURUSCA9IDY7XG5cbmZ1bmN0aW9uIHZsbGF5b3V0KGVuY29kaW5nLCBzdGF0cykge1xuICB2YXIgbGF5b3V0ID0gYm94KGVuY29kaW5nLCBzdGF0cyk7XG4gIGxheW91dCA9IG9mZnNldChlbmNvZGluZywgc3RhdHMsIGxheW91dCk7XG4gIGxheW91dC5jaGFyYWN0ZXJXaWR0aCA9IENIQVJBQ1RFUl9XSURUSDtcbiAgcmV0dXJuIGxheW91dDtcbn1cblxuZnVuY3Rpb24gZ2V0Q2FyZGluYWxpdHkoZW5jb2RpbmcsIGVuY1R5cGUsIHN0YXRzKSB7XG4gIHZhciBmaWVsZCA9IGVuY29kaW5nLmZpZWxkTmFtZShlbmNUeXBlKTtcbiAgaWYgKGVuY29kaW5nLmJpbihlbmNUeXBlKSkge1xuICAgIHZhciBiaW5zID0gdXRpbC5nZXRiaW5zKHN0YXRzW2ZpZWxkXSk7XG4gICAgcmV0dXJuIChiaW5zLnN0b3AgLSBiaW5zLnN0YXJ0KSAvIGJpbnMuc3RlcDtcbiAgfVxuICBpZiAoZW5jb2RpbmcuaXNUeXBlKGVuY1R5cGUsIFQpKSB7XG4gICAgcmV0dXJuIHRpbWUuY2FyZGluYWxpdHkoZW5jb2RpbmcsIGVuY1R5cGUsIHN0YXRzKTtcbiAgfVxuICByZXR1cm4gc3RhdHNbZmllbGRdLmNhcmRpbmFsaXR5O1xufVxuXG4vKlxuICBIQUNLIHRvIHNldCBjaGFydCBzaXplXG4gIE5PVEU6IHRoaXMgZmFpbHMgZm9yIHBsb3RzIGRyaXZlbiBieSBkZXJpdmVkIHZhbHVlcyAoZS5nLiwgYWdncmVnYXRlcylcbiAgT25lIHNvbHV0aW9uIGlzIHRvIHVwZGF0ZSBWZWdhIHRvIHN1cHBvcnQgYXV0by1zaXppbmdcbiAgSW4gdGhlIG1lYW50aW1lLCBhdXRvLXBhZGRpbmcgKG1vc3RseSkgZG9lcyB0aGUgdHJpY2tcbiAqL1xuZnVuY3Rpb24gYm94KGVuY29kaW5nLCBzdGF0cykge1xuICB2YXIgaGFzUm93ID0gZW5jb2RpbmcuaGFzKFJPVyksXG4gICAgICBoYXNDb2wgPSBlbmNvZGluZy5oYXMoQ09MKSxcbiAgICAgIG1hcmt0eXBlID0gZW5jb2RpbmcubWFya3R5cGUoKTtcblxuICB2YXIgY2VsbFdpZHRoLCBjZWxsSGVpZ2h0LCBjZWxsUGFkZGluZyA9IGVuY29kaW5nLmNvbmZpZygnY2VsbFBhZGRpbmcnKTtcblxuICAvLyBzZXQgY2VsbFdpZHRoXG4gIGlmIChlbmNvZGluZy5oYXMoWCkpIHtcbiAgICBpZiAoZW5jb2RpbmcuaXNPcmRpbmFsU2NhbGUoWCkpIHtcbiAgICAgIC8vIGZvciBvcmRpbmFsLCBoYXNDb2wgb3Igbm90IGRvZXNuJ3QgbWF0dGVyIC0tIHdlIHNjYWxlIGJhc2VkIG9uIGNhcmRpbmFsaXR5XG4gICAgICB2YXIgeENhcmRpbmFsaXR5ID0gZ2V0Q2FyZGluYWxpdHkoZW5jb2RpbmcsIFgsIHN0YXRzKTtcbiAgICAgIGNlbGxXaWR0aCA9ICh4Q2FyZGluYWxpdHkgKyBlbmNvZGluZy5iYW5kKFgpLnBhZGRpbmcpICogZW5jb2RpbmcuYmFuZFNpemUoWCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNlbGxXaWR0aCA9IGhhc0NvbCA/IGVuY29kaW5nLmVuYyhDT0wpLndpZHRoIDogIGVuY29kaW5nLmNvbmZpZyhcInNpbmdsZVdpZHRoXCIpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAobWFya3R5cGUgPT09IFRFWFQpIHtcbiAgICAgIGNlbGxXaWR0aCA9IGVuY29kaW5nLmNvbmZpZygndGV4dENlbGxXaWR0aCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjZWxsV2lkdGggPSBlbmNvZGluZy5iYW5kU2l6ZShYKTtcbiAgICB9XG4gIH1cblxuICAvLyBzZXQgY2VsbEhlaWdodFxuICBpZiAoZW5jb2RpbmcuaGFzKFkpKSB7XG4gICAgaWYgKGVuY29kaW5nLmlzT3JkaW5hbFNjYWxlKFkpKSB7XG4gICAgICAvLyBmb3Igb3JkaW5hbCwgaGFzQ29sIG9yIG5vdCBkb2Vzbid0IG1hdHRlciAtLSB3ZSBzY2FsZSBiYXNlZCBvbiBjYXJkaW5hbGl0eVxuICAgICAgdmFyIHlDYXJkaW5hbGl0eSA9IGdldENhcmRpbmFsaXR5KGVuY29kaW5nLCBZLCBzdGF0cyk7XG4gICAgICBjZWxsSGVpZ2h0ID0gKHlDYXJkaW5hbGl0eSArIGVuY29kaW5nLmJhbmQoWSkucGFkZGluZykgKiBlbmNvZGluZy5iYW5kU2l6ZShZKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2VsbEhlaWdodCA9IGhhc1JvdyA/IGVuY29kaW5nLmVuYyhST1cpLmhlaWdodCA6ICBlbmNvZGluZy5jb25maWcoXCJzaW5nbGVIZWlnaHRcIik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNlbGxIZWlnaHQgPSBlbmNvZGluZy5iYW5kU2l6ZShZKTtcbiAgfVxuXG4gIC8vIENlbGwgYmFuZHMgdXNlIHJhbmdlQmFuZHMoKS4gVGhlcmUgYXJlIG4tMSBwYWRkaW5nLiAgT3V0ZXJwYWRkaW5nID0gMCBmb3IgY2VsbHNcblxuICB2YXIgd2lkdGggPSBjZWxsV2lkdGgsIGhlaWdodCA9IGNlbGxIZWlnaHQ7XG4gIGlmIChoYXNDb2wpIHtcbiAgICB2YXIgY29sQ2FyZGluYWxpdHkgPSBnZXRDYXJkaW5hbGl0eShlbmNvZGluZywgQ09MLCBzdGF0cyk7XG4gICAgd2lkdGggPSBjZWxsV2lkdGggKiAoKDEgKyBjZWxsUGFkZGluZykgKiAoY29sQ2FyZGluYWxpdHkgLSAxKSArIDEpO1xuICB9XG4gIGlmIChoYXNSb3cpIHtcbiAgICB2YXIgcm93Q2FyZGluYWxpdHkgPSBnZXRDYXJkaW5hbGl0eShlbmNvZGluZywgUk9XLCBzdGF0cyk7XG4gICAgaGVpZ2h0ID0gY2VsbEhlaWdodCAqICgoMSArIGNlbGxQYWRkaW5nKSAqIChyb3dDYXJkaW5hbGl0eSAtIDEpICsgMSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGNlbGxXaWR0aDogY2VsbFdpZHRoLFxuICAgIGNlbGxIZWlnaHQ6IGNlbGxIZWlnaHQsXG4gICAgd2lkdGg6IHdpZHRoLFxuICAgIGhlaWdodDogaGVpZ2h0XG4gIH07XG59XG5cbmZ1bmN0aW9uIG9mZnNldChlbmNvZGluZywgc3RhdHMsIGxheW91dCkge1xuICBbWCwgWV0uZm9yRWFjaChmdW5jdGlvbiAoeCkge1xuICAgIGlmIChlbmNvZGluZy5pc09yZGluYWxTY2FsZSh4KSkge1xuICAgICAgdmFyIG1heExlbmd0aCA9IHN0YXRzW2VuY29kaW5nLmZpZWxkTmFtZSh4KV0ubWF4bGVuZ3RoO1xuICAgICAgbGF5b3V0W3hdID0ge1xuICAgICAgICBheGlzVGl0bGVPZmZzZXQ6IENIQVJBQ1RFUl9XSURUSCAqICBtYXhMZW5ndGggKyAyMFxuICAgICAgfTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gbGF5b3V0O1xufVxuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKSxcbiAgdGltZSA9IHJlcXVpcmUoJy4vdGltZScpO1xuXG52YXIgbGVnZW5kID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxubGVnZW5kLmRlZnMgPSBmdW5jdGlvbihlbmNvZGluZykge1xuICB2YXIgZGVmcyA9IFtdO1xuXG4gIC8vIFRPRE86IHN1cHBvcnQgYWxwaGFcblxuICBpZiAoZW5jb2RpbmcuaGFzKENPTE9SKSAmJiBlbmNvZGluZy5sZWdlbmQoQ09MT1IpKSB7XG4gICAgZGVmcy5wdXNoKGxlZ2VuZC5kZWYoQ09MT1IsIGVuY29kaW5nLCB7XG4gICAgICBmaWxsOiBDT0xPUixcbiAgICAgIG9yaWVudDogJ3JpZ2h0J1xuICAgIH0pKTtcbiAgfVxuXG4gIGlmIChlbmNvZGluZy5oYXMoU0laRSkgJiYgZW5jb2RpbmcubGVnZW5kKFNJWkUpKSB7XG4gICAgZGVmcy5wdXNoKGxlZ2VuZC5kZWYoU0laRSwgZW5jb2RpbmcsIHtcbiAgICAgIHNpemU6IFNJWkUsXG4gICAgICBvcmllbnQ6IGRlZnMubGVuZ3RoID09PSAxID8gJ2xlZnQnIDogJ3JpZ2h0J1xuICAgIH0pKTtcbiAgfVxuXG4gIGlmIChlbmNvZGluZy5oYXMoU0hBUEUpICYmIGVuY29kaW5nLmxlZ2VuZChTSEFQRSkpIHtcbiAgICBpZiAoZGVmcy5sZW5ndGggPT09IDIpIHtcbiAgICAgIC8vIFRPRE86IGZpeCB0aGlzXG4gICAgICBjb25zb2xlLmVycm9yKCdWZWdhbGl0ZSBjdXJyZW50bHkgb25seSBzdXBwb3J0cyB0d28gbGVnZW5kcycpO1xuICAgICAgcmV0dXJuIGRlZnM7XG4gICAgfVxuICAgIGRlZnMucHVzaChsZWdlbmQuZGVmKFNIQVBFLCBlbmNvZGluZywge1xuICAgICAgc2hhcGU6IFNIQVBFLFxuICAgICAgb3JpZW50OiBkZWZzLmxlbmd0aCA9PT0gMSA/ICdsZWZ0JyA6ICdyaWdodCdcbiAgICB9KSk7XG4gIH1cblxuICByZXR1cm4gZGVmcztcbn07XG5cbmxlZ2VuZC5kZWYgPSBmdW5jdGlvbihuYW1lLCBlbmNvZGluZywgcHJvcHMpIHtcbiAgdmFyIGRlZiA9IHByb3BzLCBmbjtcblxuICBkZWYudGl0bGUgPSBlbmNvZGluZy5maWVsZFRpdGxlKG5hbWUpO1xuXG4gIGlmIChlbmNvZGluZy5pc1R5cGUobmFtZSwgVCkgJiYgKGZuID0gZW5jb2RpbmcuZm4obmFtZSkpICYmXG4gICAgdGltZS5oYXNTY2FsZShmbikpIHtcbiAgICB2YXIgcHJvcGVydGllcyA9IGRlZi5wcm9wZXJ0aWVzID0gZGVmLnByb3BlcnRpZXMgfHwge30sXG4gICAgICBsYWJlbHMgPSBwcm9wZXJ0aWVzLmxhYmVscyA9IHByb3BlcnRpZXMubGFiZWxzIHx8IHt9LFxuICAgICAgdGV4dCA9IGxhYmVscy50ZXh0ID0gbGFiZWxzLnRleHQgfHwge307XG5cbiAgICB0ZXh0LnNjYWxlID0gJ3RpbWUtJysgZm47XG4gIH1cblxuICByZXR1cm4gZGVmO1xufTtcbiIsInZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG52YXIgbWFya3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5tYXJrcy5kZWYgPSBmdW5jdGlvbihtYXJrLCBlbmNvZGluZywgb3B0KSB7XG4gIHZhciBwID0gbWFyay5wcm9wKGVuY29kaW5nLCBvcHQpO1xuICByZXR1cm4ge1xuICAgIHR5cGU6IG1hcmsudHlwZSxcbiAgICBmcm9tOiB7ZGF0YTogVEFCTEV9LFxuICAgIHByb3BlcnRpZXM6IHtlbnRlcjogcCwgdXBkYXRlOiBwfVxuICB9O1xufTtcblxubWFya3MuYmFyID0ge1xuICB0eXBlOiAncmVjdCcsXG4gIHN0YWNrOiB0cnVlLFxuICBwcm9wOiBiYXJfcHJvcHMsXG4gIHJlcXVpcmVkRW5jb2Rpbmc6IFsneCcsICd5J10sXG4gIHN1cHBvcnRlZEVuY29kaW5nOiB7cm93OiAxLCBjb2w6IDEsIHg6IDEsIHk6IDEsIHNpemU6IDEsIGNvbG9yOiAxLCBhbHBoYTogMX1cbn07XG5cbm1hcmtzLmxpbmUgPSB7XG4gIHR5cGU6ICdsaW5lJyxcbiAgbGluZTogdHJ1ZSxcbiAgcHJvcDogbGluZV9wcm9wcyxcbiAgcmVxdWlyZWRFbmNvZGluZzogWyd4JywgJ3knXSxcbiAgc3VwcG9ydGVkRW5jb2Rpbmc6IHtyb3c6IDEsIGNvbDogMSwgeDogMSwgeTogMSwgY29sb3I6IDEsIGFscGhhOiAxfVxufTtcblxubWFya3MuYXJlYSA9IHtcbiAgdHlwZTogJ2FyZWEnLFxuICBzdGFjazogdHJ1ZSxcbiAgbGluZTogdHJ1ZSxcbiAgcmVxdWlyZWRFbmNvZGluZzogWyd4JywgJ3knXSxcbiAgcHJvcDogYXJlYV9wcm9wcyxcbiAgc3VwcG9ydGVkRW5jb2Rpbmc6IG1hcmtzLmxpbmUuc3VwcG9ydGVkRW5jb2Rpbmdcbn07XG5cbm1hcmtzLmNpcmNsZSA9IHtcbiAgdHlwZTogJ3N5bWJvbCcsXG4gIHByb3A6IGZpbGxlZF9wb2ludF9wcm9wcygnY2lyY2xlJyksXG4gIHN1cHBvcnRlZEVuY29kaW5nOiB7cm93OiAxLCBjb2w6IDEsIHg6IDEsIHk6IDEsIHNpemU6IDEsIGNvbG9yOiAxLCBhbHBoYTogMX1cbn07XG5cbm1hcmtzLnNxdWFyZSA9IHtcbiAgdHlwZTogJ3N5bWJvbCcsXG4gIHByb3A6IGZpbGxlZF9wb2ludF9wcm9wcygnc3F1YXJlJyksXG4gIHN1cHBvcnRlZEVuY29kaW5nOiBtYXJrcy5jaXJjbGUuc3VwcG9ydGVkRW5jb2Rpbmdcbn07XG5cbm1hcmtzLnBvaW50ID0ge1xuICB0eXBlOiAnc3ltYm9sJyxcbiAgcHJvcDogcG9pbnRfcHJvcHMsXG4gIHN1cHBvcnRlZEVuY29kaW5nOiB7cm93OiAxLCBjb2w6IDEsIHg6IDEsIHk6IDEsIHNpemU6IDEsIGNvbG9yOiAxLCBhbHBoYTogMSwgc2hhcGU6IDF9XG59O1xuXG5tYXJrcy50ZXh0ID0ge1xuICB0eXBlOiAndGV4dCcsXG4gIHByb3A6IHRleHRfcHJvcHMsXG4gIHJlcXVpcmVkRW5jb2Rpbmc6IFsndGV4dCddLFxuICBzdXBwb3J0ZWRFbmNvZGluZzoge3JvdzogMSwgY29sOiAxLCBzaXplOiAxLCBjb2xvcjogMSwgYWxwaGE6IDEsIHRleHQ6IDF9XG59O1xuXG5mdW5jdGlvbiBiYXJfcHJvcHMoZSkge1xuICB2YXIgcCA9IHt9O1xuXG4gIC8vIHhcbiAgaWYgKGUuaXNRdWFudFNjYWxlKFgpKSB7XG4gICAgcC54ID0ge3NjYWxlOiBYLCBmaWVsZDogZS5maWVsZChYKX07XG4gICAgaWYgKGUuaXNPcmRpbmFsU2NhbGUoWSkpIHtcbiAgICAgIHAueDIgPSB7c2NhbGU6IFgsIHZhbHVlOiAwfTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoZS5oYXMoWCkpIHsgLy8gaXMgb3JkaW5hbFxuICAgIHAueGMgPSB7c2NhbGU6IFgsIGZpZWxkOiBlLmZpZWxkKFgpfTtcbiAgfSBlbHNlIHtcbiAgICAvLyBUT0RPIGFkZCBzaW5nbGUgYmFyIG9mZnNldFxuICAgIHAueGMgPSB7dmFsdWU6IDB9O1xuICB9XG5cbiAgLy8geVxuICBpZiAoZS5pc1F1YW50U2NhbGUoWSkpIHtcbiAgICBwLnkgPSB7c2NhbGU6IFksIGZpZWxkOiBlLmZpZWxkKFkpfTtcbiAgICBwLnkyID0ge3NjYWxlOiBZLCB2YWx1ZTogMH07XG4gIH0gZWxzZSBpZiAoZS5oYXMoWSkpIHsgLy8gaXMgb3JkaW5hbFxuICAgIHAueWMgPSB7c2NhbGU6IFksIGZpZWxkOiBlLmZpZWxkKFkpfTtcbiAgfSBlbHNlIHtcbiAgICAvLyBUT0RPIGFkZCBzaW5nbGUgYmFyIG9mZnNldFxuICAgIHAueWMgPSB7Z3JvdXA6ICdoZWlnaHQnfTtcbiAgfVxuXG4gIC8vIHdpZHRoXG4gIGlmICghZS5pc1F1YW50U2NhbGUoWCkpIHsgLy8gbm8gWCBvciBYIGlzIG9yZGluYWxcbiAgICBpZiAoZS5oYXMoU0laRSkpIHtcbiAgICAgIHAud2lkdGggPSB7c2NhbGU6IFNJWkUsIGZpZWxkOiBlLmZpZWxkKFNJWkUpfTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gcC53aWR0aCA9IHtzY2FsZTogWCwgYmFuZDogdHJ1ZSwgb2Zmc2V0OiAtMX07XG4gICAgICBwLndpZHRoID0ge3ZhbHVlOiBlLmJhbmRTaXplKFgpLCBvZmZzZXQ6IC0xfTtcbiAgICB9XG4gIH0gZWxzZSB7IC8vIFggaXMgUXVhbnRcbiAgICBwLndpZHRoID0ge3ZhbHVlOiBlLmJhbmRTaXplKFgpLCBvZmZzZXQ6IC0xfTtcbiAgfVxuXG4gIC8vIGhlaWdodFxuICBpZiAoIWUuaXNRdWFudFNjYWxlKFkpKSB7IC8vIG5vIFkgb3IgWSBpcyBvcmRpbmFsXG4gICAgaWYgKGUuaGFzKFNJWkUpKSB7XG4gICAgICBwLmhlaWdodCA9IHtzY2FsZTogU0laRSwgZmllbGQ6IGUuZmllbGQoU0laRSl9O1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBwLmhlaWdodCA9IHtzY2FsZTogWSwgYmFuZDogdHJ1ZSwgb2Zmc2V0OiAtMX07XG4gICAgICBwLmhlaWdodCA9IHt2YWx1ZTogZS5iYW5kU2l6ZShZKSwgb2Zmc2V0OiAtMX07XG4gICAgfVxuICB9IGVsc2UgeyAvLyBZIGlzIFF1YW50XG4gICAgcC5oZWlnaHQgPSB7dmFsdWU6IGUuYmFuZFNpemUoWSksIG9mZnNldDogLTF9O1xuICB9XG5cbiAgLy8gZmlsbFxuICBpZiAoZS5oYXMoQ09MT1IpKSB7XG4gICAgcC5maWxsID0ge3NjYWxlOiBDT0xPUiwgZmllbGQ6IGUuZmllbGQoQ09MT1IpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoQ09MT1IpKSB7XG4gICAgcC5maWxsID0ge3ZhbHVlOiBlLnZhbHVlKENPTE9SKX07XG4gIH1cblxuICAvLyBhbHBoYVxuICBpZiAoZS5oYXMoQUxQSEEpKSB7XG4gICAgcC5vcGFjaXR5ID0ge3NjYWxlOiBBTFBIQSwgZmllbGQ6IGUuZmllbGQoQUxQSEEpfTtcbiAgfVxuXG4gIHJldHVybiBwO1xufVxuXG5mdW5jdGlvbiBwb2ludF9wcm9wcyhlLCBvcHQpIHtcbiAgdmFyIHAgPSB7fTtcbiAgb3B0ID0gb3B0IHx8IHt9O1xuXG4gIC8vIHhcbiAgaWYgKGUuaGFzKFgpKSB7XG4gICAgcC54ID0ge3NjYWxlOiBYLCBmaWVsZDogZS5maWVsZChYKX07XG4gIH0gZWxzZSBpZiAoIWUuaGFzKFgpKSB7XG4gICAgcC54ID0ge3ZhbHVlOiBlLmJhbmRTaXplKFgpIC8gMn07XG4gIH1cblxuICAvLyB5XG4gIGlmIChlLmhhcyhZKSkge1xuICAgIHAueSA9IHtzY2FsZTogWSwgZmllbGQ6IGUuZmllbGQoWSl9O1xuICB9IGVsc2UgaWYgKCFlLmhhcyhZKSkge1xuICAgIHAueSA9IHt2YWx1ZTogZS5iYW5kU2l6ZShZKSAvIDJ9O1xuICB9XG5cbiAgLy8gc2l6ZVxuICBpZiAoZS5oYXMoU0laRSkpIHtcbiAgICBwLnNpemUgPSB7c2NhbGU6IFNJWkUsIGZpZWxkOiBlLmZpZWxkKFNJWkUpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoU0laRSkpIHtcbiAgICBwLnNpemUgPSB7dmFsdWU6IGUudmFsdWUoU0laRSl9O1xuICB9XG5cbiAgLy8gc2hhcGVcbiAgaWYgKGUuaGFzKFNIQVBFKSkge1xuICAgIHAuc2hhcGUgPSB7c2NhbGU6IFNIQVBFLCBmaWVsZDogZS5maWVsZChTSEFQRSl9O1xuICB9IGVsc2UgaWYgKCFlLmhhcyhTSEFQRSkpIHtcbiAgICBwLnNoYXBlID0ge3ZhbHVlOiBlLnZhbHVlKFNIQVBFKX07XG4gIH1cblxuICAvLyBzdHJva2VcbiAgaWYgKGUuaGFzKENPTE9SKSkge1xuICAgIHAuc3Ryb2tlID0ge3NjYWxlOiBDT0xPUiwgZmllbGQ6IGUuZmllbGQoQ09MT1IpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoQ09MT1IpKSB7XG4gICAgcC5zdHJva2UgPSB7dmFsdWU6IGUudmFsdWUoQ09MT1IpfTtcbiAgfVxuXG4gIC8vIGFscGhhXG4gIGlmIChlLmhhcyhBTFBIQSkpIHtcbiAgICBwLm9wYWNpdHkgPSB7c2NhbGU6IEFMUEhBLCBmaWVsZDogZS5maWVsZChBTFBIQSl9O1xuICB9ZWxzZSB7XG4gICAgcC5vcGFjaXR5ID0ge1xuICAgICAgdmFsdWU6IGUudmFsdWUoQUxQSEEpXG4gICAgfTtcbiAgfVxuXG4gIHAuc3Ryb2tlV2lkdGggPSB7dmFsdWU6IGUuY29uZmlnKCdzdHJva2VXaWR0aCcpfTtcblxuICByZXR1cm4gcDtcbn1cblxuZnVuY3Rpb24gbGluZV9wcm9wcyhlKSB7XG4gIHZhciBwID0ge307XG5cbiAgLy8geFxuICBpZiAoZS5oYXMoWCkpIHtcbiAgICBwLnggPSB7c2NhbGU6IFgsIGZpZWxkOiBlLmZpZWxkKFgpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoWCkpIHtcbiAgICBwLnggPSB7dmFsdWU6IDB9O1xuICB9XG5cbiAgLy8geVxuICBpZiAoZS5oYXMoWSkpIHtcbiAgICBwLnkgPSB7c2NhbGU6IFksIGZpZWxkOiBlLmZpZWxkKFkpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoWSkpIHtcbiAgICBwLnkgPSB7Z3JvdXA6ICdoZWlnaHQnfTtcbiAgfVxuXG4gIC8vIHN0cm9rZVxuICBpZiAoZS5oYXMoQ09MT1IpKSB7XG4gICAgcC5zdHJva2UgPSB7c2NhbGU6IENPTE9SLCBmaWVsZDogZS5maWVsZChDT0xPUil9O1xuICB9IGVsc2UgaWYgKCFlLmhhcyhDT0xPUikpIHtcbiAgICBwLnN0cm9rZSA9IHt2YWx1ZTogZS52YWx1ZShDT0xPUil9O1xuICB9XG5cbiAgLy8gYWxwaGFcbiAgaWYgKGUuaGFzKEFMUEhBKSkge1xuICAgIHAub3BhY2l0eSA9IHtzY2FsZTogQUxQSEEsIGZpZWxkOiBlLmZpZWxkKEFMUEhBKX07XG4gIH1cblxuICBwLnN0cm9rZVdpZHRoID0ge3ZhbHVlOiBlLmNvbmZpZygnc3Ryb2tlV2lkdGgnKX07XG5cbiAgcmV0dXJuIHA7XG59XG5cbmZ1bmN0aW9uIGFyZWFfcHJvcHMoZSkge1xuICB2YXIgcCA9IHt9O1xuXG4gIC8vIHhcbiAgaWYgKGUuaXNRdWFudFNjYWxlKFgpKSB7XG4gICAgcC54ID0ge3NjYWxlOiBYLCBmaWVsZDogZS5maWVsZChYKX07XG4gICAgaWYgKGUuaXNPcmRpbmFsU2NhbGUoWSkpIHtcbiAgICAgIHAueDIgPSB7c2NhbGU6IFgsIHZhbHVlOiAwfTtcbiAgICAgIHAub3JpZW50ID0ge3ZhbHVlOiAnaG9yaXpvbnRhbCd9O1xuICAgIH1cbiAgfSBlbHNlIGlmIChlLmhhcyhYKSkge1xuICAgIHAueCA9IHtzY2FsZTogWCwgZmllbGQ6IGUuZmllbGQoWCl9O1xuICB9IGVsc2Uge1xuICAgIHAueCA9IHt2YWx1ZTogMH07XG4gIH1cblxuICAvLyB5XG4gIGlmIChlLmlzUXVhbnRTY2FsZShZKSkge1xuICAgIHAueSA9IHtzY2FsZTogWSwgZmllbGQ6IGUuZmllbGQoWSl9O1xuICAgIHAueTIgPSB7c2NhbGU6IFksIHZhbHVlOiAwfTtcbiAgfSBlbHNlIGlmIChlLmhhcyhZKSkge1xuICAgIHAueSA9IHtzY2FsZTogWSwgZmllbGQ6IGUuZmllbGQoWSl9O1xuICB9IGVsc2Uge1xuICAgIHAueSA9IHtncm91cDogJ2hlaWdodCd9O1xuICB9XG5cbiAgLy8gc3Ryb2tlXG4gIGlmIChlLmhhcyhDT0xPUikpIHtcbiAgICBwLmZpbGwgPSB7c2NhbGU6IENPTE9SLCBmaWVsZDogZS5maWVsZChDT0xPUil9O1xuICB9IGVsc2UgaWYgKCFlLmhhcyhDT0xPUikpIHtcbiAgICBwLmZpbGwgPSB7dmFsdWU6IGUudmFsdWUoQ09MT1IpfTtcbiAgfVxuXG4gIC8vIGFscGhhXG4gIGlmIChlLmhhcyhBTFBIQSkpIHtcbiAgICBwLm9wYWNpdHkgPSB7c2NhbGU6IEFMUEhBLCBmaWVsZDogZS5maWVsZChBTFBIQSl9O1xuICB9XG5cbiAgcmV0dXJuIHA7XG59XG5cbmZ1bmN0aW9uIGZpbGxlZF9wb2ludF9wcm9wcyhzaGFwZSkge1xuICByZXR1cm4gZnVuY3Rpb24oZSwgb3B0KSB7XG4gICAgdmFyIHAgPSB7fTtcbiAgICBvcHQgPSBvcHQgfHwge307XG5cbiAgICAvLyB4XG4gICAgaWYgKGUuaGFzKFgpKSB7XG4gICAgICBwLnggPSB7c2NhbGU6IFgsIGZpZWxkOiBlLmZpZWxkKFgpfTtcbiAgICB9IGVsc2UgaWYgKCFlLmhhcyhYKSkge1xuICAgICAgcC54ID0ge3ZhbHVlOiBlLmJhbmRTaXplKFgpIC8gMn07XG4gICAgfVxuXG4gICAgLy8geVxuICAgIGlmIChlLmhhcyhZKSkge1xuICAgICAgcC55ID0ge3NjYWxlOiBZLCBmaWVsZDogZS5maWVsZChZKX07XG4gICAgfSBlbHNlIGlmICghZS5oYXMoWSkpIHtcbiAgICAgIHAueSA9IHt2YWx1ZTogZS5iYW5kU2l6ZShZKSAvIDJ9O1xuICAgIH1cblxuICAgIC8vIHNpemVcbiAgICBpZiAoZS5oYXMoU0laRSkpIHtcbiAgICAgIHAuc2l6ZSA9IHtzY2FsZTogU0laRSwgZmllbGQ6IGUuZmllbGQoU0laRSl9O1xuICAgIH0gZWxzZSBpZiAoIWUuaGFzKFgpKSB7XG4gICAgICBwLnNpemUgPSB7dmFsdWU6IGUudmFsdWUoU0laRSl9O1xuICAgIH1cblxuICAgIC8vIHNoYXBlXG4gICAgcC5zaGFwZSA9IHt2YWx1ZTogc2hhcGV9O1xuXG4gICAgLy8gZmlsbFxuICAgIGlmIChlLmhhcyhDT0xPUikpIHtcbiAgICAgIHAuZmlsbCA9IHtzY2FsZTogQ09MT1IsIGZpZWxkOiBlLmZpZWxkKENPTE9SKX07XG4gICAgfSBlbHNlIGlmICghZS5oYXMoQ09MT1IpKSB7XG4gICAgICBwLmZpbGwgPSB7dmFsdWU6IGUudmFsdWUoQ09MT1IpfTtcbiAgICB9XG5cbiAgICAvLyBhbHBoYVxuICAgIGlmIChlLmhhcyhBTFBIQSkpIHtcbiAgICAgIHAub3BhY2l0eSA9IHtzY2FsZTogQUxQSEEsIGZpZWxkOiBlLmZpZWxkKEFMUEhBKX07XG4gICAgfWVsc2Uge1xuICAgICAgcC5vcGFjaXR5ID0ge1xuICAgICAgICB2YWx1ZTogZS52YWx1ZShBTFBIQSlcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHA7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHRleHRfcHJvcHMoZSkge1xuICB2YXIgcCA9IHt9O1xuXG4gIC8vIHhcbiAgaWYgKGUuaGFzKFgpKSB7XG4gICAgcC54ID0ge3NjYWxlOiBYLCBmaWVsZDogZS5maWVsZChYKX07XG4gIH0gZWxzZSBpZiAoIWUuaGFzKFgpKSB7XG4gICAgcC54ID0ge3ZhbHVlOiBlLmJhbmRTaXplKFgpIC8gMn07XG4gIH1cblxuICAvLyB5XG4gIGlmIChlLmhhcyhZKSkge1xuICAgIHAueSA9IHtzY2FsZTogWSwgZmllbGQ6IGUuZmllbGQoWSl9O1xuICB9IGVsc2UgaWYgKCFlLmhhcyhZKSkge1xuICAgIHAueSA9IHt2YWx1ZTogZS5iYW5kU2l6ZShZKSAvIDJ9O1xuICB9XG5cbiAgLy8gc2l6ZVxuICBpZiAoZS5oYXMoU0laRSkpIHtcbiAgICBwLmZvbnRTaXplID0ge3NjYWxlOiBTSVpFLCBmaWVsZDogZS5maWVsZChTSVpFKX07XG4gIH0gZWxzZSBpZiAoIWUuaGFzKFgpKSB7XG4gICAgcC5mb250U2l6ZSA9IHt2YWx1ZTogZS5mb250KCdzaXplJyl9O1xuICB9XG5cbiAgLy8gZmlsbFxuICBpZiAoZS5oYXMoQ09MT1IpKSB7XG4gICAgcC5maWxsID0ge3NjYWxlOiBDT0xPUiwgZmllbGQ6IGUuZmllbGQoQ09MT1IpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoQ09MT1IpKSB7XG4gICAgcC5maWxsID0ge3ZhbHVlOiBlLnZhbHVlKENPTE9SKX07XG4gIH1cblxuICAvLyBhbHBoYVxuICBpZiAoZS5oYXMoQUxQSEEpKSB7XG4gICAgcC5vcGFjaXR5ID0ge3NjYWxlOiBBTFBIQSwgZmllbGQ6IGUuZmllbGQoQUxQSEEpfTtcbiAgfVxuXG4gIC8vIHRleHRcbiAgaWYgKGUuaGFzKFRFWFQpKSB7XG4gICAgcC50ZXh0ID0ge2ZpZWxkOiBlLmZpZWxkKFRFWFQpfTtcbiAgfSBlbHNlIHtcbiAgICBwLnRleHQgPSB7dmFsdWU6ICdBYmMnfTtcbiAgfVxuXG4gIHAuZm9udCA9IHt2YWx1ZTogZS5mb250KCdmYW1pbHknKX07XG4gIHAuZm9udFdlaWdodCA9IHt2YWx1ZTogZS5mb250KCd3ZWlnaHQnKX07XG4gIHAuZm9udFN0eWxlID0ge3ZhbHVlOiBlLmZvbnQoJ3N0eWxlJyl9O1xuICBwLmJhc2VsaW5lID0ge3ZhbHVlOiBlLnRleHQoJ2Jhc2VsaW5lJyl9O1xuXG4gIC8vIGFsaWduXG4gIGlmIChlLmhhcyhYKSkge1xuICAgIGlmIChlLmlzT3JkaW5hbFNjYWxlKFgpKSB7XG4gICAgICBwLmFsaWduID0ge3ZhbHVlOiAnbGVmdCd9O1xuICAgICAgcC5keCA9IHt2YWx1ZTogZS50ZXh0KCdtYXJnaW4nKX07XG4gICAgfSBlbHNlIHtcbiAgICAgIHAuYWxpZ24gPSB7dmFsdWU6ICdjZW50ZXInfTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoZS5oYXMoWSkpIHtcbiAgICBwLmFsaWduID0ge3ZhbHVlOiAnbGVmdCd9O1xuICAgIHAuZHggPSB7dmFsdWU6IGUudGV4dCgnbWFyZ2luJyl9O1xuICB9IGVsc2Uge1xuICAgIHAuYWxpZ24gPSB7dmFsdWU6IGUudGV4dCgnYWxpZ24nKX07XG4gIH1cblxuICByZXR1cm4gcDtcbn1cbiIsInZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpLFxuICB0aW1lID0gcmVxdWlyZSgnLi90aW1lJyk7XG5cbnZhciBzY2FsZSA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnNjYWxlLm5hbWVzID0gZnVuY3Rpb24ocHJvcHMpIHtcbiAgcmV0dXJuIHV0aWwua2V5cyh1dGlsLmtleXMocHJvcHMpLnJlZHVjZShmdW5jdGlvbihhLCB4KSB7XG4gICAgaWYgKHByb3BzW3hdICYmIHByb3BzW3hdLnNjYWxlKSBhW3Byb3BzW3hdLnNjYWxlXSA9IDE7XG4gICAgcmV0dXJuIGE7XG4gIH0sIHt9KSk7XG59O1xuXG5zY2FsZS5kZWZzID0gZnVuY3Rpb24obmFtZXMsIGVuY29kaW5nLCBvcHQpIHtcbiAgb3B0ID0gb3B0IHx8IHt9O1xuXG4gIHJldHVybiBuYW1lcy5yZWR1Y2UoZnVuY3Rpb24oYSwgbmFtZSkge1xuICAgIHZhciBzID0ge1xuICAgICAgbmFtZTogbmFtZSxcbiAgICAgIHR5cGU6IHNjYWxlLnR5cGUobmFtZSwgZW5jb2RpbmcpLFxuICAgICAgZG9tYWluOiBzY2FsZV9kb21haW4obmFtZSwgZW5jb2RpbmcsIG9wdClcbiAgICB9O1xuICAgIGlmIChzLnR5cGUgPT09ICdvcmRpbmFsJyAmJiAhZW5jb2RpbmcuYmluKG5hbWUpKSB7XG4gICAgICBzLnNvcnQgPSB0cnVlO1xuICAgIH1cblxuICAgIHNjYWxlX3JhbmdlKHMsIGVuY29kaW5nLCBvcHQpO1xuXG4gICAgcmV0dXJuIChhLnB1c2gocyksIGEpO1xuICB9LCBbXSk7XG59O1xuXG5zY2FsZS50eXBlID0gZnVuY3Rpb24obmFtZSwgZW5jb2RpbmcpIHtcblxuICBzd2l0Y2ggKGVuY29kaW5nLnR5cGUobmFtZSkpIHtcbiAgICBjYXNlIE86IHJldHVybiAnb3JkaW5hbCc7XG4gICAgY2FzZSBUOlxuICAgICAgdmFyIGZuID0gZW5jb2RpbmcuZm4obmFtZSk7XG4gICAgICByZXR1cm4gKGZuICYmIHRpbWUuc2NhbGUudHlwZShmbikpIHx8ICd0aW1lJztcbiAgICBjYXNlIFE6XG4gICAgICBpZiAoZW5jb2RpbmcuYmluKG5hbWUpKSB7XG4gICAgICAgIHJldHVybiAnb3JkaW5hbCc7XG4gICAgICB9XG4gICAgICByZXR1cm4gZW5jb2Rpbmcuc2NhbGUobmFtZSkudHlwZTtcbiAgfVxufTtcblxuZnVuY3Rpb24gc2NhbGVfZG9tYWluKG5hbWUsIGVuY29kaW5nLCBvcHQpIHtcbiAgaWYgKGVuY29kaW5nLmlzVHlwZShuYW1lLCBUKSkge1xuICAgIHZhciByYW5nZSA9IHRpbWUuc2NhbGUuZG9tYWluKGVuY29kaW5nLmZuKG5hbWUpKTtcbiAgICBpZihyYW5nZSkgcmV0dXJuIHJhbmdlO1xuICB9XG5cbiAgaWYgKGVuY29kaW5nLmJpbihuYW1lKSkge1xuICAgIC8vIFRPRE86IGFkZCBpbmNsdWRlRW1wdHlDb25maWcgaGVyZVxuICAgIGlmIChvcHQuc3RhdHMpIHtcbiAgICAgIHZhciBiaW5zID0gdXRpbC5nZXRiaW5zKG9wdC5zdGF0c1tlbmNvZGluZy5maWVsZE5hbWUobmFtZSldKTtcbiAgICAgIHZhciBkb21haW4gPSB1dGlsLnJhbmdlKGJpbnMuc3RhcnQsIGJpbnMuc3RvcCwgYmlucy5zdGVwKTtcbiAgICAgIHJldHVybiBuYW1lID09PSBZID8gZG9tYWluLnJldmVyc2UoKSA6IGRvbWFpbjtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmFtZSA9PSBvcHQuc3RhY2sgP1xuICAgIHtcbiAgICAgIGRhdGE6IFNUQUNLRUQsXG4gICAgICBmaWVsZDogJ2RhdGEuJyArIChvcHQuZmFjZXQgPyAnbWF4XycgOiAnJykgKyAnc3VtXycgKyBlbmNvZGluZy5maWVsZChuYW1lLCB0cnVlKVxuICAgIH0gOlxuICAgIHtkYXRhOiBUQUJMRSwgZmllbGQ6IGVuY29kaW5nLmZpZWxkKG5hbWUpfTtcbn1cblxuZnVuY3Rpb24gc2NhbGVfcmFuZ2UocywgZW5jb2RpbmcsIG9wdCkge1xuICB2YXIgc3BlYyA9IGVuY29kaW5nLnNjYWxlKHMubmFtZSk7XG4gIHN3aXRjaCAocy5uYW1lKSB7XG4gICAgY2FzZSBYOlxuICAgICAgaWYgKHMudHlwZSA9PT0gJ29yZGluYWwnKSB7XG4gICAgICAgIHMuYmFuZFdpZHRoID0gZW5jb2RpbmcuYmFuZFNpemUoWCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzLnJhbmdlID0gb3B0LmNlbGxXaWR0aCA/IFswLCBvcHQuY2VsbFdpZHRoXSA6ICd3aWR0aCc7XG4gICAgICAgIHMuemVybyA9IHNwZWMuemVybyB8fFxuICAgICAgICAgICggZW5jb2RpbmcuaXNUeXBlKHMubmFtZSxUKSAmJiBlbmNvZGluZy5mbihzLm5hbWUpID09PSAneWVhcicgPyBmYWxzZSA6IHRydWUgKTtcbiAgICAgICAgcy5yZXZlcnNlID0gc3BlYy5yZXZlcnNlO1xuICAgICAgfVxuICAgICAgcy5yb3VuZCA9IHRydWU7XG4gICAgICBpZiAocy50eXBlID09PSAndGltZScpIHtcbiAgICAgICAgcy5uaWNlID0gZW5jb2RpbmcuZm4ocy5uYW1lKTtcbiAgICAgIH1lbHNlIHtcbiAgICAgICAgcy5uaWNlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgWTpcbiAgICAgIGlmIChzLnR5cGUgPT09ICdvcmRpbmFsJykge1xuICAgICAgICBzLmJhbmRXaWR0aCA9IGVuY29kaW5nLmJhbmRTaXplKFkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcy5yYW5nZSA9IG9wdC5jZWxsSGVpZ2h0ID8gW29wdC5jZWxsSGVpZ2h0LCAwXSA6ICdoZWlnaHQnO1xuICAgICAgICBzLnplcm8gPSBzcGVjLnplcm8gfHxcbiAgICAgICAgICAoIGVuY29kaW5nLmlzVHlwZShzLm5hbWUsIFQpICYmIGVuY29kaW5nLmZuKHMubmFtZSkgPT09ICd5ZWFyJyA/IGZhbHNlIDogdHJ1ZSApO1xuICAgICAgICBzLnJldmVyc2UgPSBzcGVjLnJldmVyc2U7XG4gICAgICB9XG5cbiAgICAgIHMucm91bmQgPSB0cnVlO1xuXG4gICAgICBpZiAocy50eXBlID09PSAndGltZScpIHtcbiAgICAgICAgcy5uaWNlID0gZW5jb2RpbmcuZm4ocy5uYW1lKSB8fCBlbmNvZGluZy5jb25maWcoJ3RpbWVTY2FsZU5pY2UnKTtcbiAgICAgIH1lbHNlIHtcbiAgICAgICAgcy5uaWNlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgUk9XOiAvLyBzdXBwb3J0IG9ubHkgb3JkaW5hbFxuICAgICAgcy5iYW5kV2lkdGggPSBvcHQuY2VsbEhlaWdodCB8fCBlbmNvZGluZy5jb25maWcoJ2NlbGxIZWlnaHQnKTtcbiAgICAgIHMucm91bmQgPSB0cnVlO1xuICAgICAgcy5uaWNlID0gdHJ1ZTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgQ09MOiAvLyBzdXBwb3J0IG9ubHkgb3JkaW5hbFxuICAgICAgcy5iYW5kV2lkdGggPSBvcHQuY2VsbFdpZHRoIHx8IGVuY29kaW5nLmNvbmZpZygnY2VsbFdpZHRoJyk7XG4gICAgICBzLnJvdW5kID0gdHJ1ZTtcbiAgICAgIHMubmljZSA9IHRydWU7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFNJWkU6XG4gICAgICBpZiAoZW5jb2RpbmcuaXMoJ2JhcicpKSB7XG4gICAgICAgIC8vIEZJWE1FIHRoaXMgaXMgZGVmaW5pdGVseSBpbmNvcnJlY3RcbiAgICAgICAgLy8gYnV0IGxldCdzIGZpeCBpdCBsYXRlciBzaW5jZSBiYXIgc2l6ZSBpcyBhIGJhZCBlbmNvZGluZyBhbnl3YXlcbiAgICAgICAgcy5yYW5nZSA9IFszLCBNYXRoLm1heChlbmNvZGluZy5iYW5kU2l6ZShYKSwgZW5jb2RpbmcuYmFuZFNpemUoWSkpXTtcbiAgICAgIH0gZWxzZSBpZiAoZW5jb2RpbmcuaXMoVEVYVCkpIHtcbiAgICAgICAgcy5yYW5nZSA9IFs4LCA0MF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzLnJhbmdlID0gWzEwLCAxMDAwXTtcbiAgICAgIH1cbiAgICAgIHMucm91bmQgPSB0cnVlO1xuICAgICAgcy56ZXJvID0gZmFsc2U7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFNIQVBFOlxuICAgICAgcy5yYW5nZSA9ICdzaGFwZXMnO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBDT0xPUjpcbiAgICAgIHZhciByYW5nZSA9IGVuY29kaW5nLnNjYWxlKENPTE9SKS5yYW5nZTtcbiAgICAgIGlmIChyYW5nZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmIChzLnR5cGUgPT09ICdvcmRpbmFsJykge1xuICAgICAgICAgIHJhbmdlID0gJ2NhdGVnb3J5MTAnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJhbmdlID0gWycjZGRmJywgJ3N0ZWVsYmx1ZSddO1xuICAgICAgICAgIHMuemVybyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzLnJhbmdlID0gcmFuZ2U7XG4gICAgICBicmVhaztcbiAgICBjYXNlIEFMUEhBOlxuICAgICAgcy5yYW5nZSA9IFswLjIsIDEuMF07XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nIG5hbWU6ICcrIHMubmFtZSk7XG4gIH1cblxuICBzd2l0Y2ggKHMubmFtZSkge1xuICAgIGNhc2UgUk9XOlxuICAgIGNhc2UgQ09MOlxuICAgICAgcy5wYWRkaW5nID0gZW5jb2RpbmcuY29uZmlnKCdjZWxsUGFkZGluZycpO1xuICAgICAgcy5vdXRlclBhZGRpbmcgPSAwO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBYOlxuICAgIGNhc2UgWTpcbiAgICAgIGlmIChzLnR5cGUgPT09ICdvcmRpbmFsJykgeyAvLyYmICFzLmJhbmRXaWR0aFxuICAgICAgICBzLnBvaW50cyA9IHRydWU7XG4gICAgICAgIHMucGFkZGluZyA9IGVuY29kaW5nLmJhbmQocy5uYW1lKS5wYWRkaW5nO1xuICAgICAgfVxuICB9XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIGdsb2JhbHMgPSByZXF1aXJlKCcuLi9nbG9iYWxzJyksXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyksXG4gIG1hcmtzID0gcmVxdWlyZSgnLi9tYXJrcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YWNraW5nO1xuXG5mdW5jdGlvbiBzdGFja2luZyhzcGVjLCBlbmNvZGluZywgbWRlZiwgZmFjZXRzKSB7XG4gIGlmICghbWFya3NbZW5jb2RpbmcubWFya3R5cGUoKV0uc3RhY2spIHJldHVybiBmYWxzZTtcblxuICAvLyBUT0RPOiBhZGQgfHwgZW5jb2RpbmcuaGFzKExPRCkgaGVyZSBvbmNlIExPRCBpcyBpbXBsZW1lbnRlZFxuICBpZiAoIWVuY29kaW5nLmhhcyhDT0xPUikpIHJldHVybiBmYWxzZTtcblxuICB2YXIgZGltPW51bGwsIHZhbD1udWxsLCBpZHggPW51bGwsXG4gICAgaXNYTWVhc3VyZSA9IGVuY29kaW5nLmlzTWVhc3VyZShYKSxcbiAgICBpc1lNZWFzdXJlID0gZW5jb2RpbmcuaXNNZWFzdXJlKFkpO1xuXG4gIGlmIChpc1hNZWFzdXJlICYmICFpc1lNZWFzdXJlKSB7XG4gICAgZGltID0gWTtcbiAgICB2YWwgPSBYO1xuICAgIGlkeCA9IDA7XG4gIH0gZWxzZSBpZiAoaXNZTWVhc3VyZSAmJiAhaXNYTWVhc3VyZSkge1xuICAgIGRpbSA9IFg7XG4gICAgdmFsID0gWTtcbiAgICBpZHggPSAxO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsOyAvLyBubyBzdGFjayBlbmNvZGluZ1xuICB9XG5cbiAgLy8gYWRkIHRyYW5zZm9ybSB0byBjb21wdXRlIHN1bXMgZm9yIHNjYWxlXG4gIHZhciBzdGFja2VkID0ge1xuICAgIG5hbWU6IFNUQUNLRUQsXG4gICAgc291cmNlOiBUQUJMRSxcbiAgICB0cmFuc2Zvcm06IFt7XG4gICAgICB0eXBlOiAnYWdncmVnYXRlJyxcbiAgICAgIGdyb3VwYnk6IFtlbmNvZGluZy5maWVsZChkaW0pXS5jb25jYXQoZmFjZXRzKSwgLy8gZGltIGFuZCBvdGhlciBmYWNldHNcbiAgICAgIGZpZWxkczogW3tvcDogJ3N1bScsIGZpZWxkOiBlbmNvZGluZy5maWVsZCh2YWwpfV0gLy8gVE9ETyBjaGVjayBpZiBmaWVsZCB3aXRoIGFnZ3IgaXMgY29ycmVjdD9cbiAgICB9XVxuICB9O1xuXG4gIGlmIChmYWNldHMgJiYgZmFjZXRzLmxlbmd0aCA+IDApIHtcbiAgICBzdGFja2VkLnRyYW5zZm9ybS5wdXNoKHsgLy9jYWxjdWxhdGUgbWF4IGZvciBlYWNoIGZhY2V0XG4gICAgICB0eXBlOiAnYWdncmVnYXRlJyxcbiAgICAgIGdyb3VwYnk6IGZhY2V0cyxcbiAgICAgIGZpZWxkczogW3tvcDogJ21heCcsIGZpZWxkOiAnZGF0YS5zdW1fJyArIGVuY29kaW5nLmZpZWxkKHZhbCwgdHJ1ZSl9XVxuICAgIH0pO1xuICB9XG5cbiAgc3BlYy5kYXRhLnB1c2goc3RhY2tlZCk7XG5cbiAgLy8gYWRkIHN0YWNrIHRyYW5zZm9ybSB0byBtYXJrXG4gIG1kZWYuZnJvbS50cmFuc2Zvcm0gPSBbe1xuICAgIHR5cGU6ICdzdGFjaycsXG4gICAgcG9pbnQ6IGVuY29kaW5nLmZpZWxkKGRpbSksXG4gICAgaGVpZ2h0OiBlbmNvZGluZy5maWVsZCh2YWwpLFxuICAgIG91dHB1dDoge3kxOiB2YWwsIHkwOiB2YWwgKyAnMid9XG4gIH1dO1xuXG4gIC8vIFRPRE86IFRoaXMgaXMgc3VwZXIgaGFjay1pc2ggLS0gY29uc29saWRhdGUgaW50byBtb2R1bGFyIG1hcmsgcHJvcGVydGllcz9cbiAgbWRlZi5wcm9wZXJ0aWVzLnVwZGF0ZVt2YWxdID0gbWRlZi5wcm9wZXJ0aWVzLmVudGVyW3ZhbF0gPSB7c2NhbGU6IHZhbCwgZmllbGQ6IHZhbH07XG4gIG1kZWYucHJvcGVydGllcy51cGRhdGVbdmFsICsgJzInXSA9IG1kZWYucHJvcGVydGllcy5lbnRlclt2YWwgKyAnMiddID0ge3NjYWxlOiB2YWwsIGZpZWxkOiB2YWwgKyAnMid9O1xuXG4gIHJldHVybiB2YWw7IC8vcmV0dXJuIHN0YWNrIGVuY29kaW5nXG59XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpO1xuXG52YXIgZ3JvdXBkZWYgPSByZXF1aXJlKCcuL2dyb3VwJykuZGVmO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHN1YmZhY2V0aW5nO1xuXG5mdW5jdGlvbiBzdWJmYWNldGluZyhncm91cCwgbWRlZiwgZGV0YWlscywgc3RhY2ssIGVuY29kaW5nKSB7XG4gIHZhciBtID0gZ3JvdXAubWFya3MsXG4gICAgZyA9IGdyb3VwZGVmKCdzdWJmYWNldCcsIHttYXJrczogbX0pO1xuXG4gIGdyb3VwLm1hcmtzID0gW2ddO1xuICBnLmZyb20gPSBtZGVmLmZyb207XG4gIGRlbGV0ZSBtZGVmLmZyb207XG5cbiAgLy9UT0RPIHRlc3QgTE9EIC0tIHdlIHNob3VsZCBzdXBwb3J0IHN0YWNrIC8gbGluZSB3aXRob3V0IGNvbG9yIChMT0QpIGZpZWxkXG4gIHZhciB0cmFucyA9IChnLmZyb20udHJhbnNmb3JtIHx8IChnLmZyb20udHJhbnNmb3JtID0gW10pKTtcbiAgdHJhbnMudW5zaGlmdCh7dHlwZTogJ2ZhY2V0Jywga2V5czogZGV0YWlsc30pO1xuXG4gIGlmIChzdGFjayAmJiBlbmNvZGluZy5oYXMoQ09MT1IpKSB7XG4gICAgdHJhbnMudW5zaGlmdCh7dHlwZTogJ3NvcnQnLCBieTogZW5jb2RpbmcuZmllbGQoQ09MT1IpfSk7XG4gIH1cbn1cbiIsInZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpO1xuXG52YXIgZ3JvdXBkZWYgPSByZXF1aXJlKCcuL2dyb3VwJykuZGVmLFxuICB2bGRhdGEgPSByZXF1aXJlKCcuLi9kYXRhJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gdGVtcGxhdGU7XG5cbmZ1bmN0aW9uIHRlbXBsYXRlKGVuY29kaW5nLCBsYXlvdXQsIHN0YXRzKSB7IC8vaGFjayB1c2Ugc3RhdHNcblxuICB2YXIgZGF0YSA9IHtuYW1lOiBUQUJMRSwgZm9ybWF0OiB7dHlwZTogZW5jb2RpbmcuY29uZmlnKCdkYXRhRm9ybWF0VHlwZScpfX0sXG4gICAgZGF0YVVybCA9IHZsZGF0YS5nZXRVcmwoZW5jb2RpbmcsIHN0YXRzKTtcbiAgaWYgKGRhdGFVcmwpIGRhdGEudXJsID0gZGF0YVVybDtcblxuICB2YXIgcHJlYWdncmVnYXRlZERhdGEgPSBlbmNvZGluZy5jb25maWcoJ3VzZVZlZ2FTZXJ2ZXInKTtcblxuICBlbmNvZGluZy5mb3JFYWNoKGZ1bmN0aW9uKGVuY1R5cGUsIGZpZWxkKSB7XG4gICAgdmFyIG5hbWU7XG4gICAgaWYgKGZpZWxkLnR5cGUgPT0gVCkge1xuICAgICAgZGF0YS5mb3JtYXQucGFyc2UgPSBkYXRhLmZvcm1hdC5wYXJzZSB8fCB7fTtcbiAgICAgIGRhdGEuZm9ybWF0LnBhcnNlW2ZpZWxkLm5hbWVdID0gJ2RhdGUnO1xuICAgIH1lbHNlIGlmIChmaWVsZC50eXBlID09IFEpIHtcbiAgICAgIGRhdGEuZm9ybWF0LnBhcnNlID0gZGF0YS5mb3JtYXQucGFyc2UgfHwge307XG4gICAgICBpZiAoZmllbGQuYWdnciA9PT0gJ2NvdW50Jykge1xuICAgICAgICBuYW1lID0gJ2NvdW50JztcbiAgICAgIH0gZWxzZSBpZiAocHJlYWdncmVnYXRlZERhdGEgJiYgZmllbGQuYmluKSB7XG4gICAgICAgIG5hbWUgPSAnYmluXycgKyBmaWVsZC5uYW1lO1xuICAgICAgfSBlbHNlIGlmIChwcmVhZ2dyZWdhdGVkRGF0YSAmJiBmaWVsZC5hZ2dyKSB7XG4gICAgICAgIG5hbWUgPSBmaWVsZC5hZ2dyICsgJ18nICsgZmllbGQubmFtZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5hbWUgPSBmaWVsZC5uYW1lO1xuICAgICAgfVxuICAgICAgZGF0YS5mb3JtYXQucGFyc2VbbmFtZV0gPSAnbnVtYmVyJztcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgd2lkdGg6IGxheW91dC53aWR0aCxcbiAgICBoZWlnaHQ6IGxheW91dC5oZWlnaHQsXG4gICAgcGFkZGluZzogJ2F1dG8nLFxuICAgIGRhdGE6IFtkYXRhXSxcbiAgICBtYXJrczogW2dyb3VwZGVmKCdjZWxsJywge1xuICAgICAgd2lkdGg6IGxheW91dC5jZWxsV2lkdGggPyB7dmFsdWU6IGxheW91dC5jZWxsV2lkdGh9IDogdW5kZWZpbmVkLFxuICAgICAgaGVpZ2h0OiBsYXlvdXQuY2VsbEhlaWdodCA/IHt2YWx1ZTogbGF5b3V0LmNlbGxIZWlnaHR9IDogdW5kZWZpbmVkXG4gICAgfSldXG4gIH07XG59XG4iLCJ2YXIgZ2xvYmFscyA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB0aW1lO1xuXG5mdW5jdGlvbiB0aW1lKHNwZWMsIGVuY29kaW5nLCBvcHQpIHtcbiAgdmFyIHRpbWVGaWVsZHMgPSB7fSwgdGltZUZuID0ge307XG5cbiAgLy8gZmluZCB1bmlxdWUgZm9ybXVsYSB0cmFuc2Zvcm1hdGlvbiBhbmQgYmluIGZ1bmN0aW9uXG4gIGVuY29kaW5nLmZvckVhY2goZnVuY3Rpb24oZW5jVHlwZSwgZmllbGQpIHtcbiAgICBpZiAoZmllbGQudHlwZSA9PT0gVCAmJiBmaWVsZC5mbikge1xuICAgICAgdGltZUZpZWxkc1tlbmNvZGluZy5maWVsZChlbmNUeXBlKV0gPSB7XG4gICAgICAgIGZpZWxkOiBmaWVsZCxcbiAgICAgICAgZW5jVHlwZTogZW5jVHlwZVxuICAgICAgfTtcbiAgICAgIHRpbWVGbltmaWVsZC5mbl0gPSB0cnVlO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gYWRkIGZvcm11bGEgdHJhbnNmb3JtXG4gIHZhciBkYXRhID0gc3BlYy5kYXRhWzBdLFxuICAgIHRyYW5zZm9ybSA9IGRhdGEudHJhbnNmb3JtID0gZGF0YS50cmFuc2Zvcm0gfHwgW107XG5cbiAgZm9yICh2YXIgZiBpbiB0aW1lRmllbGRzKSB7XG4gICAgdmFyIHRmID0gdGltZUZpZWxkc1tmXTtcbiAgICB0aW1lLnRyYW5zZm9ybSh0cmFuc2Zvcm0sIGVuY29kaW5nLCB0Zi5lbmNUeXBlLCB0Zi5maWVsZCk7XG4gIH1cblxuICAvLyBhZGQgc2NhbGVzXG4gIHZhciBzY2FsZXMgPSBzcGVjLnNjYWxlcyA9IHNwZWMuc2NhbGVzIHx8IFtdO1xuICBmb3IgKHZhciBmbiBpbiB0aW1lRm4pIHtcbiAgICB0aW1lLnNjYWxlKHNjYWxlcywgZm4sIGVuY29kaW5nKTtcbiAgfVxuICByZXR1cm4gc3BlYztcbn1cblxudGltZS5jYXJkaW5hbGl0eSA9IGZ1bmN0aW9uKGVuY29kaW5nLCBlbmNUeXBlLCBzdGF0cykge1xuICB2YXIgZm4gPSBlbmNvZGluZy5mbihlbmNUeXBlKTtcbiAgc3dpdGNoIChmbikge1xuICAgIGNhc2UgJ3NlY29uZCc6IHJldHVybiA2MDtcbiAgICBjYXNlICdtaW51dGUnOiByZXR1cm4gNjA7XG4gICAgY2FzZSAnaG91cic6IHJldHVybiAyNDtcbiAgICBjYXNlICdkYXlvZndlZWsnOiByZXR1cm4gNztcbiAgICBjYXNlICdkYXRlJzogcmV0dXJuIDMxO1xuICAgIGNhc2UgJ21vbnRoJzogcmV0dXJuIDEyO1xuICAgIC8vIGNhc2UgJ3llYXInOiAgLS0gbmVlZCByZWFsIGNhcmRpbmFsaXR5XG4gIH1cblxuICB2YXIgZmllbGQgPSBlbmNvZGluZy5maWVsZChlbmNUeXBlLCAvKm5vZGF0YSovIHRydWUpOyAvLyBmbl9maWVsZG5hbWVcbiAgcmV0dXJuIHN0YXRzW2ZpZWxkXS5jYXJkaW5hbGl0eTtcbn07XG5cbi8qKlxuICogQHJldHVybiB7U3RyaW5nfSBkYXRlIGJpbm5pbmcgZm9ybXVsYSBvZiB0aGUgZ2l2ZW4gZmllbGRcbiAqL1xudGltZS5mb3JtdWxhID0gZnVuY3Rpb24oZmllbGQpIHtcbiAgdmFyIGRhdGUgPSAnbmV3IERhdGUoZC5kYXRhLicrIGZpZWxkLm5hbWUgKyAnKSc7XG4gIHN3aXRjaCAoZmllbGQuZm4pIHtcbiAgICBjYXNlICdzZWNvbmQnOiByZXR1cm4gZGF0ZSArICcuZ2V0VVRDU2Vjb25kcygpJztcbiAgICBjYXNlICdtaW51dGUnOiByZXR1cm4gZGF0ZSArICcuZ2V0VVRDTWludXRlcygpJztcbiAgICBjYXNlICdob3VyJzogcmV0dXJuIGRhdGUgKyAnLmdldFVUQ0hvdXJzKCknO1xuICAgIGNhc2UgJ2RheW9md2Vlayc6IHJldHVybiBkYXRlICsgJy5nZXRVVENEYXkoKSc7XG4gICAgY2FzZSAnZGF0ZSc6IHJldHVybiBkYXRlICsgJy5nZXRVVENEYXRlKCknO1xuICAgIGNhc2UgJ21vbnRoJzogcmV0dXJuIGRhdGUgKyAnLmdldFVUQ01vbnRoKCknO1xuICAgIGNhc2UgJ3llYXInOiByZXR1cm4gZGF0ZSArICcuZ2V0VVRDRnVsbFllYXIoKSc7XG4gIH1cbiAgLy8gVE9ETyBhZGQgY29udGludW91cyBiaW5uaW5nXG4gIGNvbnNvbGUuZXJyb3IoJ25vIGZ1bmN0aW9uIHNwZWNpZmllZCBmb3IgZGF0ZScpO1xufTtcblxuLyoqIGFkZCBmb3JtdWxhIHRyYW5zZm9ybXMgdG8gZGF0YSAqL1xudGltZS50cmFuc2Zvcm0gPSBmdW5jdGlvbih0cmFuc2Zvcm0sIGVuY29kaW5nLCBlbmNUeXBlLCBmaWVsZCkge1xuICB0cmFuc2Zvcm0ucHVzaCh7XG4gICAgdHlwZTogJ2Zvcm11bGEnLFxuICAgIGZpZWxkOiBlbmNvZGluZy5maWVsZChlbmNUeXBlKSxcbiAgICBleHByOiB0aW1lLmZvcm11bGEoZmllbGQpXG4gIH0pO1xufTtcblxuLyoqIGFwcGVuZCBjdXN0b20gdGltZSBzY2FsZXMgZm9yIGF4aXMgbGFiZWwgKi9cbnRpbWUuc2NhbGUgPSBmdW5jdGlvbihzY2FsZXMsIGZuLCBlbmNvZGluZykge1xuICB2YXIgbGFiZWxMZW5ndGggPSBlbmNvZGluZy5jb25maWcoJ3RpbWVTY2FsZUxhYmVsTGVuZ3RoJyk7XG4gIC8vIFRPRE8gYWRkIG9wdGlvbiBmb3Igc2hvcnRlciBzY2FsZSAvIGN1c3RvbSByYW5nZVxuICBzd2l0Y2ggKGZuKSB7XG4gICAgY2FzZSAnZGF5b2Z3ZWVrJzpcbiAgICAgIHNjYWxlcy5wdXNoKHtcbiAgICAgICAgbmFtZTogJ3RpbWUtJytmbixcbiAgICAgICAgdHlwZTogJ29yZGluYWwnLFxuICAgICAgICBkb21haW46IHV0aWwucmFuZ2UoMCwgNyksXG4gICAgICAgIHJhbmdlOiBbJ01vbmRheScsICdUdWVzZGF5JywgJ1dlZG5lc2RheScsICdUaHVyc2RheScsICdGcmlkYXknLCAnU2F0dXJkYXknLCAnU3VuZGF5J10ubWFwKFxuICAgICAgICAgIGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMuc3Vic3RyKDAsIGxhYmVsTGVuZ3RoKTt9XG4gICAgICAgIClcbiAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbW9udGgnOlxuICAgICAgc2NhbGVzLnB1c2goe1xuICAgICAgICBuYW1lOiAndGltZS0nK2ZuLFxuICAgICAgICB0eXBlOiAnb3JkaW5hbCcsXG4gICAgICAgIGRvbWFpbjogdXRpbC5yYW5nZSgwLCAxMiksXG4gICAgICAgIHJhbmdlOiBbJ0phbnVhcnknLCAnRmVicnVhcnknLCAnTWFyY2gnLCAnQXByaWwnLCAnTWF5JywgJ0p1bmUnLCAnSnVseScsICdBdWd1c3QnLCAnU2VwdGVtYmVyJywgJ09jdG9iZXInLCAnTm92ZW1iZXInLCAnRGVjZW1iZXInXS5tYXAoXG4gICAgICAgICAgICBmdW5jdGlvbihzKSB7IHJldHVybiBzLnN1YnN0cigwLCBsYWJlbExlbmd0aCk7fVxuICAgICAgICAgIClcbiAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gIH1cbn07XG5cbnRpbWUuaXNPcmRpbmFsRm4gPSBmdW5jdGlvbihmbikge1xuICBzd2l0Y2ggKGZuKSB7XG4gICAgY2FzZSAnc2Vjb25kJzpcbiAgICBjYXNlICdtaW51dGUnOlxuICAgIGNhc2UgJ2hvdXInOlxuICAgIGNhc2UgJ2RheW9md2Vlayc6XG4gICAgY2FzZSAnZGF0ZSc6XG4gICAgY2FzZSAnbW9udGgnOlxuICAgICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxudGltZS5zY2FsZS50eXBlID0gZnVuY3Rpb24oZm4pIHtcbiAgcmV0dXJuIHRpbWUuaXNPcmRpbmFsRm4oZm4pID8gJ29yZGluYWwnIDogJ2xpbmVhcic7XG59O1xuXG50aW1lLnNjYWxlLmRvbWFpbiA9IGZ1bmN0aW9uKGZuKSB7XG4gIHN3aXRjaCAoZm4pIHtcbiAgICBjYXNlICdzZWNvbmQnOlxuICAgIGNhc2UgJ21pbnV0ZSc6IHJldHVybiB1dGlsLnJhbmdlKDAsIDYwKTtcbiAgICBjYXNlICdob3VyJzogcmV0dXJuIHV0aWwucmFuZ2UoMCwgMjQpO1xuICAgIGNhc2UgJ2RheW9md2Vlayc6IHJldHVybiB1dGlsLnJhbmdlKDAsIDcpO1xuICAgIGNhc2UgJ2RhdGUnOiByZXR1cm4gdXRpbC5yYW5nZSgwLCAzMik7XG4gICAgY2FzZSAnbW9udGgnOiByZXR1cm4gdXRpbC5yYW5nZSgwLCAxMik7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59O1xuXG4vKiogd2hldGhlciBhIHBhcnRpY3VsYXIgdGltZSBmdW5jdGlvbiBoYXMgY3VzdG9tIHNjYWxlIGZvciBsYWJlbHMgaW1wbGVtZW50ZWQgaW4gdGltZS5zY2FsZSAqL1xudGltZS5oYXNTY2FsZSA9IGZ1bmN0aW9uKGZuKSB7XG4gIHN3aXRjaCAoZm4pIHtcbiAgICBjYXNlICdkYXlvZndlZWsnOlxuICAgIGNhc2UgJ21vbnRoJzpcbiAgICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cblxuIiwidmFyIGdsb2JhbHMgPSByZXF1aXJlKCcuL2dsb2JhbHMnKTtcblxudmFyIGNvbnN0cyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbmNvbnN0cy5lbmNvZGluZ1R5cGVzID0gW1gsIFksIFJPVywgQ09MLCBTSVpFLCBTSEFQRSwgQ09MT1IsIEFMUEhBLCBURVhUXTtcblxuY29uc3RzLmRhdGFUeXBlcyA9IHsnTyc6IE8sICdRJzogUSwgJ1QnOiBUfTtcblxuY29uc3RzLmRhdGFUeXBlTmFtZXMgPSBbJ08nLCAnUScsICdUJ10ucmVkdWNlKGZ1bmN0aW9uKHIsIHgpIHtcbiAgcltjb25zdHMuZGF0YVR5cGVzW3hdXSA9IHg7IHJldHVybiByO1xufSx7fSk7XG5cbmNvbnN0cy5ERUZBVUxUUyA9IHtcbiAgLy8gc2luZ2xlIHBsb3RcbiAgc2luZ2xlSGVpZ2h0OiAyMDAsIC8vIHdpbGwgYmUgb3ZlcndyaXR0ZW4gYnkgYmFuZFdpZHRoICogKGNhcmRpbmFsaXR5ICsgcGFkZGluZylcbiAgc2luZ2xlV2lkdGg6IDIwMCwgLy8gd2lsbCBiZSBvdmVyd3JpdHRlbiBieSBiYW5kV2lkdGggKiAoY2FyZGluYWxpdHkgKyBwYWRkaW5nKVxuICBzaW5nbGVCYW5kU2l6ZTogMjEsXG5cbiAgLy9zbWFsbCBtdWx0aXBsZXNcbiAgbXVsdGlwbGVCYW5kU2l6ZTogMTMsXG5cbiAgY2VsbFBhZGRpbmc6IDAuMSxcbiAgY2VsbEJhY2tncm91bmRDb2xvcjogJyNmZGZkZmQnLFxuICB0ZXh0Q2VsbFdpZHRoOiA5MCxcblxuICAvLyBtYXJrc1xuICBzdHJva2VXaWR0aDogMixcblxuICAvLyBzY2FsZXNcbiAgdGltZVNjYWxlTGFiZWxMZW5ndGg6IDNcbn07XG4iLCIvLyBUT0RPIHJlbmFtZSBnZXREYXRhVXJsIHRvIHZsLmRhdGEuZ2V0VXJsKCkgP1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG52YXIgdmxkYXRhID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxudmxkYXRhLmdldFVybCA9IGZ1bmN0aW9uIGdldERhdGFVcmwoZW5jb2RpbmcsIHN0YXRzKSB7XG4gIGlmICghZW5jb2RpbmcuY29uZmlnKCd1c2VWZWdhU2VydmVyJykpIHtcbiAgICAvLyBkb24ndCB1c2UgdmVnYSBzZXJ2ZXJcbiAgICByZXR1cm4gZW5jb2RpbmcuY29uZmlnKCdkYXRhVXJsJyk7XG4gIH1cblxuICBpZiAoZW5jb2RpbmcubGVuZ3RoKCkgPT09IDApIHtcbiAgICAvLyBubyBmaWVsZHNcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgZmllbGRzID0gW107XG4gIGVuY29kaW5nLmZvckVhY2goZnVuY3Rpb24oZW5jVHlwZSwgZmllbGQpIHtcbiAgICB2YXIgb2JqID0ge1xuICAgICAgbmFtZTogZW5jb2RpbmcuZmllbGQoZW5jVHlwZSwgdHJ1ZSksXG4gICAgICBmaWVsZDogZmllbGQubmFtZVxuICAgIH07XG4gICAgaWYgKGZpZWxkLmFnZ3IpIHtcbiAgICAgIG9iai5hZ2dyID0gZmllbGQuYWdncjtcbiAgICB9XG4gICAgaWYgKGZpZWxkLmJpbikge1xuICAgICAgb2JqLmJpblNpemUgPSB1dGlsLmdldGJpbnMoc3RhdHNbZmllbGQubmFtZV0pLnN0ZXA7XG4gICAgfVxuICAgIGZpZWxkcy5wdXNoKG9iaik7XG4gIH0pO1xuXG4gIHZhciBxdWVyeSA9IHtcbiAgICB0YWJsZTogZW5jb2RpbmcuY29uZmlnKCd2ZWdhU2VydmVyVGFibGUnKSxcbiAgICBmaWVsZHM6IGZpZWxkc1xuICB9O1xuXG4gIHJldHVybiBlbmNvZGluZy5jb25maWcoJ3ZlZ2FTZXJ2ZXJVcmwnKSArICcvcXVlcnkvP3E9JyArIEpTT04uc3RyaW5naWZ5KHF1ZXJ5KTtcbn07XG5cbi8qKlxuICogQHBhcmFtICB7T2JqZWN0fSBkYXRhIGRhdGEgaW4gSlNPTi9qYXZhc2NyaXB0IG9iamVjdCBmb3JtYXRcbiAqIEByZXR1cm4gQXJyYXkgb2Yge25hbWU6IF9fbmFtZV9fLCB0eXBlOiBcIm51bWJlcnx0ZXh0fHRpbWV8bG9jYXRpb25cIn1cbiAqL1xudmxkYXRhLmdldFNjaGVtYSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgdmFyIHNjaGVtYSA9IFtdLFxuICAgIGZpZWxkcyA9IHV0aWwua2V5cyhkYXRhWzBdKTtcblxuICBmaWVsZHMuZm9yRWFjaChmdW5jdGlvbihrKSB7XG4gICAgLy8gZmluZCBub24tbnVsbCBkYXRhXG4gICAgdmFyIGkgPSAwLCBkYXR1bSA9IGRhdGFbaV1ba107XG4gICAgd2hpbGUgKGRhdHVtID09PSAnJyB8fCBkYXR1bSA9PT0gbnVsbCB8fCBkYXR1bSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBkYXR1bSA9IGRhdGFbKytpXVtrXTtcbiAgICB9XG5cbiAgICAvL1RPRE8oa2FuaXR3KTogYmV0dGVyIHR5cGUgaW5mZXJlbmNlIGhlcmVcbiAgICB2YXIgdHlwZSA9ICh0eXBlb2YgZGF0dW0gPT09ICdudW1iZXInKSA/ICdRJzpcbiAgICAgIGlzTmFOKERhdGUucGFyc2UoZGF0dW0pKSA/ICdPJyA6ICdUJztcblxuICAgIHNjaGVtYS5wdXNoKHtuYW1lOiBrLCB0eXBlOiB0eXBlfSk7XG4gIH0pO1xuXG4gIHJldHVybiBzY2hlbWE7XG59O1xuXG52bGRhdGEuZ2V0U3RhdHMgPSBmdW5jdGlvbihkYXRhKSB7IC8vIGhhY2tcbiAgdmFyIHN0YXRzID0ge30sXG4gICAgZmllbGRzID0gdXRpbC5rZXlzKGRhdGFbMF0pO1xuXG4gIGZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uKGspIHtcbiAgICB2YXIgc3RhdCA9IHV0aWwubWlubWF4KGRhdGEsIGspO1xuICAgIHN0YXQuY2FyZGluYWxpdHkgPSB1dGlsLnVuaXEoZGF0YSwgayk7XG4gICAgc3RhdC5tYXhsZW5ndGggPSBkYXRhLnJlZHVjZShmdW5jdGlvbihtYXgscm93KSB7XG4gICAgICB2YXIgbGVuID0gcm93W2tdLnRvU3RyaW5nKCkubGVuZ3RoO1xuICAgICAgcmV0dXJuIGxlbiA+IG1heCA/IGxlbiA6IG1heDtcbiAgICB9LCAwKTtcbiAgICBzdGF0LmNvdW50ID0gZGF0YS5sZW5ndGg7XG4gICAgc3RhdHNba10gPSBzdGF0O1xuICB9KTtcbiAgcmV0dXJuIHN0YXRzO1xufTtcbiIsIi8vIHV0aWxpdHkgZm9yIGZpZWxkXG5cbnZhciBjb25zdHMgPSByZXF1aXJlKCcuL2NvbnN0cycpO1xuXG52YXIgZmllbGQgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5maWVsZC5zaG9ydGhhbmQgPSBmdW5jdGlvbihmKSB7XG4gIHJldHVybiAoZi5hZ2dyID8gZi5hZ2dyICsgJ18nIDogJycpICtcbiAgICAoZi5mbiA/IGYuZm4gKyAnXycgOiAnJykgK1xuICAgIChmLmJpbiA/ICdiaW5fJyA6ICcnKSArXG4gICAgKGYubmFtZSB8fCAnJykgKyAnLScgK1xuICAgIChjb25zdHMuZGF0YVR5cGVOYW1lc1tmLnR5cGVdIHx8IGYudHlwZSk7XG59O1xuXG5maWVsZC5zaG9ydGhhbmRzID0gZnVuY3Rpb24oZmllbGRzLCBkZWxpbSl7XG4gIGRlbGltID0gZGVsaW0gfHwgJywnO1xuICByZXR1cm4gZmllbGRzLm1hcChmaWVsZC5zaG9ydGhhbmQpLmpvaW4oZGVsaW0pO1xufTtcblxudmFyIHR5cGVPcmRlciA9IHtcbiAgTzogMCxcbiAgRzogMSxcbiAgVDogMixcbiAgUTogM1xufTtcblxuZmllbGQub3JkZXIgPSB7fTtcblxuZmllbGQub3JkZXIudHlwZVRoZW5OYW1lID0gZnVuY3Rpb24oZmllbGQpIHtcbiAgcmV0dXJuIHR5cGVPcmRlcltmaWVsZC50eXBlXSArICdfJyArIGZpZWxkLm5hbWU7XG59O1xuXG5maWVsZC5vcmRlci5vcmlnaW5hbCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gMDsgLy8gbm8gc3dhcCB3aWxsIG9jY3VyXG59O1xuXG5maWVsZC5vcmRlci5uYW1lID0gZnVuY3Rpb24oZmllbGQpIHtcbiAgcmV0dXJuIGZpZWxkLm5hbWU7XG59O1xuXG5maWVsZC5vcmRlci50eXBlVGhlbkNhcmRpbmFsaXR5ID0gZnVuY3Rpb24oZmllbGQsIHN0YXRzKXtcbiAgcmV0dXJuIHN0YXRzW2ZpZWxkLm5hbWVdLmNhcmRpbmFsaXR5O1xufTtcbiIsIi8vIGRlY2xhcmUgZ2xvYmFsIGNvbnN0YW50XG52YXIgZyA9IGdsb2JhbCB8fCB3aW5kb3c7XG5cbmcuVEFCTEUgPSAndGFibGUnO1xuZy5TVEFDS0VEID0gJ3N0YWNrZWQnO1xuZy5JTkRFWCA9ICdpbmRleCc7XG5cbmcuWCA9ICd4JztcbmcuWSA9ICd5JztcbmcuUk9XID0gJ3Jvdyc7XG5nLkNPTCA9ICdjb2wnO1xuZy5TSVpFID0gJ3NpemUnO1xuZy5TSEFQRSA9ICdzaGFwZSc7XG5nLkNPTE9SID0gJ2NvbG9yJztcbmcuQUxQSEEgPSAnYWxwaGEnO1xuZy5URVhUID0gJ3RleHQnO1xuXG5nLk8gPSAxO1xuZy5RID0gMjtcbmcuVCA9IDQ7XG5cbi8vVE9ETyByZWZhY3RvciB0aGlzIHRvIGJlIGNvbmZpZz9cbmcuTUFYX0JJTlMgPSAyMDtcbiIsIi8vIFBhY2thZ2Ugb2YgZGVmaW5pbmcgVmVnYWxpdGUgU3BlY2lmaWNhdGlvbidzIGpzb24gc2NoZW1hXG5cbnZhciBzY2hlbWEgPSBtb2R1bGUuZXhwb3J0cyA9IHt9LFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG5zY2hlbWEudXRpbCA9IHJlcXVpcmUoJy4vc2NoZW1hdXRpbCcpO1xuXG5zY2hlbWEubWFya3R5cGUgPSB7XG4gIHR5cGU6ICdzdHJpbmcnLFxuICBlbnVtOiBbJ3BvaW50JywgJ2JhcicsICdsaW5lJywgJ2FyZWEnLCAnY2lyY2xlJywgJ3NxdWFyZScsICd0ZXh0J11cbn07XG5cbnNjaGVtYS5hZ2dyID0ge1xuICB0eXBlOiAnc3RyaW5nJyxcbiAgZW51bTogWydhdmcnLCAnc3VtJywgJ21pbicsICdtYXgnLCAnY291bnQnXSxcbiAgc3VwcG9ydGVkRW51bXM6IHtcbiAgICBROiBbJ2F2ZycsICdzdW0nLCAnbWluJywgJ21heCcsICdjb3VudCddLFxuICAgIE86IFtdLFxuICAgIFQ6IFsnYXZnJywgJ21pbicsICdtYXgnXSxcbiAgICAnJzogWydjb3VudCddXG4gIH0sXG4gIHN1cHBvcnRlZFR5cGVzOiB7J1EnOiB0cnVlLCAnTyc6IHRydWUsICdUJzogdHJ1ZSwgJyc6IHRydWV9XG59O1xuXG5zY2hlbWEuYmFuZCA9IHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHByb3BlcnRpZXM6IHtcbiAgICBzaXplOiB7XG4gICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICBtaW5pbXVtOiAwXG4gICAgfSxcbiAgICBwYWRkaW5nOiB7XG4gICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICBtaW5pbXVtOiAwLFxuICAgICAgZGVmYXVsdDogMVxuICAgIH1cbiAgfVxufTtcblxuc2NoZW1hLnRpbWVmbnMgPSBbJ21vbnRoJywgJ3llYXInLCAnZGF5b2Z3ZWVrJywgJ2RhdGUnLCAnaG91cicsICdtaW51dGUnLCAnc2Vjb25kJ107XG5cbnNjaGVtYS5mbiA9IHtcbiAgdHlwZTogJ3N0cmluZycsXG4gIGVudW06IHNjaGVtYS50aW1lZm5zLFxuICBzdXBwb3J0ZWRUeXBlczogeydUJzogdHJ1ZX1cbn07XG5cbi8vVE9ETyhrYW5pdHcpOiBhZGQgb3RoZXIgdHlwZSBvZiBmdW5jdGlvbiBoZXJlXG5cbnNjaGVtYS5zY2FsZV90eXBlID0ge1xuICB0eXBlOiAnc3RyaW5nJyxcbiAgZW51bTogWydsaW5lYXInLCAnbG9nJywgJ3BvdycsICdzcXJ0JywgJ3F1YW50aWxlJ10sXG4gIGRlZmF1bHQ6ICdsaW5lYXInLFxuICBzdXBwb3J0ZWRUeXBlczogeydRJzogdHJ1ZX1cbn07XG5cbnNjaGVtYS5maWVsZCA9IHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHByb3BlcnRpZXM6IHtcbiAgICBuYW1lOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgIH1cbiAgfVxufTtcblxudmFyIGNsb25lID0gdXRpbC5kdXBsaWNhdGU7XG52YXIgbWVyZ2UgPSBzY2hlbWEudXRpbC5tZXJnZTtcblxudmFyIHR5cGljYWxGaWVsZCA9IG1lcmdlKGNsb25lKHNjaGVtYS5maWVsZCksIHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHByb3BlcnRpZXM6IHtcbiAgICB0eXBlOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGVudW06IFsnTycsICdRJywgJ1QnXVxuICAgIH0sXG4gICAgYmluOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIHN1cHBvcnRlZFR5cGVzOiB7J1EnOiB0cnVlfSAvLyBUT0RPOiBhZGQgJ08nIGFmdGVyIGZpbmlzaGluZyAjODFcbiAgICB9LFxuICAgIGFnZ3I6IHNjaGVtYS5hZ2dyLFxuICAgIGZuOiBzY2hlbWEuZm4sXG4gICAgc2NhbGU6IHtcbiAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgcHJvcGVydGllczoge1xuICAgICAgICB0eXBlOiBzY2hlbWEuc2NhbGVfdHlwZSxcbiAgICAgICAgcmV2ZXJzZTogeyB0eXBlOiAnYm9vbGVhbicsIGRlZmF1bHQ6IGZhbHNlIH0sXG4gICAgICAgIHplcm86IHtcbiAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdJbmNsdWRlIHplcm8nLFxuICAgICAgICAgIHN1cHBvcnRlZFR5cGVzOiB7J1EnOiB0cnVlfVxuICAgICAgICB9LFxuICAgICAgICBuaWNlOiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgZW51bTogWydzZWNvbmQnLCAnbWludXRlJywgJ2hvdXInLCAnZGF5JywgJ3dlZWsnLCAnbW9udGgnLCAneWVhciddLFxuICAgICAgICAgIHN1cHBvcnRlZFR5cGVzOiB7J1QnOiB0cnVlfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59KTtcblxudmFyIG9ubHlPcmRpbmFsRmllbGQgPSBtZXJnZShjbG9uZShzY2hlbWEuZmllbGQpLCB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgdHlwZToge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBlbnVtOiBbJ08nLCdRJ10gLy8gb3JkaW5hbC1vbmx5IGZpZWxkIHN1cHBvcnRzIFEgd2hlbiBiaW4gaXMgYXBwbGllZFxuICAgIH0sXG4gICAgYmluOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIHN1cHBvcnRlZFR5cGVzOiB7J1EnOiB0cnVlfSAvLyBUT0RPOiBhZGQgJ08nIGFmdGVyIGZpbmlzaGluZyAjODFcbiAgICB9LFxuICAgIGFnZ3I6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZW51bTogWydjb3VudCddLFxuICAgICAgc3VwcG9ydGVkVHlwZXM6IHsnTyc6IHRydWV9XG4gICAgfVxuICB9XG59KTtcblxudmFyIGF4aXNNaXhpbiA9IHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHByb3BlcnRpZXM6IHtcbiAgICBheGlzOiB7XG4gICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgZ3JpZDoge1xuICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0EgZmxhZyBpbmRpY2F0ZSBpZiBncmlkbGluZXMgc2hvdWxkIGJlIGNyZWF0ZWQgaW4gYWRkaXRpb24gdG8gdGlja3MuJ1xuICAgICAgICB9LFxuICAgICAgICB0aXRsZToge1xuICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQSB0aXRsZSBmb3IgdGhlIGF4aXMuJ1xuICAgICAgICB9LFxuICAgICAgICB0aXRsZU9mZnNldDoge1xuICAgICAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0EgdGl0bGUgb2Zmc2V0IHZhbHVlIGZvciB0aGUgYXhpcy4nXG4gICAgICAgIH0sXG4gICAgICAgIGZvcm1hdDoge1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIGZvcm1hdHRpbmcgcGF0dGVybiBmb3IgYXhpcyBsYWJlbHMuJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG52YXIgYmFuZE1peGluID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgcHJvcGVydGllczoge1xuICAgIGJhbmQ6IHNjaGVtYS5iYW5kXG4gIH1cbn07XG5cbnZhciBsZWdlbmRNaXhpbiA9IHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHByb3BlcnRpZXM6IHtcbiAgICBsZWdlbmQ6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICB9XG4gIH1cbn07XG5cbnZhciB0ZXh0TWl4aW4gPSB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgdGV4dDoge1xuICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIHRleHQ6IHtcbiAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBhbGlnbjoge1xuICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgZGVmYXVsdDogJ2xlZnQnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYmFzZWxpbmU6IHtcbiAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgIGRlZmF1bHQ6ICdtaWRkbGUnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbWFyZ2luOiB7XG4gICAgICAgICAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgICAgICAgICAgZGVmYXVsdDogNCxcbiAgICAgICAgICAgICAgbWluaW11bTogMFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZm9udDoge1xuICAgICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIHdlaWdodDoge1xuICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgZW51bTogWydub3JtYWwnLCAnYm9sZCddLFxuICAgICAgICAgICAgICBkZWZhdWx0OiAnbm9ybWFsJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNpemU6IHtcbiAgICAgICAgICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgICAgICAgICBkZWZhdWx0OiAxMCxcbiAgICAgICAgICAgICAgbWluaW11bTogMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZhbWlseToge1xuICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgZGVmYXVsdDogJ0hlbHZldGljYSBOZXVlJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICBkZWZhdWx0OiAnbm9ybWFsJyxcbiAgICAgICAgICAgICAgZW51bTogWydub3JtYWwnLCAnaXRhbGljJ11cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbnZhciBzaXplTWl4aW4gPSB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgdmFsdWU6IHtcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgIGRlZmF1bHQ6IDEwLFxuICAgICAgbWluaW11bTogMFxuICAgIH1cbiAgfVxufTtcblxudmFyIGNvbG9yTWl4aW4gPSB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgdmFsdWU6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogJ3N0ZWVsYmx1ZSdcbiAgICB9LFxuICAgIHNjYWxlOiB7XG4gICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgcmFuZ2U6IHtcbiAgICAgICAgICB0eXBlOiBbJ3N0cmluZycsICdhcnJheSddXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbnZhciBhbHBoYU1peGluID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgcHJvcGVydGllczoge1xuICAgIHZhbHVlOiB7XG4gICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgIGRlZmF1bHQ6IDEsXG4gICAgICBtaW5pbXVtOiAwLFxuICAgICAgbWF4aW11bTogMVxuICAgIH1cbiAgfVxufTtcblxudmFyIHNoYXBlTWl4aW4gPSB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgdmFsdWU6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZW51bTogWydjaXJjbGUnLCAnc3F1YXJlJywgJ2Nyb3NzJywgJ2RpYW1vbmQnLCAndHJpYW5nbGUtdXAnLCAndHJpYW5nbGUtZG93biddLFxuICAgICAgZGVmYXVsdDogJ2NpcmNsZSdcbiAgICB9XG4gIH1cbn07XG5cbnZhciByb3dNaXhpbiA9IHtcbiAgcHJvcGVydGllczoge1xuICAgIGhlaWdodDoge1xuICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICBtaW5pbXVtOiAwLFxuICAgICAgZGVmYXVsdDogMTUwXG4gICAgfSxcbiAgICBwYWRkaW5nOiB7XG4gICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgIG1pbmltdW06IDAsXG4gICAgICBtYXhpbXVtOiAxLFxuICAgICAgZGVmYXVsdDogMC4xXG4gICAgfVxuICB9XG59O1xuXG52YXIgY29sTWl4aW4gPSB7XG4gIHByb3BlcnRpZXM6IHtcbiAgICB3aWR0aDoge1xuICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICBtaW5pbXVtOiAwLFxuICAgICAgZGVmYXVsdDogMTUwXG4gICAgfSxcbiAgICBwYWRkaW5nOiB7XG4gICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgIG1pbmltdW06IDAsXG4gICAgICBtYXhpbXVtOiAxLFxuICAgICAgZGVmYXVsdDogMC4xXG4gICAgfVxuICB9XG59O1xuXG52YXIgcmVxdWlyZWROYW1lVHlwZSA9IHtcbiAgcmVxdWlyZWQ6IFsnbmFtZScsICd0eXBlJ11cbn07XG5cbnZhciB4ID0gbWVyZ2UobWVyZ2UobWVyZ2UoY2xvbmUodHlwaWNhbEZpZWxkKSwgYXhpc01peGluKSwgYmFuZE1peGluKSwgcmVxdWlyZWROYW1lVHlwZSk7XG52YXIgeSA9IGNsb25lKHgpO1xuXG52YXIgZmFjZXQgPSBtZXJnZShjbG9uZShvbmx5T3JkaW5hbEZpZWxkKSwgcmVxdWlyZWROYW1lVHlwZSk7XG52YXIgcm93ID0gbWVyZ2UoY2xvbmUoZmFjZXQpLCByb3dNaXhpbik7XG52YXIgY29sID0gbWVyZ2UoY2xvbmUoZmFjZXQpLCBjb2xNaXhpbik7XG5cbnZhciBzaXplID0gbWVyZ2UobWVyZ2UoY2xvbmUodHlwaWNhbEZpZWxkKSwgbGVnZW5kTWl4aW4pLCBzaXplTWl4aW4pO1xudmFyIGNvbG9yID0gbWVyZ2UobWVyZ2UoY2xvbmUodHlwaWNhbEZpZWxkKSwgbGVnZW5kTWl4aW4pLCBjb2xvck1peGluKTtcbnZhciBhbHBoYSA9IG1lcmdlKGNsb25lKHR5cGljYWxGaWVsZCksIGFscGhhTWl4aW4pO1xudmFyIHNoYXBlID0gbWVyZ2UobWVyZ2UoY2xvbmUob25seU9yZGluYWxGaWVsZCksIGxlZ2VuZE1peGluKSwgc2hhcGVNaXhpbik7XG5cbnZhciB0ZXh0ID0gbWVyZ2UoY2xvbmUodHlwaWNhbEZpZWxkKSwgdGV4dE1peGluKTtcblxudmFyIGNmZyA9IHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHByb3BlcnRpZXM6IHtcbiAgICAvLyB0ZW1wbGF0ZVxuICAgIHdpZHRoOiB7XG4gICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICBkZWZhdWx0OiB1bmRlZmluZWRcbiAgICB9LFxuICAgIGhlaWdodDoge1xuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgZGVmYXVsdDogdW5kZWZpbmVkXG4gICAgfSxcbiAgICB2aWV3cG9ydDoge1xuICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgIGl0ZW1zOiB7XG4gICAgICAgIHR5cGU6IFsnaW50ZWdlciddXG4gICAgICB9LFxuICAgICAgZGVmYXVsdDogdW5kZWZpbmVkXG4gICAgfSxcbiAgICBfbWluV2lkdGg6IHtcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgIGRlZmF1bHQ6IDIwLFxuICAgICAgbWluaW11bTogMFxuICAgIH0sXG4gICAgX21pbkhlaWdodDoge1xuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgZGVmYXVsdDogMjAsXG4gICAgICBtaW5pbXVtOiAwXG4gICAgfSxcblxuICAgIC8vIGRhdGEgc291cmNlXG4gICAgZGF0YUZvcm1hdFR5cGU6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZW51bTogWydqc29uJywgJ2NzdiddLFxuICAgICAgZGVmYXVsdDogJ2pzb24nXG4gICAgfSxcbiAgICB1c2VWZWdhU2VydmVyOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIH0sXG4gICAgZGF0YVVybDoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiB1bmRlZmluZWRcbiAgICB9LFxuICAgIHZlZ2FTZXJ2ZXJUYWJsZToge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiB1bmRlZmluZWRcbiAgICB9LFxuICAgIHZlZ2FTZXJ2ZXJVcmw6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMSdcbiAgICB9XG4gIH1cbn07XG5cbi8qKiBAdHlwZSBPYmplY3QgU2NoZW1hIG9mIGEgdmVnYWxpdGUgc3BlY2lmaWNhdGlvbiAqL1xuc2NoZW1hLnNjaGVtYSA9IHtcbiAgJHNjaGVtYTogJ2h0dHA6Ly9qc29uLXNjaGVtYS5vcmcvZHJhZnQtMDQvc2NoZW1hIycsXG4gIHR5cGU6ICdvYmplY3QnLFxuICByZXF1aXJlZDogWydtYXJrdHlwZScsICdlbmMnLCAnY2ZnJ10sXG4gIHByb3BlcnRpZXM6IHtcbiAgICBtYXJrdHlwZTogc2NoZW1hLm1hcmt0eXBlLFxuICAgIGVuYzoge1xuICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIHg6IHgsXG4gICAgICAgIHk6IHksXG4gICAgICAgIHJvdzogcm93LFxuICAgICAgICBjb2w6IGNvbCxcbiAgICAgICAgc2l6ZTogc2l6ZSxcbiAgICAgICAgY29sb3I6IGNvbG9yLFxuICAgICAgICBhbHBoYTogYWxwaGEsXG4gICAgICAgIHNoYXBlOiBzaGFwZSxcbiAgICAgICAgdGV4dDogdGV4dFxuICAgICAgfVxuICAgIH0sXG4gICAgY2ZnOiBjZmdcbiAgfVxufTtcblxuLyoqIEluc3RhbnRpYXRlIGEgdmVyYm9zZSB2bCBzcGVjIGZyb20gdGhlIHNjaGVtYSAqL1xuc2NoZW1hLmluc3RhbnRpYXRlID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBzY2hlbWEudXRpbC5pbnN0YW50aWF0ZShzY2hlbWEuc2NoZW1hKTtcbn07XG4iLCJ2YXIgdXRpbCA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnZhciBpc0VtcHR5ID0gZnVuY3Rpb24ob2JqKSB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhvYmopLmxlbmd0aCA9PT0gMDtcbn07XG5cbi8vIGluc3RhbnRpYXRlIGEgc2NoZW1hXG51dGlsLmluc3RhbnRpYXRlID0gZnVuY3Rpb24oc2NoZW1hKSB7XG4gIGlmIChzY2hlbWEudHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICB2YXIgaW5zdGFuY2UgPSB7fTtcbiAgICBmb3IgKHZhciBuYW1lIGluIHNjaGVtYS5wcm9wZXJ0aWVzKSB7XG4gICAgICB2YXIgdmFsID0gdXRpbC5pbnN0YW50aWF0ZShzY2hlbWEucHJvcGVydGllc1tuYW1lXSk7XG4gICAgICBpZiAodmFsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaW5zdGFuY2VbbmFtZV0gPSB2YWw7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBpbnN0YW5jZTtcbiAgfSBlbHNlIGlmICgnZGVmYXVsdCcgaW4gc2NoZW1hKSB7XG4gICAgcmV0dXJuIHNjaGVtYS5kZWZhdWx0O1xuICB9XG4gIHJldHVybiB1bmRlZmluZWQ7XG59O1xuXG4vLyByZW1vdmUgYWxsIGRlZmF1bHRzIGZyb20gYW4gaW5zdGFuY2VcbnV0aWwuc3VidHJhY3QgPSBmdW5jdGlvbihpbnN0YW5jZSwgZGVmYXVsdHMpIHtcbiAgdmFyIGNoYW5nZXMgPSB7fTtcbiAgZm9yICh2YXIgcHJvcCBpbiBpbnN0YW5jZSkge1xuICAgIGlmICghZGVmYXVsdHMgfHwgZGVmYXVsdHNbcHJvcF0gIT09IGluc3RhbmNlW3Byb3BdKSB7XG4gICAgICBpZiAodHlwZW9mIGluc3RhbmNlW3Byb3BdID09PSAnb2JqZWN0JyAmJiAhKGluc3RhbmNlW3Byb3BdIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgICAgIHZhciBjID0gdXRpbC5zdWJ0cmFjdChpbnN0YW5jZVtwcm9wXSwgZGVmYXVsdHNbcHJvcF0pO1xuICAgICAgICBpZiAoIWlzRW1wdHkoYykpXG4gICAgICAgICAgY2hhbmdlc1twcm9wXSA9IGM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjaGFuZ2VzW3Byb3BdID0gaW5zdGFuY2VbcHJvcF07XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBjaGFuZ2VzO1xufTtcblxuLy8gcmVjdXJzaXZlbHkgbWVyZ2VzIGluc3RhbmNlIGludG8gZGVmYXVsdHNcbnV0aWwubWVyZ2UgPSBmdW5jdGlvbihkZWZhdWx0cywgaW5zdGFuY2UpIHtcbiAgaWYgKHR5cGVvZiBpbnN0YW5jZSAhPT0gJ29iamVjdCcgfHwgaW5zdGFuY2UgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZGVmYXVsdHM7XG4gIH1cblxuICBmb3IgKHZhciBwIGluIGluc3RhbmNlKSB7XG4gICAgaWYgKCFpbnN0YW5jZS5oYXNPd25Qcm9wZXJ0eShwKSlcbiAgICAgIGNvbnRpbnVlO1xuICAgIGlmIChpbnN0YW5jZVtwXSA9PT0gdW5kZWZpbmVkKVxuICAgICAgY29udGludWU7XG4gICAgaWYgKHR5cGVvZiBpbnN0YW5jZVtwXSAhPT0gJ29iamVjdCcgfHwgaW5zdGFuY2VbcF0gPT09IG51bGwpIHtcbiAgICAgIGRlZmF1bHRzW3BdID0gaW5zdGFuY2VbcF07XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGVmYXVsdHNbcF0gIT09ICdvYmplY3QnIHx8IGRlZmF1bHRzW3BdID09PSBudWxsKSB7XG4gICAgICBkZWZhdWx0c1twXSA9IHV0aWwubWVyZ2UoaW5zdGFuY2VbcF0uY29uc3RydWN0b3IgPT09IEFycmF5ID8gW10gOiB7fSwgaW5zdGFuY2VbcF0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB1dGlsLm1lcmdlKGRlZmF1bHRzW3BdLCBpbnN0YW5jZVtwXSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBkZWZhdWx0cztcbn07XG4iLCJ2YXIgdXRpbCA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnV0aWwua2V5cyA9IGZ1bmN0aW9uKG9iaikge1xuICB2YXIgayA9IFtdLCB4O1xuICBmb3IgKHggaW4gb2JqKSBrLnB1c2goeCk7XG4gIHJldHVybiBrO1xufTtcblxudXRpbC52YWxzID0gZnVuY3Rpb24ob2JqKSB7XG4gIHZhciB2ID0gW10sIHg7XG4gIGZvciAoeCBpbiBvYmopIHYucHVzaChvYmpbeF0pO1xuICByZXR1cm4gdjtcbn07XG5cbnV0aWwucmFuZ2UgPSBmdW5jdGlvbihzdGFydCwgc3RvcCwgc3RlcCkge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIHtcbiAgICBzdGVwID0gMTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgIHN0b3AgPSBzdGFydDtcbiAgICAgIHN0YXJ0ID0gMDtcbiAgICB9XG4gIH1cbiAgaWYgKChzdG9wIC0gc3RhcnQpIC8gc3RlcCA9PSBJbmZpbml0eSkgdGhyb3cgbmV3IEVycm9yKCdpbmZpbml0ZSByYW5nZScpO1xuICB2YXIgcmFuZ2UgPSBbXSwgaSA9IC0xLCBqO1xuICBpZiAoc3RlcCA8IDApIHdoaWxlICgoaiA9IHN0YXJ0ICsgc3RlcCAqICsraSkgPiBzdG9wKSByYW5nZS5wdXNoKGopO1xuICBlbHNlIHdoaWxlICgoaiA9IHN0YXJ0ICsgc3RlcCAqICsraSkgPCBzdG9wKSByYW5nZS5wdXNoKGopO1xuICByZXR1cm4gcmFuZ2U7XG59O1xuXG51dGlsLmZpbmQgPSBmdW5jdGlvbihsaXN0LCBwYXR0ZXJuKSB7XG4gIHZhciBsID0gbGlzdC5maWx0ZXIoZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB4W3BhdHRlcm4ubmFtZV0gPT09IHBhdHRlcm4udmFsdWU7XG4gIH0pO1xuICByZXR1cm4gbC5sZW5ndGggJiYgbFswXSB8fCBudWxsO1xufTtcblxudXRpbC51bmlxID0gZnVuY3Rpb24oZGF0YSwgZmllbGQpIHtcbiAgdmFyIG1hcCA9IHt9LCBjb3VudCA9IDAsIGksIGs7XG4gIGZvciAoaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgKytpKSB7XG4gICAgayA9IGZpZWxkID8gZGF0YVtpXVtmaWVsZF0gOiBkYXRhW2ldO1xuICAgIGlmICghbWFwW2tdKSB7XG4gICAgICBtYXBba10gPSAxO1xuICAgICAgY291bnQgKz0gMTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNvdW50O1xufTtcblxudXRpbC5taW5tYXggPSBmdW5jdGlvbihkYXRhLCBmaWVsZCkge1xuICB2YXIgc3RhdHMgPSB7bWluOiArSW5maW5pdHksIG1heDogLUluZmluaXR5fTtcbiAgZm9yIChpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgdiA9IGZpZWxkID8gZGF0YVtpXVtmaWVsZF0gOiBkYXRhW2ldO1xuICAgIGlmICh2ID4gc3RhdHMubWF4KSBzdGF0cy5tYXggPSB2O1xuICAgIGlmICh2IDwgc3RhdHMubWluKSBzdGF0cy5taW4gPSB2O1xuICB9XG4gIHJldHVybiBzdGF0cztcbn07XG5cbnV0aWwuZHVwbGljYXRlID0gZnVuY3Rpb24ob2JqKSB7XG4gIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9iaikpO1xufTtcblxudXRpbC5hbnkgPSBmdW5jdGlvbihhcnIsIGYpIHtcbiAgdmFyIGkgPSAwLCBrO1xuICBmb3IgKGsgaW4gYXJyKSB7XG4gICAgaWYgKGYoYXJyW2tdLCBrLCBpKyspKSByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG51dGlsLmFsbCA9IGZ1bmN0aW9uKGFyciwgZikge1xuICB2YXIgaSA9IDAsIGs7XG4gIGZvciAoayBpbiBhcnIpIHtcbiAgICBpZiAoIWYoYXJyW2tdLCBrLCBpKyspKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xuXG51dGlsLm1lcmdlID0gZnVuY3Rpb24oZGVzdCwgc3JjKSB7XG4gIHJldHVybiB1dGlsLmtleXMoc3JjKS5yZWR1Y2UoZnVuY3Rpb24oYywgaykge1xuICAgIGNba10gPSBzcmNba107XG4gICAgcmV0dXJuIGM7XG4gIH0sIGRlc3QpO1xufTtcblxudXRpbC5nZXRiaW5zID0gZnVuY3Rpb24oc3RhdHMpIHtcbiAgcmV0dXJuIHZnLmJpbnMoe1xuICAgIG1pbjogc3RhdHMubWluLFxuICAgIG1heDogc3RhdHMubWF4LFxuICAgIG1heGJpbnM6IE1BWF9CSU5TXG4gIH0pO1xufTtcblxuLyoqXG4gKiB4W3BbMF1dLi4uW3Bbbl1dID0gdmFsXG4gKiBAcGFyYW0gbm9hdWdtZW50IGRldGVybWluZSB3aGV0aGVyIG5ldyBvYmplY3Qgc2hvdWxkIGJlIGFkZGVkIGZcbiAqIG9yIG5vbi1leGlzdGluZyBwcm9wZXJ0aWVzIGFsb25nIHRoZSBwYXRoXG4gKi9cbnV0aWwuc2V0dGVyID0gZnVuY3Rpb24oeCwgcCwgdmFsLCBub2F1Z21lbnQpIHtcbiAgZm9yICh2YXIgaT0wOyBpPHAubGVuZ3RoLTE7ICsraSkge1xuICAgIGlmICghbm9hdWdtZW50ICYmICEocFtpXSBpbiB4KSl7XG4gICAgICB4ID0geFtwW2ldXSA9IHt9O1xuICAgIH0gZWxzZSB7XG4gICAgICB4ID0geFtwW2ldXTtcbiAgICB9XG4gIH1cbiAgeFtwW2ldXSA9IHZhbDtcbn07XG5cblxuLyoqXG4gKiByZXR1cm5zIHhbcFswXV0uLi5bcFtuXV1cbiAqIEBwYXJhbSBhdWdtZW50IGRldGVybWluZSB3aGV0aGVyIG5ldyBvYmplY3Qgc2hvdWxkIGJlIGFkZGVkIGZcbiAqIG9yIG5vbi1leGlzdGluZyBwcm9wZXJ0aWVzIGFsb25nIHRoZSBwYXRoXG4gKi9cbnV0aWwuZ2V0dGVyID0gZnVuY3Rpb24oeCwgcCwgbm9hdWdtZW50KSB7XG4gIGZvciAodmFyIGk9MDsgaTxwLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKCFub2F1Z21lbnQgJiYgIShwW2ldIGluIHgpKXtcbiAgICAgIHggPSB4W3BbaV1dID0ge307XG4gICAgfSBlbHNlIHtcbiAgICAgIHggPSB4W3BbaV1dO1xuICAgIH1cbiAgfVxuICByZXR1cm4geDtcbn07XG5cbi8vIGNvcGllZCBmcm9tIHZlZ2FcbnV0aWwudHJ1bmNhdGUgPSBmdW5jdGlvbihzLCBsZW5ndGgsIHBvcywgd29yZCwgZWxsaXBzaXMpIHtcbiAgdmFyIGxlbiA9IHMubGVuZ3RoO1xuICBpZiAobGVuIDw9IGxlbmd0aCkgcmV0dXJuIHM7XG4gIGVsbGlwc2lzID0gZWxsaXBzaXMgfHwgXCIuLi5cIjtcbiAgdmFyIGwgPSBNYXRoLm1heCgwLCBsZW5ndGggLSBlbGxpcHNpcy5sZW5ndGgpO1xuXG4gIHN3aXRjaCAocG9zKSB7XG4gICAgY2FzZSBcImxlZnRcIjpcbiAgICAgIHJldHVybiBlbGxpcHNpcyArICh3b3JkID8gdmdfdHJ1bmNhdGVPbldvcmQocyxsLDEpIDogcy5zbGljZShsZW4tbCkpO1xuICAgIGNhc2UgXCJtaWRkbGVcIjpcbiAgICBjYXNlIFwiY2VudGVyXCI6XG4gICAgICB2YXIgbDEgPSBNYXRoLmNlaWwobC8yKSwgbDIgPSBNYXRoLmZsb29yKGwvMik7XG4gICAgICByZXR1cm4gKHdvcmQgPyB2Z190cnVuY2F0ZU9uV29yZChzLGwxKSA6IHMuc2xpY2UoMCxsMSkpICsgZWxsaXBzaXMgK1xuICAgICAgICAod29yZCA/IHZnX3RydW5jYXRlT25Xb3JkKHMsbDIsMSkgOiBzLnNsaWNlKGxlbi1sMikpO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gKHdvcmQgPyB2Z190cnVuY2F0ZU9uV29yZChzLGwpIDogcy5zbGljZSgwLGwpKSArIGVsbGlwc2lzO1xuICB9XG59O1xuXG51dGlsLmVycm9yID0gZnVuY3Rpb24obXNnKSB7XG4gIGNvbnNvbGUuZXJyb3IoJ1tWTCBFcnJvcl0nLCBtc2cpO1xufTtcblxuIl19
