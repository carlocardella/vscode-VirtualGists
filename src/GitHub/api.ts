import * as rest from "@octokit/rest";
import { credentials, output } from "../extension";
import { MessageType } from "../tracing";
import { GistNode } from "../Tree/nodes";
import { ZERO_WIDTH_SPACE } from "./constants";
import { TGistFileNoKey, TGist, TGitHubUser } from "./types";

/**
 * Get the authenticated GitHub user
 *
 * @export
 * @async
 * @returns {Promise<TGitHubUser>}
 */
export async function getGitHubAuthenticatedUser(): Promise<TGitHubUser> {
    const octokit = new rest.Octokit({
        auth: await credentials.getAccessToken(),
    });

    const { data } = await octokit.users.getAuthenticated();

    return Promise.resolve(data);
}

/**
 * Get the list of gists for the authenticated user.
 *
 * @export
 * @async
 * @returns {Promise<TGist[]>}
 */
export async function getGitHubGistsForAuthenticatedUser(starred: boolean): Promise<TGist[] | undefined> {
    const octokit = new rest.Octokit({
        auth: await credentials.getAccessToken(),
    });

    try {
        let endpointOptions = starred ? octokit.gists.listStarred : octokit.gists.list;

        let data = await octokit.paginate(endpointOptions, (response) => {
            return response.data;
        });

        return Promise.resolve(data);
    } catch (e: any) {
        let starredText = starred ? "starred " : "";
        output?.appendLine(`Could not get ${starredText}gists for the authenticated user. ${e.message}`, output.messageType.error);
    }

    return Promise.reject(undefined);
}

/**
 * Return gist details from GitHub
 *
 * @export
 * @async
 * @param {string} gistId The id of the gist to get
 * @returns {(Promise<TGist | undefined>)}
 */
export async function getGitHubGist(gistId: string): Promise<TGist | undefined> {
    // @update: any
    const octokit = new rest.Octokit({
        auth: await credentials.getAccessToken(),
    });

    try {
        const { data } = await octokit.gists.get({ gist_id: gistId, headers: { Accept: "application/vnd.github.base64" } });
        return Promise.resolve(data);
    } catch (e: any) {
        output?.appendLine(`Could not get gist "${gistId}". ${e.message}`, output.messageType.error);
    }

    return Promise.reject();
}

/**
 * Create a new file or update an existing file in a GitHub gist.
 *
 * @export
 * @async
 * @param {GistNode} gist The gist to create the file in.
 * @param {TContent} file The file to create or update.
 * @param {Uint8Array} content The content of the file.
 * @returns {Promise<TGitHubUpdateContent>}
 */
export async function createOrUpdateFile(gist: GistNode, file: TGistFileNoKey, content: Uint8Array): Promise<TGist> {
    const fileContentString = content.length > 0 ? new TextDecoder().decode(content) : ZERO_WIDTH_SPACE;
    file!.content = fileContentString;

    const octokit = new rest.Octokit({
        auth: await credentials.getAccessToken(),
    });

    try {
        // @todo update gist description
        let { data } = await octokit.gists.update({
            gist_id: gist.gist.id!,
            files: {
                [file!.filename!]: { content: fileContentString },
            },
        });

        output?.appendLine(`Updated "${file!.filename!}" in gist "${gist.description}"`, output.messageType.info);
        return Promise.resolve(data);
    } catch (e: any) {
        output?.logError(gist.gist, e);
    }

    return Promise.reject();
}

/**
 * Delete the file from the gist.
 *
 * @export
 * @async
 * @param {TGist} gist The gist to delete the file from
 * @param {string} filePath The path of the file to delete
 * @returns {Promise<TGist>}
 */
export async function deleteGistFile(gist: TGist, filePath: string): Promise<TGist> {
    const octokit = new rest.Octokit({
        auth: await credentials.getAccessToken(),
    });

    filePath = filePath.split("/").slice(1).join("/");

    try {
        let { data } = await octokit.gists.update({
            gist_id: gist.id!,
            files: {
                [filePath]: null as any,
            },
        });

        output?.appendLine(`Deleted "${filePath}" from gist "${gist.description}"`, output.messageType.info);
        return Promise.resolve(data);
    } catch (e: any) {
        output?.appendLine(`Could not delete file "${filePath}" from gist "${gist.description}". ${e.message}`, output.messageType.error);
    }

    return Promise.reject();
}

/**
 * Create a new gist on GitHub
 *
 * @export
 * @async
 * @param {TGist} gist The gist to create
 * @param {boolean} publicGist Whether the gist should be public or not
 * @returns {(Promise<TGist | undefined>)}
 */
export async function createGitHubGist(gist: TGist, publicGist: boolean): Promise<TGist | undefined> {
    const octokit = new rest.Octokit({
        auth: await credentials.getAccessToken(),
    });

    const fileName = Object.keys(gist.files!)[0];
    try {
        const { data } = await octokit.gists.create({
            description: gist.description!,
            files: {
                [fileName]: { content: ZERO_WIDTH_SPACE },
            },
            public: publicGist,
            headers: { Accept: "application/vnd.github+json" },
        });

        output?.appendLine(`Created gist "${data.description}"`, output.messageType.info);
        return Promise.resolve(data);
    } catch (e: any) {
        output?.logError(gist, e);
    }

    return Promise.reject();
}

/**
 * Delete a gist from GitHub
 *
 * @export
 * @async
 * @param {TGist} gist The gist to delete
 * @returns {Promise<void>}
 */
export async function deleteGitHubGist(gist: TGist): Promise<void> {
    const octokit = new rest.Octokit({
        auth: await credentials.getAccessToken(),
    });

    try {
        await octokit.gists.delete({
            gist_id: gist.id!,
            headers: { Accept: "application/vnd.github+json" },
        });
        output?.appendLine(`Gist "${gist.description}" deleted successfully`, MessageType.info);
        return Promise.resolve();
    } catch (e: any) {
        output?.logError(gist, e);
    }

    return Promise.reject();
}
