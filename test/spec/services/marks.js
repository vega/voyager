'use strict';

describe('Service: Marks', function () {

  // load the service's module
  beforeEach(module('vleApp'));

  // instantiate service
  var marks;
  beforeEach(inject(function (_Marks_) {
    marks = _Marks_;
  }));

  it('should have x as first mark', function () {
    expect(marks.length).toBeGreaterThan(1);
    expect(marks[0].name).toBe('x');
  });
});
