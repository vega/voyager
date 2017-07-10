// Fix Compile Error: Cannot find module './*.scss`
// From https://github.com/s-panferov/awesome-typescript-loader/issues/146#issuecomment-248808206

declare module '*.scss' {
  const content: any;
  export = content;
}

declare module '*.css' {
  const content: any;
  export = content;
}

declare module 'font-awesome-webpack' {
  var x: any;
  export = x;
}

declare module 'vega' {
  export function parse(spec: any, config?: any): any;
  export function read(data: any, schema: any, dateParse?: any): any;
}

declare module 'react-modal' {
  const Modal: any;
  export default Modal;
}

declare const Modal: any;

interface ClipboardButtonProps {
  onSuccess?: any;
  'data-clipboard-text': string;
}

declare module 'react-clipboard.js' {
  const ClipboardButton: any;
  export = ClipboardButton;
}

declare module 'rc-slider' {
  export default class Slider extends React.Component<any, {}> { }
  export class Range extends React.Component<any, {}> { }
  export class Handle extends React.Component<any, {}> { }
  export const createSliderWithTooltip: any;
}

declare module 'react-edit-inline' {
  const InlineEdit: any;
  export default InlineEdit;
}

interface Process {
  env: any;
}

declare var process: Process;
