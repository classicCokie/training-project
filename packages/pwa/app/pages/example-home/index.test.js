import React from 'react'
import {shallow} from 'enzyme'
import ExampleHome from './index'
import configureStore from 'redux-mock-store'
import sinon from 'sinon'
import thunk from 'redux-thunk'
import Immutable from 'immutable'

const storeFactory = configureStore([thunk])
const initialData = (pageDataImmutable) => ({ui: {pages: {home: pageDataImmutable}}})


test('ExampleHome renders without errors', () => {
    const initial = initialData(Immutable.fromJS({}))
    const store = storeFactory(initial)
    const initializeHome = sinon.stub().returns(Promise.resolve())
    const trackPageLoad = sinon.stub()
    const wrapper = shallow(
        <ExampleHome />, {context: {store}, disableLifecycleMethods: true}
    ).dive()
    expect(wrapper.hasClass('t-home')).toBe(true)
    wrapper.setProps({
        initializeHome,
        trackPageLoad
    })
    wrapper.instance().componentDidMount()
    expect(initializeHome.called).toBe(true)
    expect(trackPageLoad.called).toBe(true)
})
