# Voyager

[![Build Status](https://travis-ci.org/uwdata/voyager.svg)](https://travis-ci.org/uwdata/voyager) 

Voyager is a visualization browser for data analysis, building on top of [Vega-lite](https://github.com/uwdata/vega-lite).
Try our [online demo](http://uwdata.github.io/voyager/). Also, be sure to check out [related projects](https://vega.github.io/).

**This project is an [alpha](http://en.wikipedia.org/wiki/Software_release_life_cycle#Alpha) software.
We are working on improving its code and documentation.**

If you have specific questions, please contact @kanitw and @domoritz.

## Setup Instruction

### Install Dependencies

Make sure you have node.js. (We recommend using [homebrew](http://brew.sh) and simply run `brew install node`.)

Install gulp + bower globally by running

```sh
npm install -g bower
npm install -g gulp
```

Then install all the npm, bower dependencies:

```sh
npm install
bower install
```

Now you should have all dependencies and should be ready to work.

### Running

You can run `gulp serve`, which serves the site as well as running tests in the background.
If you edit any file, our gulp task runner should automatically refresh the browser and re-run tests.

## Development Guide

### Folder Structure

We try to follow [Google's Angular Best Practice for Angular App Structure](https://docs.google.com/document/d/1XXMvReO8-Awi1EZXAXS4PzDzdNvV6pGcuaF4Q9821Es/pub) and use [generator-gulp-angular](https://github.com/Swiip/generator-gulp-angular) to setup the project.

All source code are under `src/`

- `src/app/` contains our main classes
- `src/components` contains our other components
- `src/assets/images/` contains relevant images
- `src/data/` contains all data that we use in the application
- `src/vendor` contains

@kanitw have create [`gulp/gen.js`](https://github.com/uwdata/polestar/blob/master/gulp/gen.js) for help generating angular components.
For example, you can run `gulp gen -d directiveName` and this would create all relevant files including the javascript file, the template file, the stylesheet file and the test spec. 

#### Coding Style

We use jshint as our linter for coding in the project.  

#### Stylesheets

We use [sass](http://sass-lang.com) as it is a better syntax for css.

#### Dependencies

This project depends on [Datalib](https://github.com/uwdata/datalib) for data processing, [Vega-lite](https://github.com/uwdata/vega-lite) as a formal model for visualization, and [Vega-lite-ui](https://github.com/uwdata/vega-lite-ui), which contains shared components between Polestar and Voyager.

If you plan to make changes to these dependencies and observe the changes without publishing / copying compiled libraries all the time, use [`bower link`](https://oncletom.io/2013/live-development-bower-component/).

In each of your dependency repository, run

```
cd path/to/dependency-repo
bower link
```

Then go to your this project's directory and run

```
bower link datalib
bower link vega-lite
bower link vega-lite-ui
```

Now all the changes you make in each repo will be reflected in your Vega-lite automatically.

Since bower uses the compiled main file, make sure that each repos is compiled everytime you run `gulp serve`.
Otherwise, you will get errors for missing libraries.

### Releasing / Github Pages

`gh-pages` branch is for releasing a stable version.
`gh-pages` should only contain the dist folder.

Use `publish.sh` to:

1. publish the current version to npm
2. deploy the current branch to gh-pages and
3. create a release tag for github and bower.

## Acknowledgement

Voyager's development is led by Kanit Wongsuphasawat, Dominik Moritz, and Jeffrey Heer at the University of Washington [Interactive Data Lab](http://idl.cs.washington.edu), in collaboration with [UW eScience Institute](http://escience.washington.edu/) and [Tableau Research](http://research.tableau.com)

We used [generator-gulp-angular](https://github.com/Swiip/generator-gulp-angular) for bootstraping our project.

