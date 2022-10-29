import { Uri, window } from "vscode";
import { extensionContext, gistFileSystemProvider, gistProvider, output } from "../extension";
import { GIST_SCHEME } from "../FileSystem/fileSystem";
import { getGitHubGist, getGitHubGistsForAuthenticatedUser, createGitHubGist, getGitHubGistForUser, getGitHubUser } from "./api";
import { TContent, TGist, TGitHubUser, TUser } from "./types";
import { ContentNode, GistNode } from "../Tree/nodes";
import { NOTEPAD_GIST_NAME } from "./constants";
import { addToGlobalStorage, getFollowedUsersFromGlobalStorage } from "../FileSystem/storage";

/**
 * Get the content of a gist file.
 *
 * @export
 * @async
 * @param {TContent} file The file to get the content for
 * @returns {Promise<Uint8Array>}
 */
export async function getGistFileContent(file: TContent): Promise<Uint8Array> {
    return Promise.resolve(new Uint8Array(Buffer.from(file?.content!, "base64").toString("latin1").split("").map(charCodeAt)));
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
export async function getNotepadGist(): Promise<TGist[] | undefined> {
    const gists = await getOwnedGists();
    const notepadGist = gists?.filter((gist: TGist) => gist.description === NOTEPAD_GIST_NAME);

    // if (notepadGist?.length === 0) {
    //     // NOTEPAD_GIST_NAME does not exist, let's create it
    //     let gist: TGist = {description: NOTEPAD_GIST_NAME, files: {}, public: false};
    //     let notepadGist = await createGitHubGist(gist, false);
    //     return Promise.resolve(getNotepadGist());
    // }

    return Promise.resolve(notepadGist);
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
    const confirm = await window.showWarningMessage(`Are you sure you want to delete '${gist.description}'?`, "Yes", "No", "Cancel");
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
    const confirm = await window.showWarningMessage(`Are you sure you want to delete '${file.path}'?`, "Yes", "No", "Cancel");
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
    await addToGlobalStorage(extensionContext, userToFollow);

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
    const users = await getFollowedUsersFromGlobalStorage(extensionContext);

    let followedUsers = await Promise.all(users.map(async (user) => await getGitHubUser(user)));
    let validUsers = followedUsers.filter((user) => user !== undefined) as TGitHubUser[];

    return Promise.resolve(validUsers);
}
