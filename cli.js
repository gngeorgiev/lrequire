#!/usr/bin/env node

const repl = require('repl');
const lrequire = require('./index');

const r = repl.start('$ ');

r.context = Object.assign(r.context, {
    global,
    __dirname,
    __filename,
    module,
    exports,
    lrequire,
    require: (...args) => {
        let result;
        try {
            result = require(...args);
        } catch (err) {
            result = lrequire(...args);
        }

        return result;
    }
});
