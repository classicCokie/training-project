import {Map, List, fromJS} from 'immutable'
import {createSelector} from 'reselect'
import stringify from 'json-stable-stringify'

import {getProductList, getCategories, getProductSearches, getSortForm} from '../../selectors'

export const getCategoryId = createSelector(
    getProductList,
    (uiState) => uiState.getIn(['searchRequest', 'filters', 'categoryId'])
)

export const getCategory = createSelector(
    getCategories,
    getCategoryId,
    (categories, categoryId) => {
        return categories.get(categoryId)
    }
)

export const getCategoryBreadcrumb = createSelector(
    getCategory,
    (category) => {
        const list = [
            {
                text: 'Home',
                href: '/'
            }
        ]
        if (category) {
            list.push({
                text: category.get('name')
            })
        }
        return fromJS(list)
    }
)

export const getProductSearch = createSelector(
    getProductSearches,
    getProductList,
    (productSearches, productListUIState) =>
        productSearches.get(stringify(productListUIState.getIn(['searchRequest'])))
)

export const getProductSearchResults = createSelector(
    getProductSearch,
    (productSearches) => {
        const pages = productSearches ? productSearches.get('pages') : Map()
        const total = productSearches ? productSearches.get('total') : 0

        // Flatten the separate page results into a single list/array.
        const results = pages.reduce((accumulator, page) => {
            return accumulator.concat(page.get('results'))
        }, List())

        return fromJS({results, total, pages: pages.size})
    }
)

export const getSortDropdown = createSelector(
    getSortForm,
    ({values}) => values && values.sort
)

export const getErrorMessage = createSelector(
    getProductList,
    (productListUIState) => productListUIState.get('error')
)
