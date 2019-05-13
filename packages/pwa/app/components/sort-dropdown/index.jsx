import React from 'react'
import * as ReduxForm from 'redux-form'

import Field from 'progressive-web-sdk/dist/components/field'
import FieldRow from 'progressive-web-sdk/dist/components/field-row'

const SORT_DROPDOWN_FORM_NAME = 'search-sort'

export const SortDropdown = () => {
    const labelText = 'Sort By'
    return (
        <form
            id={SORT_DROPDOWN_FORM_NAME}
            className={'c-sort-dropdown-form'}
            data-analytics-name={SORT_DROPDOWN_FORM_NAME}
        >
            <FieldRow className="u-flexbox">
                <ReduxForm.Field
                    component={Field}
                    name="sort"
                    label={labelText}
                    labelPosition={'start'}
                    className="u-flex"
                >
                    <select>
                        <option>Position</option>
                        <option>Name</option>
                        <option>Price</option>
                    </select>
                </ReduxForm.Field>
            </FieldRow>
        </form>
    )
}

export default ReduxForm.reduxForm({
    form: SORT_DROPDOWN_FORM_NAME
})(SortDropdown)
