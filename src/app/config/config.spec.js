'use strict';

describe('Service: Config', function() {

  var deferred, Config, scope;

  // load the service's module
  beforeEach(module('vegalite-ui'));

  beforeEach(module('vegalite-ui', function($provide) {
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

    expect(Config.schema).toEqual(schema);
    expect(Config.config).toEqual(config);
  });

});
