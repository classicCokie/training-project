/* eslint-disable import/no-commonjs */
/* eslint-env node */

const fs = require('fs')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const chalk = require('chalk')
const ip = require('ip')
const siteURL = require('./site-url')

const config = require('../webpack/webpack.config.js')

const argv = require('minimist')(process.argv.slice(2))
const port = argv.port || process.env.PORT || 8443

// only compile the configs necessary for a building client side.
// currently, that excludes the SSR webpack config.
const compiler = webpack(config.filter((cfg) => cfg.name !== 'ssr-server'))
const cert = fs.readFileSync('./dev-server/localhost.pem')

// eslint-disable-next-line no-unused-vars
const server = new WebpackDevServer(compiler, {
    headers: {
        // The Mobify CDN has this response header. We need it for CORS.
        'Access-Control-Allow-Origin': '*'
    },
    https: {
        cert,
        key: cert
    },
    compress: true,
    // Since running webpack via the NodeAPI means that reporting and error handling must be done manually,
    // the stats configs will not be applied to the build output. So, we apply the stats from the 'pwa-main'
    // webpack config which get its stats configuration from a 'common' webpack config variable used between all
    // webpack configs except for the SSR config (which we are not compiling here).
    stats: config.find((cfg) => cfg.name === 'pwa-main').stats
})

const onStart = () => {
    const divider = chalk.gray('\n-----------------------------------')
    const encodedUrl = encodeURIComponent(siteURL.getSiteUrl())
    const encodedSiteFolder = encodeURIComponent(`https://localhost:${port}/loader.js`)

    console.log(`Server started ${chalk.green('✓')}`)
    console.log(
        // eslint-disable-next-line prefer-template
        chalk.bold('Access URLs:') +
            '\n' +
            divider +
            '\n' +
            'Localhost: ' +
            chalk.magenta(`https://localhost:${port}`) +
            '\n' +
            'LAN: ' +
            chalk.magenta(`https://${ip.address()}:${port}`) +
            '\n' +
            divider
    )
    console.log(
        // eslint-disable-next-line prefer-template
        chalk.bold('Preview URL: ') +
            chalk.magenta(
                `https://preview.mobify.com/?url=${encodedUrl}&site_folder=${encodedSiteFolder}&disabled=0&domain=&scope=0`
            ) +
            '\n' +
            divider +
            '\n' +
            chalk.blue(`Press ${chalk.italic('CTRL-C')} to stop`) +
            '\n'
    )
}

server.listen(port, '0.0.0.0', (err) => {
    return err && console.error(chalk.red(JSON.stringify(err, null, 4)))
})

onStart()
