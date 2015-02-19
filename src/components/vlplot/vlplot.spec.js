// 'use strict';

describe('Directive: vlPlot', function() {

  // load the directive's module
  beforeEach(module('vleApp'));

  var element,
    scope;

  beforeEach(module('vleApp', function($provide) {
    // mock vega
    $provide.constant('vg', {
      parse: {
        spec: function(spec, callback) {
          callback(function(opt) {
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

  beforeEach(inject(function($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should attach visualization', inject(function($compile) {
    element = angular.element('<vl-plot vg-spec="{}"></vl-plot>');
    element = $compile(element)(scope);
    scope.$digest();
    expect(element.find('div').length).toBe(1);
  }));
});
