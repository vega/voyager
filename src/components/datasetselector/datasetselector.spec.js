'use strict';
/* global vl:true */
describe('Directive: datasetSelector', function() {

  // load the directive's module
  beforeEach(module('voyager'));

  var element, scope, $compile;

  beforeEach(module('voyager', function($provide) {
    var mockDataset = {
      datasets: [{name: 'foo'}, {name: 'bar'}],
      dataset: null,
      update: function(dataset) {
        // jshint unused:false
      }
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

  beforeEach(inject(function ($rootScope, _$compile_) {
    scope = $rootScope.$new();
    $compile = _$compile_;
  }));

  it('should make hidden element visible', function() {
    element = angular.element('<dataset-selector></dataset-selector>');
    element = $compile(element)(scope);
    scope.$digest();

    expect(element.find('option').length).to.eql(2);
    expect(element.find('option:first').attr('label')).to.eql('foo');
    expect(element.find('option:nth-child(2)').attr('label')).to.eql('bar');
  });
});
