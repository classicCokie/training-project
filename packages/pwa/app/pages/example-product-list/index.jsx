/* eslint-disable import/namespace */
/* eslint-disable import/named */
import React, {Fragment} from 'react'
import {connect} from 'react-redux'
import {createPropsSelector} from 'reselect-immutable-helpers'
import MediaQuery from '../../components/media-query'
import PropTypes from 'prop-types'
import stringify from 'json-stable-stringify'
import Helmet from 'react-helmet'

import * as actions from './actions'
import * as selectors from './selectors'
import {trackPageLoad} from '../../page-actions'
import {getBreakpoints} from 'progressive-web-sdk/dist/utils/universal-utils'
import {VIEWPORT_SIZE_NAMES as sizes} from 'progressive-web-sdk/dist/ssr/constants'

import Breadcrumbs from 'progressive-web-sdk/dist/components/breadcrumbs'
import Divider from 'progressive-web-sdk/dist/components/divider'
import LazyLoader from 'progressive-web-sdk/dist/components/lazy-loader'
import Tile from 'progressive-web-sdk/dist/components/tile'
import SkeletonBlock from 'progressive-web-sdk/dist/components/skeleton-block'
import SkeletonText from 'progressive-web-sdk/dist/components/skeleton-text'

import SortDropdown from '../../components/sort-dropdown'

const breakpoints = getBreakpoints()
const PRODUCT_SKELETON_COUNT = 6

class ExampleProductList extends React.Component {
    constructor(props) {
        super(props)
        this.pageType = 'exampleProductList'
    }

    componentDidMount() {
        const {trackPageLoad, initialize} = this.props
        trackPageLoad(initialize(this.queryFromProps(this.props)), this.pageType)
    }

    componentDidUpdate(prevProps) {
        const {trackPageLoad, initialize} = this.props
        const oldQuery = this.queryFromProps(prevProps)
        const query = this.queryFromProps(this.props)
        if (stringify(oldQuery) !== stringify(query)) {
            trackPageLoad(initialize(query), this.pageType)
        }
    }

    /**
     * Derive the search query and lookup key from the URL.
     */
    queryFromProps(props) {
        if (props === null) {
            return {}
        } else {
            const {categoryId} = props.params || {}
            return {filters: {categoryId}, query: '', sort: props.sortDropdown}
        }
    }

    render() {
        const {breadcrumb, category, errorMessage, initialize, productSearch} = this.props

        const productPriceState = (price) => {
            return price % 1 === 0 ? (price = `$${price}.00`) : `$${price}`
        }

        const contentsLoaded = productSearch && productSearch.results

        return (
            <div className="t-example-product-plp">
                <Breadcrumbs
                    className="u-margin-top-lg u-margin-bottom-lg"
                    items={breadcrumb}
                    includeMicroData
                />
                {category ? (
                    <Fragment>
                        <h1 className="u-margin-bottom-lg">{category.name}</h1>
                        <Helmet>
                            {/* PLACE META DATA INFORMATION HERE */}
                            <meta name="description" content={category.description} />
                        </Helmet>
                    </Fragment>
                ) : (
                    <SkeletonText type="h1" width="50%" />
                )}
                <MediaQuery minWidth={breakpoints[sizes.LARGE]}>
                    <Divider className="u-margin-bottom-md" />
                </MediaQuery>
                <div className="t-example-plp__sorting">
                    <SortDropdown />
                </div>
                <div className="t-example-plp__container">
                    {errorMessage && (
                        <h1 className="u-margin-top-lg u-margin-center t-example-plp__error-msg">
                            {errorMessage}
                        </h1>
                    )}
                    {contentsLoaded ? (
                        <LazyLoader
                            currentItemCount={productSearch.results.length}
                            itemTotal={productSearch.total}
                            fetchItems={() =>
                                initialize(this.queryFromProps(this.props), productSearch.pages + 1)
                            }
                            allItemsLoadedMessage={'End of Search Results'}
                        >
                            <div className="t-example-plp__container-items">
                                {productSearch.results.length > 0 &&
                                    productSearch.results.map((productSearchResult) => (
                                        <div
                                            className="t-example-plp__products-items"
                                            key={productSearchResult.productId}
                                        >
                                            <Tile
                                                isColumn
                                                imageProps={{
                                                    src: productSearchResult.defaultImage.src,
                                                    alt: productSearchResult.defaultImage.alt
                                                }}
                                                title={productSearchResult.productName}
                                                price={productPriceState(productSearchResult.price)}
                                                href={`/products/${productSearchResult.productId}`}
                                            />
                                            {/* PLACE META DATA INFORMATION HERE */}
                                            {/* Examples are "url", "availability", "productId" etc. */}
                                            <meta
                                                itemProp="productID"
                                                content={productSearchResult.productId}
                                            />
                                            <meta
                                                itemProp="url"
                                                content={`/products/${
                                                    productSearchResult.productId
                                                }`}
                                            />
                                        </div>
                                    ))}
                                {productSearch.results.length <= 0 && (
                                    <h2 className="u-margin-top-lg">No results found.</h2>
                                )}
                            </div>
                        </LazyLoader>
                    ) : (
                        <div className="t-example-plp__container-items">
                            {[...new Array(PRODUCT_SKELETON_COUNT)].map((_, idx) => (
                                <div key={idx} className="t-example-plp__products-items">
                                    <SkeletonBlock height="300px" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )
    }
}

ExampleProductList.propTypes = {
    breadcrumb: PropTypes.array,
    category: PropTypes.object,
    errorMessage: PropTypes.string,
    initialize: PropTypes.func,
    productSearch: PropTypes.object,
    trackPageLoad: PropTypes.func
}

const mapStateToProps = createPropsSelector({
    breadcrumb: selectors.getCategoryBreadcrumb,
    category: selectors.getCategory,
    errorMessage: selectors.getErrorMessage,
    productSearch: selectors.getProductSearchResults,
    sortDropdown: selectors.getSortDropdown
})

const mapDispatchToProps = {
    initialize: actions.initialize,
    trackPageLoad
}

export {ExampleProductList as UnconnectedExampleProductList}
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ExampleProductList)
