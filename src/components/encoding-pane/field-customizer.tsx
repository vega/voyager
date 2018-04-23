import {ExpandedType} from 'compassql/build/src/query/expandedtype';
import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {Tab, TabList, TabPanel, Tabs} from 'react-tabs'; // eslint-disable-line
import {Channel} from 'vega-lite/build/src/channel';
import {ActionHandler} from '../../actions';
import {SpecEncodingAction} from '../../actions/shelf';
import {ShelfFieldDef, ShelfId} from '../../models/shelf/spec';
import * as styles from './field-customizer.scss';
import {PropertyEditor} from './property-editor';

export interface FieldCustomizerProps extends ActionHandler<SpecEncodingAction> {
  shelfId: ShelfId;
  fieldDef: ShelfFieldDef;
}

export interface CustomProp {
  prop: string;
  nestedProp?: string;
}

const POSITION_FIELD_QUANTITATIVE_INDEX = {
  'Common': [
    {
      prop: 'scale',
      nestedProp: 'type'
    },
    {
      prop: 'axis',
      nestedProp: 'title'
    },
    {
      prop: 'stack'
    }
  ],
  'Scale': [
    {
      prop: 'scale',
      nestedProp: 'type'
    }
  ],
  'Axis': [
    {
      prop: 'axis',
      nestedProp: 'orient'
    },
    {
      prop: 'axis',
      nestedProp: 'title'
    }
  ]
};

const POSITION_FIELD_NOMINAL_INDEX = {
  'Scale': [
    {
      prop: 'scale',
      nestedProp: 'type'
    }
  ],
  'Axis': [
    {
      prop: 'axis',
      nestedProp: 'orient'
    },
    {
      prop: 'axis',
      nestedProp: 'title'
    }
  ]
};

const POSITION_FIELD_TEMPORAL_INDEX = {
  'Scale': [
    {
      prop: 'scale',
      nestedProp: 'type'
    }
  ],
  'Axis': [
    {
      prop: 'axis',
      nestedProp: 'orient'
    },
    {
      prop: 'axis',
      nestedProp: 'title'
    }
  ]
};

export class FieldCustomizerBase extends React.PureComponent<FieldCustomizerProps, {}> {
  public render() {
    const {shelfId, handleAction, fieldDef} = this.props;
    const propertyGroupIndex = this.getFieldPropertyGroupIndex();
    const keys = Object.keys(propertyGroupIndex);
    return (
      <div styleName='field-customizer'>
        <Tabs>
          <TabList>
            {
              keys.map((encodingType, i) => {
                return (
                  <Tab key={i}>{encodingType}</Tab>
                );
              })
            }
          </TabList>
          <div>
            {
              keys.map((encodingType, i) => {
                const customProps: CustomProp[] = propertyGroupIndex[encodingType];
                return (
                  <TabPanel key={encodingType + i}>
                    {
                      customProps.map(customizableProp => {
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
                      })
                    }
                  </TabPanel>
                );
              })}
          </div>
        </Tabs>
      </div>
    );
  }

  private getFieldPropertyGroupIndex() {
    const {shelfId, fieldDef} = this.props;
    if (shelfId.channel === Channel.X || shelfId.channel === Channel.Y) {
      switch (fieldDef.type) {
        case ExpandedType.QUANTITATIVE:
          return POSITION_FIELD_QUANTITATIVE_INDEX;
        case ExpandedType.ORDINAL:
          return POSITION_FIELD_NOMINAL_INDEX;
        case ExpandedType.NOMINAL:
          return POSITION_FIELD_NOMINAL_INDEX;
        case ExpandedType.TEMPORAL:
          return POSITION_FIELD_TEMPORAL_INDEX;
      }
    }
  }
}

export const FieldCustomizer = CSSModules(FieldCustomizerBase, styles);
