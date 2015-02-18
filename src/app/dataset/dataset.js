'use strict';

var datasets = [{
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
},{
  name: "Burtin",
  url: "data/burtin.json",
  table: 'burtin_json'
},{
  name: "Budget 2016",
  url: "data/budget.json",
  table: 'budget_json'
},{
  name: "Climate Normals",
  url: "data/climate.json",
  table: 'climate_json'
},{
  name: "Campaigns",
  url: "data/weball26.json",
  table: 'weball26_json'
}];

function getNameMap(dataschema) {
  return dataschema.reduce(function(m, field) {
    m[field.name] = field;
    return m;
  }, {});
}

angular.module('vegalite-ui')
  .factory('Dataset', function($http, Config, _, Papa, vl, consts) {
    var Dataset = {};

    var countField = vl.field.count();

    Dataset.datasets = datasets;
    Dataset.dataset = datasets[7]; //Movies
    Dataset.dataschema = [];
    Dataset.dataschema.byName = {};
    Dataset.stats = {};

    // TODO move these to constant to a universal vlui constant file
    Dataset.typeNames = {
      O: 'text',
      Q: 'number',
      T: 'time',
      G: 'geo'
    };

    Dataset.fieldOrder = vl.field.order.typeThenName;

    // update the schema and stats
    Dataset.update = function (dataset) {

      //set schema and stats
      if (Config.useVegaServer) {
        var url = Config.serverUrl + '/stats/?name=' + dataset.table;
        return $http.get(url, {cache: true}).then(function(response) {
          var parsed = Papa.parse(response.data, {header: true});
          var dataschema=[], stats = {};
          _.each(_.filter(parsed.data, function(d) {return d.name;}), function(row) {
            var fieldStats = {};
            fieldStats.min = +row.min;
            fieldStats.max = +row.max;
            fieldStats.cardinality = +row.cardinality;
            stats[row.name] = fieldStats;

            // TODO add "geo" and "time"
            var type = row.type === 'integer' || row.type === 'real' ? 'Q' : 'O';

            dataschema.push({name: row.name, type: type});
            stats.count = row.count;
          });
          if (consts.addCount) {
            dataschema.push(countField);
          }

          Dataset.dataschema = dataschema;
          Dataset.dataschema.byName = getNameMap(Dataset.dataschema);
          Dataset.stats = stats;
        });
      } else {
        return $http.get(dataset.url, {cache: true}).then(function(response) {
          Dataset.data = response.data;
          var dataschema = vl.data.getSchema(response.data);
          if (consts.addCount) {
            dataschema.push(countField);
          }

          Dataset.dataschema = dataschema;
          Dataset.dataschema.byName = getNameMap(Dataset.dataschema);
          Dataset.stats = vl.data.getStats(response.data);
        });
      }
    };

    return Dataset;
  });
