import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import * as TetherComponent from 'react-tether';
import {BOOKMARK_ADD_PLOT, BOOKMARK_REMOVE_PLOT, BookmarkAction} from '../../actions/bookmark';
import {ActionHandler} from '../../actions/redux-action';
import {Bookmark} from '../../models/bookmark';
import {ResultPlot} from '../../models/result';
import * as styles from './bookmarkbutton.scss';



export interface BookmarkProps extends ActionHandler<BookmarkAction> {
  bookmark: Bookmark;
  plot: ResultPlot;
}

export interface BookmarkButtonState {
  openDialog: boolean;
}

export class BookmarkButtonBase extends React.PureComponent<BookmarkProps, BookmarkButtonState> {
  private bookmarkDialog: HTMLElement;
  private bookmarkPopup: HTMLElement;
  constructor(props: BookmarkProps) {
    super(props);

    this.state = {
      openDialog: false
    };

    this.onBookmarkRemove = this.onBookmarkRemove.bind(this);
    this.onBookmarkAdd = this.onBookmarkAdd.bind(this);
    this.onBookmarkClick = this.onBookmarkClick.bind(this);
    this.onKeepBookmark = this.onKeepBookmark.bind(this);
  }

  public componentWillUpdate(nextProps: BookmarkProps, nextState: BookmarkButtonState) {
    if (!nextState) {
      return;
    }

    if (nextState.openDialog) {
      document.addEventListener('click', this.handleClickOutside.bind(this), true);
    } else if (this.state.openDialog) {
      document.removeEventListener('click', this.handleClickOutside.bind(this), true);
    }
  }

  public render() {
    const styleName = (this.isBookmarked()) ? 'bookmark-command-selected' : 'command';

    return (
      <TetherComponent
        attachment="top right"
        targetAttachment="bottom left"
      >
        <i
          title='Bookmark'
          className="fa fa-bookmark"
          styleName={styleName}
          onClick={this.onBookmarkClick}
        />

        {
          this.state.openDialog &&
          <div styleName='bookmark-alert' ref={this.alertHandler}>
            <div ref={this.bookmarkHandler}>Remove Bookmark?</div>
            <small>Your notes will be lost.</small>
            <div>
              <a onClick={this.onBookmarkRemove}>
                <span styleName='fa-span'><i className="fa fa-trash-o"/>&nbsp;Remove it&nbsp;&nbsp;</span>
              </a>
              <a onClick={this.onKeepBookmark}>
                <span styleName='fa-span'><i className="fa fa-bookmark"/>&nbsp;Keep it&nbsp;&nbsp;</span>
              </a>
            </div>
          </div>
        }
      </TetherComponent>
    );
  }

  private onKeepBookmark() {
    this.setState({openDialog: false});
  }

  private isBookmarked() {
    const {bookmark, plot} = this.props;
    return !!bookmark.dict[JSON.stringify(plot.spec)];
  }

  private onBookmarkClick() {
    if (this.isBookmarked()) {
      this.setState({openDialog: !this.state.openDialog});
    } else {
      this.onBookmarkAdd();
    }
  }

  private onBookmarkRemove() {
    this.setState({openDialog: false});
    this.props.handleAction({
      type: BOOKMARK_REMOVE_PLOT,
      payload: {
        spec: this.props.plot.spec
      }
    });
  }

  private onBookmarkAdd() {
    this.props.handleAction({
      type: BOOKMARK_ADD_PLOT,
      payload: {
        plot: this.props.plot
      }
    });
  }

  private bookmarkHandler = (ref: any) => {
    this.bookmarkPopup = ref;
  }

  private alertHandler = (ref: any) => {
    this.bookmarkDialog = ref;
  }

  private handleClickOutside(e: any) {
    if (this.bookmarkPopup && this.bookmarkDialog && (this.bookmarkDialog.contains(e.target) ||
      this.bookmarkPopup.contains(e.target))) {
      return;
    }
    this.setState({
      openDialog: false
    });
  }
}

export const BookmarkButton = CSSModules(BookmarkButtonBase, styles);
