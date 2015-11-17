'use strict';

describe('controllers', function(){
  var scope;

  beforeEach(module('voyager'));

  beforeEach(inject(function($rootScope) {
    scope = $rootScope.$new();
  }));
});
