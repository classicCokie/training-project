import React, {Fragment} from 'react'
import classNames from 'classnames'
import {connect} from 'react-redux'
import {createPropsSelector} from 'reselect-immutable-helpers'
import PropTypes from 'prop-types'
import * as ReduxForm from 'redux-form'
import Helmet from 'react-helmet'

import Breadcrumbs from 'progressive-web-sdk/dist/components/breadcrumbs'
import Button from 'progressive-web-sdk/dist/components/button'
import Carousel from 'progressive-web-sdk/dist/components/carousel'
import CarouselItem from 'progressive-web-sdk/dist/components/carousel/carousel-item'
import FieldRow from 'progressive-web-sdk/dist/components/field-row'
import {
    HeaderBar,
    HeaderBarActions,
    HeaderBarTitle
} from 'progressive-web-sdk/dist/components/header-bar'
import Image from 'progressive-web-sdk/dist/components/image'
import Link from 'progressive-web-sdk/dist/components/link'
import ListTile from 'progressive-web-sdk/dist/components/list-tile'
import Price from 'progressive-web-sdk/dist/components/price'
import Ratio from 'progressive-web-sdk/dist/components/ratio'
import Sheet from 'progressive-web-sdk/dist/components/sheet'
import SkeletonBlock from 'progressive-web-sdk/dist/components/skeleton-block'
import {Swatch, SwatchItem} from 'progressive-web-sdk/dist/components/swatch'

import EmailSubscribeForm from '../../components/example-email-subscribe-form'

import * as actions from './actions'
import * as globalSelectors from '../../selectors'
import * as selectors from './selectors'
import {trackPageLoad} from '../../page-actions'
import {getCarouselImageSizeType, getCarouselImagePropertyVariation} from '../../connector'

const imgProps = {
    className: 'u-display-block',
    hidePlaceholder: true,
    ratio: {aspect: '1:1'},
    loadingIndicator: <SkeletonBlock height="100%" />,
    useLoaderDuringTransitions: false
}

const ADD_TO_CART_FORM_NAME = 'product-add-to-cart'
const CAROUSEL_IMAGE_SIZE_TYPE = getCarouselImageSizeType()
const CAROUSEL_VARIATION_PROPERTY_VARIATION = getCarouselImagePropertyVariation()

class ExampleProductDetails extends React.Component {
    constructor(props) {
        super(props)
        this.pageType = 'exampleProductDetails'
    }

    componentDidMount() {
        const {trackPageLoad, initialize} = this.props
        trackPageLoad(initialize(this.props.params.productId), this.pageType)
    }

    componentDidUpdate(prevProps) {
        const {trackPageLoad, initialize} = this.props
        const previousId = prevProps.params.productId
        const currentId = this.props.params.productId
        if (previousId !== currentId) {
            trackPageLoad(initialize(currentId), this.pageType)
        }
    }

    getCarouselImages(product, variationValues = {}) {
        const variationValue = variationValues[CAROUSEL_VARIATION_PROPERTY_VARIATION]
        const {imageSets = []} = product

        // Get all the images for this product as an array.
        const allImages = imageSets.reduce((acc, curr) => {
            let {images} = curr

            // Inject the variationProperties and sizeType into each image.
            images = images.map((image) => ({
                ...image,
                sizeType: curr.sizeType,
                variationProperties: curr.variationProperties
            }))

            return [...acc, ...images]
        }, [])

        // Filter this list of images to only have large images with the selected color.
        const fullImages = allImages
            .filter(
                (image) =>
                    image.sizeType === CAROUSEL_IMAGE_SIZE_TYPE || image.sizeType === 'default'
            )
            .filter((image) => {
                // Only show the selected color if we have a color selected.
                if (!variationValue) {
                    // Include all image sets if we don't have a selected color.
                    return true
                }

                const variationProperties = image.variationProperties || []
                const colorVariationProperty =
                    variationProperties.find(
                        (variationProperty) =>
                            variationProperty.id === CAROUSEL_VARIATION_PROPERTY_VARIATION
                    ) || {}
                const colorVariationPropertyValues = colorVariationProperty.values || []

                return colorVariationPropertyValues.find((value) => value.value === variationValue)
            })

        return fullImages
    }

    toggleShippingSheet() {
        const {uiState, updateUIState} = this.props

        updateUIState({isShippingSheetOpen: !uiState.isShippingSheetOpen})
    }

