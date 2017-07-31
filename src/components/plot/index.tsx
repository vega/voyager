import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {FacetedCompositeUnitSpec} from 'vega-lite/build/src/spec';

import * as styles from './plot.scss';

import * as CopyToClipboard from 'react-copy-to-clipboard';
import {Bookmark} from '../../models/bookmark';

import * as TetherComponent from 'react-tether';
import {BOOKMARK_MODIFY_NOTE, BookmarkAction} from '../../actions/bookmark';
import {ActionHandler} from '../../actions/redux-action';
import {SHELF_SPEC_LOAD, SHELF_SPEC_PREVIEW, SHELF_SPEC_PREVIEW_DISABLE, ShelfAction} from '../../actions/shelf';
import {PLOT_HOVER_MIN_DURATION} from '../../constants';
import {PlotFieldInfo} from '../../models/plot';
import {Field} from '../field/index';
import {VegaLite} from '../vega-lite/index';
import {BookmarkButton} from './bookmarkbutton';

export interface PlotProps extends ActionHandler<ShelfAction | BookmarkAction> {
  fieldInfos?: PlotFieldInfo[];
  isPlotListItem?: boolean;
  showBookmarkButton?: boolean;
  showSpecifyButton?: boolean;
  spec: FacetedCompositeUnitSpec;
  bookmark?: Bookmark;
}

export interface PlotState {
  hovered: boolean;
  preview: boolean;
  copiedPopupIsOpened: boolean;
}

export class PlotBase extends React.PureComponent<PlotProps, PlotState> {

  private hoverTimeoutId: number;
  private previewTimeoutId: number;
  private vegaLiteWrapper: HTMLElement;

  constructor(props: PlotProps) {
    super(props);
    this.state = {
      hovered: false,
      preview: false,
      copiedPopupIsOpened: false
    };

    // Bind - https://facebook.github.io/react/docs/handling-events.html
    this.handleTextChange = this.handleTextChange.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onPreviewMouseEnter = this.onPreviewMouseEnter.bind(this);
    this.onPreviewMouseLeave = this.onPreviewMouseLeave.bind(this);
    this.onSpecify = this.onSpecify.bind(this);
  }

  public componentDidUpdate(prevProps: PlotProps, prevState: PlotState) {
    // We have to check this here since we do not know if it is vertically overflown
    // during render time.
    if (!this.isVerticallyOverFlown(this.vegaLiteWrapper) && this.state.hovered) {
      // add a padding similar to .plot
      this.vegaLiteWrapper.style.paddingRight = '11px';
    } else {
      // reset state otherwise, so we clean up what we add in the case above.
      delete this.vegaLiteWrapper.style.paddingRight;
    }
  }

  public render() {
    const {isPlotListItem, showBookmarkButton, showSpecifyButton, spec} = this.props;

    let notesDiv;
    const specKey = JSON.stringify(spec);
    if (this.props.bookmark.dict[specKey]) {
      notesDiv = (
        <textarea
          type='text'
          placeholder={'notes'}
          value={this.props.bookmark.dict[specKey].note}
          onChange={this.handleTextChange}
        />
      );
    }

    return (
      <div styleName={isPlotListItem ? 'plot-list-item-group' : 'plot-group'}>
        <div styleName="plot-info">
          <div styleName="plot-command">
            {showSpecifyButton && this.specifyButton()}
            {showBookmarkButton && this.bookmarkButton()}
            <TetherComponent
              attachment='bottom left'
              offset='0px 30px'
            >
              {this.copySpecButton()}
              {this.state.copiedPopupIsOpened && <span styleName='copied'>copied</span>}
            </TetherComponent>
          </div>
          <span
            onMouseEnter={this.onPreviewMouseEnter}
            onMouseLeave={this.onPreviewMouseLeave}
          >
            {this.fields()}
          </span>
        </div>
        <div
          ref={this.vegaLiteWrapperRefHandler}
          styleName={this.state.hovered ? 'plot-scroll' : 'plot'}
          className="persist-scroll"
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <VegaLite spec={spec}/>
        </div>
        {notesDiv}
      </div>
    );
  }

