'use strict';
/* global vl:true */

describe('Service: Config', function() {

  var Config, scope;

  // load the service's module
  beforeEach(module('polestar'));

  beforeEach(module('polestar', function($provide) {
    $provide.constant('vl', vl); // vl is loaded by karma
  }));

  // instantiate service
  beforeEach(inject(function($rootScope, _Config_) {
    scope = $rootScope.$new();
    Config = _Config_;
  }));

  it('should have correct schema and config ', function() {
    var schema = vl.schema.schema.properties.config,
      config = {
        singleWidth: 400,
        singleHeight: 400,
        largeBandMaxCardinality: 20
      };

    expect(Config.schema).toEqual(schema);
    expect(Config.large()).toEqual(config);
  });

});
