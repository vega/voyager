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
}

interface Process {
  env: any;
}

declare var process: Process;
