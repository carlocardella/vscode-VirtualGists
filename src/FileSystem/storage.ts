import { GistNode } from "../Tree/nodes";
import { ExtensionContext } from "vscode";
import { GLOBAL_STORAGE_KEY } from "../GitHub/constants";
import { credentials, output, gistProvider } from "../extension";
import { getGist } from "../GitHub/commands";
import { TGist } from '../GitHub/types';

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

// /**
//  * Remove invalid repositories from Global Storage
//  *
//  * @export
//  * @async
//  * @param {ExtensionContext} context Extension context
//  * @param {?string[]} [gistId] Repositories to check
//  * @returns {Promise<string[]>}
//  */
// export async function purgeGlobalStorage(context: ExtensionContext, gistId?: string): Promise<string[]> {
//     let cleanedGlobalStorage: string[] = [];
//     if (gistId) {
//         cleanedGlobalStorage = store.gists.find((gist) => gist?.id !== gistId)?.id;
//         context.globalState.update(GLOBAL_STORAGE_KEY, cleanedGlobalStorage);
//     } else {
//         const globalStorage = context.globalState.get(GLOBAL_STORAGE_KEY, []) as string[];
//         cleanedGlobalStorage = await Promise.all(
//             globalStorage.map(async (gist:TGist) => {
//                 // let repoOwner = gist.split("/")[0];
//                 // let repoName = gist.split("/")[1];
//                 let validGist = await getGist(gist.id);
//                 if (!validGist) {
//                     removeFromGlobalStorage(context, gist.id);
//                     output?.appendLine(`Removed ${gist} from global storage`, output.messageType.info);
//                     return Promise.resolve(gist);
//                 } else {
//                     return Promise.reject();
//                 }
//             })
//         );
//     }

//     return cleanedGlobalStorage;
// }

export async function updateStoredGist(updatedGist: GistNode): Promise<boolean> {
    let currentGist = store.gists.find((storedGist) => storedGist?.id === updatedGist?.id);

    currentGist = updatedGist;

    return Promise.reject(false);
}