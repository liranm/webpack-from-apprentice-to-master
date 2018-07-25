const path = require('path');
const parts = require('./webpack.parts');

module.exports = config => {
    const tests = 'tests/*.test.js';

    process.env.BABEL_ENV = 'karma';

    config.set({
        frameworks: [ 'mocha' ],
        files: [
            {
                pattern: tests
            }
        ],
        preprocessors: {
            [tests]: [ 'webpack' ]
        },
        webpack: parts.loadJavascript(),
        singleRun: true,
        browsers: [ 'PhantomJS' ],
        reporters: [ 'coverage' ],
        coverageReporter: {
            dir: 'build',
            reporters: [ { type: 'html' }, { type: 'lcov' } ]
        }
    });
};