import { TimeType } from './enums';

export default class Logger {
  protected workTimes: object[] = [];
  /**
   * adds a log
   */
  public add(type: TimeType) {
    this.workTimes.push({
      type,
      startime: new Date().getTime(),
    });
  }
  public get workTimesToday(): object[] {
    return this.workTimes;
  }
}
