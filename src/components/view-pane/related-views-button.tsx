import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {ActionHandler} from '../../actions/redux-action';
import {RELATED_VIEWS_HIDE_TOGGLE, RelatedViewsAction} from '../../actions/related-views';
import * as styles from './related-views-button.scss';


export interface RelatedViewsButtonProps extends ActionHandler<RelatedViewsAction> {
  collapseRelatedViews: boolean;
}

export class RelatedViewsButtonBase extends React.PureComponent<RelatedViewsButtonProps, {}> {
  constructor(props: RelatedViewsButtonProps) {
    super(props);

    this.onHideClick = this.onHideClick.bind(this);
  }

  public render() {
    const {collapseRelatedViews} = this.props;
    return (
      <div styleName="right">
        <a onClick={this.onHideClick}>
          {collapseRelatedViews ? 'Expand' : 'Collapse'}
          &nbsp;&nbsp;
          {collapseRelatedViews ? <i className='fa fa-toggle-up'/> : <i className='fa fa-toggle-down'/>}
        </a>
      </div>
    );
  }

  private onHideClick() {
    const {collapseRelatedViews} = this.props;
    this.props.handleAction({
      type: RELATED_VIEWS_HIDE_TOGGLE,
      payload: {
        newIsCollapsed: !collapseRelatedViews
      }
    });
  }
}

export const RelatedViewsButton = (CSSModules(RelatedViewsButtonBase, styles));

