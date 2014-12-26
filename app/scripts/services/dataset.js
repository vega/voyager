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
  .factory('Dataset', function ($rootScope) {
    var myDataset = datasets[0];
    var mySchema = [myDataset];

    // Public API here
    return {
      getMyDataset: function () {
        return myDataset;
      },
      setMyDataset: function(newDataset) {
      	myDataset = newDataset;
      	mySchema = [myDataset];
      },
      getDatasets: function() {
      	return datasets;
      },
      getSchema: function() {
      	return mySchema;
      }
    };
  });
