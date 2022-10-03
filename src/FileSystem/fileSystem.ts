import {
    Disposable,
    Event,
    EventEmitter,
    FileChangeEvent,
    FileChangeType,
    FileStat,
    FileSystemError,
    FileSystemProvider,
    FileType,
    TextDocument,
    Uri,
} from "vscode";
import { gistProvider, gistFileSystemProvider } from '../extension';
import { deleteGitHubFile, refreshGitHubTree, createOrUpdateFile } from "../GitHub/api";
import { getGistFileContent } from "../GitHub/commands";
import { TGitHubUpdateContent, TContent, TGistFile } from "../GitHub/types";
import { GistNode } from "../Tree/nodes";
import { store } from "./storage";

export const GIST_SCHEME = "github-gist";
const GIST_QUERY = `${GIST_SCHEME}=`;

export class GistFile implements FileStat {
    type: FileType;
    ctime: number;
    mtime: number;
    size: number;

    name: string;
    data?: Uint8Array;

    constructor(name: string) {
        this.name = name;
        this.type = FileType.File;
        this.ctime = Date.now();
        this.mtime = Date.now();
        this.size = 0;
    }
}

export class GistDirectory implements FileStat {
    type: FileType;
    ctime: number;
    mtime: number;
    size: number;

    name: string;
    data?: Uint8Array;

    constructor(name: string) {
        this.name = name;
        this.type = FileType.Directory;
        this.ctime = Date.now();
        this.mtime = Date.now();
        this.size = 0;
    }
}

export class GistFileSystemProvider implements FileSystemProvider {
    private _onDidChangeFile = new EventEmitter<FileChangeEvent[]>();
    readonly onDidChangeFile: Event<FileChangeEvent[]> = this._onDidChangeFile.event;

    constructor() {
        this._onDidChangeFile = new EventEmitter<FileChangeEvent[]>();
    }

    async readFile(uri: Uri): Promise<Uint8Array> {
        const [gist, file] = GistFileSystemProvider.getGistInfo(uri)!;
        return await getGistFileContent(gist, file);
    }

    static getGistInfo(uri: Uri): [GistNode, TContent] | undefined {
        const match = GistFileSystemProvider.getFileInfo(uri);

        if (!match) {
            // investigate: really needed? This likely always matches since getFileInfo does nothing more that parse the uri
            return;
        }

        const gistNode = store.gists.find((gist) => gist!.gist.id === match[0]);
        const file: TContent = Object.values(gistNode!.gist.files).find((file) => file.filename === match[1]);

        return [gistNode!, file];
    }

    watch(_resource: Uri): Disposable {
        // ignore, fires for all changes...
        return new Disposable(() => {});
    }

    static getFileUri(gistId: string, filePath: string = "") {
        return Uri.parse(`${GIST_SCHEME}://${gistId}/${filePath}`);
    }

    static getFileInfo(uri: Uri): [string, string] | undefined {
        const gistId = uri.authority;
        const path = uri.path.startsWith("/") ? uri.path.substring(1) : uri.path;

        return [gistId, path];
    }

    static isGistDocument(document: TextDocument, repo?: string) {
        return document.uri.scheme === GIST_SCHEME && (!repo || document.uri.query === `${GIST_QUERY}${repo}`);
    }

    stat(uri: Uri): FileStat {
        if (uri.path === "/") {
            return {
                type: FileType.Directory,
                ctime: Date.now(),
                mtime: Date.now(),
                size: 100,
            };
        }

        const fileInfo = GistFileSystemProvider.getGistInfo(uri);

        if (fileInfo && fileInfo[1]) {
            const type = fileInfo[1].type === "blob" ? FileType.File : FileType.Directory;

            return {
                type,
                ctime: Date.now(),
                mtime: Date.now(),
                size: 100,
            };
        } else {
            throw FileSystemError.FileNotFound(uri);
        }
    }

    async delete(uri: Uri): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async rename(uri: Uri): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async deleteDirectory(uri: Uri): Promise<void> {
        // Folders do not really exist in Git, no action needed
    }

    readDirectory(uri: Uri): [string, FileType][] {
        throw new Error("Method not implemented.");
    }

    createDirectory(uri: Uri): void {
        // Folders do not really exist in Git, no action needed
    }

    writeFile(uri: Uri, content: Uint8Array, options: { create: boolean; overwrite: boolean }): Promise<void> {
        let repository = store.gists.find((repo) => repo!.name === uri.authority)!;
        let file: TContent = repository!.tree?.tree.find((file: TContent) => file?.path === uri.path.substring(1));

        if (!file) {
            file = {};
            file.path = uri.path.substring(1);
            createOrUpdateFile(repository, file, content)
                .then((response: TGitHubUpdateContent) => {
                    file!.sha = response.content?.sha;
                    file!.size = response.content?.size;
                    file!.url = response.content?.git_url;
                })
                .then(() => {
                    refreshGitHubTree(repository.repo, repository.repo.default_branch).then((tree) => {
                        repository.repo.tree = tree;
                    });
                });

            this._onDidChangeFile.fire([{ type: FileChangeType.Created, uri }]); // investigate: needed?
            gistProvider.refresh();
        } else {
            file.path = uri.path.substring(1);
            createOrUpdateFile(repository, file, content).then((response: TGitHubUpdateContent) => {
                file!.sha = response.content?.sha;
                file!.size = response.content?.size;
                file!.url = response.content?.git_url;
            });

            refreshGitHubTree(repository.repo, repository.repo.default_branch).then((tree) => {
                repository.repo.tree = tree;
            });

            this._onDidChangeFile.fire([{ type: FileChangeType.Changed, uri }]); // investigate: needed?
            // repoProvider.refresh();
        }

        return Promise.resolve();
    }
}
