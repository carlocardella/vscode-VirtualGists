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
import { gistProvider } from "../extension";
import { createOrUpdateFile, refreshGitHubTree } from "../GitHub/api";
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
        const [gist, file] = GistFileSystemProvider.findGist(uri)!;
        return await getGistFileContent(file);
    }

    static findGist(uri: Uri): [GistNode, TContent] {
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

        const [gistNode, file] = GistFileSystemProvider.findGist(uri)!;

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
        throw new Error("FileSystem.readDirectory method not implemented.");
    }

    createDirectory(uri: Uri): void {
        // Folders do not really exist in Git, no action needed
    }

    writeFile(uri: Uri, content: Uint8Array, options: { create: boolean; overwrite: boolean }): Promise<void> {
        let [gist, file] = GistFileSystemProvider.findGist(uri)!;

        if (!gist || !file) {
            // create a new file
            throw FileSystemError.FileNotFound(uri);
        } else {
            // update an existing file
            createOrUpdateFile(gist, file, content).then((response) => {
                gist.gist = response;
            });
        }

        gistProvider.refresh();

        this._onDidChangeFile.fire([{ type: FileChangeType.Changed, uri }]);

        return Promise.resolve();
    }
}
