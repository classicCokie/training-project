/* eslint-disable import/no-commonjs */
/* eslint-env node */

const fs = require('fs')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const chalk = require('chalk')
const ip = require('ip')

const config = require('../webpack/webpack.config.js')
const pkg = require('../package.json')

const argv = require('minimist')(process.argv.slice(2))
const port = argv.port || process.env.PORT || 8443

const compiler = webpack(config)
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
    stats: config[0].stats
})

const onStart = () => {
    const divider = chalk.gray('\n-----------------------------------')
    const encodedUrl = encodeURIComponent(pkg.siteUrl)
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

server.listen(port, 'localhost', (err) => {
    return err && console.error(chalk.red(JSON.stringify(err, null, 4)))
})

onStart()
