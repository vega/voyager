import * as React from "react";

import {FieldDef} from '../../models';

interface FieldInfoProps {
  fieldDef: FieldDef;
};


class FieldInfo extends React.Component<FieldInfoProps, {}> {
  public render(): JSX.Element {
    const {field, type} = this.props.fieldDef;
    return (
      <div className="FieldInfo">
        {field} ({type.charAt(0)})
      </div>
    );
  }
};

export default FieldInfo;
