export const SET_MEDIA_QUERY_PROPS = 'SET_MEDIA_QUERY_PROPS'

/**
 * Set media query properties in the redux store for SSR rendering. Allows us to
 * use the MediaQuery component with viewport sizes guessed from a user-agent.
 */
export const setMediaQueryProps = (isServerSide, values) => {
    return {
        type: SET_MEDIA_QUERY_PROPS,
        payload: {isServerSide, values}
    }
}
