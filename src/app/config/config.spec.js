'use strict';

describe('Service: Config', function() {

  var deferred, Config, scope;

  // load the service's module
  beforeEach(module('vleApp'));

  beforeEach(module('vleApp', function($provide) {
    $provide.constant('vl', vl); // vl is loaded by karma
  }));

  // instantiate service
  beforeEach(inject(function($rootScope, _Config_) {
    scope = $rootScope.$new();
    Config = _Config_;
  }));

  it('should have correct schema and config ', function() {
    var schema = vl.schema.schema.properties.cfg,
      config = vl.schema.util.instantiate(Config.schema);

    config.singleWidth = 500;
    config.singleHeight = 500;
    config.largeBandMaxCardinality = 20;

    expect(Config.schema).toEqual(schema);
    expect(Config.large()).toEqual(config);
  });

});
