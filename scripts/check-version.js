#!/usr/bin/env node
/* eslint import/no-commonjs:0 */

const semver = require('semver')
const pkg = require('../package.json')
const childProc = require('child_process')


childProc.exec('npm -v',
    (error, stdout) => {
        const required = {
            node: semver.Range(pkg.engines.node),
            npm: semver.Range(pkg.engines.npm)
        }
        const found = {
            node: semver.parse(process.version),
            npm: semver.parse(stdout.trim())
        }
        const errors = []

        if (errors.length > 0) {
            console.error(errors.join('\n'))
            process.exit(1)
        }
    }
)
