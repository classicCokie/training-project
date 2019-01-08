import {getProduct, pageMetaDataReceived, initializeApp} from '../../actions'

export const PRODUCT_DETAILS_UI_STATE_RECEIVED = 'PRODUCT_UI_STATE_RECEIVED'

export const updateProductUIState = (payload) => ({
    type: PRODUCT_DETAILS_UI_STATE_RECEIVED,
    payload
})

const setPageMetaData = (product) => (dispatch) =>
    dispatch(
        pageMetaDataReceived({
            pageMetaData: {
                title: product.name,
                description: product.description
            }
        })
    )

export const initialize = (productId) => (dispatch) => {
    // Grab the information we know about this product that needs to be in the ui
    // state. At the same time, reset any state that needs to be reset.
    const uiState = {
        productId,
        variationValues: undefined,
        error: undefined
    }

    // Update the UI information base on our findings in the url.
    dispatch(updateProductUIState(uiState))

    // When getting the product if there is any error set that error in the ui
    // state to be used later.
    const getProductPromise = dispatch(getProduct(productId)).catch((err) =>
        dispatch(updateProductUIState({error: err.message}))
    )

    return Promise.all([
        dispatch(initializeApp()),
        getProductPromise.then((product) => dispatch(setPageMetaData(product)))
    ])
}
