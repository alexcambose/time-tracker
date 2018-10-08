import { TimeType } from './enums';
import * as vscode from 'vscode';
import * as moment from 'moment';
import {
  STORAGE_DATE_FORMAT_ID,
  SAVE_WORK_SESSIONS_BETWEEN_STARTUPS,
} from './constants';
import { ITimeBlock } from './interfaces';
/*
Class that works only with data and time, provides a bridge for saving and retreiving data
*/
export default class Logger {
  private workTimes: ITimeBlock[] = [];
  private globalState: vscode.Memento;
  constructor(context: vscode.ExtensionContext) {
    this.globalState = context.globalState;
    // if false, create a new work session each time is initialized
    if (!SAVE_WORK_SESSIONS_BETWEEN_STARTUPS) {
      this.workSession = 0;
    }
  }
  public saveWorkTimes(): void {
    this.saveWorkData(this.workTimes);
  }
  protected saveWorkData(data: ITimeBlock[]): void {
    const oldData = this.globalState.get('times');
    this.workTimes = [];
    this.globalState.update('times', {
      ...oldData,
      [this.getCurrentDay()]: [...this.getDataFromToday(), ...data],
    });
  }
  public getDataFromToday(type?: TimeType): ITimeBlock[] {
    let data = this.getDataFromDay(this.getCurrentDay());
    if (type) {
      return data.filter(e => e.type === type);
    }
    return data;
  }
  public getDataFromDay(time: string): ITimeBlock[] | undefined {
    const allData = this.globalState.get('times');
    return allData[time] || [];
  }

  /**
   * Get last time blocks
   * @param  {[TimeType]|TimeType} timeType -
   */
  public lastWorkTypes(timeType?: TimeType[] | TimeType): ITimeBlock[] {
    const allData = this.globalState.get('times');
    // get all time keys and reverse the array wso we can access it with index 0 the newest
    let dates = Object.keys(allData).reverse();
    // store all filtered time block in an array
    let lastTimeBlocks = [];
    // while we haven't found any time blocks and we still have date objects remaining to search for
    while (!lastTimeBlocks.length && dates.length) {
      lastTimeBlocks = allData[dates[0]];
      // get current day array object [{}, {}, {}] and
      if (timeType) {
        // filter by the work type(s) if it is specified
        lastTimeBlocks = lastTimeBlocks.filter(
          ({ type }) =>
            Array.isArray(timeType) // if searched types are an array
              ? timeType.indexOf(type) !== -1
              : type === timeType // if it's a string
        );
      }

      //remove first element from the reversed array
      dates.shift();
    }
    return lastTimeBlocks;
  }
  public setHourlyRate = value => this.globalState.update('hrate', value);
  public getHourlyRate = (): string => this.globalState.get('hrate');

  protected getCurrentDay(): string {
    return moment().format(STORAGE_DATE_FORMAT_ID);
  }
  /**
   * adds a log
   */
  public add(type: TimeType) {
    const block: ITimeBlock = {
      type,
      startTime: Date.now(),
    };

    this.workTimes.push(block);
    this.saveWorkTimes();
  }
  public get workSession(): number {
    return this.globalState.get('workSession') || 0;
  }
  public set workSession(value: number) {
    // this.saveWorkTimes();
    this.globalState.update('workSession', value);
  }
  public get workTimesToday(): object[] {
    return this.workTimes;
  }
}
