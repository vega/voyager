'use strict';

describe('controllers', function() {
  var scope;

  beforeEach(module('voyager2'));

  beforeEach(inject(function($rootScope) {
    scope = $rootScope.$new();
  }));
});
