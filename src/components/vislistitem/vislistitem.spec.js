'use strict';

describe('Directive: visListItem', function () {

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

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
    scope.showExpand = true;
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<vis-list-item></vis-list-item>');
    element = $compile(element)(scope);
    scope.$digest();
    expect(element.find('.vis-list-item').length).toBe(1);
  }));
});