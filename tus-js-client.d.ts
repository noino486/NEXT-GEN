declare module 'tus-js-client/lib/browser/index.js' {
  export class Upload {
    constructor(file: File, options: Record<string, unknown>);
    start(): void;
    abort(): void;
  }
}
