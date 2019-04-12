import React from 'react'
import {shallow} from 'enzyme'
import {PageLoader} from './index'
import SkeletonBlock from 'progressive-web-sdk/dist/components/skeleton-block'
import sinon from 'sinon'

test('PageLoader renders a Skeleton', () => {
    const wrapper = shallow(<PageLoader />)
    expect(wrapper.length).toBe(1)
    expect(wrapper.find(SkeletonBlock).length).toBe(1)
})

test('PageLoader retries to load component on failure', () => {
    const retry = sinon.stub().returns(Promise.resolve())
    const wrapper = shallow(
        <PageLoader error={new Error('offline')} retry={retry} offlineModeStartTime={123} />
    )

    expect(retry.called).toBe(false)
    wrapper.setProps({offlineModeStartTime: null})
    expect(retry.called).toBe(true)
})
