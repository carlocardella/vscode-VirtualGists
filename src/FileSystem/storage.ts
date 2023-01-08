import { GistNode, UserNode } from "../Tree/nodes";
import { ExtensionContext, window } from "vscode";
import { FOLLOWED_USERS_GLOBAL_STORAGE_KEY, GlobalStorageKeys, OPENED_GISTS_GLOBAL_STORAGE_KEY } from "../GitHub/constants";
import { output, gistProvider, store, extensionContext } from "../extension";
import { TGist } from "../GitHub/types";
import { getFollowedUsers, getOpenedGists } from "../GitHub/commands";

export enum SortType {
    name = "name",
    creationTime = "creationTime",
    updateTime = "updateTime",
    public = "public"
}

export enum SortDirection {
    ascending = "ascending",
    descending = "descending"
}

/**
 * Class to store and manage repositories; used as source for the TreeVIew
 *
 * @export
 * @class Store
 * @typedef {Store}
 */
export class Store {
    /**
     * Repositories array
     *
     * @public
     * @type {((RepoNode | undefined)[])}
     */
    public gists: (GistNode | undefined)[] = [];

    public followedUsers: (UserNode | undefined)[] = [];

    /**
     * Indicates whether the repositories are sorted
     *
     * @public
     * @type {boolean}
     */
    public isSorted = false;

    /**
     * Repositories sort by property
     *
     * @public
     * @type {SortType}
     */
    // private _sortType: SortType | undefined;
    get sortType(): SortType {
        // return this._sortType;
        return this.getFromGlobalState(extensionContext, GlobalStorageKeys.sortType) ?? SortType.name;
    }
    set sortType(value: SortType) {
        // this._sortType = value;
        this.addToGlobalState(extensionContext, GlobalStorageKeys.sortType, value);
    }

    /**
     * Repositories sort direction
     *
     * @public
     * @type {SortDirection}
     */
    // private _sortDirection: SortDirection | undefined;
    get sortDirection(): SortDirection {
        // return this._sortDirection;
        return this.getFromGlobalState(extensionContext, GlobalStorageKeys.sortDirection) ?? SortDirection.ascending;
    }
    set sortDirection(value: SortDirection) {
        // this._sortDirection = value;
        this.addToGlobalState(extensionContext, GlobalStorageKeys.sortDirection, value);
    }

    /**
     * Initialize or refresh the Store object
     *
     * @async
     */
    async init() {
        // await getOrRefreshStarredRepos();
        // await getOrRefreshFollowedUsers();
        // const reposFromGlobalStorage = this.getGistFromGlobalState(extensionContext);
        // if (reposFromGlobalStorage.length === 0) {
        //     output?.appendLine("No repos found in global storage", output.messageType.info);
        //     return Promise.resolve([]);
        // }
        // let childNodes = this.gists;
        // let repos = await Promise.all(
        //     reposFromGlobalStorage?.map(async (repo: string) => {
        //         let [owner, name] = getRepoDetails(repo);
        //         let repoFromGitHub = await getGitHubRepository(owner, name);
        //         if (repoFromGitHub) {
        //             return Promise.resolve(repoFromGitHub as TGist);
        //         }
        //         return Promise.reject();
        //     })
        // );
        // childNodes = await Promise.all(
        //     repos
        //         .filter((repo) => repo !== undefined)
        //         .map(async (repo) => {
        //             try {
        //                 let branch = await getGitHubBranch(repo!, repo!.default_branch);
        //                 let tree = (await getGitHubTree(repo!, branch!.commit.sha)) ?? undefined;
        //                 let repoNode = new RepoNode(repo!, tree);
        //                 await repoNode.init();
        //                 return repoNode;
        //             } catch (error: any) {
        //                 if (error.name === "HttpError") {
        //                     output?.appendLine(`Error reading repo ${repo!.name}: ${error.response.data.message}`, output.messageType.error);
        //                 } else {
        //                     output?.appendLine(`${repo!.name}: ${error.response}`, output.messageType.error);
        //                 }
        //             }
        //         })
        // );
        // this.gists = childNodes;
        // this.sortType = this.getFromGlobalState(extensionContext, GlobalStorageKeys.sortType);
        // this.sortDirection = this.getFromGlobalState(extensionContext, GlobalStorageKeys.sortDirection);
        // let sortType = this.sortType;
        // let sortDirection = this.sortDirection;
        // if (sortType !== undefined && sortDirection !== undefined) {
        //     this.sortGists(sortType, sortDirection);
        // }
    }

