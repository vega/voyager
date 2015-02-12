'use strict';

describe('Service: Bookmarks', function () {

  // load the service's module
  beforeEach(module('vleApp'));

  // instantiate service
  var Bookmarks;
  beforeEach(inject(function (_Bookmarks_) {
    Bookmarks = _Bookmarks_;
  }));

  it('should start with empty list', function () {
    expect(Bookmarks.list.length).toBe(0);
  });

});