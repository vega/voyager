'use strict';

var datasets = [
{
  name: 'Barley',
  url: 'data/barley.json',
  table: 'barley_json'
},{
  name: 'Cars',
  url: 'data/cars.json',
  table: 'cars_json'
},{
  name: 'Crimea',
  url: 'data/crimea.json',
  table: 'crimea_json'
},{
  name: 'Driving',
  url: 'data/driving.json',
  table: 'driving_json'
},{
  name: 'Iris',
  url: 'data/iris.json',
  table: 'iris_json'
},{
  name: 'Jobs',
  url: 'data/jobs.json',
  table: 'jobs_json'
},{
  name: 'Population',
  url: 'data/population.json',
  table: 'population_json'
},{
  name: 'Movies',
  url: 'data/movies.json',
  table: 'movies_json'
},{
  name: 'Birdstrikes',
  url: 'data/birdstrikes.json',
  table: 'birdstrikes_json'
}
];

angular.module('vleApp')
  .factory('Dataset', function ($http, Config, _, Papa) {
    var Dataset = {};

    Dataset.datasets = datasets;

    Dataset.dataset = datasets[7]; //Movies
    Dataset.schema = null;
    Dataset.stats = null;

    function setSchemaAndStats(dataset) {
      if (Config.useVegaServer) {
        var url = Config.serverUrl + '/stats/?name=' + dataset.table;
        return $http.get(url, {cache: true}).then(function(response) {
          var parsed = Papa.parse(response.data, {header: true});
          var stats = {};
          _.each(_.filter(parsed.data, function(d) {return d.name;}), function(row) {
            var field = {};
            field.min = +row.min;
            field.max = +row.max;
            field.cardinality = +row.cardinality;
            field.type = row.type === 'integer' || row.type === 'real' ? "Q" : "O";
            stats[name] = field;
          });
          Dataset.schema = _.keys(stats);
          Dataset.stats = stats;
        });
      } else {
        return $http.get(dataset.url, {cache: true}).then(function(response) {
          Dataset.schema = _.keys(response.data[0]);
          Dataset.stats = vl.data.getStats(response.data);
        });
      }
    }

    Dataset.update = function(newDataset) {
      Dataset.dataset = newDataset;
      Config.updateDataset(Dataset.dataset);
      setSchemaAndStats(Dataset.dataset);
    };

    return Dataset;
  });
