import { env, Uri, window, workspace } from "vscode";
import { extensionContext, gistFileSystemProvider, gistProvider, output, store } from "../extension";
import { GistFileSystemProvider, GIST_SCHEME } from "../FileSystem/fileSystem";
import { getGitHubGist, getGitHubGistsForAuthenticatedUser, createGitHubGist, getGitHubGistForUser, getGitHubUser, starGitHubGist } from "./api";
import { TContent, TGist, TGitHubUser } from "./types";
import { ContentNode, GistNode, GistsGroupType, NotepadNode } from "../Tree/nodes";
import { NOTEPAD_GIST_NAME } from "./constants";
import {
    addToGlobalStorage,
    readFromGlobalStorage,
    GlobalStorageGroup,
    removeFromGlobalStorage,
    addToOrUpdateLocalStorage,
    removeFromLocalStorage,
} from "../FileSystem/storage";

/**
 * Get the content of a gist file.
 *
 * @export
 * @async
 * @param {TContent} file The file to get the content for
 * @returns {Promise<Uint8Array>}
 */
export async function getGistFileContent(file: TContent): Promise<Uint8Array> {
    return Promise.resolve(new Uint8Array(Buffer.from(file!.content!, "base64").toString("latin1").split("").map(charCodeAt)));
}

/**
 * Returns the Uri for a gist file from the file name
 *
 * @export
 * @param {string} gistId The id of the Gist containing the file
 * @param {string} [filePath=""] The file path to get the Uri for
 * @returns {Uri}
 */
export function fileNameToUri(gistId: string, filePath: string = ""): Uri {
    return Uri.parse(`${GIST_SCHEME}://${gistId}/${filePath}`);
}

export function getFileNameFromUri(uri: Uri): string {
    return uri.path.split("/").pop()!;
}

/**
 * Get a Gist
 *
 * @export
 * @async
 * @param {string} gistId The id of the Gist to get
 * @returns {(Promise<TContent | undefined>)}
 */
export async function getGist(gistId: string): Promise<TContent | undefined> {
    return Promise.resolve(getGitHubGist(gistId));
}

/**
 * Return the Gist owned by the authenticated user
 *
 * @export
 * @async
 * @returns {(Promise<TGist[] | undefined>)}
 */
export async function getOwnedGists(): Promise<TGist[] | undefined> {
    let gistsForAuthenticatedUser = await getGitHubGistsForAuthenticatedUser(false);
    let gists = gistsForAuthenticatedUser?.map((gist: TGist) => {
        gist.starred = false;
        gist.description !== NOTEPAD_GIST_NAME;
        return gist;
    });

    return Promise.resolve(gists);
}

/**
 * Get the starred Gists for the authenticated user
 *
 * @export
 * @async
 * @returns {(Promise<TGist[] | undefined>)}
 */
export async function getStarredGists(): Promise<TGist[] | undefined> {
    let starredGists = await getGitHubGistsForAuthenticatedUser(true);
    let gists = starredGists?.map((gist: TGist) => {
        gist.starred = true;
        return gist;
    });

    return Promise.resolve(gists);
}

/**
 * Get the notepad gist
 *
 * @export
 * @async
 * @returns {(Promise<TGist[] | undefined>)}
 */
export async function getOrCreateNotepadGist(fileName?: string): Promise<TGist> {
    const gists = await getOwnedGists();
    let notepadGist = gists?.filter((gist: TGist) => gist.description === NOTEPAD_GIST_NAME)[0];

    if (!notepadGist) {
        // NOTEPAD_GIST_NAME does not exist, let's create it
        let gist: TGist = {
            description: NOTEPAD_GIST_NAME,
            files: {
                [fileName!]: {
                    filename: fileName,
                },
            },
            public: false,
        };
        notepadGist = await createGitHubGist(gist, false);
    }

    return Promise.resolve(notepadGist!);
}

export async function getNotepadGist(): Promise<TGist | undefined> {
    const gists = await getOwnedGists();
    const notepadGistId = gists?.find((gist) => gist.description === NOTEPAD_GIST_NAME)?.id;
    if (notepadGistId) {
        let notepadGist = await getGist(notepadGistId);
        return Promise.resolve(notepadGist);
    }

    return Promise.reject();
}

