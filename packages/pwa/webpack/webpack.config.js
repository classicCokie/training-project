/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

/* eslint-disable import/no-commonjs */
/* eslint-env node */

// For more information on these settings, see https://webpack.js.org/configuration

const fs = require('fs')
const glob = require('glob')
const path = require('path')
const webpack = require('webpack')
const WebpackNotifierPlugin = require('webpack-notifier')
const autoprefixer = require('autoprefixer')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const pkg = require('../package.json')

const resolve = path.resolve
const root = resolve(__dirname, '..')
const nodeModules = resolve(root, 'node_modules')
const build_dir = resolve(root, 'build')
const production = 'production'
const development = 'development'
const modes = [production, development]
const analyzeBundle = process.env.MOBIFY_ANALYZE === 'true'
const mode = process.env.NODE_ENV === production ? production : development

if (modes.indexOf(mode) < 0) {
    throw new Error(`Mode '${mode}' must be one of '${modes.toString()}'`)
}

/**
 * Touches the file 'build/build.marker' when webpack has recompiled all
 * watched files. This notifies the SSR dev server that it should restart.
 */
const BuildMarkerPlugin = function() {
    this.fileName = 'build/build.marker'
    this.done = this.done.bind(this)
}

BuildMarkerPlugin.prototype.apply = function(compiler) {
    if (compiler.hooks) {
        compiler.hooks.done.tap({name: 'BuildMarkerPlugin'}, this.done)
    } else {
        compiler.plugin('done', this.done)
    }
}

BuildMarkerPlugin.prototype.done = function(stats) {
    if (!stats.hasErrors()) {
        console.log('All builds complete, touching build marker.')
        fs.closeSync(fs.openSync(this.fileName, 'w'))
    }
}

const defines = {
    // This is defined as a boolean, not a string
    MESSAGING_ENABLED: `${pkg.messagingEnabled}`,
    WEBPACK_NON_PWA_ENABLED: `${pkg.nonPwaEnabled}`,
    NATIVE_WEBPACK_ASTRO_VERSION: `'0.0.1'`, // TODO
    AMP_LINKING_ENABLED: `${pkg.ampLinkingEnabled}`,
    MESSAGING_SITE_ID: `'${pkg.messagingSiteId}'`,
    // These are defined as string constants
    PROJECT_SLUG: `'${pkg.projectSlug}'`,
    AJS_SLUG: `'${pkg.aJSSlug}'`,
    SITE_NAME: `"${pkg.siteName}"`,
    WEBPACK_MOBIFY_GA_ID: `'${pkg.mobifyGAID}'`,
    WEBPACK_PACKAGE_JSON_MOBIFY: `${JSON.stringify(pkg.mobify || {})}`,
    WEBPACK_SSR_ENABLED: pkg.mobify ? `${pkg.mobify.ssrEnabled}` : 'false',
    WEBPACK_SITE_URL: `'${pkg.siteUrl}'`,
    DEBUG: mode !== production,
    WEBPACK_PAGE_NOT_FOUND_URL: `'${(pkg.mobify || {}).pageNotFoundURL || ''}' `
}

const uglifiyer = (mode) => {
    switch (mode) {
        case production:
            return new UglifyJsPlugin({
                cache: true,
                parallel: true,
                sourceMap: true
            })
        case development:
            return new UglifyJsPlugin({
                cache: true,
                parallel: true,
                sourceMap: true,
                uglifyOptions: {
                    ie8: false,
                    mangle: false,
                    warnings: false,
                    compress: {
                        // Dead-code removal
                        dead_code: true,
                        unused: true,

                        // Uglify options
                        booleans: false,
                        collapse_vars: false,
                        comparisons: false,
                        conditionals: false,
                        drop_debugger: false,
                        evaluate: false,
                        if_return: false,
                        join_vars: true,
                        keep_fnames: true,
                        loops: false,
                        properties: true,
                        reduce_vars: false,
                        sequences: false
                    }
                }
            })
        default:
            throw new Error(`Invalid mode ${mode}`)
    }
}

