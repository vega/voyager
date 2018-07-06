import * as CSSModules from 'react-css-modules';
import {ActionHandler, SpecEncodingAction} from "../../actions";
import {ShelfId, ShelfValueDef} from "../../models";
import React = require("../../../node_modules/@types/react");
import Form from 'react-jsonschema-form';
import * as styles from './value-customizer.scss';

export interface ValueCustomizerProps extends ActionHandler<SpecEncodingAction> {
  shelfId: ShelfId;
  valueDef: ShelfValueDef;
}

export class ValueCustomizerBase extends React.PureComponent<ValueCustomizerProps, {}> {
  public render() {
    // TODO: Figure out the UI of what value-customizer will look like
    return (
      <Form
        schema={{}}
        uiSchema={{}}
        formData={{}}
        // onChange=
      />
    );
  }
}

export const ValueCustomizer = CSSModules(ValueCustomizerBase, styles);
