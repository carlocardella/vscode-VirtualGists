# Virtual Gists

![preview](https://img.shields.io/badge/-preview-orange)

<!--[![Publish Extension](https://github.com/carlocardella/vscode-VirtualGists/actions/workflows/PublishExtension.yml/badge.svg)](https://github.com/carlocardella/vscode-VirtualGists/actions/workflows/PublishExtension.yml)-->
![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/carlocardella.vscode-virtualGists)
![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/carlocardella.vscode-virtualGists)
![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/carlocardella.vscode-virtualGists)
![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/r/carlocardella.vscode-virtualGists)
[![GitHub issues](https://img.shields.io/github/issues/carlocardella/vscode-VirtualGists.svg)](https://github.com/carlocardella/vscode-VirtualGists/issues)
[![GitHub license](https://img.shields.io/github/license/carlocardella/vscode-VirtualGists.svg)](https://github.com/carlocardella/vscode-VirtualGists/blob/master/LICENSE.md)
[![Twitter](https://img.shields.io/twitter/url/https/github.com/carlocardella/vscode-VirtualGists.svg?style=social)](https://twitter.com/intent/tweet?text=Wow:&url=https%3A%2F%2Fgithub.com%2Fcarlocardella%2Fvscode-VirtualGists)
<!-- [![Open in Visual Studio Code](https://open.vscode.dev/badges/open-in-vscode.svg)](https://open.vscode.dev/carlocardella/vscode-texttoolbox) -->

[Download for VS Code](https://marketplace.visualstudio.com/items?itemName=CarloCardella.vscode-virtualgists)

<!-- [Download for VS Codium](https://open-vsx.org/extension/carlocardella/vscode-texttoolbox) -->

Virtual Gists is a Visual Studio Code extension that allows to open and edit a remote gist (e.g. on GitHub) without cloning, committing or pushing your changes. It all happens automatically.

The extension is still missing lots of features I want to add (as time permits) and you can expect bugs (but hopefully nothing destructive), anyway this is a `preview` extension and you can expect bugs here and there. Please report bugs or issues and ask for features you would like to see. Check [Changelog](CHANGELOG.md) for the latest status, what's planned and what has already been released.

## Getting started

Install the extension from the VSCode Marketplace.

## Gist management

Read, create and delete GitHub Gists from the familiar VSCode environment. You can also follow users, star gists, and use a "Notepad" (a special, private gist) to job down ideas and ephemeral notes that do not fit into their own gist.

<!-- ![image](https://user-images.githubusercontent.com/5784415/197618303-98f29f54-6e8f-46bb-9f18-fe9989df4f97.png) -->

![show starred gists](https://user-images.githubusercontent.com/5784415/197624729-0c20ce8b-9cd9-4f53-97dd-69cb61a42fdf.gif)

### Notepad

This is a special, private gist you can use as a temporary notepad, a place to store ephemeral notes you can quickly jot down and easily access from all your devices even if they do not quite fit into a regular gist.

### My Gists

All your private and public gists, except `Notepad`, which has its own category. You can create, update, delete gists and files from the convenience of your familiar VSCode environment. Changes are automatically committed and sync'ed with GitHub.

### Starred Gists

Your starred gists, grouped in one convenient TreeView node

### Followed Users

Gists from the user you want to explicitly follow, to stay up to date with their latest work

![follow user](https://user-images.githubusercontent.com/5784415/200188563-725d6a20-71af-4cb1-8424-2ce6aa25fdd9.gif)

### Opened Gists

Interesting gists you have opened but not starred yet.

![openedgists](https://user-images.githubusercontent.com/5784415/201803325-acd4a167-cbd3-4d92-b0d4-dc2c5ef28ff9.gif)

## Create a new gist

You can create a private or public gist, just enter the gist name and the file name you want to use:

![new private gist](https://user-images.githubusercontent.com/5784415/197658237-f2d56e7a-2cbd-4d3a-9b9b-78a963a7336c.gif)

## Sync across devices

You can sync your open gists across multiple devices by enabling [Settings Sync](https://code.visualstudio.com/docs/editor/settings-sync) in Visual Studio Code.

*Node: you may need to Refresh the Virtual Gists view to see the latest repos added or removed from another machine.*

Changes are committed automatically after the file is saved. The commit message is `VirtualGists: update file <filePath>`.

## Star/Unstar gists

There are lots of useful gists on GitHub and an easy way to keep track is to star them. With Virtual Gists you can add a gist under the `Opened gists` group, or you can star a gist directly using its gistId:

![star gist from gistid](https://user-images.githubusercontent.com/5784415/203449831-687a6f2c-a1a9-4464-9d21-fa264c5b1409.gif)

If the gist you want to star is already listed anywhere else in Virtual Gists (under `Opened gists`, or it belongs to one of your followed users) you can use the `Star gist` command from the context menu:

![star gist from followed users](https://user-images.githubusercontent.com/5784415/203450921-605aff3a-5be4-4d4f-9645-89860a50a9d8.gif)

### Copy Url/Open in browser

You may want to share a gist with someone or view the gist in GitHub; easy enough, just use the appropriate command from the context menu.

For a gist:

![gist context menu](https://user-images.githubusercontent.com/5784415/203451530-22ab5558-21a3-4f27-931f-a45c55462576.png)

For a file:

![file context menu](https://user-images.githubusercontent.com/5784415/203451593-461c6da1-4773-4fd4-a4ba-a93ac0383c32.png)

### Optionally use the gist owner's avatar as icon

It can be helpful to identify to which user an opened or starred gist belongs to as a glance. Oh the other hand, you may prefer a cleaner list where icons only show the item type without being too distracting. Use `VirtualGists.UseGistOwnerAvatar` to toggle the behavior to your liking:

![virtualGits_use_owner_avatar](https://user-images.githubusercontent.com/5784415/204113210-2b3c1c64-9205-4ac7-800d-cd449f98df6a.gif)

## Tracing

You can enable `VirtualGists.EnableTracing` in your User or Workspace settings to enable tracing in a `Virtual Gists` output channel; this is off by default but it can be useful for troubleshooting errors or if you are curious to see what the extension is doing under the hood.

![image](https://user-images.githubusercontent.com/5784415/197569014-153f751e-6f37-4dd8-a5e6-3d50dc67b3de.png)

## My other extensions

* [Virtual Repos](https://github.com/carlocardella/vscode-VirtualRepos): Virtual Repos is a Visual Studio Code extension that allows to open and edit a remote repository (e.g. on GitHub) without cloning, committing or pushing your changes. It all happens automatically
<!-- * [Virtual Gists](https://github.com/carlocardella/vscode-VirtualGists): Virtual Gists is a Visual Studio Code extension that allows to open and edit a remote gist (e.g. on GitHub) without cloning, committing or pushing your changes. It all happens automatically -->
* [Virtual Git](https://github.com/carlocardella/vscode-VirtualGit): VSCode extension path with my extensions to work with virtual repositories and gists based on a virtual file system
* [Text Toolbox](https://github.com/carlocardella/vscode-TextToolbox): Collection of tools for text manipulation, filtering, sorting etc...
* [File System Toolbox](https://github.com/carlocardella/vscode-FileSystemToolbox): VSCode extension to work with the file system, path auto-complete on any file type
* [Changelog Manager](https://github.com/carlocardella/vscode-ChangelogManager): VSCode extension, helps to build a changelog for your project, either in markdown or plain text files. The changelog format follows Keep a changelog
* [Hogwarts colors for Visual Studio Code](https://github.com/carlocardella/hogwarts-colors-for-vscode): Visual Studio theme colors inspired by Harry Potter, Hogwarts and Hogwarts Houses colors and banners

## Acknowledgements

Virtual Gists is freely inspired by these fine extensions:

* [GistPad](https://marketplace.visualstudio.com/items?itemName=vsls-contrib.gistfs)
* [WikiLens](https://marketplace.visualstudio.com/items?itemName=lostintangent.wikilens)
* [GitDoc](https://marketplace.visualstudio.com/items?itemName=vsls-contrib.gitdoc)
* [Dendron](https://marketplace.visualstudio.com/items?itemName=dendron.dendron)
* [Foam](https://marketplace.visualstudio.com/items?itemName=foam.foam-vscode)
