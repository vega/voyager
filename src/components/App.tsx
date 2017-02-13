import './App.scss';

import * as React from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import {DataPanel} from './DataPanel';
import {EncodingPanel} from './EncodingPanel';
import {Header} from './Header';
import {ViewPanel} from './ViewPanel';

class AppBase extends React.Component<any, {}> {
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

export const App = DragDropContext(HTML5Backend)(AppBase);
