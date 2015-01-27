'use strict';

describe('Directive: schemaList', function() {

  // load the directive's module
  beforeEach(module('vleApp'));

  var element,
    scope;

  beforeEach(module('vleApp', function($provide) {
    var mock = {
      dataschema: ['foo', 'bar', 'baz']
    };
    $provide.value('Dataset', mock);
  }));

  beforeEach(inject(function($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should have field', inject(function($compile) {
    element = angular.element('<schema-list></schema-list>');
    element = $compile(element)(scope);
    scope.$digest();

    expect(element.find('.field').length).toBe(3);
  }));
});
