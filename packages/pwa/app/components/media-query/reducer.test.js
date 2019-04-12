/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

/* eslint-env jest */
import Immutable from 'immutable'
import reducer from './reducer'
import * as actions from './actions'

describe('The media query reducer', () => {
    test('state remains unchanged for unknown action types', () => {
        const unknownAction = {type: 'unknown', payload: {isServerSide: false, values: {a: 'b'}}}
        const initial = reducer(Immutable.Map(), unknownAction)
        expect(initial.toJS()).toEqual({})
    })
    test('state is extended for defined action types', () => {
        const initial = reducer(undefined, actions.setMediaQueryProps(false, {a: 'b'}))
        expect(initial.toJS()).toEqual({isServerSide: false, values: {a: 'b'}})
        const next = reducer(initial, actions.setMediaQueryProps(true, {x: 'y'}))
        expect(next.toJS()).toEqual({isServerSide: true, values: {a: 'b', x: 'y'}})
    })
})
