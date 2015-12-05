'use strict';

describe('Directive: propertyEditor', function() {

  // load the directive's module
  beforeEach(module('polestar'));

  var element,
    scope;

  beforeEach(inject(function($rootScope) {
    scope = $rootScope.$new();

    scope.id = 'foo';
    scope.type = 'boolean';
    scope.field = 'bar';
    scope.enum = undefined;
    scope.group = {
      bar: 'value'
    };
  }));

  it('should make hidden element visible', inject(function($compile) {
    element = angular.element('<property-editor id="id" type="type" prop-name="name" group="group"></property-editor>');
    element = $compile(element)(scope);
    scope.$digest();

    expect(element.find('#foo').length).to.eql(1);
  }));
});
