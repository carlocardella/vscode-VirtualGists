import { commands, env, ProgressLocation, Uri, window, workspace } from "vscode";
import { extensionContext, gistFileSystemProvider, gistProvider, output, store } from "../extension";
import { GIST_SCHEME, GistFileSystemProvider } from "../FileSystem/fileSystem";
import {
    getGitHubGist,
    getGitHubGistsForAuthenticatedUser,
    createGitHubGist,
    getGitHubGistForUser,
    getGitHubUser,
    starGitHubGist,
    forkGitHubGist,
    getGitHubFollowedUsers,
    followGitHubUser,
    deleteGistFile,
    updateGistDescription,
} from "./api";
import { TContent, TForkedGist, TGist, TGitHubUser, TFileToDelete, TGistFileNoKey } from "./types";
import { ContentNode, GistNode, GistsGroupType, NotepadNode, UserNode } from "../Tree/nodes";
import { NOTEPAD_GIST_NAME } from "./constants";
import { GlobalStorageGroup, LocalStorageType } from "../FileSystem/storage";
import { convertFromUint8Array, convertToUint8Array } from "../utils";

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
 * @param {TGist} gistsToDelete The gist to delete
 * @returns {*}
 */
export async function deleteGist(gistsToDelete: GistNode[]) {
    let confirm: "Yes" | "No" | undefined = undefined;
    let message: string;
    gistsToDelete.length === 1
        ? (message = `Are you sure you want to delete '${gistsToDelete[0].name}'?`)
        : (message = `Are you sure you want to delete ${gistsToDelete.length} gists?`);

    confirm = await window.showWarningMessage(message, { modal: true }, "Yes", "No");
    if (confirm !== "Yes") {
        return;
    }

    await Promise.all(
        gistsToDelete.map(async (gist) => {
            const gistUri = fileNameToUri(gist.gist.id!);
            await gistFileSystemProvider.delete(gistUri);
        })
    );

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
export async function deleteFiles(filesToDelete: ContentNode[]) {
    let confirm: "Yes" | "No" | undefined = undefined;
    let message: string;
    filesToDelete.length === 1
        ? (message = `Are you sure you want to delete '${filesToDelete[0].path}'?`)
        : (message = `Are you sure you want to delete ${filesToDelete.length} files?`);

    confirm = await window.showWarningMessage(message, { modal: true }, "Yes", "No");

    if (confirm !== "Yes") {
        return;
    }

    let files: TFileToDelete = {};
    // let files: Record<string, any> = {};

    filesToDelete.forEach((file) => {
        files[file.path] = null;
    });

    await deleteGistFile(filesToDelete[0].gist, files!);
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
            output?.error(`The file name '${fileName}' is not allowed.`);
            window.showErrorMessage(
                `Don't name your files "gistfile" with a numerical suffix. This is the format of the automatic naming scheme that Gist uses internally.`
            );
            return;
        }

        let gistContent = "";
        let extension = fileName.lastIndexOf(".") > -1 ? fileName.substring(fileName.lastIndexOf(".") + 1) : "";
        if (extension === "md") {
            gistContent = `# ${gistName}`;
        } else {
            gistContent = `${gistName}`;
        }

        let gist: TGist = {
            description: gistName,
            public: publicGist,
            files: {
                [fileName!]: {
                    content: gistContent,
                },
            },
        };

        await gistFileSystemProvider.createGist(gist, publicGist);
        gistProvider.refresh();
    }
}

/**
 * Asks the user for the name of the gist file.
 * @returns A promise that resolves to the entered file name, or undefined if no name was entered.
 */
export async function askForFileName(): Promise<string | undefined> {
    const fileName = await window.showInputBox({
        prompt: "Enter the name of the file",
        placeHolder: "File name",
    });

    if (!fileName) {
        // return Promise.reject();
        return;
    }

    return Promise.resolve(fileName);
}

/**
 * Add a file to a gist
 *
 * @export
 * @async
 * @param {TGist} gist The gist to add the file to
 * @returns {Promise<void>}
 */
export async function addFile(gist: GistNode, dailyNote: boolean = false): Promise<Uri | undefined> {
    let fileName: string | undefined;

    if (dailyNote) {
        fileName = getDailyNoteFileName();
    } else {
        fileName = await askForFileName().then((fileName) => fileName);
    }

    if (!fileName) {
        return;
    }

    if (!(await validateFileName(fileName))) {
        return;
    }

    if (gist instanceof NotepadNode) {
        let notepadGist = await getOrCreateNotepadGist(fileName);

        gist = new GistNode(notepadGist, GistsGroupType.notepad, false);
        store.addToOrUpdateLocalStorage(LocalStorageType.gists, gist);
    }

    let fileUri = fileNameToUri(gist.gist.id!, fileName);
    let gistContent = "";
    let fileNameWithoutExtension = fileName!.split(".").shift()!;
    let extension = fileName!.lastIndexOf(".") > -1 ? fileName!.substring(fileName!.lastIndexOf(".") + 1) : "";
    if (extension === "md") {
        gistContent = `# ${fileNameWithoutExtension}`;
    } else {
        gistContent = fileNameWithoutExtension;
    }

    // check if the file already exists; if it does, ask the user if they wants to overwrite it
    let create = false;
    let overwrite = false;
    if (GistFileSystemProvider.fileExists(fileUri)) {
        const confirmOverwrite = new ConfirmOverwrite();
        const canOverwrite = await confirmOverwrite.confirm(fileUri);
        if (!canOverwrite) {
            return;
        }
        overwrite = true;
    }

    let content = convertToUint8Array(gistContent);
    await gistFileSystemProvider.writeFile(fileUri, new Uint8Array(content), { create: create, overwrite: overwrite });

    return Promise.resolve(fileUri);
}

