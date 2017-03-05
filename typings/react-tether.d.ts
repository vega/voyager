type AttachmentPosition = 'auto auto' | 'top left' | 'top center' | 'top right' | 'middle left' | 'middle center' | 'middle right' | 'bottom left' | 'bottom center' | 'bottom right';

interface TetherComponentProps {
  renderElementTag?: string,
  renderElementTo?: string | {appendChild: Function},

  bodyElement?: any;

  attachment?: AttachmentPosition
  targetAttachment?: AttachmentPosition,
  offset?: string,
  targetOffset?: string,
  targetModifier?: string,
  enabled?: boolean,
  classes?: Object,
  classPrefix?: string,
  optimizations?: Object,
  constraints?: any[],
  id?: string,
  className?: string,
  style?: Object,
  onUpdate?: Function,
  onRepositioned?: Function,
  children?: any[];
}
declare module 'react-tether' {
  class TetherComponent extends React.PureComponent<TetherComponentProps, {}> {}
  export = TetherComponent;
  namespace TetherComponent {}
}
