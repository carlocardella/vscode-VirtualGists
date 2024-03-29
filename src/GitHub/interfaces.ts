import { QuickPickItem } from "vscode";

export interface Tree {
    sha: string;
    url: string;
    treeItem: TreeItem[];
}

export interface TreeItem {
    path: string;
    mode: string;
    type: string;
    sha: string;
    url: string;
}

export interface File {
    name: string;
    path: string;
    sha: string;
    size: number;
    url: string;
    htmlUrl: string;
    gitUrl: string;
    downloadUrl: string;
    type: string;
    content: string;
    encoding: string;
    _links: Links;
}

export interface Links {
    git: string;
    html: string;
    self: string;
}

export interface Folder {}

export interface Owner {
    login: string;
    id: number;
    nodeId: string;
    avatarUrl: string;
    gravatarId: string;
    url: string;
    htmlUrl: string;
    followersUrl: string;
    followingUrl: string;
    gistsUrl: string;
    starredUrl: string;
    subscriptionsUrl: string;
    organizationsUrl: string;
    reposUrl: string;
    eventsUrl: string;
    receivedEventsUrl: string;
    type: string;
    siteAdmin: boolean;
}

export interface User {}

export interface Permission {
    admin: true;
    maintain: true;
    pull: true;
    push: true;
    triage: true;
}

export interface License {
    key: string;
    name: string;
    nodeId: string;
    spdxId: string;
    url: string;
}

export interface State {
    title: string;
    step: number;
    totalSteps: number;
    resourceGroup: QuickPickItem | string;
    name: string;
    runtime: QuickPickItem;
}
