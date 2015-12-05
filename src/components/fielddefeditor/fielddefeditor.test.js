'use strict';

/* global vl:true */

describe('Directive: fieldDefEditor', function() {

  // load the directive's module
  beforeEach(module('polestar', function($provide) {
    $provide.constant('vl', vl);
    $provide.constant('Drop', function() {});
  }));

  var element, scope, $compile;

  beforeEach(module('polestar', function($provide) {
    $provide.constant('Dataset', {
      stats: {
        a: {}
      },
      onUpdate: []
    });
  }));

  beforeEach(inject(function($rootScope, _$compile_) {
    scope = $rootScope.$new();
    scope.channel = 'x';
    scope.encoding = {'x': {}};

    $compile = _$compile_;
  }));

  it('should show title', function() {
    element = angular.element('<field-def-editor channel="channel" encoding="encoding" schema="{properties:{}}"></field-def-editor>');
    element = $compile(element)(scope);
    scope.$digest();

    expect(element.find('.shelf-label').text().trim()).to.eql('x');
  });

  describe('fieldDrop', function() {
    it('should initially have placeholder', function() {
      element = angular.element('<field-def-editor channel="channel" encoding="encoding" schema="schema"></field-def-editor>');
      element = $compile(element)(scope);
      scope.$digest();
      expect(element.find('.placeholder').length).to.eql(1);
    });

    it('should show correct field name when dropped', function() {
      // jshint unused:false
      //TODO
    });
  });

  describe('shelfProperties', function() {
    it('should change properties correctly', function() {
      // jshint unused:false
      //TODO
    });
  });

  describe('shelfFunctions', function() {
    it('should change function correctly', function() {
      // jshint unused:false
      //TODO
    });
  });
});
