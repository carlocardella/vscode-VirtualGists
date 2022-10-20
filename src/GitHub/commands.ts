import { Uri, window } from "vscode";
import { gistFileSystemProvider, gistProvider } from "../extension";
import { GIST_SCHEME } from "../FileSystem/fileSystem";
import { getGitHubGist, getGitHubGistsForAuthenticatedUser } from "./api";
import { TContent, TGist } from "./types";

export async function getGistFileContent(file: TContent): Promise<Uint8Array> {
    return Promise.resolve(new Uint8Array(Buffer.from(file?.content!, "base64").toString("latin1").split("").map(charCodeAt)));
}

export function fileNameToUri(gistId: string, filePath: string = ""): Uri {
    return Uri.parse(`${GIST_SCHEME}://${gistId}/${filePath}`);
}

export async function getGist(gistId: string): Promise<TContent | undefined> {
    return Promise.resolve(getGitHubGist(gistId));
}

export async function getOwnedGists(): Promise<TGist[] | undefined> {
    let gistsForAuthenticatedUser = await getGitHubGistsForAuthenticatedUser(false);
    let gists = gistsForAuthenticatedUser?.map((gist: TGist) => {
        gist.starred = false;
        return gist;
    });

    return Promise.resolve(gists);
}

export async function getStarredGists(): Promise<TGist[] | undefined> {
    let starredGists = await getGitHubGistsForAuthenticatedUser(true);
    let gists = starredGists?.map((gist: TGist) => {
        gist.starred = true;
        return gist;
    });

    return Promise.resolve(gists);
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

export async function deleteGist(gist: TGist) {
    const confirm = await window.showWarningMessage(`Are you sure you want to delete '${gist.description}'?`, "Yes", "No", "Cancel");
    if (confirm !== "Yes") {
        return;
    }

    const gistUri = fileNameToUri(gist.id!);
    await gistFileSystemProvider.delete(gistUri);
    gistProvider.refresh();
}

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
        let gist: TGist = {
            description: gistName,
            public: publicGist,
            files: {
                [fileName!]: {
                    content: "",
                },
            },
        };

        gistFileSystemProvider.createGist(gist).then(() => {
            gistProvider.refresh();
        });
    }
}