const cssLoader = [
    MiniCssExtractPlugin.loader,
    {
        loader: 'css-loader?-autoprefixer',
        options: {
            // Don't use automatic URL transforms
            url: false
        }
    },
    {
        loader: 'postcss-loader',
        options: {
            plugins: [
                autoprefixer({
                    // Don't remove outdated prefixes. Speeds up build time.
                    remove: false
                })
            ]
        }
    }
]

const sassLoader = cssLoader.concat(['sass-loader'])

const babelLoader = [
    {
        loader: 'babel-loader?cacheDirectory',
        options: {
            plugins: ['syntax-dynamic-import']
        }
    }
]

const common = {
    mode,
    // Reduce amount of output in terminal
    stats: {
        all: false,
        modules: true,
        maxModules: 0,
        errors: true,
        warnings: true,
        moduleTrace: true,
        errorDetails: true,
        colors: true,
        assets: true,
        excludeAssets: [/.*img\/.*/, /.*svg\/.*/, /.*json\/.*/, /.*static\/.*/]
    },
    // Create source maps for all files
    devtool: 'source-map',

    output: {
        path: build_dir,
        filename: '[name].js',
        chunkFilename: '[name].js' // Support chunking with react-loadable
    },
    // Tell webpack how to find specific modules
    resolve: {
        symlinks: false,
        extensions: ['.js', '.jsx', '.json'],
        alias: {
            'babel-runtime': resolve(nodeModules, 'babel-runtime'),
            lodash: resolve(nodeModules, 'lodash'),
            'lodash-es': resolve(nodeModules, 'lodash'),
            'lodash._basefor': resolve(nodeModules, 'lodash', '_baseFor'),
            'lodash.escaperegexp': resolve(nodeModules, 'lodash', 'escapeRegExp'),
            'lodash.find': resolve(nodeModules, 'lodash', 'find'),
            'lodash.frompairs': resolve(nodeModules, 'lodash', 'fromPairs'),
            'lodash.isarray': resolve(nodeModules, 'lodash', 'isArray'),
            'lodash.isarguments': resolve(nodeModules, 'lodash', 'isArguments'),
            'lodash.intersection': resolve(nodeModules, 'lodash', 'intersection'),
            'lodash.isplainobject': resolve(nodeModules, 'lodash', 'isPlainObject'),
            'lodash.keys': resolve(nodeModules, 'lodash', 'keys'),
            'lodash.keysin': resolve(nodeModules, 'lodash', 'keysIn'),
            'lodash.mapvalues': resolve(nodeModules, 'lodash', 'mapValues'),
            'lodash.throttle': resolve(nodeModules, 'lodash', 'throttle'),
            react: resolve(nodeModules, 'react'),
            'redux-actions': resolve(nodeModules, 'redux-actions', 'dist', 'redux-actions.min'),
            'redux-form': resolve(nodeModules, 'redux-form', 'dist', 'redux-form.min'),
            redux: resolve(nodeModules, 'redux', 'dist', 'redux.min'),
            'react-redux': resolve(nodeModules, 'react-redux', 'dist', 'react-redux.min'),
            'react-dom': resolve(nodeModules, 'react-dom', 'cjs', 'react-dom.production.min'),
            bluebird: resolve(nodeModules, 'bluebird'),
            'tti-polyfill': resolve(nodeModules, 'tti-polyfill'),
            immutable: resolve(nodeModules, 'immutable', 'dist', 'immutable.min'),
            'sandy-tracking-pixel-client': resolve(
                nodeModules,
                'sandy-tracking-pixel-client',
                'index.min'
            )
        }
    },

    plugins: [
        new webpack.DefinePlugin(defines),

        new WebpackNotifierPlugin({
            title: `Mobify Project: ${pkg.name}`,
            excludeWarnings: true,
            skipFirstNotification: true
        }),

        new MiniCssExtractPlugin({
            filename: '[name].css'
        }),

        new CopyPlugin([{from: 'app/static/', to: 'static/'}]),

        analyzeBundle &&
            new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                defaultSizes: 'gzip',
                openAnalyzer: true
            }),
        mode === development && new webpack.NoEmitOnErrorsPlugin(),
        new BuildMarkerPlugin()
    ].filter((x) => !!x),

    module: {
        rules: [
            {
                test: /\.js(x?)$/,
                exclude: /node_modules/,
                use: babelLoader
            },
            {
                test: /\.svg$/,
                use: 'text-loader'
            },
            {
                test: /\.css?$/,
                use: cssLoader
            },
            {
                test: /\.scss$/,
                use: sassLoader,
                include: [/node_modules\/progressive-web-sdk/, /app/]
            },
            {
                test: /\.html$/,
                exclude: /node_modules/,
                use: {
                    loader: 'html-loader'
                }
            }
        ]
    }
}

