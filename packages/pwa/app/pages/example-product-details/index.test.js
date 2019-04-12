import React from 'react'
import {shallow} from 'enzyme'
import {UnconnectedExampleProductDetails as ExampleProductDetails} from './index'

test('ExampleProductDetails renders without errors with results', () => {
    const wrapper = shallow(
        <ExampleProductDetails
            initialize={jest.fn()}
            trackPageLoad={jest.fn()}
            updateUiState={jest.fn()}
            uiState={{
                isShippingSheetOpen: true,
                isSubscribed: false,
                variationValues: undefined
            }}
            params={{
                productId: 123
            }}
            product={{
                id: 123,
                name: 'name',
                description: 'description'
            }}
        />
    )
    expect(wrapper).toHaveLength(1)
    expect(wrapper.hasClass('t-example-product-details')).toBe(true)
})

test('ExampleProductDetails renders error messages', () => {
    const wrapper = shallow(
        <ExampleProductDetails
            initialize={jest.fn()}
            trackPageLoad={jest.fn()}
            updateUiState={jest.fn()}
            uiState={{
                isShippingSheetOpen: true,
                isSubscribed: false,
                variationValues: undefined
            }}
            params={{
                productId: 123
            }}
            errorMessage={'Err'}
        />
    )
    expect(wrapper).toHaveLength(1)
    expect(
        wrapper
            .find('.u-margin-top-lg')
            .first()
            .text()
    ).toEqual('Err')
})

test('ExampleProductDetails renders without errors with image carousel', () => {
    const wrapper = shallow(
        <ExampleProductDetails
            initialize={jest.fn()}
            trackPageLoad={jest.fn()}
            updateUiState={jest.fn()}
            uiState={{
                isShippingSheetOpen: true,
                isSubscribed: false,
                variationValues: undefined
            }}
            params={{
                productId: 123
            }}
            product={{
                id: 123,
                name: 'name',
                description: 'description',
                imageSets: [
                    {
                        images: [
                            {
                                alt: 'pic-alt',
                                description: 'pic-description',
                                src: 'pic-src',
                                title: 'pic-title'
                            }
                        ],
                        sizeType: 'large'
                    }
                ]
            }}
        />
    )
    expect(wrapper).toHaveLength(1)
    expect(wrapper.find('.t-example-product-details__carousel')).toHaveLength(1)
})

test('ExampleProductList updates component when new props are passed', () => {
    const baseProps = {
        initialize: jest.fn(),
        trackPageLoad: jest.fn(),
        params: {productId: 1},
        updateUiState: jest.fn(),
        uiState: {
            isShippingSheetOpen: true,
            isSubscribed: false,
            variationValues: undefined
        },
        product: {
            id: 123,
            name: 'name',
            description: 'description'
        }
    }

    const wrapper = shallow(<ExampleProductDetails {...baseProps} />)

    // trackPageLoad and initialize will be called once during component Mount
    expect(baseProps.trackPageLoad).toHaveBeenCalledTimes(1)
    expect(baseProps.initialize).toHaveBeenCalledTimes(1)

    wrapper.setProps({
        initialize: baseProps.initialize,
        trackPageLoad: baseProps.trackPageLoad,
        params: {productId: 1}
    })

    // trackPageLoad and initialize will not be recalled since same props are passed
    expect(baseProps.trackPageLoad).toHaveBeenCalledTimes(1)
    expect(baseProps.initialize).toHaveBeenCalledTimes(1)

    wrapper.setProps({
        initialize: baseProps.initialize,
        trackPageLoad: baseProps.trackPageLoad,
        params: {productId: 2}
    })

    // trackPageLoad and initialize will be recalled since props are changed
    expect(baseProps.trackPageLoad).toHaveBeenCalledTimes(2)
    expect(baseProps.initialize).toHaveBeenCalledTimes(2)
})

describe('getCarouselImages works appropriately', () => {
    const baseProps = {
        initialize: jest.fn(),
        trackPageLoad: jest.fn(),
        updateUiState: jest.fn(),
        uiState: {
            isShippingSheetOpen: true,
            isSubscribed: false,
            variationValues: undefined
        },
        params: {
            productId: 123
        },
        product: {
            id: 123,
            name: 'name',
            description: 'description',
            imageSets: [
                {
                    images: [
                        {
                            alt: 'pic-alt',
                            description: 'pic-description',
                            src: 'pic-src',
                            title: 'pic-title'
                        }
                    ],
                    sizeType: 'default',
                    variationProperties: [
                        {id: 'size', values: [{value: 'large'}]},
                        {id: 'color', values: [{value: 'red'}]}
                    ]
                }
            ]
        }
    }

    test('color not present in variationValues', () => {
        const wrapper = shallow(<ExampleProductDetails {...baseProps} />)
        const instance = wrapper.instance()

        const product = baseProps.product
        const variationValues = {color: 'black'}

        const result = instance.getCarouselImages(product, variationValues)
        expect(result).toHaveLength(0)
    })

    test('color is present in variationValues', () => {
        const wrapper = shallow(<ExampleProductDetails {...baseProps} />)
        const instance = wrapper.instance()

        const product = baseProps.product
        const variationValues = {color: 'red'}

        const result = instance.getCarouselImages(product, variationValues)
        expect(result).toHaveLength(1)
    })
})

describe('toggleShippingSheet works appropriately', () => {
    const baseProps = {
        initialize: jest.fn(),
        trackPageLoad: jest.fn(),
        updateUIState: jest.fn(),
        uiState: {
            isShippingSheetOpen: true,
            isSubscribed: true,
            variationValues: undefined
        },
        params: {
            productId: 123
        },
        product: {
            id: 123,
            name: 'name',
            description: 'description'
        }
    }

    test('updateUIState is called to toggle shipping sheet', () => {
        const wrapper = shallow(<ExampleProductDetails {...baseProps} />)
        const instance = wrapper.instance()

        instance.toggleShippingSheet()
        expect(baseProps.updateUIState).toHaveBeenCalledWith({isShippingSheetOpen: false})
    })
})
