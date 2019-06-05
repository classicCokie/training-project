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
    getCategory(id) {
        const category = categoriesJSON[id]

        return delay().then(() => {
            if (!category) throw new errors.NotFoundError('Category Not Found')
            return category
        })
    }

    getProduct(id) {
        // Extract the categoryId from the productId
        const categoryId = id.match(/^(\w+?)_/i)[1]

        return (
            this.agent
                // Set the Authroization header in code (not recommended for production)
                .set('Authorization', 'apikey="22938e42-93dd-493e-9dd4-eef8206262b8"')
                // Send the request via the proxy to https://sfcc-dku02.e-spirit.com
                .get(`/mobify/proxy/base/rest/ContentHub/${categoryId}/${id}`)
                .then((res) => res.body)
                .then((json) => {
                    const headline = json.headline_without_format || 'Promotion'

                    // Follow the ImageSet schema to set up this object correctly
                    // https://docs.mobify.com/commerce-integrations/latest/api/module-types.html#.ImageSet
                    const imageSets = [
                        {
                            sizeType: 'large',
                            images: [
                                {
                                    alt: headline,
                                    description: headline,
                                    title: headline,
                                    src: `/mobify/proxy/base/rest${json.picture_portrait}/binary`
                                }
                            ]
                        }
                    ]

                    return {
                        id,
                        categoryId,
                        name: headline,
                        description: json.description,
                        imageSets
                    }
                })
        )
    }

    searchProducts(searchParams) {
        const {filters} = searchParams
        const {categoryId} = filters

        return (
            this.agent
                // Set the Authroization header in code (not recommended for production)
                .set('Authorization', 'apikey="22938e42-93dd-493e-9dd4-eef8206262b8"')
                // Send the request via the proxy to https://sfcc-dku02.e-spirit.com
                .get(`/mobify/proxy/base/rest/ContentHub/${categoryId}`)
                .then((res) => this.parseSearchProducts(res.body, searchParams))
        )
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
        return (
            // Extract the array of results we need from the JSON response
            json['_embedded']['rh:doc']
                // Filter out the repeated promotions lacking titles
                .filter((_, i) => i % 2 !== 0)
                // Construct a new array of the parsed products
                .map((prom) => this.parseProductSearchResult(prom))
        )
    }

    parseProductSearchResult(promotion) {
        const headline = promotion.headline_without_format || 'Promotion'
        const defaultImage = {
            // Construct a proxy URL in the shape that e-Spirit expects for image data
            src: `/mobify/proxy/base/rest${promotion.picture_portrait}/binary`,
            alt: headline,
            description: headline,
            title: headline
        }

        return {
            productId: promotion.fs_id,
            productName: headline,
            defaultImage
        }
    }
}
