import * as vscode from "vscode";
import * as config from "./config";
import { TGist } from "./GitHub/types";

export enum MessageType {
    info = "Info",
    warning = "Warning",
    error = "Error",
    verbose = "Verbose",
    debug = "Debug",
}

export class Output {
    private _outputChannel: any;
    public messageType = MessageType;

    constructor() {
        this._outputChannel = vscode.window.createOutputChannel("Virtual Gists");
    }

    private getDate(): string {
        const date = new Date();
        let timePart = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}`;
        let datePart = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`; // prettier-ignore
        return `${datePart} ${timePart}`;
    }

    public appendLine(message: string, messageType: MessageType) {
        if (config.get("EnableTracing")) {
            this._outputChannel.appendLine(`${this.getDate()} - ${messageType}: ${message}`);
        }
    }

    public hide() {
        this._outputChannel.hide();
    }

    public show() {
        this._outputChannel.show();
    }

    public dispose() {
        this._outputChannel.dispose();
    }

    public logError(gist: TGist, error: any) {
        this.log(gist, error, this.messageType.error);
    }
    public logWarning(gist: TGist, error: any) {
        this.log(gist, error, this.messageType.warning);
    }
    public logInfo(gist: TGist, error: any) {
        this.log(gist, error, this.messageType.info);
    }
    public logDebug(gist: TGist, error: any) {
        this.log(gist, error, this.messageType.debug);
    }
    public logVerbose(gist: TGist, error: any) {
        this.log(gist, error, this.messageType.verbose);
    }

    private log(gist: TGist, error: any, messageType: MessageType) {
        if (error.name === "HttpError") {
            this.appendLine(`Error reading gist ${gist.id}: ${error.response.data.message}`, messageType);
        } else {
            this.appendLine(`${gist.id}: ${error.response}`, this.messageType.error);
        }
    }
}
