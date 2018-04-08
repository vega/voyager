import * as React from 'react';
import * as CSSModules from 'react-css-modules';
import {connect} from 'react-redux';
import {ActionHandler, createDispatchHandler} from '../../actions/redux-action';
import {RELATED_VIEWS_HIDE_TOGGLE, RelatedViewsAction} from '../../actions/related-views';
import {State, VoyagerConfig} from '../../models';
import {RelatedViews} from '../../models/related-views';
import {selectConfig, selectRelatedViews} from '../../selectors';
import * as styles from './related-views-button.scss';


export interface RelatedViewsButtonProps extends ActionHandler<RelatedViewsAction> {
  relatedViews: RelatedViews;
  config: VoyagerConfig;
}

export class RelatedViewsButtonBase extends React.PureComponent<RelatedViewsButtonProps, {}> {
  constructor(props: RelatedViewsButtonProps) {
    super(props);

    this.onHideClick = this.onHideClick.bind(this);
  }

  public render() {
    const {config, relatedViews} = this.props;
    const {hideRelatedViews} = config;
    const hideCondition = (relatedViews.isHidden === undefined && hideRelatedViews) ||
      (relatedViews.isHidden !== undefined && relatedViews.isHidden);
    return (
      <div styleName="right">
        <a onClick={this.onHideClick}>
          {hideCondition ? "Show" : "Hide"}
          &nbsp;&nbsp;
          {hideCondition ? <i className="fa fa-toggle-up"/> : <i className="fa fa-toggle-down"/>}
        </a>
      </div>
    );
  }

  private onHideClick() {
    const {relatedViews, config} = this.props;
    this.props.handleAction({
      type: RELATED_VIEWS_HIDE_TOGGLE,
      payload: {
        hideRelatedViews: relatedViews.isHidden === undefined ? config.hideRelatedViews : relatedViews.isHidden
      }
    });
  }
}

export const RelatedViewsButton = connect(
  (state: State) => {
    return {
      config: selectConfig(state),
      relatedViews: selectRelatedViews(state)
    };
  },
  createDispatchHandler<RelatedViewsAction>()
)(CSSModules(RelatedViewsButtonBase, styles));
