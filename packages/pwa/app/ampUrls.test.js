import {hasAMPPage} from './ampUrls'

test('AMP page path match', () => {
    const path = '^/categories/menswear/'
    expect(hasAMPPage(path)).toBeFalsy()
})
