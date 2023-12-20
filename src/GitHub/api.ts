import * as rest from "@octokit/rest";
import { credentials, output } from "../extension";
import { GistNode } from "../Tree/nodes";
import { GistStarOperation } from "./commands";
import { ZERO_WIDTH_SPACE } from "./constants";
import { TGistFileNoKey, TGist, TGitHubUser, TForkedGist, TUser, TFileToDelete, TTreeRename, TTree, TCommit, TRef } from "./types";

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
        output?.error(`Could not get ${starredText}gists for the authenticated user. ${e.message}`);
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
    const octokit = new rest.Octokit({
        auth: await credentials.getAccessToken(),
    });

    try {
        const { data } = await octokit.gists.get({ gist_id: gistId, headers: { Accept: "application/vnd.github.base64" } });
        return Promise.resolve(data);
    } catch (e: any) {
        output?.error(`Could not read gist "${gistId}". ${e.message}`);
    }
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
export async function createOrUpdateFile(gist: GistNode, files: TGistFileNoKey[], newFileName?: string): Promise<TGist> {
    // prettier-ignore
    const octokit = new rest.Octokit({
        auth: await credentials.getAccessToken(),
    });

    try {
        let data: any;
        // @todo update gist description

        // write file content
        if (files.length > 0) {
            const updatedFiles: { [key: string]: { content: string } } = {};
            files.forEach((f) => {
                const fileContent = f.content ?? "";
                const fileContentString = fileContent.length > 0 ? fileContent : ZERO_WIDTH_SPACE;
                updatedFiles[f.filename!] = { content: fileContentString };
            });

            ({ data } = await octokit.gists.update({
                gist_id: gist.gist.id!,
                files: updatedFiles,
            }));
        }

        if (newFileName && files.length === 1) {
            ({ data } = await octokit.gists.update({
                gist_id: gist.gist.id!,
                files: {
                    [files[0].filename!]: { filename: newFileName },
                },
            }));
        }

        output?.info(`Updated "${files[0].filename!}" in gist "${gist.gist.description}"`);
        return Promise.resolve(data);
    } catch (e: any) {
        output?.error(gist.gist.description!, e);
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
export async function deleteGistFile(gist: TGist, files: TFileToDelete): Promise<TGist> {
    const octokit = new rest.Octokit({
        auth: await credentials.getAccessToken(),
    });

    try {
        output?.trace(`Deleting "${Object.keys(files)}" from gist "${gist.description}"`);
        let { data } = await octokit.gists.update({
            gist_id: gist.id!,
            files: files,
        });

        output?.info(`Deleted "${Object.keys(files)}" from gist "${gist.description}"`);
        return Promise.resolve(data);
    } catch (e: any) {
        output?.error(`Could not delete "${Object.keys(files)}" from gist "${gist.description}". ${e.message}`);
        output?.error(gist.description!, e);
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
        output?.trace(`Creating gist "${gist.description}"`);
        const { data } = await octokit.gists.create({
            description: gist.description!,
            files: {
                [fileName]: { content: ZERO_WIDTH_SPACE },
            },
            public: publicGist,
            headers: { Accept: "application/vnd.github+json" },
        });

        output?.info(`Created gist "${data.description}"`);
        return Promise.resolve(data);
    } catch (e: any) {
        output?.error(gist.description!, e);
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
        output?.trace(`Deleting gist "${gist.description}", id "${gist.id}"`);
        await octokit.gists.delete({
            gist_id: gist.id!,
            headers: { Accept: "application/vnd.github+json" },
        });
        output?.info(`Gist "${gist.description}" deleted successfully`);
        return Promise.resolve();
    } catch (e: any) {
        output?.error(gist.description!, e);
    }

    return Promise.reject();
}

/**
 * List public gists for a GitHub user
 *
 * @export
 * @async
 * @param {string} githubUsername The GitHub username to get the gists for
 * @returns {(Promise<TGist[] | undefined>)}
 */
export async function getGitHubGistForUser(githubUsername: string): Promise<TGist[] | undefined> {
    const octokit = new rest.Octokit({
        auth: await credentials.getAccessToken(),
    });

    try {
        output?.trace(`Getting gists for GitHub user "${githubUsername}"`);
        let data = await octokit.paginate(
            octokit.gists.listForUser,
            { username: githubUsername, headers: { accept: "application/vnd.github+json" } },
            (response) => {
                return response.data;
            }
        );

        return Promise.resolve(data);
    } catch (e: any) {
        output?.warn(`Could not get gists for user "${githubUsername}". ${e.message}`);
    }

    return Promise.reject();
}

/**
 * Returns info about a GitHub user
 *
 * @export
 * @async
 * @param {string} username The username to get info for
 * @returns {(Promise<TGitHubUser | undefined>)}
 */
export async function getGitHubUser(username: string): Promise<TGitHubUser | undefined> {
    const octokit = new rest.Octokit({
        auth: await credentials.getAccessToken(),
    });

    try {
        output?.trace(`Getting details for GitHub user "${username}"`);
        const { data } = await octokit.users.getByUsername({ username: username });
        return Promise.resolve(data);
    } catch (e: any) {
        output?.error(`Could not get GitHub user "${username}". ${e.message}`);
    }

    return Promise.reject();
}

/**
 * Star or unstar a GitHub gist
 *
 * @export
 * @async
 * @param {GistNode} gist The gist to star or unstar
 * @param {GistStarOperation} operation The operation to perform (star or unstar)
 * @returns {Promise<void>}
 */
export async function starGitHubGist(gist: GistNode, operation: GistStarOperation): Promise<void> {
    const octokit = new rest.Octokit({
        auth: await credentials.getAccessToken(),
    });

    try {
        if (operation === GistStarOperation.star) {
            await octokit.gists.star({ gist_id: gist.gist.id! });
            output?.info(`Starred gist "${gist.name}"`);
        }

        if (operation === GistStarOperation.unstar) {
            await octokit.gists.unstar({ gist_id: gist.gist.id! });
            output?.info(`Unstarred gist "${gist.name}"`);
        }

        return Promise.resolve();
    } catch (e: any) {
        output?.error(`Cannot unstar gist "${gist.name}". ${e.message}`);
    }

    return Promise.reject();
}

/**
 * Fork a GitHub gist
 *
 * @export
 * @async
 * @param {GistNode} gist The gist to fork
 * @returns {Promise<any>}
 */
export async function forkGitHubGist(gist: GistNode): Promise<TForkedGist> {
    const octokit = new rest.Octokit({
        auth: await credentials.getAccessToken(),
    });

    try {
        let { data } = await octokit.gists.fork({ gist_id: gist.gist.id! });
        output?.info(`Forked gist "${gist.name}"`);
        return Promise.resolve(data);
    } catch (e: any) {
        output?.error(`Cannot fork gist "${gist.name}". ${e.message}`);
    }

    return Promise.reject();
}

/**
 * Return a list of followed users on GitHub
 *
 * @export
 * @async
 * @returns {Promise<TUser[]>}
 */
export async function getGitHubFollowedUsers(): Promise<TUser[]> {
    const octokit = new rest.Octokit({
        auth: await credentials.getAccessToken(),
    });

    try {
        output?.trace("Getting followed users");
        const data = await octokit.paginate(octokit.users.listFollowedByAuthenticatedUser, (response) => {
            return response.data;
        });

        return Promise.resolve(data);
    } catch (e: any) {
        output?.error(`Cannot get followed users. ${e.message}`);
    }

    return Promise.reject();
}

export async function followGitHubUser(username: string): Promise<void> {
    const octokit = new rest.Octokit({
        auth: await credentials.getAccessToken(),
    });

    try {
        await octokit.users.follow({ username: username });
        output?.info(`Followed user "${username}"`);
        return Promise.resolve();
    } catch (e: any) {
        output?.error(`Cannot follow user "${username} on GitHub". ${e.message}`);
    }
}

/**
 * Create a new Tree on GitHub
 *
 * @export
 * @async
 * @param {GistNode} gist The gist to create the tree in
 * @param {TTreeRename[]} newTree Contents of the new tree
 * @returns {(Promise<TTree | undefined>)}
 */
export async function createGitHubTree(gist: GistNode, newTree: TTreeRename[], deleteFolder?: boolean): Promise<TTree | TTreeRename | undefined> {
    const octokit = new rest.Octokit({
        auth: await credentials.getAccessToken(),
    });

    try {
        let options: any;
        if (deleteFolder) {
            options = { owner: gist.gist.owner, repo: gist.name, tree: newTree };
        } else {
            const base_tree = gist!.tree!.sha;
            options = { owner: gist.gist.owner, repo: gist.name, base_tree, tree: newTree };
        }
        const { data } = await octokit.git.createTree(options);

        return Promise.resolve(data);
    } catch (e: any) {
        output?.appendLine(`Error creating new Tree: ${e.message.trim()}`);
    }

    return Promise.reject(undefined);
}

// The file mode; one of 100644 for file (blob), 100755 for executable (blob), 040000 for subdirectory (tree), 160000 for submodule (commit), or 120000 for a blob that specifies the path of a symlink
/**
 * File Mode for a GitHub tree
 *
 * @export
 * @enum {number}
 */
export enum FileMode {
    file = "100644",
    executable = "100755",
    subdirectory = "040000",
    submodule = "160000",
    symlink = "120000",
}

/**
 * Type Mode
 *
 * @export
 * @enum {number}
 */
export enum TypeMode {
    blob = "blob",
    tree = "tree",
    commit = "commit",
}

/**
 * Create a new commit on GitHub
 *
 * @export
 * @async
 * @param {GistNode} gist The gist to create the commit on
 * @param {string} message The commit message
 * @param {string} tree The tree SHA
 * @param {string[]} parents The parent SHAs
 * @returns {(Promise<TCommit | undefined>)}
 */
export async function createGitHubCommit(gist: GistNode, message: string, tree: string, parents: string[]): Promise<TCommit | undefined> {
    const octokit = new rest.Octokit({
        auth: await credentials.getAccessToken(),
    });

    try {
        const { data } = await octokit.git.createCommit({
            owner: gist.owner,
            repo: gist.name ?? "",
            message,
            tree,
            parents,
        });

        return Promise.resolve(data);
    } catch (e: any) {
        output?.appendLine(`Error creating new commit: ${e.message.trim()}`);
    }

    return Promise.reject(undefined);
}

/**
 * Update a reference in the git database on GitHub
 *
 * @export
 * @async
 * @param {GistNode} gist The gist to update the reference in
 * @param {string} ref The reference to update
 * @param {string} sha The SHA to update the reference to
 * @returns {(Promise<TRef | undefined>)}
 */
export async function updateGitHubRef(gist: GistNode, ref: string, sha: string): Promise<TRef | undefined> {
    const octokit = new rest.Octokit({
        auth: await credentials.getAccessToken(),
    });

    try {
        const { data } = await octokit.git.updateRef({
            owner: gist.owner,
            repo: gist.name ?? "",
            ref,
            sha,
        });

        return Promise.resolve(data);
    } catch (e: any) {
        output?.appendLine(`Error updating ref: ${e.message.trim()}`);
    }

    return Promise.reject(undefined);
}
