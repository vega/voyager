'use strict';
/* global vl:true */

describe('Directive: datasetSelector', function() {

  // load the directive's module
  beforeEach(module('polestar', function($provide) {
    $provide.constant('Drop', function() {});
  }));

  var element,
    scope;

  beforeEach(module('polestar', function($provide) {
    var mockDataset = {
      datasets: [{name: 'foo'}, {name: 'bar'}],
      dataset: null,
      update: function() {}
    };
    mockDataset.dataset = mockDataset.datasets[0];

    $provide.value('Dataset', mockDataset);
    $provide.value('Config', {
      updateDataset: function() {}
    });
    $provide.value('Spec', {
      reset: function() {}
    });

    $provide.constant('vl', vl); // vl is loaded by karma
  }));

  beforeEach(inject(function($templateCache, $rootScope) {
    scope = $rootScope.$new();
  }));

  it('should add correct options', inject(function($compile) {
    element = angular.element('<dataset-selector></dataset-selector>');
    element = $compile(element)(scope);
    scope.$digest();

    expect(element.find('option').length).toBe(3);
    expect(element.find('option:first').attr('label')).toBe(undefined);
    expect(element.find('option:nth-child(2)').attr('label')).toBe('foo');
    expect(element.find('option:nth-child(3)').attr('label')).toBe('bar');
  }));
});
