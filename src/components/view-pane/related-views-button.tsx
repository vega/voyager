import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {ActionHandler} from '../../actions/redux-action';
import {RELATED_VIEWS_HIDE_TOGGLE, RelatedViewsAction} from '../../actions/related-views';
import * as styles from './related-views-button.scss';


export interface RelatedViewsButtonProps extends ActionHandler<RelatedViewsAction> {
  hideRelatedViews: boolean;
}

export class RelatedViewsButtonBase extends React.PureComponent<RelatedViewsButtonProps, {}> {
  constructor(props: RelatedViewsButtonProps) {
    super(props);

    this.onHideClick = this.onHideClick.bind(this);
  }

  public render() {
    const {hideRelatedViews} = this.props;
    return (
      <div styleName="right">
        <a onClick={this.onHideClick}>
          {hideRelatedViews ? 'Show' : 'Hide'}
          &nbsp;&nbsp;
          {hideRelatedViews ? <i className='fa fa-toggle-up'/> : <i className='fa fa-toggle-down'/>}
        </a>
      </div>
    );
  }

  private onHideClick() {
    const {hideRelatedViews} = this.props;
    this.props.handleAction({
      type: RELATED_VIEWS_HIDE_TOGGLE,
      payload: {
        newIsHidden: !hideRelatedViews
      }
    });
  }
}

export const RelatedViewsButton = (CSSModules(RelatedViewsButtonBase, styles));

