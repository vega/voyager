export const HISTORY_LIMIT = 20;

/**
 * Types of draggable items (for react-dnd).
 */
export const DraggableType = {
  FIELD: 'field'
};

/**
 * Type of parent for Field Component
 */
export enum FieldParentType {
  ENCODING_SHELF,
  FIELD_LIST
};

export const DEFAULT_DATASETS = [{
  name: '-',
  url: undefined
}, {
  name: 'Barley',
  description: 'Barley yield by variety across the upper midwest in 1931 and 1932',
  url: 'data/barley.json',
  id: 'barley',
  group: 'sample'
}, {
  name: 'Cars',
  description: 'Automotive statistics for a variety of car models between 1970 & 1982',
  url: 'data/cars.json',
  id: 'cars',
  group: 'sample'
}, {
  name: 'Crimea',
  url: 'data/crimea.json',
  id: 'crimea',
  group: 'sample'
}, {
  name: 'Driving',
  url: 'data/driving.json',
  id: 'driving',
  group: 'sample'
}, {
  name: 'Iris',
  url: 'data/iris.json',
  id: 'iris',
  group: 'sample'
}, {
  name: 'Jobs',
  url: 'data/jobs.json',
  id: 'jobs',
  group: 'sample'
}, {
  name: 'Population',
  url: 'data/population.json',
  id: 'population',
  group: 'sample'
}, {
  name: 'Movies',
  url: 'data/movies.json',
  id: 'movies',
  group: 'sample'
}, {
  name: 'Birdstrikes',
  url: 'data/birdstrikes.json',
  id: 'birdstrikes',
  group: 'sample'
}, {
  name: 'Burtin',
  url: 'data/burtin.json',
  id: 'burtin',
  group: 'sample'
}, {
  name: 'Campaigns',
  url: 'data/weball26.json',
  id: 'weball26',
  group: 'sample'
}].map(dataset => {
  return {
    ...dataset,
    url: 'node_modules/vega-datasets/' + dataset.url
  };
});
