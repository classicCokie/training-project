import stringify from 'json-stable-stringify'

// Action Types
export const GLOBAL_UI_RECEIVED = 'GLOBAL_UI_RECEIVED'
export const PAGE_METADATA_RECEIVED = 'PAGE_METADATA_RECEIVED'
export const CATEGORIES_RECEIVED = 'CATEGORIES_RECEIVED'
export const PRODUCTS_RECEIVED = 'PRODUCTS_RECEIVED'
export const PRODUCT_SEARCH_RECEIVED = 'PRODUCT_SEARCH_RECEIVED'
export const ONLINE_STATUS_CHANGED = 'ONLINE_STATUS_CHANGED'


// UI Actions
export const globalUIReceived = (payload) => ({type: GLOBAL_UI_RECEIVED, payload})
export const pageMetaDataReceived = (payload) => ({type: PAGE_METADATA_RECEIVED, payload})


// Data Actions
export const categoriesReceived = (categories) => ({type: CATEGORIES_RECEIVED, payload: categories})
export const productsReceived = (products) => ({type: PRODUCTS_RECEIVED, payload: products})
export const productSearchReceived = (productSearch) => ({
    type: PRODUCT_SEARCH_RECEIVED,
    payload: productSearch
})


/**
 * Set the online status in the redux store.
 *
 * @param isOnline {Boolean}
 */
export const onOnlineStatusChange = (isOnline) => {
    return {
        type: ONLINE_STATUS_CHANGED,
        payload: {
            startTime: !isOnline ? new Date().getTime() : null
        }
    }
}

export const getCategory = (id, opts) => (dispatch, _, {connector}) =>
    connector.getCategory(id, opts).then((category) => {
        // Populate the categories store with all the subcategories in this object by flattenting the
        // category.
        const flattenCategory = ({categories}) =>
            categories.reduce((a, b) => {
                return Array.isArray(b.categories)
                    ? {...a, ...flattenCategory(b)}
                    : {...a, [b.id]: b}
            }, {})

        dispatch(
            categoriesReceived({
                [id]: category,
                ...flattenCategory(category)
            })
        )

        return category
    })


/**
 * One-time initialization for the application, useful for "global" setup
 * that you might want to do once only.
 */
export const initializeApp = () => {
    let promise

    return (dispatch) => {
        promise = promise || Promise.all([
            dispatch(getCategory('root'))
            // Any other actions can be dispatched here.
        ])
        return promise
    }
}


export const getProduct = (id, opts) => (dispatch, _, {connector}) =>
    connector.getProduct(id, opts).then((product) => {
        dispatch(
            productsReceived({
                [id]: product
            })
        )

        return product
    })

export const searchProducts = (searchParams) => (dispatch, _, {connector}) => {
    const resultKey = stringify(searchParams)

    // Transform a productSearchResult object into a product object.
    const transformProductSearchResult = (productSearchResult) => ({
        id: productSearchResult.productId,
        name: productSearchResult.productName,
        price: productSearchResult.price,
        imageSets: [
            {
                images: [productSearchResult.defaultImage],
                variationProperties: [],
                sizeType: 'default'
            }
        ],
        variationProperties: productSearchResult.variationProperties
    })

    return connector.searchProducts(searchParams).then((productSearch) => {
        // Populate the product store, this will help with preloading.
        const accumulator = (acc, curr) => ({
            ...acc,
            [curr.productId]: transformProductSearchResult(curr)
        })
        const products = (productSearch.results || []).reduce(accumulator, {})
        dispatch(productsReceived(products))

        // Add the search results to the store.
        dispatch(
            productSearchReceived({
                [resultKey]: productSearch
            })
        )

        return productSearch
    })
}
