import './app.scss';

import * as React from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import * as SplitPane from 'react-split-pane';

import {DataPane} from './data-pane';
import {EncodingPane} from './encoding-pane';
import {Header} from './header';
import {ViewPane} from './view-pane';


class AppBase extends React.PureComponent<any, {}> {
  public render() {
    return (
      <div className="voyager">
        <Header/>
        <SplitPane split="vertical" defaultSize={250}>
          <DataPane/>
          <SplitPane split="vertical" defaultSize={235}>
            <EncodingPane/>
            <ViewPane/>
          </SplitPane>
        </SplitPane>
      </div>
    );
  }
}

export const App = DragDropContext(HTML5Backend)(AppBase);
