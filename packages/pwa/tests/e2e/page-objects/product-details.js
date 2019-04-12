/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2019 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

const selectors = {
    productDetailsTemplateIdentifier: '.t-example-product-details',
    modalButton: '.qa-modal-button',
    sheetCloseButton: '.pw-sheet button',
    emailForm: 'input[type="email"]'
}

const ProductDetails = function(browser) {
    this.browser = browser
    this.selectors = selectors
}

ProductDetails.prototype.verifyModalButton = function() {
    this.browser
        .execute('scrollTo(0,500)')
        .log('Verifying the Modal Button is working')
        .waitForElementVisible(selectors.modalButton)
        .triggerClick(selectors.modalButton)
        .waitForElementVisible(selectors.sheetCloseButton)
    return this
}

export default ProductDetails
