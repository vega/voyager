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
  name: 'Burtin',
  url: 'data/burtin.json',
  id: 'burtin'
},{
  name: 'Budget 2016',
  url: 'data/budget.json',
  id: 'budget'
},{
  name: 'Climate Normals',
  url: 'data/climate.json',
  id: 'climate'
},{
  name: 'Campaigns',
  url: 'data/weball26.json',
  id: 'weball26'
}];

function getNameMap(dataschema) {
  return dataschema.reduce(function(m, field) {
    m[field.name] = field;
    return m;
  }, {});
}

angular.module('polestar')
  .factory('Dataset', function($http, Alerts, _, Papa, dl, vl, consts) {
    var Dataset = {};

    var countField = vl.field.count();

    Dataset.datasets = datasets;
    Dataset.dataset = datasets[1];
    Dataset.dataschema = [];
    Dataset.dataschema.byName = {};
    Dataset.stats = {};
    Dataset.type = undefined;

    // TODO move these to constant to a universal vlui constant file
    Dataset.typeNames = {
      O: 'text',
      Q: 'number',
      T: 'time',
      G: 'geo'
    };

    Dataset.fieldOrder = vl.field.order.typeThenName;
    Dataset.getSchema = function(data, order) {
      var types = dl.read.types(data),
        schema = _.reduce(types, function(s, type, name){
          s.push({name: name, type: vl.data.types[type]});
          return s;
        }, []);

      schema = dl.stablesort(schema, order || vl.field.order.typeThenName, vl.field.order.name);

      if (consts.addCount) {
        schema.push(countField);
      }
      return schema;
    };

    // update the schema and stats
    Dataset.update = function(dataset) {
      return $http.get(dataset.url, {cache: true}).then(function(response) {
        // first see whether the data is JSON, otherwise try to parse CSV
        if (_.isObject(response.data)) {
           Dataset.data = response.data;
           Dataset.type = 'json';
        } else {
           var result = Papa.parse(response.data, {
            dynamicTyping: true,
            header: true
          });

          if (result.errors.length === 0) {
            Dataset.data = result.data;
            Dataset.type = 'csv';
          } else {
            _.each(result.errors, function(err) {
              Alerts.add(err.message, 2000);
            });
            return;
          }
        }

        Dataset.dataschema = Dataset.getSchema(Dataset.data);
        Dataset.dataschema.byName = getNameMap(Dataset.dataschema);
        Dataset.stats = vl.data.getStats(Dataset.data);

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
    };

    Dataset.add = function(dataset) {
      if (!dataset.id) {
        dataset.id = dataset.url;
      }
      datasets.push(dataset);
    };

    return Dataset;
  });
