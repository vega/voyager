'use strict';

/* global vl:true */

describe('Directive: fieldList', function () {

  // load the directive's module
  beforeEach(module('voyager'));

  var element,
    scope;


  beforeEach(module('voyager', function($provide) {
    var mockDataschema = [{
      name: 'a',
      type: 'Q',
    }, {
      name: 'b',
      type: 'O',
    }];

    var mockDataset = {
      datasets: [{name: 'foo'}, {name: 'bar'}],
      dataset: null,
      fieldOrder: vl.field.order.typeThenName,
      dataschema: mockDataschema,
      update: function() {}
    };
    mockDataset.dataset = mockDataset.datasets[0];
    $provide.value('Dataset', mockDataset);

    $provide.constant('vl', vl); // vl is loaded by karma
  }));


  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<field-list></field-list>');
    element = $compile(element)(scope);
    scope.$digest();
    expect(element.find('.field').length).to.eql(2);
  }));
});