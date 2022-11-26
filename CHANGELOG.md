# Change Log

All notable changes to the "vscode-VirtualGists" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

See the [list of pending enhancements on GitHub](https://github.com/carlocardella/vscode-VirtualGists/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3Aenhancement)

## [0.0.9] - 2022-11-26

### Added

* Setting `VirtualGist.PullInterval`. Default: `0` (zero)
  * Controls, in seconds, how frequently gists should be refreshed from GitHub. Set to zero to disable
* Setting `VirtualGists.UseGistOwnerAvatar`: default `false`
  * Controls if followed users, starred gists and opened gists should use the gist owner's GitHub avatar or a generic icon from the active IconTheme
* `View user profile on GitHub`

### Changed

* Node module updates
* Some code refactoring
* IMproved performance by avoiding duplicate calls in certain scenarios

## [0.0.8] - 2022-11-22

### Added

* Star a gist
  * You can start a gist in two ways:
    1. Use the `Star gist` command and enter the `gistId`
    2. If the gist to star is already listed under `Opened Gists` or it belongs to a followed user, you can use the `Star gist` command from the context menu
* Upload a local file to an existing gist
* `Copy gist id`
* `Copy gist URL`
* `Open gist in browser`
* `Copy file URL`
* `Open file in browser`

### Fixed

* Fixed issue [#15 Deleting a file sometimes does not update the file counter](https://github.com/carlocardella/vscode-VirtualGists/issues/15)

## [0.0.7] - 2022-11-20

### Added

* Rename file

## [0.0.6] - 2022-11-15

### Fixed

* [#4 Files with a space in the name cannot be opened](https://github.com/carlocardella/vscode-VirtualGists/issues/4)
* Fixed a but creating a new file under Notepad.

## [0.0.5] - 2022-11-14

### Changed

* ❗Make the repo public, first Marketplace release (in preview)

### Fixed

* Fixes around `Notepad`

## [0.0.4] - 2022-11-13

### Added

* Enalbed `Notepad` gist

## [0.0.3] - 2022-11-13

### Added

* Enable `Opened Gists` group

## [0.0.2] - 2022-11-06

### Added

* Enabled `Follow user` command

 ### Fixed

* Fixed [#2](https://github.com/carlocardella/vscode-VirtualGists/issues/2)
* Other fixes adn improvements

### Changed

* Updated TreeView commands

## [0.0.1] - 2022-10-24

### Added

* `My Gists` TreeView
* `Starred Gists` TreeView
* `New Public Gist`
* `New Private Gist`
* Delete a gist
* Delete a file from a Gist
* Add a new file to an existing Gist
* Update a gist file, commit automatically on file save
