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
  vlfield = require('./field'),
  schema = require('./schema/schema'),
  time = require('./compile/time');

var Encoding = module.exports = (function() {

  function Encoding(marktype, enc, config, theme) {
    var defaults = schema.instantiate();

    var spec = {
      marktype: marktype,
      enc: enc,
      cfg: config
    };

    // type to bitcode
    for (var e in defaults.enc) {
      defaults.enc[e].type = consts.dataTypes[defaults.enc[e].type];
    }

    var specExtended = schema.util.merge(defaults, theme || {}, spec) ;

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

  proto.bandSize = function(encType, useSmallBand) {
    useSmallBand = useSmallBand ||
      //isBandInSmallMultiples
      (encType === Y && this.has(ROW) && this.has(Y)) ||
      (encType === X && this.has(COL) && this.has(X));

    // if band.size is explicitly specified, follow the specification, otherwise draw value from config.
    return this.band(encType).size ||
      this.config(useSmallBand ? 'smallBandSize' : 'largeBandSize');
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

  proto.isType = function(x, type) {
    var field = this.enc(x);
    return field && isType(field, type);
  };

  function isType(fieldDef, type) {
    return (fieldDef.type & type) > 0;
  }

  function isOrdinalScale(encoding, encType){
    return vlfield.isOrdinalScale(encoding.enc(encType), isType);
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
        return e + '-' + vlfield.shorthand(v);
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

  Encoding.fromSpec = function(spec, theme, extraCfg) {
    var enc = util.duplicate(spec.enc);

    //convert type from string to bitcode (e.g, O=1)
    for (var e in enc) {
      enc[e].type = consts.dataTypes[enc[e].type];
    }

    return new Encoding(spec.marktype, enc, util.merge(spec.cfg, extraCfg || {}), theme);
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
  getter = util.getter,
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

  if (name == X) {
    if (encoding.isOrdinalScale(X) || encoding.isType(X, T)) {
      setter(def, ['properties','labels'], {
        angle: {value: 270},
        align: {value: 'right'},
        baseline: {value: 'middle'}
      });
    } else { // Q
      def.ticks = 5;
    }
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
    maxlength = layout.cellWidth / encoding.config('characterWidth');
  } else if (name === Y) {
    maxlength = layout.cellHeight / encoding.config('characterWidth');
  }

  axis.title = maxlength ? util.truncate(fieldTitle, maxlength) : fieldTitle;
  axis.titleOffset = axisTitleOffset(encoding, layout, name);

  return axis;
}

function axisTitleOffset(encoding, layout, name) {
  return encoding.axis(name).titleOffset ||
    getter(layout, [name, 'axisTitleOffset']);
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
      maxbins: encoding.config('maxbins')
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
    mdef = marks.def(mark, encoding, layout);

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
    group.scales = scale.defs(scale.names(mdef.properties.update), encoding, layout,
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
    layout,
    {stack: stack, facet: true, stats: stats}
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
  setter = util.setter,
  schema = require('../schema/schema'),
  time = require('./time');

module.exports = vllayout;

function vllayout(encoding, stats) {
  var layout = box(encoding, stats);
  layout = offset(encoding, stats, layout);
  return layout;
}

function getCardinality(encoding, encType, stats) {
  var field = encoding.fieldName(encType);
  if (encoding.bin(encType)) {
    var bins = util.getbins(stats[field], encoding.config('maxbins'));
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

  var cellWidth, cellHeight, cellPadding = encoding.config('cellPadding'),
    xUseSmallBand = false, yUseSmallBand = false;

  // set cellWidth
  if (encoding.has(X)) {
    if (encoding.isOrdinalScale(X)) {
      // for ordinal, hasCol or not doesn't matter -- we scale based on cardinality
      var xCardinality = getCardinality(encoding, X, stats);
      if (xCardinality > encoding.config('largeBandMaxCardinality')) {
        xUseSmallBand = true;
      }
      cellWidth = (xCardinality + encoding.band(X).padding) * encoding.bandSize(X, xUseSmallBand);
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
      if (yCardinality > encoding.config('largeBandMaxCardinality')) {
        yUseSmallBand = true;
      }
      cellHeight = (yCardinality + encoding.band(Y).padding) * encoding.bandSize(Y, yUseSmallBand);
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
    height: height,
    x: {useSmallBand: xUseSmallBand},
    y: {useSmallBand: yUseSmallBand}
  };
}

function offset(encoding, stats, layout) {
  [X, Y].forEach(function (x) {
    var maxLength;
    if (encoding.isOrdinalScale(x) || encoding.isType(x, T)) {
      maxLength = stats[encoding.fieldName(x)].maxlength;
    } else if (encoding.aggr(x) === 'count') {
      //assign default value for count as it won't have stats
      maxLength =  2;
    } else if (encoding.isType(x, Q)) {
      if (x===X) {
        maxLength = 2;
      } else { // Y
        //assume that default formating is always shorter than 7
        maxLength = Math.min(stats[encoding.fieldName(x)].maxlength, 7);
      }
    }
    setter(layout,[x, 'axisTitleOffset'], encoding.config('characterWidth') *  maxLength + 20);
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

marks.def = function(mark, encoding, layout, opt) {
  var p = mark.prop(encoding, layout, opt);
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

function bar_props(e, layout) {
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
      p.width = {value: e.bandSize(X, layout.x.useSmallBand), offset: -1};
    }
  } else { // X is Quant
    p.width = {value: e.bandSize(X, layout.x.useSmallBand), offset: -1};
  }

  // height
  if (!e.isQuantScale(Y)) { // no Y or Y is ordinal
    if (e.has(SIZE)) {
      p.height = {scale: SIZE, field: e.field(SIZE)};
    } else {
      // p.height = {scale: Y, band: true, offset: -1};
      p.height = {value: e.bandSize(Y, layout.y.useSmallBand), offset: -1};
    }
  } else { // Y is Quant
    p.height = {value: e.bandSize(Y, layout.y.useSmallBand), offset: -1};
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

function point_props(e, layout, opt) {
  var p = {};
  opt = opt || {};

  // x
  if (e.has(X)) {
    p.x = {scale: X, field: e.field(X)};
  } else if (!e.has(X)) {
    p.x = {value: e.bandSize(X, layout.x.useSmallBand) / 2};
  }

  // y
  if (e.has(Y)) {
    p.y = {scale: Y, field: e.field(Y)};
  } else if (!e.has(Y)) {
    p.y = {value: e.bandSize(Y, layout.y.useSmallBand) / 2};
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

function line_props(e, layout, opt) {
  var p = {};
  opt = opt || {};

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

function area_props(e, layout, opt) {
  var p = {};
  opt = opt || {};

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
      p.x = {value: e.bandSize(X, layout.x.useSmallBand) / 2};
    }

    // y
    if (e.has(Y)) {
      p.y = {scale: Y, field: e.field(Y)};
    } else if (!e.has(Y)) {
      p.y = {value: e.bandSize(Y, layout.y.useSmallBand) / 2};
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

function text_props(e, layout, opt) {
  var p = {};
  opt = opt || {};

  // x
  if (e.has(X)) {
    p.x = {scale: X, field: e.field(X)};
  } else if (!e.has(X)) {
    p.x = {value: e.bandSize(X, layout.x.useSmallBand) / 2};
  }

  // y
  if (e.has(Y)) {
    p.y = {scale: Y, field: e.field(Y)};
  } else if (!e.has(Y)) {
    p.y = {value: e.bandSize(Y, layout.y.useSmallBand) / 2};
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

scale.defs = function(names, encoding, layout, opt) {
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

    scale_range(s, encoding, layout, opt);

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
      var bins = util.getbins(opt.stats[encoding.fieldName(name)], encoding.config('maxbins'));
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

function scale_range(s, encoding, layout, opt) {
  var spec = encoding.scale(s.name);
  switch (s.name) {
    case X:
      if (s.type === 'ordinal') {
        s.bandWidth = encoding.bandSize(X, layout.x.useSmallBand);
      } else {
        s.range = layout.cellWidth ? [0, layout.cellWidth] : 'width';
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
        s.bandWidth = encoding.bandSize(Y, layout.y.useSmallBand);
      } else {
        s.range = layout.cellHeight ? [layout.cellHeight, 0] : 'height';
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
      s.bandWidth = layout.cellHeight;
      s.round = true;
      s.nice = true;
      break;
    case COL: // support only ordinal
      s.bandWidth = layout.cellWidth;
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
      obj.binSize = util.getbins(stats[field.name], encoding.config('maxbins')).step;
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

var consts = require('./consts'),
  time = require('./compile/time');

var vlfield = module.exports = {};

vlfield.shorthand = function(f) {
  return (f.aggr ? f.aggr + '_' : '') +
    (f.fn ? f.fn + '_' : '') +
    (f.bin ? 'bin_' : '') +
    (f.name || '') + '-' +
    (consts.dataTypeNames[f.type] || f.type);
};

vlfield.shorthands = function(fields, delim){
  delim = delim || ',';
  return fields.map(vlfield.shorthand).join(delim);
};

var typeOrder = {
  O: 0,
  G: 1,
  T: 2,
  Q: 3
};

vlfield.order = {};

vlfield.order.typeThenName = function(field) {
  return typeOrder[field.type] + '_' + field.name;
};

vlfield.order.original = function() {
  return 0; // no swap will occur
};

vlfield.order.name = function(field) {
  return field.name;
};

vlfield.order.typeThenCardinality = function(field, stats){
  return stats[field.name].cardinality;
};

vlfield.isOrdinalScale = function(field, isType /*optional*/) {
  isType = isType || function(field, type) {
    return field.type === consts.dataTypeNames[type];
  };

  var fn;
  return  isType(field, O) || field.bin ||
    ( isType(field, T) && field.fn && time.isOrdinalFn(field.fn) );
};

vlfield.count = function() {
  return {name:'*', aggr: 'count', type:'Q', displayName:'COUNT'};
};

vlfield.isCount = function(field) {
  return field.aggr === 'count';
};

},{"./compile/time":16,"./consts":17}],20:[function(require,module,exports){
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
      default: 30,
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
    //binning
    maxbins: {
      type: 'integer',
      default: 10,
      minimum: 2
    },

    // single plot
    singleHeight: {
      // will be overwritten by bandWidth * (cardinality + padding)
      type: 'integer',
      default: 200,
      minimum: 0
    },
    singleWidth: {
      // will be overwritten by bandWidth * (cardinality + padding)
      type: 'integer',
      default: 200,
      minimum: 0
    },
    // band size
    largeBandSize: {
      type: 'integer',
      default: 19,
      minimum: 0
    },
    smallBandSize: {
      //small multiples or single plot with high cardinality
      type: 'integer',
      default: 12,
      minimum: 0
    },
    largeBandMaxCardinality: {
      type: 'integer',
      default: 10
    },
    // small multiples
    cellPadding: {
      type: 'number',
      default: 0.1
    },
    cellBackgroundColor: {
      type: 'string',
      default: '#fdfdfd'
    },
    textCellWidth: {
      type: 'integer',
      default: 90,
      minimum: 0
    },

    // marks
    strokeWidth: {
      type: 'integer',
      default: 2,
      minimum: 0
    },

    // scales
    timeScaleLabelLength: {
      type: 'integer',
      default: 3,
      minimum: 0
    },
    // other
    characterWidth: {
      type: 'integer',
      default: 6
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

util.extend = function(instance, schema) {
  return util.merge(util.instantiate(schema), instance);
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

util.merge = function(/*dest*, src0, src1, ...*/){
  var dest = arguments[0];
  for (var i=1 ; i<arguments.length; i++) {
    dest = merge(dest, arguments[i]);
  }
  return dest;
};

// recursively merges src into dest
merge = function(dest, src) {
  if (typeof src !== 'object' || src === null) {
    return dest;
  }

  for (var p in src) {
    if (!src.hasOwnProperty(p))
      continue;
    if (src[p] === undefined)
      continue;
    if (typeof src[p] !== 'object' || src[p] === null) {
      dest[p] = src[p];
    } else if (typeof dest[p] !== 'object' || dest[p] === null) {
      dest[p] = merge(src[p].constructor === Array ? [] : {}, src[p]);
    } else {
      merge(dest[p], src[p]);
    }
  }
  return dest;
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

util.getbins = function(stats, maxbins) {
  return vg.bins({
    min: stats.min,
    max: stats.max,
    maxbins: maxbins
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvdmwiLCJzcmMvRW5jb2RpbmcuanMiLCJzcmMvY29tcGlsZS9hZ2dyZWdhdGVzLmpzIiwic3JjL2NvbXBpbGUvYXhpcy5qcyIsInNyYy9jb21waWxlL2Jpbm5pbmcuanMiLCJzcmMvY29tcGlsZS9jb21waWxlLmpzIiwic3JjL2NvbXBpbGUvZmFjZXRpbmcuanMiLCJzcmMvY29tcGlsZS9ncm91cC5qcyIsInNyYy9jb21waWxlL2xheW91dC5qcyIsInNyYy9jb21waWxlL2xlZ2VuZC5qcyIsInNyYy9jb21waWxlL21hcmtzLmpzIiwic3JjL2NvbXBpbGUvc2NhbGUuanMiLCJzcmMvY29tcGlsZS9zdGFja2luZy5qcyIsInNyYy9jb21waWxlL3N1YmZhY2V0aW5nLmpzIiwic3JjL2NvbXBpbGUvdGVtcGxhdGUuanMiLCJzcmMvY29tcGlsZS90aW1lLmpzIiwic3JjL2NvbnN0cy5qcyIsInNyYy9kYXRhLmpzIiwic3JjL2ZpZWxkLmpzIiwic3JjL2dsb2JhbHMuanMiLCJzcmMvc2NoZW1hL3NjaGVtYS5qcyIsInNyYy9zY2hlbWEvc2NoZW1hdXRpbC5qcyIsInNyYy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbGRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgZ2xvYmFscyA9IHJlcXVpcmUoJy4vZ2xvYmFscycpLFxuICAgIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKSxcbiAgICBjb25zdHMgPSByZXF1aXJlKCcuL2NvbnN0cycpO1xuXG52YXIgdmwgPSB1dGlsLm1lcmdlKGNvbnN0cywgdXRpbCk7XG5cbnZsLkVuY29kaW5nID0gcmVxdWlyZSgnLi9FbmNvZGluZycpO1xudmwuY29tcGlsZSA9IHJlcXVpcmUoJy4vY29tcGlsZS9jb21waWxlJyk7XG52bC5kYXRhID0gcmVxdWlyZSgnLi9kYXRhJyk7XG52bC5maWVsZCA9IHJlcXVpcmUoJy4vZmllbGQnKTtcbnZsLnNjaGVtYSA9IHJlcXVpcmUoJy4vc2NoZW1hL3NjaGVtYScpO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gdmw7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBnbG9iYWwgPSByZXF1aXJlKCcuL2dsb2JhbHMnKSxcbiAgY29uc3RzID0gcmVxdWlyZSgnLi9jb25zdHMnKSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpLFxuICB2bGZpZWxkID0gcmVxdWlyZSgnLi9maWVsZCcpLFxuICBzY2hlbWEgPSByZXF1aXJlKCcuL3NjaGVtYS9zY2hlbWEnKSxcbiAgdGltZSA9IHJlcXVpcmUoJy4vY29tcGlsZS90aW1lJyk7XG5cbnZhciBFbmNvZGluZyA9IG1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuXG4gIGZ1bmN0aW9uIEVuY29kaW5nKG1hcmt0eXBlLCBlbmMsIGNvbmZpZywgdGhlbWUpIHtcbiAgICB2YXIgZGVmYXVsdHMgPSBzY2hlbWEuaW5zdGFudGlhdGUoKTtcblxuICAgIHZhciBzcGVjID0ge1xuICAgICAgbWFya3R5cGU6IG1hcmt0eXBlLFxuICAgICAgZW5jOiBlbmMsXG4gICAgICBjZmc6IGNvbmZpZ1xuICAgIH07XG5cbiAgICAvLyB0eXBlIHRvIGJpdGNvZGVcbiAgICBmb3IgKHZhciBlIGluIGRlZmF1bHRzLmVuYykge1xuICAgICAgZGVmYXVsdHMuZW5jW2VdLnR5cGUgPSBjb25zdHMuZGF0YVR5cGVzW2RlZmF1bHRzLmVuY1tlXS50eXBlXTtcbiAgICB9XG5cbiAgICB2YXIgc3BlY0V4dGVuZGVkID0gc2NoZW1hLnV0aWwubWVyZ2UoZGVmYXVsdHMsIHRoZW1lIHx8IHt9LCBzcGVjKSA7XG5cbiAgICB0aGlzLl9tYXJrdHlwZSA9IHNwZWNFeHRlbmRlZC5tYXJrdHlwZTtcbiAgICB0aGlzLl9lbmMgPSBzcGVjRXh0ZW5kZWQuZW5jO1xuICAgIHRoaXMuX2NmZyA9IHNwZWNFeHRlbmRlZC5jZmc7XG4gIH1cblxuICB2YXIgcHJvdG8gPSBFbmNvZGluZy5wcm90b3R5cGU7XG5cbiAgcHJvdG8ubWFya3R5cGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFya3R5cGU7XG4gIH07XG5cbiAgcHJvdG8uaXMgPSBmdW5jdGlvbihtKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcmt0eXBlID09PSBtO1xuICB9O1xuXG4gIHByb3RvLmhhcyA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW5jW3hdLm5hbWUgIT09IHVuZGVmaW5lZDtcbiAgfTtcblxuICBwcm90by5lbmMgPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuY1t4XTtcbiAgfTtcblxuICAvLyBnZXQgXCJmaWVsZFwiIHByb3BlcnR5IGZvciB2ZWdhXG4gIHByb3RvLmZpZWxkID0gZnVuY3Rpb24oeCwgbm9kYXRhLCBub2ZuKSB7XG4gICAgaWYgKCF0aGlzLmhhcyh4KSkgcmV0dXJuIG51bGw7XG5cbiAgICB2YXIgZiA9IChub2RhdGEgPyAnJyA6ICdkYXRhLicpO1xuXG4gICAgaWYgKHRoaXMuX2VuY1t4XS5hZ2dyID09PSAnY291bnQnKSB7XG4gICAgICByZXR1cm4gZiArICdjb3VudCc7XG4gICAgfSBlbHNlIGlmICghbm9mbiAmJiB0aGlzLl9lbmNbeF0uYmluKSB7XG4gICAgICByZXR1cm4gZiArICdiaW5fJyArIHRoaXMuX2VuY1t4XS5uYW1lO1xuICAgIH0gZWxzZSBpZiAoIW5vZm4gJiYgdGhpcy5fZW5jW3hdLmFnZ3IpIHtcbiAgICAgIHJldHVybiBmICsgdGhpcy5fZW5jW3hdLmFnZ3IgKyAnXycgKyB0aGlzLl9lbmNbeF0ubmFtZTtcbiAgICB9IGVsc2UgaWYgKCFub2ZuICYmIHRoaXMuX2VuY1t4XS5mbikge1xuICAgICAgcmV0dXJuIGYgKyB0aGlzLl9lbmNbeF0uZm4gKyAnXycgKyB0aGlzLl9lbmNbeF0ubmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGYgKyB0aGlzLl9lbmNbeF0ubmFtZTtcbiAgICB9XG4gIH07XG5cbiAgcHJvdG8uZmllbGROYW1lID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB0aGlzLl9lbmNbeF0ubmFtZTtcbiAgfTtcblxuICBwcm90by5maWVsZFRpdGxlID0gZnVuY3Rpb24oeCkge1xuICAgIGlmICh0aGlzLl9lbmNbeF0uYWdncikge1xuICAgICAgcmV0dXJuIHRoaXMuX2VuY1t4XS5hZ2dyICsgJygnICsgdGhpcy5fZW5jW3hdLm5hbWUgKyAnKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLl9lbmNbeF0ubmFtZTtcbiAgICB9XG4gIH07XG5cbiAgcHJvdG8uc2NhbGUgPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuY1t4XS5zY2FsZSB8fCB7fTtcbiAgfTtcblxuICBwcm90by5heGlzID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB0aGlzLl9lbmNbeF0uYXhpcyB8fCB7fTtcbiAgfTtcblxuICBwcm90by5iYW5kID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB0aGlzLl9lbmNbeF0uYmFuZCB8fCB7fTtcbiAgfTtcblxuICBwcm90by5iYW5kU2l6ZSA9IGZ1bmN0aW9uKGVuY1R5cGUsIHVzZVNtYWxsQmFuZCkge1xuICAgIHVzZVNtYWxsQmFuZCA9IHVzZVNtYWxsQmFuZCB8fFxuICAgICAgLy9pc0JhbmRJblNtYWxsTXVsdGlwbGVzXG4gICAgICAoZW5jVHlwZSA9PT0gWSAmJiB0aGlzLmhhcyhST1cpICYmIHRoaXMuaGFzKFkpKSB8fFxuICAgICAgKGVuY1R5cGUgPT09IFggJiYgdGhpcy5oYXMoQ09MKSAmJiB0aGlzLmhhcyhYKSk7XG5cbiAgICAvLyBpZiBiYW5kLnNpemUgaXMgZXhwbGljaXRseSBzcGVjaWZpZWQsIGZvbGxvdyB0aGUgc3BlY2lmaWNhdGlvbiwgb3RoZXJ3aXNlIGRyYXcgdmFsdWUgZnJvbSBjb25maWcuXG4gICAgcmV0dXJuIHRoaXMuYmFuZChlbmNUeXBlKS5zaXplIHx8XG4gICAgICB0aGlzLmNvbmZpZyh1c2VTbWFsbEJhbmQgPyAnc21hbGxCYW5kU2l6ZScgOiAnbGFyZ2VCYW5kU2l6ZScpO1xuICB9O1xuXG4gIHByb3RvLmFnZ3IgPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuY1t4XS5hZ2dyO1xuICB9O1xuXG4gIHByb3RvLmJpbiA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW5jW3hdLmJpbjtcbiAgfTtcblxuICBwcm90by5sZWdlbmQgPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuY1t4XS5sZWdlbmQ7XG4gIH07XG5cbiAgcHJvdG8udmFsdWUgPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuY1t4XS52YWx1ZTtcbiAgfTtcblxuICBwcm90by5mbiA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW5jW3hdLmZuO1xuICB9O1xuXG4gIHByb3RvLmFueSA9IGZ1bmN0aW9uKGYpIHtcbiAgICByZXR1cm4gdXRpbC5hbnkodGhpcy5fZW5jLCBmKTtcbiAgfTtcblxuICBwcm90by5hbGwgPSBmdW5jdGlvbihmKSB7XG4gICAgcmV0dXJuIHV0aWwuYWxsKHRoaXMuX2VuYywgZik7XG4gIH07XG5cbiAgcHJvdG8ubGVuZ3RoID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHV0aWwua2V5cyh0aGlzLl9lbmMpLmxlbmd0aDtcbiAgfTtcblxuICBwcm90by5tYXAgPSBmdW5jdGlvbihmKSB7XG4gICAgdmFyIGFyciA9IFtdLCBrO1xuICAgIGZvciAoayBpbiB0aGlzLl9lbmMpIHtcbiAgICAgIGlmKHRoaXMuaGFzKGspKXtcbiAgICAgICAgYXJyLnB1c2goZih0aGlzLl9lbmNba10sIGssIHRoaXMuX2VuYykpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYXJyO1xuICB9O1xuXG4gIHByb3RvLnJlZHVjZSA9IGZ1bmN0aW9uKGYsIGluaXQpIHtcbiAgICB2YXIgciA9IGluaXQsIGkgPSAwLCBrO1xuICAgIGZvciAoayBpbiB0aGlzLl9lbmMpIHtcbiAgICAgIGlmICh0aGlzLmhhcyhrKSkge1xuICAgICAgICByID0gZihyLCB0aGlzLl9lbmNba10sIGssIHRoaXMuX2VuYyk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByO1xuICB9O1xuXG4gIHByb3RvLmZvckVhY2ggPSBmdW5jdGlvbihmKSB7XG4gICAgdmFyIGkgPSAwLCBrO1xuICAgIGZvciAoayBpbiB0aGlzLl9lbmMpIHtcbiAgICAgIGlmICh0aGlzLmhhcyhrKSkge1xuICAgICAgICBmKGssIHRoaXMuX2VuY1trXSwgaSsrKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgcHJvdG8udHlwZSA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gdGhpcy5oYXMoeCkgPyB0aGlzLl9lbmNbeF0udHlwZSA6IG51bGw7XG4gIH07XG5cbiAgcHJvdG8udGV4dCA9IGZ1bmN0aW9uKHByb3ApIHtcbiAgICB2YXIgdGV4dCA9IHRoaXMuX2VuY1tURVhUXS50ZXh0O1xuICAgIHJldHVybiBwcm9wID8gdGV4dFtwcm9wXSA6IHRleHQ7XG4gIH07XG5cbiAgcHJvdG8uZm9udCA9IGZ1bmN0aW9uKHByb3ApIHtcbiAgICB2YXIgZm9udCA9IHRoaXMuX2VuY1tURVhUXS50ZXh0O1xuICAgIHJldHVybiBwcm9wID8gZm9udFtwcm9wXSA6IGZvbnQ7XG4gIH07XG5cbiAgcHJvdG8uaXNUeXBlID0gZnVuY3Rpb24oeCwgdHlwZSkge1xuICAgIHZhciBmaWVsZCA9IHRoaXMuZW5jKHgpO1xuICAgIHJldHVybiBmaWVsZCAmJiBpc1R5cGUoZmllbGQsIHR5cGUpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGlzVHlwZShmaWVsZERlZiwgdHlwZSkge1xuICAgIHJldHVybiAoZmllbGREZWYudHlwZSAmIHR5cGUpID4gMDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzT3JkaW5hbFNjYWxlKGVuY29kaW5nLCBlbmNUeXBlKXtcbiAgICByZXR1cm4gdmxmaWVsZC5pc09yZGluYWxTY2FsZShlbmNvZGluZy5lbmMoZW5jVHlwZSksIGlzVHlwZSk7XG4gIH1cblxuICBwcm90by5pc09yZGluYWxTY2FsZSA9IGZ1bmN0aW9uKGVuY1R5cGUpIHtcbiAgICByZXR1cm4gdGhpcy5oYXMoZW5jVHlwZSkgJiYgaXNPcmRpbmFsU2NhbGUodGhpcywgZW5jVHlwZSk7XG4gIH07XG5cbiAgcHJvdG8uaXNRdWFudFNjYWxlID0gZnVuY3Rpb24oZW5jVHlwZSkge1xuICAgIHJldHVybiB0aGlzLmhhcyhlbmNUeXBlKSAmJiAhaXNPcmRpbmFsU2NhbGUodGhpcywgZW5jVHlwZSk7XG4gIH07XG5cbiAgcHJvdG8uaXNBZ2dyZWdhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaSA9IDAsIGs7XG4gICAgZm9yIChrIGluIHRoaXMuX2VuYykge1xuICAgICAgaWYgKHRoaXMuaGFzKGspICYmIHRoaXMuYWdncihrKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIHByb3RvLmlzUmF3ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICF0aGlzLmlzQWdncmVnYXRlKCk7XG4gIH07XG5cbiAgcHJvdG8uaXNEaW1lbnNpb24gPSBmdW5jdGlvbihlbmNUeXBlKSB7XG4gICAgcmV0dXJuIHRoaXMuaGFzKGVuY1R5cGUpICYmIHRoaXMuaXNBZ2dyZWdhdGUoKSAmJlxuICAgICAgaXNPcmRpbmFsU2NhbGUodGhpcywgZW5jVHlwZSk7XG4gIH07XG5cbiAgcHJvdG8uaXNNZWFzdXJlID0gZnVuY3Rpb24oZW5jVHlwZSkge1xuICAgIHJldHVybiB0aGlzLmhhcyhlbmNUeXBlKSAmJiB0aGlzLmlzQWdncmVnYXRlKCkgJiZcbiAgICAgICFpc09yZGluYWxTY2FsZSh0aGlzLCBlbmNUeXBlKTtcbiAgfTtcblxuICBwcm90by5jb25maWcgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NmZ1tuYW1lXTtcbiAgfTtcblxuICBwcm90by50b1NwZWMgPSBmdW5jdGlvbihleGNsdWRlQ29uZmlnKSB7XG4gICAgdmFyIGVuYyA9IHV0aWwuZHVwbGljYXRlKHRoaXMuX2VuYyksXG4gICAgICBzcGVjO1xuXG4gICAgLy8gY29udmVydCB0eXBlJ3MgYml0Y29kZSB0byB0eXBlIG5hbWVcbiAgICBmb3IgKHZhciBlIGluIGVuYykge1xuICAgICAgZW5jW2VdLnR5cGUgPSBjb25zdHMuZGF0YVR5cGVOYW1lc1tlbmNbZV0udHlwZV07XG4gICAgfVxuXG4gICAgc3BlYyA9IHtcbiAgICAgIG1hcmt0eXBlOiB0aGlzLl9tYXJrdHlwZSxcbiAgICAgIGVuYzogZW5jXG4gICAgfTtcblxuICAgIGlmICghZXhjbHVkZUNvbmZpZykge1xuICAgICAgc3BlYy5jZmcgPSB1dGlsLmR1cGxpY2F0ZSh0aGlzLl9jZmcpO1xuICAgIH1cblxuICAgIC8vIHJlbW92ZSBkZWZhdWx0c1xuICAgIHZhciBkZWZhdWx0cyA9IHNjaGVtYS5pbnN0YW50aWF0ZSgpO1xuICAgIHJldHVybiBzY2hlbWEudXRpbC5zdWJ0cmFjdChzcGVjLCBkZWZhdWx0cyk7XG4gIH07XG5cbiAgcHJvdG8udG9TaG9ydGhhbmQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZW5jID0gdGhpcy5fZW5jO1xuICAgIHJldHVybiB0aGlzLl9tYXJrdHlwZSArICcuJyArXG4gICAgICB0aGlzLm1hcChmdW5jdGlvbih2LCBlKSB7XG4gICAgICAgIHJldHVybiBlICsgJy0nICsgdmxmaWVsZC5zaG9ydGhhbmQodik7XG4gICAgICB9KS5qb2luKCcuJyk7XG4gIH07XG5cbiAgRW5jb2RpbmcucGFyc2VTaG9ydGhhbmQgPSBmdW5jdGlvbihzaG9ydGhhbmQsIGNmZykge1xuICAgIHZhciBlbmMgPSBzaG9ydGhhbmQuc3BsaXQoJy4nKSxcbiAgICAgIG1hcmt0eXBlID0gZW5jLnNoaWZ0KCk7XG5cbiAgICBlbmMgPSBlbmMucmVkdWNlKGZ1bmN0aW9uKG0sIGUpIHtcbiAgICAgIHZhciBzcGxpdCA9IGUuc3BsaXQoJy0nKSxcbiAgICAgICAgZW5jdHlwZSA9IHNwbGl0WzBdLFxuICAgICAgICBvID0ge25hbWU6IHNwbGl0WzFdLCB0eXBlOiBjb25zdHMuZGF0YVR5cGVzW3NwbGl0WzJdXX07XG5cbiAgICAgIC8vIGNoZWNrIGFnZ3JlZ2F0ZSB0eXBlXG4gICAgICBmb3IgKHZhciBpIGluIHNjaGVtYS5hZ2dyLmVudW0pIHtcbiAgICAgICAgdmFyIGEgPSBzY2hlbWEuYWdnci5lbnVtW2ldO1xuICAgICAgICBpZiAoby5uYW1lLmluZGV4T2YoYSArICdfJykgPT09IDApIHtcbiAgICAgICAgICBvLm5hbWUgPSBvLm5hbWUuc3Vic3RyKGEubGVuZ3RoICsgMSk7XG4gICAgICAgICAgaWYgKGEgPT0gJ2NvdW50JyAmJiBvLm5hbWUubGVuZ3RoID09PSAwKSBvLm5hbWUgPSAnKic7XG4gICAgICAgICAgby5hZ2dyID0gYTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gY2hlY2sgdGltZSBmblxuICAgICAgZm9yICh2YXIgaSBpbiBzY2hlbWEudGltZWZucykge1xuICAgICAgICB2YXIgZiA9IHNjaGVtYS50aW1lZm5zW2ldO1xuICAgICAgICBpZiAoby5uYW1lICYmIG8ubmFtZS5pbmRleE9mKGYgKyAnXycpID09PSAwKSB7XG4gICAgICAgICAgby5uYW1lID0gby5uYW1lLnN1YnN0cihvLmxlbmd0aCArIDEpO1xuICAgICAgICAgIG8uZm4gPSBmO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIGNoZWNrIGJpblxuICAgICAgaWYgKG8ubmFtZSAmJiBvLm5hbWUuaW5kZXhPZignYmluXycpID09PSAwKSB7XG4gICAgICAgIG8ubmFtZSA9IG8ubmFtZS5zdWJzdHIoNCk7XG4gICAgICAgIG8uYmluID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgbVtlbmN0eXBlXSA9IG87XG4gICAgICByZXR1cm4gbTtcbiAgICB9LCB7fSk7XG5cbiAgICByZXR1cm4gbmV3IEVuY29kaW5nKG1hcmt0eXBlLCBlbmMsIGNmZyk7XG4gIH07XG5cbiAgRW5jb2RpbmcuZnJvbVNwZWMgPSBmdW5jdGlvbihzcGVjLCB0aGVtZSwgZXh0cmFDZmcpIHtcbiAgICB2YXIgZW5jID0gdXRpbC5kdXBsaWNhdGUoc3BlYy5lbmMpO1xuXG4gICAgLy9jb252ZXJ0IHR5cGUgZnJvbSBzdHJpbmcgdG8gYml0Y29kZSAoZS5nLCBPPTEpXG4gICAgZm9yICh2YXIgZSBpbiBlbmMpIHtcbiAgICAgIGVuY1tlXS50eXBlID0gY29uc3RzLmRhdGFUeXBlc1tlbmNbZV0udHlwZV07XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBFbmNvZGluZyhzcGVjLm1hcmt0eXBlLCBlbmMsIHV0aWwubWVyZ2Uoc3BlYy5jZmcsIGV4dHJhQ2ZnIHx8IHt9KSwgdGhlbWUpO1xuICB9O1xuXG4gIHJldHVybiBFbmNvZGluZztcblxufSkoKTtcbiIsInZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFnZ3JlZ2F0ZXM7XG5cbmZ1bmN0aW9uIGFnZ3JlZ2F0ZXMoc3BlYywgZW5jb2RpbmcsIG9wdCkge1xuICBvcHQgPSBvcHQgfHwge307XG4gIHZhciBkaW1zID0ge30sIG1lYXMgPSB7fSwgZGV0YWlsID0ge30sIGZhY2V0cyA9IHt9O1xuICBlbmNvZGluZy5mb3JFYWNoKGZ1bmN0aW9uKGVuY1R5cGUsIGZpZWxkKSB7XG4gICAgaWYgKGZpZWxkLmFnZ3IpIHtcbiAgICAgIGlmIChmaWVsZC5hZ2dyID09PSAnY291bnQnKSB7XG4gICAgICAgIG1lYXNbJ2NvdW50J10gPSB7b3A6ICdjb3VudCcsIGZpZWxkOiAnKid9O1xuICAgICAgfWVsc2Uge1xuICAgICAgICBtZWFzW2ZpZWxkLmFnZ3IgKyAnfCcrIGZpZWxkLm5hbWVdID0ge1xuICAgICAgICAgIG9wOiBmaWVsZC5hZ2dyLFxuICAgICAgICAgIGZpZWxkOiAnZGF0YS4nKyBmaWVsZC5uYW1lXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGRpbXNbZmllbGQubmFtZV0gPSBlbmNvZGluZy5maWVsZChlbmNUeXBlKTtcbiAgICAgIGlmIChlbmNUeXBlID09IFJPVyB8fCBlbmNUeXBlID09IENPTCkge1xuICAgICAgICBmYWNldHNbZmllbGQubmFtZV0gPSBkaW1zW2ZpZWxkLm5hbWVdO1xuICAgICAgfWVsc2UgaWYgKGVuY1R5cGUgIT09IFggJiYgZW5jVHlwZSAhPT0gWSkge1xuICAgICAgICBkZXRhaWxbZmllbGQubmFtZV0gPSBkaW1zW2ZpZWxkLm5hbWVdO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIGRpbXMgPSB1dGlsLnZhbHMoZGltcyk7XG4gIG1lYXMgPSB1dGlsLnZhbHMobWVhcyk7XG5cbiAgaWYgKG1lYXMubGVuZ3RoID4gMCAmJiAhb3B0LnByZWFnZ3JlZ2F0ZWREYXRhKSB7XG4gICAgaWYgKCFzcGVjLnRyYW5zZm9ybSkgc3BlYy50cmFuc2Zvcm0gPSBbXTtcbiAgICBzcGVjLnRyYW5zZm9ybS5wdXNoKHtcbiAgICAgIHR5cGU6ICdhZ2dyZWdhdGUnLFxuICAgICAgZ3JvdXBieTogZGltcyxcbiAgICAgIGZpZWxkczogbWVhc1xuICAgIH0pO1xuXG4gICAgaWYgKGVuY29kaW5nLm1hcmt0eXBlKCkgPT09IFRFWFQpIHtcbiAgICAgIG1lYXMuZm9yRWFjaChmdW5jdGlvbihtKSB7XG4gICAgICAgIHZhciBmaWVsZE5hbWUgPSBtLmZpZWxkLnN1YnN0cig1KSwgLy9yZW1vdmUgXCJkYXRhLlwiXG4gICAgICAgICAgZmllbGQgPSAnZGF0YS4nICsgKG0ub3AgPyBtLm9wICsgJ18nIDogJycpICsgZmllbGROYW1lO1xuICAgICAgICBzcGVjLnRyYW5zZm9ybS5wdXNoKHtcbiAgICAgICAgICB0eXBlOiAnZm9ybXVsYScsXG4gICAgICAgICAgZmllbGQ6IGZpZWxkLFxuICAgICAgICAgIGV4cHI6IFwiZDMuZm9ybWF0KCcuMmYnKShkLlwiICsgZmllbGQgKyAnKSdcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBkZXRhaWxzOiB1dGlsLnZhbHMoZGV0YWlsKSxcbiAgICBkaW1zOiBkaW1zLFxuICAgIGZhY2V0czogdXRpbC52YWxzKGZhY2V0cyksXG4gICAgYWdncmVnYXRlZDogbWVhcy5sZW5ndGggPiAwXG4gIH07XG59XG4iLCJ2YXIgZ2xvYmFscyA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKSxcbiAgc2V0dGVyID0gdXRpbC5zZXR0ZXIsXG4gIGdldHRlciA9IHV0aWwuZ2V0dGVyLFxuICB0aW1lID0gcmVxdWlyZSgnLi90aW1lJyk7XG5cbnZhciBheGlzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuYXhpcy5uYW1lcyA9IGZ1bmN0aW9uKHByb3BzKSB7XG4gIHJldHVybiB1dGlsLmtleXModXRpbC5rZXlzKHByb3BzKS5yZWR1Y2UoZnVuY3Rpb24oYSwgeCkge1xuICAgIHZhciBzID0gcHJvcHNbeF0uc2NhbGU7XG4gICAgaWYgKHMgPT09IFggfHwgcyA9PT0gWSkgYVtwcm9wc1t4XS5zY2FsZV0gPSAxO1xuICAgIHJldHVybiBhO1xuICB9LCB7fSkpO1xufTtcblxuYXhpcy5kZWZzID0gZnVuY3Rpb24obmFtZXMsIGVuY29kaW5nLCBsYXlvdXQsIG9wdCkge1xuICByZXR1cm4gbmFtZXMucmVkdWNlKGZ1bmN0aW9uKGEsIG5hbWUpIHtcbiAgICBhLnB1c2goYXhpcy5kZWYobmFtZSwgZW5jb2RpbmcsIGxheW91dCwgb3B0KSk7XG4gICAgcmV0dXJuIGE7XG4gIH0sIFtdKTtcbn07XG5cbmF4aXMuZGVmID0gZnVuY3Rpb24obmFtZSwgZW5jb2RpbmcsIGxheW91dCwgb3B0KSB7XG4gIHZhciB0eXBlID0gbmFtZTtcbiAgdmFyIGlzQ29sID0gbmFtZSA9PSBDT0wsIGlzUm93ID0gbmFtZSA9PSBST1c7XG4gIGlmIChpc0NvbCkgdHlwZSA9ICd4JztcbiAgaWYgKGlzUm93KSB0eXBlID0gJ3knO1xuXG4gIHZhciBkZWYgPSB7XG4gICAgdHlwZTogdHlwZSxcbiAgICBzY2FsZTogbmFtZVxuICB9O1xuXG4gIGlmIChlbmNvZGluZy5heGlzKG5hbWUpLmdyaWQpIHtcbiAgICBkZWYuZ3JpZCA9IHRydWU7XG4gICAgZGVmLmxheWVyID0gJ2JhY2snO1xuICB9XG5cbiAgaWYgKGVuY29kaW5nLmF4aXMobmFtZSkudGl0bGUpIHtcbiAgICBkZWYgPSBheGlzX3RpdGxlKGRlZiwgbmFtZSwgZW5jb2RpbmcsIGxheW91dCwgb3B0KTtcbiAgfVxuXG4gIGlmIChpc1JvdyB8fCBpc0NvbCkge1xuICAgIGRlZi5wcm9wZXJ0aWVzID0ge1xuICAgICAgdGlja3M6IHsgb3BhY2l0eToge3ZhbHVlOiAwfSB9LFxuICAgICAgbWFqb3JUaWNrczogeyBvcGFjaXR5OiB7dmFsdWU6IDB9IH0sXG4gICAgICBheGlzOiB7IG9wYWNpdHk6IHt2YWx1ZTogMH0gfVxuICAgIH07XG4gIH1cblxuICBpZiAoaXNDb2wpIHtcbiAgICBkZWYub3JpZW50ID0gJ3RvcCc7XG4gIH1cblxuICBpZiAoaXNSb3cpIHtcbiAgICBkZWYub2Zmc2V0ID0gYXhpc1RpdGxlT2Zmc2V0KGVuY29kaW5nLCBsYXlvdXQsIFkpICsgMjA7XG4gIH1cblxuICBpZiAobmFtZSA9PSBYKSB7XG4gICAgaWYgKGVuY29kaW5nLmlzT3JkaW5hbFNjYWxlKFgpIHx8IGVuY29kaW5nLmlzVHlwZShYLCBUKSkge1xuICAgICAgc2V0dGVyKGRlZiwgWydwcm9wZXJ0aWVzJywnbGFiZWxzJ10sIHtcbiAgICAgICAgYW5nbGU6IHt2YWx1ZTogMjcwfSxcbiAgICAgICAgYWxpZ246IHt2YWx1ZTogJ3JpZ2h0J30sXG4gICAgICAgIGJhc2VsaW5lOiB7dmFsdWU6ICdtaWRkbGUnfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHsgLy8gUVxuICAgICAgZGVmLnRpY2tzID0gNTtcbiAgICB9XG4gIH1cblxuICBpZiAoZW5jb2RpbmcuYXhpcyhuYW1lKS5mb3JtYXQpIHtcbiAgICBkZWYuZm9ybWF0ID0gZW5jb2RpbmcuYXhpcyhuYW1lKS5mb3JtYXQ7XG4gIH0gZWxzZSBpZiAoZW5jb2RpbmcuaXNUeXBlKG5hbWUsIFEpKSB7XG4gICAgZGVmLmZvcm1hdCA9IFwic1wiO1xuICB9IGVsc2UgaWYgKGVuY29kaW5nLmlzVHlwZShuYW1lLCBUKSAmJiAhZW5jb2RpbmcuZm4obmFtZSkpIHtcbiAgICBkZWYuZm9ybWF0ID0gXCIlWS0lbS0lZFwiO1xuICB9XG5cbiAgdmFyIGZuO1xuICAvLyBhZGQgY3VzdG9tIGxhYmVsIGZvciB0aW1lIHR5cGVcbiAgaWYgKGVuY29kaW5nLmlzVHlwZShuYW1lLCBUKSAmJiAoZm4gPSBlbmNvZGluZy5mbihuYW1lKSkgJiYgKHRpbWUuaGFzU2NhbGUoZm4pKSkge1xuICAgIHNldHRlcihkZWYsIFsncHJvcGVydGllcycsJ2xhYmVscycsJ3RleHQnLCdzY2FsZSddLCAndGltZS0nKyBmbik7XG4gIH1cblxuICByZXR1cm4gZGVmO1xufTtcblxuZnVuY3Rpb24gYXhpc190aXRsZShheGlzLCBuYW1lLCBlbmNvZGluZywgbGF5b3V0LCBvcHQpIHtcbiAgdmFyIG1heExlbmd0aCA9IG51bGwsXG4gICAgZmllbGRUaXRsZSA9IGVuY29kaW5nLmZpZWxkVGl0bGUobmFtZSk7XG4gIGlmIChuYW1lPT09WCkge1xuICAgIG1heGxlbmd0aCA9IGxheW91dC5jZWxsV2lkdGggLyBlbmNvZGluZy5jb25maWcoJ2NoYXJhY3RlcldpZHRoJyk7XG4gIH0gZWxzZSBpZiAobmFtZSA9PT0gWSkge1xuICAgIG1heGxlbmd0aCA9IGxheW91dC5jZWxsSGVpZ2h0IC8gZW5jb2RpbmcuY29uZmlnKCdjaGFyYWN0ZXJXaWR0aCcpO1xuICB9XG5cbiAgYXhpcy50aXRsZSA9IG1heGxlbmd0aCA/IHV0aWwudHJ1bmNhdGUoZmllbGRUaXRsZSwgbWF4bGVuZ3RoKSA6IGZpZWxkVGl0bGU7XG4gIGF4aXMudGl0bGVPZmZzZXQgPSBheGlzVGl0bGVPZmZzZXQoZW5jb2RpbmcsIGxheW91dCwgbmFtZSk7XG5cbiAgcmV0dXJuIGF4aXM7XG59XG5cbmZ1bmN0aW9uIGF4aXNUaXRsZU9mZnNldChlbmNvZGluZywgbGF5b3V0LCBuYW1lKSB7XG4gIHJldHVybiBlbmNvZGluZy5heGlzKG5hbWUpLnRpdGxlT2Zmc2V0IHx8XG4gICAgZ2V0dGVyKGxheW91dCwgW25hbWUsICdheGlzVGl0bGVPZmZzZXQnXSk7XG59XG4iLCJ2YXIgZ2xvYmFscyA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBiaW5uaW5nO1xuXG5mdW5jdGlvbiBiaW5uaW5nKHNwZWMsIGVuY29kaW5nLCBvcHQpIHtcbiAgb3B0ID0gb3B0IHx8IHt9O1xuICB2YXIgYmlucyA9IHt9O1xuICBlbmNvZGluZy5mb3JFYWNoKGZ1bmN0aW9uKHZ2LCBkKSB7XG4gICAgaWYgKGQuYmluKSBiaW5zW2QubmFtZV0gPSBkLm5hbWU7XG4gIH0pO1xuICBiaW5zID0gdXRpbC5rZXlzKGJpbnMpO1xuXG4gIGlmIChiaW5zLmxlbmd0aCA9PT0gMCB8fCBvcHQucHJlYWdncmVnYXRlZERhdGEpIHJldHVybiBmYWxzZTtcblxuICBpZiAoIXNwZWMudHJhbnNmb3JtKSBzcGVjLnRyYW5zZm9ybSA9IFtdO1xuICBiaW5zLmZvckVhY2goZnVuY3Rpb24oZCkge1xuICAgIHNwZWMudHJhbnNmb3JtLnB1c2goe1xuICAgICAgdHlwZTogJ2JpbicsXG4gICAgICBmaWVsZDogJ2RhdGEuJyArIGQsXG4gICAgICBvdXRwdXQ6ICdkYXRhLmJpbl8nICsgZCxcbiAgICAgIG1heGJpbnM6IGVuY29kaW5nLmNvbmZpZygnbWF4YmlucycpXG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gYmlucztcbn1cbiIsInZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbXBpbGU7XG5cbnZhciB0ZW1wbGF0ZSA9IGNvbXBpbGUudGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlJyksXG4gIGF4aXMgPSBjb21waWxlLmF4aXMgPSByZXF1aXJlKCcuL2F4aXMnKSxcbiAgbGVnZW5kID0gY29tcGlsZS5sZWdlbmQgPSByZXF1aXJlKCcuL2xlZ2VuZCcpLFxuICBtYXJrcyA9IGNvbXBpbGUubWFya3MgPSByZXF1aXJlKCcuL21hcmtzJyksXG4gIHNjYWxlID0gY29tcGlsZS5zY2FsZSA9IHJlcXVpcmUoJy4vc2NhbGUnKSxcbiAgdGltZSA9IGNvbXBpbGUudGltZSA9IHJlcXVpcmUoJy4vdGltZScpLFxuICBhZ2dyZWdhdGVzID0gY29tcGlsZS5hZ2dyZWdhdGVzID0gcmVxdWlyZSgnLi9hZ2dyZWdhdGVzJyksXG4gIGJpbm5pbmcgPSBjb21waWxlLmJpbm5pbmcgPSByZXF1aXJlKCcuL2Jpbm5pbmcnKSxcbiAgZmFjZXRpbmcgPSBjb21waWxlLmZhY2V0aW5nID0gcmVxdWlyZSgnLi9mYWNldGluZycpLFxuICBzdGFja2luZyA9IGNvbXBpbGUuc3RhY2tpbmcgPSByZXF1aXJlKCcuL3N0YWNraW5nJyk7XG4gIHN1YmZhY2V0aW5nID0gY29tcGlsZS5zdWJmYWNldGluZyA9IHJlcXVpcmUoJy4vc3ViZmFjZXRpbmcnKTtcblxuY29tcGlsZS5sYXlvdXQgPSByZXF1aXJlKCcuL2xheW91dCcpO1xuY29tcGlsZS5ncm91cCA9IHJlcXVpcmUoJy4vZ3JvdXAnKTtcblxuZnVuY3Rpb24gY29tcGlsZShlbmNvZGluZywgc3RhdHMpIHtcbiAgdmFyIGxheW91dCA9IGNvbXBpbGUubGF5b3V0KGVuY29kaW5nLCBzdGF0cyk7XG5cbiAgdmFyIHNwZWMgPSB0ZW1wbGF0ZShlbmNvZGluZywgbGF5b3V0LCBzdGF0cyksXG4gICAgZ3JvdXAgPSBzcGVjLm1hcmtzWzBdLFxuICAgIG1hcmsgPSBtYXJrc1tlbmNvZGluZy5tYXJrdHlwZSgpXSxcbiAgICBtZGVmID0gbWFya3MuZGVmKG1hcmssIGVuY29kaW5nLCBsYXlvdXQpO1xuXG4gIHZhciBoYXNSb3cgPSBlbmNvZGluZy5oYXMoUk9XKSwgaGFzQ29sID0gZW5jb2RpbmcuaGFzKENPTCk7XG5cbiAgdmFyIHByZWFnZ3JlZ2F0ZWREYXRhID0gZW5jb2RpbmcuY29uZmlnKCd1c2VWZWdhU2VydmVyJyk7XG5cbiAgZ3JvdXAubWFya3MucHVzaChtZGVmKTtcbiAgLy8gVE9ETzogcmV0dXJuIHZhbHVlIG5vdCB1c2VkXG4gIGJpbm5pbmcoc3BlYy5kYXRhWzBdLCBlbmNvZGluZywge3ByZWFnZ3JlZ2F0ZWREYXRhOiBwcmVhZ2dyZWdhdGVkRGF0YX0pO1xuXG4gIHZhciBsaW5lVHlwZSA9IG1hcmtzW2VuY29kaW5nLm1hcmt0eXBlKCldLmxpbmU7XG5cbiAgaWYgKCFwcmVhZ2dyZWdhdGVkRGF0YSkge1xuICAgIHNwZWMgPSB0aW1lKHNwZWMsIGVuY29kaW5nKTtcbiAgfVxuXG4gIC8vIGhhbmRsZSBzdWJmYWNldHNcbiAgdmFyIGFnZ1Jlc3VsdCA9IGFnZ3JlZ2F0ZXMoc3BlYy5kYXRhWzBdLCBlbmNvZGluZywge3ByZWFnZ3JlZ2F0ZWREYXRhOiBwcmVhZ2dyZWdhdGVkRGF0YX0pLFxuICAgIGRldGFpbHMgPSBhZ2dSZXN1bHQuZGV0YWlscyxcbiAgICBoYXNEZXRhaWxzID0gZGV0YWlscyAmJiBkZXRhaWxzLmxlbmd0aCA+IDAsXG4gICAgc3RhY2sgPSBoYXNEZXRhaWxzICYmIHN0YWNraW5nKHNwZWMsIGVuY29kaW5nLCBtZGVmLCBhZ2dSZXN1bHQuZmFjZXRzKTtcblxuICBpZiAoaGFzRGV0YWlscyAmJiAoc3RhY2sgfHwgbGluZVR5cGUpKSB7XG4gICAgLy9zdWJmYWNldCB0byBncm91cCBzdGFjayAvIGxpbmUgdG9nZXRoZXIgaW4gb25lIGdyb3VwXG4gICAgc3ViZmFjZXRpbmcoZ3JvdXAsIG1kZWYsIGRldGFpbHMsIHN0YWNrLCBlbmNvZGluZyk7XG4gIH1cblxuICAvLyBhdXRvLXNvcnQgbGluZS9hcmVhIHZhbHVlc1xuICAvL1RPRE8oa2FuaXR3KTogaGF2ZSBzb21lIGNvbmZpZyB0byB0dXJuIG9mZiBhdXRvLXNvcnQgZm9yIGxpbmUgKGZvciBsaW5lIGNoYXJ0IHRoYXQgZW5jb2RlcyB0ZW1wb3JhbCBpbmZvcm1hdGlvbilcbiAgaWYgKGxpbmVUeXBlKSB7XG4gICAgdmFyIGYgPSAoZW5jb2RpbmcuaXNRdWFudFNjYWxlKFgpICYmIGVuY29kaW5nLmlzT3JkaW5hbFNjYWxlKFkpKSA/IFkgOiBYO1xuICAgIGlmICghbWRlZi5mcm9tKSBtZGVmLmZyb20gPSB7fTtcbiAgICBtZGVmLmZyb20udHJhbnNmb3JtID0gW3t0eXBlOiAnc29ydCcsIGJ5OiBlbmNvZGluZy5maWVsZChmKX1dO1xuICB9XG5cbiAgLy8gU21hbGwgTXVsdGlwbGVzXG4gIGlmIChoYXNSb3cgfHwgaGFzQ29sKSB7XG4gICAgc3BlYyA9IGZhY2V0aW5nKGdyb3VwLCBlbmNvZGluZywgbGF5b3V0LCBzcGVjLCBtZGVmLCBzdGFjaywgc3RhdHMpO1xuICAgIHNwZWMubGVnZW5kcyA9IGxlZ2VuZC5kZWZzKGVuY29kaW5nKTtcbiAgfSBlbHNlIHtcbiAgICBncm91cC5zY2FsZXMgPSBzY2FsZS5kZWZzKHNjYWxlLm5hbWVzKG1kZWYucHJvcGVydGllcy51cGRhdGUpLCBlbmNvZGluZywgbGF5b3V0LFxuICAgICAge3N0YWNrOiBzdGFjaywgc3RhdHM6IHN0YXRzfSk7XG4gICAgZ3JvdXAuYXhlcyA9IGF4aXMuZGVmcyhheGlzLm5hbWVzKG1kZWYucHJvcGVydGllcy51cGRhdGUpLCBlbmNvZGluZywgbGF5b3V0KTtcbiAgICBncm91cC5sZWdlbmRzID0gbGVnZW5kLmRlZnMoZW5jb2RpbmcpO1xuICB9XG4gIHJldHVybiBzcGVjO1xufVxuXG4iLCJ2YXIgZ2xvYmFscyA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcblxudmFyIGF4aXMgPSByZXF1aXJlKCcuL2F4aXMnKSxcbiAgZ3JvdXBkZWYgPSByZXF1aXJlKCcuL2dyb3VwJykuZGVmLFxuICBzY2FsZSA9IHJlcXVpcmUoJy4vc2NhbGUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmYWNldGluZztcblxuZnVuY3Rpb24gZmFjZXRpbmcoZ3JvdXAsIGVuY29kaW5nLCBsYXlvdXQsIHNwZWMsIG1kZWYsIHN0YWNrLCBzdGF0cykge1xuICB2YXIgZW50ZXIgPSBncm91cC5wcm9wZXJ0aWVzLmVudGVyO1xuICB2YXIgZmFjZXRLZXlzID0gW10sIGNlbGxBeGVzID0gW10sIGZyb20sIGF4ZXNHcnA7XG5cbiAgdmFyIGhhc1JvdyA9IGVuY29kaW5nLmhhcyhST1cpLCBoYXNDb2wgPSBlbmNvZGluZy5oYXMoQ09MKTtcblxuICBlbnRlci5maWxsID0ge3ZhbHVlOiBlbmNvZGluZy5jb25maWcoJ2NlbGxCYWNrZ3JvdW5kQ29sb3InKX07XG5cbiAgLy9tb3ZlIFwiZnJvbVwiIHRvIGNlbGwgbGV2ZWwgYW5kIGFkZCBmYWNldCB0cmFuc2Zvcm1cbiAgZ3JvdXAuZnJvbSA9IHtkYXRhOiBncm91cC5tYXJrc1swXS5mcm9tLmRhdGF9O1xuXG4gIGlmIChncm91cC5tYXJrc1swXS5mcm9tLnRyYW5zZm9ybSkge1xuICAgIGRlbGV0ZSBncm91cC5tYXJrc1swXS5mcm9tLmRhdGE7IC8vbmVlZCB0byBrZWVwIHRyYW5zZm9ybSBmb3Igc3ViZmFjZXR0aW5nIGNhc2VcbiAgfSBlbHNlIHtcbiAgICBkZWxldGUgZ3JvdXAubWFya3NbMF0uZnJvbTtcbiAgfVxuICBpZiAoaGFzUm93KSB7XG4gICAgaWYgKCFlbmNvZGluZy5pc09yZGluYWxTY2FsZShST1cpKSB7XG4gICAgICB1dGlsLmVycm9yKCdSb3cgZW5jb2Rpbmcgc2hvdWxkIGJlIG9yZGluYWwuJyk7XG4gICAgfVxuICAgIGVudGVyLnkgPSB7c2NhbGU6IFJPVywgZmllbGQ6ICdrZXlzLicgKyBmYWNldEtleXMubGVuZ3RofTtcbiAgICBlbnRlci5oZWlnaHQgPSB7J3ZhbHVlJzogbGF5b3V0LmNlbGxIZWlnaHR9OyAvLyBIQUNLXG5cbiAgICBmYWNldEtleXMucHVzaChlbmNvZGluZy5maWVsZChST1cpKTtcblxuICAgIGlmIChoYXNDb2wpIHtcbiAgICAgIGZyb20gPSB1dGlsLmR1cGxpY2F0ZShncm91cC5mcm9tKTtcbiAgICAgIGZyb20udHJhbnNmb3JtID0gZnJvbS50cmFuc2Zvcm0gfHwgW107XG4gICAgICBmcm9tLnRyYW5zZm9ybS51bnNoaWZ0KHt0eXBlOiAnZmFjZXQnLCBrZXlzOiBbZW5jb2RpbmcuZmllbGQoQ09MKV19KTtcbiAgICB9XG5cbiAgICBheGVzR3JwID0gZ3JvdXBkZWYoJ3gtYXhlcycsIHtcbiAgICAgICAgYXhlczogZW5jb2RpbmcuaGFzKFgpID8gYXhpcy5kZWZzKFsneCddLCBlbmNvZGluZywgbGF5b3V0KSA6IHVuZGVmaW5lZCxcbiAgICAgICAgeDogaGFzQ29sID8ge3NjYWxlOiBDT0wsIGZpZWxkOiAna2V5cy4wJ30gOiB7dmFsdWU6IDB9LFxuICAgICAgICB3aWR0aDogaGFzQ29sICYmIHsndmFsdWUnOiBsYXlvdXQuY2VsbFdpZHRofSwgLy9IQUNLP1xuICAgICAgICBmcm9tOiBmcm9tXG4gICAgICB9KTtcblxuICAgIHNwZWMubWFya3MucHVzaChheGVzR3JwKTtcbiAgICAoc3BlYy5heGVzID0gc3BlYy5heGVzIHx8IFtdKTtcbiAgICBzcGVjLmF4ZXMucHVzaC5hcHBseShzcGVjLmF4ZXMsIGF4aXMuZGVmcyhbJ3JvdyddLCBlbmNvZGluZywgbGF5b3V0KSk7XG4gIH0gZWxzZSB7IC8vIGRvZXNuJ3QgaGF2ZSByb3dcbiAgICBpZiAoZW5jb2RpbmcuaGFzKFgpKSB7XG4gICAgICAvL2tlZXAgeCBheGlzIGluIHRoZSBjZWxsXG4gICAgICBjZWxsQXhlcy5wdXNoLmFwcGx5KGNlbGxBeGVzLCBheGlzLmRlZnMoWyd4J10sIGVuY29kaW5nLCBsYXlvdXQpKTtcbiAgICB9XG4gIH1cblxuICBpZiAoaGFzQ29sKSB7XG4gICAgaWYgKCFlbmNvZGluZy5pc09yZGluYWxTY2FsZShDT0wpKSB7XG4gICAgICB1dGlsLmVycm9yKCdDb2wgZW5jb2Rpbmcgc2hvdWxkIGJlIG9yZGluYWwuJyk7XG4gICAgfVxuICAgIGVudGVyLnggPSB7c2NhbGU6IENPTCwgZmllbGQ6ICdrZXlzLicgKyBmYWNldEtleXMubGVuZ3RofTtcbiAgICBlbnRlci53aWR0aCA9IHsndmFsdWUnOiBsYXlvdXQuY2VsbFdpZHRofTsgLy8gSEFDS1xuXG4gICAgZmFjZXRLZXlzLnB1c2goZW5jb2RpbmcuZmllbGQoQ09MKSk7XG5cbiAgICBpZiAoaGFzUm93KSB7XG4gICAgICBmcm9tID0gdXRpbC5kdXBsaWNhdGUoZ3JvdXAuZnJvbSk7XG4gICAgICBmcm9tLnRyYW5zZm9ybSA9IGZyb20udHJhbnNmb3JtIHx8IFtdO1xuICAgICAgZnJvbS50cmFuc2Zvcm0udW5zaGlmdCh7dHlwZTogJ2ZhY2V0Jywga2V5czogW2VuY29kaW5nLmZpZWxkKFJPVyldfSk7XG4gICAgfVxuXG4gICAgYXhlc0dycCA9IGdyb3VwZGVmKCd5LWF4ZXMnLCB7XG4gICAgICBheGVzOiBlbmNvZGluZy5oYXMoWSkgPyBheGlzLmRlZnMoWyd5J10sIGVuY29kaW5nLCBsYXlvdXQpIDogdW5kZWZpbmVkLFxuICAgICAgeTogaGFzUm93ICYmIHtzY2FsZTogUk9XLCBmaWVsZDogJ2tleXMuMCd9LFxuICAgICAgeDogaGFzUm93ICYmIHt2YWx1ZTogMH0sXG4gICAgICBoZWlnaHQ6IGhhc1JvdyAmJiB7J3ZhbHVlJzogbGF5b3V0LmNlbGxIZWlnaHR9LCAvL0hBQ0s/XG4gICAgICBmcm9tOiBmcm9tXG4gICAgfSk7XG5cbiAgICBzcGVjLm1hcmtzLnB1c2goYXhlc0dycCk7XG4gICAgKHNwZWMuYXhlcyA9IHNwZWMuYXhlcyB8fCBbXSk7XG4gICAgc3BlYy5heGVzLnB1c2guYXBwbHkoc3BlYy5heGVzLCBheGlzLmRlZnMoWydjb2wnXSwgZW5jb2RpbmcsIGxheW91dCkpO1xuICB9IGVsc2UgeyAvLyBkb2Vzbid0IGhhdmUgY29sXG4gICAgaWYgKGVuY29kaW5nLmhhcyhZKSkge1xuICAgICAgY2VsbEF4ZXMucHVzaC5hcHBseShjZWxsQXhlcywgYXhpcy5kZWZzKFsneSddLCBlbmNvZGluZywgbGF5b3V0KSk7XG4gICAgfVxuICB9XG5cbiAgLy8gYXNzdW1pbmcgZXF1YWwgY2VsbFdpZHRoIGhlcmVcbiAgLy8gVE9ETzogc3VwcG9ydCBoZXRlcm9nZW5vdXMgY2VsbFdpZHRoIChtYXliZSBieSB1c2luZyBtdWx0aXBsZSBzY2FsZXM/KVxuICBzcGVjLnNjYWxlcyA9IChzcGVjLnNjYWxlcyB8fCBbXSkuY29uY2F0KHNjYWxlLmRlZnMoXG4gICAgc2NhbGUubmFtZXMoZW50ZXIpLmNvbmNhdChzY2FsZS5uYW1lcyhtZGVmLnByb3BlcnRpZXMudXBkYXRlKSksXG4gICAgZW5jb2RpbmcsXG4gICAgbGF5b3V0LFxuICAgIHtzdGFjazogc3RhY2ssIGZhY2V0OiB0cnVlLCBzdGF0czogc3RhdHN9XG4gICkpOyAvLyByb3cvY29sIHNjYWxlcyArIGNlbGwgc2NhbGVzXG5cbiAgaWYgKGNlbGxBeGVzLmxlbmd0aCA+IDApIHtcbiAgICBncm91cC5heGVzID0gY2VsbEF4ZXM7XG4gIH1cblxuICAvLyBhZGQgZmFjZXQgdHJhbnNmb3JtXG4gIHZhciB0cmFucyA9IChncm91cC5mcm9tLnRyYW5zZm9ybSB8fCAoZ3JvdXAuZnJvbS50cmFuc2Zvcm0gPSBbXSkpO1xuICB0cmFucy51bnNoaWZ0KHt0eXBlOiAnZmFjZXQnLCBrZXlzOiBmYWNldEtleXN9KTtcblxuICByZXR1cm4gc3BlYztcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBkZWY6IGdyb3VwZGVmXG59O1xuXG5mdW5jdGlvbiBncm91cGRlZihuYW1lLCBvcHQpIHtcbiAgb3B0ID0gb3B0IHx8IHt9O1xuICByZXR1cm4ge1xuICAgIF9uYW1lOiBuYW1lIHx8IHVuZGVmaW5lZCxcbiAgICB0eXBlOiAnZ3JvdXAnLFxuICAgIGZyb206IG9wdC5mcm9tLFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIGVudGVyOiB7XG4gICAgICAgIHg6IG9wdC54IHx8IHVuZGVmaW5lZCxcbiAgICAgICAgeTogb3B0LnkgfHwgdW5kZWZpbmVkLFxuICAgICAgICB3aWR0aDogb3B0LndpZHRoIHx8IHtncm91cDogJ3dpZHRoJ30sXG4gICAgICAgIGhlaWdodDogb3B0LmhlaWdodCB8fCB7Z3JvdXA6ICdoZWlnaHQnfVxuICAgICAgfVxuICAgIH0sXG4gICAgc2NhbGVzOiBvcHQuc2NhbGVzIHx8IHVuZGVmaW5lZCxcbiAgICBheGVzOiBvcHQuYXhlcyB8fCB1bmRlZmluZWQsXG4gICAgbWFya3M6IG9wdC5tYXJrcyB8fCBbXVxuICB9O1xufVxuIiwidmFyIGdsb2JhbHMgPSByZXF1aXJlKCcuLi9nbG9iYWxzJyksXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyksXG4gIHNldHRlciA9IHV0aWwuc2V0dGVyLFxuICBzY2hlbWEgPSByZXF1aXJlKCcuLi9zY2hlbWEvc2NoZW1hJyksXG4gIHRpbWUgPSByZXF1aXJlKCcuL3RpbWUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB2bGxheW91dDtcblxuZnVuY3Rpb24gdmxsYXlvdXQoZW5jb2RpbmcsIHN0YXRzKSB7XG4gIHZhciBsYXlvdXQgPSBib3goZW5jb2RpbmcsIHN0YXRzKTtcbiAgbGF5b3V0ID0gb2Zmc2V0KGVuY29kaW5nLCBzdGF0cywgbGF5b3V0KTtcbiAgcmV0dXJuIGxheW91dDtcbn1cblxuZnVuY3Rpb24gZ2V0Q2FyZGluYWxpdHkoZW5jb2RpbmcsIGVuY1R5cGUsIHN0YXRzKSB7XG4gIHZhciBmaWVsZCA9IGVuY29kaW5nLmZpZWxkTmFtZShlbmNUeXBlKTtcbiAgaWYgKGVuY29kaW5nLmJpbihlbmNUeXBlKSkge1xuICAgIHZhciBiaW5zID0gdXRpbC5nZXRiaW5zKHN0YXRzW2ZpZWxkXSwgZW5jb2RpbmcuY29uZmlnKCdtYXhiaW5zJykpO1xuICAgIHJldHVybiAoYmlucy5zdG9wIC0gYmlucy5zdGFydCkgLyBiaW5zLnN0ZXA7XG4gIH1cbiAgaWYgKGVuY29kaW5nLmlzVHlwZShlbmNUeXBlLCBUKSkge1xuICAgIHJldHVybiB0aW1lLmNhcmRpbmFsaXR5KGVuY29kaW5nLCBlbmNUeXBlLCBzdGF0cyk7XG4gIH1cbiAgcmV0dXJuIHN0YXRzW2ZpZWxkXS5jYXJkaW5hbGl0eTtcbn1cblxuLypcbiAgSEFDSyB0byBzZXQgY2hhcnQgc2l6ZVxuICBOT1RFOiB0aGlzIGZhaWxzIGZvciBwbG90cyBkcml2ZW4gYnkgZGVyaXZlZCB2YWx1ZXMgKGUuZy4sIGFnZ3JlZ2F0ZXMpXG4gIE9uZSBzb2x1dGlvbiBpcyB0byB1cGRhdGUgVmVnYSB0byBzdXBwb3J0IGF1dG8tc2l6aW5nXG4gIEluIHRoZSBtZWFudGltZSwgYXV0by1wYWRkaW5nIChtb3N0bHkpIGRvZXMgdGhlIHRyaWNrXG4gKi9cbmZ1bmN0aW9uIGJveChlbmNvZGluZywgc3RhdHMpIHtcbiAgdmFyIGhhc1JvdyA9IGVuY29kaW5nLmhhcyhST1cpLFxuICAgICAgaGFzQ29sID0gZW5jb2RpbmcuaGFzKENPTCksXG4gICAgICBtYXJrdHlwZSA9IGVuY29kaW5nLm1hcmt0eXBlKCk7XG5cbiAgdmFyIGNlbGxXaWR0aCwgY2VsbEhlaWdodCwgY2VsbFBhZGRpbmcgPSBlbmNvZGluZy5jb25maWcoJ2NlbGxQYWRkaW5nJyksXG4gICAgeFVzZVNtYWxsQmFuZCA9IGZhbHNlLCB5VXNlU21hbGxCYW5kID0gZmFsc2U7XG5cbiAgLy8gc2V0IGNlbGxXaWR0aFxuICBpZiAoZW5jb2RpbmcuaGFzKFgpKSB7XG4gICAgaWYgKGVuY29kaW5nLmlzT3JkaW5hbFNjYWxlKFgpKSB7XG4gICAgICAvLyBmb3Igb3JkaW5hbCwgaGFzQ29sIG9yIG5vdCBkb2Vzbid0IG1hdHRlciAtLSB3ZSBzY2FsZSBiYXNlZCBvbiBjYXJkaW5hbGl0eVxuICAgICAgdmFyIHhDYXJkaW5hbGl0eSA9IGdldENhcmRpbmFsaXR5KGVuY29kaW5nLCBYLCBzdGF0cyk7XG4gICAgICBpZiAoeENhcmRpbmFsaXR5ID4gZW5jb2RpbmcuY29uZmlnKCdsYXJnZUJhbmRNYXhDYXJkaW5hbGl0eScpKSB7XG4gICAgICAgIHhVc2VTbWFsbEJhbmQgPSB0cnVlO1xuICAgICAgfVxuICAgICAgY2VsbFdpZHRoID0gKHhDYXJkaW5hbGl0eSArIGVuY29kaW5nLmJhbmQoWCkucGFkZGluZykgKiBlbmNvZGluZy5iYW5kU2l6ZShYLCB4VXNlU21hbGxCYW5kKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2VsbFdpZHRoID0gaGFzQ29sID8gZW5jb2RpbmcuZW5jKENPTCkud2lkdGggOiAgZW5jb2RpbmcuY29uZmlnKFwic2luZ2xlV2lkdGhcIik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChtYXJrdHlwZSA9PT0gVEVYVCkge1xuICAgICAgY2VsbFdpZHRoID0gZW5jb2RpbmcuY29uZmlnKCd0ZXh0Q2VsbFdpZHRoJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNlbGxXaWR0aCA9IGVuY29kaW5nLmJhbmRTaXplKFgpO1xuICAgIH1cbiAgfVxuXG4gIC8vIHNldCBjZWxsSGVpZ2h0XG4gIGlmIChlbmNvZGluZy5oYXMoWSkpIHtcbiAgICBpZiAoZW5jb2RpbmcuaXNPcmRpbmFsU2NhbGUoWSkpIHtcbiAgICAgIC8vIGZvciBvcmRpbmFsLCBoYXNDb2wgb3Igbm90IGRvZXNuJ3QgbWF0dGVyIC0tIHdlIHNjYWxlIGJhc2VkIG9uIGNhcmRpbmFsaXR5XG4gICAgICB2YXIgeUNhcmRpbmFsaXR5ID0gZ2V0Q2FyZGluYWxpdHkoZW5jb2RpbmcsIFksIHN0YXRzKTtcbiAgICAgIGlmICh5Q2FyZGluYWxpdHkgPiBlbmNvZGluZy5jb25maWcoJ2xhcmdlQmFuZE1heENhcmRpbmFsaXR5JykpIHtcbiAgICAgICAgeVVzZVNtYWxsQmFuZCA9IHRydWU7XG4gICAgICB9XG4gICAgICBjZWxsSGVpZ2h0ID0gKHlDYXJkaW5hbGl0eSArIGVuY29kaW5nLmJhbmQoWSkucGFkZGluZykgKiBlbmNvZGluZy5iYW5kU2l6ZShZLCB5VXNlU21hbGxCYW5kKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2VsbEhlaWdodCA9IGhhc1JvdyA/IGVuY29kaW5nLmVuYyhST1cpLmhlaWdodCA6ICBlbmNvZGluZy5jb25maWcoXCJzaW5nbGVIZWlnaHRcIik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNlbGxIZWlnaHQgPSBlbmNvZGluZy5iYW5kU2l6ZShZKTtcbiAgfVxuXG4gIC8vIENlbGwgYmFuZHMgdXNlIHJhbmdlQmFuZHMoKS4gVGhlcmUgYXJlIG4tMSBwYWRkaW5nLiAgT3V0ZXJwYWRkaW5nID0gMCBmb3IgY2VsbHNcblxuICB2YXIgd2lkdGggPSBjZWxsV2lkdGgsIGhlaWdodCA9IGNlbGxIZWlnaHQ7XG4gIGlmIChoYXNDb2wpIHtcbiAgICB2YXIgY29sQ2FyZGluYWxpdHkgPSBnZXRDYXJkaW5hbGl0eShlbmNvZGluZywgQ09MLCBzdGF0cyk7XG4gICAgd2lkdGggPSBjZWxsV2lkdGggKiAoKDEgKyBjZWxsUGFkZGluZykgKiAoY29sQ2FyZGluYWxpdHkgLSAxKSArIDEpO1xuICB9XG4gIGlmIChoYXNSb3cpIHtcbiAgICB2YXIgcm93Q2FyZGluYWxpdHkgPSBnZXRDYXJkaW5hbGl0eShlbmNvZGluZywgUk9XLCBzdGF0cyk7XG4gICAgaGVpZ2h0ID0gY2VsbEhlaWdodCAqICgoMSArIGNlbGxQYWRkaW5nKSAqIChyb3dDYXJkaW5hbGl0eSAtIDEpICsgMSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGNlbGxXaWR0aDogY2VsbFdpZHRoLFxuICAgIGNlbGxIZWlnaHQ6IGNlbGxIZWlnaHQsXG4gICAgd2lkdGg6IHdpZHRoLFxuICAgIGhlaWdodDogaGVpZ2h0LFxuICAgIHg6IHt1c2VTbWFsbEJhbmQ6IHhVc2VTbWFsbEJhbmR9LFxuICAgIHk6IHt1c2VTbWFsbEJhbmQ6IHlVc2VTbWFsbEJhbmR9XG4gIH07XG59XG5cbmZ1bmN0aW9uIG9mZnNldChlbmNvZGluZywgc3RhdHMsIGxheW91dCkge1xuICBbWCwgWV0uZm9yRWFjaChmdW5jdGlvbiAoeCkge1xuICAgIHZhciBtYXhMZW5ndGg7XG4gICAgaWYgKGVuY29kaW5nLmlzT3JkaW5hbFNjYWxlKHgpIHx8IGVuY29kaW5nLmlzVHlwZSh4LCBUKSkge1xuICAgICAgbWF4TGVuZ3RoID0gc3RhdHNbZW5jb2RpbmcuZmllbGROYW1lKHgpXS5tYXhsZW5ndGg7XG4gICAgfSBlbHNlIGlmIChlbmNvZGluZy5hZ2dyKHgpID09PSAnY291bnQnKSB7XG4gICAgICAvL2Fzc2lnbiBkZWZhdWx0IHZhbHVlIGZvciBjb3VudCBhcyBpdCB3b24ndCBoYXZlIHN0YXRzXG4gICAgICBtYXhMZW5ndGggPSAgMjtcbiAgICB9IGVsc2UgaWYgKGVuY29kaW5nLmlzVHlwZSh4LCBRKSkge1xuICAgICAgaWYgKHg9PT1YKSB7XG4gICAgICAgIG1heExlbmd0aCA9IDI7XG4gICAgICB9IGVsc2UgeyAvLyBZXG4gICAgICAgIC8vYXNzdW1lIHRoYXQgZGVmYXVsdCBmb3JtYXRpbmcgaXMgYWx3YXlzIHNob3J0ZXIgdGhhbiA3XG4gICAgICAgIG1heExlbmd0aCA9IE1hdGgubWluKHN0YXRzW2VuY29kaW5nLmZpZWxkTmFtZSh4KV0ubWF4bGVuZ3RoLCA3KTtcbiAgICAgIH1cbiAgICB9XG4gICAgc2V0dGVyKGxheW91dCxbeCwgJ2F4aXNUaXRsZU9mZnNldCddLCBlbmNvZGluZy5jb25maWcoJ2NoYXJhY3RlcldpZHRoJykgKiAgbWF4TGVuZ3RoICsgMjApO1xuICB9KTtcbiAgcmV0dXJuIGxheW91dDtcbn1cbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9nbG9iYWxzJyksXG4gIHRpbWUgPSByZXF1aXJlKCcuL3RpbWUnKTtcblxudmFyIGxlZ2VuZCA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbmxlZ2VuZC5kZWZzID0gZnVuY3Rpb24oZW5jb2RpbmcpIHtcbiAgdmFyIGRlZnMgPSBbXTtcblxuICAvLyBUT0RPOiBzdXBwb3J0IGFscGhhXG5cbiAgaWYgKGVuY29kaW5nLmhhcyhDT0xPUikgJiYgZW5jb2RpbmcubGVnZW5kKENPTE9SKSkge1xuICAgIGRlZnMucHVzaChsZWdlbmQuZGVmKENPTE9SLCBlbmNvZGluZywge1xuICAgICAgZmlsbDogQ09MT1IsXG4gICAgICBvcmllbnQ6ICdyaWdodCdcbiAgICB9KSk7XG4gIH1cblxuICBpZiAoZW5jb2RpbmcuaGFzKFNJWkUpICYmIGVuY29kaW5nLmxlZ2VuZChTSVpFKSkge1xuICAgIGRlZnMucHVzaChsZWdlbmQuZGVmKFNJWkUsIGVuY29kaW5nLCB7XG4gICAgICBzaXplOiBTSVpFLFxuICAgICAgb3JpZW50OiBkZWZzLmxlbmd0aCA9PT0gMSA/ICdsZWZ0JyA6ICdyaWdodCdcbiAgICB9KSk7XG4gIH1cblxuICBpZiAoZW5jb2RpbmcuaGFzKFNIQVBFKSAmJiBlbmNvZGluZy5sZWdlbmQoU0hBUEUpKSB7XG4gICAgaWYgKGRlZnMubGVuZ3RoID09PSAyKSB7XG4gICAgICAvLyBUT0RPOiBmaXggdGhpc1xuICAgICAgY29uc29sZS5lcnJvcignVmVnYWxpdGUgY3VycmVudGx5IG9ubHkgc3VwcG9ydHMgdHdvIGxlZ2VuZHMnKTtcbiAgICAgIHJldHVybiBkZWZzO1xuICAgIH1cbiAgICBkZWZzLnB1c2gobGVnZW5kLmRlZihTSEFQRSwgZW5jb2RpbmcsIHtcbiAgICAgIHNoYXBlOiBTSEFQRSxcbiAgICAgIG9yaWVudDogZGVmcy5sZW5ndGggPT09IDEgPyAnbGVmdCcgOiAncmlnaHQnXG4gICAgfSkpO1xuICB9XG5cbiAgcmV0dXJuIGRlZnM7XG59O1xuXG5sZWdlbmQuZGVmID0gZnVuY3Rpb24obmFtZSwgZW5jb2RpbmcsIHByb3BzKSB7XG4gIHZhciBkZWYgPSBwcm9wcywgZm47XG5cbiAgZGVmLnRpdGxlID0gZW5jb2RpbmcuZmllbGRUaXRsZShuYW1lKTtcblxuICBpZiAoZW5jb2RpbmcuaXNUeXBlKG5hbWUsIFQpICYmIChmbiA9IGVuY29kaW5nLmZuKG5hbWUpKSAmJlxuICAgIHRpbWUuaGFzU2NhbGUoZm4pKSB7XG4gICAgdmFyIHByb3BlcnRpZXMgPSBkZWYucHJvcGVydGllcyA9IGRlZi5wcm9wZXJ0aWVzIHx8IHt9LFxuICAgICAgbGFiZWxzID0gcHJvcGVydGllcy5sYWJlbHMgPSBwcm9wZXJ0aWVzLmxhYmVscyB8fCB7fSxcbiAgICAgIHRleHQgPSBsYWJlbHMudGV4dCA9IGxhYmVscy50ZXh0IHx8IHt9O1xuXG4gICAgdGV4dC5zY2FsZSA9ICd0aW1lLScrIGZuO1xuICB9XG5cbiAgcmV0dXJuIGRlZjtcbn07XG4iLCJ2YXIgZ2xvYmFscyA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcblxudmFyIG1hcmtzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxubWFya3MuZGVmID0gZnVuY3Rpb24obWFyaywgZW5jb2RpbmcsIGxheW91dCwgb3B0KSB7XG4gIHZhciBwID0gbWFyay5wcm9wKGVuY29kaW5nLCBsYXlvdXQsIG9wdCk7XG4gIHJldHVybiB7XG4gICAgdHlwZTogbWFyay50eXBlLFxuICAgIGZyb206IHtkYXRhOiBUQUJMRX0sXG4gICAgcHJvcGVydGllczoge2VudGVyOiBwLCB1cGRhdGU6IHB9XG4gIH07XG59O1xuXG5tYXJrcy5iYXIgPSB7XG4gIHR5cGU6ICdyZWN0JyxcbiAgc3RhY2s6IHRydWUsXG4gIHByb3A6IGJhcl9wcm9wcyxcbiAgcmVxdWlyZWRFbmNvZGluZzogWyd4JywgJ3knXSxcbiAgc3VwcG9ydGVkRW5jb2Rpbmc6IHtyb3c6IDEsIGNvbDogMSwgeDogMSwgeTogMSwgc2l6ZTogMSwgY29sb3I6IDEsIGFscGhhOiAxfVxufTtcblxubWFya3MubGluZSA9IHtcbiAgdHlwZTogJ2xpbmUnLFxuICBsaW5lOiB0cnVlLFxuICBwcm9wOiBsaW5lX3Byb3BzLFxuICByZXF1aXJlZEVuY29kaW5nOiBbJ3gnLCAneSddLFxuICBzdXBwb3J0ZWRFbmNvZGluZzoge3JvdzogMSwgY29sOiAxLCB4OiAxLCB5OiAxLCBjb2xvcjogMSwgYWxwaGE6IDF9XG59O1xuXG5tYXJrcy5hcmVhID0ge1xuICB0eXBlOiAnYXJlYScsXG4gIHN0YWNrOiB0cnVlLFxuICBsaW5lOiB0cnVlLFxuICByZXF1aXJlZEVuY29kaW5nOiBbJ3gnLCAneSddLFxuICBwcm9wOiBhcmVhX3Byb3BzLFxuICBzdXBwb3J0ZWRFbmNvZGluZzogbWFya3MubGluZS5zdXBwb3J0ZWRFbmNvZGluZ1xufTtcblxubWFya3MuY2lyY2xlID0ge1xuICB0eXBlOiAnc3ltYm9sJyxcbiAgcHJvcDogZmlsbGVkX3BvaW50X3Byb3BzKCdjaXJjbGUnKSxcbiAgc3VwcG9ydGVkRW5jb2Rpbmc6IHtyb3c6IDEsIGNvbDogMSwgeDogMSwgeTogMSwgc2l6ZTogMSwgY29sb3I6IDEsIGFscGhhOiAxfVxufTtcblxubWFya3Muc3F1YXJlID0ge1xuICB0eXBlOiAnc3ltYm9sJyxcbiAgcHJvcDogZmlsbGVkX3BvaW50X3Byb3BzKCdzcXVhcmUnKSxcbiAgc3VwcG9ydGVkRW5jb2Rpbmc6IG1hcmtzLmNpcmNsZS5zdXBwb3J0ZWRFbmNvZGluZ1xufTtcblxubWFya3MucG9pbnQgPSB7XG4gIHR5cGU6ICdzeW1ib2wnLFxuICBwcm9wOiBwb2ludF9wcm9wcyxcbiAgc3VwcG9ydGVkRW5jb2Rpbmc6IHtyb3c6IDEsIGNvbDogMSwgeDogMSwgeTogMSwgc2l6ZTogMSwgY29sb3I6IDEsIGFscGhhOiAxLCBzaGFwZTogMX1cbn07XG5cbm1hcmtzLnRleHQgPSB7XG4gIHR5cGU6ICd0ZXh0JyxcbiAgcHJvcDogdGV4dF9wcm9wcyxcbiAgcmVxdWlyZWRFbmNvZGluZzogWyd0ZXh0J10sXG4gIHN1cHBvcnRlZEVuY29kaW5nOiB7cm93OiAxLCBjb2w6IDEsIHNpemU6IDEsIGNvbG9yOiAxLCBhbHBoYTogMSwgdGV4dDogMX1cbn07XG5cbmZ1bmN0aW9uIGJhcl9wcm9wcyhlLCBsYXlvdXQpIHtcbiAgdmFyIHAgPSB7fTtcblxuICAvLyB4XG4gIGlmIChlLmlzUXVhbnRTY2FsZShYKSkge1xuICAgIHAueCA9IHtzY2FsZTogWCwgZmllbGQ6IGUuZmllbGQoWCl9O1xuICAgIGlmIChlLmlzT3JkaW5hbFNjYWxlKFkpKSB7XG4gICAgICBwLngyID0ge3NjYWxlOiBYLCB2YWx1ZTogMH07XG4gICAgfVxuICB9IGVsc2UgaWYgKGUuaGFzKFgpKSB7IC8vIGlzIG9yZGluYWxcbiAgICBwLnhjID0ge3NjYWxlOiBYLCBmaWVsZDogZS5maWVsZChYKX07XG4gIH0gZWxzZSB7XG4gICAgLy8gVE9ETyBhZGQgc2luZ2xlIGJhciBvZmZzZXRcbiAgICBwLnhjID0ge3ZhbHVlOiAwfTtcbiAgfVxuXG4gIC8vIHlcbiAgaWYgKGUuaXNRdWFudFNjYWxlKFkpKSB7XG4gICAgcC55ID0ge3NjYWxlOiBZLCBmaWVsZDogZS5maWVsZChZKX07XG4gICAgcC55MiA9IHtzY2FsZTogWSwgdmFsdWU6IDB9O1xuICB9IGVsc2UgaWYgKGUuaGFzKFkpKSB7IC8vIGlzIG9yZGluYWxcbiAgICBwLnljID0ge3NjYWxlOiBZLCBmaWVsZDogZS5maWVsZChZKX07XG4gIH0gZWxzZSB7XG4gICAgLy8gVE9ETyBhZGQgc2luZ2xlIGJhciBvZmZzZXRcbiAgICBwLnljID0ge2dyb3VwOiAnaGVpZ2h0J307XG4gIH1cblxuICAvLyB3aWR0aFxuICBpZiAoIWUuaXNRdWFudFNjYWxlKFgpKSB7IC8vIG5vIFggb3IgWCBpcyBvcmRpbmFsXG4gICAgaWYgKGUuaGFzKFNJWkUpKSB7XG4gICAgICBwLndpZHRoID0ge3NjYWxlOiBTSVpFLCBmaWVsZDogZS5maWVsZChTSVpFKX07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHAud2lkdGggPSB7c2NhbGU6IFgsIGJhbmQ6IHRydWUsIG9mZnNldDogLTF9O1xuICAgICAgcC53aWR0aCA9IHt2YWx1ZTogZS5iYW5kU2l6ZShYLCBsYXlvdXQueC51c2VTbWFsbEJhbmQpLCBvZmZzZXQ6IC0xfTtcbiAgICB9XG4gIH0gZWxzZSB7IC8vIFggaXMgUXVhbnRcbiAgICBwLndpZHRoID0ge3ZhbHVlOiBlLmJhbmRTaXplKFgsIGxheW91dC54LnVzZVNtYWxsQmFuZCksIG9mZnNldDogLTF9O1xuICB9XG5cbiAgLy8gaGVpZ2h0XG4gIGlmICghZS5pc1F1YW50U2NhbGUoWSkpIHsgLy8gbm8gWSBvciBZIGlzIG9yZGluYWxcbiAgICBpZiAoZS5oYXMoU0laRSkpIHtcbiAgICAgIHAuaGVpZ2h0ID0ge3NjYWxlOiBTSVpFLCBmaWVsZDogZS5maWVsZChTSVpFKX07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHAuaGVpZ2h0ID0ge3NjYWxlOiBZLCBiYW5kOiB0cnVlLCBvZmZzZXQ6IC0xfTtcbiAgICAgIHAuaGVpZ2h0ID0ge3ZhbHVlOiBlLmJhbmRTaXplKFksIGxheW91dC55LnVzZVNtYWxsQmFuZCksIG9mZnNldDogLTF9O1xuICAgIH1cbiAgfSBlbHNlIHsgLy8gWSBpcyBRdWFudFxuICAgIHAuaGVpZ2h0ID0ge3ZhbHVlOiBlLmJhbmRTaXplKFksIGxheW91dC55LnVzZVNtYWxsQmFuZCksIG9mZnNldDogLTF9O1xuICB9XG5cbiAgLy8gZmlsbFxuICBpZiAoZS5oYXMoQ09MT1IpKSB7XG4gICAgcC5maWxsID0ge3NjYWxlOiBDT0xPUiwgZmllbGQ6IGUuZmllbGQoQ09MT1IpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoQ09MT1IpKSB7XG4gICAgcC5maWxsID0ge3ZhbHVlOiBlLnZhbHVlKENPTE9SKX07XG4gIH1cblxuICAvLyBhbHBoYVxuICBpZiAoZS5oYXMoQUxQSEEpKSB7XG4gICAgcC5vcGFjaXR5ID0ge3NjYWxlOiBBTFBIQSwgZmllbGQ6IGUuZmllbGQoQUxQSEEpfTtcbiAgfVxuXG4gIHJldHVybiBwO1xufVxuXG5mdW5jdGlvbiBwb2ludF9wcm9wcyhlLCBsYXlvdXQsIG9wdCkge1xuICB2YXIgcCA9IHt9O1xuICBvcHQgPSBvcHQgfHwge307XG5cbiAgLy8geFxuICBpZiAoZS5oYXMoWCkpIHtcbiAgICBwLnggPSB7c2NhbGU6IFgsIGZpZWxkOiBlLmZpZWxkKFgpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoWCkpIHtcbiAgICBwLnggPSB7dmFsdWU6IGUuYmFuZFNpemUoWCwgbGF5b3V0LngudXNlU21hbGxCYW5kKSAvIDJ9O1xuICB9XG5cbiAgLy8geVxuICBpZiAoZS5oYXMoWSkpIHtcbiAgICBwLnkgPSB7c2NhbGU6IFksIGZpZWxkOiBlLmZpZWxkKFkpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoWSkpIHtcbiAgICBwLnkgPSB7dmFsdWU6IGUuYmFuZFNpemUoWSwgbGF5b3V0LnkudXNlU21hbGxCYW5kKSAvIDJ9O1xuICB9XG5cbiAgLy8gc2l6ZVxuICBpZiAoZS5oYXMoU0laRSkpIHtcbiAgICBwLnNpemUgPSB7c2NhbGU6IFNJWkUsIGZpZWxkOiBlLmZpZWxkKFNJWkUpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoU0laRSkpIHtcbiAgICBwLnNpemUgPSB7dmFsdWU6IGUudmFsdWUoU0laRSl9O1xuICB9XG5cbiAgLy8gc2hhcGVcbiAgaWYgKGUuaGFzKFNIQVBFKSkge1xuICAgIHAuc2hhcGUgPSB7c2NhbGU6IFNIQVBFLCBmaWVsZDogZS5maWVsZChTSEFQRSl9O1xuICB9IGVsc2UgaWYgKCFlLmhhcyhTSEFQRSkpIHtcbiAgICBwLnNoYXBlID0ge3ZhbHVlOiBlLnZhbHVlKFNIQVBFKX07XG4gIH1cblxuICAvLyBzdHJva2VcbiAgaWYgKGUuaGFzKENPTE9SKSkge1xuICAgIHAuc3Ryb2tlID0ge3NjYWxlOiBDT0xPUiwgZmllbGQ6IGUuZmllbGQoQ09MT1IpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoQ09MT1IpKSB7XG4gICAgcC5zdHJva2UgPSB7dmFsdWU6IGUudmFsdWUoQ09MT1IpfTtcbiAgfVxuXG4gIC8vIGFscGhhXG4gIGlmIChlLmhhcyhBTFBIQSkpIHtcbiAgICBwLm9wYWNpdHkgPSB7c2NhbGU6IEFMUEhBLCBmaWVsZDogZS5maWVsZChBTFBIQSl9O1xuICB9ZWxzZSB7XG4gICAgcC5vcGFjaXR5ID0ge1xuICAgICAgdmFsdWU6IGUudmFsdWUoQUxQSEEpXG4gICAgfTtcbiAgfVxuXG4gIHAuc3Ryb2tlV2lkdGggPSB7dmFsdWU6IGUuY29uZmlnKCdzdHJva2VXaWR0aCcpfTtcblxuICByZXR1cm4gcDtcbn1cblxuZnVuY3Rpb24gbGluZV9wcm9wcyhlLCBsYXlvdXQsIG9wdCkge1xuICB2YXIgcCA9IHt9O1xuICBvcHQgPSBvcHQgfHwge307XG5cbiAgLy8geFxuICBpZiAoZS5oYXMoWCkpIHtcbiAgICBwLnggPSB7c2NhbGU6IFgsIGZpZWxkOiBlLmZpZWxkKFgpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoWCkpIHtcbiAgICBwLnggPSB7dmFsdWU6IDB9O1xuICB9XG5cbiAgLy8geVxuICBpZiAoZS5oYXMoWSkpIHtcbiAgICBwLnkgPSB7c2NhbGU6IFksIGZpZWxkOiBlLmZpZWxkKFkpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoWSkpIHtcbiAgICBwLnkgPSB7Z3JvdXA6ICdoZWlnaHQnfTtcbiAgfVxuXG4gIC8vIHN0cm9rZVxuICBpZiAoZS5oYXMoQ09MT1IpKSB7XG4gICAgcC5zdHJva2UgPSB7c2NhbGU6IENPTE9SLCBmaWVsZDogZS5maWVsZChDT0xPUil9O1xuICB9IGVsc2UgaWYgKCFlLmhhcyhDT0xPUikpIHtcbiAgICBwLnN0cm9rZSA9IHt2YWx1ZTogZS52YWx1ZShDT0xPUil9O1xuICB9XG5cbiAgLy8gYWxwaGFcbiAgaWYgKGUuaGFzKEFMUEhBKSkge1xuICAgIHAub3BhY2l0eSA9IHtzY2FsZTogQUxQSEEsIGZpZWxkOiBlLmZpZWxkKEFMUEhBKX07XG4gIH1cblxuICBwLnN0cm9rZVdpZHRoID0ge3ZhbHVlOiBlLmNvbmZpZygnc3Ryb2tlV2lkdGgnKX07XG5cbiAgcmV0dXJuIHA7XG59XG5cbmZ1bmN0aW9uIGFyZWFfcHJvcHMoZSwgbGF5b3V0LCBvcHQpIHtcbiAgdmFyIHAgPSB7fTtcbiAgb3B0ID0gb3B0IHx8IHt9O1xuXG4gIC8vIHhcbiAgaWYgKGUuaXNRdWFudFNjYWxlKFgpKSB7XG4gICAgcC54ID0ge3NjYWxlOiBYLCBmaWVsZDogZS5maWVsZChYKX07XG4gICAgaWYgKGUuaXNPcmRpbmFsU2NhbGUoWSkpIHtcbiAgICAgIHAueDIgPSB7c2NhbGU6IFgsIHZhbHVlOiAwfTtcbiAgICAgIHAub3JpZW50ID0ge3ZhbHVlOiAnaG9yaXpvbnRhbCd9O1xuICAgIH1cbiAgfSBlbHNlIGlmIChlLmhhcyhYKSkge1xuICAgIHAueCA9IHtzY2FsZTogWCwgZmllbGQ6IGUuZmllbGQoWCl9O1xuICB9IGVsc2Uge1xuICAgIHAueCA9IHt2YWx1ZTogMH07XG4gIH1cblxuICAvLyB5XG4gIGlmIChlLmlzUXVhbnRTY2FsZShZKSkge1xuICAgIHAueSA9IHtzY2FsZTogWSwgZmllbGQ6IGUuZmllbGQoWSl9O1xuICAgIHAueTIgPSB7c2NhbGU6IFksIHZhbHVlOiAwfTtcbiAgfSBlbHNlIGlmIChlLmhhcyhZKSkge1xuICAgIHAueSA9IHtzY2FsZTogWSwgZmllbGQ6IGUuZmllbGQoWSl9O1xuICB9IGVsc2Uge1xuICAgIHAueSA9IHtncm91cDogJ2hlaWdodCd9O1xuICB9XG5cbiAgLy8gc3Ryb2tlXG4gIGlmIChlLmhhcyhDT0xPUikpIHtcbiAgICBwLmZpbGwgPSB7c2NhbGU6IENPTE9SLCBmaWVsZDogZS5maWVsZChDT0xPUil9O1xuICB9IGVsc2UgaWYgKCFlLmhhcyhDT0xPUikpIHtcbiAgICBwLmZpbGwgPSB7dmFsdWU6IGUudmFsdWUoQ09MT1IpfTtcbiAgfVxuXG4gIC8vIGFscGhhXG4gIGlmIChlLmhhcyhBTFBIQSkpIHtcbiAgICBwLm9wYWNpdHkgPSB7c2NhbGU6IEFMUEhBLCBmaWVsZDogZS5maWVsZChBTFBIQSl9O1xuICB9XG5cbiAgcmV0dXJuIHA7XG59XG5cbmZ1bmN0aW9uIGZpbGxlZF9wb2ludF9wcm9wcyhzaGFwZSkge1xuICByZXR1cm4gZnVuY3Rpb24oZSwgb3B0KSB7XG4gICAgdmFyIHAgPSB7fTtcbiAgICBvcHQgPSBvcHQgfHwge307XG5cbiAgICAvLyB4XG4gICAgaWYgKGUuaGFzKFgpKSB7XG4gICAgICBwLnggPSB7c2NhbGU6IFgsIGZpZWxkOiBlLmZpZWxkKFgpfTtcbiAgICB9IGVsc2UgaWYgKCFlLmhhcyhYKSkge1xuICAgICAgcC54ID0ge3ZhbHVlOiBlLmJhbmRTaXplKFgsIGxheW91dC54LnVzZVNtYWxsQmFuZCkgLyAyfTtcbiAgICB9XG5cbiAgICAvLyB5XG4gICAgaWYgKGUuaGFzKFkpKSB7XG4gICAgICBwLnkgPSB7c2NhbGU6IFksIGZpZWxkOiBlLmZpZWxkKFkpfTtcbiAgICB9IGVsc2UgaWYgKCFlLmhhcyhZKSkge1xuICAgICAgcC55ID0ge3ZhbHVlOiBlLmJhbmRTaXplKFksIGxheW91dC55LnVzZVNtYWxsQmFuZCkgLyAyfTtcbiAgICB9XG5cbiAgICAvLyBzaXplXG4gICAgaWYgKGUuaGFzKFNJWkUpKSB7XG4gICAgICBwLnNpemUgPSB7c2NhbGU6IFNJWkUsIGZpZWxkOiBlLmZpZWxkKFNJWkUpfTtcbiAgICB9IGVsc2UgaWYgKCFlLmhhcyhYKSkge1xuICAgICAgcC5zaXplID0ge3ZhbHVlOiBlLnZhbHVlKFNJWkUpfTtcbiAgICB9XG5cbiAgICAvLyBzaGFwZVxuICAgIHAuc2hhcGUgPSB7dmFsdWU6IHNoYXBlfTtcblxuICAgIC8vIGZpbGxcbiAgICBpZiAoZS5oYXMoQ09MT1IpKSB7XG4gICAgICBwLmZpbGwgPSB7c2NhbGU6IENPTE9SLCBmaWVsZDogZS5maWVsZChDT0xPUil9O1xuICAgIH0gZWxzZSBpZiAoIWUuaGFzKENPTE9SKSkge1xuICAgICAgcC5maWxsID0ge3ZhbHVlOiBlLnZhbHVlKENPTE9SKX07XG4gICAgfVxuXG4gICAgLy8gYWxwaGFcbiAgICBpZiAoZS5oYXMoQUxQSEEpKSB7XG4gICAgICBwLm9wYWNpdHkgPSB7c2NhbGU6IEFMUEhBLCBmaWVsZDogZS5maWVsZChBTFBIQSl9O1xuICAgIH1lbHNlIHtcbiAgICAgIHAub3BhY2l0eSA9IHtcbiAgICAgICAgdmFsdWU6IGUudmFsdWUoQUxQSEEpXG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBwO1xuICB9O1xufVxuXG5mdW5jdGlvbiB0ZXh0X3Byb3BzKGUsIGxheW91dCwgb3B0KSB7XG4gIHZhciBwID0ge307XG4gIG9wdCA9IG9wdCB8fCB7fTtcblxuICAvLyB4XG4gIGlmIChlLmhhcyhYKSkge1xuICAgIHAueCA9IHtzY2FsZTogWCwgZmllbGQ6IGUuZmllbGQoWCl9O1xuICB9IGVsc2UgaWYgKCFlLmhhcyhYKSkge1xuICAgIHAueCA9IHt2YWx1ZTogZS5iYW5kU2l6ZShYLCBsYXlvdXQueC51c2VTbWFsbEJhbmQpIC8gMn07XG4gIH1cblxuICAvLyB5XG4gIGlmIChlLmhhcyhZKSkge1xuICAgIHAueSA9IHtzY2FsZTogWSwgZmllbGQ6IGUuZmllbGQoWSl9O1xuICB9IGVsc2UgaWYgKCFlLmhhcyhZKSkge1xuICAgIHAueSA9IHt2YWx1ZTogZS5iYW5kU2l6ZShZLCBsYXlvdXQueS51c2VTbWFsbEJhbmQpIC8gMn07XG4gIH1cblxuICAvLyBzaXplXG4gIGlmIChlLmhhcyhTSVpFKSkge1xuICAgIHAuZm9udFNpemUgPSB7c2NhbGU6IFNJWkUsIGZpZWxkOiBlLmZpZWxkKFNJWkUpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoWCkpIHtcbiAgICBwLmZvbnRTaXplID0ge3ZhbHVlOiBlLmZvbnQoJ3NpemUnKX07XG4gIH1cblxuICAvLyBmaWxsXG4gIGlmIChlLmhhcyhDT0xPUikpIHtcbiAgICBwLmZpbGwgPSB7c2NhbGU6IENPTE9SLCBmaWVsZDogZS5maWVsZChDT0xPUil9O1xuICB9IGVsc2UgaWYgKCFlLmhhcyhDT0xPUikpIHtcbiAgICBwLmZpbGwgPSB7dmFsdWU6IGUudmFsdWUoQ09MT1IpfTtcbiAgfVxuXG4gIC8vIGFscGhhXG4gIGlmIChlLmhhcyhBTFBIQSkpIHtcbiAgICBwLm9wYWNpdHkgPSB7c2NhbGU6IEFMUEhBLCBmaWVsZDogZS5maWVsZChBTFBIQSl9O1xuICB9XG5cbiAgLy8gdGV4dFxuICBpZiAoZS5oYXMoVEVYVCkpIHtcbiAgICBwLnRleHQgPSB7ZmllbGQ6IGUuZmllbGQoVEVYVCl9O1xuICB9IGVsc2Uge1xuICAgIHAudGV4dCA9IHt2YWx1ZTogJ0FiYyd9O1xuICB9XG5cbiAgcC5mb250ID0ge3ZhbHVlOiBlLmZvbnQoJ2ZhbWlseScpfTtcbiAgcC5mb250V2VpZ2h0ID0ge3ZhbHVlOiBlLmZvbnQoJ3dlaWdodCcpfTtcbiAgcC5mb250U3R5bGUgPSB7dmFsdWU6IGUuZm9udCgnc3R5bGUnKX07XG4gIHAuYmFzZWxpbmUgPSB7dmFsdWU6IGUudGV4dCgnYmFzZWxpbmUnKX07XG5cbiAgLy8gYWxpZ25cbiAgaWYgKGUuaGFzKFgpKSB7XG4gICAgaWYgKGUuaXNPcmRpbmFsU2NhbGUoWCkpIHtcbiAgICAgIHAuYWxpZ24gPSB7dmFsdWU6ICdsZWZ0J307XG4gICAgICBwLmR4ID0ge3ZhbHVlOiBlLnRleHQoJ21hcmdpbicpfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcC5hbGlnbiA9IHt2YWx1ZTogJ2NlbnRlcid9O1xuICAgIH1cbiAgfSBlbHNlIGlmIChlLmhhcyhZKSkge1xuICAgIHAuYWxpZ24gPSB7dmFsdWU6ICdsZWZ0J307XG4gICAgcC5keCA9IHt2YWx1ZTogZS50ZXh0KCdtYXJnaW4nKX07XG4gIH0gZWxzZSB7XG4gICAgcC5hbGlnbiA9IHt2YWx1ZTogZS50ZXh0KCdhbGlnbicpfTtcbiAgfVxuXG4gIHJldHVybiBwO1xufVxuIiwidmFyIGdsb2JhbHMgPSByZXF1aXJlKCcuLi9nbG9iYWxzJyksXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyksXG4gIHRpbWUgPSByZXF1aXJlKCcuL3RpbWUnKTtcblxudmFyIHNjYWxlID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuc2NhbGUubmFtZXMgPSBmdW5jdGlvbihwcm9wcykge1xuICByZXR1cm4gdXRpbC5rZXlzKHV0aWwua2V5cyhwcm9wcykucmVkdWNlKGZ1bmN0aW9uKGEsIHgpIHtcbiAgICBpZiAocHJvcHNbeF0gJiYgcHJvcHNbeF0uc2NhbGUpIGFbcHJvcHNbeF0uc2NhbGVdID0gMTtcbiAgICByZXR1cm4gYTtcbiAgfSwge30pKTtcbn07XG5cbnNjYWxlLmRlZnMgPSBmdW5jdGlvbihuYW1lcywgZW5jb2RpbmcsIGxheW91dCwgb3B0KSB7XG4gIG9wdCA9IG9wdCB8fCB7fTtcblxuICByZXR1cm4gbmFtZXMucmVkdWNlKGZ1bmN0aW9uKGEsIG5hbWUpIHtcbiAgICB2YXIgcyA9IHtcbiAgICAgIG5hbWU6IG5hbWUsXG4gICAgICB0eXBlOiBzY2FsZS50eXBlKG5hbWUsIGVuY29kaW5nKSxcbiAgICAgIGRvbWFpbjogc2NhbGVfZG9tYWluKG5hbWUsIGVuY29kaW5nLCBvcHQpXG4gICAgfTtcbiAgICBpZiAocy50eXBlID09PSAnb3JkaW5hbCcgJiYgIWVuY29kaW5nLmJpbihuYW1lKSkge1xuICAgICAgcy5zb3J0ID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBzY2FsZV9yYW5nZShzLCBlbmNvZGluZywgbGF5b3V0LCBvcHQpO1xuXG4gICAgcmV0dXJuIChhLnB1c2gocyksIGEpO1xuICB9LCBbXSk7XG59O1xuXG5zY2FsZS50eXBlID0gZnVuY3Rpb24obmFtZSwgZW5jb2RpbmcpIHtcblxuICBzd2l0Y2ggKGVuY29kaW5nLnR5cGUobmFtZSkpIHtcbiAgICBjYXNlIE86IHJldHVybiAnb3JkaW5hbCc7XG4gICAgY2FzZSBUOlxuICAgICAgdmFyIGZuID0gZW5jb2RpbmcuZm4obmFtZSk7XG4gICAgICByZXR1cm4gKGZuICYmIHRpbWUuc2NhbGUudHlwZShmbikpIHx8ICd0aW1lJztcbiAgICBjYXNlIFE6XG4gICAgICBpZiAoZW5jb2RpbmcuYmluKG5hbWUpKSB7XG4gICAgICAgIHJldHVybiAnb3JkaW5hbCc7XG4gICAgICB9XG4gICAgICByZXR1cm4gZW5jb2Rpbmcuc2NhbGUobmFtZSkudHlwZTtcbiAgfVxufTtcblxuZnVuY3Rpb24gc2NhbGVfZG9tYWluKG5hbWUsIGVuY29kaW5nLCBvcHQpIHtcbiAgaWYgKGVuY29kaW5nLmlzVHlwZShuYW1lLCBUKSkge1xuICAgIHZhciByYW5nZSA9IHRpbWUuc2NhbGUuZG9tYWluKGVuY29kaW5nLmZuKG5hbWUpKTtcbiAgICBpZihyYW5nZSkgcmV0dXJuIHJhbmdlO1xuICB9XG5cbiAgaWYgKGVuY29kaW5nLmJpbihuYW1lKSkge1xuICAgIC8vIFRPRE86IGFkZCBpbmNsdWRlRW1wdHlDb25maWcgaGVyZVxuICAgIGlmIChvcHQuc3RhdHMpIHtcbiAgICAgIHZhciBiaW5zID0gdXRpbC5nZXRiaW5zKG9wdC5zdGF0c1tlbmNvZGluZy5maWVsZE5hbWUobmFtZSldLCBlbmNvZGluZy5jb25maWcoJ21heGJpbnMnKSk7XG4gICAgICB2YXIgZG9tYWluID0gdXRpbC5yYW5nZShiaW5zLnN0YXJ0LCBiaW5zLnN0b3AsIGJpbnMuc3RlcCk7XG4gICAgICByZXR1cm4gbmFtZSA9PT0gWSA/IGRvbWFpbi5yZXZlcnNlKCkgOiBkb21haW47XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5hbWUgPT0gb3B0LnN0YWNrID9cbiAgICB7XG4gICAgICBkYXRhOiBTVEFDS0VELFxuICAgICAgZmllbGQ6ICdkYXRhLicgKyAob3B0LmZhY2V0ID8gJ21heF8nIDogJycpICsgJ3N1bV8nICsgZW5jb2RpbmcuZmllbGQobmFtZSwgdHJ1ZSlcbiAgICB9IDpcbiAgICB7ZGF0YTogVEFCTEUsIGZpZWxkOiBlbmNvZGluZy5maWVsZChuYW1lKX07XG59XG5cbmZ1bmN0aW9uIHNjYWxlX3JhbmdlKHMsIGVuY29kaW5nLCBsYXlvdXQsIG9wdCkge1xuICB2YXIgc3BlYyA9IGVuY29kaW5nLnNjYWxlKHMubmFtZSk7XG4gIHN3aXRjaCAocy5uYW1lKSB7XG4gICAgY2FzZSBYOlxuICAgICAgaWYgKHMudHlwZSA9PT0gJ29yZGluYWwnKSB7XG4gICAgICAgIHMuYmFuZFdpZHRoID0gZW5jb2RpbmcuYmFuZFNpemUoWCwgbGF5b3V0LngudXNlU21hbGxCYW5kKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHMucmFuZ2UgPSBsYXlvdXQuY2VsbFdpZHRoID8gWzAsIGxheW91dC5jZWxsV2lkdGhdIDogJ3dpZHRoJztcbiAgICAgICAgcy56ZXJvID0gc3BlYy56ZXJvIHx8XG4gICAgICAgICAgKCBlbmNvZGluZy5pc1R5cGUocy5uYW1lLFQpICYmIGVuY29kaW5nLmZuKHMubmFtZSkgPT09ICd5ZWFyJyA/IGZhbHNlIDogdHJ1ZSApO1xuICAgICAgICBzLnJldmVyc2UgPSBzcGVjLnJldmVyc2U7XG4gICAgICB9XG4gICAgICBzLnJvdW5kID0gdHJ1ZTtcbiAgICAgIGlmIChzLnR5cGUgPT09ICd0aW1lJykge1xuICAgICAgICBzLm5pY2UgPSBlbmNvZGluZy5mbihzLm5hbWUpO1xuICAgICAgfWVsc2Uge1xuICAgICAgICBzLm5pY2UgPSB0cnVlO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSBZOlxuICAgICAgaWYgKHMudHlwZSA9PT0gJ29yZGluYWwnKSB7XG4gICAgICAgIHMuYmFuZFdpZHRoID0gZW5jb2RpbmcuYmFuZFNpemUoWSwgbGF5b3V0LnkudXNlU21hbGxCYW5kKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHMucmFuZ2UgPSBsYXlvdXQuY2VsbEhlaWdodCA/IFtsYXlvdXQuY2VsbEhlaWdodCwgMF0gOiAnaGVpZ2h0JztcbiAgICAgICAgcy56ZXJvID0gc3BlYy56ZXJvIHx8XG4gICAgICAgICAgKCBlbmNvZGluZy5pc1R5cGUocy5uYW1lLCBUKSAmJiBlbmNvZGluZy5mbihzLm5hbWUpID09PSAneWVhcicgPyBmYWxzZSA6IHRydWUgKTtcbiAgICAgICAgcy5yZXZlcnNlID0gc3BlYy5yZXZlcnNlO1xuICAgICAgfVxuXG4gICAgICBzLnJvdW5kID0gdHJ1ZTtcblxuICAgICAgaWYgKHMudHlwZSA9PT0gJ3RpbWUnKSB7XG4gICAgICAgIHMubmljZSA9IGVuY29kaW5nLmZuKHMubmFtZSkgfHwgZW5jb2RpbmcuY29uZmlnKCd0aW1lU2NhbGVOaWNlJyk7XG4gICAgICB9ZWxzZSB7XG4gICAgICAgIHMubmljZSA9IHRydWU7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlIFJPVzogLy8gc3VwcG9ydCBvbmx5IG9yZGluYWxcbiAgICAgIHMuYmFuZFdpZHRoID0gbGF5b3V0LmNlbGxIZWlnaHQ7XG4gICAgICBzLnJvdW5kID0gdHJ1ZTtcbiAgICAgIHMubmljZSA9IHRydWU7XG4gICAgICBicmVhaztcbiAgICBjYXNlIENPTDogLy8gc3VwcG9ydCBvbmx5IG9yZGluYWxcbiAgICAgIHMuYmFuZFdpZHRoID0gbGF5b3V0LmNlbGxXaWR0aDtcbiAgICAgIHMucm91bmQgPSB0cnVlO1xuICAgICAgcy5uaWNlID0gdHJ1ZTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgU0laRTpcbiAgICAgIGlmIChlbmNvZGluZy5pcygnYmFyJykpIHtcbiAgICAgICAgLy8gRklYTUUgdGhpcyBpcyBkZWZpbml0ZWx5IGluY29ycmVjdFxuICAgICAgICAvLyBidXQgbGV0J3MgZml4IGl0IGxhdGVyIHNpbmNlIGJhciBzaXplIGlzIGEgYmFkIGVuY29kaW5nIGFueXdheVxuICAgICAgICBzLnJhbmdlID0gWzMsIE1hdGgubWF4KGVuY29kaW5nLmJhbmRTaXplKFgpLCBlbmNvZGluZy5iYW5kU2l6ZShZKSldO1xuICAgICAgfSBlbHNlIGlmIChlbmNvZGluZy5pcyhURVhUKSkge1xuICAgICAgICBzLnJhbmdlID0gWzgsIDQwXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHMucmFuZ2UgPSBbMTAsIDEwMDBdO1xuICAgICAgfVxuICAgICAgcy5yb3VuZCA9IHRydWU7XG4gICAgICBzLnplcm8gPSBmYWxzZTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgU0hBUEU6XG4gICAgICBzLnJhbmdlID0gJ3NoYXBlcyc7XG4gICAgICBicmVhaztcbiAgICBjYXNlIENPTE9SOlxuICAgICAgdmFyIHJhbmdlID0gZW5jb2Rpbmcuc2NhbGUoQ09MT1IpLnJhbmdlO1xuICAgICAgaWYgKHJhbmdlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKHMudHlwZSA9PT0gJ29yZGluYWwnKSB7XG4gICAgICAgICAgcmFuZ2UgPSAnY2F0ZWdvcnkxMCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmFuZ2UgPSBbJyNkZGYnLCAnc3RlZWxibHVlJ107XG4gICAgICAgICAgcy56ZXJvID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHMucmFuZ2UgPSByYW5nZTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgQUxQSEE6XG4gICAgICBzLnJhbmdlID0gWzAuMiwgMS4wXTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcgbmFtZTogJysgcy5uYW1lKTtcbiAgfVxuXG4gIHN3aXRjaCAocy5uYW1lKSB7XG4gICAgY2FzZSBST1c6XG4gICAgY2FzZSBDT0w6XG4gICAgICBzLnBhZGRpbmcgPSBlbmNvZGluZy5jb25maWcoJ2NlbGxQYWRkaW5nJyk7XG4gICAgICBzLm91dGVyUGFkZGluZyA9IDA7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFg6XG4gICAgY2FzZSBZOlxuICAgICAgaWYgKHMudHlwZSA9PT0gJ29yZGluYWwnKSB7IC8vJiYgIXMuYmFuZFdpZHRoXG4gICAgICAgIHMucG9pbnRzID0gdHJ1ZTtcbiAgICAgICAgcy5wYWRkaW5nID0gZW5jb2RpbmcuYmFuZChzLm5hbWUpLnBhZGRpbmc7XG4gICAgICB9XG4gIH1cbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgZ2xvYmFscyA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKSxcbiAgbWFya3MgPSByZXF1aXJlKCcuL21hcmtzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gc3RhY2tpbmc7XG5cbmZ1bmN0aW9uIHN0YWNraW5nKHNwZWMsIGVuY29kaW5nLCBtZGVmLCBmYWNldHMpIHtcbiAgaWYgKCFtYXJrc1tlbmNvZGluZy5tYXJrdHlwZSgpXS5zdGFjaykgcmV0dXJuIGZhbHNlO1xuXG4gIC8vIFRPRE86IGFkZCB8fCBlbmNvZGluZy5oYXMoTE9EKSBoZXJlIG9uY2UgTE9EIGlzIGltcGxlbWVudGVkXG4gIGlmICghZW5jb2RpbmcuaGFzKENPTE9SKSkgcmV0dXJuIGZhbHNlO1xuXG4gIHZhciBkaW09bnVsbCwgdmFsPW51bGwsIGlkeCA9bnVsbCxcbiAgICBpc1hNZWFzdXJlID0gZW5jb2RpbmcuaXNNZWFzdXJlKFgpLFxuICAgIGlzWU1lYXN1cmUgPSBlbmNvZGluZy5pc01lYXN1cmUoWSk7XG5cbiAgaWYgKGlzWE1lYXN1cmUgJiYgIWlzWU1lYXN1cmUpIHtcbiAgICBkaW0gPSBZO1xuICAgIHZhbCA9IFg7XG4gICAgaWR4ID0gMDtcbiAgfSBlbHNlIGlmIChpc1lNZWFzdXJlICYmICFpc1hNZWFzdXJlKSB7XG4gICAgZGltID0gWDtcbiAgICB2YWwgPSBZO1xuICAgIGlkeCA9IDE7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGw7IC8vIG5vIHN0YWNrIGVuY29kaW5nXG4gIH1cblxuICAvLyBhZGQgdHJhbnNmb3JtIHRvIGNvbXB1dGUgc3VtcyBmb3Igc2NhbGVcbiAgdmFyIHN0YWNrZWQgPSB7XG4gICAgbmFtZTogU1RBQ0tFRCxcbiAgICBzb3VyY2U6IFRBQkxFLFxuICAgIHRyYW5zZm9ybTogW3tcbiAgICAgIHR5cGU6ICdhZ2dyZWdhdGUnLFxuICAgICAgZ3JvdXBieTogW2VuY29kaW5nLmZpZWxkKGRpbSldLmNvbmNhdChmYWNldHMpLCAvLyBkaW0gYW5kIG90aGVyIGZhY2V0c1xuICAgICAgZmllbGRzOiBbe29wOiAnc3VtJywgZmllbGQ6IGVuY29kaW5nLmZpZWxkKHZhbCl9XSAvLyBUT0RPIGNoZWNrIGlmIGZpZWxkIHdpdGggYWdnciBpcyBjb3JyZWN0P1xuICAgIH1dXG4gIH07XG5cbiAgaWYgKGZhY2V0cyAmJiBmYWNldHMubGVuZ3RoID4gMCkge1xuICAgIHN0YWNrZWQudHJhbnNmb3JtLnB1c2goeyAvL2NhbGN1bGF0ZSBtYXggZm9yIGVhY2ggZmFjZXRcbiAgICAgIHR5cGU6ICdhZ2dyZWdhdGUnLFxuICAgICAgZ3JvdXBieTogZmFjZXRzLFxuICAgICAgZmllbGRzOiBbe29wOiAnbWF4JywgZmllbGQ6ICdkYXRhLnN1bV8nICsgZW5jb2RpbmcuZmllbGQodmFsLCB0cnVlKX1dXG4gICAgfSk7XG4gIH1cblxuICBzcGVjLmRhdGEucHVzaChzdGFja2VkKTtcblxuICAvLyBhZGQgc3RhY2sgdHJhbnNmb3JtIHRvIG1hcmtcbiAgbWRlZi5mcm9tLnRyYW5zZm9ybSA9IFt7XG4gICAgdHlwZTogJ3N0YWNrJyxcbiAgICBwb2ludDogZW5jb2RpbmcuZmllbGQoZGltKSxcbiAgICBoZWlnaHQ6IGVuY29kaW5nLmZpZWxkKHZhbCksXG4gICAgb3V0cHV0OiB7eTE6IHZhbCwgeTA6IHZhbCArICcyJ31cbiAgfV07XG5cbiAgLy8gVE9ETzogVGhpcyBpcyBzdXBlciBoYWNrLWlzaCAtLSBjb25zb2xpZGF0ZSBpbnRvIG1vZHVsYXIgbWFyayBwcm9wZXJ0aWVzP1xuICBtZGVmLnByb3BlcnRpZXMudXBkYXRlW3ZhbF0gPSBtZGVmLnByb3BlcnRpZXMuZW50ZXJbdmFsXSA9IHtzY2FsZTogdmFsLCBmaWVsZDogdmFsfTtcbiAgbWRlZi5wcm9wZXJ0aWVzLnVwZGF0ZVt2YWwgKyAnMiddID0gbWRlZi5wcm9wZXJ0aWVzLmVudGVyW3ZhbCArICcyJ10gPSB7c2NhbGU6IHZhbCwgZmllbGQ6IHZhbCArICcyJ307XG5cbiAgcmV0dXJuIHZhbDsgLy9yZXR1cm4gc3RhY2sgZW5jb2Rpbmdcbn1cbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9nbG9iYWxzJyk7XG5cbnZhciBncm91cGRlZiA9IHJlcXVpcmUoJy4vZ3JvdXAnKS5kZWY7XG5cbm1vZHVsZS5leHBvcnRzID0gc3ViZmFjZXRpbmc7XG5cbmZ1bmN0aW9uIHN1YmZhY2V0aW5nKGdyb3VwLCBtZGVmLCBkZXRhaWxzLCBzdGFjaywgZW5jb2RpbmcpIHtcbiAgdmFyIG0gPSBncm91cC5tYXJrcyxcbiAgICBnID0gZ3JvdXBkZWYoJ3N1YmZhY2V0Jywge21hcmtzOiBtfSk7XG5cbiAgZ3JvdXAubWFya3MgPSBbZ107XG4gIGcuZnJvbSA9IG1kZWYuZnJvbTtcbiAgZGVsZXRlIG1kZWYuZnJvbTtcblxuICAvL1RPRE8gdGVzdCBMT0QgLS0gd2Ugc2hvdWxkIHN1cHBvcnQgc3RhY2sgLyBsaW5lIHdpdGhvdXQgY29sb3IgKExPRCkgZmllbGRcbiAgdmFyIHRyYW5zID0gKGcuZnJvbS50cmFuc2Zvcm0gfHwgKGcuZnJvbS50cmFuc2Zvcm0gPSBbXSkpO1xuICB0cmFucy51bnNoaWZ0KHt0eXBlOiAnZmFjZXQnLCBrZXlzOiBkZXRhaWxzfSk7XG5cbiAgaWYgKHN0YWNrICYmIGVuY29kaW5nLmhhcyhDT0xPUikpIHtcbiAgICB0cmFucy51bnNoaWZ0KHt0eXBlOiAnc29ydCcsIGJ5OiBlbmNvZGluZy5maWVsZChDT0xPUil9KTtcbiAgfVxufVxuIiwidmFyIGdsb2JhbHMgPSByZXF1aXJlKCcuLi9nbG9iYWxzJyk7XG5cbnZhciBncm91cGRlZiA9IHJlcXVpcmUoJy4vZ3JvdXAnKS5kZWYsXG4gIHZsZGF0YSA9IHJlcXVpcmUoJy4uL2RhdGEnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB0ZW1wbGF0ZTtcblxuZnVuY3Rpb24gdGVtcGxhdGUoZW5jb2RpbmcsIGxheW91dCwgc3RhdHMpIHsgLy9oYWNrIHVzZSBzdGF0c1xuXG4gIHZhciBkYXRhID0ge25hbWU6IFRBQkxFLCBmb3JtYXQ6IHt0eXBlOiBlbmNvZGluZy5jb25maWcoJ2RhdGFGb3JtYXRUeXBlJyl9fSxcbiAgICBkYXRhVXJsID0gdmxkYXRhLmdldFVybChlbmNvZGluZywgc3RhdHMpO1xuICBpZiAoZGF0YVVybCkgZGF0YS51cmwgPSBkYXRhVXJsO1xuXG4gIHZhciBwcmVhZ2dyZWdhdGVkRGF0YSA9IGVuY29kaW5nLmNvbmZpZygndXNlVmVnYVNlcnZlcicpO1xuXG4gIGVuY29kaW5nLmZvckVhY2goZnVuY3Rpb24oZW5jVHlwZSwgZmllbGQpIHtcbiAgICB2YXIgbmFtZTtcbiAgICBpZiAoZmllbGQudHlwZSA9PSBUKSB7XG4gICAgICBkYXRhLmZvcm1hdC5wYXJzZSA9IGRhdGEuZm9ybWF0LnBhcnNlIHx8IHt9O1xuICAgICAgZGF0YS5mb3JtYXQucGFyc2VbZmllbGQubmFtZV0gPSAnZGF0ZSc7XG4gICAgfWVsc2UgaWYgKGZpZWxkLnR5cGUgPT0gUSkge1xuICAgICAgZGF0YS5mb3JtYXQucGFyc2UgPSBkYXRhLmZvcm1hdC5wYXJzZSB8fCB7fTtcbiAgICAgIGlmIChmaWVsZC5hZ2dyID09PSAnY291bnQnKSB7XG4gICAgICAgIG5hbWUgPSAnY291bnQnO1xuICAgICAgfSBlbHNlIGlmIChwcmVhZ2dyZWdhdGVkRGF0YSAmJiBmaWVsZC5iaW4pIHtcbiAgICAgICAgbmFtZSA9ICdiaW5fJyArIGZpZWxkLm5hbWU7XG4gICAgICB9IGVsc2UgaWYgKHByZWFnZ3JlZ2F0ZWREYXRhICYmIGZpZWxkLmFnZ3IpIHtcbiAgICAgICAgbmFtZSA9IGZpZWxkLmFnZ3IgKyAnXycgKyBmaWVsZC5uYW1lO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmFtZSA9IGZpZWxkLm5hbWU7XG4gICAgICB9XG4gICAgICBkYXRhLmZvcm1hdC5wYXJzZVtuYW1lXSA9ICdudW1iZXInO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHtcbiAgICB3aWR0aDogbGF5b3V0LndpZHRoLFxuICAgIGhlaWdodDogbGF5b3V0LmhlaWdodCxcbiAgICBwYWRkaW5nOiAnYXV0bycsXG4gICAgZGF0YTogW2RhdGFdLFxuICAgIG1hcmtzOiBbZ3JvdXBkZWYoJ2NlbGwnLCB7XG4gICAgICB3aWR0aDogbGF5b3V0LmNlbGxXaWR0aCA/IHt2YWx1ZTogbGF5b3V0LmNlbGxXaWR0aH0gOiB1bmRlZmluZWQsXG4gICAgICBoZWlnaHQ6IGxheW91dC5jZWxsSGVpZ2h0ID8ge3ZhbHVlOiBsYXlvdXQuY2VsbEhlaWdodH0gOiB1bmRlZmluZWRcbiAgICB9KV1cbiAgfTtcbn1cbiIsInZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRpbWU7XG5cbmZ1bmN0aW9uIHRpbWUoc3BlYywgZW5jb2RpbmcsIG9wdCkge1xuICB2YXIgdGltZUZpZWxkcyA9IHt9LCB0aW1lRm4gPSB7fTtcblxuICAvLyBmaW5kIHVuaXF1ZSBmb3JtdWxhIHRyYW5zZm9ybWF0aW9uIGFuZCBiaW4gZnVuY3Rpb25cbiAgZW5jb2RpbmcuZm9yRWFjaChmdW5jdGlvbihlbmNUeXBlLCBmaWVsZCkge1xuICAgIGlmIChmaWVsZC50eXBlID09PSBUICYmIGZpZWxkLmZuKSB7XG4gICAgICB0aW1lRmllbGRzW2VuY29kaW5nLmZpZWxkKGVuY1R5cGUpXSA9IHtcbiAgICAgICAgZmllbGQ6IGZpZWxkLFxuICAgICAgICBlbmNUeXBlOiBlbmNUeXBlXG4gICAgICB9O1xuICAgICAgdGltZUZuW2ZpZWxkLmZuXSA9IHRydWU7XG4gICAgfVxuICB9KTtcblxuICAvLyBhZGQgZm9ybXVsYSB0cmFuc2Zvcm1cbiAgdmFyIGRhdGEgPSBzcGVjLmRhdGFbMF0sXG4gICAgdHJhbnNmb3JtID0gZGF0YS50cmFuc2Zvcm0gPSBkYXRhLnRyYW5zZm9ybSB8fCBbXTtcblxuICBmb3IgKHZhciBmIGluIHRpbWVGaWVsZHMpIHtcbiAgICB2YXIgdGYgPSB0aW1lRmllbGRzW2ZdO1xuICAgIHRpbWUudHJhbnNmb3JtKHRyYW5zZm9ybSwgZW5jb2RpbmcsIHRmLmVuY1R5cGUsIHRmLmZpZWxkKTtcbiAgfVxuXG4gIC8vIGFkZCBzY2FsZXNcbiAgdmFyIHNjYWxlcyA9IHNwZWMuc2NhbGVzID0gc3BlYy5zY2FsZXMgfHwgW107XG4gIGZvciAodmFyIGZuIGluIHRpbWVGbikge1xuICAgIHRpbWUuc2NhbGUoc2NhbGVzLCBmbiwgZW5jb2RpbmcpO1xuICB9XG4gIHJldHVybiBzcGVjO1xufVxuXG50aW1lLmNhcmRpbmFsaXR5ID0gZnVuY3Rpb24oZW5jb2RpbmcsIGVuY1R5cGUsIHN0YXRzKSB7XG4gIHZhciBmbiA9IGVuY29kaW5nLmZuKGVuY1R5cGUpO1xuICBzd2l0Y2ggKGZuKSB7XG4gICAgY2FzZSAnc2Vjb25kJzogcmV0dXJuIDYwO1xuICAgIGNhc2UgJ21pbnV0ZSc6IHJldHVybiA2MDtcbiAgICBjYXNlICdob3VyJzogcmV0dXJuIDI0O1xuICAgIGNhc2UgJ2RheW9md2Vlayc6IHJldHVybiA3O1xuICAgIGNhc2UgJ2RhdGUnOiByZXR1cm4gMzE7XG4gICAgY2FzZSAnbW9udGgnOiByZXR1cm4gMTI7XG4gICAgLy8gY2FzZSAneWVhcic6ICAtLSBuZWVkIHJlYWwgY2FyZGluYWxpdHlcbiAgfVxuXG4gIHZhciBmaWVsZCA9IGVuY29kaW5nLmZpZWxkKGVuY1R5cGUsIC8qbm9kYXRhKi8gdHJ1ZSk7IC8vIGZuX2ZpZWxkbmFtZVxuICByZXR1cm4gc3RhdHNbZmllbGRdLmNhcmRpbmFsaXR5O1xufTtcblxuLyoqXG4gKiBAcmV0dXJuIHtTdHJpbmd9IGRhdGUgYmlubmluZyBmb3JtdWxhIG9mIHRoZSBnaXZlbiBmaWVsZFxuICovXG50aW1lLmZvcm11bGEgPSBmdW5jdGlvbihmaWVsZCkge1xuICB2YXIgZGF0ZSA9ICduZXcgRGF0ZShkLmRhdGEuJysgZmllbGQubmFtZSArICcpJztcbiAgc3dpdGNoIChmaWVsZC5mbikge1xuICAgIGNhc2UgJ3NlY29uZCc6IHJldHVybiBkYXRlICsgJy5nZXRVVENTZWNvbmRzKCknO1xuICAgIGNhc2UgJ21pbnV0ZSc6IHJldHVybiBkYXRlICsgJy5nZXRVVENNaW51dGVzKCknO1xuICAgIGNhc2UgJ2hvdXInOiByZXR1cm4gZGF0ZSArICcuZ2V0VVRDSG91cnMoKSc7XG4gICAgY2FzZSAnZGF5b2Z3ZWVrJzogcmV0dXJuIGRhdGUgKyAnLmdldFVUQ0RheSgpJztcbiAgICBjYXNlICdkYXRlJzogcmV0dXJuIGRhdGUgKyAnLmdldFVUQ0RhdGUoKSc7XG4gICAgY2FzZSAnbW9udGgnOiByZXR1cm4gZGF0ZSArICcuZ2V0VVRDTW9udGgoKSc7XG4gICAgY2FzZSAneWVhcic6IHJldHVybiBkYXRlICsgJy5nZXRVVENGdWxsWWVhcigpJztcbiAgfVxuICAvLyBUT0RPIGFkZCBjb250aW51b3VzIGJpbm5pbmdcbiAgY29uc29sZS5lcnJvcignbm8gZnVuY3Rpb24gc3BlY2lmaWVkIGZvciBkYXRlJyk7XG59O1xuXG4vKiogYWRkIGZvcm11bGEgdHJhbnNmb3JtcyB0byBkYXRhICovXG50aW1lLnRyYW5zZm9ybSA9IGZ1bmN0aW9uKHRyYW5zZm9ybSwgZW5jb2RpbmcsIGVuY1R5cGUsIGZpZWxkKSB7XG4gIHRyYW5zZm9ybS5wdXNoKHtcbiAgICB0eXBlOiAnZm9ybXVsYScsXG4gICAgZmllbGQ6IGVuY29kaW5nLmZpZWxkKGVuY1R5cGUpLFxuICAgIGV4cHI6IHRpbWUuZm9ybXVsYShmaWVsZClcbiAgfSk7XG59O1xuXG4vKiogYXBwZW5kIGN1c3RvbSB0aW1lIHNjYWxlcyBmb3IgYXhpcyBsYWJlbCAqL1xudGltZS5zY2FsZSA9IGZ1bmN0aW9uKHNjYWxlcywgZm4sIGVuY29kaW5nKSB7XG4gIHZhciBsYWJlbExlbmd0aCA9IGVuY29kaW5nLmNvbmZpZygndGltZVNjYWxlTGFiZWxMZW5ndGgnKTtcbiAgLy8gVE9ETyBhZGQgb3B0aW9uIGZvciBzaG9ydGVyIHNjYWxlIC8gY3VzdG9tIHJhbmdlXG4gIHN3aXRjaCAoZm4pIHtcbiAgICBjYXNlICdkYXlvZndlZWsnOlxuICAgICAgc2NhbGVzLnB1c2goe1xuICAgICAgICBuYW1lOiAndGltZS0nK2ZuLFxuICAgICAgICB0eXBlOiAnb3JkaW5hbCcsXG4gICAgICAgIGRvbWFpbjogdXRpbC5yYW5nZSgwLCA3KSxcbiAgICAgICAgcmFuZ2U6IFsnTW9uZGF5JywgJ1R1ZXNkYXknLCAnV2VkbmVzZGF5JywgJ1RodXJzZGF5JywgJ0ZyaWRheScsICdTYXR1cmRheScsICdTdW5kYXknXS5tYXAoXG4gICAgICAgICAgZnVuY3Rpb24ocykgeyByZXR1cm4gcy5zdWJzdHIoMCwgbGFiZWxMZW5ndGgpO31cbiAgICAgICAgKVxuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdtb250aCc6XG4gICAgICBzY2FsZXMucHVzaCh7XG4gICAgICAgIG5hbWU6ICd0aW1lLScrZm4sXG4gICAgICAgIHR5cGU6ICdvcmRpbmFsJyxcbiAgICAgICAgZG9tYWluOiB1dGlsLnJhbmdlKDAsIDEyKSxcbiAgICAgICAgcmFuZ2U6IFsnSmFudWFyeScsICdGZWJydWFyeScsICdNYXJjaCcsICdBcHJpbCcsICdNYXknLCAnSnVuZScsICdKdWx5JywgJ0F1Z3VzdCcsICdTZXB0ZW1iZXInLCAnT2N0b2JlcicsICdOb3ZlbWJlcicsICdEZWNlbWJlciddLm1hcChcbiAgICAgICAgICAgIGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMuc3Vic3RyKDAsIGxhYmVsTGVuZ3RoKTt9XG4gICAgICAgICAgKVxuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgfVxufTtcblxudGltZS5pc09yZGluYWxGbiA9IGZ1bmN0aW9uKGZuKSB7XG4gIHN3aXRjaCAoZm4pIHtcbiAgICBjYXNlICdzZWNvbmQnOlxuICAgIGNhc2UgJ21pbnV0ZSc6XG4gICAgY2FzZSAnaG91cic6XG4gICAgY2FzZSAnZGF5b2Z3ZWVrJzpcbiAgICBjYXNlICdkYXRlJzpcbiAgICBjYXNlICdtb250aCc6XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG50aW1lLnNjYWxlLnR5cGUgPSBmdW5jdGlvbihmbikge1xuICByZXR1cm4gdGltZS5pc09yZGluYWxGbihmbikgPyAnb3JkaW5hbCcgOiAnbGluZWFyJztcbn07XG5cbnRpbWUuc2NhbGUuZG9tYWluID0gZnVuY3Rpb24oZm4pIHtcbiAgc3dpdGNoIChmbikge1xuICAgIGNhc2UgJ3NlY29uZCc6XG4gICAgY2FzZSAnbWludXRlJzogcmV0dXJuIHV0aWwucmFuZ2UoMCwgNjApO1xuICAgIGNhc2UgJ2hvdXInOiByZXR1cm4gdXRpbC5yYW5nZSgwLCAyNCk7XG4gICAgY2FzZSAnZGF5b2Z3ZWVrJzogcmV0dXJuIHV0aWwucmFuZ2UoMCwgNyk7XG4gICAgY2FzZSAnZGF0ZSc6IHJldHVybiB1dGlsLnJhbmdlKDAsIDMyKTtcbiAgICBjYXNlICdtb250aCc6IHJldHVybiB1dGlsLnJhbmdlKDAsIDEyKTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG5cbi8qKiB3aGV0aGVyIGEgcGFydGljdWxhciB0aW1lIGZ1bmN0aW9uIGhhcyBjdXN0b20gc2NhbGUgZm9yIGxhYmVscyBpbXBsZW1lbnRlZCBpbiB0aW1lLnNjYWxlICovXG50aW1lLmhhc1NjYWxlID0gZnVuY3Rpb24oZm4pIHtcbiAgc3dpdGNoIChmbikge1xuICAgIGNhc2UgJ2RheW9md2Vlayc6XG4gICAgY2FzZSAnbW9udGgnOlxuICAgICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuXG4iLCJ2YXIgZ2xvYmFscyA9IHJlcXVpcmUoJy4vZ2xvYmFscycpO1xuXG52YXIgY29uc3RzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuY29uc3RzLmVuY29kaW5nVHlwZXMgPSBbWCwgWSwgUk9XLCBDT0wsIFNJWkUsIFNIQVBFLCBDT0xPUiwgQUxQSEEsIFRFWFRdO1xuXG5jb25zdHMuZGF0YVR5cGVzID0geydPJzogTywgJ1EnOiBRLCAnVCc6IFR9O1xuXG5jb25zdHMuZGF0YVR5cGVOYW1lcyA9IFsnTycsICdRJywgJ1QnXS5yZWR1Y2UoZnVuY3Rpb24ociwgeCkge1xuICByW2NvbnN0cy5kYXRhVHlwZXNbeF1dID0geDsgcmV0dXJuIHI7XG59LHt9KTtcbiIsIi8vIFRPRE8gcmVuYW1lIGdldERhdGFVcmwgdG8gdmwuZGF0YS5nZXRVcmwoKSA/XG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbnZhciB2bGRhdGEgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG52bGRhdGEuZ2V0VXJsID0gZnVuY3Rpb24gZ2V0RGF0YVVybChlbmNvZGluZywgc3RhdHMpIHtcbiAgaWYgKCFlbmNvZGluZy5jb25maWcoJ3VzZVZlZ2FTZXJ2ZXInKSkge1xuICAgIC8vIGRvbid0IHVzZSB2ZWdhIHNlcnZlclxuICAgIHJldHVybiBlbmNvZGluZy5jb25maWcoJ2RhdGFVcmwnKTtcbiAgfVxuXG4gIGlmIChlbmNvZGluZy5sZW5ndGgoKSA9PT0gMCkge1xuICAgIC8vIG5vIGZpZWxkc1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBmaWVsZHMgPSBbXTtcbiAgZW5jb2RpbmcuZm9yRWFjaChmdW5jdGlvbihlbmNUeXBlLCBmaWVsZCkge1xuICAgIHZhciBvYmogPSB7XG4gICAgICBuYW1lOiBlbmNvZGluZy5maWVsZChlbmNUeXBlLCB0cnVlKSxcbiAgICAgIGZpZWxkOiBmaWVsZC5uYW1lXG4gICAgfTtcbiAgICBpZiAoZmllbGQuYWdncikge1xuICAgICAgb2JqLmFnZ3IgPSBmaWVsZC5hZ2dyO1xuICAgIH1cbiAgICBpZiAoZmllbGQuYmluKSB7XG4gICAgICBvYmouYmluU2l6ZSA9IHV0aWwuZ2V0YmlucyhzdGF0c1tmaWVsZC5uYW1lXSwgZW5jb2RpbmcuY29uZmlnKCdtYXhiaW5zJykpLnN0ZXA7XG4gICAgfVxuICAgIGZpZWxkcy5wdXNoKG9iaik7XG4gIH0pO1xuXG4gIHZhciBxdWVyeSA9IHtcbiAgICB0YWJsZTogZW5jb2RpbmcuY29uZmlnKCd2ZWdhU2VydmVyVGFibGUnKSxcbiAgICBmaWVsZHM6IGZpZWxkc1xuICB9O1xuXG4gIHJldHVybiBlbmNvZGluZy5jb25maWcoJ3ZlZ2FTZXJ2ZXJVcmwnKSArICcvcXVlcnkvP3E9JyArIEpTT04uc3RyaW5naWZ5KHF1ZXJ5KTtcbn07XG5cbi8qKlxuICogQHBhcmFtICB7T2JqZWN0fSBkYXRhIGRhdGEgaW4gSlNPTi9qYXZhc2NyaXB0IG9iamVjdCBmb3JtYXRcbiAqIEByZXR1cm4gQXJyYXkgb2Yge25hbWU6IF9fbmFtZV9fLCB0eXBlOiBcIm51bWJlcnx0ZXh0fHRpbWV8bG9jYXRpb25cIn1cbiAqL1xudmxkYXRhLmdldFNjaGVtYSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgdmFyIHNjaGVtYSA9IFtdLFxuICAgIGZpZWxkcyA9IHV0aWwua2V5cyhkYXRhWzBdKTtcblxuICBmaWVsZHMuZm9yRWFjaChmdW5jdGlvbihrKSB7XG4gICAgLy8gZmluZCBub24tbnVsbCBkYXRhXG4gICAgdmFyIGkgPSAwLCBkYXR1bSA9IGRhdGFbaV1ba107XG4gICAgd2hpbGUgKGRhdHVtID09PSAnJyB8fCBkYXR1bSA9PT0gbnVsbCB8fCBkYXR1bSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBkYXR1bSA9IGRhdGFbKytpXVtrXTtcbiAgICB9XG5cbiAgICAvL1RPRE8oa2FuaXR3KTogYmV0dGVyIHR5cGUgaW5mZXJlbmNlIGhlcmVcbiAgICB2YXIgdHlwZSA9ICh0eXBlb2YgZGF0dW0gPT09ICdudW1iZXInKSA/ICdRJzpcbiAgICAgIGlzTmFOKERhdGUucGFyc2UoZGF0dW0pKSA/ICdPJyA6ICdUJztcblxuICAgIHNjaGVtYS5wdXNoKHtuYW1lOiBrLCB0eXBlOiB0eXBlfSk7XG4gIH0pO1xuXG4gIHJldHVybiBzY2hlbWE7XG59O1xuXG52bGRhdGEuZ2V0U3RhdHMgPSBmdW5jdGlvbihkYXRhKSB7IC8vIGhhY2tcbiAgdmFyIHN0YXRzID0ge30sXG4gICAgZmllbGRzID0gdXRpbC5rZXlzKGRhdGFbMF0pO1xuXG4gIGZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uKGspIHtcbiAgICB2YXIgc3RhdCA9IHV0aWwubWlubWF4KGRhdGEsIGspO1xuICAgIHN0YXQuY2FyZGluYWxpdHkgPSB1dGlsLnVuaXEoZGF0YSwgayk7XG4gICAgc3RhdC5tYXhsZW5ndGggPSBkYXRhLnJlZHVjZShmdW5jdGlvbihtYXgscm93KSB7XG4gICAgICB2YXIgbGVuID0gcm93W2tdLnRvU3RyaW5nKCkubGVuZ3RoO1xuICAgICAgcmV0dXJuIGxlbiA+IG1heCA/IGxlbiA6IG1heDtcbiAgICB9LCAwKTtcbiAgICBzdGF0LmNvdW50ID0gZGF0YS5sZW5ndGg7XG4gICAgc3RhdHNba10gPSBzdGF0O1xuICB9KTtcbiAgcmV0dXJuIHN0YXRzO1xufTtcbiIsIi8vIHV0aWxpdHkgZm9yIGZpZWxkXG5cbnZhciBjb25zdHMgPSByZXF1aXJlKCcuL2NvbnN0cycpLFxuICB0aW1lID0gcmVxdWlyZSgnLi9jb21waWxlL3RpbWUnKTtcblxudmFyIHZsZmllbGQgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG52bGZpZWxkLnNob3J0aGFuZCA9IGZ1bmN0aW9uKGYpIHtcbiAgcmV0dXJuIChmLmFnZ3IgPyBmLmFnZ3IgKyAnXycgOiAnJykgK1xuICAgIChmLmZuID8gZi5mbiArICdfJyA6ICcnKSArXG4gICAgKGYuYmluID8gJ2Jpbl8nIDogJycpICtcbiAgICAoZi5uYW1lIHx8ICcnKSArICctJyArXG4gICAgKGNvbnN0cy5kYXRhVHlwZU5hbWVzW2YudHlwZV0gfHwgZi50eXBlKTtcbn07XG5cbnZsZmllbGQuc2hvcnRoYW5kcyA9IGZ1bmN0aW9uKGZpZWxkcywgZGVsaW0pe1xuICBkZWxpbSA9IGRlbGltIHx8ICcsJztcbiAgcmV0dXJuIGZpZWxkcy5tYXAodmxmaWVsZC5zaG9ydGhhbmQpLmpvaW4oZGVsaW0pO1xufTtcblxudmFyIHR5cGVPcmRlciA9IHtcbiAgTzogMCxcbiAgRzogMSxcbiAgVDogMixcbiAgUTogM1xufTtcblxudmxmaWVsZC5vcmRlciA9IHt9O1xuXG52bGZpZWxkLm9yZGVyLnR5cGVUaGVuTmFtZSA9IGZ1bmN0aW9uKGZpZWxkKSB7XG4gIHJldHVybiB0eXBlT3JkZXJbZmllbGQudHlwZV0gKyAnXycgKyBmaWVsZC5uYW1lO1xufTtcblxudmxmaWVsZC5vcmRlci5vcmlnaW5hbCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gMDsgLy8gbm8gc3dhcCB3aWxsIG9jY3VyXG59O1xuXG52bGZpZWxkLm9yZGVyLm5hbWUgPSBmdW5jdGlvbihmaWVsZCkge1xuICByZXR1cm4gZmllbGQubmFtZTtcbn07XG5cbnZsZmllbGQub3JkZXIudHlwZVRoZW5DYXJkaW5hbGl0eSA9IGZ1bmN0aW9uKGZpZWxkLCBzdGF0cyl7XG4gIHJldHVybiBzdGF0c1tmaWVsZC5uYW1lXS5jYXJkaW5hbGl0eTtcbn07XG5cbnZsZmllbGQuaXNPcmRpbmFsU2NhbGUgPSBmdW5jdGlvbihmaWVsZCwgaXNUeXBlIC8qb3B0aW9uYWwqLykge1xuICBpc1R5cGUgPSBpc1R5cGUgfHwgZnVuY3Rpb24oZmllbGQsIHR5cGUpIHtcbiAgICByZXR1cm4gZmllbGQudHlwZSA9PT0gY29uc3RzLmRhdGFUeXBlTmFtZXNbdHlwZV07XG4gIH07XG5cbiAgdmFyIGZuO1xuICByZXR1cm4gIGlzVHlwZShmaWVsZCwgTykgfHwgZmllbGQuYmluIHx8XG4gICAgKCBpc1R5cGUoZmllbGQsIFQpICYmIGZpZWxkLmZuICYmIHRpbWUuaXNPcmRpbmFsRm4oZmllbGQuZm4pICk7XG59O1xuXG52bGZpZWxkLmNvdW50ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7bmFtZTonKicsIGFnZ3I6ICdjb3VudCcsIHR5cGU6J1EnLCBkaXNwbGF5TmFtZTonQ09VTlQnfTtcbn07XG5cbnZsZmllbGQuaXNDb3VudCA9IGZ1bmN0aW9uKGZpZWxkKSB7XG4gIHJldHVybiBmaWVsZC5hZ2dyID09PSAnY291bnQnO1xufTtcbiIsIi8vIGRlY2xhcmUgZ2xvYmFsIGNvbnN0YW50XG52YXIgZyA9IGdsb2JhbCB8fCB3aW5kb3c7XG5cbmcuVEFCTEUgPSAndGFibGUnO1xuZy5TVEFDS0VEID0gJ3N0YWNrZWQnO1xuZy5JTkRFWCA9ICdpbmRleCc7XG5cbmcuWCA9ICd4JztcbmcuWSA9ICd5JztcbmcuUk9XID0gJ3Jvdyc7XG5nLkNPTCA9ICdjb2wnO1xuZy5TSVpFID0gJ3NpemUnO1xuZy5TSEFQRSA9ICdzaGFwZSc7XG5nLkNPTE9SID0gJ2NvbG9yJztcbmcuQUxQSEEgPSAnYWxwaGEnO1xuZy5URVhUID0gJ3RleHQnO1xuXG5nLk8gPSAxO1xuZy5RID0gMjtcbmcuVCA9IDQ7XG4iLCIvLyBQYWNrYWdlIG9mIGRlZmluaW5nIFZlZ2FsaXRlIFNwZWNpZmljYXRpb24ncyBqc29uIHNjaGVtYVxuXG52YXIgc2NoZW1hID0gbW9kdWxlLmV4cG9ydHMgPSB7fSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcblxuc2NoZW1hLnV0aWwgPSByZXF1aXJlKCcuL3NjaGVtYXV0aWwnKTtcblxuc2NoZW1hLm1hcmt0eXBlID0ge1xuICB0eXBlOiAnc3RyaW5nJyxcbiAgZW51bTogWydwb2ludCcsICdiYXInLCAnbGluZScsICdhcmVhJywgJ2NpcmNsZScsICdzcXVhcmUnLCAndGV4dCddXG59O1xuXG5zY2hlbWEuYWdnciA9IHtcbiAgdHlwZTogJ3N0cmluZycsXG4gIGVudW06IFsnYXZnJywgJ3N1bScsICdtaW4nLCAnbWF4JywgJ2NvdW50J10sXG4gIHN1cHBvcnRlZEVudW1zOiB7XG4gICAgUTogWydhdmcnLCAnc3VtJywgJ21pbicsICdtYXgnLCAnY291bnQnXSxcbiAgICBPOiBbXSxcbiAgICBUOiBbJ2F2ZycsICdtaW4nLCAnbWF4J10sXG4gICAgJyc6IFsnY291bnQnXVxuICB9LFxuICBzdXBwb3J0ZWRUeXBlczogeydRJzogdHJ1ZSwgJ08nOiB0cnVlLCAnVCc6IHRydWUsICcnOiB0cnVlfVxufTtcblxuc2NoZW1hLmJhbmQgPSB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgc2l6ZToge1xuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgbWluaW11bTogMFxuICAgIH0sXG4gICAgcGFkZGluZzoge1xuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgbWluaW11bTogMCxcbiAgICAgIGRlZmF1bHQ6IDFcbiAgICB9XG4gIH1cbn07XG5cbnNjaGVtYS50aW1lZm5zID0gWydtb250aCcsICd5ZWFyJywgJ2RheW9md2VlaycsICdkYXRlJywgJ2hvdXInLCAnbWludXRlJywgJ3NlY29uZCddO1xuXG5zY2hlbWEuZm4gPSB7XG4gIHR5cGU6ICdzdHJpbmcnLFxuICBlbnVtOiBzY2hlbWEudGltZWZucyxcbiAgc3VwcG9ydGVkVHlwZXM6IHsnVCc6IHRydWV9XG59O1xuXG4vL1RPRE8oa2FuaXR3KTogYWRkIG90aGVyIHR5cGUgb2YgZnVuY3Rpb24gaGVyZVxuXG5zY2hlbWEuc2NhbGVfdHlwZSA9IHtcbiAgdHlwZTogJ3N0cmluZycsXG4gIGVudW06IFsnbGluZWFyJywgJ2xvZycsICdwb3cnLCAnc3FydCcsICdxdWFudGlsZSddLFxuICBkZWZhdWx0OiAnbGluZWFyJyxcbiAgc3VwcG9ydGVkVHlwZXM6IHsnUSc6IHRydWV9XG59O1xuXG5zY2hlbWEuZmllbGQgPSB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgbmFtZToge1xuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICB9XG4gIH1cbn07XG5cbnZhciBjbG9uZSA9IHV0aWwuZHVwbGljYXRlO1xudmFyIG1lcmdlID0gc2NoZW1hLnV0aWwubWVyZ2U7XG5cbnZhciB0eXBpY2FsRmllbGQgPSBtZXJnZShjbG9uZShzY2hlbWEuZmllbGQpLCB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgdHlwZToge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBlbnVtOiBbJ08nLCAnUScsICdUJ11cbiAgICB9LFxuICAgIGJpbjoge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICBzdXBwb3J0ZWRUeXBlczogeydRJzogdHJ1ZX0gLy8gVE9ETzogYWRkICdPJyBhZnRlciBmaW5pc2hpbmcgIzgxXG4gICAgfSxcbiAgICBhZ2dyOiBzY2hlbWEuYWdncixcbiAgICBmbjogc2NoZW1hLmZuLFxuICAgIHNjYWxlOiB7XG4gICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgdHlwZTogc2NoZW1hLnNjYWxlX3R5cGUsXG4gICAgICAgIHJldmVyc2U6IHsgdHlwZTogJ2Jvb2xlYW4nLCBkZWZhdWx0OiBmYWxzZSB9LFxuICAgICAgICB6ZXJvOiB7XG4gICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnSW5jbHVkZSB6ZXJvJyxcbiAgICAgICAgICBzdXBwb3J0ZWRUeXBlczogeydRJzogdHJ1ZX1cbiAgICAgICAgfSxcbiAgICAgICAgbmljZToge1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgIGVudW06IFsnc2Vjb25kJywgJ21pbnV0ZScsICdob3VyJywgJ2RheScsICd3ZWVrJywgJ21vbnRoJywgJ3llYXInXSxcbiAgICAgICAgICBzdXBwb3J0ZWRUeXBlczogeydUJzogdHJ1ZX1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufSk7XG5cbnZhciBvbmx5T3JkaW5hbEZpZWxkID0gbWVyZ2UoY2xvbmUoc2NoZW1hLmZpZWxkKSwge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgcHJvcGVydGllczoge1xuICAgIHR5cGU6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZW51bTogWydPJywnUSddIC8vIG9yZGluYWwtb25seSBmaWVsZCBzdXBwb3J0cyBRIHdoZW4gYmluIGlzIGFwcGxpZWRcbiAgICB9LFxuICAgIGJpbjoge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICBzdXBwb3J0ZWRUeXBlczogeydRJzogdHJ1ZX0gLy8gVE9ETzogYWRkICdPJyBhZnRlciBmaW5pc2hpbmcgIzgxXG4gICAgfSxcbiAgICBhZ2dyOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGVudW06IFsnY291bnQnXSxcbiAgICAgIHN1cHBvcnRlZFR5cGVzOiB7J08nOiB0cnVlfVxuICAgIH1cbiAgfVxufSk7XG5cbnZhciBheGlzTWl4aW4gPSB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgYXhpczoge1xuICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIGdyaWQ6IHtcbiAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdBIGZsYWcgaW5kaWNhdGUgaWYgZ3JpZGxpbmVzIHNob3VsZCBiZSBjcmVhdGVkIGluIGFkZGl0aW9uIHRvIHRpY2tzLidcbiAgICAgICAgfSxcbiAgICAgICAgdGl0bGU6IHtcbiAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0EgdGl0bGUgZm9yIHRoZSBheGlzLidcbiAgICAgICAgfSxcbiAgICAgICAgdGl0bGVPZmZzZXQ6IHtcbiAgICAgICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdBIHRpdGxlIG9mZnNldCB2YWx1ZSBmb3IgdGhlIGF4aXMuJ1xuICAgICAgICB9LFxuICAgICAgICBmb3JtYXQ6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSBmb3JtYXR0aW5nIHBhdHRlcm4gZm9yIGF4aXMgbGFiZWxzLidcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxudmFyIGJhbmRNaXhpbiA9IHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHByb3BlcnRpZXM6IHtcbiAgICBiYW5kOiBzY2hlbWEuYmFuZFxuICB9XG59O1xuXG52YXIgbGVnZW5kTWl4aW4gPSB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgbGVnZW5kOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgfVxuICB9XG59O1xuXG52YXIgdGV4dE1peGluID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgcHJvcGVydGllczoge1xuICAgIHRleHQ6IHtcbiAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgcHJvcGVydGllczoge1xuICAgICAgICB0ZXh0OiB7XG4gICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgYWxpZ246IHtcbiAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgIGRlZmF1bHQ6ICdsZWZ0J1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGJhc2VsaW5lOiB7XG4gICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICBkZWZhdWx0OiAnbWlkZGxlJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1hcmdpbjoge1xuICAgICAgICAgICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICAgICAgICAgIGRlZmF1bHQ6IDQsXG4gICAgICAgICAgICAgIG1pbmltdW06IDBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGZvbnQ6IHtcbiAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICB3ZWlnaHQ6IHtcbiAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgIGVudW06IFsnbm9ybWFsJywgJ2JvbGQnXSxcbiAgICAgICAgICAgICAgZGVmYXVsdDogJ25vcm1hbCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzaXplOiB7XG4gICAgICAgICAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgICAgICAgICAgZGVmYXVsdDogMTAsXG4gICAgICAgICAgICAgIG1pbmltdW06IDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmYW1pbHk6IHtcbiAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgIGRlZmF1bHQ6ICdIZWx2ZXRpY2EgTmV1ZSdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgZGVmYXVsdDogJ25vcm1hbCcsXG4gICAgICAgICAgICAgIGVudW06IFsnbm9ybWFsJywgJ2l0YWxpYyddXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG52YXIgc2l6ZU1peGluID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgcHJvcGVydGllczoge1xuICAgIHZhbHVlOiB7XG4gICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICBkZWZhdWx0OiAzMCxcbiAgICAgIG1pbmltdW06IDBcbiAgICB9XG4gIH1cbn07XG5cbnZhciBjb2xvck1peGluID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgcHJvcGVydGllczoge1xuICAgIHZhbHVlOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlZmF1bHQ6ICdzdGVlbGJsdWUnXG4gICAgfSxcbiAgICBzY2FsZToge1xuICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIHJhbmdlOiB7XG4gICAgICAgICAgdHlwZTogWydzdHJpbmcnLCAnYXJyYXknXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG52YXIgYWxwaGFNaXhpbiA9IHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHByb3BlcnRpZXM6IHtcbiAgICB2YWx1ZToge1xuICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICBkZWZhdWx0OiAxLFxuICAgICAgbWluaW11bTogMCxcbiAgICAgIG1heGltdW06IDFcbiAgICB9XG4gIH1cbn07XG5cbnZhciBzaGFwZU1peGluID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgcHJvcGVydGllczoge1xuICAgIHZhbHVlOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGVudW06IFsnY2lyY2xlJywgJ3NxdWFyZScsICdjcm9zcycsICdkaWFtb25kJywgJ3RyaWFuZ2xlLXVwJywgJ3RyaWFuZ2xlLWRvd24nXSxcbiAgICAgIGRlZmF1bHQ6ICdjaXJjbGUnXG4gICAgfVxuICB9XG59O1xuXG52YXIgcm93TWl4aW4gPSB7XG4gIHByb3BlcnRpZXM6IHtcbiAgICBoZWlnaHQ6IHtcbiAgICAgIHR5cGU6ICdudW1iZXInLFxuICAgICAgbWluaW11bTogMCxcbiAgICAgIGRlZmF1bHQ6IDE1MFxuICAgIH0sXG4gICAgcGFkZGluZzoge1xuICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICBtaW5pbXVtOiAwLFxuICAgICAgbWF4aW11bTogMSxcbiAgICAgIGRlZmF1bHQ6IDAuMVxuICAgIH1cbiAgfVxufTtcblxudmFyIGNvbE1peGluID0ge1xuICBwcm9wZXJ0aWVzOiB7XG4gICAgd2lkdGg6IHtcbiAgICAgIHR5cGU6ICdudW1iZXInLFxuICAgICAgbWluaW11bTogMCxcbiAgICAgIGRlZmF1bHQ6IDE1MFxuICAgIH0sXG4gICAgcGFkZGluZzoge1xuICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICBtaW5pbXVtOiAwLFxuICAgICAgbWF4aW11bTogMSxcbiAgICAgIGRlZmF1bHQ6IDAuMVxuICAgIH1cbiAgfVxufTtcblxudmFyIHJlcXVpcmVkTmFtZVR5cGUgPSB7XG4gIHJlcXVpcmVkOiBbJ25hbWUnLCAndHlwZSddXG59O1xuXG52YXIgeCA9IG1lcmdlKG1lcmdlKG1lcmdlKGNsb25lKHR5cGljYWxGaWVsZCksIGF4aXNNaXhpbiksIGJhbmRNaXhpbiksIHJlcXVpcmVkTmFtZVR5cGUpO1xudmFyIHkgPSBjbG9uZSh4KTtcblxudmFyIGZhY2V0ID0gbWVyZ2UoY2xvbmUob25seU9yZGluYWxGaWVsZCksIHJlcXVpcmVkTmFtZVR5cGUpO1xudmFyIHJvdyA9IG1lcmdlKGNsb25lKGZhY2V0KSwgcm93TWl4aW4pO1xudmFyIGNvbCA9IG1lcmdlKGNsb25lKGZhY2V0KSwgY29sTWl4aW4pO1xuXG52YXIgc2l6ZSA9IG1lcmdlKG1lcmdlKGNsb25lKHR5cGljYWxGaWVsZCksIGxlZ2VuZE1peGluKSwgc2l6ZU1peGluKTtcbnZhciBjb2xvciA9IG1lcmdlKG1lcmdlKGNsb25lKHR5cGljYWxGaWVsZCksIGxlZ2VuZE1peGluKSwgY29sb3JNaXhpbik7XG52YXIgYWxwaGEgPSBtZXJnZShjbG9uZSh0eXBpY2FsRmllbGQpLCBhbHBoYU1peGluKTtcbnZhciBzaGFwZSA9IG1lcmdlKG1lcmdlKGNsb25lKG9ubHlPcmRpbmFsRmllbGQpLCBsZWdlbmRNaXhpbiksIHNoYXBlTWl4aW4pO1xuXG52YXIgdGV4dCA9IG1lcmdlKGNsb25lKHR5cGljYWxGaWVsZCksIHRleHRNaXhpbik7XG5cbnZhciBjZmcgPSB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgLy8gdGVtcGxhdGVcbiAgICB3aWR0aDoge1xuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgZGVmYXVsdDogdW5kZWZpbmVkXG4gICAgfSxcbiAgICBoZWlnaHQ6IHtcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgIGRlZmF1bHQ6IHVuZGVmaW5lZFxuICAgIH0sXG4gICAgdmlld3BvcnQ6IHtcbiAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICBpdGVtczoge1xuICAgICAgICB0eXBlOiBbJ2ludGVnZXInXVxuICAgICAgfSxcbiAgICAgIGRlZmF1bHQ6IHVuZGVmaW5lZFxuICAgIH0sXG4gICAgLy9iaW5uaW5nXG4gICAgbWF4Ymluczoge1xuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgZGVmYXVsdDogMTAsXG4gICAgICBtaW5pbXVtOiAyXG4gICAgfSxcblxuICAgIC8vIHNpbmdsZSBwbG90XG4gICAgc2luZ2xlSGVpZ2h0OiB7XG4gICAgICAvLyB3aWxsIGJlIG92ZXJ3cml0dGVuIGJ5IGJhbmRXaWR0aCAqIChjYXJkaW5hbGl0eSArIHBhZGRpbmcpXG4gICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICBkZWZhdWx0OiAyMDAsXG4gICAgICBtaW5pbXVtOiAwXG4gICAgfSxcbiAgICBzaW5nbGVXaWR0aDoge1xuICAgICAgLy8gd2lsbCBiZSBvdmVyd3JpdHRlbiBieSBiYW5kV2lkdGggKiAoY2FyZGluYWxpdHkgKyBwYWRkaW5nKVxuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgZGVmYXVsdDogMjAwLFxuICAgICAgbWluaW11bTogMFxuICAgIH0sXG4gICAgLy8gYmFuZCBzaXplXG4gICAgbGFyZ2VCYW5kU2l6ZToge1xuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgZGVmYXVsdDogMTksXG4gICAgICBtaW5pbXVtOiAwXG4gICAgfSxcbiAgICBzbWFsbEJhbmRTaXplOiB7XG4gICAgICAvL3NtYWxsIG11bHRpcGxlcyBvciBzaW5nbGUgcGxvdCB3aXRoIGhpZ2ggY2FyZGluYWxpdHlcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgIGRlZmF1bHQ6IDEyLFxuICAgICAgbWluaW11bTogMFxuICAgIH0sXG4gICAgbGFyZ2VCYW5kTWF4Q2FyZGluYWxpdHk6IHtcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgIGRlZmF1bHQ6IDEwXG4gICAgfSxcbiAgICAvLyBzbWFsbCBtdWx0aXBsZXNcbiAgICBjZWxsUGFkZGluZzoge1xuICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICBkZWZhdWx0OiAwLjFcbiAgICB9LFxuICAgIGNlbGxCYWNrZ3JvdW5kQ29sb3I6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogJyNmZGZkZmQnXG4gICAgfSxcbiAgICB0ZXh0Q2VsbFdpZHRoOiB7XG4gICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICBkZWZhdWx0OiA5MCxcbiAgICAgIG1pbmltdW06IDBcbiAgICB9LFxuXG4gICAgLy8gbWFya3NcbiAgICBzdHJva2VXaWR0aDoge1xuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgZGVmYXVsdDogMixcbiAgICAgIG1pbmltdW06IDBcbiAgICB9LFxuXG4gICAgLy8gc2NhbGVzXG4gICAgdGltZVNjYWxlTGFiZWxMZW5ndGg6IHtcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgIGRlZmF1bHQ6IDMsXG4gICAgICBtaW5pbXVtOiAwXG4gICAgfSxcbiAgICAvLyBvdGhlclxuICAgIGNoYXJhY3RlcldpZHRoOiB7XG4gICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICBkZWZhdWx0OiA2XG4gICAgfSxcblxuICAgIC8vIGRhdGEgc291cmNlXG4gICAgZGF0YUZvcm1hdFR5cGU6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZW51bTogWydqc29uJywgJ2NzdiddLFxuICAgICAgZGVmYXVsdDogJ2pzb24nXG4gICAgfSxcbiAgICB1c2VWZWdhU2VydmVyOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIH0sXG4gICAgZGF0YVVybDoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiB1bmRlZmluZWRcbiAgICB9LFxuICAgIHZlZ2FTZXJ2ZXJUYWJsZToge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiB1bmRlZmluZWRcbiAgICB9LFxuICAgIHZlZ2FTZXJ2ZXJVcmw6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMSdcbiAgICB9XG4gIH1cbn07XG5cbi8qKiBAdHlwZSBPYmplY3QgU2NoZW1hIG9mIGEgdmVnYWxpdGUgc3BlY2lmaWNhdGlvbiAqL1xuc2NoZW1hLnNjaGVtYSA9IHtcbiAgJHNjaGVtYTogJ2h0dHA6Ly9qc29uLXNjaGVtYS5vcmcvZHJhZnQtMDQvc2NoZW1hIycsXG4gIHR5cGU6ICdvYmplY3QnLFxuICByZXF1aXJlZDogWydtYXJrdHlwZScsICdlbmMnLCAnY2ZnJ10sXG4gIHByb3BlcnRpZXM6IHtcbiAgICBtYXJrdHlwZTogc2NoZW1hLm1hcmt0eXBlLFxuICAgIGVuYzoge1xuICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIHg6IHgsXG4gICAgICAgIHk6IHksXG4gICAgICAgIHJvdzogcm93LFxuICAgICAgICBjb2w6IGNvbCxcbiAgICAgICAgc2l6ZTogc2l6ZSxcbiAgICAgICAgY29sb3I6IGNvbG9yLFxuICAgICAgICBhbHBoYTogYWxwaGEsXG4gICAgICAgIHNoYXBlOiBzaGFwZSxcbiAgICAgICAgdGV4dDogdGV4dFxuICAgICAgfVxuICAgIH0sXG4gICAgY2ZnOiBjZmdcbiAgfVxufTtcblxuLyoqIEluc3RhbnRpYXRlIGEgdmVyYm9zZSB2bCBzcGVjIGZyb20gdGhlIHNjaGVtYSAqL1xuc2NoZW1hLmluc3RhbnRpYXRlID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBzY2hlbWEudXRpbC5pbnN0YW50aWF0ZShzY2hlbWEuc2NoZW1hKTtcbn07XG4iLCJ2YXIgdXRpbCA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnZhciBpc0VtcHR5ID0gZnVuY3Rpb24ob2JqKSB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhvYmopLmxlbmd0aCA9PT0gMDtcbn07XG5cbnV0aWwuZXh0ZW5kID0gZnVuY3Rpb24oaW5zdGFuY2UsIHNjaGVtYSkge1xuICByZXR1cm4gdXRpbC5tZXJnZSh1dGlsLmluc3RhbnRpYXRlKHNjaGVtYSksIGluc3RhbmNlKTtcbn07XG5cbi8vIGluc3RhbnRpYXRlIGEgc2NoZW1hXG51dGlsLmluc3RhbnRpYXRlID0gZnVuY3Rpb24oc2NoZW1hKSB7XG4gIGlmIChzY2hlbWEudHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICB2YXIgaW5zdGFuY2UgPSB7fTtcbiAgICBmb3IgKHZhciBuYW1lIGluIHNjaGVtYS5wcm9wZXJ0aWVzKSB7XG4gICAgICB2YXIgdmFsID0gdXRpbC5pbnN0YW50aWF0ZShzY2hlbWEucHJvcGVydGllc1tuYW1lXSk7XG4gICAgICBpZiAodmFsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaW5zdGFuY2VbbmFtZV0gPSB2YWw7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBpbnN0YW5jZTtcbiAgfSBlbHNlIGlmICgnZGVmYXVsdCcgaW4gc2NoZW1hKSB7XG4gICAgcmV0dXJuIHNjaGVtYS5kZWZhdWx0O1xuICB9XG4gIHJldHVybiB1bmRlZmluZWQ7XG59O1xuXG4vLyByZW1vdmUgYWxsIGRlZmF1bHRzIGZyb20gYW4gaW5zdGFuY2VcbnV0aWwuc3VidHJhY3QgPSBmdW5jdGlvbihpbnN0YW5jZSwgZGVmYXVsdHMpIHtcbiAgdmFyIGNoYW5nZXMgPSB7fTtcbiAgZm9yICh2YXIgcHJvcCBpbiBpbnN0YW5jZSkge1xuICAgIGlmICghZGVmYXVsdHMgfHwgZGVmYXVsdHNbcHJvcF0gIT09IGluc3RhbmNlW3Byb3BdKSB7XG4gICAgICBpZiAodHlwZW9mIGluc3RhbmNlW3Byb3BdID09PSAnb2JqZWN0JyAmJiAhKGluc3RhbmNlW3Byb3BdIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgICAgIHZhciBjID0gdXRpbC5zdWJ0cmFjdChpbnN0YW5jZVtwcm9wXSwgZGVmYXVsdHNbcHJvcF0pO1xuICAgICAgICBpZiAoIWlzRW1wdHkoYykpXG4gICAgICAgICAgY2hhbmdlc1twcm9wXSA9IGM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjaGFuZ2VzW3Byb3BdID0gaW5zdGFuY2VbcHJvcF07XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBjaGFuZ2VzO1xufTtcblxudXRpbC5tZXJnZSA9IGZ1bmN0aW9uKC8qZGVzdCosIHNyYzAsIHNyYzEsIC4uLiovKXtcbiAgdmFyIGRlc3QgPSBhcmd1bWVudHNbMF07XG4gIGZvciAodmFyIGk9MSA7IGk8YXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgZGVzdCA9IG1lcmdlKGRlc3QsIGFyZ3VtZW50c1tpXSk7XG4gIH1cbiAgcmV0dXJuIGRlc3Q7XG59O1xuXG4vLyByZWN1cnNpdmVseSBtZXJnZXMgc3JjIGludG8gZGVzdFxubWVyZ2UgPSBmdW5jdGlvbihkZXN0LCBzcmMpIHtcbiAgaWYgKHR5cGVvZiBzcmMgIT09ICdvYmplY3QnIHx8IHNyYyA9PT0gbnVsbCkge1xuICAgIHJldHVybiBkZXN0O1xuICB9XG5cbiAgZm9yICh2YXIgcCBpbiBzcmMpIHtcbiAgICBpZiAoIXNyYy5oYXNPd25Qcm9wZXJ0eShwKSlcbiAgICAgIGNvbnRpbnVlO1xuICAgIGlmIChzcmNbcF0gPT09IHVuZGVmaW5lZClcbiAgICAgIGNvbnRpbnVlO1xuICAgIGlmICh0eXBlb2Ygc3JjW3BdICE9PSAnb2JqZWN0JyB8fCBzcmNbcF0gPT09IG51bGwpIHtcbiAgICAgIGRlc3RbcF0gPSBzcmNbcF07XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGVzdFtwXSAhPT0gJ29iamVjdCcgfHwgZGVzdFtwXSA9PT0gbnVsbCkge1xuICAgICAgZGVzdFtwXSA9IG1lcmdlKHNyY1twXS5jb25zdHJ1Y3RvciA9PT0gQXJyYXkgPyBbXSA6IHt9LCBzcmNbcF0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBtZXJnZShkZXN0W3BdLCBzcmNbcF0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGVzdDtcbn07IiwidmFyIHV0aWwgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG51dGlsLmtleXMgPSBmdW5jdGlvbihvYmopIHtcbiAgdmFyIGsgPSBbXSwgeDtcbiAgZm9yICh4IGluIG9iaikgay5wdXNoKHgpO1xuICByZXR1cm4gaztcbn07XG5cbnV0aWwudmFscyA9IGZ1bmN0aW9uKG9iaikge1xuICB2YXIgdiA9IFtdLCB4O1xuICBmb3IgKHggaW4gb2JqKSB2LnB1c2gob2JqW3hdKTtcbiAgcmV0dXJuIHY7XG59O1xuXG51dGlsLnJhbmdlID0gZnVuY3Rpb24oc3RhcnQsIHN0b3AsIHN0ZXApIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAzKSB7XG4gICAgc3RlcCA9IDE7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgICBzdG9wID0gc3RhcnQ7XG4gICAgICBzdGFydCA9IDA7XG4gICAgfVxuICB9XG4gIGlmICgoc3RvcCAtIHN0YXJ0KSAvIHN0ZXAgPT0gSW5maW5pdHkpIHRocm93IG5ldyBFcnJvcignaW5maW5pdGUgcmFuZ2UnKTtcbiAgdmFyIHJhbmdlID0gW10sIGkgPSAtMSwgajtcbiAgaWYgKHN0ZXAgPCAwKSB3aGlsZSAoKGogPSBzdGFydCArIHN0ZXAgKiArK2kpID4gc3RvcCkgcmFuZ2UucHVzaChqKTtcbiAgZWxzZSB3aGlsZSAoKGogPSBzdGFydCArIHN0ZXAgKiArK2kpIDwgc3RvcCkgcmFuZ2UucHVzaChqKTtcbiAgcmV0dXJuIHJhbmdlO1xufTtcblxudXRpbC5maW5kID0gZnVuY3Rpb24obGlzdCwgcGF0dGVybikge1xuICB2YXIgbCA9IGxpc3QuZmlsdGVyKGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4geFtwYXR0ZXJuLm5hbWVdID09PSBwYXR0ZXJuLnZhbHVlO1xuICB9KTtcbiAgcmV0dXJuIGwubGVuZ3RoICYmIGxbMF0gfHwgbnVsbDtcbn07XG5cbnV0aWwudW5pcSA9IGZ1bmN0aW9uKGRhdGEsIGZpZWxkKSB7XG4gIHZhciBtYXAgPSB7fSwgY291bnQgPSAwLCBpLCBrO1xuICBmb3IgKGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7ICsraSkge1xuICAgIGsgPSBkYXRhW2ldW2ZpZWxkXTtcbiAgICBpZiAoIW1hcFtrXSkge1xuICAgICAgbWFwW2tdID0gMTtcbiAgICAgIGNvdW50ICs9IDE7XG4gICAgfVxuICB9XG4gIHJldHVybiBjb3VudDtcbn07XG5cbnV0aWwubWlubWF4ID0gZnVuY3Rpb24oZGF0YSwgZmllbGQpIHtcbiAgdmFyIHN0YXRzID0ge21pbjogK0luZmluaXR5LCBtYXg6IC1JbmZpbml0eX07XG4gIGZvciAoaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIHYgPSBkYXRhW2ldW2ZpZWxkXTtcbiAgICBpZiAodiA+IHN0YXRzLm1heCkgc3RhdHMubWF4ID0gdjtcbiAgICBpZiAodiA8IHN0YXRzLm1pbikgc3RhdHMubWluID0gdjtcbiAgfVxuICByZXR1cm4gc3RhdHM7XG59O1xuXG51dGlsLmR1cGxpY2F0ZSA9IGZ1bmN0aW9uKG9iaikge1xuICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvYmopKTtcbn07XG5cbnV0aWwuYW55ID0gZnVuY3Rpb24oYXJyLCBmKSB7XG4gIHZhciBpID0gMCwgaztcbiAgZm9yIChrIGluIGFycikge1xuICAgIGlmIChmKGFycltrXSwgaywgaSsrKSkgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxudXRpbC5hbGwgPSBmdW5jdGlvbihhcnIsIGYpIHtcbiAgdmFyIGkgPSAwLCBrO1xuICBmb3IgKGsgaW4gYXJyKSB7XG4gICAgaWYgKCFmKGFycltrXSwgaywgaSsrKSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufTtcblxudXRpbC5tZXJnZSA9IGZ1bmN0aW9uKGRlc3QsIHNyYykge1xuICByZXR1cm4gdXRpbC5rZXlzKHNyYykucmVkdWNlKGZ1bmN0aW9uKGMsIGspIHtcbiAgICBjW2tdID0gc3JjW2tdO1xuICAgIHJldHVybiBjO1xuICB9LCBkZXN0KTtcbn07XG5cbnV0aWwuZ2V0YmlucyA9IGZ1bmN0aW9uKHN0YXRzLCBtYXhiaW5zKSB7XG4gIHJldHVybiB2Zy5iaW5zKHtcbiAgICBtaW46IHN0YXRzLm1pbixcbiAgICBtYXg6IHN0YXRzLm1heCxcbiAgICBtYXhiaW5zOiBtYXhiaW5zXG4gIH0pO1xufTtcblxuLyoqXG4gKiB4W3BbMF1dLi4uW3Bbbl1dID0gdmFsXG4gKiBAcGFyYW0gbm9hdWdtZW50IGRldGVybWluZSB3aGV0aGVyIG5ldyBvYmplY3Qgc2hvdWxkIGJlIGFkZGVkIGZcbiAqIG9yIG5vbi1leGlzdGluZyBwcm9wZXJ0aWVzIGFsb25nIHRoZSBwYXRoXG4gKi9cbnV0aWwuc2V0dGVyID0gZnVuY3Rpb24oeCwgcCwgdmFsLCBub2F1Z21lbnQpIHtcbiAgZm9yICh2YXIgaT0wOyBpPHAubGVuZ3RoLTE7ICsraSkge1xuICAgIGlmICghbm9hdWdtZW50ICYmICEocFtpXSBpbiB4KSl7XG4gICAgICB4ID0geFtwW2ldXSA9IHt9O1xuICAgIH0gZWxzZSB7XG4gICAgICB4ID0geFtwW2ldXTtcbiAgICB9XG4gIH1cbiAgeFtwW2ldXSA9IHZhbDtcbn07XG5cblxuLyoqXG4gKiByZXR1cm5zIHhbcFswXV0uLi5bcFtuXV1cbiAqIEBwYXJhbSBhdWdtZW50IGRldGVybWluZSB3aGV0aGVyIG5ldyBvYmplY3Qgc2hvdWxkIGJlIGFkZGVkIGZcbiAqIG9yIG5vbi1leGlzdGluZyBwcm9wZXJ0aWVzIGFsb25nIHRoZSBwYXRoXG4gKi9cbnV0aWwuZ2V0dGVyID0gZnVuY3Rpb24oeCwgcCwgbm9hdWdtZW50KSB7XG4gIGZvciAodmFyIGk9MDsgaTxwLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKCFub2F1Z21lbnQgJiYgIShwW2ldIGluIHgpKXtcbiAgICAgIHggPSB4W3BbaV1dID0ge307XG4gICAgfSBlbHNlIHtcbiAgICAgIHggPSB4W3BbaV1dO1xuICAgIH1cbiAgfVxuICByZXR1cm4geDtcbn07XG5cbi8vIGNvcGllZCBmcm9tIHZlZ2FcbnV0aWwudHJ1bmNhdGUgPSBmdW5jdGlvbihzLCBsZW5ndGgsIHBvcywgd29yZCwgZWxsaXBzaXMpIHtcbiAgdmFyIGxlbiA9IHMubGVuZ3RoO1xuICBpZiAobGVuIDw9IGxlbmd0aCkgcmV0dXJuIHM7XG4gIGVsbGlwc2lzID0gZWxsaXBzaXMgfHwgXCIuLi5cIjtcbiAgdmFyIGwgPSBNYXRoLm1heCgwLCBsZW5ndGggLSBlbGxpcHNpcy5sZW5ndGgpO1xuXG4gIHN3aXRjaCAocG9zKSB7XG4gICAgY2FzZSBcImxlZnRcIjpcbiAgICAgIHJldHVybiBlbGxpcHNpcyArICh3b3JkID8gdmdfdHJ1bmNhdGVPbldvcmQocyxsLDEpIDogcy5zbGljZShsZW4tbCkpO1xuICAgIGNhc2UgXCJtaWRkbGVcIjpcbiAgICBjYXNlIFwiY2VudGVyXCI6XG4gICAgICB2YXIgbDEgPSBNYXRoLmNlaWwobC8yKSwgbDIgPSBNYXRoLmZsb29yKGwvMik7XG4gICAgICByZXR1cm4gKHdvcmQgPyB2Z190cnVuY2F0ZU9uV29yZChzLGwxKSA6IHMuc2xpY2UoMCxsMSkpICsgZWxsaXBzaXMgK1xuICAgICAgICAod29yZCA/IHZnX3RydW5jYXRlT25Xb3JkKHMsbDIsMSkgOiBzLnNsaWNlKGxlbi1sMikpO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gKHdvcmQgPyB2Z190cnVuY2F0ZU9uV29yZChzLGwpIDogcy5zbGljZSgwLGwpKSArIGVsbGlwc2lzO1xuICB9XG59O1xuXG51dGlsLmVycm9yID0gZnVuY3Rpb24obXNnKSB7XG4gIGNvbnNvbGUuZXJyb3IoJ1tWTCBFcnJvcl0nLCBtc2cpO1xufTtcblxuIl19
