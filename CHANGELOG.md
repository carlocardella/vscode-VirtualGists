# Change Log

All notable changes to the "vscode-VirtualGists" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

### Gists management

* Open owned gists
* Open starred gists
* Clone gist
* Download gists (tar/zip)
* Fork gist
* Star gist
* Unstar gist
* Change gist visibility (private/public)

### Repository content

* Add file
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

* Pull at configurable intervals (set a default around 1 minute) to ensure the repo view is current
* Push changes at configurable intervals (only if there are changes to push) rather than other on save; users may have auto-save enabled, that would generate lots of small push changes and potentially exceed the GitHub [API rate limit](https://docs.github.com/en/rest/rate-limit#about-the-rate-limit-api)