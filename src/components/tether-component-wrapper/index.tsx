import * as React from 'react';
import * as TetherComponent from 'react-tether';

export interface TetherComponentWrapperProps extends TetherComponentProps {
  // targetComponent: JSX.Element;
  // popupComponent: JSX.Element;
  popupIsOpened: boolean;
  closePopup: () => void;
}

export interface TetherComponentWrapperState {
  popupIsOpened: boolean;
}

export class TetherComponentWrapper extends React.PureComponent<TetherComponentWrapperProps, {}> {
  private targetComponent: HTMLElement;
  private popupComponent: HTMLElement;

  public componentWillUpdate(nextProps: TetherComponentProps, nextState: TetherComponentWrapperState) {
    const {popupIsOpened} = this.props;
    if (popupIsOpened) {
      document.addEventListener('click', this.handleClickOutside.bind(this), true);
    } else {
      document.removeEventListener('click', this.handleClickOutside.bind(this), true);
    }
  }

  public render() {
    const {attachment, targetAttachment, offset} = this.props;
    return (
      <span ref={this.targetRefHandler}>
        <TetherComponent
          attachment={attachment}
          targetAttachment={targetAttachment || 'auto auto'}
          offset={offset || '0 0'} // default offset
        >
          {this.props.children[0]}
          <div ref={this.popupRefHandler}>
            {this.props.children[1]}
          </div>
        </TetherComponent>
      </span>
    );
  }

  private handleClickOutside(e: any) {
    if (!this.props.popupIsOpened || this.targetComponent.contains(e.target) ||
      this.popupComponent.contains(e.target)) {
      return;
    }
    this.props.closePopup();
  }

  private targetRefHandler = (ref: any) => {
    this.targetComponent = ref;
  }
  private popupRefHandler = (ref: any) => {
    this.popupComponent = ref;
  }
}
