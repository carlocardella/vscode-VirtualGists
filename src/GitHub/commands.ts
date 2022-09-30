import { TextEncoder } from "util";
import { ProgressLocation, QuickPickItem, QuickPickItemKind, Uri, window, workspace } from "vscode";
import { RepoFileSystemProvider, REPO_SCHEME } from "../FileSystem/fileSystem";
import { ContentNode, GistNode } from "../Tree/nodes";
import { getGitHubRepoContent, newGitHubRepository, deleteGitHubRepository, getGitHubGistsForAuthenticatedUser, getStarredGitHubRepositories } from "./api";
import { TContent, TRepo } from "./types";
import { credentials, extensionContext, output } from "../extension";
import { addToGlobalStorage, removeFromGlobalStorage } from "../FileSystem/storage";