/**
 * Helper function, returns the character an position zero of a string.
 *loo
 * @param {string} c The string to filter
 * @returns {*}
 */
function charCodeAt(c: string) {
    return c.charCodeAt(0);
}

/**
 * Delete a gist
 *
 * @export
 * @async
 * @param {TGist} gist The gist to delete
 * @returns {*}
 */
export async function deleteGist(gist: TGist) {
    const confirm = await window.showWarningMessage(`Are you sure you want to delete '${gist.description}'?`, { modal: true }, "Yes", "No", "Cancel");
    if (confirm !== "Yes") {
        return;
    }

    const gistUri = fileNameToUri(gist.id!);
    await gistFileSystemProvider.delete(gistUri);
    gistProvider.refresh();
}

/**
 * Delete a file from a gist
 *
 * @export
 * @async
 * @param {ContentNode} file The file to delete
 * @returns {*}
 */
export async function deleteFile(file: ContentNode) {
    const confirm = await window.showWarningMessage(`Are you sure you want to delete '${file.path}'?`, { modal: true }, "Yes", "No", "Cancel");
    if (confirm !== "Yes") {
        return;
    }

    await gistFileSystemProvider.delete(file.uri);
    gistProvider.refresh();
}

/**
 * Create a new gist
 *
 * @export
 * @async
 * @param {boolean} publicGist Whether the gist should be public or not
 * @returns {*}
 */
export async function createGist(publicGist: boolean) {
    const gistName = await window.showInputBox({
        prompt: "Enter the name of the gist",
        placeHolder: "Gist name",
    });
    let fileName: string | undefined;
    if (gistName) {
        fileName = await window.showInputBox({
            prompt: "Enter the name of the file",
            placeHolder: "File name",
        });
    }

    if (fileName) {
        // Don't name your files "gistfile" with a numerical suffix. This is the format of the automatic naming scheme that Gist uses internally.
        if (fileName.match(/gistfile(\d+)/gi)) {
            output?.appendLine(`The file name '${fileName}' is not allowed.`, output.messageType.error);
            window.showErrorMessage(
                `Don't name your files "gistfile" with a numerical suffix. This is the format of the automatic naming scheme that Gist uses internally.`
            );
            return;
        }

        let gist: TGist = {
            description: gistName,
            public: publicGist,
            files: {
                [fileName!]: {
                    content: "",
                },
            },
        };

        await gistFileSystemProvider.createGist(gist, publicGist);
        gistProvider.refresh();
    }
}

/**
 * Add a file to a gist
 *
 * @export
 * @async
 * @param {TGist} gist The gist to add the file to
 * @returns {Promise<void>}
 */
export async function addFile(gist: GistNode): Promise<void> {
    const fileName = await window.showInputBox({
        prompt: "Enter the name of the file",
        placeHolder: "File name",
    });

    if (!fileName) {
        return Promise.reject();
    }

    // Validate file name
    if (fileName.match(/gistfile(\d+)/gi)) {
        output?.appendLine(`The file name '${fileName}' is not allowed.`, output.messageType.error);
        window.showErrorMessage(
            `Don't name your files "gistfile" with a numerical suffix. This is the format of the automatic naming scheme that Gist uses internally.`
        );
        return Promise.reject();
    }

    if (gist instanceof NotepadNode) {
        // await addNotepadFile(fileName);
        let notepadGist = await getOrCreateNotepadGist(fileName);

        gist = new GistNode(notepadGist, GistsGroupType.notepad, false);
        addToOrUpdateLocalStorage(gist);
    }

    let fileUri = fileNameToUri(gist.gist.id!, fileName);
    await gistFileSystemProvider.writeFile(fileUri, new Uint8Array(0), { create: true, overwrite: false });
    gistProvider.refresh();

    return Promise.resolve();
}

/**
 * Follow a GitHub user
 *
 * @export
 * @async
 * @returns {Promise<void>}
 */
export async function followUser(): Promise<void> {
    const userToFollow = await window.showInputBox({
        prompt: "Enter the name of the user to follow",
        placeHolder: "GitHub username",
        ignoreFocusOut: true,
    });

    if (!userToFollow) {
        return Promise.reject();
    }

    // add username to storage
    await addToGlobalStorage(extensionContext, GlobalStorageGroup.followedUsers, userToFollow);

    // get gists for username
    let gistsForUser = await getGistsForUser(userToFollow);

    // @todo add username as TreeView node

    return Promise.resolve();
}

