'use strict';

describe('Directive: bookmarkList', function () {

  // load the directive's module
  beforeEach(module('vleApp'));

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

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
    scope.active = true;
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<bookmark-list></bookmark-list>');
    element = $compile(element)(scope);
    scope.$digest();
    expect(element.find('.wrapper').length).toBe(1);
  }));
});