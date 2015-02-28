!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.vl=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var globals = require('./globals'),
    util = require('./util'),
    consts = require('./consts');

var vl = util.merge(consts, util);

vl.Encoding = require('./Encoding');
vl.compile = require('./compile/compile');
vl.data = require('./data');
vl.field = require('./field');
vl.enc = require('./enc');
vl.schema = require('./schema/schema');


module.exports = vl;

},{"./Encoding":2,"./compile/compile":6,"./consts":20,"./data":21,"./enc":22,"./field":23,"./globals":24,"./schema/schema":25,"./util":27}],2:[function(require,module,exports){
'use strict';

var global = require('./globals'),
  consts = require('./consts'),
  util = require('./util'),
  vlfield = require('./field'),
  vlenc = require('./enc'),
  schema = require('./schema/schema'),
  time = require('./compile/time');

var Encoding = module.exports = (function() {

  function Encoding(marktype, enc, config, filter, theme) {
    var defaults = schema.instantiate();

    var spec = {
      marktype: marktype,
      enc: enc,
      cfg: config,
      filter: filter || []
    };

    // type to bitcode
    for (var e in defaults.enc) {
      defaults.enc[e].type = consts.dataTypes[defaults.enc[e].type];
    }

    var specExtended = schema.util.merge(defaults, theme || {}, spec) ;

    this._marktype = specExtended.marktype;
    this._enc = specExtended.enc;
    this._cfg = specExtended.cfg;
    this._filter = specExtended.filter;
  }

  var proto = Encoding.prototype;

  proto.marktype = function() {
    return this._marktype;
  };

  proto.is = function(m) {
    return this._marktype === m;
  };

  proto.has = function(encType) {
    // equivalent to calling vlenc.has(this._enc, encType)
    return this._enc[encType].name !== undefined;
  };

  proto.enc = function(x) {
    return this._enc[x];
  };

  proto.filter = function() {
    return this._filter;
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
    if (vlfield.isCount(this._enc[x])) {
      return vlfield.count.displayName;
    }
    var fn = this._enc[x].aggr || this._enc[x].fn || (this._enc[x].bin && "bin");
    if (fn) {
      return fn.toUpperCase() + '(' + this._enc[x].name + ')';
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

  // returns false if binning is disabled, otherwise an object with binning properties
  proto.bin = function(x) {
    var bin = this._enc[x].bin;
    if (bin === {})
      return false;
    if (bin === true)
      return {
        maxbins: schema.MAXBINS_DEFAULT
      };
    return bin;
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

   proto.sort = function(x) {
    return this._enc[x].sort;
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
    return vlenc.map(this._enc, f);
  };

  proto.reduce = function(f, init) {
    return vlenc.reduce(this._enc, f, init);
  };

  proto.forEach = function(f) {
    return vlenc.forEach(this._enc, f);
  };

  proto.type = function(et) {
    return this.has(et) ? this._enc[et].type : null;
  };

  proto.role = function(et) {
    return this.has(et) ? vlfield.role(this._enc[et]) : null;
  };

  proto.text = function(prop) {
    var text = this._enc[TEXT].text;
    return prop ? text[prop] : text;
  };

  proto.font = function(prop) {
    var font = this._enc[TEXT].font;
    return prop ? font[prop] : font;
  };

  proto.isType = function(x, type) {
    var field = this.enc(x);
    return field && Encoding.isType(field, type);
  };

  Encoding.isType = function (fieldDef, type) {
    return (fieldDef.type & type) > 0;
  };

  Encoding.isOrdinalScale = function(encoding, encType) {
    return vlfield.isOrdinalScale(encoding.enc(encType), true);
  };

  Encoding.isDimension = function(encoding, encType) {
    return vlfield.isDimension(encoding.enc(encType), true);
  };

  Encoding.isMeasure = function(encoding, encType) {
    return vlfield.isMeasure(encoding.enc(encType), true);
  };

  proto.isOrdinalScale = function(encType) {
    return this.has(encType) && Encoding.isOrdinalScale(this, encType);
  };

  proto.isDimension = function(encType) {
    return this.has(encType) && Encoding.isDimension(this, encType);
  };

  proto.isMeasure = function(encType) {
    return this.has(encType) && Encoding.isMeasure(this, encType);
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

  Encoding.isAggregate = function(spec) {
    var i = 0, k, enc= spec.enc;
    for (k in enc) {
      if (enc[k] && enc[k].aggr) {
        return true;
      }
    }
    return false;
  };

  proto.cardinality = function(encType, stats) {
    return vlfield.cardinality(this._enc[encType], stats, this.bin(encType).maxbins, true);
  };

  proto.isRaw = function() {
    return !this.isAggregate();
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
      enc: enc,
      filter: this._filter
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
    var c = consts.shorthand;
    return 'mark' + c.assign + this._marktype +
      c.delim +
      vlenc.shorthand(this._enc);
  };

  Encoding.parseShorthand = function(shorthand, cfg) {
    var c = consts.shorthand,
        split = shorthand.split(c.delim, 1),
        marktype = split[0].split(c.assign)[1].trim(),
        enc = vlenc.parseShorthand(split[1], true);

    return new Encoding(marktype, enc, cfg);
  };

  Encoding.shorthandFromSpec = function() {
    return Encoding.fromSpec.apply(null, arguments).toShorthand();
  };

  Encoding.specFromShorthand = function(shorthand, cfg, excludeConfig) {
    return Encoding.parseShorthand(shorthand, cfg).toSpec(excludeConfig);
  };

  Encoding.fromSpec = function(spec, theme, extraCfg) {
    var enc = util.duplicate(spec.enc);

    //convert type from string to bitcode (e.g, O=1)
    for (var e in enc) {
      enc[e].type = consts.dataTypes[enc[e].type];
    }

    return new Encoding(spec.marktype, enc, util.merge(spec.cfg || {}, extraCfg || {}), spec.filter, theme);
  };


  return Encoding;

})();

},{"./compile/time":19,"./consts":20,"./enc":22,"./field":23,"./globals":24,"./schema/schema":25,"./util":27}],3:[function(require,module,exports){
var globals = require('../globals'),
  util = require('../util');

module.exports = aggregates;

function aggregates(spec, encoding, opt) {
  opt = opt || {};

  var dims = {}, meas = {}, detail = {}, facets = {},
    data = spec.data[1]; // currently data[0] is raw and data[1] is table

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
    if (!data.transform) data.transform = [];
    data.transform.push({
      type: 'aggregate',
      groupby: dims,
      fields: meas
    });
  }
  return {
    details: util.vals(detail),
    dims: dims,
    facets: util.vals(facets),
    aggregated: meas.length > 0
  };
}

},{"../globals":24,"../util":27}],4:[function(require,module,exports){
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
    setter(def, ['properties', 'ticks'], {
      opacity: {value: 0}
    });
    setter(def, ['properties', 'majorTicks'], {
      opacity: {value: 0}
    });
    setter(def, ['properties', 'axis'], {
      opacity: {value: 0}
    });
  }

  if (isCol) {
    def.orient = 'top';
  }

  if (isRow) {
    def.offset = axisTitleOffset(encoding, layout, Y) + 20;
  }

  if (name == X) {
    if (encoding.isDimension(X) || encoding.isType(X, T)) {
      setter(def, ['properties','labels'], {
        angle: {value: 270},
        align: {value: 'right'},
        baseline: {value: 'middle'}
      });
    } else { // Q
      def.ticks = 5;
    }
  }

  def = axis_labels(def, name, encoding, layout, opt);

  return def;
};

function axis_title(def, name, encoding, layout, opt) {
  var maxlength = null,
    fieldTitle = encoding.fieldTitle(name);
  if (name===X) {
    maxlength = layout.cellWidth / encoding.config('characterWidth');
  } else if (name === Y) {
    maxlength = layout.cellHeight / encoding.config('characterWidth');
  }

  def.title = maxlength ? util.truncate(fieldTitle, maxlength) : fieldTitle;

  if (name === ROW) {
    setter(def, ['properties','title'], {
      angle: {value: 0},
      align: {value: 'right'},
      baseline: {value: 'middle'},
      dy: {value: (-layout.height/2) -20}
    });
  }

  def.titleOffset = axisTitleOffset(encoding, layout, name);
  return def;
}

function axis_labels(def, name, encoding, layout, opt) {
  var fn;
  // add custom label for time type
  if (encoding.isType(name, T) && (fn = encoding.fn(name)) && (time.hasScale(fn))) {
    setter(def, ['properties','labels','text','scale'], 'time-'+ fn);
  }

  var textTemplatePath = ['properties','labels','text','template'];
  if (encoding.axis(name).format) {
    def.format = encoding.axis(name).format;
  } else if (encoding.isType(name, Q)) {
    setter(def, textTemplatePath, "{{data | number:'.3s'}}");
  } else if (encoding.isType(name, T) && !encoding.fn(name)) {
    setter(def, textTemplatePath, "{{data | time:'%Y-%m-%d'}}");
  } else if (encoding.isType(name, T) && encoding.fn(name) === 'year') {
    setter(def, textTemplatePath, "{{data | number:'d'}}");
  } else if (encoding.isType(name, O) && encoding.axis(name).maxLabelLength) {
    setter(def, textTemplatePath, '{{data | truncate:' + encoding.axis(name).maxLabelLength + '}}');
  }

  return def;
}

function axisTitleOffset(encoding, layout, name) {
  var value = encoding.axis(name).titleOffset;
  if (value) {
    return value;
  }
  switch (name) {
    case ROW: return 0;
    case COL: return 35;
  }
  return getter(layout, [name, 'axisTitleOffset']);
}

},{"../globals":24,"../util":27,"./time":19}],5:[function(require,module,exports){
var globals = require('../globals'),
  util = require('../util');

module.exports = binning;

function binning(spec, encoding, opt) {
  opt = opt || {};
  var bins = {};

  if (opt.preaggregatedData) {
    return;
  }

  if (!spec.transform) spec.transform = [];

  encoding.forEach(function(encType, field) {
    if (encoding.bin(encType)) {
      spec.transform.push({
        type: 'bin',
        field: 'data.' + field.name,
        output: 'data.bin_' + field.name,
        maxbins: encoding.bin(encType).maxbins
      });
    }
  });
}

},{"../globals":24,"../util":27}],6:[function(require,module,exports){
var globals = require('../globals'),
  util = require('../util');

module.exports = compile;

var template = compile.template = require('./template'),
  axis = compile.axis = require('./axis'),
  filter = compile.filter = require('./filter'),
  legend = compile.legend = require('./legend'),
  marks = compile.marks = require('./marks'),
  scale = compile.scale = require('./scale'),
  vlsort = compile.sort = require('./sort'),
  vlstyle = compile.style = require('./style'),
  time = compile.time = require('./time'),
  aggregates = compile.aggregates = require('./aggregates'),
  binning = compile.binning = require('./binning'),
  faceting = compile.faceting = require('./faceting'),
  stacking = compile.stacking = require('./stacking');
  subfaceting = compile.subfaceting = require('./subfaceting');

compile.layout = require('./layout');
compile.group = require('./group');

function compile(encoding, stats) {
  var layout = compile.layout(encoding, stats),
    style = vlstyle(encoding, stats),
    spec = template(encoding, layout, stats),
    group = spec.marks[0],
    mark = marks[encoding.marktype()],
    mdefs = marks.def(mark, encoding, layout, style),
    mdef = mdefs[0];  // TODO: remove this dirty hack by refactoring the whole flow

  filter.addFilters(spec, encoding);
  var sorting = vlsort(spec, encoding);

  var hasRow = encoding.has(ROW), hasCol = encoding.has(COL);

  var preaggregatedData = encoding.config('useVegaServer');

  for (var i = 0; i < mdefs.length; i++) {
    group.marks.push(mdefs[i]);
  }

  binning(spec.data[1], encoding, {preaggregatedData: preaggregatedData});

  var lineType = marks[encoding.marktype()].line;

  if (!preaggregatedData) {
    spec = time(spec, encoding);
  }

  // handle subfacets
  var aggResult = aggregates(spec, encoding, {preaggregatedData: preaggregatedData}),
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
    var f = (encoding.isMeasure(X) && encoding.isDimension(Y)) ? Y : X;
    if (!mdef.from) mdef.from = {};
    mdef.from.transform = [{type: 'sort', by: encoding.field(f)}];
  }

  // Small Multiples
  if (hasRow || hasCol) {
    spec = faceting(group, encoding, layout, style, sorting, spec, mdef, stack, stats);
    spec.legends = legend.defs(encoding);
  } else {
    group.scales = scale.defs(scale.names(mdef.properties.update), encoding, layout, style, sorting,
      {stack: stack, stats: stats});
    group.axes = axis.defs(axis.names(mdef.properties.update), encoding, layout);
    group.legends = legend.defs(encoding);
  }

  filter.filterLessThanZero(spec, encoding);

  return spec;
}


},{"../globals":24,"../util":27,"./aggregates":3,"./axis":4,"./binning":5,"./faceting":7,"./filter":8,"./group":9,"./layout":10,"./legend":11,"./marks":12,"./scale":13,"./sort":14,"./stacking":15,"./style":16,"./subfaceting":17,"./template":18,"./time":19}],7:[function(require,module,exports){
var globals = require('../globals'),
  util = require('../util');

var axis = require('./axis'),
  groupdef = require('./group').def,
  scale = require('./scale');

module.exports = faceting;

function faceting(group, encoding, layout, style, sorting, spec, mdef, stack, stats) {
  var enter = group.properties.enter;
  var facetKeys = [], cellAxes = [], from, axesGrp;

  var hasRow = encoding.has(ROW), hasCol = encoding.has(COL);

  enter.fill = {value: encoding.config('cellBackgroundColor')};

  //move "from" to cell level and add facet transform
  group.from = {data: group.marks[0].from.data};

  // Hack, this needs to be refactored
  for (var i = 0; i < group.marks.length; i++) {
    var mark = group.marks[i];
    if (mark.from.transform) {
      delete mark.from.data; //need to keep transform for subfacetting case
    } else {
      delete mark.from;
    }
  };
  if (hasRow) {
    if (!encoding.isDimension(ROW)) {
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
    if (!encoding.isDimension(COL)) {
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
    style,
    sorting,
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

},{"../globals":24,"../util":27,"./axis":4,"./group":9,"./scale":13}],8:[function(require,module,exports){
var globals = require('../globals');

var filter = module.exports = {};

var BINARY = {
  '>':  true,
  '>=': true,
  '=':  true,
  '!=': true,
  '<':  true,
  '<=': true
};

filter.addFilters = function(spec, encoding) {
  var filters = encoding.filter(),
    data = spec.data[0];  // apply filters to raw data before aggregation

  if (!data.transform)
    data.transform = [];

  // add custom filters
  for (var i in filters) {
    var filter = filters[i];

    var condition = '';
    var operator = filter.operator;
    var operands = filter.operands;

    if (BINARY[operator]) {
      // expects a field and a value
      if (operator === '=') {
        operator = '==';
      }

      var op1 = operands[0];
      var op2 = operands[1];
      condition = 'd.data.' + op1 + operator + op2;
    } else if (operator === 'notNull') {
      // expects a number of fields
      for (var j in operands) {
        condition += 'd.data.' + operands[j] + '!==null';
        if (j < operands.length - 1) {
          condition += ' && ';
        }
      }
    } else {
      console.warn('Unsupported operator: ', operator);
    }

    data.transform.push({
      type: 'filter',
      test: condition
    });
  }
};

// remove less than 0 values if we use log function
filter.filterLessThanZero = function(spec, encoding) {
  encoding.forEach(function(encType, field) {
    if (encoding.scale(encType).type === 'log') {
      spec.data[1].transform.push({
        type: 'filter',
        test: 'd.' + encoding.field(encType) + '>0'
      });
    }
  });
};


},{"../globals":24}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
var globals = require('../globals'),
  util = require('../util'),
  setter = util.setter,
  schema = require('../schema/schema'),
  time = require('./time'),
  vlfield = require('../field');

module.exports = vllayout;

function vllayout(encoding, stats) {
  var layout = box(encoding, stats);
  layout = offset(encoding, stats, layout);
  return layout;
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
      hasX = encoding.has(X),
      hasY = encoding.has(Y),
      marktype = encoding.marktype();

  var xCardinality = hasX && encoding.isDimension(X) ? encoding.cardinality(X, stats) : 1,
    yCardinality = hasY && encoding.isDimension(Y) ? encoding.cardinality(Y, stats) : 1;

  var useSmallBand = xCardinality > encoding.config('largeBandMaxCardinality') ||
    yCardinality > encoding.config('largeBandMaxCardinality');

  var cellWidth, cellHeight, cellPadding = encoding.config('cellPadding');

  // set cellWidth
  if (hasX) {
    if (encoding.isOrdinalScale(X)) {
      // for ordinal, hasCol or not doesn't matter -- we scale based on cardinality
      cellWidth = (xCardinality + encoding.band(X).padding) * encoding.bandSize(X, useSmallBand);
    } else {
      cellWidth = hasCol || hasRow ? encoding.enc(COL).width :  encoding.config("singleWidth");
    }
  } else {
    if (marktype === TEXT) {
      cellWidth = encoding.config('textCellWidth');
    } else {
      cellWidth = encoding.bandSize(X);
    }
  }

  // set cellHeight
  if (hasY) {
    if (encoding.isOrdinalScale(Y)) {
      // for ordinal, hasCol or not doesn't matter -- we scale based on cardinality
      cellHeight = (yCardinality + encoding.band(Y).padding) * encoding.bandSize(Y, useSmallBand);
    } else {
      cellHeight = hasCol || hasRow ? encoding.enc(ROW).height :  encoding.config("singleHeight");
    }
  } else {
    cellHeight = encoding.bandSize(Y);
  }

  // Cell bands use rangeBands(). There are n-1 padding.  Outerpadding = 0 for cells

  var width = cellWidth, height = cellHeight;
  if (hasCol) {
    var colCardinality = encoding.cardinality(COL, stats);
    width = cellWidth * ((1 + cellPadding) * (colCardinality - 1) + 1);
  }
  if (hasRow) {
    var rowCardinality =  encoding.cardinality(ROW, stats);
    height = cellHeight * ((1 + cellPadding) * (rowCardinality - 1) + 1);
  }

  return {
    cellWidth: cellWidth,
    cellHeight: cellHeight,
    width: width,
    height: height,
    x: {useSmallBand: useSmallBand},
    y: {useSmallBand: useSmallBand}
  };
}

function offset(encoding, stats, layout) {
  [X, Y].forEach(function (x) {
    var maxLength;
    if (encoding.isDimension(x) || encoding.isType(x, T)) {
      maxLength = stats[encoding.fieldName(x)].maxlength;
    } else if (encoding.aggr(x) === 'count') {
      //assign default value for count as it won't have stats
      maxLength =  3;
    } else if (encoding.isType(x, Q)) {
      if (x===X) {
        maxLength = 3;
      } else { // Y
        //assume that default formating is always shorter than 7
        maxLength = Math.min(stats[encoding.fieldName(x)].maxlength, 7);
      }
    }
    setter(layout,[x, 'axisTitleOffset'], encoding.config('characterWidth') *  maxLength + 20);
  });
  return layout;
}

},{"../field":23,"../globals":24,"../schema/schema":25,"../util":27,"./time":19}],11:[function(require,module,exports){
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

},{"../globals":24,"./time":19}],12:[function(require,module,exports){
var globals = require('../globals'),
  util = require('../util');

var marks = module.exports = {};

marks.def = function(mark, encoding, layout, style) {
  var defs = [];

  // to add a background to text, we need to add it before the text
  if (encoding.marktype() === TEXT && encoding.has(COLOR)) {
    var p = {
      x: {value: 0},
      y: {value: 0},
      x2: {value: layout.cellWidth},
      y2: {value: layout.cellHeight},
      fill: {scale: COLOR, field: encoding.field(COLOR)}
    };
    defs.push({
      type: 'rect',
      from: {data: TABLE},
      properties: {enter: p, update: p}
    });
  }

  // add the mark def for the main thing
  var p = mark.prop(encoding, layout, style);
  defs.push({
    type: mark.type,
    from: {data: TABLE},
    properties: {enter: p, update: p}
  });

  return defs;
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

marks.tick = {
  type: 'rect',
  prop: tick_props
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

function bar_props(e, layout, style) {
  var p = {};

  // x
  if (e.isMeasure(X)) {
    p.x = {scale: X, field: e.field(X)};
    if (e.isDimension(Y)) {
      p.x2 = {scale: X, value: 0};
    }
  } else if (e.has(X)) { // is ordinal
    p.xc = {scale: X, field: e.field(X)};
  } else {
    // TODO add single bar offset
    p.xc = {value: 0};
  }

  // y
  if (e.isMeasure(Y)) {
    p.y = {scale: Y, field: e.field(Y)};
    p.y2 = {scale: Y, value: 0};
  } else if (e.has(Y)) { // is ordinal
    p.yc = {scale: Y, field: e.field(Y)};
  } else {
    // TODO add single bar offset
    p.yc = {group: 'height'};
  }

  // width
  if (!e.has(X) || e.isOrdinalScale(X)) { // no X or X is ordinal
    if (e.has(SIZE)) {
      p.width = {scale: SIZE, field: e.field(SIZE)};
    } else {
      // p.width = {scale: X, band: true, offset: -1};
      p.width = {value: e.bandSize(X, layout.x.useSmallBand), offset: -1};
    }
  } else { // X is Quant or Time Scale
    p.width = {value: e.bandSize(X, layout.x.useSmallBand), offset: -1};
  }

  // height
  if (!e.has(Y) || e.isOrdinalScale(Y)) { // no Y or Y is ordinal
    if (e.has(SIZE)) {
      p.height = {scale: SIZE, field: e.field(SIZE)};
    } else {
      // p.height = {scale: Y, band: true, offset: -1};
      p.height = {value: e.bandSize(Y, layout.y.useSmallBand), offset: -1};
    }
  } else { // Y is Quant or Time Scale
    p.height = {value: e.bandSize(Y, layout.y.useSmallBand), offset: -1};
  }

  // fill
  if (e.has(COLOR)) {
    p.fill = {scale: COLOR, field: e.field(COLOR)};
  } else {
    p.fill = {value: e.value(COLOR)};
  }

  // alpha
  if (e.has(ALPHA)) {
    p.opacity = {scale: ALPHA, field: e.field(ALPHA)};
  } else if (e.value(ALPHA) !== undefined) {
    p.opacity = {value: e.value(ALPHA)};
  }

  return p;
}

function point_props(e, layout, style) {
  var p = {};

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
  } else if (e.value(ALPHA) !== undefined) {
    p.opacity = {value: e.value(ALPHA)};
  } else {
    p.opacity = {value: style.opacity};
  }

  p.strokeWidth = {value: e.config('strokeWidth')};

  return p;
}

function line_props(e, layout, style) {
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
  } else if (e.value(ALPHA) !== undefined) {
    p.opacity = {value: e.value(ALPHA)};
  }

  p.strokeWidth = {value: e.config('strokeWidth')};

  return p;
}

function area_props(e, layout, style) {
  var p = {};

  // x
  if (e.isMeasure(X)) {
    p.x = {scale: X, field: e.field(X)};
    if (e.isDimension(Y)) {
      p.x2 = {scale: X, value: 0};
      p.orient = {value: 'horizontal'};
    }
  } else if (e.has(X)) {
    p.x = {scale: X, field: e.field(X)};
  } else {
    p.x = {value: 0};
  }

  // y
  if (e.isMeasure(Y)) {
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
  } else if (e.value(ALPHA) !== undefined) {
    p.opacity = {value: e.value(ALPHA)};
  }

  return p;
}

function tick_props(e, layout, style) {
  var p = {};

  // x
  if (e.has(X)) {
    p.x = {scale: X, field: e.field(X)};
    if (e.isDimension(X)) {
      p.x.offset = -e.bandSize(X, layout.x.useSmallBand) / 3;
    }
  } else if (!e.has(X)) {
    p.x = {value: 0};
  }

  // y
  if (e.has(Y)) {
    p.y = {scale: Y, field: e.field(Y)};
    if (e.isDimension(Y)) {
      p.y.offset = -e.bandSize(Y, layout.y.useSmallBand) / 3;
    }
  } else if (!e.has(Y)) {
    p.y = {value: 0};
  }

  // width
  if (!e.has(X) || e.isDimension(X)) {
    p.width = {value: e.bandSize(X, layout.y.useSmallBand) / 1.5};
  } else {
    p.width = {value: 1};
  }

  // height
  if (!e.has(Y) || e.isDimension(Y)) {
    p.height = {value: e.bandSize(Y, layout.y.useSmallBand) / 1.5};
  } else {
    p.height = {value: 1};
  }

  // fill
  if (e.has(COLOR)) {
    p.fill = {scale: COLOR, field: e.field(COLOR)};
  } else {
    p.fill = {value: e.value(COLOR)};
  }

  // alpha
  if (e.has(ALPHA)) {
    p.opacity = {scale: ALPHA, field: e.field(ALPHA)};
  } else if (e.value(ALPHA) !== undefined) {
    p.opacity = {value: e.value(ALPHA)};
  } else {
    p.opacity = {value: style.opacity};
  }

  return p;
}

function filled_point_props(shape) {
  return function(e, layout, style) {
    var p = {};

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
    } else if (e.value(ALPHA) !== undefined) {
      p.opacity = {value: e.value(ALPHA)};
    } else {
      p.opacity = {value: style.opacity};
    }

    return p;
  };
}

function text_props(e, layout, style) {
  var p = {};

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
  } else if (!e.has(SIZE)) {
    p.fontSize = {value: e.font('size')};
  }

  // fill
  // color should be set to background
  p.fill = {value: 'black'};

  // alpha
  if (e.has(ALPHA)) {
    p.opacity = {scale: ALPHA, field: e.field(ALPHA)};
  } else if (e.value(ALPHA) !== undefined) {
    p.opacity = {value: e.value(ALPHA)};
  } else {
    p.opacity = {value: style.opacity};
  }

  // text
  if (e.has(TEXT)) {
    if (e.isType(TEXT, Q)) {
      p.text = {template: "{{" + e.field(TEXT) + " | number:'.3s'}}"};
    } else {
      p.text = {field: e.field(TEXT)};
    }
    p.align = {value: 'left'};
  } else {
    p.text = {value: 'Abc'};
  }

  p.font = {value: e.font('family')};
  p.fontWeight = {value: e.font('weight')};
  p.fontStyle = {value: e.font('style')};
  p.baseline = {value: e.text('baseline')};

  return p;
}

},{"../globals":24,"../util":27}],13:[function(require,module,exports){
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

scale.defs = function(names, encoding, layout, style, sorting, opt) {
  opt = opt || {};

  return names.reduce(function(a, name) {
    var s = {
      name: name,
      type: scale.type(name, encoding),
      domain: scale_domain(name, encoding, sorting, opt)
    };
    if (s.type === 'ordinal' && !encoding.bin(name) && encoding.sort(name).length === 0) {
      s.sort = true;
    }

    scale_range(s, encoding, layout, style, opt);

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

function scale_domain(name, encoding, sorting, opt) {
  if (encoding.isType(name, T)) {
    var range = time.scale.domain(encoding.fn(name));
    if(range) return range;
  }

  if (encoding.bin(name)) {
    // TODO: add includeEmptyConfig here
    if (opt.stats) {
      var bins = util.getbins(opt.stats[encoding.fieldName(name)], encoding.bin(name).maxbins);
      var domain = util.range(bins.start, bins.stop, bins.step);
      return name === Y ? domain.reverse() : domain;
    }
  }

  return name == opt.stack ?
    {
      data: STACKED,
      field: 'data.' + (opt.facet ? 'max_' : '') + 'sum_' + encoding.field(name, true)
    } :
    {data: sorting.getDataset(name), field: encoding.field(name)};
}

function scale_range(s, encoding, layout, style, opt) {
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
        s.range = [10, 400];
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
          range = style.colorRange;
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

},{"../globals":24,"../util":27,"./time":19}],14:[function(require,module,exports){
var globals = require('../globals');

module.exports = addSortTransforms;

// adds new transforms that produce sorted fields
function addSortTransforms(spec, encoding, opt) {
  var datasetMapping = {};
  var counter = 0;

  encoding.forEach(function(encType, field) {
    var sortBy = encoding.sort(encType);
    if (sortBy.length > 0) {
      var fields = sortBy.map(function(d) {
        return {
          op: d.aggr,
          field: 'data.' + d.name
        };
      });

      var byClause = sortBy.map(function(d) {
        return (d.reverse ? '-' : '') + 'data.' + d.aggr + '_' + d.name;
      });

      var dataName = 'sorted' + counter++;

      var transforms = [
        {
          type: 'aggregate',
          groupby: ['data.' + field.name],
          fields: fields
        },
        {
          type: 'sort',
          by: byClause
        }
      ];

      spec.data.push({
        name: dataName,
        source: RAW,
        transform: transforms
      });

      datasetMapping[encType] = dataName;
    }
  });

  return {
    spec: spec,
    getDataset: function(encType) {
      var data = datasetMapping[encType];
      if (!data) {
        return TABLE;
      }
      return data;
    }
  };
}

},{"../globals":24}],15:[function(require,module,exports){
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

},{"../globals":24,"../util":27,"./marks":12}],16:[function(require,module,exports){
var globals = require('../globals'),
  util = require('../util'),
  vlfield = require('../field'),
  Encoding = require('../Encoding');

module.exports = function(encoding, stats) {
  return {
    opacity: estimateOpacity(encoding, stats),
    colorRange: colorRange(encoding, stats)
  };
};

function colorRange(encoding, stats){
  if (encoding.has(COLOR) && encoding.isDimension(COLOR)) {
    var cardinality = encoding.cardinality(COLOR, stats);
    if (cardinality <= 10) {
      return "category10";
    } else {
      return "category20";
    }
    // TODO can vega interpolate range for ordinal scale?
  }
  return null;
}

function estimateOpacity(encoding,stats) {
  if (!stats) {
    return 1;
  }

  var numPoints = 0;

  if (encoding.isAggregate()) { // aggregate plot
    numPoints = 1;

    //  get number of points in each "cell"
    //  by calculating product of cardinality
    //  for each non faceting and non-ordinal X / Y fields
    //  note that ordinal x,y are not include since we can
    //  consider that ordinal x are subdividing the cell into subcells anyway
    encoding.forEach(function(encType, field) {

      if (encType !== ROW && encType !== COL &&
          !((encType === X || encType === Y) &&
          vlfield.isDimension(field, true))
        ) {
        numPoints *= encoding.cardinality(encType, stats);
      }
    });

  } else { // raw plot
    numPoints = stats.count;

    // small multiples divide number of points
    var numMultiples = 1;
    if (encoding.has(ROW)) {
      numMultiples *= encoding.cardinality(ROW, stats);
    }
    if (encoding.has(COL)) {
      numMultiples *= encoding.cardinality(COL, stats);
    }
    numPoints /= numMultiples;
  }

  var opacity = 0;
  if (numPoints < 20) {
    opacity = 1;
  } else if (numPoints < 200) {
    opacity = 0.7;
  } else if (numPoints < 1000) {
    opacity = 0.6;
  } else {
    opacity = 0.3;
  }

  return opacity;
}


},{"../Encoding":2,"../field":23,"../globals":24,"../util":27}],17:[function(require,module,exports){
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

},{"../globals":24,"./group":9}],18:[function(require,module,exports){
var globals = require('../globals');

var groupdef = require('./group').def,
  vldata = require('../data');

module.exports = template;

function template(encoding, layout, stats) { //hack use stats

  var data = {name: RAW, format: {type: encoding.config('dataFormatType')}},
    table = {name: TABLE, source: RAW},
    dataUrl = vldata.getUrl(encoding, stats);
  if (dataUrl) data.url = dataUrl;

  var preaggregatedData = encoding.config('useVegaServer');

  encoding.forEach(function(encType, field) {
    var name;
    if (field.type == T) {
      data.format.parse = data.format.parse || {};
      data.format.parse[field.name] = 'date';
    } else if (field.type == Q) {
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
    data: [data, table],
    marks: [groupdef('cell', {
      width: layout.cellWidth ? {value: layout.cellWidth} : undefined,
      height: layout.cellHeight ? {value: layout.cellHeight} : undefined
    })]
  };
}

},{"../data":21,"../globals":24,"./group":9}],19:[function(require,module,exports){
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
  var data = spec.data[1],
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

time.cardinality = function(field, stats) {
  var fn = field.fn;
  switch (fn) {
    case 'second': return 60;
    case 'minute': return 60;
    case 'hour': return 24;
    case 'dayofweek': return 7;
    case 'date': return 31;
    case 'month': return 12;
    // case 'year':  -- need real cardinality
  }

  return stats[field.name].cardinality;
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



},{"../globals":24,"../util":27}],20:[function(require,module,exports){
var globals = require('./globals');

var consts = module.exports = {};

consts.encodingTypes = [X, Y, ROW, COL, SIZE, SHAPE, COLOR, ALPHA, TEXT, DETAIL];

consts.dataTypes = {'O': O, 'Q': Q, 'T': T};

consts.dataTypeNames = ['O', 'Q', 'T'].reduce(function(r, x) {
  r[consts.dataTypes[x]] = x;
  return r;
},{});

consts.shorthand = {
  delim:  '|',
  assign: '=',
  type:   ',',
  func:   '_'
};

},{"./globals":24}],21:[function(require,module,exports){
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

    try {
      var number = JSON.parse(datum);
      datum = number;
    } catch(e) {
      // do nothing
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
    var stat = util.minmax(data, k, true);
    stat.cardinality = util.uniq(data, k);
    stat.count = data.length;

    stat.maxlength = data.reduce(function(max,row) {
      if (row[k] === null) {
        return max;
      }
      var len = row[k].toString().length;
      return len > max ? len : max;
    }, 0);

    stat.numNulls = data.reduce(function(count, row) {
      return row[k] === null ? count + 1 : count;
    }, 0);

    var numbers = util.numbers(data.map(function(d) {return d[k];}));

    if (numbers.length > 0) {
      stat.skew = util.skew(numbers);
      stat.stdev = util.stdev(numbers);
      stat.mean = util.mean(numbers);
      stat.median = util.median(numbers);
    }

    var sample = {};
    for (; Object.keys(sample).length < Math.min(stat.cardinality, 10); i++) {
      var value = data[Math.floor(Math.random() * data.length)][k];
      sample[value] = true;
    }
    stat.sample = Object.keys(sample);

    stats[k] = stat;
  });
  stats.count = data.length;
  return stats;
};

},{"./util":27}],22:[function(require,module,exports){
// utility for enc

var consts = require('./consts'),
  c = consts.shorthand,
  time = require('./compile/time'),
  vlfield = require('./field'),
  util = require('./util'),
  schema = require('./schema/schema'),
  encTypes = schema.encTypes;

var vlenc = module.exports = {};

vlenc.has = function(enc, encType) {
  var fieldDef = enc && enc[encType];
  return fieldDef && fieldDef.name;
};

vlenc.forEach = function(enc, f) {
  var i = 0, k;
  encTypes.forEach(function(k) {
    if (vlenc.has(enc, k)) {
      f(k, enc[k], i++);
    }
  });
};

vlenc.map = function(enc, f) {
  var arr = [], k;
  encTypes.forEach(function(k) {
    if (vlenc.has(enc, k)) {
      arr.push(f(enc[k], k, enc));
    }
  });
  return arr;
};

vlenc.reduce = function(enc, f, init) {
  var r = init, i = 0, k;
  encTypes.forEach(function(k) {
    if (vlenc.has(enc, k)) {
      r = f(r, enc[k], k, enc);
    }
  });
  return r;
};

vlenc.shorthand = function(enc) {
  return vlenc.map(enc, function(v, e) {
    return e + c.assign + vlfield.shorthand(v);
  }).join(c.delim);
};

vlenc.parseShorthand = function(shorthand, convertType) {
  var enc = shorthand.split(c.delim);
  return enc.reduce(function(m, e) {
    var split = e.split(c.assign),
        enctype = split[0].trim(),
        field = split[1];

    m[enctype] = vlfield.parseShorthand(field, convertType);
    return m;
  }, {});
};
},{"./compile/time":19,"./consts":20,"./field":23,"./schema/schema":25,"./util":27}],23:[function(require,module,exports){
// utility for field

var consts = require('./consts'),
  c = consts.shorthand,
  time = require('./compile/time'),
  util = require('./util'),
  schema = require('./schema/schema');

var vlfield = module.exports = {};

vlfield.shorthand = function(f) {
  var c = consts.shorthand;
  return (f.aggr ? f.aggr + c.func : '') +
    (f.fn ? f.fn + c.func : '') +
    (f.bin ? 'bin' + c.func : '') +
    (f.name || '') + c.type +
    (consts.dataTypeNames[f.type] || f.type);
};

vlfield.shorthands = function(fields, delim) {
  delim = delim || ',';
  return fields.map(vlfield.shorthand).join(delim);
};

vlfield.parseShorthand = function(shorthand, convertType) {
  var split = shorthand.split(c.type), i;
  var o = {
    name: split[0].trim(),
    type: convertType ? consts.dataTypes[split[1].trim()] : split[1].trim()
  };

  // check aggregate type
  for (i in schema.aggr.enum) {
    var a = schema.aggr.enum[i];
    if (o.name.indexOf(a + '_') === 0) {
      o.name = o.name.substr(a.length + 1);
      if (a == 'count' && o.name.length === 0) o.name = '*';
      o.aggr = a;
      break;
    }
  }

  // check time fn
  for (i in schema.timefns) {
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

  return o;
};

var typeOrder = {
  O: 0,
  G: 1,
  T: 2,
  Q: 3
};

vlfield.order = {};

vlfield.order.type = function(field) {
  if (field.aggr==='count') return 4;
  return typeOrder[field.type];
};

vlfield.order.typeThenName = function(field) {
  return vlfield.order.type(field) + '_' + field.name;
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


vlfield.isType = function (fieldDef, type) {
  return (fieldDef.type & type) > 0;
};

vlfield.isType.byName = function (field, type) {
  return field.type === consts.dataTypeNames[type];
};

function getIsType(useTypeCode) {
  return useTypeCode ? vlfield.isType : vlfield.isType.byName;
}

/*
 * Most fields that use ordinal scale are dimensions.
 * However, YEAR(T), YEARMONTH(T) use time scale, not ordinal but are dimensions too.
 */
vlfield.isOrdinalScale = function(field, useTypeCode /*optional*/) {
  var isType = getIsType(useTypeCode);
  return  isType(field, O) || field.bin ||
    ( isType(field, T) && field.fn && time.isOrdinalFn(field.fn) );
};

function isDimension(field, useTypeCode /*optional*/) {
  var isType = getIsType(useTypeCode);
  return  isType(field, O) || field.bin ||
    ( isType(field, T) && field.fn );
}

/**
 * For encoding, use encoding.isDimension() to avoid confusion.
 * Or use Encoding.isType if your field is from Encoding (and thus have numeric data type).
 * otherwise, do not specific isType so we can use the default isTypeName here.
 */
vlfield.isDimension = function(field, useTypeCode /*optional*/) {
  return field && isDimension(field, useTypeCode);
};

vlfield.isMeasure = function(field, useTypeCode) {
  return field && !isDimension(field, useTypeCode);
};

vlfield.role = function(field) {
  return isDimension(field) ? 'dimension' : 'measure';
};

vlfield.count = function() {
  return {name:'*', aggr: 'count', type:'Q', displayName: vlfield.count.displayName};
};

vlfield.count.displayName = 'Number of Records';

vlfield.isCount = function(field) {
  return field.aggr === 'count';
};

/**
 * For encoding, use encoding.cardinality() to avoid confusion.  Or use Encoding.isType if your field is from Encoding (and thus have numeric data type).
 * otherwise, do not specific isType so we can use the default isTypeName here.
 */
vlfield.cardinality = function(field, stats, maxbins, useTypeCode) {
  var isType = getIsType(useTypeCode);

  if (field.bin) {
    if (!maxbins)
      console.error('vlfield.cardinality not included maxbins');
    var bins = util.getbins(stats[field.name], maxbins);
    return (bins.stop - bins.start) / bins.step;
  }
  if (isType(field, T)) {
    return time.cardinality(field, stats);
  }
  if (field.aggr) {
    return 1;
  }
  return stats[field.name].cardinality;
};

},{"./compile/time":19,"./consts":20,"./schema/schema":25,"./util":27}],24:[function(require,module,exports){
(function (global){
// declare global constant
var g = global || window;

g.TABLE = 'table';
g.RAW = 'raw';
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
g.DETAIL = 'detail';

g.O = 1;
g.Q = 2;
g.T = 4;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],25:[function(require,module,exports){
// Package of defining Vegalite Specification's json schema

var schema = module.exports = {},
  util = require('../util');

schema.util = require('./schemautil');

schema.marktype = {
  type: 'string',
  enum: ['point', 'tick', 'bar', 'line', 'area', 'circle', 'square', 'text']
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

schema.MAXBINS_DEFAULT = 15;

var bin = {
  type: ['boolean', 'object'],
  default: false,
  properties: {
    maxbins: {
      type: 'integer',
      default: schema.MAXBINS_DEFAULT,
      minimum: 2
    }
  },
  supportedTypes: {'Q': true} // TODO: add 'O' after finishing #81
}

var typicalField = merge(clone(schema.field), {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['O', 'Q', 'T']
    },
    aggr: schema.aggr,
    fn: schema.fn,
    bin: bin,
    scale: {
      type: 'object',
      properties: {
        type: schema.scale_type,
        reverse: {
          type: 'boolean',
          default: false,
          supportedTypes: {'Q': true, 'O': true, 'T': true}
        },
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
  supportedRole: {
    dimension: true
  },
  properties: {
    type: {
      type: 'string',
      enum: ['O','Q', 'T'] // ordinal-only field supports Q when bin is applied and T when fn is applied.
    },
    fn: schema.fn,
    bin: bin,
    aggr: {
      type: 'string',
      enum: ['count'],
      supportedTypes: {'O': true}
    }
  }
});

var axisMixin = {
  type: 'object',
  supportedMarktypes: {point: true, tick: true, bar: true, line: true, area: true, circle: true, square: true},
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
          default: undefined,  // auto
          description: 'A title offset value for the axis.'
        },
        format: {
          type: 'string',
          default: undefined,  // auto
          description: 'The formatting pattern for axis labels.'
        },
        maxLabelLength: {
          type: 'integer',
          default: 50,
          minimum: 0,
          description: 'Truncate labels that are too long.'
        }
      }
    }
  }
};

var sortMixin = {
  type: 'object',
  properties: {
    sort: {
      type: 'array',
      default: [],
      items: {
        type: 'object',
        supportedTypes: {'O': true},
        required: ['name', 'aggr'],
        name: {
          type: 'string'
        },
        aggr: {
          type: 'string',
          enum: ['avg', 'sum', 'min', 'max', 'count']
        },
        reverse: {
          type: 'boolean',
          default: false
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
  supportedMarktypes: {'text': true},
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
};

var sizeMixin = {
  type: 'object',
  supportedMarktypes: {point: true, bar: true, circle: true, square: true, text: true},
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
  supportedMarktypes: {point: true, tick: true, bar: true, line: true, area: true, circle: true, square: true, 'text': true},
  properties: {
    value: {
      type: 'string',
      role: 'color',
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
  supportedMarktypes: {point: true, tick: true, bar: true, line: true, area: true, circle: true, square: true, 'text': true},
  properties: {
    value: {
      type: 'number',
      default: undefined,  // auto
      minimum: 0,
      maximum: 1
    }
  }
};

var shapeMixin = {
  type: 'object',
  supportedMarktypes: {point: true, circle: true, square: true},
  properties: {
    value: {
      type: 'string',
      enum: ['circle', 'square', 'cross', 'diamond', 'triangle-up', 'triangle-down'],
      default: 'circle'
    }
  }
};

var detailMixin = {
  type: 'object',
  supportedMarktypes: {point: true, tick: true, line: true, circle: true, square: true}
};

var rowMixin = {
  properties: {
    height: {
      type: 'number',
      minimum: 0,
      default: 150
    }
  }
};

var colMixin = {
  properties: {
    width: {
      type: 'number',
      minimum: 0,
      default: 150
    }
  }
};

var facetMixin = {
  type: 'object',
  supportedMarktypes: {point: true, tick: true, bar: true, line: true, area: true, circle: true, square: true, text: true},
  properties: {
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

var multiRoleField = merge(clone(typicalField), {
  supportedRole: {
    measure: true,
    dimension: true
  }
});

var quantitativeField = merge(clone(typicalField), {
  supportedRole: {
    measure: true,
    dimension: 'ordinal-only' // using alpha / size to encoding category lead to order interpretation
  }
});

var onlyQuantitativeField = merge(clone(typicalField), {
  supportedRole: {
    measure: true
  }
});

var x = merge(clone(multiRoleField), axisMixin, bandMixin, requiredNameType, sortMixin);
var y = clone(x);

var facet = merge(clone(onlyOrdinalField), requiredNameType, facetMixin, sortMixin);
var row = merge(clone(facet), axisMixin, rowMixin);
var col = merge(clone(facet), axisMixin, colMixin);

var size = merge(clone(quantitativeField), legendMixin, sizeMixin, sortMixin);
var color = merge(clone(multiRoleField), legendMixin, colorMixin, sortMixin);
var alpha = merge(clone(quantitativeField), alphaMixin, sortMixin);
var shape = merge(clone(onlyOrdinalField), legendMixin, shapeMixin, sortMixin);
var detail = merge(clone(onlyOrdinalField), detailMixin, sortMixin);

// we only put aggregated measure in pivot table
var text = merge(clone(onlyQuantitativeField), textMixin, sortMixin);

// TODO add label

var filter = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      operands: {
        type: 'array',
        items: {
          type: ['string', 'boolean', 'integer', 'number']
        }
      },
      operator: {
        type: 'string',
        enum: ['>', '>=', '=', '!=', '<', '<=', 'notNull']
      }
    }
  }
};

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
        type: 'integer'
      },
      default: undefined
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
      role: 'color',
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
  description: 'Schema for vegalite specification',
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
        text: text,
        detail: detail
      }
    },
    filter: filter,
    cfg: cfg
  }
};

schema.encTypes = util.keys(schema.schema.properties.enc.properties);

/** Instantiate a verbose vl spec from the schema */
schema.instantiate = function() {
  return schema.util.instantiate(schema.schema);
};

},{"../util":27,"./schemautil":26}],26:[function(require,module,exports){
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
  } else if (schema.type === 'array') {
    return [];
  }
  return undefined;
};

// remove all defaults from an instance
util.subtract = function(instance, defaults) {
  var changes = {};
  for (var prop in instance) {
    var def = defaults[prop];
    var ins = instance[prop];
    // Note: does not properly subtract arrays
    if (!defaults || def !== ins) {
      if (typeof ins === 'object' && !Array.isArray(ins)) {
        var c = util.subtract(ins, def);
        if (!isEmpty(c))
          changes[prop] = c;
      } else if (!Array.isArray(ins) || ins.length > 0) {
        changes[prop] = ins;
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
    if (!src.hasOwnProperty(p)) {
      continue;
    }
    if (src[p] === undefined) {
      continue;
    }
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
},{}],27:[function(require,module,exports){
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

var isNumber = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

util.numbers = function(values) {
  var nums = [];
  for (var i = 0; i < values.length; i++) {
    if (isNumber(values[i])) {
      nums.push(+values[i]);
    }
  }
  return nums;
}

util.median = function(values) {
  values.sort(function(a, b) {return a - b;});
  var half = Math.floor(values.length/2);
  if (values.length % 2) {
    return values[half];
  } else {
    return (values[half-1] + values[half]) / 2.0;
  }
}

util.mean = function(values) {
  return values.reduce(function(v, r) {return v + r;}, 0) / values.length;
}

util.variance = function(values) {
  var avg = util.mean(values);
  var diffs = [];
  for (var i = 0; i < values.length; i++) {
    diffs.push(Math.pow((values[i] - avg), 2));
  }
  return util.mean(diffs);
}

util.stdev = function(values) {
  return Math.sqrt(util.variance(values));
}

util.skew = function(values) {
  var avg = util.mean(values),
    med = util.median(values),
    std = util.stdev(values);
  return 1.0 * (avg - med) / std;
}

util.minmax = function(data, field, excludeNulls) {
  var excludeNulls = excludeNulls === undefined ? false : excludeNulls;
  var stats = {min: +Infinity, max: -Infinity};
  for (i = 0; i < data.length; ++i) {
    var v = data[i][field];
    if (excludeNulls && v === null)
      continue;
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

var merge = function(dest, src) {
  return util.keys(src).reduce(function(c, k) {
    c[k] = src[k];
    return c;
  }, dest);
};

util.merge = function(/*dest*, src0, src1, ...*/){
  var dest = arguments[0];
  for (var i=1 ; i<arguments.length; i++) {
    dest = merge(dest, arguments[i]);
  }
  return dest;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvdmwiLCJzcmMvRW5jb2RpbmcuanMiLCJzcmMvY29tcGlsZS9hZ2dyZWdhdGVzLmpzIiwic3JjL2NvbXBpbGUvYXhpcy5qcyIsInNyYy9jb21waWxlL2Jpbm5pbmcuanMiLCJzcmMvY29tcGlsZS9jb21waWxlLmpzIiwic3JjL2NvbXBpbGUvZmFjZXRpbmcuanMiLCJzcmMvY29tcGlsZS9maWx0ZXIuanMiLCJzcmMvY29tcGlsZS9ncm91cC5qcyIsInNyYy9jb21waWxlL2xheW91dC5qcyIsInNyYy9jb21waWxlL2xlZ2VuZC5qcyIsInNyYy9jb21waWxlL21hcmtzLmpzIiwic3JjL2NvbXBpbGUvc2NhbGUuanMiLCJzcmMvY29tcGlsZS9zb3J0LmpzIiwic3JjL2NvbXBpbGUvc3RhY2tpbmcuanMiLCJzcmMvY29tcGlsZS9zdHlsZS5qcyIsInNyYy9jb21waWxlL3N1YmZhY2V0aW5nLmpzIiwic3JjL2NvbXBpbGUvdGVtcGxhdGUuanMiLCJzcmMvY29tcGlsZS90aW1lLmpzIiwic3JjL2NvbnN0cy5qcyIsInNyYy9kYXRhLmpzIiwic3JjL2VuYy5qcyIsInNyYy9maWVsZC5qcyIsInNyYy9nbG9iYWxzLmpzIiwic3JjL3NjaGVtYS9zY2hlbWEuanMiLCJzcmMvc2NoZW1hL3NjaGVtYXV0aWwuanMiLCJzcmMvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0akJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGdsb2JhbHMgPSByZXF1aXJlKCcuL2dsb2JhbHMnKSxcbiAgICB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyksXG4gICAgY29uc3RzID0gcmVxdWlyZSgnLi9jb25zdHMnKTtcblxudmFyIHZsID0gdXRpbC5tZXJnZShjb25zdHMsIHV0aWwpO1xuXG52bC5FbmNvZGluZyA9IHJlcXVpcmUoJy4vRW5jb2RpbmcnKTtcbnZsLmNvbXBpbGUgPSByZXF1aXJlKCcuL2NvbXBpbGUvY29tcGlsZScpO1xudmwuZGF0YSA9IHJlcXVpcmUoJy4vZGF0YScpO1xudmwuZmllbGQgPSByZXF1aXJlKCcuL2ZpZWxkJyk7XG52bC5lbmMgPSByZXF1aXJlKCcuL2VuYycpO1xudmwuc2NoZW1hID0gcmVxdWlyZSgnLi9zY2hlbWEvc2NoZW1hJyk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSB2bDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vZ2xvYmFscycpLFxuICBjb25zdHMgPSByZXF1aXJlKCcuL2NvbnN0cycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyksXG4gIHZsZmllbGQgPSByZXF1aXJlKCcuL2ZpZWxkJyksXG4gIHZsZW5jID0gcmVxdWlyZSgnLi9lbmMnKSxcbiAgc2NoZW1hID0gcmVxdWlyZSgnLi9zY2hlbWEvc2NoZW1hJyksXG4gIHRpbWUgPSByZXF1aXJlKCcuL2NvbXBpbGUvdGltZScpO1xuXG52YXIgRW5jb2RpbmcgPSBtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcblxuICBmdW5jdGlvbiBFbmNvZGluZyhtYXJrdHlwZSwgZW5jLCBjb25maWcsIGZpbHRlciwgdGhlbWUpIHtcbiAgICB2YXIgZGVmYXVsdHMgPSBzY2hlbWEuaW5zdGFudGlhdGUoKTtcblxuICAgIHZhciBzcGVjID0ge1xuICAgICAgbWFya3R5cGU6IG1hcmt0eXBlLFxuICAgICAgZW5jOiBlbmMsXG4gICAgICBjZmc6IGNvbmZpZyxcbiAgICAgIGZpbHRlcjogZmlsdGVyIHx8IFtdXG4gICAgfTtcblxuICAgIC8vIHR5cGUgdG8gYml0Y29kZVxuICAgIGZvciAodmFyIGUgaW4gZGVmYXVsdHMuZW5jKSB7XG4gICAgICBkZWZhdWx0cy5lbmNbZV0udHlwZSA9IGNvbnN0cy5kYXRhVHlwZXNbZGVmYXVsdHMuZW5jW2VdLnR5cGVdO1xuICAgIH1cblxuICAgIHZhciBzcGVjRXh0ZW5kZWQgPSBzY2hlbWEudXRpbC5tZXJnZShkZWZhdWx0cywgdGhlbWUgfHwge30sIHNwZWMpIDtcblxuICAgIHRoaXMuX21hcmt0eXBlID0gc3BlY0V4dGVuZGVkLm1hcmt0eXBlO1xuICAgIHRoaXMuX2VuYyA9IHNwZWNFeHRlbmRlZC5lbmM7XG4gICAgdGhpcy5fY2ZnID0gc3BlY0V4dGVuZGVkLmNmZztcbiAgICB0aGlzLl9maWx0ZXIgPSBzcGVjRXh0ZW5kZWQuZmlsdGVyO1xuICB9XG5cbiAgdmFyIHByb3RvID0gRW5jb2RpbmcucHJvdG90eXBlO1xuXG4gIHByb3RvLm1hcmt0eXBlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcmt0eXBlO1xuICB9O1xuXG4gIHByb3RvLmlzID0gZnVuY3Rpb24obSkge1xuICAgIHJldHVybiB0aGlzLl9tYXJrdHlwZSA9PT0gbTtcbiAgfTtcblxuICBwcm90by5oYXMgPSBmdW5jdGlvbihlbmNUeXBlKSB7XG4gICAgLy8gZXF1aXZhbGVudCB0byBjYWxsaW5nIHZsZW5jLmhhcyh0aGlzLl9lbmMsIGVuY1R5cGUpXG4gICAgcmV0dXJuIHRoaXMuX2VuY1tlbmNUeXBlXS5uYW1lICE9PSB1bmRlZmluZWQ7XG4gIH07XG5cbiAgcHJvdG8uZW5jID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB0aGlzLl9lbmNbeF07XG4gIH07XG5cbiAgcHJvdG8uZmlsdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZpbHRlcjtcbiAgfTtcblxuICAvLyBnZXQgXCJmaWVsZFwiIHByb3BlcnR5IGZvciB2ZWdhXG4gIHByb3RvLmZpZWxkID0gZnVuY3Rpb24oeCwgbm9kYXRhLCBub2ZuKSB7XG4gICAgaWYgKCF0aGlzLmhhcyh4KSkgcmV0dXJuIG51bGw7XG5cbiAgICB2YXIgZiA9IChub2RhdGEgPyAnJyA6ICdkYXRhLicpO1xuXG4gICAgaWYgKHRoaXMuX2VuY1t4XS5hZ2dyID09PSAnY291bnQnKSB7XG4gICAgICByZXR1cm4gZiArICdjb3VudCc7XG4gICAgfSBlbHNlIGlmICghbm9mbiAmJiB0aGlzLl9lbmNbeF0uYmluKSB7XG4gICAgICByZXR1cm4gZiArICdiaW5fJyArIHRoaXMuX2VuY1t4XS5uYW1lO1xuICAgIH0gZWxzZSBpZiAoIW5vZm4gJiYgdGhpcy5fZW5jW3hdLmFnZ3IpIHtcbiAgICAgIHJldHVybiBmICsgdGhpcy5fZW5jW3hdLmFnZ3IgKyAnXycgKyB0aGlzLl9lbmNbeF0ubmFtZTtcbiAgICB9IGVsc2UgaWYgKCFub2ZuICYmIHRoaXMuX2VuY1t4XS5mbikge1xuICAgICAgcmV0dXJuIGYgKyB0aGlzLl9lbmNbeF0uZm4gKyAnXycgKyB0aGlzLl9lbmNbeF0ubmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGYgKyB0aGlzLl9lbmNbeF0ubmFtZTtcbiAgICB9XG4gIH07XG5cbiAgcHJvdG8uZmllbGROYW1lID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB0aGlzLl9lbmNbeF0ubmFtZTtcbiAgfTtcblxuICBwcm90by5maWVsZFRpdGxlID0gZnVuY3Rpb24oeCkge1xuICAgIGlmICh2bGZpZWxkLmlzQ291bnQodGhpcy5fZW5jW3hdKSkge1xuICAgICAgcmV0dXJuIHZsZmllbGQuY291bnQuZGlzcGxheU5hbWU7XG4gICAgfVxuICAgIHZhciBmbiA9IHRoaXMuX2VuY1t4XS5hZ2dyIHx8IHRoaXMuX2VuY1t4XS5mbiB8fCAodGhpcy5fZW5jW3hdLmJpbiAmJiBcImJpblwiKTtcbiAgICBpZiAoZm4pIHtcbiAgICAgIHJldHVybiBmbi50b1VwcGVyQ2FzZSgpICsgJygnICsgdGhpcy5fZW5jW3hdLm5hbWUgKyAnKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLl9lbmNbeF0ubmFtZTtcbiAgICB9XG4gIH07XG5cbiAgcHJvdG8uc2NhbGUgPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuY1t4XS5zY2FsZSB8fCB7fTtcbiAgfTtcblxuICBwcm90by5heGlzID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB0aGlzLl9lbmNbeF0uYXhpcyB8fCB7fTtcbiAgfTtcblxuICBwcm90by5iYW5kID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB0aGlzLl9lbmNbeF0uYmFuZCB8fCB7fTtcbiAgfTtcblxuICBwcm90by5iYW5kU2l6ZSA9IGZ1bmN0aW9uKGVuY1R5cGUsIHVzZVNtYWxsQmFuZCkge1xuICAgIHVzZVNtYWxsQmFuZCA9IHVzZVNtYWxsQmFuZCB8fFxuICAgICAgLy9pc0JhbmRJblNtYWxsTXVsdGlwbGVzXG4gICAgICAoZW5jVHlwZSA9PT0gWSAmJiB0aGlzLmhhcyhST1cpICYmIHRoaXMuaGFzKFkpKSB8fFxuICAgICAgKGVuY1R5cGUgPT09IFggJiYgdGhpcy5oYXMoQ09MKSAmJiB0aGlzLmhhcyhYKSk7XG5cbiAgICAvLyBpZiBiYW5kLnNpemUgaXMgZXhwbGljaXRseSBzcGVjaWZpZWQsIGZvbGxvdyB0aGUgc3BlY2lmaWNhdGlvbiwgb3RoZXJ3aXNlIGRyYXcgdmFsdWUgZnJvbSBjb25maWcuXG4gICAgcmV0dXJuIHRoaXMuYmFuZChlbmNUeXBlKS5zaXplIHx8XG4gICAgICB0aGlzLmNvbmZpZyh1c2VTbWFsbEJhbmQgPyAnc21hbGxCYW5kU2l6ZScgOiAnbGFyZ2VCYW5kU2l6ZScpO1xuICB9O1xuXG4gIHByb3RvLmFnZ3IgPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuY1t4XS5hZ2dyO1xuICB9O1xuXG4gIC8vIHJldHVybnMgZmFsc2UgaWYgYmlubmluZyBpcyBkaXNhYmxlZCwgb3RoZXJ3aXNlIGFuIG9iamVjdCB3aXRoIGJpbm5pbmcgcHJvcGVydGllc1xuICBwcm90by5iaW4gPSBmdW5jdGlvbih4KSB7XG4gICAgdmFyIGJpbiA9IHRoaXMuX2VuY1t4XS5iaW47XG4gICAgaWYgKGJpbiA9PT0ge30pXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgaWYgKGJpbiA9PT0gdHJ1ZSlcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG1heGJpbnM6IHNjaGVtYS5NQVhCSU5TX0RFRkFVTFRcbiAgICAgIH07XG4gICAgcmV0dXJuIGJpbjtcbiAgfTtcblxuICBwcm90by5sZWdlbmQgPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuY1t4XS5sZWdlbmQ7XG4gIH07XG5cbiAgcHJvdG8udmFsdWUgPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuY1t4XS52YWx1ZTtcbiAgfTtcblxuICBwcm90by5mbiA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW5jW3hdLmZuO1xuICB9O1xuXG4gICBwcm90by5zb3J0ID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB0aGlzLl9lbmNbeF0uc29ydDtcbiAgfTtcblxuICBwcm90by5hbnkgPSBmdW5jdGlvbihmKSB7XG4gICAgcmV0dXJuIHV0aWwuYW55KHRoaXMuX2VuYywgZik7XG4gIH07XG5cbiAgcHJvdG8uYWxsID0gZnVuY3Rpb24oZikge1xuICAgIHJldHVybiB1dGlsLmFsbCh0aGlzLl9lbmMsIGYpO1xuICB9O1xuXG4gIHByb3RvLmxlbmd0aCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB1dGlsLmtleXModGhpcy5fZW5jKS5sZW5ndGg7XG4gIH07XG5cbiAgcHJvdG8ubWFwID0gZnVuY3Rpb24oZikge1xuICAgIHJldHVybiB2bGVuYy5tYXAodGhpcy5fZW5jLCBmKTtcbiAgfTtcblxuICBwcm90by5yZWR1Y2UgPSBmdW5jdGlvbihmLCBpbml0KSB7XG4gICAgcmV0dXJuIHZsZW5jLnJlZHVjZSh0aGlzLl9lbmMsIGYsIGluaXQpO1xuICB9O1xuXG4gIHByb3RvLmZvckVhY2ggPSBmdW5jdGlvbihmKSB7XG4gICAgcmV0dXJuIHZsZW5jLmZvckVhY2godGhpcy5fZW5jLCBmKTtcbiAgfTtcblxuICBwcm90by50eXBlID0gZnVuY3Rpb24oZXQpIHtcbiAgICByZXR1cm4gdGhpcy5oYXMoZXQpID8gdGhpcy5fZW5jW2V0XS50eXBlIDogbnVsbDtcbiAgfTtcblxuICBwcm90by5yb2xlID0gZnVuY3Rpb24oZXQpIHtcbiAgICByZXR1cm4gdGhpcy5oYXMoZXQpID8gdmxmaWVsZC5yb2xlKHRoaXMuX2VuY1tldF0pIDogbnVsbDtcbiAgfTtcblxuICBwcm90by50ZXh0ID0gZnVuY3Rpb24ocHJvcCkge1xuICAgIHZhciB0ZXh0ID0gdGhpcy5fZW5jW1RFWFRdLnRleHQ7XG4gICAgcmV0dXJuIHByb3AgPyB0ZXh0W3Byb3BdIDogdGV4dDtcbiAgfTtcblxuICBwcm90by5mb250ID0gZnVuY3Rpb24ocHJvcCkge1xuICAgIHZhciBmb250ID0gdGhpcy5fZW5jW1RFWFRdLmZvbnQ7XG4gICAgcmV0dXJuIHByb3AgPyBmb250W3Byb3BdIDogZm9udDtcbiAgfTtcblxuICBwcm90by5pc1R5cGUgPSBmdW5jdGlvbih4LCB0eXBlKSB7XG4gICAgdmFyIGZpZWxkID0gdGhpcy5lbmMoeCk7XG4gICAgcmV0dXJuIGZpZWxkICYmIEVuY29kaW5nLmlzVHlwZShmaWVsZCwgdHlwZSk7XG4gIH07XG5cbiAgRW5jb2RpbmcuaXNUeXBlID0gZnVuY3Rpb24gKGZpZWxkRGVmLCB0eXBlKSB7XG4gICAgcmV0dXJuIChmaWVsZERlZi50eXBlICYgdHlwZSkgPiAwO1xuICB9O1xuXG4gIEVuY29kaW5nLmlzT3JkaW5hbFNjYWxlID0gZnVuY3Rpb24oZW5jb2RpbmcsIGVuY1R5cGUpIHtcbiAgICByZXR1cm4gdmxmaWVsZC5pc09yZGluYWxTY2FsZShlbmNvZGluZy5lbmMoZW5jVHlwZSksIHRydWUpO1xuICB9O1xuXG4gIEVuY29kaW5nLmlzRGltZW5zaW9uID0gZnVuY3Rpb24oZW5jb2RpbmcsIGVuY1R5cGUpIHtcbiAgICByZXR1cm4gdmxmaWVsZC5pc0RpbWVuc2lvbihlbmNvZGluZy5lbmMoZW5jVHlwZSksIHRydWUpO1xuICB9O1xuXG4gIEVuY29kaW5nLmlzTWVhc3VyZSA9IGZ1bmN0aW9uKGVuY29kaW5nLCBlbmNUeXBlKSB7XG4gICAgcmV0dXJuIHZsZmllbGQuaXNNZWFzdXJlKGVuY29kaW5nLmVuYyhlbmNUeXBlKSwgdHJ1ZSk7XG4gIH07XG5cbiAgcHJvdG8uaXNPcmRpbmFsU2NhbGUgPSBmdW5jdGlvbihlbmNUeXBlKSB7XG4gICAgcmV0dXJuIHRoaXMuaGFzKGVuY1R5cGUpICYmIEVuY29kaW5nLmlzT3JkaW5hbFNjYWxlKHRoaXMsIGVuY1R5cGUpO1xuICB9O1xuXG4gIHByb3RvLmlzRGltZW5zaW9uID0gZnVuY3Rpb24oZW5jVHlwZSkge1xuICAgIHJldHVybiB0aGlzLmhhcyhlbmNUeXBlKSAmJiBFbmNvZGluZy5pc0RpbWVuc2lvbih0aGlzLCBlbmNUeXBlKTtcbiAgfTtcblxuICBwcm90by5pc01lYXN1cmUgPSBmdW5jdGlvbihlbmNUeXBlKSB7XG4gICAgcmV0dXJuIHRoaXMuaGFzKGVuY1R5cGUpICYmIEVuY29kaW5nLmlzTWVhc3VyZSh0aGlzLCBlbmNUeXBlKTtcbiAgfTtcblxuICBwcm90by5pc0FnZ3JlZ2F0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpID0gMCwgaztcbiAgICBmb3IgKGsgaW4gdGhpcy5fZW5jKSB7XG4gICAgICBpZiAodGhpcy5oYXMoaykgJiYgdGhpcy5hZ2dyKGspKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgRW5jb2RpbmcuaXNBZ2dyZWdhdGUgPSBmdW5jdGlvbihzcGVjKSB7XG4gICAgdmFyIGkgPSAwLCBrLCBlbmM9IHNwZWMuZW5jO1xuICAgIGZvciAoayBpbiBlbmMpIHtcbiAgICAgIGlmIChlbmNba10gJiYgZW5jW2tdLmFnZ3IpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICBwcm90by5jYXJkaW5hbGl0eSA9IGZ1bmN0aW9uKGVuY1R5cGUsIHN0YXRzKSB7XG4gICAgcmV0dXJuIHZsZmllbGQuY2FyZGluYWxpdHkodGhpcy5fZW5jW2VuY1R5cGVdLCBzdGF0cywgdGhpcy5iaW4oZW5jVHlwZSkubWF4YmlucywgdHJ1ZSk7XG4gIH07XG5cbiAgcHJvdG8uaXNSYXcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gIXRoaXMuaXNBZ2dyZWdhdGUoKTtcbiAgfTtcblxuICBwcm90by5jb25maWcgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NmZ1tuYW1lXTtcbiAgfTtcblxuICBwcm90by50b1NwZWMgPSBmdW5jdGlvbihleGNsdWRlQ29uZmlnKSB7XG4gICAgdmFyIGVuYyA9IHV0aWwuZHVwbGljYXRlKHRoaXMuX2VuYyksXG4gICAgICBzcGVjO1xuXG4gICAgLy8gY29udmVydCB0eXBlJ3MgYml0Y29kZSB0byB0eXBlIG5hbWVcbiAgICBmb3IgKHZhciBlIGluIGVuYykge1xuICAgICAgZW5jW2VdLnR5cGUgPSBjb25zdHMuZGF0YVR5cGVOYW1lc1tlbmNbZV0udHlwZV07XG4gICAgfVxuXG4gICAgc3BlYyA9IHtcbiAgICAgIG1hcmt0eXBlOiB0aGlzLl9tYXJrdHlwZSxcbiAgICAgIGVuYzogZW5jLFxuICAgICAgZmlsdGVyOiB0aGlzLl9maWx0ZXJcbiAgICB9O1xuXG4gICAgaWYgKCFleGNsdWRlQ29uZmlnKSB7XG4gICAgICBzcGVjLmNmZyA9IHV0aWwuZHVwbGljYXRlKHRoaXMuX2NmZyk7XG4gICAgfVxuXG4gICAgLy8gcmVtb3ZlIGRlZmF1bHRzXG4gICAgdmFyIGRlZmF1bHRzID0gc2NoZW1hLmluc3RhbnRpYXRlKCk7XG4gICAgcmV0dXJuIHNjaGVtYS51dGlsLnN1YnRyYWN0KHNwZWMsIGRlZmF1bHRzKTtcbiAgfTtcblxuICBwcm90by50b1Nob3J0aGFuZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBlbmMgPSB0aGlzLl9lbmM7XG4gICAgdmFyIGMgPSBjb25zdHMuc2hvcnRoYW5kO1xuICAgIHJldHVybiAnbWFyaycgKyBjLmFzc2lnbiArIHRoaXMuX21hcmt0eXBlICtcbiAgICAgIGMuZGVsaW0gK1xuICAgICAgdmxlbmMuc2hvcnRoYW5kKHRoaXMuX2VuYyk7XG4gIH07XG5cbiAgRW5jb2RpbmcucGFyc2VTaG9ydGhhbmQgPSBmdW5jdGlvbihzaG9ydGhhbmQsIGNmZykge1xuICAgIHZhciBjID0gY29uc3RzLnNob3J0aGFuZCxcbiAgICAgICAgc3BsaXQgPSBzaG9ydGhhbmQuc3BsaXQoYy5kZWxpbSwgMSksXG4gICAgICAgIG1hcmt0eXBlID0gc3BsaXRbMF0uc3BsaXQoYy5hc3NpZ24pWzFdLnRyaW0oKSxcbiAgICAgICAgZW5jID0gdmxlbmMucGFyc2VTaG9ydGhhbmQoc3BsaXRbMV0sIHRydWUpO1xuXG4gICAgcmV0dXJuIG5ldyBFbmNvZGluZyhtYXJrdHlwZSwgZW5jLCBjZmcpO1xuICB9O1xuXG4gIEVuY29kaW5nLnNob3J0aGFuZEZyb21TcGVjID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEVuY29kaW5nLmZyb21TcGVjLmFwcGx5KG51bGwsIGFyZ3VtZW50cykudG9TaG9ydGhhbmQoKTtcbiAgfTtcblxuICBFbmNvZGluZy5zcGVjRnJvbVNob3J0aGFuZCA9IGZ1bmN0aW9uKHNob3J0aGFuZCwgY2ZnLCBleGNsdWRlQ29uZmlnKSB7XG4gICAgcmV0dXJuIEVuY29kaW5nLnBhcnNlU2hvcnRoYW5kKHNob3J0aGFuZCwgY2ZnKS50b1NwZWMoZXhjbHVkZUNvbmZpZyk7XG4gIH07XG5cbiAgRW5jb2RpbmcuZnJvbVNwZWMgPSBmdW5jdGlvbihzcGVjLCB0aGVtZSwgZXh0cmFDZmcpIHtcbiAgICB2YXIgZW5jID0gdXRpbC5kdXBsaWNhdGUoc3BlYy5lbmMpO1xuXG4gICAgLy9jb252ZXJ0IHR5cGUgZnJvbSBzdHJpbmcgdG8gYml0Y29kZSAoZS5nLCBPPTEpXG4gICAgZm9yICh2YXIgZSBpbiBlbmMpIHtcbiAgICAgIGVuY1tlXS50eXBlID0gY29uc3RzLmRhdGFUeXBlc1tlbmNbZV0udHlwZV07XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBFbmNvZGluZyhzcGVjLm1hcmt0eXBlLCBlbmMsIHV0aWwubWVyZ2Uoc3BlYy5jZmcgfHwge30sIGV4dHJhQ2ZnIHx8IHt9KSwgc3BlYy5maWx0ZXIsIHRoZW1lKTtcbiAgfTtcblxuXG4gIHJldHVybiBFbmNvZGluZztcblxufSkoKTtcbiIsInZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFnZ3JlZ2F0ZXM7XG5cbmZ1bmN0aW9uIGFnZ3JlZ2F0ZXMoc3BlYywgZW5jb2RpbmcsIG9wdCkge1xuICBvcHQgPSBvcHQgfHwge307XG5cbiAgdmFyIGRpbXMgPSB7fSwgbWVhcyA9IHt9LCBkZXRhaWwgPSB7fSwgZmFjZXRzID0ge30sXG4gICAgZGF0YSA9IHNwZWMuZGF0YVsxXTsgLy8gY3VycmVudGx5IGRhdGFbMF0gaXMgcmF3IGFuZCBkYXRhWzFdIGlzIHRhYmxlXG5cbiAgZW5jb2RpbmcuZm9yRWFjaChmdW5jdGlvbihlbmNUeXBlLCBmaWVsZCkge1xuICAgIGlmIChmaWVsZC5hZ2dyKSB7XG4gICAgICBpZiAoZmllbGQuYWdnciA9PT0gJ2NvdW50Jykge1xuICAgICAgICBtZWFzWydjb3VudCddID0ge29wOiAnY291bnQnLCBmaWVsZDogJyonfTtcbiAgICAgIH1lbHNlIHtcbiAgICAgICAgbWVhc1tmaWVsZC5hZ2dyICsgJ3wnKyBmaWVsZC5uYW1lXSA9IHtcbiAgICAgICAgICBvcDogZmllbGQuYWdncixcbiAgICAgICAgICBmaWVsZDogJ2RhdGEuJysgZmllbGQubmFtZVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBkaW1zW2ZpZWxkLm5hbWVdID0gZW5jb2RpbmcuZmllbGQoZW5jVHlwZSk7XG4gICAgICBpZiAoZW5jVHlwZSA9PSBST1cgfHwgZW5jVHlwZSA9PSBDT0wpIHtcbiAgICAgICAgZmFjZXRzW2ZpZWxkLm5hbWVdID0gZGltc1tmaWVsZC5uYW1lXTtcbiAgICAgIH1lbHNlIGlmIChlbmNUeXBlICE9PSBYICYmIGVuY1R5cGUgIT09IFkpIHtcbiAgICAgICAgZGV0YWlsW2ZpZWxkLm5hbWVdID0gZGltc1tmaWVsZC5uYW1lXTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICBkaW1zID0gdXRpbC52YWxzKGRpbXMpO1xuICBtZWFzID0gdXRpbC52YWxzKG1lYXMpO1xuXG4gIGlmIChtZWFzLmxlbmd0aCA+IDAgJiYgIW9wdC5wcmVhZ2dyZWdhdGVkRGF0YSkge1xuICAgIGlmICghZGF0YS50cmFuc2Zvcm0pIGRhdGEudHJhbnNmb3JtID0gW107XG4gICAgZGF0YS50cmFuc2Zvcm0ucHVzaCh7XG4gICAgICB0eXBlOiAnYWdncmVnYXRlJyxcbiAgICAgIGdyb3VwYnk6IGRpbXMsXG4gICAgICBmaWVsZHM6IG1lYXNcbiAgICB9KTtcbiAgfVxuICByZXR1cm4ge1xuICAgIGRldGFpbHM6IHV0aWwudmFscyhkZXRhaWwpLFxuICAgIGRpbXM6IGRpbXMsXG4gICAgZmFjZXRzOiB1dGlsLnZhbHMoZmFjZXRzKSxcbiAgICBhZ2dyZWdhdGVkOiBtZWFzLmxlbmd0aCA+IDBcbiAgfTtcbn1cbiIsInZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpLFxuICBzZXR0ZXIgPSB1dGlsLnNldHRlcixcbiAgZ2V0dGVyID0gdXRpbC5nZXR0ZXIsXG4gIHRpbWUgPSByZXF1aXJlKCcuL3RpbWUnKTtcblxudmFyIGF4aXMgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5heGlzLm5hbWVzID0gZnVuY3Rpb24ocHJvcHMpIHtcbiAgcmV0dXJuIHV0aWwua2V5cyh1dGlsLmtleXMocHJvcHMpLnJlZHVjZShmdW5jdGlvbihhLCB4KSB7XG4gICAgdmFyIHMgPSBwcm9wc1t4XS5zY2FsZTtcbiAgICBpZiAocyA9PT0gWCB8fCBzID09PSBZKSBhW3Byb3BzW3hdLnNjYWxlXSA9IDE7XG4gICAgcmV0dXJuIGE7XG4gIH0sIHt9KSk7XG59O1xuXG5heGlzLmRlZnMgPSBmdW5jdGlvbihuYW1lcywgZW5jb2RpbmcsIGxheW91dCwgb3B0KSB7XG4gIHJldHVybiBuYW1lcy5yZWR1Y2UoZnVuY3Rpb24oYSwgbmFtZSkge1xuICAgIGEucHVzaChheGlzLmRlZihuYW1lLCBlbmNvZGluZywgbGF5b3V0LCBvcHQpKTtcbiAgICByZXR1cm4gYTtcbiAgfSwgW10pO1xufTtcblxuYXhpcy5kZWYgPSBmdW5jdGlvbihuYW1lLCBlbmNvZGluZywgbGF5b3V0LCBvcHQpIHtcbiAgdmFyIHR5cGUgPSBuYW1lO1xuICB2YXIgaXNDb2wgPSBuYW1lID09IENPTCwgaXNSb3cgPSBuYW1lID09IFJPVztcbiAgaWYgKGlzQ29sKSB0eXBlID0gJ3gnO1xuICBpZiAoaXNSb3cpIHR5cGUgPSAneSc7XG5cbiAgdmFyIGRlZiA9IHtcbiAgICB0eXBlOiB0eXBlLFxuICAgIHNjYWxlOiBuYW1lXG4gIH07XG5cbiAgaWYgKGVuY29kaW5nLmF4aXMobmFtZSkuZ3JpZCkge1xuICAgIGRlZi5ncmlkID0gdHJ1ZTtcbiAgICBkZWYubGF5ZXIgPSAnYmFjayc7XG4gIH1cblxuICBpZiAoZW5jb2RpbmcuYXhpcyhuYW1lKS50aXRsZSkge1xuICAgIGRlZiA9IGF4aXNfdGl0bGUoZGVmLCBuYW1lLCBlbmNvZGluZywgbGF5b3V0LCBvcHQpO1xuICB9XG5cbiAgaWYgKGlzUm93IHx8IGlzQ29sKSB7XG4gICAgc2V0dGVyKGRlZiwgWydwcm9wZXJ0aWVzJywgJ3RpY2tzJ10sIHtcbiAgICAgIG9wYWNpdHk6IHt2YWx1ZTogMH1cbiAgICB9KTtcbiAgICBzZXR0ZXIoZGVmLCBbJ3Byb3BlcnRpZXMnLCAnbWFqb3JUaWNrcyddLCB7XG4gICAgICBvcGFjaXR5OiB7dmFsdWU6IDB9XG4gICAgfSk7XG4gICAgc2V0dGVyKGRlZiwgWydwcm9wZXJ0aWVzJywgJ2F4aXMnXSwge1xuICAgICAgb3BhY2l0eToge3ZhbHVlOiAwfVxuICAgIH0pO1xuICB9XG5cbiAgaWYgKGlzQ29sKSB7XG4gICAgZGVmLm9yaWVudCA9ICd0b3AnO1xuICB9XG5cbiAgaWYgKGlzUm93KSB7XG4gICAgZGVmLm9mZnNldCA9IGF4aXNUaXRsZU9mZnNldChlbmNvZGluZywgbGF5b3V0LCBZKSArIDIwO1xuICB9XG5cbiAgaWYgKG5hbWUgPT0gWCkge1xuICAgIGlmIChlbmNvZGluZy5pc0RpbWVuc2lvbihYKSB8fCBlbmNvZGluZy5pc1R5cGUoWCwgVCkpIHtcbiAgICAgIHNldHRlcihkZWYsIFsncHJvcGVydGllcycsJ2xhYmVscyddLCB7XG4gICAgICAgIGFuZ2xlOiB7dmFsdWU6IDI3MH0sXG4gICAgICAgIGFsaWduOiB7dmFsdWU6ICdyaWdodCd9LFxuICAgICAgICBiYXNlbGluZToge3ZhbHVlOiAnbWlkZGxlJ31cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7IC8vIFFcbiAgICAgIGRlZi50aWNrcyA9IDU7XG4gICAgfVxuICB9XG5cbiAgZGVmID0gYXhpc19sYWJlbHMoZGVmLCBuYW1lLCBlbmNvZGluZywgbGF5b3V0LCBvcHQpO1xuXG4gIHJldHVybiBkZWY7XG59O1xuXG5mdW5jdGlvbiBheGlzX3RpdGxlKGRlZiwgbmFtZSwgZW5jb2RpbmcsIGxheW91dCwgb3B0KSB7XG4gIHZhciBtYXhsZW5ndGggPSBudWxsLFxuICAgIGZpZWxkVGl0bGUgPSBlbmNvZGluZy5maWVsZFRpdGxlKG5hbWUpO1xuICBpZiAobmFtZT09PVgpIHtcbiAgICBtYXhsZW5ndGggPSBsYXlvdXQuY2VsbFdpZHRoIC8gZW5jb2RpbmcuY29uZmlnKCdjaGFyYWN0ZXJXaWR0aCcpO1xuICB9IGVsc2UgaWYgKG5hbWUgPT09IFkpIHtcbiAgICBtYXhsZW5ndGggPSBsYXlvdXQuY2VsbEhlaWdodCAvIGVuY29kaW5nLmNvbmZpZygnY2hhcmFjdGVyV2lkdGgnKTtcbiAgfVxuXG4gIGRlZi50aXRsZSA9IG1heGxlbmd0aCA/IHV0aWwudHJ1bmNhdGUoZmllbGRUaXRsZSwgbWF4bGVuZ3RoKSA6IGZpZWxkVGl0bGU7XG5cbiAgaWYgKG5hbWUgPT09IFJPVykge1xuICAgIHNldHRlcihkZWYsIFsncHJvcGVydGllcycsJ3RpdGxlJ10sIHtcbiAgICAgIGFuZ2xlOiB7dmFsdWU6IDB9LFxuICAgICAgYWxpZ246IHt2YWx1ZTogJ3JpZ2h0J30sXG4gICAgICBiYXNlbGluZToge3ZhbHVlOiAnbWlkZGxlJ30sXG4gICAgICBkeToge3ZhbHVlOiAoLWxheW91dC5oZWlnaHQvMikgLTIwfVxuICAgIH0pO1xuICB9XG5cbiAgZGVmLnRpdGxlT2Zmc2V0ID0gYXhpc1RpdGxlT2Zmc2V0KGVuY29kaW5nLCBsYXlvdXQsIG5hbWUpO1xuICByZXR1cm4gZGVmO1xufVxuXG5mdW5jdGlvbiBheGlzX2xhYmVscyhkZWYsIG5hbWUsIGVuY29kaW5nLCBsYXlvdXQsIG9wdCkge1xuICB2YXIgZm47XG4gIC8vIGFkZCBjdXN0b20gbGFiZWwgZm9yIHRpbWUgdHlwZVxuICBpZiAoZW5jb2RpbmcuaXNUeXBlKG5hbWUsIFQpICYmIChmbiA9IGVuY29kaW5nLmZuKG5hbWUpKSAmJiAodGltZS5oYXNTY2FsZShmbikpKSB7XG4gICAgc2V0dGVyKGRlZiwgWydwcm9wZXJ0aWVzJywnbGFiZWxzJywndGV4dCcsJ3NjYWxlJ10sICd0aW1lLScrIGZuKTtcbiAgfVxuXG4gIHZhciB0ZXh0VGVtcGxhdGVQYXRoID0gWydwcm9wZXJ0aWVzJywnbGFiZWxzJywndGV4dCcsJ3RlbXBsYXRlJ107XG4gIGlmIChlbmNvZGluZy5heGlzKG5hbWUpLmZvcm1hdCkge1xuICAgIGRlZi5mb3JtYXQgPSBlbmNvZGluZy5heGlzKG5hbWUpLmZvcm1hdDtcbiAgfSBlbHNlIGlmIChlbmNvZGluZy5pc1R5cGUobmFtZSwgUSkpIHtcbiAgICBzZXR0ZXIoZGVmLCB0ZXh0VGVtcGxhdGVQYXRoLCBcInt7ZGF0YSB8IG51bWJlcjonLjNzJ319XCIpO1xuICB9IGVsc2UgaWYgKGVuY29kaW5nLmlzVHlwZShuYW1lLCBUKSAmJiAhZW5jb2RpbmcuZm4obmFtZSkpIHtcbiAgICBzZXR0ZXIoZGVmLCB0ZXh0VGVtcGxhdGVQYXRoLCBcInt7ZGF0YSB8IHRpbWU6JyVZLSVtLSVkJ319XCIpO1xuICB9IGVsc2UgaWYgKGVuY29kaW5nLmlzVHlwZShuYW1lLCBUKSAmJiBlbmNvZGluZy5mbihuYW1lKSA9PT0gJ3llYXInKSB7XG4gICAgc2V0dGVyKGRlZiwgdGV4dFRlbXBsYXRlUGF0aCwgXCJ7e2RhdGEgfCBudW1iZXI6J2QnfX1cIik7XG4gIH0gZWxzZSBpZiAoZW5jb2RpbmcuaXNUeXBlKG5hbWUsIE8pICYmIGVuY29kaW5nLmF4aXMobmFtZSkubWF4TGFiZWxMZW5ndGgpIHtcbiAgICBzZXR0ZXIoZGVmLCB0ZXh0VGVtcGxhdGVQYXRoLCAne3tkYXRhIHwgdHJ1bmNhdGU6JyArIGVuY29kaW5nLmF4aXMobmFtZSkubWF4TGFiZWxMZW5ndGggKyAnfX0nKTtcbiAgfVxuXG4gIHJldHVybiBkZWY7XG59XG5cbmZ1bmN0aW9uIGF4aXNUaXRsZU9mZnNldChlbmNvZGluZywgbGF5b3V0LCBuYW1lKSB7XG4gIHZhciB2YWx1ZSA9IGVuY29kaW5nLmF4aXMobmFtZSkudGl0bGVPZmZzZXQ7XG4gIGlmICh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICBzd2l0Y2ggKG5hbWUpIHtcbiAgICBjYXNlIFJPVzogcmV0dXJuIDA7XG4gICAgY2FzZSBDT0w6IHJldHVybiAzNTtcbiAgfVxuICByZXR1cm4gZ2V0dGVyKGxheW91dCwgW25hbWUsICdheGlzVGl0bGVPZmZzZXQnXSk7XG59XG4iLCJ2YXIgZ2xvYmFscyA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBiaW5uaW5nO1xuXG5mdW5jdGlvbiBiaW5uaW5nKHNwZWMsIGVuY29kaW5nLCBvcHQpIHtcbiAgb3B0ID0gb3B0IHx8IHt9O1xuICB2YXIgYmlucyA9IHt9O1xuXG4gIGlmIChvcHQucHJlYWdncmVnYXRlZERhdGEpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoIXNwZWMudHJhbnNmb3JtKSBzcGVjLnRyYW5zZm9ybSA9IFtdO1xuXG4gIGVuY29kaW5nLmZvckVhY2goZnVuY3Rpb24oZW5jVHlwZSwgZmllbGQpIHtcbiAgICBpZiAoZW5jb2RpbmcuYmluKGVuY1R5cGUpKSB7XG4gICAgICBzcGVjLnRyYW5zZm9ybS5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2JpbicsXG4gICAgICAgIGZpZWxkOiAnZGF0YS4nICsgZmllbGQubmFtZSxcbiAgICAgICAgb3V0cHV0OiAnZGF0YS5iaW5fJyArIGZpZWxkLm5hbWUsXG4gICAgICAgIG1heGJpbnM6IGVuY29kaW5nLmJpbihlbmNUeXBlKS5tYXhiaW5zXG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xufVxuIiwidmFyIGdsb2JhbHMgPSByZXF1aXJlKCcuLi9nbG9iYWxzJyksXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gY29tcGlsZTtcblxudmFyIHRlbXBsYXRlID0gY29tcGlsZS50ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGUnKSxcbiAgYXhpcyA9IGNvbXBpbGUuYXhpcyA9IHJlcXVpcmUoJy4vYXhpcycpLFxuICBmaWx0ZXIgPSBjb21waWxlLmZpbHRlciA9IHJlcXVpcmUoJy4vZmlsdGVyJyksXG4gIGxlZ2VuZCA9IGNvbXBpbGUubGVnZW5kID0gcmVxdWlyZSgnLi9sZWdlbmQnKSxcbiAgbWFya3MgPSBjb21waWxlLm1hcmtzID0gcmVxdWlyZSgnLi9tYXJrcycpLFxuICBzY2FsZSA9IGNvbXBpbGUuc2NhbGUgPSByZXF1aXJlKCcuL3NjYWxlJyksXG4gIHZsc29ydCA9IGNvbXBpbGUuc29ydCA9IHJlcXVpcmUoJy4vc29ydCcpLFxuICB2bHN0eWxlID0gY29tcGlsZS5zdHlsZSA9IHJlcXVpcmUoJy4vc3R5bGUnKSxcbiAgdGltZSA9IGNvbXBpbGUudGltZSA9IHJlcXVpcmUoJy4vdGltZScpLFxuICBhZ2dyZWdhdGVzID0gY29tcGlsZS5hZ2dyZWdhdGVzID0gcmVxdWlyZSgnLi9hZ2dyZWdhdGVzJyksXG4gIGJpbm5pbmcgPSBjb21waWxlLmJpbm5pbmcgPSByZXF1aXJlKCcuL2Jpbm5pbmcnKSxcbiAgZmFjZXRpbmcgPSBjb21waWxlLmZhY2V0aW5nID0gcmVxdWlyZSgnLi9mYWNldGluZycpLFxuICBzdGFja2luZyA9IGNvbXBpbGUuc3RhY2tpbmcgPSByZXF1aXJlKCcuL3N0YWNraW5nJyk7XG4gIHN1YmZhY2V0aW5nID0gY29tcGlsZS5zdWJmYWNldGluZyA9IHJlcXVpcmUoJy4vc3ViZmFjZXRpbmcnKTtcblxuY29tcGlsZS5sYXlvdXQgPSByZXF1aXJlKCcuL2xheW91dCcpO1xuY29tcGlsZS5ncm91cCA9IHJlcXVpcmUoJy4vZ3JvdXAnKTtcblxuZnVuY3Rpb24gY29tcGlsZShlbmNvZGluZywgc3RhdHMpIHtcbiAgdmFyIGxheW91dCA9IGNvbXBpbGUubGF5b3V0KGVuY29kaW5nLCBzdGF0cyksXG4gICAgc3R5bGUgPSB2bHN0eWxlKGVuY29kaW5nLCBzdGF0cyksXG4gICAgc3BlYyA9IHRlbXBsYXRlKGVuY29kaW5nLCBsYXlvdXQsIHN0YXRzKSxcbiAgICBncm91cCA9IHNwZWMubWFya3NbMF0sXG4gICAgbWFyayA9IG1hcmtzW2VuY29kaW5nLm1hcmt0eXBlKCldLFxuICAgIG1kZWZzID0gbWFya3MuZGVmKG1hcmssIGVuY29kaW5nLCBsYXlvdXQsIHN0eWxlKSxcbiAgICBtZGVmID0gbWRlZnNbMF07ICAvLyBUT0RPOiByZW1vdmUgdGhpcyBkaXJ0eSBoYWNrIGJ5IHJlZmFjdG9yaW5nIHRoZSB3aG9sZSBmbG93XG5cbiAgZmlsdGVyLmFkZEZpbHRlcnMoc3BlYywgZW5jb2RpbmcpO1xuICB2YXIgc29ydGluZyA9IHZsc29ydChzcGVjLCBlbmNvZGluZyk7XG5cbiAgdmFyIGhhc1JvdyA9IGVuY29kaW5nLmhhcyhST1cpLCBoYXNDb2wgPSBlbmNvZGluZy5oYXMoQ09MKTtcblxuICB2YXIgcHJlYWdncmVnYXRlZERhdGEgPSBlbmNvZGluZy5jb25maWcoJ3VzZVZlZ2FTZXJ2ZXInKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IG1kZWZzLmxlbmd0aDsgaSsrKSB7XG4gICAgZ3JvdXAubWFya3MucHVzaChtZGVmc1tpXSk7XG4gIH1cblxuICBiaW5uaW5nKHNwZWMuZGF0YVsxXSwgZW5jb2RpbmcsIHtwcmVhZ2dyZWdhdGVkRGF0YTogcHJlYWdncmVnYXRlZERhdGF9KTtcblxuICB2YXIgbGluZVR5cGUgPSBtYXJrc1tlbmNvZGluZy5tYXJrdHlwZSgpXS5saW5lO1xuXG4gIGlmICghcHJlYWdncmVnYXRlZERhdGEpIHtcbiAgICBzcGVjID0gdGltZShzcGVjLCBlbmNvZGluZyk7XG4gIH1cblxuICAvLyBoYW5kbGUgc3ViZmFjZXRzXG4gIHZhciBhZ2dSZXN1bHQgPSBhZ2dyZWdhdGVzKHNwZWMsIGVuY29kaW5nLCB7cHJlYWdncmVnYXRlZERhdGE6IHByZWFnZ3JlZ2F0ZWREYXRhfSksXG4gICAgZGV0YWlscyA9IGFnZ1Jlc3VsdC5kZXRhaWxzLFxuICAgIGhhc0RldGFpbHMgPSBkZXRhaWxzICYmIGRldGFpbHMubGVuZ3RoID4gMCxcbiAgICBzdGFjayA9IGhhc0RldGFpbHMgJiYgc3RhY2tpbmcoc3BlYywgZW5jb2RpbmcsIG1kZWYsIGFnZ1Jlc3VsdC5mYWNldHMpO1xuXG4gIGlmIChoYXNEZXRhaWxzICYmIChzdGFjayB8fCBsaW5lVHlwZSkpIHtcbiAgICAvL3N1YmZhY2V0IHRvIGdyb3VwIHN0YWNrIC8gbGluZSB0b2dldGhlciBpbiBvbmUgZ3JvdXBcbiAgICBzdWJmYWNldGluZyhncm91cCwgbWRlZiwgZGV0YWlscywgc3RhY2ssIGVuY29kaW5nKTtcbiAgfVxuXG4gIC8vIGF1dG8tc29ydCBsaW5lL2FyZWEgdmFsdWVzXG4gIC8vVE9ETyhrYW5pdHcpOiBoYXZlIHNvbWUgY29uZmlnIHRvIHR1cm4gb2ZmIGF1dG8tc29ydCBmb3IgbGluZSAoZm9yIGxpbmUgY2hhcnQgdGhhdCBlbmNvZGVzIHRlbXBvcmFsIGluZm9ybWF0aW9uKVxuICBpZiAobGluZVR5cGUpIHtcbiAgICB2YXIgZiA9IChlbmNvZGluZy5pc01lYXN1cmUoWCkgJiYgZW5jb2RpbmcuaXNEaW1lbnNpb24oWSkpID8gWSA6IFg7XG4gICAgaWYgKCFtZGVmLmZyb20pIG1kZWYuZnJvbSA9IHt9O1xuICAgIG1kZWYuZnJvbS50cmFuc2Zvcm0gPSBbe3R5cGU6ICdzb3J0JywgYnk6IGVuY29kaW5nLmZpZWxkKGYpfV07XG4gIH1cblxuICAvLyBTbWFsbCBNdWx0aXBsZXNcbiAgaWYgKGhhc1JvdyB8fCBoYXNDb2wpIHtcbiAgICBzcGVjID0gZmFjZXRpbmcoZ3JvdXAsIGVuY29kaW5nLCBsYXlvdXQsIHN0eWxlLCBzb3J0aW5nLCBzcGVjLCBtZGVmLCBzdGFjaywgc3RhdHMpO1xuICAgIHNwZWMubGVnZW5kcyA9IGxlZ2VuZC5kZWZzKGVuY29kaW5nKTtcbiAgfSBlbHNlIHtcbiAgICBncm91cC5zY2FsZXMgPSBzY2FsZS5kZWZzKHNjYWxlLm5hbWVzKG1kZWYucHJvcGVydGllcy51cGRhdGUpLCBlbmNvZGluZywgbGF5b3V0LCBzdHlsZSwgc29ydGluZyxcbiAgICAgIHtzdGFjazogc3RhY2ssIHN0YXRzOiBzdGF0c30pO1xuICAgIGdyb3VwLmF4ZXMgPSBheGlzLmRlZnMoYXhpcy5uYW1lcyhtZGVmLnByb3BlcnRpZXMudXBkYXRlKSwgZW5jb2RpbmcsIGxheW91dCk7XG4gICAgZ3JvdXAubGVnZW5kcyA9IGxlZ2VuZC5kZWZzKGVuY29kaW5nKTtcbiAgfVxuXG4gIGZpbHRlci5maWx0ZXJMZXNzVGhhblplcm8oc3BlYywgZW5jb2RpbmcpO1xuXG4gIHJldHVybiBzcGVjO1xufVxuXG4iLCJ2YXIgZ2xvYmFscyA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcblxudmFyIGF4aXMgPSByZXF1aXJlKCcuL2F4aXMnKSxcbiAgZ3JvdXBkZWYgPSByZXF1aXJlKCcuL2dyb3VwJykuZGVmLFxuICBzY2FsZSA9IHJlcXVpcmUoJy4vc2NhbGUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmYWNldGluZztcblxuZnVuY3Rpb24gZmFjZXRpbmcoZ3JvdXAsIGVuY29kaW5nLCBsYXlvdXQsIHN0eWxlLCBzb3J0aW5nLCBzcGVjLCBtZGVmLCBzdGFjaywgc3RhdHMpIHtcbiAgdmFyIGVudGVyID0gZ3JvdXAucHJvcGVydGllcy5lbnRlcjtcbiAgdmFyIGZhY2V0S2V5cyA9IFtdLCBjZWxsQXhlcyA9IFtdLCBmcm9tLCBheGVzR3JwO1xuXG4gIHZhciBoYXNSb3cgPSBlbmNvZGluZy5oYXMoUk9XKSwgaGFzQ29sID0gZW5jb2RpbmcuaGFzKENPTCk7XG5cbiAgZW50ZXIuZmlsbCA9IHt2YWx1ZTogZW5jb2RpbmcuY29uZmlnKCdjZWxsQmFja2dyb3VuZENvbG9yJyl9O1xuXG4gIC8vbW92ZSBcImZyb21cIiB0byBjZWxsIGxldmVsIGFuZCBhZGQgZmFjZXQgdHJhbnNmb3JtXG4gIGdyb3VwLmZyb20gPSB7ZGF0YTogZ3JvdXAubWFya3NbMF0uZnJvbS5kYXRhfTtcblxuICAvLyBIYWNrLCB0aGlzIG5lZWRzIHRvIGJlIHJlZmFjdG9yZWRcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBncm91cC5tYXJrcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBtYXJrID0gZ3JvdXAubWFya3NbaV07XG4gICAgaWYgKG1hcmsuZnJvbS50cmFuc2Zvcm0pIHtcbiAgICAgIGRlbGV0ZSBtYXJrLmZyb20uZGF0YTsgLy9uZWVkIHRvIGtlZXAgdHJhbnNmb3JtIGZvciBzdWJmYWNldHRpbmcgY2FzZVxuICAgIH0gZWxzZSB7XG4gICAgICBkZWxldGUgbWFyay5mcm9tO1xuICAgIH1cbiAgfTtcbiAgaWYgKGhhc1Jvdykge1xuICAgIGlmICghZW5jb2RpbmcuaXNEaW1lbnNpb24oUk9XKSkge1xuICAgICAgdXRpbC5lcnJvcignUm93IGVuY29kaW5nIHNob3VsZCBiZSBvcmRpbmFsLicpO1xuICAgIH1cbiAgICBlbnRlci55ID0ge3NjYWxlOiBST1csIGZpZWxkOiAna2V5cy4nICsgZmFjZXRLZXlzLmxlbmd0aH07XG4gICAgZW50ZXIuaGVpZ2h0ID0geyd2YWx1ZSc6IGxheW91dC5jZWxsSGVpZ2h0fTsgLy8gSEFDS1xuXG4gICAgZmFjZXRLZXlzLnB1c2goZW5jb2RpbmcuZmllbGQoUk9XKSk7XG5cbiAgICBpZiAoaGFzQ29sKSB7XG4gICAgICBmcm9tID0gdXRpbC5kdXBsaWNhdGUoZ3JvdXAuZnJvbSk7XG4gICAgICBmcm9tLnRyYW5zZm9ybSA9IGZyb20udHJhbnNmb3JtIHx8IFtdO1xuICAgICAgZnJvbS50cmFuc2Zvcm0udW5zaGlmdCh7dHlwZTogJ2ZhY2V0Jywga2V5czogW2VuY29kaW5nLmZpZWxkKENPTCldfSk7XG4gICAgfVxuXG4gICAgYXhlc0dycCA9IGdyb3VwZGVmKCd4LWF4ZXMnLCB7XG4gICAgICAgIGF4ZXM6IGVuY29kaW5nLmhhcyhYKSA/IGF4aXMuZGVmcyhbJ3gnXSwgZW5jb2RpbmcsIGxheW91dCkgOiB1bmRlZmluZWQsXG4gICAgICAgIHg6IGhhc0NvbCA/IHtzY2FsZTogQ09MLCBmaWVsZDogJ2tleXMuMCd9IDoge3ZhbHVlOiAwfSxcbiAgICAgICAgd2lkdGg6IGhhc0NvbCAmJiB7J3ZhbHVlJzogbGF5b3V0LmNlbGxXaWR0aH0sIC8vSEFDSz9cbiAgICAgICAgZnJvbTogZnJvbVxuICAgICAgfSk7XG5cbiAgICBzcGVjLm1hcmtzLnB1c2goYXhlc0dycCk7XG4gICAgKHNwZWMuYXhlcyA9IHNwZWMuYXhlcyB8fCBbXSk7XG4gICAgc3BlYy5heGVzLnB1c2guYXBwbHkoc3BlYy5heGVzLCBheGlzLmRlZnMoWydyb3cnXSwgZW5jb2RpbmcsIGxheW91dCkpO1xuICB9IGVsc2UgeyAvLyBkb2Vzbid0IGhhdmUgcm93XG4gICAgaWYgKGVuY29kaW5nLmhhcyhYKSkge1xuICAgICAgLy9rZWVwIHggYXhpcyBpbiB0aGUgY2VsbFxuICAgICAgY2VsbEF4ZXMucHVzaC5hcHBseShjZWxsQXhlcywgYXhpcy5kZWZzKFsneCddLCBlbmNvZGluZywgbGF5b3V0KSk7XG4gICAgfVxuICB9XG5cbiAgaWYgKGhhc0NvbCkge1xuICAgIGlmICghZW5jb2RpbmcuaXNEaW1lbnNpb24oQ09MKSkge1xuICAgICAgdXRpbC5lcnJvcignQ29sIGVuY29kaW5nIHNob3VsZCBiZSBvcmRpbmFsLicpO1xuICAgIH1cbiAgICBlbnRlci54ID0ge3NjYWxlOiBDT0wsIGZpZWxkOiAna2V5cy4nICsgZmFjZXRLZXlzLmxlbmd0aH07XG4gICAgZW50ZXIud2lkdGggPSB7J3ZhbHVlJzogbGF5b3V0LmNlbGxXaWR0aH07IC8vIEhBQ0tcblxuICAgIGZhY2V0S2V5cy5wdXNoKGVuY29kaW5nLmZpZWxkKENPTCkpO1xuXG4gICAgaWYgKGhhc1Jvdykge1xuICAgICAgZnJvbSA9IHV0aWwuZHVwbGljYXRlKGdyb3VwLmZyb20pO1xuICAgICAgZnJvbS50cmFuc2Zvcm0gPSBmcm9tLnRyYW5zZm9ybSB8fCBbXTtcbiAgICAgIGZyb20udHJhbnNmb3JtLnVuc2hpZnQoe3R5cGU6ICdmYWNldCcsIGtleXM6IFtlbmNvZGluZy5maWVsZChST1cpXX0pO1xuICAgIH1cblxuICAgIGF4ZXNHcnAgPSBncm91cGRlZigneS1heGVzJywge1xuICAgICAgYXhlczogZW5jb2RpbmcuaGFzKFkpID8gYXhpcy5kZWZzKFsneSddLCBlbmNvZGluZywgbGF5b3V0KSA6IHVuZGVmaW5lZCxcbiAgICAgIHk6IGhhc1JvdyAmJiB7c2NhbGU6IFJPVywgZmllbGQ6ICdrZXlzLjAnfSxcbiAgICAgIHg6IGhhc1JvdyAmJiB7dmFsdWU6IDB9LFxuICAgICAgaGVpZ2h0OiBoYXNSb3cgJiYgeyd2YWx1ZSc6IGxheW91dC5jZWxsSGVpZ2h0fSwgLy9IQUNLP1xuICAgICAgZnJvbTogZnJvbVxuICAgIH0pO1xuXG4gICAgc3BlYy5tYXJrcy5wdXNoKGF4ZXNHcnApO1xuICAgIChzcGVjLmF4ZXMgPSBzcGVjLmF4ZXMgfHwgW10pO1xuICAgIHNwZWMuYXhlcy5wdXNoLmFwcGx5KHNwZWMuYXhlcywgYXhpcy5kZWZzKFsnY29sJ10sIGVuY29kaW5nLCBsYXlvdXQpKTtcbiAgfSBlbHNlIHsgLy8gZG9lc24ndCBoYXZlIGNvbFxuICAgIGlmIChlbmNvZGluZy5oYXMoWSkpIHtcbiAgICAgIGNlbGxBeGVzLnB1c2guYXBwbHkoY2VsbEF4ZXMsIGF4aXMuZGVmcyhbJ3knXSwgZW5jb2RpbmcsIGxheW91dCkpO1xuICAgIH1cbiAgfVxuXG4gIC8vIGFzc3VtaW5nIGVxdWFsIGNlbGxXaWR0aCBoZXJlXG4gIC8vIFRPRE86IHN1cHBvcnQgaGV0ZXJvZ2Vub3VzIGNlbGxXaWR0aCAobWF5YmUgYnkgdXNpbmcgbXVsdGlwbGUgc2NhbGVzPylcbiAgc3BlYy5zY2FsZXMgPSAoc3BlYy5zY2FsZXMgfHwgW10pLmNvbmNhdChzY2FsZS5kZWZzKFxuICAgIHNjYWxlLm5hbWVzKGVudGVyKS5jb25jYXQoc2NhbGUubmFtZXMobWRlZi5wcm9wZXJ0aWVzLnVwZGF0ZSkpLFxuICAgIGVuY29kaW5nLFxuICAgIGxheW91dCxcbiAgICBzdHlsZSxcbiAgICBzb3J0aW5nLFxuICAgIHtzdGFjazogc3RhY2ssIGZhY2V0OiB0cnVlLCBzdGF0czogc3RhdHN9XG4gICkpOyAvLyByb3cvY29sIHNjYWxlcyArIGNlbGwgc2NhbGVzXG5cbiAgaWYgKGNlbGxBeGVzLmxlbmd0aCA+IDApIHtcbiAgICBncm91cC5heGVzID0gY2VsbEF4ZXM7XG4gIH1cblxuICAvLyBhZGQgZmFjZXQgdHJhbnNmb3JtXG4gIHZhciB0cmFucyA9IChncm91cC5mcm9tLnRyYW5zZm9ybSB8fCAoZ3JvdXAuZnJvbS50cmFuc2Zvcm0gPSBbXSkpO1xuICB0cmFucy51bnNoaWZ0KHt0eXBlOiAnZmFjZXQnLCBrZXlzOiBmYWNldEtleXN9KTtcblxuICByZXR1cm4gc3BlYztcbn1cbiIsInZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpO1xuXG52YXIgZmlsdGVyID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxudmFyIEJJTkFSWSA9IHtcbiAgJz4nOiAgdHJ1ZSxcbiAgJz49JzogdHJ1ZSxcbiAgJz0nOiAgdHJ1ZSxcbiAgJyE9JzogdHJ1ZSxcbiAgJzwnOiAgdHJ1ZSxcbiAgJzw9JzogdHJ1ZVxufTtcblxuZmlsdGVyLmFkZEZpbHRlcnMgPSBmdW5jdGlvbihzcGVjLCBlbmNvZGluZykge1xuICB2YXIgZmlsdGVycyA9IGVuY29kaW5nLmZpbHRlcigpLFxuICAgIGRhdGEgPSBzcGVjLmRhdGFbMF07ICAvLyBhcHBseSBmaWx0ZXJzIHRvIHJhdyBkYXRhIGJlZm9yZSBhZ2dyZWdhdGlvblxuXG4gIGlmICghZGF0YS50cmFuc2Zvcm0pXG4gICAgZGF0YS50cmFuc2Zvcm0gPSBbXTtcblxuICAvLyBhZGQgY3VzdG9tIGZpbHRlcnNcbiAgZm9yICh2YXIgaSBpbiBmaWx0ZXJzKSB7XG4gICAgdmFyIGZpbHRlciA9IGZpbHRlcnNbaV07XG5cbiAgICB2YXIgY29uZGl0aW9uID0gJyc7XG4gICAgdmFyIG9wZXJhdG9yID0gZmlsdGVyLm9wZXJhdG9yO1xuICAgIHZhciBvcGVyYW5kcyA9IGZpbHRlci5vcGVyYW5kcztcblxuICAgIGlmIChCSU5BUllbb3BlcmF0b3JdKSB7XG4gICAgICAvLyBleHBlY3RzIGEgZmllbGQgYW5kIGEgdmFsdWVcbiAgICAgIGlmIChvcGVyYXRvciA9PT0gJz0nKSB7XG4gICAgICAgIG9wZXJhdG9yID0gJz09JztcbiAgICAgIH1cblxuICAgICAgdmFyIG9wMSA9IG9wZXJhbmRzWzBdO1xuICAgICAgdmFyIG9wMiA9IG9wZXJhbmRzWzFdO1xuICAgICAgY29uZGl0aW9uID0gJ2QuZGF0YS4nICsgb3AxICsgb3BlcmF0b3IgKyBvcDI7XG4gICAgfSBlbHNlIGlmIChvcGVyYXRvciA9PT0gJ25vdE51bGwnKSB7XG4gICAgICAvLyBleHBlY3RzIGEgbnVtYmVyIG9mIGZpZWxkc1xuICAgICAgZm9yICh2YXIgaiBpbiBvcGVyYW5kcykge1xuICAgICAgICBjb25kaXRpb24gKz0gJ2QuZGF0YS4nICsgb3BlcmFuZHNbal0gKyAnIT09bnVsbCc7XG4gICAgICAgIGlmIChqIDwgb3BlcmFuZHMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgIGNvbmRpdGlvbiArPSAnICYmICc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKCdVbnN1cHBvcnRlZCBvcGVyYXRvcjogJywgb3BlcmF0b3IpO1xuICAgIH1cblxuICAgIGRhdGEudHJhbnNmb3JtLnB1c2goe1xuICAgICAgdHlwZTogJ2ZpbHRlcicsXG4gICAgICB0ZXN0OiBjb25kaXRpb25cbiAgICB9KTtcbiAgfVxufTtcblxuLy8gcmVtb3ZlIGxlc3MgdGhhbiAwIHZhbHVlcyBpZiB3ZSB1c2UgbG9nIGZ1bmN0aW9uXG5maWx0ZXIuZmlsdGVyTGVzc1RoYW5aZXJvID0gZnVuY3Rpb24oc3BlYywgZW5jb2RpbmcpIHtcbiAgZW5jb2RpbmcuZm9yRWFjaChmdW5jdGlvbihlbmNUeXBlLCBmaWVsZCkge1xuICAgIGlmIChlbmNvZGluZy5zY2FsZShlbmNUeXBlKS50eXBlID09PSAnbG9nJykge1xuICAgICAgc3BlYy5kYXRhWzFdLnRyYW5zZm9ybS5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2ZpbHRlcicsXG4gICAgICAgIHRlc3Q6ICdkLicgKyBlbmNvZGluZy5maWVsZChlbmNUeXBlKSArICc+MCdcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG59O1xuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgZGVmOiBncm91cGRlZlxufTtcblxuZnVuY3Rpb24gZ3JvdXBkZWYobmFtZSwgb3B0KSB7XG4gIG9wdCA9IG9wdCB8fCB7fTtcbiAgcmV0dXJuIHtcbiAgICBfbmFtZTogbmFtZSB8fCB1bmRlZmluZWQsXG4gICAgdHlwZTogJ2dyb3VwJyxcbiAgICBmcm9tOiBvcHQuZnJvbSxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICBlbnRlcjoge1xuICAgICAgICB4OiBvcHQueCB8fCB1bmRlZmluZWQsXG4gICAgICAgIHk6IG9wdC55IHx8IHVuZGVmaW5lZCxcbiAgICAgICAgd2lkdGg6IG9wdC53aWR0aCB8fCB7Z3JvdXA6ICd3aWR0aCd9LFxuICAgICAgICBoZWlnaHQ6IG9wdC5oZWlnaHQgfHwge2dyb3VwOiAnaGVpZ2h0J31cbiAgICAgIH1cbiAgICB9LFxuICAgIHNjYWxlczogb3B0LnNjYWxlcyB8fCB1bmRlZmluZWQsXG4gICAgYXhlczogb3B0LmF4ZXMgfHwgdW5kZWZpbmVkLFxuICAgIG1hcmtzOiBvcHQubWFya3MgfHwgW11cbiAgfTtcbn1cbiIsInZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpLFxuICBzZXR0ZXIgPSB1dGlsLnNldHRlcixcbiAgc2NoZW1hID0gcmVxdWlyZSgnLi4vc2NoZW1hL3NjaGVtYScpLFxuICB0aW1lID0gcmVxdWlyZSgnLi90aW1lJyksXG4gIHZsZmllbGQgPSByZXF1aXJlKCcuLi9maWVsZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHZsbGF5b3V0O1xuXG5mdW5jdGlvbiB2bGxheW91dChlbmNvZGluZywgc3RhdHMpIHtcbiAgdmFyIGxheW91dCA9IGJveChlbmNvZGluZywgc3RhdHMpO1xuICBsYXlvdXQgPSBvZmZzZXQoZW5jb2RpbmcsIHN0YXRzLCBsYXlvdXQpO1xuICByZXR1cm4gbGF5b3V0O1xufVxuXG4vKlxuICBIQUNLIHRvIHNldCBjaGFydCBzaXplXG4gIE5PVEU6IHRoaXMgZmFpbHMgZm9yIHBsb3RzIGRyaXZlbiBieSBkZXJpdmVkIHZhbHVlcyAoZS5nLiwgYWdncmVnYXRlcylcbiAgT25lIHNvbHV0aW9uIGlzIHRvIHVwZGF0ZSBWZWdhIHRvIHN1cHBvcnQgYXV0by1zaXppbmdcbiAgSW4gdGhlIG1lYW50aW1lLCBhdXRvLXBhZGRpbmcgKG1vc3RseSkgZG9lcyB0aGUgdHJpY2tcbiAqL1xuZnVuY3Rpb24gYm94KGVuY29kaW5nLCBzdGF0cykge1xuICB2YXIgaGFzUm93ID0gZW5jb2RpbmcuaGFzKFJPVyksXG4gICAgICBoYXNDb2wgPSBlbmNvZGluZy5oYXMoQ09MKSxcbiAgICAgIGhhc1ggPSBlbmNvZGluZy5oYXMoWCksXG4gICAgICBoYXNZID0gZW5jb2RpbmcuaGFzKFkpLFxuICAgICAgbWFya3R5cGUgPSBlbmNvZGluZy5tYXJrdHlwZSgpO1xuXG4gIHZhciB4Q2FyZGluYWxpdHkgPSBoYXNYICYmIGVuY29kaW5nLmlzRGltZW5zaW9uKFgpID8gZW5jb2RpbmcuY2FyZGluYWxpdHkoWCwgc3RhdHMpIDogMSxcbiAgICB5Q2FyZGluYWxpdHkgPSBoYXNZICYmIGVuY29kaW5nLmlzRGltZW5zaW9uKFkpID8gZW5jb2RpbmcuY2FyZGluYWxpdHkoWSwgc3RhdHMpIDogMTtcblxuICB2YXIgdXNlU21hbGxCYW5kID0geENhcmRpbmFsaXR5ID4gZW5jb2RpbmcuY29uZmlnKCdsYXJnZUJhbmRNYXhDYXJkaW5hbGl0eScpIHx8XG4gICAgeUNhcmRpbmFsaXR5ID4gZW5jb2RpbmcuY29uZmlnKCdsYXJnZUJhbmRNYXhDYXJkaW5hbGl0eScpO1xuXG4gIHZhciBjZWxsV2lkdGgsIGNlbGxIZWlnaHQsIGNlbGxQYWRkaW5nID0gZW5jb2RpbmcuY29uZmlnKCdjZWxsUGFkZGluZycpO1xuXG4gIC8vIHNldCBjZWxsV2lkdGhcbiAgaWYgKGhhc1gpIHtcbiAgICBpZiAoZW5jb2RpbmcuaXNPcmRpbmFsU2NhbGUoWCkpIHtcbiAgICAgIC8vIGZvciBvcmRpbmFsLCBoYXNDb2wgb3Igbm90IGRvZXNuJ3QgbWF0dGVyIC0tIHdlIHNjYWxlIGJhc2VkIG9uIGNhcmRpbmFsaXR5XG4gICAgICBjZWxsV2lkdGggPSAoeENhcmRpbmFsaXR5ICsgZW5jb2RpbmcuYmFuZChYKS5wYWRkaW5nKSAqIGVuY29kaW5nLmJhbmRTaXplKFgsIHVzZVNtYWxsQmFuZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNlbGxXaWR0aCA9IGhhc0NvbCB8fCBoYXNSb3cgPyBlbmNvZGluZy5lbmMoQ09MKS53aWR0aCA6ICBlbmNvZGluZy5jb25maWcoXCJzaW5nbGVXaWR0aFwiKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKG1hcmt0eXBlID09PSBURVhUKSB7XG4gICAgICBjZWxsV2lkdGggPSBlbmNvZGluZy5jb25maWcoJ3RleHRDZWxsV2lkdGgnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2VsbFdpZHRoID0gZW5jb2RpbmcuYmFuZFNpemUoWCk7XG4gICAgfVxuICB9XG5cbiAgLy8gc2V0IGNlbGxIZWlnaHRcbiAgaWYgKGhhc1kpIHtcbiAgICBpZiAoZW5jb2RpbmcuaXNPcmRpbmFsU2NhbGUoWSkpIHtcbiAgICAgIC8vIGZvciBvcmRpbmFsLCBoYXNDb2wgb3Igbm90IGRvZXNuJ3QgbWF0dGVyIC0tIHdlIHNjYWxlIGJhc2VkIG9uIGNhcmRpbmFsaXR5XG4gICAgICBjZWxsSGVpZ2h0ID0gKHlDYXJkaW5hbGl0eSArIGVuY29kaW5nLmJhbmQoWSkucGFkZGluZykgKiBlbmNvZGluZy5iYW5kU2l6ZShZLCB1c2VTbWFsbEJhbmQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjZWxsSGVpZ2h0ID0gaGFzQ29sIHx8IGhhc1JvdyA/IGVuY29kaW5nLmVuYyhST1cpLmhlaWdodCA6ICBlbmNvZGluZy5jb25maWcoXCJzaW5nbGVIZWlnaHRcIik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNlbGxIZWlnaHQgPSBlbmNvZGluZy5iYW5kU2l6ZShZKTtcbiAgfVxuXG4gIC8vIENlbGwgYmFuZHMgdXNlIHJhbmdlQmFuZHMoKS4gVGhlcmUgYXJlIG4tMSBwYWRkaW5nLiAgT3V0ZXJwYWRkaW5nID0gMCBmb3IgY2VsbHNcblxuICB2YXIgd2lkdGggPSBjZWxsV2lkdGgsIGhlaWdodCA9IGNlbGxIZWlnaHQ7XG4gIGlmIChoYXNDb2wpIHtcbiAgICB2YXIgY29sQ2FyZGluYWxpdHkgPSBlbmNvZGluZy5jYXJkaW5hbGl0eShDT0wsIHN0YXRzKTtcbiAgICB3aWR0aCA9IGNlbGxXaWR0aCAqICgoMSArIGNlbGxQYWRkaW5nKSAqIChjb2xDYXJkaW5hbGl0eSAtIDEpICsgMSk7XG4gIH1cbiAgaWYgKGhhc1Jvdykge1xuICAgIHZhciByb3dDYXJkaW5hbGl0eSA9ICBlbmNvZGluZy5jYXJkaW5hbGl0eShST1csIHN0YXRzKTtcbiAgICBoZWlnaHQgPSBjZWxsSGVpZ2h0ICogKCgxICsgY2VsbFBhZGRpbmcpICogKHJvd0NhcmRpbmFsaXR5IC0gMSkgKyAxKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY2VsbFdpZHRoOiBjZWxsV2lkdGgsXG4gICAgY2VsbEhlaWdodDogY2VsbEhlaWdodCxcbiAgICB3aWR0aDogd2lkdGgsXG4gICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgeDoge3VzZVNtYWxsQmFuZDogdXNlU21hbGxCYW5kfSxcbiAgICB5OiB7dXNlU21hbGxCYW5kOiB1c2VTbWFsbEJhbmR9XG4gIH07XG59XG5cbmZ1bmN0aW9uIG9mZnNldChlbmNvZGluZywgc3RhdHMsIGxheW91dCkge1xuICBbWCwgWV0uZm9yRWFjaChmdW5jdGlvbiAoeCkge1xuICAgIHZhciBtYXhMZW5ndGg7XG4gICAgaWYgKGVuY29kaW5nLmlzRGltZW5zaW9uKHgpIHx8IGVuY29kaW5nLmlzVHlwZSh4LCBUKSkge1xuICAgICAgbWF4TGVuZ3RoID0gc3RhdHNbZW5jb2RpbmcuZmllbGROYW1lKHgpXS5tYXhsZW5ndGg7XG4gICAgfSBlbHNlIGlmIChlbmNvZGluZy5hZ2dyKHgpID09PSAnY291bnQnKSB7XG4gICAgICAvL2Fzc2lnbiBkZWZhdWx0IHZhbHVlIGZvciBjb3VudCBhcyBpdCB3b24ndCBoYXZlIHN0YXRzXG4gICAgICBtYXhMZW5ndGggPSAgMztcbiAgICB9IGVsc2UgaWYgKGVuY29kaW5nLmlzVHlwZSh4LCBRKSkge1xuICAgICAgaWYgKHg9PT1YKSB7XG4gICAgICAgIG1heExlbmd0aCA9IDM7XG4gICAgICB9IGVsc2UgeyAvLyBZXG4gICAgICAgIC8vYXNzdW1lIHRoYXQgZGVmYXVsdCBmb3JtYXRpbmcgaXMgYWx3YXlzIHNob3J0ZXIgdGhhbiA3XG4gICAgICAgIG1heExlbmd0aCA9IE1hdGgubWluKHN0YXRzW2VuY29kaW5nLmZpZWxkTmFtZSh4KV0ubWF4bGVuZ3RoLCA3KTtcbiAgICAgIH1cbiAgICB9XG4gICAgc2V0dGVyKGxheW91dCxbeCwgJ2F4aXNUaXRsZU9mZnNldCddLCBlbmNvZGluZy5jb25maWcoJ2NoYXJhY3RlcldpZHRoJykgKiAgbWF4TGVuZ3RoICsgMjApO1xuICB9KTtcbiAgcmV0dXJuIGxheW91dDtcbn1cbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9nbG9iYWxzJyksXG4gIHRpbWUgPSByZXF1aXJlKCcuL3RpbWUnKTtcblxudmFyIGxlZ2VuZCA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbmxlZ2VuZC5kZWZzID0gZnVuY3Rpb24oZW5jb2RpbmcpIHtcbiAgdmFyIGRlZnMgPSBbXTtcblxuICAvLyBUT0RPOiBzdXBwb3J0IGFscGhhXG5cbiAgaWYgKGVuY29kaW5nLmhhcyhDT0xPUikgJiYgZW5jb2RpbmcubGVnZW5kKENPTE9SKSkge1xuICAgIGRlZnMucHVzaChsZWdlbmQuZGVmKENPTE9SLCBlbmNvZGluZywge1xuICAgICAgZmlsbDogQ09MT1IsXG4gICAgICBvcmllbnQ6ICdyaWdodCdcbiAgICB9KSk7XG4gIH1cblxuICBpZiAoZW5jb2RpbmcuaGFzKFNJWkUpICYmIGVuY29kaW5nLmxlZ2VuZChTSVpFKSkge1xuICAgIGRlZnMucHVzaChsZWdlbmQuZGVmKFNJWkUsIGVuY29kaW5nLCB7XG4gICAgICBzaXplOiBTSVpFLFxuICAgICAgb3JpZW50OiBkZWZzLmxlbmd0aCA9PT0gMSA/ICdsZWZ0JyA6ICdyaWdodCdcbiAgICB9KSk7XG4gIH1cblxuICBpZiAoZW5jb2RpbmcuaGFzKFNIQVBFKSAmJiBlbmNvZGluZy5sZWdlbmQoU0hBUEUpKSB7XG4gICAgaWYgKGRlZnMubGVuZ3RoID09PSAyKSB7XG4gICAgICAvLyBUT0RPOiBmaXggdGhpc1xuICAgICAgY29uc29sZS5lcnJvcignVmVnYWxpdGUgY3VycmVudGx5IG9ubHkgc3VwcG9ydHMgdHdvIGxlZ2VuZHMnKTtcbiAgICAgIHJldHVybiBkZWZzO1xuICAgIH1cbiAgICBkZWZzLnB1c2gobGVnZW5kLmRlZihTSEFQRSwgZW5jb2RpbmcsIHtcbiAgICAgIHNoYXBlOiBTSEFQRSxcbiAgICAgIG9yaWVudDogZGVmcy5sZW5ndGggPT09IDEgPyAnbGVmdCcgOiAncmlnaHQnXG4gICAgfSkpO1xuICB9XG5cbiAgcmV0dXJuIGRlZnM7XG59O1xuXG5sZWdlbmQuZGVmID0gZnVuY3Rpb24obmFtZSwgZW5jb2RpbmcsIHByb3BzKSB7XG4gIHZhciBkZWYgPSBwcm9wcywgZm47XG5cbiAgZGVmLnRpdGxlID0gZW5jb2RpbmcuZmllbGRUaXRsZShuYW1lKTtcblxuICBpZiAoZW5jb2RpbmcuaXNUeXBlKG5hbWUsIFQpICYmIChmbiA9IGVuY29kaW5nLmZuKG5hbWUpKSAmJlxuICAgIHRpbWUuaGFzU2NhbGUoZm4pKSB7XG4gICAgdmFyIHByb3BlcnRpZXMgPSBkZWYucHJvcGVydGllcyA9IGRlZi5wcm9wZXJ0aWVzIHx8IHt9LFxuICAgICAgbGFiZWxzID0gcHJvcGVydGllcy5sYWJlbHMgPSBwcm9wZXJ0aWVzLmxhYmVscyB8fCB7fSxcbiAgICAgIHRleHQgPSBsYWJlbHMudGV4dCA9IGxhYmVscy50ZXh0IHx8IHt9O1xuXG4gICAgdGV4dC5zY2FsZSA9ICd0aW1lLScrIGZuO1xuICB9XG5cbiAgcmV0dXJuIGRlZjtcbn07XG4iLCJ2YXIgZ2xvYmFscyA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcblxudmFyIG1hcmtzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxubWFya3MuZGVmID0gZnVuY3Rpb24obWFyaywgZW5jb2RpbmcsIGxheW91dCwgc3R5bGUpIHtcbiAgdmFyIGRlZnMgPSBbXTtcblxuICAvLyB0byBhZGQgYSBiYWNrZ3JvdW5kIHRvIHRleHQsIHdlIG5lZWQgdG8gYWRkIGl0IGJlZm9yZSB0aGUgdGV4dFxuICBpZiAoZW5jb2RpbmcubWFya3R5cGUoKSA9PT0gVEVYVCAmJiBlbmNvZGluZy5oYXMoQ09MT1IpKSB7XG4gICAgdmFyIHAgPSB7XG4gICAgICB4OiB7dmFsdWU6IDB9LFxuICAgICAgeToge3ZhbHVlOiAwfSxcbiAgICAgIHgyOiB7dmFsdWU6IGxheW91dC5jZWxsV2lkdGh9LFxuICAgICAgeTI6IHt2YWx1ZTogbGF5b3V0LmNlbGxIZWlnaHR9LFxuICAgICAgZmlsbDoge3NjYWxlOiBDT0xPUiwgZmllbGQ6IGVuY29kaW5nLmZpZWxkKENPTE9SKX1cbiAgICB9O1xuICAgIGRlZnMucHVzaCh7XG4gICAgICB0eXBlOiAncmVjdCcsXG4gICAgICBmcm9tOiB7ZGF0YTogVEFCTEV9LFxuICAgICAgcHJvcGVydGllczoge2VudGVyOiBwLCB1cGRhdGU6IHB9XG4gICAgfSk7XG4gIH1cblxuICAvLyBhZGQgdGhlIG1hcmsgZGVmIGZvciB0aGUgbWFpbiB0aGluZ1xuICB2YXIgcCA9IG1hcmsucHJvcChlbmNvZGluZywgbGF5b3V0LCBzdHlsZSk7XG4gIGRlZnMucHVzaCh7XG4gICAgdHlwZTogbWFyay50eXBlLFxuICAgIGZyb206IHtkYXRhOiBUQUJMRX0sXG4gICAgcHJvcGVydGllczoge2VudGVyOiBwLCB1cGRhdGU6IHB9XG4gIH0pO1xuXG4gIHJldHVybiBkZWZzO1xufTtcblxubWFya3MuYmFyID0ge1xuICB0eXBlOiAncmVjdCcsXG4gIHN0YWNrOiB0cnVlLFxuICBwcm9wOiBiYXJfcHJvcHMsXG4gIHJlcXVpcmVkRW5jb2Rpbmc6IFsneCcsICd5J10sXG4gIHN1cHBvcnRlZEVuY29kaW5nOiB7cm93OiAxLCBjb2w6IDEsIHg6IDEsIHk6IDEsIHNpemU6IDEsIGNvbG9yOiAxLCBhbHBoYTogMX1cbn07XG5cbm1hcmtzLmxpbmUgPSB7XG4gIHR5cGU6ICdsaW5lJyxcbiAgbGluZTogdHJ1ZSxcbiAgcHJvcDogbGluZV9wcm9wcyxcbiAgcmVxdWlyZWRFbmNvZGluZzogWyd4JywgJ3knXSxcbiAgc3VwcG9ydGVkRW5jb2Rpbmc6IHtyb3c6IDEsIGNvbDogMSwgeDogMSwgeTogMSwgY29sb3I6IDEsIGFscGhhOiAxfVxufTtcblxubWFya3MuYXJlYSA9IHtcbiAgdHlwZTogJ2FyZWEnLFxuICBzdGFjazogdHJ1ZSxcbiAgbGluZTogdHJ1ZSxcbiAgcmVxdWlyZWRFbmNvZGluZzogWyd4JywgJ3knXSxcbiAgcHJvcDogYXJlYV9wcm9wcyxcbiAgc3VwcG9ydGVkRW5jb2Rpbmc6IG1hcmtzLmxpbmUuc3VwcG9ydGVkRW5jb2Rpbmdcbn07XG5cbm1hcmtzLnRpY2sgPSB7XG4gIHR5cGU6ICdyZWN0JyxcbiAgcHJvcDogdGlja19wcm9wc1xufTtcblxubWFya3MuY2lyY2xlID0ge1xuICB0eXBlOiAnc3ltYm9sJyxcbiAgcHJvcDogZmlsbGVkX3BvaW50X3Byb3BzKCdjaXJjbGUnKSxcbiAgc3VwcG9ydGVkRW5jb2Rpbmc6IHtyb3c6IDEsIGNvbDogMSwgeDogMSwgeTogMSwgc2l6ZTogMSwgY29sb3I6IDEsIGFscGhhOiAxfVxufTtcblxubWFya3Muc3F1YXJlID0ge1xuICB0eXBlOiAnc3ltYm9sJyxcbiAgcHJvcDogZmlsbGVkX3BvaW50X3Byb3BzKCdzcXVhcmUnKSxcbiAgc3VwcG9ydGVkRW5jb2Rpbmc6IG1hcmtzLmNpcmNsZS5zdXBwb3J0ZWRFbmNvZGluZ1xufTtcblxubWFya3MucG9pbnQgPSB7XG4gIHR5cGU6ICdzeW1ib2wnLFxuICBwcm9wOiBwb2ludF9wcm9wcyxcbiAgc3VwcG9ydGVkRW5jb2Rpbmc6IHtyb3c6IDEsIGNvbDogMSwgeDogMSwgeTogMSwgc2l6ZTogMSwgY29sb3I6IDEsIGFscGhhOiAxLCBzaGFwZTogMX1cbn07XG5cbm1hcmtzLnRleHQgPSB7XG4gIHR5cGU6ICd0ZXh0JyxcbiAgcHJvcDogdGV4dF9wcm9wcyxcbiAgcmVxdWlyZWRFbmNvZGluZzogWyd0ZXh0J10sXG4gIHN1cHBvcnRlZEVuY29kaW5nOiB7cm93OiAxLCBjb2w6IDEsIHNpemU6IDEsIGNvbG9yOiAxLCBhbHBoYTogMSwgdGV4dDogMX1cbn07XG5cbmZ1bmN0aW9uIGJhcl9wcm9wcyhlLCBsYXlvdXQsIHN0eWxlKSB7XG4gIHZhciBwID0ge307XG5cbiAgLy8geFxuICBpZiAoZS5pc01lYXN1cmUoWCkpIHtcbiAgICBwLnggPSB7c2NhbGU6IFgsIGZpZWxkOiBlLmZpZWxkKFgpfTtcbiAgICBpZiAoZS5pc0RpbWVuc2lvbihZKSkge1xuICAgICAgcC54MiA9IHtzY2FsZTogWCwgdmFsdWU6IDB9O1xuICAgIH1cbiAgfSBlbHNlIGlmIChlLmhhcyhYKSkgeyAvLyBpcyBvcmRpbmFsXG4gICAgcC54YyA9IHtzY2FsZTogWCwgZmllbGQ6IGUuZmllbGQoWCl9O1xuICB9IGVsc2Uge1xuICAgIC8vIFRPRE8gYWRkIHNpbmdsZSBiYXIgb2Zmc2V0XG4gICAgcC54YyA9IHt2YWx1ZTogMH07XG4gIH1cblxuICAvLyB5XG4gIGlmIChlLmlzTWVhc3VyZShZKSkge1xuICAgIHAueSA9IHtzY2FsZTogWSwgZmllbGQ6IGUuZmllbGQoWSl9O1xuICAgIHAueTIgPSB7c2NhbGU6IFksIHZhbHVlOiAwfTtcbiAgfSBlbHNlIGlmIChlLmhhcyhZKSkgeyAvLyBpcyBvcmRpbmFsXG4gICAgcC55YyA9IHtzY2FsZTogWSwgZmllbGQ6IGUuZmllbGQoWSl9O1xuICB9IGVsc2Uge1xuICAgIC8vIFRPRE8gYWRkIHNpbmdsZSBiYXIgb2Zmc2V0XG4gICAgcC55YyA9IHtncm91cDogJ2hlaWdodCd9O1xuICB9XG5cbiAgLy8gd2lkdGhcbiAgaWYgKCFlLmhhcyhYKSB8fCBlLmlzT3JkaW5hbFNjYWxlKFgpKSB7IC8vIG5vIFggb3IgWCBpcyBvcmRpbmFsXG4gICAgaWYgKGUuaGFzKFNJWkUpKSB7XG4gICAgICBwLndpZHRoID0ge3NjYWxlOiBTSVpFLCBmaWVsZDogZS5maWVsZChTSVpFKX07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHAud2lkdGggPSB7c2NhbGU6IFgsIGJhbmQ6IHRydWUsIG9mZnNldDogLTF9O1xuICAgICAgcC53aWR0aCA9IHt2YWx1ZTogZS5iYW5kU2l6ZShYLCBsYXlvdXQueC51c2VTbWFsbEJhbmQpLCBvZmZzZXQ6IC0xfTtcbiAgICB9XG4gIH0gZWxzZSB7IC8vIFggaXMgUXVhbnQgb3IgVGltZSBTY2FsZVxuICAgIHAud2lkdGggPSB7dmFsdWU6IGUuYmFuZFNpemUoWCwgbGF5b3V0LngudXNlU21hbGxCYW5kKSwgb2Zmc2V0OiAtMX07XG4gIH1cblxuICAvLyBoZWlnaHRcbiAgaWYgKCFlLmhhcyhZKSB8fCBlLmlzT3JkaW5hbFNjYWxlKFkpKSB7IC8vIG5vIFkgb3IgWSBpcyBvcmRpbmFsXG4gICAgaWYgKGUuaGFzKFNJWkUpKSB7XG4gICAgICBwLmhlaWdodCA9IHtzY2FsZTogU0laRSwgZmllbGQ6IGUuZmllbGQoU0laRSl9O1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBwLmhlaWdodCA9IHtzY2FsZTogWSwgYmFuZDogdHJ1ZSwgb2Zmc2V0OiAtMX07XG4gICAgICBwLmhlaWdodCA9IHt2YWx1ZTogZS5iYW5kU2l6ZShZLCBsYXlvdXQueS51c2VTbWFsbEJhbmQpLCBvZmZzZXQ6IC0xfTtcbiAgICB9XG4gIH0gZWxzZSB7IC8vIFkgaXMgUXVhbnQgb3IgVGltZSBTY2FsZVxuICAgIHAuaGVpZ2h0ID0ge3ZhbHVlOiBlLmJhbmRTaXplKFksIGxheW91dC55LnVzZVNtYWxsQmFuZCksIG9mZnNldDogLTF9O1xuICB9XG5cbiAgLy8gZmlsbFxuICBpZiAoZS5oYXMoQ09MT1IpKSB7XG4gICAgcC5maWxsID0ge3NjYWxlOiBDT0xPUiwgZmllbGQ6IGUuZmllbGQoQ09MT1IpfTtcbiAgfSBlbHNlIHtcbiAgICBwLmZpbGwgPSB7dmFsdWU6IGUudmFsdWUoQ09MT1IpfTtcbiAgfVxuXG4gIC8vIGFscGhhXG4gIGlmIChlLmhhcyhBTFBIQSkpIHtcbiAgICBwLm9wYWNpdHkgPSB7c2NhbGU6IEFMUEhBLCBmaWVsZDogZS5maWVsZChBTFBIQSl9O1xuICB9IGVsc2UgaWYgKGUudmFsdWUoQUxQSEEpICE9PSB1bmRlZmluZWQpIHtcbiAgICBwLm9wYWNpdHkgPSB7dmFsdWU6IGUudmFsdWUoQUxQSEEpfTtcbiAgfVxuXG4gIHJldHVybiBwO1xufVxuXG5mdW5jdGlvbiBwb2ludF9wcm9wcyhlLCBsYXlvdXQsIHN0eWxlKSB7XG4gIHZhciBwID0ge307XG5cbiAgLy8geFxuICBpZiAoZS5oYXMoWCkpIHtcbiAgICBwLnggPSB7c2NhbGU6IFgsIGZpZWxkOiBlLmZpZWxkKFgpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoWCkpIHtcbiAgICBwLnggPSB7dmFsdWU6IGUuYmFuZFNpemUoWCwgbGF5b3V0LngudXNlU21hbGxCYW5kKSAvIDJ9O1xuICB9XG5cbiAgLy8geVxuICBpZiAoZS5oYXMoWSkpIHtcbiAgICBwLnkgPSB7c2NhbGU6IFksIGZpZWxkOiBlLmZpZWxkKFkpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoWSkpIHtcbiAgICBwLnkgPSB7dmFsdWU6IGUuYmFuZFNpemUoWSwgbGF5b3V0LnkudXNlU21hbGxCYW5kKSAvIDJ9O1xuICB9XG5cbiAgLy8gc2l6ZVxuICBpZiAoZS5oYXMoU0laRSkpIHtcbiAgICBwLnNpemUgPSB7c2NhbGU6IFNJWkUsIGZpZWxkOiBlLmZpZWxkKFNJWkUpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoU0laRSkpIHtcbiAgICBwLnNpemUgPSB7dmFsdWU6IGUudmFsdWUoU0laRSl9O1xuICB9XG5cbiAgLy8gc2hhcGVcbiAgaWYgKGUuaGFzKFNIQVBFKSkge1xuICAgIHAuc2hhcGUgPSB7c2NhbGU6IFNIQVBFLCBmaWVsZDogZS5maWVsZChTSEFQRSl9O1xuICB9IGVsc2UgaWYgKCFlLmhhcyhTSEFQRSkpIHtcbiAgICBwLnNoYXBlID0ge3ZhbHVlOiBlLnZhbHVlKFNIQVBFKX07XG4gIH1cblxuICAvLyBzdHJva2VcbiAgaWYgKGUuaGFzKENPTE9SKSkge1xuICAgIHAuc3Ryb2tlID0ge3NjYWxlOiBDT0xPUiwgZmllbGQ6IGUuZmllbGQoQ09MT1IpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoQ09MT1IpKSB7XG4gICAgcC5zdHJva2UgPSB7dmFsdWU6IGUudmFsdWUoQ09MT1IpfTtcbiAgfVxuXG4gIC8vIGFscGhhXG4gIGlmIChlLmhhcyhBTFBIQSkpIHtcbiAgICBwLm9wYWNpdHkgPSB7c2NhbGU6IEFMUEhBLCBmaWVsZDogZS5maWVsZChBTFBIQSl9O1xuICB9IGVsc2UgaWYgKGUudmFsdWUoQUxQSEEpICE9PSB1bmRlZmluZWQpIHtcbiAgICBwLm9wYWNpdHkgPSB7dmFsdWU6IGUudmFsdWUoQUxQSEEpfTtcbiAgfSBlbHNlIHtcbiAgICBwLm9wYWNpdHkgPSB7dmFsdWU6IHN0eWxlLm9wYWNpdHl9O1xuICB9XG5cbiAgcC5zdHJva2VXaWR0aCA9IHt2YWx1ZTogZS5jb25maWcoJ3N0cm9rZVdpZHRoJyl9O1xuXG4gIHJldHVybiBwO1xufVxuXG5mdW5jdGlvbiBsaW5lX3Byb3BzKGUsIGxheW91dCwgc3R5bGUpIHtcbiAgdmFyIHAgPSB7fTtcblxuICAvLyB4XG4gIGlmIChlLmhhcyhYKSkge1xuICAgIHAueCA9IHtzY2FsZTogWCwgZmllbGQ6IGUuZmllbGQoWCl9O1xuICB9IGVsc2UgaWYgKCFlLmhhcyhYKSkge1xuICAgIHAueCA9IHt2YWx1ZTogMH07XG4gIH1cblxuICAvLyB5XG4gIGlmIChlLmhhcyhZKSkge1xuICAgIHAueSA9IHtzY2FsZTogWSwgZmllbGQ6IGUuZmllbGQoWSl9O1xuICB9IGVsc2UgaWYgKCFlLmhhcyhZKSkge1xuICAgIHAueSA9IHtncm91cDogJ2hlaWdodCd9O1xuICB9XG5cbiAgLy8gc3Ryb2tlXG4gIGlmIChlLmhhcyhDT0xPUikpIHtcbiAgICBwLnN0cm9rZSA9IHtzY2FsZTogQ09MT1IsIGZpZWxkOiBlLmZpZWxkKENPTE9SKX07XG4gIH0gZWxzZSBpZiAoIWUuaGFzKENPTE9SKSkge1xuICAgIHAuc3Ryb2tlID0ge3ZhbHVlOiBlLnZhbHVlKENPTE9SKX07XG4gIH1cblxuICAvLyBhbHBoYVxuICBpZiAoZS5oYXMoQUxQSEEpKSB7XG4gICAgcC5vcGFjaXR5ID0ge3NjYWxlOiBBTFBIQSwgZmllbGQ6IGUuZmllbGQoQUxQSEEpfTtcbiAgfSBlbHNlIGlmIChlLnZhbHVlKEFMUEhBKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcC5vcGFjaXR5ID0ge3ZhbHVlOiBlLnZhbHVlKEFMUEhBKX07XG4gIH1cblxuICBwLnN0cm9rZVdpZHRoID0ge3ZhbHVlOiBlLmNvbmZpZygnc3Ryb2tlV2lkdGgnKX07XG5cbiAgcmV0dXJuIHA7XG59XG5cbmZ1bmN0aW9uIGFyZWFfcHJvcHMoZSwgbGF5b3V0LCBzdHlsZSkge1xuICB2YXIgcCA9IHt9O1xuXG4gIC8vIHhcbiAgaWYgKGUuaXNNZWFzdXJlKFgpKSB7XG4gICAgcC54ID0ge3NjYWxlOiBYLCBmaWVsZDogZS5maWVsZChYKX07XG4gICAgaWYgKGUuaXNEaW1lbnNpb24oWSkpIHtcbiAgICAgIHAueDIgPSB7c2NhbGU6IFgsIHZhbHVlOiAwfTtcbiAgICAgIHAub3JpZW50ID0ge3ZhbHVlOiAnaG9yaXpvbnRhbCd9O1xuICAgIH1cbiAgfSBlbHNlIGlmIChlLmhhcyhYKSkge1xuICAgIHAueCA9IHtzY2FsZTogWCwgZmllbGQ6IGUuZmllbGQoWCl9O1xuICB9IGVsc2Uge1xuICAgIHAueCA9IHt2YWx1ZTogMH07XG4gIH1cblxuICAvLyB5XG4gIGlmIChlLmlzTWVhc3VyZShZKSkge1xuICAgIHAueSA9IHtzY2FsZTogWSwgZmllbGQ6IGUuZmllbGQoWSl9O1xuICAgIHAueTIgPSB7c2NhbGU6IFksIHZhbHVlOiAwfTtcbiAgfSBlbHNlIGlmIChlLmhhcyhZKSkge1xuICAgIHAueSA9IHtzY2FsZTogWSwgZmllbGQ6IGUuZmllbGQoWSl9O1xuICB9IGVsc2Uge1xuICAgIHAueSA9IHtncm91cDogJ2hlaWdodCd9O1xuICB9XG5cbiAgLy8gc3Ryb2tlXG4gIGlmIChlLmhhcyhDT0xPUikpIHtcbiAgICBwLmZpbGwgPSB7c2NhbGU6IENPTE9SLCBmaWVsZDogZS5maWVsZChDT0xPUil9O1xuICB9IGVsc2UgaWYgKCFlLmhhcyhDT0xPUikpIHtcbiAgICBwLmZpbGwgPSB7dmFsdWU6IGUudmFsdWUoQ09MT1IpfTtcbiAgfVxuXG4gIC8vIGFscGhhXG4gIGlmIChlLmhhcyhBTFBIQSkpIHtcbiAgICBwLm9wYWNpdHkgPSB7c2NhbGU6IEFMUEhBLCBmaWVsZDogZS5maWVsZChBTFBIQSl9O1xuICB9IGVsc2UgaWYgKGUudmFsdWUoQUxQSEEpICE9PSB1bmRlZmluZWQpIHtcbiAgICBwLm9wYWNpdHkgPSB7dmFsdWU6IGUudmFsdWUoQUxQSEEpfTtcbiAgfVxuXG4gIHJldHVybiBwO1xufVxuXG5mdW5jdGlvbiB0aWNrX3Byb3BzKGUsIGxheW91dCwgc3R5bGUpIHtcbiAgdmFyIHAgPSB7fTtcblxuICAvLyB4XG4gIGlmIChlLmhhcyhYKSkge1xuICAgIHAueCA9IHtzY2FsZTogWCwgZmllbGQ6IGUuZmllbGQoWCl9O1xuICAgIGlmIChlLmlzRGltZW5zaW9uKFgpKSB7XG4gICAgICBwLngub2Zmc2V0ID0gLWUuYmFuZFNpemUoWCwgbGF5b3V0LngudXNlU21hbGxCYW5kKSAvIDM7XG4gICAgfVxuICB9IGVsc2UgaWYgKCFlLmhhcyhYKSkge1xuICAgIHAueCA9IHt2YWx1ZTogMH07XG4gIH1cblxuICAvLyB5XG4gIGlmIChlLmhhcyhZKSkge1xuICAgIHAueSA9IHtzY2FsZTogWSwgZmllbGQ6IGUuZmllbGQoWSl9O1xuICAgIGlmIChlLmlzRGltZW5zaW9uKFkpKSB7XG4gICAgICBwLnkub2Zmc2V0ID0gLWUuYmFuZFNpemUoWSwgbGF5b3V0LnkudXNlU21hbGxCYW5kKSAvIDM7XG4gICAgfVxuICB9IGVsc2UgaWYgKCFlLmhhcyhZKSkge1xuICAgIHAueSA9IHt2YWx1ZTogMH07XG4gIH1cblxuICAvLyB3aWR0aFxuICBpZiAoIWUuaGFzKFgpIHx8IGUuaXNEaW1lbnNpb24oWCkpIHtcbiAgICBwLndpZHRoID0ge3ZhbHVlOiBlLmJhbmRTaXplKFgsIGxheW91dC55LnVzZVNtYWxsQmFuZCkgLyAxLjV9O1xuICB9IGVsc2Uge1xuICAgIHAud2lkdGggPSB7dmFsdWU6IDF9O1xuICB9XG5cbiAgLy8gaGVpZ2h0XG4gIGlmICghZS5oYXMoWSkgfHwgZS5pc0RpbWVuc2lvbihZKSkge1xuICAgIHAuaGVpZ2h0ID0ge3ZhbHVlOiBlLmJhbmRTaXplKFksIGxheW91dC55LnVzZVNtYWxsQmFuZCkgLyAxLjV9O1xuICB9IGVsc2Uge1xuICAgIHAuaGVpZ2h0ID0ge3ZhbHVlOiAxfTtcbiAgfVxuXG4gIC8vIGZpbGxcbiAgaWYgKGUuaGFzKENPTE9SKSkge1xuICAgIHAuZmlsbCA9IHtzY2FsZTogQ09MT1IsIGZpZWxkOiBlLmZpZWxkKENPTE9SKX07XG4gIH0gZWxzZSB7XG4gICAgcC5maWxsID0ge3ZhbHVlOiBlLnZhbHVlKENPTE9SKX07XG4gIH1cblxuICAvLyBhbHBoYVxuICBpZiAoZS5oYXMoQUxQSEEpKSB7XG4gICAgcC5vcGFjaXR5ID0ge3NjYWxlOiBBTFBIQSwgZmllbGQ6IGUuZmllbGQoQUxQSEEpfTtcbiAgfSBlbHNlIGlmIChlLnZhbHVlKEFMUEhBKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcC5vcGFjaXR5ID0ge3ZhbHVlOiBlLnZhbHVlKEFMUEhBKX07XG4gIH0gZWxzZSB7XG4gICAgcC5vcGFjaXR5ID0ge3ZhbHVlOiBzdHlsZS5vcGFjaXR5fTtcbiAgfVxuXG4gIHJldHVybiBwO1xufVxuXG5mdW5jdGlvbiBmaWxsZWRfcG9pbnRfcHJvcHMoc2hhcGUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGUsIGxheW91dCwgc3R5bGUpIHtcbiAgICB2YXIgcCA9IHt9O1xuXG4gICAgLy8geFxuICAgIGlmIChlLmhhcyhYKSkge1xuICAgICAgcC54ID0ge3NjYWxlOiBYLCBmaWVsZDogZS5maWVsZChYKX07XG4gICAgfSBlbHNlIGlmICghZS5oYXMoWCkpIHtcbiAgICAgIHAueCA9IHt2YWx1ZTogZS5iYW5kU2l6ZShYLCBsYXlvdXQueC51c2VTbWFsbEJhbmQpIC8gMn07XG4gICAgfVxuXG4gICAgLy8geVxuICAgIGlmIChlLmhhcyhZKSkge1xuICAgICAgcC55ID0ge3NjYWxlOiBZLCBmaWVsZDogZS5maWVsZChZKX07XG4gICAgfSBlbHNlIGlmICghZS5oYXMoWSkpIHtcbiAgICAgIHAueSA9IHt2YWx1ZTogZS5iYW5kU2l6ZShZLCBsYXlvdXQueS51c2VTbWFsbEJhbmQpIC8gMn07XG4gICAgfVxuXG4gICAgLy8gc2l6ZVxuICAgIGlmIChlLmhhcyhTSVpFKSkge1xuICAgICAgcC5zaXplID0ge3NjYWxlOiBTSVpFLCBmaWVsZDogZS5maWVsZChTSVpFKX07XG4gICAgfSBlbHNlIGlmICghZS5oYXMoWCkpIHtcbiAgICAgIHAuc2l6ZSA9IHt2YWx1ZTogZS52YWx1ZShTSVpFKX07XG4gICAgfVxuXG4gICAgLy8gc2hhcGVcbiAgICBwLnNoYXBlID0ge3ZhbHVlOiBzaGFwZX07XG5cbiAgICAvLyBmaWxsXG4gICAgaWYgKGUuaGFzKENPTE9SKSkge1xuICAgICAgcC5maWxsID0ge3NjYWxlOiBDT0xPUiwgZmllbGQ6IGUuZmllbGQoQ09MT1IpfTtcbiAgICB9IGVsc2UgaWYgKCFlLmhhcyhDT0xPUikpIHtcbiAgICAgIHAuZmlsbCA9IHt2YWx1ZTogZS52YWx1ZShDT0xPUil9O1xuICAgIH1cblxuICAgIC8vIGFscGhhXG4gICAgaWYgKGUuaGFzKEFMUEhBKSkge1xuICAgICAgcC5vcGFjaXR5ID0ge3NjYWxlOiBBTFBIQSwgZmllbGQ6IGUuZmllbGQoQUxQSEEpfTtcbiAgICB9IGVsc2UgaWYgKGUudmFsdWUoQUxQSEEpICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHAub3BhY2l0eSA9IHt2YWx1ZTogZS52YWx1ZShBTFBIQSl9O1xuICAgIH0gZWxzZSB7XG4gICAgICBwLm9wYWNpdHkgPSB7dmFsdWU6IHN0eWxlLm9wYWNpdHl9O1xuICAgIH1cblxuICAgIHJldHVybiBwO1xuICB9O1xufVxuXG5mdW5jdGlvbiB0ZXh0X3Byb3BzKGUsIGxheW91dCwgc3R5bGUpIHtcbiAgdmFyIHAgPSB7fTtcblxuICAvLyB4XG4gIGlmIChlLmhhcyhYKSkge1xuICAgIHAueCA9IHtzY2FsZTogWCwgZmllbGQ6IGUuZmllbGQoWCl9O1xuICB9IGVsc2UgaWYgKCFlLmhhcyhYKSkge1xuICAgIHAueCA9IHt2YWx1ZTogZS5iYW5kU2l6ZShYLCBsYXlvdXQueC51c2VTbWFsbEJhbmQpIC8gMn07XG4gIH1cblxuICAvLyB5XG4gIGlmIChlLmhhcyhZKSkge1xuICAgIHAueSA9IHtzY2FsZTogWSwgZmllbGQ6IGUuZmllbGQoWSl9O1xuICB9IGVsc2UgaWYgKCFlLmhhcyhZKSkge1xuICAgIHAueSA9IHt2YWx1ZTogZS5iYW5kU2l6ZShZLCBsYXlvdXQueS51c2VTbWFsbEJhbmQpIC8gMn07XG4gIH1cblxuICAvLyBzaXplXG4gIGlmIChlLmhhcyhTSVpFKSkge1xuICAgIHAuZm9udFNpemUgPSB7c2NhbGU6IFNJWkUsIGZpZWxkOiBlLmZpZWxkKFNJWkUpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoU0laRSkpIHtcbiAgICBwLmZvbnRTaXplID0ge3ZhbHVlOiBlLmZvbnQoJ3NpemUnKX07XG4gIH1cblxuICAvLyBmaWxsXG4gIC8vIGNvbG9yIHNob3VsZCBiZSBzZXQgdG8gYmFja2dyb3VuZFxuICBwLmZpbGwgPSB7dmFsdWU6ICdibGFjayd9O1xuXG4gIC8vIGFscGhhXG4gIGlmIChlLmhhcyhBTFBIQSkpIHtcbiAgICBwLm9wYWNpdHkgPSB7c2NhbGU6IEFMUEhBLCBmaWVsZDogZS5maWVsZChBTFBIQSl9O1xuICB9IGVsc2UgaWYgKGUudmFsdWUoQUxQSEEpICE9PSB1bmRlZmluZWQpIHtcbiAgICBwLm9wYWNpdHkgPSB7dmFsdWU6IGUudmFsdWUoQUxQSEEpfTtcbiAgfSBlbHNlIHtcbiAgICBwLm9wYWNpdHkgPSB7dmFsdWU6IHN0eWxlLm9wYWNpdHl9O1xuICB9XG5cbiAgLy8gdGV4dFxuICBpZiAoZS5oYXMoVEVYVCkpIHtcbiAgICBpZiAoZS5pc1R5cGUoVEVYVCwgUSkpIHtcbiAgICAgIHAudGV4dCA9IHt0ZW1wbGF0ZTogXCJ7e1wiICsgZS5maWVsZChURVhUKSArIFwiIHwgbnVtYmVyOicuM3MnfX1cIn07XG4gICAgfSBlbHNlIHtcbiAgICAgIHAudGV4dCA9IHtmaWVsZDogZS5maWVsZChURVhUKX07XG4gICAgfVxuICAgIHAuYWxpZ24gPSB7dmFsdWU6ICdsZWZ0J307XG4gIH0gZWxzZSB7XG4gICAgcC50ZXh0ID0ge3ZhbHVlOiAnQWJjJ307XG4gIH1cblxuICBwLmZvbnQgPSB7dmFsdWU6IGUuZm9udCgnZmFtaWx5Jyl9O1xuICBwLmZvbnRXZWlnaHQgPSB7dmFsdWU6IGUuZm9udCgnd2VpZ2h0Jyl9O1xuICBwLmZvbnRTdHlsZSA9IHt2YWx1ZTogZS5mb250KCdzdHlsZScpfTtcbiAgcC5iYXNlbGluZSA9IHt2YWx1ZTogZS50ZXh0KCdiYXNlbGluZScpfTtcblxuICByZXR1cm4gcDtcbn1cbiIsInZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpLFxuICB0aW1lID0gcmVxdWlyZSgnLi90aW1lJyk7XG5cbnZhciBzY2FsZSA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnNjYWxlLm5hbWVzID0gZnVuY3Rpb24ocHJvcHMpIHtcbiAgcmV0dXJuIHV0aWwua2V5cyh1dGlsLmtleXMocHJvcHMpLnJlZHVjZShmdW5jdGlvbihhLCB4KSB7XG4gICAgaWYgKHByb3BzW3hdICYmIHByb3BzW3hdLnNjYWxlKSBhW3Byb3BzW3hdLnNjYWxlXSA9IDE7XG4gICAgcmV0dXJuIGE7XG4gIH0sIHt9KSk7XG59O1xuXG5zY2FsZS5kZWZzID0gZnVuY3Rpb24obmFtZXMsIGVuY29kaW5nLCBsYXlvdXQsIHN0eWxlLCBzb3J0aW5nLCBvcHQpIHtcbiAgb3B0ID0gb3B0IHx8IHt9O1xuXG4gIHJldHVybiBuYW1lcy5yZWR1Y2UoZnVuY3Rpb24oYSwgbmFtZSkge1xuICAgIHZhciBzID0ge1xuICAgICAgbmFtZTogbmFtZSxcbiAgICAgIHR5cGU6IHNjYWxlLnR5cGUobmFtZSwgZW5jb2RpbmcpLFxuICAgICAgZG9tYWluOiBzY2FsZV9kb21haW4obmFtZSwgZW5jb2RpbmcsIHNvcnRpbmcsIG9wdClcbiAgICB9O1xuICAgIGlmIChzLnR5cGUgPT09ICdvcmRpbmFsJyAmJiAhZW5jb2RpbmcuYmluKG5hbWUpICYmIGVuY29kaW5nLnNvcnQobmFtZSkubGVuZ3RoID09PSAwKSB7XG4gICAgICBzLnNvcnQgPSB0cnVlO1xuICAgIH1cblxuICAgIHNjYWxlX3JhbmdlKHMsIGVuY29kaW5nLCBsYXlvdXQsIHN0eWxlLCBvcHQpO1xuXG4gICAgcmV0dXJuIChhLnB1c2gocyksIGEpO1xuICB9LCBbXSk7XG59O1xuXG5zY2FsZS50eXBlID0gZnVuY3Rpb24obmFtZSwgZW5jb2RpbmcpIHtcblxuICBzd2l0Y2ggKGVuY29kaW5nLnR5cGUobmFtZSkpIHtcbiAgICBjYXNlIE86IHJldHVybiAnb3JkaW5hbCc7XG4gICAgY2FzZSBUOlxuICAgICAgdmFyIGZuID0gZW5jb2RpbmcuZm4obmFtZSk7XG4gICAgICByZXR1cm4gKGZuICYmIHRpbWUuc2NhbGUudHlwZShmbikpIHx8ICd0aW1lJztcbiAgICBjYXNlIFE6XG4gICAgICBpZiAoZW5jb2RpbmcuYmluKG5hbWUpKSB7XG4gICAgICAgIHJldHVybiAnb3JkaW5hbCc7XG4gICAgICB9XG4gICAgICByZXR1cm4gZW5jb2Rpbmcuc2NhbGUobmFtZSkudHlwZTtcbiAgfVxufTtcblxuZnVuY3Rpb24gc2NhbGVfZG9tYWluKG5hbWUsIGVuY29kaW5nLCBzb3J0aW5nLCBvcHQpIHtcbiAgaWYgKGVuY29kaW5nLmlzVHlwZShuYW1lLCBUKSkge1xuICAgIHZhciByYW5nZSA9IHRpbWUuc2NhbGUuZG9tYWluKGVuY29kaW5nLmZuKG5hbWUpKTtcbiAgICBpZihyYW5nZSkgcmV0dXJuIHJhbmdlO1xuICB9XG5cbiAgaWYgKGVuY29kaW5nLmJpbihuYW1lKSkge1xuICAgIC8vIFRPRE86IGFkZCBpbmNsdWRlRW1wdHlDb25maWcgaGVyZVxuICAgIGlmIChvcHQuc3RhdHMpIHtcbiAgICAgIHZhciBiaW5zID0gdXRpbC5nZXRiaW5zKG9wdC5zdGF0c1tlbmNvZGluZy5maWVsZE5hbWUobmFtZSldLCBlbmNvZGluZy5iaW4obmFtZSkubWF4Ymlucyk7XG4gICAgICB2YXIgZG9tYWluID0gdXRpbC5yYW5nZShiaW5zLnN0YXJ0LCBiaW5zLnN0b3AsIGJpbnMuc3RlcCk7XG4gICAgICByZXR1cm4gbmFtZSA9PT0gWSA/IGRvbWFpbi5yZXZlcnNlKCkgOiBkb21haW47XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5hbWUgPT0gb3B0LnN0YWNrID9cbiAgICB7XG4gICAgICBkYXRhOiBTVEFDS0VELFxuICAgICAgZmllbGQ6ICdkYXRhLicgKyAob3B0LmZhY2V0ID8gJ21heF8nIDogJycpICsgJ3N1bV8nICsgZW5jb2RpbmcuZmllbGQobmFtZSwgdHJ1ZSlcbiAgICB9IDpcbiAgICB7ZGF0YTogc29ydGluZy5nZXREYXRhc2V0KG5hbWUpLCBmaWVsZDogZW5jb2RpbmcuZmllbGQobmFtZSl9O1xufVxuXG5mdW5jdGlvbiBzY2FsZV9yYW5nZShzLCBlbmNvZGluZywgbGF5b3V0LCBzdHlsZSwgb3B0KSB7XG4gIHZhciBzcGVjID0gZW5jb2Rpbmcuc2NhbGUocy5uYW1lKTtcbiAgc3dpdGNoIChzLm5hbWUpIHtcbiAgICBjYXNlIFg6XG4gICAgICBpZiAocy50eXBlID09PSAnb3JkaW5hbCcpIHtcbiAgICAgICAgcy5iYW5kV2lkdGggPSBlbmNvZGluZy5iYW5kU2l6ZShYLCBsYXlvdXQueC51c2VTbWFsbEJhbmQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcy5yYW5nZSA9IGxheW91dC5jZWxsV2lkdGggPyBbMCwgbGF5b3V0LmNlbGxXaWR0aF0gOiAnd2lkdGgnO1xuICAgICAgICBzLnplcm8gPSBzcGVjLnplcm8gfHxcbiAgICAgICAgICAoIGVuY29kaW5nLmlzVHlwZShzLm5hbWUsVCkgJiYgZW5jb2RpbmcuZm4ocy5uYW1lKSA9PT0gJ3llYXInID8gZmFsc2UgOiB0cnVlICk7XG4gICAgICAgIHMucmV2ZXJzZSA9IHNwZWMucmV2ZXJzZTtcbiAgICAgIH1cbiAgICAgIHMucm91bmQgPSB0cnVlO1xuICAgICAgaWYgKHMudHlwZSA9PT0gJ3RpbWUnKSB7XG4gICAgICAgIHMubmljZSA9IGVuY29kaW5nLmZuKHMubmFtZSk7XG4gICAgICB9ZWxzZSB7XG4gICAgICAgIHMubmljZSA9IHRydWU7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlIFk6XG4gICAgICBpZiAocy50eXBlID09PSAnb3JkaW5hbCcpIHtcbiAgICAgICAgcy5iYW5kV2lkdGggPSBlbmNvZGluZy5iYW5kU2l6ZShZLCBsYXlvdXQueS51c2VTbWFsbEJhbmQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcy5yYW5nZSA9IGxheW91dC5jZWxsSGVpZ2h0ID8gW2xheW91dC5jZWxsSGVpZ2h0LCAwXSA6ICdoZWlnaHQnO1xuICAgICAgICBzLnplcm8gPSBzcGVjLnplcm8gfHxcbiAgICAgICAgICAoIGVuY29kaW5nLmlzVHlwZShzLm5hbWUsIFQpICYmIGVuY29kaW5nLmZuKHMubmFtZSkgPT09ICd5ZWFyJyA/IGZhbHNlIDogdHJ1ZSApO1xuICAgICAgICBzLnJldmVyc2UgPSBzcGVjLnJldmVyc2U7XG4gICAgICB9XG5cbiAgICAgIHMucm91bmQgPSB0cnVlO1xuXG4gICAgICBpZiAocy50eXBlID09PSAndGltZScpIHtcbiAgICAgICAgcy5uaWNlID0gZW5jb2RpbmcuZm4ocy5uYW1lKSB8fCBlbmNvZGluZy5jb25maWcoJ3RpbWVTY2FsZU5pY2UnKTtcbiAgICAgIH1lbHNlIHtcbiAgICAgICAgcy5uaWNlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgUk9XOiAvLyBzdXBwb3J0IG9ubHkgb3JkaW5hbFxuICAgICAgcy5iYW5kV2lkdGggPSBsYXlvdXQuY2VsbEhlaWdodDtcbiAgICAgIHMucm91bmQgPSB0cnVlO1xuICAgICAgcy5uaWNlID0gdHJ1ZTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgQ09MOiAvLyBzdXBwb3J0IG9ubHkgb3JkaW5hbFxuICAgICAgcy5iYW5kV2lkdGggPSBsYXlvdXQuY2VsbFdpZHRoO1xuICAgICAgcy5yb3VuZCA9IHRydWU7XG4gICAgICBzLm5pY2UgPSB0cnVlO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBTSVpFOlxuICAgICAgaWYgKGVuY29kaW5nLmlzKCdiYXInKSkge1xuICAgICAgICAvLyBGSVhNRSB0aGlzIGlzIGRlZmluaXRlbHkgaW5jb3JyZWN0XG4gICAgICAgIC8vIGJ1dCBsZXQncyBmaXggaXQgbGF0ZXIgc2luY2UgYmFyIHNpemUgaXMgYSBiYWQgZW5jb2RpbmcgYW55d2F5XG4gICAgICAgIHMucmFuZ2UgPSBbMywgTWF0aC5tYXgoZW5jb2RpbmcuYmFuZFNpemUoWCksIGVuY29kaW5nLmJhbmRTaXplKFkpKV07XG4gICAgICB9IGVsc2UgaWYgKGVuY29kaW5nLmlzKFRFWFQpKSB7XG4gICAgICAgIHMucmFuZ2UgPSBbOCwgNDBdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcy5yYW5nZSA9IFsxMCwgNDAwXTtcbiAgICAgIH1cbiAgICAgIHMucm91bmQgPSB0cnVlO1xuICAgICAgcy56ZXJvID0gZmFsc2U7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFNIQVBFOlxuICAgICAgcy5yYW5nZSA9ICdzaGFwZXMnO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBDT0xPUjpcbiAgICAgIHZhciByYW5nZSA9IGVuY29kaW5nLnNjYWxlKENPTE9SKS5yYW5nZTtcbiAgICAgIGlmIChyYW5nZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmIChzLnR5cGUgPT09ICdvcmRpbmFsJykge1xuICAgICAgICAgIHJhbmdlID0gc3R5bGUuY29sb3JSYW5nZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByYW5nZSA9IFsnI2RkZicsICdzdGVlbGJsdWUnXTtcbiAgICAgICAgICBzLnplcm8gPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcy5yYW5nZSA9IHJhbmdlO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBBTFBIQTpcbiAgICAgIHMucmFuZ2UgPSBbMC4yLCAxLjBdO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZyBuYW1lOiAnKyBzLm5hbWUpO1xuICB9XG5cbiAgc3dpdGNoIChzLm5hbWUpIHtcbiAgICBjYXNlIFJPVzpcbiAgICBjYXNlIENPTDpcbiAgICAgIHMucGFkZGluZyA9IGVuY29kaW5nLmNvbmZpZygnY2VsbFBhZGRpbmcnKTtcbiAgICAgIHMub3V0ZXJQYWRkaW5nID0gMDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgWDpcbiAgICBjYXNlIFk6XG4gICAgICBpZiAocy50eXBlID09PSAnb3JkaW5hbCcpIHsgLy8mJiAhcy5iYW5kV2lkdGhcbiAgICAgICAgcy5wb2ludHMgPSB0cnVlO1xuICAgICAgICBzLnBhZGRpbmcgPSBlbmNvZGluZy5iYW5kKHMubmFtZSkucGFkZGluZztcbiAgICAgIH1cbiAgfVxufVxuIiwidmFyIGdsb2JhbHMgPSByZXF1aXJlKCcuLi9nbG9iYWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gYWRkU29ydFRyYW5zZm9ybXM7XG5cbi8vIGFkZHMgbmV3IHRyYW5zZm9ybXMgdGhhdCBwcm9kdWNlIHNvcnRlZCBmaWVsZHNcbmZ1bmN0aW9uIGFkZFNvcnRUcmFuc2Zvcm1zKHNwZWMsIGVuY29kaW5nLCBvcHQpIHtcbiAgdmFyIGRhdGFzZXRNYXBwaW5nID0ge307XG4gIHZhciBjb3VudGVyID0gMDtcblxuICBlbmNvZGluZy5mb3JFYWNoKGZ1bmN0aW9uKGVuY1R5cGUsIGZpZWxkKSB7XG4gICAgdmFyIHNvcnRCeSA9IGVuY29kaW5nLnNvcnQoZW5jVHlwZSk7XG4gICAgaWYgKHNvcnRCeS5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgZmllbGRzID0gc29ydEJ5Lm1hcChmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgb3A6IGQuYWdncixcbiAgICAgICAgICBmaWVsZDogJ2RhdGEuJyArIGQubmFtZVxuICAgICAgICB9O1xuICAgICAgfSk7XG5cbiAgICAgIHZhciBieUNsYXVzZSA9IHNvcnRCeS5tYXAoZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gKGQucmV2ZXJzZSA/ICctJyA6ICcnKSArICdkYXRhLicgKyBkLmFnZ3IgKyAnXycgKyBkLm5hbWU7XG4gICAgICB9KTtcblxuICAgICAgdmFyIGRhdGFOYW1lID0gJ3NvcnRlZCcgKyBjb3VudGVyKys7XG5cbiAgICAgIHZhciB0cmFuc2Zvcm1zID0gW1xuICAgICAgICB7XG4gICAgICAgICAgdHlwZTogJ2FnZ3JlZ2F0ZScsXG4gICAgICAgICAgZ3JvdXBieTogWydkYXRhLicgKyBmaWVsZC5uYW1lXSxcbiAgICAgICAgICBmaWVsZHM6IGZpZWxkc1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdHlwZTogJ3NvcnQnLFxuICAgICAgICAgIGJ5OiBieUNsYXVzZVxuICAgICAgICB9XG4gICAgICBdO1xuXG4gICAgICBzcGVjLmRhdGEucHVzaCh7XG4gICAgICAgIG5hbWU6IGRhdGFOYW1lLFxuICAgICAgICBzb3VyY2U6IFJBVyxcbiAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2Zvcm1zXG4gICAgICB9KTtcblxuICAgICAgZGF0YXNldE1hcHBpbmdbZW5jVHlwZV0gPSBkYXRhTmFtZTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgc3BlYzogc3BlYyxcbiAgICBnZXREYXRhc2V0OiBmdW5jdGlvbihlbmNUeXBlKSB7XG4gICAgICB2YXIgZGF0YSA9IGRhdGFzZXRNYXBwaW5nW2VuY1R5cGVdO1xuICAgICAgaWYgKCFkYXRhKSB7XG4gICAgICAgIHJldHVybiBUQUJMRTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cbiAgfTtcbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgZ2xvYmFscyA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKSxcbiAgbWFya3MgPSByZXF1aXJlKCcuL21hcmtzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gc3RhY2tpbmc7XG5cbmZ1bmN0aW9uIHN0YWNraW5nKHNwZWMsIGVuY29kaW5nLCBtZGVmLCBmYWNldHMpIHtcbiAgaWYgKCFtYXJrc1tlbmNvZGluZy5tYXJrdHlwZSgpXS5zdGFjaykgcmV0dXJuIGZhbHNlO1xuXG4gIC8vIFRPRE86IGFkZCB8fCBlbmNvZGluZy5oYXMoTE9EKSBoZXJlIG9uY2UgTE9EIGlzIGltcGxlbWVudGVkXG4gIGlmICghZW5jb2RpbmcuaGFzKENPTE9SKSkgcmV0dXJuIGZhbHNlO1xuXG4gIHZhciBkaW09bnVsbCwgdmFsPW51bGwsIGlkeCA9bnVsbCxcbiAgICBpc1hNZWFzdXJlID0gZW5jb2RpbmcuaXNNZWFzdXJlKFgpLFxuICAgIGlzWU1lYXN1cmUgPSBlbmNvZGluZy5pc01lYXN1cmUoWSk7XG5cbiAgaWYgKGlzWE1lYXN1cmUgJiYgIWlzWU1lYXN1cmUpIHtcbiAgICBkaW0gPSBZO1xuICAgIHZhbCA9IFg7XG4gICAgaWR4ID0gMDtcbiAgfSBlbHNlIGlmIChpc1lNZWFzdXJlICYmICFpc1hNZWFzdXJlKSB7XG4gICAgZGltID0gWDtcbiAgICB2YWwgPSBZO1xuICAgIGlkeCA9IDE7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGw7IC8vIG5vIHN0YWNrIGVuY29kaW5nXG4gIH1cblxuICAvLyBhZGQgdHJhbnNmb3JtIHRvIGNvbXB1dGUgc3VtcyBmb3Igc2NhbGVcbiAgdmFyIHN0YWNrZWQgPSB7XG4gICAgbmFtZTogU1RBQ0tFRCxcbiAgICBzb3VyY2U6IFRBQkxFLFxuICAgIHRyYW5zZm9ybTogW3tcbiAgICAgIHR5cGU6ICdhZ2dyZWdhdGUnLFxuICAgICAgZ3JvdXBieTogW2VuY29kaW5nLmZpZWxkKGRpbSldLmNvbmNhdChmYWNldHMpLCAvLyBkaW0gYW5kIG90aGVyIGZhY2V0c1xuICAgICAgZmllbGRzOiBbe29wOiAnc3VtJywgZmllbGQ6IGVuY29kaW5nLmZpZWxkKHZhbCl9XSAvLyBUT0RPIGNoZWNrIGlmIGZpZWxkIHdpdGggYWdnciBpcyBjb3JyZWN0P1xuICAgIH1dXG4gIH07XG5cbiAgaWYgKGZhY2V0cyAmJiBmYWNldHMubGVuZ3RoID4gMCkge1xuICAgIHN0YWNrZWQudHJhbnNmb3JtLnB1c2goeyAvL2NhbGN1bGF0ZSBtYXggZm9yIGVhY2ggZmFjZXRcbiAgICAgIHR5cGU6ICdhZ2dyZWdhdGUnLFxuICAgICAgZ3JvdXBieTogZmFjZXRzLFxuICAgICAgZmllbGRzOiBbe29wOiAnbWF4JywgZmllbGQ6ICdkYXRhLnN1bV8nICsgZW5jb2RpbmcuZmllbGQodmFsLCB0cnVlKX1dXG4gICAgfSk7XG4gIH1cblxuICBzcGVjLmRhdGEucHVzaChzdGFja2VkKTtcblxuICAvLyBhZGQgc3RhY2sgdHJhbnNmb3JtIHRvIG1hcmtcbiAgbWRlZi5mcm9tLnRyYW5zZm9ybSA9IFt7XG4gICAgdHlwZTogJ3N0YWNrJyxcbiAgICBwb2ludDogZW5jb2RpbmcuZmllbGQoZGltKSxcbiAgICBoZWlnaHQ6IGVuY29kaW5nLmZpZWxkKHZhbCksXG4gICAgb3V0cHV0OiB7eTE6IHZhbCwgeTA6IHZhbCArICcyJ31cbiAgfV07XG5cbiAgLy8gVE9ETzogVGhpcyBpcyBzdXBlciBoYWNrLWlzaCAtLSBjb25zb2xpZGF0ZSBpbnRvIG1vZHVsYXIgbWFyayBwcm9wZXJ0aWVzP1xuICBtZGVmLnByb3BlcnRpZXMudXBkYXRlW3ZhbF0gPSBtZGVmLnByb3BlcnRpZXMuZW50ZXJbdmFsXSA9IHtzY2FsZTogdmFsLCBmaWVsZDogdmFsfTtcbiAgbWRlZi5wcm9wZXJ0aWVzLnVwZGF0ZVt2YWwgKyAnMiddID0gbWRlZi5wcm9wZXJ0aWVzLmVudGVyW3ZhbCArICcyJ10gPSB7c2NhbGU6IHZhbCwgZmllbGQ6IHZhbCArICcyJ307XG5cbiAgcmV0dXJuIHZhbDsgLy9yZXR1cm4gc3RhY2sgZW5jb2Rpbmdcbn1cbiIsInZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpLFxuICB2bGZpZWxkID0gcmVxdWlyZSgnLi4vZmllbGQnKSxcbiAgRW5jb2RpbmcgPSByZXF1aXJlKCcuLi9FbmNvZGluZycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVuY29kaW5nLCBzdGF0cykge1xuICByZXR1cm4ge1xuICAgIG9wYWNpdHk6IGVzdGltYXRlT3BhY2l0eShlbmNvZGluZywgc3RhdHMpLFxuICAgIGNvbG9yUmFuZ2U6IGNvbG9yUmFuZ2UoZW5jb2RpbmcsIHN0YXRzKVxuICB9O1xufTtcblxuZnVuY3Rpb24gY29sb3JSYW5nZShlbmNvZGluZywgc3RhdHMpe1xuICBpZiAoZW5jb2RpbmcuaGFzKENPTE9SKSAmJiBlbmNvZGluZy5pc0RpbWVuc2lvbihDT0xPUikpIHtcbiAgICB2YXIgY2FyZGluYWxpdHkgPSBlbmNvZGluZy5jYXJkaW5hbGl0eShDT0xPUiwgc3RhdHMpO1xuICAgIGlmIChjYXJkaW5hbGl0eSA8PSAxMCkge1xuICAgICAgcmV0dXJuIFwiY2F0ZWdvcnkxMFwiO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gXCJjYXRlZ29yeTIwXCI7XG4gICAgfVxuICAgIC8vIFRPRE8gY2FuIHZlZ2EgaW50ZXJwb2xhdGUgcmFuZ2UgZm9yIG9yZGluYWwgc2NhbGU/XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIGVzdGltYXRlT3BhY2l0eShlbmNvZGluZyxzdGF0cykge1xuICBpZiAoIXN0YXRzKSB7XG4gICAgcmV0dXJuIDE7XG4gIH1cblxuICB2YXIgbnVtUG9pbnRzID0gMDtcblxuICBpZiAoZW5jb2RpbmcuaXNBZ2dyZWdhdGUoKSkgeyAvLyBhZ2dyZWdhdGUgcGxvdFxuICAgIG51bVBvaW50cyA9IDE7XG5cbiAgICAvLyAgZ2V0IG51bWJlciBvZiBwb2ludHMgaW4gZWFjaCBcImNlbGxcIlxuICAgIC8vICBieSBjYWxjdWxhdGluZyBwcm9kdWN0IG9mIGNhcmRpbmFsaXR5XG4gICAgLy8gIGZvciBlYWNoIG5vbiBmYWNldGluZyBhbmQgbm9uLW9yZGluYWwgWCAvIFkgZmllbGRzXG4gICAgLy8gIG5vdGUgdGhhdCBvcmRpbmFsIHgseSBhcmUgbm90IGluY2x1ZGUgc2luY2Ugd2UgY2FuXG4gICAgLy8gIGNvbnNpZGVyIHRoYXQgb3JkaW5hbCB4IGFyZSBzdWJkaXZpZGluZyB0aGUgY2VsbCBpbnRvIHN1YmNlbGxzIGFueXdheVxuICAgIGVuY29kaW5nLmZvckVhY2goZnVuY3Rpb24oZW5jVHlwZSwgZmllbGQpIHtcblxuICAgICAgaWYgKGVuY1R5cGUgIT09IFJPVyAmJiBlbmNUeXBlICE9PSBDT0wgJiZcbiAgICAgICAgICAhKChlbmNUeXBlID09PSBYIHx8IGVuY1R5cGUgPT09IFkpICYmXG4gICAgICAgICAgdmxmaWVsZC5pc0RpbWVuc2lvbihmaWVsZCwgdHJ1ZSkpXG4gICAgICAgICkge1xuICAgICAgICBudW1Qb2ludHMgKj0gZW5jb2RpbmcuY2FyZGluYWxpdHkoZW5jVHlwZSwgc3RhdHMpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gIH0gZWxzZSB7IC8vIHJhdyBwbG90XG4gICAgbnVtUG9pbnRzID0gc3RhdHMuY291bnQ7XG5cbiAgICAvLyBzbWFsbCBtdWx0aXBsZXMgZGl2aWRlIG51bWJlciBvZiBwb2ludHNcbiAgICB2YXIgbnVtTXVsdGlwbGVzID0gMTtcbiAgICBpZiAoZW5jb2RpbmcuaGFzKFJPVykpIHtcbiAgICAgIG51bU11bHRpcGxlcyAqPSBlbmNvZGluZy5jYXJkaW5hbGl0eShST1csIHN0YXRzKTtcbiAgICB9XG4gICAgaWYgKGVuY29kaW5nLmhhcyhDT0wpKSB7XG4gICAgICBudW1NdWx0aXBsZXMgKj0gZW5jb2RpbmcuY2FyZGluYWxpdHkoQ09MLCBzdGF0cyk7XG4gICAgfVxuICAgIG51bVBvaW50cyAvPSBudW1NdWx0aXBsZXM7XG4gIH1cblxuICB2YXIgb3BhY2l0eSA9IDA7XG4gIGlmIChudW1Qb2ludHMgPCAyMCkge1xuICAgIG9wYWNpdHkgPSAxO1xuICB9IGVsc2UgaWYgKG51bVBvaW50cyA8IDIwMCkge1xuICAgIG9wYWNpdHkgPSAwLjc7XG4gIH0gZWxzZSBpZiAobnVtUG9pbnRzIDwgMTAwMCkge1xuICAgIG9wYWNpdHkgPSAwLjY7XG4gIH0gZWxzZSB7XG4gICAgb3BhY2l0eSA9IDAuMztcbiAgfVxuXG4gIHJldHVybiBvcGFjaXR5O1xufVxuXG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpO1xuXG52YXIgZ3JvdXBkZWYgPSByZXF1aXJlKCcuL2dyb3VwJykuZGVmO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHN1YmZhY2V0aW5nO1xuXG5mdW5jdGlvbiBzdWJmYWNldGluZyhncm91cCwgbWRlZiwgZGV0YWlscywgc3RhY2ssIGVuY29kaW5nKSB7XG4gIHZhciBtID0gZ3JvdXAubWFya3MsXG4gICAgZyA9IGdyb3VwZGVmKCdzdWJmYWNldCcsIHttYXJrczogbX0pO1xuXG4gIGdyb3VwLm1hcmtzID0gW2ddO1xuICBnLmZyb20gPSBtZGVmLmZyb207XG4gIGRlbGV0ZSBtZGVmLmZyb207XG5cbiAgLy9UT0RPIHRlc3QgTE9EIC0tIHdlIHNob3VsZCBzdXBwb3J0IHN0YWNrIC8gbGluZSB3aXRob3V0IGNvbG9yIChMT0QpIGZpZWxkXG4gIHZhciB0cmFucyA9IChnLmZyb20udHJhbnNmb3JtIHx8IChnLmZyb20udHJhbnNmb3JtID0gW10pKTtcbiAgdHJhbnMudW5zaGlmdCh7dHlwZTogJ2ZhY2V0Jywga2V5czogZGV0YWlsc30pO1xuXG4gIGlmIChzdGFjayAmJiBlbmNvZGluZy5oYXMoQ09MT1IpKSB7XG4gICAgdHJhbnMudW5zaGlmdCh7dHlwZTogJ3NvcnQnLCBieTogZW5jb2RpbmcuZmllbGQoQ09MT1IpfSk7XG4gIH1cbn1cbiIsInZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpO1xuXG52YXIgZ3JvdXBkZWYgPSByZXF1aXJlKCcuL2dyb3VwJykuZGVmLFxuICB2bGRhdGEgPSByZXF1aXJlKCcuLi9kYXRhJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gdGVtcGxhdGU7XG5cbmZ1bmN0aW9uIHRlbXBsYXRlKGVuY29kaW5nLCBsYXlvdXQsIHN0YXRzKSB7IC8vaGFjayB1c2Ugc3RhdHNcblxuICB2YXIgZGF0YSA9IHtuYW1lOiBSQVcsIGZvcm1hdDoge3R5cGU6IGVuY29kaW5nLmNvbmZpZygnZGF0YUZvcm1hdFR5cGUnKX19LFxuICAgIHRhYmxlID0ge25hbWU6IFRBQkxFLCBzb3VyY2U6IFJBV30sXG4gICAgZGF0YVVybCA9IHZsZGF0YS5nZXRVcmwoZW5jb2RpbmcsIHN0YXRzKTtcbiAgaWYgKGRhdGFVcmwpIGRhdGEudXJsID0gZGF0YVVybDtcblxuICB2YXIgcHJlYWdncmVnYXRlZERhdGEgPSBlbmNvZGluZy5jb25maWcoJ3VzZVZlZ2FTZXJ2ZXInKTtcblxuICBlbmNvZGluZy5mb3JFYWNoKGZ1bmN0aW9uKGVuY1R5cGUsIGZpZWxkKSB7XG4gICAgdmFyIG5hbWU7XG4gICAgaWYgKGZpZWxkLnR5cGUgPT0gVCkge1xuICAgICAgZGF0YS5mb3JtYXQucGFyc2UgPSBkYXRhLmZvcm1hdC5wYXJzZSB8fCB7fTtcbiAgICAgIGRhdGEuZm9ybWF0LnBhcnNlW2ZpZWxkLm5hbWVdID0gJ2RhdGUnO1xuICAgIH0gZWxzZSBpZiAoZmllbGQudHlwZSA9PSBRKSB7XG4gICAgICBkYXRhLmZvcm1hdC5wYXJzZSA9IGRhdGEuZm9ybWF0LnBhcnNlIHx8IHt9O1xuICAgICAgaWYgKGZpZWxkLmFnZ3IgPT09ICdjb3VudCcpIHtcbiAgICAgICAgbmFtZSA9ICdjb3VudCc7XG4gICAgICB9IGVsc2UgaWYgKHByZWFnZ3JlZ2F0ZWREYXRhICYmIGZpZWxkLmJpbikge1xuICAgICAgICBuYW1lID0gJ2Jpbl8nICsgZmllbGQubmFtZTtcbiAgICAgIH0gZWxzZSBpZiAocHJlYWdncmVnYXRlZERhdGEgJiYgZmllbGQuYWdncikge1xuICAgICAgICBuYW1lID0gZmllbGQuYWdnciArICdfJyArIGZpZWxkLm5hbWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuYW1lID0gZmllbGQubmFtZTtcbiAgICAgIH1cbiAgICAgIGRhdGEuZm9ybWF0LnBhcnNlW25hbWVdID0gJ251bWJlcic7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4ge1xuICAgIHdpZHRoOiBsYXlvdXQud2lkdGgsXG4gICAgaGVpZ2h0OiBsYXlvdXQuaGVpZ2h0LFxuICAgIHBhZGRpbmc6ICdhdXRvJyxcbiAgICBkYXRhOiBbZGF0YSwgdGFibGVdLFxuICAgIG1hcmtzOiBbZ3JvdXBkZWYoJ2NlbGwnLCB7XG4gICAgICB3aWR0aDogbGF5b3V0LmNlbGxXaWR0aCA/IHt2YWx1ZTogbGF5b3V0LmNlbGxXaWR0aH0gOiB1bmRlZmluZWQsXG4gICAgICBoZWlnaHQ6IGxheW91dC5jZWxsSGVpZ2h0ID8ge3ZhbHVlOiBsYXlvdXQuY2VsbEhlaWdodH0gOiB1bmRlZmluZWRcbiAgICB9KV1cbiAgfTtcbn1cbiIsInZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRpbWU7XG5cbmZ1bmN0aW9uIHRpbWUoc3BlYywgZW5jb2RpbmcsIG9wdCkge1xuICB2YXIgdGltZUZpZWxkcyA9IHt9LCB0aW1lRm4gPSB7fTtcblxuICAvLyBmaW5kIHVuaXF1ZSBmb3JtdWxhIHRyYW5zZm9ybWF0aW9uIGFuZCBiaW4gZnVuY3Rpb25cbiAgZW5jb2RpbmcuZm9yRWFjaChmdW5jdGlvbihlbmNUeXBlLCBmaWVsZCkge1xuICAgIGlmIChmaWVsZC50eXBlID09PSBUICYmIGZpZWxkLmZuKSB7XG4gICAgICB0aW1lRmllbGRzW2VuY29kaW5nLmZpZWxkKGVuY1R5cGUpXSA9IHtcbiAgICAgICAgZmllbGQ6IGZpZWxkLFxuICAgICAgICBlbmNUeXBlOiBlbmNUeXBlXG4gICAgICB9O1xuICAgICAgdGltZUZuW2ZpZWxkLmZuXSA9IHRydWU7XG4gICAgfVxuICB9KTtcblxuICAvLyBhZGQgZm9ybXVsYSB0cmFuc2Zvcm1cbiAgdmFyIGRhdGEgPSBzcGVjLmRhdGFbMV0sXG4gICAgdHJhbnNmb3JtID0gZGF0YS50cmFuc2Zvcm0gPSBkYXRhLnRyYW5zZm9ybSB8fCBbXTtcblxuICBmb3IgKHZhciBmIGluIHRpbWVGaWVsZHMpIHtcbiAgICB2YXIgdGYgPSB0aW1lRmllbGRzW2ZdO1xuICAgIHRpbWUudHJhbnNmb3JtKHRyYW5zZm9ybSwgZW5jb2RpbmcsIHRmLmVuY1R5cGUsIHRmLmZpZWxkKTtcbiAgfVxuXG4gIC8vIGFkZCBzY2FsZXNcbiAgdmFyIHNjYWxlcyA9IHNwZWMuc2NhbGVzID0gc3BlYy5zY2FsZXMgfHwgW107XG4gIGZvciAodmFyIGZuIGluIHRpbWVGbikge1xuICAgIHRpbWUuc2NhbGUoc2NhbGVzLCBmbiwgZW5jb2RpbmcpO1xuICB9XG4gIHJldHVybiBzcGVjO1xufVxuXG50aW1lLmNhcmRpbmFsaXR5ID0gZnVuY3Rpb24oZmllbGQsIHN0YXRzKSB7XG4gIHZhciBmbiA9IGZpZWxkLmZuO1xuICBzd2l0Y2ggKGZuKSB7XG4gICAgY2FzZSAnc2Vjb25kJzogcmV0dXJuIDYwO1xuICAgIGNhc2UgJ21pbnV0ZSc6IHJldHVybiA2MDtcbiAgICBjYXNlICdob3VyJzogcmV0dXJuIDI0O1xuICAgIGNhc2UgJ2RheW9md2Vlayc6IHJldHVybiA3O1xuICAgIGNhc2UgJ2RhdGUnOiByZXR1cm4gMzE7XG4gICAgY2FzZSAnbW9udGgnOiByZXR1cm4gMTI7XG4gICAgLy8gY2FzZSAneWVhcic6ICAtLSBuZWVkIHJlYWwgY2FyZGluYWxpdHlcbiAgfVxuXG4gIHJldHVybiBzdGF0c1tmaWVsZC5uYW1lXS5jYXJkaW5hbGl0eTtcbn07XG5cbi8qKlxuICogQHJldHVybiB7U3RyaW5nfSBkYXRlIGJpbm5pbmcgZm9ybXVsYSBvZiB0aGUgZ2l2ZW4gZmllbGRcbiAqL1xudGltZS5mb3JtdWxhID0gZnVuY3Rpb24oZmllbGQpIHtcbiAgdmFyIGRhdGUgPSAnbmV3IERhdGUoZC5kYXRhLicrIGZpZWxkLm5hbWUgKyAnKSc7XG4gIHN3aXRjaCAoZmllbGQuZm4pIHtcbiAgICBjYXNlICdzZWNvbmQnOiByZXR1cm4gZGF0ZSArICcuZ2V0VVRDU2Vjb25kcygpJztcbiAgICBjYXNlICdtaW51dGUnOiByZXR1cm4gZGF0ZSArICcuZ2V0VVRDTWludXRlcygpJztcbiAgICBjYXNlICdob3VyJzogcmV0dXJuIGRhdGUgKyAnLmdldFVUQ0hvdXJzKCknO1xuICAgIGNhc2UgJ2RheW9md2Vlayc6IHJldHVybiBkYXRlICsgJy5nZXRVVENEYXkoKSc7XG4gICAgY2FzZSAnZGF0ZSc6IHJldHVybiBkYXRlICsgJy5nZXRVVENEYXRlKCknO1xuICAgIGNhc2UgJ21vbnRoJzogcmV0dXJuIGRhdGUgKyAnLmdldFVUQ01vbnRoKCknO1xuICAgIGNhc2UgJ3llYXInOiByZXR1cm4gZGF0ZSArICcuZ2V0VVRDRnVsbFllYXIoKSc7XG4gIH1cbiAgLy8gVE9ETyBhZGQgY29udGludW91cyBiaW5uaW5nXG4gIGNvbnNvbGUuZXJyb3IoJ25vIGZ1bmN0aW9uIHNwZWNpZmllZCBmb3IgZGF0ZScpO1xufTtcblxuLyoqIGFkZCBmb3JtdWxhIHRyYW5zZm9ybXMgdG8gZGF0YSAqL1xudGltZS50cmFuc2Zvcm0gPSBmdW5jdGlvbih0cmFuc2Zvcm0sIGVuY29kaW5nLCBlbmNUeXBlLCBmaWVsZCkge1xuICB0cmFuc2Zvcm0ucHVzaCh7XG4gICAgdHlwZTogJ2Zvcm11bGEnLFxuICAgIGZpZWxkOiBlbmNvZGluZy5maWVsZChlbmNUeXBlKSxcbiAgICBleHByOiB0aW1lLmZvcm11bGEoZmllbGQpXG4gIH0pO1xufTtcblxuLyoqIGFwcGVuZCBjdXN0b20gdGltZSBzY2FsZXMgZm9yIGF4aXMgbGFiZWwgKi9cbnRpbWUuc2NhbGUgPSBmdW5jdGlvbihzY2FsZXMsIGZuLCBlbmNvZGluZykge1xuICB2YXIgbGFiZWxMZW5ndGggPSBlbmNvZGluZy5jb25maWcoJ3RpbWVTY2FsZUxhYmVsTGVuZ3RoJyk7XG4gIC8vIFRPRE8gYWRkIG9wdGlvbiBmb3Igc2hvcnRlciBzY2FsZSAvIGN1c3RvbSByYW5nZVxuICBzd2l0Y2ggKGZuKSB7XG4gICAgY2FzZSAnZGF5b2Z3ZWVrJzpcbiAgICAgIHNjYWxlcy5wdXNoKHtcbiAgICAgICAgbmFtZTogJ3RpbWUtJytmbixcbiAgICAgICAgdHlwZTogJ29yZGluYWwnLFxuICAgICAgICBkb21haW46IHV0aWwucmFuZ2UoMCwgNyksXG4gICAgICAgIHJhbmdlOiBbJ01vbmRheScsICdUdWVzZGF5JywgJ1dlZG5lc2RheScsICdUaHVyc2RheScsICdGcmlkYXknLCAnU2F0dXJkYXknLCAnU3VuZGF5J10ubWFwKFxuICAgICAgICAgIGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMuc3Vic3RyKDAsIGxhYmVsTGVuZ3RoKTt9XG4gICAgICAgIClcbiAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbW9udGgnOlxuICAgICAgc2NhbGVzLnB1c2goe1xuICAgICAgICBuYW1lOiAndGltZS0nK2ZuLFxuICAgICAgICB0eXBlOiAnb3JkaW5hbCcsXG4gICAgICAgIGRvbWFpbjogdXRpbC5yYW5nZSgwLCAxMiksXG4gICAgICAgIHJhbmdlOiBbJ0phbnVhcnknLCAnRmVicnVhcnknLCAnTWFyY2gnLCAnQXByaWwnLCAnTWF5JywgJ0p1bmUnLCAnSnVseScsICdBdWd1c3QnLCAnU2VwdGVtYmVyJywgJ09jdG9iZXInLCAnTm92ZW1iZXInLCAnRGVjZW1iZXInXS5tYXAoXG4gICAgICAgICAgICBmdW5jdGlvbihzKSB7IHJldHVybiBzLnN1YnN0cigwLCBsYWJlbExlbmd0aCk7fVxuICAgICAgICAgIClcbiAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gIH1cbn07XG5cbnRpbWUuaXNPcmRpbmFsRm4gPSBmdW5jdGlvbihmbikge1xuICBzd2l0Y2ggKGZuKSB7XG4gICAgY2FzZSAnc2Vjb25kJzpcbiAgICBjYXNlICdtaW51dGUnOlxuICAgIGNhc2UgJ2hvdXInOlxuICAgIGNhc2UgJ2RheW9md2Vlayc6XG4gICAgY2FzZSAnZGF0ZSc6XG4gICAgY2FzZSAnbW9udGgnOlxuICAgICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxudGltZS5zY2FsZS50eXBlID0gZnVuY3Rpb24oZm4pIHtcbiAgcmV0dXJuIHRpbWUuaXNPcmRpbmFsRm4oZm4pID8gJ29yZGluYWwnIDogJ2xpbmVhcic7XG59O1xuXG50aW1lLnNjYWxlLmRvbWFpbiA9IGZ1bmN0aW9uKGZuKSB7XG4gIHN3aXRjaCAoZm4pIHtcbiAgICBjYXNlICdzZWNvbmQnOlxuICAgIGNhc2UgJ21pbnV0ZSc6IHJldHVybiB1dGlsLnJhbmdlKDAsIDYwKTtcbiAgICBjYXNlICdob3VyJzogcmV0dXJuIHV0aWwucmFuZ2UoMCwgMjQpO1xuICAgIGNhc2UgJ2RheW9md2Vlayc6IHJldHVybiB1dGlsLnJhbmdlKDAsIDcpO1xuICAgIGNhc2UgJ2RhdGUnOiByZXR1cm4gdXRpbC5yYW5nZSgwLCAzMik7XG4gICAgY2FzZSAnbW9udGgnOiByZXR1cm4gdXRpbC5yYW5nZSgwLCAxMik7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59O1xuXG4vKiogd2hldGhlciBhIHBhcnRpY3VsYXIgdGltZSBmdW5jdGlvbiBoYXMgY3VzdG9tIHNjYWxlIGZvciBsYWJlbHMgaW1wbGVtZW50ZWQgaW4gdGltZS5zY2FsZSAqL1xudGltZS5oYXNTY2FsZSA9IGZ1bmN0aW9uKGZuKSB7XG4gIHN3aXRjaCAoZm4pIHtcbiAgICBjYXNlICdkYXlvZndlZWsnOlxuICAgIGNhc2UgJ21vbnRoJzpcbiAgICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cblxuIiwidmFyIGdsb2JhbHMgPSByZXF1aXJlKCcuL2dsb2JhbHMnKTtcblxudmFyIGNvbnN0cyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbmNvbnN0cy5lbmNvZGluZ1R5cGVzID0gW1gsIFksIFJPVywgQ09MLCBTSVpFLCBTSEFQRSwgQ09MT1IsIEFMUEhBLCBURVhULCBERVRBSUxdO1xuXG5jb25zdHMuZGF0YVR5cGVzID0geydPJzogTywgJ1EnOiBRLCAnVCc6IFR9O1xuXG5jb25zdHMuZGF0YVR5cGVOYW1lcyA9IFsnTycsICdRJywgJ1QnXS5yZWR1Y2UoZnVuY3Rpb24ociwgeCkge1xuICByW2NvbnN0cy5kYXRhVHlwZXNbeF1dID0geDtcbiAgcmV0dXJuIHI7XG59LHt9KTtcblxuY29uc3RzLnNob3J0aGFuZCA9IHtcbiAgZGVsaW06ICAnfCcsXG4gIGFzc2lnbjogJz0nLFxuICB0eXBlOiAgICcsJyxcbiAgZnVuYzogICAnXydcbn07XG4iLCIvLyBUT0RPIHJlbmFtZSBnZXREYXRhVXJsIHRvIHZsLmRhdGEuZ2V0VXJsKCkgP1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG52YXIgdmxkYXRhID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxudmxkYXRhLmdldFVybCA9IGZ1bmN0aW9uIGdldERhdGFVcmwoZW5jb2RpbmcsIHN0YXRzKSB7XG4gIGlmICghZW5jb2RpbmcuY29uZmlnKCd1c2VWZWdhU2VydmVyJykpIHtcbiAgICAvLyBkb24ndCB1c2UgdmVnYSBzZXJ2ZXJcbiAgICByZXR1cm4gZW5jb2RpbmcuY29uZmlnKCdkYXRhVXJsJyk7XG4gIH1cblxuICBpZiAoZW5jb2RpbmcubGVuZ3RoKCkgPT09IDApIHtcbiAgICAvLyBubyBmaWVsZHNcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgZmllbGRzID0gW107XG4gIGVuY29kaW5nLmZvckVhY2goZnVuY3Rpb24oZW5jVHlwZSwgZmllbGQpIHtcbiAgICB2YXIgb2JqID0ge1xuICAgICAgbmFtZTogZW5jb2RpbmcuZmllbGQoZW5jVHlwZSwgdHJ1ZSksXG4gICAgICBmaWVsZDogZmllbGQubmFtZVxuICAgIH07XG4gICAgaWYgKGZpZWxkLmFnZ3IpIHtcbiAgICAgIG9iai5hZ2dyID0gZmllbGQuYWdncjtcbiAgICB9XG4gICAgaWYgKGZpZWxkLmJpbikge1xuICAgICAgb2JqLmJpblNpemUgPSB1dGlsLmdldGJpbnMoc3RhdHNbZmllbGQubmFtZV0sIGVuY29kaW5nLmNvbmZpZygnbWF4YmlucycpKS5zdGVwO1xuICAgIH1cbiAgICBmaWVsZHMucHVzaChvYmopO1xuICB9KTtcblxuICB2YXIgcXVlcnkgPSB7XG4gICAgdGFibGU6IGVuY29kaW5nLmNvbmZpZygndmVnYVNlcnZlclRhYmxlJyksXG4gICAgZmllbGRzOiBmaWVsZHNcbiAgfTtcblxuICByZXR1cm4gZW5jb2RpbmcuY29uZmlnKCd2ZWdhU2VydmVyVXJsJykgKyAnL3F1ZXJ5Lz9xPScgKyBKU09OLnN0cmluZ2lmeShxdWVyeSk7XG59O1xuXG4vKipcbiAqIEBwYXJhbSAge09iamVjdH0gZGF0YSBkYXRhIGluIEpTT04vamF2YXNjcmlwdCBvYmplY3QgZm9ybWF0XG4gKiBAcmV0dXJuIEFycmF5IG9mIHtuYW1lOiBfX25hbWVfXywgdHlwZTogXCJudW1iZXJ8dGV4dHx0aW1lfGxvY2F0aW9uXCJ9XG4gKi9cbnZsZGF0YS5nZXRTY2hlbWEgPSBmdW5jdGlvbihkYXRhKSB7XG4gIHZhciBzY2hlbWEgPSBbXSxcbiAgICBmaWVsZHMgPSB1dGlsLmtleXMoZGF0YVswXSk7XG5cbiAgZmllbGRzLmZvckVhY2goZnVuY3Rpb24oaykge1xuICAgIC8vIGZpbmQgbm9uLW51bGwgZGF0YVxuICAgIHZhciBpID0gMCwgZGF0dW0gPSBkYXRhW2ldW2tdO1xuICAgIHdoaWxlIChkYXR1bSA9PT0gJycgfHwgZGF0dW0gPT09IG51bGwgfHwgZGF0dW0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgZGF0dW0gPSBkYXRhWysraV1ba107XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIHZhciBudW1iZXIgPSBKU09OLnBhcnNlKGRhdHVtKTtcbiAgICAgIGRhdHVtID0gbnVtYmVyO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgLy8gZG8gbm90aGluZ1xuICAgIH1cblxuICAgIC8vVE9ETyhrYW5pdHcpOiBiZXR0ZXIgdHlwZSBpbmZlcmVuY2UgaGVyZVxuICAgIHZhciB0eXBlID0gKHR5cGVvZiBkYXR1bSA9PT0gJ251bWJlcicpID8gJ1EnOlxuICAgICAgaXNOYU4oRGF0ZS5wYXJzZShkYXR1bSkpID8gJ08nIDogJ1QnO1xuXG4gICAgc2NoZW1hLnB1c2goe25hbWU6IGssIHR5cGU6IHR5cGV9KTtcbiAgfSk7XG5cbiAgcmV0dXJuIHNjaGVtYTtcbn07XG5cbnZsZGF0YS5nZXRTdGF0cyA9IGZ1bmN0aW9uKGRhdGEpIHsgLy8gaGFja1xuICB2YXIgc3RhdHMgPSB7fSxcbiAgICBmaWVsZHMgPSB1dGlsLmtleXMoZGF0YVswXSk7XG5cbiAgZmllbGRzLmZvckVhY2goZnVuY3Rpb24oaykge1xuICAgIHZhciBzdGF0ID0gdXRpbC5taW5tYXgoZGF0YSwgaywgdHJ1ZSk7XG4gICAgc3RhdC5jYXJkaW5hbGl0eSA9IHV0aWwudW5pcShkYXRhLCBrKTtcbiAgICBzdGF0LmNvdW50ID0gZGF0YS5sZW5ndGg7XG5cbiAgICBzdGF0Lm1heGxlbmd0aCA9IGRhdGEucmVkdWNlKGZ1bmN0aW9uKG1heCxyb3cpIHtcbiAgICAgIGlmIChyb3dba10gPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG1heDtcbiAgICAgIH1cbiAgICAgIHZhciBsZW4gPSByb3dba10udG9TdHJpbmcoKS5sZW5ndGg7XG4gICAgICByZXR1cm4gbGVuID4gbWF4ID8gbGVuIDogbWF4O1xuICAgIH0sIDApO1xuXG4gICAgc3RhdC5udW1OdWxscyA9IGRhdGEucmVkdWNlKGZ1bmN0aW9uKGNvdW50LCByb3cpIHtcbiAgICAgIHJldHVybiByb3dba10gPT09IG51bGwgPyBjb3VudCArIDEgOiBjb3VudDtcbiAgICB9LCAwKTtcblxuICAgIHZhciBudW1iZXJzID0gdXRpbC5udW1iZXJzKGRhdGEubWFwKGZ1bmN0aW9uKGQpIHtyZXR1cm4gZFtrXTt9KSk7XG5cbiAgICBpZiAobnVtYmVycy5sZW5ndGggPiAwKSB7XG4gICAgICBzdGF0LnNrZXcgPSB1dGlsLnNrZXcobnVtYmVycyk7XG4gICAgICBzdGF0LnN0ZGV2ID0gdXRpbC5zdGRldihudW1iZXJzKTtcbiAgICAgIHN0YXQubWVhbiA9IHV0aWwubWVhbihudW1iZXJzKTtcbiAgICAgIHN0YXQubWVkaWFuID0gdXRpbC5tZWRpYW4obnVtYmVycyk7XG4gICAgfVxuXG4gICAgdmFyIHNhbXBsZSA9IHt9O1xuICAgIGZvciAoOyBPYmplY3Qua2V5cyhzYW1wbGUpLmxlbmd0aCA8IE1hdGgubWluKHN0YXQuY2FyZGluYWxpdHksIDEwKTsgaSsrKSB7XG4gICAgICB2YXIgdmFsdWUgPSBkYXRhW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGRhdGEubGVuZ3RoKV1ba107XG4gICAgICBzYW1wbGVbdmFsdWVdID0gdHJ1ZTtcbiAgICB9XG4gICAgc3RhdC5zYW1wbGUgPSBPYmplY3Qua2V5cyhzYW1wbGUpO1xuXG4gICAgc3RhdHNba10gPSBzdGF0O1xuICB9KTtcbiAgc3RhdHMuY291bnQgPSBkYXRhLmxlbmd0aDtcbiAgcmV0dXJuIHN0YXRzO1xufTtcbiIsIi8vIHV0aWxpdHkgZm9yIGVuY1xuXG52YXIgY29uc3RzID0gcmVxdWlyZSgnLi9jb25zdHMnKSxcbiAgYyA9IGNvbnN0cy5zaG9ydGhhbmQsXG4gIHRpbWUgPSByZXF1aXJlKCcuL2NvbXBpbGUvdGltZScpLFxuICB2bGZpZWxkID0gcmVxdWlyZSgnLi9maWVsZCcpLFxuICB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyksXG4gIHNjaGVtYSA9IHJlcXVpcmUoJy4vc2NoZW1hL3NjaGVtYScpLFxuICBlbmNUeXBlcyA9IHNjaGVtYS5lbmNUeXBlcztcblxudmFyIHZsZW5jID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxudmxlbmMuaGFzID0gZnVuY3Rpb24oZW5jLCBlbmNUeXBlKSB7XG4gIHZhciBmaWVsZERlZiA9IGVuYyAmJiBlbmNbZW5jVHlwZV07XG4gIHJldHVybiBmaWVsZERlZiAmJiBmaWVsZERlZi5uYW1lO1xufTtcblxudmxlbmMuZm9yRWFjaCA9IGZ1bmN0aW9uKGVuYywgZikge1xuICB2YXIgaSA9IDAsIGs7XG4gIGVuY1R5cGVzLmZvckVhY2goZnVuY3Rpb24oaykge1xuICAgIGlmICh2bGVuYy5oYXMoZW5jLCBrKSkge1xuICAgICAgZihrLCBlbmNba10sIGkrKyk7XG4gICAgfVxuICB9KTtcbn07XG5cbnZsZW5jLm1hcCA9IGZ1bmN0aW9uKGVuYywgZikge1xuICB2YXIgYXJyID0gW10sIGs7XG4gIGVuY1R5cGVzLmZvckVhY2goZnVuY3Rpb24oaykge1xuICAgIGlmICh2bGVuYy5oYXMoZW5jLCBrKSkge1xuICAgICAgYXJyLnB1c2goZihlbmNba10sIGssIGVuYykpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBhcnI7XG59O1xuXG52bGVuYy5yZWR1Y2UgPSBmdW5jdGlvbihlbmMsIGYsIGluaXQpIHtcbiAgdmFyIHIgPSBpbml0LCBpID0gMCwgaztcbiAgZW5jVHlwZXMuZm9yRWFjaChmdW5jdGlvbihrKSB7XG4gICAgaWYgKHZsZW5jLmhhcyhlbmMsIGspKSB7XG4gICAgICByID0gZihyLCBlbmNba10sIGssIGVuYyk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHI7XG59O1xuXG52bGVuYy5zaG9ydGhhbmQgPSBmdW5jdGlvbihlbmMpIHtcbiAgcmV0dXJuIHZsZW5jLm1hcChlbmMsIGZ1bmN0aW9uKHYsIGUpIHtcbiAgICByZXR1cm4gZSArIGMuYXNzaWduICsgdmxmaWVsZC5zaG9ydGhhbmQodik7XG4gIH0pLmpvaW4oYy5kZWxpbSk7XG59O1xuXG52bGVuYy5wYXJzZVNob3J0aGFuZCA9IGZ1bmN0aW9uKHNob3J0aGFuZCwgY29udmVydFR5cGUpIHtcbiAgdmFyIGVuYyA9IHNob3J0aGFuZC5zcGxpdChjLmRlbGltKTtcbiAgcmV0dXJuIGVuYy5yZWR1Y2UoZnVuY3Rpb24obSwgZSkge1xuICAgIHZhciBzcGxpdCA9IGUuc3BsaXQoYy5hc3NpZ24pLFxuICAgICAgICBlbmN0eXBlID0gc3BsaXRbMF0udHJpbSgpLFxuICAgICAgICBmaWVsZCA9IHNwbGl0WzFdO1xuXG4gICAgbVtlbmN0eXBlXSA9IHZsZmllbGQucGFyc2VTaG9ydGhhbmQoZmllbGQsIGNvbnZlcnRUeXBlKTtcbiAgICByZXR1cm4gbTtcbiAgfSwge30pO1xufTsiLCIvLyB1dGlsaXR5IGZvciBmaWVsZFxuXG52YXIgY29uc3RzID0gcmVxdWlyZSgnLi9jb25zdHMnKSxcbiAgYyA9IGNvbnN0cy5zaG9ydGhhbmQsXG4gIHRpbWUgPSByZXF1aXJlKCcuL2NvbXBpbGUvdGltZScpLFxuICB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyksXG4gIHNjaGVtYSA9IHJlcXVpcmUoJy4vc2NoZW1hL3NjaGVtYScpO1xuXG52YXIgdmxmaWVsZCA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnZsZmllbGQuc2hvcnRoYW5kID0gZnVuY3Rpb24oZikge1xuICB2YXIgYyA9IGNvbnN0cy5zaG9ydGhhbmQ7XG4gIHJldHVybiAoZi5hZ2dyID8gZi5hZ2dyICsgYy5mdW5jIDogJycpICtcbiAgICAoZi5mbiA/IGYuZm4gKyBjLmZ1bmMgOiAnJykgK1xuICAgIChmLmJpbiA/ICdiaW4nICsgYy5mdW5jIDogJycpICtcbiAgICAoZi5uYW1lIHx8ICcnKSArIGMudHlwZSArXG4gICAgKGNvbnN0cy5kYXRhVHlwZU5hbWVzW2YudHlwZV0gfHwgZi50eXBlKTtcbn07XG5cbnZsZmllbGQuc2hvcnRoYW5kcyA9IGZ1bmN0aW9uKGZpZWxkcywgZGVsaW0pIHtcbiAgZGVsaW0gPSBkZWxpbSB8fCAnLCc7XG4gIHJldHVybiBmaWVsZHMubWFwKHZsZmllbGQuc2hvcnRoYW5kKS5qb2luKGRlbGltKTtcbn07XG5cbnZsZmllbGQucGFyc2VTaG9ydGhhbmQgPSBmdW5jdGlvbihzaG9ydGhhbmQsIGNvbnZlcnRUeXBlKSB7XG4gIHZhciBzcGxpdCA9IHNob3J0aGFuZC5zcGxpdChjLnR5cGUpLCBpO1xuICB2YXIgbyA9IHtcbiAgICBuYW1lOiBzcGxpdFswXS50cmltKCksXG4gICAgdHlwZTogY29udmVydFR5cGUgPyBjb25zdHMuZGF0YVR5cGVzW3NwbGl0WzFdLnRyaW0oKV0gOiBzcGxpdFsxXS50cmltKClcbiAgfTtcblxuICAvLyBjaGVjayBhZ2dyZWdhdGUgdHlwZVxuICBmb3IgKGkgaW4gc2NoZW1hLmFnZ3IuZW51bSkge1xuICAgIHZhciBhID0gc2NoZW1hLmFnZ3IuZW51bVtpXTtcbiAgICBpZiAoby5uYW1lLmluZGV4T2YoYSArICdfJykgPT09IDApIHtcbiAgICAgIG8ubmFtZSA9IG8ubmFtZS5zdWJzdHIoYS5sZW5ndGggKyAxKTtcbiAgICAgIGlmIChhID09ICdjb3VudCcgJiYgby5uYW1lLmxlbmd0aCA9PT0gMCkgby5uYW1lID0gJyonO1xuICAgICAgby5hZ2dyID0gYTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8vIGNoZWNrIHRpbWUgZm5cbiAgZm9yIChpIGluIHNjaGVtYS50aW1lZm5zKSB7XG4gICAgdmFyIGYgPSBzY2hlbWEudGltZWZuc1tpXTtcbiAgICBpZiAoby5uYW1lICYmIG8ubmFtZS5pbmRleE9mKGYgKyAnXycpID09PSAwKSB7XG4gICAgICBvLm5hbWUgPSBvLm5hbWUuc3Vic3RyKG8ubGVuZ3RoICsgMSk7XG4gICAgICBvLmZuID0gZjtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8vIGNoZWNrIGJpblxuICBpZiAoby5uYW1lICYmIG8ubmFtZS5pbmRleE9mKCdiaW5fJykgPT09IDApIHtcbiAgICBvLm5hbWUgPSBvLm5hbWUuc3Vic3RyKDQpO1xuICAgIG8uYmluID0gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBvO1xufTtcblxudmFyIHR5cGVPcmRlciA9IHtcbiAgTzogMCxcbiAgRzogMSxcbiAgVDogMixcbiAgUTogM1xufTtcblxudmxmaWVsZC5vcmRlciA9IHt9O1xuXG52bGZpZWxkLm9yZGVyLnR5cGUgPSBmdW5jdGlvbihmaWVsZCkge1xuICBpZiAoZmllbGQuYWdncj09PSdjb3VudCcpIHJldHVybiA0O1xuICByZXR1cm4gdHlwZU9yZGVyW2ZpZWxkLnR5cGVdO1xufTtcblxudmxmaWVsZC5vcmRlci50eXBlVGhlbk5hbWUgPSBmdW5jdGlvbihmaWVsZCkge1xuICByZXR1cm4gdmxmaWVsZC5vcmRlci50eXBlKGZpZWxkKSArICdfJyArIGZpZWxkLm5hbWU7XG59O1xuXG52bGZpZWxkLm9yZGVyLm9yaWdpbmFsID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAwOyAvLyBubyBzd2FwIHdpbGwgb2NjdXJcbn07XG5cbnZsZmllbGQub3JkZXIubmFtZSA9IGZ1bmN0aW9uKGZpZWxkKSB7XG4gIHJldHVybiBmaWVsZC5uYW1lO1xufTtcblxudmxmaWVsZC5vcmRlci50eXBlVGhlbkNhcmRpbmFsaXR5ID0gZnVuY3Rpb24oZmllbGQsIHN0YXRzKXtcbiAgcmV0dXJuIHN0YXRzW2ZpZWxkLm5hbWVdLmNhcmRpbmFsaXR5O1xufTtcblxuXG52bGZpZWxkLmlzVHlwZSA9IGZ1bmN0aW9uIChmaWVsZERlZiwgdHlwZSkge1xuICByZXR1cm4gKGZpZWxkRGVmLnR5cGUgJiB0eXBlKSA+IDA7XG59O1xuXG52bGZpZWxkLmlzVHlwZS5ieU5hbWUgPSBmdW5jdGlvbiAoZmllbGQsIHR5cGUpIHtcbiAgcmV0dXJuIGZpZWxkLnR5cGUgPT09IGNvbnN0cy5kYXRhVHlwZU5hbWVzW3R5cGVdO1xufTtcblxuZnVuY3Rpb24gZ2V0SXNUeXBlKHVzZVR5cGVDb2RlKSB7XG4gIHJldHVybiB1c2VUeXBlQ29kZSA/IHZsZmllbGQuaXNUeXBlIDogdmxmaWVsZC5pc1R5cGUuYnlOYW1lO1xufVxuXG4vKlxuICogTW9zdCBmaWVsZHMgdGhhdCB1c2Ugb3JkaW5hbCBzY2FsZSBhcmUgZGltZW5zaW9ucy5cbiAqIEhvd2V2ZXIsIFlFQVIoVCksIFlFQVJNT05USChUKSB1c2UgdGltZSBzY2FsZSwgbm90IG9yZGluYWwgYnV0IGFyZSBkaW1lbnNpb25zIHRvby5cbiAqL1xudmxmaWVsZC5pc09yZGluYWxTY2FsZSA9IGZ1bmN0aW9uKGZpZWxkLCB1c2VUeXBlQ29kZSAvKm9wdGlvbmFsKi8pIHtcbiAgdmFyIGlzVHlwZSA9IGdldElzVHlwZSh1c2VUeXBlQ29kZSk7XG4gIHJldHVybiAgaXNUeXBlKGZpZWxkLCBPKSB8fCBmaWVsZC5iaW4gfHxcbiAgICAoIGlzVHlwZShmaWVsZCwgVCkgJiYgZmllbGQuZm4gJiYgdGltZS5pc09yZGluYWxGbihmaWVsZC5mbikgKTtcbn07XG5cbmZ1bmN0aW9uIGlzRGltZW5zaW9uKGZpZWxkLCB1c2VUeXBlQ29kZSAvKm9wdGlvbmFsKi8pIHtcbiAgdmFyIGlzVHlwZSA9IGdldElzVHlwZSh1c2VUeXBlQ29kZSk7XG4gIHJldHVybiAgaXNUeXBlKGZpZWxkLCBPKSB8fCBmaWVsZC5iaW4gfHxcbiAgICAoIGlzVHlwZShmaWVsZCwgVCkgJiYgZmllbGQuZm4gKTtcbn1cblxuLyoqXG4gKiBGb3IgZW5jb2RpbmcsIHVzZSBlbmNvZGluZy5pc0RpbWVuc2lvbigpIHRvIGF2b2lkIGNvbmZ1c2lvbi5cbiAqIE9yIHVzZSBFbmNvZGluZy5pc1R5cGUgaWYgeW91ciBmaWVsZCBpcyBmcm9tIEVuY29kaW5nIChhbmQgdGh1cyBoYXZlIG51bWVyaWMgZGF0YSB0eXBlKS5cbiAqIG90aGVyd2lzZSwgZG8gbm90IHNwZWNpZmljIGlzVHlwZSBzbyB3ZSBjYW4gdXNlIHRoZSBkZWZhdWx0IGlzVHlwZU5hbWUgaGVyZS5cbiAqL1xudmxmaWVsZC5pc0RpbWVuc2lvbiA9IGZ1bmN0aW9uKGZpZWxkLCB1c2VUeXBlQ29kZSAvKm9wdGlvbmFsKi8pIHtcbiAgcmV0dXJuIGZpZWxkICYmIGlzRGltZW5zaW9uKGZpZWxkLCB1c2VUeXBlQ29kZSk7XG59O1xuXG52bGZpZWxkLmlzTWVhc3VyZSA9IGZ1bmN0aW9uKGZpZWxkLCB1c2VUeXBlQ29kZSkge1xuICByZXR1cm4gZmllbGQgJiYgIWlzRGltZW5zaW9uKGZpZWxkLCB1c2VUeXBlQ29kZSk7XG59O1xuXG52bGZpZWxkLnJvbGUgPSBmdW5jdGlvbihmaWVsZCkge1xuICByZXR1cm4gaXNEaW1lbnNpb24oZmllbGQpID8gJ2RpbWVuc2lvbicgOiAnbWVhc3VyZSc7XG59O1xuXG52bGZpZWxkLmNvdW50ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7bmFtZTonKicsIGFnZ3I6ICdjb3VudCcsIHR5cGU6J1EnLCBkaXNwbGF5TmFtZTogdmxmaWVsZC5jb3VudC5kaXNwbGF5TmFtZX07XG59O1xuXG52bGZpZWxkLmNvdW50LmRpc3BsYXlOYW1lID0gJ051bWJlciBvZiBSZWNvcmRzJztcblxudmxmaWVsZC5pc0NvdW50ID0gZnVuY3Rpb24oZmllbGQpIHtcbiAgcmV0dXJuIGZpZWxkLmFnZ3IgPT09ICdjb3VudCc7XG59O1xuXG4vKipcbiAqIEZvciBlbmNvZGluZywgdXNlIGVuY29kaW5nLmNhcmRpbmFsaXR5KCkgdG8gYXZvaWQgY29uZnVzaW9uLiAgT3IgdXNlIEVuY29kaW5nLmlzVHlwZSBpZiB5b3VyIGZpZWxkIGlzIGZyb20gRW5jb2RpbmcgKGFuZCB0aHVzIGhhdmUgbnVtZXJpYyBkYXRhIHR5cGUpLlxuICogb3RoZXJ3aXNlLCBkbyBub3Qgc3BlY2lmaWMgaXNUeXBlIHNvIHdlIGNhbiB1c2UgdGhlIGRlZmF1bHQgaXNUeXBlTmFtZSBoZXJlLlxuICovXG52bGZpZWxkLmNhcmRpbmFsaXR5ID0gZnVuY3Rpb24oZmllbGQsIHN0YXRzLCBtYXhiaW5zLCB1c2VUeXBlQ29kZSkge1xuICB2YXIgaXNUeXBlID0gZ2V0SXNUeXBlKHVzZVR5cGVDb2RlKTtcblxuICBpZiAoZmllbGQuYmluKSB7XG4gICAgaWYgKCFtYXhiaW5zKVxuICAgICAgY29uc29sZS5lcnJvcigndmxmaWVsZC5jYXJkaW5hbGl0eSBub3QgaW5jbHVkZWQgbWF4YmlucycpO1xuICAgIHZhciBiaW5zID0gdXRpbC5nZXRiaW5zKHN0YXRzW2ZpZWxkLm5hbWVdLCBtYXhiaW5zKTtcbiAgICByZXR1cm4gKGJpbnMuc3RvcCAtIGJpbnMuc3RhcnQpIC8gYmlucy5zdGVwO1xuICB9XG4gIGlmIChpc1R5cGUoZmllbGQsIFQpKSB7XG4gICAgcmV0dXJuIHRpbWUuY2FyZGluYWxpdHkoZmllbGQsIHN0YXRzKTtcbiAgfVxuICBpZiAoZmllbGQuYWdncikge1xuICAgIHJldHVybiAxO1xuICB9XG4gIHJldHVybiBzdGF0c1tmaWVsZC5uYW1lXS5jYXJkaW5hbGl0eTtcbn07XG4iLCIvLyBkZWNsYXJlIGdsb2JhbCBjb25zdGFudFxudmFyIGcgPSBnbG9iYWwgfHwgd2luZG93O1xuXG5nLlRBQkxFID0gJ3RhYmxlJztcbmcuUkFXID0gJ3Jhdyc7XG5nLlNUQUNLRUQgPSAnc3RhY2tlZCc7XG5nLklOREVYID0gJ2luZGV4JztcblxuZy5YID0gJ3gnO1xuZy5ZID0gJ3knO1xuZy5ST1cgPSAncm93JztcbmcuQ09MID0gJ2NvbCc7XG5nLlNJWkUgPSAnc2l6ZSc7XG5nLlNIQVBFID0gJ3NoYXBlJztcbmcuQ09MT1IgPSAnY29sb3InO1xuZy5BTFBIQSA9ICdhbHBoYSc7XG5nLlRFWFQgPSAndGV4dCc7XG5nLkRFVEFJTCA9ICdkZXRhaWwnO1xuXG5nLk8gPSAxO1xuZy5RID0gMjtcbmcuVCA9IDQ7XG4iLCIvLyBQYWNrYWdlIG9mIGRlZmluaW5nIFZlZ2FsaXRlIFNwZWNpZmljYXRpb24ncyBqc29uIHNjaGVtYVxuXG52YXIgc2NoZW1hID0gbW9kdWxlLmV4cG9ydHMgPSB7fSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcblxuc2NoZW1hLnV0aWwgPSByZXF1aXJlKCcuL3NjaGVtYXV0aWwnKTtcblxuc2NoZW1hLm1hcmt0eXBlID0ge1xuICB0eXBlOiAnc3RyaW5nJyxcbiAgZW51bTogWydwb2ludCcsICd0aWNrJywgJ2JhcicsICdsaW5lJywgJ2FyZWEnLCAnY2lyY2xlJywgJ3NxdWFyZScsICd0ZXh0J11cbn07XG5cbnNjaGVtYS5hZ2dyID0ge1xuICB0eXBlOiAnc3RyaW5nJyxcbiAgZW51bTogWydhdmcnLCAnc3VtJywgJ21pbicsICdtYXgnLCAnY291bnQnXSxcbiAgc3VwcG9ydGVkRW51bXM6IHtcbiAgICBROiBbJ2F2ZycsICdzdW0nLCAnbWluJywgJ21heCcsICdjb3VudCddLFxuICAgIE86IFtdLFxuICAgIFQ6IFsnYXZnJywgJ21pbicsICdtYXgnXSxcbiAgICAnJzogWydjb3VudCddXG4gIH0sXG4gIHN1cHBvcnRlZFR5cGVzOiB7J1EnOiB0cnVlLCAnTyc6IHRydWUsICdUJzogdHJ1ZSwgJyc6IHRydWV9XG59O1xuXG5zY2hlbWEuYmFuZCA9IHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHByb3BlcnRpZXM6IHtcbiAgICBzaXplOiB7XG4gICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICBtaW5pbXVtOiAwXG4gICAgfSxcbiAgICBwYWRkaW5nOiB7XG4gICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICBtaW5pbXVtOiAwLFxuICAgICAgZGVmYXVsdDogMVxuICAgIH1cbiAgfVxufTtcblxuc2NoZW1hLnRpbWVmbnMgPSBbJ21vbnRoJywgJ3llYXInLCAnZGF5b2Z3ZWVrJywgJ2RhdGUnLCAnaG91cicsICdtaW51dGUnLCAnc2Vjb25kJ107XG5cbnNjaGVtYS5mbiA9IHtcbiAgdHlwZTogJ3N0cmluZycsXG4gIGVudW06IHNjaGVtYS50aW1lZm5zLFxuICBzdXBwb3J0ZWRUeXBlczogeydUJzogdHJ1ZX1cbn07XG5cbi8vVE9ETyhrYW5pdHcpOiBhZGQgb3RoZXIgdHlwZSBvZiBmdW5jdGlvbiBoZXJlXG5cbnNjaGVtYS5zY2FsZV90eXBlID0ge1xuICB0eXBlOiAnc3RyaW5nJyxcbiAgZW51bTogWydsaW5lYXInLCAnbG9nJywgJ3BvdycsICdzcXJ0JywgJ3F1YW50aWxlJ10sXG4gIGRlZmF1bHQ6ICdsaW5lYXInLFxuICBzdXBwb3J0ZWRUeXBlczogeydRJzogdHJ1ZX1cbn07XG5cbnNjaGVtYS5maWVsZCA9IHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHByb3BlcnRpZXM6IHtcbiAgICBuYW1lOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgIH1cbiAgfVxufTtcblxudmFyIGNsb25lID0gdXRpbC5kdXBsaWNhdGU7XG52YXIgbWVyZ2UgPSBzY2hlbWEudXRpbC5tZXJnZTtcblxuc2NoZW1hLk1BWEJJTlNfREVGQVVMVCA9IDE1O1xuXG52YXIgYmluID0ge1xuICB0eXBlOiBbJ2Jvb2xlYW4nLCAnb2JqZWN0J10sXG4gIGRlZmF1bHQ6IGZhbHNlLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgbWF4Ymluczoge1xuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgZGVmYXVsdDogc2NoZW1hLk1BWEJJTlNfREVGQVVMVCxcbiAgICAgIG1pbmltdW06IDJcbiAgICB9XG4gIH0sXG4gIHN1cHBvcnRlZFR5cGVzOiB7J1EnOiB0cnVlfSAvLyBUT0RPOiBhZGQgJ08nIGFmdGVyIGZpbmlzaGluZyAjODFcbn1cblxudmFyIHR5cGljYWxGaWVsZCA9IG1lcmdlKGNsb25lKHNjaGVtYS5maWVsZCksIHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHByb3BlcnRpZXM6IHtcbiAgICB0eXBlOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGVudW06IFsnTycsICdRJywgJ1QnXVxuICAgIH0sXG4gICAgYWdncjogc2NoZW1hLmFnZ3IsXG4gICAgZm46IHNjaGVtYS5mbixcbiAgICBiaW46IGJpbixcbiAgICBzY2FsZToge1xuICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIHR5cGU6IHNjaGVtYS5zY2FsZV90eXBlLFxuICAgICAgICByZXZlcnNlOiB7XG4gICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgIHN1cHBvcnRlZFR5cGVzOiB7J1EnOiB0cnVlLCAnTyc6IHRydWUsICdUJzogdHJ1ZX1cbiAgICAgICAgfSxcbiAgICAgICAgemVybzoge1xuICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0luY2x1ZGUgemVybycsXG4gICAgICAgICAgc3VwcG9ydGVkVHlwZXM6IHsnUSc6IHRydWV9XG4gICAgICAgIH0sXG4gICAgICAgIG5pY2U6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICBlbnVtOiBbJ3NlY29uZCcsICdtaW51dGUnLCAnaG91cicsICdkYXknLCAnd2VlaycsICdtb250aCcsICd5ZWFyJ10sXG4gICAgICAgICAgc3VwcG9ydGVkVHlwZXM6IHsnVCc6IHRydWV9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pO1xuXG52YXIgb25seU9yZGluYWxGaWVsZCA9IG1lcmdlKGNsb25lKHNjaGVtYS5maWVsZCksIHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHN1cHBvcnRlZFJvbGU6IHtcbiAgICBkaW1lbnNpb246IHRydWVcbiAgfSxcbiAgcHJvcGVydGllczoge1xuICAgIHR5cGU6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZW51bTogWydPJywnUScsICdUJ10gLy8gb3JkaW5hbC1vbmx5IGZpZWxkIHN1cHBvcnRzIFEgd2hlbiBiaW4gaXMgYXBwbGllZCBhbmQgVCB3aGVuIGZuIGlzIGFwcGxpZWQuXG4gICAgfSxcbiAgICBmbjogc2NoZW1hLmZuLFxuICAgIGJpbjogYmluLFxuICAgIGFnZ3I6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZW51bTogWydjb3VudCddLFxuICAgICAgc3VwcG9ydGVkVHlwZXM6IHsnTyc6IHRydWV9XG4gICAgfVxuICB9XG59KTtcblxudmFyIGF4aXNNaXhpbiA9IHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHN1cHBvcnRlZE1hcmt0eXBlczoge3BvaW50OiB0cnVlLCB0aWNrOiB0cnVlLCBiYXI6IHRydWUsIGxpbmU6IHRydWUsIGFyZWE6IHRydWUsIGNpcmNsZTogdHJ1ZSwgc3F1YXJlOiB0cnVlfSxcbiAgcHJvcGVydGllczoge1xuICAgIGF4aXM6IHtcbiAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgcHJvcGVydGllczoge1xuICAgICAgICBncmlkOiB7XG4gICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQSBmbGFnIGluZGljYXRlIGlmIGdyaWRsaW5lcyBzaG91bGQgYmUgY3JlYXRlZCBpbiBhZGRpdGlvbiB0byB0aWNrcy4nXG4gICAgICAgIH0sXG4gICAgICAgIHRpdGxlOiB7XG4gICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdBIHRpdGxlIGZvciB0aGUgYXhpcy4nXG4gICAgICAgIH0sXG4gICAgICAgIHRpdGxlT2Zmc2V0OiB7XG4gICAgICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgICAgIGRlZmF1bHQ6IHVuZGVmaW5lZCwgIC8vIGF1dG9cbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0EgdGl0bGUgb2Zmc2V0IHZhbHVlIGZvciB0aGUgYXhpcy4nXG4gICAgICAgIH0sXG4gICAgICAgIGZvcm1hdDoge1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgIGRlZmF1bHQ6IHVuZGVmaW5lZCwgIC8vIGF1dG9cbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSBmb3JtYXR0aW5nIHBhdHRlcm4gZm9yIGF4aXMgbGFiZWxzLidcbiAgICAgICAgfSxcbiAgICAgICAgbWF4TGFiZWxMZW5ndGg6IHtcbiAgICAgICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICAgICAgZGVmYXVsdDogNTAsXG4gICAgICAgICAgbWluaW11bTogMCxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1RydW5jYXRlIGxhYmVscyB0aGF0IGFyZSB0b28gbG9uZy4nXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbnZhciBzb3J0TWl4aW4gPSB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgc29ydDoge1xuICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgIGRlZmF1bHQ6IFtdLFxuICAgICAgaXRlbXM6IHtcbiAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgIHN1cHBvcnRlZFR5cGVzOiB7J08nOiB0cnVlfSxcbiAgICAgICAgcmVxdWlyZWQ6IFsnbmFtZScsICdhZ2dyJ10sXG4gICAgICAgIG5hbWU6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICB9LFxuICAgICAgICBhZ2dyOiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgZW51bTogWydhdmcnLCAnc3VtJywgJ21pbicsICdtYXgnLCAnY291bnQnXVxuICAgICAgICB9LFxuICAgICAgICByZXZlcnNlOiB7XG4gICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbnZhciBiYW5kTWl4aW4gPSB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgYmFuZDogc2NoZW1hLmJhbmRcbiAgfVxufTtcblxudmFyIGxlZ2VuZE1peGluID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgcHJvcGVydGllczoge1xuICAgIGxlZ2VuZDoge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH1cbiAgfVxufTtcblxudmFyIHRleHRNaXhpbiA9IHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHN1cHBvcnRlZE1hcmt0eXBlczogeyd0ZXh0JzogdHJ1ZX0sXG4gIHByb3BlcnRpZXM6IHtcbiAgICB0ZXh0OiB7XG4gICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgYWxpZ246IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICBkZWZhdWx0OiAnbGVmdCdcbiAgICAgICAgfSxcbiAgICAgICAgYmFzZWxpbmU6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICBkZWZhdWx0OiAnbWlkZGxlJ1xuICAgICAgICB9LFxuICAgICAgICBtYXJnaW46IHtcbiAgICAgICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICAgICAgZGVmYXVsdDogNCxcbiAgICAgICAgICBtaW5pbXVtOiAwXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGZvbnQ6IHtcbiAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgcHJvcGVydGllczoge1xuICAgICAgICB3ZWlnaHQ6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICBlbnVtOiBbJ25vcm1hbCcsICdib2xkJ10sXG4gICAgICAgICAgZGVmYXVsdDogJ25vcm1hbCdcbiAgICAgICAgfSxcbiAgICAgICAgc2l6ZToge1xuICAgICAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgICAgICBkZWZhdWx0OiAxMCxcbiAgICAgICAgICBtaW5pbXVtOiAwXG4gICAgICAgIH0sXG4gICAgICAgIGZhbWlseToge1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgIGRlZmF1bHQ6ICdIZWx2ZXRpY2EgTmV1ZSdcbiAgICAgICAgfSxcbiAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICBkZWZhdWx0OiAnbm9ybWFsJyxcbiAgICAgICAgICBlbnVtOiBbJ25vcm1hbCcsICdpdGFsaWMnXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG52YXIgc2l6ZU1peGluID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgc3VwcG9ydGVkTWFya3R5cGVzOiB7cG9pbnQ6IHRydWUsIGJhcjogdHJ1ZSwgY2lyY2xlOiB0cnVlLCBzcXVhcmU6IHRydWUsIHRleHQ6IHRydWV9LFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgdmFsdWU6IHtcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgIGRlZmF1bHQ6IDMwLFxuICAgICAgbWluaW11bTogMFxuICAgIH1cbiAgfVxufTtcblxudmFyIGNvbG9yTWl4aW4gPSB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBzdXBwb3J0ZWRNYXJrdHlwZXM6IHtwb2ludDogdHJ1ZSwgdGljazogdHJ1ZSwgYmFyOiB0cnVlLCBsaW5lOiB0cnVlLCBhcmVhOiB0cnVlLCBjaXJjbGU6IHRydWUsIHNxdWFyZTogdHJ1ZSwgJ3RleHQnOiB0cnVlfSxcbiAgcHJvcGVydGllczoge1xuICAgIHZhbHVlOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIHJvbGU6ICdjb2xvcicsXG4gICAgICBkZWZhdWx0OiAnc3RlZWxibHVlJ1xuICAgIH0sXG4gICAgc2NhbGU6IHtcbiAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgcHJvcGVydGllczoge1xuICAgICAgICByYW5nZToge1xuICAgICAgICAgIHR5cGU6IFsnc3RyaW5nJywgJ2FycmF5J11cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxudmFyIGFscGhhTWl4aW4gPSB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBzdXBwb3J0ZWRNYXJrdHlwZXM6IHtwb2ludDogdHJ1ZSwgdGljazogdHJ1ZSwgYmFyOiB0cnVlLCBsaW5lOiB0cnVlLCBhcmVhOiB0cnVlLCBjaXJjbGU6IHRydWUsIHNxdWFyZTogdHJ1ZSwgJ3RleHQnOiB0cnVlfSxcbiAgcHJvcGVydGllczoge1xuICAgIHZhbHVlOiB7XG4gICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgIGRlZmF1bHQ6IHVuZGVmaW5lZCwgIC8vIGF1dG9cbiAgICAgIG1pbmltdW06IDAsXG4gICAgICBtYXhpbXVtOiAxXG4gICAgfVxuICB9XG59O1xuXG52YXIgc2hhcGVNaXhpbiA9IHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHN1cHBvcnRlZE1hcmt0eXBlczoge3BvaW50OiB0cnVlLCBjaXJjbGU6IHRydWUsIHNxdWFyZTogdHJ1ZX0sXG4gIHByb3BlcnRpZXM6IHtcbiAgICB2YWx1ZToge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBlbnVtOiBbJ2NpcmNsZScsICdzcXVhcmUnLCAnY3Jvc3MnLCAnZGlhbW9uZCcsICd0cmlhbmdsZS11cCcsICd0cmlhbmdsZS1kb3duJ10sXG4gICAgICBkZWZhdWx0OiAnY2lyY2xlJ1xuICAgIH1cbiAgfVxufTtcblxudmFyIGRldGFpbE1peGluID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgc3VwcG9ydGVkTWFya3R5cGVzOiB7cG9pbnQ6IHRydWUsIHRpY2s6IHRydWUsIGxpbmU6IHRydWUsIGNpcmNsZTogdHJ1ZSwgc3F1YXJlOiB0cnVlfVxufTtcblxudmFyIHJvd01peGluID0ge1xuICBwcm9wZXJ0aWVzOiB7XG4gICAgaGVpZ2h0OiB7XG4gICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgIG1pbmltdW06IDAsXG4gICAgICBkZWZhdWx0OiAxNTBcbiAgICB9XG4gIH1cbn07XG5cbnZhciBjb2xNaXhpbiA9IHtcbiAgcHJvcGVydGllczoge1xuICAgIHdpZHRoOiB7XG4gICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgIG1pbmltdW06IDAsXG4gICAgICBkZWZhdWx0OiAxNTBcbiAgICB9XG4gIH1cbn07XG5cbnZhciBmYWNldE1peGluID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgc3VwcG9ydGVkTWFya3R5cGVzOiB7cG9pbnQ6IHRydWUsIHRpY2s6IHRydWUsIGJhcjogdHJ1ZSwgbGluZTogdHJ1ZSwgYXJlYTogdHJ1ZSwgY2lyY2xlOiB0cnVlLCBzcXVhcmU6IHRydWUsIHRleHQ6IHRydWV9LFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgcGFkZGluZzoge1xuICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICBtaW5pbXVtOiAwLFxuICAgICAgbWF4aW11bTogMSxcbiAgICAgIGRlZmF1bHQ6IDAuMVxuICAgIH1cbiAgfVxufTtcblxudmFyIHJlcXVpcmVkTmFtZVR5cGUgPSB7XG4gIHJlcXVpcmVkOiBbJ25hbWUnLCAndHlwZSddXG59O1xuXG52YXIgbXVsdGlSb2xlRmllbGQgPSBtZXJnZShjbG9uZSh0eXBpY2FsRmllbGQpLCB7XG4gIHN1cHBvcnRlZFJvbGU6IHtcbiAgICBtZWFzdXJlOiB0cnVlLFxuICAgIGRpbWVuc2lvbjogdHJ1ZVxuICB9XG59KTtcblxudmFyIHF1YW50aXRhdGl2ZUZpZWxkID0gbWVyZ2UoY2xvbmUodHlwaWNhbEZpZWxkKSwge1xuICBzdXBwb3J0ZWRSb2xlOiB7XG4gICAgbWVhc3VyZTogdHJ1ZSxcbiAgICBkaW1lbnNpb246ICdvcmRpbmFsLW9ubHknIC8vIHVzaW5nIGFscGhhIC8gc2l6ZSB0byBlbmNvZGluZyBjYXRlZ29yeSBsZWFkIHRvIG9yZGVyIGludGVycHJldGF0aW9uXG4gIH1cbn0pO1xuXG52YXIgb25seVF1YW50aXRhdGl2ZUZpZWxkID0gbWVyZ2UoY2xvbmUodHlwaWNhbEZpZWxkKSwge1xuICBzdXBwb3J0ZWRSb2xlOiB7XG4gICAgbWVhc3VyZTogdHJ1ZVxuICB9XG59KTtcblxudmFyIHggPSBtZXJnZShjbG9uZShtdWx0aVJvbGVGaWVsZCksIGF4aXNNaXhpbiwgYmFuZE1peGluLCByZXF1aXJlZE5hbWVUeXBlLCBzb3J0TWl4aW4pO1xudmFyIHkgPSBjbG9uZSh4KTtcblxudmFyIGZhY2V0ID0gbWVyZ2UoY2xvbmUob25seU9yZGluYWxGaWVsZCksIHJlcXVpcmVkTmFtZVR5cGUsIGZhY2V0TWl4aW4sIHNvcnRNaXhpbik7XG52YXIgcm93ID0gbWVyZ2UoY2xvbmUoZmFjZXQpLCBheGlzTWl4aW4sIHJvd01peGluKTtcbnZhciBjb2wgPSBtZXJnZShjbG9uZShmYWNldCksIGF4aXNNaXhpbiwgY29sTWl4aW4pO1xuXG52YXIgc2l6ZSA9IG1lcmdlKGNsb25lKHF1YW50aXRhdGl2ZUZpZWxkKSwgbGVnZW5kTWl4aW4sIHNpemVNaXhpbiwgc29ydE1peGluKTtcbnZhciBjb2xvciA9IG1lcmdlKGNsb25lKG11bHRpUm9sZUZpZWxkKSwgbGVnZW5kTWl4aW4sIGNvbG9yTWl4aW4sIHNvcnRNaXhpbik7XG52YXIgYWxwaGEgPSBtZXJnZShjbG9uZShxdWFudGl0YXRpdmVGaWVsZCksIGFscGhhTWl4aW4sIHNvcnRNaXhpbik7XG52YXIgc2hhcGUgPSBtZXJnZShjbG9uZShvbmx5T3JkaW5hbEZpZWxkKSwgbGVnZW5kTWl4aW4sIHNoYXBlTWl4aW4sIHNvcnRNaXhpbik7XG52YXIgZGV0YWlsID0gbWVyZ2UoY2xvbmUob25seU9yZGluYWxGaWVsZCksIGRldGFpbE1peGluLCBzb3J0TWl4aW4pO1xuXG4vLyB3ZSBvbmx5IHB1dCBhZ2dyZWdhdGVkIG1lYXN1cmUgaW4gcGl2b3QgdGFibGVcbnZhciB0ZXh0ID0gbWVyZ2UoY2xvbmUob25seVF1YW50aXRhdGl2ZUZpZWxkKSwgdGV4dE1peGluLCBzb3J0TWl4aW4pO1xuXG4vLyBUT0RPIGFkZCBsYWJlbFxuXG52YXIgZmlsdGVyID0ge1xuICB0eXBlOiAnYXJyYXknLFxuICBpdGVtczoge1xuICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIG9wZXJhbmRzOiB7XG4gICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgdHlwZTogWydzdHJpbmcnLCAnYm9vbGVhbicsICdpbnRlZ2VyJywgJ251bWJlciddXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvcGVyYXRvcjoge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZW51bTogWyc+JywgJz49JywgJz0nLCAnIT0nLCAnPCcsICc8PScsICdub3ROdWxsJ11cbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbnZhciBjZmcgPSB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgLy8gdGVtcGxhdGVcbiAgICB3aWR0aDoge1xuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgZGVmYXVsdDogdW5kZWZpbmVkXG4gICAgfSxcbiAgICBoZWlnaHQ6IHtcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgIGRlZmF1bHQ6IHVuZGVmaW5lZFxuICAgIH0sXG4gICAgdmlld3BvcnQ6IHtcbiAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICBpdGVtczoge1xuICAgICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIH0sXG4gICAgICBkZWZhdWx0OiB1bmRlZmluZWRcbiAgICB9LFxuXG4gICAgLy8gc2luZ2xlIHBsb3RcbiAgICBzaW5nbGVIZWlnaHQ6IHtcbiAgICAgIC8vIHdpbGwgYmUgb3ZlcndyaXR0ZW4gYnkgYmFuZFdpZHRoICogKGNhcmRpbmFsaXR5ICsgcGFkZGluZylcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgIGRlZmF1bHQ6IDIwMCxcbiAgICAgIG1pbmltdW06IDBcbiAgICB9LFxuICAgIHNpbmdsZVdpZHRoOiB7XG4gICAgICAvLyB3aWxsIGJlIG92ZXJ3cml0dGVuIGJ5IGJhbmRXaWR0aCAqIChjYXJkaW5hbGl0eSArIHBhZGRpbmcpXG4gICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICBkZWZhdWx0OiAyMDAsXG4gICAgICBtaW5pbXVtOiAwXG4gICAgfSxcbiAgICAvLyBiYW5kIHNpemVcbiAgICBsYXJnZUJhbmRTaXplOiB7XG4gICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICBkZWZhdWx0OiAxOSxcbiAgICAgIG1pbmltdW06IDBcbiAgICB9LFxuICAgIHNtYWxsQmFuZFNpemU6IHtcbiAgICAgIC8vc21hbGwgbXVsdGlwbGVzIG9yIHNpbmdsZSBwbG90IHdpdGggaGlnaCBjYXJkaW5hbGl0eVxuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgZGVmYXVsdDogMTIsXG4gICAgICBtaW5pbXVtOiAwXG4gICAgfSxcbiAgICBsYXJnZUJhbmRNYXhDYXJkaW5hbGl0eToge1xuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgZGVmYXVsdDogMTBcbiAgICB9LFxuICAgIC8vIHNtYWxsIG11bHRpcGxlc1xuICAgIGNlbGxQYWRkaW5nOiB7XG4gICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgIGRlZmF1bHQ6IDAuMVxuICAgIH0sXG4gICAgY2VsbEJhY2tncm91bmRDb2xvcjoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICByb2xlOiAnY29sb3InLFxuICAgICAgZGVmYXVsdDogJyNmZGZkZmQnXG4gICAgfSxcbiAgICB0ZXh0Q2VsbFdpZHRoOiB7XG4gICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICBkZWZhdWx0OiA5MCxcbiAgICAgIG1pbmltdW06IDBcbiAgICB9LFxuXG4gICAgLy8gbWFya3NcbiAgICBzdHJva2VXaWR0aDoge1xuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgZGVmYXVsdDogMixcbiAgICAgIG1pbmltdW06IDBcbiAgICB9LFxuXG4gICAgLy8gc2NhbGVzXG4gICAgdGltZVNjYWxlTGFiZWxMZW5ndGg6IHtcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgIGRlZmF1bHQ6IDMsXG4gICAgICBtaW5pbXVtOiAwXG4gICAgfSxcbiAgICAvLyBvdGhlclxuICAgIGNoYXJhY3RlcldpZHRoOiB7XG4gICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICBkZWZhdWx0OiA2XG4gICAgfSxcblxuICAgIC8vIGRhdGEgc291cmNlXG4gICAgZGF0YUZvcm1hdFR5cGU6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZW51bTogWydqc29uJywgJ2NzdiddLFxuICAgICAgZGVmYXVsdDogJ2pzb24nXG4gICAgfSxcbiAgICB1c2VWZWdhU2VydmVyOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIH0sXG4gICAgZGF0YVVybDoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiB1bmRlZmluZWRcbiAgICB9LFxuICAgIHZlZ2FTZXJ2ZXJUYWJsZToge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiB1bmRlZmluZWRcbiAgICB9LFxuICAgIHZlZ2FTZXJ2ZXJVcmw6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMSdcbiAgICB9XG4gIH1cbn07XG5cbi8qKiBAdHlwZSBPYmplY3QgU2NoZW1hIG9mIGEgdmVnYWxpdGUgc3BlY2lmaWNhdGlvbiAqL1xuc2NoZW1hLnNjaGVtYSA9IHtcbiAgJHNjaGVtYTogJ2h0dHA6Ly9qc29uLXNjaGVtYS5vcmcvZHJhZnQtMDQvc2NoZW1hIycsXG4gIGRlc2NyaXB0aW9uOiAnU2NoZW1hIGZvciB2ZWdhbGl0ZSBzcGVjaWZpY2F0aW9uJyxcbiAgdHlwZTogJ29iamVjdCcsXG4gIHJlcXVpcmVkOiBbJ21hcmt0eXBlJywgJ2VuYycsICdjZmcnXSxcbiAgcHJvcGVydGllczoge1xuICAgIG1hcmt0eXBlOiBzY2hlbWEubWFya3R5cGUsXG4gICAgZW5jOiB7XG4gICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgeDogeCxcbiAgICAgICAgeTogeSxcbiAgICAgICAgcm93OiByb3csXG4gICAgICAgIGNvbDogY29sLFxuICAgICAgICBzaXplOiBzaXplLFxuICAgICAgICBjb2xvcjogY29sb3IsXG4gICAgICAgIGFscGhhOiBhbHBoYSxcbiAgICAgICAgc2hhcGU6IHNoYXBlLFxuICAgICAgICB0ZXh0OiB0ZXh0LFxuICAgICAgICBkZXRhaWw6IGRldGFpbFxuICAgICAgfVxuICAgIH0sXG4gICAgZmlsdGVyOiBmaWx0ZXIsXG4gICAgY2ZnOiBjZmdcbiAgfVxufTtcblxuc2NoZW1hLmVuY1R5cGVzID0gdXRpbC5rZXlzKHNjaGVtYS5zY2hlbWEucHJvcGVydGllcy5lbmMucHJvcGVydGllcyk7XG5cbi8qKiBJbnN0YW50aWF0ZSBhIHZlcmJvc2Ugdmwgc3BlYyBmcm9tIHRoZSBzY2hlbWEgKi9cbnNjaGVtYS5pbnN0YW50aWF0ZSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gc2NoZW1hLnV0aWwuaW5zdGFudGlhdGUoc2NoZW1hLnNjaGVtYSk7XG59O1xuIiwidmFyIHV0aWwgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG52YXIgaXNFbXB0eSA9IGZ1bmN0aW9uKG9iaikge1xuICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5sZW5ndGggPT09IDA7XG59O1xuXG51dGlsLmV4dGVuZCA9IGZ1bmN0aW9uKGluc3RhbmNlLCBzY2hlbWEpIHtcbiAgcmV0dXJuIHV0aWwubWVyZ2UodXRpbC5pbnN0YW50aWF0ZShzY2hlbWEpLCBpbnN0YW5jZSk7XG59O1xuXG4vLyBpbnN0YW50aWF0ZSBhIHNjaGVtYVxudXRpbC5pbnN0YW50aWF0ZSA9IGZ1bmN0aW9uKHNjaGVtYSkge1xuICBpZiAoc2NoZW1hLnR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgdmFyIGluc3RhbmNlID0ge307XG4gICAgZm9yICh2YXIgbmFtZSBpbiBzY2hlbWEucHJvcGVydGllcykge1xuICAgICAgdmFyIHZhbCA9IHV0aWwuaW5zdGFudGlhdGUoc2NoZW1hLnByb3BlcnRpZXNbbmFtZV0pO1xuICAgICAgaWYgKHZhbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGluc3RhbmNlW25hbWVdID0gdmFsO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH0gZWxzZSBpZiAoJ2RlZmF1bHQnIGluIHNjaGVtYSkge1xuICAgIHJldHVybiBzY2hlbWEuZGVmYXVsdDtcbiAgfSBlbHNlIGlmIChzY2hlbWEudHlwZSA9PT0gJ2FycmF5Jykge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufTtcblxuLy8gcmVtb3ZlIGFsbCBkZWZhdWx0cyBmcm9tIGFuIGluc3RhbmNlXG51dGlsLnN1YnRyYWN0ID0gZnVuY3Rpb24oaW5zdGFuY2UsIGRlZmF1bHRzKSB7XG4gIHZhciBjaGFuZ2VzID0ge307XG4gIGZvciAodmFyIHByb3AgaW4gaW5zdGFuY2UpIHtcbiAgICB2YXIgZGVmID0gZGVmYXVsdHNbcHJvcF07XG4gICAgdmFyIGlucyA9IGluc3RhbmNlW3Byb3BdO1xuICAgIC8vIE5vdGU6IGRvZXMgbm90IHByb3Blcmx5IHN1YnRyYWN0IGFycmF5c1xuICAgIGlmICghZGVmYXVsdHMgfHwgZGVmICE9PSBpbnMpIHtcbiAgICAgIGlmICh0eXBlb2YgaW5zID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShpbnMpKSB7XG4gICAgICAgIHZhciBjID0gdXRpbC5zdWJ0cmFjdChpbnMsIGRlZik7XG4gICAgICAgIGlmICghaXNFbXB0eShjKSlcbiAgICAgICAgICBjaGFuZ2VzW3Byb3BdID0gYztcbiAgICAgIH0gZWxzZSBpZiAoIUFycmF5LmlzQXJyYXkoaW5zKSB8fCBpbnMubGVuZ3RoID4gMCkge1xuICAgICAgICBjaGFuZ2VzW3Byb3BdID0gaW5zO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gY2hhbmdlcztcbn07XG5cbnV0aWwubWVyZ2UgPSBmdW5jdGlvbigvKmRlc3QqLCBzcmMwLCBzcmMxLCAuLi4qLyl7XG4gIHZhciBkZXN0ID0gYXJndW1lbnRzWzBdO1xuICBmb3IgKHZhciBpPTEgOyBpPGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIGRlc3QgPSBtZXJnZShkZXN0LCBhcmd1bWVudHNbaV0pO1xuICB9XG4gIHJldHVybiBkZXN0O1xufTtcblxuLy8gcmVjdXJzaXZlbHkgbWVyZ2VzIHNyYyBpbnRvIGRlc3Rcbm1lcmdlID0gZnVuY3Rpb24oZGVzdCwgc3JjKSB7XG4gIGlmICh0eXBlb2Ygc3JjICE9PSAnb2JqZWN0JyB8fCBzcmMgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZGVzdDtcbiAgfVxuXG4gIGZvciAodmFyIHAgaW4gc3JjKSB7XG4gICAgaWYgKCFzcmMuaGFzT3duUHJvcGVydHkocCkpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAoc3JjW3BdID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHNyY1twXSAhPT0gJ29iamVjdCcgfHwgc3JjW3BdID09PSBudWxsKSB7XG4gICAgICBkZXN0W3BdID0gc3JjW3BdO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlc3RbcF0gIT09ICdvYmplY3QnIHx8IGRlc3RbcF0gPT09IG51bGwpIHtcbiAgICAgIGRlc3RbcF0gPSBtZXJnZShzcmNbcF0uY29uc3RydWN0b3IgPT09IEFycmF5ID8gW10gOiB7fSwgc3JjW3BdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbWVyZ2UoZGVzdFtwXSwgc3JjW3BdKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlc3Q7XG59OyIsInZhciB1dGlsID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxudXRpbC5rZXlzID0gZnVuY3Rpb24ob2JqKSB7XG4gIHZhciBrID0gW10sIHg7XG4gIGZvciAoeCBpbiBvYmopIGsucHVzaCh4KTtcbiAgcmV0dXJuIGs7XG59O1xuXG51dGlsLnZhbHMgPSBmdW5jdGlvbihvYmopIHtcbiAgdmFyIHYgPSBbXSwgeDtcbiAgZm9yICh4IGluIG9iaikgdi5wdXNoKG9ialt4XSk7XG4gIHJldHVybiB2O1xufTtcblxudXRpbC5yYW5nZSA9IGZ1bmN0aW9uKHN0YXJ0LCBzdG9wLCBzdGVwKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMykge1xuICAgIHN0ZXAgPSAxO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgICAgc3RvcCA9IHN0YXJ0O1xuICAgICAgc3RhcnQgPSAwO1xuICAgIH1cbiAgfVxuICBpZiAoKHN0b3AgLSBzdGFydCkgLyBzdGVwID09IEluZmluaXR5KSB0aHJvdyBuZXcgRXJyb3IoJ2luZmluaXRlIHJhbmdlJyk7XG4gIHZhciByYW5nZSA9IFtdLCBpID0gLTEsIGo7XG4gIGlmIChzdGVwIDwgMCkgd2hpbGUgKChqID0gc3RhcnQgKyBzdGVwICogKytpKSA+IHN0b3ApIHJhbmdlLnB1c2goaik7XG4gIGVsc2Ugd2hpbGUgKChqID0gc3RhcnQgKyBzdGVwICogKytpKSA8IHN0b3ApIHJhbmdlLnB1c2goaik7XG4gIHJldHVybiByYW5nZTtcbn07XG5cbnV0aWwuZmluZCA9IGZ1bmN0aW9uKGxpc3QsIHBhdHRlcm4pIHtcbiAgdmFyIGwgPSBsaXN0LmZpbHRlcihmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHhbcGF0dGVybi5uYW1lXSA9PT0gcGF0dGVybi52YWx1ZTtcbiAgfSk7XG4gIHJldHVybiBsLmxlbmd0aCAmJiBsWzBdIHx8IG51bGw7XG59O1xuXG51dGlsLnVuaXEgPSBmdW5jdGlvbihkYXRhLCBmaWVsZCkge1xuICB2YXIgbWFwID0ge30sIGNvdW50ID0gMCwgaSwgaztcbiAgZm9yIChpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyArK2kpIHtcbiAgICBrID0gZGF0YVtpXVtmaWVsZF07XG4gICAgaWYgKCFtYXBba10pIHtcbiAgICAgIG1hcFtrXSA9IDE7XG4gICAgICBjb3VudCArPSAxO1xuICAgIH1cbiAgfVxuICByZXR1cm4gY291bnQ7XG59O1xuXG52YXIgaXNOdW1iZXIgPSBmdW5jdGlvbihuKSB7XG4gIHJldHVybiAhaXNOYU4ocGFyc2VGbG9hdChuKSkgJiYgaXNGaW5pdGUobik7XG59XG5cbnV0aWwubnVtYmVycyA9IGZ1bmN0aW9uKHZhbHVlcykge1xuICB2YXIgbnVtcyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHZhbHVlcy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChpc051bWJlcih2YWx1ZXNbaV0pKSB7XG4gICAgICBudW1zLnB1c2goK3ZhbHVlc1tpXSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBudW1zO1xufVxuXG51dGlsLm1lZGlhbiA9IGZ1bmN0aW9uKHZhbHVlcykge1xuICB2YWx1ZXMuc29ydChmdW5jdGlvbihhLCBiKSB7cmV0dXJuIGEgLSBiO30pO1xuICB2YXIgaGFsZiA9IE1hdGguZmxvb3IodmFsdWVzLmxlbmd0aC8yKTtcbiAgaWYgKHZhbHVlcy5sZW5ndGggJSAyKSB7XG4gICAgcmV0dXJuIHZhbHVlc1toYWxmXTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gKHZhbHVlc1toYWxmLTFdICsgdmFsdWVzW2hhbGZdKSAvIDIuMDtcbiAgfVxufVxuXG51dGlsLm1lYW4gPSBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgcmV0dXJuIHZhbHVlcy5yZWR1Y2UoZnVuY3Rpb24odiwgcikge3JldHVybiB2ICsgcjt9LCAwKSAvIHZhbHVlcy5sZW5ndGg7XG59XG5cbnV0aWwudmFyaWFuY2UgPSBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgdmFyIGF2ZyA9IHV0aWwubWVhbih2YWx1ZXMpO1xuICB2YXIgZGlmZnMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB2YWx1ZXMubGVuZ3RoOyBpKyspIHtcbiAgICBkaWZmcy5wdXNoKE1hdGgucG93KCh2YWx1ZXNbaV0gLSBhdmcpLCAyKSk7XG4gIH1cbiAgcmV0dXJuIHV0aWwubWVhbihkaWZmcyk7XG59XG5cbnV0aWwuc3RkZXYgPSBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgcmV0dXJuIE1hdGguc3FydCh1dGlsLnZhcmlhbmNlKHZhbHVlcykpO1xufVxuXG51dGlsLnNrZXcgPSBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgdmFyIGF2ZyA9IHV0aWwubWVhbih2YWx1ZXMpLFxuICAgIG1lZCA9IHV0aWwubWVkaWFuKHZhbHVlcyksXG4gICAgc3RkID0gdXRpbC5zdGRldih2YWx1ZXMpO1xuICByZXR1cm4gMS4wICogKGF2ZyAtIG1lZCkgLyBzdGQ7XG59XG5cbnV0aWwubWlubWF4ID0gZnVuY3Rpb24oZGF0YSwgZmllbGQsIGV4Y2x1ZGVOdWxscykge1xuICB2YXIgZXhjbHVkZU51bGxzID0gZXhjbHVkZU51bGxzID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IGV4Y2x1ZGVOdWxscztcbiAgdmFyIHN0YXRzID0ge21pbjogK0luZmluaXR5LCBtYXg6IC1JbmZpbml0eX07XG4gIGZvciAoaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIHYgPSBkYXRhW2ldW2ZpZWxkXTtcbiAgICBpZiAoZXhjbHVkZU51bGxzICYmIHYgPT09IG51bGwpXG4gICAgICBjb250aW51ZTtcbiAgICBpZiAodiA+IHN0YXRzLm1heCkgc3RhdHMubWF4ID0gdjtcbiAgICBpZiAodiA8IHN0YXRzLm1pbikgc3RhdHMubWluID0gdjtcbiAgfVxuICByZXR1cm4gc3RhdHM7XG59O1xuXG51dGlsLmR1cGxpY2F0ZSA9IGZ1bmN0aW9uKG9iaikge1xuICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvYmopKTtcbn07XG5cbnV0aWwuYW55ID0gZnVuY3Rpb24oYXJyLCBmKSB7XG4gIHZhciBpID0gMCwgaztcbiAgZm9yIChrIGluIGFycikge1xuICAgIGlmIChmKGFycltrXSwgaywgaSsrKSkgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxudXRpbC5hbGwgPSBmdW5jdGlvbihhcnIsIGYpIHtcbiAgdmFyIGkgPSAwLCBrO1xuICBmb3IgKGsgaW4gYXJyKSB7XG4gICAgaWYgKCFmKGFycltrXSwgaywgaSsrKSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufTtcblxudmFyIG1lcmdlID0gZnVuY3Rpb24oZGVzdCwgc3JjKSB7XG4gIHJldHVybiB1dGlsLmtleXMoc3JjKS5yZWR1Y2UoZnVuY3Rpb24oYywgaykge1xuICAgIGNba10gPSBzcmNba107XG4gICAgcmV0dXJuIGM7XG4gIH0sIGRlc3QpO1xufTtcblxudXRpbC5tZXJnZSA9IGZ1bmN0aW9uKC8qZGVzdCosIHNyYzAsIHNyYzEsIC4uLiovKXtcbiAgdmFyIGRlc3QgPSBhcmd1bWVudHNbMF07XG4gIGZvciAodmFyIGk9MSA7IGk8YXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgZGVzdCA9IG1lcmdlKGRlc3QsIGFyZ3VtZW50c1tpXSk7XG4gIH1cbiAgcmV0dXJuIGRlc3Q7XG59O1xuXG51dGlsLmdldGJpbnMgPSBmdW5jdGlvbihzdGF0cywgbWF4Ymlucykge1xuICByZXR1cm4gdmcuYmlucyh7XG4gICAgbWluOiBzdGF0cy5taW4sXG4gICAgbWF4OiBzdGF0cy5tYXgsXG4gICAgbWF4YmluczogbWF4Ymluc1xuICB9KTtcbn07XG5cbi8qKlxuICogeFtwWzBdXS4uLltwW25dXSA9IHZhbFxuICogQHBhcmFtIG5vYXVnbWVudCBkZXRlcm1pbmUgd2hldGhlciBuZXcgb2JqZWN0IHNob3VsZCBiZSBhZGRlZCBmXG4gKiBvciBub24tZXhpc3RpbmcgcHJvcGVydGllcyBhbG9uZyB0aGUgcGF0aFxuICovXG51dGlsLnNldHRlciA9IGZ1bmN0aW9uKHgsIHAsIHZhbCwgbm9hdWdtZW50KSB7XG4gIGZvciAodmFyIGk9MDsgaTxwLmxlbmd0aC0xOyArK2kpIHtcbiAgICBpZiAoIW5vYXVnbWVudCAmJiAhKHBbaV0gaW4geCkpe1xuICAgICAgeCA9IHhbcFtpXV0gPSB7fTtcbiAgICB9IGVsc2Uge1xuICAgICAgeCA9IHhbcFtpXV07XG4gICAgfVxuICB9XG4gIHhbcFtpXV0gPSB2YWw7XG59O1xuXG5cbi8qKlxuICogcmV0dXJucyB4W3BbMF1dLi4uW3Bbbl1dXG4gKiBAcGFyYW0gYXVnbWVudCBkZXRlcm1pbmUgd2hldGhlciBuZXcgb2JqZWN0IHNob3VsZCBiZSBhZGRlZCBmXG4gKiBvciBub24tZXhpc3RpbmcgcHJvcGVydGllcyBhbG9uZyB0aGUgcGF0aFxuICovXG51dGlsLmdldHRlciA9IGZ1bmN0aW9uKHgsIHAsIG5vYXVnbWVudCkge1xuICBmb3IgKHZhciBpPTA7IGk8cC5sZW5ndGg7ICsraSkge1xuICAgIGlmICghbm9hdWdtZW50ICYmICEocFtpXSBpbiB4KSl7XG4gICAgICB4ID0geFtwW2ldXSA9IHt9O1xuICAgIH0gZWxzZSB7XG4gICAgICB4ID0geFtwW2ldXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHg7XG59O1xuXG51dGlsLnRydW5jYXRlID0gZnVuY3Rpb24ocywgbGVuZ3RoLCBwb3MsIHdvcmQsIGVsbGlwc2lzKSB7XG4gIHZhciBsZW4gPSBzLmxlbmd0aDtcbiAgaWYgKGxlbiA8PSBsZW5ndGgpIHJldHVybiBzO1xuICBlbGxpcHNpcyA9IGVsbGlwc2lzIHx8IFwiLi4uXCI7XG4gIHZhciBsID0gTWF0aC5tYXgoMCwgbGVuZ3RoIC0gZWxsaXBzaXMubGVuZ3RoKTtcblxuICBzd2l0Y2ggKHBvcykge1xuICAgIGNhc2UgXCJsZWZ0XCI6XG4gICAgICByZXR1cm4gZWxsaXBzaXMgKyAod29yZCA/IHZnX3RydW5jYXRlT25Xb3JkKHMsbCwxKSA6IHMuc2xpY2UobGVuLWwpKTtcbiAgICBjYXNlIFwibWlkZGxlXCI6XG4gICAgY2FzZSBcImNlbnRlclwiOlxuICAgICAgdmFyIGwxID0gTWF0aC5jZWlsKGwvMiksIGwyID0gTWF0aC5mbG9vcihsLzIpO1xuICAgICAgcmV0dXJuICh3b3JkID8gdmdfdHJ1bmNhdGVPbldvcmQocyxsMSkgOiBzLnNsaWNlKDAsbDEpKSArIGVsbGlwc2lzICtcbiAgICAgICAgKHdvcmQgPyB2Z190cnVuY2F0ZU9uV29yZChzLGwyLDEpIDogcy5zbGljZShsZW4tbDIpKTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuICh3b3JkID8gdmdfdHJ1bmNhdGVPbldvcmQocyxsKSA6IHMuc2xpY2UoMCxsKSkgKyBlbGxpcHNpcztcbiAgfVxufTtcblxudXRpbC5lcnJvciA9IGZ1bmN0aW9uKG1zZykge1xuICBjb25zb2xlLmVycm9yKCdbVkwgRXJyb3JdJywgbXNnKTtcbn07XG5cbiJdfQ==