/**
 * Returns the list of gists for a user
 *
 * @export
 * @async
 * @param {string} githubUser The user to get the gists for
 * @returns {(Promise<TGist[] | undefined>)}
 */
export async function getGistsForUser(githubUser: string): Promise<TGist[] | undefined> {
    return Promise.resolve(await getGitHubGistForUser(githubUser));
}

/**
 * Returns a list of followed users from Global Storage
 *
 * @export
 * @async
 * @returns {Promise<string[]>}
 */
export async function getFollowedUsers(): Promise<TGitHubUser[]> {
    const users = await readFromGlobalStorage(extensionContext, GlobalStorageGroup.followedUsers);

    let followedUsers = await Promise.all(users.map(async (user) => await getGitHubUser(user)));
    let validUsers = followedUsers.filter((user) => user !== undefined) as TGitHubUser[];

    return Promise.resolve(validUsers);
}

/**
 * Returns the list of opened gists
 *
 * @export
 * @async
 * @returns {Promise<TGist[]>}
 */
export async function getOpenedGists(): Promise<TGist[]> {
    const openedGists = await readFromGlobalStorage(extensionContext, GlobalStorageGroup.openedGists);

    let gists = await Promise.all(openedGists.map(async (gist) => await getGitHubGist(gist)));
    let validGists = gists.filter((gist) => gist !== undefined) as TGist[];

    return Promise.resolve(validGists);
}

/**
 * Ask the user to enter a gistId to open and adds it to global storage
 *
 * @export
 * @async
 * @returns {unknown}
 */
export async function openGist() {
    const gistId = await window.showInputBox({
        prompt: "Enter the ID of the gist",
        placeHolder: "Gist ID",
    });

    if (!gistId) {
        return Promise.reject();
    }

    addToGlobalStorage(extensionContext, GlobalStorageGroup.openedGists, gistId);
}

/**
 * Remove a gist from the list of opened gists
 *
 * @export
 * @async
 * @param {GistNode} gist The gist to remove
 * @returns {*}
 */
export async function closeGist(gist: GistNode) {
    removeFromGlobalStorage(extensionContext, GlobalStorageGroup.openedGists, gist.gist.id!);
    gistProvider.refresh();
}

/**
 * Rename a gist file
 *
 * @export
 * @async
 * @param {ContentNode} gistFile The gist file to rename
 * @returns {unknown}
 */
export async function renameFile(gistFile: ContentNode) {
    const fileName = await window.showInputBox({
        prompt: "Enter the new name of the file",
        placeHolder: "File name",
    });

    if (!fileName) {
        return Promise.reject();
    }

    // Validate file name
    if (fileName.match(/gistfile(\d+)/gi)) {
        output?.appendLine(`The file name '${fileName}' is not allowed.`, output.messageType.error);
        window.showErrorMessage(
            `Don't name your files "gistfile" with a numerical suffix. This is the format of the automatic naming scheme that Gist uses internally.`
        );
        return Promise.reject();
    }

    let oldUri = fileNameToUri(gistFile.gist.id!, gistFile.name);
    let newUri = fileNameToUri(gistFile.gist.id!, fileName);

    await gistFileSystemProvider.rename(oldUri, newUri);
    gistProvider.refresh();
}

/**
 * Upload existing file(s) to a gist
 *
 * @export
 * @async
 * @param {(ContentNode | GistNode)} destination The gist to upload the file(s) to
 * @returns {Promise<void>}
 */
export async function uploadFiles(destination: ContentNode | GistNode): Promise<void> {
    const files = await window.showOpenDialog({ canSelectFiles: true, canSelectFolders: false, canSelectMany: false, title: "Select the files to upload" });
    if (!files) {
        return Promise.reject();
    }

    await Promise.all(
        files.map(async (file) => {
            const content = await workspace.fs.readFile(file);
            let uriPath = "path" in destination ? destination.path : "";
            let uriFile = file.path.split("/").pop();
            let uri = Uri.from({
                scheme: GIST_SCHEME,
                authority: destination.gist.id!,
                path: `${uriPath}/${uriFile}`,
            });

            await gistFileSystemProvider.writeFile(uri, content, {
                create: true,
                overwrite: false,
            });
        })
    );

    return Promise.resolve();
}

