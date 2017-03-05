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
