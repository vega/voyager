import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import * as TetherComponent from 'react-tether';
import {FacetedCompositeUnitSpec} from 'vega-lite/build/src/spec';
import {BOOKMARK_ADD_PLOT, BOOKMARK_REMOVE_PLOT, BookmarkAction} from '../../actions/bookmark';
import {ActionHandler} from '../../actions/redux-action';
import {Bookmark} from '../../models/bookmark';
import {PlotFieldInfo} from '../../models/plot';
import * as styles from './bookmarkbutton.scss';



export interface BookmarkProps extends ActionHandler<BookmarkAction> {
  bookmark: Bookmark;
  plotObjectFieldInfos: PlotFieldInfo[];
  plotObjectSpec: FacetedCompositeUnitSpec;
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
    const openDialog = (this.state.openDialog) ? 'block' : 'none';

    let bookmarkAlert;
    if (this.state.openDialog) {
      bookmarkAlert = (
        <div styleName="bookmarkAlert" style={{display: openDialog}}>
          <div>Remove bookmark?</div>
          <small>Your notes will be lost</small>
          <div>
            <a onClick={this.onBookmarkRemove}>
              <i className="fa fa-trash-o">Remove it</i>
            </a>
            <a onClick={this.onKeepBookmark}>
              <i className="fa fa-bookmark">Keep it</i>
            </a>
          </div>
        </div>
      );
    }

    return (
      <TetherComponent
          attachment="top right"
          targetAttachment="bottom left"
      >
        <i
          className="fa fa-bookmark command-bookmark"
          style = {{color: bookmarkColor, paddingLeft: '3px'}}
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
    const {bookmark, plotObjectSpec} = this.props;
    return !!bookmark.dict[JSON.stringify(plotObjectSpec)];
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
        spec: this.props.plotObjectSpec
      }
    });
  }

  private onBookmarkAdd() {
    this.props.handleAction({
      type: BOOKMARK_ADD_PLOT,
      payload: {
        plot: {
          fieldInfos: this.props.plotObjectFieldInfos,
          spec: this.props.plotObjectSpec
        }
      }
    });
  }

}

export const BookmarkButton = CSSModules(BookmarkButtonBase, styles);
