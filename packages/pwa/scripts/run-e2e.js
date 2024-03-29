#!/usr/bin/env node
/* eslint import/no-commonjs:0 */
const utils = require('./utils')
const path = require('path')
const spawnSync = require('cross-spawn').sync

const main = () => {
    const testFramework = path.resolve(
        path.dirname(__dirname),
        'node_modules',
        '.bin',
        'mobify-test-framework'
    )
    return utils
        .withSSRServer(() => {
            const proc = spawnSync(
                testFramework,
                ['nightwatch', '--', path.resolve('tests', 'e2e', 'workflows', 'home-plp-pdp.js')],
                {stdio: 'inherit'}
            )
            if (proc.error) {
                console.log(`Child Process ${testFramework} exited with errors`)
                throw proc.error
            }
        })
        .catch(() => {
            process.exit(1)
        })
}

main()
