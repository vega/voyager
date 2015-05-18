'use strict';

/* global vl:true */

describe('Directive: vlPlotGroup', function () {

  // load the directive's module
  beforeEach(module('polestar'));

  var element,
    scope;


  beforeEach(module('polestar', function($provide) {
    // mock vega
    $provide.constant('vg', {
      parse: {
        spec: function(spec, callback) {
          callback(function(opt) {
            // jshint unused:false
            element.append('<div></div>');
            return {
              width: function() {},
              height: function() {},
              update: function() {},
              renderer: function() {},
              on: function() {}
            };
          });
        }
      }
    });
    $provide.constant('vl', vl);
  }));

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
    scope.showExpand = true;
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<vl-plot-group chart="{vlSpec:{marktype:\'point\',enc: {}, config:{}}}"></vl-plot-group>');
    element = $compile(element)(scope);
    scope.$digest();
    expect(element.find('.vl-plot-wrapper').length).toBe(1);
  }));
});
