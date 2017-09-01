
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import Form from 'react-jsonschema-form';
import * as TetherComponent from 'react-tether';
import * as vlSchema from 'vega-lite/build/vega-lite-schema.json';
import {ActionHandler} from '../../actions/redux-action';
import {SPEC_FIELD_NESTED_PROP_CHANGE, SpecEncodingAction} from '../../actions/shelf/spec';
import {ShelfId} from '../../models/shelf/spec/encoding';
import * as styles from './field-customizer.scss';

export interface FieldCustomizerProps extends ActionHandler<SpecEncodingAction> {
  showCaret: boolean;
  shelfId: ShelfId;
}

export interface FieldCustomizerState {
  customizerIsOpened: boolean;
}


export class FieldCustomizerBase extends React.PureComponent<FieldCustomizerProps, FieldCustomizerState> {
  constructor(props: FieldCustomizerProps) {
    super(props);
    this.state = {
      customizerIsOpened: false
    };
    this.toggleCustomizer = this.toggleCustomizer.bind(this);
  }

  public render() {
    const {showCaret} = this.props;
    return (
      <TetherComponent
        attachment="top left"
        targetAttachment="bottom left"
      >
        <span onClick={this.toggleCustomizer}>
          <i className={(showCaret ? '' : 'hidden ') + 'fa fa-caret-down'}/>
          {' '}
        </span>
        {this.state.customizerIsOpened && this.renderCustomizer()}
      </TetherComponent>
    );
  }

  protected changeFieldProperty(prop: string, nestedProp: string, result: any) {
    const {handleAction, shelfId} = this.props;
    const value = result.formData;
    handleAction({
      type: SPEC_FIELD_NESTED_PROP_CHANGE,
      payload: {
        shelfId,
        prop,
        nestedProp,
        value
      }
    });
  }

  private renderCustomizer() {
    const uiSchema = {
      "ui:title": "Scale Type",
      "ui:emptyValue": "auto",
      "ui:placeholder": "auto"
    };
    return (
      <div styleName='field-customizer'>
        <Form
          schema={(vlSchema as any).definitions.ScaleType} // TODO don't use any
          uiSchema={uiSchema}
          onSubmit={this.changeFieldProperty.bind(this, 'scale', 'type')}
        />
      </div>
    );
  }

  private toggleCustomizer() {
    if (this.props.showCaret) {
      this.setState({
        customizerIsOpened: !this.state.customizerIsOpened
      });
    }
  }
}

export const FieldCustomizer = CSSModules(FieldCustomizerBase, styles);
