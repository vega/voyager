'use strict';

var datasets = [
{
  name: "-"
},{
  name: "Barley",
  url: "data/barley.json",
  table: "barley_json"
},{
  name: "Cars",
  url: "data/cars.json",
  table: "cars_json"
},{
  name: "Crimea",
  url: "data/crimea.json",
  table: "crimea"
},{
  name: "Driving",
  url: "data/driving.json",
  table: "driving_json"
},{
  name: "Iris",
  url: "data/iris.json",
  table: "iris_json"
},{
  name: "Jobs",
  url: "data/jobs.json",
  table: "jobs_json"
},{
  name: "Population",
  url: "data/population.json",
  table: "population_json"
},{
  name: "Movies",
  url: "data/movies.json",
  table: "movies_json"
},{
  name: "Birdstrikes",
  url: "data/birdstrikes.json",
  table: "birdstrikes_json"
}
];

angular.module('vleApp')
  .factory('Dataset', function ($rootScope, Config) {
  	var service = {};

    service.datasets = datasets;
    service.dataset = datasets[0];
    service.schema = null;

    var getSchema = function(dataset) {
  		if (Config.useServer) {
  			return ["server", dataset];
  		} else {
  			return ["client", dataset];
  		}
  	}

    service.update = function(newDataset) {
    	console.log('new dataset', newDataset)
    	service.dataset = newDataset;
    	service.schema = getSchema(service.dataset);
    }

    return service;
  });
