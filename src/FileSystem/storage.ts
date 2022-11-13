import { GistNode } from "../Tree/nodes";
import { ExtensionContext } from "vscode";
import { FOLLOWED_USERS_GLOBAL_STORAGE_KEY, OPENED_GISTS_GLOBAL_STORAGE_KEY } from "../GitHub/constants";
import { output, gistProvider, store } from "../extension";
import { TGist } from "../GitHub/types";

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

/**
 * Add a followed user or opened gist to Global Storage
 *
 * @export
 * @param {ExtensionContext} context Extension context
 * @param {string} value Repository to add
 */
export async function addToGlobalStorage(context: ExtensionContext, globalStorageGroup: string, value: string): Promise<void> {
    let globalStorage = await readFromGlobalStorage(context, globalStorageGroup);

    globalStorage.push(value);
    context.globalState.update(globalStorageGroup, globalStorage);

    gistProvider.refresh();

    output?.appendLine(`Added ${value} to global storage`, output.messageType.info);
    output?.appendLine(`Global storage: ${globalStorage}`, output.messageType.info);
}

/**
 * Remove a user from the list of users in Global Storage
 *
 * @export
 * @param {ExtensionContext} context Extension context
 * @param {string} userName User to remove
 */
export function removeFromGlobalStorage(context: ExtensionContext, userName: string): void {
    let globalStorage = context.globalState.get(FOLLOWED_USERS_GLOBAL_STORAGE_KEY) as string[];
    if (globalStorage) {
        globalStorage = globalStorage.filter((item) => item.toLocaleLowerCase() !== userName.toLocaleLowerCase());
        context.globalState.update(FOLLOWED_USERS_GLOBAL_STORAGE_KEY, globalStorage);

        gistProvider.refresh();

        output?.appendLine(`Removed ${userName} from global storage`, output.messageType.info);
        output?.appendLine(`Global storage: ${globalStorage}`, output.messageType.info);
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

/**
 * Remove all repositories from Global Storage
 *
 * @export
 * @param {ExtensionContext} context
 */
export function clearGlobalStorage(context: ExtensionContext, globalStorageGroup?: string) {
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

/**
 * Update the gist object in our in memory store
 *
 * @export
 * @async
 * @param {TGist} updatedGist The updated gist object to store
 * @returns {Promise<void>}
 */
export async function updateStoredGist(updatedGist: TGist): Promise<void> {
    let currentGist = store.gists.find((storedGist) => storedGist?.gist.id === updatedGist?.id);

    currentGist!.gist = updatedGist;

    return Promise.resolve();
}

/**
 * Add a gist to our in memory store
 *
 * @export
 * @param {...GistNode[]} gistNode The gist to add to the store
 */
export function addToLocalStorage(...gistNode: GistNode[]) {
    store.gists.push(...gistNode);
}

/**
 * Remove a gist from our in memory store
 *
 * @export
 * @param {GistNode} gistNode The gist to remove
 */
export function removeFromLocalStorage(gistNode: GistNode) {
    store.gists = store.gists.filter((gist) => gist?.gist.id !== gistNode.gist.id);
}
