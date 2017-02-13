import './app.scss';

import * as React from 'react';

import DataPanel from './DataPanel';
import EncodingPanel from './EncodingPanel';
import Header from './Header';
import ViewPanel from './ViewPanel';


export class App extends React.Component<any, {}> {
  public render() {
    return (
      <div className="root">
        <Header/>
        <div>
          <DataPanel/>
          <EncodingPanel/>
          <ViewPanel/>
        </div>
      </div>
    );
  }
}
