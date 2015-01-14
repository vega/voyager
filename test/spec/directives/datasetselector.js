'use strict';

describe('Directive: datasetSelector', function () {

  // load the directive's module
  beforeEach(module('vleApp', 'templates'));

  var element,
    scope;

  beforeEach(module('vleApp', function ($provide) {
    var mock = {
      datasets: [{name: 'foo'}, {name: 'bar'}],
      dataset: null,
      update: function(dataset) {}
    }
    mock.dataset = mock.datasets[0];
    $provide.value('Dataset', mock);
  }));

  beforeEach(inject(function ($templateCache, $rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<dataset-selector></dataset-selector>');
    element = $compile(element)(scope);
    scope.$digest();

    expect(element.find('option').length).toBe(2);
    expect(element.find('option:first').attr('label')).toBe('foo');
    expect(element.find('option:nth-child(2)').attr('label')).toBe('bar');
  }));
});
