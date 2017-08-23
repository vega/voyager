
import * as React from 'react';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {connect} from 'react-redux';
import {ClipLoader} from 'react-spinners';
import * as SplitPane from 'react-split-pane';
import {SPINNER_COLOR} from '../../constants';
import {Dataset} from '../../models/dataset';
import {State} from '../../models/index';
import {selectDataset} from '../../selectors/dataset';
import '../app.scss';
import {DataPane} from '../data-pane/index';
import {EncodingPane} from '../encoding-pane/index';
import {Footer} from '../footer/index';
import {Header} from '../header/index';
import {LoadData} from '../load-data-pane/index';
import {LogPane} from '../log-pane/index';
import {ViewPane} from '../view-pane/index';

export interface AppRootProps {
  dataset: Dataset;
}

class AppRootBase extends React.PureComponent<AppRootProps, {}> {
  public render() {
    const {dataset} = this.props;
    let bottomPane, footer;
    if (!dataset.isLoading) {
      if (!dataset.data) {
        bottomPane = <LoadData/>;
      } else {
        bottomPane = (
          <SplitPane split="vertical" defaultSize={200}>
            <DataPane/>
            <SplitPane split="vertical" defaultSize={235}>
              <EncodingPane/>
              <ViewPane/>
            </SplitPane>
          </SplitPane>
        );
        footer = <Footer/>;
      }
    }
    return (
      <div className="voyager">
        <LogPane/>
        <Header/>
        <ClipLoader color={SPINNER_COLOR} loading={dataset.isLoading}/>
        {bottomPane}
        {footer}
      </div>
    );
  }
}

export const AppRoot = connect(
  (state: State) => {
    return {
      dataset: selectDataset(state)
    };
  }
)(DragDropContext(HTML5Backend)(AppRootBase));

