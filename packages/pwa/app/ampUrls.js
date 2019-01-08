/**
 * The base URL for AMP pages.
 */
export const baseAMPUrl = 'https://amp.example.com'

/**
 * Return true for any Canonical path that has an equivalent
 * AMP representation in order to, eg. generate <link rel="amp" />
 * elements in the header.
 */
export const hasAMPPage = (path) => {
    const validAMPUrls = [
        // Eg. '^/categories/menswear/',
    ]
    return validAMPUrls.some((url) => new RegExp(url).test(path))
}
