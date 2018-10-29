'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { TimeType } from './enums';
import {
  TIME_FORMAT_LONG,
  TIME_FORMAT_SHORT,
  SAVE_WORK_SESSIONS_BETWEEN_STARTUPS,
  HOURLY_RATE,
  SALARY_RELATED_WORK_TYPES,
  SHOULD_TAKE_BREAK_INTERVAL,
} from './constants';
import { window, StatusBarAlignment, StatusBarItem } from 'vscode';
import * as moment from 'moment';
import 'moment-duration-format';
import Logger from './Logger';
import BreakChecker from './BreakChecker';
import hourlyRate, { parseHourlyRate } from './hourlyRate';
import HttpServer from './web/HttpServer';

export function activate(context: vscode.ExtensionContext) {
  const tab = new TimeTracker(context);
  context.subscriptions.push(tab);
}

// this method is called when your extension is deactivated
export function deactivate() {}

export class TimeTracker {
  private _statusBarItem: StatusBarItem;
  protected logger: Logger;
  protected breakChecker: BreakChecker;
  protected inBreak: boolean = false;
  protected paused: boolean = false;
  protected context: vscode.ExtensionContext;
  protected invervalId: NodeJS.Timer;
  protected breakMessageShown: boolean = false;
  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    console.log(context);
    this.logger = new Logger(this.context);
    this.breakChecker = new BreakChecker(
      this.displayShouldTakeABreakMessage,
      this.logger
    );
    if (SAVE_WORK_SESSIONS_BETWEEN_STARTUPS) {
      this.createInterval();
    }
    this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
    this._statusBarItem.command = 'extension.togglePause';
    this._statusBarItem.show();
    vscode.commands.registerCommand(
      'extension.calculateSalary',
      this.calculateSalary
    );
    vscode.commands.registerCommand('extension.resetData', this.resetData);
    vscode.commands.registerCommand('extension.togglePause', this.togglePause);
    vscode.commands.registerCommand('extension.toggleBreak', this.toggleBreak);
    vscode.commands.registerCommand(
      'extension.startWorkLogViewer',
      HttpServer.create
    );
    HttpServer.create(context);
    vscode.commands.registerCommand(
      'extension.stopWorkLogViewer',
      HttpServer.stop
    );
    vscode.commands.registerCommand(
      'extension.stopWorkSession',
      this.stopWorkSession
    );
    vscode.commands.registerCommand(
      'extension.startWorkSession',
      this.startWorkSession
    );
    this.recomputeStatusBar();
  }
  public createInterval = () => {
    this.invervalId = setInterval(() => {
      this.breakChecker.check();
      this.setStatusBarText();
      this.logger.workSession++;
    }, 100);
  };

  public clearInterval() {
    clearInterval(this.invervalId);
  }
  public togglePause = (): void => {
    // start work session if not started
    if (!this.logger.workSession) {
      this.startWorkSession();
      return;
    }

    this.paused = !this.paused;
    if (this.inBreak) {
      vscode.window
        .showWarningMessage(
          `You can't pause because you are in a break`,
          'Stop break'
        )
        .then(e => {
          if (e) {
            this.toggleBreak();
          }
        });
      this.paused = !this.paused; // revert to original
      return;
    }
    if (this.paused) {
      this.clearInterval();
      this.logger.add(TimeType.Pause);
      vscode.window.showInformationMessage('Paused!');
    } else {
      this.createInterval();
      vscode.window.showInformationMessage(
        this.paused ? 'Paused!' : 'Resumed!'
      );
    }
    this.recomputeStatusBar();
  };

  public toggleBreak = (): void => {
    this.inBreak = !this.inBreak;
    if (this.inBreak) {
      vscode.window.showInformationMessage(`You are now taking a break!`);
      this.clearInterval();

      this.logger.add(TimeType.Break);
      this.breakMessageShown = false;
    } else if (this.paused) {
      this.logger.add(TimeType.Pause);
      vscode.window.showInformationMessage('You are now only paused!');
    } else {
      this.logger.add(TimeType.Work);
      vscode.window.showInformationMessage('You are now working!');
      this.createInterval();
    }

    this.recomputeStatusBar();
  };

  public formatTime = (seconds: number, long: boolean = false): string => {
    const duration = <any>moment.duration(seconds, 'seconds');
    return duration.format(long ? TIME_FORMAT_LONG : TIME_FORMAT_SHORT);
  };
  public startWorkSession = (displayMessage = true) => {
    if (this.logger.workSession) {
      vscode.window.showWarningMessage(
        `You can't start a session because it is already started`
      );
      return;
    }
    if (displayMessage) {
      vscode.window.showInformationMessage('Work session started!');
    }
    this.logger.add(TimeType.WorkSessionStart);
    this.logger.workSession = 1;
    this.createInterval();
    this.recomputeStatusBar();
  };
  public recomputeStatusBar = () => {
    this.setStatusBarColor();
    this.setStatusBarTooltip();
    this.setStatusBarText();
  };
  public stopWorkSession = () => {
    if (!this.logger.workSession) {
      vscode.window.showWarningMessage(
        `You can't stop a session because it is already stopped`
      );
      return;
    }
    this.logger.workSession = 0;
    vscode.window.showInformationMessage(
      `Work session stopped! You have worked ${this.formatTime(
        this.logger.workSession
      )}`
    );
    this.logger.add(TimeType.WorkSessionStop);

    this.paused = false;
    this.inBreak = false;
    this.clearInterval();
    this.recomputeStatusBar();
  };

  protected setStatusBarText = (): void => {
    let text: string = '';
    if (this.paused) {
      text = '$(x)';
    } else if (this.inBreak) {
      text = '$(clock)';
    } else if (!this.logger.workSession) {
      text = '$(flame)';
    } else {
      text = '$(triangle-right)';
    }

    text += '  ';
    if (!this.logger.workSession) {
      text += 'Start work session!';
    } else if (this.inBreak) {
      text += 'Taking a break';
    } else {
      text += this.formatTime(this.logger.workSession, this.paused);
    }
    this._statusBarItem.text = text;
  };

  protected setStatusBarTooltip = (): void => {
    let text: string = '';
    if (this.paused) {
      text = `You worked for ${this.formatTime(
        this.logger.workSession,
        true
      )}!`;
    } else if (!this.paused) {
      text = `You are working for ${this.formatTime(
        this.logger.workSession,
        true
      )}!`;
    }
    this._statusBarItem.tooltip = text;
  };

  protected setStatusBarColor = () => {
    let color;
    if (this.paused || this.inBreak) {
      color = new vscode.ThemeColor('descriptionForeground');
    } else if (this.breakMessageShown) {
      color = new vscode.ThemeColor('errorForeground');
    }
    this._statusBarItem.color = color;
  };
  protected displayShouldTakeABreakMessage = () => {
    if (this.breakMessageShown) {
      return;
    }
    vscode.window
      .showWarningMessage(
        `You are working for ${this.formatTime(
          SHOULD_TAKE_BREAK_INTERVAL * 60,
          true
        )}. You should take a break!`,
        'Take a break'
      )
      .then(e => {
        if (e === 'Take a break') {
          this.toggleBreak();
        }
      });
    this.breakMessageShown = true;
    this.recomputeStatusBar();
  };
  calculateSalary = () => {
    if (!HOURLY_RATE) {
      vscode.window
        .showInputBox({
          prompt: 'Enter your hourly rate:',
          placeHolder: '<number> <currency>',
          validateInput: value => {
            if (!parseHourlyRate(value)) {
              return 'Invalid value!';
            }
          },
          value: this.logger.getHourlyRate(),
        })
        .then(value => {
          // save for later and easier usage
          this.logger.setHourlyRate(value);
          this.displaySalary(value);
        });
    } else {
      this.displaySalary();
    }
  };
  displaySalary = (value = '') => {
    const hrate = value || HOURLY_RATE || this.logger.getHourlyRate();
    let last = this.logger.lastWorkTypes(SALARY_RELATED_WORK_TYPES);
    const start = last[last.length - 1].startTime;
    const end = start + this.logger.workSession * 1000;
    const salary = hourlyRate(start, end, hrate);
    if (!salary) {
      vscode.window.showInformationMessage(
        `Invalid salary formatting! Check the config!`
      );
    }
    vscode.window.showInformationMessage(salary);
  };
  public dispose = () => {
    this.stopWorkSession();
    this._statusBarItem.dispose();
  };
  public resetData = () => {
    this.stopWorkSession();
    this.logger.resetAll();
    vscode.window.showInformationMessage('Data erased!');
  };
}
