'use strict';

/* global vl:true */

describe('Directive: encodingVariations', function () {

  // load the directive's module
  beforeEach(module('voyager'));

  var element, scope, $compile;


  beforeEach(module('voyager', function($provide) {
    $provide.constant('vl', vl); // vl is loaded by karma

    var Visrec = {
      selectedCluster: null
    };
    $provide.value('Visrec', Visrec);
  }));

  beforeEach(inject(function ($rootScope, _$compile_) {
    scope = $rootScope.$new();
    $compile = _$compile_;
  }));

  it('should make hidden element visible', function () {
    element = angular.element('<encoding-variations></encoding-variations>');
    element = $compile(element)(scope);
    scope.$digest();

    expect(element.find('#encoding-variations').length).to.eql(1);
  });
});
