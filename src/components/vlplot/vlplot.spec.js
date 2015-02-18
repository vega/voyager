// 'use strict';

describe('Directive: vlPlot', function() {

  // load the directive's module
  beforeEach(module('vegalite-ui'));

  var element,
    scope;

  beforeEach(module('vegalite-ui', function($provide) {
    // mock vega
    $provide.constant('vg', {
      parse: {
        spec: function(spec, callback) {
          callback(function(opt) {
            element.find(opt.el).append('<div></div>');
            return {
              update: function() {},
              on: function() {}
            };
          });
        }
      }
    });
  }));

  beforeEach(inject(function($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should attach visualization', inject(function($compile) {
    element = angular.element('<vl-plot vg-spec="{}"></vl-plot>');
    element = $compile(element)(scope);
    scope.$digest();

    expect(element.find('.vis').length).toBe(1);
  }));
});
