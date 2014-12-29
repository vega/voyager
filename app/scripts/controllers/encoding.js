'use strict';

angular.module('vleApp')
  .controller('EncodingCtrl', function ($scope, Encoding) {
    $scope.encoding = Encoding;

    $scope.types = {
    	Q: {
    		name: "Quantitative"
    	},
    	O: {
    		name: "Ordinal"
    	},
    	T: {
    		name: "Time"
    	}
    }

    // TODO
    $scope.functions = {
    	Q: vl.quantAggTypes,
    	O: ['count', 'bin'],
    	T: ['count']
    }
  });
