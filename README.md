# Voyager 2

Voyager 2 is a data exploration tool that blends manual and automated chart specification. Voyager 2 combines PoleStar, a traditional chart specification tool inspired by Tableau and Polaris (research project that led to the birth of Tableau), with two partial chart specification interfaces: (1) *wildcards* let users specify multiple charts in parallel,(2) *related views* suggest visualizations relevant to the currently specified chart.  With Voyager 2, we aim to  help analysts engage in both breadth-oriented exploration and depth-oriented question answering.

For more information about Voyager 2's design, please read our [CHI paper](http://idl.cs.washington.edu/papers/voyager2) and other related papers ([1](http://idl.cs.washington.edu/papers/compassql/), [2](http://idl.cs.washington.edu/papers/voyager/), [3](http://idl.cs.washington.edu/papers/vega-lite/)).

**WARNING**:

This repository now hosts the ongoing migration of Voyager 2 to a React/Redux application, which is **not yet ready** for general use. See below for older, more stable versions of the code.

## Demos and Older Codebase

Since this new version of Voyager is not ready for demo / usage yet, you can access the demo and older versions of Voyager built in AngularJS at the following URL.

- The __Voyager 2__ visualization tool, which blends manual and automated chart specification – demo at http://vega.github.io/voyager2 and source code at https://github.com/vega/voyager2
- The __Voyager 1__ visualization browser -- demo at http://vega.github.io/voyager and source code in the `vy1` branch of this repository.

## Basic Setup

For basic setup for local development or installation, we use [yarn](https://yarnpkg.com/en/) for package management. Installing dependencies can be done with:

```
yarn
```

Once the installation is complete, use `yarn test` to run the included tests.

To build a deployable version of the code, run `yarn build`.

Please see [our contributing documentation](.github/CONTRIBUTING.md) for more info about setup and coding conventions if you are interested in contributing to this project.

## Build Outputs

There are 3 artifacts build using `yarn build`:

* Stand alone version of voyager in `dist/`. This distribution can be hosted on a web server to deploy Voyager.
* Compiled Javscript and `.d.js` declaration files for a subset of the Voyager source code in `build/src/`. These declarations and sources can be included in other packages that use Voyager as a dependency. See [voyager-server](https://github.com/vega/voyager-server) for an example.
* Embeddable Voyager build in `build/`. See below for more details on embedding Voyager in other applications.

## Embed Voyager

This repository also hosts an experimental interface that allows for embedding voyager in another web application. The following sections document how to use it.

### Installation

Using npm or yarn? Add the following to your package.json then run `npm install` or `yarn`.

```
"voyager": "git://github.com/vega/voyager.git"
```

### Example Use

Instantiation

```js
const libVoyager = require('voyager');

const container = document.getElementById("voyager-embed");
const config = undefined;
const data = undefined;
const voyagerInstance = libVoyager.CreateVoyager(container, config, data)
```

Initializing with data

```js
const data: any = {
  "values": [
    {"fieldA": "A", "fieldB": 28}, {"fieldA": "B", "fieldB": 55}, {"fieldA": "C", "fieldB": 43},
    {"fieldA": "D", "fieldB": 91}, {"fieldA": "E", "fieldB": 81}, {"fieldA": "F", "fieldB": 53},
    {"fieldA": "G", "fieldB": 19}, {"fieldA": "H", "fieldB": 87}, {"fieldA": "I", "fieldB": 52}
  ]
};

const voyagerInstance = libVoyager.CreateVoyager(container, undefined, data)
```

Updating Data

```js

const voyagerInstance = libVoyager.CreateVoyager(container, undefined, undefined)

const data: any = {
  "values": [
    {"fieldA": "A", "fieldB": 28}, {"fieldA": "B", "fieldB": 55}, {"fieldA": "C", "fieldB": 43},
    {"fieldA": "D", "fieldB": 91}, {"fieldA": "E", "fieldB": 81}, {"fieldA": "F", "fieldB": 53},
    {"fieldA": "G", "fieldB": 19}, {"fieldA": "H", "fieldB": 87}, {"fieldA": "I", "fieldB": 52}
  ]
};

voyagerInstance.updateData(data);
```

### CSS

You currently also need to include the CSS. Note that this has not yet been optimized for embedding (it will take over the whole screen)

```html
<link rel="stylesheet" type="text/css" href="./node_modules/voyager/lib/style.css">
```

## API

The voyager _module_ exposes 1 function.

#### CreateVoyager(container, config, data)

```js
/**
 * Create an instance of the voyager application and return it.
 *
 * @param {Container} container css selector or HTMLElement that will be the parent
 *                              element of the application
 * @param {Object|undefined}    config    Optional: configuration options
 * @param {Array|undefined}     data      Optional: data object. Can be a string or an array of objects.
 */
```

An _instance_ of voyager exposes the following two methods

#### updateData(data)

```js
/**
   * Update the dataset currently loaded into voyager
   *
   * @param {VoyagerData} data
   */
```

#### updateConfig(config)

```js
  /**
   * Update the configuration of the voyager application.
   *
   * @param {VoyagerConfig} config
   */
```

## Voyager-server Mode

Computationally expensive portions of the Voyager process can be configured to run on a server.

To get this running in a local development environment, first clone and install the dependencies of the [voyager-server](https://github.com/vega/voyager-server) project.

In voyager-server directory, `yarn start` will start the server running on port `3000`.

With voyager-server now running, we can start voyager in server mode by running:

```
yarn start:server
```

This will run Voyager in "server-mode" sending requests to voyager-server, which it expects, by default, to be at [http://localhost:3000](http://localhost:3000).

The server url is controlled by the `SERVER` environment variable.

See [voyager-server](https://github.com/vega/voyager-server) for more information on what portions of the functionality the server handles. 
