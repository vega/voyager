# Pole✭ (Polestar) -- Alpha

**PoleStar is an [alpha](http://en.wikipedia.org/wiki/Software_release_life_cycle#Alpha) software.
We are working on improving the code and documentation on Polestar.** 

Tableau-style User Interface for visual analysis, building on top of [Vegalite](https://github.com/uwdata/vegalite). Try our [online demo](http://uwdata.github.io/polestar/). Also, be sure to check out [related projects](https://vega.github.io/).

## Development Setup Instruction

**Warning: The setup instructions are probably not working at this point.**

### Directory Setup

Create a folder `_visrec` somewhere you want to work in.  
Then clone this repo and [vegalite](https://github.com/uwdata/vegalite) to be under `_visrec`.


### Install Dependencies

Make sure you have node.js. (We recommend using [homebrew](http://brew.sh) and simply run `brew install node`.)

Install gulp + bower globally by running

```sh
npm install -g bower
npm install -g gulp
```

Then install all the npm, bower dependencies:

```bash
npm install
bower install
```

Now you should have all dependencies and should be ready to work. 

### Developing

You can run `gulp serve`, which serves the site as well as running tests in the background.
If you edit any file, our gulp task runner should automatically refresh

#### Folder Structure

We try to follow [Google's Angular Best Practice for Angular App Structure](https://docs.google.com/document/d/1XXMvReO8-Awi1EZXAXS4PzDzdNvV6pGcuaF4Q9821Es/pub) and use [generator-gulp-angular](https://github.com/Swiip/generator-gulp-angular) to setup the project.  

All source code are under `src/`

- `src/app/` contains our main classes
- `src/components` contains our other components
- `src/components/filter` contains all filter
- `src/assets/images/` contains relevant images
- `src/data/` contains all data that we use in the application 
- `src/vendor` contains 


@kanitw have create [`gulp/gen.js`](https://github.com/uwdata/vegalite-ui/blob/master/gulp/gen.js) for help generating angular components.  
For example, you can run `gulp gen -d directiveName` and this would create all relevant files

#### stylesheet

We use [sass](http://sass-lang.com) as it is a better syntax for css.

Other common stylesheets that should be shared with https://github.com/uwdata/facetedviz should be under `src/assets/vlui-common.scss`

#### Develop Polestar, Vegalite and Datalib together

Polestar depends on [Datalib](https://github.com/uwdata/datalib) and [Vegalite](https://github.com/uwdata/vegalite).

If you plan to make changes to datalib and test Vegalite without publishing / copying compiled datalib all the time, use [`bower link`](https://oncletom.io/2013/live-development-bower-component/).

In both of your Datalib and Vegalite repositories, run  
```
bower link
```.
Then go to your Polestar directory and run
```
bower link datalib
bower link vegalite
```

Now all the changes you make in Datalib and Vegalite are reflected in your Vegalite automatically.

Since bower uses the compiled main file, make sure that both Vegalite and Datalib repos are compiled everytime you run `gulp serve` for Polestar.  Otherwise, you will get errors for missing `vl` or `dl`.   

### Releasing / Github Pages

`gh-pages` branch is for releasing a stable version.
`gh-pages` should only contain the dist folder.

Use `publish.sh` to (1) publish the current version to npm (2) deploy the current branch to gh-pages and (3) create a release tag for github and bower. 


