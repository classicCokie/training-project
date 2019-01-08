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
        if (!semver.satisfies(found.node, required.node)) {
            errors.push(
                `This project requires node version ${required.node.range}, but you're using ` +
                `${found.node.version}. Please install a compatible node version using NVM (https://github.com/creationix/nvm).`)
        }
        if (!semver.satisfies(found.npm, required.npm)) {
            errors.push(
                `This project requires npm version ${required.npm.range}, but you're using ` +
                `${found.npm.version}. Please upgrade your npm version by running: "npm install -g npm@${required.npm.raw}"`)
        }

        if (errors.length > 0) {
            console.error(errors.join('\n'))
            process.exit(1)
        }
    }
)
