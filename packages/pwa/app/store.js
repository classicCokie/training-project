import {createStore, compose, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import Immutable from 'immutable'
import analytics from 'redux-analytics'
import analyticsManager from 'progressive-web-sdk/dist/analytics/analytics-manager'
import {runningServerSide} from 'progressive-web-sdk/dist/utils/utils'
import Connector from "training-project-connector/dist"
import reducer from './reducer'

const isServerSide = runningServerSide()
const isUniversal = window.Progressive && window.Progressive.isUniversal

if (!isServerSide) {
    analyticsManager.init({
        // eslint-disable-next-line no-undef
        projectSlug: AJS_SLUG,
        // eslint-disable-next-line no-undef
        mobifyGAID: WEBPACK_MOBIFY_GA_ID,
        ecommerceLibrary: 'ec',
        // eslint-disable-next-line no-undef
        debug: DEBUG
    })
}

const getConnector = () => {
    const basePath = isUniversal ? `/mobify/proxy/base` : 'https://www.merlinspotions.com'
    return Connector.fromConfig({
        window,
        basePath,
        dondeGeoBasePath: 'https://donde-geo-tools.herokuapp.com',
        dondeApiBasePath: 'https://api.donde.io'
    })
}

/**
 * Restore a previously-frozen app state for use as the initial data when building
 * the redux store.
 */
export const restoreFromFrozen = (frozen) => {
    if (!frozen) {
        return undefined
    } else {
        return Object.assign(
            {},
            ...Object.keys(frozen).map((key) => {
                switch (key) {
                    case 'ui':
                    case 'data':
                        return {
                            [key]: Object.assign(
                                {},
                                ...Object.keys(frozen[key]).map((k) => ({
                                    [k]: Immutable.fromJS(frozen[key][k])
                                }))
                            )
                        }
                    default:
                        return {[key]: Immutable.fromJS(frozen[key])}
                }
            })
        )
    }
}

const configureStore = () => {
    const initialState = restoreFromFrozen(window.__PRELOADED_STATE__)

    const middlewares = [thunk.withExtraArgument({connector: getConnector()})]

    if (!isServerSide) {
        middlewares.push(
            analytics(({type, payload}, state) => analyticsManager.distribute(type, payload, state))
        )
    }

    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
            serialize: { // prettier-ignore
                immutable: Immutable
            }
        }) // prettier-ignore
        : compose

    const store = createStore(
        reducer,
        initialState,
        composeEnhancers(applyMiddleware(...middlewares))
    )
    return store
}

export default configureStore
