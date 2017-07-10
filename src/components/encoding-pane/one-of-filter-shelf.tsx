import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {DateTime} from 'vega-lite/build/src/datetime';

import {OneOfFilter} from 'vega-lite/build/src/filter';
import {FILTER_MODIFY_ONE_OF, FilterAction} from '../../actions/filter';
import {insertItemToArray, removeItemFromArray} from '../../reducers/util';
import * as styles from './one-of-filter-shelf.scss';


export interface OneOfFilterShelfProps {
  domain: string[] | number[] | boolean[] | DateTime[];
  filter: OneOfFilter;
  index: number;
  handleAction: (action: FilterAction) => void;
}

class OneOfFilterShelfBase extends React.Component<OneOfFilterShelfProps, {}> {
  public render() {
    const {domain, filter, index} = this.props;
    const oneOfFilter = (domain as any[]).map(option => {
      return (
        <label key={option} styleName='options'>
          <input
            type='checkbox'
            name={index.toString()}
            value={option}
            checked={(filter.oneOf as any[]).indexOf(option) !== -1}
            onChange={this.toggleCheckbox.bind(this, option)}
          /> {option}
        </label>
      );
    });
    return (
      <div>
        <p styleName='select-all' onClick={this.selectAll.bind(this)}>Select All</p>
        {oneOfFilter}
      </div>
    );
  }

  protected filterModifyOneOf(index: number, oneOf: string[] | number[] | boolean[] | DateTime[]) {
    const {handleAction} = this.props;
    handleAction({
      type: FILTER_MODIFY_ONE_OF,
      payload: {
        index,
        oneOf: oneOf
      }
    });
  }

  private toggleCheckbox(option: string | number | boolean | DateTime) {
    const oneOf = this.props.filter.oneOf;
    const valueIndex = (oneOf as any[]).indexOf(option);
    let changedSelectedValues;
    if (valueIndex === -1) {
      changedSelectedValues = insertItemToArray(oneOf, oneOf.length, option);
    } else {
      changedSelectedValues = removeItemFromArray(oneOf, valueIndex).array;
    }
    this.filterModifyOneOf(this.props.index, changedSelectedValues);
  }

  private selectAll() {
    const {domain, index} = this.props;
    this.filterModifyOneOf(index, domain.slice());
  }
}

export const OneOfFilterShelf = CSSModules(OneOfFilterShelfBase, styles);
