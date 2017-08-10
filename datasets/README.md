# vega-datasets

This data lives at https://github.com/vega/vega-datasets

Common repository for example datasets used by vega related projects. Keep changes to this repository minimal as other projects (vega, vega-editor, vega-lite, polestar, voyager) use this data in their tests and for examples.

## How to use it

### NPM

Add this to your package.json:
```json
"vega-datasets": "vega/vega-datasets#gh-pages"
```

### HTTP

You can also get the data directly via HTTP served by Github like:

https://vega.github.io/vega-datasets/data/cars.json

### Git subtree

You can use git subtree to add these datasets to a project. Add data git `subtree add` like:

```
git subtree add --prefix path-to-data git@github.com:vega/vega-datasets.git gh-pages
```

Update to the latest version of vega-data with

```
git subtree pull --prefix path-to-data git@github.com:vega/vega-datasets.git gh-pages
```

## Changelog

### Version 1.8

- Remove all tabs in `github.csv` to prevent incorrect field name parsing. 

### Version 1.7

* Dates in `movies.json` are all recognized as date types by datalib
* Dates in `crimea.json` are now in ISO format (YYYY-MM-DD)

### Version 1.6

* Fix `cars.json` date format

### Version 1.5

* Add [Gapminder Health v.s. Income](data/gapminder-health-income.csv) dataset
* Add generated Github contributions data for punch card visualization

### Version 1.4

* Add Anscombe's Quartet dataset

### Version 1.3

* Change date format in weather data so that it can be parsed in all browsers. Apparently YYYY/MM/DD is fine. Can also omit hours now.

### Version 1.2

* Decode origins in cars dataset
* Add Unemployment Across Industries in US

### Version 1.1.1

* Fixed the date parsing on the CrossFilter datasets -- an older version of the data was copied over on initial import. A script is now available via `npm run flights N` to re-sample `N` records from the original `flights-3m.csv` dataset. 

### Version 1.1

* Add `seattle-weather` dataset. Transformed with https://gist.github.com/domoritz/acb8c13d5dadeb19636c

### Version 1.0, October 8, 2015

* Initial import from vega and vega-lite
* Change field names in `cars.json` to be more descriptive (`hp` to `Horsepower`)
