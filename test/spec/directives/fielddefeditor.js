'use strict';

describe('Directive: fieldDefEditor', function () {

  // load the directive's module
  beforeEach(module('vleApp', 'templates'));

  var element,
    scope;

  beforeEach(module('vleApp', function ($provide) {
    $provide.value('Dataset', {});
  }));

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
    scope.encType = 'foobar';
    scope.fieldDef = {};
    scope.schema = {};
  }));

  it('should show title', inject(function ($compile) {
    element = angular.element('<field-def-editor enc-type="encType" field-def="fieldDef" schema="schema"></field-def-editor>');
    element = $compile(element)(scope);
    scope.$digest();

    expect(element.find('.shelf-label').text()).toBe('foobar');
  }));

  describe('fieldDrop', function(){
    it('should initially have placeholder', inject(function ($compile) {
      element = angular.element('<field-def-editor enc-type="encType" field-def="fieldDef" schema="schema"></field-def-editor>');
      element = $compile(element)(scope);
      scope.$digest();
      expect(element.find('.placeholder').length).toBe(1);
    }));

    it('should show correct field name when dropped', inject(function ($compile) {
      //TODO
    }));
  });

  describe('shelfProperties', function(){
    it('should change properties correctly', inject(function ($compile) {
      //TODO
    }));
  });

  describe('shelfFunctions', function(){
    it('should change function correctly', inject(function ($compile) {
      //TODO
    }));
  });
});
