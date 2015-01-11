// 'use strict';

describe('Directive: vegalitePlot', function () {

  // load the directive's module
  beforeEach(module('vleApp', 'templates'));

  var element,
    scope;

  beforeEach(module('vleApp', function ($provide) {
    var mock = {
      vegaSpec: {},
      vlSpec: {},
      shorthand: 'foobar'
    }
    $provide.value('Vegalite', mock);
    $provide.value('VegaliteSpec', {});

    // need to mock global vega
    vg = {
      parse: {
        spec: function() {
          return {}
        }
      }
    }
  }));

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should attach visualization', inject(function ($compile) {
    element = angular.element('<vegalite-plot></vegalite-plot>');
    element = $compile(element)(scope);
    scope.$digest();

    expect(element.find('#vis').length).toBe(1);
  }));
});
