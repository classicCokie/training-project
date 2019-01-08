import React from 'react'
import {connect} from 'react-redux'
import {createPropsSelector} from 'reselect-immutable-helpers'
import PropTypes from 'prop-types'

import ListTile from 'progressive-web-sdk/dist/components/list-tile'

import * as actions from './actions'
import * as globalSelectors from '../../selectors'
import {trackPageLoad} from '../../page-actions'

class ExampleHome extends React.Component {

    constructor(props) {
        super(props)
        this.pageType = 'home'
    }

    componentDidMount() {
        const {trackPageLoad, initializeHome} = this.props
        trackPageLoad(initializeHome(), this.pageType)
    }

    render() {

        return (
            <div className="t-home">
                <h1 className="u-padding-top-md u-margin-bottom-sm">Homepage</h1>
                <p className="u-margin-bottom-md">Tips for getting started on this page:</p>
                <ListTile className="pw--instructional-block">
                    <div>Replace dummy products with real data using Commerce Integrations. <a href="https://docs.mobify.com/progressive-web/latest/">Read the guide</a></div>
                </ListTile>

                <ListTile className="pw--instructional-block">
                    <div>Populate the navigation with product categories using the Commerce Integrations. <a href="https://docs.mobify.com/progressive-web/latest/">Read the guide</a></div>
                </ListTile>

                <ListTile className="pw--instructional-block">
                    <div>Update core styles and add brand assets such as the company logo. <a href="https://docs.mobify.com/progressive-web/latest/">Read the guide</a></div>
                </ListTile>

                <div className="u-padding-bottom-lg">View more guides on <a href="docs.mobify.com">docs.mobify.com</a></div>
            </div>
        )
    }
}

ExampleHome.propTypes = {
    initializeHome: PropTypes.func,
    trackPageLoad: PropTypes.func,
    uiState: PropTypes.object
}

const mapStateToProps = createPropsSelector({
    uiState: globalSelectors.getHome
})

const mapDispatchToProps = {
    trackPageLoad,
    initializeHome: actions.initializeHome
}

export default connect(mapStateToProps, mapDispatchToProps)(ExampleHome)
