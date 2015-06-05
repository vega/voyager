'use strict';

describe('Directive: jsonInput', function() {

  // load the directive's module
  beforeEach(module('polestar'));

  var element,
    scope;

  beforeEach(inject(function($rootScope) {
    scope = $rootScope.$new();
    scope.foo = {foo: 'bar'};
  }));

  it('should make hidden element visible', inject(function($compile) {
    element = angular.element('<textarea json-input ng-model="foo"></textarea>');
    element = $compile(element)(scope);
    scope.$digest();

    expect(element.val()).to.eql('{"foo": "bar"}');
  }));
});
