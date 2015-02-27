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
    return vlfield.cardinality(this._enc[encType], stats, true);
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
        var field = 'd.data.' + operands[j];
        condition += '(' +
          '(!!' + field + ' && ' + field + ' != "null")' +
          ' || ' + field + ' === 0 ' +
          ')';
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

    stat.count = data.length;
    stats[k] = stat;

    var sample = {};
    for (; Object.keys(sample).length < Math.min(stat.cardinality, 10); i++) {
      var value = data[Math.floor(Math.random() * data.length)][k];
      sample[value] = true;
    }
    stats[k].sample = Object.keys(sample);
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
vlfield.cardinality = function(field, stats, useTypeCode) {
  var isType = getIsType(useTypeCode);

  if (field.bin) {
    var bins = util.getbins(stats[field.name], field.maxbins);
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

var binningMixin = {
  type: 'object',
  properties: {
    bin: {
      type: ['boolean', 'object'],
      default: false,
      properties: {
        maxbins: {
          type: 'integer',
          default: 15,
          minimum: 2
        }
      },
      supportedTypes: {'Q': true} // TODO: add 'O' after finishing #81
    }
  }
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
}, binningMixin);

var onlyOrdinalField = merge(clone(schema.field), {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['O','Q', 'T'] // ordinal-only field supports Q when bin is applied and T when fn is applied.
    },
    fn: schema.fn,
    aggr: {
      type: 'string',
      enum: ['count'],
      supportedTypes: {'O': true}
    }
  }
}, binningMixin);

