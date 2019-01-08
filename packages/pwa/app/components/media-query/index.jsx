import React from 'react'
import PropTypes from 'prop-types'
import MediaQueryOriginal from 'react-responsive'
import {connect} from 'react-redux'
import * as selectors from './selectors'
import {createPropsSelector} from 'reselect-immutable-helpers'


/**
 * A wrapper around react-responsive's MediaQuery component.
 *
 * Behaviour is identical to the original, except that the values prop
 * is connected to the redux store by default. By doing this we are able to render
 * on the server-side with viewport properties that were guessed by looking at the
 * user-agent string in an HTTP request.
 *
 * See: https://github.com/contra/react-responsive
 */
const MediaQuery = (props) => {
    const {isServerSide, values, ssrValues, ...rest} = props
    const merged = {...(values || {}), ...(isServerSide ? ssrValues : {})}
    return <MediaQueryOriginal values={merged} {...rest} />
}

MediaQuery.propTypes = {
    isServerSide: PropTypes.bool,
    ssrValues: PropTypes.object,
    values: PropTypes.object
}

const mapStateToProps = (state) => createPropsSelector({
    isServerSide: selectors.isServerSide,
    ssrValues: selectors.values
})

export default connect(mapStateToProps)(MediaQuery)
