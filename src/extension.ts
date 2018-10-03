'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { TimeType } from './enums';
import { TIME_FORMAT_LONG, TIME_FORMAT_SHORT } from './constants';
import {
  window,
  workspace,
  commands,
  Disposable,
  ExtensionContext,
  StatusBarAlignment,
  StatusBarItem,
  TextDocument,
} from 'vscode';
import * as moment from 'moment';
import 'moment-duration-format';
import Logger from './Logger';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "take-a-break" is now active!');
  const tab = new TakeABreak(context);
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json

  let disposable = vscode.commands.registerCommand(
    'extension.sayHello',
    () => {}
  );
  context.subscriptions.push(tab);
  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

export class TakeABreak {
  private _statusBarItem: StatusBarItem;
  protected currentTime: number = 10000;
  protected logger: Logger;
  protected inBreak: boolean = false;
  protected paused: boolean = false;
  protected context: vscode.ExtensionContext;
  protected invervalId: number;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.logger = new Logger(this.context);
    this.currentTime = this.logger.workSession;
    this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
    this._statusBarItem.command = 'extension.togglePause';
    this._statusBarItem.show();
    this.createInterval();
    vscode.commands.registerCommand('extension.togglePause', this.togglePause);
    vscode.commands.registerCommand('extension.toggleBreak', this.toggleBreak);
    vscode.commands.registerCommand('extension.stopWorkSession', () => {
      if (!this.logger.workSession) {
        vscode.window.showWarningMessage(
          `You can't stop a session because it is already stopped`
        );
        return;
      }
      this.logger.workSession = 0;
      this.currentTime = this.logger.workSession;
      vscode.window.showInformationMessage('Work session stopped!');
    });
    vscode.commands.registerCommand('extension.startWorkSession', () => {
      if (this.logger.workSession) {
        vscode.window.showWarningMessage(
          `You can't start a session because it is already started`
        );
        return;
      }
      this.createInterval();
      vscode.window.showInformationMessage('Work session started!');
    });
  }
  public createInterval = () => {
    this.invervalId = setInterval(() => {
      this.setStatusBarText();
      this.currentTime++;
      this.logger.workSession = this.currentTime;
      console.log(this.logger.workTimesToday);
    }, 100);
  };
  public togglePause = (): void => {
    this.paused = !this.paused;
    if (this.inBreak) {
      vscode.window
        .showWarningMessage(
          `You can't pause because you are in a break`,
          'Stop break'
        )
        .then(e => {
          if (e) this.toggleBreak();
        });
      this.paused = !this.paused; // revert to original
      return;
    }
    if (this.paused) {
      clearInterval(this.invervalId);
      this.logger.add(TimeType.Pause);
      vscode.window.showInformationMessage('Paused!');
    } else {
      this.createInterval();
      this.logger.add(TimeType.Work);
      vscode.window.showInformationMessage(
        this.paused ? 'Paused!' : 'Resumed!'
      );
    }
    this.setStatusBarColor();
    this.setStatusBarTooltip();
    this.setStatusBarText();
  };

  public toggleBreak = (): void => {
    this.inBreak = !this.inBreak;
    if (this.inBreak) {
      vscode.window.showInformationMessage(
        `You are now taking a break! You have worked ${0} since the last break.`
      );
      clearInterval(this.invervalId);

      this.logger.add(TimeType.Break);
    } else {
      if (this.paused) {
        this.logger.add(TimeType.Pause);
        vscode.window.showInformationMessage('You are now only paused!');
      } else {
        this.logger.add(TimeType.Work);
        vscode.window.showInformationMessage('You are now working!');
      }
      this.createInterval();
    }
    this.setStatusBarColor();
    this.setStatusBarTooltip();
    this.setStatusBarText();
  };

  public formatTime = (seconds: number, long: boolean = false): string => {
    /* tslint:disable-next-line */
    return moment
      .duration(seconds, 'seconds')
      .format(long ? TIME_FORMAT_LONG : TIME_FORMAT_SHORT);
  };

  public setStatusBarText = (): void => {
    let text: string = '';
    if (this.paused) text = '$(x)';
    else if (!this.paused) text = '$(triangle-right)';
    if (this.inBreak) text = '$(clock)';
    if (!this.logger.workSession) text = '$(flame)';
    text += ' ';
    if (this.inBreak) {
      text += 'Taking a break';
    } else {
      text += this.formatTime(this.currentTime, this.paused);
    }
    this._statusBarItem.text = text;
  };

  public setStatusBarTooltip = (): string => {
    let text: string = '';
    if (this.paused)
      text = `You worked for ${this.formatTime(this.currentTime, true)}!`;
    else if (!this.paused)
      text = `You are working for ${this.formatTime(this.currentTime, true)}!`;
    console.log(text, this.paused);
    return text;
  };

  public setStatusBarColor = () => {
    let color;
    if (this.paused || this.inBreak)
      color = new vscode.ThemeColor('descriptionForeground');

    this._statusBarItem.color = color;
  };
  public dispose = () => {
    this._statusBarItem.dispose();
  };
}
