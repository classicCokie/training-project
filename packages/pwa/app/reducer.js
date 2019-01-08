import {combineReducers} from 'redux'
import {reducer as formReducer} from 'redux-form'
import Immutable from 'immutable'

import app from 'progressive-web-sdk/dist/store/app/reducer'
import pushMessaging from 'progressive-web-sdk/dist/store/push-messaging/reducer'
import {ReduxFormPluginOption} from 'progressive-web-sdk/dist/analytics/actions'

import {
    // UI Action Types
    GLOBAL_UI_RECEIVED,
    // Data Action Types
    PAGE_METADATA_RECEIVED,
    CATEGORIES_RECEIVED,
    PRODUCTS_RECEIVED,
    PRODUCT_SEARCH_RECEIVED,
    ONLINE_STATUS_CHANGED,
} from './actions'


// Page Reducers
import exampleHomeReducer from './pages/example-home/reducer'
import exampleProductDetailsReducer from './pages/example-product-details/reducer'
import exampleProductListReducer from './pages/example-product-list/reducer'

import mediaQueryPropsReducer from './components/media-query/reducer'

// Reducers
const categories = (state = Immutable.Map(), action) => {
    switch (action.type) {
        case CATEGORIES_RECEIVED:
            return state.mergeDeep(action.payload)
        default:
            return state
    }
}

const products = (state = Immutable.Map(), action) => {
    switch (action.type) {
        case PRODUCTS_RECEIVED:
            return state.mergeDeep(action.payload)
        default:
            return state
    }
}

const productSearches = (state = Immutable.Map(), action) => {
    switch (action.type) {
        case PRODUCT_SEARCH_RECEIVED:
            return state.mergeDeep(action.payload)
        default:
            return state
    }
}

const globals = (state = Immutable.Map(), action) => {
    switch (action.type) {
        case GLOBAL_UI_RECEIVED:
            return state.mergeDeep(action.payload)
        case PAGE_METADATA_RECEIVED:
            return state.mergeDeep(action.payload)
        default:
            return state
    }
}

const offline = (state = Immutable.Map(), action) => {
    switch (action.type) {
        case ONLINE_STATUS_CHANGED:
            return state.mergeDeep(action.payload)
        default:
            return state
    }
}

/**
 * Wrap redux-form's default reducer with ours which adds
 * analytics tracking to all forms.
 */
const trackingFormReducer = (state, action) => {
    const reducer =
        action.meta && action.meta.form
            ? formReducer.plugin({
                [action.meta.form]: (state, action) => ReduxFormPluginOption.all(state, action) // prettier-ignore
            }) // prettier-ignore
            : formReducer
    return reducer(state, action)
}

export default combineReducers({
    app,
    pushMessaging,
    offline,
    ui: combineReducers({
        globals,
        pages: combineReducers({
            home: exampleHomeReducer,
            productDetails: exampleProductDetailsReducer,
            productList: exampleProductListReducer
        })
    }),
    data: combineReducers({
        categories,
        products,
        productSearches
    }),
    form: trackingFormReducer,
    mediaQueryProps: mediaQueryPropsReducer,
})
