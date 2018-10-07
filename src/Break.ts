import { SHOULD_TAKE_BREAK_INTERVAL } from './constants';

export default class Break {
  constructor() {}
  public static check(seconds: number) {
    const minutes = seconds / 60;
    if (minutes > SHOULD_TAKE_BREAK_INTERVAL) {
      this.displayBreakMessage();
    }
  }
  public static breakMessage() {}
}
