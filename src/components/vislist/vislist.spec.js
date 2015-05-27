'use strict';

/* global vl:true */

describe('Directive: visList', function () {

  // load the directive's module
  beforeEach(module('voyager'));

  beforeEach(module('voyager', function($provide) {
    $provide.constant('vl', vl); // vl is loaded by karma
  }));

  var element, scope, $compile;

  beforeEach(inject(function ($rootScope, _$compile_) {
    scope = $rootScope.$new();
    $compile = _$compile_;
  }));

  it('should add vis list element', function () {
    element = angular.element('<vis-list></vis-list>');
    element = $compile(element)(scope);
    scope.$digest();
    expect(element.find('.vis-list').length).to.eql(1);
  });
});
