import { Credentials } from "./GitHub/authentication";
import * as config from "./config";
import * as trace from "./tracing";
import { commands, ExtensionContext, workspace, window } from "vscode";
import { GistProvider } from "./Tree/nodes";
import { RepoFileSystemProvider as GistFileSystemProvider, REPO_SCHEME } from "./FileSystem/fileSystem";
import { TGitHubUser } from "./GitHub/types";
import { clearGlobalStorage, getReposFromGlobalStorage as getGistsFromGlobalStorage, purgeGlobalStorage, removeFromGlobalStorage } from "./FileSystem/storage";
import { GLOBAL_STORAGE_KEY } from "./GitHub/constants";
import { getGitHubAuthenticatedUser } from "./GitHub/api";

export let output: trace.Output;
export const credentials = new Credentials();
export let gitHubAuthenticatedUser: TGitHubUser;
export let extensionContext: ExtensionContext;
export const gistProvider = new GistProvider();

export async function activate(context: ExtensionContext) {
    extensionContext = context;
    if (config.get("EnableTracing")) {
        output = new trace.Output();
    }

    gitHubAuthenticatedUser = await getGitHubAuthenticatedUser();

    output?.appendLine("Virtual Gists: extension is now active!", output.messageType.info);

    await credentials.initialize(context);
    if (!credentials.isAuthenticated) {
        credentials.initialize(context);
    }
    const disposable = commands.registerCommand("extension.getGitHubUser", async () => {
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
            const reposFromGlobalStorage = await getGistsFromGlobalStorage(context);
            if (reposFromGlobalStorage.length > 0) {
                output?.appendLine(`Global storage: ${reposFromGlobalStorage}`, output.messageType.info);
            } else {
                output?.appendLine(`Global storage is empty`, output.messageType.info);
            }
        })
    );

    context.subscriptions.push(
        commands.registerCommand("VirtualGists.purgeGlobalStorage", async () => {
            purgeGlobalStorage(extensionContext);
        })
    );

    context.subscriptions.push(
        commands.registerCommand("VirtualGists.removeFromGlobalStorage", async () => {
            const gistsFromGlobalStorage = await getGistsFromGlobalStorage(context);
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

    const gistFileSystemProvider = new GistFileSystemProvider();
    context.subscriptions.push(
        workspace.registerFileSystemProvider(REPO_SCHEME, gistFileSystemProvider, {
            isCaseSensitive: true,
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
    // tv.reveal(store.repos);

    // window.registerTreeDataProvider("Repositories", repoProvider);

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
