import * as React from 'react';

import {Data} from './data/data';
import {Header} from './header/header';


export class App extends React.Component<any, {}> {
  public render() {
    return (
      <div className="root">
        <Header/>
        <div>
          <Data/>
        </div>
      </div>
    );
  }
}
