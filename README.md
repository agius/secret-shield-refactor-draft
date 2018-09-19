# secret-shield-refactor

Trying out a different architecture for [mapbox/secret-shield](https://github.com/mapbox/secret-shield)

[![Build Status](https://travis-ci.com/agius/secret-shield-refactor-draft.svg?branch=master)](https://travis-ci.com/agius/secret-shield-refactor-draft)

## Development

```shell
$ git clone git@github.com:agius/secret-shield-refactor-draft.git
$ cd secret-shield-refactor-draft
$ npm i
$ npm test
```

## Usage

For the most up to date info:

```shell
$ ./bin/shield --help
```

Initial commands & options:

```shell
Usage: shield [options] [command]

Options:

  -V, --version                     output the version number
  -h, --help                        output usage information

Commands:

  scan [options] [string]           scan a string for secrets
  file [options] [file]             scan a file for secrets
  directory|dir [options] [dir]     scan all files in a directory for secrets (recursive)
  repository|repo [options] [repo]  clone a repo and scan it for secrets
```
