'use strict';

describe('Directive: alertMessages', function () {

  // load the directive's module
  beforeEach(module('vleApp', 'templates'));

  var element,
    scope;

  beforeEach(module('vleApp', function ($provide) {
    var mock = {
      alerts: [
        {name: "foo"},
        {name: "bar"}
      ]
    }
    $provide.value('Alerts', mock);
  }));

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should show alert messages', inject(function ($compile) {
    element = angular.element('<alert-messages></alert-messages>');
    element = $compile(element)(scope);
    scope.$digest();

    expect(element.find('.alert-box').length).toBe(2);
  }));
});