/**
 * Returns the file name for the daily note based on the current date.
 * The file name format is "YYYY-MM-DD.md".
 *
 * @returns The file name for the daily note.
 */
function getDailyNoteFileName(): string {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    return `${year}-${month}-${day}.md`;
}

/**
 * Validates the given file name.
 *
 * @param fileName - The name of the file to validate.
 * @returns A promise that resolves to `true` if the file name is valid, or `false` otherwise.
 */
export async function validateFileName(fileName: string): Promise<boolean> {
    if (fileName.match(/gistfile(\d+)/gi)) {
        output?.error(`The file name '${fileName}' is not allowed.`);
        window.showErrorMessage(
            `Don't name your files "gistfile" with a numerical suffix. This is the format of the automatic naming scheme that Gist uses internally.`
        );
        return Promise.reject(false);
    }
    if (fileName.indexOf("/") !== -1) {
        output?.error(`The file name '${fileName}' is not allowed.`);
        window.showErrorMessage(`"/" is not allowed in a file name.`);
        return Promise.reject(false);
    }

    return Promise.resolve(true);
}

/**
 * Follow a GitHub user
 *
 * @export
 * @async
 * @returns {Promise<void>}
 */
export async function followUser(username?: string): Promise<void> {
    if (!username) {
        username = await window.showInputBox({
            prompt: "Enter the name of the user to follow",
            placeHolder: "GitHub username",
            ignoreFocusOut: true,
        });

        if (!username) {
            return Promise.reject();
        }
    }

    // add username to storage
    await store.addToGlobalStorage(extensionContext, GlobalStorageGroup.followedUsers, username);

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
 * Returns a list of followed, valid users from Global Storage
 * The username is validated by checking if the user exits on GitHub
 *
 * @export
 * @async
 * @returns {Promise<string[]>}
 */
export async function getFollowedUsers(withDetails: boolean): Promise<TGitHubUser[]> {
    let users = (await getGitHubFollowedUsers()).map((user) => user.login);
    let validUsers: TGitHubUser[] = [];

    if (withDetails) {
        let followedUsers = await Promise.all(users.map(async (user) => await getGitHubUser(user)));
        validUsers = followedUsers.filter((user) => user !== undefined) as TGitHubUser[];
    } else {
        validUsers = users.map((user) => ({ login: user } as TGitHubUser));
    }

    return Promise.resolve(validUsers);
}

/**
 * Returns the list of opened, valid gists
 * The gist is validated by checking if the gist exits on GitHub
 *
 * @export
 * @async
 * @returns {Promise<TGist[]>}
 */
export async function getOpenedGists(): Promise<TGist[]> {
    const openedGists = await store.readFromGlobalStorage(extensionContext, GlobalStorageGroup.openedGists);

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

    store.addToGlobalStorage(extensionContext, GlobalStorageGroup.openedGists, gistId);
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
    store.removeFromGlobalStorage(extensionContext, GlobalStorageGroup.openedGists, gist.gist.id!);
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
        return;
    }

    // Validate file name
    if (fileName.match(/gistfile(\d+)/gi)) {
        output?.error(`The file name '${fileName}' is not allowed.`);
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
    const files = await window.showOpenDialog({ canSelectFiles: true, canSelectFolders: false, canSelectMany: true, title: "Select the file(s) to upload" });
    if (!files) {
        return Promise.resolve();
    }

    let filesToUpload: TGistFileNoKey[] = [];
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
            filesToUpload.push({
                filename: uri.path.split("/").slice(1).join("/"),
                content: convertFromUint8Array(content),
            });
        })
    );

    // check if the file already exists; if it does, ask the user if they wants to overwrite it
    let confirmedFilesToUpload: TGistFileNoKey[] = [];
    const confirmOverwrite = new ConfirmOverwrite();
    for (const file of filesToUpload) {
        const fileUri = fileNameToUri(destination.gist.id!, file.filename);
        if (GistFileSystemProvider.fileExists(fileUri)) {
            if (confirmOverwrite.userChoice === ConfirmOverwriteOptions.Cancel || confirmOverwrite.userChoice === ConfirmOverwriteOptions.NoToAll) {
                confirmedFilesToUpload = [];
                return Promise.resolve();
            }
            let canOverwrite =
                <ConfirmOverwriteOptions>confirmOverwrite.userChoice === ConfirmOverwriteOptions.YesToAll ? true : await confirmOverwrite.confirm(fileUri);
            if (canOverwrite) {
                confirmedFilesToUpload.push(file);
            }
        }
    }

    if (confirmedFilesToUpload.length === 0) {
        return Promise.resolve();
    }

    await gistFileSystemProvider.writeFiles(destination as GistNode, confirmedFilesToUpload);

    return Promise.resolve();
}

