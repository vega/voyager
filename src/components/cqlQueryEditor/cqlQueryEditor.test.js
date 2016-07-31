'use strict';

/* global vl:true */

describe('Directive: cqlQueryEditor', function() {
  // load the directive's module
  beforeEach(module('voyager2'));

  beforeEach(module('voyager2', function($provide) {
    $provide.constant('vl', vl); // vl is loaded by karma

    $provide.value('Spec', {cleanQuery: {}});

    // mock directive (trodrigues's answer in http://stackoverflow.com/questions/17533052)
    $provide.factory('uiZeroclipDirective', function() {return {};});
  }));

  var element,
    scope;

  beforeEach(inject(function($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should show source code', inject(function($compile) {
    element = angular.element('<cql-query-editor></cql-query-editor>');
    element = $compile(element)(scope);
    scope.$digest();

    expect(element.find('.cqlquery').val()).to.eql('{}');
  }));
});
