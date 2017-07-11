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

export interface OneOfFilterShelfState {
  hideSearchBar: boolean;
}

class OneOfFilterShelfBase extends React.Component<OneOfFilterShelfProps, OneOfFilterShelfState> {

  constructor(props: OneOfFilterShelfProps) {
    super(props);
    this.state = ({
      hideSearchBar: true
    });
  }

  public render() {
    const {domain, filter, index} = this.props;
    const oneOfFilter = (domain as any[]).map(option => {
      return (
        <label key={option} styleName='options' style={{display: 'block'}}>
          <input
            name={index.toString()}
            value={option}
            type='checkbox'
            checked={(filter.oneOf as any[]).indexOf(option) !== -1}
            onChange={this.toggleCheckbox.bind(this, option)}
          /> {option}
        </label>
      );
    });
    return (
      <div id={index.toString()}>
        <div styleName='below-header'>
          <a styleName='select-all' onClick={this.onSelectAll.bind(this)}>
            Select All
          </a>
          {this.state.hideSearchBar ?
            null :
            <input type='text' onChange={this.onSearch.bind(this)} autoFocus={true}/>
          }
          <a styleName='search' onClick={this.onClickSearch.bind(this)}>
            <i className='fa fa-search'/>
          </a>
        </div>
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

  private onSelectAll() {
    const {domain, index} = this.props;
    this.filterModifyOneOf(index, domain.slice());
  }

  private onClickSearch() {
    if (!this.state.hideSearchBar) {
      const labels = this.getLabels();
      Array.prototype.forEach.call(labels, (label: HTMLLabelElement) => {
        label.style.display = 'block';
      });
    }
    this.setState({
      hideSearchBar: !this.state.hideSearchBar
    });
  }

  private onSearch(e: any) {
    const searchedLabels: NodeListOf<HTMLLabelElement> = this.getLabels();
    Array.prototype.forEach.call(searchedLabels, (searchedLabel: HTMLLabelElement) => {
      // its first child is checkbox input
      const searchedOption = searchedLabel.childNodes[0] as HTMLInputElement;
      if (searchedOption.value.toLowerCase().indexOf(e.target.value.toLowerCase().trim()) === -1) {
        searchedLabel.style.display = 'none';
      } else {
        searchedLabel.style.display = 'block';
      }
    });
  }

  /**
   * returns all the label nodes in current filter shelf
   */
  private getLabels(): NodeListOf<HTMLLabelElement> {
    // select the current filter shelf
    const container = document.getElementById(this.props.index.toString());
    // select all labels
    const labels = container.querySelectorAll('label');
    return labels;
  }
}
export const OneOfFilterShelf = CSSModules(OneOfFilterShelfBase, styles);
