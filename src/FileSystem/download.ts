import { ProgressLocation, Uri, window, workspace } from "vscode";
import { output, store } from "../extension";
import { MessageType } from "../tracing";
import * as config from "./../config";
import { GistNode, ContentNode } from "../Tree/nodes";
import { getGitHubGist } from "../GitHub/api";
import { getGistFileContent } from "../GitHub/commands";
import { TContent } from "../GitHub/types";

/**
 * Download a Gist file to a local file.
 *
 * @export
 * @param {Uri} newFileUri Uri of the new file; this is where the file will be downloaded to
 * @param {Uint8Array} fileContent Content of the file to be downloaded
 */

export async function downloadFile(newFileUri: Uri, fileContent: Uint8Array) {
    try {
        await workspace.fs.writeFile(newFileUri, fileContent);
    } catch (e) {
        output?.appendLine(`Error writing file: ${e}`, MessageType.error);
    }
}

export async function downloadFiles(files: ContentNode[], destinationFolder: Uri) {
    window.withProgress(
        {
            location: ProgressLocation.Notification,
            title: "Downloading files...",
            cancellable: true,
        },
        async (progress, token) => {
            token.onCancellationRequested(() => {
                output?.appendLine("File download cancelled by user.", MessageType.info);
                overwrite.cancel();
                return;
            });

            let overwrite = new ConfirmOverwrite();

            for (const file of files) {
                // await ensureGistIsInLocalStore(file);
                await workspace.fs.createDirectory(destinationFolder);
                let canOverwrite = false;

                // const newFileUri = Uri.joinPath(destinationFolder, file!.name!, file!.name); // @todo: can this be a setting?
                const newFileUri = Uri.joinPath(destinationFolder, file.name!);
                // check if the user wants to overwrite the folder
                canOverwrite = await overwrite.confirm(newFileUri);
                if (canOverwrite) {
                    const fileContent = await getGistFileContent(file.nodeContent);
                    await downloadFile(newFileUri, fileContent);
                } else {
                    output?.appendLine(`File "${file.name}" download cancelled by user`, MessageType.info);
                }
            }
        }
    );
}

/**
 * Download a Gist to a local folder.
 *
 * @export
 * @async
 * @param {GistNode[]} gists Gists to be downloaded
 * @param {Uri} destinationFolder Uri of the destination folder
 * @returns {*}
 */
export async function downloadGist(gists: GistNode[], destinationFolder: Uri) {
    window.withProgress(
        {
            location: ProgressLocation.Notification,
            title: "Downloading gists...",
            cancellable: true,
        },
        async (progress, token) => {
            token.onCancellationRequested(() => {
                output?.appendLine("Gist download cancelled by user.", MessageType.info);
                overwrite.cancel();
                return;
            });

            let overwrite = new ConfirmOverwrite();

            for (const gist of gists) {
                await ensureGistIsInLocalStore(gist);
                await workspace.fs.createDirectory(destinationFolder);
                let canOverwrite = false;

                for (const file of Object.values(gist.gist.files!)) {
                    const newFileUri = Uri.joinPath(destinationFolder, gist!.name!, file!.filename!);
                    // check if the user wants to overwrite the folder
                    canOverwrite = await overwrite.confirm(newFileUri);
                    if (canOverwrite) {
                        const fileContent = await getGistFileContent(file as TContent);
                        await downloadFile(newFileUri, fileContent);
                    } else {
                        output?.appendLine(`Gist "${gist.name}" download cancelled by user`, MessageType.info);
                    }
                }
            }
        }
    );
}

/**
 * Ensure that the name or path is a valid file system name.
 *
 * @export
 * @param {string} name
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
 * Make sure the gist is in the local store and has file content.
 *
 * @async
 * @param {GistNode} gist Gist to be checked
 * @returns {Promise<boolean>}
 */
async function ensureGistIsInLocalStore(gist: GistNode): Promise<boolean> {
    let storedGist = store.gists.find((g) => g!.gist.id === gist.gist.id!);
    if (storedGist) {
        // make sure we have file content stored
        for (const file of Object.values(storedGist.gist.files!)) {
            if (!file!.content) {
                // files don't have content, we need to download and store them
                const gistWithContent = await getGitHubGist(storedGist.gist.id!);
                if (!gistWithContent) {
                    return false;
                }
                store.updateStoredGist(gistWithContent);
                return true;
            }
        }

        return true;
    }

    return false;
}

/**
 * Possible answers to the question "Do you want to overwrite the file?"
 *
 * @export
 * @enum {number}
 */
export enum ConfirmOverwriteOptions {
    "yes" = "yes",
    "yesToAll" = "yesToAll",
    "no" = "no",
    "noToAll" = "noToAll",
    "cancel" = "cancel",
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
        this.userChoice = ConfirmOverwriteOptions.cancel;
    }

    constructor() {
        // this.overwriteConfig = config.get("downloadOverwrite");
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

        // if (this.overwriteConfig === "always") {
        //     this.userChoice = ConfirmOverwriteOptions.yesToAll;
        // }

        // if (this.overwriteConfig === "never") {
        //     this.userChoice = ConfirmOverwriteOptions.noToAll;
        // }

        if (this.userChoice === undefined || this.userChoice === ConfirmOverwriteOptions.yes || this.userChoice === ConfirmOverwriteOptions.no) {
            response = await window.showWarningMessage(
                `"${uri.fsPath}" already exists. Overwrite?`,
                { modal: true },
                ConfirmOverwriteOptions.yes,
                ConfirmOverwriteOptions.yesToAll,
                ConfirmOverwriteOptions.no,
                ConfirmOverwriteOptions.noToAll
            );
            this.userChoice = <ConfirmOverwriteOptions>response ?? ConfirmOverwriteOptions.cancel;
        }

        if (this.userChoice === ConfirmOverwriteOptions.yes || this.userChoice === ConfirmOverwriteOptions.yesToAll) {
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
