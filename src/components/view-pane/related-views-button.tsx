import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import { ActionHandler } from '../../actions/redux-action';
import { RELATED_VIEWS_HIDE_TOGGLE, RelatedViewsAction } from '../../actions/related-views';
import { RelatedViews } from '../../models/related-views';
import * as styles from './related-views-button.scss';


export interface RelatedViewsButtonProps extends ActionHandler<RelatedViewsAction> {
  relatedViews: RelatedViews;
}

export class RelatedViewsButtonBase extends React.PureComponent<RelatedViewsButtonProps, {}> {
  constructor(props: RelatedViewsButtonProps) {
    super(props);

    this.onHideClick = this.onHideClick.bind(this);
  }

  public render() {
    return (
      <div styleName="right">
        <a onClick={this.onHideClick}>
          {this.props.relatedViews.isHidden ? 'Show' : 'Hide'}
          &nbsp;&nbsp;
          {this.props.relatedViews.isHidden ?
            <i className="fa fa-toggle-down" /> :
            <i className="fa fa-toggle-up" />
          }
        </a>
      </div>
    );
  }

  private onHideClick() {
    this.props.handleAction({
      type: RELATED_VIEWS_HIDE_TOGGLE
    });
  }
}

export const RelatedViewsButton = (CSSModules(RelatedViewsButtonBase, styles));
