'use strict';

angular.module('vleApp')
	.controller('EncodingCtrl', function ($scope, Encoding, Dataset) {
		$scope.encoding = Encoding;

		var vis;

		$scope.$watch('encoding', function(newVal, oldVal) {
			console.log(newVal);
			var encoding = _.chain(newVal)
				.filter(function(mapping) {
					return mapping.field;
				})
				.indexBy('name')
				.mapValues(function(mapping) {
					// TODO: this is hacky
					var field = mapping.field;
					field.type = mapping.type;
					field.aggr = mapping.func;

					return field;
				})
				.value();

			var vegalite = new vl.Encoding($scope.marktype, encoding, {"dataFormatType": "json","dataUrl": Dataset.dataset.url});

			console.log("new enc", vegalite);

			var spec = vl.toVegaSpec(vegalite);

			vg.parse.spec(spec, function(chart) {
				vis = null;
				vis = chart({el:"#vis", renderer: "svg"});

				vis.update();
			});
		}, true);

	  // TODO: get functions from
	  $scope.functions = {
	  	Q: vl.quantAggTypes,
	  	O: ['count', 'bin'],
	  	T: ['count']
	  }

	  $scope.marktype = "point";
	  $scope.marktypes = ["point", "bar", "line", "area", "circle", "square", "text"];
	});
