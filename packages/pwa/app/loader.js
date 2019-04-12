/* global AJS_SLUG, DEBUG, AMP_LINKING_ENABLED */
import {getAssetUrl, loadAsset, initCacheManifest} from 'progressive-web-sdk/dist/asset-utils'
import {
    documentWriteSupported,
    isFirefoxBrowser,
    isSamsungBrowser,
    iOSBrowser,
    loadScript,
    preventDesktopSiteFromRendering,
    prefetchLink
} from 'progressive-web-sdk/dist/utils/utils'
import {
    isPreview,
    isV8Tag,
    loadPreview,
    shouldPreview
} from 'progressive-web-sdk/dist/utils/preview-utils'
import {displayPreloader} from 'progressive-web-sdk/dist/preloader'
import cacheHashManifest from '../tmp/loader-cache-hash-manifest.json'

import {
    setPerformanceValues,
    trackFirstPaints,
    trackTTI,
    triggerSandyAppStartEvent,
    getPWAType
} from 'progressive-web-sdk/dist/utils/loader-utils/performance-timing'
import {PLATFORMS} from 'progressive-web-sdk/dist/analytics/constants'
import {loaderLog, setLoaderDebug} from 'progressive-web-sdk/dist/utils/loader-utils/loader-logging'
import {
    loadWorker,
    preloadSWAmp
} from 'progressive-web-sdk/dist/utils/loader-utils/service-worker-setup'

import {getNeededPolyfills} from './utils/polyfills'
import {
    isReactRoute,
    setRouteList,
    setBlacklist
} from 'progressive-web-sdk/dist/routing/is-react-route'
import ReactRegexes from './loader-routes'
import blacklist from './config/route-blacklist'

import preloadHTML from './preloader/preload.html'
import preloadCSS from './preloader/preload.css'
// eslint-disable-next-line import/default
import preloadJS from 'raw-loader!./preloader/preload.js'

import {baseAMPUrl, hasAMPPage} from './ampUrls'

const ampLinkingEnabled = AMP_LINKING_ENABLED

const CAPTURING_CDN = '//cdn.mobify.com/capturejs/capture-latest.min.js'

//  True if the loader is being loaded in preview mode (either as detected
//  by the SDK, or if the V8.1 tag set the flag.
const IS_PREVIEW = isPreview() || window.Mobify.isPreview

//  True if the loader has been loaded via a V8+ tag
const IS_V8_TAG = isV8Tag()

setLoaderDebug(DEBUG || IS_PREVIEW)

window.Progressive = {
    // This flag is the one true way to identify if PWA is loaded via
    //   window.Progressive && !window.Progressive.PWADisabled
    // We use the negation since this allows backwards comaptibility
    PWADisabled: true,

    // isPWA() can be used to identify if PWA is loaded
    // without backwards compatibility concerns
    isPWA: () => !window.Progressive.PWADisabled
}

setPerformanceValues()

// Track First Paint and First Contentful Paint.
trackFirstPaints()

// Set up the routes and blacklist
setRouteList(ReactRegexes)
setBlacklist(blacklist)

const isPWARoute = () => isReactRoute(window.location.pathname)

/**
 * Determine if the browser is one that supports PWAs.
 *
 * If loaded by a V8+ tag, the decision is based on the shouldLoadPWA
 * flag set by the tag. For a non V8 tag, we check the UA directly.
 *
 * @return {boolean} true if this browser supports PWAs.
 */
const isSupportedPWABrowser = () => {
    // By default, the PWA will run on all mobile browsers except Samsung
    // and Firefox. The tag contains a browser test that sets the
    // window.Mobify.shouldLoadPWA flag for a set of browsers, but this
    // function may also apply stricter checks.
    const ua = window.navigator.userAgent
    return (
        // For a V8 tag, use the flag set by the tag
        ((IS_V8_TAG && window.Mobify.shouldLoadPWA) ||
            // For a non-V8 tag check the UA directly
            /ip(hone|od)|android.*(mobile)|blackberry.*applewebkit|bb1\d.*mobile/i.test(ua)) &&
        // Always return false if this is Firefox or a Samsung browser
        !isSamsungBrowser(ua) &&
        !isFirefoxBrowser(ua)
    )
}