var axisMixin = {
  type: 'object',
  supportedMarktypes: {'point': true, 'bar': true, 'line': true, 'area': true, 'circle': true, 'square': true},
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
  supportedMarktypes: {'point': true, 'bar': true, 'circle': true, 'square': true, 'text': true},
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
  supportedMarktypes: {'point': true, 'bar': true, 'line': true, 'area': true, 'circle': true, 'square': true, 'text': true},
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
  supportedMarktypes: {'point': true, 'bar': true, 'line': true, 'area': true, 'circle': true, 'square': true, 'text': true},
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
  supportedMarktypes: {'point': true, 'circle': true, 'square': true},
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
  supportedMarktypes: {'point': true, 'line': true, 'circle': true, 'square': true}
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
  supportedMarktypes: {'point': true, 'bar': true, 'line': true, 'area': true, 'circle': true, 'square': true, 'text': true},
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

var x = merge(clone(typicalField), axisMixin, bandMixin, requiredNameType, sortMixin);
var y = clone(x);

var facet = merge(clone(onlyOrdinalField), requiredNameType, facetMixin, sortMixin);
var row = merge(clone(facet), axisMixin, rowMixin);
var col = merge(clone(facet), axisMixin, colMixin);

var size = merge(clone(typicalField), legendMixin, sizeMixin, sortMixin);
var color = merge(clone(typicalField), legendMixin, colorMixin, sortMixin);
var alpha = merge(clone(typicalField), alphaMixin, sortMixin);
var shape = merge(clone(onlyOrdinalField), legendMixin, shapeMixin, sortMixin);
var detail = merge(clone(onlyOrdinalField), detailMixin, sortMixin);

var text = merge(clone(typicalField), textMixin, sortMixin);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvdmwiLCJzcmMvRW5jb2RpbmcuanMiLCJzcmMvY29tcGlsZS9hZ2dyZWdhdGVzLmpzIiwic3JjL2NvbXBpbGUvYXhpcy5qcyIsInNyYy9jb21waWxlL2Jpbm5pbmcuanMiLCJzcmMvY29tcGlsZS9jb21waWxlLmpzIiwic3JjL2NvbXBpbGUvZmFjZXRpbmcuanMiLCJzcmMvY29tcGlsZS9maWx0ZXIuanMiLCJzcmMvY29tcGlsZS9ncm91cC5qcyIsInNyYy9jb21waWxlL2xheW91dC5qcyIsInNyYy9jb21waWxlL2xlZ2VuZC5qcyIsInNyYy9jb21waWxlL21hcmtzLmpzIiwic3JjL2NvbXBpbGUvc2NhbGUuanMiLCJzcmMvY29tcGlsZS9zb3J0LmpzIiwic3JjL2NvbXBpbGUvc3RhY2tpbmcuanMiLCJzcmMvY29tcGlsZS9zdHlsZS5qcyIsInNyYy9jb21waWxlL3N1YmZhY2V0aW5nLmpzIiwic3JjL2NvbXBpbGUvdGVtcGxhdGUuanMiLCJzcmMvY29tcGlsZS90aW1lLmpzIiwic3JjL2NvbnN0cy5qcyIsInNyYy9kYXRhLmpzIiwic3JjL2VuYy5qcyIsInNyYy9maWVsZC5qcyIsInNyYy9nbG9iYWxzLmpzIiwic3JjL3NjaGVtYS9zY2hlbWEuanMiLCJzcmMvc2NoZW1hL3NjaGVtYXV0aWwuanMiLCJzcmMvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwWUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN0S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi9nbG9iYWxzJyksXG4gICAgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpLFxuICAgIGNvbnN0cyA9IHJlcXVpcmUoJy4vY29uc3RzJyk7XG5cbnZhciB2bCA9IHV0aWwubWVyZ2UoY29uc3RzLCB1dGlsKTtcblxudmwuRW5jb2RpbmcgPSByZXF1aXJlKCcuL0VuY29kaW5nJyk7XG52bC5jb21waWxlID0gcmVxdWlyZSgnLi9jb21waWxlL2NvbXBpbGUnKTtcbnZsLmRhdGEgPSByZXF1aXJlKCcuL2RhdGEnKTtcbnZsLmZpZWxkID0gcmVxdWlyZSgnLi9maWVsZCcpO1xudmwuZW5jID0gcmVxdWlyZSgnLi9lbmMnKTtcbnZsLnNjaGVtYSA9IHJlcXVpcmUoJy4vc2NoZW1hL3NjaGVtYScpO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gdmw7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBnbG9iYWwgPSByZXF1aXJlKCcuL2dsb2JhbHMnKSxcbiAgY29uc3RzID0gcmVxdWlyZSgnLi9jb25zdHMnKSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpLFxuICB2bGZpZWxkID0gcmVxdWlyZSgnLi9maWVsZCcpLFxuICB2bGVuYyA9IHJlcXVpcmUoJy4vZW5jJyksXG4gIHNjaGVtYSA9IHJlcXVpcmUoJy4vc2NoZW1hL3NjaGVtYScpLFxuICB0aW1lID0gcmVxdWlyZSgnLi9jb21waWxlL3RpbWUnKTtcblxudmFyIEVuY29kaW5nID0gbW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG5cbiAgZnVuY3Rpb24gRW5jb2RpbmcobWFya3R5cGUsIGVuYywgY29uZmlnLCBmaWx0ZXIsIHRoZW1lKSB7XG4gICAgdmFyIGRlZmF1bHRzID0gc2NoZW1hLmluc3RhbnRpYXRlKCk7XG5cbiAgICB2YXIgc3BlYyA9IHtcbiAgICAgIG1hcmt0eXBlOiBtYXJrdHlwZSxcbiAgICAgIGVuYzogZW5jLFxuICAgICAgY2ZnOiBjb25maWcsXG4gICAgICBmaWx0ZXI6IGZpbHRlciB8fCBbXVxuICAgIH07XG5cbiAgICAvLyB0eXBlIHRvIGJpdGNvZGVcbiAgICBmb3IgKHZhciBlIGluIGRlZmF1bHRzLmVuYykge1xuICAgICAgZGVmYXVsdHMuZW5jW2VdLnR5cGUgPSBjb25zdHMuZGF0YVR5cGVzW2RlZmF1bHRzLmVuY1tlXS50eXBlXTtcbiAgICB9XG5cbiAgICB2YXIgc3BlY0V4dGVuZGVkID0gc2NoZW1hLnV0aWwubWVyZ2UoZGVmYXVsdHMsIHRoZW1lIHx8IHt9LCBzcGVjKSA7XG5cbiAgICB0aGlzLl9tYXJrdHlwZSA9IHNwZWNFeHRlbmRlZC5tYXJrdHlwZTtcbiAgICB0aGlzLl9lbmMgPSBzcGVjRXh0ZW5kZWQuZW5jO1xuICAgIHRoaXMuX2NmZyA9IHNwZWNFeHRlbmRlZC5jZmc7XG4gICAgdGhpcy5fZmlsdGVyID0gc3BlY0V4dGVuZGVkLmZpbHRlcjtcbiAgfVxuXG4gIHZhciBwcm90byA9IEVuY29kaW5nLnByb3RvdHlwZTtcblxuICBwcm90by5tYXJrdHlwZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9tYXJrdHlwZTtcbiAgfTtcblxuICBwcm90by5pcyA9IGZ1bmN0aW9uKG0pIHtcbiAgICByZXR1cm4gdGhpcy5fbWFya3R5cGUgPT09IG07XG4gIH07XG5cbiAgcHJvdG8uaGFzID0gZnVuY3Rpb24oZW5jVHlwZSkge1xuICAgIC8vIGVxdWl2YWxlbnQgdG8gY2FsbGluZyB2bGVuYy5oYXModGhpcy5fZW5jLCBlbmNUeXBlKVxuICAgIHJldHVybiB0aGlzLl9lbmNbZW5jVHlwZV0ubmFtZSAhPT0gdW5kZWZpbmVkO1xuICB9O1xuXG4gIHByb3RvLmVuYyA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW5jW3hdO1xuICB9O1xuXG4gIHByb3RvLmZpbHRlciA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9maWx0ZXI7XG4gIH07XG5cbiAgLy8gZ2V0IFwiZmllbGRcIiBwcm9wZXJ0eSBmb3IgdmVnYVxuICBwcm90by5maWVsZCA9IGZ1bmN0aW9uKHgsIG5vZGF0YSwgbm9mbikge1xuICAgIGlmICghdGhpcy5oYXMoeCkpIHJldHVybiBudWxsO1xuXG4gICAgdmFyIGYgPSAobm9kYXRhID8gJycgOiAnZGF0YS4nKTtcblxuICAgIGlmICh0aGlzLl9lbmNbeF0uYWdnciA9PT0gJ2NvdW50Jykge1xuICAgICAgcmV0dXJuIGYgKyAnY291bnQnO1xuICAgIH0gZWxzZSBpZiAoIW5vZm4gJiYgdGhpcy5fZW5jW3hdLmJpbikge1xuICAgICAgcmV0dXJuIGYgKyAnYmluXycgKyB0aGlzLl9lbmNbeF0ubmFtZTtcbiAgICB9IGVsc2UgaWYgKCFub2ZuICYmIHRoaXMuX2VuY1t4XS5hZ2dyKSB7XG4gICAgICByZXR1cm4gZiArIHRoaXMuX2VuY1t4XS5hZ2dyICsgJ18nICsgdGhpcy5fZW5jW3hdLm5hbWU7XG4gICAgfSBlbHNlIGlmICghbm9mbiAmJiB0aGlzLl9lbmNbeF0uZm4pIHtcbiAgICAgIHJldHVybiBmICsgdGhpcy5fZW5jW3hdLmZuICsgJ18nICsgdGhpcy5fZW5jW3hdLm5hbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmICsgdGhpcy5fZW5jW3hdLm5hbWU7XG4gICAgfVxuICB9O1xuXG4gIHByb3RvLmZpZWxkTmFtZSA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW5jW3hdLm5hbWU7XG4gIH07XG5cbiAgcHJvdG8uZmllbGRUaXRsZSA9IGZ1bmN0aW9uKHgpIHtcbiAgICBpZiAodmxmaWVsZC5pc0NvdW50KHRoaXMuX2VuY1t4XSkpIHtcbiAgICAgIHJldHVybiB2bGZpZWxkLmNvdW50LmRpc3BsYXlOYW1lO1xuICAgIH1cbiAgICB2YXIgZm4gPSB0aGlzLl9lbmNbeF0uYWdnciB8fCB0aGlzLl9lbmNbeF0uZm4gfHwgKHRoaXMuX2VuY1t4XS5iaW4gJiYgXCJiaW5cIik7XG4gICAgaWYgKGZuKSB7XG4gICAgICByZXR1cm4gZm4udG9VcHBlckNhc2UoKSArICcoJyArIHRoaXMuX2VuY1t4XS5uYW1lICsgJyknO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fZW5jW3hdLm5hbWU7XG4gICAgfVxuICB9O1xuXG4gIHByb3RvLnNjYWxlID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB0aGlzLl9lbmNbeF0uc2NhbGUgfHwge307XG4gIH07XG5cbiAgcHJvdG8uYXhpcyA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW5jW3hdLmF4aXMgfHwge307XG4gIH07XG5cbiAgcHJvdG8uYmFuZCA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW5jW3hdLmJhbmQgfHwge307XG4gIH07XG5cbiAgcHJvdG8uYmFuZFNpemUgPSBmdW5jdGlvbihlbmNUeXBlLCB1c2VTbWFsbEJhbmQpIHtcbiAgICB1c2VTbWFsbEJhbmQgPSB1c2VTbWFsbEJhbmQgfHxcbiAgICAgIC8vaXNCYW5kSW5TbWFsbE11bHRpcGxlc1xuICAgICAgKGVuY1R5cGUgPT09IFkgJiYgdGhpcy5oYXMoUk9XKSAmJiB0aGlzLmhhcyhZKSkgfHxcbiAgICAgIChlbmNUeXBlID09PSBYICYmIHRoaXMuaGFzKENPTCkgJiYgdGhpcy5oYXMoWCkpO1xuXG4gICAgLy8gaWYgYmFuZC5zaXplIGlzIGV4cGxpY2l0bHkgc3BlY2lmaWVkLCBmb2xsb3cgdGhlIHNwZWNpZmljYXRpb24sIG90aGVyd2lzZSBkcmF3IHZhbHVlIGZyb20gY29uZmlnLlxuICAgIHJldHVybiB0aGlzLmJhbmQoZW5jVHlwZSkuc2l6ZSB8fFxuICAgICAgdGhpcy5jb25maWcodXNlU21hbGxCYW5kID8gJ3NtYWxsQmFuZFNpemUnIDogJ2xhcmdlQmFuZFNpemUnKTtcbiAgfTtcblxuICBwcm90by5hZ2dyID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB0aGlzLl9lbmNbeF0uYWdncjtcbiAgfTtcblxuICAvLyByZXR1cm5zIGZhbHNlIGlmIGJpbm5pbmcgaXMgZGlzYWJsZWQsIG90aGVyd2lzZSBhbiBvYmplY3Qgd2l0aCBiaW5uaW5nIHByb3BlcnRpZXNcbiAgcHJvdG8uYmluID0gZnVuY3Rpb24oeCkge1xuICAgIHZhciBiaW4gPSB0aGlzLl9lbmNbeF0uYmluO1xuICAgIGlmIChiaW4gPT09IHt9KVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiBiaW47XG4gIH07XG5cbiAgcHJvdG8ubGVnZW5kID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB0aGlzLl9lbmNbeF0ubGVnZW5kO1xuICB9O1xuXG4gIHByb3RvLnZhbHVlID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB0aGlzLl9lbmNbeF0udmFsdWU7XG4gIH07XG5cbiAgcHJvdG8uZm4gPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuY1t4XS5mbjtcbiAgfTtcblxuICAgcHJvdG8uc29ydCA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW5jW3hdLnNvcnQ7XG4gIH07XG5cbiAgcHJvdG8uYW55ID0gZnVuY3Rpb24oZikge1xuICAgIHJldHVybiB1dGlsLmFueSh0aGlzLl9lbmMsIGYpO1xuICB9O1xuXG4gIHByb3RvLmFsbCA9IGZ1bmN0aW9uKGYpIHtcbiAgICByZXR1cm4gdXRpbC5hbGwodGhpcy5fZW5jLCBmKTtcbiAgfTtcblxuICBwcm90by5sZW5ndGggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdXRpbC5rZXlzKHRoaXMuX2VuYykubGVuZ3RoO1xuICB9O1xuXG4gIHByb3RvLm1hcCA9IGZ1bmN0aW9uKGYpIHtcbiAgICByZXR1cm4gdmxlbmMubWFwKHRoaXMuX2VuYywgZik7XG4gIH07XG5cbiAgcHJvdG8ucmVkdWNlID0gZnVuY3Rpb24oZiwgaW5pdCkge1xuICAgIHJldHVybiB2bGVuYy5yZWR1Y2UodGhpcy5fZW5jLCBmLCBpbml0KTtcbiAgfTtcblxuICBwcm90by5mb3JFYWNoID0gZnVuY3Rpb24oZikge1xuICAgIHJldHVybiB2bGVuYy5mb3JFYWNoKHRoaXMuX2VuYywgZik7XG4gIH07XG5cbiAgcHJvdG8udHlwZSA9IGZ1bmN0aW9uKGV0KSB7XG4gICAgcmV0dXJuIHRoaXMuaGFzKGV0KSA/IHRoaXMuX2VuY1tldF0udHlwZSA6IG51bGw7XG4gIH07XG5cbiAgcHJvdG8ucm9sZSA9IGZ1bmN0aW9uKGV0KSB7XG4gICAgcmV0dXJuIHRoaXMuaGFzKGV0KSA/IHZsZmllbGQucm9sZSh0aGlzLl9lbmNbZXRdKSA6IG51bGw7XG4gIH07XG5cbiAgcHJvdG8udGV4dCA9IGZ1bmN0aW9uKHByb3ApIHtcbiAgICB2YXIgdGV4dCA9IHRoaXMuX2VuY1tURVhUXS50ZXh0O1xuICAgIHJldHVybiBwcm9wID8gdGV4dFtwcm9wXSA6IHRleHQ7XG4gIH07XG5cbiAgcHJvdG8uZm9udCA9IGZ1bmN0aW9uKHByb3ApIHtcbiAgICB2YXIgZm9udCA9IHRoaXMuX2VuY1tURVhUXS5mb250O1xuICAgIHJldHVybiBwcm9wID8gZm9udFtwcm9wXSA6IGZvbnQ7XG4gIH07XG5cbiAgcHJvdG8uaXNUeXBlID0gZnVuY3Rpb24oeCwgdHlwZSkge1xuICAgIHZhciBmaWVsZCA9IHRoaXMuZW5jKHgpO1xuICAgIHJldHVybiBmaWVsZCAmJiBFbmNvZGluZy5pc1R5cGUoZmllbGQsIHR5cGUpO1xuICB9O1xuXG4gIEVuY29kaW5nLmlzVHlwZSA9IGZ1bmN0aW9uIChmaWVsZERlZiwgdHlwZSkge1xuICAgIHJldHVybiAoZmllbGREZWYudHlwZSAmIHR5cGUpID4gMDtcbiAgfTtcblxuICBFbmNvZGluZy5pc09yZGluYWxTY2FsZSA9IGZ1bmN0aW9uKGVuY29kaW5nLCBlbmNUeXBlKSB7XG4gICAgcmV0dXJuIHZsZmllbGQuaXNPcmRpbmFsU2NhbGUoZW5jb2RpbmcuZW5jKGVuY1R5cGUpLCB0cnVlKTtcbiAgfTtcblxuICBFbmNvZGluZy5pc0RpbWVuc2lvbiA9IGZ1bmN0aW9uKGVuY29kaW5nLCBlbmNUeXBlKSB7XG4gICAgcmV0dXJuIHZsZmllbGQuaXNEaW1lbnNpb24oZW5jb2RpbmcuZW5jKGVuY1R5cGUpLCB0cnVlKTtcbiAgfTtcblxuICBFbmNvZGluZy5pc01lYXN1cmUgPSBmdW5jdGlvbihlbmNvZGluZywgZW5jVHlwZSkge1xuICAgIHJldHVybiB2bGZpZWxkLmlzTWVhc3VyZShlbmNvZGluZy5lbmMoZW5jVHlwZSksIHRydWUpO1xuICB9O1xuXG4gIHByb3RvLmlzT3JkaW5hbFNjYWxlID0gZnVuY3Rpb24oZW5jVHlwZSkge1xuICAgIHJldHVybiB0aGlzLmhhcyhlbmNUeXBlKSAmJiBFbmNvZGluZy5pc09yZGluYWxTY2FsZSh0aGlzLCBlbmNUeXBlKTtcbiAgfTtcblxuICBwcm90by5pc0RpbWVuc2lvbiA9IGZ1bmN0aW9uKGVuY1R5cGUpIHtcbiAgICByZXR1cm4gdGhpcy5oYXMoZW5jVHlwZSkgJiYgRW5jb2RpbmcuaXNEaW1lbnNpb24odGhpcywgZW5jVHlwZSk7XG4gIH07XG5cbiAgcHJvdG8uaXNNZWFzdXJlID0gZnVuY3Rpb24oZW5jVHlwZSkge1xuICAgIHJldHVybiB0aGlzLmhhcyhlbmNUeXBlKSAmJiBFbmNvZGluZy5pc01lYXN1cmUodGhpcywgZW5jVHlwZSk7XG4gIH07XG5cbiAgcHJvdG8uaXNBZ2dyZWdhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaSA9IDAsIGs7XG4gICAgZm9yIChrIGluIHRoaXMuX2VuYykge1xuICAgICAgaWYgKHRoaXMuaGFzKGspICYmIHRoaXMuYWdncihrKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIEVuY29kaW5nLmlzQWdncmVnYXRlID0gZnVuY3Rpb24oc3BlYykge1xuICAgIHZhciBpID0gMCwgaywgZW5jPSBzcGVjLmVuYztcbiAgICBmb3IgKGsgaW4gZW5jKSB7XG4gICAgICBpZiAoZW5jW2tdICYmIGVuY1trXS5hZ2dyKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgcHJvdG8uY2FyZGluYWxpdHkgPSBmdW5jdGlvbihlbmNUeXBlLCBzdGF0cykge1xuICAgIHJldHVybiB2bGZpZWxkLmNhcmRpbmFsaXR5KHRoaXMuX2VuY1tlbmNUeXBlXSwgc3RhdHMsIHRydWUpO1xuICB9O1xuXG4gIHByb3RvLmlzUmF3ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICF0aGlzLmlzQWdncmVnYXRlKCk7XG4gIH07XG5cbiAgcHJvdG8uY29uZmlnID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLl9jZmdbbmFtZV07XG4gIH07XG5cbiAgcHJvdG8udG9TcGVjID0gZnVuY3Rpb24oZXhjbHVkZUNvbmZpZykge1xuICAgIHZhciBlbmMgPSB1dGlsLmR1cGxpY2F0ZSh0aGlzLl9lbmMpLFxuICAgICAgc3BlYztcblxuICAgIC8vIGNvbnZlcnQgdHlwZSdzIGJpdGNvZGUgdG8gdHlwZSBuYW1lXG4gICAgZm9yICh2YXIgZSBpbiBlbmMpIHtcbiAgICAgIGVuY1tlXS50eXBlID0gY29uc3RzLmRhdGFUeXBlTmFtZXNbZW5jW2VdLnR5cGVdO1xuICAgIH1cblxuICAgIHNwZWMgPSB7XG4gICAgICBtYXJrdHlwZTogdGhpcy5fbWFya3R5cGUsXG4gICAgICBlbmM6IGVuYyxcbiAgICAgIGZpbHRlcjogdGhpcy5fZmlsdGVyXG4gICAgfTtcblxuICAgIGlmICghZXhjbHVkZUNvbmZpZykge1xuICAgICAgc3BlYy5jZmcgPSB1dGlsLmR1cGxpY2F0ZSh0aGlzLl9jZmcpO1xuICAgIH1cblxuICAgIC8vIHJlbW92ZSBkZWZhdWx0c1xuICAgIHZhciBkZWZhdWx0cyA9IHNjaGVtYS5pbnN0YW50aWF0ZSgpO1xuICAgIHJldHVybiBzY2hlbWEudXRpbC5zdWJ0cmFjdChzcGVjLCBkZWZhdWx0cyk7XG4gIH07XG5cbiAgcHJvdG8udG9TaG9ydGhhbmQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZW5jID0gdGhpcy5fZW5jO1xuICAgIHZhciBjID0gY29uc3RzLnNob3J0aGFuZDtcbiAgICByZXR1cm4gJ21hcmsnICsgYy5hc3NpZ24gKyB0aGlzLl9tYXJrdHlwZSArXG4gICAgICBjLmRlbGltICtcbiAgICAgIHZsZW5jLnNob3J0aGFuZCh0aGlzLl9lbmMpO1xuICB9O1xuXG4gIEVuY29kaW5nLnBhcnNlU2hvcnRoYW5kID0gZnVuY3Rpb24oc2hvcnRoYW5kLCBjZmcpIHtcbiAgICB2YXIgYyA9IGNvbnN0cy5zaG9ydGhhbmQsXG4gICAgICAgIHNwbGl0ID0gc2hvcnRoYW5kLnNwbGl0KGMuZGVsaW0sIDEpLFxuICAgICAgICBtYXJrdHlwZSA9IHNwbGl0WzBdLnNwbGl0KGMuYXNzaWduKVsxXS50cmltKCksXG4gICAgICAgIGVuYyA9IHZsZW5jLnBhcnNlU2hvcnRoYW5kKHNwbGl0WzFdLCB0cnVlKTtcblxuICAgIHJldHVybiBuZXcgRW5jb2RpbmcobWFya3R5cGUsIGVuYywgY2ZnKTtcbiAgfTtcblxuICBFbmNvZGluZy5zaG9ydGhhbmRGcm9tU3BlYyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBFbmNvZGluZy5mcm9tU3BlYy5hcHBseShudWxsLCBhcmd1bWVudHMpLnRvU2hvcnRoYW5kKCk7XG4gIH07XG5cbiAgRW5jb2Rpbmcuc3BlY0Zyb21TaG9ydGhhbmQgPSBmdW5jdGlvbihzaG9ydGhhbmQsIGNmZywgZXhjbHVkZUNvbmZpZykge1xuICAgIHJldHVybiBFbmNvZGluZy5wYXJzZVNob3J0aGFuZChzaG9ydGhhbmQsIGNmZykudG9TcGVjKGV4Y2x1ZGVDb25maWcpO1xuICB9O1xuXG4gIEVuY29kaW5nLmZyb21TcGVjID0gZnVuY3Rpb24oc3BlYywgdGhlbWUsIGV4dHJhQ2ZnKSB7XG4gICAgdmFyIGVuYyA9IHV0aWwuZHVwbGljYXRlKHNwZWMuZW5jKTtcblxuICAgIC8vY29udmVydCB0eXBlIGZyb20gc3RyaW5nIHRvIGJpdGNvZGUgKGUuZywgTz0xKVxuICAgIGZvciAodmFyIGUgaW4gZW5jKSB7XG4gICAgICBlbmNbZV0udHlwZSA9IGNvbnN0cy5kYXRhVHlwZXNbZW5jW2VdLnR5cGVdO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgRW5jb2Rpbmcoc3BlYy5tYXJrdHlwZSwgZW5jLCB1dGlsLm1lcmdlKHNwZWMuY2ZnIHx8IHt9LCBleHRyYUNmZyB8fCB7fSksIHNwZWMuZmlsdGVyLCB0aGVtZSk7XG4gIH07XG5cblxuICByZXR1cm4gRW5jb2Rpbmc7XG5cbn0pKCk7XG4iLCJ2YXIgZ2xvYmFscyA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBhZ2dyZWdhdGVzO1xuXG5mdW5jdGlvbiBhZ2dyZWdhdGVzKHNwZWMsIGVuY29kaW5nLCBvcHQpIHtcbiAgb3B0ID0gb3B0IHx8IHt9O1xuXG4gIHZhciBkaW1zID0ge30sIG1lYXMgPSB7fSwgZGV0YWlsID0ge30sIGZhY2V0cyA9IHt9LFxuICAgIGRhdGEgPSBzcGVjLmRhdGFbMV07IC8vIGN1cnJlbnRseSBkYXRhWzBdIGlzIHJhdyBhbmQgZGF0YVsxXSBpcyB0YWJsZVxuXG4gIGVuY29kaW5nLmZvckVhY2goZnVuY3Rpb24oZW5jVHlwZSwgZmllbGQpIHtcbiAgICBpZiAoZmllbGQuYWdncikge1xuICAgICAgaWYgKGZpZWxkLmFnZ3IgPT09ICdjb3VudCcpIHtcbiAgICAgICAgbWVhc1snY291bnQnXSA9IHtvcDogJ2NvdW50JywgZmllbGQ6ICcqJ307XG4gICAgICB9ZWxzZSB7XG4gICAgICAgIG1lYXNbZmllbGQuYWdnciArICd8JysgZmllbGQubmFtZV0gPSB7XG4gICAgICAgICAgb3A6IGZpZWxkLmFnZ3IsXG4gICAgICAgICAgZmllbGQ6ICdkYXRhLicrIGZpZWxkLm5hbWVcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZGltc1tmaWVsZC5uYW1lXSA9IGVuY29kaW5nLmZpZWxkKGVuY1R5cGUpO1xuICAgICAgaWYgKGVuY1R5cGUgPT0gUk9XIHx8IGVuY1R5cGUgPT0gQ09MKSB7XG4gICAgICAgIGZhY2V0c1tmaWVsZC5uYW1lXSA9IGRpbXNbZmllbGQubmFtZV07XG4gICAgICB9ZWxzZSBpZiAoZW5jVHlwZSAhPT0gWCAmJiBlbmNUeXBlICE9PSBZKSB7XG4gICAgICAgIGRldGFpbFtmaWVsZC5uYW1lXSA9IGRpbXNbZmllbGQubmFtZV07XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgZGltcyA9IHV0aWwudmFscyhkaW1zKTtcbiAgbWVhcyA9IHV0aWwudmFscyhtZWFzKTtcblxuICBpZiAobWVhcy5sZW5ndGggPiAwICYmICFvcHQucHJlYWdncmVnYXRlZERhdGEpIHtcbiAgICBpZiAoIWRhdGEudHJhbnNmb3JtKSBkYXRhLnRyYW5zZm9ybSA9IFtdO1xuICAgIGRhdGEudHJhbnNmb3JtLnB1c2goe1xuICAgICAgdHlwZTogJ2FnZ3JlZ2F0ZScsXG4gICAgICBncm91cGJ5OiBkaW1zLFxuICAgICAgZmllbGRzOiBtZWFzXG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBkZXRhaWxzOiB1dGlsLnZhbHMoZGV0YWlsKSxcbiAgICBkaW1zOiBkaW1zLFxuICAgIGZhY2V0czogdXRpbC52YWxzKGZhY2V0cyksXG4gICAgYWdncmVnYXRlZDogbWVhcy5sZW5ndGggPiAwXG4gIH07XG59XG4iLCJ2YXIgZ2xvYmFscyA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKSxcbiAgc2V0dGVyID0gdXRpbC5zZXR0ZXIsXG4gIGdldHRlciA9IHV0aWwuZ2V0dGVyLFxuICB0aW1lID0gcmVxdWlyZSgnLi90aW1lJyk7XG5cbnZhciBheGlzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuYXhpcy5uYW1lcyA9IGZ1bmN0aW9uKHByb3BzKSB7XG4gIHJldHVybiB1dGlsLmtleXModXRpbC5rZXlzKHByb3BzKS5yZWR1Y2UoZnVuY3Rpb24oYSwgeCkge1xuICAgIHZhciBzID0gcHJvcHNbeF0uc2NhbGU7XG4gICAgaWYgKHMgPT09IFggfHwgcyA9PT0gWSkgYVtwcm9wc1t4XS5zY2FsZV0gPSAxO1xuICAgIHJldHVybiBhO1xuICB9LCB7fSkpO1xufTtcblxuYXhpcy5kZWZzID0gZnVuY3Rpb24obmFtZXMsIGVuY29kaW5nLCBsYXlvdXQsIG9wdCkge1xuICByZXR1cm4gbmFtZXMucmVkdWNlKGZ1bmN0aW9uKGEsIG5hbWUpIHtcbiAgICBhLnB1c2goYXhpcy5kZWYobmFtZSwgZW5jb2RpbmcsIGxheW91dCwgb3B0KSk7XG4gICAgcmV0dXJuIGE7XG4gIH0sIFtdKTtcbn07XG5cbmF4aXMuZGVmID0gZnVuY3Rpb24obmFtZSwgZW5jb2RpbmcsIGxheW91dCwgb3B0KSB7XG4gIHZhciB0eXBlID0gbmFtZTtcbiAgdmFyIGlzQ29sID0gbmFtZSA9PSBDT0wsIGlzUm93ID0gbmFtZSA9PSBST1c7XG4gIGlmIChpc0NvbCkgdHlwZSA9ICd4JztcbiAgaWYgKGlzUm93KSB0eXBlID0gJ3knO1xuXG4gIHZhciBkZWYgPSB7XG4gICAgdHlwZTogdHlwZSxcbiAgICBzY2FsZTogbmFtZVxuICB9O1xuXG4gIGlmIChlbmNvZGluZy5heGlzKG5hbWUpLmdyaWQpIHtcbiAgICBkZWYuZ3JpZCA9IHRydWU7XG4gICAgZGVmLmxheWVyID0gJ2JhY2snO1xuICB9XG5cbiAgaWYgKGVuY29kaW5nLmF4aXMobmFtZSkudGl0bGUpIHtcbiAgICBkZWYgPSBheGlzX3RpdGxlKGRlZiwgbmFtZSwgZW5jb2RpbmcsIGxheW91dCwgb3B0KTtcbiAgfVxuXG4gIGlmIChpc1JvdyB8fCBpc0NvbCkge1xuICAgIHNldHRlcihkZWYsIFsncHJvcGVydGllcycsICd0aWNrcyddLCB7XG4gICAgICBvcGFjaXR5OiB7dmFsdWU6IDB9XG4gICAgfSk7XG4gICAgc2V0dGVyKGRlZiwgWydwcm9wZXJ0aWVzJywgJ21ham9yVGlja3MnXSwge1xuICAgICAgb3BhY2l0eToge3ZhbHVlOiAwfVxuICAgIH0pO1xuICAgIHNldHRlcihkZWYsIFsncHJvcGVydGllcycsICdheGlzJ10sIHtcbiAgICAgIG9wYWNpdHk6IHt2YWx1ZTogMH1cbiAgICB9KTtcbiAgfVxuXG4gIGlmIChpc0NvbCkge1xuICAgIGRlZi5vcmllbnQgPSAndG9wJztcbiAgfVxuXG4gIGlmIChpc1Jvdykge1xuICAgIGRlZi5vZmZzZXQgPSBheGlzVGl0bGVPZmZzZXQoZW5jb2RpbmcsIGxheW91dCwgWSkgKyAyMDtcbiAgfVxuXG4gIGlmIChuYW1lID09IFgpIHtcbiAgICBpZiAoZW5jb2RpbmcuaXNEaW1lbnNpb24oWCkgfHwgZW5jb2RpbmcuaXNUeXBlKFgsIFQpKSB7XG4gICAgICBzZXR0ZXIoZGVmLCBbJ3Byb3BlcnRpZXMnLCdsYWJlbHMnXSwge1xuICAgICAgICBhbmdsZToge3ZhbHVlOiAyNzB9LFxuICAgICAgICBhbGlnbjoge3ZhbHVlOiAncmlnaHQnfSxcbiAgICAgICAgYmFzZWxpbmU6IHt2YWx1ZTogJ21pZGRsZSd9XG4gICAgICB9KTtcbiAgICB9IGVsc2UgeyAvLyBRXG4gICAgICBkZWYudGlja3MgPSA1O1xuICAgIH1cbiAgfVxuXG4gIGRlZiA9IGF4aXNfbGFiZWxzKGRlZiwgbmFtZSwgZW5jb2RpbmcsIGxheW91dCwgb3B0KTtcblxuICByZXR1cm4gZGVmO1xufTtcblxuZnVuY3Rpb24gYXhpc190aXRsZShkZWYsIG5hbWUsIGVuY29kaW5nLCBsYXlvdXQsIG9wdCkge1xuICB2YXIgbWF4bGVuZ3RoID0gbnVsbCxcbiAgICBmaWVsZFRpdGxlID0gZW5jb2RpbmcuZmllbGRUaXRsZShuYW1lKTtcbiAgaWYgKG5hbWU9PT1YKSB7XG4gICAgbWF4bGVuZ3RoID0gbGF5b3V0LmNlbGxXaWR0aCAvIGVuY29kaW5nLmNvbmZpZygnY2hhcmFjdGVyV2lkdGgnKTtcbiAgfSBlbHNlIGlmIChuYW1lID09PSBZKSB7XG4gICAgbWF4bGVuZ3RoID0gbGF5b3V0LmNlbGxIZWlnaHQgLyBlbmNvZGluZy5jb25maWcoJ2NoYXJhY3RlcldpZHRoJyk7XG4gIH1cblxuICBkZWYudGl0bGUgPSBtYXhsZW5ndGggPyB1dGlsLnRydW5jYXRlKGZpZWxkVGl0bGUsIG1heGxlbmd0aCkgOiBmaWVsZFRpdGxlO1xuXG4gIGlmIChuYW1lID09PSBST1cpIHtcbiAgICBzZXR0ZXIoZGVmLCBbJ3Byb3BlcnRpZXMnLCd0aXRsZSddLCB7XG4gICAgICBhbmdsZToge3ZhbHVlOiAwfSxcbiAgICAgIGFsaWduOiB7dmFsdWU6ICdyaWdodCd9LFxuICAgICAgYmFzZWxpbmU6IHt2YWx1ZTogJ21pZGRsZSd9LFxuICAgICAgZHk6IHt2YWx1ZTogKC1sYXlvdXQuaGVpZ2h0LzIpIC0yMH1cbiAgICB9KTtcbiAgfVxuXG4gIGRlZi50aXRsZU9mZnNldCA9IGF4aXNUaXRsZU9mZnNldChlbmNvZGluZywgbGF5b3V0LCBuYW1lKTtcbiAgcmV0dXJuIGRlZjtcbn1cblxuZnVuY3Rpb24gYXhpc19sYWJlbHMoZGVmLCBuYW1lLCBlbmNvZGluZywgbGF5b3V0LCBvcHQpIHtcbiAgdmFyIGZuO1xuICAvLyBhZGQgY3VzdG9tIGxhYmVsIGZvciB0aW1lIHR5cGVcbiAgaWYgKGVuY29kaW5nLmlzVHlwZShuYW1lLCBUKSAmJiAoZm4gPSBlbmNvZGluZy5mbihuYW1lKSkgJiYgKHRpbWUuaGFzU2NhbGUoZm4pKSkge1xuICAgIHNldHRlcihkZWYsIFsncHJvcGVydGllcycsJ2xhYmVscycsJ3RleHQnLCdzY2FsZSddLCAndGltZS0nKyBmbik7XG4gIH1cblxuICB2YXIgdGV4dFRlbXBsYXRlUGF0aCA9IFsncHJvcGVydGllcycsJ2xhYmVscycsJ3RleHQnLCd0ZW1wbGF0ZSddO1xuICBpZiAoZW5jb2RpbmcuYXhpcyhuYW1lKS5mb3JtYXQpIHtcbiAgICBkZWYuZm9ybWF0ID0gZW5jb2RpbmcuYXhpcyhuYW1lKS5mb3JtYXQ7XG4gIH0gZWxzZSBpZiAoZW5jb2RpbmcuaXNUeXBlKG5hbWUsIFEpKSB7XG4gICAgc2V0dGVyKGRlZiwgdGV4dFRlbXBsYXRlUGF0aCwgXCJ7e2RhdGEgfCBudW1iZXI6Jy4zcyd9fVwiKTtcbiAgfSBlbHNlIGlmIChlbmNvZGluZy5pc1R5cGUobmFtZSwgVCkgJiYgIWVuY29kaW5nLmZuKG5hbWUpKSB7XG4gICAgc2V0dGVyKGRlZiwgdGV4dFRlbXBsYXRlUGF0aCwgXCJ7e2RhdGEgfCB0aW1lOiclWS0lbS0lZCd9fVwiKTtcbiAgfSBlbHNlIGlmIChlbmNvZGluZy5pc1R5cGUobmFtZSwgVCkgJiYgZW5jb2RpbmcuZm4obmFtZSkgPT09ICd5ZWFyJykge1xuICAgIHNldHRlcihkZWYsIHRleHRUZW1wbGF0ZVBhdGgsIFwie3tkYXRhIHwgbnVtYmVyOidkJ319XCIpO1xuICB9IGVsc2UgaWYgKGVuY29kaW5nLmlzVHlwZShuYW1lLCBPKSAmJiBlbmNvZGluZy5heGlzKG5hbWUpLm1heExhYmVsTGVuZ3RoKSB7XG4gICAgc2V0dGVyKGRlZiwgdGV4dFRlbXBsYXRlUGF0aCwgJ3t7ZGF0YSB8IHRydW5jYXRlOicgKyBlbmNvZGluZy5heGlzKG5hbWUpLm1heExhYmVsTGVuZ3RoICsgJ319Jyk7XG4gIH1cblxuICByZXR1cm4gZGVmO1xufVxuXG5mdW5jdGlvbiBheGlzVGl0bGVPZmZzZXQoZW5jb2RpbmcsIGxheW91dCwgbmFtZSkge1xuICB2YXIgdmFsdWUgPSBlbmNvZGluZy5heGlzKG5hbWUpLnRpdGxlT2Zmc2V0O1xuICBpZiAodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgc3dpdGNoIChuYW1lKSB7XG4gICAgY2FzZSBST1c6IHJldHVybiAwO1xuICAgIGNhc2UgQ09MOiByZXR1cm4gMzU7XG4gIH1cbiAgcmV0dXJuIGdldHRlcihsYXlvdXQsIFtuYW1lLCAnYXhpc1RpdGxlT2Zmc2V0J10pO1xufVxuIiwidmFyIGdsb2JhbHMgPSByZXF1aXJlKCcuLi9nbG9iYWxzJyksXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gYmlubmluZztcblxuZnVuY3Rpb24gYmlubmluZyhzcGVjLCBlbmNvZGluZywgb3B0KSB7XG4gIG9wdCA9IG9wdCB8fCB7fTtcbiAgdmFyIGJpbnMgPSB7fTtcblxuICBpZiAob3B0LnByZWFnZ3JlZ2F0ZWREYXRhKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKCFzcGVjLnRyYW5zZm9ybSkgc3BlYy50cmFuc2Zvcm0gPSBbXTtcblxuICBlbmNvZGluZy5mb3JFYWNoKGZ1bmN0aW9uKGVuY1R5cGUsIGZpZWxkKSB7XG4gICAgaWYgKGVuY29kaW5nLmJpbihlbmNUeXBlKSkge1xuICAgICAgc3BlYy50cmFuc2Zvcm0ucHVzaCh7XG4gICAgICAgIHR5cGU6ICdiaW4nLFxuICAgICAgICBmaWVsZDogJ2RhdGEuJyArIGZpZWxkLm5hbWUsXG4gICAgICAgIG91dHB1dDogJ2RhdGEuYmluXycgKyBmaWVsZC5uYW1lLFxuICAgICAgICBtYXhiaW5zOiBlbmNvZGluZy5iaW4oZW5jVHlwZSkubWF4Ymluc1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcbn1cbiIsInZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbXBpbGU7XG5cbnZhciB0ZW1wbGF0ZSA9IGNvbXBpbGUudGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlJyksXG4gIGF4aXMgPSBjb21waWxlLmF4aXMgPSByZXF1aXJlKCcuL2F4aXMnKSxcbiAgZmlsdGVyID0gY29tcGlsZS5maWx0ZXIgPSByZXF1aXJlKCcuL2ZpbHRlcicpLFxuICBsZWdlbmQgPSBjb21waWxlLmxlZ2VuZCA9IHJlcXVpcmUoJy4vbGVnZW5kJyksXG4gIG1hcmtzID0gY29tcGlsZS5tYXJrcyA9IHJlcXVpcmUoJy4vbWFya3MnKSxcbiAgc2NhbGUgPSBjb21waWxlLnNjYWxlID0gcmVxdWlyZSgnLi9zY2FsZScpLFxuICB2bHNvcnQgPSBjb21waWxlLnNvcnQgPSByZXF1aXJlKCcuL3NvcnQnKSxcbiAgdmxzdHlsZSA9IGNvbXBpbGUuc3R5bGUgPSByZXF1aXJlKCcuL3N0eWxlJyksXG4gIHRpbWUgPSBjb21waWxlLnRpbWUgPSByZXF1aXJlKCcuL3RpbWUnKSxcbiAgYWdncmVnYXRlcyA9IGNvbXBpbGUuYWdncmVnYXRlcyA9IHJlcXVpcmUoJy4vYWdncmVnYXRlcycpLFxuICBiaW5uaW5nID0gY29tcGlsZS5iaW5uaW5nID0gcmVxdWlyZSgnLi9iaW5uaW5nJyksXG4gIGZhY2V0aW5nID0gY29tcGlsZS5mYWNldGluZyA9IHJlcXVpcmUoJy4vZmFjZXRpbmcnKSxcbiAgc3RhY2tpbmcgPSBjb21waWxlLnN0YWNraW5nID0gcmVxdWlyZSgnLi9zdGFja2luZycpO1xuICBzdWJmYWNldGluZyA9IGNvbXBpbGUuc3ViZmFjZXRpbmcgPSByZXF1aXJlKCcuL3N1YmZhY2V0aW5nJyk7XG5cbmNvbXBpbGUubGF5b3V0ID0gcmVxdWlyZSgnLi9sYXlvdXQnKTtcbmNvbXBpbGUuZ3JvdXAgPSByZXF1aXJlKCcuL2dyb3VwJyk7XG5cbmZ1bmN0aW9uIGNvbXBpbGUoZW5jb2RpbmcsIHN0YXRzKSB7XG4gIHZhciBsYXlvdXQgPSBjb21waWxlLmxheW91dChlbmNvZGluZywgc3RhdHMpLFxuICAgIHN0eWxlID0gdmxzdHlsZShlbmNvZGluZywgc3RhdHMpLFxuICAgIHNwZWMgPSB0ZW1wbGF0ZShlbmNvZGluZywgbGF5b3V0LCBzdGF0cyksXG4gICAgZ3JvdXAgPSBzcGVjLm1hcmtzWzBdLFxuICAgIG1hcmsgPSBtYXJrc1tlbmNvZGluZy5tYXJrdHlwZSgpXSxcbiAgICBtZGVmcyA9IG1hcmtzLmRlZihtYXJrLCBlbmNvZGluZywgbGF5b3V0LCBzdHlsZSksXG4gICAgbWRlZiA9IG1kZWZzWzBdOyAgLy8gVE9ETzogcmVtb3ZlIHRoaXMgZGlydHkgaGFjayBieSByZWZhY3RvcmluZyB0aGUgd2hvbGUgZmxvd1xuXG4gIGZpbHRlci5hZGRGaWx0ZXJzKHNwZWMsIGVuY29kaW5nKTtcbiAgdmFyIHNvcnRpbmcgPSB2bHNvcnQoc3BlYywgZW5jb2RpbmcpO1xuXG4gIHZhciBoYXNSb3cgPSBlbmNvZGluZy5oYXMoUk9XKSwgaGFzQ29sID0gZW5jb2RpbmcuaGFzKENPTCk7XG5cbiAgdmFyIHByZWFnZ3JlZ2F0ZWREYXRhID0gZW5jb2RpbmcuY29uZmlnKCd1c2VWZWdhU2VydmVyJyk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtZGVmcy5sZW5ndGg7IGkrKykge1xuICAgIGdyb3VwLm1hcmtzLnB1c2gobWRlZnNbaV0pO1xuICB9XG5cbiAgYmlubmluZyhzcGVjLmRhdGFbMV0sIGVuY29kaW5nLCB7cHJlYWdncmVnYXRlZERhdGE6IHByZWFnZ3JlZ2F0ZWREYXRhfSk7XG5cbiAgdmFyIGxpbmVUeXBlID0gbWFya3NbZW5jb2RpbmcubWFya3R5cGUoKV0ubGluZTtcblxuICBpZiAoIXByZWFnZ3JlZ2F0ZWREYXRhKSB7XG4gICAgc3BlYyA9IHRpbWUoc3BlYywgZW5jb2RpbmcpO1xuICB9XG5cbiAgLy8gaGFuZGxlIHN1YmZhY2V0c1xuICB2YXIgYWdnUmVzdWx0ID0gYWdncmVnYXRlcyhzcGVjLCBlbmNvZGluZywge3ByZWFnZ3JlZ2F0ZWREYXRhOiBwcmVhZ2dyZWdhdGVkRGF0YX0pLFxuICAgIGRldGFpbHMgPSBhZ2dSZXN1bHQuZGV0YWlscyxcbiAgICBoYXNEZXRhaWxzID0gZGV0YWlscyAmJiBkZXRhaWxzLmxlbmd0aCA+IDAsXG4gICAgc3RhY2sgPSBoYXNEZXRhaWxzICYmIHN0YWNraW5nKHNwZWMsIGVuY29kaW5nLCBtZGVmLCBhZ2dSZXN1bHQuZmFjZXRzKTtcblxuICBpZiAoaGFzRGV0YWlscyAmJiAoc3RhY2sgfHwgbGluZVR5cGUpKSB7XG4gICAgLy9zdWJmYWNldCB0byBncm91cCBzdGFjayAvIGxpbmUgdG9nZXRoZXIgaW4gb25lIGdyb3VwXG4gICAgc3ViZmFjZXRpbmcoZ3JvdXAsIG1kZWYsIGRldGFpbHMsIHN0YWNrLCBlbmNvZGluZyk7XG4gIH1cblxuICAvLyBhdXRvLXNvcnQgbGluZS9hcmVhIHZhbHVlc1xuICAvL1RPRE8oa2FuaXR3KTogaGF2ZSBzb21lIGNvbmZpZyB0byB0dXJuIG9mZiBhdXRvLXNvcnQgZm9yIGxpbmUgKGZvciBsaW5lIGNoYXJ0IHRoYXQgZW5jb2RlcyB0ZW1wb3JhbCBpbmZvcm1hdGlvbilcbiAgaWYgKGxpbmVUeXBlKSB7XG4gICAgdmFyIGYgPSAoZW5jb2RpbmcuaXNNZWFzdXJlKFgpICYmIGVuY29kaW5nLmlzRGltZW5zaW9uKFkpKSA/IFkgOiBYO1xuICAgIGlmICghbWRlZi5mcm9tKSBtZGVmLmZyb20gPSB7fTtcbiAgICBtZGVmLmZyb20udHJhbnNmb3JtID0gW3t0eXBlOiAnc29ydCcsIGJ5OiBlbmNvZGluZy5maWVsZChmKX1dO1xuICB9XG5cbiAgLy8gU21hbGwgTXVsdGlwbGVzXG4gIGlmIChoYXNSb3cgfHwgaGFzQ29sKSB7XG4gICAgc3BlYyA9IGZhY2V0aW5nKGdyb3VwLCBlbmNvZGluZywgbGF5b3V0LCBzdHlsZSwgc29ydGluZywgc3BlYywgbWRlZiwgc3RhY2ssIHN0YXRzKTtcbiAgICBzcGVjLmxlZ2VuZHMgPSBsZWdlbmQuZGVmcyhlbmNvZGluZyk7XG4gIH0gZWxzZSB7XG4gICAgZ3JvdXAuc2NhbGVzID0gc2NhbGUuZGVmcyhzY2FsZS5uYW1lcyhtZGVmLnByb3BlcnRpZXMudXBkYXRlKSwgZW5jb2RpbmcsIGxheW91dCwgc3R5bGUsIHNvcnRpbmcsXG4gICAgICB7c3RhY2s6IHN0YWNrLCBzdGF0czogc3RhdHN9KTtcbiAgICBncm91cC5heGVzID0gYXhpcy5kZWZzKGF4aXMubmFtZXMobWRlZi5wcm9wZXJ0aWVzLnVwZGF0ZSksIGVuY29kaW5nLCBsYXlvdXQpO1xuICAgIGdyb3VwLmxlZ2VuZHMgPSBsZWdlbmQuZGVmcyhlbmNvZGluZyk7XG4gIH1cblxuICBmaWx0ZXIuZmlsdGVyTGVzc1RoYW5aZXJvKHNwZWMsIGVuY29kaW5nKTtcblxuICByZXR1cm4gc3BlYztcbn1cblxuIiwidmFyIGdsb2JhbHMgPSByZXF1aXJlKCcuLi9nbG9iYWxzJyksXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cbnZhciBheGlzID0gcmVxdWlyZSgnLi9heGlzJyksXG4gIGdyb3VwZGVmID0gcmVxdWlyZSgnLi9ncm91cCcpLmRlZixcbiAgc2NhbGUgPSByZXF1aXJlKCcuL3NjYWxlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZmFjZXRpbmc7XG5cbmZ1bmN0aW9uIGZhY2V0aW5nKGdyb3VwLCBlbmNvZGluZywgbGF5b3V0LCBzdHlsZSwgc29ydGluZywgc3BlYywgbWRlZiwgc3RhY2ssIHN0YXRzKSB7XG4gIHZhciBlbnRlciA9IGdyb3VwLnByb3BlcnRpZXMuZW50ZXI7XG4gIHZhciBmYWNldEtleXMgPSBbXSwgY2VsbEF4ZXMgPSBbXSwgZnJvbSwgYXhlc0dycDtcblxuICB2YXIgaGFzUm93ID0gZW5jb2RpbmcuaGFzKFJPVyksIGhhc0NvbCA9IGVuY29kaW5nLmhhcyhDT0wpO1xuXG4gIGVudGVyLmZpbGwgPSB7dmFsdWU6IGVuY29kaW5nLmNvbmZpZygnY2VsbEJhY2tncm91bmRDb2xvcicpfTtcblxuICAvL21vdmUgXCJmcm9tXCIgdG8gY2VsbCBsZXZlbCBhbmQgYWRkIGZhY2V0IHRyYW5zZm9ybVxuICBncm91cC5mcm9tID0ge2RhdGE6IGdyb3VwLm1hcmtzWzBdLmZyb20uZGF0YX07XG5cbiAgLy8gSGFjaywgdGhpcyBuZWVkcyB0byBiZSByZWZhY3RvcmVkXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZ3JvdXAubWFya3MubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgbWFyayA9IGdyb3VwLm1hcmtzW2ldO1xuICAgIGlmIChtYXJrLmZyb20udHJhbnNmb3JtKSB7XG4gICAgICBkZWxldGUgbWFyay5mcm9tLmRhdGE7IC8vbmVlZCB0byBrZWVwIHRyYW5zZm9ybSBmb3Igc3ViZmFjZXR0aW5nIGNhc2VcbiAgICB9IGVsc2Uge1xuICAgICAgZGVsZXRlIG1hcmsuZnJvbTtcbiAgICB9XG4gIH07XG4gIGlmIChoYXNSb3cpIHtcbiAgICBpZiAoIWVuY29kaW5nLmlzRGltZW5zaW9uKFJPVykpIHtcbiAgICAgIHV0aWwuZXJyb3IoJ1JvdyBlbmNvZGluZyBzaG91bGQgYmUgb3JkaW5hbC4nKTtcbiAgICB9XG4gICAgZW50ZXIueSA9IHtzY2FsZTogUk9XLCBmaWVsZDogJ2tleXMuJyArIGZhY2V0S2V5cy5sZW5ndGh9O1xuICAgIGVudGVyLmhlaWdodCA9IHsndmFsdWUnOiBsYXlvdXQuY2VsbEhlaWdodH07IC8vIEhBQ0tcblxuICAgIGZhY2V0S2V5cy5wdXNoKGVuY29kaW5nLmZpZWxkKFJPVykpO1xuXG4gICAgaWYgKGhhc0NvbCkge1xuICAgICAgZnJvbSA9IHV0aWwuZHVwbGljYXRlKGdyb3VwLmZyb20pO1xuICAgICAgZnJvbS50cmFuc2Zvcm0gPSBmcm9tLnRyYW5zZm9ybSB8fCBbXTtcbiAgICAgIGZyb20udHJhbnNmb3JtLnVuc2hpZnQoe3R5cGU6ICdmYWNldCcsIGtleXM6IFtlbmNvZGluZy5maWVsZChDT0wpXX0pO1xuICAgIH1cblxuICAgIGF4ZXNHcnAgPSBncm91cGRlZigneC1heGVzJywge1xuICAgICAgICBheGVzOiBlbmNvZGluZy5oYXMoWCkgPyBheGlzLmRlZnMoWyd4J10sIGVuY29kaW5nLCBsYXlvdXQpIDogdW5kZWZpbmVkLFxuICAgICAgICB4OiBoYXNDb2wgPyB7c2NhbGU6IENPTCwgZmllbGQ6ICdrZXlzLjAnfSA6IHt2YWx1ZTogMH0sXG4gICAgICAgIHdpZHRoOiBoYXNDb2wgJiYgeyd2YWx1ZSc6IGxheW91dC5jZWxsV2lkdGh9LCAvL0hBQ0s/XG4gICAgICAgIGZyb206IGZyb21cbiAgICAgIH0pO1xuXG4gICAgc3BlYy5tYXJrcy5wdXNoKGF4ZXNHcnApO1xuICAgIChzcGVjLmF4ZXMgPSBzcGVjLmF4ZXMgfHwgW10pO1xuICAgIHNwZWMuYXhlcy5wdXNoLmFwcGx5KHNwZWMuYXhlcywgYXhpcy5kZWZzKFsncm93J10sIGVuY29kaW5nLCBsYXlvdXQpKTtcbiAgfSBlbHNlIHsgLy8gZG9lc24ndCBoYXZlIHJvd1xuICAgIGlmIChlbmNvZGluZy5oYXMoWCkpIHtcbiAgICAgIC8va2VlcCB4IGF4aXMgaW4gdGhlIGNlbGxcbiAgICAgIGNlbGxBeGVzLnB1c2guYXBwbHkoY2VsbEF4ZXMsIGF4aXMuZGVmcyhbJ3gnXSwgZW5jb2RpbmcsIGxheW91dCkpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChoYXNDb2wpIHtcbiAgICBpZiAoIWVuY29kaW5nLmlzRGltZW5zaW9uKENPTCkpIHtcbiAgICAgIHV0aWwuZXJyb3IoJ0NvbCBlbmNvZGluZyBzaG91bGQgYmUgb3JkaW5hbC4nKTtcbiAgICB9XG4gICAgZW50ZXIueCA9IHtzY2FsZTogQ09MLCBmaWVsZDogJ2tleXMuJyArIGZhY2V0S2V5cy5sZW5ndGh9O1xuICAgIGVudGVyLndpZHRoID0geyd2YWx1ZSc6IGxheW91dC5jZWxsV2lkdGh9OyAvLyBIQUNLXG5cbiAgICBmYWNldEtleXMucHVzaChlbmNvZGluZy5maWVsZChDT0wpKTtcblxuICAgIGlmIChoYXNSb3cpIHtcbiAgICAgIGZyb20gPSB1dGlsLmR1cGxpY2F0ZShncm91cC5mcm9tKTtcbiAgICAgIGZyb20udHJhbnNmb3JtID0gZnJvbS50cmFuc2Zvcm0gfHwgW107XG4gICAgICBmcm9tLnRyYW5zZm9ybS51bnNoaWZ0KHt0eXBlOiAnZmFjZXQnLCBrZXlzOiBbZW5jb2RpbmcuZmllbGQoUk9XKV19KTtcbiAgICB9XG5cbiAgICBheGVzR3JwID0gZ3JvdXBkZWYoJ3ktYXhlcycsIHtcbiAgICAgIGF4ZXM6IGVuY29kaW5nLmhhcyhZKSA/IGF4aXMuZGVmcyhbJ3knXSwgZW5jb2RpbmcsIGxheW91dCkgOiB1bmRlZmluZWQsXG4gICAgICB5OiBoYXNSb3cgJiYge3NjYWxlOiBST1csIGZpZWxkOiAna2V5cy4wJ30sXG4gICAgICB4OiBoYXNSb3cgJiYge3ZhbHVlOiAwfSxcbiAgICAgIGhlaWdodDogaGFzUm93ICYmIHsndmFsdWUnOiBsYXlvdXQuY2VsbEhlaWdodH0sIC8vSEFDSz9cbiAgICAgIGZyb206IGZyb21cbiAgICB9KTtcblxuICAgIHNwZWMubWFya3MucHVzaChheGVzR3JwKTtcbiAgICAoc3BlYy5heGVzID0gc3BlYy5heGVzIHx8IFtdKTtcbiAgICBzcGVjLmF4ZXMucHVzaC5hcHBseShzcGVjLmF4ZXMsIGF4aXMuZGVmcyhbJ2NvbCddLCBlbmNvZGluZywgbGF5b3V0KSk7XG4gIH0gZWxzZSB7IC8vIGRvZXNuJ3QgaGF2ZSBjb2xcbiAgICBpZiAoZW5jb2RpbmcuaGFzKFkpKSB7XG4gICAgICBjZWxsQXhlcy5wdXNoLmFwcGx5KGNlbGxBeGVzLCBheGlzLmRlZnMoWyd5J10sIGVuY29kaW5nLCBsYXlvdXQpKTtcbiAgICB9XG4gIH1cblxuICAvLyBhc3N1bWluZyBlcXVhbCBjZWxsV2lkdGggaGVyZVxuICAvLyBUT0RPOiBzdXBwb3J0IGhldGVyb2dlbm91cyBjZWxsV2lkdGggKG1heWJlIGJ5IHVzaW5nIG11bHRpcGxlIHNjYWxlcz8pXG4gIHNwZWMuc2NhbGVzID0gKHNwZWMuc2NhbGVzIHx8IFtdKS5jb25jYXQoc2NhbGUuZGVmcyhcbiAgICBzY2FsZS5uYW1lcyhlbnRlcikuY29uY2F0KHNjYWxlLm5hbWVzKG1kZWYucHJvcGVydGllcy51cGRhdGUpKSxcbiAgICBlbmNvZGluZyxcbiAgICBsYXlvdXQsXG4gICAgc3R5bGUsXG4gICAgc29ydGluZyxcbiAgICB7c3RhY2s6IHN0YWNrLCBmYWNldDogdHJ1ZSwgc3RhdHM6IHN0YXRzfVxuICApKTsgLy8gcm93L2NvbCBzY2FsZXMgKyBjZWxsIHNjYWxlc1xuXG4gIGlmIChjZWxsQXhlcy5sZW5ndGggPiAwKSB7XG4gICAgZ3JvdXAuYXhlcyA9IGNlbGxBeGVzO1xuICB9XG5cbiAgLy8gYWRkIGZhY2V0IHRyYW5zZm9ybVxuICB2YXIgdHJhbnMgPSAoZ3JvdXAuZnJvbS50cmFuc2Zvcm0gfHwgKGdyb3VwLmZyb20udHJhbnNmb3JtID0gW10pKTtcbiAgdHJhbnMudW5zaGlmdCh7dHlwZTogJ2ZhY2V0Jywga2V5czogZmFjZXRLZXlzfSk7XG5cbiAgcmV0dXJuIHNwZWM7XG59XG4iLCJ2YXIgZ2xvYmFscyA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKTtcblxudmFyIGZpbHRlciA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnZhciBCSU5BUlkgPSB7XG4gICc+JzogIHRydWUsXG4gICc+PSc6IHRydWUsXG4gICc9JzogIHRydWUsXG4gICchPSc6IHRydWUsXG4gICc8JzogIHRydWUsXG4gICc8PSc6IHRydWVcbn07XG5cbmZpbHRlci5hZGRGaWx0ZXJzID0gZnVuY3Rpb24oc3BlYywgZW5jb2RpbmcpIHtcbiAgdmFyIGZpbHRlcnMgPSBlbmNvZGluZy5maWx0ZXIoKSxcbiAgICBkYXRhID0gc3BlYy5kYXRhWzBdOyAgLy8gYXBwbHkgZmlsdGVycyB0byByYXcgZGF0YSBiZWZvcmUgYWdncmVnYXRpb25cblxuICBpZiAoIWRhdGEudHJhbnNmb3JtKVxuICAgIGRhdGEudHJhbnNmb3JtID0gW107XG5cbiAgLy8gYWRkIGN1c3RvbSBmaWx0ZXJzXG4gIGZvciAodmFyIGkgaW4gZmlsdGVycykge1xuICAgIHZhciBmaWx0ZXIgPSBmaWx0ZXJzW2ldO1xuXG4gICAgdmFyIGNvbmRpdGlvbiA9ICcnO1xuICAgIHZhciBvcGVyYXRvciA9IGZpbHRlci5vcGVyYXRvcjtcbiAgICB2YXIgb3BlcmFuZHMgPSBmaWx0ZXIub3BlcmFuZHM7XG5cbiAgICBpZiAoQklOQVJZW29wZXJhdG9yXSkge1xuICAgICAgLy8gZXhwZWN0cyBhIGZpZWxkIGFuZCBhIHZhbHVlXG4gICAgICBpZiAob3BlcmF0b3IgPT09ICc9Jykge1xuICAgICAgICBvcGVyYXRvciA9ICc9PSc7XG4gICAgICB9XG5cbiAgICAgIHZhciBvcDEgPSBvcGVyYW5kc1swXTtcbiAgICAgIHZhciBvcDIgPSBvcGVyYW5kc1sxXTtcbiAgICAgIGNvbmRpdGlvbiA9ICdkLmRhdGEuJyArIG9wMSArIG9wZXJhdG9yICsgb3AyO1xuICAgIH0gZWxzZSBpZiAob3BlcmF0b3IgPT09ICdub3ROdWxsJykge1xuICAgICAgLy8gZXhwZWN0cyBhIG51bWJlciBvZiBmaWVsZHNcbiAgICAgIGZvciAodmFyIGogaW4gb3BlcmFuZHMpIHtcbiAgICAgICAgdmFyIGZpZWxkID0gJ2QuZGF0YS4nICsgb3BlcmFuZHNbal07XG4gICAgICAgIGNvbmRpdGlvbiArPSAnKCcgK1xuICAgICAgICAgICcoISEnICsgZmllbGQgKyAnICYmICcgKyBmaWVsZCArICcgIT0gXCJudWxsXCIpJyArXG4gICAgICAgICAgJyB8fCAnICsgZmllbGQgKyAnID09PSAwICcgK1xuICAgICAgICAgICcpJztcbiAgICAgICAgaWYgKGogPCBvcGVyYW5kcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgY29uZGl0aW9uICs9ICcgJiYgJztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1Vuc3VwcG9ydGVkIG9wZXJhdG9yOiAnLCBvcGVyYXRvcik7XG4gICAgfVxuXG4gICAgZGF0YS50cmFuc2Zvcm0ucHVzaCh7XG4gICAgICB0eXBlOiAnZmlsdGVyJyxcbiAgICAgIHRlc3Q6IGNvbmRpdGlvblxuICAgIH0pO1xuICB9XG59O1xuXG4vLyByZW1vdmUgbGVzcyB0aGFuIDAgdmFsdWVzIGlmIHdlIHVzZSBsb2cgZnVuY3Rpb25cbmZpbHRlci5maWx0ZXJMZXNzVGhhblplcm8gPSBmdW5jdGlvbihzcGVjLCBlbmNvZGluZykge1xuICBlbmNvZGluZy5mb3JFYWNoKGZ1bmN0aW9uKGVuY1R5cGUsIGZpZWxkKSB7XG4gICAgaWYgKGVuY29kaW5nLnNjYWxlKGVuY1R5cGUpLnR5cGUgPT09ICdsb2cnKSB7XG4gICAgICBzcGVjLmRhdGFbMV0udHJhbnNmb3JtLnB1c2goe1xuICAgICAgICB0eXBlOiAnZmlsdGVyJyxcbiAgICAgICAgdGVzdDogJ2QuJyArIGVuY29kaW5nLmZpZWxkKGVuY1R5cGUpICsgJz4wJ1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcbn07XG5cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBkZWY6IGdyb3VwZGVmXG59O1xuXG5mdW5jdGlvbiBncm91cGRlZihuYW1lLCBvcHQpIHtcbiAgb3B0ID0gb3B0IHx8IHt9O1xuICByZXR1cm4ge1xuICAgIF9uYW1lOiBuYW1lIHx8IHVuZGVmaW5lZCxcbiAgICB0eXBlOiAnZ3JvdXAnLFxuICAgIGZyb206IG9wdC5mcm9tLFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIGVudGVyOiB7XG4gICAgICAgIHg6IG9wdC54IHx8IHVuZGVmaW5lZCxcbiAgICAgICAgeTogb3B0LnkgfHwgdW5kZWZpbmVkLFxuICAgICAgICB3aWR0aDogb3B0LndpZHRoIHx8IHtncm91cDogJ3dpZHRoJ30sXG4gICAgICAgIGhlaWdodDogb3B0LmhlaWdodCB8fCB7Z3JvdXA6ICdoZWlnaHQnfVxuICAgICAgfVxuICAgIH0sXG4gICAgc2NhbGVzOiBvcHQuc2NhbGVzIHx8IHVuZGVmaW5lZCxcbiAgICBheGVzOiBvcHQuYXhlcyB8fCB1bmRlZmluZWQsXG4gICAgbWFya3M6IG9wdC5tYXJrcyB8fCBbXVxuICB9O1xufVxuIiwidmFyIGdsb2JhbHMgPSByZXF1aXJlKCcuLi9nbG9iYWxzJyksXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyksXG4gIHNldHRlciA9IHV0aWwuc2V0dGVyLFxuICBzY2hlbWEgPSByZXF1aXJlKCcuLi9zY2hlbWEvc2NoZW1hJyksXG4gIHRpbWUgPSByZXF1aXJlKCcuL3RpbWUnKSxcbiAgdmxmaWVsZCA9IHJlcXVpcmUoJy4uL2ZpZWxkJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gdmxsYXlvdXQ7XG5cbmZ1bmN0aW9uIHZsbGF5b3V0KGVuY29kaW5nLCBzdGF0cykge1xuICB2YXIgbGF5b3V0ID0gYm94KGVuY29kaW5nLCBzdGF0cyk7XG4gIGxheW91dCA9IG9mZnNldChlbmNvZGluZywgc3RhdHMsIGxheW91dCk7XG4gIHJldHVybiBsYXlvdXQ7XG59XG5cbi8qXG4gIEhBQ0sgdG8gc2V0IGNoYXJ0IHNpemVcbiAgTk9URTogdGhpcyBmYWlscyBmb3IgcGxvdHMgZHJpdmVuIGJ5IGRlcml2ZWQgdmFsdWVzIChlLmcuLCBhZ2dyZWdhdGVzKVxuICBPbmUgc29sdXRpb24gaXMgdG8gdXBkYXRlIFZlZ2EgdG8gc3VwcG9ydCBhdXRvLXNpemluZ1xuICBJbiB0aGUgbWVhbnRpbWUsIGF1dG8tcGFkZGluZyAobW9zdGx5KSBkb2VzIHRoZSB0cmlja1xuICovXG5mdW5jdGlvbiBib3goZW5jb2RpbmcsIHN0YXRzKSB7XG4gIHZhciBoYXNSb3cgPSBlbmNvZGluZy5oYXMoUk9XKSxcbiAgICAgIGhhc0NvbCA9IGVuY29kaW5nLmhhcyhDT0wpLFxuICAgICAgaGFzWCA9IGVuY29kaW5nLmhhcyhYKSxcbiAgICAgIGhhc1kgPSBlbmNvZGluZy5oYXMoWSksXG4gICAgICBtYXJrdHlwZSA9IGVuY29kaW5nLm1hcmt0eXBlKCk7XG5cbiAgdmFyIHhDYXJkaW5hbGl0eSA9IGhhc1ggJiYgZW5jb2RpbmcuaXNEaW1lbnNpb24oWCkgPyBlbmNvZGluZy5jYXJkaW5hbGl0eShYLCBzdGF0cykgOiAxLFxuICAgIHlDYXJkaW5hbGl0eSA9IGhhc1kgJiYgZW5jb2RpbmcuaXNEaW1lbnNpb24oWSkgPyBlbmNvZGluZy5jYXJkaW5hbGl0eShZLCBzdGF0cykgOiAxO1xuXG4gIHZhciB1c2VTbWFsbEJhbmQgPSB4Q2FyZGluYWxpdHkgPiBlbmNvZGluZy5jb25maWcoJ2xhcmdlQmFuZE1heENhcmRpbmFsaXR5JykgfHxcbiAgICB5Q2FyZGluYWxpdHkgPiBlbmNvZGluZy5jb25maWcoJ2xhcmdlQmFuZE1heENhcmRpbmFsaXR5Jyk7XG5cbiAgdmFyIGNlbGxXaWR0aCwgY2VsbEhlaWdodCwgY2VsbFBhZGRpbmcgPSBlbmNvZGluZy5jb25maWcoJ2NlbGxQYWRkaW5nJyk7XG5cbiAgLy8gc2V0IGNlbGxXaWR0aFxuICBpZiAoaGFzWCkge1xuICAgIGlmIChlbmNvZGluZy5pc09yZGluYWxTY2FsZShYKSkge1xuICAgICAgLy8gZm9yIG9yZGluYWwsIGhhc0NvbCBvciBub3QgZG9lc24ndCBtYXR0ZXIgLS0gd2Ugc2NhbGUgYmFzZWQgb24gY2FyZGluYWxpdHlcbiAgICAgIGNlbGxXaWR0aCA9ICh4Q2FyZGluYWxpdHkgKyBlbmNvZGluZy5iYW5kKFgpLnBhZGRpbmcpICogZW5jb2RpbmcuYmFuZFNpemUoWCwgdXNlU21hbGxCYW5kKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2VsbFdpZHRoID0gaGFzQ29sIHx8IGhhc1JvdyA/IGVuY29kaW5nLmVuYyhDT0wpLndpZHRoIDogIGVuY29kaW5nLmNvbmZpZyhcInNpbmdsZVdpZHRoXCIpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAobWFya3R5cGUgPT09IFRFWFQpIHtcbiAgICAgIGNlbGxXaWR0aCA9IGVuY29kaW5nLmNvbmZpZygndGV4dENlbGxXaWR0aCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjZWxsV2lkdGggPSBlbmNvZGluZy5iYW5kU2l6ZShYKTtcbiAgICB9XG4gIH1cblxuICAvLyBzZXQgY2VsbEhlaWdodFxuICBpZiAoaGFzWSkge1xuICAgIGlmIChlbmNvZGluZy5pc09yZGluYWxTY2FsZShZKSkge1xuICAgICAgLy8gZm9yIG9yZGluYWwsIGhhc0NvbCBvciBub3QgZG9lc24ndCBtYXR0ZXIgLS0gd2Ugc2NhbGUgYmFzZWQgb24gY2FyZGluYWxpdHlcbiAgICAgIGNlbGxIZWlnaHQgPSAoeUNhcmRpbmFsaXR5ICsgZW5jb2RpbmcuYmFuZChZKS5wYWRkaW5nKSAqIGVuY29kaW5nLmJhbmRTaXplKFksIHVzZVNtYWxsQmFuZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNlbGxIZWlnaHQgPSBoYXNDb2wgfHwgaGFzUm93ID8gZW5jb2RpbmcuZW5jKFJPVykuaGVpZ2h0IDogIGVuY29kaW5nLmNvbmZpZyhcInNpbmdsZUhlaWdodFwiKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgY2VsbEhlaWdodCA9IGVuY29kaW5nLmJhbmRTaXplKFkpO1xuICB9XG5cbiAgLy8gQ2VsbCBiYW5kcyB1c2UgcmFuZ2VCYW5kcygpLiBUaGVyZSBhcmUgbi0xIHBhZGRpbmcuICBPdXRlcnBhZGRpbmcgPSAwIGZvciBjZWxsc1xuXG4gIHZhciB3aWR0aCA9IGNlbGxXaWR0aCwgaGVpZ2h0ID0gY2VsbEhlaWdodDtcbiAgaWYgKGhhc0NvbCkge1xuICAgIHZhciBjb2xDYXJkaW5hbGl0eSA9IGVuY29kaW5nLmNhcmRpbmFsaXR5KENPTCwgc3RhdHMpO1xuICAgIHdpZHRoID0gY2VsbFdpZHRoICogKCgxICsgY2VsbFBhZGRpbmcpICogKGNvbENhcmRpbmFsaXR5IC0gMSkgKyAxKTtcbiAgfVxuICBpZiAoaGFzUm93KSB7XG4gICAgdmFyIHJvd0NhcmRpbmFsaXR5ID0gIGVuY29kaW5nLmNhcmRpbmFsaXR5KFJPVywgc3RhdHMpO1xuICAgIGhlaWdodCA9IGNlbGxIZWlnaHQgKiAoKDEgKyBjZWxsUGFkZGluZykgKiAocm93Q2FyZGluYWxpdHkgLSAxKSArIDEpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBjZWxsV2lkdGg6IGNlbGxXaWR0aCxcbiAgICBjZWxsSGVpZ2h0OiBjZWxsSGVpZ2h0LFxuICAgIHdpZHRoOiB3aWR0aCxcbiAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICB4OiB7dXNlU21hbGxCYW5kOiB1c2VTbWFsbEJhbmR9LFxuICAgIHk6IHt1c2VTbWFsbEJhbmQ6IHVzZVNtYWxsQmFuZH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gb2Zmc2V0KGVuY29kaW5nLCBzdGF0cywgbGF5b3V0KSB7XG4gIFtYLCBZXS5mb3JFYWNoKGZ1bmN0aW9uICh4KSB7XG4gICAgdmFyIG1heExlbmd0aDtcbiAgICBpZiAoZW5jb2RpbmcuaXNEaW1lbnNpb24oeCkgfHwgZW5jb2RpbmcuaXNUeXBlKHgsIFQpKSB7XG4gICAgICBtYXhMZW5ndGggPSBzdGF0c1tlbmNvZGluZy5maWVsZE5hbWUoeCldLm1heGxlbmd0aDtcbiAgICB9IGVsc2UgaWYgKGVuY29kaW5nLmFnZ3IoeCkgPT09ICdjb3VudCcpIHtcbiAgICAgIC8vYXNzaWduIGRlZmF1bHQgdmFsdWUgZm9yIGNvdW50IGFzIGl0IHdvbid0IGhhdmUgc3RhdHNcbiAgICAgIG1heExlbmd0aCA9ICAzO1xuICAgIH0gZWxzZSBpZiAoZW5jb2RpbmcuaXNUeXBlKHgsIFEpKSB7XG4gICAgICBpZiAoeD09PVgpIHtcbiAgICAgICAgbWF4TGVuZ3RoID0gMztcbiAgICAgIH0gZWxzZSB7IC8vIFlcbiAgICAgICAgLy9hc3N1bWUgdGhhdCBkZWZhdWx0IGZvcm1hdGluZyBpcyBhbHdheXMgc2hvcnRlciB0aGFuIDdcbiAgICAgICAgbWF4TGVuZ3RoID0gTWF0aC5taW4oc3RhdHNbZW5jb2RpbmcuZmllbGROYW1lKHgpXS5tYXhsZW5ndGgsIDcpO1xuICAgICAgfVxuICAgIH1cbiAgICBzZXR0ZXIobGF5b3V0LFt4LCAnYXhpc1RpdGxlT2Zmc2V0J10sIGVuY29kaW5nLmNvbmZpZygnY2hhcmFjdGVyV2lkdGgnKSAqICBtYXhMZW5ndGggKyAyMCk7XG4gIH0pO1xuICByZXR1cm4gbGF5b3V0O1xufVxuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKSxcbiAgdGltZSA9IHJlcXVpcmUoJy4vdGltZScpO1xuXG52YXIgbGVnZW5kID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxubGVnZW5kLmRlZnMgPSBmdW5jdGlvbihlbmNvZGluZykge1xuICB2YXIgZGVmcyA9IFtdO1xuXG4gIC8vIFRPRE86IHN1cHBvcnQgYWxwaGFcblxuICBpZiAoZW5jb2RpbmcuaGFzKENPTE9SKSAmJiBlbmNvZGluZy5sZWdlbmQoQ09MT1IpKSB7XG4gICAgZGVmcy5wdXNoKGxlZ2VuZC5kZWYoQ09MT1IsIGVuY29kaW5nLCB7XG4gICAgICBmaWxsOiBDT0xPUixcbiAgICAgIG9yaWVudDogJ3JpZ2h0J1xuICAgIH0pKTtcbiAgfVxuXG4gIGlmIChlbmNvZGluZy5oYXMoU0laRSkgJiYgZW5jb2RpbmcubGVnZW5kKFNJWkUpKSB7XG4gICAgZGVmcy5wdXNoKGxlZ2VuZC5kZWYoU0laRSwgZW5jb2RpbmcsIHtcbiAgICAgIHNpemU6IFNJWkUsXG4gICAgICBvcmllbnQ6IGRlZnMubGVuZ3RoID09PSAxID8gJ2xlZnQnIDogJ3JpZ2h0J1xuICAgIH0pKTtcbiAgfVxuXG4gIGlmIChlbmNvZGluZy5oYXMoU0hBUEUpICYmIGVuY29kaW5nLmxlZ2VuZChTSEFQRSkpIHtcbiAgICBpZiAoZGVmcy5sZW5ndGggPT09IDIpIHtcbiAgICAgIC8vIFRPRE86IGZpeCB0aGlzXG4gICAgICBjb25zb2xlLmVycm9yKCdWZWdhbGl0ZSBjdXJyZW50bHkgb25seSBzdXBwb3J0cyB0d28gbGVnZW5kcycpO1xuICAgICAgcmV0dXJuIGRlZnM7XG4gICAgfVxuICAgIGRlZnMucHVzaChsZWdlbmQuZGVmKFNIQVBFLCBlbmNvZGluZywge1xuICAgICAgc2hhcGU6IFNIQVBFLFxuICAgICAgb3JpZW50OiBkZWZzLmxlbmd0aCA9PT0gMSA/ICdsZWZ0JyA6ICdyaWdodCdcbiAgICB9KSk7XG4gIH1cblxuICByZXR1cm4gZGVmcztcbn07XG5cbmxlZ2VuZC5kZWYgPSBmdW5jdGlvbihuYW1lLCBlbmNvZGluZywgcHJvcHMpIHtcbiAgdmFyIGRlZiA9IHByb3BzLCBmbjtcblxuICBkZWYudGl0bGUgPSBlbmNvZGluZy5maWVsZFRpdGxlKG5hbWUpO1xuXG4gIGlmIChlbmNvZGluZy5pc1R5cGUobmFtZSwgVCkgJiYgKGZuID0gZW5jb2RpbmcuZm4obmFtZSkpICYmXG4gICAgdGltZS5oYXNTY2FsZShmbikpIHtcbiAgICB2YXIgcHJvcGVydGllcyA9IGRlZi5wcm9wZXJ0aWVzID0gZGVmLnByb3BlcnRpZXMgfHwge30sXG4gICAgICBsYWJlbHMgPSBwcm9wZXJ0aWVzLmxhYmVscyA9IHByb3BlcnRpZXMubGFiZWxzIHx8IHt9LFxuICAgICAgdGV4dCA9IGxhYmVscy50ZXh0ID0gbGFiZWxzLnRleHQgfHwge307XG5cbiAgICB0ZXh0LnNjYWxlID0gJ3RpbWUtJysgZm47XG4gIH1cblxuICByZXR1cm4gZGVmO1xufTtcbiIsInZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG52YXIgbWFya3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5tYXJrcy5kZWYgPSBmdW5jdGlvbihtYXJrLCBlbmNvZGluZywgbGF5b3V0LCBzdHlsZSkge1xuICB2YXIgZGVmcyA9IFtdO1xuXG4gIC8vIHRvIGFkZCBhIGJhY2tncm91bmQgdG8gdGV4dCwgd2UgbmVlZCB0byBhZGQgaXQgYmVmb3JlIHRoZSB0ZXh0XG4gIGlmIChlbmNvZGluZy5tYXJrdHlwZSgpID09PSBURVhUICYmIGVuY29kaW5nLmhhcyhDT0xPUikpIHtcbiAgICB2YXIgcCA9IHtcbiAgICAgIHg6IHt2YWx1ZTogMH0sXG4gICAgICB5OiB7dmFsdWU6IDB9LFxuICAgICAgeDI6IHt2YWx1ZTogbGF5b3V0LmNlbGxXaWR0aH0sXG4gICAgICB5Mjoge3ZhbHVlOiBsYXlvdXQuY2VsbEhlaWdodH0sXG4gICAgICBmaWxsOiB7c2NhbGU6IENPTE9SLCBmaWVsZDogZW5jb2RpbmcuZmllbGQoQ09MT1IpfVxuICAgIH07XG4gICAgZGVmcy5wdXNoKHtcbiAgICAgIHR5cGU6ICdyZWN0JyxcbiAgICAgIGZyb206IHtkYXRhOiBUQUJMRX0sXG4gICAgICBwcm9wZXJ0aWVzOiB7ZW50ZXI6IHAsIHVwZGF0ZTogcH1cbiAgICB9KTtcbiAgfVxuXG4gIC8vIGFkZCB0aGUgbWFyayBkZWYgZm9yIHRoZSBtYWluIHRoaW5nXG4gIHZhciBwID0gbWFyay5wcm9wKGVuY29kaW5nLCBsYXlvdXQsIHN0eWxlKTtcbiAgZGVmcy5wdXNoKHtcbiAgICB0eXBlOiBtYXJrLnR5cGUsXG4gICAgZnJvbToge2RhdGE6IFRBQkxFfSxcbiAgICBwcm9wZXJ0aWVzOiB7ZW50ZXI6IHAsIHVwZGF0ZTogcH1cbiAgfSk7XG5cbiAgcmV0dXJuIGRlZnM7XG59O1xuXG5tYXJrcy5iYXIgPSB7XG4gIHR5cGU6ICdyZWN0JyxcbiAgc3RhY2s6IHRydWUsXG4gIHByb3A6IGJhcl9wcm9wcyxcbiAgcmVxdWlyZWRFbmNvZGluZzogWyd4JywgJ3knXSxcbiAgc3VwcG9ydGVkRW5jb2Rpbmc6IHtyb3c6IDEsIGNvbDogMSwgeDogMSwgeTogMSwgc2l6ZTogMSwgY29sb3I6IDEsIGFscGhhOiAxfVxufTtcblxubWFya3MubGluZSA9IHtcbiAgdHlwZTogJ2xpbmUnLFxuICBsaW5lOiB0cnVlLFxuICBwcm9wOiBsaW5lX3Byb3BzLFxuICByZXF1aXJlZEVuY29kaW5nOiBbJ3gnLCAneSddLFxuICBzdXBwb3J0ZWRFbmNvZGluZzoge3JvdzogMSwgY29sOiAxLCB4OiAxLCB5OiAxLCBjb2xvcjogMSwgYWxwaGE6IDF9XG59O1xuXG5tYXJrcy5hcmVhID0ge1xuICB0eXBlOiAnYXJlYScsXG4gIHN0YWNrOiB0cnVlLFxuICBsaW5lOiB0cnVlLFxuICByZXF1aXJlZEVuY29kaW5nOiBbJ3gnLCAneSddLFxuICBwcm9wOiBhcmVhX3Byb3BzLFxuICBzdXBwb3J0ZWRFbmNvZGluZzogbWFya3MubGluZS5zdXBwb3J0ZWRFbmNvZGluZ1xufTtcblxubWFya3MuY2lyY2xlID0ge1xuICB0eXBlOiAnc3ltYm9sJyxcbiAgcHJvcDogZmlsbGVkX3BvaW50X3Byb3BzKCdjaXJjbGUnKSxcbiAgc3VwcG9ydGVkRW5jb2Rpbmc6IHtyb3c6IDEsIGNvbDogMSwgeDogMSwgeTogMSwgc2l6ZTogMSwgY29sb3I6IDEsIGFscGhhOiAxfVxufTtcblxubWFya3Muc3F1YXJlID0ge1xuICB0eXBlOiAnc3ltYm9sJyxcbiAgcHJvcDogZmlsbGVkX3BvaW50X3Byb3BzKCdzcXVhcmUnKSxcbiAgc3VwcG9ydGVkRW5jb2Rpbmc6IG1hcmtzLmNpcmNsZS5zdXBwb3J0ZWRFbmNvZGluZ1xufTtcblxubWFya3MucG9pbnQgPSB7XG4gIHR5cGU6ICdzeW1ib2wnLFxuICBwcm9wOiBwb2ludF9wcm9wcyxcbiAgc3VwcG9ydGVkRW5jb2Rpbmc6IHtyb3c6IDEsIGNvbDogMSwgeDogMSwgeTogMSwgc2l6ZTogMSwgY29sb3I6IDEsIGFscGhhOiAxLCBzaGFwZTogMX1cbn07XG5cbm1hcmtzLnRleHQgPSB7XG4gIHR5cGU6ICd0ZXh0JyxcbiAgcHJvcDogdGV4dF9wcm9wcyxcbiAgcmVxdWlyZWRFbmNvZGluZzogWyd0ZXh0J10sXG4gIHN1cHBvcnRlZEVuY29kaW5nOiB7cm93OiAxLCBjb2w6IDEsIHNpemU6IDEsIGNvbG9yOiAxLCBhbHBoYTogMSwgdGV4dDogMX1cbn07XG5cbmZ1bmN0aW9uIGJhcl9wcm9wcyhlLCBsYXlvdXQpIHtcbiAgdmFyIHAgPSB7fTtcblxuICAvLyB4XG4gIGlmIChlLmlzTWVhc3VyZShYKSkge1xuICAgIHAueCA9IHtzY2FsZTogWCwgZmllbGQ6IGUuZmllbGQoWCl9O1xuICAgIGlmIChlLmlzRGltZW5zaW9uKFkpKSB7XG4gICAgICBwLngyID0ge3NjYWxlOiBYLCB2YWx1ZTogMH07XG4gICAgfVxuICB9IGVsc2UgaWYgKGUuaGFzKFgpKSB7IC8vIGlzIG9yZGluYWxcbiAgICBwLnhjID0ge3NjYWxlOiBYLCBmaWVsZDogZS5maWVsZChYKX07XG4gIH0gZWxzZSB7XG4gICAgLy8gVE9ETyBhZGQgc2luZ2xlIGJhciBvZmZzZXRcbiAgICBwLnhjID0ge3ZhbHVlOiAwfTtcbiAgfVxuXG4gIC8vIHlcbiAgaWYgKGUuaXNNZWFzdXJlKFkpKSB7XG4gICAgcC55ID0ge3NjYWxlOiBZLCBmaWVsZDogZS5maWVsZChZKX07XG4gICAgcC55MiA9IHtzY2FsZTogWSwgdmFsdWU6IDB9O1xuICB9IGVsc2UgaWYgKGUuaGFzKFkpKSB7IC8vIGlzIG9yZGluYWxcbiAgICBwLnljID0ge3NjYWxlOiBZLCBmaWVsZDogZS5maWVsZChZKX07XG4gIH0gZWxzZSB7XG4gICAgLy8gVE9ETyBhZGQgc2luZ2xlIGJhciBvZmZzZXRcbiAgICBwLnljID0ge2dyb3VwOiAnaGVpZ2h0J307XG4gIH1cblxuICAvLyB3aWR0aFxuICBpZiAoIWUuaGFzKFgpIHx8IGUuaXNPcmRpbmFsU2NhbGUoWCkpIHsgLy8gbm8gWCBvciBYIGlzIG9yZGluYWxcbiAgICBpZiAoZS5oYXMoU0laRSkpIHtcbiAgICAgIHAud2lkdGggPSB7c2NhbGU6IFNJWkUsIGZpZWxkOiBlLmZpZWxkKFNJWkUpfTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gcC53aWR0aCA9IHtzY2FsZTogWCwgYmFuZDogdHJ1ZSwgb2Zmc2V0OiAtMX07XG4gICAgICBwLndpZHRoID0ge3ZhbHVlOiBlLmJhbmRTaXplKFgsIGxheW91dC54LnVzZVNtYWxsQmFuZCksIG9mZnNldDogLTF9O1xuICAgIH1cbiAgfSBlbHNlIHsgLy8gWCBpcyBRdWFudCBvciBUaW1lIFNjYWxlXG4gICAgcC53aWR0aCA9IHt2YWx1ZTogZS5iYW5kU2l6ZShYLCBsYXlvdXQueC51c2VTbWFsbEJhbmQpLCBvZmZzZXQ6IC0xfTtcbiAgfVxuXG4gIC8vIGhlaWdodFxuICBpZiAoIWUuaGFzKFkpIHx8IGUuaXNPcmRpbmFsU2NhbGUoWSkpIHsgLy8gbm8gWSBvciBZIGlzIG9yZGluYWxcbiAgICBpZiAoZS5oYXMoU0laRSkpIHtcbiAgICAgIHAuaGVpZ2h0ID0ge3NjYWxlOiBTSVpFLCBmaWVsZDogZS5maWVsZChTSVpFKX07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHAuaGVpZ2h0ID0ge3NjYWxlOiBZLCBiYW5kOiB0cnVlLCBvZmZzZXQ6IC0xfTtcbiAgICAgIHAuaGVpZ2h0ID0ge3ZhbHVlOiBlLmJhbmRTaXplKFksIGxheW91dC55LnVzZVNtYWxsQmFuZCksIG9mZnNldDogLTF9O1xuICAgIH1cbiAgfSBlbHNlIHsgLy8gWSBpcyBRdWFudCBvciBUaW1lIFNjYWxlXG4gICAgcC5oZWlnaHQgPSB7dmFsdWU6IGUuYmFuZFNpemUoWSwgbGF5b3V0LnkudXNlU21hbGxCYW5kKSwgb2Zmc2V0OiAtMX07XG4gIH1cblxuICAvLyBmaWxsXG4gIGlmIChlLmhhcyhDT0xPUikpIHtcbiAgICBwLmZpbGwgPSB7c2NhbGU6IENPTE9SLCBmaWVsZDogZS5maWVsZChDT0xPUil9O1xuICB9IGVsc2Uge1xuICAgIHAuZmlsbCA9IHt2YWx1ZTogZS52YWx1ZShDT0xPUil9O1xuICB9XG5cbiAgLy8gYWxwaGFcbiAgaWYgKGUuaGFzKEFMUEhBKSkge1xuICAgIHAub3BhY2l0eSA9IHtzY2FsZTogQUxQSEEsIGZpZWxkOiBlLmZpZWxkKEFMUEhBKX07XG4gIH0gZWxzZSBpZiAoZS52YWx1ZShBTFBIQSkgIT09IHVuZGVmaW5lZCkge1xuICAgIHAub3BhY2l0eSA9IHt2YWx1ZTogZS52YWx1ZShBTFBIQSl9O1xuICB9XG5cbiAgcmV0dXJuIHA7XG59XG5cbmZ1bmN0aW9uIHBvaW50X3Byb3BzKGUsIGxheW91dCwgc3R5bGUpIHtcbiAgdmFyIHAgPSB7fTtcblxuICAvLyB4XG4gIGlmIChlLmhhcyhYKSkge1xuICAgIHAueCA9IHtzY2FsZTogWCwgZmllbGQ6IGUuZmllbGQoWCl9O1xuICB9IGVsc2UgaWYgKCFlLmhhcyhYKSkge1xuICAgIHAueCA9IHt2YWx1ZTogZS5iYW5kU2l6ZShYLCBsYXlvdXQueC51c2VTbWFsbEJhbmQpIC8gMn07XG4gIH1cblxuICAvLyB5XG4gIGlmIChlLmhhcyhZKSkge1xuICAgIHAueSA9IHtzY2FsZTogWSwgZmllbGQ6IGUuZmllbGQoWSl9O1xuICB9IGVsc2UgaWYgKCFlLmhhcyhZKSkge1xuICAgIHAueSA9IHt2YWx1ZTogZS5iYW5kU2l6ZShZLCBsYXlvdXQueS51c2VTbWFsbEJhbmQpIC8gMn07XG4gIH1cblxuICAvLyBzaXplXG4gIGlmIChlLmhhcyhTSVpFKSkge1xuICAgIHAuc2l6ZSA9IHtzY2FsZTogU0laRSwgZmllbGQ6IGUuZmllbGQoU0laRSl9O1xuICB9IGVsc2UgaWYgKCFlLmhhcyhTSVpFKSkge1xuICAgIHAuc2l6ZSA9IHt2YWx1ZTogZS52YWx1ZShTSVpFKX07XG4gIH1cblxuICAvLyBzaGFwZVxuICBpZiAoZS5oYXMoU0hBUEUpKSB7XG4gICAgcC5zaGFwZSA9IHtzY2FsZTogU0hBUEUsIGZpZWxkOiBlLmZpZWxkKFNIQVBFKX07XG4gIH0gZWxzZSBpZiAoIWUuaGFzKFNIQVBFKSkge1xuICAgIHAuc2hhcGUgPSB7dmFsdWU6IGUudmFsdWUoU0hBUEUpfTtcbiAgfVxuXG4gIC8vIHN0cm9rZVxuICBpZiAoZS5oYXMoQ09MT1IpKSB7XG4gICAgcC5zdHJva2UgPSB7c2NhbGU6IENPTE9SLCBmaWVsZDogZS5maWVsZChDT0xPUil9O1xuICB9IGVsc2UgaWYgKCFlLmhhcyhDT0xPUikpIHtcbiAgICBwLnN0cm9rZSA9IHt2YWx1ZTogZS52YWx1ZShDT0xPUil9O1xuICB9XG5cbiAgLy8gYWxwaGFcbiAgaWYgKGUuaGFzKEFMUEhBKSkge1xuICAgIHAub3BhY2l0eSA9IHtzY2FsZTogQUxQSEEsIGZpZWxkOiBlLmZpZWxkKEFMUEhBKX07XG4gIH0gZWxzZSBpZiAoZS52YWx1ZShBTFBIQSkgIT09IHVuZGVmaW5lZCkge1xuICAgIHAub3BhY2l0eSA9IHt2YWx1ZTogZS52YWx1ZShBTFBIQSl9O1xuICB9IGVsc2Uge1xuICAgIHAub3BhY2l0eSA9IHt2YWx1ZTogc3R5bGUub3BhY2l0eX07XG4gIH1cblxuICBwLnN0cm9rZVdpZHRoID0ge3ZhbHVlOiBlLmNvbmZpZygnc3Ryb2tlV2lkdGgnKX07XG5cbiAgcmV0dXJuIHA7XG59XG5cbmZ1bmN0aW9uIGxpbmVfcHJvcHMoZSwgbGF5b3V0LCBzdHlsZSkge1xuICB2YXIgcCA9IHt9O1xuXG4gIC8vIHhcbiAgaWYgKGUuaGFzKFgpKSB7XG4gICAgcC54ID0ge3NjYWxlOiBYLCBmaWVsZDogZS5maWVsZChYKX07XG4gIH0gZWxzZSBpZiAoIWUuaGFzKFgpKSB7XG4gICAgcC54ID0ge3ZhbHVlOiAwfTtcbiAgfVxuXG4gIC8vIHlcbiAgaWYgKGUuaGFzKFkpKSB7XG4gICAgcC55ID0ge3NjYWxlOiBZLCBmaWVsZDogZS5maWVsZChZKX07XG4gIH0gZWxzZSBpZiAoIWUuaGFzKFkpKSB7XG4gICAgcC55ID0ge2dyb3VwOiAnaGVpZ2h0J307XG4gIH1cblxuICAvLyBzdHJva2VcbiAgaWYgKGUuaGFzKENPTE9SKSkge1xuICAgIHAuc3Ryb2tlID0ge3NjYWxlOiBDT0xPUiwgZmllbGQ6IGUuZmllbGQoQ09MT1IpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoQ09MT1IpKSB7XG4gICAgcC5zdHJva2UgPSB7dmFsdWU6IGUudmFsdWUoQ09MT1IpfTtcbiAgfVxuXG4gIC8vIGFscGhhXG4gIGlmIChlLmhhcyhBTFBIQSkpIHtcbiAgICBwLm9wYWNpdHkgPSB7c2NhbGU6IEFMUEhBLCBmaWVsZDogZS5maWVsZChBTFBIQSl9O1xuICB9IGVsc2UgaWYgKGUudmFsdWUoQUxQSEEpICE9PSB1bmRlZmluZWQpIHtcbiAgICBwLm9wYWNpdHkgPSB7dmFsdWU6IGUudmFsdWUoQUxQSEEpfTtcbiAgfVxuXG4gIHAuc3Ryb2tlV2lkdGggPSB7dmFsdWU6IGUuY29uZmlnKCdzdHJva2VXaWR0aCcpfTtcblxuICByZXR1cm4gcDtcbn1cblxuZnVuY3Rpb24gYXJlYV9wcm9wcyhlLCBsYXlvdXQsIHN0eWxlKSB7XG4gIHZhciBwID0ge307XG5cbiAgLy8geFxuICBpZiAoZS5pc01lYXN1cmUoWCkpIHtcbiAgICBwLnggPSB7c2NhbGU6IFgsIGZpZWxkOiBlLmZpZWxkKFgpfTtcbiAgICBpZiAoZS5pc0RpbWVuc2lvbihZKSkge1xuICAgICAgcC54MiA9IHtzY2FsZTogWCwgdmFsdWU6IDB9O1xuICAgICAgcC5vcmllbnQgPSB7dmFsdWU6ICdob3Jpem9udGFsJ307XG4gICAgfVxuICB9IGVsc2UgaWYgKGUuaGFzKFgpKSB7XG4gICAgcC54ID0ge3NjYWxlOiBYLCBmaWVsZDogZS5maWVsZChYKX07XG4gIH0gZWxzZSB7XG4gICAgcC54ID0ge3ZhbHVlOiAwfTtcbiAgfVxuXG4gIC8vIHlcbiAgaWYgKGUuaXNNZWFzdXJlKFkpKSB7XG4gICAgcC55ID0ge3NjYWxlOiBZLCBmaWVsZDogZS5maWVsZChZKX07XG4gICAgcC55MiA9IHtzY2FsZTogWSwgdmFsdWU6IDB9O1xuICB9IGVsc2UgaWYgKGUuaGFzKFkpKSB7XG4gICAgcC55ID0ge3NjYWxlOiBZLCBmaWVsZDogZS5maWVsZChZKX07XG4gIH0gZWxzZSB7XG4gICAgcC55ID0ge2dyb3VwOiAnaGVpZ2h0J307XG4gIH1cblxuICAvLyBzdHJva2VcbiAgaWYgKGUuaGFzKENPTE9SKSkge1xuICAgIHAuZmlsbCA9IHtzY2FsZTogQ09MT1IsIGZpZWxkOiBlLmZpZWxkKENPTE9SKX07XG4gIH0gZWxzZSBpZiAoIWUuaGFzKENPTE9SKSkge1xuICAgIHAuZmlsbCA9IHt2YWx1ZTogZS52YWx1ZShDT0xPUil9O1xuICB9XG5cbiAgLy8gYWxwaGFcbiAgaWYgKGUuaGFzKEFMUEhBKSkge1xuICAgIHAub3BhY2l0eSA9IHtzY2FsZTogQUxQSEEsIGZpZWxkOiBlLmZpZWxkKEFMUEhBKX07XG4gIH0gZWxzZSBpZiAoZS52YWx1ZShBTFBIQSkgIT09IHVuZGVmaW5lZCkge1xuICAgIHAub3BhY2l0eSA9IHt2YWx1ZTogZS52YWx1ZShBTFBIQSl9O1xuICB9XG5cbiAgcmV0dXJuIHA7XG59XG5cbmZ1bmN0aW9uIGZpbGxlZF9wb2ludF9wcm9wcyhzaGFwZSkge1xuICByZXR1cm4gZnVuY3Rpb24oZSwgbGF5b3V0LCBzdHlsZSkge1xuICAgIHZhciBwID0ge307XG5cbiAgICAvLyB4XG4gICAgaWYgKGUuaGFzKFgpKSB7XG4gICAgICBwLnggPSB7c2NhbGU6IFgsIGZpZWxkOiBlLmZpZWxkKFgpfTtcbiAgICB9IGVsc2UgaWYgKCFlLmhhcyhYKSkge1xuICAgICAgcC54ID0ge3ZhbHVlOiBlLmJhbmRTaXplKFgsIGxheW91dC54LnVzZVNtYWxsQmFuZCkgLyAyfTtcbiAgICB9XG5cbiAgICAvLyB5XG4gICAgaWYgKGUuaGFzKFkpKSB7XG4gICAgICBwLnkgPSB7c2NhbGU6IFksIGZpZWxkOiBlLmZpZWxkKFkpfTtcbiAgICB9IGVsc2UgaWYgKCFlLmhhcyhZKSkge1xuICAgICAgcC55ID0ge3ZhbHVlOiBlLmJhbmRTaXplKFksIGxheW91dC55LnVzZVNtYWxsQmFuZCkgLyAyfTtcbiAgICB9XG5cbiAgICAvLyBzaXplXG4gICAgaWYgKGUuaGFzKFNJWkUpKSB7XG4gICAgICBwLnNpemUgPSB7c2NhbGU6IFNJWkUsIGZpZWxkOiBlLmZpZWxkKFNJWkUpfTtcbiAgICB9IGVsc2UgaWYgKCFlLmhhcyhYKSkge1xuICAgICAgcC5zaXplID0ge3ZhbHVlOiBlLnZhbHVlKFNJWkUpfTtcbiAgICB9XG5cbiAgICAvLyBzaGFwZVxuICAgIHAuc2hhcGUgPSB7dmFsdWU6IHNoYXBlfTtcblxuICAgIC8vIGZpbGxcbiAgICBpZiAoZS5oYXMoQ09MT1IpKSB7XG4gICAgICBwLmZpbGwgPSB7c2NhbGU6IENPTE9SLCBmaWVsZDogZS5maWVsZChDT0xPUil9O1xuICAgIH0gZWxzZSBpZiAoIWUuaGFzKENPTE9SKSkge1xuICAgICAgcC5maWxsID0ge3ZhbHVlOiBlLnZhbHVlKENPTE9SKX07XG4gICAgfVxuXG4gICAgLy8gYWxwaGFcbiAgICBpZiAoZS5oYXMoQUxQSEEpKSB7XG4gICAgICBwLm9wYWNpdHkgPSB7c2NhbGU6IEFMUEhBLCBmaWVsZDogZS5maWVsZChBTFBIQSl9O1xuICAgIH0gZWxzZSBpZiAoZS52YWx1ZShBTFBIQSkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcC5vcGFjaXR5ID0ge3ZhbHVlOiBlLnZhbHVlKEFMUEhBKX07XG4gICAgfSBlbHNlIHtcbiAgICAgIHAub3BhY2l0eSA9IHt2YWx1ZTogc3R5bGUub3BhY2l0eX07XG4gICAgfVxuXG4gICAgcmV0dXJuIHA7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHRleHRfcHJvcHMoZSwgbGF5b3V0LCBzdHlsZSkge1xuICB2YXIgcCA9IHt9O1xuXG4gIC8vIHhcbiAgaWYgKGUuaGFzKFgpKSB7XG4gICAgcC54ID0ge3NjYWxlOiBYLCBmaWVsZDogZS5maWVsZChYKX07XG4gIH0gZWxzZSBpZiAoIWUuaGFzKFgpKSB7XG4gICAgcC54ID0ge3ZhbHVlOiBlLmJhbmRTaXplKFgsIGxheW91dC54LnVzZVNtYWxsQmFuZCkgLyAyfTtcbiAgfVxuXG4gIC8vIHlcbiAgaWYgKGUuaGFzKFkpKSB7XG4gICAgcC55ID0ge3NjYWxlOiBZLCBmaWVsZDogZS5maWVsZChZKX07XG4gIH0gZWxzZSBpZiAoIWUuaGFzKFkpKSB7XG4gICAgcC55ID0ge3ZhbHVlOiBlLmJhbmRTaXplKFksIGxheW91dC55LnVzZVNtYWxsQmFuZCkgLyAyfTtcbiAgfVxuXG4gIC8vIHNpemVcbiAgaWYgKGUuaGFzKFNJWkUpKSB7XG4gICAgcC5mb250U2l6ZSA9IHtzY2FsZTogU0laRSwgZmllbGQ6IGUuZmllbGQoU0laRSl9O1xuICB9IGVsc2UgaWYgKCFlLmhhcyhTSVpFKSkge1xuICAgIHAuZm9udFNpemUgPSB7dmFsdWU6IGUuZm9udCgnc2l6ZScpfTtcbiAgfVxuXG4gIC8vIGZpbGxcbiAgLy8gY29sb3Igc2hvdWxkIGJlIHNldCB0byBiYWNrZ3JvdW5kXG4gIHAuZmlsbCA9IHt2YWx1ZTogJ2JsYWNrJ307XG5cbiAgLy8gYWxwaGFcbiAgaWYgKGUuaGFzKEFMUEhBKSkge1xuICAgIHAub3BhY2l0eSA9IHtzY2FsZTogQUxQSEEsIGZpZWxkOiBlLmZpZWxkKEFMUEhBKX07XG4gIH0gZWxzZSBpZiAoZS52YWx1ZShBTFBIQSkgIT09IHVuZGVmaW5lZCkge1xuICAgIHAub3BhY2l0eSA9IHt2YWx1ZTogZS52YWx1ZShBTFBIQSl9O1xuICB9IGVsc2Uge1xuICAgIHAub3BhY2l0eSA9IHt2YWx1ZTogc3R5bGUub3BhY2l0eX07XG4gIH1cblxuICAvLyB0ZXh0XG4gIGlmIChlLmhhcyhURVhUKSkge1xuICAgIGlmIChlLmlzVHlwZShURVhULCBRKSkge1xuICAgICAgcC50ZXh0ID0ge3RlbXBsYXRlOiBcInt7XCIgKyBlLmZpZWxkKFRFWFQpICsgXCIgfCBudW1iZXI6Jy4zcyd9fVwifTtcbiAgICB9IGVsc2Uge1xuICAgICAgcC50ZXh0ID0ge2ZpZWxkOiBlLmZpZWxkKFRFWFQpfTtcbiAgICB9XG4gICAgcC5hbGlnbiA9IHt2YWx1ZTogJ2xlZnQnfTtcbiAgfSBlbHNlIHtcbiAgICBwLnRleHQgPSB7dmFsdWU6ICdBYmMnfTtcbiAgfVxuXG4gIHAuZm9udCA9IHt2YWx1ZTogZS5mb250KCdmYW1pbHknKX07XG4gIHAuZm9udFdlaWdodCA9IHt2YWx1ZTogZS5mb250KCd3ZWlnaHQnKX07XG4gIHAuZm9udFN0eWxlID0ge3ZhbHVlOiBlLmZvbnQoJ3N0eWxlJyl9O1xuICBwLmJhc2VsaW5lID0ge3ZhbHVlOiBlLnRleHQoJ2Jhc2VsaW5lJyl9O1xuXG4gIHJldHVybiBwO1xufVxuIiwidmFyIGdsb2JhbHMgPSByZXF1aXJlKCcuLi9nbG9iYWxzJyksXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyksXG4gIHRpbWUgPSByZXF1aXJlKCcuL3RpbWUnKTtcblxudmFyIHNjYWxlID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuc2NhbGUubmFtZXMgPSBmdW5jdGlvbihwcm9wcykge1xuICByZXR1cm4gdXRpbC5rZXlzKHV0aWwua2V5cyhwcm9wcykucmVkdWNlKGZ1bmN0aW9uKGEsIHgpIHtcbiAgICBpZiAocHJvcHNbeF0gJiYgcHJvcHNbeF0uc2NhbGUpIGFbcHJvcHNbeF0uc2NhbGVdID0gMTtcbiAgICByZXR1cm4gYTtcbiAgfSwge30pKTtcbn07XG5cbnNjYWxlLmRlZnMgPSBmdW5jdGlvbihuYW1lcywgZW5jb2RpbmcsIGxheW91dCwgc3R5bGUsIHNvcnRpbmcsIG9wdCkge1xuICBvcHQgPSBvcHQgfHwge307XG5cbiAgcmV0dXJuIG5hbWVzLnJlZHVjZShmdW5jdGlvbihhLCBuYW1lKSB7XG4gICAgdmFyIHMgPSB7XG4gICAgICBuYW1lOiBuYW1lLFxuICAgICAgdHlwZTogc2NhbGUudHlwZShuYW1lLCBlbmNvZGluZyksXG4gICAgICBkb21haW46IHNjYWxlX2RvbWFpbihuYW1lLCBlbmNvZGluZywgc29ydGluZywgb3B0KVxuICAgIH07XG4gICAgaWYgKHMudHlwZSA9PT0gJ29yZGluYWwnICYmICFlbmNvZGluZy5iaW4obmFtZSkgJiYgZW5jb2Rpbmcuc29ydChuYW1lKS5sZW5ndGggPT09IDApIHtcbiAgICAgIHMuc29ydCA9IHRydWU7XG4gICAgfVxuXG4gICAgc2NhbGVfcmFuZ2UocywgZW5jb2RpbmcsIGxheW91dCwgc3R5bGUsIG9wdCk7XG5cbiAgICByZXR1cm4gKGEucHVzaChzKSwgYSk7XG4gIH0sIFtdKTtcbn07XG5cbnNjYWxlLnR5cGUgPSBmdW5jdGlvbihuYW1lLCBlbmNvZGluZykge1xuXG4gIHN3aXRjaCAoZW5jb2RpbmcudHlwZShuYW1lKSkge1xuICAgIGNhc2UgTzogcmV0dXJuICdvcmRpbmFsJztcbiAgICBjYXNlIFQ6XG4gICAgICB2YXIgZm4gPSBlbmNvZGluZy5mbihuYW1lKTtcbiAgICAgIHJldHVybiAoZm4gJiYgdGltZS5zY2FsZS50eXBlKGZuKSkgfHwgJ3RpbWUnO1xuICAgIGNhc2UgUTpcbiAgICAgIGlmIChlbmNvZGluZy5iaW4obmFtZSkpIHtcbiAgICAgICAgcmV0dXJuICdvcmRpbmFsJztcbiAgICAgIH1cbiAgICAgIHJldHVybiBlbmNvZGluZy5zY2FsZShuYW1lKS50eXBlO1xuICB9XG59O1xuXG5mdW5jdGlvbiBzY2FsZV9kb21haW4obmFtZSwgZW5jb2RpbmcsIHNvcnRpbmcsIG9wdCkge1xuICBpZiAoZW5jb2RpbmcuaXNUeXBlKG5hbWUsIFQpKSB7XG4gICAgdmFyIHJhbmdlID0gdGltZS5zY2FsZS5kb21haW4oZW5jb2RpbmcuZm4obmFtZSkpO1xuICAgIGlmKHJhbmdlKSByZXR1cm4gcmFuZ2U7XG4gIH1cblxuICBpZiAoZW5jb2RpbmcuYmluKG5hbWUpKSB7XG4gICAgLy8gVE9ETzogYWRkIGluY2x1ZGVFbXB0eUNvbmZpZyBoZXJlXG4gICAgaWYgKG9wdC5zdGF0cykge1xuICAgICAgdmFyIGJpbnMgPSB1dGlsLmdldGJpbnMob3B0LnN0YXRzW2VuY29kaW5nLmZpZWxkTmFtZShuYW1lKV0sIGVuY29kaW5nLmJpbihuYW1lKS5tYXhiaW5zKTtcbiAgICAgIHZhciBkb21haW4gPSB1dGlsLnJhbmdlKGJpbnMuc3RhcnQsIGJpbnMuc3RvcCwgYmlucy5zdGVwKTtcbiAgICAgIHJldHVybiBuYW1lID09PSBZID8gZG9tYWluLnJldmVyc2UoKSA6IGRvbWFpbjtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmFtZSA9PSBvcHQuc3RhY2sgP1xuICAgIHtcbiAgICAgIGRhdGE6IFNUQUNLRUQsXG4gICAgICBmaWVsZDogJ2RhdGEuJyArIChvcHQuZmFjZXQgPyAnbWF4XycgOiAnJykgKyAnc3VtXycgKyBlbmNvZGluZy5maWVsZChuYW1lLCB0cnVlKVxuICAgIH0gOlxuICAgIHtkYXRhOiBzb3J0aW5nLmdldERhdGFzZXQobmFtZSksIGZpZWxkOiBlbmNvZGluZy5maWVsZChuYW1lKX07XG59XG5cbmZ1bmN0aW9uIHNjYWxlX3JhbmdlKHMsIGVuY29kaW5nLCBsYXlvdXQsIHN0eWxlLCBvcHQpIHtcbiAgdmFyIHNwZWMgPSBlbmNvZGluZy5zY2FsZShzLm5hbWUpO1xuICBzd2l0Y2ggKHMubmFtZSkge1xuICAgIGNhc2UgWDpcbiAgICAgIGlmIChzLnR5cGUgPT09ICdvcmRpbmFsJykge1xuICAgICAgICBzLmJhbmRXaWR0aCA9IGVuY29kaW5nLmJhbmRTaXplKFgsIGxheW91dC54LnVzZVNtYWxsQmFuZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzLnJhbmdlID0gbGF5b3V0LmNlbGxXaWR0aCA/IFswLCBsYXlvdXQuY2VsbFdpZHRoXSA6ICd3aWR0aCc7XG4gICAgICAgIHMuemVybyA9IHNwZWMuemVybyB8fFxuICAgICAgICAgICggZW5jb2RpbmcuaXNUeXBlKHMubmFtZSxUKSAmJiBlbmNvZGluZy5mbihzLm5hbWUpID09PSAneWVhcicgPyBmYWxzZSA6IHRydWUgKTtcbiAgICAgICAgcy5yZXZlcnNlID0gc3BlYy5yZXZlcnNlO1xuICAgICAgfVxuICAgICAgcy5yb3VuZCA9IHRydWU7XG4gICAgICBpZiAocy50eXBlID09PSAndGltZScpIHtcbiAgICAgICAgcy5uaWNlID0gZW5jb2RpbmcuZm4ocy5uYW1lKTtcbiAgICAgIH1lbHNlIHtcbiAgICAgICAgcy5uaWNlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgWTpcbiAgICAgIGlmIChzLnR5cGUgPT09ICdvcmRpbmFsJykge1xuICAgICAgICBzLmJhbmRXaWR0aCA9IGVuY29kaW5nLmJhbmRTaXplKFksIGxheW91dC55LnVzZVNtYWxsQmFuZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzLnJhbmdlID0gbGF5b3V0LmNlbGxIZWlnaHQgPyBbbGF5b3V0LmNlbGxIZWlnaHQsIDBdIDogJ2hlaWdodCc7XG4gICAgICAgIHMuemVybyA9IHNwZWMuemVybyB8fFxuICAgICAgICAgICggZW5jb2RpbmcuaXNUeXBlKHMubmFtZSwgVCkgJiYgZW5jb2RpbmcuZm4ocy5uYW1lKSA9PT0gJ3llYXInID8gZmFsc2UgOiB0cnVlICk7XG4gICAgICAgIHMucmV2ZXJzZSA9IHNwZWMucmV2ZXJzZTtcbiAgICAgIH1cblxuICAgICAgcy5yb3VuZCA9IHRydWU7XG5cbiAgICAgIGlmIChzLnR5cGUgPT09ICd0aW1lJykge1xuICAgICAgICBzLm5pY2UgPSBlbmNvZGluZy5mbihzLm5hbWUpIHx8IGVuY29kaW5nLmNvbmZpZygndGltZVNjYWxlTmljZScpO1xuICAgICAgfWVsc2Uge1xuICAgICAgICBzLm5pY2UgPSB0cnVlO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSBST1c6IC8vIHN1cHBvcnQgb25seSBvcmRpbmFsXG4gICAgICBzLmJhbmRXaWR0aCA9IGxheW91dC5jZWxsSGVpZ2h0O1xuICAgICAgcy5yb3VuZCA9IHRydWU7XG4gICAgICBzLm5pY2UgPSB0cnVlO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBDT0w6IC8vIHN1cHBvcnQgb25seSBvcmRpbmFsXG4gICAgICBzLmJhbmRXaWR0aCA9IGxheW91dC5jZWxsV2lkdGg7XG4gICAgICBzLnJvdW5kID0gdHJ1ZTtcbiAgICAgIHMubmljZSA9IHRydWU7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFNJWkU6XG4gICAgICBpZiAoZW5jb2RpbmcuaXMoJ2JhcicpKSB7XG4gICAgICAgIC8vIEZJWE1FIHRoaXMgaXMgZGVmaW5pdGVseSBpbmNvcnJlY3RcbiAgICAgICAgLy8gYnV0IGxldCdzIGZpeCBpdCBsYXRlciBzaW5jZSBiYXIgc2l6ZSBpcyBhIGJhZCBlbmNvZGluZyBhbnl3YXlcbiAgICAgICAgcy5yYW5nZSA9IFszLCBNYXRoLm1heChlbmNvZGluZy5iYW5kU2l6ZShYKSwgZW5jb2RpbmcuYmFuZFNpemUoWSkpXTtcbiAgICAgIH0gZWxzZSBpZiAoZW5jb2RpbmcuaXMoVEVYVCkpIHtcbiAgICAgICAgcy5yYW5nZSA9IFs4LCA0MF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzLnJhbmdlID0gWzEwLCA0MDBdO1xuICAgICAgfVxuICAgICAgcy5yb3VuZCA9IHRydWU7XG4gICAgICBzLnplcm8gPSBmYWxzZTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgU0hBUEU6XG4gICAgICBzLnJhbmdlID0gJ3NoYXBlcyc7XG4gICAgICBicmVhaztcbiAgICBjYXNlIENPTE9SOlxuICAgICAgdmFyIHJhbmdlID0gZW5jb2Rpbmcuc2NhbGUoQ09MT1IpLnJhbmdlO1xuICAgICAgaWYgKHJhbmdlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKHMudHlwZSA9PT0gJ29yZGluYWwnKSB7XG4gICAgICAgICAgcmFuZ2UgPSBzdHlsZS5jb2xvclJhbmdlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJhbmdlID0gWycjZGRmJywgJ3N0ZWVsYmx1ZSddO1xuICAgICAgICAgIHMuemVybyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzLnJhbmdlID0gcmFuZ2U7XG4gICAgICBicmVhaztcbiAgICBjYXNlIEFMUEhBOlxuICAgICAgcy5yYW5nZSA9IFswLjIsIDEuMF07XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nIG5hbWU6ICcrIHMubmFtZSk7XG4gIH1cblxuICBzd2l0Y2ggKHMubmFtZSkge1xuICAgIGNhc2UgUk9XOlxuICAgIGNhc2UgQ09MOlxuICAgICAgcy5wYWRkaW5nID0gZW5jb2RpbmcuY29uZmlnKCdjZWxsUGFkZGluZycpO1xuICAgICAgcy5vdXRlclBhZGRpbmcgPSAwO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBYOlxuICAgIGNhc2UgWTpcbiAgICAgIGlmIChzLnR5cGUgPT09ICdvcmRpbmFsJykgeyAvLyYmICFzLmJhbmRXaWR0aFxuICAgICAgICBzLnBvaW50cyA9IHRydWU7XG4gICAgICAgIHMucGFkZGluZyA9IGVuY29kaW5nLmJhbmQocy5uYW1lKS5wYWRkaW5nO1xuICAgICAgfVxuICB9XG59XG4iLCJ2YXIgZ2xvYmFscyA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBhZGRTb3J0VHJhbnNmb3JtcztcblxuLy8gYWRkcyBuZXcgdHJhbnNmb3JtcyB0aGF0IHByb2R1Y2Ugc29ydGVkIGZpZWxkc1xuZnVuY3Rpb24gYWRkU29ydFRyYW5zZm9ybXMoc3BlYywgZW5jb2RpbmcsIG9wdCkge1xuICB2YXIgZGF0YXNldE1hcHBpbmcgPSB7fTtcbiAgdmFyIGNvdW50ZXIgPSAwO1xuXG4gIGVuY29kaW5nLmZvckVhY2goZnVuY3Rpb24oZW5jVHlwZSwgZmllbGQpIHtcbiAgICB2YXIgc29ydEJ5ID0gZW5jb2Rpbmcuc29ydChlbmNUeXBlKTtcbiAgICBpZiAoc29ydEJ5Lmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBmaWVsZHMgPSBzb3J0QnkubWFwKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBvcDogZC5hZ2dyLFxuICAgICAgICAgIGZpZWxkOiAnZGF0YS4nICsgZC5uYW1lXG4gICAgICAgIH07XG4gICAgICB9KTtcblxuICAgICAgdmFyIGJ5Q2xhdXNlID0gc29ydEJ5Lm1hcChmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiAoZC5yZXZlcnNlID8gJy0nIDogJycpICsgJ2RhdGEuJyArIGQuYWdnciArICdfJyArIGQubmFtZTtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgZGF0YU5hbWUgPSAnc29ydGVkJyArIGNvdW50ZXIrKztcblxuICAgICAgdmFyIHRyYW5zZm9ybXMgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlOiAnYWdncmVnYXRlJyxcbiAgICAgICAgICBncm91cGJ5OiBbJ2RhdGEuJyArIGZpZWxkLm5hbWVdLFxuICAgICAgICAgIGZpZWxkczogZmllbGRzXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlOiAnc29ydCcsXG4gICAgICAgICAgYnk6IGJ5Q2xhdXNlXG4gICAgICAgIH1cbiAgICAgIF07XG5cbiAgICAgIHNwZWMuZGF0YS5wdXNoKHtcbiAgICAgICAgbmFtZTogZGF0YU5hbWUsXG4gICAgICAgIHNvdXJjZTogUkFXLFxuICAgICAgICB0cmFuc2Zvcm06IHRyYW5zZm9ybXNcbiAgICAgIH0pO1xuXG4gICAgICBkYXRhc2V0TWFwcGluZ1tlbmNUeXBlXSA9IGRhdGFOYW1lO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHtcbiAgICBzcGVjOiBzcGVjLFxuICAgIGdldERhdGFzZXQ6IGZ1bmN0aW9uKGVuY1R5cGUpIHtcbiAgICAgIHZhciBkYXRhID0gZGF0YXNldE1hcHBpbmdbZW5jVHlwZV07XG4gICAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgcmV0dXJuIFRBQkxFO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICB9O1xufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpLFxuICBtYXJrcyA9IHJlcXVpcmUoJy4vbWFya3MnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBzdGFja2luZztcblxuZnVuY3Rpb24gc3RhY2tpbmcoc3BlYywgZW5jb2RpbmcsIG1kZWYsIGZhY2V0cykge1xuICBpZiAoIW1hcmtzW2VuY29kaW5nLm1hcmt0eXBlKCldLnN0YWNrKSByZXR1cm4gZmFsc2U7XG5cbiAgLy8gVE9ETzogYWRkIHx8IGVuY29kaW5nLmhhcyhMT0QpIGhlcmUgb25jZSBMT0QgaXMgaW1wbGVtZW50ZWRcbiAgaWYgKCFlbmNvZGluZy5oYXMoQ09MT1IpKSByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIGRpbT1udWxsLCB2YWw9bnVsbCwgaWR4ID1udWxsLFxuICAgIGlzWE1lYXN1cmUgPSBlbmNvZGluZy5pc01lYXN1cmUoWCksXG4gICAgaXNZTWVhc3VyZSA9IGVuY29kaW5nLmlzTWVhc3VyZShZKTtcblxuICBpZiAoaXNYTWVhc3VyZSAmJiAhaXNZTWVhc3VyZSkge1xuICAgIGRpbSA9IFk7XG4gICAgdmFsID0gWDtcbiAgICBpZHggPSAwO1xuICB9IGVsc2UgaWYgKGlzWU1lYXN1cmUgJiYgIWlzWE1lYXN1cmUpIHtcbiAgICBkaW0gPSBYO1xuICAgIHZhbCA9IFk7XG4gICAgaWR4ID0gMTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDsgLy8gbm8gc3RhY2sgZW5jb2RpbmdcbiAgfVxuXG4gIC8vIGFkZCB0cmFuc2Zvcm0gdG8gY29tcHV0ZSBzdW1zIGZvciBzY2FsZVxuICB2YXIgc3RhY2tlZCA9IHtcbiAgICBuYW1lOiBTVEFDS0VELFxuICAgIHNvdXJjZTogVEFCTEUsXG4gICAgdHJhbnNmb3JtOiBbe1xuICAgICAgdHlwZTogJ2FnZ3JlZ2F0ZScsXG4gICAgICBncm91cGJ5OiBbZW5jb2RpbmcuZmllbGQoZGltKV0uY29uY2F0KGZhY2V0cyksIC8vIGRpbSBhbmQgb3RoZXIgZmFjZXRzXG4gICAgICBmaWVsZHM6IFt7b3A6ICdzdW0nLCBmaWVsZDogZW5jb2RpbmcuZmllbGQodmFsKX1dIC8vIFRPRE8gY2hlY2sgaWYgZmllbGQgd2l0aCBhZ2dyIGlzIGNvcnJlY3Q/XG4gICAgfV1cbiAgfTtcblxuICBpZiAoZmFjZXRzICYmIGZhY2V0cy5sZW5ndGggPiAwKSB7XG4gICAgc3RhY2tlZC50cmFuc2Zvcm0ucHVzaCh7IC8vY2FsY3VsYXRlIG1heCBmb3IgZWFjaCBmYWNldFxuICAgICAgdHlwZTogJ2FnZ3JlZ2F0ZScsXG4gICAgICBncm91cGJ5OiBmYWNldHMsXG4gICAgICBmaWVsZHM6IFt7b3A6ICdtYXgnLCBmaWVsZDogJ2RhdGEuc3VtXycgKyBlbmNvZGluZy5maWVsZCh2YWwsIHRydWUpfV1cbiAgICB9KTtcbiAgfVxuXG4gIHNwZWMuZGF0YS5wdXNoKHN0YWNrZWQpO1xuXG4gIC8vIGFkZCBzdGFjayB0cmFuc2Zvcm0gdG8gbWFya1xuICBtZGVmLmZyb20udHJhbnNmb3JtID0gW3tcbiAgICB0eXBlOiAnc3RhY2snLFxuICAgIHBvaW50OiBlbmNvZGluZy5maWVsZChkaW0pLFxuICAgIGhlaWdodDogZW5jb2RpbmcuZmllbGQodmFsKSxcbiAgICBvdXRwdXQ6IHt5MTogdmFsLCB5MDogdmFsICsgJzInfVxuICB9XTtcblxuICAvLyBUT0RPOiBUaGlzIGlzIHN1cGVyIGhhY2staXNoIC0tIGNvbnNvbGlkYXRlIGludG8gbW9kdWxhciBtYXJrIHByb3BlcnRpZXM/XG4gIG1kZWYucHJvcGVydGllcy51cGRhdGVbdmFsXSA9IG1kZWYucHJvcGVydGllcy5lbnRlclt2YWxdID0ge3NjYWxlOiB2YWwsIGZpZWxkOiB2YWx9O1xuICBtZGVmLnByb3BlcnRpZXMudXBkYXRlW3ZhbCArICcyJ10gPSBtZGVmLnByb3BlcnRpZXMuZW50ZXJbdmFsICsgJzInXSA9IHtzY2FsZTogdmFsLCBmaWVsZDogdmFsICsgJzInfTtcblxuICByZXR1cm4gdmFsOyAvL3JldHVybiBzdGFjayBlbmNvZGluZ1xufVxuIiwidmFyIGdsb2JhbHMgPSByZXF1aXJlKCcuLi9nbG9iYWxzJyksXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyksXG4gIHZsZmllbGQgPSByZXF1aXJlKCcuLi9maWVsZCcpLFxuICBFbmNvZGluZyA9IHJlcXVpcmUoJy4uL0VuY29kaW5nJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZW5jb2RpbmcsIHN0YXRzKSB7XG4gIHJldHVybiB7XG4gICAgb3BhY2l0eTogZXN0aW1hdGVPcGFjaXR5KGVuY29kaW5nLCBzdGF0cyksXG4gICAgY29sb3JSYW5nZTogY29sb3JSYW5nZShlbmNvZGluZywgc3RhdHMpXG4gIH07XG59O1xuXG5mdW5jdGlvbiBjb2xvclJhbmdlKGVuY29kaW5nLCBzdGF0cyl7XG4gIGlmIChlbmNvZGluZy5oYXMoQ09MT1IpICYmIGVuY29kaW5nLmlzRGltZW5zaW9uKENPTE9SKSkge1xuICAgIHZhciBjYXJkaW5hbGl0eSA9IGVuY29kaW5nLmNhcmRpbmFsaXR5KENPTE9SLCBzdGF0cyk7XG4gICAgaWYgKGNhcmRpbmFsaXR5IDw9IDEwKSB7XG4gICAgICByZXR1cm4gXCJjYXRlZ29yeTEwXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBcImNhdGVnb3J5MjBcIjtcbiAgICB9XG4gICAgLy8gVE9ETyBjYW4gdmVnYSBpbnRlcnBvbGF0ZSByYW5nZSBmb3Igb3JkaW5hbCBzY2FsZT9cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gZXN0aW1hdGVPcGFjaXR5KGVuY29kaW5nLHN0YXRzKSB7XG4gIGlmICghc3RhdHMpIHtcbiAgICByZXR1cm4gMTtcbiAgfVxuXG4gIHZhciBudW1Qb2ludHMgPSAwO1xuXG4gIGlmIChlbmNvZGluZy5pc0FnZ3JlZ2F0ZSgpKSB7IC8vIGFnZ3JlZ2F0ZSBwbG90XG4gICAgbnVtUG9pbnRzID0gMTtcblxuICAgIC8vICBnZXQgbnVtYmVyIG9mIHBvaW50cyBpbiBlYWNoIFwiY2VsbFwiXG4gICAgLy8gIGJ5IGNhbGN1bGF0aW5nIHByb2R1Y3Qgb2YgY2FyZGluYWxpdHlcbiAgICAvLyAgZm9yIGVhY2ggbm9uIGZhY2V0aW5nIGFuZCBub24tb3JkaW5hbCBYIC8gWSBmaWVsZHNcbiAgICAvLyAgbm90ZSB0aGF0IG9yZGluYWwgeCx5IGFyZSBub3QgaW5jbHVkZSBzaW5jZSB3ZSBjYW5cbiAgICAvLyAgY29uc2lkZXIgdGhhdCBvcmRpbmFsIHggYXJlIHN1YmRpdmlkaW5nIHRoZSBjZWxsIGludG8gc3ViY2VsbHMgYW55d2F5XG4gICAgZW5jb2RpbmcuZm9yRWFjaChmdW5jdGlvbihlbmNUeXBlLCBmaWVsZCkge1xuXG4gICAgICBpZiAoZW5jVHlwZSAhPT0gUk9XICYmIGVuY1R5cGUgIT09IENPTCAmJlxuICAgICAgICAgICEoKGVuY1R5cGUgPT09IFggfHwgZW5jVHlwZSA9PT0gWSkgJiZcbiAgICAgICAgICB2bGZpZWxkLmlzRGltZW5zaW9uKGZpZWxkLCB0cnVlKSlcbiAgICAgICAgKSB7XG4gICAgICAgIG51bVBvaW50cyAqPSBlbmNvZGluZy5jYXJkaW5hbGl0eShlbmNUeXBlLCBzdGF0cyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgfSBlbHNlIHsgLy8gcmF3IHBsb3RcbiAgICBudW1Qb2ludHMgPSBzdGF0cy5jb3VudDtcblxuICAgIC8vIHNtYWxsIG11bHRpcGxlcyBkaXZpZGUgbnVtYmVyIG9mIHBvaW50c1xuICAgIHZhciBudW1NdWx0aXBsZXMgPSAxO1xuICAgIGlmIChlbmNvZGluZy5oYXMoUk9XKSkge1xuICAgICAgbnVtTXVsdGlwbGVzICo9IGVuY29kaW5nLmNhcmRpbmFsaXR5KFJPVywgc3RhdHMpO1xuICAgIH1cbiAgICBpZiAoZW5jb2RpbmcuaGFzKENPTCkpIHtcbiAgICAgIG51bU11bHRpcGxlcyAqPSBlbmNvZGluZy5jYXJkaW5hbGl0eShDT0wsIHN0YXRzKTtcbiAgICB9XG4gICAgbnVtUG9pbnRzIC89IG51bU11bHRpcGxlcztcbiAgfVxuXG4gIHZhciBvcGFjaXR5ID0gMDtcbiAgaWYgKG51bVBvaW50cyA8IDIwKSB7XG4gICAgb3BhY2l0eSA9IDE7XG4gIH0gZWxzZSBpZiAobnVtUG9pbnRzIDwgMjAwKSB7XG4gICAgb3BhY2l0eSA9IDAuNztcbiAgfSBlbHNlIGlmIChudW1Qb2ludHMgPCAxMDAwKSB7XG4gICAgb3BhY2l0eSA9IDAuNjtcbiAgfSBlbHNlIHtcbiAgICBvcGFjaXR5ID0gMC4zO1xuICB9XG5cbiAgcmV0dXJuIG9wYWNpdHk7XG59XG5cbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9nbG9iYWxzJyk7XG5cbnZhciBncm91cGRlZiA9IHJlcXVpcmUoJy4vZ3JvdXAnKS5kZWY7XG5cbm1vZHVsZS5leHBvcnRzID0gc3ViZmFjZXRpbmc7XG5cbmZ1bmN0aW9uIHN1YmZhY2V0aW5nKGdyb3VwLCBtZGVmLCBkZXRhaWxzLCBzdGFjaywgZW5jb2RpbmcpIHtcbiAgdmFyIG0gPSBncm91cC5tYXJrcyxcbiAgICBnID0gZ3JvdXBkZWYoJ3N1YmZhY2V0Jywge21hcmtzOiBtfSk7XG5cbiAgZ3JvdXAubWFya3MgPSBbZ107XG4gIGcuZnJvbSA9IG1kZWYuZnJvbTtcbiAgZGVsZXRlIG1kZWYuZnJvbTtcblxuICAvL1RPRE8gdGVzdCBMT0QgLS0gd2Ugc2hvdWxkIHN1cHBvcnQgc3RhY2sgLyBsaW5lIHdpdGhvdXQgY29sb3IgKExPRCkgZmllbGRcbiAgdmFyIHRyYW5zID0gKGcuZnJvbS50cmFuc2Zvcm0gfHwgKGcuZnJvbS50cmFuc2Zvcm0gPSBbXSkpO1xuICB0cmFucy51bnNoaWZ0KHt0eXBlOiAnZmFjZXQnLCBrZXlzOiBkZXRhaWxzfSk7XG5cbiAgaWYgKHN0YWNrICYmIGVuY29kaW5nLmhhcyhDT0xPUikpIHtcbiAgICB0cmFucy51bnNoaWZ0KHt0eXBlOiAnc29ydCcsIGJ5OiBlbmNvZGluZy5maWVsZChDT0xPUil9KTtcbiAgfVxufVxuIiwidmFyIGdsb2JhbHMgPSByZXF1aXJlKCcuLi9nbG9iYWxzJyk7XG5cbnZhciBncm91cGRlZiA9IHJlcXVpcmUoJy4vZ3JvdXAnKS5kZWYsXG4gIHZsZGF0YSA9IHJlcXVpcmUoJy4uL2RhdGEnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB0ZW1wbGF0ZTtcblxuZnVuY3Rpb24gdGVtcGxhdGUoZW5jb2RpbmcsIGxheW91dCwgc3RhdHMpIHsgLy9oYWNrIHVzZSBzdGF0c1xuXG4gIHZhciBkYXRhID0ge25hbWU6IFJBVywgZm9ybWF0OiB7dHlwZTogZW5jb2RpbmcuY29uZmlnKCdkYXRhRm9ybWF0VHlwZScpfX0sXG4gICAgdGFibGUgPSB7bmFtZTogVEFCTEUsIHNvdXJjZTogUkFXfSxcbiAgICBkYXRhVXJsID0gdmxkYXRhLmdldFVybChlbmNvZGluZywgc3RhdHMpO1xuICBpZiAoZGF0YVVybCkgZGF0YS51cmwgPSBkYXRhVXJsO1xuXG4gIHZhciBwcmVhZ2dyZWdhdGVkRGF0YSA9IGVuY29kaW5nLmNvbmZpZygndXNlVmVnYVNlcnZlcicpO1xuXG4gIGVuY29kaW5nLmZvckVhY2goZnVuY3Rpb24oZW5jVHlwZSwgZmllbGQpIHtcbiAgICB2YXIgbmFtZTtcbiAgICBpZiAoZmllbGQudHlwZSA9PSBUKSB7XG4gICAgICBkYXRhLmZvcm1hdC5wYXJzZSA9IGRhdGEuZm9ybWF0LnBhcnNlIHx8IHt9O1xuICAgICAgZGF0YS5mb3JtYXQucGFyc2VbZmllbGQubmFtZV0gPSAnZGF0ZSc7XG4gICAgfSBlbHNlIGlmIChmaWVsZC50eXBlID09IFEpIHtcbiAgICAgIGRhdGEuZm9ybWF0LnBhcnNlID0gZGF0YS5mb3JtYXQucGFyc2UgfHwge307XG4gICAgICBpZiAoZmllbGQuYWdnciA9PT0gJ2NvdW50Jykge1xuICAgICAgICBuYW1lID0gJ2NvdW50JztcbiAgICAgIH0gZWxzZSBpZiAocHJlYWdncmVnYXRlZERhdGEgJiYgZmllbGQuYmluKSB7XG4gICAgICAgIG5hbWUgPSAnYmluXycgKyBmaWVsZC5uYW1lO1xuICAgICAgfSBlbHNlIGlmIChwcmVhZ2dyZWdhdGVkRGF0YSAmJiBmaWVsZC5hZ2dyKSB7XG4gICAgICAgIG5hbWUgPSBmaWVsZC5hZ2dyICsgJ18nICsgZmllbGQubmFtZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5hbWUgPSBmaWVsZC5uYW1lO1xuICAgICAgfVxuICAgICAgZGF0YS5mb3JtYXQucGFyc2VbbmFtZV0gPSAnbnVtYmVyJztcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgd2lkdGg6IGxheW91dC53aWR0aCxcbiAgICBoZWlnaHQ6IGxheW91dC5oZWlnaHQsXG4gICAgcGFkZGluZzogJ2F1dG8nLFxuICAgIGRhdGE6IFtkYXRhLCB0YWJsZV0sXG4gICAgbWFya3M6IFtncm91cGRlZignY2VsbCcsIHtcbiAgICAgIHdpZHRoOiBsYXlvdXQuY2VsbFdpZHRoID8ge3ZhbHVlOiBsYXlvdXQuY2VsbFdpZHRofSA6IHVuZGVmaW5lZCxcbiAgICAgIGhlaWdodDogbGF5b3V0LmNlbGxIZWlnaHQgPyB7dmFsdWU6IGxheW91dC5jZWxsSGVpZ2h0fSA6IHVuZGVmaW5lZFxuICAgIH0pXVxuICB9O1xufVxuIiwidmFyIGdsb2JhbHMgPSByZXF1aXJlKCcuLi9nbG9iYWxzJyksXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gdGltZTtcblxuZnVuY3Rpb24gdGltZShzcGVjLCBlbmNvZGluZywgb3B0KSB7XG4gIHZhciB0aW1lRmllbGRzID0ge30sIHRpbWVGbiA9IHt9O1xuXG4gIC8vIGZpbmQgdW5pcXVlIGZvcm11bGEgdHJhbnNmb3JtYXRpb24gYW5kIGJpbiBmdW5jdGlvblxuICBlbmNvZGluZy5mb3JFYWNoKGZ1bmN0aW9uKGVuY1R5cGUsIGZpZWxkKSB7XG4gICAgaWYgKGZpZWxkLnR5cGUgPT09IFQgJiYgZmllbGQuZm4pIHtcbiAgICAgIHRpbWVGaWVsZHNbZW5jb2RpbmcuZmllbGQoZW5jVHlwZSldID0ge1xuICAgICAgICBmaWVsZDogZmllbGQsXG4gICAgICAgIGVuY1R5cGU6IGVuY1R5cGVcbiAgICAgIH07XG4gICAgICB0aW1lRm5bZmllbGQuZm5dID0gdHJ1ZTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIGFkZCBmb3JtdWxhIHRyYW5zZm9ybVxuICB2YXIgZGF0YSA9IHNwZWMuZGF0YVsxXSxcbiAgICB0cmFuc2Zvcm0gPSBkYXRhLnRyYW5zZm9ybSA9IGRhdGEudHJhbnNmb3JtIHx8IFtdO1xuXG4gIGZvciAodmFyIGYgaW4gdGltZUZpZWxkcykge1xuICAgIHZhciB0ZiA9IHRpbWVGaWVsZHNbZl07XG4gICAgdGltZS50cmFuc2Zvcm0odHJhbnNmb3JtLCBlbmNvZGluZywgdGYuZW5jVHlwZSwgdGYuZmllbGQpO1xuICB9XG5cbiAgLy8gYWRkIHNjYWxlc1xuICB2YXIgc2NhbGVzID0gc3BlYy5zY2FsZXMgPSBzcGVjLnNjYWxlcyB8fCBbXTtcbiAgZm9yICh2YXIgZm4gaW4gdGltZUZuKSB7XG4gICAgdGltZS5zY2FsZShzY2FsZXMsIGZuLCBlbmNvZGluZyk7XG4gIH1cbiAgcmV0dXJuIHNwZWM7XG59XG5cbnRpbWUuY2FyZGluYWxpdHkgPSBmdW5jdGlvbihmaWVsZCwgc3RhdHMpIHtcbiAgdmFyIGZuID0gZmllbGQuZm47XG4gIHN3aXRjaCAoZm4pIHtcbiAgICBjYXNlICdzZWNvbmQnOiByZXR1cm4gNjA7XG4gICAgY2FzZSAnbWludXRlJzogcmV0dXJuIDYwO1xuICAgIGNhc2UgJ2hvdXInOiByZXR1cm4gMjQ7XG4gICAgY2FzZSAnZGF5b2Z3ZWVrJzogcmV0dXJuIDc7XG4gICAgY2FzZSAnZGF0ZSc6IHJldHVybiAzMTtcbiAgICBjYXNlICdtb250aCc6IHJldHVybiAxMjtcbiAgICAvLyBjYXNlICd5ZWFyJzogIC0tIG5lZWQgcmVhbCBjYXJkaW5hbGl0eVxuICB9XG5cbiAgcmV0dXJuIHN0YXRzW2ZpZWxkLm5hbWVdLmNhcmRpbmFsaXR5O1xufTtcblxuLyoqXG4gKiBAcmV0dXJuIHtTdHJpbmd9IGRhdGUgYmlubmluZyBmb3JtdWxhIG9mIHRoZSBnaXZlbiBmaWVsZFxuICovXG50aW1lLmZvcm11bGEgPSBmdW5jdGlvbihmaWVsZCkge1xuICB2YXIgZGF0ZSA9ICduZXcgRGF0ZShkLmRhdGEuJysgZmllbGQubmFtZSArICcpJztcbiAgc3dpdGNoIChmaWVsZC5mbikge1xuICAgIGNhc2UgJ3NlY29uZCc6IHJldHVybiBkYXRlICsgJy5nZXRVVENTZWNvbmRzKCknO1xuICAgIGNhc2UgJ21pbnV0ZSc6IHJldHVybiBkYXRlICsgJy5nZXRVVENNaW51dGVzKCknO1xuICAgIGNhc2UgJ2hvdXInOiByZXR1cm4gZGF0ZSArICcuZ2V0VVRDSG91cnMoKSc7XG4gICAgY2FzZSAnZGF5b2Z3ZWVrJzogcmV0dXJuIGRhdGUgKyAnLmdldFVUQ0RheSgpJztcbiAgICBjYXNlICdkYXRlJzogcmV0dXJuIGRhdGUgKyAnLmdldFVUQ0RhdGUoKSc7XG4gICAgY2FzZSAnbW9udGgnOiByZXR1cm4gZGF0ZSArICcuZ2V0VVRDTW9udGgoKSc7XG4gICAgY2FzZSAneWVhcic6IHJldHVybiBkYXRlICsgJy5nZXRVVENGdWxsWWVhcigpJztcbiAgfVxuICAvLyBUT0RPIGFkZCBjb250aW51b3VzIGJpbm5pbmdcbiAgY29uc29sZS5lcnJvcignbm8gZnVuY3Rpb24gc3BlY2lmaWVkIGZvciBkYXRlJyk7XG59O1xuXG4vKiogYWRkIGZvcm11bGEgdHJhbnNmb3JtcyB0byBkYXRhICovXG50aW1lLnRyYW5zZm9ybSA9IGZ1bmN0aW9uKHRyYW5zZm9ybSwgZW5jb2RpbmcsIGVuY1R5cGUsIGZpZWxkKSB7XG4gIHRyYW5zZm9ybS5wdXNoKHtcbiAgICB0eXBlOiAnZm9ybXVsYScsXG4gICAgZmllbGQ6IGVuY29kaW5nLmZpZWxkKGVuY1R5cGUpLFxuICAgIGV4cHI6IHRpbWUuZm9ybXVsYShmaWVsZClcbiAgfSk7XG59O1xuXG4vKiogYXBwZW5kIGN1c3RvbSB0aW1lIHNjYWxlcyBmb3IgYXhpcyBsYWJlbCAqL1xudGltZS5zY2FsZSA9IGZ1bmN0aW9uKHNjYWxlcywgZm4sIGVuY29kaW5nKSB7XG4gIHZhciBsYWJlbExlbmd0aCA9IGVuY29kaW5nLmNvbmZpZygndGltZVNjYWxlTGFiZWxMZW5ndGgnKTtcbiAgLy8gVE9ETyBhZGQgb3B0aW9uIGZvciBzaG9ydGVyIHNjYWxlIC8gY3VzdG9tIHJhbmdlXG4gIHN3aXRjaCAoZm4pIHtcbiAgICBjYXNlICdkYXlvZndlZWsnOlxuICAgICAgc2NhbGVzLnB1c2goe1xuICAgICAgICBuYW1lOiAndGltZS0nK2ZuLFxuICAgICAgICB0eXBlOiAnb3JkaW5hbCcsXG4gICAgICAgIGRvbWFpbjogdXRpbC5yYW5nZSgwLCA3KSxcbiAgICAgICAgcmFuZ2U6IFsnTW9uZGF5JywgJ1R1ZXNkYXknLCAnV2VkbmVzZGF5JywgJ1RodXJzZGF5JywgJ0ZyaWRheScsICdTYXR1cmRheScsICdTdW5kYXknXS5tYXAoXG4gICAgICAgICAgZnVuY3Rpb24ocykgeyByZXR1cm4gcy5zdWJzdHIoMCwgbGFiZWxMZW5ndGgpO31cbiAgICAgICAgKVxuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdtb250aCc6XG4gICAgICBzY2FsZXMucHVzaCh7XG4gICAgICAgIG5hbWU6ICd0aW1lLScrZm4sXG4gICAgICAgIHR5cGU6ICdvcmRpbmFsJyxcbiAgICAgICAgZG9tYWluOiB1dGlsLnJhbmdlKDAsIDEyKSxcbiAgICAgICAgcmFuZ2U6IFsnSmFudWFyeScsICdGZWJydWFyeScsICdNYXJjaCcsICdBcHJpbCcsICdNYXknLCAnSnVuZScsICdKdWx5JywgJ0F1Z3VzdCcsICdTZXB0ZW1iZXInLCAnT2N0b2JlcicsICdOb3ZlbWJlcicsICdEZWNlbWJlciddLm1hcChcbiAgICAgICAgICAgIGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMuc3Vic3RyKDAsIGxhYmVsTGVuZ3RoKTt9XG4gICAgICAgICAgKVxuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgfVxufTtcblxudGltZS5pc09yZGluYWxGbiA9IGZ1bmN0aW9uKGZuKSB7XG4gIHN3aXRjaCAoZm4pIHtcbiAgICBjYXNlICdzZWNvbmQnOlxuICAgIGNhc2UgJ21pbnV0ZSc6XG4gICAgY2FzZSAnaG91cic6XG4gICAgY2FzZSAnZGF5b2Z3ZWVrJzpcbiAgICBjYXNlICdkYXRlJzpcbiAgICBjYXNlICdtb250aCc6XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG50aW1lLnNjYWxlLnR5cGUgPSBmdW5jdGlvbihmbikge1xuICByZXR1cm4gdGltZS5pc09yZGluYWxGbihmbikgPyAnb3JkaW5hbCcgOiAnbGluZWFyJztcbn07XG5cbnRpbWUuc2NhbGUuZG9tYWluID0gZnVuY3Rpb24oZm4pIHtcbiAgc3dpdGNoIChmbikge1xuICAgIGNhc2UgJ3NlY29uZCc6XG4gICAgY2FzZSAnbWludXRlJzogcmV0dXJuIHV0aWwucmFuZ2UoMCwgNjApO1xuICAgIGNhc2UgJ2hvdXInOiByZXR1cm4gdXRpbC5yYW5nZSgwLCAyNCk7XG4gICAgY2FzZSAnZGF5b2Z3ZWVrJzogcmV0dXJuIHV0aWwucmFuZ2UoMCwgNyk7XG4gICAgY2FzZSAnZGF0ZSc6IHJldHVybiB1dGlsLnJhbmdlKDAsIDMyKTtcbiAgICBjYXNlICdtb250aCc6IHJldHVybiB1dGlsLnJhbmdlKDAsIDEyKTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG5cbi8qKiB3aGV0aGVyIGEgcGFydGljdWxhciB0aW1lIGZ1bmN0aW9uIGhhcyBjdXN0b20gc2NhbGUgZm9yIGxhYmVscyBpbXBsZW1lbnRlZCBpbiB0aW1lLnNjYWxlICovXG50aW1lLmhhc1NjYWxlID0gZnVuY3Rpb24oZm4pIHtcbiAgc3dpdGNoIChmbikge1xuICAgIGNhc2UgJ2RheW9md2Vlayc6XG4gICAgY2FzZSAnbW9udGgnOlxuICAgICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuXG4iLCJ2YXIgZ2xvYmFscyA9IHJlcXVpcmUoJy4vZ2xvYmFscycpO1xuXG52YXIgY29uc3RzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuY29uc3RzLmVuY29kaW5nVHlwZXMgPSBbWCwgWSwgUk9XLCBDT0wsIFNJWkUsIFNIQVBFLCBDT0xPUiwgQUxQSEEsIFRFWFQsIERFVEFJTF07XG5cbmNvbnN0cy5kYXRhVHlwZXMgPSB7J08nOiBPLCAnUSc6IFEsICdUJzogVH07XG5cbmNvbnN0cy5kYXRhVHlwZU5hbWVzID0gWydPJywgJ1EnLCAnVCddLnJlZHVjZShmdW5jdGlvbihyLCB4KSB7XG4gIHJbY29uc3RzLmRhdGFUeXBlc1t4XV0gPSB4O1xuICByZXR1cm4gcjtcbn0se30pO1xuXG5jb25zdHMuc2hvcnRoYW5kID0ge1xuICBkZWxpbTogICd8JyxcbiAgYXNzaWduOiAnPScsXG4gIHR5cGU6ICAgJywnLFxuICBmdW5jOiAgICdfJ1xufTtcbiIsIi8vIFRPRE8gcmVuYW1lIGdldERhdGFVcmwgdG8gdmwuZGF0YS5nZXRVcmwoKSA/XG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbnZhciB2bGRhdGEgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG52bGRhdGEuZ2V0VXJsID0gZnVuY3Rpb24gZ2V0RGF0YVVybChlbmNvZGluZywgc3RhdHMpIHtcbiAgaWYgKCFlbmNvZGluZy5jb25maWcoJ3VzZVZlZ2FTZXJ2ZXInKSkge1xuICAgIC8vIGRvbid0IHVzZSB2ZWdhIHNlcnZlclxuICAgIHJldHVybiBlbmNvZGluZy5jb25maWcoJ2RhdGFVcmwnKTtcbiAgfVxuXG4gIGlmIChlbmNvZGluZy5sZW5ndGgoKSA9PT0gMCkge1xuICAgIC8vIG5vIGZpZWxkc1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBmaWVsZHMgPSBbXTtcbiAgZW5jb2RpbmcuZm9yRWFjaChmdW5jdGlvbihlbmNUeXBlLCBmaWVsZCkge1xuICAgIHZhciBvYmogPSB7XG4gICAgICBuYW1lOiBlbmNvZGluZy5maWVsZChlbmNUeXBlLCB0cnVlKSxcbiAgICAgIGZpZWxkOiBmaWVsZC5uYW1lXG4gICAgfTtcbiAgICBpZiAoZmllbGQuYWdncikge1xuICAgICAgb2JqLmFnZ3IgPSBmaWVsZC5hZ2dyO1xuICAgIH1cbiAgICBpZiAoZmllbGQuYmluKSB7XG4gICAgICBvYmouYmluU2l6ZSA9IHV0aWwuZ2V0YmlucyhzdGF0c1tmaWVsZC5uYW1lXSwgZW5jb2RpbmcuY29uZmlnKCdtYXhiaW5zJykpLnN0ZXA7XG4gICAgfVxuICAgIGZpZWxkcy5wdXNoKG9iaik7XG4gIH0pO1xuXG4gIHZhciBxdWVyeSA9IHtcbiAgICB0YWJsZTogZW5jb2RpbmcuY29uZmlnKCd2ZWdhU2VydmVyVGFibGUnKSxcbiAgICBmaWVsZHM6IGZpZWxkc1xuICB9O1xuXG4gIHJldHVybiBlbmNvZGluZy5jb25maWcoJ3ZlZ2FTZXJ2ZXJVcmwnKSArICcvcXVlcnkvP3E9JyArIEpTT04uc3RyaW5naWZ5KHF1ZXJ5KTtcbn07XG5cbi8qKlxuICogQHBhcmFtICB7T2JqZWN0fSBkYXRhIGRhdGEgaW4gSlNPTi9qYXZhc2NyaXB0IG9iamVjdCBmb3JtYXRcbiAqIEByZXR1cm4gQXJyYXkgb2Yge25hbWU6IF9fbmFtZV9fLCB0eXBlOiBcIm51bWJlcnx0ZXh0fHRpbWV8bG9jYXRpb25cIn1cbiAqL1xudmxkYXRhLmdldFNjaGVtYSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgdmFyIHNjaGVtYSA9IFtdLFxuICAgIGZpZWxkcyA9IHV0aWwua2V5cyhkYXRhWzBdKTtcblxuICBmaWVsZHMuZm9yRWFjaChmdW5jdGlvbihrKSB7XG4gICAgLy8gZmluZCBub24tbnVsbCBkYXRhXG4gICAgdmFyIGkgPSAwLCBkYXR1bSA9IGRhdGFbaV1ba107XG4gICAgd2hpbGUgKGRhdHVtID09PSAnJyB8fCBkYXR1bSA9PT0gbnVsbCB8fCBkYXR1bSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBkYXR1bSA9IGRhdGFbKytpXVtrXTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgdmFyIG51bWJlciA9IEpTT04ucGFyc2UoZGF0dW0pO1xuICAgICAgZGF0dW0gPSBudW1iZXI7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICAvLyBkbyBub3RoaW5nXG4gICAgfVxuXG4gICAgLy9UT0RPKGthbml0dyk6IGJldHRlciB0eXBlIGluZmVyZW5jZSBoZXJlXG4gICAgdmFyIHR5cGUgPSAodHlwZW9mIGRhdHVtID09PSAnbnVtYmVyJykgPyAnUSc6XG4gICAgICBpc05hTihEYXRlLnBhcnNlKGRhdHVtKSkgPyAnTycgOiAnVCc7XG5cbiAgICBzY2hlbWEucHVzaCh7bmFtZTogaywgdHlwZTogdHlwZX0pO1xuICB9KTtcblxuICByZXR1cm4gc2NoZW1hO1xufTtcblxudmxkYXRhLmdldFN0YXRzID0gZnVuY3Rpb24oZGF0YSkgeyAvLyBoYWNrXG4gIHZhciBzdGF0cyA9IHt9LFxuICAgIGZpZWxkcyA9IHV0aWwua2V5cyhkYXRhWzBdKTtcblxuICBmaWVsZHMuZm9yRWFjaChmdW5jdGlvbihrKSB7XG4gICAgdmFyIHN0YXQgPSB1dGlsLm1pbm1heChkYXRhLCBrLCB0cnVlKTtcbiAgICBzdGF0LmNhcmRpbmFsaXR5ID0gdXRpbC51bmlxKGRhdGEsIGspO1xuICAgIHN0YXQubWF4bGVuZ3RoID0gZGF0YS5yZWR1Y2UoZnVuY3Rpb24obWF4LHJvdykge1xuICAgICAgaWYgKHJvd1trXSA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbWF4O1xuICAgICAgfVxuICAgICAgdmFyIGxlbiA9IHJvd1trXS50b1N0cmluZygpLmxlbmd0aDtcbiAgICAgIHJldHVybiBsZW4gPiBtYXggPyBsZW4gOiBtYXg7XG4gICAgfSwgMCk7XG5cbiAgICBzdGF0Lm51bU51bGxzID0gZGF0YS5yZWR1Y2UoZnVuY3Rpb24oY291bnQsIHJvdykge1xuICAgICAgcmV0dXJuIHJvd1trXSA9PT0gbnVsbCA/IGNvdW50ICsgMSA6IGNvdW50O1xuICAgIH0sIDApO1xuXG4gICAgc3RhdC5jb3VudCA9IGRhdGEubGVuZ3RoO1xuICAgIHN0YXRzW2tdID0gc3RhdDtcblxuICAgIHZhciBzYW1wbGUgPSB7fTtcbiAgICBmb3IgKDsgT2JqZWN0LmtleXMoc2FtcGxlKS5sZW5ndGggPCBNYXRoLm1pbihzdGF0LmNhcmRpbmFsaXR5LCAxMCk7IGkrKykge1xuICAgICAgdmFyIHZhbHVlID0gZGF0YVtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBkYXRhLmxlbmd0aCldW2tdO1xuICAgICAgc2FtcGxlW3ZhbHVlXSA9IHRydWU7XG4gICAgfVxuICAgIHN0YXRzW2tdLnNhbXBsZSA9IE9iamVjdC5rZXlzKHNhbXBsZSk7XG4gIH0pO1xuICBzdGF0cy5jb3VudCA9IGRhdGEubGVuZ3RoO1xuICByZXR1cm4gc3RhdHM7XG59O1xuIiwiLy8gdXRpbGl0eSBmb3IgZW5jXG5cbnZhciBjb25zdHMgPSByZXF1aXJlKCcuL2NvbnN0cycpLFxuICBjID0gY29uc3RzLnNob3J0aGFuZCxcbiAgdGltZSA9IHJlcXVpcmUoJy4vY29tcGlsZS90aW1lJyksXG4gIHZsZmllbGQgPSByZXF1aXJlKCcuL2ZpZWxkJyksXG4gIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKSxcbiAgc2NoZW1hID0gcmVxdWlyZSgnLi9zY2hlbWEvc2NoZW1hJyksXG4gIGVuY1R5cGVzID0gc2NoZW1hLmVuY1R5cGVzO1xuXG52YXIgdmxlbmMgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG52bGVuYy5oYXMgPSBmdW5jdGlvbihlbmMsIGVuY1R5cGUpIHtcbiAgdmFyIGZpZWxkRGVmID0gZW5jICYmIGVuY1tlbmNUeXBlXTtcbiAgcmV0dXJuIGZpZWxkRGVmICYmIGZpZWxkRGVmLm5hbWU7XG59O1xuXG52bGVuYy5mb3JFYWNoID0gZnVuY3Rpb24oZW5jLCBmKSB7XG4gIHZhciBpID0gMCwgaztcbiAgZW5jVHlwZXMuZm9yRWFjaChmdW5jdGlvbihrKSB7XG4gICAgaWYgKHZsZW5jLmhhcyhlbmMsIGspKSB7XG4gICAgICBmKGssIGVuY1trXSwgaSsrKTtcbiAgICB9XG4gIH0pO1xufTtcblxudmxlbmMubWFwID0gZnVuY3Rpb24oZW5jLCBmKSB7XG4gIHZhciBhcnIgPSBbXSwgaztcbiAgZW5jVHlwZXMuZm9yRWFjaChmdW5jdGlvbihrKSB7XG4gICAgaWYgKHZsZW5jLmhhcyhlbmMsIGspKSB7XG4gICAgICBhcnIucHVzaChmKGVuY1trXSwgaywgZW5jKSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGFycjtcbn07XG5cbnZsZW5jLnJlZHVjZSA9IGZ1bmN0aW9uKGVuYywgZiwgaW5pdCkge1xuICB2YXIgciA9IGluaXQsIGkgPSAwLCBrO1xuICBlbmNUeXBlcy5mb3JFYWNoKGZ1bmN0aW9uKGspIHtcbiAgICBpZiAodmxlbmMuaGFzKGVuYywgaykpIHtcbiAgICAgIHIgPSBmKHIsIGVuY1trXSwgaywgZW5jKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcjtcbn07XG5cbnZsZW5jLnNob3J0aGFuZCA9IGZ1bmN0aW9uKGVuYykge1xuICByZXR1cm4gdmxlbmMubWFwKGVuYywgZnVuY3Rpb24odiwgZSkge1xuICAgIHJldHVybiBlICsgYy5hc3NpZ24gKyB2bGZpZWxkLnNob3J0aGFuZCh2KTtcbiAgfSkuam9pbihjLmRlbGltKTtcbn07XG5cbnZsZW5jLnBhcnNlU2hvcnRoYW5kID0gZnVuY3Rpb24oc2hvcnRoYW5kLCBjb252ZXJ0VHlwZSkge1xuICB2YXIgZW5jID0gc2hvcnRoYW5kLnNwbGl0KGMuZGVsaW0pO1xuICByZXR1cm4gZW5jLnJlZHVjZShmdW5jdGlvbihtLCBlKSB7XG4gICAgdmFyIHNwbGl0ID0gZS5zcGxpdChjLmFzc2lnbiksXG4gICAgICAgIGVuY3R5cGUgPSBzcGxpdFswXS50cmltKCksXG4gICAgICAgIGZpZWxkID0gc3BsaXRbMV07XG5cbiAgICBtW2VuY3R5cGVdID0gdmxmaWVsZC5wYXJzZVNob3J0aGFuZChmaWVsZCwgY29udmVydFR5cGUpO1xuICAgIHJldHVybiBtO1xuICB9LCB7fSk7XG59OyIsIi8vIHV0aWxpdHkgZm9yIGZpZWxkXG5cbnZhciBjb25zdHMgPSByZXF1aXJlKCcuL2NvbnN0cycpLFxuICBjID0gY29uc3RzLnNob3J0aGFuZCxcbiAgdGltZSA9IHJlcXVpcmUoJy4vY29tcGlsZS90aW1lJyksXG4gIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKSxcbiAgc2NoZW1hID0gcmVxdWlyZSgnLi9zY2hlbWEvc2NoZW1hJyk7XG5cbnZhciB2bGZpZWxkID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxudmxmaWVsZC5zaG9ydGhhbmQgPSBmdW5jdGlvbihmKSB7XG4gIHZhciBjID0gY29uc3RzLnNob3J0aGFuZDtcbiAgcmV0dXJuIChmLmFnZ3IgPyBmLmFnZ3IgKyBjLmZ1bmMgOiAnJykgK1xuICAgIChmLmZuID8gZi5mbiArIGMuZnVuYyA6ICcnKSArXG4gICAgKGYuYmluID8gJ2JpbicgKyBjLmZ1bmMgOiAnJykgK1xuICAgIChmLm5hbWUgfHwgJycpICsgYy50eXBlICtcbiAgICAoY29uc3RzLmRhdGFUeXBlTmFtZXNbZi50eXBlXSB8fCBmLnR5cGUpO1xufTtcblxudmxmaWVsZC5zaG9ydGhhbmRzID0gZnVuY3Rpb24oZmllbGRzLCBkZWxpbSkge1xuICBkZWxpbSA9IGRlbGltIHx8ICcsJztcbiAgcmV0dXJuIGZpZWxkcy5tYXAodmxmaWVsZC5zaG9ydGhhbmQpLmpvaW4oZGVsaW0pO1xufTtcblxudmxmaWVsZC5wYXJzZVNob3J0aGFuZCA9IGZ1bmN0aW9uKHNob3J0aGFuZCwgY29udmVydFR5cGUpIHtcbiAgdmFyIHNwbGl0ID0gc2hvcnRoYW5kLnNwbGl0KGMudHlwZSksIGk7XG4gIHZhciBvID0ge1xuICAgIG5hbWU6IHNwbGl0WzBdLnRyaW0oKSxcbiAgICB0eXBlOiBjb252ZXJ0VHlwZSA/IGNvbnN0cy5kYXRhVHlwZXNbc3BsaXRbMV0udHJpbSgpXSA6IHNwbGl0WzFdLnRyaW0oKVxuICB9O1xuXG4gIC8vIGNoZWNrIGFnZ3JlZ2F0ZSB0eXBlXG4gIGZvciAoaSBpbiBzY2hlbWEuYWdnci5lbnVtKSB7XG4gICAgdmFyIGEgPSBzY2hlbWEuYWdnci5lbnVtW2ldO1xuICAgIGlmIChvLm5hbWUuaW5kZXhPZihhICsgJ18nKSA9PT0gMCkge1xuICAgICAgby5uYW1lID0gby5uYW1lLnN1YnN0cihhLmxlbmd0aCArIDEpO1xuICAgICAgaWYgKGEgPT0gJ2NvdW50JyAmJiBvLm5hbWUubGVuZ3RoID09PSAwKSBvLm5hbWUgPSAnKic7XG4gICAgICBvLmFnZ3IgPSBhO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLy8gY2hlY2sgdGltZSBmblxuICBmb3IgKGkgaW4gc2NoZW1hLnRpbWVmbnMpIHtcbiAgICB2YXIgZiA9IHNjaGVtYS50aW1lZm5zW2ldO1xuICAgIGlmIChvLm5hbWUgJiYgby5uYW1lLmluZGV4T2YoZiArICdfJykgPT09IDApIHtcbiAgICAgIG8ubmFtZSA9IG8ubmFtZS5zdWJzdHIoby5sZW5ndGggKyAxKTtcbiAgICAgIG8uZm4gPSBmO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLy8gY2hlY2sgYmluXG4gIGlmIChvLm5hbWUgJiYgby5uYW1lLmluZGV4T2YoJ2Jpbl8nKSA9PT0gMCkge1xuICAgIG8ubmFtZSA9IG8ubmFtZS5zdWJzdHIoNCk7XG4gICAgby5iaW4gPSB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIG87XG59O1xuXG52YXIgdHlwZU9yZGVyID0ge1xuICBPOiAwLFxuICBHOiAxLFxuICBUOiAyLFxuICBROiAzXG59O1xuXG52bGZpZWxkLm9yZGVyID0ge307XG5cbnZsZmllbGQub3JkZXIudHlwZSA9IGZ1bmN0aW9uKGZpZWxkKSB7XG4gIGlmIChmaWVsZC5hZ2dyPT09J2NvdW50JykgcmV0dXJuIDQ7XG4gIHJldHVybiB0eXBlT3JkZXJbZmllbGQudHlwZV07XG59O1xuXG52bGZpZWxkLm9yZGVyLnR5cGVUaGVuTmFtZSA9IGZ1bmN0aW9uKGZpZWxkKSB7XG4gIHJldHVybiB2bGZpZWxkLm9yZGVyLnR5cGUoZmllbGQpICsgJ18nICsgZmllbGQubmFtZTtcbn07XG5cbnZsZmllbGQub3JkZXIub3JpZ2luYWwgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIDA7IC8vIG5vIHN3YXAgd2lsbCBvY2N1clxufTtcblxudmxmaWVsZC5vcmRlci5uYW1lID0gZnVuY3Rpb24oZmllbGQpIHtcbiAgcmV0dXJuIGZpZWxkLm5hbWU7XG59O1xuXG52bGZpZWxkLm9yZGVyLnR5cGVUaGVuQ2FyZGluYWxpdHkgPSBmdW5jdGlvbihmaWVsZCwgc3RhdHMpe1xuICByZXR1cm4gc3RhdHNbZmllbGQubmFtZV0uY2FyZGluYWxpdHk7XG59O1xuXG5cbnZsZmllbGQuaXNUeXBlID0gZnVuY3Rpb24gKGZpZWxkRGVmLCB0eXBlKSB7XG4gIHJldHVybiAoZmllbGREZWYudHlwZSAmIHR5cGUpID4gMDtcbn07XG5cbnZsZmllbGQuaXNUeXBlLmJ5TmFtZSA9IGZ1bmN0aW9uIChmaWVsZCwgdHlwZSkge1xuICByZXR1cm4gZmllbGQudHlwZSA9PT0gY29uc3RzLmRhdGFUeXBlTmFtZXNbdHlwZV07XG59O1xuXG5mdW5jdGlvbiBnZXRJc1R5cGUodXNlVHlwZUNvZGUpIHtcbiAgcmV0dXJuIHVzZVR5cGVDb2RlID8gdmxmaWVsZC5pc1R5cGUgOiB2bGZpZWxkLmlzVHlwZS5ieU5hbWU7XG59XG5cbi8qXG4gKiBNb3N0IGZpZWxkcyB0aGF0IHVzZSBvcmRpbmFsIHNjYWxlIGFyZSBkaW1lbnNpb25zLlxuICogSG93ZXZlciwgWUVBUihUKSwgWUVBUk1PTlRIKFQpIHVzZSB0aW1lIHNjYWxlLCBub3Qgb3JkaW5hbCBidXQgYXJlIGRpbWVuc2lvbnMgdG9vLlxuICovXG52bGZpZWxkLmlzT3JkaW5hbFNjYWxlID0gZnVuY3Rpb24oZmllbGQsIHVzZVR5cGVDb2RlIC8qb3B0aW9uYWwqLykge1xuICB2YXIgaXNUeXBlID0gZ2V0SXNUeXBlKHVzZVR5cGVDb2RlKTtcbiAgcmV0dXJuICBpc1R5cGUoZmllbGQsIE8pIHx8IGZpZWxkLmJpbiB8fFxuICAgICggaXNUeXBlKGZpZWxkLCBUKSAmJiBmaWVsZC5mbiAmJiB0aW1lLmlzT3JkaW5hbEZuKGZpZWxkLmZuKSApO1xufTtcblxuZnVuY3Rpb24gaXNEaW1lbnNpb24oZmllbGQsIHVzZVR5cGVDb2RlIC8qb3B0aW9uYWwqLykge1xuICB2YXIgaXNUeXBlID0gZ2V0SXNUeXBlKHVzZVR5cGVDb2RlKTtcbiAgcmV0dXJuICBpc1R5cGUoZmllbGQsIE8pIHx8IGZpZWxkLmJpbiB8fFxuICAgICggaXNUeXBlKGZpZWxkLCBUKSAmJiBmaWVsZC5mbiApO1xufVxuXG4vKipcbiAqIEZvciBlbmNvZGluZywgdXNlIGVuY29kaW5nLmlzRGltZW5zaW9uKCkgdG8gYXZvaWQgY29uZnVzaW9uLlxuICogT3IgdXNlIEVuY29kaW5nLmlzVHlwZSBpZiB5b3VyIGZpZWxkIGlzIGZyb20gRW5jb2RpbmcgKGFuZCB0aHVzIGhhdmUgbnVtZXJpYyBkYXRhIHR5cGUpLlxuICogb3RoZXJ3aXNlLCBkbyBub3Qgc3BlY2lmaWMgaXNUeXBlIHNvIHdlIGNhbiB1c2UgdGhlIGRlZmF1bHQgaXNUeXBlTmFtZSBoZXJlLlxuICovXG52bGZpZWxkLmlzRGltZW5zaW9uID0gZnVuY3Rpb24oZmllbGQsIHVzZVR5cGVDb2RlIC8qb3B0aW9uYWwqLykge1xuICByZXR1cm4gZmllbGQgJiYgaXNEaW1lbnNpb24oZmllbGQsIHVzZVR5cGVDb2RlKTtcbn07XG5cbnZsZmllbGQuaXNNZWFzdXJlID0gZnVuY3Rpb24oZmllbGQsIHVzZVR5cGVDb2RlKSB7XG4gIHJldHVybiBmaWVsZCAmJiAhaXNEaW1lbnNpb24oZmllbGQsIHVzZVR5cGVDb2RlKTtcbn07XG5cbnZsZmllbGQucm9sZSA9IGZ1bmN0aW9uKGZpZWxkKSB7XG4gIHJldHVybiBpc0RpbWVuc2lvbihmaWVsZCkgPyAnZGltZW5zaW9uJyA6ICdtZWFzdXJlJztcbn07XG5cbnZsZmllbGQuY291bnQgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtuYW1lOicqJywgYWdncjogJ2NvdW50JywgdHlwZTonUScsIGRpc3BsYXlOYW1lOiB2bGZpZWxkLmNvdW50LmRpc3BsYXlOYW1lfTtcbn07XG5cbnZsZmllbGQuY291bnQuZGlzcGxheU5hbWUgPSAnTnVtYmVyIG9mIFJlY29yZHMnO1xuXG52bGZpZWxkLmlzQ291bnQgPSBmdW5jdGlvbihmaWVsZCkge1xuICByZXR1cm4gZmllbGQuYWdnciA9PT0gJ2NvdW50Jztcbn07XG5cbi8qKlxuICogRm9yIGVuY29kaW5nLCB1c2UgZW5jb2RpbmcuY2FyZGluYWxpdHkoKSB0byBhdm9pZCBjb25mdXNpb24uICBPciB1c2UgRW5jb2RpbmcuaXNUeXBlIGlmIHlvdXIgZmllbGQgaXMgZnJvbSBFbmNvZGluZyAoYW5kIHRodXMgaGF2ZSBudW1lcmljIGRhdGEgdHlwZSkuXG4gKiBvdGhlcndpc2UsIGRvIG5vdCBzcGVjaWZpYyBpc1R5cGUgc28gd2UgY2FuIHVzZSB0aGUgZGVmYXVsdCBpc1R5cGVOYW1lIGhlcmUuXG4gKi9cbnZsZmllbGQuY2FyZGluYWxpdHkgPSBmdW5jdGlvbihmaWVsZCwgc3RhdHMsIHVzZVR5cGVDb2RlKSB7XG4gIHZhciBpc1R5cGUgPSBnZXRJc1R5cGUodXNlVHlwZUNvZGUpO1xuXG4gIGlmIChmaWVsZC5iaW4pIHtcbiAgICB2YXIgYmlucyA9IHV0aWwuZ2V0YmlucyhzdGF0c1tmaWVsZC5uYW1lXSwgZmllbGQubWF4Ymlucyk7XG4gICAgcmV0dXJuIChiaW5zLnN0b3AgLSBiaW5zLnN0YXJ0KSAvIGJpbnMuc3RlcDtcbiAgfVxuICBpZiAoaXNUeXBlKGZpZWxkLCBUKSkge1xuICAgIHJldHVybiB0aW1lLmNhcmRpbmFsaXR5KGZpZWxkLCBzdGF0cyk7XG4gIH1cbiAgaWYgKGZpZWxkLmFnZ3IpIHtcbiAgICByZXR1cm4gMTtcbiAgfVxuICByZXR1cm4gc3RhdHNbZmllbGQubmFtZV0uY2FyZGluYWxpdHk7XG59O1xuIiwiLy8gZGVjbGFyZSBnbG9iYWwgY29uc3RhbnRcbnZhciBnID0gZ2xvYmFsIHx8IHdpbmRvdztcblxuZy5UQUJMRSA9ICd0YWJsZSc7XG5nLlJBVyA9ICdyYXcnO1xuZy5TVEFDS0VEID0gJ3N0YWNrZWQnO1xuZy5JTkRFWCA9ICdpbmRleCc7XG5cbmcuWCA9ICd4JztcbmcuWSA9ICd5JztcbmcuUk9XID0gJ3Jvdyc7XG5nLkNPTCA9ICdjb2wnO1xuZy5TSVpFID0gJ3NpemUnO1xuZy5TSEFQRSA9ICdzaGFwZSc7XG5nLkNPTE9SID0gJ2NvbG9yJztcbmcuQUxQSEEgPSAnYWxwaGEnO1xuZy5URVhUID0gJ3RleHQnO1xuZy5ERVRBSUwgPSAnZGV0YWlsJztcblxuZy5PID0gMTtcbmcuUSA9IDI7XG5nLlQgPSA0O1xuIiwiLy8gUGFja2FnZSBvZiBkZWZpbmluZyBWZWdhbGl0ZSBTcGVjaWZpY2F0aW9uJ3MganNvbiBzY2hlbWFcblxudmFyIHNjaGVtYSA9IG1vZHVsZS5leHBvcnRzID0ge30sXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cbnNjaGVtYS51dGlsID0gcmVxdWlyZSgnLi9zY2hlbWF1dGlsJyk7XG5cbnNjaGVtYS5tYXJrdHlwZSA9IHtcbiAgdHlwZTogJ3N0cmluZycsXG4gIGVudW06IFsncG9pbnQnLCAnYmFyJywgJ2xpbmUnLCAnYXJlYScsICdjaXJjbGUnLCAnc3F1YXJlJywgJ3RleHQnXVxufTtcblxuc2NoZW1hLmFnZ3IgPSB7XG4gIHR5cGU6ICdzdHJpbmcnLFxuICBlbnVtOiBbJ2F2ZycsICdzdW0nLCAnbWluJywgJ21heCcsICdjb3VudCddLFxuICBzdXBwb3J0ZWRFbnVtczoge1xuICAgIFE6IFsnYXZnJywgJ3N1bScsICdtaW4nLCAnbWF4JywgJ2NvdW50J10sXG4gICAgTzogW10sXG4gICAgVDogWydhdmcnLCAnbWluJywgJ21heCddLFxuICAgICcnOiBbJ2NvdW50J11cbiAgfSxcbiAgc3VwcG9ydGVkVHlwZXM6IHsnUSc6IHRydWUsICdPJzogdHJ1ZSwgJ1QnOiB0cnVlLCAnJzogdHJ1ZX1cbn07XG5cbnNjaGVtYS5iYW5kID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgcHJvcGVydGllczoge1xuICAgIHNpemU6IHtcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgIG1pbmltdW06IDBcbiAgICB9LFxuICAgIHBhZGRpbmc6IHtcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgIG1pbmltdW06IDAsXG4gICAgICBkZWZhdWx0OiAxXG4gICAgfVxuICB9XG59O1xuXG5zY2hlbWEudGltZWZucyA9IFsnbW9udGgnLCAneWVhcicsICdkYXlvZndlZWsnLCAnZGF0ZScsICdob3VyJywgJ21pbnV0ZScsICdzZWNvbmQnXTtcblxuc2NoZW1hLmZuID0ge1xuICB0eXBlOiAnc3RyaW5nJyxcbiAgZW51bTogc2NoZW1hLnRpbWVmbnMsXG4gIHN1cHBvcnRlZFR5cGVzOiB7J1QnOiB0cnVlfVxufTtcblxuLy9UT0RPKGthbml0dyk6IGFkZCBvdGhlciB0eXBlIG9mIGZ1bmN0aW9uIGhlcmVcblxuc2NoZW1hLnNjYWxlX3R5cGUgPSB7XG4gIHR5cGU6ICdzdHJpbmcnLFxuICBlbnVtOiBbJ2xpbmVhcicsICdsb2cnLCAncG93JywgJ3NxcnQnLCAncXVhbnRpbGUnXSxcbiAgZGVmYXVsdDogJ2xpbmVhcicsXG4gIHN1cHBvcnRlZFR5cGVzOiB7J1EnOiB0cnVlfVxufTtcblxuc2NoZW1hLmZpZWxkID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgcHJvcGVydGllczoge1xuICAgIG5hbWU6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgfVxuICB9XG59O1xuXG52YXIgY2xvbmUgPSB1dGlsLmR1cGxpY2F0ZTtcbnZhciBtZXJnZSA9IHNjaGVtYS51dGlsLm1lcmdlO1xuXG52YXIgYmlubmluZ01peGluID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgcHJvcGVydGllczoge1xuICAgIGJpbjoge1xuICAgICAgdHlwZTogWydib29sZWFuJywgJ29iamVjdCddLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIG1heGJpbnM6IHtcbiAgICAgICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICAgICAgZGVmYXVsdDogMTUsXG4gICAgICAgICAgbWluaW11bTogMlxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgc3VwcG9ydGVkVHlwZXM6IHsnUSc6IHRydWV9IC8vIFRPRE86IGFkZCAnTycgYWZ0ZXIgZmluaXNoaW5nICM4MVxuICAgIH1cbiAgfVxufVxuXG52YXIgdHlwaWNhbEZpZWxkID0gbWVyZ2UoY2xvbmUoc2NoZW1hLmZpZWxkKSwge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgcHJvcGVydGllczoge1xuICAgIHR5cGU6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZW51bTogWydPJywgJ1EnLCAnVCddXG4gICAgfSxcbiAgICBhZ2dyOiBzY2hlbWEuYWdncixcbiAgICBmbjogc2NoZW1hLmZuLFxuICAgIHNjYWxlOiB7XG4gICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgdHlwZTogc2NoZW1hLnNjYWxlX3R5cGUsXG4gICAgICAgIHJldmVyc2U6IHtcbiAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgICAgc3VwcG9ydGVkVHlwZXM6IHsnUSc6IHRydWUsICdPJzogdHJ1ZSwgJ1QnOiB0cnVlfVxuICAgICAgICB9LFxuICAgICAgICB6ZXJvOiB7XG4gICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnSW5jbHVkZSB6ZXJvJyxcbiAgICAgICAgICBzdXBwb3J0ZWRUeXBlczogeydRJzogdHJ1ZX1cbiAgICAgICAgfSxcbiAgICAgICAgbmljZToge1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgIGVudW06IFsnc2Vjb25kJywgJ21pbnV0ZScsICdob3VyJywgJ2RheScsICd3ZWVrJywgJ21vbnRoJywgJ3llYXInXSxcbiAgICAgICAgICBzdXBwb3J0ZWRUeXBlczogeydUJzogdHJ1ZX1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufSwgYmlubmluZ01peGluKTtcblxudmFyIG9ubHlPcmRpbmFsRmllbGQgPSBtZXJnZShjbG9uZShzY2hlbWEuZmllbGQpLCB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgdHlwZToge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBlbnVtOiBbJ08nLCdRJywgJ1QnXSAvLyBvcmRpbmFsLW9ubHkgZmllbGQgc3VwcG9ydHMgUSB3aGVuIGJpbiBpcyBhcHBsaWVkIGFuZCBUIHdoZW4gZm4gaXMgYXBwbGllZC5cbiAgICB9LFxuICAgIGZuOiBzY2hlbWEuZm4sXG4gICAgYWdncjoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBlbnVtOiBbJ2NvdW50J10sXG4gICAgICBzdXBwb3J0ZWRUeXBlczogeydPJzogdHJ1ZX1cbiAgICB9XG4gIH1cbn0sIGJpbm5pbmdNaXhpbik7XG5cbnZhciBheGlzTWl4aW4gPSB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBzdXBwb3J0ZWRNYXJrdHlwZXM6IHsncG9pbnQnOiB0cnVlLCAnYmFyJzogdHJ1ZSwgJ2xpbmUnOiB0cnVlLCAnYXJlYSc6IHRydWUsICdjaXJjbGUnOiB0cnVlLCAnc3F1YXJlJzogdHJ1ZX0sXG4gIHByb3BlcnRpZXM6IHtcbiAgICBheGlzOiB7XG4gICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgZ3JpZDoge1xuICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0EgZmxhZyBpbmRpY2F0ZSBpZiBncmlkbGluZXMgc2hvdWxkIGJlIGNyZWF0ZWQgaW4gYWRkaXRpb24gdG8gdGlja3MuJ1xuICAgICAgICB9LFxuICAgICAgICB0aXRsZToge1xuICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQSB0aXRsZSBmb3IgdGhlIGF4aXMuJ1xuICAgICAgICB9LFxuICAgICAgICB0aXRsZU9mZnNldDoge1xuICAgICAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgICAgICBkZWZhdWx0OiB1bmRlZmluZWQsICAvLyBhdXRvXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdBIHRpdGxlIG9mZnNldCB2YWx1ZSBmb3IgdGhlIGF4aXMuJ1xuICAgICAgICB9LFxuICAgICAgICBmb3JtYXQ6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICBkZWZhdWx0OiB1bmRlZmluZWQsICAvLyBhdXRvXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgZm9ybWF0dGluZyBwYXR0ZXJuIGZvciBheGlzIGxhYmVscy4nXG4gICAgICAgIH0sXG4gICAgICAgIG1heExhYmVsTGVuZ3RoOiB7XG4gICAgICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgICAgIGRlZmF1bHQ6IDUwLFxuICAgICAgICAgIG1pbmltdW06IDAsXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdUcnVuY2F0ZSBsYWJlbHMgdGhhdCBhcmUgdG9vIGxvbmcuJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG52YXIgc29ydE1peGluID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgcHJvcGVydGllczoge1xuICAgIHNvcnQ6IHtcbiAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICBkZWZhdWx0OiBbXSxcbiAgICAgIGl0ZW1zOiB7XG4gICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICBzdXBwb3J0ZWRUeXBlczogeydPJzogdHJ1ZX0sXG4gICAgICAgIHJlcXVpcmVkOiBbJ25hbWUnLCAnYWdnciddLFxuICAgICAgICBuYW1lOiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgfSxcbiAgICAgICAgYWdncjoge1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgIGVudW06IFsnYXZnJywgJ3N1bScsICdtaW4nLCAnbWF4JywgJ2NvdW50J11cbiAgICAgICAgfSxcbiAgICAgICAgcmV2ZXJzZToge1xuICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG52YXIgYmFuZE1peGluID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgcHJvcGVydGllczoge1xuICAgIGJhbmQ6IHNjaGVtYS5iYW5kXG4gIH1cbn07XG5cbnZhciBsZWdlbmRNaXhpbiA9IHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHByb3BlcnRpZXM6IHtcbiAgICBsZWdlbmQ6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICB9XG4gIH1cbn07XG5cbnZhciB0ZXh0TWl4aW4gPSB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBzdXBwb3J0ZWRNYXJrdHlwZXM6IHsndGV4dCc6IHRydWV9LFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgdGV4dDoge1xuICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIGFsaWduOiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgZGVmYXVsdDogJ2xlZnQnXG4gICAgICAgIH0sXG4gICAgICAgIGJhc2VsaW5lOiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgZGVmYXVsdDogJ21pZGRsZSdcbiAgICAgICAgfSxcbiAgICAgICAgbWFyZ2luOiB7XG4gICAgICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgICAgIGRlZmF1bHQ6IDQsXG4gICAgICAgICAgbWluaW11bTogMFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBmb250OiB7XG4gICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgd2VpZ2h0OiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgZW51bTogWydub3JtYWwnLCAnYm9sZCddLFxuICAgICAgICAgIGRlZmF1bHQ6ICdub3JtYWwnXG4gICAgICAgIH0sXG4gICAgICAgIHNpemU6IHtcbiAgICAgICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICAgICAgZGVmYXVsdDogMTAsXG4gICAgICAgICAgbWluaW11bTogMFxuICAgICAgICB9LFxuICAgICAgICBmYW1pbHk6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICBkZWZhdWx0OiAnSGVsdmV0aWNhIE5ldWUnXG4gICAgICAgIH0sXG4gICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgZGVmYXVsdDogJ25vcm1hbCcsXG4gICAgICAgICAgZW51bTogWydub3JtYWwnLCAnaXRhbGljJ11cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxudmFyIHNpemVNaXhpbiA9IHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHN1cHBvcnRlZE1hcmt0eXBlczogeydwb2ludCc6IHRydWUsICdiYXInOiB0cnVlLCAnY2lyY2xlJzogdHJ1ZSwgJ3NxdWFyZSc6IHRydWUsICd0ZXh0JzogdHJ1ZX0sXG4gIHByb3BlcnRpZXM6IHtcbiAgICB2YWx1ZToge1xuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgZGVmYXVsdDogMzAsXG4gICAgICBtaW5pbXVtOiAwXG4gICAgfVxuICB9XG59O1xuXG52YXIgY29sb3JNaXhpbiA9IHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHN1cHBvcnRlZE1hcmt0eXBlczogeydwb2ludCc6IHRydWUsICdiYXInOiB0cnVlLCAnbGluZSc6IHRydWUsICdhcmVhJzogdHJ1ZSwgJ2NpcmNsZSc6IHRydWUsICdzcXVhcmUnOiB0cnVlLCAndGV4dCc6IHRydWV9LFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgdmFsdWU6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgcm9sZTogJ2NvbG9yJyxcbiAgICAgIGRlZmF1bHQ6ICdzdGVlbGJsdWUnXG4gICAgfSxcbiAgICBzY2FsZToge1xuICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIHJhbmdlOiB7XG4gICAgICAgICAgdHlwZTogWydzdHJpbmcnLCAnYXJyYXknXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG52YXIgYWxwaGFNaXhpbiA9IHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHN1cHBvcnRlZE1hcmt0eXBlczogeydwb2ludCc6IHRydWUsICdiYXInOiB0cnVlLCAnbGluZSc6IHRydWUsICdhcmVhJzogdHJ1ZSwgJ2NpcmNsZSc6IHRydWUsICdzcXVhcmUnOiB0cnVlLCAndGV4dCc6IHRydWV9LFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgdmFsdWU6IHtcbiAgICAgIHR5cGU6ICdudW1iZXInLFxuICAgICAgZGVmYXVsdDogdW5kZWZpbmVkLCAgLy8gYXV0b1xuICAgICAgbWluaW11bTogMCxcbiAgICAgIG1heGltdW06IDFcbiAgICB9XG4gIH1cbn07XG5cbnZhciBzaGFwZU1peGluID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgc3VwcG9ydGVkTWFya3R5cGVzOiB7J3BvaW50JzogdHJ1ZSwgJ2NpcmNsZSc6IHRydWUsICdzcXVhcmUnOiB0cnVlfSxcbiAgcHJvcGVydGllczoge1xuICAgIHZhbHVlOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGVudW06IFsnY2lyY2xlJywgJ3NxdWFyZScsICdjcm9zcycsICdkaWFtb25kJywgJ3RyaWFuZ2xlLXVwJywgJ3RyaWFuZ2xlLWRvd24nXSxcbiAgICAgIGRlZmF1bHQ6ICdjaXJjbGUnXG4gICAgfVxuICB9XG59O1xuXG52YXIgZGV0YWlsTWl4aW4gPSB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBzdXBwb3J0ZWRNYXJrdHlwZXM6IHsncG9pbnQnOiB0cnVlLCAnbGluZSc6IHRydWUsICdjaXJjbGUnOiB0cnVlLCAnc3F1YXJlJzogdHJ1ZX1cbn07XG5cbnZhciByb3dNaXhpbiA9IHtcbiAgcHJvcGVydGllczoge1xuICAgIGhlaWdodDoge1xuICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICBtaW5pbXVtOiAwLFxuICAgICAgZGVmYXVsdDogMTUwXG4gICAgfVxuICB9XG59O1xuXG52YXIgY29sTWl4aW4gPSB7XG4gIHByb3BlcnRpZXM6IHtcbiAgICB3aWR0aDoge1xuICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICBtaW5pbXVtOiAwLFxuICAgICAgZGVmYXVsdDogMTUwXG4gICAgfVxuICB9XG59O1xuXG52YXIgZmFjZXRNaXhpbiA9IHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHN1cHBvcnRlZE1hcmt0eXBlczogeydwb2ludCc6IHRydWUsICdiYXInOiB0cnVlLCAnbGluZSc6IHRydWUsICdhcmVhJzogdHJ1ZSwgJ2NpcmNsZSc6IHRydWUsICdzcXVhcmUnOiB0cnVlLCAndGV4dCc6IHRydWV9LFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgcGFkZGluZzoge1xuICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICBtaW5pbXVtOiAwLFxuICAgICAgbWF4aW11bTogMSxcbiAgICAgIGRlZmF1bHQ6IDAuMVxuICAgIH1cbiAgfVxufTtcblxudmFyIHJlcXVpcmVkTmFtZVR5cGUgPSB7XG4gIHJlcXVpcmVkOiBbJ25hbWUnLCAndHlwZSddXG59O1xuXG52YXIgeCA9IG1lcmdlKGNsb25lKHR5cGljYWxGaWVsZCksIGF4aXNNaXhpbiwgYmFuZE1peGluLCByZXF1aXJlZE5hbWVUeXBlLCBzb3J0TWl4aW4pO1xudmFyIHkgPSBjbG9uZSh4KTtcblxudmFyIGZhY2V0ID0gbWVyZ2UoY2xvbmUob25seU9yZGluYWxGaWVsZCksIHJlcXVpcmVkTmFtZVR5cGUsIGZhY2V0TWl4aW4sIHNvcnRNaXhpbik7XG52YXIgcm93ID0gbWVyZ2UoY2xvbmUoZmFjZXQpLCBheGlzTWl4aW4sIHJvd01peGluKTtcbnZhciBjb2wgPSBtZXJnZShjbG9uZShmYWNldCksIGF4aXNNaXhpbiwgY29sTWl4aW4pO1xuXG52YXIgc2l6ZSA9IG1lcmdlKGNsb25lKHR5cGljYWxGaWVsZCksIGxlZ2VuZE1peGluLCBzaXplTWl4aW4sIHNvcnRNaXhpbik7XG52YXIgY29sb3IgPSBtZXJnZShjbG9uZSh0eXBpY2FsRmllbGQpLCBsZWdlbmRNaXhpbiwgY29sb3JNaXhpbiwgc29ydE1peGluKTtcbnZhciBhbHBoYSA9IG1lcmdlKGNsb25lKHR5cGljYWxGaWVsZCksIGFscGhhTWl4aW4sIHNvcnRNaXhpbik7XG52YXIgc2hhcGUgPSBtZXJnZShjbG9uZShvbmx5T3JkaW5hbEZpZWxkKSwgbGVnZW5kTWl4aW4sIHNoYXBlTWl4aW4sIHNvcnRNaXhpbik7XG52YXIgZGV0YWlsID0gbWVyZ2UoY2xvbmUob25seU9yZGluYWxGaWVsZCksIGRldGFpbE1peGluLCBzb3J0TWl4aW4pO1xuXG52YXIgdGV4dCA9IG1lcmdlKGNsb25lKHR5cGljYWxGaWVsZCksIHRleHRNaXhpbiwgc29ydE1peGluKTtcblxudmFyIGZpbHRlciA9IHtcbiAgdHlwZTogJ2FycmF5JyxcbiAgaXRlbXM6IHtcbiAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICBvcGVyYW5kczoge1xuICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICBpdGVtczoge1xuICAgICAgICAgIHR5cGU6IFsnc3RyaW5nJywgJ2Jvb2xlYW4nLCAnaW50ZWdlcicsICdudW1iZXInXVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb3BlcmF0b3I6IHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGVudW06IFsnPicsICc+PScsICc9JywgJyE9JywgJzwnLCAnPD0nLCAnbm90TnVsbCddXG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG52YXIgY2ZnID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgcHJvcGVydGllczoge1xuICAgIC8vIHRlbXBsYXRlXG4gICAgd2lkdGg6IHtcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgIGRlZmF1bHQ6IHVuZGVmaW5lZFxuICAgIH0sXG4gICAgaGVpZ2h0OiB7XG4gICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICBkZWZhdWx0OiB1bmRlZmluZWRcbiAgICB9LFxuICAgIHZpZXdwb3J0OiB7XG4gICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgaXRlbXM6IHtcbiAgICAgICAgdHlwZTogJ2ludGVnZXInXG4gICAgICB9LFxuICAgICAgZGVmYXVsdDogdW5kZWZpbmVkXG4gICAgfSxcblxuICAgIC8vIHNpbmdsZSBwbG90XG4gICAgc2luZ2xlSGVpZ2h0OiB7XG4gICAgICAvLyB3aWxsIGJlIG92ZXJ3cml0dGVuIGJ5IGJhbmRXaWR0aCAqIChjYXJkaW5hbGl0eSArIHBhZGRpbmcpXG4gICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICBkZWZhdWx0OiAyMDAsXG4gICAgICBtaW5pbXVtOiAwXG4gICAgfSxcbiAgICBzaW5nbGVXaWR0aDoge1xuICAgICAgLy8gd2lsbCBiZSBvdmVyd3JpdHRlbiBieSBiYW5kV2lkdGggKiAoY2FyZGluYWxpdHkgKyBwYWRkaW5nKVxuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgZGVmYXVsdDogMjAwLFxuICAgICAgbWluaW11bTogMFxuICAgIH0sXG4gICAgLy8gYmFuZCBzaXplXG4gICAgbGFyZ2VCYW5kU2l6ZToge1xuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgZGVmYXVsdDogMTksXG4gICAgICBtaW5pbXVtOiAwXG4gICAgfSxcbiAgICBzbWFsbEJhbmRTaXplOiB7XG4gICAgICAvL3NtYWxsIG11bHRpcGxlcyBvciBzaW5nbGUgcGxvdCB3aXRoIGhpZ2ggY2FyZGluYWxpdHlcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgIGRlZmF1bHQ6IDEyLFxuICAgICAgbWluaW11bTogMFxuICAgIH0sXG4gICAgbGFyZ2VCYW5kTWF4Q2FyZGluYWxpdHk6IHtcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgIGRlZmF1bHQ6IDEwXG4gICAgfSxcbiAgICAvLyBzbWFsbCBtdWx0aXBsZXNcbiAgICBjZWxsUGFkZGluZzoge1xuICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICBkZWZhdWx0OiAwLjFcbiAgICB9LFxuICAgIGNlbGxCYWNrZ3JvdW5kQ29sb3I6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgcm9sZTogJ2NvbG9yJyxcbiAgICAgIGRlZmF1bHQ6ICcjZmRmZGZkJ1xuICAgIH0sXG4gICAgdGV4dENlbGxXaWR0aDoge1xuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgZGVmYXVsdDogOTAsXG4gICAgICBtaW5pbXVtOiAwXG4gICAgfSxcblxuICAgIC8vIG1hcmtzXG4gICAgc3Ryb2tlV2lkdGg6IHtcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgIGRlZmF1bHQ6IDIsXG4gICAgICBtaW5pbXVtOiAwXG4gICAgfSxcblxuICAgIC8vIHNjYWxlc1xuICAgIHRpbWVTY2FsZUxhYmVsTGVuZ3RoOiB7XG4gICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICBkZWZhdWx0OiAzLFxuICAgICAgbWluaW11bTogMFxuICAgIH0sXG4gICAgLy8gb3RoZXJcbiAgICBjaGFyYWN0ZXJXaWR0aDoge1xuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgZGVmYXVsdDogNlxuICAgIH0sXG5cbiAgICAvLyBkYXRhIHNvdXJjZVxuICAgIGRhdGFGb3JtYXRUeXBlOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGVudW06IFsnanNvbicsICdjc3YnXSxcbiAgICAgIGRlZmF1bHQ6ICdqc29uJ1xuICAgIH0sXG4gICAgdXNlVmVnYVNlcnZlcjoge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICB9LFxuICAgIGRhdGFVcmw6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogdW5kZWZpbmVkXG4gICAgfSxcbiAgICB2ZWdhU2VydmVyVGFibGU6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogdW5kZWZpbmVkXG4gICAgfSxcbiAgICB2ZWdhU2VydmVyVXJsOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlZmF1bHQ6ICdodHRwOi8vbG9jYWxob3N0OjMwMDEnXG4gICAgfVxuICB9XG59O1xuXG4vKiogQHR5cGUgT2JqZWN0IFNjaGVtYSBvZiBhIHZlZ2FsaXRlIHNwZWNpZmljYXRpb24gKi9cbnNjaGVtYS5zY2hlbWEgPSB7XG4gICRzY2hlbWE6ICdodHRwOi8vanNvbi1zY2hlbWEub3JnL2RyYWZ0LTA0L3NjaGVtYSMnLFxuICBkZXNjcmlwdGlvbjogJ1NjaGVtYSBmb3IgdmVnYWxpdGUgc3BlY2lmaWNhdGlvbicsXG4gIHR5cGU6ICdvYmplY3QnLFxuICByZXF1aXJlZDogWydtYXJrdHlwZScsICdlbmMnLCAnY2ZnJ10sXG4gIHByb3BlcnRpZXM6IHtcbiAgICBtYXJrdHlwZTogc2NoZW1hLm1hcmt0eXBlLFxuICAgIGVuYzoge1xuICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIHg6IHgsXG4gICAgICAgIHk6IHksXG4gICAgICAgIHJvdzogcm93LFxuICAgICAgICBjb2w6IGNvbCxcbiAgICAgICAgc2l6ZTogc2l6ZSxcbiAgICAgICAgY29sb3I6IGNvbG9yLFxuICAgICAgICBhbHBoYTogYWxwaGEsXG4gICAgICAgIHNoYXBlOiBzaGFwZSxcbiAgICAgICAgdGV4dDogdGV4dCxcbiAgICAgICAgZGV0YWlsOiBkZXRhaWxcbiAgICAgIH1cbiAgICB9LFxuICAgIGZpbHRlcjogZmlsdGVyLFxuICAgIGNmZzogY2ZnXG4gIH1cbn07XG5cbnNjaGVtYS5lbmNUeXBlcyA9IHV0aWwua2V5cyhzY2hlbWEuc2NoZW1hLnByb3BlcnRpZXMuZW5jLnByb3BlcnRpZXMpO1xuXG4vKiogSW5zdGFudGlhdGUgYSB2ZXJib3NlIHZsIHNwZWMgZnJvbSB0aGUgc2NoZW1hICovXG5zY2hlbWEuaW5zdGFudGlhdGUgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHNjaGVtYS51dGlsLmluc3RhbnRpYXRlKHNjaGVtYS5zY2hlbWEpO1xufTtcbiIsInZhciB1dGlsID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxudmFyIGlzRW1wdHkgPSBmdW5jdGlvbihvYmopIHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikubGVuZ3RoID09PSAwO1xufTtcblxudXRpbC5leHRlbmQgPSBmdW5jdGlvbihpbnN0YW5jZSwgc2NoZW1hKSB7XG4gIHJldHVybiB1dGlsLm1lcmdlKHV0aWwuaW5zdGFudGlhdGUoc2NoZW1hKSwgaW5zdGFuY2UpO1xufTtcblxuLy8gaW5zdGFudGlhdGUgYSBzY2hlbWFcbnV0aWwuaW5zdGFudGlhdGUgPSBmdW5jdGlvbihzY2hlbWEpIHtcbiAgaWYgKHNjaGVtYS50eXBlID09PSAnb2JqZWN0Jykge1xuICAgIHZhciBpbnN0YW5jZSA9IHt9O1xuICAgIGZvciAodmFyIG5hbWUgaW4gc2NoZW1hLnByb3BlcnRpZXMpIHtcbiAgICAgIHZhciB2YWwgPSB1dGlsLmluc3RhbnRpYXRlKHNjaGVtYS5wcm9wZXJ0aWVzW25hbWVdKTtcbiAgICAgIGlmICh2YWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpbnN0YW5jZVtuYW1lXSA9IHZhbDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGluc3RhbmNlO1xuICB9IGVsc2UgaWYgKCdkZWZhdWx0JyBpbiBzY2hlbWEpIHtcbiAgICByZXR1cm4gc2NoZW1hLmRlZmF1bHQ7XG4gIH0gZWxzZSBpZiAoc2NoZW1hLnR5cGUgPT09ICdhcnJheScpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn07XG5cbi8vIHJlbW92ZSBhbGwgZGVmYXVsdHMgZnJvbSBhbiBpbnN0YW5jZVxudXRpbC5zdWJ0cmFjdCA9IGZ1bmN0aW9uKGluc3RhbmNlLCBkZWZhdWx0cykge1xuICB2YXIgY2hhbmdlcyA9IHt9O1xuICBmb3IgKHZhciBwcm9wIGluIGluc3RhbmNlKSB7XG4gICAgdmFyIGRlZiA9IGRlZmF1bHRzW3Byb3BdO1xuICAgIHZhciBpbnMgPSBpbnN0YW5jZVtwcm9wXTtcbiAgICAvLyBOb3RlOiBkb2VzIG5vdCBwcm9wZXJseSBzdWJ0cmFjdCBhcnJheXNcbiAgICBpZiAoIWRlZmF1bHRzIHx8IGRlZiAhPT0gaW5zKSB7XG4gICAgICBpZiAodHlwZW9mIGlucyA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkoaW5zKSkge1xuICAgICAgICB2YXIgYyA9IHV0aWwuc3VidHJhY3QoaW5zLCBkZWYpO1xuICAgICAgICBpZiAoIWlzRW1wdHkoYykpXG4gICAgICAgICAgY2hhbmdlc1twcm9wXSA9IGM7XG4gICAgICB9IGVsc2UgaWYgKCFBcnJheS5pc0FycmF5KGlucykgfHwgaW5zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY2hhbmdlc1twcm9wXSA9IGlucztcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNoYW5nZXM7XG59O1xuXG51dGlsLm1lcmdlID0gZnVuY3Rpb24oLypkZXN0Kiwgc3JjMCwgc3JjMSwgLi4uKi8pe1xuICB2YXIgZGVzdCA9IGFyZ3VtZW50c1swXTtcbiAgZm9yICh2YXIgaT0xIDsgaTxhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICBkZXN0ID0gbWVyZ2UoZGVzdCwgYXJndW1lbnRzW2ldKTtcbiAgfVxuICByZXR1cm4gZGVzdDtcbn07XG5cbi8vIHJlY3Vyc2l2ZWx5IG1lcmdlcyBzcmMgaW50byBkZXN0XG5tZXJnZSA9IGZ1bmN0aW9uKGRlc3QsIHNyYykge1xuICBpZiAodHlwZW9mIHNyYyAhPT0gJ29iamVjdCcgfHwgc3JjID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGRlc3Q7XG4gIH1cblxuICBmb3IgKHZhciBwIGluIHNyYykge1xuICAgIGlmICghc3JjLmhhc093blByb3BlcnR5KHApKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKHNyY1twXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBzcmNbcF0gIT09ICdvYmplY3QnIHx8IHNyY1twXSA9PT0gbnVsbCkge1xuICAgICAgZGVzdFtwXSA9IHNyY1twXTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkZXN0W3BdICE9PSAnb2JqZWN0JyB8fCBkZXN0W3BdID09PSBudWxsKSB7XG4gICAgICBkZXN0W3BdID0gbWVyZ2Uoc3JjW3BdLmNvbnN0cnVjdG9yID09PSBBcnJheSA/IFtdIDoge30sIHNyY1twXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG1lcmdlKGRlc3RbcF0sIHNyY1twXSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBkZXN0O1xufTsiLCJ2YXIgdXRpbCA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnV0aWwua2V5cyA9IGZ1bmN0aW9uKG9iaikge1xuICB2YXIgayA9IFtdLCB4O1xuICBmb3IgKHggaW4gb2JqKSBrLnB1c2goeCk7XG4gIHJldHVybiBrO1xufTtcblxudXRpbC52YWxzID0gZnVuY3Rpb24ob2JqKSB7XG4gIHZhciB2ID0gW10sIHg7XG4gIGZvciAoeCBpbiBvYmopIHYucHVzaChvYmpbeF0pO1xuICByZXR1cm4gdjtcbn07XG5cbnV0aWwucmFuZ2UgPSBmdW5jdGlvbihzdGFydCwgc3RvcCwgc3RlcCkge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIHtcbiAgICBzdGVwID0gMTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgIHN0b3AgPSBzdGFydDtcbiAgICAgIHN0YXJ0ID0gMDtcbiAgICB9XG4gIH1cbiAgaWYgKChzdG9wIC0gc3RhcnQpIC8gc3RlcCA9PSBJbmZpbml0eSkgdGhyb3cgbmV3IEVycm9yKCdpbmZpbml0ZSByYW5nZScpO1xuICB2YXIgcmFuZ2UgPSBbXSwgaSA9IC0xLCBqO1xuICBpZiAoc3RlcCA8IDApIHdoaWxlICgoaiA9IHN0YXJ0ICsgc3RlcCAqICsraSkgPiBzdG9wKSByYW5nZS5wdXNoKGopO1xuICBlbHNlIHdoaWxlICgoaiA9IHN0YXJ0ICsgc3RlcCAqICsraSkgPCBzdG9wKSByYW5nZS5wdXNoKGopO1xuICByZXR1cm4gcmFuZ2U7XG59O1xuXG51dGlsLmZpbmQgPSBmdW5jdGlvbihsaXN0LCBwYXR0ZXJuKSB7XG4gIHZhciBsID0gbGlzdC5maWx0ZXIoZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB4W3BhdHRlcm4ubmFtZV0gPT09IHBhdHRlcm4udmFsdWU7XG4gIH0pO1xuICByZXR1cm4gbC5sZW5ndGggJiYgbFswXSB8fCBudWxsO1xufTtcblxudXRpbC51bmlxID0gZnVuY3Rpb24oZGF0YSwgZmllbGQpIHtcbiAgdmFyIG1hcCA9IHt9LCBjb3VudCA9IDAsIGksIGs7XG4gIGZvciAoaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgKytpKSB7XG4gICAgayA9IGRhdGFbaV1bZmllbGRdO1xuICAgIGlmICghbWFwW2tdKSB7XG4gICAgICBtYXBba10gPSAxO1xuICAgICAgY291bnQgKz0gMTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNvdW50O1xufTtcblxudXRpbC5taW5tYXggPSBmdW5jdGlvbihkYXRhLCBmaWVsZCwgZXhjbHVkZU51bGxzKSB7XG4gIHZhciBleGNsdWRlTnVsbHMgPSBleGNsdWRlTnVsbHMgPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogZXhjbHVkZU51bGxzO1xuICB2YXIgc3RhdHMgPSB7bWluOiArSW5maW5pdHksIG1heDogLUluZmluaXR5fTtcbiAgZm9yIChpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgdiA9IGRhdGFbaV1bZmllbGRdO1xuICAgIGlmIChleGNsdWRlTnVsbHMgJiYgdiA9PT0gbnVsbClcbiAgICAgIGNvbnRpbnVlO1xuICAgIGlmICh2ID4gc3RhdHMubWF4KSBzdGF0cy5tYXggPSB2O1xuICAgIGlmICh2IDwgc3RhdHMubWluKSBzdGF0cy5taW4gPSB2O1xuICB9XG4gIHJldHVybiBzdGF0cztcbn07XG5cbnV0aWwuZHVwbGljYXRlID0gZnVuY3Rpb24ob2JqKSB7XG4gIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9iaikpO1xufTtcblxudXRpbC5hbnkgPSBmdW5jdGlvbihhcnIsIGYpIHtcbiAgdmFyIGkgPSAwLCBrO1xuICBmb3IgKGsgaW4gYXJyKSB7XG4gICAgaWYgKGYoYXJyW2tdLCBrLCBpKyspKSByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG51dGlsLmFsbCA9IGZ1bmN0aW9uKGFyciwgZikge1xuICB2YXIgaSA9IDAsIGs7XG4gIGZvciAoayBpbiBhcnIpIHtcbiAgICBpZiAoIWYoYXJyW2tdLCBrLCBpKyspKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xuXG51dGlsLm1lcmdlID0gZnVuY3Rpb24oZGVzdCwgc3JjKSB7XG4gIHJldHVybiB1dGlsLmtleXMoc3JjKS5yZWR1Y2UoZnVuY3Rpb24oYywgaykge1xuICAgIGNba10gPSBzcmNba107XG4gICAgcmV0dXJuIGM7XG4gIH0sIGRlc3QpO1xufTtcblxudXRpbC5nZXRiaW5zID0gZnVuY3Rpb24oc3RhdHMsIG1heGJpbnMpIHtcbiAgcmV0dXJuIHZnLmJpbnMoe1xuICAgIG1pbjogc3RhdHMubWluLFxuICAgIG1heDogc3RhdHMubWF4LFxuICAgIG1heGJpbnM6IG1heGJpbnNcbiAgfSk7XG59O1xuXG4vKipcbiAqIHhbcFswXV0uLi5bcFtuXV0gPSB2YWxcbiAqIEBwYXJhbSBub2F1Z21lbnQgZGV0ZXJtaW5lIHdoZXRoZXIgbmV3IG9iamVjdCBzaG91bGQgYmUgYWRkZWQgZlxuICogb3Igbm9uLWV4aXN0aW5nIHByb3BlcnRpZXMgYWxvbmcgdGhlIHBhdGhcbiAqL1xudXRpbC5zZXR0ZXIgPSBmdW5jdGlvbih4LCBwLCB2YWwsIG5vYXVnbWVudCkge1xuICBmb3IgKHZhciBpPTA7IGk8cC5sZW5ndGgtMTsgKytpKSB7XG4gICAgaWYgKCFub2F1Z21lbnQgJiYgIShwW2ldIGluIHgpKXtcbiAgICAgIHggPSB4W3BbaV1dID0ge307XG4gICAgfSBlbHNlIHtcbiAgICAgIHggPSB4W3BbaV1dO1xuICAgIH1cbiAgfVxuICB4W3BbaV1dID0gdmFsO1xufTtcblxuXG4vKipcbiAqIHJldHVybnMgeFtwWzBdXS4uLltwW25dXVxuICogQHBhcmFtIGF1Z21lbnQgZGV0ZXJtaW5lIHdoZXRoZXIgbmV3IG9iamVjdCBzaG91bGQgYmUgYWRkZWQgZlxuICogb3Igbm9uLWV4aXN0aW5nIHByb3BlcnRpZXMgYWxvbmcgdGhlIHBhdGhcbiAqL1xudXRpbC5nZXR0ZXIgPSBmdW5jdGlvbih4LCBwLCBub2F1Z21lbnQpIHtcbiAgZm9yICh2YXIgaT0wOyBpPHAubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoIW5vYXVnbWVudCAmJiAhKHBbaV0gaW4geCkpe1xuICAgICAgeCA9IHhbcFtpXV0gPSB7fTtcbiAgICB9IGVsc2Uge1xuICAgICAgeCA9IHhbcFtpXV07XG4gICAgfVxuICB9XG4gIHJldHVybiB4O1xufTtcblxudXRpbC50cnVuY2F0ZSA9IGZ1bmN0aW9uKHMsIGxlbmd0aCwgcG9zLCB3b3JkLCBlbGxpcHNpcykge1xuICB2YXIgbGVuID0gcy5sZW5ndGg7XG4gIGlmIChsZW4gPD0gbGVuZ3RoKSByZXR1cm4gcztcbiAgZWxsaXBzaXMgPSBlbGxpcHNpcyB8fCBcIi4uLlwiO1xuICB2YXIgbCA9IE1hdGgubWF4KDAsIGxlbmd0aCAtIGVsbGlwc2lzLmxlbmd0aCk7XG5cbiAgc3dpdGNoIChwb3MpIHtcbiAgICBjYXNlIFwibGVmdFwiOlxuICAgICAgcmV0dXJuIGVsbGlwc2lzICsgKHdvcmQgPyB2Z190cnVuY2F0ZU9uV29yZChzLGwsMSkgOiBzLnNsaWNlKGxlbi1sKSk7XG4gICAgY2FzZSBcIm1pZGRsZVwiOlxuICAgIGNhc2UgXCJjZW50ZXJcIjpcbiAgICAgIHZhciBsMSA9IE1hdGguY2VpbChsLzIpLCBsMiA9IE1hdGguZmxvb3IobC8yKTtcbiAgICAgIHJldHVybiAod29yZCA/IHZnX3RydW5jYXRlT25Xb3JkKHMsbDEpIDogcy5zbGljZSgwLGwxKSkgKyBlbGxpcHNpcyArXG4gICAgICAgICh3b3JkID8gdmdfdHJ1bmNhdGVPbldvcmQocyxsMiwxKSA6IHMuc2xpY2UobGVuLWwyKSk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiAod29yZCA/IHZnX3RydW5jYXRlT25Xb3JkKHMsbCkgOiBzLnNsaWNlKDAsbCkpICsgZWxsaXBzaXM7XG4gIH1cbn07XG5cbnV0aWwuZXJyb3IgPSBmdW5jdGlvbihtc2cpIHtcbiAgY29uc29sZS5lcnJvcignW1ZMIEVycm9yXScsIG1zZyk7XG59O1xuXG4iXX0=
