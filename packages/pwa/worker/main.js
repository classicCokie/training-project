// Service Worker
// ===
//
// This file is a project service worker. We are using Workbox library for
// project service worker. Learn more about how to work with the Workbox,
// https://developers.google.com/web/tools/workbox/.

// We are using `loadWorker` utility function to register service worker, it
// can be found in the project's loader file, `packages/npsp-web/app/loader.js`.

// Project global variables
/* global DEBUG */

import {startDownloadTracker, COMPATIBILITY_MODES} from 'progressive-web-sdk/dist/worker/download-tracker'

// Disable no-undef so eslint won't complain about workbox
/* eslint-disable no-undef */

// Check if we're in PWA mode or not. The pwa parameter in the URL used
// to register this worker will tell us. We reverse the logic here, so that
// if the URL does not contain a PWA parameter, we assume pwa mode as the
// default. If we're in PWA mode, init the PWA worker. In non-PWA mode,
// the PWA worker code is still loaded, but does nothing. This allows us
// to use the same worker code in both modes.
const pwaMode = (!/pwa=0/.test(self.location.toString()))

const workboxVersion = '3.6.1'

if (pwaMode) {
    // Import Workbox
    self.importScripts(`https://storage.googleapis.com/workbox-cdn/releases/${workboxVersion}/workbox-sw.js`)

    // Workbox set config
    workbox.setConfig({
        debug: DEBUG
    })

    // Workbox route configurations


    // Configure the download tracker, passing the toolbox router
    // so that the tracker can look up the handler for a given URL.
    // This must be added after your workbox route configurations.
    startDownloadTracker(workbox.routing, DEBUG, {mode: COMPATIBILITY_MODES.WORKBOX})
}
