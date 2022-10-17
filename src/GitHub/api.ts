import * as rest from "@octokit/rest";
import { TextDecoder } from "util";
import { credentials, output } from "../extension";
import { GistNode } from "../Tree/nodes";
import { TBranch, TContent, TGistFileNoKey, TGist, TGitHubUpdateContent, TGitHubUser, TTree } from "./types";

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
export async function createOrUpdateFile(gist: GistNode, file: TGistFileNoKey, content: Uint8Array): Promise<TGitHubUpdateContent> {
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

/**
 * Returns a  GitHub tree
 *
 * @export
 * @async
 * @param {TGist} repo
 * @param {string} treeSHA
 * @returns {Promise<TTree>}
 */
export async function getGitHubTree(repo: TGist, treeSHA: string): Promise<TTree | undefined> {
    // const octokit = new rest.Octokit({
    //     auth: await credentials.getAccessToken(),
    // });

    // try {
    //     const { data } = await octokit.git.getTree({
    //         owner: repo.owner.login,
    //         repo: repo.name,
    //         tree_sha: treeSHA,
    //         recursive: "true",
    //     });

    //     return Promise.resolve(data);
    // } catch (e: any) {
    //     output?.logError(repo, e);
    // }

    // return Promise.reject(undefined);
    throw new Error("Not implemented");
}

/**
 * Refresh the GitHub tree for a given repository and branch
 *
 * @export
 * @async
 * @param {TGist} gist The repository to refresh the tree for
 * @param {string} branchName The branch to refresh the tree for
 * @returns {(Promise<TTree | undefined>)}
 */
export async function refreshGitHubTree(gist: TGist, branchName: string): Promise<TTree | undefined> {
    // const octokit = new rest.Octokit({
    //     auth: await credentials.getAccessToken(),
    // });

    // try {
    //     const { data } = await octokit.git.getRef({
    //         owner: gist.owner?.login!,
    //         repo: gist.id!,
    //         ref: `heads/${branchName}`,
    //     });

    //     return getGitHubTree(gist, data.object.sha);
    // } catch (e: any) {
    //     output?.logError(gist, e);
    // }

    // return Promise.reject(undefined);
    throw new Error("Not implemented");
}

/**
 * Returns a GitHub repo
 *
 * @export
 * @async
 * @param {TGist} repo The owner of the repo
 * @param {string} repoName The name of the repo
 * @returns {Promise<TGist>}
 */
export async function getGitHubRepo(repo: TGist, repoName: string): Promise<TGist | undefined> {
    // const octokit = new rest.Octokit({
    //     auth: await credentials.getAccessToken(),
    // });

    // try {
    //     const { data } = await octokit.repos.get({
    //         owner: repo.owner.login,
    //         repo: repoName,
    //     });

    //     return Promise.resolve(data);
    // } catch (e: any) {
    //     output?.logError(repo, e);
    // }

    // return Promise.reject(undefined);
    throw new Error("Not implemented");
}

/**
 * Returns a GitHub branch
 *
 * @export
 * @async
 * @param {TGist} repo The repository to get the branch from
 * @param {string} branchName The name of the branch
 * @returns {(Promise<TBranch | undefined>)}
 */
export async function getGitHubBranch(repo: TGist, branchName: string): Promise<TBranch | undefined> {
    // const octokit = new rest.Octokit({
    //     auth: await credentials.getAccessToken(),
    // });

    // try {
    //     const { data } = await octokit.repos.getBranch({
    //         owner: repo.owner.login,
    //         repo: repo.name,
    //         branch: branchName,
    //     });

    //     return Promise.resolve(data);
    // } catch (e: any) {
    //     output?.logError(repo, e);
    // }

    // return undefined;
    throw new Error("Not implemented");
}

/**
 * Lists the branches of a repository.
 *
 * @export
 * @async
 * @param {TGist} repo The repository to get the branches from
 * @returns {(Promise<TGitHubBranchList[] | undefined>)}
 */
export async function listGitHubBranches(repo: TGist): Promise<TBranch[] | undefined> {
    // const octokit = new rest.Octokit({
    //     auth: await credentials.getAccessToken(),
    // });

    // try {
    //     const { data } = await octokit.repos.listBranches({
    //         owner: repo.owner.login,
    //         repo: repo.name,
    //     });

    //     return Promise.resolve(data);
    // } catch (e: any) {
    //     output?.logError(repo, e);
    // }

    // return Promise.reject(undefined);
    throw new Error("Not implemented");
}

/**
 * Delete the selected files from GitHub
 *
 * @export
 * @async
 * @param {TGist} repo The repository to delete the files from
 * @param {TContent} file The file to delete
 * @returns {*}
 */
export async function deleteGitHubFile(repo: TGist, file: TContent) {
    // const octokit = new rest.Octokit({
    //     auth: await credentials.getAccessToken(),
    // });

    // try {
    //     await octokit.repos.deleteFile({
    //         owner: repo.owner.login,
    //         repo: repo.name,
    //         path: file!.path!,
    //         message: `Delete ${file!.path!}`,
    //         sha: file!.sha!,
    //     });
    // } catch (e: any) {
    //     output?.logError(repo, e);
    // }
    throw new Error("Not implemented");
}
