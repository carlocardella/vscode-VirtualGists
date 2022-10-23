import { Credentials } from "./GitHub/authentication";
import * as config from "./config";
import * as trace from "./tracing";
import { commands, ExtensionContext, workspace, window } from "vscode";
import { GistNode, GistProvider, ContentNode } from "./Tree/nodes";
import { GistFileSystemProvider, GIST_SCHEME } from "./FileSystem/fileSystem";
import { TGitHubUser, TGist } from './GitHub/types';
import { clearGlobalStorage, getFollowedUsersFromGlobalStorage, removeFromGlobalStorage } from "./FileSystem/storage";
import { GLOBAL_STORAGE_KEY } from "./GitHub/constants";
import { getGitHubAuthenticatedUser } from "./GitHub/api";

export let output: trace.Output;
export const credentials = new Credentials();
export let gitHubAuthenticatedUser: TGitHubUser;
export let extensionContext: ExtensionContext;
export const gistProvider = new GistProvider();
export const gistFileSystemProvider = new GistFileSystemProvider();

// hack: https://angularfixing.com/how-to-access-textencoder-as-a-global-instead-of-importing-it-from-the-util-package/
import { TextEncoder as _TextEncoder } from "node:util";
import { TextDecoder as _TextDecoder } from "node:util";
import { addFile, createGist, deleteFile, deleteGist } from "./GitHub/commands";
declare global {
    var TextEncoder: typeof _TextEncoder;
    var TextDecoder: typeof _TextDecoder;
}

export async function activate(context: ExtensionContext) {
    extensionContext = context;
    if (config.get("EnableTracing")) {
        output = new trace.Output();
    }

    gitHubAuthenticatedUser = await getGitHubAuthenticatedUser();

    output?.appendLine("Virtual Gists extension is active", output.messageType.info);

    await credentials.initialize(context);
    if (!credentials.isAuthenticated) {
        credentials.initialize(context);
    }
    const disposable = commands.registerCommand("VirtualGists.getGitHubUser", async () => {
        const octokit = await credentials.getOctokit();
        const userInfo = await octokit.users.getAuthenticated();

        output?.appendLine(`Logged to GitHub as ${userInfo.data.login}`, output.messageType.info);
    });

    context.subscriptions.push(
        commands.registerCommand("VirtualGists.refreshTree", async () => {
            gistProvider.refresh();
        })
    );

    context.subscriptions.push(
        commands.registerCommand("VirtualGists.getGlobalStorage", async () => {
            const followedUsersFromGlobalStorage = await getFollowedUsersFromGlobalStorage(context);
            if (followedUsersFromGlobalStorage.length > 0) {
                output?.appendLine(`Global storage: ${followedUsersFromGlobalStorage}`, output.messageType.info);
            } else {
                output?.appendLine(`Global storage is empty`, output.messageType.info);
            }
        })
    );

    context.subscriptions.push(
        commands.registerCommand("VirtualGists.purgeGlobalStorage", async () => {
            // purgeGlobalStorage(extensionContext);
            throw new Error("Not implemented");
        })
    );

    context.subscriptions.push(
        commands.registerCommand("VirtualGists.removeFromGlobalStorage", async () => {
            const gistsFromGlobalStorage = await getFollowedUsersFromGlobalStorage(context);
            const gistToRemove = await window.showQuickPick(gistsFromGlobalStorage, {
                placeHolder: "Select gist to remove from global storage",
                ignoreFocusOut: true,
                canPickMany: false,
            });
            if (gistToRemove) {
                removeFromGlobalStorage(context, gistToRemove);
            }
        })
    );

    context.subscriptions.push(
        commands.registerCommand("VirtualGists.clearGlobalStorage", async () => {
            clearGlobalStorage(context);
        })
    );

    context.subscriptions.push(
        workspace.registerFileSystemProvider(GIST_SCHEME, gistFileSystemProvider, {
            isCaseSensitive: true,
        })
    );

    context.subscriptions.push(
        commands.registerCommand("VirtualGists.deleteNode", async (node: GistNode | ContentNode) => {
            if (node instanceof GistNode) {
                deleteGist(node.gist);
            }
            
            if (node instanceof ContentNode) {
                // deleteGist(node.gist);
                deleteFile(node);
            }
        })
    );

    context.subscriptions.push(
        commands.registerCommand("VirtualGists.newPrivateGist", async () => {
            createGist(false);
        })
    );

    context.subscriptions.push(
        commands.registerCommand("VirtualGists.newPublicGist", async () => {
            createGist(true);
        })
    );

    context.subscriptions.push(
        commands.registerCommand("VirtualGists.addFile", async (gist: GistNode) => {
            addFile(gist);
        })
    );

    // register global storage
    const keysForSync = [GLOBAL_STORAGE_KEY];
    context.globalState.setKeysForSync(keysForSync);

    context.subscriptions.push(
        workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration("VirtualGists.EnableTracing")) {
                if (config.get("EnableTracing")) {
                    output = new trace.Output();
                } else {
                    output?.dispose();
                }
            }
        })
    );

    window.createTreeView("virtualGistsView", {
        treeDataProvider: gistProvider,
        showCollapseAll: true,
        canSelectMany: true,
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
