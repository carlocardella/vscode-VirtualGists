import { GistNode } from "../Tree/nodes";
import { ExtensionContext } from "vscode";
import { GLOBAL_STORAGE_KEY } from "../GitHub/constants";
import { credentials, output, gistProvider } from "../extension";
import { TGist } from "../GitHub/types";

export const store = {
    gists: [] as (GistNode | undefined)[],
};

/**
 * Add a repository to the list of repositories in Global Storage
 *
 * @export
 * @param {ExtensionContext} context Extension context
 * @param {string} value Repository to add
 */
export async function addToGlobalStorage(context: ExtensionContext, value: string): Promise<void> {
    let globalStorage = await getFollowedUsersFromGlobalStorage(context);

    let [owner, gistName] = ["", ""];
    if (value.indexOf("/") === -1) {
        owner = credentials.authenticatedUser.login;
        gistName = value;
    } else {
        [owner, gistName] = value.split("/");
    }

    globalStorage.push(`${owner}/${gistName}`);
    context.globalState.update(GLOBAL_STORAGE_KEY, globalStorage);

    gistProvider.refresh();

    output?.appendLine(`Added ${value} to global storage`, output.messageType.info);
    output?.appendLine(`Global storage: ${globalStorage}`, output.messageType.info);
}

/**
 * Remove a repository from the list of repositories in Global Storage
 *
 * @export
 * @param {ExtensionContext} context Extension context
 * @param {string} repoFullName Repository to remove
 */
export function removeFromGlobalStorage(context: ExtensionContext, repoFullName: string): void {
    let globalStorage = context.globalState.get(GLOBAL_STORAGE_KEY) as string[];
    if (globalStorage) {
        globalStorage = globalStorage.filter((item) => item.toLocaleLowerCase() !== repoFullName.toLocaleLowerCase());
        context.globalState.update(GLOBAL_STORAGE_KEY, globalStorage);

        gistProvider.refresh();

        output?.appendLine(`Removed ${repoFullName} from global storage`, output.messageType.info);
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
    return context.globalState.get(GLOBAL_STORAGE_KEY, []);
    // return await purgeGlobalStorage(context);
}

/**
 * Remove all repositories from Global Storage
 *
 * @export
 * @param {ExtensionContext} context
 */
export function clearGlobalStorage(context: ExtensionContext) {
    context.globalState.update(GLOBAL_STORAGE_KEY, []);
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
