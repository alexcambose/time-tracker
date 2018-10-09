import {
  SHOULD_TAKE_BREAK_INTERVAL,
  BREAK_RELATED_WORK_TYPES,
} from './constants';
import Logger from './Logger';

export default class BreakChecker {
  protected onBreak: Function;
  protected logger: Logger;
  constructor(onBreak: Function, logger: Logger) {
    this.onBreak = onBreak;
    this.logger = logger;
  }
  public check() {
    if (!SHOULD_TAKE_BREAK_INTERVAL) {
      return;
    }
    // this.logger.workSession is in seconds
    const breakRelatedTimeBlocks = this.logger.lastWorkTypes(
      BREAK_RELATED_WORK_TYPES
    );
    const lastBreakTime =
      breakRelatedTimeBlocks[breakRelatedTimeBlocks.length - 1].startTime;
    if ((Date.now() - lastBreakTime) / 60000 > SHOULD_TAKE_BREAK_INTERVAL) {
      this.breakMessage();
    }
  }
  protected breakMessage() {
    this.onBreak();
  }
}
