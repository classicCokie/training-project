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
        const {categoryId, pageIndex} = searchParams.filters

        // Send the request via the proxy
        return this.agent
            .get(`/mobify/proxy/base/${categoryId}.html?p=${pageIndex}`)
            .then((res) => this.buildDocument(res))
            .then((doc) => this.parseSearchProducts(doc, searchParams))
    }

    parseSearchProducts(htmlDoc, searchParams) {
        const totalEl = htmlDoc.querySelector('.toolbar-products .toolbar-number')
        const amountEl = htmlDoc.querySelector('.limiter-options option[selected]')
        const results = this.productSearchResults(htmlDoc)

        const pageIndex = parseInt(searchParams.filters.pageIndex)
        const pageSize = parseInt(amountEl.textContent)
        const totalProducts = totalEl ? parseInt(totalEl.textContent) : 0
        const totalPages = Math.ceil(totalProducts / pageSize)

        return {
            query: searchParams.query,
            selectedFilters: searchParams.filters,
            results,
            count: results.length,
            total: totalProducts,
            start: (pageIndex - 1) * pageSize,
            totalPages // FIXME: This isn't part of the docs. Find a better way to pass per-page (or even total # of pages) back.
        }
    }

    productSearchResults(htmlDoc) {
        // Spread the NodeList into a real Array so we can use ``map``
        const productEls = [...htmlDoc.querySelectorAll('.products.product-items > .product-item')]
        return productEls.map((productEl) => this.parseProductSearchResult(productEl))
    }

    parseProductSearchResult(productEl) {
        // Extract the ProductSearchResult data we need.
        const idEl = productEl.querySelector('.product-item-photo')
        const nameEl = productEl.querySelector('.product-item-name')
        const priceEl = productEl.querySelector('.price-wrapper')
        const imageEl = productEl.querySelector('.product-image-photo')

        // Unavailable/out-of-stock products will not have a ``.price-wrapper`` child.
        const available = !!priceEl
        const price = priceEl ? priceEl.dataset.priceAmount : -1

        const productIdMatch = idEl.href.match(/([^/]+)\.html/)
        const productId = productIdMatch && productIdMatch[1]
        const productName = nameEl.textContent

        const defaultImage = {
            alt: imageEl.getAttribute('alt'),
            description: imageEl.getAttribute('alt'),
            src: imageEl.getAttribute('src'),
            title: imageEl.getAttribute('alt')
        }

        return {
            available,
            productId,
            productName,
            defaultImage,
            price,
            variationProperties: []
        }
    }
}