// The main PWA entry point gets special treatment for chunking
const main = Object.assign({}, common, {
    entry: {
        main: './app/main.jsx'
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    // Anything imported from node_modules lands in vendor.js
                    test: /node_modules/,
                    name: 'vendor',
                    chunks: 'initial'
                }
            }
        },
        minimizer: [uglifiyer(mode)]
    }
})

const others = Object.assign({}, common, {
    entry: Object.assign(
        {
            loader: './app/loader.js',
            'non-pwa': './non-pwa/non-pwa.js',
            'non-pwa-ask': './non-pwa/non-pwa-ask.js',
            worker: './worker/main.js',
            'service-worker-loader': './service-worker-loader.js',
            'ssr-loader': './app/ssr-loader.js',
            'core-polyfill': 'core-js',
            'fetch-polyfill': 'whatwg-fetch'
        },
        glob.sync('./app/config/translations/*.js').reduce((acc, fileName) => {
            const name = path.basename(fileName).slice(0, -path.extname(fileName).length)
            acc[`translations/${name}`] = fileName
            return acc
        }, {})
    ),
    optimization: {
        minimizer: [uglifiyer(mode)]
    }
})

/**
 * Configuration for the SSR server which is run under Node.
 */
const ssrServerConfig = Object.assign(
    {},
    {
        mode,
        devtool: 'cheap-source-map', // Always use source map, makes debugging the server much easier.
        entry: './app/ssr.js',
        target: 'node',
        output: {
            path: build_dir,
            filename: 'ssr.js',
            libraryTarget: 'commonjs2'
        },
        resolve: {
            extensions: ['.js', '.jsx', '.json'],
            alias: {
                // This is necessary to avoid the .mjs file being used, which fails
                // under webpack 4.
                'node-fetch': path.resolve(
                    root,
                    'node_modules/progressive-web-sdk/node_modules/node-fetch/lib/index.js'
                )
            }
        },
        plugins: [
            new webpack.DefinePlugin(defines),
            // Ouput a single server file for faster Lambda startup
            new webpack.optimize.LimitChunkCountPlugin({maxChunks: 1})
        ],
        module: {
            rules: [
                {
                    test: /.*jsdom.*xmlhttprequest\.js$/,
                    loader: require.resolve('./jsdom-fixup')
                },
                {
                    test: /\.js(x?)$/,
                    exclude: /node_modules/,
                    loader: 'babel-loader?cacheDirectory',
                    options: {
                        babelrc: './ssr.babelrc',
                        plugins: ['syntax-dynamic-import']
                    }
                },
                {
                    test: /\.svg$/,
                    use: 'text-loader'
                }
            ]
        }
    },
    mode === production
        ? {
              optimization: {
                  minimizer: [
                      new UglifyJsPlugin({
                          uglifyOptions: {
                              compress: false,
                              mangle: false,
                              ecma: 6
                          }
                      })
                  ]
              }
          }
        : undefined
)

module.exports = [main, others, ssrServerConfig]