    render() {
        const {errorMessage, product, uiState, updateUIState} = this.props
        const {name, description, variationProperties} = product || {}
        const {isShippingSheetOpen, isSubscribed, variationValues} = uiState

        const breadcrumb = [
            {
                text: 'Home',
                href: '/'
            },
            {
                text: product ? product.name : ''
            }
        ]

        const carouselImages = product ? this.getCarouselImages(product, variationValues) : []
        const showErrorMessage = !product && errorMessage // Only show the error message if there is on, and there is no product

        return (
            <div
                className="t-example-product-details"
                itemScope
                itemType="http://schema.org/Product"
            >
                <div className="t-example-product-details__breadcrumbs">
                    <Breadcrumbs items={breadcrumb} includeMicroData />
                </div>
                {product && (
                    <Fragment>
                        <Helmet>
                            {/* PLACE META DATA INFORMATION HERE */}
                            {/* Examples are "url", "availability", "productId" etc. */}
                            <meta name="description" content={name} />
                        </Helmet>
                    </Fragment>
                )}
                {showErrorMessage ? (
                    <h2 className="u-margin-top-lg">{errorMessage}</h2>
                ) : (
                    <div className="t-example-product-details__overview">
                        {/* Images Carousel */}
                        <Carousel
                            previousIcon="chevron-left"
                            nextIcon="chevron-right"
                            iconSize="medium"
                            className="t-example-product-details__carousel"
                        >
                            {carouselImages.length > 0 ? (
                                carouselImages.map(({src, alt}) => (
                                    <CarouselItem key={src}>
                                        <Image {...imgProps} alt={alt} src={src} itemProp="image" />
                                    </CarouselItem>
                                ))
                            ) : (
                                <CarouselItem>
                                    <Ratio aspect="1:1">
                                        <SkeletonBlock
                                            height="100%"
                                            width="100%"
                                            className="u-padding-md"
                                        />
                                    </Ratio>
                                    <SkeletonBlock height="30px" />
                                </CarouselItem>
                            )}
                        </Carousel>

                        {/* Actions */}
                        <div className="t-example-product-details__info">
                            {/* Product Name and Price Information */}
                            <div className="u-position-relative u-z-index-1 u-padding-bottom-lg u-margin-bottom">
                                {name ? (
                                    <h1 itemProp="name">{name}</h1>
                                ) : (
                                    <SkeletonBlock width="50%" height="32px" />
                                )}

                                {description ? (
                                    <div
                                        style={{paddingTop: '50px'}}
                                        dangerouslySetInnerHTML={{__html: description}}
                                    />
                                ) : (
                                    <SkeletonBlock width="100%" height="300px" />
                                )}
                            </div>

                            {/* Product Actions */}
                            <ProductDetailsForm
                                variationValues={variationValues}
                                variationProperties={variationProperties}
                                onChange={(selectedPropertyValue) =>
                                    updateUIState({
                                        variationValues: selectedPropertyValue
                                    })
                                }
                            />
                        </div>
                    </div>
                )}

                {/* Tutorial and Quick Tip Links */}
                <div className="u-margin-top-lg u-margin-bottom-lg">
                    Tips for getting started on this page:
                </div>
                <ListTile className="pw--instructional-block">
                    <div>
                        Replace dummy products with real data using Commerce Integrations.&nbsp;
                        <Link
                            className="pw--underline"
                            openInNewTab
                            href="https://docs.mobify.com/commerce-integrations/latest/"
                        >
                            Read the guide
                        </Link>
                    </div>
                </ListTile>
                <ListTile className="pw--instructional-block">
                    <div className="u-margin-bottom-lg">Set up a modal with with example:</div>

                    <Button
                        className="pw--primary qa-modal-button"
                        onClick={this.toggleShippingSheet.bind(this)}
                    >
                        Modal Button
                    </Button>
                </ListTile>

                <ListTile className="pw--instructional-block">
                    <div className="u-margin-bottom-lg">
                        Set up forms like a Join Mailing List section using this example:
                    </div>

                    {!isSubscribed ? (
                        <EmailSubscribeForm onSubmit={() => updateUIState({isSubscribed: true})} />
                    ) : (
                        <span>Thank you for subscribing!</span>
                    )}
                </ListTile>

                <div className="u-padding-bottom-lg">
                    View more guides on&nbsp;
                    <Link className="pw--underline" openInNewTab href="https://docs.mobify.com">
                        docs.mobify.com
                    </Link>
                </div>

                {/* Floating element/components */}
                <Sheet
                    className="pw--no-shadow t-example-product-details__shipping-delivery-info-modal"
                    open={isShippingSheetOpen}
                    effect="modal-center"
                    shrinkToContent={true}
                    headerContent={
                        <HeaderBar>
                            <HeaderBarTitle className="u-flex u-padding-start u-text-align-start u-text-size-big">
                                Shipping & Delivery Info
                            </HeaderBarTitle>

                            <HeaderBarActions>
                                <Button
                                    innerClassName="u-padding-0"
                                    icon="close"
                                    onClick={this.toggleShippingSheet.bind(this)}
                                />
                            </HeaderBarActions>
                        </HeaderBar>
                    }
                >
                    <div className="t-example-product-details__shipping-delivery-modal-content">
                        Receive free Standard Shipping within Canada for purchases of $150+,
                        excluding taxes, when signed into a Mobify.com account.
                    </div>
                </Sheet>
            </div>
        )
    }
}

