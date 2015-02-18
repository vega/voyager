'use strict';

/**
 * @ngdoc service
 * @name vegalite-ui.Bookmarks
 * @description
 * # Bookmarks
 * Service in the vegalite-ui.
 */
angular.module('vegalite-ui')
  .service('Bookmarks', function (_, vl) {
    var Bookmarks = function (){
      this.dict = {};
      this.list = [];
    };

    function toShorthand(spec) {
      // need to check if it's the initial point
      return spec.enc ? vl.Encoding.fromSpec(spec).toShorthand() : '';
    }

    var proto = Bookmarks.prototype;

    proto.toggle = function(vlSpec, shorthand) {
      shorthand = shorthand || toShorthand(vlSpec);

      if (this.dict[shorthand]) {
        this.remove(vlSpec, shorthand);
      } else {
        this.add(vlSpec, shorthand);
      }
    };

    proto.add = function(vlSpec) {
      var shorthand = _.isString(vlSpec) ? shorthand :  toShorthand(vlSpec);

      console.log('adding', vlSpec, shorthand);

      this.dict[shorthand] = vlSpec;
      this.list.push(shorthand);
    };

    proto.remove = function(vlSpec) {
      var shorthand = _.isString(vlSpec) ? shorthand :  toShorthand(vlSpec);

      console.log('removing', vlSpec, shorthand);

      delete this.dict[shorthand];
      _.remove(this.list, function(item){
        return item === shorthand;
      });
    };

    proto.isBookmarked = function(vlSpec) {
      var shorthand = _.isString(vlSpec) ? shorthand :  toShorthand(vlSpec);
      return shorthand in this.dict;
    };

    return new Bookmarks();
  });
