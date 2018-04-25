import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {Tab, TabList, TabPanel, Tabs} from 'react-tabs'; // eslint-disable-line
import {ActionHandler} from '../../actions';
import {SpecEncodingAction} from '../../actions/shelf';
import {ShelfFieldDef, ShelfId} from '../../models/shelf/spec';
import * as styles from './field-customizer.scss';
import {PropertyEditor} from './property-editor';
import {getFieldPropertyGroupIndex} from './property-editor-schema';

export interface FieldCustomizerProps extends ActionHandler<SpecEncodingAction> {
  shelfId: ShelfId;
  fieldDef: ShelfFieldDef;
}

export interface CustomProp {
  prop: string;
  nestedProp?: string;
}

export class FieldCustomizerBase extends React.PureComponent<FieldCustomizerProps, {}> {
  public render() {
    const {shelfId, handleAction, fieldDef} = this.props;
    const propertyGroupIndex = getFieldPropertyGroupIndex(shelfId, fieldDef);
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
                            propTab={encodingType}
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
}

export const FieldCustomizer = CSSModules(FieldCustomizerBase, styles);