ExampleProductDetails.propTypes = {
    errorMessage: PropTypes.string,
    initialize: PropTypes.func,
    params: PropTypes.object,
    product: PropTypes.object,
    trackPageLoad: PropTypes.func,
    uiState: PropTypes.object,
    updateUIState: PropTypes.func
}

const mapStateToProps = createPropsSelector({
    errorMessage: selectors.getErrorMessage,
    product: selectors.getProduct,
    uiState: globalSelectors.getProductDetails
})

const mapDispatchToProps = {
    initialize: actions.initialize,
    trackPageLoad,
    updateUIState: actions.updateProductUIState
}

export {ExampleProductDetails as UnconnectedExampleProductDetails}
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ExampleProductDetails)

// eslint-disable-next-line
const VariationPropertySwatchGroup = ({
    input: {value, onChange},
    variationProperties = [],
    selectedVariationPropertyValue,
    label,
    error,
    id
}) => {
    const selectedProperty = variationProperties.find(
        ({value}) => value === selectedVariationPropertyValue
    )
    const selectedPropertyName = selectedProperty ? selectedProperty.name : ''

    const swatchClasses = classNames({'pw-swatch__error': error && !value})

    return (
        <Swatch
            className={swatchClasses}
            label={`${label}: ${selectedPropertyName}`}
            onChange={onChange}
            value={selectedVariationPropertyValue}
        >
            {variationProperties.map(({name, value, swatches, orderable}) => {
                const swatchStyle = {
                    backgroundImage: swatches ? `url(${swatches[0].src})` : ''
                }

                return (
                    <SwatchItem
                        className="t-example-product-details__swatch"
                        key={value}
                        value={value}
                        disabled={!orderable}
                        analyticsName={id}
                        analyticsContent={value}
                    >
                        {swatches ? (
                            <span
                                className="t-example-product-details__swatch-background"
                                style={swatchStyle}
                            >
                                <span className="u-visually-hidden">{name}</span>
                            </span>
                        ) : (
                            name
                        )}
                    </SwatchItem>
                )
            })}
            {error && !value && <div className="pw-swatch__error">{error[name]}</div>}
        </Swatch>
    )
}

VariationPropertySwatchGroup.propTypes = {
    input: PropTypes.object,
    variationProperties: PropTypes.array,
    selectedVariationPropertyValue: PropTypes.string,
    label: PropTypes.string,
    error: PropTypes.string,
    id: PropTypes.string
}

const ProductDetailsForm = ReduxForm.reduxForm({
    form: ADD_TO_CART_FORM_NAME,
    enableReinitialize: true
})(({variationProperties = [], variationValues = {}, onChange}) => (
    <form id={ADD_TO_CART_FORM_NAME}>
        {/* Product Variations */}
        <div className="t-example-product-details__variations">
            {variationProperties.map(({id, label, values = []}) => (
                <FieldRow key={id}>
                    <ReduxForm.Field
                        label={label}
                        id={id}
                        name={id}
                        variationProperties={values}
                        selectedVariationPropertyValue={variationValues[id]}
                        component={VariationPropertySwatchGroup}
                        enabled={false}
                        onVariationChange={onChange}
                    />
                </FieldRow>
            ))}
        </div>
    </form>
))
