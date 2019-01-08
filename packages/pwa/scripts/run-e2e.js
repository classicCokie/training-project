#!/usr/bin/env node
/* eslint import/no-commonjs:0 */
const childProcess = require('child_process')
const Promise = require('bluebird')
const fetch = require('node-fetch')
const https = require('https')
const fs = require('fs')

const cert = fs.readFileSync('./dev-server/localhost.pem')


const agent = new https.Agent({
    key: cert,
    cert,
    rejectUnauthorized: false
})

/**
 * Execute fn with an SSR server process running in the background and handle server
 * setup and teardown.
 */
const withSSRServer = (fn) => {

    const ssrServer = childProcess.spawn('npm', ['start'], {stdio: 'ignore', detached: true})

    // Using -ssrServer.pid gives a group pid that you can use to kill the entire process tree
    const cleanUp = () => process.kill(-ssrServer.pid)

    const ping = () => (fetch('https://localhost:3443', {agent})
        .then((res) => res.ok)
        .catch(() => false)
    )

    const waitForResponse = (max = 25000, interval = 5000) => {
        const poll = (start, attempt) => {
            console.log(`[Poll] Waiting for SSR server to start (Attempt ${attempt})`)
            return Promise.delay(interval)
                .then(() => ping())
                .then((responded) => {
                    if (responded) {
                        console.log(`[Poll] Server is running`)
                        return Promise.resolve()
                    } else {
                        const now = new Date().getTime()
                        const elapsed = now - start
                        const remaining = max - elapsed
                        if (remaining > 0) {
                            console.log(`[Poll] No response. ${max - elapsed}ms remaining`)
                            return Promise.delay(interval).then(() => poll(start, attempt + 1))
                        } else {
                            return Promise.reject(`[Poll] No response. Timeout at ${elapsed}`)
                        }
                    }
                })
        }
        return poll(new Date().getTime(), 1)
    }

    return waitForResponse()
        .then(() => fn())
        .then(() => {
            cleanUp()
        })
        .catch((err) => {
            cleanUp()
            return Promise.reject(err)
        })
}


const main = () => {
    return withSSRServer(() => {
        childProcess.execSync('./node_modules/.bin/mobify-test-framework nightwatch -- tests/e2e/workflows/ssr-home-plp.js', {stdio: 'inherit'})
    }).catch(() => {
        process.exit(1)
    })
}


main()

