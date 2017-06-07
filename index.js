const os = require('os');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const {
    ensureDir,
    ensureDirSync,
    existsSync,
    exists,
    emptyDir
} = require('fs-extra');
const deasync = require('deasync');
const latestVersion = require('latest-version');
const { Unpacker } = require('tarball-unpacker');
const semverCompare = require('semver-compare');

const lrequire = function() {
    this.latestVersionCache = {};

    this.configure({
        path: path.join(os.tmpdir(), 'lrequire'),
        version: 'latest'
    });

    //this should happen only once
    if (!existsSync(this.config.path)) {
        ensureDirSync(this.config.path);
    }

    this.unpacker = new Unpacker().configure({
        silent: true
    });

    const sync = this.sync.bind(this);
    sync.async = this.async.bind(this);
    sync.asyncCallback = this.asyncCallback.bind(this);
    sync.configure = this.configure.bind(this);
    sync.global = () => (global.lrequire = sync);

    Object.defineProperties(sync, {
        config: {
            get: () => this.config
        },
        latestVersionCache: {
            get: () => this.latestVersionCache
        }
    });

    return sync;
};

lrequire.prototype = {
    _buildTarballPath(mod, version) {
        return `http://registry.npmjs.org/${mod}/-/${mod}-${version}.tgz`;
    },

    _getModuleNameFromNpmUrl(url) {
        const split = url.split('/');
        const moduleName = split[split.length - 1];
        return moduleName;
    },

    _require(mod) {
        return require(path.join(this.config.path, mod, 'package'));
    },

    configure(c = {}) {
        this.config = Object.assign(this.config || {}, c);
    },

    sync(mod, config) {
        return deasync(this.asyncCallback.bind(this))(mod, config);
    },

    asyncCallback(mod, c, cb) {
        this.async(mod, c).then(mod => cb(null, mod)).catch(err => cb(err));
    },

    async async(mod, c = {}) {
        const config = Object.assign(this.config, c);

        if (!mod) {
            throw new Error('Module name cannot be empty');
        }

        const isNpmUrl = mod.includes('npmjs.org');
        if (isNpmUrl) {
            mod = this._getModuleNameFromNpmUrl(mod);
        }

        const modulePath = path.join(config.path, mod);
        const modulePackageJsonPath = path.join(
            modulePath,
            'package',
            'package.json'
        );
        const moduleIsInstalled = await exists(modulePackageJsonPath);

        let moduleVersion = '0.0.0';
        if (moduleIsInstalled) {
            moduleVersion = require(modulePackageJsonPath).version;
        }

        let version = config.version;
        if (config.version === 'latest') {
            version =
                this.latestVersionCache[mod] || (await latestVersion(mod));
            this.latestVersionCache[mod] = version;
        }

        if (semverCompare(moduleVersion, version) === 0) {
            //the module is installed, just require it
            return this._require(mod);
        }

        const tarball = this._buildTarballPath(mod, version);
        if (!moduleIsInstalled) {
            await ensureDir(modulePath);
        } else {
            await emptyDir(modulePath);
        }

        await this.unpacker.extractFromURL(tarball, modulePath);
        await exec('npm install --production', {
            cwd: path.dirname(modulePackageJsonPath)
        });

        return this._require(mod);
    }
};

module.exports = new lrequire();