let waitForBodyPromise
const waitForBody = () => {
    waitForBodyPromise =
        waitForBodyPromise ||
        new Promise((resolve) => {
            const bodyEl = document.getElementsByTagName('body')

            const checkForBody = () => {
                if (bodyEl.length > 0) {
                    resolve()
                } else {
                    setTimeout(checkForBody, 50)
                }
            }

            checkForBody()
        })

    return waitForBodyPromise
}

const shouldLoadWorker = () => {
    return 'serviceWorker' in navigator && !iOSBrowser(navigator.userAgent)
}

const addAMPLinkTags = () => {
    if (!ampLinkingEnabled) {
        return
    }

    // Only add AMP tag for specified URLs
    if (hasAMPPage(window.location.pathname)) {
        loadAsset('link', {
            rel: 'amphtml',
            href: `${baseAMPUrl}${window.location.pathname}`
        })
    }
}

/**
 * Initialize the app. Assumes that all needed polyfills have been
 * loaded.
 */
const loadPWA = () => {
    window.Progressive.PWADisabled = false

    try {
        trackTTI()
    } catch (e) {
        if (typeof console !== 'undefined') {
            console.error(e.message)
        }
    }
    // We need to check if loadScriptsSynchronously is undefined because if it's
    // previously been set to false, we want it to remain set to false.
    if (window.loadScriptsSynchronously === undefined) {
        // On poor connections, the problem is that Chrome doesn't allow writing
        // script tags via document.write, so we want to detect for poor connections
        // and load async in those cases. More info can be found here:
        // https://developers.google.com/web/updates/2016/08/removing-document-write
        window.loadScriptsSynchronously = documentWriteSupported() && IS_V8_TAG
    }

    const neededPolyfills = getNeededPolyfills()
    if (neededPolyfills.length) {
        // We disable loading scripts sychronously if polyfills are needed,
        // because the polyfills load async.
        window.loadScriptsSynchronously = false
        // But we still need to ensure the desktop script doesn't render while the
        // document.readyState is "loading"
        preventDesktopSiteFromRendering()

        neededPolyfills.forEach((polyfill) => polyfill.load(loadPWA))
        return
    }

    initCacheManifest(cacheHashManifest)
    triggerSandyAppStartEvent(true, AJS_SLUG, getPWAType())

    addAMPLinkTags()

    loadAsset('link', {
        rel: 'apple-touch-icon',
        href: getAssetUrl('static/img/global/apple-touch-icon.png')
    })

    loadAsset('link', {
        href: getAssetUrl('main.css'),
        rel: 'stylesheet',
        type: 'text/css',
        // Tell us when the stylesheet has loaded so we know when it's safe to
        // display the app! This prevents a flash of unstyled content.
        onload: 'window.Progressive.stylesheetLoaded = true;'
    })

    loadAsset('link', {
        href: getAssetUrl('static/manifest.json'),
        rel: 'manifest'
    })

    window.loadCriticalScripts = () => {
        // The following scripts are loaded sync via document.write, in order
        // for the browser to increase the priority of these scripts. If the scripts
        // are loaded async, the browser will not consider them high priority and
        // queue them while waiting for other high priority resources to finish
        // loading. This delay can go all the way up to 5 seconds on a Moto G4 on a
        // 3G connection. More information can be found here:
        // https://developers.google.com/web/updates/2016/08/removing-document-write
        loadScript({
            id: 'progressive-web-vendor',
            src: getAssetUrl('vendor.js'),
            docwrite: window.loadScriptsSynchronously,
            isAsync: false,
            // If there is an error loading the script, then it must be a document.write issue,
            // so in that case, retry the loading asynchronously.
            onerror: () => {
                console.warn(
                    '[Mobify.Progressive.Loader] document.write was blocked from loading 3rd party scripts. Loading scripts asynchronously instead.'
                )
                window.loadScriptsSynchronously = false
                window.loadCriticalScripts()
            }
        })

        loadScript({
            id: 'progressive-web-main',
            src: getAssetUrl('main.js'),
            docwrite: window.loadScriptsSynchronously
        })

        loadScript({
            id: 'progressive-web-jquery',
            src: getAssetUrl('static/js/jquery.min.js'),
            docwrite: window.loadScriptsSynchronously
        })

        // We need to know the URL of the captured document
        // So we can determine if we can use it or not for fulfilling requests
        window.Progressive.capturedURL = window.location.href
        window.Progressive.capturedDocHTMLPromise = new Promise((resolve) => {
            // The reason we bound this to window is because the "onload" method below
            // is added to the document via document.write, this "onload" is toString'ed,
            // meaning it doesn't have accessed to closure variables.
            window.captureResolve = resolve
            loadScript({
                id: 'progressive-web-capture',
                src: CAPTURING_CDN,
                docwrite: window.loadScriptsSynchronously,
                onload: () => {
                    window.Capture.init((capture) => {
                        // NOTE: by this time, the captured doc has changed a little
                        // bit from original desktop. It now has some of our own
                        // assets (e.g. main.css) but they can be safely ignored.
                        window.captureResolve(capture.enabledHTMLString())

                        const plaintextEl = document.querySelector('plaintext')
                        if (plaintextEl) plaintextEl.remove()
                    })
                }
            })
        })
    }

    // Force create the body element in order to render the Preloader. This is necessary
    // because we load scripts synchronously in order to speed up loading, which
    // by default would throw them in head, where as we need them in body.
    // Create the react-target element before loading the scripts that need it (e.g. Analytics Manager)
    if (window.loadScriptsSynchronously) {
        document.write('<body>')
        document.write('<div class="react-target"></div>')
        window.loadCriticalScripts()
    } else {
        // If document.write isn't supported or we are not on the V8 tag
        // wait for the body, then create react-target and loaded critical scripts
        waitForBody().then(() => {
            // Display the Preloader to indicate progress to the user.
            if (!window.matchMedia('(display-mode: standalone)').matches) {
                displayPreloader(preloadCSS, preloadHTML, preloadJS)
            }

            // Create React mounting target
            const body = document.getElementsByTagName('body')[0]
            const reactTarget = document.createElement('div')
            reactTarget.className = 'react-target'
            body.appendChild(reactTarget)
            // Load scripts once the body and react-target have been created
            window.loadCriticalScripts()
        })
    }

    // Prioritize loading if the service worker to after the window load event.
    window.addEventListener('load', () => {
        Promise.resolve().then(() => {
            return shouldLoadWorker()
                ? loadWorker(true, false, cacheHashManifest)
                : Promise.resolve(false)
        })
    })

    // Prefetch analytics - it's something that we will be downloading later,
    // and thus we want to fetch it so execution is not delayed to prevent
    // time to interactive from being delayed.
    prefetchLink({href: '//www.google-analytics.com/analytics.js'})

    // We insert a <plaintext> tag at the end of loading the scripts, in order
    // to ensure that the original site does not execute anything.
    // Do not remove!
    preventDesktopSiteFromRendering()
}

