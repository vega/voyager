export class Logger {
  public errors: string[] = [];
  public warnings: string[] = [];
  public infos: string[] = [];
  public debugs: string[] = [];

  public level() {
    return this;
  }

  public error(...args: string[]) {
    this.errors.push(...args);
    return this;
  }

  public warn(...args: string[]) {
    this.warnings.push(...args);
    return this;
  }

  public info(...args: string[]) {
    this.infos.push(...args);
    return this;
  }

  public debug(...args: string[]) {
    this.debugs.push(...args);
    return this;
  }

  public removeAll() {
    this.errors = [];
    this.warnings = [];
    this.infos = [];
    this.debugs = [];
  }
}
