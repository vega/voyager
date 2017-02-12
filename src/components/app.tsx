import './app.scss';

import * as React from 'react';

import {Data} from './data/data';
import {Header} from './header/header';
import {ShelfContainer} from './shelf';
import {ViewContainer} from './view';


export class App extends React.Component<any, {}> {
  public render() {
    return (
      <div className="root">
        <Header/>
        <div>
          <Data/>
          <ShelfContainer/>
          <ViewContainer/>
        </div>
      </div>
    );
  }
}
