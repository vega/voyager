'use strict';

describe('Directive: datasetSelector', function() {

  // load the directive's module
  beforeEach(module('vleApp'));

  var element,
    scope;

  beforeEach(module('vleApp', function($provide) {
    var mockDataset = {
      datasets: [{name: 'foo'}, {name: 'bar'}],
      dataset: null,
      update: function(dataset) {}
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

  it('should make hidden element visible', inject(function($compile) {
    element = angular.element('<dataset-selector></dataset-selector>');
    element = $compile(element)(scope);
    scope.$digest();

    expect(element.find('option').length).toBe(2);
    expect(element.find('option:first').attr('label')).toBe('foo');
    expect(element.find('option:nth-child(2)').attr('label')).toBe('bar');
  }));
});
