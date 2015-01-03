'use strict';

describe('Service: Config', function () {

  var deferred, config, scope;

  // load the service's module
  beforeEach(module('vleApp'));


  beforeEach(module('vleApp', function ($provide) {
    $provide.factory('VegaliteSpecSchema', function($q) {
      return {
        getSchema: function() {
          console.log("defer", $q)
          deferred = $q.defer();
          return deferred.promise;
        },
        instanceFromSchema: function() {
          return 'OK'
        }
      };
    });
  }));

  // instantiate service
  beforeEach(inject(function ($rootScope, _Config_) {
    scope = $rootScope.$new();
    config = _Config_;
  }));

  it('should have useVegaServer property', function () {
    deferred.resolve({properties: {cfg: {}}});
    scope.$digest();

    expect(config.config).toBe('OK');
  });

});
