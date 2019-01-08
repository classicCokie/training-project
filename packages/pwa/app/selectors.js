import Immutable from 'immutable'
import {createSelector} from 'reselect'
import {createGetSelector} from 'reselect-immutable-helpers'

// Base UI Selectors
export const getUI = ({ui}) => ui
export const getGlobals = createSelector(getUI, ({globals}) => globals)
export const getPageMetaData = createGetSelector(getGlobals, 'pageMetaData')
export const getPages = createSelector(getUI, ({pages}) => pages)
export const getHome = createSelector(getPages, ({home}) => home)
export const getProductDetails = createSelector(getPages, ({productDetails}) => productDetails)
export const getProductList = createSelector(getPages, ({productList}) => productList)

// Base Data Selectors
export const getData = ({data}) => data
export const getCategories = createSelector(getData, ({categories}) => categories)
export const getProducts = createSelector(getData, ({products}) => products)
export const getProductSearches = createSelector(getData, ({productSearches}) => productSearches)

// Offline Selectors
export const getOffline = ({offline}) => offline
export const getOfflineModeStartTime = createGetSelector(getOffline, 'startTime')

/**
 * Utility function will convert a category into an object the navigation component
 * understands.
 *
 */
const convertCategoryToNode = (category) =>
    Immutable.fromJS({
        title: category.get('name'),
        path: category.get('id') === 'root' ? '/' : `/category/${category.get('id')}`,
        children: (category.get('categories') || Immutable.List()).map(convertCategoryToNode)
    })

// Navigation Selectors
export const getNavigationRoot = createSelector(getCategories, (categories) => {
    const rootCategory = categories.get('root')

    return rootCategory
        ? convertCategoryToNode(rootCategory)
        : Immutable.fromJS({
            title: 'root',
            path: '/'
        })
})
