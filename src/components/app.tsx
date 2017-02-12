import * as React from 'react';

import {Header} from './header/header';
import {SchemaList} from './schemalist/schemalist';


export class App extends React.Component<any, {}> {
  public render() {
    return (
      <div className="root">
        <Header/>
        <div>
          <SchemaList/>
        </div>
      </div>
    );
  }
}
