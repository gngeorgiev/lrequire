const assert = require('assert');
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
        'https://npmjs.org/package/valid-url',
        'github.com/ogt/valid-url',
        'https://github.com/ogt/valid-url',
        'http://github.com/ogt/valid-url'
    ];

    function test(c, clearCache) {
        describe(`With package from: ${c}, clear cache: ${clearCache}`, () => {
            beforeEach(() => {
                if (clearCache) {
                    lrequire.clearCache();
                }
            });

            testApi(c);
        });
    }

    cases.forEach(c => test(c, false));
    cases.forEach(c => test(c, true));
});

describe('Non-existing packages', () => {
    const testNotFound = prefix => {
        assert.throws(() => {
            try {
                lrequire(
                    `${prefix}${`non-existing-module-${Math.floor(
                        Math.random() * 1000
                    ) + 1}`}`
                );
            } catch (e) {
                console.log(e);
                throw e;
            }
        }, /Not Found/g);
    };

    [
        '',
        'npmjs.org/package/',
        'http://npmjs.org/package/',
        'https://npmjs.org/package/',
        'github.com/ogt/',
        'https://github.com/ogt/',
        'http://github.com/ogt/'
    ].forEach(c => testNotFound(c));
});
