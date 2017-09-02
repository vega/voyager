
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import * as TetherComponent from 'react-tether';
import {ActionHandler} from '../../actions/redux-action';
import {SpecEncodingAction} from '../../actions/shelf/spec';
import {ShelfFieldDef, ShelfId} from '../../models/shelf/spec/encoding';
import * as styles from './field-customizer.scss';
import {PropertyEditor} from './property-editor';

export interface FieldCustomizerProps extends ActionHandler<SpecEncodingAction> {
  showCaret: boolean;
  shelfId: ShelfId;
  fieldDef: ShelfFieldDef;
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
    const {showCaret, shelfId, handleAction, fieldDef} = this.props;
    return (
      <TetherComponent
        attachment="top left"
        targetAttachment="bottom left"
      >
        <span onClick={this.toggleCustomizer}>
          <i className={(showCaret ? '' : 'hidden ') + 'fa fa-caret-down'}/>
          {' '}
        </span>
        {this.state.customizerIsOpened &&
          <div styleName='customizer-container'>
            {this.customizableProps().map(customizableProp => {
              const {prop, nestedProp} = customizableProp;
              return (
                <PropertyEditor
                  key={JSON.stringify({prop, nestedProp})}
                  prop={prop}
                  nestedProp={nestedProp}
                  shelfId={shelfId}
                  fieldDef={fieldDef}
                  handleAction={handleAction}
                />
              );
            })}
          </div>
        }
      </TetherComponent>
    );
  }

  private toggleCustomizer() {
    if (this.props.showCaret) {
      this.setState({
        customizerIsOpened: !this.state.customizerIsOpened
      });
    }
  }

  private customizableProps() {
    return [{
      prop: 'scale',
      nestedProp: 'type'
    }];
  }
}

export const FieldCustomizer = CSSModules(FieldCustomizerBase, styles);
