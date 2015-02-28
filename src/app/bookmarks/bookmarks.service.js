'use strict';

/**
 * @ngdoc service
 * @name vleApp.Bookmarks
 * @description
 * # Bookmarks
 * Service in the vleApp.
 */
angular.module('vleApp')
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

    proto.toggle = function(chart) {
      var shorthand = chart.shorthand;

      if (this.dict[shorthand]) {
        this.remove(chart);
      } else {
        this.add(chart);
      }
    };

    proto.add = function(chart) {
      var shorthand = chart.shorthand;

      console.log('adding', chart.vlSpec, shorthand);

      this.dict[shorthand] = chart;
      this.list.push(shorthand);
    };

    proto.remove = function(chart) {
      var shorthand = chart.shorthand;

      console.log('removing', chart.vlSpec, shorthand);

      delete this.dict[shorthand];
      _.remove(this.list, function(item){
        return item === shorthand;
      });
    };

    proto.isBookmarked = function(shorthand) {
      return shorthand in this.dict;
    };

    return new Bookmarks();
  });
