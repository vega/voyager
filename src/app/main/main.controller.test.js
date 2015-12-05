'use strict';

describe('controllers', function() {
  var scope;

  beforeEach(module('polestar'));

  beforeEach(inject(function($rootScope) {
    scope = $rootScope.$new();
  }));
});
