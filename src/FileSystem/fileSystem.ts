import { Disposable, Event, EventEmitter, FileChangeEvent, FileStat, FileSystemError, FileSystemProvider, FileType, TextDocument, Uri } from "vscode";
import { getGistFileContent } from "../GitHub/commands";
import { TContent } from "../GitHub/types";
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

export class GistFileSystemProvider implements FileSystemProvider {
    private _onDidChangeFile = new EventEmitter<FileChangeEvent[]>();
    readonly onDidChangeFile: Event<FileChangeEvent[]> = this._onDidChangeFile.event;

    constructor() {
        this._onDidChangeFile = new EventEmitter<FileChangeEvent[]>();
    }

    async readFile(uri: Uri): Promise<Uint8Array> {
        const [gist, file] = GistFileSystemProvider.getGistInfo(uri)!;
        return await getGistFileContent(file);
    }

    static getGistInfo(uri: Uri): [GistNode, TContent] | undefined {
        const [gistId, path] = GistFileSystemProvider.getFileInfo(uri);

        const gistNode = store.gists.find((gist) => gist!.gist.id === gistId);
        const file: TContent = Object.values(gistNode!.gist.files!).find((file) => file!.filename === path)!;

        return [gistNode!, file];
    }

    watch(_resource: Uri): Disposable {
        // ignore, fires for all changes...
        return new Disposable(() => {});
    }

    static getFileUri(gistId: string, filePath: string = "") {
        return Uri.parse(`${GIST_SCHEME}://${gistId}/${filePath}`);
    }

    static getFileInfo(uri: Uri): [string, string] {
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

        const [gistNode, file] = GistFileSystemProvider.getGistInfo(uri)!;

        if (gistNode && file) {
            const type = FileType.File;

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
        // let repository = store.gists.find((repo) => repo!.name === uri.authority)!;
        // let file: TContent = repository!.tree?.tree.find((file: TContent) => file?.path === uri.path.substring(1));

        // if (!file) {
        //     file = {};
        //     file.path = uri.path.substring(1);
        //     createOrUpdateFile(repository, file, content)
        //         .then((response: TGitHubUpdateContent) => {
        //             file!.sha = response.content?.sha;
        //             file!.size = response.content?.size;
        //             file!.url = response.content?.git_url;
        //         })
        //         .then(() => {
        //             refreshGitHubTree(repository.repo, repository.repo.default_branch).then((tree) => {
        //                 repository.repo.tree = tree;
        //             });
        //         });

        //     this._onDidChangeFile.fire([{ type: FileChangeType.Created, uri }]); // investigate: needed?
        //     gistProvider.refresh();
        // } else {
        //     file.path = uri.path.substring(1);
        //     createOrUpdateFile(repository, file, content).then((response: TGitHubUpdateContent) => {
        //         file!.sha = response.content?.sha;
        //         file!.size = response.content?.size;
        //         file!.url = response.content?.git_url;
        //     });

        //     refreshGitHubTree(repository.repo, repository.repo.default_branch).then((tree) => {
        //         repository.repo.tree = tree;
        //     });

        //     this._onDidChangeFile.fire([{ type: FileChangeType.Changed, uri }]); // investigate: needed?
        //     // repoProvider.refresh();
        // }

        return Promise.resolve();
    }
}
