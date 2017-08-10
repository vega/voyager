
import * as React from 'react';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {connect} from 'react-redux';
import * as SplitPane from 'react-split-pane';
import {Dispatch} from 'redux';
import {ActionCreators} from 'redux-undo';
import {Data} from 'vega-lite/build/src/data';
import {FacetedCompositeUnitSpec, TopLevel} from 'vega-lite/build/src/spec';
import {datasetLoad, SET_APPLICATION_STATE, SET_CONFIG} from '../actions';
import {SHELF_SPEC_LOAD} from '../actions/shelf';
import {VoyagerConfig} from '../models/config';
import {State} from '../models/index';
import {selectData} from '../selectors/dataset';
import './app.scss';
import {DataPane} from './data-pane/index';
import {EncodingPane} from './encoding-pane/index';
import {Footer} from './footer/index';
import {Header} from './header/index';
import {LoadData} from './load-data-pane/index';
import {ViewPane} from './view-pane/index';


export interface OwnProps extends React.Props<AppBase> {
  config?: VoyagerConfig;
  data?: Data;
  applicationState?: Readonly<State>;
  spec?: TopLevel<FacetedCompositeUnitSpec>;
  dispatch: Dispatch<State>;
}

export interface ConnectProps {
  connectData: Data;
}

export type Props = OwnProps & ConnectProps;

export class AppBase extends React.PureComponent<Props, {}> {

  constructor(props: any) {
    super(props);
  }

  public componentWillUpdate(nextProps: Props) {
    this.update(nextProps);
  }

  public componentWillMount() {
    // Clear history as redux-undo seems to always put the first action after
    // an init into the history. This ensures we start with a fresh history once
    // the app is about to start.
    this.props.dispatch(ActionCreators.clearHistory());
    this.update(this.props);
  }

  public render() {
    let bottomPane, footer;
    if (!this.props.connectData) {
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
    return (
      <div className="voyager">
        <Header/>
        {bottomPane}
        {footer}
      </div>
    );
  }

  private update(nextProps: Props) {
    const { data, config, applicationState, dispatch, spec } = nextProps;
    if (data) {
      this.setData(data);
    }

    if (config) {
      this.setConfig(config);
    }

    if (spec) {
      // Note that this will overwrite other passed in props
      this.setSpec(spec);
    }

    if (applicationState) {
      // Note that this will overwrite other passed in props
      this.setApplicationState(applicationState);
    }
  }

  private setData(data: Data): any {
    return this.props.dispatch(datasetLoad("Custom Data", data));
  }

  private setConfig(config: VoyagerConfig) {
    this.props.dispatch({
      type: SET_CONFIG,
      payload: {
        config,
      }
    });
  }

  private setSpec(spec: TopLevel<FacetedCompositeUnitSpec>) {
    if (spec.data) {
      this.setData(spec.data)
        .then(
          () => {
            this.shelfSpecLoad(spec);
          },
          (err: any) => {
            throw new Error('error setting data for spec:' + err.toString());
          }
        );
    } else {
      this.shelfSpecLoad(spec);
    }
  }

  private shelfSpecLoad(spec: TopLevel<FacetedCompositeUnitSpec>) {
    this.props.dispatch({
      type: SHELF_SPEC_LOAD,
      payload: {
        spec,
        keepWildcardMark: false
      }
    });
  }

  private setApplicationState(state: Readonly<State>): void {
    this.props.dispatch({
      type: SET_APPLICATION_STATE,
      payload: {
        state,
      }
    });
  }
}

export const App = connect<ConnectProps, null, OwnProps>(
  (state: State) => {
    return {
      connectData: selectData(state)
    };
  }
, null)(DragDropContext(HTML5Backend)(AppBase));