// To preload SW on AMP, it needs the SW code to be served
// from the site origin, via HTTPS. The <amp-install-serviceworker>
// element then loads the markup into an iframe and installs the
// the service worker on the AMP page. This piece of code fetches
// sw.js configuration, registers it, and then halts execution for the PWA.
if (preloadSWAmp(true, false, cacheHashManifest)) {
    loaderLog('Setup SW from AMP')
    // This route will only be hit from AMP pages, and does not
    // require loading the rest of the PWA.
    preventDesktopSiteFromRendering()
} else if (shouldPreview()) {
    // If preview is being used, load a completely different file from this one and do nothing.
    loadPreview()
} else {
    // Run the app.
    if (
        // Load the PWA if the browser supports it and the route matches
        isSupportedPWABrowser() &&
        isPWARoute()
    ) {
        loaderLog('Starting in PWA mode')
        loadPWA()
    } else {
        // If it's not a supported browser or there is no PWA view for this page,
        // still load a.js to record analytics.
        addAMPLinkTags()
        waitForBody().then(() => {
            loadScript({
                id: 'ajs',
                src: `https://a.mobify.com/${AJS_SLUG}/a.js`
            })
            triggerSandyAppStartEvent(false, AJS_SLUG, PLATFORMS.NON_PWA)
        })
    }
}
