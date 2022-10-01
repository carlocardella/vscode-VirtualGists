import { Event, EventEmitter, ThemeIcon, TreeDataProvider, TreeItem, TreeItemCollapsibleState, Uri } from "vscode";
import { extensionContext } from "../extension";
import { GistFileSystemProvider } from "../FileSystem/fileSystem";
import { getFollowedUsersFromGlobalStorage } from "../FileSystem/storage";
import { getGitHubGistContent } from "../GitHub/api";
import { getOwnedGists, getStarredGists } from "../GitHub/commands";
import { TRepo, ContentType, TContent, TGist } from "../GitHub/types";

enum GistsGroupType {
    myGists = "My Gists",
    starredGists = "Starred Gists",
    notepad = "Notepad",
}

export class GistsGroupNode extends TreeItem {
    gists: GistNode[] | undefined;

    constructor(groupType: GistsGroupType | string, gists?: GistNode[] | undefined) {
        super(groupType, TreeItemCollapsibleState.Collapsed);

        this.tooltip = groupType;
        this.label = groupType;
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
    name: string | null;

    constructor(gist: TGist) {
        super(gist.description!, TreeItemCollapsibleState.Collapsed);

        this.tooltip = gist.description!;
        this.iconPath = gist.public ? new ThemeIcon("gist") : new ThemeIcon("gist-secret");
        this.name = gist.description;
    }
}

export class ContentNode extends TreeItem {
    owner: string;
    repo: TRepo;
    path: string;
    uri: Uri;
    sha: string;

    constructor(public nodeContent: TContent, repo: TRepo) {
        super(nodeContent!.name!, nodeContent?.type === ContentType.file ? TreeItemCollapsibleState.None : TreeItemCollapsibleState.Collapsed);

        this.tooltip = nodeContent?.path;
        this.iconPath = nodeContent?.type === ContentType.file ? ThemeIcon.File : ThemeIcon.Folder;
        this.contextValue = nodeContent?.type === ContentType.file ? "file" : "folder";
        this.path = nodeContent?.path ?? "";
        this.uri = GistFileSystemProvider.getFileUri(repo.name, this.path);
        this.resourceUri = this.uri;
        this.owner = repo.owner.login;
        this.nodeContent = nodeContent;
        this.repo = repo;
        this.sha = nodeContent?.sha ?? "";

        if (nodeContent?.type === ContentType.file) {
            this.command = {
                command: "vscode.open",
                title: "Open file",
                arguments: [this.uri, { preview: true }],
            };
        }
    }
}

export class GistProvider implements TreeDataProvider<ContentNode> {
    getTreeItem = (node: ContentNode) => node;

    async getChildren(element?: ContentNode): Promise<any[]> {
        // @update: any
        if (element) {
            let childNodes: any[] = [];
            if (element instanceof GistNode) {
                const content = await getGitHubGistContent(element.owner, element.repo.name, element?.nodeContent?.path);
                childNodes = Object.values(content)
                    .map((node) => new ContentNode(<TContent>node, element.repo))
                    .sort((a, b) => a.nodeContent!.name!.localeCompare(b.nodeContent!.name!))
                    .sort((a, b) => a.nodeContent!.type!.localeCompare(b.nodeContent!.type!));
            } else if (element instanceof GistsGroupNode) {
                switch (element.label) {
                    case GistsGroupType.myGists:
                        let ownedGists = await getOwnedGists();
                        childNodes = ownedGists?.map((gist) => new GistNode(gist)) ?? [];
                        break;
                    case GistsGroupType.starredGists:
                        let starredGists = await getStarredGists();
                        childNodes = starredGists?.map((gist) => new GistNode(gist)) ?? [];
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
                GistsGroupType.starredGists,
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
