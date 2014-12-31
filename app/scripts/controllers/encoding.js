'use strict';

angular.module('vleApp')
	.controller('EncodingCtrl', function ($scope, Encoding, Dataset) {
		Encoding.getEncoding().then(function(encoding) {
		  $scope.encoding = encoding;
		});

		Encoding.getEncodingSchema().then(function(schema) {
			console.log(schema)
		  $scope.schema = schema;
		});

		var vis;

		// define order
		$scope.encTypes = ['x', 'y', 'row', 'col', 'size', 'color', 'alpha', 'shape', 'text'];

		$scope.$watch('encoding', function(newVal, oldVal) {
			console.log(newVal);
			// var encoding = _.chain(newVal)
			// 	.filter(function(mapping) {
			// 		return mapping.field;
			// 	})
			// 	.indexBy('name')
			// 	.mapValues(function(mapping) {
			// 		// TODO: this is hacky
			// 		var field = mapping.field;
			// 		field.type = mapping.type;
			// 		field.aggr = mapping.func;

			// 		return field;
			// 	})
			// 	.value();

			// var vegalite = new vl.Encoding($scope.marktype, encoding, {"dataFormatType": "json","dataUrl": Dataset.dataset.url});

			// console.log("new enc", vegalite);

			// var spec = vl.toVegaSpec(vegalite);

			// vg.parse.spec(spec, function(chart) {
			// 	vis = null;
			// 	vis = chart({el:"#vis", renderer: "svg"});

			// 	vis.update();
			// });
		}, true);
	});
