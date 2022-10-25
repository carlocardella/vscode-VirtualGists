# Virtual Gists

![preview](https://img.shields.io/badge/-preview-orange)

[![Publish Extension](https://github.com/carlocardella/vscode-VirtualGists/actions/workflows/PublishExtension.yml/badge.svg)](https://github.com/carlocardella/vscode-VirtualGists/actions/workflows/PublishExtension.yml)
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

### Opened Gists

Interesting gists you have opened but not starred yet.

## Create a new gist

You can create a private or public gist, just enter the gist name and the file name you want to use:

![new private gist](https://user-images.githubusercontent.com/5784415/197658237-f2d56e7a-2cbd-4d3a-9b9b-78a963a7336c.gif)

## Sync across devices

You can sync your open gists across multiple devices by enabling [Settings Sync](https://code.visualstudio.com/docs/editor/settings-sync) in Visual Studio Code.

*Node: you may need to Refresh the Virtual Gists view to see the latest repos added or removed from another machine.*

Changes are committed automatically after the file is saved. The commit message is `VirtualGists: update file <filePath>`.

## Tracing

You can enable `VirtualGists.EnableTracing` in your User or Workspace settings to enable tracing in a `Virtual Gists` output channel; this is off by default but it can be useful for troubleshooting errors or if you are curious to see what the extension is doing under the hood.

![image](https://user-images.githubusercontent.com/5784415/197569014-153f751e-6f37-4dd8-a5e6-3d50dc67b3de.png)


## Acknowledgements

Virtual Gists is freely inspired by these fine extensions:

* [GistPad](https://marketplace.visualstudio.com/items?itemName=vsls-contrib.gistfs)
* [WikiLens](https://marketplace.visualstudio.com/items?itemName=lostintangent.wikilens)
* [GitDoc](https://marketplace.visualstudio.com/items?itemName=vsls-contrib.gitdoc)
* [Dendron](https://marketplace.visualstudio.com/items?itemName=dendron.dendron)
* [Foam](https://marketplace.visualstudio.com/items?itemName=foam.foam-vscode)
