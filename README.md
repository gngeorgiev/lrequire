# Live-require

[![NPM](https://nodei.co/npm/lrequire.png?mini=true)](https://npmjs.org/package/lrequire) [![Build Status](https://travis-ci.org/gngeorgiev/lrequire.svg?branch=master)](https://travis-ci.org/gngeorgiev/lrequire) [![dependencies](https://david-dm.org/gngeorgiev/lrequire.svg)]() [![Code Climate](https://codeclimate.com/github/gngeorgiev/lrequire/badges/gpa.svg)](https://codeclimate.com/github/gngeorgiev/lrequire)

A module which allows you to require and try out npm modules directly without `npm install`-ing them. You can use this to quickly test out different modules in your project, inside a toy project or in the terminal.

# How it works

Modules are downloaded and prepared in a predefined directory(`/tmp/` by default) and then required back to you. The modules are cached so only the first time a module is used it might take a little longer to load.

# Configuration

```javascript
const lrequire = require('lrequire');

lrequire.configure({
    path: '/tmp/lrequire' //where the modules will be downloaded
})
```

# Programmatic Usage

Basic:

```javascript
const lrequire = require('lrequire');

const validUrl = lrequire('valid-url');
const latestVersion = lrequire('npmjs.org/package/latest-version');
```

Download specific version:

```javascript
const lrequire = require('lrequire');

const validUrl = lrequire('valid-url', {
    version: '1.0.8'
});
const latestVersion = lrequire('npmjs.org/package/latest-version', {
    version: 'latest' //this is the default
});
```

You can also make `lrequire` global and use it at will. Later, if you wish to keep a package, you can remove the `l` and everything will continue working.

```javascript
require('lrequire').global();

const validUrl = lrequire('valid-url');
const latestVersion = lrequire('npmjs.org/package/latest-version');
```

# Repl Usage

Make sure to install `lrequire` globally:

```bash
$ npm i -g lrequire
```

Execute `lrequire` in your terminal, the `lrequire` function will be available in the newly opened repl which means you can directly start requiring modules. You can also use the `require` function, it will try to require a module and fallback to `lrequire`.

```bash
$ lrequire
> const { markdown } = require('markdown');
> $ markdown.toHTML('Hello *World*!');
'<p>Hello <em>World</em>!</p>'
```

# What if you don't want to create files in your filesystem?

On linux consider using [tmpfs](https://wiki.archlinux.org/index.php/tmpfs). You can mount it on `/tmp/lrequire` or even `/tmp` which is a common practice. Don't forget that the directory where the files are saved can be configured.

On MacOS and Windows there are some RamDisk implementations that might work.

# Requirements

Node 8

# API Reference

## lrequire(module, config = {version: 'latest'})
Require a module synchronously.

## lrequire.async(module, config = {version: 'latest'}): Promise\<Module\>
Require a module asynchronously, the result can be awaited.

## lrequire.asyncCallback(module, config, callback)
Require a module asynchronously, the result is passed as a second argument as per the node.js callback conventions.

## lrequire.config(config = {path: '/tmp/lrequire'})
Configure `lrequire`.

## lrequire.global()
Add `lrequire` to `global`.

## lrequire.config
Get the config object

## lrequire.latestVersionCache
Get the cache which holds the latest version available in npm for each package installed during the application's lifetime.
