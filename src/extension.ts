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

export class TakeABreak {
    private _statusBarItem: StatusBarItem;
    protected currentTime: Number = 0;
    protected allTime: Number = 0;
    protected breaks: Number = 0;
    protected inBreak: Boolean = false;
    protected paused: Boolean = false;
    protected invervalId: NodeJS.Timer;

    constructor() {
        this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
        this._statusBarItem.text = '$(triangle-right) ' + this.currentTime;
        this._statusBarItem.command = '$(triangle-right) ' + this.currentTime;
        this._statusBarItem.tooltip = `You have worked: ${this._statusBarItem.text} !`;
        this._statusBarItem.show();

        this.invervalId = setInterval(() => {

        }, 1000);

        vscode.commands.registerCommand('extension.togglePause', () => {

        });
    }
    public togglePause() {
        vscode.window.showInformationMessage('Paused!');
    }
    public formatTime(seconds: moment.DurationInputObject): String {
        /* tslint:disable-next-line */
        return moment.duration(seconds, "seconds").format();
    }
    public dispose() {
        this._statusBarItem.dispose();
    }
}
