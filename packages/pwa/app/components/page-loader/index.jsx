import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {createPropsSelector} from 'reselect-immutable-helpers'

import SkeletonBlock from 'progressive-web-sdk/dist/components/skeleton-block'

import {getOfflineModeStartTime} from '../../selectors'

/**
 * A loading screen component for use with react-loadable that handles
 * errors/retries encountered when asynchronously loading components in
 * offline mode.
 */
export class PageLoader extends React.Component {
    componentDidMount() {
        this.maybeRetry({}, this.props)
    }

    componentDidUpdate(prevProps) {
        this.maybeRetry(prevProps, this.props)
    }

    maybeRetry(prevProps, props) {
        // Handle errors loading the component in offline mode
        const shouldRetry =
            props.error &&
            props.offlineModeStartTime === null &&
            props.offlineModeStartTime !== prevProps.offlineModeStartTime
        if (shouldRetry) {
            props.retry()
        }
    }

    render() {
        return (
            <div>
                <SkeletonBlock height="100vh" width="100vw" />
            </div>
        )
    }
}

PageLoader.propTypes = {
    // Provided by React Loadable
    // Indicates if an error occurred which prevented this component from loading
    error: PropTypes.instanceOf(Error),

    // The time when we went offline, or null
    offlineModeStartTime: PropTypes.number,

    // Provided by React Loadable
    // Calling this function attempts to reload the component
    retry: PropTypes.func
}

const mapStateToProps = createPropsSelector({
    offlineModeStartTime: getOfflineModeStartTime
})

export default connect(mapStateToProps)(PageLoader)
