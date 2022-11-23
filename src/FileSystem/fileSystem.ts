import { Disposable, Event, EventEmitter, FileChangeEvent, FileChangeType, FileStat, FileSystemError, FileSystemProvider, FileType, Uri } from "vscode";
import { gistProvider, store } from "../extension";
import { createGitHubGist, createOrUpdateFile, deleteGistFile, deleteGitHubGist } from "../GitHub/api";
import { getFileNameFromUri, getGistFileContent } from "../GitHub/commands";
import { TGistFileNoKey, TGist } from "../GitHub/types";
import { GistNode } from "../Tree/nodes";

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
        return await getGistFileContent(file!);
    }

    static findGist(uri: Uri): [GistNode, TGistFileNoKey | undefined | null] {
        const [gistId, path] = GistFileSystemProvider.getFileInfo(uri);

        const gistNode = store.gists.find((gist) => gist!.gist.id === gistId);
        let file: TGistFileNoKey | undefined | null;
        if (gistNode?.gist.files) {
            file = Object.values(gistNode?.gist.files).find((gistFile) => gistFile!.filename === path);
        }

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
        const gist = GistFileSystemProvider.findGist(uri)![0].gist;

        if (uri.path === "/") {
            // delete the gist
            return await deleteGitHubGist(gist);
        } else {
            // delete a file
            await deleteGistFile(gist, uri.path);
        }
    }

    async rename(oldUri: Uri, newUri: Uri): Promise<void> {
        let [gist, oldFile] = GistFileSystemProvider.findGist(oldUri)!;
        let newFileName = getFileNameFromUri(newUri);

        if (oldFile && newFileName) {
            await createOrUpdateFile(gist, oldFile, undefined, newFileName);
        }

        return Promise.resolve();
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

        if (!file) {
            // create a new file
            file = {
                filename: uri.path.split("/").slice(1).join("/"),
            } as TGistFileNoKey;
            if (!content) {
                content = new TextEncoder().encode("");
            }
        }

        createOrUpdateFile(gist, file, content).then(() => {
            this._onDidChangeFile.fire([{ type: FileChangeType.Changed, uri }]);
            gistProvider.refresh();
        });

        return Promise.resolve();
    }

    createGist(gist: TGist, publicGist: boolean): Promise<TGist | undefined> {
        return Promise.resolve(createGitHubGist(gist, publicGist));
    }
}
