import {MerlinsConnector} from '@mobify/commerce-integrations/dist/connectors/merlins'
import * as errors from '@mobify/commerce-integrations/dist/errors'

// Third party modules
import stringify from 'json-stable-stringify'

// Sample Data
import categoriesJSON from './data/categories.json'
import productsJSON from './data/products.json'
import productSearchesJSON from './data/product-searches.json'

/**
 * Create a promise that will resolve in a given number of milliseconds.
 *
 * @param {Integer} duration
 * @return {Promise<undefined>}
 */
const delay = (duration = 500) =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, duration)
    })

export default class StartingPointConnector extends MerlinsConnector {
    // eslint-disable-next-line no-unused-vars
    getCategory(id, opts) {
        const category = categoriesJSON[id]

        return delay().then(() => {
            if (!category) {
                throw new errors.NotFoundError('Category Not Found')
            }

            return category
        })
    }

    // eslint-disable-next-line no-unused-vars
    getProduct(id, opts) {
        const product = productsJSON[id]

        return delay().then(() => {
            if (!product) {
                throw new errors.NotFoundError('Product Not Found')
            }

            return product
        })
    }

    // eslint-disable-next-line no-unused-vars
    searchProducts(searchParams, opts) {
        const categoryId = ((searchParams || {}).filters || {}).categoryId

        if (categoryId === 'potions') {
            // Secret hint that we want to hit Merlins for test purposes.
            return super.searchProducts(searchParams, opts)
        } else {
            return delay().then(() => {
                const noResults = {
                    query: searchParams.query,
                    selectedFilters: searchParams.filters,
                    results: [],
                    count: 0,
                    total: 0,
                    start: 0,
                }
                return productSearchesJSON[stringify(searchParams)] || noResults
            })
        }
    }
}
