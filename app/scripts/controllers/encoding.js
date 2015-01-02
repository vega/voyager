'use strict';

angular.module('vleApp')
	.controller('EncodingCtrl', function ($scope, Encoding, Dataset) {

		$scope.encoding = null;
		Encoding.getEncoding().then(function(encoding) {
		  $scope.encoding = encoding;
		});

		$scope.schema = null;
		Encoding.getEncodingSchema().then(function(schema) {
		  console.log(schema)
		  $scope.schema = schema;
		});

		var vis;

		// define order
		$scope.encTypes = ['x', 'y', 'row', 'col', 'size', 'color', 'alpha', 'shape', 'text'];

		$scope.$watch('encoding', function(newEncoding, oldEncoding) {
			if (!newEncoding) {
				return;
			}

			var removeEmptyFieldDefs = function(enc) {
				enc.enc = _.omit(enc.enc, function(fieldDef) {
					return fieldDef.name === null;
				});
			}

			var deleteNulls = function(enc) {
				for (var i in enc) {
					if (_.isObject(enc[i])) {
						deleteNulls(enc[i]);
					}
					// This is why I hate js
					if (enc[i] === null || (_.isObject(enc[i]) && Object.keys(enc[i]).length === 0) || enc[i] === []) {
						delete enc[i];
					}
				}
			}

			var cleanEncoding = _.cloneDeep(newEncoding);
			removeEmptyFieldDefs(cleanEncoding)
			deleteNulls(cleanEncoding);

			if (!cleanEncoding.enc) {
				// empty
				return;
			}

			console.log(cleanEncoding);

			var vegalite = vl.Encoding.fromEncoding(cleanEncoding, {'dataFormatType': 'json','dataUrl': Dataset.dataset.url});

			// Hack
			$('#vlspec').text(JSON.stringify(vegalite));

			var spec = vl.toVegaSpec(vegalite, Dataset.stats);

			vg.parse.spec(spec, function(chart) {
				vis = null;
				vis = chart({el:'#vis', renderer: 'svg'});

				vis.update();
			});
		}, true);
	});
