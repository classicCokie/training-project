import {PERFORMANCE_METRICS} from 'progressive-web-sdk/dist/analytics/data-objects/'
import {onRouteChanged} from 'progressive-web-sdk/dist/store/app/actions'
import {onPageReady, trackPerformance, setPageTemplateName} from 'progressive-web-sdk/dist/analytics/actions'
import {ssrRenderingComplete, ssrRenderingFailed} from 'progressive-web-sdk/dist/utils/universal-utils'
import {incrementPageCount} from 'progressive-web-sdk/dist/store/push-messaging/actions'
import {getURL} from 'progressive-web-sdk/dist/utils/utils'


export const trackPageLoad = (promise, pageType) => (dispatch, getState) => {

    /**
     * Signal that rendering is complete for SSR purposes.
     */
    const ssrComplete = () => ssrRenderingComplete(getState())

    /**
     * Triggered when page data starts loading.
     */
    // eslint-disable-next-line no-unused-vars
    const beforePageLoad = () => {
        // AnalyticsManager requires templateWillMount/templateDidMount, but
        // they are not interesting measurements - time is overwhelmingly
        // spent in the network request on a page load. Trigger them here,
        // on the assumption that a user will call `trackPageLoad` onMount anyway.
        trackPerformance(PERFORMANCE_METRICS.templateWillMount)
        trackPerformance(PERFORMANCE_METRICS.templateDidMount)

        const url = getURL(location)
        dispatch(onRouteChanged(url, pageType))
        dispatch(setPageTemplateName(pageType))
        dispatch(incrementPageCount())
    }


    /**
     * Triggered when page data ends loading.
     */
    // eslint-disable-next-line no-unused-vars
    const afterPageLoad = () => {
        dispatch(onPageReady(pageType))
        trackPerformance(PERFORMANCE_METRICS.templateAPIEnd)
        ssrComplete()
    }


    if (Boolean(promise) && promise.then === undefined) {
        console.warn(`Page returned a value that was not a promise -
            this is likely a programmer error.`)
        ssrComplete()

    } else {
        (Promise.resolve()
            .then(() => beforePageLoad(pageType))
            .then(() => promise)
            .then(() => afterPageLoad(pageType))
            .catch((error) => {
                ssrRenderingFailed(error)
                return Promise.reject(error) // Don't swallow errors!
            })
        )
    }
}
