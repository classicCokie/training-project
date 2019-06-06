import {combineReducers} from 'redux'
import {reducer as formReducer} from 'redux-form'
import Immutable from 'immutable'

import app from 'progressive-web-sdk/dist/store/app/reducer'
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
    CHANGE_BRAND
} from './actions'

// Page Reducers
import exampleHomeReducer from './pages/example-home/reducer'
import exampleProductDetailsReducer from './pages/example-product-details/reducer'
import exampleProductListReducer from './pages/example-product-list/reducer'

import mediaQueryPropsReducer from './components/media-query/reducer'

// Reducers
export const categories = (state = Immutable.Map(), action) => {
    switch (action.type) {
        case CATEGORIES_RECEIVED:
            return state.mergeDeep(action.payload)
        default:
            return state
    }
}

export const products = (state = Immutable.Map(), action) => {
    switch (action.type) {
        case PRODUCTS_RECEIVED:
            return state.mergeDeep(action.payload)
        default:
            return state
    }
}

export const productSearches = (state = Immutable.Map(), action) => {
    switch (action.type) {
        case PRODUCT_SEARCH_RECEIVED:
            return state.mergeDeep(action.payload)
        default:
            return state
    }
}

export const globals = (state = Immutable.Map(), action) => {
    switch (action.type) {
        case GLOBAL_UI_RECEIVED:
            return state.mergeDeep(action.payload)
        case PAGE_METADATA_RECEIVED:
            return state.mergeDeep(action.payload)
        case CHANGE_BRAND:
            return state.set('brand', action.payload)
        default:
            return state
    }
}

export const offline = (state = Immutable.Map(), action) => {
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
export const trackingFormReducer = (state, action) => {
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
    mediaQueryProps: mediaQueryPropsReducer
})
