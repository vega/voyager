# Convention

## General

- Don't use `export default` ([Why?](https://basarat.gitbooks.io/typescript/docs/tips/defaultIsBad.html)).

## React Components

- Use lowercase-dash-separated-names for file names. (Using Pascal-case as filename can be problematic for OSX in general as OSX is case-insensitive.)
- Following Redux's [Using with React](http://redux.js.org/docs/basics/UsageWithReact.html) guide, we distinguish between presentation and container components. However, instead of having event handlers (e.g., `onTodoClick` in the guide) for every single events, we pass in `handleAction` property to presentation components (which implements our `ActionHandler` interface).  For more information, see `src/actions/redux-action.ts`.
- You can use [this plugin](https://marketplace.visualstudio.com/items?itemName=infeng.vscode-react-typescript) to generate snippets (but manually remove default exports).


## Redux

### Actions

- Actions should implement `ReduxAction` interfaces in `src/actions/redux-action`, which follows pattern described in https://github.com/acdlite/redux-actions.

## Vega-Lite / CompassQL Directives

- In `src/models/shelf.ts`, we re-declare a number of Vega-Lite / CompassQL interfaces with "Shelf" prefix, allowing them to be `SHORT_WILDCARD` or both `SHORT_WILDCARD` and full `Wildcard`.
