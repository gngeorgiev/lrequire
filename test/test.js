const assert = require('assert');
const path = require('path');
const lrequire = require('../');

describe('Existing package', () => {
    const testMod = mod => {
        if (!mod.isUri) {
            throw 'Module not loaded properly';
        }
    };

    const testApi = async (...args) => {
        it('with sync api', () => {
            try {
                const resSync = lrequire(...args);
                testMod(resSync);
            } catch (err) {
                assert.fail(err);
            }
        });

        it('with async api', async () => {
            try {
                const resAsync = await lrequire.async(...args);
                testMod(resAsync);
            } catch (err) {
                assert.fail(err);
            }
        });

        it('with async callback api', done => {
            lrequire.asyncCallback(args[0], args[1], (err, resCallback) => {
                if (err) {
                    return assert.fail(err);
                }

                testMod(resCallback);
                done();
            });
        });
    };

    const cases = [
        'valid-url',
        'npmjs.org/package/valid-url',
        'http://npmjs.org/package/valid-url',
        'https://npmjs.org/package/valid-url'
    ];

    function test(c) {
        describe(`With package from: ${c}`, () => {
            testApi(c);
        });
    }

    cases.forEach(c => test(c));
});

describe('Non-existing packages', () => {
    const testNotFound = prefix => {
        it(prefix, () => {
            assert.throws(() => {
                lrequire(
                    `${prefix}${`non-existing-module-${Math.floor(
                        Math.random() * 1000
                    ) + 1}`}`
                );
            }, /doesn't exist/g);
        });
    };

    [
        '',
        'npmjs.org/package/',
        'http://npmjs.org/package/',
        'https://npmjs.org/package/'
    ].forEach(c => testNotFound(c));
});

describe('Version changes', () => {
    const mod = 'valid-url';
    const p = path.join(lrequire.config.path, mod, 'package', 'package.json');

    const requireAndVerifyVersion = version => {
        lrequire(mod, { version });

        assert.ok(require(p).version, version);
    };

    it('Old to new', () => {
        requireAndVerifyVersion('1.0.8');
        requireAndVerifyVersion('1.0.9');
    });

    it('New to Old', () => {
        requireAndVerifyVersion('1.0.9');
        requireAndVerifyVersion('1.0.8');
    });

    it('Old to latest', () => {
        requireAndVerifyVersion('1.0.8');
        requireAndVerifyVersion('latest');
    });
});
