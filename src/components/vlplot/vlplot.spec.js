// 'use strict';

describe('Directive: vlPlot', function() {

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
    scope.vlSpec = {
      marktype:'point',
      enc: {},
      config:{}
    };

  }));

  it('should attach visualization', inject(function($compile) {
    element = angular.element('<vl-plot vl-spec="{marktype:\'point\',enc: {}, config:{}}"></vl-plot>');
    element = $compile(element)(scope);
    scope.$digest();
    expect(element.find('div').length).toBe(1);
  }));
});
