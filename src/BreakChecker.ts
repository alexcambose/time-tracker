import { SHOULD_TAKE_BREAK_INTERVAL } from './constants';
import Logger from './Logger';
import { TimeType } from './enums';

export default class BreakChecker {
  protected onBreak: Function;
  protected logger: Logger;
  constructor(onBreak: Function, logger: Logger) {
    this.onBreak = onBreak;
    this.logger = logger;
  }
  public check() {
    const minutes = 100;
    console.log(this.logger.lastWorkTypes());
    if (minutes > SHOULD_TAKE_BREAK_INTERVAL) {
      // this.breakMessage();
    }
  }
  protected breakMessage() {
    this.onBreak();
  }
}
