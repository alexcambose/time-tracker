'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { TimeType } from './enums';
import { TIME_FORMAT_LONG, TIME_FORMAT_SHORT } from './constants';
import { window, StatusBarAlignment, StatusBarItem } from 'vscode';
import * as moment from 'moment';
import 'moment-duration-format';
import Logger from './Logger';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  const tab = new TimeTracker(context);
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json

  context.subscriptions.push(tab);
}

// this method is called when your extension is deactivated
export function deactivate() {}

export class TimeTracker {
  private _statusBarItem: StatusBarItem;
  protected currentTime: number;
  protected logger: Logger;
  protected inBreak: boolean = false;
  protected paused: boolean = false;
  protected context: vscode.ExtensionContext;
  protected invervalId: NodeJS.Timer;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.logger = new Logger(this.context);
    this.currentTime = this.logger.workSession;
    if (this.currentTime) {
      this.createInterval();
    }
    this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
    this._statusBarItem.command = 'extension.togglePause';
    this._statusBarItem.show();
    vscode.commands.registerCommand('extension.togglePause', this.togglePause);
    vscode.commands.registerCommand('extension.toggleBreak', this.toggleBreak);
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
    this.logger.add(TimeType.Work);
    this.logger.workSession = 1; // set to 1 for instant change

    this.invervalId = setInterval(() => {
      this.setStatusBarText();
      this.currentTime++;
      this.logger.workSession = this.currentTime;
    }, 1000);
  };
  public clearInterval() {
    clearInterval(this.invervalId);
  }
  public togglePause = (): void => {
    // start work session if not started
    if (!this.currentTime) {
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
      vscode.window.showInformationMessage(
        `You are now taking a break! You have worked ${0} since the last break.`
      );
      this.clearInterval();

      this.logger.add(TimeType.Break);
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
  public startWorkSession = () => {
    if (this.logger.workSession) {
      vscode.window.showWarningMessage(
        `You can't start a session because it is already started`
      );
      return;
    }
    vscode.window.showInformationMessage('Work session started!');
    this.logger.add(TimeType.WorkSession);
    this.currentTime = 1;
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
    this.currentTime = this.logger.workSession;
    vscode.window.showInformationMessage('Work session stopped!');
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

    text += ' ';
    if (!this.currentTime) {
      text += 'Start work session!';
    } else if (this.inBreak) {
      text += 'Taking a break';
    } else {
      text += this.formatTime(this.currentTime, this.paused);
    }
    this._statusBarItem.text = text;
  };

  protected setStatusBarTooltip = (): string => {
    let text: string = '';
    if (this.paused) {
      text = `You worked for ${this.formatTime(this.currentTime, true)}!`;
    } else if (!this.paused) {
      text = `You are working for ${this.formatTime(this.currentTime, true)}!`;
    }
    return text;
  };

  protected setStatusBarColor = () => {
    let color;
    if (this.paused || this.inBreak) {
      color = new vscode.ThemeColor('descriptionForeground');
    }

    this._statusBarItem.color = color;
  };
  public dispose = () => {
    this.stopWorkSession();
    this._statusBarItem.dispose();
  };
}
