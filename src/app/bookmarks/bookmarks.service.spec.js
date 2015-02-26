'use strict';

describe('Service: Bookmarks', function () {

  // load the service's module
  beforeEach(module('vleApp'));

  // instantiate service
  var Bookmarks;
  beforeEach(inject(function (_Bookmarks_) {
    Bookmarks = _Bookmarks_;
  }));

  it('should do something', function () {
    expect(Bookmarks).toBe(true);
  });

});