import {pageMetaDataReceived, searchProducts, initializeApp} from '../../actions'

export const CATEGORY_LIST_UI_STATE_RECEIVED = 'CATEGORY_LIST_UI_STATE_RECEIVED'

export const updateCategoryUIState = (payload) => ({type: CATEGORY_LIST_UI_STATE_RECEIVED, payload})

const setPageMetaData = (productSearch) => (dispatch) => {
    return dispatch(
        pageMetaDataReceived({
            pageMetaData: {
                title: `${productSearch.results.length} results for "${
                    productSearch.selectedFilters.categoryId
                }"`,
                keywords: productSearch.query,
                description: productSearch.query
            }
        })
    )
}

export const initialize = (query) => (dispatch) => {
    dispatch(
        updateCategoryUIState({
            searchRequest: query,
            error: null
        })
    )

    const searchPromise = dispatch(searchProducts(query)).catch((err) =>
        dispatch(updateCategoryUIState({error: err.message}))
    )

    const appPromise = dispatch(initializeApp())

    return Promise.all([searchPromise, appPromise]).then(([productSearch]) => {
        return dispatch(setPageMetaData(productSearch))
    })
}
