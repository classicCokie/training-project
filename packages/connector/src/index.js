import {ScrapingConnector} from '@mobify/commerce-integrations/dist/connectors/scraping-connector'
import * as errors from '@mobify/commerce-integrations/dist/errors'

// Sample Data
import categoriesJSON from './data/categories.json'
import productsJSON from './data/products.json'

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

export default class StartingPointConnector extends ScrapingConnector {
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
        return this.agent
            .set('Authorization', 'apikey="22938e42-93dd-493e-9dd4-eef8206262b8"')
            .get('/mobify/proxy/base/rest/ContentHub/promotions')
            .then((res) => this.parseSearchProducts(res.body, searchParams))
    }

    parseSearchProducts(json, searchParams) {
        const results = this.productSearchResults(json)

        return {
            query: searchParams.query,
            selectedFilters: searchParams.filters,
            results: results,
            count: results.length,
            total: results.length,
            start: 0
        }
    }

    productSearchResults(json) {
        return json['_embedded']['rh:doc'].map((prom) => this.parseProductSearchResult(prom))
    }

    parseProductSearchResult(promotion) {
        return {
            available: true,
            productId: promotion.fs_id,
            productName: promotion.fs_id,
            defaultImage: `/mobify/proxy/base/rest${promotion.picture_portrait}/binary`,
            price: 0,
            variationProperties: []
        }
    }
}
