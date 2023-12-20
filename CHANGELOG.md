# Change Log

All notable changes to the "vscode-VirtualGists" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

See the [list of pending enhancements on GitHub](https://github.com/carlocardella/vscode-VirtualGists/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3Aenhancement)

---

## [0.7.0] - 2023-12-19

### Added

* `Rename gist`
  * This is obtained with [#52 Update gist description](https://github.com/carlocardella/vscode-VirtualGists/issues/52): the gist id is unique and immutable, renaming a gist really means updating its `description`

### Fixed

* Fixed a couple of bugs that were leading to unwanted errors and rejected promises when dialog boxes (e.g. when asking for a new file name) where cancelled

## [0.6.0] - 2023-12-19

### Fixed

* [#16 Upload multiple files](https://github.com/carlocardella/vscode-VirtualGists/issues/16)

## [0.5.0] - 2023-04-15

### Fixed

* [#1 New gist file invalid character](https://github.com/carlocardella/vscode-VirtualGists/issues/1)

### Added

* Enabled extension in VSCode on the web (GitHub.dev): [#24](https://github.com/carlocardella/vscode-VirtualGists/issues/24)

### Changed

* Update Node modules

## [0.4.1] - 2023-04-10

### Fixed

* Fixed bug where Notepad files could not be opened or created

## [0.4.0] - 2023-03-27

### Changed

* Use real names for Followed Users
* Followed Users shows the actual list of users you follow on GitHub
* Simplified the `Follow user...` dialog, just enter the GitHub username to follow the person on GitHub and add it to the Followed Users group
* Updated the tooltip for a user, added mode details read from the user's public profile on GitHub

cl- ### Removed

* `Follow user on GitHub...` has been removed, it is no longer needed

## [0.3.0] - 2023-03-23

### Changed

* Updated minimum VSCode required version to 1.66 so support the updated GitHub authentication flow
* For VSCode version 1.74 or higher, use the built-in [Log Output Channel](https://code.visualstudio.com/updates/v1_74#_log-output-channel)
* Removed custom tracing logic for VSCode versions older than 1.74

## [0.2.0] - 2023-03-21

### Added

* Download gists and files ([#7 Download a gist](https://github.com/carlocardella/vscode-VirtualGists/issues/7))

## [0.1.2] - 2023-03-08

### Fixed

* [#47 Cannot read properties of null (reading 'localeCompare')](https://github.com/carlocardella/vscode-VirtualGists/issues/47)

## [0.1.1] - 2023-03-07

### Fixed

* [#46 Followed Users functionality broken](https://github.com/carlocardella/vscode-VirtualGists/issues/46)

## [0.1.0] - 2023-02-20

### Changed

* If the new `VirtualGists.ShowDecorations` is set to `true`, show the number of Gists for each group and Followed User

### Added

* New Setting `VirtualGists.ShowDecorations` (default `false`)
  * If enabled, shows the number of Gists in each group and for each Followed User
  * **Note**: Depending on the number of Gists or Followed Users, this may have a significant performance impact (increase the load time) due to the additional calls to GitHub needed to get the number of Gists in each group and for each user

## [0.0.17] - 2023-01-11

### Fixed

* Set sort type and direction menu toggles at extension startup

## [0.0.16] - 2023-01-10

### Fixed

* [#43 Sort menu duplicate commands](https://github.com/carlocardella/vscode-VirtualGists/issues/43)

## [0.0.15] - 2023-01-10

### Fixed

* [#44 Cannot set properties of undefined (setting 'gist')](https://github.com/carlocardella/vscode-VirtualGists/issues/44)

## [0.0.14] - 2023-01-08

### Changed

* Reordered TreeView inline commands

### Added

* Sort gists by name, creation time or last modified time

## [0.0.13] - 2022-12-27

### Changed

* Updated npm modules
* Log when gists are being refreshed

## [0.0.12] - 2022-12-12

### Changed

* Adding a new gist file now opens the file in the editor: [#37](https://github.com/carlocardella/vscode-VirtualGists/issues/37)

### Added

* You can now select multiple gists in the treeview and delete them all with one click: [#18](https://github.com/carlocardella/vscode-VirtualGists/issues/18)

## [0.0.11] - 2022-12-09

### Added

* Follow a user on GitHub: right-click one of the users lister under `Followed User` and select `Follow user on GitHub...`. [#6](https://github.com/carlocardella/vscode-VirtualGists/issues/6)
* Select multiple files within a gist and delete them all with one click. [#17](https://github.com/carlocardella/vscode-VirtualGists/issues/17)

### Changed

* Improved the `Follow user...` dialog
  * You can still enter a GitHub username as before, but you can now also select a user from the list of users you already follow on GitHub (<https://gist.github.com/username>) [#34](https://github.com/carlocardella/vscode-VirtualGists/issues/34), [#28](https://github.com/carlocardella/vscode-VirtualGists/issues/28)
* You cannot follow yourself 😄 Why would you anyway? Your gists are already all listed under `My Gists`, no need to duplicate them

### Fixed

* bug fixes

## [0.0.10] - 2022-12-06

### Added

* `Fork gist`
* `Clone gist`

### Changed

* Updated the generic `followed users` icon

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
