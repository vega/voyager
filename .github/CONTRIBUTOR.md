# Convention

## General

- Don't use `export default` ([Why?](https://basarat.gitbooks.io/typescript/docs/tips/defaultIsBad.html)).

## React Components

- Use [this plugin](https://marketplace.visualstudio.com/items?itemName=infeng.vscode-react-typescript) to generate snippets (but manually remove default exports).
- Use PascalCase for filenames

## Vega-Lite / CompassQL Directives

- In `src/models/shelf.ts`, we re-declare a number of Vega-Lite / CompassQL interfaces with "Shelf" prefix, allowing them to be `SHORT_WILDCARD` or both `SHORT_WILDCARD` and full `Wildcard`.
