/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import Home from '../page-objects/home'
import ProductList from '../page-objects/product-list'

let home
let productList
const PRODUCT_LIST_INDEX = process.env.PRODUCT_LIST_INDEX || 2

module.exports = { // eslint-disable-line import/no-commonjs
    '@tags': ['e2e'],

    before: (browser) => {
        home = new Home(browser)
        productList = new ProductList(browser)
    },

    after: () => {
        home.closeBrowser()
    },

    'Step 1 - NPSP Home Page': () => {
        home.openBrowserToHomepage(home.selectors.url)
    },

    'Email Form is present': (browser) => {
        browser
            .execute('scrollTo(0, 500)')
            .waitForElementVisible(`${home.selectors.emailForm}`)
            .assert.visible(`${home.selectors.emailForm}`)
    },

    'Step 2 - Navigate from Home to ProductList': (browser) => {
        home.navigateToProductList(PRODUCT_LIST_INDEX)
        browser
            .waitForElementVisible(productList.selectors.productListTemplateIdentifier)
            .assert.visible(productList.selectors.productListTemplateIdentifier)
    }
}
