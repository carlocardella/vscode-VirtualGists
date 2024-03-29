import { ProgressLocation, Uri, window, workspace } from "vscode";
import { output, store } from "../extension";
import { GistNode, ContentNode } from "../Tree/nodes";
import { getGitHubGist } from "../GitHub/api";
import { getGistFileContent } from "../GitHub/commands";
import { TContent } from "../GitHub/types";
import { ConfirmOverwrite } from "../utils";

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
        output?.error(`Error writing file: ${e}`);
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
                output?.info("File download cancelled by user.");
                overwrite.cancel();
                return;
            });

            let overwrite = new ConfirmOverwrite();

            for (const file of files) {
                // await ensureGistIsInLocalStore(file);
                await workspace.fs.createDirectory(destinationFolder);
                let canOverwrite = false;

                const newFileUri = Uri.joinPath(destinationFolder, file.name!);
                // check if the user wants to overwrite the folder
                canOverwrite = await overwrite.confirm(newFileUri);
                if (canOverwrite) {
                    const fileContent = await getGistFileContent(file.nodeContent);
                    await downloadFile(newFileUri, fileContent);
                } else {
                    output?.info(`File "${file.name}" download cancelled by user`);
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
                output?.info("Gist download cancelled by user.");
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
                        output?.info(`Gist "${gist.name}" download cancelled by user`);
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
