'use strict';

var datasets = [{
  name: 'Barley',
  url: 'data/barley.json',
  id: 'barley',

},{
  name: 'Cars',
  url: 'data/cars.json',
  id: 'cars'
},{
  name: 'Crimea',
  url: 'data/crimea.json',
  id: 'crimea'
},{
  name: 'Driving',
  url: 'data/driving.json',
  id: 'driving'
},{
  name: 'Iris',
  url: 'data/iris.json',
  id: 'iris'
},{
  name: 'Jobs',
  url: 'data/jobs.json',
  id: 'jobs'
},{
  name: 'Population',
  url: 'data/population.json',
  id: 'population'
},{
  name: 'Movies',
  url: 'data/movies.json',
  id: 'movies'
},{
  name: 'Birdstrikes',
  url: 'data/birdstrikes.json',
  id: 'birdstrikes'
},{
  name: "Burtin",
  url: "data/burtin.json",
  id: 'burtin'
},{
  name: "Budget 2016",
  url: "data/budget.json",
  id: 'budget'
},{
  name: "Climate Normals",
  url: "data/climate.json",
  id: 'climate'
},{
  name: "Campaigns",
  url: "data/weball26.json",
  id: 'weball26'
}];

function getNameMap(dataschema) {
  return dataschema.reduce(function(m, field) {
    m[field.name] = field;
    return m;
  }, {});
}

angular.module('vleApp')
  .factory('Dataset', function($http, Config, _, Papa, vl, consts) {
    var Dataset = {};

    var countField = vl.field.count();

    Dataset.datasets = datasets;
    Dataset.dataset = datasets[8]; // Birdstrike
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

          _.each(Dataset.dataschema, function(field) {
            // if fewer than 2% of values or unique, assume the field to be ordinal,
            // or <= 7 unique values
            var stats = Dataset.stats[field.name];
            if (stats !== undefined && (field.type === 'Q' && stats.cardinality <= 20 &&
                  (stats.cardinality < (stats.count - stats.numNulls)/50 || stats.cardinality <= 7))) {
              field.type = 'O';
            }
          });

        });
      }
    };

    return Dataset;
  });
