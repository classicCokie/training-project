import Connector from 'training-project-connector/dist'

export const getConnector = () => {
    return Promise.resolve(new Connector({window}))
}

// Return any connector-specific constants for root category ids, etc.
export const getRootCategoryId = () => {
    return 'root'
}

export const getCarouselImageSizeType = () => {
    return 'large'
}

export const getCarouselImagePropertyVariation = () => {
    return 'color'
}
