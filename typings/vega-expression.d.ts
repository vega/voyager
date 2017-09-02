declare module 'vega-expression' {
  export function parse(expr: string): any

  export interface CodegenOption {
    constants?: object;
    functions?: {[key: string]: string | Function};
    blacklist?: string[];
    whitelist?: string[];

    fieldvar?: string;

    globalvar: string | Function;
  }

  export function codegen(options: CodegenOption): (ast: any) => {code: string, fields: object, globals: object};
}
