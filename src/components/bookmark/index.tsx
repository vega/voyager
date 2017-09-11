import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import Modal from 'react-modal';
import {connect} from 'react-redux';
import {InlineData} from 'vega-lite/build/src/data';
import {BOOKMARK_CLEAR_ALL, BookmarkAction} from '../../actions/bookmark';
import {ActionHandler, createDispatchHandler} from '../../actions/redux-action';
import {State} from '../../models';
import {Bookmark} from '../../models/bookmark';
import {ResultPlot} from '../../models/result';
import {selectData} from '../../selectors/dataset';
import {selectBookmark} from '../../selectors/index';
import {Plot} from '../plot';
import * as styles from './bookmark.scss';


export interface BookmarkProps extends ActionHandler<BookmarkAction> {
  bookmark: Bookmark;
  data: InlineData;
}

export class BookmarkBase extends React.PureComponent<BookmarkProps, any> {
  constructor(props: BookmarkProps) {
    super(props);

    this.state = {modalIsOpen: false};
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.onClearAll = this.onClearAll.bind(this);
    this.onExport = this.onExport.bind(this);
  }

  public render() {
    return (
      <div>
        <button onClick={this.openModal}>
          <i className="fa fa-bookmark" /> Bookmarks ({this.props.bookmark.count})
        </button>

        <Modal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal}
          contentLabel="Bookmark Selector"
          styleName="modal"
          className="voyager"
        >
          <div className="modal-header">
            <a className="right" onClick={this.closeModal}>Close</a>
            <h3>Bookmarks ({this.props.bookmark.count})</h3>
            <a styleName="bookmark-list-util" onClick={this.onClearAll}>
              <i className="fa fa-trash-o"/>
              {' '}
              Clear all
            </a>
            <a styleName="bookmark-list-util" onClick={this.onExport}>
              <i className="fa fa-clipboard"/>
              {' '}
              Export
            </a>
          </div>

          {this.renderBookmarks(this.props.bookmark)}
        </Modal>
      </div>
    );
  }

  private onExport() {
    const {bookmark} = this.props;

    const specs = [];
    for (const specKey of bookmark.list) {
      const bookmarkItem = bookmark.dict[specKey];
      specs.push({
        ...bookmarkItem.plot.spec,
        description: bookmarkItem.note
      });
    }

    const exportWindow = window.open();
    exportWindow.document.write(
      "<html><body><pre>" +
      JSON.stringify(specs, null, 2) +
      "</pre></body></html>"
    );
    exportWindow.document.close();
  }

  private onClearAll() {
    this.props.handleAction({type: BOOKMARK_CLEAR_ALL});
  }

  private openModal() {
    this.setState({modalIsOpen: true});
  }

  private closeModal() {
    this.setState({modalIsOpen: false});
  }

  private renderBookmarks(bookmark: Bookmark) {
    const {data} = this.props;
    const plots: ResultPlot[] = bookmark.list.map(key => bookmark.dict[key].plot);

    const bookmarkPlotListItems = plots.map((plot, index) => {
      const {spec, fieldInfos} = plot;
      return (
        <Plot
          bookmark={this.props.bookmark}
          closeModal={this.closeModal.bind(this)}
          data={data}
          filters={[]} /* Bookmark specs already have filters included */
          key={index}
          fieldInfos={fieldInfos}
          handleAction={this.props.handleAction}
          isPlotListItem={true}
          showBookmarkButton={true}
          showSpecifyButton={true}
          spec={spec}
        />
      );
    });

    return (
      <div>
        {
          (bookmarkPlotListItems.length > 0) ?
           bookmarkPlotListItems :
           <div styleName="vis-list-empty">You have no bookmarks</div>
        }
      </div>
    );
  }
}

const BookmarkRenderer = CSSModules(BookmarkBase, styles);

export const BookmarkPane = connect(
  (state: State) => {
    return {
      bookmark: selectBookmark(state),
      data: selectData(state)
    };
  },
  createDispatchHandler<BookmarkAction>()
)(BookmarkRenderer);
