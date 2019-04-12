import {propTypeErrors} from '@mobify/commerce-integrations/dist/utils/test-utils'
import * as types from '@mobify/commerce-integrations/dist/types'
import Connector from './index.js'

describe(`The Starting Point Connector`, () => {
    const makeConnector = () => Promise.resolve(new Connector({}))

    test('Getting a category', () => {
        return makeConnector()
            .then((connector) => connector.getCategory('root'))
            .then((data) => expect(propTypeErrors(types.Category, data)).toBeFalsy())
    })

    test('Getting a category, not found', () => {
        return makeConnector().then((connector) => {
            expect(connector.getCategory('not-a-category')).rejects.toThrow()
        })
    })

    test('Getting a product', () => {
        return makeConnector()
            .then((connector) => connector.getProduct('1'))
            .then((data) => expect(propTypeErrors(types.Product, data)).toBeFalsy())
    })

    test('Getting a product, not found', () => {
        return makeConnector().then((connector) => {
            expect(connector.getProduct('not-a-product')).rejects.toThrow()
        })
    })

    test('Searching for products, no results', () => {
        return makeConnector()
            .then((connector) =>
                connector.searchProducts({filters: {categoryId: 'tshirts'}, query: ''})
            )
            .then((data) => expect(propTypeErrors(types.ProductSearch, data)).toBeFalsy())
    })

    test('Searching for products, no results', () => {
        return makeConnector()
            .then((connector) =>
                connector.searchProducts({filters: {categoryId: 'not-a-category'}, query: ''})
            )
            .then((data) => {
                expect(propTypeErrors(types.ProductSearch, data)).toBeFalsy()
                expect(data.results.length).toBe(0)
            })
    })
})
