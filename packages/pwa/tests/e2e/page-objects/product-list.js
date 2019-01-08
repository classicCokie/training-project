/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

const selectors = {
    productListTemplateIdentifier: '.t-example-plp__container',
    addItem: '.t-product-details__add-to-cart:not([disabled])',
    productTitle(index) {
        return `.t-product-list__tile:nth-child(${index}) a .c-product-tile__name`
    },
    productDetailsItem(index) {
        return `.t-product-list__tile:nth-child(${index}) a`
    }
}

const ProductList = function(browser) {
    this.browser = browser
    this.selectors = selectors
}

export default ProductList
