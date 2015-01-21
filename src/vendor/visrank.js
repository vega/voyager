(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['vegalite'], factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(
      require('vegalite')
    );
  } else {
    // Browser globals (root is window)
    root.visrank = factory(root.vl);
  }
}(this, function (vl) {
  var vrank = {};

  //TODO lower score if we use G as O?
  var ENCODING_SCORE = {
    Q: {
      x: 1,
      y: 1,
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

  vrank.encodingScore = function(encoding){
    var features = {},
      encTypes = vl.keys(encoding.enc);
    encTypes.forEach(function(encType){
      var field = encoding.enc[encType];
      features[field.name] = {
        value: field.type+":"+encType,
        score: ENCODING_SCORE[field.type][encType] || BAD_ENCODING_SCORE
      };
    });

    // penalize not using positional
    if(encTypes.length > 1){
      if((!encoding.enc.x || !encoding.enc.y) && !encoding.enc.geo) {
        features.unusedPosition = {score: UNUSED_POSITION};
      }
    }

    features.markType = {
      value: encoding.marktype,
      score: MARK_SCORE[encoding.marktype]
    }

    return {
      score: vl.keys(features).reduce(function(p, s){ return p * features[s].score}, 1),
      features: features
    };
  };


  // raw > avg, sum > min,max > bin

  vrank.fieldsScore = function(fields){

  };


  return vrank;
}));