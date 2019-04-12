const pkg = require('../package.json')

const getSiteUrl = function() {
    return pkg.siteUrl
}

exports.getSiteUrl = getSiteUrl
