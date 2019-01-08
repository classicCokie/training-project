/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
const ENV = process.env.NODE_ENV || 'test'
const SKIP_PREVIEW = (ENV === 'production' || process.env.SKIP_PREVIEW)
const DEBUG = (false || process.env.DEBUG)

const selectors = {
    pwa: '.react-target',
    wrapper: '.t-home',
    emailForm: 'input[type="email"]',
    menu: '.pw-mega-menu',
    menuListItem(index) {
        return `div.pw-mega-menu-item__children > div:nth-child(${index}) div[role='button']`
    },

    productListItem(index) {
        return `.t-home__category-item:nth-child(${index}) .pw--is-loaded`
    },
    copyright: '.qa-footer__copyright',
}

const Home = function(browser) {
    this.browser = browser
    this.selectors = selectors
}

const waitForPageToBeReady = function(browser, url) {
    browser
        .url(url)
        .pause(200)
        .element('css selector', selectors.pwa, function(result) {
            if (result.value && result.value.ELEMENT) {
                console.log('Page ready for testing')
            } else {
                console.log('Page not ready')
                waitForPageToBeReady(browser, url)
            }
        })
}

Home.prototype.openBrowserToHomepage = function(url) {
    // Wait for page to ready
    waitForPageToBeReady(this.browser, url)
    if (!SKIP_PREVIEW) {
        console.log('Running preview.')
        this.browser
            .preview(url, 'https://localhost:8443/loader.js')
    }
    this.browser
        .waitForElementVisible(selectors.wrapper)
        .assert.visible(selectors.wrapper)
}

Home.prototype.closeBrowser = function() {
    if (DEBUG) {
        console.log('Debugging, not closing browser')
    } else {
        this.browser.end()
    }
    return this
}

Home.prototype.navigateToProductList = function(PRODUCT_LIST_INDEX) {
    // Navigate from Home to ProductList
    this.browser
        .log(`Navigating to ProductList number: ${PRODUCT_LIST_INDEX}`)
        .waitForElementVisible(selectors.menuListItem(PRODUCT_LIST_INDEX))
        .click(selectors.menuListItem(PRODUCT_LIST_INDEX))
    return this
}

export default Home
