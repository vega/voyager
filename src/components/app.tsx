import './app.scss';

import * as React from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import {DataPanel} from './data-panel';
import {EncodingPanel} from './encoding-panel';
import {Header} from './header';
import {ViewPanel} from './view-panel';

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
