import { getGitHubGist, getGitHubGistsForAuthenticatedUser } from "./api";
import { TContent, TGist } from "./types";

export async function getGistFileContent(file: TContent): Promise<Uint8Array> {
    let content = file?.content ?? "";
 
    return Promise.resolve(new Uint8Array(Buffer.from(content, "base64").toString("latin1").split("").map(charCodeAt)));
}

export async function getGist(gistId: string): Promise<TContent | undefined> {
    const gistContent = await getGitHubGist(gistId);

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
 *
 * @param {string} c The string to filter
 * @returns {*}
 */
function charCodeAt(c: string) {
    return c.charCodeAt(0);
}
