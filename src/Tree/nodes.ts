import { Event, EventEmitter, ThemeIcon, TreeDataProvider, TreeItem, TreeItemCollapsibleState, Uri } from "vscode";
import { GistFileSystemProvider } from "../FileSystem/fileSystem";
import { store, updateStoredGist } from "../FileSystem/storage";
import { getGist, getOwnedGists, getStarredGists } from "../GitHub/commands";
import { TContent, TGist, TGistFile } from "../GitHub/types";

enum GistsGroupType {
    myGists = "My Gists",
    starredGists = "Starred Gists",
    notepad = "Notepad",
}

export class GistsGroupNode extends TreeItem {
    gists: GistNode[] | undefined;
    groupType: GistsGroupType;

    constructor(groupType: GistsGroupType | string, gists?: GistNode[] | undefined) {
        super(groupType, TreeItemCollapsibleState.Collapsed);

        this.tooltip = groupType;
        this.label = groupType;
        this.groupType = groupType as GistsGroupType;
        switch (groupType) {
            case GistsGroupType.myGists:
                this.iconPath = new ThemeIcon("output");
                break;
            case GistsGroupType.starredGists:
                this.iconPath = new ThemeIcon("star-full");
                break;
            case GistsGroupType.notepad:
                this.iconPath = new ThemeIcon("pencil");
                break;
            default:
                this.iconPath = new ThemeIcon("gist");
                // todo: get user avatar
                break;
        }
        // this.gists = gists;
    }
}

export class GistNode extends TreeItem {
    name: string | null | undefined;
    gist: TGist;
    groupType: GistsGroupType;
    readOnly: boolean;

    constructor(gist: TGist, groupType: GistsGroupType, readOnly?: boolean) {
        super(gist.description!, TreeItemCollapsibleState.Collapsed);

        this.groupType = groupType;
        this.tooltip = gist.description!;
        this.iconPath = gist.public ? new ThemeIcon("gist") : new ThemeIcon("gist-secret");
        this.name = gist.description;
        this.gist = gist;
        this.description = Object.values(gist.files!).length.toString();
        this.readOnly = readOnly ?? false;
    }
}

export class ContentNode extends TreeItem {
    owner: string;
    gist: TGist;
    path: string;
    uri: Uri;
    // sha: string;
    name: string;
    nodeContent: TContent;

    constructor(nodeContent: TGistFile, gist: TGist) {
        super(nodeContent.filename as string, TreeItemCollapsibleState.None);

        this.iconPath = new ThemeIcon("file");
        this.contextValue = "file";
        this.owner = gist.owner?.login ?? "";
        this.nodeContent = nodeContent;
        this.gist = gist;
        this.name = nodeContent.filename as string;
        this.path = this.name;
        this.uri = GistFileSystemProvider.getFileUri(gist.id!, this.path);
        this.resourceUri = this.uri;
        this.tooltip = this.name;
        this.label = this.name;

        this.command = {
            command: "vscode.open",
            title: "Open file",
            arguments: [this.uri, { preview: true }],
        };
    }
}

export class GistProvider implements TreeDataProvider<ContentNode> {
    getTreeItem = (node: ContentNode) => node;

    async getChildren(element?: ContentNode): Promise<any[]> {
        // @update: any
        if (element) {
            let childNodes: any[] = [];
            if (element instanceof GistNode) {
                const gist = (await getGist(element.gist.id!)) as TGist;

                if (gist?.files) {
                    childNodes = Object.values(gist.files)
                        .map((node) => new ContentNode(<TGistFile>node, element.gist))
                        .sort((a, b) => a.name.localeCompare(b.name!))
                        .sort((a, b) => a.nodeContent!.type!.localeCompare(b.nodeContent!.type!));
                }

                // update storage, we already have gist files content
                await updateStoredGist(gist);
            } else if (element instanceof GistsGroupNode) {
                switch (element.label) {
                    case GistsGroupType.myGists:
                        let ownedGists = await getOwnedGists();
                        childNodes = ownedGists?.map((gist) => new GistNode(gist, element.groupType)) ?? [];
                        store.gists.push(...childNodes);
                        break;
                    case GistsGroupType.starredGists:
                        let starredGists = await getStarredGists();
                        childNodes = starredGists?.map((gist) => new GistNode(gist, element.groupType)) ?? [];
                        store.gists.push(...childNodes);
                        break;
                    case GistsGroupType.notepad:
                        throw new Error("Notepad is not implemented yet");
                    default:
                        break;
                }
            }
            return Promise.resolve(childNodes);
        } else {
            let gists: any[] = [];

            let myGistsNode = new GistsGroupNode(
                GistsGroupType.myGists
                // ownedGists?.map((gist) => new GistNode(gist))
            );
            let starredGistsNode = new GistsGroupNode(
                GistsGroupType.starredGists
                // starredGists?.map((gist) => new GistNode(gist))
            );
            // let notepadNode = new GistsGroupNode(GistsGroupType.notepad);
            // gists.push(notepadNode);
            gists.push(myGistsNode);
            gists.push(starredGistsNode);

            return Promise.resolve(gists);
        }
    }

    private _onDidChangeTreeData: EventEmitter<ContentNode | undefined | null | void> = new EventEmitter<ContentNode | undefined | null | void>();
    readonly onDidChangeTreeData: Event<ContentNode | undefined | null | void> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}
