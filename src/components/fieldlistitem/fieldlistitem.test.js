'use strict';

describe('Directive: fieldListItem', function() {

  // load the directive's module
  beforeEach(module('voyager'));

  var element, scope, $compile;

  beforeEach(module('voyager', function($provide) {
    var mock = {
      schema: ['foo', 'bar', 'baz'],
      stats: {
        a: {}
      },
      onUpdate: []
    };
    $provide.value('Dataset', mock);
  }));


  beforeEach(inject(function ($rootScope, _$compile_) {
    scope = $rootScope.$new();
    scope.fieldDef = {
      selected: false,
      field: 'a'
    };

    $compile = _$compile_;
  }));

  it('should make hidden element visible', function() {
    element = angular.element('<field-list-item field-def="fieldDef"></field-list-item>');
    element = $compile(element)(scope);
    scope.$digest();

    expect(element.find('.field-info').length).to.eql(1);
  });
});
