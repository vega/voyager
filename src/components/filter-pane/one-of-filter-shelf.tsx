import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {DateTime} from 'vega-lite/build/src/datetime';
import {FieldOneOfPredicate} from 'vega-lite/build/src/predicate';
import {FILTER_MODIFY_ONE_OF, FilterAction} from '../../actions';
import {insertItemToArray, removeItemFromArray} from '../../reducers/util';
import * as styles from './one-of-filter-shelf.scss';


export interface OneOfFilterShelfProps {
  domain: string[] | number[] | boolean[] | DateTime[];
  filter: FieldOneOfPredicate;
  index: number;
  handleAction: (action: FilterAction) => void;
}

export interface OneOfFilterShelfState {
  hideSearchBar: boolean;
}

export class OneOfFilterShelfBase extends React.PureComponent<OneOfFilterShelfProps, OneOfFilterShelfState> {
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
        <div key={option} className='option-div' styleName='option-row'>
          <label>
            <input
              name={index.toString()}
              value={option}
              type='checkbox'
              checked={(filter.oneOf as any[]).indexOf(option) !== -1}
              onChange={this.toggleCheckbox.bind(this, option)}
            /> {'' + option}
          </label>
          <span onClick={this.onSelectOne.bind(this, option)} styleName='keep-only'>
            Keep Only
          </span>
        </div>
      );
    });
    return (
      <div id={index.toString()}>
        <div styleName='below-header'>
          <span>
            <a styleName='select-all' onClick={this.onSelectAll.bind(this)}>
              Select All
            </a> /
            <a styleName='clear-all' onClick={this.onClearAll.bind(this)}>
              Clear All
            </a>
          </span>
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
        oneOf
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

  private onSelectOne(value: string | number | boolean | DateTime) {
    const {index} = this.props;
    this.filterModifyOneOf(index, [value as any]);
  }

  private onSelectAll() {
    const {domain, index} = this.props;
    this.filterModifyOneOf(index, domain.slice());
  }

  private onClearAll() {
    const {index} = this.props;
    this.filterModifyOneOf(index, []);
  }

  private onClickSearch() {
    if (!this.state.hideSearchBar) {
      const divs = this.getDivs();
      Array.prototype.forEach.call(divs, (div: HTMLDivElement) => {
        div.style.display = 'block';
      });
    }
    this.setState({
      hideSearchBar: !this.state.hideSearchBar
    });
  }

  private onSearch(e: any) {
    const searchedDivs = this.getDivs();
    Array.prototype.forEach.call(searchedDivs, (searchedDiv: HTMLDivElement) => {
      // its first child is label, the label's child is checkbox input
      const searchedOption = searchedDiv.childNodes[0].childNodes[0] as HTMLInputElement;
      if (searchedOption.value.toLowerCase().indexOf(e.target.value.toLowerCase().trim()) === -1) {
        searchedDiv.style.display = 'none';
      } else {
        searchedDiv.style.display = 'block';
      }
    });
  }

  /**
   * returns all div nodes in current filter shelf
   */
  private getDivs() {
    // select the current filter shelf
    const container = document.getElementById(this.props.index.toString());
    // select all divs
    const divs = container.getElementsByClassName('option-div');
    return divs;
  }
}
export const OneOfFilterShelf = CSSModules(OneOfFilterShelfBase, styles);
