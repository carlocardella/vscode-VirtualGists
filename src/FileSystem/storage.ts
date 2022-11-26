import { GistNode, GistsGroupNode } from "../Tree/nodes";
import { Extension, ExtensionContext, window } from "vscode";
import { FOLLOWED_USERS_GLOBAL_STORAGE_KEY, OPENED_GISTS_GLOBAL_STORAGE_KEY } from "../GitHub/constants";
import { output, gistProvider, store } from "../extension";
import { TGist } from "../GitHub/types";
import { getFollowedUsers, getOpenedGists } from "../GitHub/commands";

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

export async function purgeGlobalStorage(context: ExtensionContext, storageGroup?: GlobalStorageGroup[]) {
    let cleanedGlobalStorage: string[] = [];
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

/**
 * Add a gist to our in memory store
 *
 * @export
 * @param {...GistNode[]} gistNode The gist to add to the store
 */
export function addToOrUpdateLocalStorage(...gistNode: GistNode[]) {
    gistNode.forEach((gist) => {
        let gistIndex = store.gists.findIndex((storedGist) => storedGist?.gist.id === gist.gist.id);
        if (gistIndex > -1) {
            store.gists[gistIndex] = gist;
        } else {
            store.gists.push(gist);
        }
    });
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