/**
 * Enums star/ubstar operations
 *
 * @export
 * @enum {number}
 */
export enum GistStarOperation {
    star = "star",
    unstar = "unstar",
}

/**
 * Unstar a gist and remove it from the "Starred gists" group
 *
 * @export
 * @async
 * @param {GistNode} gist The gist to unstar
 * @returns {*}
 */
export async function unstarGist(gist: GistNode) {
    const confirm = await window.showWarningMessage(`Are you sure you want to unstar ${gist.name}?`, { modal: true }, "Yes", "No");
    if (confirm !== "Yes") {
        return;
    }

    await starredGist(gist, GistStarOperation.unstar);
}

/**
 * Star or unstar a gist and add or remove it to/from the "Starred gists" group
 *
 * @async
 * @param {GistNode} gist The gist to star
 * @param {GistStarOperation} operation The operation to perform (star/unstar)
 * @returns {*}
 */
async function starredGist(gist: GistNode, operation: GistStarOperation) {
    await starGitHubGist(gist, operation);
    gistProvider.refresh();
}

/**
 * Star a gist and add it to the "Starred gists" group.
 * If the gist is already opened (in the "Opened gists" group), it will be removed from there and added to the "Starred gists" group.
 * If the gist is not already opened, prompts the user and ask for the gistId to open.
 *
 * @export
 * @async
 * @param {?GistNode} [gist] The gist to star
 * @returns {*}
 */
export async function starGist(gist?: GistNode) {
    if (!gist) {
        const gistId = await window.showInputBox({ ignoreFocusOut: true, prompt: "Enter the gistId you want to star", placeHolder: "gistId" });
        if (!gistId) {
            return;
        }

        const gistToStar = await getGitHubGist(gistId!);
        if (!gistToStar) {
            window.showErrorMessage(
                `Could not open gist ${gistId}, check the [output trace](https://github.com/carlocardella/vscode-VirtualGists/blob/main/README.md#tracing) for details`
            );
            return;
        }

        await starredGist(new GistNode(gistToStar, GistsGroupType.starredGists, true), GistStarOperation.star);
    } else {
        await starredGist(gist, GistStarOperation.star);

        if (gist.contextValue === GistsGroupType.openedGists) {
            // The gist is listed under "Opened Gists", remove it
            await closeGist(gist);
        }
    }
}

/**
 * Copy the gistId to the clipboard
 *
 * @export
 * @param {GistNode} gist The gist to copy the gistId
 */
export function copyGistId(gist: GistNode) {
    env.clipboard.writeText(gist.gist.id!);
}

/**
 * Copy the gist URL to the clipboard
 *
 * @export
 * @param {GistNode} gist The gist to copy the URL
 */
export function copyGistUrl(gist: GistNode) {
    env.clipboard.writeText(gist.gist.html_url!);
}

/**
 * Open the gist in the browser
 *
 * @export
 * @param {GistNode} gist The gist to open in the browser
 */
export function openGistOnGitHub(gist: GistNode) {
    env.openExternal(Uri.parse(gist.gist.html_url!));
}


/**
 * Copy the gist file Url to the clipboard
 *
 * @export
 * @param {ContentNode} gistFile The gist file to copy the URL
 */
export function copyFileUrl(gistFile: ContentNode) {
    let fileUrl = getFileUriForCopy(gistFile);
    env.clipboard.writeText(fileUrl);
}

/**
 * Open the gist file in the browser
 *
 * @export
 * @param {ContentNode} gistFile The gist file to open in the browser
 */
export function openFileOnGitHub(gistFile: ContentNode) {
    let fileUrl = getFileUriForCopy(gistFile);
    env.openExternal(Uri.parse(fileUrl));
}

/**
 * Builds the gist file URL to be copied or opened in the browser
 *
 * @param {ContentNode} gistFile The gist file to copy the URL
 * @returns {string}
 */
function getFileUriForCopy(gistFile: ContentNode): string {
    return "https://gist.github.com/" + gistFile.gist.owner!.login + "/" + gistFile.gist.id + "#file-" + gistFile.name.replace(".", "-");
}