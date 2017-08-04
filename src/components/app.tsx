import './app.scss';

import * as Ajv from 'ajv';
import * as draft4Schemas from 'ajv/lib/refs/json-schema-draft-04.json';
import {fromSpec} from 'compassql/build/src/query/spec';
import { FacetedCompositeUnitSpec, isUnitSpec, TopLevel } from 'vega-lite/build/src/spec';
import * as vlSchema from 'vega-lite/build/vega-lite-schema.json';

import * as React from 'react';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import * as SplitPane from 'react-split-pane';

import {Dispatch} from 'redux';
import {ActionCreators, StateWithHistory} from 'redux-undo';
import {Data} from 'vega-lite/build/src/data';
import {datasetLoad, SET_APPLICATION_STATE, SET_CONFIG} from '../actions';
import {StateBase} from '../models/index';

import {SHELF_SPEC_LOAD} from '../actions/shelf';
import {VoyagerConfig} from '../models/config';
import {fromSpecQuery} from '../models/shelf/spec';
import {DataPane} from './data-pane';
import {EncodingPane} from './encoding-pane';
import {Header} from './header';
import {LoadData} from './load-data-pane/index';
import {ViewPane} from './view-pane';


export type VoyagerData = Data;

interface Props extends React.Props<AppBase> {
  config?: VoyagerConfig;
  data?: Data;
  applicationState?: Readonly<StateBase>;
  spec?: Object;
  dispatch: Dispatch<StateWithHistory<Readonly<StateBase>>>;
}

class AppBase extends React.PureComponent<Props, {}> {

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
    let rightPane;
    if (!this.props.data && !this.props.spec) {
      rightPane = <LoadData />;
    } else {
      rightPane = (
        <SplitPane split="vertical" defaultSize={235}>
          <EncodingPane/>
          <ViewPane/>
        </SplitPane>
      );
    }
    return (
      <div className="voyager">
        <Header/>
        <SplitPane split="vertical" defaultSize={200}>
          <DataPane/>
          {rightPane}
        </SplitPane>
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

  private setSpec(spec: Object) {
    const ajv = new Ajv({
      validateSchema: true,
      allErrors: true,
      extendRefs: 'fail'
    });
    ajv.addMetaSchema(draft4Schemas, 'http://json-schema.org/draft-04/schema#');

    const validateVl = ajv.compile(vlSchema);
    const valid = validateVl(spec);

    if (!valid) {
      throw new Error("Invalid spec:" + validateVl.errors.toString());
    }

    const validSpec: TopLevel<FacetedCompositeUnitSpec> = spec as TopLevel<FacetedCompositeUnitSpec>;


    if (!isUnitSpec(validSpec)) {
      throw new Error("Voyager does not support layered or multi-view vega-lite specs");
    }

    if (validSpec.data) {
      this.setData(validSpec.data)
        .then(
          () => {
            this.shelfSpecLoad(validSpec);
          },
          (err: any) => {
            throw new Error('error setting data for spec:' + err.toString());
          }
        );
    } else {
      this.shelfSpecLoad(validSpec);
    }
  }

  private shelfSpecLoad(validSpec: TopLevel<FacetedCompositeUnitSpec>) {
    const specQuery = fromSpec(validSpec);
    const shelfSpec = fromSpecQuery(specQuery);

    this.props.dispatch({
      type: SHELF_SPEC_LOAD,
      payload: {
        spec: shelfSpec,
      },
    });
  }

  private setApplicationState(state: Readonly<StateBase>): void {
    this.props.dispatch({
      type: SET_APPLICATION_STATE,
      payload: {
        state,
      }
    });
  }
}

export const App = DragDropContext(HTML5Backend)(AppBase);
