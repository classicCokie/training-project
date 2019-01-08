/* global DEBUG __webpack_require__ */

import {initCacheManifest, getBuildOrigin} from 'progressive-web-sdk/dist/asset-utils'
import {PerformanceManager} from 'progressive-web-sdk/dist/utils/performance-manager'
import {renderOrHydrate, getBreakpoints} from 'progressive-web-sdk/dist/utils/universal-utils'
import cacheHashManifest from '../tmp/cache-hash-manifest.json'
import {hidePreloader} from 'progressive-web-sdk/dist/preloader'
import {runningServerSide} from 'progressive-web-sdk/dist/utils/utils'
import {watchOnlineStatus} from './utils/utils'
import {onOnlineStatusChange} from './actions'
import {setMediaQueryProps} from './components/media-query/actions'

let origin = getBuildOrigin()

if (!/\/$/.test(origin)) {
    origin += '/'
}

// If the `window.getWebpackChunkPath` function is defined, patch
// __webpack_require__.p to use the value it returns. This allows
// webpack chunk loading to be controlled under SSR.
// If window.getWebpackChunkPath isn't defined, set __webpack_require__.p
// to be the build origin, so that all assets are loaded from the bundle
// location.
Object.defineProperty(
    __webpack_require__, 'p',
    {
        get: window.getWebpackChunkPath || (() => origin)
    }
)

// React
import React from 'react'
import configureStore from './store'
import Router from './router'

// Stylesheet: importing it here compiles the SCSS into CSS. The CSS is actually
// added to the markup in `loader.js`
// eslint-disable-next-line no-unused-vars
import Stylesheet from './stylesheet.scss'

const initPerformanceManager = () => {
    // Configure performance management
    const performanceManager = PerformanceManager.getManager()

    // Configure task-splitting. Change the first parameter from
    // 'true' to 'false' to disable task splitting.
    return performanceManager.setTaskSplitting(true, {
        warnings: DEBUG,
        longStackTraces: DEBUG
    }).then(() => (
        performanceManager.configureDownloads({
            // To disable default throttling, comment out the next line so that
            // maxDownloads is set to 0.
            // maxDownloads: 0
        })
    ))
}

const main = () => {
    initPerformanceManager()
        .then(() => hidePreloader())
        .then(() => {
            initCacheManifest(cacheHashManifest)
            const store = configureStore()
            const rootEl = document.getElementsByClassName('react-target')[0]

            watchOnlineStatus((isOnline) => store.dispatch(onOnlineStatusChange(isOnline)))
            store.dispatch(onOnlineStatusChange(window.navigator.onLine))

            const breakpointName = window.Progressive.viewportSize
            const breakpointWidth = getBreakpoints()[breakpointName]
            const viewportSize = {
                width: Math.max(breakpointWidth, 1)
            }
            store.dispatch(setMediaQueryProps(runningServerSide(), viewportSize))

            renderOrHydrate(<Router store={store} />, store, rootEl)
        })
}

main()