    // /**
    //  * Add a new value to the global storage
    //  *
    //  * @public
    //  * @param {ExtensionContext} context Extension context
    //  * @param {GlobalStorageKeys} key Key to store the value under
    //  * @param {*} value Value to store, must be json serializable
    //  */
    // public addToGlobalState(context: ExtensionContext, key: GlobalStorageKeys, value: any) {
    //     context.globalState.update(key, value);
    // }

    /**
     * Read a value from the global storage
     *
     * @public
     * @param {ExtensionContext} context Extension context
     * @param {GlobalStorageKeys} key Key to read the value from
     * @returns {*}
     */
    public getFromGlobalState(context: ExtensionContext, key: GlobalStorageKeys): any {
        return context.globalState.get(key);
    }

    /**
     * Remove a value from the global storage
     *
     * @public
     * @param {ExtensionContext} context Extension context
     * @param {GlobalStorageKeys} key Key to remove from global storage
     */
    public removeFromGlobalState(context: ExtensionContext, key: GlobalStorageKeys) {
        context.globalState.update(key, undefined);
    }

    /**
     * Get gists from global storage
     *
     * @public
     * @param {ExtensionContext} context Extension context
     * @returns {string[]}
     */
    public getGistFromGlobalState(context: ExtensionContext): string[] {
        return context.globalState.get(GlobalStorageKeys.gistGlobalStorage, []);
    }

    /**
     * Sort repositories
     *
     * @param {SortType} sortType Sort by property
     * @param {SortDirection} sortDirection Sort direction
     */
    sortGists(sortType: SortType, sortDirection: SortDirection, gists?: GistNode[]): GistNode[] {
        if (!gists) {
            gists = this.gists as GistNode[];
        }

        switch (sortType) {
            case SortType.name:
                gists.sort((a, b) => {
                    return a.name!.localeCompare(b.name!);
                });
                break;
            case SortType.creationTime:
                gists.sort((a, b) => {
                    return new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime();
                });
                break;
            case SortType.updateTime:
                gists.sort((a, b) => {
                    return new Date(a.updated_at!).getTime() - new Date(b.updated_at!).getTime();
                });
                break;
        }

        if (sortDirection === SortDirection.descending) {
            gists.reverse();
        }

        this.addToGlobalState(extensionContext, GlobalStorageKeys.sortType, sortType);
        this.addToGlobalState(extensionContext, GlobalStorageKeys.sortDirection, sortDirection);
        this.isSorted = true;

        output?.appendLine(`Sorted repos by ${SortType[sortType]} ${SortDirection[sortDirection]}`, output.messageType.info);

        this.gists = gists;
        return gists;
    }

    /**
     * Add a new value to the global storage
     *
     * @public
     * @param {ExtensionContext} context Extension context
     * @param {GlobalStorageKeys} key Key to store the value under
     * @param {*} value Value to store, must be json serializable
     */
    public addToGlobalState(context: ExtensionContext, key: GlobalStorageKeys, value: any) {
        context.globalState.update(key, value);
    }

    clearGlobalStorage(context: ExtensionContext, globalStorageGroup?: string) {
        if (globalStorageGroup) {
            context.globalState.update(globalStorageGroup, []);
            output?.appendLine(`Cleared global storage ${globalStorageGroup}`, output.messageType.info);
        } else {
            context.globalState.update(GlobalStorageGroup.followedUsers, []);
            context.globalState.update(GlobalStorageGroup.openedGists, []);
            output?.appendLine(`Cleared global storage`, output.messageType.info);
        }

        gistProvider.refresh();
    }

