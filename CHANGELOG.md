# Change Log

All notable changes to the "vscode-VirtualGists" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

### Gists management

* Create gist file under folder
* Properly render gist files under folders
* Clone gist
* Download gists (tar/zip)
* Fork gist
* Star gist
* Unstar gist
* Change gist visibility (private/public)
* Open gist on GitHub
* Open Gist
  * Group by user
    * Show user avatar

### Gist content

* Upload File(s)
* Rename file
* Rename folder
* Delete file
* Delete multiple files
  * Delete folder (delete all files in folder)
* Move file
  * Move multiple files
* Move folder
* File comments

### Other

* View gist owner on GitHub
* Show gist count under each group
* Pull at configurable intervals (set a default around 1 minute) to ensure the repo view is current
* Push changes at configurable intervals (only if there are changes to push) rather than other on save; users may have auto-save enabled, that would generate lots of small push changes and potentially exceed the GitHub [API rate limit](https://docs.github.com/en/rest/rate-limit#about-the-rate-limit-api)

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
