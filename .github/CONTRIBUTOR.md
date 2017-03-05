# Convention

## General

- Don't use `export default` ([Why?](https://basarat.gitbooks.io/typescript/docs/tips/defaultIsBad.html)).

- We make `index.ts` inside `actions/`, `models/`, and `reducers/` export everything inside it so that we can just import from `actions` without worrying about file renaming later.

## React Components

- Since we guarantee that our props and states are immutable (using TypeScript's `Readonly` type wrapper), we can always use [`PureComponent`](https://facebook.github.io/react/docs/react-api.html#react.purecomponent) and rely on its shallow prop and state comparison.

- Use lowercase-dash-separated-names for file names. (Using Pascal-case as filename can be problematic for OSX in general as OSX is case-insensitive.)
- Following Redux's [Using with React](http://redux.js.org/docs/basics/UsageWithReact.html) guide, we distinguish between presentation and container components. However, instead of having event handlers (e.g., `onTodoClick` in the guide) for every single events, we pass in `handleAction` property to presentation components (which implements our `ActionHandler` interface).  For more information, see `src/actions/redux-action.ts`.
- You can use [this plugin](https://marketplace.visualstudio.com/items?itemName=infeng.vscode-react-typescript) to generate snippets (but manually remove default exports).

- For CSS, we use [react-css-modules](https://github.com/gajus/react-css-modules) and SASS, which makes it easy to modularize style in React using the `styleName` tag.  (See [react-css-modules](https://github.com/gajus/react-css-modules)'s README for more details.)
  - Since CSS-Modules use filename as a prefix, never name a scss file `index.scss`.  Instead use the module name.  For example, css file for `data-pane/index.tsx` should be `data-pane/data-pane.scss`.

## Redux

### Actions

- Synchronous actions should implement `ReduxAction` interfaces in `src/actions/redux-action`, which follows pattern described in https://github.com/acdlite/redux-actions.

- Asynchronous actions should implement `ThunkAction`.  See `actions/dataset.ts` for example.

## Vega-Lite / CompassQL Directives

- In `src/models/shelf.ts`, we re-declare a number of Vega-Lite / CompassQL interfaces with "Shelf" prefix, allowing them to be `SHORT_WILDCARD` or both `SHORT_WILDCARD` and full `Wildcard`.
