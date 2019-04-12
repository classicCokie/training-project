/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

/* eslint-env jest */
import * as actions from './actions'

describe('The media query action', () => {
    test('returns appropriate state object when setMediaQueryProps called', () => {
        const obj = actions.setMediaQueryProps(false, {a: 'b'})
        expect(obj).toEqual({
            payload: {isServerSide: false, values: {a: 'b'}},
            type: actions.SET_MEDIA_QUERY_PROPS
        })
    })
    test('returns appropriate an object when "values" is an empty object', () => {
        const obj = actions.setMediaQueryProps(false, {})
        expect(obj).toEqual({
            payload: {isServerSide: false, values: {}},
            type: actions.SET_MEDIA_QUERY_PROPS
        })
    })
})
