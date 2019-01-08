import {createGetSelector} from 'reselect-immutable-helpers'

export const getMediaQueryProps = (state) => state.mediaQueryProps
export const isServerSide = createGetSelector(getMediaQueryProps, 'isServerSide', true)
export const values = createGetSelector(getMediaQueryProps, 'values', {})
