/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

/* eslint-env jest */
import Immutable from 'immutable'
import * as selector from './selectors'

describe('The media query selector', () => {
    test('getMediaQueryProps works appropriately', () => {
        const mediaProps = {isServerSide: false, values: {a: 'b'}}
        const initialState = {mediaQueryProps: Immutable.fromJS(mediaProps)}
        const result = selector.getMediaQueryProps(initialState)
        expect(result.toJS()).toEqual(mediaProps)
        expect(selector.isServerSide(initialState)).toEqual(false)
        expect(selector.values(initialState).toJS()).toEqual({a: 'b'})
    })
})
