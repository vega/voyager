!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.vl=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

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

var globals = require('./globals'),
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
    var filterNull = [],
      fields = this.fields(),
      self = this;

    util.forEach(fields, function(fieldList, fieldName) {
      if (fieldName === '*') return; //count

      if ((self.config('filterNull').Q && fieldList.containsType[Q]) ||
          (self.config('filterNull').T && fieldList.containsType[T]) ||
          (self.config('filterNull').O && fieldList.containsType[O])) {
        filterNull.push({
          operands: [fieldName],
          operator: 'notNull'
        });
      }
    });

    return filterNull.concat(this._filter);
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

  /*
   * return key-value pairs of field name and list of fields of that field name
   */
  proto.fields = function() {
    return vlenc.fields(this._enc);
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
    return vlenc.isAggregate(this._enc);
  };

  Encoding.isAggregate = function(spec) {
    return vlenc.isAggregate(spec.enc);
  };

  Encoding.isStack = function(spec) {
    // FIXME update this once we have control for stack ...
    return (spec.marktype === 'bar' || spec.marktype === 'area') &&
      spec.enc.color;
  };

  proto.isStack = function() {
    // FIXME update this once we have control for stack ...
    return (this.is('bar') || this.is('area')) && this.has('color');
  };

  proto.cardinality = function(encType, stats) {
    return vlfield.cardinality(this.enc(encType), stats, this.config('filterNull'), true);
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
    var c = consts.shorthand;
    return 'mark' + c.assign + this._marktype +
      c.delim + vlenc.shorthand(this._enc);
  };

  Encoding.shorthand = function (spec) {
    var c = consts.shorthand;
    return 'mark' + c.assign + spec.marktype +
      c.delim + vlenc.shorthand(spec.enc);
  };

  Encoding.parseShorthand = function(shorthand, cfg) {
    var c = consts.shorthand,
        split = shorthand.split(c.delim),
        marktype = split.shift().split(c.assign)[1].trim(),
        enc = vlenc.parseShorthand(split[1], true);

    return new Encoding(marktype, enc, cfg);
  };

  // FIXME remove this -- simply use Encoding.shorthand
  Encoding.shorthandFromSpec = function(/*spec, theme*/) {
    return Encoding.fromSpec.apply(null, arguments).toShorthand();
  };

  Encoding.specFromShorthand = function(shorthand, cfg, excludeConfig) {
    return Encoding.parseShorthand(shorthand, cfg).toSpec(excludeConfig);
  };

  Encoding.fromSpec = function(spec, theme) {
    var enc = util.duplicate(spec.enc || {});

    //convert type from string to bitcode (e.g, O=1)
    for (var e in enc) {
      enc[e].type = consts.dataTypes[enc[e].type];
    }

    return new Encoding(spec.marktype, enc, spec.cfg, spec.filter, theme);
  };


  return Encoding;

})();

},{"./compile/time":19,"./consts":20,"./enc":22,"./field":23,"./globals":24,"./schema/schema":25,"./util":27}],3:[function(require,module,exports){
'use strict';

var globals = require('../globals'),
  util = require('../util');

module.exports = aggregates;

function aggregates(spec, encoding, opt) {
  opt = opt || {};

  var dims = {}, meas = {}, detail = {}, facets = {},
    data = spec.data[1]; // currently data[0] is raw and data[1] is table

  encoding.forEach(function(field, encType) {
    if (field.aggr) {
      if (field.aggr === 'count') {
        meas.count = {op: 'count', field: '*'};
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
'use strict';

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
'use strict';

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

  encoding.forEach(function(field, encType) {
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
'use strict';

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
  stacking = compile.stacking = require('./stacking'),
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
'use strict';

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
  }

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
'use strict';

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
  encoding.forEach(function(field, encType) {
    if (encoding.scale(encType).type === 'log') {
      spec.data[1].transform.push({
        type: 'filter',
        test: 'd.' + encoding.field(encType) + '>0'
      });
    }
  });
};


},{"../globals":24}],9:[function(require,module,exports){
'use strict';

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
'use strict';

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

  // FIXME/HACK we need to take filter into account
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
'use strict';

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
'use strict';

var globals = require('../globals'),
  util = require('../util');

var marks = module.exports = {};

marks.def = function(mark, encoding, layout, style) {
  var defs = [];

  // to add a background to text, we need to add it before the text
  if (encoding.marktype() === TEXT && encoding.has(COLOR)) {
    var bg = {
      x: {value: 0},
      y: {value: 0},
      x2: {value: layout.cellWidth},
      y2: {value: layout.cellHeight},
      fill: {scale: COLOR, field: encoding.field(COLOR)}
    };
    defs.push({
      type: 'rect',
      from: {data: TABLE},
      properties: {enter: bg, update: bg}
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
  supportedEncoding: {row: 1, col: 1, x: 1, y: 1, color: 1, alpha: 1, detail:1}
};

marks.area = {
  type: 'area',
  stack: true,
  line: true,
  requiredEncoding: ['x', 'y'],
  prop: area_props,
  supportedEncoding: {row: 1, col: 1, x: 1, y: 1, color: 1, alpha: 1}
};

marks.tick = {
  type: 'rect',
  prop: tick_props,
  supportedEncoding: {row: 1, col: 1, x: 1, y: 1, color: 1, alpha: 1, detail: 1}
};

marks.circle = {
  type: 'symbol',
  prop: filled_point_props('circle'),
  supportedEncoding: {row: 1, col: 1, x: 1, y: 1, size: 1, color: 1, alpha: 1, detail: 1}
};

marks.square = {
  type: 'symbol',
  prop: filled_point_props('square'),
  supportedEncoding: marks.circle.supportedEncoding
};

marks.point = {
  type: 'symbol',
  prop: point_props,
  supportedEncoding: {row: 1, col: 1, x: 1, y: 1, size: 1, color: 1, alpha: 1, shape: 1, detail: 1}
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
    if (e.has(TEXT) && e.isType(TEXT, Q)) {
      p.x.offset = layout.cellWidth;
    }
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
      p.align = {value: 'right'};
    } else {
      p.text = {field: e.field(TEXT)};
    }
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
'use strict';

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
      } else { //point
        var bandSize = Math.min(encoding.bandSize(X), encoding.bandSize(Y)) - 1;
        s.range = [10, 0.8 * bandSize*bandSize];
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
'use strict';

var globals = require('../globals');

module.exports = addSortTransforms;

// adds new transforms that produce sorted fields
function addSortTransforms(spec, encoding, opt) {
  var datasetMapping = {};
  var counter = 0;

  encoding.forEach(function(field, encType) {
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
'use strict';

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
    encoding.forEach(function(field, encType) {

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
  } else if (numPoints < 1000 || encoding.is('tick')) {
    opacity = 0.6;
  } else {
    opacity = 0.3;
  }

  return opacity;
}


},{"../Encoding":2,"../field":23,"../globals":24,"../util":27}],17:[function(require,module,exports){
'use strict';

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
'use strict';

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

  encoding.forEach(function(field, encType) {
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
'use strict';

var globals = require('../globals'),
  util = require('../util');

module.exports = time;

function time(spec, encoding, opt) {
  var timeFields = {}, timeFn = {};

  // find unique formula transformation and bin function
  encoding.forEach(function(field, encType) {
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

time.cardinality = function(field, stats, filterNull) {
  var fn = field.fn;
  switch (fn) {
    case 'seconds': return 60;
    case 'minutes': return 60;
    case 'hours': return 24;
    case 'day': return 7;
    case 'date': return 31;
    case 'month': return 12;
    // case 'year':  -- need real cardinality
  }

  return null;
};

function fieldFn(func, field) {
  return func + '(d.data.'+ field.name +')';
}

/**
 * @return {String} date binning formula of the given field
 */
time.formula = function(field) {
  return fieldFn(field.fn, field);
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
    case 'day':
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
    case 'seconds':
    case 'minutes':
    case 'hours':
    case 'day':
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
    case 'seconds':
    case 'minutes': return util.range(0, 60);
    case 'hours': return util.range(0, 24);
    case 'day': return util.range(0, 7);
    case 'date': return util.range(0, 32);
    case 'month': return util.range(0, 12);
  }
  return null;
};

/** whether a particular time function has custom scale for labels implemented in time.scale */
time.hasScale = function(fn) {
  switch (fn) {
    case 'day':
    case 'month':
      return true;
  }
  return false;
};



},{"../globals":24,"../util":27}],20:[function(require,module,exports){
'use strict';

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
'use strict';

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
  encoding.forEach(function(field, encType) {
    var obj = {
      name: encoding.field(encType, true),
      field: field.name
    };
    if (field.aggr) {
      obj.aggr = field.aggr;
    }
    if (field.bin) {
      obj.binSize = util.getbins(stats[field.name], encoding.bin(encType).maxbins).step;
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
    while(Object.keys(sample).length < Math.min(stat.cardinality, 10)) {
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

'use strict';

var consts = require('./consts'),
  c = consts.shorthand,
  time = require('./compile/time'),
  vlfield = require('./field'),
  util = require('./util'),
  schema = require('./schema/schema'),
  encTypes = schema.encTypes;

var vlenc = module.exports = {};

vlenc.countRetinal = function(enc) {
  var count = 0;
  if (enc.color) count++;
  if (enc.alpha) count++;
  if (enc.size) count++;
  if (enc.shape) count++;
  return count;
};

vlenc.has = function(enc, encType) {
  var fieldDef = enc && enc[encType];
  return fieldDef && fieldDef.name;
};

vlenc.isAggregate = function(enc) {
  for (var k in enc) {
    if (vlenc.has(enc, k) && enc[k].aggr) {
      return true;
    }
  }
  return false;
};

vlenc.forEach = function(enc, f) {
  var i = 0;
  encTypes.forEach(function(k) {
    if (vlenc.has(enc, k)) {
      f(enc[k], k, i++);
    }
  });
};

vlenc.map = function(enc, f) {
  var arr = [];
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
      r = f(r, enc[k], k,  enc);
    }
  });
  return r;
};

/*
 * return key-value pairs of field name and list of fields of that field name
 */
vlenc.fields = function(enc) {
  return vlenc.reduce(enc, function (m, field, encType) {
    var fieldList = m[field.name] = m[field.name] || [],
      containsType = fieldList.containsType = fieldList.containsType || {};

    if (fieldList.indexOf(field) === -1) {
      fieldList.push(field);
      // augment the array with containsType.Q / O / T
      containsType[field.type] = true;
    }
    return m;
  }, {});
};

vlenc.shorthand = function(enc) {
  return vlenc.map(enc, function(field, et) {
    return et + c.assign + vlfield.shorthand(field);
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
'use strict';

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
  return  isType(field, O) || !!field.bin ||
    ( isType(field, T) && !!field.fn );
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
vlfield.cardinality = function(field, stats, filterNull, useTypeCode) {
  // FIXME need to take filter into account
  var isType = getIsType(useTypeCode),
    type = useTypeCode ? consts.dataTypeNames[field.type] : field.type;

  filterNull = filterNull || {};

  if (field.bin) {
    var bins = util.getbins(stats[field.name], field.bin.maxbins || schema.MAXBINS_DEFAULT);
    return (bins.stop - bins.start) / bins.step;
  }
  if (isType(field, T)) {
    var cardinality = time.cardinality(field, stats, filterNull);
    if(cardinality !== null) return cardinality;
    //otherwise use calculation below
  }
  if (field.aggr) {
    return 1;
  }

  // remove null
  var stat = stats[field.name];
  return stat.cardinality -
    (stat.numNulls > 0 && filterNull[type] ? 1 : 0);
};

},{"./compile/time":19,"./consts":20,"./schema/schema":25,"./util":27}],24:[function(require,module,exports){
(function (global){
'use strict';

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
"use strict";

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

schema.getSupportedRole = function(encType) {
  return schema.schema.properties.enc.properties[encType].supportedRole;
};

schema.timefns = ['year', 'month', 'day', 'date', 'hours', 'minutes', 'seconds'];

schema.defaultTimeFn = 'month';

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
};

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
          default: 25,
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

    // filter null
    filterNull: {
      type: 'object',
      properties: {
        O: {type:'boolean', default: false},
        Q: {type:'boolean', default: true},
        T: {type:'boolean', default: true}
      }
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

schema.getEncType = function(encType) {
  return schema.schema.properties.enc.properties[encType];
};

schema.instantiateField = function(encType) {
  return schema.util.instantiate(schema.getEncType(encType));
};

/** Instantiate a verbose vl spec from the schema */
schema.instantiate = function() {
  return schema.util.instantiate(schema.schema);
};

},{"../util":27,"./schemautil":26}],26:[function(require,module,exports){
'use strict';

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
      if (typeof ins === 'object' && !Array.isArray(ins) && def) {
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
function merge(dest, src) {
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
}
},{}],27:[function(require,module,exports){
'use strict';

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

util.isin = function(item, array) {
  return array.indexOf(item) !== -1;
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
};

util.numbers = function(values) {
  var nums = [];
  for (var i = 0; i < values.length; i++) {
    if (isNumber(values[i])) {
      nums.push(+values[i]);
    }
  }
  return nums;
};

util.median = function(values) {
  values.sort(function(a, b) {return a - b;});
  var half = Math.floor(values.length/2);
  if (values.length % 2) {
    return values[half];
  } else {
    return (values[half-1] + values[half]) / 2.0;
  }
};

util.mean = function(values) {
  return values.reduce(function(v, r) {return v + r;}, 0) / values.length;
};

util.variance = function(values) {
  var avg = util.mean(values);
  var diffs = [];
  for (var i = 0; i < values.length; i++) {
    diffs.push(Math.pow((values[i] - avg), 2));
  }
  return util.mean(diffs);
};

util.stdev = function(values) {
  return Math.sqrt(util.variance(values));
};

util.skew = function(values) {
  var avg = util.mean(values),
    med = util.median(values),
    std = util.stdev(values);
  return 1.0 * (avg - med) / std;
};

util.minmax = function(data, field, excludeNulls) {
  excludeNulls = excludeNulls === undefined ? false : excludeNulls;
  var stats = {min: +Infinity, max: -Infinity};
  for (var i = 0; i < data.length; ++i) {
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

util.isArray = Array.isArray || function(obj) {
  return toString.call(obj) == '[object Array]';
};

util.array = function(x) {
  return x ? (util.isArray(x) ? x : [x]) : [];
};

util.forEach = function(obj, f, thisArg) {
  if (obj.forEach) {
    obj.forEach.call(thisArg, f);
  } else {
    for (var k in obj) {
      f.call(thisArg, obj[k], k , obj);
    }
  }
};

util.reduce = function(obj, f, init, thisArg) {
  if (obj.reduce) {
    return obj.reduce.call(thisArg, f, init);
  } else {
    for (var k in obj) {
      init = f.call(thisArg, init, obj[k], k, obj);
    }
    return init;
  }
};

util.map = function(obj, f, thisArg) {
  if (obj.map) {
    return obj.map.call(thisArg, f);
  } else {
    var output = [];
    for (var k in obj) {
      output.push( f.call(thisArg, obj[k], k, obj));
    }
  }
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


util.cmp = function(a, b) {
  if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  } else if (a >= b) {
    return 0;
  } else if (a === null && b === null) {
    return 0;
  } else if (a === null) {
    return -1;
  } else if (b === null) {
    return 1;
  }
  return NaN;
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
  return util.bins({
    min: stats.min,
    max: stats.max,
    maxbins: maxbins
  });
};


util.bins = function(opt) {
  opt = opt || {};

  // determine range
  var maxb = opt.maxbins || 1024,
      base = opt.base || 10,
      div = opt.div || [5, 2],
      mins = opt.minstep || 0,
      logb = Math.log(base),
      level = Math.ceil(Math.log(maxb) / logb),
      min = opt.min,
      max = opt.max,
      span = max - min,
      step = Math.max(mins, Math.pow(base, Math.round(Math.log(span) / logb) - level)),
      nbins = Math.ceil(span / step),
      precision, v, i, eps;

  if (opt.step) {
    step = opt.step;
  } else if (opt.steps) {
    // if provided, limit choice to acceptable step sizes
    step = opt.steps[Math.min(
        opt.steps.length - 1,
        util_bisectLeft(opt.steps, span / maxb, 0, opt.steps.length)
    )];
  } else {
    // increase step size if too many bins
    do {
      step *= base;
      nbins = Math.ceil(span / step);
    } while (nbins > maxb);

    // decrease step size if allowed
    for (i = 0; i < div.length; ++i) {
      v = step / div[i];
      if (v >= mins && span / v <= maxb) {
        step = v;
        nbins = Math.ceil(span / step);
      }
    }
  }

  // update precision, min and max
  v = Math.log(step);
  precision = v >= 0 ? 0 : ~~(-v / logb) + 1;
  eps = (min<0 ? -1 : 1) * Math.pow(base, -precision - 1);
  min = Math.min(min, Math.floor(min / step + eps) * step);
  max = Math.ceil(max / step) * step;

  return {
    start: min,
    stop: max,
    step: step,
    unit: precision
  };
};

function util_bisectLeft(a, x, lo, hi) {
  while (lo < hi) {
    var mid = lo + hi >>> 1;
    if (util.cmp(a[mid], x) < 0) { lo = mid + 1; }
    else { hi = mid; }
  }
  return lo;
}

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

function vg_truncateOnWord(s, len, rev) {
  var cnt = 0, tok = s.split(vg_truncate_word_re);
  if (rev) {
    s = (tok = tok.reverse())
      .filter(function(w) { cnt += w.length; return cnt <= len; })
      .reverse();
  } else {
    s = tok.filter(function(w) { cnt += w.length; return cnt <= len; });
  }
  return s.length ? s.join("").trim() : tok[0].slice(0, len);
}

var vg_truncate_word_re = /([\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u2028\u2029\u3000\uFEFF])/;


util.error = function(msg) {
  console.error('[VL Error]', msg);
};


},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvdmwiLCJzcmMvRW5jb2RpbmcuanMiLCJzcmMvY29tcGlsZS9hZ2dyZWdhdGVzLmpzIiwic3JjL2NvbXBpbGUvYXhpcy5qcyIsInNyYy9jb21waWxlL2Jpbm5pbmcuanMiLCJzcmMvY29tcGlsZS9jb21waWxlLmpzIiwic3JjL2NvbXBpbGUvZmFjZXRpbmcuanMiLCJzcmMvY29tcGlsZS9maWx0ZXIuanMiLCJzcmMvY29tcGlsZS9ncm91cC5qcyIsInNyYy9jb21waWxlL2xheW91dC5qcyIsInNyYy9jb21waWxlL2xlZ2VuZC5qcyIsInNyYy9jb21waWxlL21hcmtzLmpzIiwic3JjL2NvbXBpbGUvc2NhbGUuanMiLCJzcmMvY29tcGlsZS9zb3J0LmpzIiwic3JjL2NvbXBpbGUvc3RhY2tpbmcuanMiLCJzcmMvY29tcGlsZS9zdHlsZS5qcyIsInNyYy9jb21waWxlL3N1YmZhY2V0aW5nLmpzIiwic3JjL2NvbXBpbGUvdGVtcGxhdGUuanMiLCJzcmMvY29tcGlsZS90aW1lLmpzIiwic3JjL2NvbnN0cy5qcyIsInNyYy9kYXRhLmpzIiwic3JjL2VuYy5qcyIsInNyYy9maWVsZC5qcyIsInNyYy9nbG9iYWxzLmpzIiwic3JjL3NjaGVtYS9zY2hlbWEuanMiLCJzcmMvc2NoZW1hL3NjaGVtYXV0aWwuanMiLCJzcmMvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdmNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDektBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5a0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi9nbG9iYWxzJyksXG4gICAgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpLFxuICAgIGNvbnN0cyA9IHJlcXVpcmUoJy4vY29uc3RzJyk7XG5cbnZhciB2bCA9IHV0aWwubWVyZ2UoY29uc3RzLCB1dGlsKTtcblxudmwuRW5jb2RpbmcgPSByZXF1aXJlKCcuL0VuY29kaW5nJyk7XG52bC5jb21waWxlID0gcmVxdWlyZSgnLi9jb21waWxlL2NvbXBpbGUnKTtcbnZsLmRhdGEgPSByZXF1aXJlKCcuL2RhdGEnKTtcbnZsLmZpZWxkID0gcmVxdWlyZSgnLi9maWVsZCcpO1xudmwuZW5jID0gcmVxdWlyZSgnLi9lbmMnKTtcbnZsLnNjaGVtYSA9IHJlcXVpcmUoJy4vc2NoZW1hL3NjaGVtYScpO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gdmw7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi9nbG9iYWxzJyksXG4gIGNvbnN0cyA9IHJlcXVpcmUoJy4vY29uc3RzJyksXG4gIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKSxcbiAgdmxmaWVsZCA9IHJlcXVpcmUoJy4vZmllbGQnKSxcbiAgdmxlbmMgPSByZXF1aXJlKCcuL2VuYycpLFxuICBzY2hlbWEgPSByZXF1aXJlKCcuL3NjaGVtYS9zY2hlbWEnKSxcbiAgdGltZSA9IHJlcXVpcmUoJy4vY29tcGlsZS90aW1lJyk7XG5cbnZhciBFbmNvZGluZyA9IG1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuXG4gIGZ1bmN0aW9uIEVuY29kaW5nKG1hcmt0eXBlLCBlbmMsIGNvbmZpZywgZmlsdGVyLCB0aGVtZSkge1xuICAgIHZhciBkZWZhdWx0cyA9IHNjaGVtYS5pbnN0YW50aWF0ZSgpO1xuXG4gICAgdmFyIHNwZWMgPSB7XG4gICAgICBtYXJrdHlwZTogbWFya3R5cGUsXG4gICAgICBlbmM6IGVuYyxcbiAgICAgIGNmZzogY29uZmlnLFxuICAgICAgZmlsdGVyOiBmaWx0ZXIgfHwgW11cbiAgICB9O1xuXG4gICAgLy8gdHlwZSB0byBiaXRjb2RlXG4gICAgZm9yICh2YXIgZSBpbiBkZWZhdWx0cy5lbmMpIHtcbiAgICAgIGRlZmF1bHRzLmVuY1tlXS50eXBlID0gY29uc3RzLmRhdGFUeXBlc1tkZWZhdWx0cy5lbmNbZV0udHlwZV07XG4gICAgfVxuXG4gICAgdmFyIHNwZWNFeHRlbmRlZCA9IHNjaGVtYS51dGlsLm1lcmdlKGRlZmF1bHRzLCB0aGVtZSB8fCB7fSwgc3BlYykgO1xuXG4gICAgdGhpcy5fbWFya3R5cGUgPSBzcGVjRXh0ZW5kZWQubWFya3R5cGU7XG4gICAgdGhpcy5fZW5jID0gc3BlY0V4dGVuZGVkLmVuYztcbiAgICB0aGlzLl9jZmcgPSBzcGVjRXh0ZW5kZWQuY2ZnO1xuICAgIHRoaXMuX2ZpbHRlciA9IHNwZWNFeHRlbmRlZC5maWx0ZXI7XG4gIH1cblxuICB2YXIgcHJvdG8gPSBFbmNvZGluZy5wcm90b3R5cGU7XG5cbiAgcHJvdG8ubWFya3R5cGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFya3R5cGU7XG4gIH07XG5cbiAgcHJvdG8uaXMgPSBmdW5jdGlvbihtKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcmt0eXBlID09PSBtO1xuICB9O1xuXG4gIHByb3RvLmhhcyA9IGZ1bmN0aW9uKGVuY1R5cGUpIHtcbiAgICAvLyBlcXVpdmFsZW50IHRvIGNhbGxpbmcgdmxlbmMuaGFzKHRoaXMuX2VuYywgZW5jVHlwZSlcbiAgICByZXR1cm4gdGhpcy5fZW5jW2VuY1R5cGVdLm5hbWUgIT09IHVuZGVmaW5lZDtcbiAgfTtcblxuICBwcm90by5lbmMgPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuY1t4XTtcbiAgfTtcblxuICBwcm90by5maWx0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZmlsdGVyTnVsbCA9IFtdLFxuICAgICAgZmllbGRzID0gdGhpcy5maWVsZHMoKSxcbiAgICAgIHNlbGYgPSB0aGlzO1xuXG4gICAgdXRpbC5mb3JFYWNoKGZpZWxkcywgZnVuY3Rpb24oZmllbGRMaXN0LCBmaWVsZE5hbWUpIHtcbiAgICAgIGlmIChmaWVsZE5hbWUgPT09ICcqJykgcmV0dXJuOyAvL2NvdW50XG5cbiAgICAgIGlmICgoc2VsZi5jb25maWcoJ2ZpbHRlck51bGwnKS5RICYmIGZpZWxkTGlzdC5jb250YWluc1R5cGVbUV0pIHx8XG4gICAgICAgICAgKHNlbGYuY29uZmlnKCdmaWx0ZXJOdWxsJykuVCAmJiBmaWVsZExpc3QuY29udGFpbnNUeXBlW1RdKSB8fFxuICAgICAgICAgIChzZWxmLmNvbmZpZygnZmlsdGVyTnVsbCcpLk8gJiYgZmllbGRMaXN0LmNvbnRhaW5zVHlwZVtPXSkpIHtcbiAgICAgICAgZmlsdGVyTnVsbC5wdXNoKHtcbiAgICAgICAgICBvcGVyYW5kczogW2ZpZWxkTmFtZV0sXG4gICAgICAgICAgb3BlcmF0b3I6ICdub3ROdWxsJ1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBmaWx0ZXJOdWxsLmNvbmNhdCh0aGlzLl9maWx0ZXIpO1xuICB9O1xuXG4gIC8vIGdldCBcImZpZWxkXCIgcHJvcGVydHkgZm9yIHZlZ2FcbiAgcHJvdG8uZmllbGQgPSBmdW5jdGlvbih4LCBub2RhdGEsIG5vZm4pIHtcbiAgICBpZiAoIXRoaXMuaGFzKHgpKSByZXR1cm4gbnVsbDtcblxuICAgIHZhciBmID0gKG5vZGF0YSA/ICcnIDogJ2RhdGEuJyk7XG5cbiAgICBpZiAodGhpcy5fZW5jW3hdLmFnZ3IgPT09ICdjb3VudCcpIHtcbiAgICAgIHJldHVybiBmICsgJ2NvdW50JztcbiAgICB9IGVsc2UgaWYgKCFub2ZuICYmIHRoaXMuX2VuY1t4XS5iaW4pIHtcbiAgICAgIHJldHVybiBmICsgJ2Jpbl8nICsgdGhpcy5fZW5jW3hdLm5hbWU7XG4gICAgfSBlbHNlIGlmICghbm9mbiAmJiB0aGlzLl9lbmNbeF0uYWdncikge1xuICAgICAgcmV0dXJuIGYgKyB0aGlzLl9lbmNbeF0uYWdnciArICdfJyArIHRoaXMuX2VuY1t4XS5uYW1lO1xuICAgIH0gZWxzZSBpZiAoIW5vZm4gJiYgdGhpcy5fZW5jW3hdLmZuKSB7XG4gICAgICByZXR1cm4gZiArIHRoaXMuX2VuY1t4XS5mbiArICdfJyArIHRoaXMuX2VuY1t4XS5uYW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZiArIHRoaXMuX2VuY1t4XS5uYW1lO1xuICAgIH1cbiAgfTtcblxuICBwcm90by5maWVsZE5hbWUgPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuY1t4XS5uYW1lO1xuICB9O1xuXG4gIC8qXG4gICAqIHJldHVybiBrZXktdmFsdWUgcGFpcnMgb2YgZmllbGQgbmFtZSBhbmQgbGlzdCBvZiBmaWVsZHMgb2YgdGhhdCBmaWVsZCBuYW1lXG4gICAqL1xuICBwcm90by5maWVsZHMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdmxlbmMuZmllbGRzKHRoaXMuX2VuYyk7XG4gIH07XG5cbiAgcHJvdG8uZmllbGRUaXRsZSA9IGZ1bmN0aW9uKHgpIHtcbiAgICBpZiAodmxmaWVsZC5pc0NvdW50KHRoaXMuX2VuY1t4XSkpIHtcbiAgICAgIHJldHVybiB2bGZpZWxkLmNvdW50LmRpc3BsYXlOYW1lO1xuICAgIH1cbiAgICB2YXIgZm4gPSB0aGlzLl9lbmNbeF0uYWdnciB8fCB0aGlzLl9lbmNbeF0uZm4gfHwgKHRoaXMuX2VuY1t4XS5iaW4gJiYgXCJiaW5cIik7XG4gICAgaWYgKGZuKSB7XG4gICAgICByZXR1cm4gZm4udG9VcHBlckNhc2UoKSArICcoJyArIHRoaXMuX2VuY1t4XS5uYW1lICsgJyknO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fZW5jW3hdLm5hbWU7XG4gICAgfVxuICB9O1xuXG4gIHByb3RvLnNjYWxlID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB0aGlzLl9lbmNbeF0uc2NhbGUgfHwge307XG4gIH07XG5cbiAgcHJvdG8uYXhpcyA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW5jW3hdLmF4aXMgfHwge307XG4gIH07XG5cbiAgcHJvdG8uYmFuZCA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW5jW3hdLmJhbmQgfHwge307XG4gIH07XG5cbiAgcHJvdG8uYmFuZFNpemUgPSBmdW5jdGlvbihlbmNUeXBlLCB1c2VTbWFsbEJhbmQpIHtcbiAgICB1c2VTbWFsbEJhbmQgPSB1c2VTbWFsbEJhbmQgfHxcbiAgICAgIC8vaXNCYW5kSW5TbWFsbE11bHRpcGxlc1xuICAgICAgKGVuY1R5cGUgPT09IFkgJiYgdGhpcy5oYXMoUk9XKSAmJiB0aGlzLmhhcyhZKSkgfHxcbiAgICAgIChlbmNUeXBlID09PSBYICYmIHRoaXMuaGFzKENPTCkgJiYgdGhpcy5oYXMoWCkpO1xuXG4gICAgLy8gaWYgYmFuZC5zaXplIGlzIGV4cGxpY2l0bHkgc3BlY2lmaWVkLCBmb2xsb3cgdGhlIHNwZWNpZmljYXRpb24sIG90aGVyd2lzZSBkcmF3IHZhbHVlIGZyb20gY29uZmlnLlxuICAgIHJldHVybiB0aGlzLmJhbmQoZW5jVHlwZSkuc2l6ZSB8fFxuICAgICAgdGhpcy5jb25maWcodXNlU21hbGxCYW5kID8gJ3NtYWxsQmFuZFNpemUnIDogJ2xhcmdlQmFuZFNpemUnKTtcbiAgfTtcblxuICBwcm90by5hZ2dyID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB0aGlzLl9lbmNbeF0uYWdncjtcbiAgfTtcblxuICAvLyByZXR1cm5zIGZhbHNlIGlmIGJpbm5pbmcgaXMgZGlzYWJsZWQsIG90aGVyd2lzZSBhbiBvYmplY3Qgd2l0aCBiaW5uaW5nIHByb3BlcnRpZXNcbiAgcHJvdG8uYmluID0gZnVuY3Rpb24oeCkge1xuICAgIHZhciBiaW4gPSB0aGlzLl9lbmNbeF0uYmluO1xuICAgIGlmIChiaW4gPT09IHt9KVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGlmIChiaW4gPT09IHRydWUpXG4gICAgICByZXR1cm4ge1xuICAgICAgICBtYXhiaW5zOiBzY2hlbWEuTUFYQklOU19ERUZBVUxUXG4gICAgICB9O1xuICAgIHJldHVybiBiaW47XG4gIH07XG5cbiAgcHJvdG8ubGVnZW5kID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB0aGlzLl9lbmNbeF0ubGVnZW5kO1xuICB9O1xuXG4gIHByb3RvLnZhbHVlID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB0aGlzLl9lbmNbeF0udmFsdWU7XG4gIH07XG5cbiAgcHJvdG8uZm4gPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuY1t4XS5mbjtcbiAgfTtcblxuICAgcHJvdG8uc29ydCA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW5jW3hdLnNvcnQ7XG4gIH07XG5cbiAgcHJvdG8uYW55ID0gZnVuY3Rpb24oZikge1xuICAgIHJldHVybiB1dGlsLmFueSh0aGlzLl9lbmMsIGYpO1xuICB9O1xuXG4gIHByb3RvLmFsbCA9IGZ1bmN0aW9uKGYpIHtcbiAgICByZXR1cm4gdXRpbC5hbGwodGhpcy5fZW5jLCBmKTtcbiAgfTtcblxuICBwcm90by5sZW5ndGggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdXRpbC5rZXlzKHRoaXMuX2VuYykubGVuZ3RoO1xuICB9O1xuXG4gIHByb3RvLm1hcCA9IGZ1bmN0aW9uKGYpIHtcbiAgICByZXR1cm4gdmxlbmMubWFwKHRoaXMuX2VuYywgZik7XG4gIH07XG5cbiAgcHJvdG8ucmVkdWNlID0gZnVuY3Rpb24oZiwgaW5pdCkge1xuICAgIHJldHVybiB2bGVuYy5yZWR1Y2UodGhpcy5fZW5jLCBmLCBpbml0KTtcbiAgfTtcblxuICBwcm90by5mb3JFYWNoID0gZnVuY3Rpb24oZikge1xuICAgIHJldHVybiB2bGVuYy5mb3JFYWNoKHRoaXMuX2VuYywgZik7XG4gIH07XG5cbiAgcHJvdG8udHlwZSA9IGZ1bmN0aW9uKGV0KSB7XG4gICAgcmV0dXJuIHRoaXMuaGFzKGV0KSA/IHRoaXMuX2VuY1tldF0udHlwZSA6IG51bGw7XG4gIH07XG5cbiAgcHJvdG8ucm9sZSA9IGZ1bmN0aW9uKGV0KSB7XG4gICAgcmV0dXJuIHRoaXMuaGFzKGV0KSA/IHZsZmllbGQucm9sZSh0aGlzLl9lbmNbZXRdKSA6IG51bGw7XG4gIH07XG5cbiAgcHJvdG8udGV4dCA9IGZ1bmN0aW9uKHByb3ApIHtcbiAgICB2YXIgdGV4dCA9IHRoaXMuX2VuY1tURVhUXS50ZXh0O1xuICAgIHJldHVybiBwcm9wID8gdGV4dFtwcm9wXSA6IHRleHQ7XG4gIH07XG5cbiAgcHJvdG8uZm9udCA9IGZ1bmN0aW9uKHByb3ApIHtcbiAgICB2YXIgZm9udCA9IHRoaXMuX2VuY1tURVhUXS5mb250O1xuICAgIHJldHVybiBwcm9wID8gZm9udFtwcm9wXSA6IGZvbnQ7XG4gIH07XG5cbiAgcHJvdG8uaXNUeXBlID0gZnVuY3Rpb24oeCwgdHlwZSkge1xuICAgIHZhciBmaWVsZCA9IHRoaXMuZW5jKHgpO1xuICAgIHJldHVybiBmaWVsZCAmJiBFbmNvZGluZy5pc1R5cGUoZmllbGQsIHR5cGUpO1xuICB9O1xuXG4gIEVuY29kaW5nLmlzVHlwZSA9IGZ1bmN0aW9uIChmaWVsZERlZiwgdHlwZSkge1xuICAgIHJldHVybiAoZmllbGREZWYudHlwZSAmIHR5cGUpID4gMDtcbiAgfTtcblxuICBFbmNvZGluZy5pc09yZGluYWxTY2FsZSA9IGZ1bmN0aW9uKGVuY29kaW5nLCBlbmNUeXBlKSB7XG4gICAgcmV0dXJuIHZsZmllbGQuaXNPcmRpbmFsU2NhbGUoZW5jb2RpbmcuZW5jKGVuY1R5cGUpLCB0cnVlKTtcbiAgfTtcblxuICBFbmNvZGluZy5pc0RpbWVuc2lvbiA9IGZ1bmN0aW9uKGVuY29kaW5nLCBlbmNUeXBlKSB7XG4gICAgcmV0dXJuIHZsZmllbGQuaXNEaW1lbnNpb24oZW5jb2RpbmcuZW5jKGVuY1R5cGUpLCB0cnVlKTtcbiAgfTtcblxuICBFbmNvZGluZy5pc01lYXN1cmUgPSBmdW5jdGlvbihlbmNvZGluZywgZW5jVHlwZSkge1xuICAgIHJldHVybiB2bGZpZWxkLmlzTWVhc3VyZShlbmNvZGluZy5lbmMoZW5jVHlwZSksIHRydWUpO1xuICB9O1xuXG4gIHByb3RvLmlzT3JkaW5hbFNjYWxlID0gZnVuY3Rpb24oZW5jVHlwZSkge1xuICAgIHJldHVybiB0aGlzLmhhcyhlbmNUeXBlKSAmJiBFbmNvZGluZy5pc09yZGluYWxTY2FsZSh0aGlzLCBlbmNUeXBlKTtcbiAgfTtcblxuICBwcm90by5pc0RpbWVuc2lvbiA9IGZ1bmN0aW9uKGVuY1R5cGUpIHtcbiAgICByZXR1cm4gdGhpcy5oYXMoZW5jVHlwZSkgJiYgRW5jb2RpbmcuaXNEaW1lbnNpb24odGhpcywgZW5jVHlwZSk7XG4gIH07XG5cbiAgcHJvdG8uaXNNZWFzdXJlID0gZnVuY3Rpb24oZW5jVHlwZSkge1xuICAgIHJldHVybiB0aGlzLmhhcyhlbmNUeXBlKSAmJiBFbmNvZGluZy5pc01lYXN1cmUodGhpcywgZW5jVHlwZSk7XG4gIH07XG5cbiAgcHJvdG8uaXNBZ2dyZWdhdGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdmxlbmMuaXNBZ2dyZWdhdGUodGhpcy5fZW5jKTtcbiAgfTtcblxuICBFbmNvZGluZy5pc0FnZ3JlZ2F0ZSA9IGZ1bmN0aW9uKHNwZWMpIHtcbiAgICByZXR1cm4gdmxlbmMuaXNBZ2dyZWdhdGUoc3BlYy5lbmMpO1xuICB9O1xuXG4gIEVuY29kaW5nLmlzU3RhY2sgPSBmdW5jdGlvbihzcGVjKSB7XG4gICAgLy8gRklYTUUgdXBkYXRlIHRoaXMgb25jZSB3ZSBoYXZlIGNvbnRyb2wgZm9yIHN0YWNrIC4uLlxuICAgIHJldHVybiAoc3BlYy5tYXJrdHlwZSA9PT0gJ2JhcicgfHwgc3BlYy5tYXJrdHlwZSA9PT0gJ2FyZWEnKSAmJlxuICAgICAgc3BlYy5lbmMuY29sb3I7XG4gIH07XG5cbiAgcHJvdG8uaXNTdGFjayA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIEZJWE1FIHVwZGF0ZSB0aGlzIG9uY2Ugd2UgaGF2ZSBjb250cm9sIGZvciBzdGFjayAuLi5cbiAgICByZXR1cm4gKHRoaXMuaXMoJ2JhcicpIHx8IHRoaXMuaXMoJ2FyZWEnKSkgJiYgdGhpcy5oYXMoJ2NvbG9yJyk7XG4gIH07XG5cbiAgcHJvdG8uY2FyZGluYWxpdHkgPSBmdW5jdGlvbihlbmNUeXBlLCBzdGF0cykge1xuICAgIHJldHVybiB2bGZpZWxkLmNhcmRpbmFsaXR5KHRoaXMuZW5jKGVuY1R5cGUpLCBzdGF0cywgdGhpcy5jb25maWcoJ2ZpbHRlck51bGwnKSwgdHJ1ZSk7XG4gIH07XG5cbiAgcHJvdG8uaXNSYXcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gIXRoaXMuaXNBZ2dyZWdhdGUoKTtcbiAgfTtcblxuICBwcm90by5jb25maWcgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NmZ1tuYW1lXTtcbiAgfTtcblxuICBwcm90by50b1NwZWMgPSBmdW5jdGlvbihleGNsdWRlQ29uZmlnKSB7XG4gICAgdmFyIGVuYyA9IHV0aWwuZHVwbGljYXRlKHRoaXMuX2VuYyksXG4gICAgICBzcGVjO1xuXG4gICAgLy8gY29udmVydCB0eXBlJ3MgYml0Y29kZSB0byB0eXBlIG5hbWVcbiAgICBmb3IgKHZhciBlIGluIGVuYykge1xuICAgICAgZW5jW2VdLnR5cGUgPSBjb25zdHMuZGF0YVR5cGVOYW1lc1tlbmNbZV0udHlwZV07XG4gICAgfVxuXG4gICAgc3BlYyA9IHtcbiAgICAgIG1hcmt0eXBlOiB0aGlzLl9tYXJrdHlwZSxcbiAgICAgIGVuYzogZW5jLFxuICAgICAgZmlsdGVyOiB0aGlzLl9maWx0ZXJcbiAgICB9O1xuXG4gICAgaWYgKCFleGNsdWRlQ29uZmlnKSB7XG4gICAgICBzcGVjLmNmZyA9IHV0aWwuZHVwbGljYXRlKHRoaXMuX2NmZyk7XG4gICAgfVxuXG4gICAgLy8gcmVtb3ZlIGRlZmF1bHRzXG4gICAgdmFyIGRlZmF1bHRzID0gc2NoZW1hLmluc3RhbnRpYXRlKCk7XG4gICAgcmV0dXJuIHNjaGVtYS51dGlsLnN1YnRyYWN0KHNwZWMsIGRlZmF1bHRzKTtcbiAgfTtcblxuICBwcm90by50b1Nob3J0aGFuZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjID0gY29uc3RzLnNob3J0aGFuZDtcbiAgICByZXR1cm4gJ21hcmsnICsgYy5hc3NpZ24gKyB0aGlzLl9tYXJrdHlwZSArXG4gICAgICBjLmRlbGltICsgdmxlbmMuc2hvcnRoYW5kKHRoaXMuX2VuYyk7XG4gIH07XG5cbiAgRW5jb2Rpbmcuc2hvcnRoYW5kID0gZnVuY3Rpb24gKHNwZWMpIHtcbiAgICB2YXIgYyA9IGNvbnN0cy5zaG9ydGhhbmQ7XG4gICAgcmV0dXJuICdtYXJrJyArIGMuYXNzaWduICsgc3BlYy5tYXJrdHlwZSArXG4gICAgICBjLmRlbGltICsgdmxlbmMuc2hvcnRoYW5kKHNwZWMuZW5jKTtcbiAgfTtcblxuICBFbmNvZGluZy5wYXJzZVNob3J0aGFuZCA9IGZ1bmN0aW9uKHNob3J0aGFuZCwgY2ZnKSB7XG4gICAgdmFyIGMgPSBjb25zdHMuc2hvcnRoYW5kLFxuICAgICAgICBzcGxpdCA9IHNob3J0aGFuZC5zcGxpdChjLmRlbGltKSxcbiAgICAgICAgbWFya3R5cGUgPSBzcGxpdC5zaGlmdCgpLnNwbGl0KGMuYXNzaWduKVsxXS50cmltKCksXG4gICAgICAgIGVuYyA9IHZsZW5jLnBhcnNlU2hvcnRoYW5kKHNwbGl0WzFdLCB0cnVlKTtcblxuICAgIHJldHVybiBuZXcgRW5jb2RpbmcobWFya3R5cGUsIGVuYywgY2ZnKTtcbiAgfTtcblxuICAvLyBGSVhNRSByZW1vdmUgdGhpcyAtLSBzaW1wbHkgdXNlIEVuY29kaW5nLnNob3J0aGFuZFxuICBFbmNvZGluZy5zaG9ydGhhbmRGcm9tU3BlYyA9IGZ1bmN0aW9uKC8qc3BlYywgdGhlbWUqLykge1xuICAgIHJldHVybiBFbmNvZGluZy5mcm9tU3BlYy5hcHBseShudWxsLCBhcmd1bWVudHMpLnRvU2hvcnRoYW5kKCk7XG4gIH07XG5cbiAgRW5jb2Rpbmcuc3BlY0Zyb21TaG9ydGhhbmQgPSBmdW5jdGlvbihzaG9ydGhhbmQsIGNmZywgZXhjbHVkZUNvbmZpZykge1xuICAgIHJldHVybiBFbmNvZGluZy5wYXJzZVNob3J0aGFuZChzaG9ydGhhbmQsIGNmZykudG9TcGVjKGV4Y2x1ZGVDb25maWcpO1xuICB9O1xuXG4gIEVuY29kaW5nLmZyb21TcGVjID0gZnVuY3Rpb24oc3BlYywgdGhlbWUpIHtcbiAgICB2YXIgZW5jID0gdXRpbC5kdXBsaWNhdGUoc3BlYy5lbmMgfHwge30pO1xuXG4gICAgLy9jb252ZXJ0IHR5cGUgZnJvbSBzdHJpbmcgdG8gYml0Y29kZSAoZS5nLCBPPTEpXG4gICAgZm9yICh2YXIgZSBpbiBlbmMpIHtcbiAgICAgIGVuY1tlXS50eXBlID0gY29uc3RzLmRhdGFUeXBlc1tlbmNbZV0udHlwZV07XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBFbmNvZGluZyhzcGVjLm1hcmt0eXBlLCBlbmMsIHNwZWMuY2ZnLCBzcGVjLmZpbHRlciwgdGhlbWUpO1xuICB9O1xuXG5cbiAgcmV0dXJuIEVuY29kaW5nO1xuXG59KSgpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2xvYmFscyA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBhZ2dyZWdhdGVzO1xuXG5mdW5jdGlvbiBhZ2dyZWdhdGVzKHNwZWMsIGVuY29kaW5nLCBvcHQpIHtcbiAgb3B0ID0gb3B0IHx8IHt9O1xuXG4gIHZhciBkaW1zID0ge30sIG1lYXMgPSB7fSwgZGV0YWlsID0ge30sIGZhY2V0cyA9IHt9LFxuICAgIGRhdGEgPSBzcGVjLmRhdGFbMV07IC8vIGN1cnJlbnRseSBkYXRhWzBdIGlzIHJhdyBhbmQgZGF0YVsxXSBpcyB0YWJsZVxuXG4gIGVuY29kaW5nLmZvckVhY2goZnVuY3Rpb24oZmllbGQsIGVuY1R5cGUpIHtcbiAgICBpZiAoZmllbGQuYWdncikge1xuICAgICAgaWYgKGZpZWxkLmFnZ3IgPT09ICdjb3VudCcpIHtcbiAgICAgICAgbWVhcy5jb3VudCA9IHtvcDogJ2NvdW50JywgZmllbGQ6ICcqJ307XG4gICAgICB9ZWxzZSB7XG4gICAgICAgIG1lYXNbZmllbGQuYWdnciArICd8JysgZmllbGQubmFtZV0gPSB7XG4gICAgICAgICAgb3A6IGZpZWxkLmFnZ3IsXG4gICAgICAgICAgZmllbGQ6ICdkYXRhLicrIGZpZWxkLm5hbWVcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZGltc1tmaWVsZC5uYW1lXSA9IGVuY29kaW5nLmZpZWxkKGVuY1R5cGUpO1xuICAgICAgaWYgKGVuY1R5cGUgPT0gUk9XIHx8IGVuY1R5cGUgPT0gQ09MKSB7XG4gICAgICAgIGZhY2V0c1tmaWVsZC5uYW1lXSA9IGRpbXNbZmllbGQubmFtZV07XG4gICAgICB9ZWxzZSBpZiAoZW5jVHlwZSAhPT0gWCAmJiBlbmNUeXBlICE9PSBZKSB7XG4gICAgICAgIGRldGFpbFtmaWVsZC5uYW1lXSA9IGRpbXNbZmllbGQubmFtZV07XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgZGltcyA9IHV0aWwudmFscyhkaW1zKTtcbiAgbWVhcyA9IHV0aWwudmFscyhtZWFzKTtcblxuICBpZiAobWVhcy5sZW5ndGggPiAwICYmICFvcHQucHJlYWdncmVnYXRlZERhdGEpIHtcbiAgICBpZiAoIWRhdGEudHJhbnNmb3JtKSBkYXRhLnRyYW5zZm9ybSA9IFtdO1xuICAgIGRhdGEudHJhbnNmb3JtLnB1c2goe1xuICAgICAgdHlwZTogJ2FnZ3JlZ2F0ZScsXG4gICAgICBncm91cGJ5OiBkaW1zLFxuICAgICAgZmllbGRzOiBtZWFzXG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBkZXRhaWxzOiB1dGlsLnZhbHMoZGV0YWlsKSxcbiAgICBkaW1zOiBkaW1zLFxuICAgIGZhY2V0czogdXRpbC52YWxzKGZhY2V0cyksXG4gICAgYWdncmVnYXRlZDogbWVhcy5sZW5ndGggPiAwXG4gIH07XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpLFxuICBzZXR0ZXIgPSB1dGlsLnNldHRlcixcbiAgZ2V0dGVyID0gdXRpbC5nZXR0ZXIsXG4gIHRpbWUgPSByZXF1aXJlKCcuL3RpbWUnKTtcblxudmFyIGF4aXMgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5heGlzLm5hbWVzID0gZnVuY3Rpb24ocHJvcHMpIHtcbiAgcmV0dXJuIHV0aWwua2V5cyh1dGlsLmtleXMocHJvcHMpLnJlZHVjZShmdW5jdGlvbihhLCB4KSB7XG4gICAgdmFyIHMgPSBwcm9wc1t4XS5zY2FsZTtcbiAgICBpZiAocyA9PT0gWCB8fCBzID09PSBZKSBhW3Byb3BzW3hdLnNjYWxlXSA9IDE7XG4gICAgcmV0dXJuIGE7XG4gIH0sIHt9KSk7XG59O1xuXG5heGlzLmRlZnMgPSBmdW5jdGlvbihuYW1lcywgZW5jb2RpbmcsIGxheW91dCwgb3B0KSB7XG4gIHJldHVybiBuYW1lcy5yZWR1Y2UoZnVuY3Rpb24oYSwgbmFtZSkge1xuICAgIGEucHVzaChheGlzLmRlZihuYW1lLCBlbmNvZGluZywgbGF5b3V0LCBvcHQpKTtcbiAgICByZXR1cm4gYTtcbiAgfSwgW10pO1xufTtcblxuYXhpcy5kZWYgPSBmdW5jdGlvbihuYW1lLCBlbmNvZGluZywgbGF5b3V0LCBvcHQpIHtcbiAgdmFyIHR5cGUgPSBuYW1lO1xuICB2YXIgaXNDb2wgPSBuYW1lID09IENPTCwgaXNSb3cgPSBuYW1lID09IFJPVztcbiAgaWYgKGlzQ29sKSB0eXBlID0gJ3gnO1xuICBpZiAoaXNSb3cpIHR5cGUgPSAneSc7XG5cbiAgdmFyIGRlZiA9IHtcbiAgICB0eXBlOiB0eXBlLFxuICAgIHNjYWxlOiBuYW1lXG4gIH07XG5cbiAgaWYgKGVuY29kaW5nLmF4aXMobmFtZSkuZ3JpZCkge1xuICAgIGRlZi5ncmlkID0gdHJ1ZTtcbiAgICBkZWYubGF5ZXIgPSAnYmFjayc7XG4gIH1cblxuICBpZiAoZW5jb2RpbmcuYXhpcyhuYW1lKS50aXRsZSkge1xuICAgIGRlZiA9IGF4aXNfdGl0bGUoZGVmLCBuYW1lLCBlbmNvZGluZywgbGF5b3V0LCBvcHQpO1xuICB9XG5cbiAgaWYgKGlzUm93IHx8IGlzQ29sKSB7XG4gICAgc2V0dGVyKGRlZiwgWydwcm9wZXJ0aWVzJywgJ3RpY2tzJ10sIHtcbiAgICAgIG9wYWNpdHk6IHt2YWx1ZTogMH1cbiAgICB9KTtcbiAgICBzZXR0ZXIoZGVmLCBbJ3Byb3BlcnRpZXMnLCAnbWFqb3JUaWNrcyddLCB7XG4gICAgICBvcGFjaXR5OiB7dmFsdWU6IDB9XG4gICAgfSk7XG4gICAgc2V0dGVyKGRlZiwgWydwcm9wZXJ0aWVzJywgJ2F4aXMnXSwge1xuICAgICAgb3BhY2l0eToge3ZhbHVlOiAwfVxuICAgIH0pO1xuICB9XG5cbiAgaWYgKGlzQ29sKSB7XG4gICAgZGVmLm9yaWVudCA9ICd0b3AnO1xuICB9XG5cbiAgaWYgKGlzUm93KSB7XG4gICAgZGVmLm9mZnNldCA9IGF4aXNUaXRsZU9mZnNldChlbmNvZGluZywgbGF5b3V0LCBZKSArIDIwO1xuICB9XG5cbiAgaWYgKG5hbWUgPT0gWCkge1xuICAgIGlmIChlbmNvZGluZy5pc0RpbWVuc2lvbihYKSB8fCBlbmNvZGluZy5pc1R5cGUoWCwgVCkpIHtcbiAgICAgIHNldHRlcihkZWYsIFsncHJvcGVydGllcycsJ2xhYmVscyddLCB7XG4gICAgICAgIGFuZ2xlOiB7dmFsdWU6IDI3MH0sXG4gICAgICAgIGFsaWduOiB7dmFsdWU6ICdyaWdodCd9LFxuICAgICAgICBiYXNlbGluZToge3ZhbHVlOiAnbWlkZGxlJ31cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7IC8vIFFcbiAgICAgIGRlZi50aWNrcyA9IDU7XG4gICAgfVxuICB9XG5cbiAgZGVmID0gYXhpc19sYWJlbHMoZGVmLCBuYW1lLCBlbmNvZGluZywgbGF5b3V0LCBvcHQpO1xuXG4gIHJldHVybiBkZWY7XG59O1xuXG5mdW5jdGlvbiBheGlzX3RpdGxlKGRlZiwgbmFtZSwgZW5jb2RpbmcsIGxheW91dCwgb3B0KSB7XG4gIHZhciBtYXhsZW5ndGggPSBudWxsLFxuICAgIGZpZWxkVGl0bGUgPSBlbmNvZGluZy5maWVsZFRpdGxlKG5hbWUpO1xuICBpZiAobmFtZT09PVgpIHtcbiAgICBtYXhsZW5ndGggPSBsYXlvdXQuY2VsbFdpZHRoIC8gZW5jb2RpbmcuY29uZmlnKCdjaGFyYWN0ZXJXaWR0aCcpO1xuICB9IGVsc2UgaWYgKG5hbWUgPT09IFkpIHtcbiAgICBtYXhsZW5ndGggPSBsYXlvdXQuY2VsbEhlaWdodCAvIGVuY29kaW5nLmNvbmZpZygnY2hhcmFjdGVyV2lkdGgnKTtcbiAgfVxuXG4gIGRlZi50aXRsZSA9IG1heGxlbmd0aCA/IHV0aWwudHJ1bmNhdGUoZmllbGRUaXRsZSwgbWF4bGVuZ3RoKSA6IGZpZWxkVGl0bGU7XG5cbiAgaWYgKG5hbWUgPT09IFJPVykge1xuICAgIHNldHRlcihkZWYsIFsncHJvcGVydGllcycsJ3RpdGxlJ10sIHtcbiAgICAgIGFuZ2xlOiB7dmFsdWU6IDB9LFxuICAgICAgYWxpZ246IHt2YWx1ZTogJ3JpZ2h0J30sXG4gICAgICBiYXNlbGluZToge3ZhbHVlOiAnbWlkZGxlJ30sXG4gICAgICBkeToge3ZhbHVlOiAoLWxheW91dC5oZWlnaHQvMikgLTIwfVxuICAgIH0pO1xuICB9XG5cbiAgZGVmLnRpdGxlT2Zmc2V0ID0gYXhpc1RpdGxlT2Zmc2V0KGVuY29kaW5nLCBsYXlvdXQsIG5hbWUpO1xuICByZXR1cm4gZGVmO1xufVxuXG5mdW5jdGlvbiBheGlzX2xhYmVscyhkZWYsIG5hbWUsIGVuY29kaW5nLCBsYXlvdXQsIG9wdCkge1xuICB2YXIgZm47XG4gIC8vIGFkZCBjdXN0b20gbGFiZWwgZm9yIHRpbWUgdHlwZVxuICBpZiAoZW5jb2RpbmcuaXNUeXBlKG5hbWUsIFQpICYmIChmbiA9IGVuY29kaW5nLmZuKG5hbWUpKSAmJiAodGltZS5oYXNTY2FsZShmbikpKSB7XG4gICAgc2V0dGVyKGRlZiwgWydwcm9wZXJ0aWVzJywnbGFiZWxzJywndGV4dCcsJ3NjYWxlJ10sICd0aW1lLScrIGZuKTtcbiAgfVxuXG4gIHZhciB0ZXh0VGVtcGxhdGVQYXRoID0gWydwcm9wZXJ0aWVzJywnbGFiZWxzJywndGV4dCcsJ3RlbXBsYXRlJ107XG4gIGlmIChlbmNvZGluZy5heGlzKG5hbWUpLmZvcm1hdCkge1xuICAgIGRlZi5mb3JtYXQgPSBlbmNvZGluZy5heGlzKG5hbWUpLmZvcm1hdDtcbiAgfSBlbHNlIGlmIChlbmNvZGluZy5pc1R5cGUobmFtZSwgUSkpIHtcbiAgICBzZXR0ZXIoZGVmLCB0ZXh0VGVtcGxhdGVQYXRoLCBcInt7ZGF0YSB8IG51bWJlcjonLjNzJ319XCIpO1xuICB9IGVsc2UgaWYgKGVuY29kaW5nLmlzVHlwZShuYW1lLCBUKSAmJiAhZW5jb2RpbmcuZm4obmFtZSkpIHtcbiAgICBzZXR0ZXIoZGVmLCB0ZXh0VGVtcGxhdGVQYXRoLCBcInt7ZGF0YSB8IHRpbWU6JyVZLSVtLSVkJ319XCIpO1xuICB9IGVsc2UgaWYgKGVuY29kaW5nLmlzVHlwZShuYW1lLCBUKSAmJiBlbmNvZGluZy5mbihuYW1lKSA9PT0gJ3llYXInKSB7XG4gICAgc2V0dGVyKGRlZiwgdGV4dFRlbXBsYXRlUGF0aCwgXCJ7e2RhdGEgfCBudW1iZXI6J2QnfX1cIik7XG4gIH0gZWxzZSBpZiAoZW5jb2RpbmcuaXNUeXBlKG5hbWUsIE8pICYmIGVuY29kaW5nLmF4aXMobmFtZSkubWF4TGFiZWxMZW5ndGgpIHtcbiAgICBzZXR0ZXIoZGVmLCB0ZXh0VGVtcGxhdGVQYXRoLCAne3tkYXRhIHwgdHJ1bmNhdGU6JyArIGVuY29kaW5nLmF4aXMobmFtZSkubWF4TGFiZWxMZW5ndGggKyAnfX0nKTtcbiAgfVxuXG4gIHJldHVybiBkZWY7XG59XG5cbmZ1bmN0aW9uIGF4aXNUaXRsZU9mZnNldChlbmNvZGluZywgbGF5b3V0LCBuYW1lKSB7XG4gIHZhciB2YWx1ZSA9IGVuY29kaW5nLmF4aXMobmFtZSkudGl0bGVPZmZzZXQ7XG4gIGlmICh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICBzd2l0Y2ggKG5hbWUpIHtcbiAgICBjYXNlIFJPVzogcmV0dXJuIDA7XG4gICAgY2FzZSBDT0w6IHJldHVybiAzNTtcbiAgfVxuICByZXR1cm4gZ2V0dGVyKGxheW91dCwgW25hbWUsICdheGlzVGl0bGVPZmZzZXQnXSk7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJpbm5pbmc7XG5cbmZ1bmN0aW9uIGJpbm5pbmcoc3BlYywgZW5jb2RpbmcsIG9wdCkge1xuICBvcHQgPSBvcHQgfHwge307XG4gIHZhciBiaW5zID0ge307XG5cbiAgaWYgKG9wdC5wcmVhZ2dyZWdhdGVkRGF0YSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICghc3BlYy50cmFuc2Zvcm0pIHNwZWMudHJhbnNmb3JtID0gW107XG5cbiAgZW5jb2RpbmcuZm9yRWFjaChmdW5jdGlvbihmaWVsZCwgZW5jVHlwZSkge1xuICAgIGlmIChlbmNvZGluZy5iaW4oZW5jVHlwZSkpIHtcbiAgICAgIHNwZWMudHJhbnNmb3JtLnB1c2goe1xuICAgICAgICB0eXBlOiAnYmluJyxcbiAgICAgICAgZmllbGQ6ICdkYXRhLicgKyBmaWVsZC5uYW1lLFxuICAgICAgICBvdXRwdXQ6ICdkYXRhLmJpbl8nICsgZmllbGQubmFtZSxcbiAgICAgICAgbWF4YmluczogZW5jb2RpbmcuYmluKGVuY1R5cGUpLm1heGJpbnNcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbXBpbGU7XG5cbnZhciB0ZW1wbGF0ZSA9IGNvbXBpbGUudGVtcGxhdGUgPSByZXF1aXJlKCcuL3RlbXBsYXRlJyksXG4gIGF4aXMgPSBjb21waWxlLmF4aXMgPSByZXF1aXJlKCcuL2F4aXMnKSxcbiAgZmlsdGVyID0gY29tcGlsZS5maWx0ZXIgPSByZXF1aXJlKCcuL2ZpbHRlcicpLFxuICBsZWdlbmQgPSBjb21waWxlLmxlZ2VuZCA9IHJlcXVpcmUoJy4vbGVnZW5kJyksXG4gIG1hcmtzID0gY29tcGlsZS5tYXJrcyA9IHJlcXVpcmUoJy4vbWFya3MnKSxcbiAgc2NhbGUgPSBjb21waWxlLnNjYWxlID0gcmVxdWlyZSgnLi9zY2FsZScpLFxuICB2bHNvcnQgPSBjb21waWxlLnNvcnQgPSByZXF1aXJlKCcuL3NvcnQnKSxcbiAgdmxzdHlsZSA9IGNvbXBpbGUuc3R5bGUgPSByZXF1aXJlKCcuL3N0eWxlJyksXG4gIHRpbWUgPSBjb21waWxlLnRpbWUgPSByZXF1aXJlKCcuL3RpbWUnKSxcbiAgYWdncmVnYXRlcyA9IGNvbXBpbGUuYWdncmVnYXRlcyA9IHJlcXVpcmUoJy4vYWdncmVnYXRlcycpLFxuICBiaW5uaW5nID0gY29tcGlsZS5iaW5uaW5nID0gcmVxdWlyZSgnLi9iaW5uaW5nJyksXG4gIGZhY2V0aW5nID0gY29tcGlsZS5mYWNldGluZyA9IHJlcXVpcmUoJy4vZmFjZXRpbmcnKSxcbiAgc3RhY2tpbmcgPSBjb21waWxlLnN0YWNraW5nID0gcmVxdWlyZSgnLi9zdGFja2luZycpLFxuICBzdWJmYWNldGluZyA9IGNvbXBpbGUuc3ViZmFjZXRpbmcgPSByZXF1aXJlKCcuL3N1YmZhY2V0aW5nJyk7XG5cbmNvbXBpbGUubGF5b3V0ID0gcmVxdWlyZSgnLi9sYXlvdXQnKTtcbmNvbXBpbGUuZ3JvdXAgPSByZXF1aXJlKCcuL2dyb3VwJyk7XG5cbmZ1bmN0aW9uIGNvbXBpbGUoZW5jb2RpbmcsIHN0YXRzKSB7XG4gIHZhciBsYXlvdXQgPSBjb21waWxlLmxheW91dChlbmNvZGluZywgc3RhdHMpLFxuICAgIHN0eWxlID0gdmxzdHlsZShlbmNvZGluZywgc3RhdHMpLFxuICAgIHNwZWMgPSB0ZW1wbGF0ZShlbmNvZGluZywgbGF5b3V0LCBzdGF0cyksXG4gICAgZ3JvdXAgPSBzcGVjLm1hcmtzWzBdLFxuICAgIG1hcmsgPSBtYXJrc1tlbmNvZGluZy5tYXJrdHlwZSgpXSxcbiAgICBtZGVmcyA9IG1hcmtzLmRlZihtYXJrLCBlbmNvZGluZywgbGF5b3V0LCBzdHlsZSksXG4gICAgbWRlZiA9IG1kZWZzWzBdOyAgLy8gVE9ETzogcmVtb3ZlIHRoaXMgZGlydHkgaGFjayBieSByZWZhY3RvcmluZyB0aGUgd2hvbGUgZmxvd1xuXG4gIGZpbHRlci5hZGRGaWx0ZXJzKHNwZWMsIGVuY29kaW5nKTtcbiAgdmFyIHNvcnRpbmcgPSB2bHNvcnQoc3BlYywgZW5jb2RpbmcpO1xuXG4gIHZhciBoYXNSb3cgPSBlbmNvZGluZy5oYXMoUk9XKSwgaGFzQ29sID0gZW5jb2RpbmcuaGFzKENPTCk7XG5cbiAgdmFyIHByZWFnZ3JlZ2F0ZWREYXRhID0gZW5jb2RpbmcuY29uZmlnKCd1c2VWZWdhU2VydmVyJyk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtZGVmcy5sZW5ndGg7IGkrKykge1xuICAgIGdyb3VwLm1hcmtzLnB1c2gobWRlZnNbaV0pO1xuICB9XG5cbiAgYmlubmluZyhzcGVjLmRhdGFbMV0sIGVuY29kaW5nLCB7cHJlYWdncmVnYXRlZERhdGE6IHByZWFnZ3JlZ2F0ZWREYXRhfSk7XG5cbiAgdmFyIGxpbmVUeXBlID0gbWFya3NbZW5jb2RpbmcubWFya3R5cGUoKV0ubGluZTtcblxuICBpZiAoIXByZWFnZ3JlZ2F0ZWREYXRhKSB7XG4gICAgc3BlYyA9IHRpbWUoc3BlYywgZW5jb2RpbmcpO1xuICB9XG5cbiAgLy8gaGFuZGxlIHN1YmZhY2V0c1xuICB2YXIgYWdnUmVzdWx0ID0gYWdncmVnYXRlcyhzcGVjLCBlbmNvZGluZywge3ByZWFnZ3JlZ2F0ZWREYXRhOiBwcmVhZ2dyZWdhdGVkRGF0YX0pLFxuICAgIGRldGFpbHMgPSBhZ2dSZXN1bHQuZGV0YWlscyxcbiAgICBoYXNEZXRhaWxzID0gZGV0YWlscyAmJiBkZXRhaWxzLmxlbmd0aCA+IDAsXG4gICAgc3RhY2sgPSBoYXNEZXRhaWxzICYmIHN0YWNraW5nKHNwZWMsIGVuY29kaW5nLCBtZGVmLCBhZ2dSZXN1bHQuZmFjZXRzKTtcblxuICBpZiAoaGFzRGV0YWlscyAmJiAoc3RhY2sgfHwgbGluZVR5cGUpKSB7XG4gICAgLy9zdWJmYWNldCB0byBncm91cCBzdGFjayAvIGxpbmUgdG9nZXRoZXIgaW4gb25lIGdyb3VwXG4gICAgc3ViZmFjZXRpbmcoZ3JvdXAsIG1kZWYsIGRldGFpbHMsIHN0YWNrLCBlbmNvZGluZyk7XG4gIH1cblxuICAvLyBhdXRvLXNvcnQgbGluZS9hcmVhIHZhbHVlc1xuICAvL1RPRE8oa2FuaXR3KTogaGF2ZSBzb21lIGNvbmZpZyB0byB0dXJuIG9mZiBhdXRvLXNvcnQgZm9yIGxpbmUgKGZvciBsaW5lIGNoYXJ0IHRoYXQgZW5jb2RlcyB0ZW1wb3JhbCBpbmZvcm1hdGlvbilcbiAgaWYgKGxpbmVUeXBlKSB7XG4gICAgdmFyIGYgPSAoZW5jb2RpbmcuaXNNZWFzdXJlKFgpICYmIGVuY29kaW5nLmlzRGltZW5zaW9uKFkpKSA/IFkgOiBYO1xuICAgIGlmICghbWRlZi5mcm9tKSBtZGVmLmZyb20gPSB7fTtcbiAgICBtZGVmLmZyb20udHJhbnNmb3JtID0gW3t0eXBlOiAnc29ydCcsIGJ5OiBlbmNvZGluZy5maWVsZChmKX1dO1xuICB9XG5cbiAgLy8gU21hbGwgTXVsdGlwbGVzXG4gIGlmIChoYXNSb3cgfHwgaGFzQ29sKSB7XG4gICAgc3BlYyA9IGZhY2V0aW5nKGdyb3VwLCBlbmNvZGluZywgbGF5b3V0LCBzdHlsZSwgc29ydGluZywgc3BlYywgbWRlZiwgc3RhY2ssIHN0YXRzKTtcbiAgICBzcGVjLmxlZ2VuZHMgPSBsZWdlbmQuZGVmcyhlbmNvZGluZyk7XG4gIH0gZWxzZSB7XG4gICAgZ3JvdXAuc2NhbGVzID0gc2NhbGUuZGVmcyhzY2FsZS5uYW1lcyhtZGVmLnByb3BlcnRpZXMudXBkYXRlKSwgZW5jb2RpbmcsIGxheW91dCwgc3R5bGUsIHNvcnRpbmcsXG4gICAgICB7c3RhY2s6IHN0YWNrLCBzdGF0czogc3RhdHN9KTtcbiAgICBncm91cC5heGVzID0gYXhpcy5kZWZzKGF4aXMubmFtZXMobWRlZi5wcm9wZXJ0aWVzLnVwZGF0ZSksIGVuY29kaW5nLCBsYXlvdXQpO1xuICAgIGdyb3VwLmxlZ2VuZHMgPSBsZWdlbmQuZGVmcyhlbmNvZGluZyk7XG4gIH1cblxuICBmaWx0ZXIuZmlsdGVyTGVzc1RoYW5aZXJvKHNwZWMsIGVuY29kaW5nKTtcblxuICByZXR1cm4gc3BlYztcbn1cblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2xvYmFscyA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKTtcblxudmFyIGF4aXMgPSByZXF1aXJlKCcuL2F4aXMnKSxcbiAgZ3JvdXBkZWYgPSByZXF1aXJlKCcuL2dyb3VwJykuZGVmLFxuICBzY2FsZSA9IHJlcXVpcmUoJy4vc2NhbGUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmYWNldGluZztcblxuZnVuY3Rpb24gZmFjZXRpbmcoZ3JvdXAsIGVuY29kaW5nLCBsYXlvdXQsIHN0eWxlLCBzb3J0aW5nLCBzcGVjLCBtZGVmLCBzdGFjaywgc3RhdHMpIHtcbiAgdmFyIGVudGVyID0gZ3JvdXAucHJvcGVydGllcy5lbnRlcjtcbiAgdmFyIGZhY2V0S2V5cyA9IFtdLCBjZWxsQXhlcyA9IFtdLCBmcm9tLCBheGVzR3JwO1xuXG4gIHZhciBoYXNSb3cgPSBlbmNvZGluZy5oYXMoUk9XKSwgaGFzQ29sID0gZW5jb2RpbmcuaGFzKENPTCk7XG5cbiAgZW50ZXIuZmlsbCA9IHt2YWx1ZTogZW5jb2RpbmcuY29uZmlnKCdjZWxsQmFja2dyb3VuZENvbG9yJyl9O1xuXG4gIC8vbW92ZSBcImZyb21cIiB0byBjZWxsIGxldmVsIGFuZCBhZGQgZmFjZXQgdHJhbnNmb3JtXG4gIGdyb3VwLmZyb20gPSB7ZGF0YTogZ3JvdXAubWFya3NbMF0uZnJvbS5kYXRhfTtcblxuICAvLyBIYWNrLCB0aGlzIG5lZWRzIHRvIGJlIHJlZmFjdG9yZWRcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBncm91cC5tYXJrcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBtYXJrID0gZ3JvdXAubWFya3NbaV07XG4gICAgaWYgKG1hcmsuZnJvbS50cmFuc2Zvcm0pIHtcbiAgICAgIGRlbGV0ZSBtYXJrLmZyb20uZGF0YTsgLy9uZWVkIHRvIGtlZXAgdHJhbnNmb3JtIGZvciBzdWJmYWNldHRpbmcgY2FzZVxuICAgIH0gZWxzZSB7XG4gICAgICBkZWxldGUgbWFyay5mcm9tO1xuICAgIH1cbiAgfVxuXG4gIGlmIChoYXNSb3cpIHtcbiAgICBpZiAoIWVuY29kaW5nLmlzRGltZW5zaW9uKFJPVykpIHtcbiAgICAgIHV0aWwuZXJyb3IoJ1JvdyBlbmNvZGluZyBzaG91bGQgYmUgb3JkaW5hbC4nKTtcbiAgICB9XG4gICAgZW50ZXIueSA9IHtzY2FsZTogUk9XLCBmaWVsZDogJ2tleXMuJyArIGZhY2V0S2V5cy5sZW5ndGh9O1xuICAgIGVudGVyLmhlaWdodCA9IHsndmFsdWUnOiBsYXlvdXQuY2VsbEhlaWdodH07IC8vIEhBQ0tcblxuICAgIGZhY2V0S2V5cy5wdXNoKGVuY29kaW5nLmZpZWxkKFJPVykpO1xuXG4gICAgaWYgKGhhc0NvbCkge1xuICAgICAgZnJvbSA9IHV0aWwuZHVwbGljYXRlKGdyb3VwLmZyb20pO1xuICAgICAgZnJvbS50cmFuc2Zvcm0gPSBmcm9tLnRyYW5zZm9ybSB8fCBbXTtcbiAgICAgIGZyb20udHJhbnNmb3JtLnVuc2hpZnQoe3R5cGU6ICdmYWNldCcsIGtleXM6IFtlbmNvZGluZy5maWVsZChDT0wpXX0pO1xuICAgIH1cblxuICAgIGF4ZXNHcnAgPSBncm91cGRlZigneC1heGVzJywge1xuICAgICAgICBheGVzOiBlbmNvZGluZy5oYXMoWCkgPyBheGlzLmRlZnMoWyd4J10sIGVuY29kaW5nLCBsYXlvdXQpIDogdW5kZWZpbmVkLFxuICAgICAgICB4OiBoYXNDb2wgPyB7c2NhbGU6IENPTCwgZmllbGQ6ICdrZXlzLjAnfSA6IHt2YWx1ZTogMH0sXG4gICAgICAgIHdpZHRoOiBoYXNDb2wgJiYgeyd2YWx1ZSc6IGxheW91dC5jZWxsV2lkdGh9LCAvL0hBQ0s/XG4gICAgICAgIGZyb206IGZyb21cbiAgICAgIH0pO1xuXG4gICAgc3BlYy5tYXJrcy5wdXNoKGF4ZXNHcnApO1xuICAgIChzcGVjLmF4ZXMgPSBzcGVjLmF4ZXMgfHwgW10pO1xuICAgIHNwZWMuYXhlcy5wdXNoLmFwcGx5KHNwZWMuYXhlcywgYXhpcy5kZWZzKFsncm93J10sIGVuY29kaW5nLCBsYXlvdXQpKTtcbiAgfSBlbHNlIHsgLy8gZG9lc24ndCBoYXZlIHJvd1xuICAgIGlmIChlbmNvZGluZy5oYXMoWCkpIHtcbiAgICAgIC8va2VlcCB4IGF4aXMgaW4gdGhlIGNlbGxcbiAgICAgIGNlbGxBeGVzLnB1c2guYXBwbHkoY2VsbEF4ZXMsIGF4aXMuZGVmcyhbJ3gnXSwgZW5jb2RpbmcsIGxheW91dCkpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChoYXNDb2wpIHtcbiAgICBpZiAoIWVuY29kaW5nLmlzRGltZW5zaW9uKENPTCkpIHtcbiAgICAgIHV0aWwuZXJyb3IoJ0NvbCBlbmNvZGluZyBzaG91bGQgYmUgb3JkaW5hbC4nKTtcbiAgICB9XG4gICAgZW50ZXIueCA9IHtzY2FsZTogQ09MLCBmaWVsZDogJ2tleXMuJyArIGZhY2V0S2V5cy5sZW5ndGh9O1xuICAgIGVudGVyLndpZHRoID0geyd2YWx1ZSc6IGxheW91dC5jZWxsV2lkdGh9OyAvLyBIQUNLXG5cbiAgICBmYWNldEtleXMucHVzaChlbmNvZGluZy5maWVsZChDT0wpKTtcblxuICAgIGlmIChoYXNSb3cpIHtcbiAgICAgIGZyb20gPSB1dGlsLmR1cGxpY2F0ZShncm91cC5mcm9tKTtcbiAgICAgIGZyb20udHJhbnNmb3JtID0gZnJvbS50cmFuc2Zvcm0gfHwgW107XG4gICAgICBmcm9tLnRyYW5zZm9ybS51bnNoaWZ0KHt0eXBlOiAnZmFjZXQnLCBrZXlzOiBbZW5jb2RpbmcuZmllbGQoUk9XKV19KTtcbiAgICB9XG5cbiAgICBheGVzR3JwID0gZ3JvdXBkZWYoJ3ktYXhlcycsIHtcbiAgICAgIGF4ZXM6IGVuY29kaW5nLmhhcyhZKSA/IGF4aXMuZGVmcyhbJ3knXSwgZW5jb2RpbmcsIGxheW91dCkgOiB1bmRlZmluZWQsXG4gICAgICB5OiBoYXNSb3cgJiYge3NjYWxlOiBST1csIGZpZWxkOiAna2V5cy4wJ30sXG4gICAgICB4OiBoYXNSb3cgJiYge3ZhbHVlOiAwfSxcbiAgICAgIGhlaWdodDogaGFzUm93ICYmIHsndmFsdWUnOiBsYXlvdXQuY2VsbEhlaWdodH0sIC8vSEFDSz9cbiAgICAgIGZyb206IGZyb21cbiAgICB9KTtcblxuICAgIHNwZWMubWFya3MucHVzaChheGVzR3JwKTtcbiAgICAoc3BlYy5heGVzID0gc3BlYy5heGVzIHx8IFtdKTtcbiAgICBzcGVjLmF4ZXMucHVzaC5hcHBseShzcGVjLmF4ZXMsIGF4aXMuZGVmcyhbJ2NvbCddLCBlbmNvZGluZywgbGF5b3V0KSk7XG4gIH0gZWxzZSB7IC8vIGRvZXNuJ3QgaGF2ZSBjb2xcbiAgICBpZiAoZW5jb2RpbmcuaGFzKFkpKSB7XG4gICAgICBjZWxsQXhlcy5wdXNoLmFwcGx5KGNlbGxBeGVzLCBheGlzLmRlZnMoWyd5J10sIGVuY29kaW5nLCBsYXlvdXQpKTtcbiAgICB9XG4gIH1cblxuICAvLyBhc3N1bWluZyBlcXVhbCBjZWxsV2lkdGggaGVyZVxuICAvLyBUT0RPOiBzdXBwb3J0IGhldGVyb2dlbm91cyBjZWxsV2lkdGggKG1heWJlIGJ5IHVzaW5nIG11bHRpcGxlIHNjYWxlcz8pXG4gIHNwZWMuc2NhbGVzID0gKHNwZWMuc2NhbGVzIHx8IFtdKS5jb25jYXQoc2NhbGUuZGVmcyhcbiAgICBzY2FsZS5uYW1lcyhlbnRlcikuY29uY2F0KHNjYWxlLm5hbWVzKG1kZWYucHJvcGVydGllcy51cGRhdGUpKSxcbiAgICBlbmNvZGluZyxcbiAgICBsYXlvdXQsXG4gICAgc3R5bGUsXG4gICAgc29ydGluZyxcbiAgICB7c3RhY2s6IHN0YWNrLCBmYWNldDogdHJ1ZSwgc3RhdHM6IHN0YXRzfVxuICApKTsgLy8gcm93L2NvbCBzY2FsZXMgKyBjZWxsIHNjYWxlc1xuXG4gIGlmIChjZWxsQXhlcy5sZW5ndGggPiAwKSB7XG4gICAgZ3JvdXAuYXhlcyA9IGNlbGxBeGVzO1xuICB9XG5cbiAgLy8gYWRkIGZhY2V0IHRyYW5zZm9ybVxuICB2YXIgdHJhbnMgPSAoZ3JvdXAuZnJvbS50cmFuc2Zvcm0gfHwgKGdyb3VwLmZyb20udHJhbnNmb3JtID0gW10pKTtcbiAgdHJhbnMudW5zaGlmdCh7dHlwZTogJ2ZhY2V0Jywga2V5czogZmFjZXRLZXlzfSk7XG5cbiAgcmV0dXJuIHNwZWM7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpO1xuXG52YXIgZmlsdGVyID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxudmFyIEJJTkFSWSA9IHtcbiAgJz4nOiAgdHJ1ZSxcbiAgJz49JzogdHJ1ZSxcbiAgJz0nOiAgdHJ1ZSxcbiAgJyE9JzogdHJ1ZSxcbiAgJzwnOiAgdHJ1ZSxcbiAgJzw9JzogdHJ1ZVxufTtcblxuZmlsdGVyLmFkZEZpbHRlcnMgPSBmdW5jdGlvbihzcGVjLCBlbmNvZGluZykge1xuICB2YXIgZmlsdGVycyA9IGVuY29kaW5nLmZpbHRlcigpLFxuICAgIGRhdGEgPSBzcGVjLmRhdGFbMF07ICAvLyBhcHBseSBmaWx0ZXJzIHRvIHJhdyBkYXRhIGJlZm9yZSBhZ2dyZWdhdGlvblxuXG4gIGlmICghZGF0YS50cmFuc2Zvcm0pXG4gICAgZGF0YS50cmFuc2Zvcm0gPSBbXTtcblxuICAvLyBhZGQgY3VzdG9tIGZpbHRlcnNcbiAgZm9yICh2YXIgaSBpbiBmaWx0ZXJzKSB7XG4gICAgdmFyIGZpbHRlciA9IGZpbHRlcnNbaV07XG5cbiAgICB2YXIgY29uZGl0aW9uID0gJyc7XG4gICAgdmFyIG9wZXJhdG9yID0gZmlsdGVyLm9wZXJhdG9yO1xuICAgIHZhciBvcGVyYW5kcyA9IGZpbHRlci5vcGVyYW5kcztcblxuICAgIGlmIChCSU5BUllbb3BlcmF0b3JdKSB7XG4gICAgICAvLyBleHBlY3RzIGEgZmllbGQgYW5kIGEgdmFsdWVcbiAgICAgIGlmIChvcGVyYXRvciA9PT0gJz0nKSB7XG4gICAgICAgIG9wZXJhdG9yID0gJz09JztcbiAgICAgIH1cblxuICAgICAgdmFyIG9wMSA9IG9wZXJhbmRzWzBdO1xuICAgICAgdmFyIG9wMiA9IG9wZXJhbmRzWzFdO1xuICAgICAgY29uZGl0aW9uID0gJ2QuZGF0YS4nICsgb3AxICsgb3BlcmF0b3IgKyBvcDI7XG4gICAgfSBlbHNlIGlmIChvcGVyYXRvciA9PT0gJ25vdE51bGwnKSB7XG4gICAgICAvLyBleHBlY3RzIGEgbnVtYmVyIG9mIGZpZWxkc1xuICAgICAgZm9yICh2YXIgaiBpbiBvcGVyYW5kcykge1xuICAgICAgICBjb25kaXRpb24gKz0gJ2QuZGF0YS4nICsgb3BlcmFuZHNbal0gKyAnIT09bnVsbCc7XG4gICAgICAgIGlmIChqIDwgb3BlcmFuZHMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgIGNvbmRpdGlvbiArPSAnICYmICc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKCdVbnN1cHBvcnRlZCBvcGVyYXRvcjogJywgb3BlcmF0b3IpO1xuICAgIH1cblxuICAgIGRhdGEudHJhbnNmb3JtLnB1c2goe1xuICAgICAgdHlwZTogJ2ZpbHRlcicsXG4gICAgICB0ZXN0OiBjb25kaXRpb25cbiAgICB9KTtcbiAgfVxufTtcblxuLy8gcmVtb3ZlIGxlc3MgdGhhbiAwIHZhbHVlcyBpZiB3ZSB1c2UgbG9nIGZ1bmN0aW9uXG5maWx0ZXIuZmlsdGVyTGVzc1RoYW5aZXJvID0gZnVuY3Rpb24oc3BlYywgZW5jb2RpbmcpIHtcbiAgZW5jb2RpbmcuZm9yRWFjaChmdW5jdGlvbihmaWVsZCwgZW5jVHlwZSkge1xuICAgIGlmIChlbmNvZGluZy5zY2FsZShlbmNUeXBlKS50eXBlID09PSAnbG9nJykge1xuICAgICAgc3BlYy5kYXRhWzFdLnRyYW5zZm9ybS5wdXNoKHtcbiAgICAgICAgdHlwZTogJ2ZpbHRlcicsXG4gICAgICAgIHRlc3Q6ICdkLicgKyBlbmNvZGluZy5maWVsZChlbmNUeXBlKSArICc+MCdcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG59O1xuXG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBkZWY6IGdyb3VwZGVmXG59O1xuXG5mdW5jdGlvbiBncm91cGRlZihuYW1lLCBvcHQpIHtcbiAgb3B0ID0gb3B0IHx8IHt9O1xuICByZXR1cm4ge1xuICAgIF9uYW1lOiBuYW1lIHx8IHVuZGVmaW5lZCxcbiAgICB0eXBlOiAnZ3JvdXAnLFxuICAgIGZyb206IG9wdC5mcm9tLFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIGVudGVyOiB7XG4gICAgICAgIHg6IG9wdC54IHx8IHVuZGVmaW5lZCxcbiAgICAgICAgeTogb3B0LnkgfHwgdW5kZWZpbmVkLFxuICAgICAgICB3aWR0aDogb3B0LndpZHRoIHx8IHtncm91cDogJ3dpZHRoJ30sXG4gICAgICAgIGhlaWdodDogb3B0LmhlaWdodCB8fCB7Z3JvdXA6ICdoZWlnaHQnfVxuICAgICAgfVxuICAgIH0sXG4gICAgc2NhbGVzOiBvcHQuc2NhbGVzIHx8IHVuZGVmaW5lZCxcbiAgICBheGVzOiBvcHQuYXhlcyB8fCB1bmRlZmluZWQsXG4gICAgbWFya3M6IG9wdC5tYXJrcyB8fCBbXVxuICB9O1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2xvYmFscyA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKSxcbiAgdXRpbCA9IHJlcXVpcmUoJy4uL3V0aWwnKSxcbiAgc2V0dGVyID0gdXRpbC5zZXR0ZXIsXG4gIHNjaGVtYSA9IHJlcXVpcmUoJy4uL3NjaGVtYS9zY2hlbWEnKSxcbiAgdGltZSA9IHJlcXVpcmUoJy4vdGltZScpLFxuICB2bGZpZWxkID0gcmVxdWlyZSgnLi4vZmllbGQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB2bGxheW91dDtcblxuZnVuY3Rpb24gdmxsYXlvdXQoZW5jb2RpbmcsIHN0YXRzKSB7XG4gIHZhciBsYXlvdXQgPSBib3goZW5jb2RpbmcsIHN0YXRzKTtcbiAgbGF5b3V0ID0gb2Zmc2V0KGVuY29kaW5nLCBzdGF0cywgbGF5b3V0KTtcbiAgcmV0dXJuIGxheW91dDtcbn1cblxuLypcbiAgSEFDSyB0byBzZXQgY2hhcnQgc2l6ZVxuICBOT1RFOiB0aGlzIGZhaWxzIGZvciBwbG90cyBkcml2ZW4gYnkgZGVyaXZlZCB2YWx1ZXMgKGUuZy4sIGFnZ3JlZ2F0ZXMpXG4gIE9uZSBzb2x1dGlvbiBpcyB0byB1cGRhdGUgVmVnYSB0byBzdXBwb3J0IGF1dG8tc2l6aW5nXG4gIEluIHRoZSBtZWFudGltZSwgYXV0by1wYWRkaW5nIChtb3N0bHkpIGRvZXMgdGhlIHRyaWNrXG4gKi9cbmZ1bmN0aW9uIGJveChlbmNvZGluZywgc3RhdHMpIHtcbiAgdmFyIGhhc1JvdyA9IGVuY29kaW5nLmhhcyhST1cpLFxuICAgICAgaGFzQ29sID0gZW5jb2RpbmcuaGFzKENPTCksXG4gICAgICBoYXNYID0gZW5jb2RpbmcuaGFzKFgpLFxuICAgICAgaGFzWSA9IGVuY29kaW5nLmhhcyhZKSxcbiAgICAgIG1hcmt0eXBlID0gZW5jb2RpbmcubWFya3R5cGUoKTtcblxuICAvLyBGSVhNRS9IQUNLIHdlIG5lZWQgdG8gdGFrZSBmaWx0ZXIgaW50byBhY2NvdW50XG4gIHZhciB4Q2FyZGluYWxpdHkgPSBoYXNYICYmIGVuY29kaW5nLmlzRGltZW5zaW9uKFgpID8gZW5jb2RpbmcuY2FyZGluYWxpdHkoWCwgc3RhdHMpIDogMSxcbiAgICB5Q2FyZGluYWxpdHkgPSBoYXNZICYmIGVuY29kaW5nLmlzRGltZW5zaW9uKFkpID8gZW5jb2RpbmcuY2FyZGluYWxpdHkoWSwgc3RhdHMpIDogMTtcblxuICB2YXIgdXNlU21hbGxCYW5kID0geENhcmRpbmFsaXR5ID4gZW5jb2RpbmcuY29uZmlnKCdsYXJnZUJhbmRNYXhDYXJkaW5hbGl0eScpIHx8XG4gICAgeUNhcmRpbmFsaXR5ID4gZW5jb2RpbmcuY29uZmlnKCdsYXJnZUJhbmRNYXhDYXJkaW5hbGl0eScpO1xuXG4gIHZhciBjZWxsV2lkdGgsIGNlbGxIZWlnaHQsIGNlbGxQYWRkaW5nID0gZW5jb2RpbmcuY29uZmlnKCdjZWxsUGFkZGluZycpO1xuXG4gIC8vIHNldCBjZWxsV2lkdGhcbiAgaWYgKGhhc1gpIHtcbiAgICBpZiAoZW5jb2RpbmcuaXNPcmRpbmFsU2NhbGUoWCkpIHtcbiAgICAgIC8vIGZvciBvcmRpbmFsLCBoYXNDb2wgb3Igbm90IGRvZXNuJ3QgbWF0dGVyIC0tIHdlIHNjYWxlIGJhc2VkIG9uIGNhcmRpbmFsaXR5XG4gICAgICBjZWxsV2lkdGggPSAoeENhcmRpbmFsaXR5ICsgZW5jb2RpbmcuYmFuZChYKS5wYWRkaW5nKSAqIGVuY29kaW5nLmJhbmRTaXplKFgsIHVzZVNtYWxsQmFuZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNlbGxXaWR0aCA9IGhhc0NvbCB8fCBoYXNSb3cgPyBlbmNvZGluZy5lbmMoQ09MKS53aWR0aCA6ICBlbmNvZGluZy5jb25maWcoXCJzaW5nbGVXaWR0aFwiKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKG1hcmt0eXBlID09PSBURVhUKSB7XG4gICAgICBjZWxsV2lkdGggPSBlbmNvZGluZy5jb25maWcoJ3RleHRDZWxsV2lkdGgnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2VsbFdpZHRoID0gZW5jb2RpbmcuYmFuZFNpemUoWCk7XG4gICAgfVxuICB9XG5cbiAgLy8gc2V0IGNlbGxIZWlnaHRcbiAgaWYgKGhhc1kpIHtcbiAgICBpZiAoZW5jb2RpbmcuaXNPcmRpbmFsU2NhbGUoWSkpIHtcbiAgICAgIC8vIGZvciBvcmRpbmFsLCBoYXNDb2wgb3Igbm90IGRvZXNuJ3QgbWF0dGVyIC0tIHdlIHNjYWxlIGJhc2VkIG9uIGNhcmRpbmFsaXR5XG4gICAgICBjZWxsSGVpZ2h0ID0gKHlDYXJkaW5hbGl0eSArIGVuY29kaW5nLmJhbmQoWSkucGFkZGluZykgKiBlbmNvZGluZy5iYW5kU2l6ZShZLCB1c2VTbWFsbEJhbmQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjZWxsSGVpZ2h0ID0gaGFzQ29sIHx8IGhhc1JvdyA/IGVuY29kaW5nLmVuYyhST1cpLmhlaWdodCA6ICBlbmNvZGluZy5jb25maWcoXCJzaW5nbGVIZWlnaHRcIik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNlbGxIZWlnaHQgPSBlbmNvZGluZy5iYW5kU2l6ZShZKTtcbiAgfVxuXG4gIC8vIENlbGwgYmFuZHMgdXNlIHJhbmdlQmFuZHMoKS4gVGhlcmUgYXJlIG4tMSBwYWRkaW5nLiAgT3V0ZXJwYWRkaW5nID0gMCBmb3IgY2VsbHNcblxuICB2YXIgd2lkdGggPSBjZWxsV2lkdGgsIGhlaWdodCA9IGNlbGxIZWlnaHQ7XG4gIGlmIChoYXNDb2wpIHtcbiAgICB2YXIgY29sQ2FyZGluYWxpdHkgPSBlbmNvZGluZy5jYXJkaW5hbGl0eShDT0wsIHN0YXRzKTtcbiAgICB3aWR0aCA9IGNlbGxXaWR0aCAqICgoMSArIGNlbGxQYWRkaW5nKSAqIChjb2xDYXJkaW5hbGl0eSAtIDEpICsgMSk7XG4gIH1cbiAgaWYgKGhhc1Jvdykge1xuICAgIHZhciByb3dDYXJkaW5hbGl0eSA9ICBlbmNvZGluZy5jYXJkaW5hbGl0eShST1csIHN0YXRzKTtcbiAgICBoZWlnaHQgPSBjZWxsSGVpZ2h0ICogKCgxICsgY2VsbFBhZGRpbmcpICogKHJvd0NhcmRpbmFsaXR5IC0gMSkgKyAxKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY2VsbFdpZHRoOiBjZWxsV2lkdGgsXG4gICAgY2VsbEhlaWdodDogY2VsbEhlaWdodCxcbiAgICB3aWR0aDogd2lkdGgsXG4gICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgeDoge3VzZVNtYWxsQmFuZDogdXNlU21hbGxCYW5kfSxcbiAgICB5OiB7dXNlU21hbGxCYW5kOiB1c2VTbWFsbEJhbmR9XG4gIH07XG59XG5cbmZ1bmN0aW9uIG9mZnNldChlbmNvZGluZywgc3RhdHMsIGxheW91dCkge1xuICBbWCwgWV0uZm9yRWFjaChmdW5jdGlvbiAoeCkge1xuICAgIHZhciBtYXhMZW5ndGg7XG4gICAgaWYgKGVuY29kaW5nLmlzRGltZW5zaW9uKHgpIHx8IGVuY29kaW5nLmlzVHlwZSh4LCBUKSkge1xuICAgICAgbWF4TGVuZ3RoID0gc3RhdHNbZW5jb2RpbmcuZmllbGROYW1lKHgpXS5tYXhsZW5ndGg7XG4gICAgfSBlbHNlIGlmIChlbmNvZGluZy5hZ2dyKHgpID09PSAnY291bnQnKSB7XG4gICAgICAvL2Fzc2lnbiBkZWZhdWx0IHZhbHVlIGZvciBjb3VudCBhcyBpdCB3b24ndCBoYXZlIHN0YXRzXG4gICAgICBtYXhMZW5ndGggPSAgMztcbiAgICB9IGVsc2UgaWYgKGVuY29kaW5nLmlzVHlwZSh4LCBRKSkge1xuICAgICAgaWYgKHg9PT1YKSB7XG4gICAgICAgIG1heExlbmd0aCA9IDM7XG4gICAgICB9IGVsc2UgeyAvLyBZXG4gICAgICAgIC8vYXNzdW1lIHRoYXQgZGVmYXVsdCBmb3JtYXRpbmcgaXMgYWx3YXlzIHNob3J0ZXIgdGhhbiA3XG4gICAgICAgIG1heExlbmd0aCA9IE1hdGgubWluKHN0YXRzW2VuY29kaW5nLmZpZWxkTmFtZSh4KV0ubWF4bGVuZ3RoLCA3KTtcbiAgICAgIH1cbiAgICB9XG4gICAgc2V0dGVyKGxheW91dCxbeCwgJ2F4aXNUaXRsZU9mZnNldCddLCBlbmNvZGluZy5jb25maWcoJ2NoYXJhY3RlcldpZHRoJykgKiAgbWF4TGVuZ3RoICsgMjApO1xuICB9KTtcbiAgcmV0dXJuIGxheW91dDtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKSxcbiAgdGltZSA9IHJlcXVpcmUoJy4vdGltZScpO1xuXG52YXIgbGVnZW5kID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxubGVnZW5kLmRlZnMgPSBmdW5jdGlvbihlbmNvZGluZykge1xuICB2YXIgZGVmcyA9IFtdO1xuXG4gIC8vIFRPRE86IHN1cHBvcnQgYWxwaGFcblxuICBpZiAoZW5jb2RpbmcuaGFzKENPTE9SKSAmJiBlbmNvZGluZy5sZWdlbmQoQ09MT1IpKSB7XG4gICAgZGVmcy5wdXNoKGxlZ2VuZC5kZWYoQ09MT1IsIGVuY29kaW5nLCB7XG4gICAgICBmaWxsOiBDT0xPUixcbiAgICAgIG9yaWVudDogJ3JpZ2h0J1xuICAgIH0pKTtcbiAgfVxuXG4gIGlmIChlbmNvZGluZy5oYXMoU0laRSkgJiYgZW5jb2RpbmcubGVnZW5kKFNJWkUpKSB7XG4gICAgZGVmcy5wdXNoKGxlZ2VuZC5kZWYoU0laRSwgZW5jb2RpbmcsIHtcbiAgICAgIHNpemU6IFNJWkUsXG4gICAgICBvcmllbnQ6IGRlZnMubGVuZ3RoID09PSAxID8gJ2xlZnQnIDogJ3JpZ2h0J1xuICAgIH0pKTtcbiAgfVxuXG4gIGlmIChlbmNvZGluZy5oYXMoU0hBUEUpICYmIGVuY29kaW5nLmxlZ2VuZChTSEFQRSkpIHtcbiAgICBpZiAoZGVmcy5sZW5ndGggPT09IDIpIHtcbiAgICAgIC8vIFRPRE86IGZpeCB0aGlzXG4gICAgICBjb25zb2xlLmVycm9yKCdWZWdhbGl0ZSBjdXJyZW50bHkgb25seSBzdXBwb3J0cyB0d28gbGVnZW5kcycpO1xuICAgICAgcmV0dXJuIGRlZnM7XG4gICAgfVxuICAgIGRlZnMucHVzaChsZWdlbmQuZGVmKFNIQVBFLCBlbmNvZGluZywge1xuICAgICAgc2hhcGU6IFNIQVBFLFxuICAgICAgb3JpZW50OiBkZWZzLmxlbmd0aCA9PT0gMSA/ICdsZWZ0JyA6ICdyaWdodCdcbiAgICB9KSk7XG4gIH1cblxuICByZXR1cm4gZGVmcztcbn07XG5cbmxlZ2VuZC5kZWYgPSBmdW5jdGlvbihuYW1lLCBlbmNvZGluZywgcHJvcHMpIHtcbiAgdmFyIGRlZiA9IHByb3BzLCBmbjtcblxuICBkZWYudGl0bGUgPSBlbmNvZGluZy5maWVsZFRpdGxlKG5hbWUpO1xuXG4gIGlmIChlbmNvZGluZy5pc1R5cGUobmFtZSwgVCkgJiYgKGZuID0gZW5jb2RpbmcuZm4obmFtZSkpICYmXG4gICAgdGltZS5oYXNTY2FsZShmbikpIHtcbiAgICB2YXIgcHJvcGVydGllcyA9IGRlZi5wcm9wZXJ0aWVzID0gZGVmLnByb3BlcnRpZXMgfHwge30sXG4gICAgICBsYWJlbHMgPSBwcm9wZXJ0aWVzLmxhYmVscyA9IHByb3BlcnRpZXMubGFiZWxzIHx8IHt9LFxuICAgICAgdGV4dCA9IGxhYmVscy50ZXh0ID0gbGFiZWxzLnRleHQgfHwge307XG5cbiAgICB0ZXh0LnNjYWxlID0gJ3RpbWUtJysgZm47XG4gIH1cblxuICByZXR1cm4gZGVmO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdsb2JhbHMgPSByZXF1aXJlKCcuLi9nbG9iYWxzJyksXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cbnZhciBtYXJrcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbm1hcmtzLmRlZiA9IGZ1bmN0aW9uKG1hcmssIGVuY29kaW5nLCBsYXlvdXQsIHN0eWxlKSB7XG4gIHZhciBkZWZzID0gW107XG5cbiAgLy8gdG8gYWRkIGEgYmFja2dyb3VuZCB0byB0ZXh0LCB3ZSBuZWVkIHRvIGFkZCBpdCBiZWZvcmUgdGhlIHRleHRcbiAgaWYgKGVuY29kaW5nLm1hcmt0eXBlKCkgPT09IFRFWFQgJiYgZW5jb2RpbmcuaGFzKENPTE9SKSkge1xuICAgIHZhciBiZyA9IHtcbiAgICAgIHg6IHt2YWx1ZTogMH0sXG4gICAgICB5OiB7dmFsdWU6IDB9LFxuICAgICAgeDI6IHt2YWx1ZTogbGF5b3V0LmNlbGxXaWR0aH0sXG4gICAgICB5Mjoge3ZhbHVlOiBsYXlvdXQuY2VsbEhlaWdodH0sXG4gICAgICBmaWxsOiB7c2NhbGU6IENPTE9SLCBmaWVsZDogZW5jb2RpbmcuZmllbGQoQ09MT1IpfVxuICAgIH07XG4gICAgZGVmcy5wdXNoKHtcbiAgICAgIHR5cGU6ICdyZWN0JyxcbiAgICAgIGZyb206IHtkYXRhOiBUQUJMRX0sXG4gICAgICBwcm9wZXJ0aWVzOiB7ZW50ZXI6IGJnLCB1cGRhdGU6IGJnfVxuICAgIH0pO1xuICB9XG5cbiAgLy8gYWRkIHRoZSBtYXJrIGRlZiBmb3IgdGhlIG1haW4gdGhpbmdcbiAgdmFyIHAgPSBtYXJrLnByb3AoZW5jb2RpbmcsIGxheW91dCwgc3R5bGUpO1xuICBkZWZzLnB1c2goe1xuICAgIHR5cGU6IG1hcmsudHlwZSxcbiAgICBmcm9tOiB7ZGF0YTogVEFCTEV9LFxuICAgIHByb3BlcnRpZXM6IHtlbnRlcjogcCwgdXBkYXRlOiBwfVxuICB9KTtcblxuICByZXR1cm4gZGVmcztcbn07XG5cbm1hcmtzLmJhciA9IHtcbiAgdHlwZTogJ3JlY3QnLFxuICBzdGFjazogdHJ1ZSxcbiAgcHJvcDogYmFyX3Byb3BzLFxuICByZXF1aXJlZEVuY29kaW5nOiBbJ3gnLCAneSddLFxuICBzdXBwb3J0ZWRFbmNvZGluZzoge3JvdzogMSwgY29sOiAxLCB4OiAxLCB5OiAxLCBzaXplOiAxLCBjb2xvcjogMSwgYWxwaGE6IDF9XG59O1xuXG5tYXJrcy5saW5lID0ge1xuICB0eXBlOiAnbGluZScsXG4gIGxpbmU6IHRydWUsXG4gIHByb3A6IGxpbmVfcHJvcHMsXG4gIHJlcXVpcmVkRW5jb2Rpbmc6IFsneCcsICd5J10sXG4gIHN1cHBvcnRlZEVuY29kaW5nOiB7cm93OiAxLCBjb2w6IDEsIHg6IDEsIHk6IDEsIGNvbG9yOiAxLCBhbHBoYTogMSwgZGV0YWlsOjF9XG59O1xuXG5tYXJrcy5hcmVhID0ge1xuICB0eXBlOiAnYXJlYScsXG4gIHN0YWNrOiB0cnVlLFxuICBsaW5lOiB0cnVlLFxuICByZXF1aXJlZEVuY29kaW5nOiBbJ3gnLCAneSddLFxuICBwcm9wOiBhcmVhX3Byb3BzLFxuICBzdXBwb3J0ZWRFbmNvZGluZzoge3JvdzogMSwgY29sOiAxLCB4OiAxLCB5OiAxLCBjb2xvcjogMSwgYWxwaGE6IDF9XG59O1xuXG5tYXJrcy50aWNrID0ge1xuICB0eXBlOiAncmVjdCcsXG4gIHByb3A6IHRpY2tfcHJvcHMsXG4gIHN1cHBvcnRlZEVuY29kaW5nOiB7cm93OiAxLCBjb2w6IDEsIHg6IDEsIHk6IDEsIGNvbG9yOiAxLCBhbHBoYTogMSwgZGV0YWlsOiAxfVxufTtcblxubWFya3MuY2lyY2xlID0ge1xuICB0eXBlOiAnc3ltYm9sJyxcbiAgcHJvcDogZmlsbGVkX3BvaW50X3Byb3BzKCdjaXJjbGUnKSxcbiAgc3VwcG9ydGVkRW5jb2Rpbmc6IHtyb3c6IDEsIGNvbDogMSwgeDogMSwgeTogMSwgc2l6ZTogMSwgY29sb3I6IDEsIGFscGhhOiAxLCBkZXRhaWw6IDF9XG59O1xuXG5tYXJrcy5zcXVhcmUgPSB7XG4gIHR5cGU6ICdzeW1ib2wnLFxuICBwcm9wOiBmaWxsZWRfcG9pbnRfcHJvcHMoJ3NxdWFyZScpLFxuICBzdXBwb3J0ZWRFbmNvZGluZzogbWFya3MuY2lyY2xlLnN1cHBvcnRlZEVuY29kaW5nXG59O1xuXG5tYXJrcy5wb2ludCA9IHtcbiAgdHlwZTogJ3N5bWJvbCcsXG4gIHByb3A6IHBvaW50X3Byb3BzLFxuICBzdXBwb3J0ZWRFbmNvZGluZzoge3JvdzogMSwgY29sOiAxLCB4OiAxLCB5OiAxLCBzaXplOiAxLCBjb2xvcjogMSwgYWxwaGE6IDEsIHNoYXBlOiAxLCBkZXRhaWw6IDF9XG59O1xuXG5tYXJrcy50ZXh0ID0ge1xuICB0eXBlOiAndGV4dCcsXG4gIHByb3A6IHRleHRfcHJvcHMsXG4gIHJlcXVpcmVkRW5jb2Rpbmc6IFsndGV4dCddLFxuICBzdXBwb3J0ZWRFbmNvZGluZzoge3JvdzogMSwgY29sOiAxLCBzaXplOiAxLCBjb2xvcjogMSwgYWxwaGE6IDEsIHRleHQ6IDF9XG59O1xuXG5mdW5jdGlvbiBiYXJfcHJvcHMoZSwgbGF5b3V0LCBzdHlsZSkge1xuICB2YXIgcCA9IHt9O1xuXG4gIC8vIHhcbiAgaWYgKGUuaXNNZWFzdXJlKFgpKSB7XG4gICAgcC54ID0ge3NjYWxlOiBYLCBmaWVsZDogZS5maWVsZChYKX07XG4gICAgaWYgKGUuaXNEaW1lbnNpb24oWSkpIHtcbiAgICAgIHAueDIgPSB7c2NhbGU6IFgsIHZhbHVlOiAwfTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoZS5oYXMoWCkpIHsgLy8gaXMgb3JkaW5hbFxuICAgIHAueGMgPSB7c2NhbGU6IFgsIGZpZWxkOiBlLmZpZWxkKFgpfTtcbiAgfSBlbHNlIHtcbiAgICAvLyBUT0RPIGFkZCBzaW5nbGUgYmFyIG9mZnNldFxuICAgIHAueGMgPSB7dmFsdWU6IDB9O1xuICB9XG5cbiAgLy8geVxuICBpZiAoZS5pc01lYXN1cmUoWSkpIHtcbiAgICBwLnkgPSB7c2NhbGU6IFksIGZpZWxkOiBlLmZpZWxkKFkpfTtcbiAgICBwLnkyID0ge3NjYWxlOiBZLCB2YWx1ZTogMH07XG4gIH0gZWxzZSBpZiAoZS5oYXMoWSkpIHsgLy8gaXMgb3JkaW5hbFxuICAgIHAueWMgPSB7c2NhbGU6IFksIGZpZWxkOiBlLmZpZWxkKFkpfTtcbiAgfSBlbHNlIHtcbiAgICAvLyBUT0RPIGFkZCBzaW5nbGUgYmFyIG9mZnNldFxuICAgIHAueWMgPSB7Z3JvdXA6ICdoZWlnaHQnfTtcbiAgfVxuXG4gIC8vIHdpZHRoXG4gIGlmICghZS5oYXMoWCkgfHwgZS5pc09yZGluYWxTY2FsZShYKSkgeyAvLyBubyBYIG9yIFggaXMgb3JkaW5hbFxuICAgIGlmIChlLmhhcyhTSVpFKSkge1xuICAgICAgcC53aWR0aCA9IHtzY2FsZTogU0laRSwgZmllbGQ6IGUuZmllbGQoU0laRSl9O1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBwLndpZHRoID0ge3NjYWxlOiBYLCBiYW5kOiB0cnVlLCBvZmZzZXQ6IC0xfTtcbiAgICAgIHAud2lkdGggPSB7dmFsdWU6IGUuYmFuZFNpemUoWCwgbGF5b3V0LngudXNlU21hbGxCYW5kKSwgb2Zmc2V0OiAtMX07XG4gICAgfVxuICB9IGVsc2UgeyAvLyBYIGlzIFF1YW50IG9yIFRpbWUgU2NhbGVcbiAgICBwLndpZHRoID0ge3ZhbHVlOiBlLmJhbmRTaXplKFgsIGxheW91dC54LnVzZVNtYWxsQmFuZCksIG9mZnNldDogLTF9O1xuICB9XG5cbiAgLy8gaGVpZ2h0XG4gIGlmICghZS5oYXMoWSkgfHwgZS5pc09yZGluYWxTY2FsZShZKSkgeyAvLyBubyBZIG9yIFkgaXMgb3JkaW5hbFxuICAgIGlmIChlLmhhcyhTSVpFKSkge1xuICAgICAgcC5oZWlnaHQgPSB7c2NhbGU6IFNJWkUsIGZpZWxkOiBlLmZpZWxkKFNJWkUpfTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gcC5oZWlnaHQgPSB7c2NhbGU6IFksIGJhbmQ6IHRydWUsIG9mZnNldDogLTF9O1xuICAgICAgcC5oZWlnaHQgPSB7dmFsdWU6IGUuYmFuZFNpemUoWSwgbGF5b3V0LnkudXNlU21hbGxCYW5kKSwgb2Zmc2V0OiAtMX07XG4gICAgfVxuICB9IGVsc2UgeyAvLyBZIGlzIFF1YW50IG9yIFRpbWUgU2NhbGVcbiAgICBwLmhlaWdodCA9IHt2YWx1ZTogZS5iYW5kU2l6ZShZLCBsYXlvdXQueS51c2VTbWFsbEJhbmQpLCBvZmZzZXQ6IC0xfTtcbiAgfVxuXG4gIC8vIGZpbGxcbiAgaWYgKGUuaGFzKENPTE9SKSkge1xuICAgIHAuZmlsbCA9IHtzY2FsZTogQ09MT1IsIGZpZWxkOiBlLmZpZWxkKENPTE9SKX07XG4gIH0gZWxzZSB7XG4gICAgcC5maWxsID0ge3ZhbHVlOiBlLnZhbHVlKENPTE9SKX07XG4gIH1cblxuICAvLyBhbHBoYVxuICBpZiAoZS5oYXMoQUxQSEEpKSB7XG4gICAgcC5vcGFjaXR5ID0ge3NjYWxlOiBBTFBIQSwgZmllbGQ6IGUuZmllbGQoQUxQSEEpfTtcbiAgfSBlbHNlIGlmIChlLnZhbHVlKEFMUEhBKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcC5vcGFjaXR5ID0ge3ZhbHVlOiBlLnZhbHVlKEFMUEhBKX07XG4gIH1cblxuICByZXR1cm4gcDtcbn1cblxuZnVuY3Rpb24gcG9pbnRfcHJvcHMoZSwgbGF5b3V0LCBzdHlsZSkge1xuICB2YXIgcCA9IHt9O1xuXG4gIC8vIHhcbiAgaWYgKGUuaGFzKFgpKSB7XG4gICAgcC54ID0ge3NjYWxlOiBYLCBmaWVsZDogZS5maWVsZChYKX07XG4gIH0gZWxzZSBpZiAoIWUuaGFzKFgpKSB7XG4gICAgcC54ID0ge3ZhbHVlOiBlLmJhbmRTaXplKFgsIGxheW91dC54LnVzZVNtYWxsQmFuZCkgLyAyfTtcbiAgfVxuXG4gIC8vIHlcbiAgaWYgKGUuaGFzKFkpKSB7XG4gICAgcC55ID0ge3NjYWxlOiBZLCBmaWVsZDogZS5maWVsZChZKX07XG4gIH0gZWxzZSBpZiAoIWUuaGFzKFkpKSB7XG4gICAgcC55ID0ge3ZhbHVlOiBlLmJhbmRTaXplKFksIGxheW91dC55LnVzZVNtYWxsQmFuZCkgLyAyfTtcbiAgfVxuXG4gIC8vIHNpemVcbiAgaWYgKGUuaGFzKFNJWkUpKSB7XG4gICAgcC5zaXplID0ge3NjYWxlOiBTSVpFLCBmaWVsZDogZS5maWVsZChTSVpFKX07XG4gIH0gZWxzZSBpZiAoIWUuaGFzKFNJWkUpKSB7XG4gICAgcC5zaXplID0ge3ZhbHVlOiBlLnZhbHVlKFNJWkUpfTtcbiAgfVxuXG4gIC8vIHNoYXBlXG4gIGlmIChlLmhhcyhTSEFQRSkpIHtcbiAgICBwLnNoYXBlID0ge3NjYWxlOiBTSEFQRSwgZmllbGQ6IGUuZmllbGQoU0hBUEUpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoU0hBUEUpKSB7XG4gICAgcC5zaGFwZSA9IHt2YWx1ZTogZS52YWx1ZShTSEFQRSl9O1xuICB9XG5cbiAgLy8gc3Ryb2tlXG4gIGlmIChlLmhhcyhDT0xPUikpIHtcbiAgICBwLnN0cm9rZSA9IHtzY2FsZTogQ09MT1IsIGZpZWxkOiBlLmZpZWxkKENPTE9SKX07XG4gIH0gZWxzZSBpZiAoIWUuaGFzKENPTE9SKSkge1xuICAgIHAuc3Ryb2tlID0ge3ZhbHVlOiBlLnZhbHVlKENPTE9SKX07XG4gIH1cblxuICAvLyBhbHBoYVxuICBpZiAoZS5oYXMoQUxQSEEpKSB7XG4gICAgcC5vcGFjaXR5ID0ge3NjYWxlOiBBTFBIQSwgZmllbGQ6IGUuZmllbGQoQUxQSEEpfTtcbiAgfSBlbHNlIGlmIChlLnZhbHVlKEFMUEhBKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcC5vcGFjaXR5ID0ge3ZhbHVlOiBlLnZhbHVlKEFMUEhBKX07XG4gIH0gZWxzZSB7XG4gICAgcC5vcGFjaXR5ID0ge3ZhbHVlOiBzdHlsZS5vcGFjaXR5fTtcbiAgfVxuXG4gIHAuc3Ryb2tlV2lkdGggPSB7dmFsdWU6IGUuY29uZmlnKCdzdHJva2VXaWR0aCcpfTtcblxuICByZXR1cm4gcDtcbn1cblxuZnVuY3Rpb24gbGluZV9wcm9wcyhlLCBsYXlvdXQsIHN0eWxlKSB7XG4gIHZhciBwID0ge307XG5cbiAgLy8geFxuICBpZiAoZS5oYXMoWCkpIHtcbiAgICBwLnggPSB7c2NhbGU6IFgsIGZpZWxkOiBlLmZpZWxkKFgpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoWCkpIHtcbiAgICBwLnggPSB7dmFsdWU6IDB9O1xuICB9XG5cbiAgLy8geVxuICBpZiAoZS5oYXMoWSkpIHtcbiAgICBwLnkgPSB7c2NhbGU6IFksIGZpZWxkOiBlLmZpZWxkKFkpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoWSkpIHtcbiAgICBwLnkgPSB7Z3JvdXA6ICdoZWlnaHQnfTtcbiAgfVxuXG4gIC8vIHN0cm9rZVxuICBpZiAoZS5oYXMoQ09MT1IpKSB7XG4gICAgcC5zdHJva2UgPSB7c2NhbGU6IENPTE9SLCBmaWVsZDogZS5maWVsZChDT0xPUil9O1xuICB9IGVsc2UgaWYgKCFlLmhhcyhDT0xPUikpIHtcbiAgICBwLnN0cm9rZSA9IHt2YWx1ZTogZS52YWx1ZShDT0xPUil9O1xuICB9XG5cbiAgLy8gYWxwaGFcbiAgaWYgKGUuaGFzKEFMUEhBKSkge1xuICAgIHAub3BhY2l0eSA9IHtzY2FsZTogQUxQSEEsIGZpZWxkOiBlLmZpZWxkKEFMUEhBKX07XG4gIH0gZWxzZSBpZiAoZS52YWx1ZShBTFBIQSkgIT09IHVuZGVmaW5lZCkge1xuICAgIHAub3BhY2l0eSA9IHt2YWx1ZTogZS52YWx1ZShBTFBIQSl9O1xuICB9XG5cbiAgcC5zdHJva2VXaWR0aCA9IHt2YWx1ZTogZS5jb25maWcoJ3N0cm9rZVdpZHRoJyl9O1xuXG4gIHJldHVybiBwO1xufVxuXG5mdW5jdGlvbiBhcmVhX3Byb3BzKGUsIGxheW91dCwgc3R5bGUpIHtcbiAgdmFyIHAgPSB7fTtcblxuICAvLyB4XG4gIGlmIChlLmlzTWVhc3VyZShYKSkge1xuICAgIHAueCA9IHtzY2FsZTogWCwgZmllbGQ6IGUuZmllbGQoWCl9O1xuICAgIGlmIChlLmlzRGltZW5zaW9uKFkpKSB7XG4gICAgICBwLngyID0ge3NjYWxlOiBYLCB2YWx1ZTogMH07XG4gICAgICBwLm9yaWVudCA9IHt2YWx1ZTogJ2hvcml6b250YWwnfTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoZS5oYXMoWCkpIHtcbiAgICBwLnggPSB7c2NhbGU6IFgsIGZpZWxkOiBlLmZpZWxkKFgpfTtcbiAgfSBlbHNlIHtcbiAgICBwLnggPSB7dmFsdWU6IDB9O1xuICB9XG5cbiAgLy8geVxuICBpZiAoZS5pc01lYXN1cmUoWSkpIHtcbiAgICBwLnkgPSB7c2NhbGU6IFksIGZpZWxkOiBlLmZpZWxkKFkpfTtcbiAgICBwLnkyID0ge3NjYWxlOiBZLCB2YWx1ZTogMH07XG4gIH0gZWxzZSBpZiAoZS5oYXMoWSkpIHtcbiAgICBwLnkgPSB7c2NhbGU6IFksIGZpZWxkOiBlLmZpZWxkKFkpfTtcbiAgfSBlbHNlIHtcbiAgICBwLnkgPSB7Z3JvdXA6ICdoZWlnaHQnfTtcbiAgfVxuXG4gIC8vIHN0cm9rZVxuICBpZiAoZS5oYXMoQ09MT1IpKSB7XG4gICAgcC5maWxsID0ge3NjYWxlOiBDT0xPUiwgZmllbGQ6IGUuZmllbGQoQ09MT1IpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoQ09MT1IpKSB7XG4gICAgcC5maWxsID0ge3ZhbHVlOiBlLnZhbHVlKENPTE9SKX07XG4gIH1cblxuICAvLyBhbHBoYVxuICBpZiAoZS5oYXMoQUxQSEEpKSB7XG4gICAgcC5vcGFjaXR5ID0ge3NjYWxlOiBBTFBIQSwgZmllbGQ6IGUuZmllbGQoQUxQSEEpfTtcbiAgfSBlbHNlIGlmIChlLnZhbHVlKEFMUEhBKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcC5vcGFjaXR5ID0ge3ZhbHVlOiBlLnZhbHVlKEFMUEhBKX07XG4gIH1cblxuICByZXR1cm4gcDtcbn1cblxuZnVuY3Rpb24gdGlja19wcm9wcyhlLCBsYXlvdXQsIHN0eWxlKSB7XG4gIHZhciBwID0ge307XG5cbiAgLy8geFxuICBpZiAoZS5oYXMoWCkpIHtcbiAgICBwLnggPSB7c2NhbGU6IFgsIGZpZWxkOiBlLmZpZWxkKFgpfTtcbiAgICBpZiAoZS5pc0RpbWVuc2lvbihYKSkge1xuICAgICAgcC54Lm9mZnNldCA9IC1lLmJhbmRTaXplKFgsIGxheW91dC54LnVzZVNtYWxsQmFuZCkgLyAzO1xuICAgIH1cbiAgfSBlbHNlIGlmICghZS5oYXMoWCkpIHtcbiAgICBwLnggPSB7dmFsdWU6IDB9O1xuICB9XG5cbiAgLy8geVxuICBpZiAoZS5oYXMoWSkpIHtcbiAgICBwLnkgPSB7c2NhbGU6IFksIGZpZWxkOiBlLmZpZWxkKFkpfTtcbiAgICBpZiAoZS5pc0RpbWVuc2lvbihZKSkge1xuICAgICAgcC55Lm9mZnNldCA9IC1lLmJhbmRTaXplKFksIGxheW91dC55LnVzZVNtYWxsQmFuZCkgLyAzO1xuICAgIH1cbiAgfSBlbHNlIGlmICghZS5oYXMoWSkpIHtcbiAgICBwLnkgPSB7dmFsdWU6IDB9O1xuICB9XG5cbiAgLy8gd2lkdGhcbiAgaWYgKCFlLmhhcyhYKSB8fCBlLmlzRGltZW5zaW9uKFgpKSB7XG4gICAgcC53aWR0aCA9IHt2YWx1ZTogZS5iYW5kU2l6ZShYLCBsYXlvdXQueS51c2VTbWFsbEJhbmQpIC8gMS41fTtcbiAgfSBlbHNlIHtcbiAgICBwLndpZHRoID0ge3ZhbHVlOiAxfTtcbiAgfVxuXG4gIC8vIGhlaWdodFxuICBpZiAoIWUuaGFzKFkpIHx8IGUuaXNEaW1lbnNpb24oWSkpIHtcbiAgICBwLmhlaWdodCA9IHt2YWx1ZTogZS5iYW5kU2l6ZShZLCBsYXlvdXQueS51c2VTbWFsbEJhbmQpIC8gMS41fTtcbiAgfSBlbHNlIHtcbiAgICBwLmhlaWdodCA9IHt2YWx1ZTogMX07XG4gIH1cblxuICAvLyBmaWxsXG4gIGlmIChlLmhhcyhDT0xPUikpIHtcbiAgICBwLmZpbGwgPSB7c2NhbGU6IENPTE9SLCBmaWVsZDogZS5maWVsZChDT0xPUil9O1xuICB9IGVsc2Uge1xuICAgIHAuZmlsbCA9IHt2YWx1ZTogZS52YWx1ZShDT0xPUil9O1xuICB9XG5cbiAgLy8gYWxwaGFcbiAgaWYgKGUuaGFzKEFMUEhBKSkge1xuICAgIHAub3BhY2l0eSA9IHtzY2FsZTogQUxQSEEsIGZpZWxkOiBlLmZpZWxkKEFMUEhBKX07XG4gIH0gZWxzZSBpZiAoZS52YWx1ZShBTFBIQSkgIT09IHVuZGVmaW5lZCkge1xuICAgIHAub3BhY2l0eSA9IHt2YWx1ZTogZS52YWx1ZShBTFBIQSl9O1xuICB9IGVsc2Uge1xuICAgIHAub3BhY2l0eSA9IHt2YWx1ZTogc3R5bGUub3BhY2l0eX07XG4gIH1cblxuICByZXR1cm4gcDtcbn1cblxuZnVuY3Rpb24gZmlsbGVkX3BvaW50X3Byb3BzKHNoYXBlKSB7XG4gIHJldHVybiBmdW5jdGlvbihlLCBsYXlvdXQsIHN0eWxlKSB7XG4gICAgdmFyIHAgPSB7fTtcblxuICAgIC8vIHhcbiAgICBpZiAoZS5oYXMoWCkpIHtcbiAgICAgIHAueCA9IHtzY2FsZTogWCwgZmllbGQ6IGUuZmllbGQoWCl9O1xuICAgIH0gZWxzZSBpZiAoIWUuaGFzKFgpKSB7XG4gICAgICBwLnggPSB7dmFsdWU6IGUuYmFuZFNpemUoWCwgbGF5b3V0LngudXNlU21hbGxCYW5kKSAvIDJ9O1xuICAgIH1cblxuICAgIC8vIHlcbiAgICBpZiAoZS5oYXMoWSkpIHtcbiAgICAgIHAueSA9IHtzY2FsZTogWSwgZmllbGQ6IGUuZmllbGQoWSl9O1xuICAgIH0gZWxzZSBpZiAoIWUuaGFzKFkpKSB7XG4gICAgICBwLnkgPSB7dmFsdWU6IGUuYmFuZFNpemUoWSwgbGF5b3V0LnkudXNlU21hbGxCYW5kKSAvIDJ9O1xuICAgIH1cblxuICAgIC8vIHNpemVcbiAgICBpZiAoZS5oYXMoU0laRSkpIHtcbiAgICAgIHAuc2l6ZSA9IHtzY2FsZTogU0laRSwgZmllbGQ6IGUuZmllbGQoU0laRSl9O1xuICAgIH0gZWxzZSBpZiAoIWUuaGFzKFgpKSB7XG4gICAgICBwLnNpemUgPSB7dmFsdWU6IGUudmFsdWUoU0laRSl9O1xuICAgIH1cblxuICAgIC8vIHNoYXBlXG4gICAgcC5zaGFwZSA9IHt2YWx1ZTogc2hhcGV9O1xuXG4gICAgLy8gZmlsbFxuICAgIGlmIChlLmhhcyhDT0xPUikpIHtcbiAgICAgIHAuZmlsbCA9IHtzY2FsZTogQ09MT1IsIGZpZWxkOiBlLmZpZWxkKENPTE9SKX07XG4gICAgfSBlbHNlIGlmICghZS5oYXMoQ09MT1IpKSB7XG4gICAgICBwLmZpbGwgPSB7dmFsdWU6IGUudmFsdWUoQ09MT1IpfTtcbiAgICB9XG5cbiAgICAvLyBhbHBoYVxuICAgIGlmIChlLmhhcyhBTFBIQSkpIHtcbiAgICAgIHAub3BhY2l0eSA9IHtzY2FsZTogQUxQSEEsIGZpZWxkOiBlLmZpZWxkKEFMUEhBKX07XG4gICAgfSBlbHNlIGlmIChlLnZhbHVlKEFMUEhBKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBwLm9wYWNpdHkgPSB7dmFsdWU6IGUudmFsdWUoQUxQSEEpfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcC5vcGFjaXR5ID0ge3ZhbHVlOiBzdHlsZS5vcGFjaXR5fTtcbiAgICB9XG5cbiAgICByZXR1cm4gcDtcbiAgfTtcbn1cblxuZnVuY3Rpb24gdGV4dF9wcm9wcyhlLCBsYXlvdXQsIHN0eWxlKSB7XG4gIHZhciBwID0ge307XG5cbiAgLy8geFxuICBpZiAoZS5oYXMoWCkpIHtcbiAgICBwLnggPSB7c2NhbGU6IFgsIGZpZWxkOiBlLmZpZWxkKFgpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoWCkpIHtcbiAgICBwLnggPSB7dmFsdWU6IGUuYmFuZFNpemUoWCwgbGF5b3V0LngudXNlU21hbGxCYW5kKSAvIDJ9O1xuICAgIGlmIChlLmhhcyhURVhUKSAmJiBlLmlzVHlwZShURVhULCBRKSkge1xuICAgICAgcC54Lm9mZnNldCA9IGxheW91dC5jZWxsV2lkdGg7XG4gICAgfVxuICB9XG5cbiAgLy8geVxuICBpZiAoZS5oYXMoWSkpIHtcbiAgICBwLnkgPSB7c2NhbGU6IFksIGZpZWxkOiBlLmZpZWxkKFkpfTtcbiAgfSBlbHNlIGlmICghZS5oYXMoWSkpIHtcbiAgICBwLnkgPSB7dmFsdWU6IGUuYmFuZFNpemUoWSwgbGF5b3V0LnkudXNlU21hbGxCYW5kKSAvIDJ9O1xuICB9XG5cbiAgLy8gc2l6ZVxuICBpZiAoZS5oYXMoU0laRSkpIHtcbiAgICBwLmZvbnRTaXplID0ge3NjYWxlOiBTSVpFLCBmaWVsZDogZS5maWVsZChTSVpFKX07XG4gIH0gZWxzZSBpZiAoIWUuaGFzKFNJWkUpKSB7XG4gICAgcC5mb250U2l6ZSA9IHt2YWx1ZTogZS5mb250KCdzaXplJyl9O1xuICB9XG5cbiAgLy8gZmlsbFxuICAvLyBjb2xvciBzaG91bGQgYmUgc2V0IHRvIGJhY2tncm91bmRcbiAgcC5maWxsID0ge3ZhbHVlOiAnYmxhY2snfTtcblxuICAvLyBhbHBoYVxuICBpZiAoZS5oYXMoQUxQSEEpKSB7XG4gICAgcC5vcGFjaXR5ID0ge3NjYWxlOiBBTFBIQSwgZmllbGQ6IGUuZmllbGQoQUxQSEEpfTtcbiAgfSBlbHNlIGlmIChlLnZhbHVlKEFMUEhBKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcC5vcGFjaXR5ID0ge3ZhbHVlOiBlLnZhbHVlKEFMUEhBKX07XG4gIH0gZWxzZSB7XG4gICAgcC5vcGFjaXR5ID0ge3ZhbHVlOiBzdHlsZS5vcGFjaXR5fTtcbiAgfVxuXG4gIC8vIHRleHRcbiAgaWYgKGUuaGFzKFRFWFQpKSB7XG4gICAgaWYgKGUuaXNUeXBlKFRFWFQsIFEpKSB7XG4gICAgICBwLnRleHQgPSB7dGVtcGxhdGU6IFwie3tcIiArIGUuZmllbGQoVEVYVCkgKyBcIiB8IG51bWJlcjonLjNzJ319XCJ9O1xuICAgICAgcC5hbGlnbiA9IHt2YWx1ZTogJ3JpZ2h0J307XG4gICAgfSBlbHNlIHtcbiAgICAgIHAudGV4dCA9IHtmaWVsZDogZS5maWVsZChURVhUKX07XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHAudGV4dCA9IHt2YWx1ZTogJ0FiYyd9O1xuICB9XG5cbiAgcC5mb250ID0ge3ZhbHVlOiBlLmZvbnQoJ2ZhbWlseScpfTtcbiAgcC5mb250V2VpZ2h0ID0ge3ZhbHVlOiBlLmZvbnQoJ3dlaWdodCcpfTtcbiAgcC5mb250U3R5bGUgPSB7dmFsdWU6IGUuZm9udCgnc3R5bGUnKX07XG4gIHAuYmFzZWxpbmUgPSB7dmFsdWU6IGUudGV4dCgnYmFzZWxpbmUnKX07XG5cbiAgcmV0dXJuIHA7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpLFxuICB0aW1lID0gcmVxdWlyZSgnLi90aW1lJyk7XG5cbnZhciBzY2FsZSA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnNjYWxlLm5hbWVzID0gZnVuY3Rpb24ocHJvcHMpIHtcbiAgcmV0dXJuIHV0aWwua2V5cyh1dGlsLmtleXMocHJvcHMpLnJlZHVjZShmdW5jdGlvbihhLCB4KSB7XG4gICAgaWYgKHByb3BzW3hdICYmIHByb3BzW3hdLnNjYWxlKSBhW3Byb3BzW3hdLnNjYWxlXSA9IDE7XG4gICAgcmV0dXJuIGE7XG4gIH0sIHt9KSk7XG59O1xuXG5zY2FsZS5kZWZzID0gZnVuY3Rpb24obmFtZXMsIGVuY29kaW5nLCBsYXlvdXQsIHN0eWxlLCBzb3J0aW5nLCBvcHQpIHtcbiAgb3B0ID0gb3B0IHx8IHt9O1xuXG4gIHJldHVybiBuYW1lcy5yZWR1Y2UoZnVuY3Rpb24oYSwgbmFtZSkge1xuICAgIHZhciBzID0ge1xuICAgICAgbmFtZTogbmFtZSxcbiAgICAgIHR5cGU6IHNjYWxlLnR5cGUobmFtZSwgZW5jb2RpbmcpLFxuICAgICAgZG9tYWluOiBzY2FsZV9kb21haW4obmFtZSwgZW5jb2RpbmcsIHNvcnRpbmcsIG9wdClcbiAgICB9O1xuICAgIGlmIChzLnR5cGUgPT09ICdvcmRpbmFsJyAmJiAhZW5jb2RpbmcuYmluKG5hbWUpICYmIGVuY29kaW5nLnNvcnQobmFtZSkubGVuZ3RoID09PSAwKSB7XG4gICAgICBzLnNvcnQgPSB0cnVlO1xuICAgIH1cblxuICAgIHNjYWxlX3JhbmdlKHMsIGVuY29kaW5nLCBsYXlvdXQsIHN0eWxlLCBvcHQpO1xuXG4gICAgcmV0dXJuIChhLnB1c2gocyksIGEpO1xuICB9LCBbXSk7XG59O1xuXG5zY2FsZS50eXBlID0gZnVuY3Rpb24obmFtZSwgZW5jb2RpbmcpIHtcblxuICBzd2l0Y2ggKGVuY29kaW5nLnR5cGUobmFtZSkpIHtcbiAgICBjYXNlIE86IHJldHVybiAnb3JkaW5hbCc7XG4gICAgY2FzZSBUOlxuICAgICAgdmFyIGZuID0gZW5jb2RpbmcuZm4obmFtZSk7XG4gICAgICByZXR1cm4gKGZuICYmIHRpbWUuc2NhbGUudHlwZShmbikpIHx8ICd0aW1lJztcbiAgICBjYXNlIFE6XG4gICAgICBpZiAoZW5jb2RpbmcuYmluKG5hbWUpKSB7XG4gICAgICAgIHJldHVybiAnb3JkaW5hbCc7XG4gICAgICB9XG4gICAgICByZXR1cm4gZW5jb2Rpbmcuc2NhbGUobmFtZSkudHlwZTtcbiAgfVxufTtcblxuZnVuY3Rpb24gc2NhbGVfZG9tYWluKG5hbWUsIGVuY29kaW5nLCBzb3J0aW5nLCBvcHQpIHtcbiAgaWYgKGVuY29kaW5nLmlzVHlwZShuYW1lLCBUKSkge1xuICAgIHZhciByYW5nZSA9IHRpbWUuc2NhbGUuZG9tYWluKGVuY29kaW5nLmZuKG5hbWUpKTtcbiAgICBpZihyYW5nZSkgcmV0dXJuIHJhbmdlO1xuICB9XG5cbiAgaWYgKGVuY29kaW5nLmJpbihuYW1lKSkge1xuICAgIC8vIFRPRE86IGFkZCBpbmNsdWRlRW1wdHlDb25maWcgaGVyZVxuICAgIGlmIChvcHQuc3RhdHMpIHtcbiAgICAgIHZhciBiaW5zID0gdXRpbC5nZXRiaW5zKG9wdC5zdGF0c1tlbmNvZGluZy5maWVsZE5hbWUobmFtZSldLCBlbmNvZGluZy5iaW4obmFtZSkubWF4Ymlucyk7XG4gICAgICB2YXIgZG9tYWluID0gdXRpbC5yYW5nZShiaW5zLnN0YXJ0LCBiaW5zLnN0b3AsIGJpbnMuc3RlcCk7XG4gICAgICByZXR1cm4gbmFtZSA9PT0gWSA/IGRvbWFpbi5yZXZlcnNlKCkgOiBkb21haW47XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5hbWUgPT0gb3B0LnN0YWNrID9cbiAgICB7XG4gICAgICBkYXRhOiBTVEFDS0VELFxuICAgICAgZmllbGQ6ICdkYXRhLicgKyAob3B0LmZhY2V0ID8gJ21heF8nIDogJycpICsgJ3N1bV8nICsgZW5jb2RpbmcuZmllbGQobmFtZSwgdHJ1ZSlcbiAgICB9IDpcbiAgICB7ZGF0YTogc29ydGluZy5nZXREYXRhc2V0KG5hbWUpLCBmaWVsZDogZW5jb2RpbmcuZmllbGQobmFtZSl9O1xufVxuXG5mdW5jdGlvbiBzY2FsZV9yYW5nZShzLCBlbmNvZGluZywgbGF5b3V0LCBzdHlsZSwgb3B0KSB7XG4gIHZhciBzcGVjID0gZW5jb2Rpbmcuc2NhbGUocy5uYW1lKTtcbiAgc3dpdGNoIChzLm5hbWUpIHtcbiAgICBjYXNlIFg6XG4gICAgICBpZiAocy50eXBlID09PSAnb3JkaW5hbCcpIHtcbiAgICAgICAgcy5iYW5kV2lkdGggPSBlbmNvZGluZy5iYW5kU2l6ZShYLCBsYXlvdXQueC51c2VTbWFsbEJhbmQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcy5yYW5nZSA9IGxheW91dC5jZWxsV2lkdGggPyBbMCwgbGF5b3V0LmNlbGxXaWR0aF0gOiAnd2lkdGgnO1xuICAgICAgICBzLnplcm8gPSBzcGVjLnplcm8gfHxcbiAgICAgICAgICAoIGVuY29kaW5nLmlzVHlwZShzLm5hbWUsVCkgJiYgZW5jb2RpbmcuZm4ocy5uYW1lKSA9PT0gJ3llYXInID8gZmFsc2UgOiB0cnVlICk7XG4gICAgICAgIHMucmV2ZXJzZSA9IHNwZWMucmV2ZXJzZTtcbiAgICAgIH1cbiAgICAgIHMucm91bmQgPSB0cnVlO1xuICAgICAgaWYgKHMudHlwZSA9PT0gJ3RpbWUnKSB7XG4gICAgICAgIHMubmljZSA9IGVuY29kaW5nLmZuKHMubmFtZSk7XG4gICAgICB9ZWxzZSB7XG4gICAgICAgIHMubmljZSA9IHRydWU7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlIFk6XG4gICAgICBpZiAocy50eXBlID09PSAnb3JkaW5hbCcpIHtcbiAgICAgICAgcy5iYW5kV2lkdGggPSBlbmNvZGluZy5iYW5kU2l6ZShZLCBsYXlvdXQueS51c2VTbWFsbEJhbmQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcy5yYW5nZSA9IGxheW91dC5jZWxsSGVpZ2h0ID8gW2xheW91dC5jZWxsSGVpZ2h0LCAwXSA6ICdoZWlnaHQnO1xuICAgICAgICBzLnplcm8gPSBzcGVjLnplcm8gfHxcbiAgICAgICAgICAoIGVuY29kaW5nLmlzVHlwZShzLm5hbWUsIFQpICYmIGVuY29kaW5nLmZuKHMubmFtZSkgPT09ICd5ZWFyJyA/IGZhbHNlIDogdHJ1ZSApO1xuICAgICAgICBzLnJldmVyc2UgPSBzcGVjLnJldmVyc2U7XG4gICAgICB9XG5cbiAgICAgIHMucm91bmQgPSB0cnVlO1xuXG4gICAgICBpZiAocy50eXBlID09PSAndGltZScpIHtcbiAgICAgICAgcy5uaWNlID0gZW5jb2RpbmcuZm4ocy5uYW1lKSB8fCBlbmNvZGluZy5jb25maWcoJ3RpbWVTY2FsZU5pY2UnKTtcbiAgICAgIH1lbHNlIHtcbiAgICAgICAgcy5uaWNlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgUk9XOiAvLyBzdXBwb3J0IG9ubHkgb3JkaW5hbFxuICAgICAgcy5iYW5kV2lkdGggPSBsYXlvdXQuY2VsbEhlaWdodDtcbiAgICAgIHMucm91bmQgPSB0cnVlO1xuICAgICAgcy5uaWNlID0gdHJ1ZTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgQ09MOiAvLyBzdXBwb3J0IG9ubHkgb3JkaW5hbFxuICAgICAgcy5iYW5kV2lkdGggPSBsYXlvdXQuY2VsbFdpZHRoO1xuICAgICAgcy5yb3VuZCA9IHRydWU7XG4gICAgICBzLm5pY2UgPSB0cnVlO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBTSVpFOlxuICAgICAgaWYgKGVuY29kaW5nLmlzKCdiYXInKSkge1xuICAgICAgICAvLyBGSVhNRSB0aGlzIGlzIGRlZmluaXRlbHkgaW5jb3JyZWN0XG4gICAgICAgIC8vIGJ1dCBsZXQncyBmaXggaXQgbGF0ZXIgc2luY2UgYmFyIHNpemUgaXMgYSBiYWQgZW5jb2RpbmcgYW55d2F5XG4gICAgICAgIHMucmFuZ2UgPSBbMywgTWF0aC5tYXgoZW5jb2RpbmcuYmFuZFNpemUoWCksIGVuY29kaW5nLmJhbmRTaXplKFkpKV07XG4gICAgICB9IGVsc2UgaWYgKGVuY29kaW5nLmlzKFRFWFQpKSB7XG4gICAgICAgIHMucmFuZ2UgPSBbOCwgNDBdO1xuICAgICAgfSBlbHNlIHsgLy9wb2ludFxuICAgICAgICB2YXIgYmFuZFNpemUgPSBNYXRoLm1pbihlbmNvZGluZy5iYW5kU2l6ZShYKSwgZW5jb2RpbmcuYmFuZFNpemUoWSkpIC0gMTtcbiAgICAgICAgcy5yYW5nZSA9IFsxMCwgMC44ICogYmFuZFNpemUqYmFuZFNpemVdO1xuICAgICAgfVxuICAgICAgcy5yb3VuZCA9IHRydWU7XG4gICAgICBzLnplcm8gPSBmYWxzZTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgU0hBUEU6XG4gICAgICBzLnJhbmdlID0gJ3NoYXBlcyc7XG4gICAgICBicmVhaztcbiAgICBjYXNlIENPTE9SOlxuICAgICAgdmFyIHJhbmdlID0gZW5jb2Rpbmcuc2NhbGUoQ09MT1IpLnJhbmdlO1xuICAgICAgaWYgKHJhbmdlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKHMudHlwZSA9PT0gJ29yZGluYWwnKSB7XG4gICAgICAgICAgcmFuZ2UgPSBzdHlsZS5jb2xvclJhbmdlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJhbmdlID0gWycjZGRmJywgJ3N0ZWVsYmx1ZSddO1xuICAgICAgICAgIHMuemVybyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzLnJhbmdlID0gcmFuZ2U7XG4gICAgICBicmVhaztcbiAgICBjYXNlIEFMUEhBOlxuICAgICAgcy5yYW5nZSA9IFswLjIsIDEuMF07XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nIG5hbWU6ICcrIHMubmFtZSk7XG4gIH1cblxuICBzd2l0Y2ggKHMubmFtZSkge1xuICAgIGNhc2UgUk9XOlxuICAgIGNhc2UgQ09MOlxuICAgICAgcy5wYWRkaW5nID0gZW5jb2RpbmcuY29uZmlnKCdjZWxsUGFkZGluZycpO1xuICAgICAgcy5vdXRlclBhZGRpbmcgPSAwO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBYOlxuICAgIGNhc2UgWTpcbiAgICAgIGlmIChzLnR5cGUgPT09ICdvcmRpbmFsJykgeyAvLyYmICFzLmJhbmRXaWR0aFxuICAgICAgICBzLnBvaW50cyA9IHRydWU7XG4gICAgICAgIHMucGFkZGluZyA9IGVuY29kaW5nLmJhbmQocy5uYW1lKS5wYWRkaW5nO1xuICAgICAgfVxuICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFkZFNvcnRUcmFuc2Zvcm1zO1xuXG4vLyBhZGRzIG5ldyB0cmFuc2Zvcm1zIHRoYXQgcHJvZHVjZSBzb3J0ZWQgZmllbGRzXG5mdW5jdGlvbiBhZGRTb3J0VHJhbnNmb3JtcyhzcGVjLCBlbmNvZGluZywgb3B0KSB7XG4gIHZhciBkYXRhc2V0TWFwcGluZyA9IHt9O1xuICB2YXIgY291bnRlciA9IDA7XG5cbiAgZW5jb2RpbmcuZm9yRWFjaChmdW5jdGlvbihmaWVsZCwgZW5jVHlwZSkge1xuICAgIHZhciBzb3J0QnkgPSBlbmNvZGluZy5zb3J0KGVuY1R5cGUpO1xuICAgIGlmIChzb3J0QnkubGVuZ3RoID4gMCkge1xuICAgICAgdmFyIGZpZWxkcyA9IHNvcnRCeS5tYXAoZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG9wOiBkLmFnZ3IsXG4gICAgICAgICAgZmllbGQ6ICdkYXRhLicgKyBkLm5hbWVcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgYnlDbGF1c2UgPSBzb3J0QnkubWFwKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIChkLnJldmVyc2UgPyAnLScgOiAnJykgKyAnZGF0YS4nICsgZC5hZ2dyICsgJ18nICsgZC5uYW1lO1xuICAgICAgfSk7XG5cbiAgICAgIHZhciBkYXRhTmFtZSA9ICdzb3J0ZWQnICsgY291bnRlcisrO1xuXG4gICAgICB2YXIgdHJhbnNmb3JtcyA9IFtcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICdhZ2dyZWdhdGUnLFxuICAgICAgICAgIGdyb3VwYnk6IFsnZGF0YS4nICsgZmllbGQubmFtZV0sXG4gICAgICAgICAgZmllbGRzOiBmaWVsZHNcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICdzb3J0JyxcbiAgICAgICAgICBieTogYnlDbGF1c2VcbiAgICAgICAgfVxuICAgICAgXTtcblxuICAgICAgc3BlYy5kYXRhLnB1c2goe1xuICAgICAgICBuYW1lOiBkYXRhTmFtZSxcbiAgICAgICAgc291cmNlOiBSQVcsXG4gICAgICAgIHRyYW5zZm9ybTogdHJhbnNmb3Jtc1xuICAgICAgfSk7XG5cbiAgICAgIGRhdGFzZXRNYXBwaW5nW2VuY1R5cGVdID0gZGF0YU5hbWU7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4ge1xuICAgIHNwZWM6IHNwZWMsXG4gICAgZ2V0RGF0YXNldDogZnVuY3Rpb24oZW5jVHlwZSkge1xuICAgICAgdmFyIGRhdGEgPSBkYXRhc2V0TWFwcGluZ1tlbmNUeXBlXTtcbiAgICAgIGlmICghZGF0YSkge1xuICAgICAgICByZXR1cm4gVEFCTEU7XG4gICAgICB9XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG4gIH07XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIGdsb2JhbHMgPSByZXF1aXJlKCcuLi9nbG9iYWxzJyksXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyksXG4gIG1hcmtzID0gcmVxdWlyZSgnLi9tYXJrcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YWNraW5nO1xuXG5mdW5jdGlvbiBzdGFja2luZyhzcGVjLCBlbmNvZGluZywgbWRlZiwgZmFjZXRzKSB7XG4gIGlmICghbWFya3NbZW5jb2RpbmcubWFya3R5cGUoKV0uc3RhY2spIHJldHVybiBmYWxzZTtcblxuICAvLyBUT0RPOiBhZGQgfHwgZW5jb2RpbmcuaGFzKExPRCkgaGVyZSBvbmNlIExPRCBpcyBpbXBsZW1lbnRlZFxuICBpZiAoIWVuY29kaW5nLmhhcyhDT0xPUikpIHJldHVybiBmYWxzZTtcblxuICB2YXIgZGltPW51bGwsIHZhbD1udWxsLCBpZHggPW51bGwsXG4gICAgaXNYTWVhc3VyZSA9IGVuY29kaW5nLmlzTWVhc3VyZShYKSxcbiAgICBpc1lNZWFzdXJlID0gZW5jb2RpbmcuaXNNZWFzdXJlKFkpO1xuXG4gIGlmIChpc1hNZWFzdXJlICYmICFpc1lNZWFzdXJlKSB7XG4gICAgZGltID0gWTtcbiAgICB2YWwgPSBYO1xuICAgIGlkeCA9IDA7XG4gIH0gZWxzZSBpZiAoaXNZTWVhc3VyZSAmJiAhaXNYTWVhc3VyZSkge1xuICAgIGRpbSA9IFg7XG4gICAgdmFsID0gWTtcbiAgICBpZHggPSAxO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsOyAvLyBubyBzdGFjayBlbmNvZGluZ1xuICB9XG5cbiAgLy8gYWRkIHRyYW5zZm9ybSB0byBjb21wdXRlIHN1bXMgZm9yIHNjYWxlXG4gIHZhciBzdGFja2VkID0ge1xuICAgIG5hbWU6IFNUQUNLRUQsXG4gICAgc291cmNlOiBUQUJMRSxcbiAgICB0cmFuc2Zvcm06IFt7XG4gICAgICB0eXBlOiAnYWdncmVnYXRlJyxcbiAgICAgIGdyb3VwYnk6IFtlbmNvZGluZy5maWVsZChkaW0pXS5jb25jYXQoZmFjZXRzKSwgLy8gZGltIGFuZCBvdGhlciBmYWNldHNcbiAgICAgIGZpZWxkczogW3tvcDogJ3N1bScsIGZpZWxkOiBlbmNvZGluZy5maWVsZCh2YWwpfV0gLy8gVE9ETyBjaGVjayBpZiBmaWVsZCB3aXRoIGFnZ3IgaXMgY29ycmVjdD9cbiAgICB9XVxuICB9O1xuXG4gIGlmIChmYWNldHMgJiYgZmFjZXRzLmxlbmd0aCA+IDApIHtcbiAgICBzdGFja2VkLnRyYW5zZm9ybS5wdXNoKHsgLy9jYWxjdWxhdGUgbWF4IGZvciBlYWNoIGZhY2V0XG4gICAgICB0eXBlOiAnYWdncmVnYXRlJyxcbiAgICAgIGdyb3VwYnk6IGZhY2V0cyxcbiAgICAgIGZpZWxkczogW3tvcDogJ21heCcsIGZpZWxkOiAnZGF0YS5zdW1fJyArIGVuY29kaW5nLmZpZWxkKHZhbCwgdHJ1ZSl9XVxuICAgIH0pO1xuICB9XG5cbiAgc3BlYy5kYXRhLnB1c2goc3RhY2tlZCk7XG5cbiAgLy8gYWRkIHN0YWNrIHRyYW5zZm9ybSB0byBtYXJrXG4gIG1kZWYuZnJvbS50cmFuc2Zvcm0gPSBbe1xuICAgIHR5cGU6ICdzdGFjaycsXG4gICAgcG9pbnQ6IGVuY29kaW5nLmZpZWxkKGRpbSksXG4gICAgaGVpZ2h0OiBlbmNvZGluZy5maWVsZCh2YWwpLFxuICAgIG91dHB1dDoge3kxOiB2YWwsIHkwOiB2YWwgKyAnMid9XG4gIH1dO1xuXG4gIC8vIFRPRE86IFRoaXMgaXMgc3VwZXIgaGFjay1pc2ggLS0gY29uc29saWRhdGUgaW50byBtb2R1bGFyIG1hcmsgcHJvcGVydGllcz9cbiAgbWRlZi5wcm9wZXJ0aWVzLnVwZGF0ZVt2YWxdID0gbWRlZi5wcm9wZXJ0aWVzLmVudGVyW3ZhbF0gPSB7c2NhbGU6IHZhbCwgZmllbGQ6IHZhbH07XG4gIG1kZWYucHJvcGVydGllcy51cGRhdGVbdmFsICsgJzInXSA9IG1kZWYucHJvcGVydGllcy5lbnRlclt2YWwgKyAnMiddID0ge3NjYWxlOiB2YWwsIGZpZWxkOiB2YWwgKyAnMid9O1xuXG4gIHJldHVybiB2YWw7IC8vcmV0dXJuIHN0YWNrIGVuY29kaW5nXG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpLFxuICB1dGlsID0gcmVxdWlyZSgnLi4vdXRpbCcpLFxuICB2bGZpZWxkID0gcmVxdWlyZSgnLi4vZmllbGQnKSxcbiAgRW5jb2RpbmcgPSByZXF1aXJlKCcuLi9FbmNvZGluZycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVuY29kaW5nLCBzdGF0cykge1xuICByZXR1cm4ge1xuICAgIG9wYWNpdHk6IGVzdGltYXRlT3BhY2l0eShlbmNvZGluZywgc3RhdHMpLFxuICAgIGNvbG9yUmFuZ2U6IGNvbG9yUmFuZ2UoZW5jb2RpbmcsIHN0YXRzKVxuICB9O1xufTtcblxuZnVuY3Rpb24gY29sb3JSYW5nZShlbmNvZGluZywgc3RhdHMpe1xuICBpZiAoZW5jb2RpbmcuaGFzKENPTE9SKSAmJiBlbmNvZGluZy5pc0RpbWVuc2lvbihDT0xPUikpIHtcbiAgICB2YXIgY2FyZGluYWxpdHkgPSBlbmNvZGluZy5jYXJkaW5hbGl0eShDT0xPUiwgc3RhdHMpO1xuICAgIGlmIChjYXJkaW5hbGl0eSA8PSAxMCkge1xuICAgICAgcmV0dXJuIFwiY2F0ZWdvcnkxMFwiO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gXCJjYXRlZ29yeTIwXCI7XG4gICAgfVxuICAgIC8vIFRPRE8gY2FuIHZlZ2EgaW50ZXJwb2xhdGUgcmFuZ2UgZm9yIG9yZGluYWwgc2NhbGU/XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIGVzdGltYXRlT3BhY2l0eShlbmNvZGluZyxzdGF0cykge1xuICBpZiAoIXN0YXRzKSB7XG4gICAgcmV0dXJuIDE7XG4gIH1cblxuICB2YXIgbnVtUG9pbnRzID0gMDtcblxuICBpZiAoZW5jb2RpbmcuaXNBZ2dyZWdhdGUoKSkgeyAvLyBhZ2dyZWdhdGUgcGxvdFxuICAgIG51bVBvaW50cyA9IDE7XG5cbiAgICAvLyAgZ2V0IG51bWJlciBvZiBwb2ludHMgaW4gZWFjaCBcImNlbGxcIlxuICAgIC8vICBieSBjYWxjdWxhdGluZyBwcm9kdWN0IG9mIGNhcmRpbmFsaXR5XG4gICAgLy8gIGZvciBlYWNoIG5vbiBmYWNldGluZyBhbmQgbm9uLW9yZGluYWwgWCAvIFkgZmllbGRzXG4gICAgLy8gIG5vdGUgdGhhdCBvcmRpbmFsIHgseSBhcmUgbm90IGluY2x1ZGUgc2luY2Ugd2UgY2FuXG4gICAgLy8gIGNvbnNpZGVyIHRoYXQgb3JkaW5hbCB4IGFyZSBzdWJkaXZpZGluZyB0aGUgY2VsbCBpbnRvIHN1YmNlbGxzIGFueXdheVxuICAgIGVuY29kaW5nLmZvckVhY2goZnVuY3Rpb24oZmllbGQsIGVuY1R5cGUpIHtcblxuICAgICAgaWYgKGVuY1R5cGUgIT09IFJPVyAmJiBlbmNUeXBlICE9PSBDT0wgJiZcbiAgICAgICAgICAhKChlbmNUeXBlID09PSBYIHx8IGVuY1R5cGUgPT09IFkpICYmXG4gICAgICAgICAgdmxmaWVsZC5pc0RpbWVuc2lvbihmaWVsZCwgdHJ1ZSkpXG4gICAgICAgICkge1xuICAgICAgICBudW1Qb2ludHMgKj0gZW5jb2RpbmcuY2FyZGluYWxpdHkoZW5jVHlwZSwgc3RhdHMpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gIH0gZWxzZSB7IC8vIHJhdyBwbG90XG4gICAgbnVtUG9pbnRzID0gc3RhdHMuY291bnQ7XG5cbiAgICAvLyBzbWFsbCBtdWx0aXBsZXMgZGl2aWRlIG51bWJlciBvZiBwb2ludHNcbiAgICB2YXIgbnVtTXVsdGlwbGVzID0gMTtcbiAgICBpZiAoZW5jb2RpbmcuaGFzKFJPVykpIHtcbiAgICAgIG51bU11bHRpcGxlcyAqPSBlbmNvZGluZy5jYXJkaW5hbGl0eShST1csIHN0YXRzKTtcbiAgICB9XG4gICAgaWYgKGVuY29kaW5nLmhhcyhDT0wpKSB7XG4gICAgICBudW1NdWx0aXBsZXMgKj0gZW5jb2RpbmcuY2FyZGluYWxpdHkoQ09MLCBzdGF0cyk7XG4gICAgfVxuICAgIG51bVBvaW50cyAvPSBudW1NdWx0aXBsZXM7XG4gIH1cblxuICB2YXIgb3BhY2l0eSA9IDA7XG4gIGlmIChudW1Qb2ludHMgPCAyMCkge1xuICAgIG9wYWNpdHkgPSAxO1xuICB9IGVsc2UgaWYgKG51bVBvaW50cyA8IDIwMCkge1xuICAgIG9wYWNpdHkgPSAwLjc7XG4gIH0gZWxzZSBpZiAobnVtUG9pbnRzIDwgMTAwMCB8fCBlbmNvZGluZy5pcygndGljaycpKSB7XG4gICAgb3BhY2l0eSA9IDAuNjtcbiAgfSBlbHNlIHtcbiAgICBvcGFjaXR5ID0gMC4zO1xuICB9XG5cbiAgcmV0dXJuIG9wYWNpdHk7XG59XG5cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2dsb2JhbHMnKTtcblxudmFyIGdyb3VwZGVmID0gcmVxdWlyZSgnLi9ncm91cCcpLmRlZjtcblxubW9kdWxlLmV4cG9ydHMgPSBzdWJmYWNldGluZztcblxuZnVuY3Rpb24gc3ViZmFjZXRpbmcoZ3JvdXAsIG1kZWYsIGRldGFpbHMsIHN0YWNrLCBlbmNvZGluZykge1xuICB2YXIgbSA9IGdyb3VwLm1hcmtzLFxuICAgIGcgPSBncm91cGRlZignc3ViZmFjZXQnLCB7bWFya3M6IG19KTtcblxuICBncm91cC5tYXJrcyA9IFtnXTtcbiAgZy5mcm9tID0gbWRlZi5mcm9tO1xuICBkZWxldGUgbWRlZi5mcm9tO1xuXG4gIC8vVE9ETyB0ZXN0IExPRCAtLSB3ZSBzaG91bGQgc3VwcG9ydCBzdGFjayAvIGxpbmUgd2l0aG91dCBjb2xvciAoTE9EKSBmaWVsZFxuICB2YXIgdHJhbnMgPSAoZy5mcm9tLnRyYW5zZm9ybSB8fCAoZy5mcm9tLnRyYW5zZm9ybSA9IFtdKSk7XG4gIHRyYW5zLnVuc2hpZnQoe3R5cGU6ICdmYWNldCcsIGtleXM6IGRldGFpbHN9KTtcblxuICBpZiAoc3RhY2sgJiYgZW5jb2RpbmcuaGFzKENPTE9SKSkge1xuICAgIHRyYW5zLnVuc2hpZnQoe3R5cGU6ICdzb3J0JywgYnk6IGVuY29kaW5nLmZpZWxkKENPTE9SKX0pO1xuICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi4vZ2xvYmFscycpO1xuXG52YXIgZ3JvdXBkZWYgPSByZXF1aXJlKCcuL2dyb3VwJykuZGVmLFxuICB2bGRhdGEgPSByZXF1aXJlKCcuLi9kYXRhJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gdGVtcGxhdGU7XG5cbmZ1bmN0aW9uIHRlbXBsYXRlKGVuY29kaW5nLCBsYXlvdXQsIHN0YXRzKSB7IC8vaGFjayB1c2Ugc3RhdHNcblxuICB2YXIgZGF0YSA9IHtuYW1lOiBSQVcsIGZvcm1hdDoge3R5cGU6IGVuY29kaW5nLmNvbmZpZygnZGF0YUZvcm1hdFR5cGUnKX19LFxuICAgIHRhYmxlID0ge25hbWU6IFRBQkxFLCBzb3VyY2U6IFJBV30sXG4gICAgZGF0YVVybCA9IHZsZGF0YS5nZXRVcmwoZW5jb2RpbmcsIHN0YXRzKTtcbiAgaWYgKGRhdGFVcmwpIGRhdGEudXJsID0gZGF0YVVybDtcblxuICB2YXIgcHJlYWdncmVnYXRlZERhdGEgPSBlbmNvZGluZy5jb25maWcoJ3VzZVZlZ2FTZXJ2ZXInKTtcblxuICBlbmNvZGluZy5mb3JFYWNoKGZ1bmN0aW9uKGZpZWxkLCBlbmNUeXBlKSB7XG4gICAgdmFyIG5hbWU7XG4gICAgaWYgKGZpZWxkLnR5cGUgPT0gVCkge1xuICAgICAgZGF0YS5mb3JtYXQucGFyc2UgPSBkYXRhLmZvcm1hdC5wYXJzZSB8fCB7fTtcbiAgICAgIGRhdGEuZm9ybWF0LnBhcnNlW2ZpZWxkLm5hbWVdID0gJ2RhdGUnO1xuICAgIH0gZWxzZSBpZiAoZmllbGQudHlwZSA9PSBRKSB7XG4gICAgICBkYXRhLmZvcm1hdC5wYXJzZSA9IGRhdGEuZm9ybWF0LnBhcnNlIHx8IHt9O1xuICAgICAgaWYgKGZpZWxkLmFnZ3IgPT09ICdjb3VudCcpIHtcbiAgICAgICAgbmFtZSA9ICdjb3VudCc7XG4gICAgICB9IGVsc2UgaWYgKHByZWFnZ3JlZ2F0ZWREYXRhICYmIGZpZWxkLmJpbikge1xuICAgICAgICBuYW1lID0gJ2Jpbl8nICsgZmllbGQubmFtZTtcbiAgICAgIH0gZWxzZSBpZiAocHJlYWdncmVnYXRlZERhdGEgJiYgZmllbGQuYWdncikge1xuICAgICAgICBuYW1lID0gZmllbGQuYWdnciArICdfJyArIGZpZWxkLm5hbWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuYW1lID0gZmllbGQubmFtZTtcbiAgICAgIH1cbiAgICAgIGRhdGEuZm9ybWF0LnBhcnNlW25hbWVdID0gJ251bWJlcic7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4ge1xuICAgIHdpZHRoOiBsYXlvdXQud2lkdGgsXG4gICAgaGVpZ2h0OiBsYXlvdXQuaGVpZ2h0LFxuICAgIHBhZGRpbmc6ICdhdXRvJyxcbiAgICBkYXRhOiBbZGF0YSwgdGFibGVdLFxuICAgIG1hcmtzOiBbZ3JvdXBkZWYoJ2NlbGwnLCB7XG4gICAgICB3aWR0aDogbGF5b3V0LmNlbGxXaWR0aCA/IHt2YWx1ZTogbGF5b3V0LmNlbGxXaWR0aH0gOiB1bmRlZmluZWQsXG4gICAgICBoZWlnaHQ6IGxheW91dC5jZWxsSGVpZ2h0ID8ge3ZhbHVlOiBsYXlvdXQuY2VsbEhlaWdodH0gOiB1bmRlZmluZWRcbiAgICB9KV1cbiAgfTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdsb2JhbHMgPSByZXF1aXJlKCcuLi9nbG9iYWxzJyksXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gdGltZTtcblxuZnVuY3Rpb24gdGltZShzcGVjLCBlbmNvZGluZywgb3B0KSB7XG4gIHZhciB0aW1lRmllbGRzID0ge30sIHRpbWVGbiA9IHt9O1xuXG4gIC8vIGZpbmQgdW5pcXVlIGZvcm11bGEgdHJhbnNmb3JtYXRpb24gYW5kIGJpbiBmdW5jdGlvblxuICBlbmNvZGluZy5mb3JFYWNoKGZ1bmN0aW9uKGZpZWxkLCBlbmNUeXBlKSB7XG4gICAgaWYgKGZpZWxkLnR5cGUgPT09IFQgJiYgZmllbGQuZm4pIHtcbiAgICAgIHRpbWVGaWVsZHNbZW5jb2RpbmcuZmllbGQoZW5jVHlwZSldID0ge1xuICAgICAgICBmaWVsZDogZmllbGQsXG4gICAgICAgIGVuY1R5cGU6IGVuY1R5cGVcbiAgICAgIH07XG4gICAgICB0aW1lRm5bZmllbGQuZm5dID0gdHJ1ZTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIGFkZCBmb3JtdWxhIHRyYW5zZm9ybVxuICB2YXIgZGF0YSA9IHNwZWMuZGF0YVsxXSxcbiAgICB0cmFuc2Zvcm0gPSBkYXRhLnRyYW5zZm9ybSA9IGRhdGEudHJhbnNmb3JtIHx8IFtdO1xuXG4gIGZvciAodmFyIGYgaW4gdGltZUZpZWxkcykge1xuICAgIHZhciB0ZiA9IHRpbWVGaWVsZHNbZl07XG4gICAgdGltZS50cmFuc2Zvcm0odHJhbnNmb3JtLCBlbmNvZGluZywgdGYuZW5jVHlwZSwgdGYuZmllbGQpO1xuICB9XG5cbiAgLy8gYWRkIHNjYWxlc1xuICB2YXIgc2NhbGVzID0gc3BlYy5zY2FsZXMgPSBzcGVjLnNjYWxlcyB8fCBbXTtcbiAgZm9yICh2YXIgZm4gaW4gdGltZUZuKSB7XG4gICAgdGltZS5zY2FsZShzY2FsZXMsIGZuLCBlbmNvZGluZyk7XG4gIH1cbiAgcmV0dXJuIHNwZWM7XG59XG5cbnRpbWUuY2FyZGluYWxpdHkgPSBmdW5jdGlvbihmaWVsZCwgc3RhdHMsIGZpbHRlck51bGwpIHtcbiAgdmFyIGZuID0gZmllbGQuZm47XG4gIHN3aXRjaCAoZm4pIHtcbiAgICBjYXNlICdzZWNvbmRzJzogcmV0dXJuIDYwO1xuICAgIGNhc2UgJ21pbnV0ZXMnOiByZXR1cm4gNjA7XG4gICAgY2FzZSAnaG91cnMnOiByZXR1cm4gMjQ7XG4gICAgY2FzZSAnZGF5JzogcmV0dXJuIDc7XG4gICAgY2FzZSAnZGF0ZSc6IHJldHVybiAzMTtcbiAgICBjYXNlICdtb250aCc6IHJldHVybiAxMjtcbiAgICAvLyBjYXNlICd5ZWFyJzogIC0tIG5lZWQgcmVhbCBjYXJkaW5hbGl0eVxuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59O1xuXG5mdW5jdGlvbiBmaWVsZEZuKGZ1bmMsIGZpZWxkKSB7XG4gIHJldHVybiBmdW5jICsgJyhkLmRhdGEuJysgZmllbGQubmFtZSArJyknO1xufVxuXG4vKipcbiAqIEByZXR1cm4ge1N0cmluZ30gZGF0ZSBiaW5uaW5nIGZvcm11bGEgb2YgdGhlIGdpdmVuIGZpZWxkXG4gKi9cbnRpbWUuZm9ybXVsYSA9IGZ1bmN0aW9uKGZpZWxkKSB7XG4gIHJldHVybiBmaWVsZEZuKGZpZWxkLmZuLCBmaWVsZCk7XG59O1xuXG4vKiogYWRkIGZvcm11bGEgdHJhbnNmb3JtcyB0byBkYXRhICovXG50aW1lLnRyYW5zZm9ybSA9IGZ1bmN0aW9uKHRyYW5zZm9ybSwgZW5jb2RpbmcsIGVuY1R5cGUsIGZpZWxkKSB7XG4gIHRyYW5zZm9ybS5wdXNoKHtcbiAgICB0eXBlOiAnZm9ybXVsYScsXG4gICAgZmllbGQ6IGVuY29kaW5nLmZpZWxkKGVuY1R5cGUpLFxuICAgIGV4cHI6IHRpbWUuZm9ybXVsYShmaWVsZClcbiAgfSk7XG59O1xuXG4vKiogYXBwZW5kIGN1c3RvbSB0aW1lIHNjYWxlcyBmb3IgYXhpcyBsYWJlbCAqL1xudGltZS5zY2FsZSA9IGZ1bmN0aW9uKHNjYWxlcywgZm4sIGVuY29kaW5nKSB7XG4gIHZhciBsYWJlbExlbmd0aCA9IGVuY29kaW5nLmNvbmZpZygndGltZVNjYWxlTGFiZWxMZW5ndGgnKTtcbiAgLy8gVE9ETyBhZGQgb3B0aW9uIGZvciBzaG9ydGVyIHNjYWxlIC8gY3VzdG9tIHJhbmdlXG4gIHN3aXRjaCAoZm4pIHtcbiAgICBjYXNlICdkYXknOlxuICAgICAgc2NhbGVzLnB1c2goe1xuICAgICAgICBuYW1lOiAndGltZS0nK2ZuLFxuICAgICAgICB0eXBlOiAnb3JkaW5hbCcsXG4gICAgICAgIGRvbWFpbjogdXRpbC5yYW5nZSgwLCA3KSxcbiAgICAgICAgcmFuZ2U6IFsnTW9uZGF5JywgJ1R1ZXNkYXknLCAnV2VkbmVzZGF5JywgJ1RodXJzZGF5JywgJ0ZyaWRheScsICdTYXR1cmRheScsICdTdW5kYXknXS5tYXAoXG4gICAgICAgICAgZnVuY3Rpb24ocykgeyByZXR1cm4gcy5zdWJzdHIoMCwgbGFiZWxMZW5ndGgpO31cbiAgICAgICAgKVxuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdtb250aCc6XG4gICAgICBzY2FsZXMucHVzaCh7XG4gICAgICAgIG5hbWU6ICd0aW1lLScrZm4sXG4gICAgICAgIHR5cGU6ICdvcmRpbmFsJyxcbiAgICAgICAgZG9tYWluOiB1dGlsLnJhbmdlKDAsIDEyKSxcbiAgICAgICAgcmFuZ2U6IFsnSmFudWFyeScsICdGZWJydWFyeScsICdNYXJjaCcsICdBcHJpbCcsICdNYXknLCAnSnVuZScsICdKdWx5JywgJ0F1Z3VzdCcsICdTZXB0ZW1iZXInLCAnT2N0b2JlcicsICdOb3ZlbWJlcicsICdEZWNlbWJlciddLm1hcChcbiAgICAgICAgICAgIGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMuc3Vic3RyKDAsIGxhYmVsTGVuZ3RoKTt9XG4gICAgICAgICAgKVxuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgfVxufTtcblxudGltZS5pc09yZGluYWxGbiA9IGZ1bmN0aW9uKGZuKSB7XG4gIHN3aXRjaCAoZm4pIHtcbiAgICBjYXNlICdzZWNvbmRzJzpcbiAgICBjYXNlICdtaW51dGVzJzpcbiAgICBjYXNlICdob3Vycyc6XG4gICAgY2FzZSAnZGF5JzpcbiAgICBjYXNlICdkYXRlJzpcbiAgICBjYXNlICdtb250aCc6XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG50aW1lLnNjYWxlLnR5cGUgPSBmdW5jdGlvbihmbikge1xuICByZXR1cm4gdGltZS5pc09yZGluYWxGbihmbikgPyAnb3JkaW5hbCcgOiAnbGluZWFyJztcbn07XG5cbnRpbWUuc2NhbGUuZG9tYWluID0gZnVuY3Rpb24oZm4pIHtcbiAgc3dpdGNoIChmbikge1xuICAgIGNhc2UgJ3NlY29uZHMnOlxuICAgIGNhc2UgJ21pbnV0ZXMnOiByZXR1cm4gdXRpbC5yYW5nZSgwLCA2MCk7XG4gICAgY2FzZSAnaG91cnMnOiByZXR1cm4gdXRpbC5yYW5nZSgwLCAyNCk7XG4gICAgY2FzZSAnZGF5JzogcmV0dXJuIHV0aWwucmFuZ2UoMCwgNyk7XG4gICAgY2FzZSAnZGF0ZSc6IHJldHVybiB1dGlsLnJhbmdlKDAsIDMyKTtcbiAgICBjYXNlICdtb250aCc6IHJldHVybiB1dGlsLnJhbmdlKDAsIDEyKTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG5cbi8qKiB3aGV0aGVyIGEgcGFydGljdWxhciB0aW1lIGZ1bmN0aW9uIGhhcyBjdXN0b20gc2NhbGUgZm9yIGxhYmVscyBpbXBsZW1lbnRlZCBpbiB0aW1lLnNjYWxlICovXG50aW1lLmhhc1NjYWxlID0gZnVuY3Rpb24oZm4pIHtcbiAgc3dpdGNoIChmbikge1xuICAgIGNhc2UgJ2RheSc6XG4gICAgY2FzZSAnbW9udGgnOlxuICAgICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuXG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBnbG9iYWxzID0gcmVxdWlyZSgnLi9nbG9iYWxzJyk7XG5cbnZhciBjb25zdHMgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5jb25zdHMuZW5jb2RpbmdUeXBlcyA9IFtYLCBZLCBST1csIENPTCwgU0laRSwgU0hBUEUsIENPTE9SLCBBTFBIQSwgVEVYVCwgREVUQUlMXTtcblxuY29uc3RzLmRhdGFUeXBlcyA9IHsnTyc6IE8sICdRJzogUSwgJ1QnOiBUfTtcblxuY29uc3RzLmRhdGFUeXBlTmFtZXMgPSBbJ08nLCAnUScsICdUJ10ucmVkdWNlKGZ1bmN0aW9uKHIsIHgpIHtcbiAgcltjb25zdHMuZGF0YVR5cGVzW3hdXSA9IHg7XG4gIHJldHVybiByO1xufSx7fSk7XG5cbmNvbnN0cy5zaG9ydGhhbmQgPSB7XG4gIGRlbGltOiAgJ3wnLFxuICBhc3NpZ246ICc9JyxcbiAgdHlwZTogICAnLCcsXG4gIGZ1bmM6ICAgJ18nXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyBUT0RPIHJlbmFtZSBnZXREYXRhVXJsIHRvIHZsLmRhdGEuZ2V0VXJsKCkgP1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG52YXIgdmxkYXRhID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxudmxkYXRhLmdldFVybCA9IGZ1bmN0aW9uIGdldERhdGFVcmwoZW5jb2RpbmcsIHN0YXRzKSB7XG4gIGlmICghZW5jb2RpbmcuY29uZmlnKCd1c2VWZWdhU2VydmVyJykpIHtcbiAgICAvLyBkb24ndCB1c2UgdmVnYSBzZXJ2ZXJcbiAgICByZXR1cm4gZW5jb2RpbmcuY29uZmlnKCdkYXRhVXJsJyk7XG4gIH1cblxuICBpZiAoZW5jb2RpbmcubGVuZ3RoKCkgPT09IDApIHtcbiAgICAvLyBubyBmaWVsZHNcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgZmllbGRzID0gW107XG4gIGVuY29kaW5nLmZvckVhY2goZnVuY3Rpb24oZmllbGQsIGVuY1R5cGUpIHtcbiAgICB2YXIgb2JqID0ge1xuICAgICAgbmFtZTogZW5jb2RpbmcuZmllbGQoZW5jVHlwZSwgdHJ1ZSksXG4gICAgICBmaWVsZDogZmllbGQubmFtZVxuICAgIH07XG4gICAgaWYgKGZpZWxkLmFnZ3IpIHtcbiAgICAgIG9iai5hZ2dyID0gZmllbGQuYWdncjtcbiAgICB9XG4gICAgaWYgKGZpZWxkLmJpbikge1xuICAgICAgb2JqLmJpblNpemUgPSB1dGlsLmdldGJpbnMoc3RhdHNbZmllbGQubmFtZV0sIGVuY29kaW5nLmJpbihlbmNUeXBlKS5tYXhiaW5zKS5zdGVwO1xuICAgIH1cbiAgICBmaWVsZHMucHVzaChvYmopO1xuICB9KTtcblxuICB2YXIgcXVlcnkgPSB7XG4gICAgdGFibGU6IGVuY29kaW5nLmNvbmZpZygndmVnYVNlcnZlclRhYmxlJyksXG4gICAgZmllbGRzOiBmaWVsZHNcbiAgfTtcblxuICByZXR1cm4gZW5jb2RpbmcuY29uZmlnKCd2ZWdhU2VydmVyVXJsJykgKyAnL3F1ZXJ5Lz9xPScgKyBKU09OLnN0cmluZ2lmeShxdWVyeSk7XG59O1xuXG4vKipcbiAqIEBwYXJhbSAge09iamVjdH0gZGF0YSBkYXRhIGluIEpTT04vamF2YXNjcmlwdCBvYmplY3QgZm9ybWF0XG4gKiBAcmV0dXJuIEFycmF5IG9mIHtuYW1lOiBfX25hbWVfXywgdHlwZTogXCJudW1iZXJ8dGV4dHx0aW1lfGxvY2F0aW9uXCJ9XG4gKi9cbnZsZGF0YS5nZXRTY2hlbWEgPSBmdW5jdGlvbihkYXRhKSB7XG4gIHZhciBzY2hlbWEgPSBbXSxcbiAgICBmaWVsZHMgPSB1dGlsLmtleXMoZGF0YVswXSk7XG5cbiAgZmllbGRzLmZvckVhY2goZnVuY3Rpb24oaykge1xuICAgIC8vIGZpbmQgbm9uLW51bGwgZGF0YVxuICAgIHZhciBpID0gMCwgZGF0dW0gPSBkYXRhW2ldW2tdO1xuICAgIHdoaWxlIChkYXR1bSA9PT0gJycgfHwgZGF0dW0gPT09IG51bGwgfHwgZGF0dW0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgZGF0dW0gPSBkYXRhWysraV1ba107XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIHZhciBudW1iZXIgPSBKU09OLnBhcnNlKGRhdHVtKTtcbiAgICAgIGRhdHVtID0gbnVtYmVyO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgLy8gZG8gbm90aGluZ1xuICAgIH1cblxuICAgIC8vVE9ETyhrYW5pdHcpOiBiZXR0ZXIgdHlwZSBpbmZlcmVuY2UgaGVyZVxuICAgIHZhciB0eXBlID0gKHR5cGVvZiBkYXR1bSA9PT0gJ251bWJlcicpID8gJ1EnOlxuICAgICAgaXNOYU4oRGF0ZS5wYXJzZShkYXR1bSkpID8gJ08nIDogJ1QnO1xuXG4gICAgc2NoZW1hLnB1c2goe25hbWU6IGssIHR5cGU6IHR5cGV9KTtcbiAgfSk7XG5cbiAgcmV0dXJuIHNjaGVtYTtcbn07XG5cbnZsZGF0YS5nZXRTdGF0cyA9IGZ1bmN0aW9uKGRhdGEpIHsgLy8gaGFja1xuICB2YXIgc3RhdHMgPSB7fSxcbiAgICBmaWVsZHMgPSB1dGlsLmtleXMoZGF0YVswXSk7XG5cbiAgZmllbGRzLmZvckVhY2goZnVuY3Rpb24oaykge1xuICAgIHZhciBzdGF0ID0gdXRpbC5taW5tYXgoZGF0YSwgaywgdHJ1ZSk7XG4gICAgc3RhdC5jYXJkaW5hbGl0eSA9IHV0aWwudW5pcShkYXRhLCBrKTtcbiAgICBzdGF0LmNvdW50ID0gZGF0YS5sZW5ndGg7XG5cbiAgICBzdGF0Lm1heGxlbmd0aCA9IGRhdGEucmVkdWNlKGZ1bmN0aW9uKG1heCxyb3cpIHtcbiAgICAgIGlmIChyb3dba10gPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG1heDtcbiAgICAgIH1cbiAgICAgIHZhciBsZW4gPSByb3dba10udG9TdHJpbmcoKS5sZW5ndGg7XG4gICAgICByZXR1cm4gbGVuID4gbWF4ID8gbGVuIDogbWF4O1xuICAgIH0sIDApO1xuXG4gICAgc3RhdC5udW1OdWxscyA9IGRhdGEucmVkdWNlKGZ1bmN0aW9uKGNvdW50LCByb3cpIHtcbiAgICAgIHJldHVybiByb3dba10gPT09IG51bGwgPyBjb3VudCArIDEgOiBjb3VudDtcbiAgICB9LCAwKTtcblxuICAgIHZhciBudW1iZXJzID0gdXRpbC5udW1iZXJzKGRhdGEubWFwKGZ1bmN0aW9uKGQpIHtyZXR1cm4gZFtrXTt9KSk7XG5cbiAgICBpZiAobnVtYmVycy5sZW5ndGggPiAwKSB7XG4gICAgICBzdGF0LnNrZXcgPSB1dGlsLnNrZXcobnVtYmVycyk7XG4gICAgICBzdGF0LnN0ZGV2ID0gdXRpbC5zdGRldihudW1iZXJzKTtcbiAgICAgIHN0YXQubWVhbiA9IHV0aWwubWVhbihudW1iZXJzKTtcbiAgICAgIHN0YXQubWVkaWFuID0gdXRpbC5tZWRpYW4obnVtYmVycyk7XG4gICAgfVxuXG4gICAgdmFyIHNhbXBsZSA9IHt9O1xuICAgIHdoaWxlKE9iamVjdC5rZXlzKHNhbXBsZSkubGVuZ3RoIDwgTWF0aC5taW4oc3RhdC5jYXJkaW5hbGl0eSwgMTApKSB7XG4gICAgICB2YXIgdmFsdWUgPSBkYXRhW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGRhdGEubGVuZ3RoKV1ba107XG4gICAgICBzYW1wbGVbdmFsdWVdID0gdHJ1ZTtcbiAgICB9XG4gICAgc3RhdC5zYW1wbGUgPSBPYmplY3Qua2V5cyhzYW1wbGUpO1xuXG4gICAgc3RhdHNba10gPSBzdGF0O1xuICB9KTtcbiAgc3RhdHMuY291bnQgPSBkYXRhLmxlbmd0aDtcbiAgcmV0dXJuIHN0YXRzO1xufTtcbiIsIi8vIHV0aWxpdHkgZm9yIGVuY1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBjb25zdHMgPSByZXF1aXJlKCcuL2NvbnN0cycpLFxuICBjID0gY29uc3RzLnNob3J0aGFuZCxcbiAgdGltZSA9IHJlcXVpcmUoJy4vY29tcGlsZS90aW1lJyksXG4gIHZsZmllbGQgPSByZXF1aXJlKCcuL2ZpZWxkJyksXG4gIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKSxcbiAgc2NoZW1hID0gcmVxdWlyZSgnLi9zY2hlbWEvc2NoZW1hJyksXG4gIGVuY1R5cGVzID0gc2NoZW1hLmVuY1R5cGVzO1xuXG52YXIgdmxlbmMgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG52bGVuYy5jb3VudFJldGluYWwgPSBmdW5jdGlvbihlbmMpIHtcbiAgdmFyIGNvdW50ID0gMDtcbiAgaWYgKGVuYy5jb2xvcikgY291bnQrKztcbiAgaWYgKGVuYy5hbHBoYSkgY291bnQrKztcbiAgaWYgKGVuYy5zaXplKSBjb3VudCsrO1xuICBpZiAoZW5jLnNoYXBlKSBjb3VudCsrO1xuICByZXR1cm4gY291bnQ7XG59O1xuXG52bGVuYy5oYXMgPSBmdW5jdGlvbihlbmMsIGVuY1R5cGUpIHtcbiAgdmFyIGZpZWxkRGVmID0gZW5jICYmIGVuY1tlbmNUeXBlXTtcbiAgcmV0dXJuIGZpZWxkRGVmICYmIGZpZWxkRGVmLm5hbWU7XG59O1xuXG52bGVuYy5pc0FnZ3JlZ2F0ZSA9IGZ1bmN0aW9uKGVuYykge1xuICBmb3IgKHZhciBrIGluIGVuYykge1xuICAgIGlmICh2bGVuYy5oYXMoZW5jLCBrKSAmJiBlbmNba10uYWdncikge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbnZsZW5jLmZvckVhY2ggPSBmdW5jdGlvbihlbmMsIGYpIHtcbiAgdmFyIGkgPSAwO1xuICBlbmNUeXBlcy5mb3JFYWNoKGZ1bmN0aW9uKGspIHtcbiAgICBpZiAodmxlbmMuaGFzKGVuYywgaykpIHtcbiAgICAgIGYoZW5jW2tdLCBrLCBpKyspO1xuICAgIH1cbiAgfSk7XG59O1xuXG52bGVuYy5tYXAgPSBmdW5jdGlvbihlbmMsIGYpIHtcbiAgdmFyIGFyciA9IFtdO1xuICBlbmNUeXBlcy5mb3JFYWNoKGZ1bmN0aW9uKGspIHtcbiAgICBpZiAodmxlbmMuaGFzKGVuYywgaykpIHtcbiAgICAgIGFyci5wdXNoKGYoZW5jW2tdLCBrLCBlbmMpKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gYXJyO1xufTtcblxudmxlbmMucmVkdWNlID0gZnVuY3Rpb24oZW5jLCBmLCBpbml0KSB7XG4gIHZhciByID0gaW5pdCwgaSA9IDAsIGs7XG4gIGVuY1R5cGVzLmZvckVhY2goZnVuY3Rpb24oaykge1xuICAgIGlmICh2bGVuYy5oYXMoZW5jLCBrKSkge1xuICAgICAgciA9IGYociwgZW5jW2tdLCBrLCAgZW5jKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcjtcbn07XG5cbi8qXG4gKiByZXR1cm4ga2V5LXZhbHVlIHBhaXJzIG9mIGZpZWxkIG5hbWUgYW5kIGxpc3Qgb2YgZmllbGRzIG9mIHRoYXQgZmllbGQgbmFtZVxuICovXG52bGVuYy5maWVsZHMgPSBmdW5jdGlvbihlbmMpIHtcbiAgcmV0dXJuIHZsZW5jLnJlZHVjZShlbmMsIGZ1bmN0aW9uIChtLCBmaWVsZCwgZW5jVHlwZSkge1xuICAgIHZhciBmaWVsZExpc3QgPSBtW2ZpZWxkLm5hbWVdID0gbVtmaWVsZC5uYW1lXSB8fCBbXSxcbiAgICAgIGNvbnRhaW5zVHlwZSA9IGZpZWxkTGlzdC5jb250YWluc1R5cGUgPSBmaWVsZExpc3QuY29udGFpbnNUeXBlIHx8IHt9O1xuXG4gICAgaWYgKGZpZWxkTGlzdC5pbmRleE9mKGZpZWxkKSA9PT0gLTEpIHtcbiAgICAgIGZpZWxkTGlzdC5wdXNoKGZpZWxkKTtcbiAgICAgIC8vIGF1Z21lbnQgdGhlIGFycmF5IHdpdGggY29udGFpbnNUeXBlLlEgLyBPIC8gVFxuICAgICAgY29udGFpbnNUeXBlW2ZpZWxkLnR5cGVdID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIG07XG4gIH0sIHt9KTtcbn07XG5cbnZsZW5jLnNob3J0aGFuZCA9IGZ1bmN0aW9uKGVuYykge1xuICByZXR1cm4gdmxlbmMubWFwKGVuYywgZnVuY3Rpb24oZmllbGQsIGV0KSB7XG4gICAgcmV0dXJuIGV0ICsgYy5hc3NpZ24gKyB2bGZpZWxkLnNob3J0aGFuZChmaWVsZCk7XG4gIH0pLmpvaW4oYy5kZWxpbSk7XG59O1xuXG52bGVuYy5wYXJzZVNob3J0aGFuZCA9IGZ1bmN0aW9uKHNob3J0aGFuZCwgY29udmVydFR5cGUpIHtcbiAgdmFyIGVuYyA9IHNob3J0aGFuZC5zcGxpdChjLmRlbGltKTtcbiAgcmV0dXJuIGVuYy5yZWR1Y2UoZnVuY3Rpb24obSwgZSkge1xuICAgIHZhciBzcGxpdCA9IGUuc3BsaXQoYy5hc3NpZ24pLFxuICAgICAgICBlbmN0eXBlID0gc3BsaXRbMF0udHJpbSgpLFxuICAgICAgICBmaWVsZCA9IHNwbGl0WzFdO1xuXG4gICAgbVtlbmN0eXBlXSA9IHZsZmllbGQucGFyc2VTaG9ydGhhbmQoZmllbGQsIGNvbnZlcnRUeXBlKTtcbiAgICByZXR1cm4gbTtcbiAgfSwge30pO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbi8vIHV0aWxpdHkgZm9yIGZpZWxkXG5cbnZhciBjb25zdHMgPSByZXF1aXJlKCcuL2NvbnN0cycpLFxuICBjID0gY29uc3RzLnNob3J0aGFuZCxcbiAgdGltZSA9IHJlcXVpcmUoJy4vY29tcGlsZS90aW1lJyksXG4gIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKSxcbiAgc2NoZW1hID0gcmVxdWlyZSgnLi9zY2hlbWEvc2NoZW1hJyk7XG5cbnZhciB2bGZpZWxkID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxudmxmaWVsZC5zaG9ydGhhbmQgPSBmdW5jdGlvbihmKSB7XG4gIHZhciBjID0gY29uc3RzLnNob3J0aGFuZDtcbiAgcmV0dXJuIChmLmFnZ3IgPyBmLmFnZ3IgKyBjLmZ1bmMgOiAnJykgK1xuICAgIChmLmZuID8gZi5mbiArIGMuZnVuYyA6ICcnKSArXG4gICAgKGYuYmluID8gJ2JpbicgKyBjLmZ1bmMgOiAnJykgK1xuICAgIChmLm5hbWUgfHwgJycpICsgYy50eXBlICtcbiAgICAoY29uc3RzLmRhdGFUeXBlTmFtZXNbZi50eXBlXSB8fCBmLnR5cGUpO1xufTtcblxudmxmaWVsZC5zaG9ydGhhbmRzID0gZnVuY3Rpb24oZmllbGRzLCBkZWxpbSkge1xuICBkZWxpbSA9IGRlbGltIHx8ICcsJztcbiAgcmV0dXJuIGZpZWxkcy5tYXAodmxmaWVsZC5zaG9ydGhhbmQpLmpvaW4oZGVsaW0pO1xufTtcblxudmxmaWVsZC5wYXJzZVNob3J0aGFuZCA9IGZ1bmN0aW9uKHNob3J0aGFuZCwgY29udmVydFR5cGUpIHtcbiAgdmFyIHNwbGl0ID0gc2hvcnRoYW5kLnNwbGl0KGMudHlwZSksIGk7XG4gIHZhciBvID0ge1xuICAgIG5hbWU6IHNwbGl0WzBdLnRyaW0oKSxcbiAgICB0eXBlOiBjb252ZXJ0VHlwZSA/IGNvbnN0cy5kYXRhVHlwZXNbc3BsaXRbMV0udHJpbSgpXSA6IHNwbGl0WzFdLnRyaW0oKVxuICB9O1xuXG4gIC8vIGNoZWNrIGFnZ3JlZ2F0ZSB0eXBlXG4gIGZvciAoaSBpbiBzY2hlbWEuYWdnci5lbnVtKSB7XG4gICAgdmFyIGEgPSBzY2hlbWEuYWdnci5lbnVtW2ldO1xuICAgIGlmIChvLm5hbWUuaW5kZXhPZihhICsgJ18nKSA9PT0gMCkge1xuICAgICAgby5uYW1lID0gby5uYW1lLnN1YnN0cihhLmxlbmd0aCArIDEpO1xuICAgICAgaWYgKGEgPT0gJ2NvdW50JyAmJiBvLm5hbWUubGVuZ3RoID09PSAwKSBvLm5hbWUgPSAnKic7XG4gICAgICBvLmFnZ3IgPSBhO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLy8gY2hlY2sgdGltZSBmblxuICBmb3IgKGkgaW4gc2NoZW1hLnRpbWVmbnMpIHtcbiAgICB2YXIgZiA9IHNjaGVtYS50aW1lZm5zW2ldO1xuICAgIGlmIChvLm5hbWUgJiYgby5uYW1lLmluZGV4T2YoZiArICdfJykgPT09IDApIHtcbiAgICAgIG8ubmFtZSA9IG8ubmFtZS5zdWJzdHIoby5sZW5ndGggKyAxKTtcbiAgICAgIG8uZm4gPSBmO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLy8gY2hlY2sgYmluXG4gIGlmIChvLm5hbWUgJiYgby5uYW1lLmluZGV4T2YoJ2Jpbl8nKSA9PT0gMCkge1xuICAgIG8ubmFtZSA9IG8ubmFtZS5zdWJzdHIoNCk7XG4gICAgby5iaW4gPSB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIG87XG59O1xuXG52YXIgdHlwZU9yZGVyID0ge1xuICBPOiAwLFxuICBHOiAxLFxuICBUOiAyLFxuICBROiAzXG59O1xuXG52bGZpZWxkLm9yZGVyID0ge307XG5cbnZsZmllbGQub3JkZXIudHlwZSA9IGZ1bmN0aW9uKGZpZWxkKSB7XG4gIGlmIChmaWVsZC5hZ2dyPT09J2NvdW50JykgcmV0dXJuIDQ7XG4gIHJldHVybiB0eXBlT3JkZXJbZmllbGQudHlwZV07XG59O1xuXG52bGZpZWxkLm9yZGVyLnR5cGVUaGVuTmFtZSA9IGZ1bmN0aW9uKGZpZWxkKSB7XG4gIHJldHVybiB2bGZpZWxkLm9yZGVyLnR5cGUoZmllbGQpICsgJ18nICsgZmllbGQubmFtZTtcbn07XG5cbnZsZmllbGQub3JkZXIub3JpZ2luYWwgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIDA7IC8vIG5vIHN3YXAgd2lsbCBvY2N1clxufTtcblxudmxmaWVsZC5vcmRlci5uYW1lID0gZnVuY3Rpb24oZmllbGQpIHtcbiAgcmV0dXJuIGZpZWxkLm5hbWU7XG59O1xuXG52bGZpZWxkLm9yZGVyLnR5cGVUaGVuQ2FyZGluYWxpdHkgPSBmdW5jdGlvbihmaWVsZCwgc3RhdHMpe1xuICByZXR1cm4gc3RhdHNbZmllbGQubmFtZV0uY2FyZGluYWxpdHk7XG59O1xuXG5cbnZsZmllbGQuaXNUeXBlID0gZnVuY3Rpb24gKGZpZWxkRGVmLCB0eXBlKSB7XG4gIHJldHVybiAoZmllbGREZWYudHlwZSAmIHR5cGUpID4gMDtcbn07XG5cbnZsZmllbGQuaXNUeXBlLmJ5TmFtZSA9IGZ1bmN0aW9uIChmaWVsZCwgdHlwZSkge1xuICByZXR1cm4gZmllbGQudHlwZSA9PT0gY29uc3RzLmRhdGFUeXBlTmFtZXNbdHlwZV07XG59O1xuXG5mdW5jdGlvbiBnZXRJc1R5cGUodXNlVHlwZUNvZGUpIHtcbiAgcmV0dXJuIHVzZVR5cGVDb2RlID8gdmxmaWVsZC5pc1R5cGUgOiB2bGZpZWxkLmlzVHlwZS5ieU5hbWU7XG59XG5cbi8qXG4gKiBNb3N0IGZpZWxkcyB0aGF0IHVzZSBvcmRpbmFsIHNjYWxlIGFyZSBkaW1lbnNpb25zLlxuICogSG93ZXZlciwgWUVBUihUKSwgWUVBUk1PTlRIKFQpIHVzZSB0aW1lIHNjYWxlLCBub3Qgb3JkaW5hbCBidXQgYXJlIGRpbWVuc2lvbnMgdG9vLlxuICovXG52bGZpZWxkLmlzT3JkaW5hbFNjYWxlID0gZnVuY3Rpb24oZmllbGQsIHVzZVR5cGVDb2RlIC8qb3B0aW9uYWwqLykge1xuICB2YXIgaXNUeXBlID0gZ2V0SXNUeXBlKHVzZVR5cGVDb2RlKTtcbiAgcmV0dXJuICBpc1R5cGUoZmllbGQsIE8pIHx8IGZpZWxkLmJpbiB8fFxuICAgICggaXNUeXBlKGZpZWxkLCBUKSAmJiBmaWVsZC5mbiAmJiB0aW1lLmlzT3JkaW5hbEZuKGZpZWxkLmZuKSApO1xufTtcblxuZnVuY3Rpb24gaXNEaW1lbnNpb24oZmllbGQsIHVzZVR5cGVDb2RlIC8qb3B0aW9uYWwqLykge1xuICB2YXIgaXNUeXBlID0gZ2V0SXNUeXBlKHVzZVR5cGVDb2RlKTtcbiAgcmV0dXJuICBpc1R5cGUoZmllbGQsIE8pIHx8ICEhZmllbGQuYmluIHx8XG4gICAgKCBpc1R5cGUoZmllbGQsIFQpICYmICEhZmllbGQuZm4gKTtcbn1cblxuLyoqXG4gKiBGb3IgZW5jb2RpbmcsIHVzZSBlbmNvZGluZy5pc0RpbWVuc2lvbigpIHRvIGF2b2lkIGNvbmZ1c2lvbi5cbiAqIE9yIHVzZSBFbmNvZGluZy5pc1R5cGUgaWYgeW91ciBmaWVsZCBpcyBmcm9tIEVuY29kaW5nIChhbmQgdGh1cyBoYXZlIG51bWVyaWMgZGF0YSB0eXBlKS5cbiAqIG90aGVyd2lzZSwgZG8gbm90IHNwZWNpZmljIGlzVHlwZSBzbyB3ZSBjYW4gdXNlIHRoZSBkZWZhdWx0IGlzVHlwZU5hbWUgaGVyZS5cbiAqL1xudmxmaWVsZC5pc0RpbWVuc2lvbiA9IGZ1bmN0aW9uKGZpZWxkLCB1c2VUeXBlQ29kZSAvKm9wdGlvbmFsKi8pIHtcbiAgcmV0dXJuIGZpZWxkICYmIGlzRGltZW5zaW9uKGZpZWxkLCB1c2VUeXBlQ29kZSk7XG59O1xuXG52bGZpZWxkLmlzTWVhc3VyZSA9IGZ1bmN0aW9uKGZpZWxkLCB1c2VUeXBlQ29kZSkge1xuICByZXR1cm4gZmllbGQgJiYgIWlzRGltZW5zaW9uKGZpZWxkLCB1c2VUeXBlQ29kZSk7XG59O1xuXG52bGZpZWxkLnJvbGUgPSBmdW5jdGlvbihmaWVsZCkge1xuICByZXR1cm4gaXNEaW1lbnNpb24oZmllbGQpID8gJ2RpbWVuc2lvbicgOiAnbWVhc3VyZSc7XG59O1xuXG52bGZpZWxkLmNvdW50ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7bmFtZTonKicsIGFnZ3I6ICdjb3VudCcsIHR5cGU6J1EnLCBkaXNwbGF5TmFtZTogdmxmaWVsZC5jb3VudC5kaXNwbGF5TmFtZX07XG59O1xuXG52bGZpZWxkLmNvdW50LmRpc3BsYXlOYW1lID0gJ051bWJlciBvZiBSZWNvcmRzJztcblxudmxmaWVsZC5pc0NvdW50ID0gZnVuY3Rpb24oZmllbGQpIHtcbiAgcmV0dXJuIGZpZWxkLmFnZ3IgPT09ICdjb3VudCc7XG59O1xuXG4vKipcbiAqIEZvciBlbmNvZGluZywgdXNlIGVuY29kaW5nLmNhcmRpbmFsaXR5KCkgdG8gYXZvaWQgY29uZnVzaW9uLiAgT3IgdXNlIEVuY29kaW5nLmlzVHlwZSBpZiB5b3VyIGZpZWxkIGlzIGZyb20gRW5jb2RpbmcgKGFuZCB0aHVzIGhhdmUgbnVtZXJpYyBkYXRhIHR5cGUpLlxuICogb3RoZXJ3aXNlLCBkbyBub3Qgc3BlY2lmaWMgaXNUeXBlIHNvIHdlIGNhbiB1c2UgdGhlIGRlZmF1bHQgaXNUeXBlTmFtZSBoZXJlLlxuICovXG52bGZpZWxkLmNhcmRpbmFsaXR5ID0gZnVuY3Rpb24oZmllbGQsIHN0YXRzLCBmaWx0ZXJOdWxsLCB1c2VUeXBlQ29kZSkge1xuICAvLyBGSVhNRSBuZWVkIHRvIHRha2UgZmlsdGVyIGludG8gYWNjb3VudFxuICB2YXIgaXNUeXBlID0gZ2V0SXNUeXBlKHVzZVR5cGVDb2RlKSxcbiAgICB0eXBlID0gdXNlVHlwZUNvZGUgPyBjb25zdHMuZGF0YVR5cGVOYW1lc1tmaWVsZC50eXBlXSA6IGZpZWxkLnR5cGU7XG5cbiAgZmlsdGVyTnVsbCA9IGZpbHRlck51bGwgfHwge307XG5cbiAgaWYgKGZpZWxkLmJpbikge1xuICAgIHZhciBiaW5zID0gdXRpbC5nZXRiaW5zKHN0YXRzW2ZpZWxkLm5hbWVdLCBmaWVsZC5iaW4ubWF4YmlucyB8fCBzY2hlbWEuTUFYQklOU19ERUZBVUxUKTtcbiAgICByZXR1cm4gKGJpbnMuc3RvcCAtIGJpbnMuc3RhcnQpIC8gYmlucy5zdGVwO1xuICB9XG4gIGlmIChpc1R5cGUoZmllbGQsIFQpKSB7XG4gICAgdmFyIGNhcmRpbmFsaXR5ID0gdGltZS5jYXJkaW5hbGl0eShmaWVsZCwgc3RhdHMsIGZpbHRlck51bGwpO1xuICAgIGlmKGNhcmRpbmFsaXR5ICE9PSBudWxsKSByZXR1cm4gY2FyZGluYWxpdHk7XG4gICAgLy9vdGhlcndpc2UgdXNlIGNhbGN1bGF0aW9uIGJlbG93XG4gIH1cbiAgaWYgKGZpZWxkLmFnZ3IpIHtcbiAgICByZXR1cm4gMTtcbiAgfVxuXG4gIC8vIHJlbW92ZSBudWxsXG4gIHZhciBzdGF0ID0gc3RhdHNbZmllbGQubmFtZV07XG4gIHJldHVybiBzdGF0LmNhcmRpbmFsaXR5IC1cbiAgICAoc3RhdC5udW1OdWxscyA+IDAgJiYgZmlsdGVyTnVsbFt0eXBlXSA/IDEgOiAwKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIGRlY2xhcmUgZ2xvYmFsIGNvbnN0YW50XG52YXIgZyA9IGdsb2JhbCB8fCB3aW5kb3c7XG5cbmcuVEFCTEUgPSAndGFibGUnO1xuZy5SQVcgPSAncmF3JztcbmcuU1RBQ0tFRCA9ICdzdGFja2VkJztcbmcuSU5ERVggPSAnaW5kZXgnO1xuXG5nLlggPSAneCc7XG5nLlkgPSAneSc7XG5nLlJPVyA9ICdyb3cnO1xuZy5DT0wgPSAnY29sJztcbmcuU0laRSA9ICdzaXplJztcbmcuU0hBUEUgPSAnc2hhcGUnO1xuZy5DT0xPUiA9ICdjb2xvcic7XG5nLkFMUEhBID0gJ2FscGhhJztcbmcuVEVYVCA9ICd0ZXh0JztcbmcuREVUQUlMID0gJ2RldGFpbCc7XG5cbmcuTyA9IDE7XG5nLlEgPSAyO1xuZy5UID0gNDtcbiIsIi8vIFBhY2thZ2Ugb2YgZGVmaW5pbmcgVmVnYWxpdGUgU3BlY2lmaWNhdGlvbidzIGpzb24gc2NoZW1hXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIHNjaGVtYSA9IG1vZHVsZS5leHBvcnRzID0ge30sXG4gIHV0aWwgPSByZXF1aXJlKCcuLi91dGlsJyk7XG5cbnNjaGVtYS51dGlsID0gcmVxdWlyZSgnLi9zY2hlbWF1dGlsJyk7XG5cbnNjaGVtYS5tYXJrdHlwZSA9IHtcbiAgdHlwZTogJ3N0cmluZycsXG4gIGVudW06IFsncG9pbnQnLCAndGljaycsICdiYXInLCAnbGluZScsICdhcmVhJywgJ2NpcmNsZScsICdzcXVhcmUnLCAndGV4dCddXG59O1xuXG5zY2hlbWEuYWdnciA9IHtcbiAgdHlwZTogJ3N0cmluZycsXG4gIGVudW06IFsnYXZnJywgJ3N1bScsICdtaW4nLCAnbWF4JywgJ2NvdW50J10sXG4gIHN1cHBvcnRlZEVudW1zOiB7XG4gICAgUTogWydhdmcnLCAnc3VtJywgJ21pbicsICdtYXgnLCAnY291bnQnXSxcbiAgICBPOiBbXSxcbiAgICBUOiBbJ2F2ZycsICdtaW4nLCAnbWF4J10sXG4gICAgJyc6IFsnY291bnQnXVxuICB9LFxuICBzdXBwb3J0ZWRUeXBlczogeydRJzogdHJ1ZSwgJ08nOiB0cnVlLCAnVCc6IHRydWUsICcnOiB0cnVlfVxufTtcbnNjaGVtYS5iYW5kID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgcHJvcGVydGllczoge1xuICAgIHNpemU6IHtcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgIG1pbmltdW06IDBcbiAgICB9LFxuICAgIHBhZGRpbmc6IHtcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgIG1pbmltdW06IDAsXG4gICAgICBkZWZhdWx0OiAxXG4gICAgfVxuICB9XG59O1xuXG5zY2hlbWEuZ2V0U3VwcG9ydGVkUm9sZSA9IGZ1bmN0aW9uKGVuY1R5cGUpIHtcbiAgcmV0dXJuIHNjaGVtYS5zY2hlbWEucHJvcGVydGllcy5lbmMucHJvcGVydGllc1tlbmNUeXBlXS5zdXBwb3J0ZWRSb2xlO1xufTtcblxuc2NoZW1hLnRpbWVmbnMgPSBbJ3llYXInLCAnbW9udGgnLCAnZGF5JywgJ2RhdGUnLCAnaG91cnMnLCAnbWludXRlcycsICdzZWNvbmRzJ107XG5cbnNjaGVtYS5kZWZhdWx0VGltZUZuID0gJ21vbnRoJztcblxuc2NoZW1hLmZuID0ge1xuICB0eXBlOiAnc3RyaW5nJyxcbiAgZW51bTogc2NoZW1hLnRpbWVmbnMsXG4gIHN1cHBvcnRlZFR5cGVzOiB7J1QnOiB0cnVlfVxufTtcblxuLy9UT0RPKGthbml0dyk6IGFkZCBvdGhlciB0eXBlIG9mIGZ1bmN0aW9uIGhlcmVcblxuc2NoZW1hLnNjYWxlX3R5cGUgPSB7XG4gIHR5cGU6ICdzdHJpbmcnLFxuICBlbnVtOiBbJ2xpbmVhcicsICdsb2cnLCAncG93JywgJ3NxcnQnLCAncXVhbnRpbGUnXSxcbiAgZGVmYXVsdDogJ2xpbmVhcicsXG4gIHN1cHBvcnRlZFR5cGVzOiB7J1EnOiB0cnVlfVxufTtcblxuc2NoZW1hLmZpZWxkID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgcHJvcGVydGllczoge1xuICAgIG5hbWU6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgfVxuICB9XG59O1xuXG52YXIgY2xvbmUgPSB1dGlsLmR1cGxpY2F0ZTtcbnZhciBtZXJnZSA9IHNjaGVtYS51dGlsLm1lcmdlO1xuXG5zY2hlbWEuTUFYQklOU19ERUZBVUxUID0gMTU7XG5cbnZhciBiaW4gPSB7XG4gIHR5cGU6IFsnYm9vbGVhbicsICdvYmplY3QnXSxcbiAgZGVmYXVsdDogZmFsc2UsXG4gIHByb3BlcnRpZXM6IHtcbiAgICBtYXhiaW5zOiB7XG4gICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICBkZWZhdWx0OiBzY2hlbWEuTUFYQklOU19ERUZBVUxULFxuICAgICAgbWluaW11bTogMlxuICAgIH1cbiAgfSxcbiAgc3VwcG9ydGVkVHlwZXM6IHsnUSc6IHRydWV9IC8vIFRPRE86IGFkZCAnTycgYWZ0ZXIgZmluaXNoaW5nICM4MVxufTtcblxudmFyIHR5cGljYWxGaWVsZCA9IG1lcmdlKGNsb25lKHNjaGVtYS5maWVsZCksIHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHByb3BlcnRpZXM6IHtcbiAgICB0eXBlOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGVudW06IFsnTycsICdRJywgJ1QnXVxuICAgIH0sXG4gICAgYWdncjogc2NoZW1hLmFnZ3IsXG4gICAgZm46IHNjaGVtYS5mbixcbiAgICBiaW46IGJpbixcbiAgICBzY2FsZToge1xuICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIHR5cGU6IHNjaGVtYS5zY2FsZV90eXBlLFxuICAgICAgICByZXZlcnNlOiB7XG4gICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgIHN1cHBvcnRlZFR5cGVzOiB7J1EnOiB0cnVlLCAnTyc6IHRydWUsICdUJzogdHJ1ZX1cbiAgICAgICAgfSxcbiAgICAgICAgemVybzoge1xuICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0luY2x1ZGUgemVybycsXG4gICAgICAgICAgc3VwcG9ydGVkVHlwZXM6IHsnUSc6IHRydWV9XG4gICAgICAgIH0sXG4gICAgICAgIG5pY2U6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICBlbnVtOiBbJ3NlY29uZCcsICdtaW51dGUnLCAnaG91cicsICdkYXknLCAnd2VlaycsICdtb250aCcsICd5ZWFyJ10sXG4gICAgICAgICAgc3VwcG9ydGVkVHlwZXM6IHsnVCc6IHRydWV9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pO1xuXG52YXIgb25seU9yZGluYWxGaWVsZCA9IG1lcmdlKGNsb25lKHNjaGVtYS5maWVsZCksIHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHN1cHBvcnRlZFJvbGU6IHtcbiAgICBkaW1lbnNpb246IHRydWVcbiAgfSxcbiAgcHJvcGVydGllczoge1xuICAgIHR5cGU6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZW51bTogWydPJywnUScsICdUJ10gLy8gb3JkaW5hbC1vbmx5IGZpZWxkIHN1cHBvcnRzIFEgd2hlbiBiaW4gaXMgYXBwbGllZCBhbmQgVCB3aGVuIGZuIGlzIGFwcGxpZWQuXG4gICAgfSxcbiAgICBmbjogc2NoZW1hLmZuLFxuICAgIGJpbjogYmluLFxuICAgIGFnZ3I6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZW51bTogWydjb3VudCddLFxuICAgICAgc3VwcG9ydGVkVHlwZXM6IHsnTyc6IHRydWV9XG4gICAgfVxuICB9XG59KTtcblxudmFyIGF4aXNNaXhpbiA9IHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHN1cHBvcnRlZE1hcmt0eXBlczoge3BvaW50OiB0cnVlLCB0aWNrOiB0cnVlLCBiYXI6IHRydWUsIGxpbmU6IHRydWUsIGFyZWE6IHRydWUsIGNpcmNsZTogdHJ1ZSwgc3F1YXJlOiB0cnVlfSxcbiAgcHJvcGVydGllczoge1xuICAgIGF4aXM6IHtcbiAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgcHJvcGVydGllczoge1xuICAgICAgICBncmlkOiB7XG4gICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQSBmbGFnIGluZGljYXRlIGlmIGdyaWRsaW5lcyBzaG91bGQgYmUgY3JlYXRlZCBpbiBhZGRpdGlvbiB0byB0aWNrcy4nXG4gICAgICAgIH0sXG4gICAgICAgIHRpdGxlOiB7XG4gICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdBIHRpdGxlIGZvciB0aGUgYXhpcy4nXG4gICAgICAgIH0sXG4gICAgICAgIHRpdGxlT2Zmc2V0OiB7XG4gICAgICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgICAgIGRlZmF1bHQ6IHVuZGVmaW5lZCwgIC8vIGF1dG9cbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0EgdGl0bGUgb2Zmc2V0IHZhbHVlIGZvciB0aGUgYXhpcy4nXG4gICAgICAgIH0sXG4gICAgICAgIGZvcm1hdDoge1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgIGRlZmF1bHQ6IHVuZGVmaW5lZCwgIC8vIGF1dG9cbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSBmb3JtYXR0aW5nIHBhdHRlcm4gZm9yIGF4aXMgbGFiZWxzLidcbiAgICAgICAgfSxcbiAgICAgICAgbWF4TGFiZWxMZW5ndGg6IHtcbiAgICAgICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICAgICAgZGVmYXVsdDogMjUsXG4gICAgICAgICAgbWluaW11bTogMCxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1RydW5jYXRlIGxhYmVscyB0aGF0IGFyZSB0b28gbG9uZy4nXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbnZhciBzb3J0TWl4aW4gPSB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgc29ydDoge1xuICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgIGRlZmF1bHQ6IFtdLFxuICAgICAgaXRlbXM6IHtcbiAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgIHN1cHBvcnRlZFR5cGVzOiB7J08nOiB0cnVlfSxcbiAgICAgICAgcmVxdWlyZWQ6IFsnbmFtZScsICdhZ2dyJ10sXG4gICAgICAgIG5hbWU6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICB9LFxuICAgICAgICBhZ2dyOiB7XG4gICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgZW51bTogWydhdmcnLCAnc3VtJywgJ21pbicsICdtYXgnLCAnY291bnQnXVxuICAgICAgICB9LFxuICAgICAgICByZXZlcnNlOiB7XG4gICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbnZhciBiYW5kTWl4aW4gPSB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgYmFuZDogc2NoZW1hLmJhbmRcbiAgfVxufTtcblxudmFyIGxlZ2VuZE1peGluID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgcHJvcGVydGllczoge1xuICAgIGxlZ2VuZDoge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH1cbiAgfVxufTtcblxudmFyIHRleHRNaXhpbiA9IHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHN1cHBvcnRlZE1hcmt0eXBlczogeyd0ZXh0JzogdHJ1ZX0sXG4gIHByb3BlcnRpZXM6IHtcbiAgICB0ZXh0OiB7XG4gICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgYWxpZ246IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICBkZWZhdWx0OiAnbGVmdCdcbiAgICAgICAgfSxcbiAgICAgICAgYmFzZWxpbmU6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICBkZWZhdWx0OiAnbWlkZGxlJ1xuICAgICAgICB9LFxuICAgICAgICBtYXJnaW46IHtcbiAgICAgICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICAgICAgZGVmYXVsdDogNCxcbiAgICAgICAgICBtaW5pbXVtOiAwXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGZvbnQ6IHtcbiAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgcHJvcGVydGllczoge1xuICAgICAgICB3ZWlnaHQ6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICBlbnVtOiBbJ25vcm1hbCcsICdib2xkJ10sXG4gICAgICAgICAgZGVmYXVsdDogJ25vcm1hbCdcbiAgICAgICAgfSxcbiAgICAgICAgc2l6ZToge1xuICAgICAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgICAgICBkZWZhdWx0OiAxMCxcbiAgICAgICAgICBtaW5pbXVtOiAwXG4gICAgICAgIH0sXG4gICAgICAgIGZhbWlseToge1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgIGRlZmF1bHQ6ICdIZWx2ZXRpY2EgTmV1ZSdcbiAgICAgICAgfSxcbiAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICBkZWZhdWx0OiAnbm9ybWFsJyxcbiAgICAgICAgICBlbnVtOiBbJ25vcm1hbCcsICdpdGFsaWMnXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG52YXIgc2l6ZU1peGluID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgc3VwcG9ydGVkTWFya3R5cGVzOiB7cG9pbnQ6IHRydWUsIGJhcjogdHJ1ZSwgY2lyY2xlOiB0cnVlLCBzcXVhcmU6IHRydWUsIHRleHQ6IHRydWV9LFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgdmFsdWU6IHtcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgIGRlZmF1bHQ6IDMwLFxuICAgICAgbWluaW11bTogMFxuICAgIH1cbiAgfVxufTtcblxudmFyIGNvbG9yTWl4aW4gPSB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBzdXBwb3J0ZWRNYXJrdHlwZXM6IHtwb2ludDogdHJ1ZSwgdGljazogdHJ1ZSwgYmFyOiB0cnVlLCBsaW5lOiB0cnVlLCBhcmVhOiB0cnVlLCBjaXJjbGU6IHRydWUsIHNxdWFyZTogdHJ1ZSwgJ3RleHQnOiB0cnVlfSxcbiAgcHJvcGVydGllczoge1xuICAgIHZhbHVlOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIHJvbGU6ICdjb2xvcicsXG4gICAgICBkZWZhdWx0OiAnc3RlZWxibHVlJ1xuICAgIH0sXG4gICAgc2NhbGU6IHtcbiAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgcHJvcGVydGllczoge1xuICAgICAgICByYW5nZToge1xuICAgICAgICAgIHR5cGU6IFsnc3RyaW5nJywgJ2FycmF5J11cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxudmFyIGFscGhhTWl4aW4gPSB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBzdXBwb3J0ZWRNYXJrdHlwZXM6IHtwb2ludDogdHJ1ZSwgdGljazogdHJ1ZSwgYmFyOiB0cnVlLCBsaW5lOiB0cnVlLCBhcmVhOiB0cnVlLCBjaXJjbGU6IHRydWUsIHNxdWFyZTogdHJ1ZSwgJ3RleHQnOiB0cnVlfSxcbiAgcHJvcGVydGllczoge1xuICAgIHZhbHVlOiB7XG4gICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgIGRlZmF1bHQ6IHVuZGVmaW5lZCwgIC8vIGF1dG9cbiAgICAgIG1pbmltdW06IDAsXG4gICAgICBtYXhpbXVtOiAxXG4gICAgfVxuICB9XG59O1xuXG52YXIgc2hhcGVNaXhpbiA9IHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHN1cHBvcnRlZE1hcmt0eXBlczoge3BvaW50OiB0cnVlLCBjaXJjbGU6IHRydWUsIHNxdWFyZTogdHJ1ZX0sXG4gIHByb3BlcnRpZXM6IHtcbiAgICB2YWx1ZToge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBlbnVtOiBbJ2NpcmNsZScsICdzcXVhcmUnLCAnY3Jvc3MnLCAnZGlhbW9uZCcsICd0cmlhbmdsZS11cCcsICd0cmlhbmdsZS1kb3duJ10sXG4gICAgICBkZWZhdWx0OiAnY2lyY2xlJ1xuICAgIH1cbiAgfVxufTtcblxudmFyIGRldGFpbE1peGluID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgc3VwcG9ydGVkTWFya3R5cGVzOiB7cG9pbnQ6IHRydWUsIHRpY2s6IHRydWUsIGxpbmU6IHRydWUsIGNpcmNsZTogdHJ1ZSwgc3F1YXJlOiB0cnVlfVxufTtcblxudmFyIHJvd01peGluID0ge1xuICBwcm9wZXJ0aWVzOiB7XG4gICAgaGVpZ2h0OiB7XG4gICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgIG1pbmltdW06IDAsXG4gICAgICBkZWZhdWx0OiAxNTBcbiAgICB9XG4gIH1cbn07XG5cbnZhciBjb2xNaXhpbiA9IHtcbiAgcHJvcGVydGllczoge1xuICAgIHdpZHRoOiB7XG4gICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgIG1pbmltdW06IDAsXG4gICAgICBkZWZhdWx0OiAxNTBcbiAgICB9XG4gIH1cbn07XG5cbnZhciBmYWNldE1peGluID0ge1xuICB0eXBlOiAnb2JqZWN0JyxcbiAgc3VwcG9ydGVkTWFya3R5cGVzOiB7cG9pbnQ6IHRydWUsIHRpY2s6IHRydWUsIGJhcjogdHJ1ZSwgbGluZTogdHJ1ZSwgYXJlYTogdHJ1ZSwgY2lyY2xlOiB0cnVlLCBzcXVhcmU6IHRydWUsIHRleHQ6IHRydWV9LFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgcGFkZGluZzoge1xuICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICBtaW5pbXVtOiAwLFxuICAgICAgbWF4aW11bTogMSxcbiAgICAgIGRlZmF1bHQ6IDAuMVxuICAgIH1cbiAgfVxufTtcblxudmFyIHJlcXVpcmVkTmFtZVR5cGUgPSB7XG4gIHJlcXVpcmVkOiBbJ25hbWUnLCAndHlwZSddXG59O1xuXG52YXIgbXVsdGlSb2xlRmllbGQgPSBtZXJnZShjbG9uZSh0eXBpY2FsRmllbGQpLCB7XG4gIHN1cHBvcnRlZFJvbGU6IHtcbiAgICBtZWFzdXJlOiB0cnVlLFxuICAgIGRpbWVuc2lvbjogdHJ1ZVxuICB9XG59KTtcblxudmFyIHF1YW50aXRhdGl2ZUZpZWxkID0gbWVyZ2UoY2xvbmUodHlwaWNhbEZpZWxkKSwge1xuICBzdXBwb3J0ZWRSb2xlOiB7XG4gICAgbWVhc3VyZTogdHJ1ZSxcbiAgICBkaW1lbnNpb246ICdvcmRpbmFsLW9ubHknIC8vIHVzaW5nIGFscGhhIC8gc2l6ZSB0byBlbmNvZGluZyBjYXRlZ29yeSBsZWFkIHRvIG9yZGVyIGludGVycHJldGF0aW9uXG4gIH1cbn0pO1xuXG52YXIgb25seVF1YW50aXRhdGl2ZUZpZWxkID0gbWVyZ2UoY2xvbmUodHlwaWNhbEZpZWxkKSwge1xuICBzdXBwb3J0ZWRSb2xlOiB7XG4gICAgbWVhc3VyZTogdHJ1ZVxuICB9XG59KTtcblxudmFyIHggPSBtZXJnZShjbG9uZShtdWx0aVJvbGVGaWVsZCksIGF4aXNNaXhpbiwgYmFuZE1peGluLCByZXF1aXJlZE5hbWVUeXBlLCBzb3J0TWl4aW4pO1xudmFyIHkgPSBjbG9uZSh4KTtcblxudmFyIGZhY2V0ID0gbWVyZ2UoY2xvbmUob25seU9yZGluYWxGaWVsZCksIHJlcXVpcmVkTmFtZVR5cGUsIGZhY2V0TWl4aW4sIHNvcnRNaXhpbik7XG52YXIgcm93ID0gbWVyZ2UoY2xvbmUoZmFjZXQpLCBheGlzTWl4aW4sIHJvd01peGluKTtcbnZhciBjb2wgPSBtZXJnZShjbG9uZShmYWNldCksIGF4aXNNaXhpbiwgY29sTWl4aW4pO1xuXG52YXIgc2l6ZSA9IG1lcmdlKGNsb25lKHF1YW50aXRhdGl2ZUZpZWxkKSwgbGVnZW5kTWl4aW4sIHNpemVNaXhpbiwgc29ydE1peGluKTtcbnZhciBjb2xvciA9IG1lcmdlKGNsb25lKG11bHRpUm9sZUZpZWxkKSwgbGVnZW5kTWl4aW4sIGNvbG9yTWl4aW4sIHNvcnRNaXhpbik7XG52YXIgYWxwaGEgPSBtZXJnZShjbG9uZShxdWFudGl0YXRpdmVGaWVsZCksIGFscGhhTWl4aW4sIHNvcnRNaXhpbik7XG52YXIgc2hhcGUgPSBtZXJnZShjbG9uZShvbmx5T3JkaW5hbEZpZWxkKSwgbGVnZW5kTWl4aW4sIHNoYXBlTWl4aW4sIHNvcnRNaXhpbik7XG52YXIgZGV0YWlsID0gbWVyZ2UoY2xvbmUob25seU9yZGluYWxGaWVsZCksIGRldGFpbE1peGluLCBzb3J0TWl4aW4pO1xuXG4vLyB3ZSBvbmx5IHB1dCBhZ2dyZWdhdGVkIG1lYXN1cmUgaW4gcGl2b3QgdGFibGVcbnZhciB0ZXh0ID0gbWVyZ2UoY2xvbmUob25seVF1YW50aXRhdGl2ZUZpZWxkKSwgdGV4dE1peGluLCBzb3J0TWl4aW4pO1xuXG4vLyBUT0RPIGFkZCBsYWJlbFxuXG52YXIgZmlsdGVyID0ge1xuICB0eXBlOiAnYXJyYXknLFxuICBpdGVtczoge1xuICAgIHR5cGU6ICdvYmplY3QnLFxuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgIG9wZXJhbmRzOiB7XG4gICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgdHlwZTogWydzdHJpbmcnLCAnYm9vbGVhbicsICdpbnRlZ2VyJywgJ251bWJlciddXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvcGVyYXRvcjoge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZW51bTogWyc+JywgJz49JywgJz0nLCAnIT0nLCAnPCcsICc8PScsICdub3ROdWxsJ11cbiAgICAgIH1cbiAgICB9XG4gIH1cbn07XG5cbnZhciBjZmcgPSB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBwcm9wZXJ0aWVzOiB7XG4gICAgLy8gdGVtcGxhdGVcbiAgICB3aWR0aDoge1xuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgZGVmYXVsdDogdW5kZWZpbmVkXG4gICAgfSxcbiAgICBoZWlnaHQ6IHtcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgIGRlZmF1bHQ6IHVuZGVmaW5lZFxuICAgIH0sXG4gICAgdmlld3BvcnQ6IHtcbiAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICBpdGVtczoge1xuICAgICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIH0sXG4gICAgICBkZWZhdWx0OiB1bmRlZmluZWRcbiAgICB9LFxuXG4gICAgLy8gZmlsdGVyIG51bGxcbiAgICBmaWx0ZXJOdWxsOiB7XG4gICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgTzoge3R5cGU6J2Jvb2xlYW4nLCBkZWZhdWx0OiBmYWxzZX0sXG4gICAgICAgIFE6IHt0eXBlOidib29sZWFuJywgZGVmYXVsdDogdHJ1ZX0sXG4gICAgICAgIFQ6IHt0eXBlOidib29sZWFuJywgZGVmYXVsdDogdHJ1ZX1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gc2luZ2xlIHBsb3RcbiAgICBzaW5nbGVIZWlnaHQ6IHtcbiAgICAgIC8vIHdpbGwgYmUgb3ZlcndyaXR0ZW4gYnkgYmFuZFdpZHRoICogKGNhcmRpbmFsaXR5ICsgcGFkZGluZylcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgIGRlZmF1bHQ6IDIwMCxcbiAgICAgIG1pbmltdW06IDBcbiAgICB9LFxuICAgIHNpbmdsZVdpZHRoOiB7XG4gICAgICAvLyB3aWxsIGJlIG92ZXJ3cml0dGVuIGJ5IGJhbmRXaWR0aCAqIChjYXJkaW5hbGl0eSArIHBhZGRpbmcpXG4gICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICBkZWZhdWx0OiAyMDAsXG4gICAgICBtaW5pbXVtOiAwXG4gICAgfSxcbiAgICAvLyBiYW5kIHNpemVcbiAgICBsYXJnZUJhbmRTaXplOiB7XG4gICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICBkZWZhdWx0OiAxOSxcbiAgICAgIG1pbmltdW06IDBcbiAgICB9LFxuICAgIHNtYWxsQmFuZFNpemU6IHtcbiAgICAgIC8vc21hbGwgbXVsdGlwbGVzIG9yIHNpbmdsZSBwbG90IHdpdGggaGlnaCBjYXJkaW5hbGl0eVxuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgZGVmYXVsdDogMTIsXG4gICAgICBtaW5pbXVtOiAwXG4gICAgfSxcbiAgICBsYXJnZUJhbmRNYXhDYXJkaW5hbGl0eToge1xuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgZGVmYXVsdDogMTBcbiAgICB9LFxuICAgIC8vIHNtYWxsIG11bHRpcGxlc1xuICAgIGNlbGxQYWRkaW5nOiB7XG4gICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgIGRlZmF1bHQ6IDAuMVxuICAgIH0sXG4gICAgY2VsbEJhY2tncm91bmRDb2xvcjoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICByb2xlOiAnY29sb3InLFxuICAgICAgZGVmYXVsdDogJyNmZGZkZmQnXG4gICAgfSxcbiAgICB0ZXh0Q2VsbFdpZHRoOiB7XG4gICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICBkZWZhdWx0OiA5MCxcbiAgICAgIG1pbmltdW06IDBcbiAgICB9LFxuXG4gICAgLy8gbWFya3NcbiAgICBzdHJva2VXaWR0aDoge1xuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgZGVmYXVsdDogMixcbiAgICAgIG1pbmltdW06IDBcbiAgICB9LFxuXG4gICAgLy8gc2NhbGVzXG4gICAgdGltZVNjYWxlTGFiZWxMZW5ndGg6IHtcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgIGRlZmF1bHQ6IDMsXG4gICAgICBtaW5pbXVtOiAwXG4gICAgfSxcbiAgICAvLyBvdGhlclxuICAgIGNoYXJhY3RlcldpZHRoOiB7XG4gICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICBkZWZhdWx0OiA2XG4gICAgfSxcblxuICAgIC8vIGRhdGEgc291cmNlXG4gICAgZGF0YUZvcm1hdFR5cGU6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZW51bTogWydqc29uJywgJ2NzdiddLFxuICAgICAgZGVmYXVsdDogJ2pzb24nXG4gICAgfSxcbiAgICB1c2VWZWdhU2VydmVyOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIH0sXG4gICAgZGF0YVVybDoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiB1bmRlZmluZWRcbiAgICB9LFxuICAgIHZlZ2FTZXJ2ZXJUYWJsZToge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiB1bmRlZmluZWRcbiAgICB9LFxuICAgIHZlZ2FTZXJ2ZXJVcmw6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMSdcbiAgICB9XG4gIH1cbn07XG5cbi8qKiBAdHlwZSBPYmplY3QgU2NoZW1hIG9mIGEgdmVnYWxpdGUgc3BlY2lmaWNhdGlvbiAqL1xuc2NoZW1hLnNjaGVtYSA9IHtcbiAgJHNjaGVtYTogJ2h0dHA6Ly9qc29uLXNjaGVtYS5vcmcvZHJhZnQtMDQvc2NoZW1hIycsXG4gIGRlc2NyaXB0aW9uOiAnU2NoZW1hIGZvciB2ZWdhbGl0ZSBzcGVjaWZpY2F0aW9uJyxcbiAgdHlwZTogJ29iamVjdCcsXG4gIHJlcXVpcmVkOiBbJ21hcmt0eXBlJywgJ2VuYycsICdjZmcnXSxcbiAgcHJvcGVydGllczoge1xuICAgIG1hcmt0eXBlOiBzY2hlbWEubWFya3R5cGUsXG4gICAgZW5jOiB7XG4gICAgICB0eXBlOiAnb2JqZWN0JyxcbiAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgeDogeCxcbiAgICAgICAgeTogeSxcbiAgICAgICAgcm93OiByb3csXG4gICAgICAgIGNvbDogY29sLFxuICAgICAgICBzaXplOiBzaXplLFxuICAgICAgICBjb2xvcjogY29sb3IsXG4gICAgICAgIGFscGhhOiBhbHBoYSxcbiAgICAgICAgc2hhcGU6IHNoYXBlLFxuICAgICAgICB0ZXh0OiB0ZXh0LFxuICAgICAgICBkZXRhaWw6IGRldGFpbFxuICAgICAgfVxuICAgIH0sXG4gICAgZmlsdGVyOiBmaWx0ZXIsXG4gICAgY2ZnOiBjZmdcbiAgfVxufTtcblxuc2NoZW1hLmVuY1R5cGVzID0gdXRpbC5rZXlzKHNjaGVtYS5zY2hlbWEucHJvcGVydGllcy5lbmMucHJvcGVydGllcyk7XG5cbnNjaGVtYS5nZXRFbmNUeXBlID0gZnVuY3Rpb24oZW5jVHlwZSkge1xuICByZXR1cm4gc2NoZW1hLnNjaGVtYS5wcm9wZXJ0aWVzLmVuYy5wcm9wZXJ0aWVzW2VuY1R5cGVdO1xufTtcblxuc2NoZW1hLmluc3RhbnRpYXRlRmllbGQgPSBmdW5jdGlvbihlbmNUeXBlKSB7XG4gIHJldHVybiBzY2hlbWEudXRpbC5pbnN0YW50aWF0ZShzY2hlbWEuZ2V0RW5jVHlwZShlbmNUeXBlKSk7XG59O1xuXG4vKiogSW5zdGFudGlhdGUgYSB2ZXJib3NlIHZsIHNwZWMgZnJvbSB0aGUgc2NoZW1hICovXG5zY2hlbWEuaW5zdGFudGlhdGUgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHNjaGVtYS51dGlsLmluc3RhbnRpYXRlKHNjaGVtYS5zY2hlbWEpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWwgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG52YXIgaXNFbXB0eSA9IGZ1bmN0aW9uKG9iaikge1xuICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5sZW5ndGggPT09IDA7XG59O1xuXG51dGlsLmV4dGVuZCA9IGZ1bmN0aW9uKGluc3RhbmNlLCBzY2hlbWEpIHtcbiAgcmV0dXJuIHV0aWwubWVyZ2UodXRpbC5pbnN0YW50aWF0ZShzY2hlbWEpLCBpbnN0YW5jZSk7XG59O1xuXG4vLyBpbnN0YW50aWF0ZSBhIHNjaGVtYVxudXRpbC5pbnN0YW50aWF0ZSA9IGZ1bmN0aW9uKHNjaGVtYSkge1xuICBpZiAoc2NoZW1hLnR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgdmFyIGluc3RhbmNlID0ge307XG4gICAgZm9yICh2YXIgbmFtZSBpbiBzY2hlbWEucHJvcGVydGllcykge1xuICAgICAgdmFyIHZhbCA9IHV0aWwuaW5zdGFudGlhdGUoc2NoZW1hLnByb3BlcnRpZXNbbmFtZV0pO1xuICAgICAgaWYgKHZhbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGluc3RhbmNlW25hbWVdID0gdmFsO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH0gZWxzZSBpZiAoJ2RlZmF1bHQnIGluIHNjaGVtYSkge1xuICAgIHJldHVybiBzY2hlbWEuZGVmYXVsdDtcbiAgfSBlbHNlIGlmIChzY2hlbWEudHlwZSA9PT0gJ2FycmF5Jykge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufTtcblxuLy8gcmVtb3ZlIGFsbCBkZWZhdWx0cyBmcm9tIGFuIGluc3RhbmNlXG51dGlsLnN1YnRyYWN0ID0gZnVuY3Rpb24oaW5zdGFuY2UsIGRlZmF1bHRzKSB7XG4gIHZhciBjaGFuZ2VzID0ge307XG4gIGZvciAodmFyIHByb3AgaW4gaW5zdGFuY2UpIHtcbiAgICB2YXIgZGVmID0gZGVmYXVsdHNbcHJvcF07XG4gICAgdmFyIGlucyA9IGluc3RhbmNlW3Byb3BdO1xuICAgIC8vIE5vdGU6IGRvZXMgbm90IHByb3Blcmx5IHN1YnRyYWN0IGFycmF5c1xuICAgIGlmICghZGVmYXVsdHMgfHwgZGVmICE9PSBpbnMpIHtcbiAgICAgIGlmICh0eXBlb2YgaW5zID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShpbnMpICYmIGRlZikge1xuICAgICAgICB2YXIgYyA9IHV0aWwuc3VidHJhY3QoaW5zLCBkZWYpO1xuICAgICAgICBpZiAoIWlzRW1wdHkoYykpXG4gICAgICAgICAgY2hhbmdlc1twcm9wXSA9IGM7XG4gICAgICB9IGVsc2UgaWYgKCFBcnJheS5pc0FycmF5KGlucykgfHwgaW5zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY2hhbmdlc1twcm9wXSA9IGlucztcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNoYW5nZXM7XG59O1xuXG51dGlsLm1lcmdlID0gZnVuY3Rpb24oLypkZXN0Kiwgc3JjMCwgc3JjMSwgLi4uKi8pe1xuICB2YXIgZGVzdCA9IGFyZ3VtZW50c1swXTtcbiAgZm9yICh2YXIgaT0xIDsgaTxhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICBkZXN0ID0gbWVyZ2UoZGVzdCwgYXJndW1lbnRzW2ldKTtcbiAgfVxuICByZXR1cm4gZGVzdDtcbn07XG5cbi8vIHJlY3Vyc2l2ZWx5IG1lcmdlcyBzcmMgaW50byBkZXN0XG5mdW5jdGlvbiBtZXJnZShkZXN0LCBzcmMpIHtcbiAgaWYgKHR5cGVvZiBzcmMgIT09ICdvYmplY3QnIHx8IHNyYyA9PT0gbnVsbCkge1xuICAgIHJldHVybiBkZXN0O1xuICB9XG5cbiAgZm9yICh2YXIgcCBpbiBzcmMpIHtcbiAgICBpZiAoIXNyYy5oYXNPd25Qcm9wZXJ0eShwKSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmIChzcmNbcF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygc3JjW3BdICE9PSAnb2JqZWN0JyB8fCBzcmNbcF0gPT09IG51bGwpIHtcbiAgICAgIGRlc3RbcF0gPSBzcmNbcF07XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGVzdFtwXSAhPT0gJ29iamVjdCcgfHwgZGVzdFtwXSA9PT0gbnVsbCkge1xuICAgICAgZGVzdFtwXSA9IG1lcmdlKHNyY1twXS5jb25zdHJ1Y3RvciA9PT0gQXJyYXkgPyBbXSA6IHt9LCBzcmNbcF0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBtZXJnZShkZXN0W3BdLCBzcmNbcF0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGVzdDtcbn0iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlsID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxudXRpbC5rZXlzID0gZnVuY3Rpb24ob2JqKSB7XG4gIHZhciBrID0gW10sIHg7XG4gIGZvciAoeCBpbiBvYmopIGsucHVzaCh4KTtcbiAgcmV0dXJuIGs7XG59O1xuXG51dGlsLnZhbHMgPSBmdW5jdGlvbihvYmopIHtcbiAgdmFyIHYgPSBbXSwgeDtcbiAgZm9yICh4IGluIG9iaikgdi5wdXNoKG9ialt4XSk7XG4gIHJldHVybiB2O1xufTtcblxudXRpbC5yYW5nZSA9IGZ1bmN0aW9uKHN0YXJ0LCBzdG9wLCBzdGVwKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMykge1xuICAgIHN0ZXAgPSAxO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgICAgc3RvcCA9IHN0YXJ0O1xuICAgICAgc3RhcnQgPSAwO1xuICAgIH1cbiAgfVxuICBpZiAoKHN0b3AgLSBzdGFydCkgLyBzdGVwID09IEluZmluaXR5KSB0aHJvdyBuZXcgRXJyb3IoJ2luZmluaXRlIHJhbmdlJyk7XG4gIHZhciByYW5nZSA9IFtdLCBpID0gLTEsIGo7XG4gIGlmIChzdGVwIDwgMCkgd2hpbGUgKChqID0gc3RhcnQgKyBzdGVwICogKytpKSA+IHN0b3ApIHJhbmdlLnB1c2goaik7XG4gIGVsc2Ugd2hpbGUgKChqID0gc3RhcnQgKyBzdGVwICogKytpKSA8IHN0b3ApIHJhbmdlLnB1c2goaik7XG4gIHJldHVybiByYW5nZTtcbn07XG5cbnV0aWwuZmluZCA9IGZ1bmN0aW9uKGxpc3QsIHBhdHRlcm4pIHtcbiAgdmFyIGwgPSBsaXN0LmZpbHRlcihmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHhbcGF0dGVybi5uYW1lXSA9PT0gcGF0dGVybi52YWx1ZTtcbiAgfSk7XG4gIHJldHVybiBsLmxlbmd0aCAmJiBsWzBdIHx8IG51bGw7XG59O1xuXG51dGlsLmlzaW4gPSBmdW5jdGlvbihpdGVtLCBhcnJheSkge1xuICByZXR1cm4gYXJyYXkuaW5kZXhPZihpdGVtKSAhPT0gLTE7XG59O1xuXG51dGlsLnVuaXEgPSBmdW5jdGlvbihkYXRhLCBmaWVsZCkge1xuICB2YXIgbWFwID0ge30sIGNvdW50ID0gMCwgaSwgaztcbiAgZm9yIChpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyArK2kpIHtcbiAgICBrID0gZGF0YVtpXVtmaWVsZF07XG4gICAgaWYgKCFtYXBba10pIHtcbiAgICAgIG1hcFtrXSA9IDE7XG4gICAgICBjb3VudCArPSAxO1xuICAgIH1cbiAgfVxuICByZXR1cm4gY291bnQ7XG59O1xuXG52YXIgaXNOdW1iZXIgPSBmdW5jdGlvbihuKSB7XG4gIHJldHVybiAhaXNOYU4ocGFyc2VGbG9hdChuKSkgJiYgaXNGaW5pdGUobik7XG59O1xuXG51dGlsLm51bWJlcnMgPSBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgdmFyIG51bXMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB2YWx1ZXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoaXNOdW1iZXIodmFsdWVzW2ldKSkge1xuICAgICAgbnVtcy5wdXNoKCt2YWx1ZXNbaV0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVtcztcbn07XG5cbnV0aWwubWVkaWFuID0gZnVuY3Rpb24odmFsdWVzKSB7XG4gIHZhbHVlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtyZXR1cm4gYSAtIGI7fSk7XG4gIHZhciBoYWxmID0gTWF0aC5mbG9vcih2YWx1ZXMubGVuZ3RoLzIpO1xuICBpZiAodmFsdWVzLmxlbmd0aCAlIDIpIHtcbiAgICByZXR1cm4gdmFsdWVzW2hhbGZdO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAodmFsdWVzW2hhbGYtMV0gKyB2YWx1ZXNbaGFsZl0pIC8gMi4wO1xuICB9XG59O1xuXG51dGlsLm1lYW4gPSBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgcmV0dXJuIHZhbHVlcy5yZWR1Y2UoZnVuY3Rpb24odiwgcikge3JldHVybiB2ICsgcjt9LCAwKSAvIHZhbHVlcy5sZW5ndGg7XG59O1xuXG51dGlsLnZhcmlhbmNlID0gZnVuY3Rpb24odmFsdWVzKSB7XG4gIHZhciBhdmcgPSB1dGlsLm1lYW4odmFsdWVzKTtcbiAgdmFyIGRpZmZzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgZGlmZnMucHVzaChNYXRoLnBvdygodmFsdWVzW2ldIC0gYXZnKSwgMikpO1xuICB9XG4gIHJldHVybiB1dGlsLm1lYW4oZGlmZnMpO1xufTtcblxudXRpbC5zdGRldiA9IGZ1bmN0aW9uKHZhbHVlcykge1xuICByZXR1cm4gTWF0aC5zcXJ0KHV0aWwudmFyaWFuY2UodmFsdWVzKSk7XG59O1xuXG51dGlsLnNrZXcgPSBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgdmFyIGF2ZyA9IHV0aWwubWVhbih2YWx1ZXMpLFxuICAgIG1lZCA9IHV0aWwubWVkaWFuKHZhbHVlcyksXG4gICAgc3RkID0gdXRpbC5zdGRldih2YWx1ZXMpO1xuICByZXR1cm4gMS4wICogKGF2ZyAtIG1lZCkgLyBzdGQ7XG59O1xuXG51dGlsLm1pbm1heCA9IGZ1bmN0aW9uKGRhdGEsIGZpZWxkLCBleGNsdWRlTnVsbHMpIHtcbiAgZXhjbHVkZU51bGxzID0gZXhjbHVkZU51bGxzID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IGV4Y2x1ZGVOdWxscztcbiAgdmFyIHN0YXRzID0ge21pbjogK0luZmluaXR5LCBtYXg6IC1JbmZpbml0eX07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7ICsraSkge1xuICAgIHZhciB2ID0gZGF0YVtpXVtmaWVsZF07XG4gICAgaWYgKGV4Y2x1ZGVOdWxscyAmJiB2ID09PSBudWxsKVxuICAgICAgY29udGludWU7XG4gICAgaWYgKHYgPiBzdGF0cy5tYXgpIHN0YXRzLm1heCA9IHY7XG4gICAgaWYgKHYgPCBzdGF0cy5taW4pIHN0YXRzLm1pbiA9IHY7XG4gIH1cbiAgcmV0dXJuIHN0YXRzO1xufTtcblxudXRpbC5kdXBsaWNhdGUgPSBmdW5jdGlvbihvYmopIHtcbiAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob2JqKSk7XG59O1xuXG51dGlsLmlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uKG9iaikge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbChvYmopID09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG51dGlsLmFycmF5ID0gZnVuY3Rpb24oeCkge1xuICByZXR1cm4geCA/ICh1dGlsLmlzQXJyYXkoeCkgPyB4IDogW3hdKSA6IFtdO1xufTtcblxudXRpbC5mb3JFYWNoID0gZnVuY3Rpb24ob2JqLCBmLCB0aGlzQXJnKSB7XG4gIGlmIChvYmouZm9yRWFjaCkge1xuICAgIG9iai5mb3JFYWNoLmNhbGwodGhpc0FyZywgZik7XG4gIH0gZWxzZSB7XG4gICAgZm9yICh2YXIgayBpbiBvYmopIHtcbiAgICAgIGYuY2FsbCh0aGlzQXJnLCBvYmpba10sIGsgLCBvYmopO1xuICAgIH1cbiAgfVxufTtcblxudXRpbC5yZWR1Y2UgPSBmdW5jdGlvbihvYmosIGYsIGluaXQsIHRoaXNBcmcpIHtcbiAgaWYgKG9iai5yZWR1Y2UpIHtcbiAgICByZXR1cm4gb2JqLnJlZHVjZS5jYWxsKHRoaXNBcmcsIGYsIGluaXQpO1xuICB9IGVsc2Uge1xuICAgIGZvciAodmFyIGsgaW4gb2JqKSB7XG4gICAgICBpbml0ID0gZi5jYWxsKHRoaXNBcmcsIGluaXQsIG9ialtrXSwgaywgb2JqKTtcbiAgICB9XG4gICAgcmV0dXJuIGluaXQ7XG4gIH1cbn07XG5cbnV0aWwubWFwID0gZnVuY3Rpb24ob2JqLCBmLCB0aGlzQXJnKSB7XG4gIGlmIChvYmoubWFwKSB7XG4gICAgcmV0dXJuIG9iai5tYXAuY2FsbCh0aGlzQXJnLCBmKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgb3V0cHV0ID0gW107XG4gICAgZm9yICh2YXIgayBpbiBvYmopIHtcbiAgICAgIG91dHB1dC5wdXNoKCBmLmNhbGwodGhpc0FyZywgb2JqW2tdLCBrLCBvYmopKTtcbiAgICB9XG4gIH1cbn07XG5cbnV0aWwuYW55ID0gZnVuY3Rpb24oYXJyLCBmKSB7XG4gIHZhciBpID0gMCwgaztcbiAgZm9yIChrIGluIGFycikge1xuICAgIGlmIChmKGFycltrXSwgaywgaSsrKSkgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxudXRpbC5hbGwgPSBmdW5jdGlvbihhcnIsIGYpIHtcbiAgdmFyIGkgPSAwLCBrO1xuICBmb3IgKGsgaW4gYXJyKSB7XG4gICAgaWYgKCFmKGFycltrXSwgaywgaSsrKSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufTtcblxuXG51dGlsLmNtcCA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgaWYgKGEgPCBiKSB7XG4gICAgcmV0dXJuIC0xO1xuICB9IGVsc2UgaWYgKGEgPiBiKSB7XG4gICAgcmV0dXJuIDE7XG4gIH0gZWxzZSBpZiAoYSA+PSBiKSB7XG4gICAgcmV0dXJuIDA7XG4gIH0gZWxzZSBpZiAoYSA9PT0gbnVsbCAmJiBiID09PSBudWxsKSB7XG4gICAgcmV0dXJuIDA7XG4gIH0gZWxzZSBpZiAoYSA9PT0gbnVsbCkge1xuICAgIHJldHVybiAtMTtcbiAgfSBlbHNlIGlmIChiID09PSBudWxsKSB7XG4gICAgcmV0dXJuIDE7XG4gIH1cbiAgcmV0dXJuIE5hTjtcbn07XG5cbnZhciBtZXJnZSA9IGZ1bmN0aW9uKGRlc3QsIHNyYykge1xuICByZXR1cm4gdXRpbC5rZXlzKHNyYykucmVkdWNlKGZ1bmN0aW9uKGMsIGspIHtcbiAgICBjW2tdID0gc3JjW2tdO1xuICAgIHJldHVybiBjO1xuICB9LCBkZXN0KTtcbn07XG5cbnV0aWwubWVyZ2UgPSBmdW5jdGlvbigvKmRlc3QqLCBzcmMwLCBzcmMxLCAuLi4qLyl7XG4gIHZhciBkZXN0ID0gYXJndW1lbnRzWzBdO1xuICBmb3IgKHZhciBpPTEgOyBpPGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIGRlc3QgPSBtZXJnZShkZXN0LCBhcmd1bWVudHNbaV0pO1xuICB9XG4gIHJldHVybiBkZXN0O1xufTtcblxudXRpbC5nZXRiaW5zID0gZnVuY3Rpb24oc3RhdHMsIG1heGJpbnMpIHtcbiAgcmV0dXJuIHV0aWwuYmlucyh7XG4gICAgbWluOiBzdGF0cy5taW4sXG4gICAgbWF4OiBzdGF0cy5tYXgsXG4gICAgbWF4YmluczogbWF4Ymluc1xuICB9KTtcbn07XG5cblxudXRpbC5iaW5zID0gZnVuY3Rpb24ob3B0KSB7XG4gIG9wdCA9IG9wdCB8fCB7fTtcblxuICAvLyBkZXRlcm1pbmUgcmFuZ2VcbiAgdmFyIG1heGIgPSBvcHQubWF4YmlucyB8fCAxMDI0LFxuICAgICAgYmFzZSA9IG9wdC5iYXNlIHx8IDEwLFxuICAgICAgZGl2ID0gb3B0LmRpdiB8fCBbNSwgMl0sXG4gICAgICBtaW5zID0gb3B0Lm1pbnN0ZXAgfHwgMCxcbiAgICAgIGxvZ2IgPSBNYXRoLmxvZyhiYXNlKSxcbiAgICAgIGxldmVsID0gTWF0aC5jZWlsKE1hdGgubG9nKG1heGIpIC8gbG9nYiksXG4gICAgICBtaW4gPSBvcHQubWluLFxuICAgICAgbWF4ID0gb3B0Lm1heCxcbiAgICAgIHNwYW4gPSBtYXggLSBtaW4sXG4gICAgICBzdGVwID0gTWF0aC5tYXgobWlucywgTWF0aC5wb3coYmFzZSwgTWF0aC5yb3VuZChNYXRoLmxvZyhzcGFuKSAvIGxvZ2IpIC0gbGV2ZWwpKSxcbiAgICAgIG5iaW5zID0gTWF0aC5jZWlsKHNwYW4gLyBzdGVwKSxcbiAgICAgIHByZWNpc2lvbiwgdiwgaSwgZXBzO1xuXG4gIGlmIChvcHQuc3RlcCkge1xuICAgIHN0ZXAgPSBvcHQuc3RlcDtcbiAgfSBlbHNlIGlmIChvcHQuc3RlcHMpIHtcbiAgICAvLyBpZiBwcm92aWRlZCwgbGltaXQgY2hvaWNlIHRvIGFjY2VwdGFibGUgc3RlcCBzaXplc1xuICAgIHN0ZXAgPSBvcHQuc3RlcHNbTWF0aC5taW4oXG4gICAgICAgIG9wdC5zdGVwcy5sZW5ndGggLSAxLFxuICAgICAgICB1dGlsX2Jpc2VjdExlZnQob3B0LnN0ZXBzLCBzcGFuIC8gbWF4YiwgMCwgb3B0LnN0ZXBzLmxlbmd0aClcbiAgICApXTtcbiAgfSBlbHNlIHtcbiAgICAvLyBpbmNyZWFzZSBzdGVwIHNpemUgaWYgdG9vIG1hbnkgYmluc1xuICAgIGRvIHtcbiAgICAgIHN0ZXAgKj0gYmFzZTtcbiAgICAgIG5iaW5zID0gTWF0aC5jZWlsKHNwYW4gLyBzdGVwKTtcbiAgICB9IHdoaWxlIChuYmlucyA+IG1heGIpO1xuXG4gICAgLy8gZGVjcmVhc2Ugc3RlcCBzaXplIGlmIGFsbG93ZWRcbiAgICBmb3IgKGkgPSAwOyBpIDwgZGl2Lmxlbmd0aDsgKytpKSB7XG4gICAgICB2ID0gc3RlcCAvIGRpdltpXTtcbiAgICAgIGlmICh2ID49IG1pbnMgJiYgc3BhbiAvIHYgPD0gbWF4Yikge1xuICAgICAgICBzdGVwID0gdjtcbiAgICAgICAgbmJpbnMgPSBNYXRoLmNlaWwoc3BhbiAvIHN0ZXApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIHVwZGF0ZSBwcmVjaXNpb24sIG1pbiBhbmQgbWF4XG4gIHYgPSBNYXRoLmxvZyhzdGVwKTtcbiAgcHJlY2lzaW9uID0gdiA+PSAwID8gMCA6IH5+KC12IC8gbG9nYikgKyAxO1xuICBlcHMgPSAobWluPDAgPyAtMSA6IDEpICogTWF0aC5wb3coYmFzZSwgLXByZWNpc2lvbiAtIDEpO1xuICBtaW4gPSBNYXRoLm1pbihtaW4sIE1hdGguZmxvb3IobWluIC8gc3RlcCArIGVwcykgKiBzdGVwKTtcbiAgbWF4ID0gTWF0aC5jZWlsKG1heCAvIHN0ZXApICogc3RlcDtcblxuICByZXR1cm4ge1xuICAgIHN0YXJ0OiBtaW4sXG4gICAgc3RvcDogbWF4LFxuICAgIHN0ZXA6IHN0ZXAsXG4gICAgdW5pdDogcHJlY2lzaW9uXG4gIH07XG59O1xuXG5mdW5jdGlvbiB1dGlsX2Jpc2VjdExlZnQoYSwgeCwgbG8sIGhpKSB7XG4gIHdoaWxlIChsbyA8IGhpKSB7XG4gICAgdmFyIG1pZCA9IGxvICsgaGkgPj4+IDE7XG4gICAgaWYgKHV0aWwuY21wKGFbbWlkXSwgeCkgPCAwKSB7IGxvID0gbWlkICsgMTsgfVxuICAgIGVsc2UgeyBoaSA9IG1pZDsgfVxuICB9XG4gIHJldHVybiBsbztcbn1cblxuLyoqXG4gKiB4W3BbMF1dLi4uW3Bbbl1dID0gdmFsXG4gKiBAcGFyYW0gbm9hdWdtZW50IGRldGVybWluZSB3aGV0aGVyIG5ldyBvYmplY3Qgc2hvdWxkIGJlIGFkZGVkIGZcbiAqIG9yIG5vbi1leGlzdGluZyBwcm9wZXJ0aWVzIGFsb25nIHRoZSBwYXRoXG4gKi9cbnV0aWwuc2V0dGVyID0gZnVuY3Rpb24oeCwgcCwgdmFsLCBub2F1Z21lbnQpIHtcbiAgZm9yICh2YXIgaT0wOyBpPHAubGVuZ3RoLTE7ICsraSkge1xuICAgIGlmICghbm9hdWdtZW50ICYmICEocFtpXSBpbiB4KSl7XG4gICAgICB4ID0geFtwW2ldXSA9IHt9O1xuICAgIH0gZWxzZSB7XG4gICAgICB4ID0geFtwW2ldXTtcbiAgICB9XG4gIH1cbiAgeFtwW2ldXSA9IHZhbDtcbn07XG5cblxuLyoqXG4gKiByZXR1cm5zIHhbcFswXV0uLi5bcFtuXV1cbiAqIEBwYXJhbSBhdWdtZW50IGRldGVybWluZSB3aGV0aGVyIG5ldyBvYmplY3Qgc2hvdWxkIGJlIGFkZGVkIGZcbiAqIG9yIG5vbi1leGlzdGluZyBwcm9wZXJ0aWVzIGFsb25nIHRoZSBwYXRoXG4gKi9cbnV0aWwuZ2V0dGVyID0gZnVuY3Rpb24oeCwgcCwgbm9hdWdtZW50KSB7XG4gIGZvciAodmFyIGk9MDsgaTxwLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKCFub2F1Z21lbnQgJiYgIShwW2ldIGluIHgpKXtcbiAgICAgIHggPSB4W3BbaV1dID0ge307XG4gICAgfSBlbHNlIHtcbiAgICAgIHggPSB4W3BbaV1dO1xuICAgIH1cbiAgfVxuICByZXR1cm4geDtcbn07XG5cbnV0aWwudHJ1bmNhdGUgPSBmdW5jdGlvbihzLCBsZW5ndGgsIHBvcywgd29yZCwgZWxsaXBzaXMpIHtcbiAgdmFyIGxlbiA9IHMubGVuZ3RoO1xuICBpZiAobGVuIDw9IGxlbmd0aCkgcmV0dXJuIHM7XG4gIGVsbGlwc2lzID0gZWxsaXBzaXMgfHwgXCIuLi5cIjtcbiAgdmFyIGwgPSBNYXRoLm1heCgwLCBsZW5ndGggLSBlbGxpcHNpcy5sZW5ndGgpO1xuXG4gIHN3aXRjaCAocG9zKSB7XG4gICAgY2FzZSBcImxlZnRcIjpcbiAgICAgIHJldHVybiBlbGxpcHNpcyArICh3b3JkID8gdmdfdHJ1bmNhdGVPbldvcmQocyxsLDEpIDogcy5zbGljZShsZW4tbCkpO1xuICAgIGNhc2UgXCJtaWRkbGVcIjpcbiAgICBjYXNlIFwiY2VudGVyXCI6XG4gICAgICB2YXIgbDEgPSBNYXRoLmNlaWwobC8yKSwgbDIgPSBNYXRoLmZsb29yKGwvMik7XG4gICAgICByZXR1cm4gKHdvcmQgPyB2Z190cnVuY2F0ZU9uV29yZChzLGwxKSA6IHMuc2xpY2UoMCxsMSkpICsgZWxsaXBzaXMgK1xuICAgICAgICAod29yZCA/IHZnX3RydW5jYXRlT25Xb3JkKHMsbDIsMSkgOiBzLnNsaWNlKGxlbi1sMikpO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gKHdvcmQgPyB2Z190cnVuY2F0ZU9uV29yZChzLGwpIDogcy5zbGljZSgwLGwpKSArIGVsbGlwc2lzO1xuICB9XG59O1xuXG5mdW5jdGlvbiB2Z190cnVuY2F0ZU9uV29yZChzLCBsZW4sIHJldikge1xuICB2YXIgY250ID0gMCwgdG9rID0gcy5zcGxpdCh2Z190cnVuY2F0ZV93b3JkX3JlKTtcbiAgaWYgKHJldikge1xuICAgIHMgPSAodG9rID0gdG9rLnJldmVyc2UoKSlcbiAgICAgIC5maWx0ZXIoZnVuY3Rpb24odykgeyBjbnQgKz0gdy5sZW5ndGg7IHJldHVybiBjbnQgPD0gbGVuOyB9KVxuICAgICAgLnJldmVyc2UoKTtcbiAgfSBlbHNlIHtcbiAgICBzID0gdG9rLmZpbHRlcihmdW5jdGlvbih3KSB7IGNudCArPSB3Lmxlbmd0aDsgcmV0dXJuIGNudCA8PSBsZW47IH0pO1xuICB9XG4gIHJldHVybiBzLmxlbmd0aCA/IHMuam9pbihcIlwiKS50cmltKCkgOiB0b2tbMF0uc2xpY2UoMCwgbGVuKTtcbn1cblxudmFyIHZnX3RydW5jYXRlX3dvcmRfcmUgPSAvKFtcXHUwMDA5XFx1MDAwQVxcdTAwMEJcXHUwMDBDXFx1MDAwRFxcdTAwMjBcXHUwMEEwXFx1MTY4MFxcdTE4MEVcXHUyMDAwXFx1MjAwMVxcdTIwMDJcXHUyMDAzXFx1MjAwNFxcdTIwMDVcXHUyMDA2XFx1MjAwN1xcdTIwMDhcXHUyMDA5XFx1MjAwQVxcdTIwMkZcXHUyMDVGXFx1MjAyOFxcdTIwMjlcXHUzMDAwXFx1RkVGRl0pLztcblxuXG51dGlsLmVycm9yID0gZnVuY3Rpb24obXNnKSB7XG4gIGNvbnNvbGUuZXJyb3IoJ1tWTCBFcnJvcl0nLCBtc2cpO1xufTtcblxuIl19
