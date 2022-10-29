import { GistNode } from "../Tree/nodes";
import { ExtensionContext } from "vscode";
import { FOLLOWED_USERS_GLOBAL_STORAGE_KEY, GIST_USER } from "../GitHub/constants";
import { output, gistProvider } from "../extension";
import { TGist } from "../GitHub/types";

export const store = {
    gists: [] as (GistNode | undefined)[],
};

/**
 * Add a followed user or opened gist to Global Storage
 *
 * @export
 * @param {ExtensionContext} context Extension context
 * @param {string} value Repository to add
 */
export async function addToGlobalStorage(context: ExtensionContext, value: string): Promise<void> {
    let globalStorage = await getFollowedUsersFromGlobalStorage(context);

    globalStorage.push(value);
    context.globalState.update(FOLLOWED_USERS_GLOBAL_STORAGE_KEY, globalStorage);

    gistProvider.refresh();

    output?.appendLine(`Added ${value} to global storage`, output.messageType.info);
    output?.appendLine(`Global storage: ${globalStorage}`, output.messageType.info);
}

/**
 * Remove a repository from the list of repositories in Global Storage
 *
 * @export
 * @param {ExtensionContext} context Extension context
 * @param {string} userName Repository to remove
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
export async function getFollowedUsersFromGlobalStorage(context: ExtensionContext): Promise<string[]> {
    const followedUsers = context.globalState.get(FOLLOWED_USERS_GLOBAL_STORAGE_KEY, []) as string[];

    return Promise.resolve(followedUsers);
}

/**
 * Remove all repositories from Global Storage
 *
 * @export
 * @param {ExtensionContext} context
 */
export function clearGlobalStorage(context: ExtensionContext) {
    context.globalState.update(FOLLOWED_USERS_GLOBAL_STORAGE_KEY, []);
    output?.appendLine(`Cleared global storage`, output.messageType.info);
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