    async purgeGlobalStorage(context: ExtensionContext, storageGroup?: GlobalStorageGroup[]) {
        // let cleanedGlobalStorage: string[] = [];
        let cleanedFollowedUsers: string[] = [];
        let cleanedOpenedGists: string[] = [];

        if (!storageGroup) {
            storageGroup = [GlobalStorageGroup.followedUsers, GlobalStorageGroup.openedGists];
        }

        for (const group of storageGroup) {
            if (group === GlobalStorageGroup.followedUsers) {
                cleanedFollowedUsers = (await getFollowedUsers()).map((user) => user.login);
                context.globalState.update(GlobalStorageGroup.followedUsers, cleanedFollowedUsers);
            }

            if (group === GlobalStorageGroup.openedGists) {
                cleanedOpenedGists = (await getOpenedGists()).map((gist) => gist.id!);
                context.globalState.update(GlobalStorageGroup.openedGists, cleanedOpenedGists);
            }
        }
    }

    /**
     * Remove a repository from global storage
     *
     * @param {ExtensionContext} context Extension context
     * @param {string} repoFullName Full name (owner/name) or the repository to remove from global storage
     */
    removeRepoFromGlobalStorage(context: ExtensionContext, repoFullName: string): void {
        let globalStorage = context.globalState.get(GlobalStorageKeys.gistGlobalStorage) as string[];
        if (globalStorage) {
            globalStorage = globalStorage.filter((item) => item.toLocaleLowerCase() !== repoFullName.toLocaleLowerCase());
            context.globalState.update(GlobalStorageKeys.gistGlobalStorage, globalStorage);

            this.init();

            output?.appendLine(`Removed ${repoFullName} from global storage`, output.messageType.info);
            output?.appendLine(`Global storage: ${globalStorage}`, output.messageType.info);
        }
    }

    // /**
    //  * Add a repository to global storage
    //  *
    //  * @async
    //  * @param {ExtensionContext} context Extension context
    //  * @param {string} value Repository full name (owner/name) to add to global storage
    //  * @returns {Promise<void>}
    //  */
    // async addRepoToGlobalStorage(context: ExtensionContext, value: string): Promise<void> {
    //     let globalStorage = this.getGistFromGlobalState(context);

    //     let [owner, repoName] = ["", ""];
    //     if (value.indexOf("/") === -1) {
    //         owner = credentials.authenticatedUser.login;
    //         repoName = value;
    //     } else {
    //         [owner, repoName] = value.split("/");
    //     }

    //     globalStorage.push(`${owner}/${repoName}`);
    //     context.globalState.update(GlobalStorageKeys.gistGlobalStorage, globalStorage);

    //     this.init();

    //     output?.appendLine(`Added ${value} to global storage`, output.messageType.info);
    //     output?.appendLine(`Global storage: ${globalStorage}`, output.messageType.info);
    // }

    async addToGlobalStorage(context: ExtensionContext, globalStorageGroup: string, value: string): Promise<void> {
        let globalStorage = await readFromGlobalStorage(context, globalStorageGroup);

        if (globalStorage.includes(value)) {
            window.showInformationMessage(`${value} is already in the list`);
            return Promise.resolve();
        }

        globalStorage.push(value);
        context.globalState.update(globalStorageGroup, globalStorage);

        gistProvider.refresh();

        output?.appendLine(`Added ${value} to global storage`, output.messageType.info);
        output?.appendLine(`Global storage: ${globalStorage}`, output.messageType.info);
    }

    /**
     * Add a gist to our in memory store
     *
     * @export
     * @param {...GistNode[]} gistNode The gist to add to the store
     */
    addToOrUpdateLocalStorage(...gistNode: GistNode[]) {
        gistNode.forEach((gist) => {
            let gistIndex = store.gists.findIndex((storedGist) => storedGist?.gist.id === gist.gist.id);
            if (gistIndex > -1) {
                store.gists[gistIndex] = gist;
            } else {
                store.gists.push(gist);
            }
        });
    }
}

/**
 * Global Storage groups
 *
 * @export
 * @class GlobalStorageGroup
 * @typedef {GlobalStorageGroup}
 */
export class GlobalStorageGroup {
    static followedUsers: string = FOLLOWED_USERS_GLOBAL_STORAGE_KEY;
    static openedGists: string = OPENED_GISTS_GLOBAL_STORAGE_KEY;
}

