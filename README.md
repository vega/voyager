# vegalite-ui

Tableau-style User Interface for visual analysis, building on top of vegalite. Try our [demo](http://uwdata.github.io/vegalite-ui/dist/).


## Development Setup Instruction

Install yeoman (yo + gulp + bower globally) -- see http://yeoman.io for more instruction.

Then install all the npm, bower dependencies:

```bash
npm install
bower install
```

###

Then run `gulp develop`, which serves the site as well as running tests in the background.

## Github Pages

`gh-pages` branch is for releasing a stable version.
`gh-pages` should only contain the dist folder.
Therefore, build on master, go to gh-pages, commit only the dist folder.
