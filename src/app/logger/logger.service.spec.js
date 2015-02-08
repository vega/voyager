'use strict';

describe('Service: Logger', function () {

  // load the service's module
  beforeEach(module('vegalite-ui'));

  // instantiate service
  var logger;
  beforeEach(inject(function (_Logger_) {
    logger = _Logger_;
  }));

  it('should have log function', function () {
    expect(logger.logInteraction).toBeDefined;
  });

});