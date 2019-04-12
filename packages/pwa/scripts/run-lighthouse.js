#!/usr/bin/env node
/* eslint import/no-commonjs:0 */
const spawnSync = require('cross-spawn').sync
const path = require('path')
const utils = require('./utils')

const urls = [
    'https://localhost:3443/',
    'https://localhost:3443/category/tshirts',
    'https://localhost:3443/products/1'
]

const main = () => {
    const executable = path.resolve('node_modules', '.bin', 'mobify-test-framework')
    return utils
        .withSSRServer(() => {
            const proc = spawnSync(executable, ['lighthouse', ...urls], {stdio: 'inherit'})
            return proc.status !== 0 ? Promise.reject() : Promise.resolve()
        })
        .catch(() => {
            process.exit(1)
        })
}

main()
