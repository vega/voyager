import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {CUSTOM_WILDCARD_MODIFY_DESCRIPTION, CUSTOM_WILDCARD_REMOVE_FIELD,
        CustomWildcardAction} from '../../actions/custom-wildcard-field';
import {ActionHandler} from '../../actions/redux-action';
import {CustomWildcardFieldDef} from '../../models/custom-wildcard-field';
import {Field} from '../field/index';
import * as styles from './wildcard-field-editor.scss';

export interface CustomWildcardFieldEditorProps extends ActionHandler<CustomWildcardAction> {
  customWildcardFielddef: CustomWildcardFieldDef;
  index: number;
}

export class CustomWildcardFieldEditorBase extends React.PureComponent<CustomWildcardFieldEditorProps, {}> {
  public constructor(props: CustomWildcardFieldEditorProps) {
    super(props);
    this.onRemoveField = this.onRemoveField.bind(this);
    this.onDescriptionChange = this.onDescriptionChange.bind(this);
  }

  public render() {
    const {customWildcardFielddef} = this.props;

    const fields = customWildcardFielddef.field.enum.map((field, fieldIndex) => {
      const fieldObj = {field};
      return (
        <Field
          fieldDef={fieldObj}
          isPill={false}
          draggable={false}
          caretShow={false}
          onRemove={this.onRemoveField.bind(this, field)}
          key={fieldIndex}
        />
      );
    });

    return (
      <div styleName='popup-menu'>
        <div styleName='wildcard-menu'>
          <div>
            <label className='wildcard-title-label'>
              <h4>Description</h4>
              <textarea
                type='text'
                placeholder={'description'}
                value={customWildcardFielddef.description || ''}
                onChange={this.onDescriptionChange}
              />
            </label>
          </div>
          <h4>Wildcard Fields</h4>
          <div className='wildcard-fields'>
            {fields}
          </div>
        </div>
      </div>
    );
  }

  protected onRemoveField(field: string) {
    const {handleAction, index} = this.props;
    handleAction({
      type: CUSTOM_WILDCARD_REMOVE_FIELD,
      payload: {
        field,
        index
      }
    });
  }

  private onDescriptionChange(event: any) {
    const {handleAction, index} = this.props;
    handleAction({
      type: CUSTOM_WILDCARD_MODIFY_DESCRIPTION,
      payload: {
        description: event.target.value,
        index
      }
    });
  }
}

export const CustomWildcardFieldEditor = CSSModules(CustomWildcardFieldEditorBase, styles);
