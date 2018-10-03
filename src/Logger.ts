import { TimeType } from './enums';
import * as vscode from 'vscode';
import * as moment from 'moment';
import { STORAGE_DATE_FORMAT_ID } from './constants';
import { ITimeBlock, ITimeDay } from './interfaces';
/*
Class that works only with data and time, provides a bridge for saving and retreiving data
*/
export default class Logger {
  private workTimes: ITimeBlock[] = [];
  private globalState: vscode.Memento;
  constructor(context: vscode.ExtensionContext) {
    this.globalState = context.globalState;
    console.log('state', this.globalState);
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
  public getDataFromToday(type?: TimeType): ITimeBlock[] {
    let data = this.getDataFromDay(this.getCurrentDay());
    if (type) {
      return data.filter(e => e.type === type);
    }
    return data;
  }
  public getDataFromDay(time: string): [ITimeBlock] {
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
  public get workSession(): number {
    return this.globalState.get('workSession') || 0;
  }
  public set workSession(value: number) {
    this.globalState.update('workSession', value);
  }
  public get workTimesToday(): object[] {
    return this.workTimes;
  }
}
