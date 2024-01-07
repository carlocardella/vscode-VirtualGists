import { Uri, commands, window, workspace } from "vscode";
import { extensionContext, store } from "./extension";
import { SortDirection, SortType } from "./FileSystem/storage";
import { GlobalStorageKeys } from "./GitHub/constants";

/**
 * Add SortType to global storage and set context.
 *
 * @export
 * @param {SortType} sortType The sort type to set.
 */
export function setSortTypeContext(sortType: SortType) {
    Object.keys(SortType).forEach((key) => {
        if (key === sortType) {
            commands.executeCommand("setContext", `VirtualGists.sortType.${key}`, true);
        } else {
            commands.executeCommand("setContext", `VirtualGists.sortType.${key}`, false);
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
            commands.executeCommand("setContext", `VirtualGists.sortDirection.${key}`, true);
        } else {
            commands.executeCommand("setContext", `VirtualGists.sortDirection.${key}`, false);
        }
    });
    store.sortDirection = sortDirection;
    store.addToGlobalState(extensionContext, GlobalStorageKeys.sortDirection, sortDirection);
}

/**
 * Returns true if all elements of the passed in array are instances of the specified type
 *
 * @export
 * @template T
 * @param {unknown[]} arr The array to check
 * @param {new (...args: any[]) => T} type The type to check against
 * @returns {boolean}
 */
/**
 * Checks if every element in an array is an instance of a specified type.
 *
 * @template T - The type of the elements in the array.
 * @param arr - The array to check.
 * @param type - The constructor function of the type to check against.
 * @returns True if every element in the array is an instance of the specified type, false otherwise.
 */
export function isArrayOf<T>(arr: unknown[], type: new (...args: any[]) => T): boolean {
    return arr.every((elem) => elem instanceof type);
}

/**
 * Converts a string to a Uint8Array.
 * @param content The string to be converted.
 * @returns The Uint8Array representation of the string.
 */
export function convertToUint8Array(content: string): Uint8Array {
    return new TextEncoder().encode(content);
}

/**
 * Converts a Uint8Array to a string using the TextDecoder API.
 * @param content The Uint8Array to convert.
 * @returns The converted string.
 */
export function convertFromUint8Array(content: Uint8Array): string {
    return new TextDecoder().decode(content);
}

/**
 * Possible answers to the question "Do you want to overwrite the file?"
 *
 * @export
 * @enum {number}
 */
export enum ConfirmOverwriteOptions {
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
 * @typedef {ConfirmOverwrite}
 */
export class ConfirmOverwrite {
    public userChoice: ConfirmOverwriteOptions | undefined;
    private _overwrite = false;
    // private overwriteConfig: string;

    /**
     * Signals that the user wants to cancel the download operation.
     *
     * @public
     */
    public cancel() {
        this.userChoice = ConfirmOverwriteOptions.Cancel;
    }

    constructor() {}

    /**
     * Ask the user if he wants to overwrite the file or folder.
     * If the user already answered "Yas to all" or "No to all", we won't ask again unless a new download command is issued.
     *
     * @param uri - The URI of the file to be overwritten.
     * @param multipleFiles - Indicates whether multiple files are being overwritten.
     * @returns A promise that resolves to a boolean indicating whether the user confirmed the overwrite.
     */
    private async askUser(uri: Uri, multipleFiles: boolean): Promise<boolean> {
        let response: string | undefined;
        let confirmOverwriteOptions = multipleFiles
            ? [ConfirmOverwriteOptions.Yes, ConfirmOverwriteOptions.YesToAll, ConfirmOverwriteOptions.No, ConfirmOverwriteOptions.NoToAll]
            : [ConfirmOverwriteOptions.Yes, ConfirmOverwriteOptions.No];

        if (this.userChoice === undefined || this.userChoice === ConfirmOverwriteOptions.Yes || this.userChoice === ConfirmOverwriteOptions.No) {
            response = await window.showWarningMessage(`"${uri.fsPath}" already exists. Overwrite?`, { modal: true }, ...confirmOverwriteOptions);
            this.userChoice = <ConfirmOverwriteOptions>response ?? ConfirmOverwriteOptions.Cancel;
        }

        if (this.userChoice === ConfirmOverwriteOptions.Yes || this.userChoice === ConfirmOverwriteOptions.YesToAll) {
            return Promise.resolve(true);
        }

        return Promise.resolve(false);
    }

    /**
     * Confirms whether to overwrite a file or folder.
     *
     * @param uri - The URI of the file or folder to confirm.
     * @param multipleFiles - Optional. Indicates whether multiple files are being confirmed. Default is true.
     * @returns A promise that resolves to a boolean indicating whether to overwrite the file or folder.
     */
    public async confirm(uri: Uri, multipleFiles: boolean = true): Promise<boolean> {
        await workspace.fs.stat(uri).then(
            async (stat) => {
                if (stat) {
                    this._overwrite = await this.askUser(uri, multipleFiles);
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