/**
 * Enums star/unstar operations
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
 * Renames a gist.
 * @param gist The gist to be renamed.
 * @returns A promise that resolves when the gist is renamed successfully.
 */
export async function renameGist(gist: GistNode) {
    const gistDescription = await window.showInputBox({
        prompt: "Enter the new gist name",
        placeHolder: "New gist name",
        ignoreFocusOut: true,
    });

    if (gistDescription) {
        await updateGistDescription(gist, gistDescription!);
        gistProvider.refresh();
    }
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

        if (gist.contextValue === "gist.openedGists" || gist.contextValue === "gist.openedGists") {
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

/**
 * View the gist owner's profile on GitHub
 *
 * @export
 * @async
 * @param {string} username The username of the owner
 * @returns {*}
 */
export async function viewGistOwnerProfileOnGitHub(username: string) {
    let user: TGitHubUser | undefined;
    user = store.followedUsers.find((user) => user?.login === username)?.user;
    if (!user) {
        user = await getGitHubUser(username);
    }

    if (user) {
        env.openExternal(Uri.parse(user.html_url));
    }
}

/**
 * Copy the gist owner's username to the clipboard
 *
 * @export
 * @param {(GistNode | ContentNode | UserNode)} node The node to copy the username
 */
export function copyUserName(node: GistNode | ContentNode | UserNode) {
    if (node instanceof GistNode) {
        env.clipboard.writeText(node.gist.owner!.login);
    }

    if (node instanceof ContentNode) {
        env.clipboard.writeText(node.gist.owner!.login);
    }

    if (node instanceof UserNode) {
        env.clipboard.writeText(node.label as string);
    }
}

/**
 * Fork a gist and add it to the "My Gist" group.
 *
 * @export
 * @async
 * @param {?(GistNode | string)} [gist]
 * @returns {*}
 */
export async function forkGist(gist?: GistNode | string) {
    let newGist: TForkedGist | undefined;

    if (gist instanceof GistNode) {
        await window.withProgress({ title: "Forking gist...", location: ProgressLocation.Notification }, async () => {
            newGist = await forkGitHubGist(gist as GistNode);
        });
    }

    if (!gist) {
        const gistId = await window.showInputBox({ ignoreFocusOut: true, prompt: "Enter the gistId you want to fork", placeHolder: "gistId" });
        if (!gistId) {
            return;
        }

        gist = await getGitHubGist(gistId!).then((gist) => {
            return gist?.id;
        });
    }

    if (typeof gist === "string") {
        await window.withProgress({ title: "Forking gist...", location: ProgressLocation.Notification }, async () => {
            let sourceGist = await getGitHubGist(gist as string);
            if (sourceGist) {
                let gistObject = new GistNode(sourceGist, GistsGroupType.openedGists);
                newGist = await forkGitHubGist(gistObject);
            }
        });
    }

    if (newGist) {
        gistProvider.refresh();
    }
}

/**
 * Clone the selected gist
 *
 * @export
 * @async
 * @param {GistNode} gist The gist to clone
 * @returns {*}
 */
export async function cloneGist(gist: GistNode) {
    output?.info(`Cloning ${gist.gist.git_pull_url}`);
    commands.executeCommand("git.clone", gist.gist.git_pull_url);
}

export async function followUserOnGitHub(username: string) {
    await window.withProgress({ title: "Following user...", location: ProgressLocation.Notification }, async () => {
        await followGitHubUser(username);
    });
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
     * @private
     * @async
     * @param {Uri} uri Usi of the file or folder to be overwritten.
     * @returns {Promise<boolean>}
     */
    private async askUser(uri: Uri): Promise<boolean> {
        let response: string | undefined;

        if (this.userChoice === undefined || this.userChoice === ConfirmOverwriteOptions.Yes || this.userChoice === ConfirmOverwriteOptions.No) {
            response = await window.showWarningMessage(
                `"${uri.fsPath}" already exists. Overwrite?`,
                { modal: true },
                ConfirmOverwriteOptions.Yes,
                ConfirmOverwriteOptions.YesToAll,
                ConfirmOverwriteOptions.No,
                ConfirmOverwriteOptions.NoToAll
            );
            this.userChoice = <ConfirmOverwriteOptions>response ?? ConfirmOverwriteOptions.Cancel;
        }

        if (this.userChoice === ConfirmOverwriteOptions.Yes || this.userChoice === ConfirmOverwriteOptions.YesToAll) {
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
