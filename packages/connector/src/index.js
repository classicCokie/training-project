import {ScrapingConnector} from '@mobify/commerce-integrations/dist/connectors/scraping-connector'
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
            .get('/mobify/proxy/base/potions.html')
            .then((res) => this.buildDocument(res))
            .then((doc) => this.parseSearchProducts(doc, searchParams))
    }

    parseSearchProducts(htmlDoc, searchParams) {
        const results = this.productSearchResults(htmlDoc)

        return {
            query: searchParams.query,
            selectedFilters: searchParams.filters,
            results: results,
            count: results.length,
            total: results.length,
            start: 0
        }
    }

    productSearchResults(htmlDoc) {
        // Spread the NodeList into a real Array so we can use ``map``
        const productEls = [...htmlDoc.querySelectorAll('.products.product-items > .product-item')]
        return productEls.map((productEl) => this.parseProductSearchResult(productEl))
    }

    parseProductSearchResult(productEl) {
        const imageEl = productEl.querySelector('.product-image-photo')
        const defaultImage = {
            alt: imageEl.getAttribute('alt'),
            description: imageEl.getAttribute('alt'),
            src: imageEl.getAttribute('src'),
            title: imageEl.getAttribute('alt')
        }

        return {
            available: true,
            productId: '',
            productName: '',
            defaultImage: defaultImage,
            price: 0,
            rating: 0,
            variationProperties: []
        }
    }
}
