# Live-require

[![Build Status](https://travis-ci.org/gngeorgiev/lrequire.svg?branch=master)](https://travis-ci.org/gngeorgiev/lrequire)

A module which allows you to require and try out npm modules directly without `npm install`-ing them. You can use this to quickly test out different modules in your project, inside a toy project or in the repl.

# How it works

Modules are downloaded and prepared in a predefined directory, `/tmp/` by default and then required back to you. The modules are cached so only the first time a module is used it might take a little longer to load.

# Configuration

```javascript
require('lrequire').configure({
    path: '/tmp/lrequire' //where the modules will be downloaded
})
```

# Usage

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

const validUrl = lrequire('valid-url') // require('valid-url');
const latestVersion = lrequire('npmjs.org/package/latest-version');
```

# Repl

Execute `lrequire` in your terminal, the `lrequire` command will be available in the newly opened repl which means you can directly start requiring modules.

```bash
$ lrequire
js > lrequire('valid-url')
{ is_uri: [Function: is_iri],
  is_http_uri: [Function: is_http_iri],
  is_https_uri: [Function: is_https_iri],
  is_web_uri: [Function: is_web_iri],
  isUri: [Function: is_iri],
  isHttpUri: [Function: is_http_iri],
  isHttpsUri: [Function: is_https_iri],
  isWebUri: [Function: is_web_iri] }

```

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
