import React from 'react'
import {shallow} from 'enzyme'
import {EmailSubscribeForm, validate} from './index'

test('EmailSubscribeForm renders without errors', () => {
    const wrapper = shallow(
        <EmailSubscribeForm
            handleSubmit={() => undefined}
            onSubmit={() => undefined}
        />
    )
    expect(wrapper).toHaveLength(1)
    expect(wrapper.hasClass('c-example-email-subscribe-form')).toBe(true)
})

test('Email address validation works', () => {
    expect(Object.keys(validate({}))).toHaveLength(1)
    expect(Object.keys(validate({email: 'not-an-email'}))).toHaveLength(1)
    expect(Object.keys(validate({email: 'person@mobify.com'}))).toHaveLength(0)
})
