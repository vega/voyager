import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import * as TetherComponent from 'react-tether';
import {BOOKMARK_ADD_PLOT, BOOKMARK_REMOVE_PLOT, BookmarkAction} from '../../actions/bookmark';
import {ActionHandler} from '../../actions/redux-action';
import {Bookmark} from '../../models/bookmark';
import {PlotObject} from '../../models/plot';
import * as styles from './bookmarkbutton.scss';



export interface BookmarkProps extends ActionHandler<BookmarkAction> {
  bookmark: Bookmark;
  plotObject: PlotObject;
}

export interface BookmarkButtonState {
  openDialog: boolean;
}

export class BookmarkButtonBase extends React.PureComponent<BookmarkProps, BookmarkButtonState> {
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

  public render() {
    const bookmarkColor = (this.isBookmarked()) ? '#0c96d0' : '#aaa';

    return (
      <TetherComponent
          attachment="top right"
          targetAttachment="bottom left"
      >
        <i
          className="fa fa-bookmark command-bookmark"
          style = {{color: bookmarkColor, paddingLeft: '12px', cursor: 'pointer'}}
          onClick = {this.onBookmarkClick}
        />

        {
          this.state.openDialog &&
          <div styleName='bookmark-alert'>
            <div>Remove bookmark?</div>
            <small>Your notes will be lost.</small>
            <div>
              <a onClick={this.onBookmarkRemove}>
                <i className="fa fa-trash-o">&nbsp;&nbsp;remove it&nbsp;&nbsp;</i>
              </a>
              <a onClick={this.onKeepBookmark}>
                <i className="fa fa-bookmark">&nbsp;&nbsp;keep it&nbsp;&nbsp;</i>
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
    const {bookmark, plotObject} = this.props;
    return !!bookmark.dict[JSON.stringify(plotObject.spec)];
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
        spec: this.props.plotObject.spec
      }
    });
  }

  private onBookmarkAdd() {
    this.props.handleAction({
      type: BOOKMARK_ADD_PLOT,
      payload: {
        plotObject: this.props.plotObject
      }
    });
  }

}

export const BookmarkButton = CSSModules(BookmarkButtonBase, styles);
