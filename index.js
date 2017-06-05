const os = require('os');
const path = require('path');
const { promisify } = require('util');
const fs = require('fs');
const simpleGit = require('simple-git');
const githubUrlFromNpm = promisify(require('github-url-from-npm'));
const deasync = require('deasync');

const mkdir = promisify(fs.mkdir);

const lrequire = function() {
    this.cache = {};

    this.configure({
        path: path.join(os.tmpdir(), 'lrequire'),
        branch: 'master',
        remote: 'origin',
        pull: true
    });

    const sync = this._sync.bind(this);
    sync.async = this.async.bind(this);
    sync.asyncCallback = this.asyncCallback.bind(this);
    sync.clearCache = this.clearCache.bind(this);

    return sync;
};

lrequire.prototype = {
    _sync(mod, config) {
        return deasync(this.asyncCallback.bind(this))(mod, config);
    },

    _cacheKey(mod, config) {
        return `${mod}:${config.branch}:${config.remote}`;
    },

    _require(mod, config) {
        const key = this._cacheKey(mod, config);
        if (!this.cache[key]) {
            this.cache[key] = require(mod);
        }

        return this.cache[key];
    },

    configure(config) {
        this.config = Object.assign(this.config || {}, config);
    },

    getModuleNameFromGithubUrl(url) {
        const split = url.split('/');
        const githubIndex = split.indexOf('github.com');
        const name = split[githubIndex + 2];
        return name.replace('.git', '');
    },

    clearCache() {
        this.cache = {};
    },

    async pull(modulePath, c = this.config) {
        const git = simpleGit(modulePath);
        const pull = promisify(git.pull.bind(git));
        await pull(c.remote, c.branch);
    },

    async clone(modulePath, url) {
        const git = simpleGit(modulePath);
        const clone = promisify(git.clone.bind(git));
        await clone(url, modulePath);
    },

    async checkout(modulePath, c = this.config) {
        const git = simpleGit(modulePath);
        const checkout = promisify(git.checkout.bind(git));
        await checkout(c.branch);
    },

    asyncCallback(mod, c, cb) {
        this.async(mod, c).then(mod => cb(null, mod)).catch(err => cb(err));
    },

    async async(mod, c = {}) {
        const config = Object.assign(this.config, c);

        if (!mod) {
            throw new Error('Module name cannot be empty');
        }

        const isGithubUrl = mod.includes('github.com');
        const isNpmUrl = mod.includes('npmjs.org');
        if (!isGithubUrl && !isNpmUrl) {
            mod = await githubUrlFromNpm(mod);
        } else if (isNpmUrl) {
            const split = mod.split('/');
            const moduleName = split[split.length - 1];
            mod = await githubUrlFromNpm(moduleName);
        }

        const repoName = this.getModuleNameFromGithubUrl(mod);
        const modulePath = path.join(config.path, repoName);

        const key = this._cacheKey(modulePath, config);
        if (this.cache[key]) {
            return this.cache[key];
        }

        //fs.exists does not follow the node callback guidelines, so we can't promisify it
        if (!fs.existsSync(modulePath)) {
            await mkdir(modulePath);
            try {
                await this.clone(modulePath, mod);
            } catch (e) {
                if (e.toString().includes('does not exist')) {
                    throw new Error('Not Found'); //consistency
                }
            }
        }

        if (config.pull) {
            await this.pull(modulePath, config);
        }

        await this.checkout(modulePath, config);

        return this._require(modulePath, config);
    }
};

module.exports = new lrequire();
