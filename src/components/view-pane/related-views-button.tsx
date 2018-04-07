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
    const {config} = this.props;
    return (
      <div styleName="right">
        <a onClick={this.onHideClick}>
          {this.props.relatedViews.isHidden === undefined ? config.hideRelatedViews ? 'Show' : 'Hide' :
            this.props.relatedViews.isHidden ? 'Show' : 'Hide'}
          {/*{this.props.relatedViews.isHidden ? 'Show' : 'Hide'}*/}
          &nbsp;&nbsp;
          {!this.props.relatedViews.isHidden ?
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


export const RelatedViewsButton = connect(
  (state: State) => {
    return {
      config: selectConfig(state),
      relatedViews: selectRelatedViews(state)
    };
  },
  createDispatchHandler<RelatedViewsAction>()
)(CSSModules(RelatedViewsButtonBase, styles));
