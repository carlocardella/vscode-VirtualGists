import * as rest from "@octokit/rest";
import { credentials, output } from "../extension";
import { GistNode } from "../Tree/nodes";
import { TGistFileNoKey, TGist, TGitHubUser, TTree } from "./types";

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

export async function getGitHubGist(gistId: string): Promise<TGist | undefined> {
    // @update: any
    const octokit = new rest.Octokit({
        auth: await credentials.getAccessToken(),
    });

    try {
        const { data } = await octokit.gists.get({ gist_id: gistId, headers: { Accept: "application/vnd.github.base64" } });
        return Promise.resolve(data);
    } catch (e: any) {
        output?.appendLine(`Could not get gist ${gistId}. ${e.message}`, output.messageType.error);
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
    const fileContentString = new TextDecoder().decode(content);
    file!.content = fileContentString;

    const octokit = new rest.Octokit({
        auth: await credentials.getAccessToken(),
    });

    try {
        // todo: update gist description
        let { data } = await octokit.gists.update({
            gist_id: gist.gist.id!,
            files: {
                [file!.filename!]: { content: fileContentString },
            },
        });

        return Promise.resolve(data);
    } catch (e: any) {
        output?.logError(gist.gist, e);
    }

    return Promise.reject();
}

export async function createGitHubGist(gist: TGist): Promise<TGist | undefined> {
    const octokit = new rest.Octokit({
        auth: await credentials.getAccessToken(),
    });

    const fileName = Object.keys(gist.files!)[0];
    const fileContent = `# ${fileName}`;
    // const fileContent = Object.values(gist.files!)[0]!.content ?? `# ${fileName}`;
    try {
        const { data } = await octokit.gists.create({
            description: gist.description!,
            files: {
                filename: { content: fileContent },
            },
            public: false,
            headers: { Accept: "application/vnd.github+json" },
        });
        return Promise.resolve(data);
    } catch (e: any) {
        output?.logError(gist, e);
    }

    return Promise.reject();
}

export async function deleteGitHubGist(gist: TGist): Promise<void> {
    const octokit = new rest.Octokit({
        auth: await credentials.getAccessToken(),
    });

    try {
        await octokit.gists.delete({
            gist_id: gist.id!,
            headers: { Accept: "application/vnd.github+json" },
        });
        return Promise.resolve();
    } catch (e: any) {
        output?.logError(gist, e);
    }

    return Promise.reject();
}
