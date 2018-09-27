'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { window, workspace, commands, Disposable, ExtensionContext, StatusBarAlignment, StatusBarItem, TextDocument } from 'vscode';
import * as moment from 'moment';
import "moment-duration-format";
console.log('a')
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "take-a-break" is now active!');
    const tab = new TakeABreak();
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json


    let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World!');
    });
    context.subscriptions.push(tab);
    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}
const TIME_FORMAT_LONG: string = 'h [hours and] m [minutes]';
const TIME_FORMAT_SHORT: string = 'h[h] mm[m]';
export class TakeABreak {
    private _statusBarItem: StatusBarItem;
    protected currentTime: number = 10000;
    protected workTimes<number> =[];
    protected breaks: number = 0;
    protected inBreak: boolean = false;
    protected paused: boolean = false;
    protected invervalId: number;

    constructor() {
        this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
        this._statusBarItem.command = 'extension.togglePause';
        this._statusBarItem.show();
        this.createInterval();
        vscode.commands.registerCommand('extension.togglePause', this.togglePause);
        vscode.commands.registerCommand('extension.toggleBreak', this.toggleBreak);
        // vscode.commands.registerCommand('extension.togglePause', () => { });
    }
    public createInterval = () => {
        this.invervalId = setInterval(() => {
            this.setStatusBarText();
            this.currentTime++;
        }, 1000);
    }
    public togglePause = () => {
        this.paused = !this.paused;
        if (this.paused) {
            clearInterval(this.invervalId);
            vscode.window.showInformationMessage('Paused!');

        }
        else {
            this.createInterval();
            vscode.window.showInformationMessage(this.paused ? 'Paused!' : 'Resumed!');

        }
        this.setStatusBarColor();
        this.setStatusBarTooltip();
    }
    public formatTime = (seconds: number, long: boolean = false): string => {
        /* tslint:disable-next-line */
        return moment.duration(seconds, "seconds").format(long ? TIME_FORMAT_LONG : TIME_FORMAT_SHORT);
    }
    public setStatusBarText = (): void => {
        let text: string = '';
        if (this.paused) text = '$(x)';
        else if (!this.paused) text = '$(triangle-right)';

        text += ' ';
        text += this.formatTime(this.currentTime);
        this._statusBarItem.text = text;
    }

    public setStatusBarTooltip = (): string => {
        let text: string = '';
        if (this.paused) text = `You worked for ${this.formatTime(this.currentTime, true)}!`;
        else if (!this.paused) text = `You are working for ${this.formatTime(this.currentTime, true)}!`;
        console.log(text, this.paused)
        return text;
    }

    public setStatusBarColor = () => {
        let color;
        if (this.paused) color = new vscode.ThemeColor('descriptionForeground');

        this._statusBarItem.color = color;
    }

    public dispose = () => { this._statusBarItem.dispose(); }
}
