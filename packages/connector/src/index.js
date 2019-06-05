import {ScrapingConnector} from '@mobify/commerce-integrations/dist/connectors/scraping-connector'
import * as errors from '@mobify/commerce-integrations/dist/errors'
// Sample Data
import categoriesJSON from './data/categories.json'

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
        const categoryId = id.match(/^(\w+?)_/i)[1]

        return this.agent
            .set('Authorization', 'apikey="22938e42-93dd-493e-9dd4-eef8206262b8"')
            .get(`/mobify/proxy/base/rest/ContentHub/${categoryId}/${id}`)
            .then((res) => res.body)
            .then((json) => {
                const src = `/mobify/proxy/base/rest${json.picture_portrait}/binary`
                const headline = json.headline_without_format || 'Promotion'

                return {
                    id,
                    categoryId,
                    name: headline,
                    description: json.description,
                    imageSets: [
                        {
                            sizeType: 'large',
                            images: [
                                {
                                    alt: headline,
                                    description: headline,
                                    title: headline,
                                    src
                                }
                            ]
                        }
                    ]
                }
            })
    }

    // eslint-disable-next-line no-unused-vars
    searchProducts(searchParams) {
        const {filters} = searchParams
        const {categoryId} = filters

        return this.agent
            .set('Authorization', 'apikey="22938e42-93dd-493e-9dd4-eef8206262b8"')
            .get(`/mobify/proxy/base/rest/ContentHub/${categoryId}`)
            .then((res) => this.parseSearchProducts(res.body, searchParams))
    }

    parseSearchProducts(json, searchParams) {
        const results = this.productSearchResults(json)

        return {
            results,
            query: searchParams.query,
            selectedFilters: searchParams.filters,
            count: results.length,
            total: results.length,
            start: 0
        }
    }

    productSearchResults(json) {
        return json['_embedded']['rh:doc']
            .filter((_, i) => i % 2 !== 0) // filter out the repeated values without titles
            .map((prom) => this.parseProductSearchResult(prom)) // parse the each product
    }

    parseProductSearchResult(promotion) {
        const src = `/mobify/proxy/base/rest${promotion.picture_portrait}/binary`
        const headline = promotion.headline_without_format || 'Promotion'

        return {
            productId: promotion.fs_id,
            productName: headline,
            defaultImage: {
                src,
                alt: headline
            }
        }
    }
}
