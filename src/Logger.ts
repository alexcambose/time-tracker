import { TimeType } from './enums';
import * as vscode from 'vscode';
import * as moment from 'moment';
import { STORAGE_DATE_FORMAT_ID } from './constants';
import { ITimeBlock, ITimeDay } from './interfaces';
export default class Logger {
  private workTimes: ITimeBlock[] = [];
  private globalState: vscode.Memento;
  constructor(context: vscode.ExtensionContext) {
    this.globalState = context.globalState;
  }
  public saveWorkTimes(): void {
    this.saveData(this.workTimes);
    console.log(this.getDataFromDay(this.getCurrentDay()));
  }
  protected saveData(data: ITimeBlock[]): void {
    const oldData = this.globalState.get('times');
    this.globalState.update('times', {
      ...oldData,
      [this.getCurrentDay()]: data,
    });
  }
  protected getDataFromDay(time: string): ITimeBlock {
    const allData: ITimeDay = this.globalState.get('times');
    return allData[time];
  }
  protected getCurrentDay(): string {
    return moment().format(STORAGE_DATE_FORMAT_ID);
  }
  // private localStorageData =
  /**
   * adds a log
   */
  public add(type: TimeType) {
    const block: ITimeBlock = {
      type,
      startTime: new Date().getTime(),
    };
    this.workTimes.push(block);
    this.saveWorkTimes();
  }
  public get workTimesToday(): object[] {
    return this.workTimes;
  }
}