  protected componentWillUnmount() {
    this.clearHoverTimeout();
  }

  private fields() {
    const {fieldInfos} = this.props;
    if (fieldInfos) {
      return fieldInfos.map(fieldInfo => {
        const {fieldDef, isEnumeratedWildcardField} = fieldInfo;
        return (
          <div styleName="plot-field-info" key={JSON.stringify(fieldDef)}>
            <Field
              fieldDef={fieldDef}
              draggable={false}
              isEnumeratedWildcardField={isEnumeratedWildcardField}
              isPill={false}
            />
          </div>
        );
      });
    }
    return undefined;
  }

  private clearHoverTimeout() {
    if (this.hoverTimeoutId) {
      clearTimeout(this.hoverTimeoutId);
      this.hoverTimeoutId = undefined;
    }
  }

  private clearPreviewTimeout() {
    if (this.previewTimeoutId) {
      clearTimeout(this.previewTimeoutId);
      this.previewTimeoutId = undefined;
    }
  }

  private onMouseEnter() {
    this.hoverTimeoutId = setTimeout(
      () => {
        // TODO log action
        this.setState({hovered: true});
        this.hoverTimeoutId = undefined;
      },
      PLOT_HOVER_MIN_DURATION
    );
  }

  private onMouseLeave() {
    this.clearHoverTimeout();
    if (this.state.hovered) {
      this.setState({hovered: false});
    }
  }

  private onSpecify() {
    this.onPreviewMouseLeave();
    const {handleAction, spec} = this.props;
    handleAction({
      type: SHELF_SPEC_LOAD,
      payload: {spec}
    });
  }

  private onPreviewMouseEnter() {
    this.previewTimeoutId = setTimeout(
      () => {
        const {handleAction, spec} = this.props;
        this.setState({preview: true});
        handleAction({
          type: SHELF_SPEC_PREVIEW,
          payload: {spec}
        });
        this.previewTimeoutId = undefined;
      },
      PLOT_HOVER_MIN_DURATION
    );
  }

  private onPreviewMouseLeave() {
    this.clearPreviewTimeout();
    if (this.state.preview) {
      this.setState({preview: false});
      const {handleAction} = this.props;
      handleAction({type: SHELF_SPEC_PREVIEW_DISABLE});
    }
  }

  private specifyButton() {
    return <i
      className="fa fa-server"
      styleName="specify-command"
      onClick={this.onSpecify}
      onMouseEnter={this.onPreviewMouseEnter}
      onMouseLeave={this.onPreviewMouseLeave}
    />;
  }

  private bookmarkButton() {
    const plotObject = {
      fieldInfos: this.props.fieldInfos,
      spec: this.props.spec
    };
    return (
      <BookmarkButton
        bookmark = {this.props.bookmark}
        plotObject = {plotObject}
        handleAction = {this.props.handleAction}
      />
    );
  }

  private handleTextChange(event: any) {
    const {handleAction} = this.props;
    handleAction({
      type: BOOKMARK_MODIFY_NOTE,
      payload: {
        note: event.target.value,
        spec: this.props.spec
      }
    });
  }

  private copySpecButton() {
    return (
      <CopyToClipboard
        onCopy={this.copied.bind(this)}
        text={JSON.stringify(this.props.spec, null, 2)}>
        <i className='fa fa-clipboard' styleName='command'/>
      </CopyToClipboard>
    );
  }

  private copied() {
    this.setState({
      copiedPopupIsOpened: true
    });
    window.setTimeout(() => {
      this.setState({
        copiedPopupIsOpened: false
      });
    }, 1000);
  }

  private isVerticallyOverFlown(element: HTMLElement) {
    return element.scrollHeight > element.clientHeight;
  }

  private vegaLiteWrapperRefHandler = (ref: any) => {
    this.vegaLiteWrapper = ref;
  }
}

export const Plot = CSSModules(PlotBase, styles);