//////////////////////////////////////////////////////////////////////////////////////////////////

// /**
//  * Add a followed user or opened gist to Global Storage
//  *
//  * @export
//  * @param {ExtensionContext} context Extension context
//  * @param {string} value Repository to add
//  */
// export async function addToGlobalStorage(context: ExtensionContext, globalStorageGroup: string, value: string): Promise<void> {
//     let globalStorage = await readFromGlobalStorage(context, globalStorageGroup);

//     if (globalStorage.includes(value)) {
//         window.showInformationMessage(`${value} is already in the list`);
//         return Promise.resolve();
//     }

//     globalStorage.push(value);
//     context.globalState.update(globalStorageGroup, globalStorage);

//     gistProvider.refresh();

//     output?.appendLine(`Added ${value} to global storage`, output.messageType.info);
//     output?.appendLine(`Global storage: ${globalStorage}`, output.messageType.info);
// }

export function removeFromGlobalStorage(context: ExtensionContext, globalStorageGroup: string, gistId: string): void {
    let globalStorage = context.globalState.get(globalStorageGroup) as string[];
    if (globalStorage) {
        globalStorage = globalStorage.filter((id) => id.toLowerCase() !== gistId.toLowerCase());
        context.globalState.update(globalStorageGroup, globalStorage);

        gistProvider.refresh();

        output?.appendLine(`Removed ${gistId} from ${globalStorageGroup}`, output.messageType.info);
        output?.appendLine(`Global storage ${globalStorageGroup}: ${globalStorage}`, output.messageType.info);
    }
}

/**
 * Get the list of repositories from Global Storage
 *
 * @export
 * @param {ExtensionContext} context Extension context
 * @returns {string[]}
 */
export async function readFromGlobalStorage(context: ExtensionContext, globalStorageGroup: string): Promise<string[]> {
    const followedUsers = context.globalState.get(globalStorageGroup, []) as string[];

    return Promise.resolve(followedUsers);
}

// /**
//  * Remove all repositories from Global Storage
//  *
//  * @export
//  * @param {ExtensionContext} context
//  */
// export function clearGlobalStorage(context: ExtensionContext, globalStorageGroup?: string) {
//     if (globalStorageGroup) {
//         context.globalState.update(globalStorageGroup, []);
//         output?.appendLine(`Cleared global storage ${globalStorageGroup}`, output.messageType.info);
//     } else {
//         context.globalState.update(GlobalStorageGroup.followedUsers, []);
//         context.globalState.update(GlobalStorageGroup.openedGists, []);
//         output?.appendLine(`Cleared global storage`, output.messageType.info);
//     }

//     gistProvider.refresh();
// }

// export async function purgeGlobalStorage(context: ExtensionContext, storageGroup?: GlobalStorageGroup[]) {
//     let cleanedGlobalStorage: string[] = [];
//     let cleanedFollowedUsers: string[] = [];
//     let cleanedOpenedGists: string[] = [];

//     if (!storageGroup) {
//         storageGroup = [GlobalStorageGroup.followedUsers, GlobalStorageGroup.openedGists];
//     }

//     for (const group of storageGroup) {
//         if (group === GlobalStorageGroup.followedUsers) {
//             cleanedFollowedUsers = (await getFollowedUsers()).map((user) => user.login);
//             context.globalState.update(GlobalStorageGroup.followedUsers, cleanedFollowedUsers);
//         }

//         if (group === GlobalStorageGroup.openedGists) {
//             cleanedOpenedGists = (await getOpenedGists()).map((gist) => gist.id!);
//             context.globalState.update(GlobalStorageGroup.openedGists, cleanedOpenedGists);
//         }
//     }
// }

/**
 * Update the gist object in our in memory store
 *
 * @export
 * @async
 * @param {TGist} updatedGist The updated gist object to store
 * @returns {Promise<void>}
 */
export async function updateStoredGist(updatedGist: TGist): Promise<void> {
    // @investigate: can this be replaced with addToOrUpdateLocalStorage?
    let currentGist = store.gists.find((storedGist) => storedGist?.gist.id === updatedGist?.id);

    currentGist!.gist = updatedGist;

    return Promise.resolve();
}
