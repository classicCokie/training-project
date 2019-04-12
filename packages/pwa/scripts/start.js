#!/usr/bin/env node

/* eslint import/no-commonjs:0 */
/* eslint-env node */
const Promise = require('bluebird')
const _fs = require('fs')
const rimraf = require('rimraf')
const path = require('path')
const process = require('process')
const program = require('commander')

const pkg = require('../package.json')
const childProcess = require('@lerna/child-process')
const execa = require('execa')

const fs = Promise.promisifyAll(_fs)
const rimrafAsync = Promise.promisify(rimraf)

const resolve = path.resolve
const resolveBin = (name) => resolve(__dirname, '..', 'node_modules', '.bin', name)
const marker = resolve(process.cwd(), 'build', 'build.marker')
const packagesPath = resolve(__dirname, '..', '..')

const production = 'production'
const isWindows = process.platform === 'win32'
const nodemon = resolveBin(isWindows ? 'nodemon.cmd' : 'nodemon')
const webpack = resolveBin(isWindows ? 'webpack.cmd' : 'webpack')
const sdkCreateHashManifest = resolveBin(
    isWindows ? 'sdk-create-hash-manifest.cmd' : 'sdk-create-hash-manifest'
)

const spawnStreaming = ({command, args, opts, name}) => {
    return childProcess.spawnStreaming(command, args, opts, name)
}

/**
 * Generate route regexes, etc. that are expected to be in place before starting
 * the app in either SSR or preview mode.
 */
const beforeRun = () => {
    return (
        Promise.resolve()
            // This replaces an older bash script that copies a file into cwd and executes it...
            .then(() =>
                fs.copyFileAsync(
                    resolve(
                        'node_modules',
                        'progressive-web-sdk',
                        'scripts',
                        'extract-route-regexes.js'
                    ),
                    'extract-route-regexes.js'
                )
            )
            .then(() =>
                execa(
                    'node',
                    ['extract-route-regexes.js'],
                    {stdio: 'ignore'},
                    'extract-route-regexes'
                )
            )
            .then(() => rimrafAsync('extract-route-regexes.js'))

            .then(() =>
                execa(sdkCreateHashManifest, [], {stdio: 'ignore'}, 'sdk-create-hash-manifest')
            )
    )
}

/**
 * Return command args for processes that need to run in the background
 * *outside* of this package.
 */
const getCommonCommands = () => {
    return [
        {
            command: 'npm',
            args: ['run', 'start'],
            opts: {cwd: path.resolve(packagesPath, 'connector')},
            name: 'connector'
        }
    ]
}

const runSSR = ({inspect}) => {
    const ssrEnabled = process.env.SSR_ENABLED || (pkg.mobify && pkg.mobify.ssrEnabled)
    if (!ssrEnabled) {
        console.error('Please set mobify.ssrEnabled to true in package.json to enable SSR')
        process.exit(1)
    }
    const nodeEnv = process.env.NODE_ENV || production

    return Promise.resolve()
        .then(() => beforeRun())
        .then(() => {
            return [
                {
                    command: webpack,
                    args: [
                        '--mode',
                        nodeEnv,
                        '--watch',
                        '--config',
                        resolve('webpack', 'webpack.config.js')
                    ],
                    opts: {
                        env: Object.assign({}, process.env, {
                            TOUCH_BUILD_MARKER: 1,
                            DEVTOOL: nodeEnv === production ? 'cheap-source-map' : 'source-map'
                        })
                    },
                    name: 'webpack'
                },
                {
                    command: nodemon,
                    args: [
                        '--watch',
                        marker,
                        '--on-change-only',
                        '--no-colours',
                        '--delay',
                        '0.25',
                        '--',
                        '--expose-gc',
                        ...(inspect ? ['--inspect=localhost:9229'] : []),
                        ...[resolve('build', 'ssr.js')]
                    ],
                    opts: {
                        env: Object.assign({}, process.env, {
                            NODE_EXTRA_CA_CERTS: resolve('dev-server', 'localhost.pem')
                        })
                    },
                    name: 'ssr-server'
                },
                ...getCommonCommands()
            ].map(spawnStreaming)
        })
}

const runPreview = () => {
    return Promise.resolve()
        .then(() => beforeRun())
        .then(() => {
            return [
                {
                    command: 'node',
                    args: [resolve('dev-server', 'index.js')],
                    opts: {},
                    name: 'dev-server'
                },
                ...getCommonCommands()
            ].map(spawnStreaming)
        })
}

program.description('Startup script for the UPWA')

program
    .command('ssr')
    .description('Start the PWA in server-side rendering mode')
    .action(runSSR)
    .option('--inspect', 'Enable debugging (default: false)')

program
    .command('preview')
    .description('Start the PWA in client-side rendering mode')
    .action(runPreview)

program.parse(process.argv)
