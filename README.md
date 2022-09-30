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

### Open a repo

Use the `Open gist` command to open an existing repo from GitHub, you can choose from three options:

1. `Open gist`: open any gist you have access to, enter the name as `owner/repoName`

   *Note: If you just enter the repo name, the extension assumes you own it, this is the same as using `Open my gist`*

2. `Open my gist`: open a gist from a list of repos you own
3. `Open starred gist`: open one of your Starred repos

The gist will load automatically (of course, make sure you are connected to the Internet), you can then browse it, open, edit, add, delete files as if they where on your local file system even without cloning the repo.

_open gist_

![open gist](https://user-images.githubusercontent.com/5784415/192892207-46f5418e-5696-4373-ae80-71cb160e8e25.gif)

_open my gist_

![open my gist](https://user-images.githubusercontent.com/5784415/192892464-bee3d23f-5688-4dfd-a343-c844ae39e135.gif)

#### Sync repositories across devices

You can sync your open repositories across multiple devices by enabling [Settings Sync](https://code.visualstudio.com/docs/editor/settings-sync) in Visual Studio Code.

*Node: you may need to Refresh the Virtual Repos view to see the latest repos added or removed from another machine.*

### Create new repo

You can create a new gist (public or private), other repo operations (delete, star, fork, clone, download) will come in future releases.

![create private repo](https://user-images.githubusercontent.com/5784415/192894098-2cb95397-6696-467a-ab9c-6ca272f460b0.gif)

## Automatic commits

Changes are committed automatically after the file is saved. The commit message is `VirtualGists: update file <filePath>`.

## Tracing

You can enable `VirtualGists.EnableTracing` in your User or Workspace settings to enable tracing in a `Virtual Repositories` output channel; this is off by default but it can be useful for troubleshooting errors or if you are curious to see what the extension is doing under the hood.

![image](https://user-images.githubusercontent.com/5784415/192893074-ffeb0ec1-1932-45ed-a961-1c15492c1a9e.png)

## Acknowledgements

Virtual Gists is freely inspired by these fine extensions:

* [GistPad](https://marketplace.visualstudio.com/items?itemName=vsls-contrib.gistfs)
* [WikiLens](https://marketplace.visualstudio.com/items?itemName=lostintangent.wikilens)
* [GitDoc](https://marketplace.visualstudio.com/items?itemName=vsls-contrib.gitdoc)
* [Dendron](https://marketplace.visualstudio.com/items?itemName=dendron.dendron)
* [Foam](https://marketplace.visualstudio.com/items?itemName=foam.foam-vscode)
