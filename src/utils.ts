import { commands, Uri, window, workspace } from "vscode";
import * as config from "./config";
import { extensionContext, store } from "./extension";
import { SortDirection, SortType } from "./FileSystem/storage";
import { GlobalStorageKeys } from "./GitHub/constants";

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

/**
 * Returns a valid file system name for the file represented by the given URI.
 *
 * @export
 * @param {string} name The file or folder name to validate
 * @returns {string}
 */
export function ensureIsValidFileSystemName(name: string): string {
    // name cannot begin with a slash (even if it is a valid html character and it would not be removed by Uri.toString())
    if (name[0] === "/") {
        name = name.substring(1);
    }

    // remove invalid file system characters
    name = name.replace(/[\/|\\:*?#"<>]/g, "_");

    // remove unicode characters (emoji)
    name = name.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "_");

    // a file system name cannot be longer than 255 characters, but I'm going to truncate it to max 200 characters because during testing,
    // files and folder with a 255 character name were created correctly but then it was not possible to open or delete them.
    name = name.substring(0, 200).trim();

    // a folder name cannot end with a dot (.), if it does then the folder cannot be opened once created (at least on Windows)
    if (name.endsWith(".")) {
        name = name.slice(0, -1);
    }

    return name;
}

/**
 * Add SortType to global storage and set context.
 *
 * @export
 * @param {SortType} sortType The sort type to set.
 */
export function setSortTypeContext(sortType: SortType) {
    Object.keys(SortType).forEach((key) => {
        if (key === sortType) {
            commands.executeCommand("setContext", `tt.sortType.${key}`, true);
        } else {
            commands.executeCommand("setContext", `tt.sortType.${key}`, false);
        }
    });
    store.sortType = sortType;
    store.addToGlobalState(extensionContext, GlobalStorageKeys.sortType, sortType);
}

/**
 * Add SortDirection to global storage and set context.
 *
 * @export
 * @param {SortDirection} sortDirection The sort direction to set.
 */
export function setSortDirectionContext(sortDirection: SortDirection) {
    Object.keys(SortDirection).forEach((key) => {
        if (key === sortDirection) {
            commands.executeCommand("setContext", `tt.sortDirection.${key}`, true);
        } else {
            commands.executeCommand("setContext", `tt.sortDirection.${key}`, false);
        }
    });
    store.sortDirection = sortDirection;
    store.addToGlobalState(extensionContext, GlobalStorageKeys.sortDirection, sortDirection);
}
