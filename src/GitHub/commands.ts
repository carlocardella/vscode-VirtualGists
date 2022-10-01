import { TextEncoder } from "util";
import { ProgressLocation, QuickPickItem, QuickPickItemKind, Uri, window, workspace } from "vscode";
import { GistFile, GistFileSystemProvider, REPO_SCHEME } from "../FileSystem/fileSystem";
import { ContentNode, GistNode } from "../Tree/nodes";
import { getGitHubGistContent, newGitHubRepository, deleteGitHubRepository, getGitHubGistsForAuthenticatedUser, getStarredGitHubRepositories } from "./api";
import { TContent, TGist, TRepo } from "./types";
import { credentials, extensionContext, output } from "../extension";
import { addToGlobalStorage, removeFromGlobalStorage } from "../FileSystem/storage";

export async function getGistFileContent(gist: GistNode, file: TContent): Uint8Array {}

export async function getGistDetails(gist: string): [string, string] {}

export async function getOwnedGists(): Promise<TGist[] | undefined> {
    let gistsForAuthenticatedUser = await getGitHubGistsForAuthenticatedUser(false);
    let gists = gistsForAuthenticatedUser?.map((gist: TGist) => {
        gist.starred = false;
        return gist;
    });

    return Promise.resolve(gists);
}

export async function getStarredGists(): Promise<TGist[] | undefined> {
    let starredGists = await getGitHubGistsForAuthenticatedUser(true);
    let gists = starredGists?.map((gist: TGist) => {
        gist.starred = true;
        return gist;
    });

    return Promise.resolve(gists);
}
