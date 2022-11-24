import { Uri, window, workspace } from "vscode";
import * as config from "./config";

/**
 * Possible answers to the question "Do you want to overwrite the file?"
 *
 * @export
 * @enum {number}
 */
export enum confirmOverwriteOptions {
    "Yes" = "Yes",
    "YesToAll" = "YesToAll",
    "No" = "No",
    "NoToAll" = "NoToAll",
    "Cancel" = "Cancel",
}

/**
 * Class to aks and handle the question "Do you want to overwrite the file?"
 *
 * @export
 * @class overwriteFile
 * @typedef {confirmOverwrite}
 */
export class confirmOverwrite {
    public userChoice: confirmOverwriteOptions | undefined;
    private _overwrite = false;
    private overwriteConfig: string;

    /**
     * Signals that the user wants to cancel the download operation.
     *
     * @public
     */
    public cancel() {
        this.userChoice = confirmOverwriteOptions.Cancel;
    }

    constructor() {
        this.overwriteConfig = config.get("downloadOverwrite");
    }

    /**
     * Ask the user if he wants to overwrite the file or folder.
     * If the user already answered "Yas to all" or "No to all", we won't ask again unless a new download command is issued.
     *
     * @private
     * @async
     * @param {Uri} uri Usi of the file or folder to be overwritten.
     * @returns {Promise<boolean>}
     */
    private async askUser(uri: Uri): Promise<boolean> {
        let response: string | undefined;

        if (this.overwriteConfig === "always") {
            this.userChoice = confirmOverwriteOptions.YesToAll;
        }

        if (this.overwriteConfig === "never") {
            this.userChoice = confirmOverwriteOptions.NoToAll;
        }

        if (this.userChoice === undefined || this.userChoice === confirmOverwriteOptions.Yes || this.userChoice === confirmOverwriteOptions.No) {
            response = await window.showWarningMessage(
                `"${uri.fsPath}" already exists. Overwrite?`,
                { modal: true },
                confirmOverwriteOptions.Yes,
                confirmOverwriteOptions.YesToAll,
                confirmOverwriteOptions.No,
                confirmOverwriteOptions.NoToAll
            );
            this.userChoice = <confirmOverwriteOptions>response ?? confirmOverwriteOptions.Cancel;
        }

        if (this.userChoice === confirmOverwriteOptions.Yes || this.userChoice === confirmOverwriteOptions.YesToAll) {
            return Promise.resolve(true);
        }

        return Promise.resolve(false);
    }

    /**
     * Track if the user wants to overwrite the file or folder.
     *
     * @public
     * @async
     * @param {Uri} uri Uri of the file or folder to be overwritten.
     * @returns {Promise<boolean>}
     */
    public async confirm(uri: Uri): Promise<boolean> {
        await workspace.fs.stat(uri).then(
            async (stat) => {
                if (stat) {
                    this._overwrite = await this.askUser(uri);
                }
            },
            (err) => {
                if (err.code === "FileNotFound") {
                    // the file or folder doesn't exist, so we can just continue the loop
                    this._overwrite = true;
                }
            }
        );

        return Promise.resolve(this._overwrite);
    }
}
