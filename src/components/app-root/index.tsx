
import * as React from 'react';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {connect} from 'react-redux';
import {ClipLoader} from 'react-spinners';
import * as SplitPane from 'react-split-pane';
import {SPINNER_COLOR} from '../../constants';
import {VoyagerConfig} from '../../models/config';
import {Dataset} from '../../models/dataset';
import {State} from '../../models/index';
import {selectConfig} from '../../selectors';
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
  config: VoyagerConfig;
}

class AppRootBase extends React.PureComponent<AppRootProps, {}> {
  public render() {
    const {dataset, config} = this.props;
    const {hideHeader, hideFooter} = config;
    let bottomPane, footer;
    if (!dataset.isLoading) {
      if (!dataset.data) {
        bottomPane = <LoadData/>;
      } else {
        bottomPane = (
          <SplitPane split="vertical" defaultSize={200} minSize={175} maxSize={350}>
            <DataPane/>
            <SplitPane split="vertical" defaultSize={235} minSize={200} maxSize={350}>
              <EncodingPane/>
              <ViewPane/>
            </SplitPane>
          </SplitPane>
        );
        if (!hideFooter) {
          footer = <Footer/>;
        }
      }
    }
    return (
      <div className="voyager">
        <LogPane/>
        {!hideHeader && <Header/>}
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
      dataset: selectDataset(state),
      config: selectConfig(state)
    };
  }
)(DragDropContext(HTML5Backend)(AppRootBase));

