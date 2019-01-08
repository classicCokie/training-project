import React from 'react'
import * as ReduxForm from 'redux-form'
import PropTypes from 'prop-types'

import Button from 'progressive-web-sdk/dist/components/button'
import Field from 'progressive-web-sdk/dist/components/field'
import FieldRow from 'progressive-web-sdk/dist/components/field-row'

const EMAIL_SUBSCRIBE_FORM_NAME = 'email-subscribe'

export const validate = (values) => {
    const errors = {}
    if ((values.email || '').search(/@mobify.com$/) < 0) {
        errors.email = 'Must be a @mobify.com email address'
    }
    return errors
}

export const EmailSubscribeForm = ({handleSubmit, onSubmit}) => {
    const labelText = 'Email Address'
    return (
        <form id={EMAIL_SUBSCRIBE_FORM_NAME} className="c-example-email-subscribe-form" data-analytics-name={EMAIL_SUBSCRIBE_FORM_NAME} onSubmit={handleSubmit(onSubmit)}>
            <FieldRow className="u-flexbox">
                <ReduxForm.Field component={Field} name="email" label={labelText} className="u-flex">
                    <input type="email" data-analytics-name="email" className="u-flex" required />
                </ReduxForm.Field>

                <Field className="c-example-email-subscribe-form__button u-flex-none u-margin-start-0">
                    <div className="pw-field__label" aria-hidden="true">{labelText}</div>
                    <Button type="submit" className="pw--primary">Submit</Button>
                </Field>
            </FieldRow>
        </form>
    )
}

EmailSubscribeForm.propTypes = {
    // Redux-form internal
    handleSubmit: PropTypes.func,
    // Handler that is triggers when the form is submitted
    onSubmit: PropTypes.func
}


export default ReduxForm.reduxForm({
    form: EMAIL_SUBSCRIBE_FORM_NAME,
    validate
})(EmailSubscribeForm)
